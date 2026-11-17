// results.json: the latest Kane verdict per locale plus the history of rounds.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const resultsPath = (cfg) => join(cfg.outDir, 'results.json');

export function loadResults(cfg) {
  const p = resultsPath(cfg);
  if (existsSync(p)) {
    const r = JSON.parse(readFileSync(p, 'utf8'));
    r.rounds ||= [];
    r.locales ||= {};
    return r;
  }
  return { tool: 'locale-check', app: cfg.app || null, url: cfg.url, objective: cfg.objective, checks: cfg.checks || [], locales: {}, rounds: [] };
}

export function saveResults(cfg, results) {
  mkdirSync(cfg.outDir, { recursive: true });
  results.app = cfg.app || results.app || null;
  results.url = cfg.url;
  results.objective = cfg.objective;
  results.checks = cfg.checks || [];
  results.order = cfg.locales;
  results.updatedAt = new Date().toISOString();
  writeFileSync(resultsPath(cfg), JSON.stringify(results, null, 2));
}

/** Locales in config order whose latest result is not a pass (never-run counts as failing). */
export function failing(cfg, results) {
  return cfg.locales.filter((l) => results.locales[l]?.status !== 'passed');
}

export function tally(cfg, results) {
  const t = { passed: 0, failed: 0, inconclusive: 0, error: 0, pending: 0 };
  for (const l of cfg.locales) t[results.locales[l]?.status || 'pending']++;
  return t;
}
