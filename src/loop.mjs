// The closed loop: Kane runs every language → failures go to a coding agent → the agent
// edits the app → Kane re-runs only the red languages → repeat until green or out of rounds.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildBrief } from './brief.mjs';
import { runRound } from './runner.mjs';
import { failing, loadResults, saveResults } from './results.mjs';
import { writeReport } from './grid.mjs';
import { c } from './term.mjs';

export async function closedLoop(cfg, { maxRounds = cfg.agent.maxRounds, failedOnly = false, resume = false, only, log = console.log } = {}) {
  // --resume: start from the failures already in results.json instead of paying for a fresh Kane round.
  let results = resume && loadResults(cfg).rounds.length ? loadResults(cfg) : (await runRound(cfg, { only, failedOnly, log })).results;
  if (resume) log(c.dim(`Resuming from round ${results.rounds.length} in results.json`));
  for (let fix = 1; fix <= maxRounds; fix++) {
    const notPassing = failing(cfg, results);
    if (!notPassing.length) break;
    const red = notPassing.filter((l) => results.locales[l]?.status === 'failed');
    if (!red.length) {
      log(c.yellow(`\n${notPassing.join(', ')}: Kane could not reach a verdict (its own misstep or a crash), so there is nothing for the agent to fix. Re-running.`));
      ({ results } = await runRound(cfg, { failedOnly: true, log }));
      continue;
    }
    log('');
    log(c.bold(c.magenta(`Fix ${fix}: handing ${red.join(', ')} to ${cfg.agent.command} with Kane's evidence`)));
    const brief = buildBrief(cfg, results, { forAgent: true });
    const before = snapshot(cfg.root);
    const t0 = Date.now();
    const agent = await runAgent(cfg, brief, log);
    // Claude reports its own Edit/Write calls; for other agents, fall back to what git sees changed.
    const files = agent.files?.length ? agent.files : diffSnapshot(cfg, before);
    const last = results.rounds[results.rounds.length - 1];
    last.fix = {
      agent: cfg.agent.command,
      for: red,
      ok: agent.ok,
      summary: agent.summary,
      files,
      seconds: Math.round((Date.now() - t0) / 1000),
    };
    saveResults(cfg, results);
    writeReport(cfg, results);
    if (!agent.ok) { log(c.red(`Agent did not finish cleanly: ${agent.summary || 'no output'}`)); break; }
    if (!files.length) { log(c.yellow('Agent changed no files; stopping.')); break; }
    log(c.dim(`Agent changed: ${files.join(', ')}`));
    log('');
    ({ results } = await runRound(cfg, { failedOnly: true, log }));
  }
  return results;
}

const AGENT_NOTE = 'You are the fixer inside locale-check, a loop where Kane CLI tests a web app in several languages. '
  + 'You run without a human. Fix only the locale bugs in the brief, in the app source, with small, careful edits. '
  + 'You cannot run commands; Kane re-checks your work right after you finish. '
  + 'End with exactly one line per language you fixed, in the form `<locale>: <what you changed> (<file>)`, and nothing else.';

/** Run the agent with the brief on stdin. Claude Code gets stream-json so we can show its edits live. */
function runAgent(cfg, brief, log) {
  const isClaude = /(^|[\\/])claude(\.exe)?$/i.test(cfg.agent.command);
  // Claude runs focused: project settings only (no user-level hooks), file tools only, and a
  // system note that pins the job and the reply format.
  const args = isClaude
    ? ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits',
       '--allowedTools', 'Read,Edit,Write,Glob,Grep', '--setting-sources', 'project,local',
       '--append-system-prompt', AGENT_NOTE, ...(cfg.agent.args || [])]
    : [...(cfg.agent.args || [])];
  return new Promise((resolve) => {
    const child = spawn(cfg.agent.command, args, { cwd: cfg.root, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    const files = new Set();
    let summary = '';
    let ok = false;
    let buf = '';
    let raw = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      if (!isClaude) { raw += chunk; process.stdout.write(c.dim(chunk)); return; }
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let ev; try { ev = JSON.parse(line); } catch { continue; }
        if (ev.type === 'assistant') {
          for (const part of ev.message?.content || []) {
            if (part.type === 'tool_use') {
              const p = part.input?.file_path || part.input?.path || part.input?.pattern || '';
              const shown = p && existsSync(p) ? relative(cfg.root, p) : p;
              if (['Edit', 'Write', 'MultiEdit'].includes(part.name) && p) files.add(relative(cfg.root, p).replaceAll('\\', '/'));
              log(`${c.magenta('agent ▸')} ${part.name} ${c.dim(shown)}`);
            } else if (part.type === 'text' && part.text.trim()) {
              log(`${c.magenta('agent ▸')} ${c.dim(part.text.trim().split('\n')[0].slice(0, 120))}`);
            }
          }
        } else if (ev.type === 'result') {
          ok = ev.subtype === 'success' && !ev.is_error;
          summary = ev.result || '';
        }
      }
    });
    let err = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => resolve({ ok: false, summary: `could not start ${cfg.agent.command}: ${e.message}`, files: [] }));
    child.on('close', (code) => {
      if (!isClaude) { ok = code === 0; summary = raw.trim().split('\n').slice(-6).join('\n'); }
      if (!ok && !summary) summary = err.trim().slice(-500);
      resolve({ ok, summary: summary.trim(), files: [...files] });
    });
    child.stdin.end(brief);
  });
}

// Which files did the agent touch? Compare content hashes of git-visible changed files.
// Paths are made relative to the config folder, like the agent's own tool paths.
function snapshot(root) {
  const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8' });
  const r = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd: root, encoding: 'utf8' });
  if (top.status !== 0 || r.status !== 0) return null;
  const map = new Map();
  for (const line of r.stdout.split('\n').filter(Boolean)) {
    const abs = join(top.stdout.trim(), line.slice(3).trim().replace(/^"|"$/g, ''));
    map.set(relative(root, abs).replaceAll('\\', '/'), hash(abs));
  }
  return map;
}
function diffSnapshot(cfg, before) {
  if (!before) return [];
  const own = [relative(cfg.root, cfg.outDir), relative(cfg.root, cfg.report)].map((p) => p.replaceAll('\\', '/'));
  const after = snapshot(cfg.root) || new Map();
  return [...after]
    .filter(([f, h]) => before.get(f) !== h && !own.some((o) => f === o || f.startsWith(o + '/')))
    .map(([f]) => f);
}
const hash = (p) => { try { return createHash('sha1').update(readFileSync(p)).digest('hex'); } catch { return null; } };
