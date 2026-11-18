// Copies the latest results into a shareable folder: report.html (marked as recorded),
// results.json, Kane's screenshots and NDJSON logs, with local paths stripped.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { loadResults } from './results.mjs';
import { renderReport } from './grid.mjs';

export function snapshot(cfg, dest, { note } = {}) {
  dest = resolve(dest);
  const results = JSON.parse(JSON.stringify(loadResults(cfg)));
  const scrub = makeScrubber(cfg);
  const copy = (relPath) => {
    if (!relPath) return null;
    const from = join(cfg.outDir, relPath);
    if (!existsSync(from)) return null;
    const to = join(dest, relPath);
    mkdirSync(dirname(to), { recursive: true });
    if (relPath.endsWith('.ndjson')) writeFileSync(to, scrub(readFileSync(from, 'utf8')));
    else copyFileSync(from, to);
    return relPath;
  };
  for (const r of Object.values(results.locales)) {
    delete r.sessionDir;
    delete r.evidencePack;
    delete r.stderrTail;
    r.screenshot = copy(r.screenshot);
    r.ndjson = copy(r.ndjson);
    for (const a of r.earlierAttempts || []) a.ndjson = copy(a.ndjson);
    for (const h of r.history || []) { h.screenshot = copy(h.screenshot); h.ndjson = copy(h.ndjson); }
  }
  for (const round of results.rounds) delete round.runDir;
  results.recorded = note || `Recorded run from ${results.updatedAt?.slice(0, 10) || 'an earlier date'}. Every verdict, screenshot and replay link is from that real Kane run; nothing here re-runs.`;
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, 'results.json'), scrub(JSON.stringify(results, null, 2)));
  const snapCfg = { ...cfg, outDir: dest, report: join(dest, 'report.html') };
  writeFileSync(snapCfg.report, scrub(renderReport(snapCfg, results)));
  return snapCfg.report;
}

// Replace the home folder and project folder with neutral names, in both slash styles.
function makeScrubber(cfg) {
  const pairs = [[cfg.root, '<project>'], [homedir(), '~']]
    .flatMap(([p, name]) => [[p, name], [p.replaceAll('\\', '/'), name], [p.replaceAll('\\', '\\\\'), name]]);
  return (text) => pairs.reduce((t, [p, name]) => t.split(p).join(name), text);
}
