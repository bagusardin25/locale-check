// Runs one Kane CLI objective for one locale and turns its NDJSON stream into a result.
import { spawn, spawnSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { readZip } from './zip.mjs';

let resolved;
// On Windows `kane-cli` is an npm .cmd shim; passing Arabic or Japanese text through cmd.exe
// quoting is fragile, so we call node with the shim's .cjs entry and an argument array instead.
export function resolveKane() {
  if (resolved) return resolved;
  if (process.env.KANE_CLI) return (resolved = { cmd: process.env.KANE_CLI, pre: [] });
  if (process.platform === 'win32') {
    const where = spawnSync('where', ['kane-cli.cmd'], { encoding: 'utf8' });
    const shim = where.stdout?.split(/\r?\n/).find(Boolean);
    if (shim) {
      const entry = join(dirname(shim), 'node_modules', '@testmuai', 'kane-cli', 'bin', 'kane-cli.cjs');
      if (existsSync(entry)) return (resolved = { cmd: process.execPath, pre: [entry] });
    }
  }
  return (resolved = { cmd: 'kane-cli', pre: [] });
}

export function kaneAvailable() {
  const k = resolveKane();
  const r = spawnSync(k.cmd, [...k.pre, '--version'], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim().split(/\r?\n/)[0] : null;
}

export function kaneBalance() {
  const k = resolveKane();
  const r = spawnSync(k.cmd, [...k.pre, 'balance'], { encoding: 'utf8' });
  const m = /credits:\s*([\d.]+)/i.exec(r.stdout || '');
  return m ? Number(m[1]) : null;
}

/**
 * Run Kane for one locale. Streams NDJSON to `ndjsonPath`, calls onStep for each step event,
 * and resolves to a normalised result object (never rejects).
 */
export function runKane({ objective, url, kane = {}, ndjsonPath, onStep, onBrowserReady }) {
  let ready = false;
  const markReady = () => { if (!ready) { ready = true; onBrowserReady?.(); } };
  const k = resolveKane();
  const args = [...k.pre, 'run', objective, '--url', url, '--agent'];
  if (kane.headless !== false) args.push('--headless');
  if (kane.maxSteps) args.push('--max-steps', String(kane.maxSteps));
  if (kane.timeout) args.push('--timeout', String(kane.timeout));
  if (kane.assertionMode) args.push('--assertion-mode', kane.assertionMode);
  if (process.env.LT_USERNAME && process.env.LT_ACCESS_KEY) {
    args.push('--username', process.env.LT_USERNAME, '--access-key', process.env.LT_ACCESS_KEY);
  }
  // Parallel runs must not share a Chrome profile: Chrome hands a second launch on the same
  // user-data-dir to the first instance, and the runs end up driving each other's tabs.
  // realpath: on Windows tmpdir() can be an 8.3 short path (C:\Users\ABC~1\...), and Chrome
  // exits with code 21 at startup when given one as --user-data-dir.
  const profile = realpathSync.native(mkdtempSync(join(tmpdir(), 'locale-check-chrome-')));
  args.push('--chrome-profile', profile);
  for (const extra of kane.extraArgs || []) args.push(extra);

  const cleanup = () => removeProfileLater(profile);

  return new Promise((resolve) => {
    const out = createWriteStream(ndjsonPath);
    const child = spawn(k.cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const steps = [];
    let runEnd = null;
    let evidencePack = null;
    let stderr = '';
    let buf = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      out.write(chunk);
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let ev;
        try { ev = JSON.parse(line); } catch { continue; }
        if (ev.type === 'run_end') runEnd = ev;
        else if (ev.type === 'coverage' && ev.pack) evidencePack = ev.pack;
        else if (!ev.type && ev.step !== undefined && ev.status !== 'running') {
          markReady();
          const s = { step: ev.step, status: ev.status, remark: ev.remark };
          steps.push(s);
          onStep?.(s);
        }
      }
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (c) => { stderr += c; });
    child.on('error', (err) => {
      out.end();
      cleanup();
      markReady();
      resolve({ status: 'error', reason: `could not start kane-cli: ${err.message}`, steps });
    });
    child.on('close', (code) => {
      out.end();
      cleanup();
      markReady();
      if (!evidencePack) {
        const m = /evidence serve (\S+\.evidence)/.exec(stderr);
        if (m) evidencePack = m[1];
      }
      if (!runEnd) {
        resolve({ status: 'error', reason: `kane-cli exited with code ${code} and no run_end event`, stderrTail: stderr.slice(-800), steps, evidencePack });
        return;
      }
      resolve(normalise(runEnd, steps, evidencePack));
    });
  });
}

// Chrome keeps file locks for a few seconds after kane-cli exits, so a throwaway profile
// (~60 MB) can't always be deleted at once. Retry in the background; flushProfiles() waits.
const pendingProfiles = new Set();
function removeProfileLater(dir) {
  pendingProfiles.add(dir);
  const attempt = (n) => setTimeout(() => {
    try { rmSync(dir, { recursive: true, force: true }); pendingProfiles.delete(dir); } catch { if (n < 8) attempt(n + 1); }
  }, 2000 * n);
  attempt(1);
}

/** Wait (up to ~20 s) until every throwaway Chrome profile is deleted. */
export async function flushProfiles() {
  for (let i = 0; i < 20 && pendingProfiles.size; i++) {
    for (const dir of [...pendingProfiles]) {
      try { rmSync(dir, { recursive: true, force: true }); pendingProfiles.delete(dir); } catch { /* retry */ }
    }
    if (pendingProfiles.size) await new Promise((r) => setTimeout(r, 1000));
  }
}

export function normalise(e, steps = [], evidencePack = null) {
  const v = e.verdict || {};
  // Kane triages its own failures: family "application_issue" (confirmed) is a bug in the app,
  // "automation_bug" means Kane itself misstepped. The latter is not a verdict on the app.
  const status = e.status === 'passed' ? 'passed'
    : e.status === 'failed' ? (v.family === 'automation_bug' || v.confirmed === false ? 'inconclusive' : 'failed')
    : 'error';
  return {
    status,
    oneLiner: v.one_liner || e.one_liner || null,
    summary: e.summary || null,
    reason: e.reason || null,
    reasonCode: e.reason_code || null,
    bugTitle: v.bug_title || null,
    rootCause: v.root_cause || null,
    suggestion: v.suggestion || null,
    severity: v.severity || null,
    category: v.category_proposal || v.category || null,
    confirmedBug: v.confirmed ?? null,
    family: v.family || null,
    credits: round(e.credits_consumed),
    duration: round(e.duration),
    testUrl: e.test_url || null,
    sessionDir: e.session_dir || null,
    evidencePack: evidencePack || findPack(e.session_dir),
    steps,
  };
}

const round = (n) => (typeof n === 'number' ? Math.round(n * 10) / 10 : null);

function findPack(sessionDir) {
  if (!sessionDir) return null;
  const dir = join(sessionDir, 'evidence');
  if (!existsSync(dir)) return null;
  const packs = readdirSync(dir).filter((f) => f.endsWith('.evidence'))
    .map((f) => join(dir, f)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return packs[0] || null;
}

/**
 * Pull the most telling screenshot out of a Kane evidence pack: the failing step's
 * screenshot when there is one, otherwise the last step's. Returns true if written.
 */
export function extractScreenshot(packPath, destPath) {
  if (!packPath || !existsSync(packPath)) return false;
  try {
    const zip = readZip(packPath);
    const names = zip.names();
    const stepDirs = [...new Set(names.filter((n) => /\/steps\/[^/]+\/screenshot\.jpg$/.test(n))
      .map((n) => n.replace(/screenshot\.jpg$/, '')))]
      .sort((a, b) => stepOrdinal(a) - stepOrdinal(b));
    if (!stepDirs.length) return false;
    const failing = stepDirs.find((d) => names.includes(d + 'failure.yaml'));
    const pick = failing || stepDirs[stepDirs.length - 1];
    writeFileSync(destPath, zip.read(pick + 'screenshot.jpg'));
    return true;
  } catch {
    return false;
  }
}

const stepOrdinal = (dir) => Number(/steps\/(\d+)-/.exec(dir)?.[1] ?? 0);

export function readNdjson(path) {
  return readFileSync(path, 'utf8').split(/\r?\n/).filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
