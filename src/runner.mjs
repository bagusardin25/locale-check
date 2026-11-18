// One round: run the objective in each selected locale (a few at a time), save results, write the grid.
import { mkdirSync, rmdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { buildObjective, fill, languageName } from './config.mjs';
import { extractScreenshot, flushProfiles, runKane } from './kane.mjs';
import { failing, loadResults, saveResults } from './results.mjs';
import { writeReport } from './grid.mjs';
import { c, pad } from './term.mjs';

export async function runRound(cfg, { only, failedOnly = false, build = null, log = console.log } = {}) {
  const results = loadResults(cfg);
  let locales = only?.length ? cfg.locales.filter((l) => only.includes(l)) : [...cfg.locales];
  if (only?.length) {
    const unknown = only.filter((l) => !cfg.locales.includes(l));
    if (unknown.length) log(c.yellow(`ignoring locales not in config: ${unknown.join(', ')}`));
  }
  if (failedOnly) locales = locales.filter((l) => failing(cfg, results).includes(l));
  if (!locales.length) {
    log(c.green('Nothing to run: every locale already passes.'));
    return { results, ran: [] };
  }

  const roundNo = results.rounds.length + 1;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('Z', '');
  const runDir = join(cfg.outDir, 'runs', stamp);
  mkdirSync(runDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const width = Math.max(...locales.map((l) => l.length));

  log(c.bold(`Round ${roundNo}: ${locales.length} locale${locales.length > 1 ? 's' : ''} (${locales.join(', ')}), ${Math.min(cfg.concurrency, locales.length)} at a time`));

  const queue = [...locales];
  // Launch gate: kane-cli picks the first free CDP port (9222-9230) before its Chrome binds it,
  // so two runs starting together attach to the same browser. Start the next run only after
  // the previous run's browser is up (its first step event), or after 45 s at most.
  // The same race exists between two locale-check processes, so the gate also takes a
  // machine-wide lock (an atomic mkdir in the temp folder) while a browser starts.
  let gate = Promise.resolve();
  const acquireLaunch = () => {
    let release;
    const mine = new Promise((r) => { release = r; });
    const prev = gate;
    gate = prev.then(() => mine);
    return prev.then(async () => {
      const unlock = await machineLock();
      const done = () => { clearTimeout(timer); unlock(); release(); };
      const timer = setTimeout(done, 45000);
      return done;
    });
  };
  const worker = async () => {
    while (queue.length) {
      const locale = queue.shift();
      const tag = c.dim(`[${pad(locale, width)}]`);
      const url = fill(cfg.url, locale);
      const objective = buildObjective(cfg, locale);
      const t0 = Date.now();
      const earlier = [];
      let r, ndjson;
      // Retry when Kane crashed or blamed itself (automation_bug), never when it confirmed an app bug.
      for (let attempt = 1; attempt <= 1 + (cfg.kane.retries ?? 1); attempt++) {
        const releaseLaunch = await acquireLaunch();
        log(`${tag} ${attempt === 1 ? 'start ' : c.yellow(`retry ${attempt - 1}`)} ${url}`);
        ndjson = join(runDir, attempt === 1 ? `${locale}.ndjson` : `${locale}.attempt${attempt}.ndjson`);
        r = await runKane({
          objective, url, kane: cfg.kane, ndjsonPath: ndjson,
          onBrowserReady: releaseLaunch,
          onStep: (s) => log(`${tag} ${s.status === 'failed' ? c.red('✗') : c.dim('·')} ${trim(s.remark, 90)}`),
        });
        if (r.status !== 'error' && r.status !== 'inconclusive') break;
        earlier.push({ status: r.status, note: r.oneLiner || r.reason, testUrl: r.testUrl || null, credits: r.credits, ndjson: rel(cfg, ndjson) });
        log(`${tag} ${c.yellow(r.status === 'error' ? 'kane-cli error' : 'Kane flagged its own misstep, not an app bug')}: ${trim(r.oneLiner || r.reason, 100)}`);
      }
      if (earlier.length) r.credits = Math.round((r.credits || 0) * 10 + earlier.reduce((s, a) => s + (a.credits || 0) * 10, 0)) / 10;
      const shot = join(runDir, `${locale}.jpg`);
      const hasShot = extractScreenshot(r.evidencePack, shot);
      const prev = results.locales[locale];
      results.locales[locale] = {
        history: prev ? [...(prev.history || []), historyEntry(prev)].slice(-5) : [],
        locale,
        language: languageName(locale),
        nativeLanguage: languageName(locale, locale),
        url,
        ...r,
        earlierAttempts: earlier,
        wallSeconds: Math.round((Date.now() - t0) / 1000),
        ndjson: rel(cfg, ndjson),
        screenshot: hasShot ? rel(cfg, shot) : null,
        runAt: new Date().toISOString(),
        round: roundNo,
      };
      const mark = r.status === 'passed' ? c.green('PASS') : r.status === 'failed' ? c.red('FAIL') : c.yellow(r.status.toUpperCase());
      log(`${tag} ${mark}  ${trim(r.oneLiner || r.reason || '', 110)}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(cfg.concurrency, locales.length) }, worker));
  await flushProfiles();

  const statuses = Object.fromEntries(locales.map((l) => [l, results.locales[l].status]));
  results.rounds.push({
    round: roundNo,
    startedAt,
    finishedAt: new Date().toISOString(),
    ran: locales,
    statuses,
    credits: Math.round(locales.reduce((s, l) => s + (results.locales[l].credits || 0), 0) * 10) / 10,
    runDir: rel(cfg, runDir),
    ...(build ? { build } : {}),
  });
  saveResults(cfg, results);
  writeReport(cfg, results);
  return { results, ran: locales };
}

const LOCK = join(tmpdir(), 'locale-check-browser-launch.lock');
async function machineLock() {
  for (;;) {
    try {
      mkdirSync(LOCK);
      let held = true;
      return () => { if (held) { held = false; try { rmdirSync(LOCK); } catch { /* already gone */ } } };
    } catch {
      // A lock older than 60 s belongs to a crashed process: take it over.
      try { if (Date.now() - statSync(LOCK).mtimeMs > 60000) rmdirSync(LOCK); } catch { /* raced */ }
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

// What we keep of an earlier verdict, so the report can show "before the fix".
export const historyEntry = (r) => ({
  round: r.round, status: r.status, oneLiner: r.oneLiner, bugTitle: r.bugTitle, rootCause: r.rootCause,
  suggestion: r.suggestion, screenshot: r.screenshot, ndjson: r.ndjson, testUrl: r.testUrl,
  credits: r.credits, duration: r.duration,
});

const rel = (cfg, p) => relative(cfg.outDir, p).replaceAll('\\', '/');
const trim = (s, n) => { s = String(s || '').replace(/\s+/g, ' '); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
