// Turns failing Kane results into a brief a coding agent can act on.
import { join } from 'node:path';
import { failing } from './results.mjs';

export function buildBrief(cfg, results, { forAgent = false } = {}) {
  const notPassing = failing(cfg, results).filter((l) => results.locales[l]);
  // An agent only gets failures Kane confirmed as app bugs; inconclusive runs are Kane's own missteps.
  const red = forAgent ? notPassing.filter((l) => results.locales[l].status === 'failed') : notPassing;
  const lines = [];
  lines.push(`# Locale check: ${red.length} of ${cfg.locales.length} languages fail`);
  lines.push('');
  lines.push(`App: ${cfg.app || '(unnamed)'} · URL pattern: ${cfg.url}`);
  lines.push(`Objective Kane ran in every language: ${cfg.objective}`);
  if (cfg.checks?.length) lines.push(`Checks: ${cfg.checks.join(' ')}`);
  const green = cfg.locales.filter((l) => results.locales[l]?.status === 'passed');
  if (green.length) lines.push(`Passing: ${green.join(', ')}`);
  lines.push('');
  for (const l of red) {
    const r = results.locales[l];
    lines.push(`## ${l} (${r.language}) — ${r.status.toUpperCase()}`);
    lines.push(`- URL: ${r.url}`);
    if (r.bugTitle) lines.push(`- Kane's bug title: ${r.bugTitle}`);
    if (r.rootCause) lines.push(`- Kane's root cause: ${r.rootCause}`);
    if (r.suggestion) lines.push(`- Kane's suggested fix: ${r.suggestion}`);
    if (r.reason) lines.push(`- Failed check: ${oneLine(r.reason)}`);
    if (!r.rootCause && r.summary) lines.push(`- Kane's summary: ${oneLine(r.summary)}`);
    if (r.steps?.length) {
      lines.push('- Last steps Kane took:');
      for (const s of r.steps.slice(-8)) lines.push(`  - ${s.status === 'failed' ? 'FAILED ' : ''}${oneLine(s.remark)}`);
    }
    lines.push(`- Evidence: NDJSON ${join(cfg.outDir, r.ndjson)}${r.screenshot ? `; screenshot ${join(cfg.outDir, r.screenshot)}` : ''}${r.testUrl ? `; replay ${r.testUrl}` : ''}`);
    lines.push('');
  }
  if (forAgent) {
    lines.push('## Your job');
    lines.push('Fix the app so these languages pass, without breaking the languages that pass now.');
    if (cfg.source?.length) lines.push(`The app source is in: ${cfg.source.join(', ')} (relative to ${cfg.root}).`);
    lines.push('- Fix root causes in the app (layout CSS, translation files, validation, formatting), the way a careful developer would, so the fix also holds for other languages.');
    lines.push('- Do not edit locale-check.json, the objective or the checks, and do not hide or remove the feature Kane is testing.');
    lines.push('- Do not run kane-cli or locale-check; it re-runs the failing languages with Kane as soon as you finish.');
    lines.push('- Read the screenshot or NDJSON if the cause is not clear from Kane\'s verdict.');
    lines.push('- Finish with one line per language: `<locale>: <what you changed> (<file>)`.');
  }
  return lines.join('\n');
}

const oneLine = (s) => String(s || '').replace(/\s+/g, ' ').trim();
