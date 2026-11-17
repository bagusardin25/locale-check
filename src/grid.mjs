// Writes the one-file HTML report: one tile per locale, red or green, with Kane's
// screenshot embedded and a link to Kane's step-by-step replay.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function writeReport(cfg, results) {
  writeFileSync(cfg.report, renderReport(cfg, results));
  return cfg.report;
}

export function renderReport(cfg, results) {
  const order = cfg.locales || results.order || Object.keys(results.locales);
  const tiles = order.map((l) => tile(cfg, results.locales[l], l)).join('\n');
  const counts = { passed: 0, failed: 0, inconclusive: 0, error: 0, pending: 0 };
  for (const l of order) counts[results.locales[l]?.status || 'pending']++;
  const allGreen = counts.passed === order.length;
  const rounds = (results.rounds || []).map(roundRow).join('\n');
  const credits = (results.rounds || []).reduce((s, r) => s + (r.credits || 0), 0);
  const recorded = results.recorded ? `<p class="recorded">${esc(results.recorded)}</p>` : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Locale check · ${esc(results.app || 'report')}</title>
<style>${CSS}</style></head>
<body>
<header>
  <div class="brand">Locale check</div>
  <h1>${esc(results.app || 'App')} · ${counts.passed} of ${order.length} languages pass</h1>
  <p class="status ${allGreen ? 'ok' : 'bad'}">${allGreen ? 'All green' : `${counts.failed + counts.inconclusive + counts.error + counts.pending} need attention`}</p>
  ${recorded}
  <p class="objective"><strong>Kane objective, run in every language:</strong> ${esc(results.objective || '')}</p>
  ${results.checks?.length ? `<ul class="checks">${results.checks.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
</header>
<main class="grid">
${tiles}
</main>
<section class="rounds">
  <h2>Rounds</h2>
  <table><thead><tr><th>Round</th><th>Kane ran</th><th>Result</th><th>Credits</th><th>Then the agent fixed</th></tr></thead>
  <tbody>${rounds}</tbody></table>
  <p class="foot">Total Kane credits: ${Math.round(credits * 10) / 10} · updated ${esc(results.updatedAt || '')}</p>
</section>
</body></html>`;
}

function tile(cfg, r, locale) {
  if (!r) return `<article class="tile pending"><h3>${esc(locale)}</h3><p>Not run yet</p></article>`;
  const img = r.screenshot && existsSync(join(cfg.outDir, r.screenshot))
    ? `<img alt="Kane's screenshot for ${esc(locale)}" src="data:image/jpeg;base64,${readFileSync(join(cfg.outDir, r.screenshot)).toString('base64')}">`
    : '<div class="noimg">no screenshot</div>';
  const label = { passed: 'Pass', failed: 'Fail', inconclusive: 'Inconclusive' }[r.status] || 'Error';
  const detail = r.status === 'passed'
    ? `<p>${esc(r.oneLiner || 'Objective completed')}</p>`
    : `<p class="bug">${esc(r.bugTitle || r.oneLiner || r.reason || '')}</p>${r.rootCause ? `<p class="cause"><strong>Cause:</strong> ${esc(r.rootCause)}</p>` : ''}`;
  return `<article class="tile ${esc(r.status)}">
  <div class="tilehead"><h3>${esc(r.nativeLanguage || locale)} <span>${esc(locale)}</span></h3><b class="badge">${label}</b></div>
  ${img}
  ${detail}
  <p class="meta">round ${r.round} · ${r.duration ?? r.wallSeconds}s · ${r.credits ?? '?'} credits${r.testUrl ? ` · <a href="${esc(r.testUrl)}" target="_blank" rel="noopener">Kane replay</a>` : ''}</p>
</article>`;
}

function roundRow(r) {
  const pass = Object.values(r.statuses).filter((s) => s === 'passed').length;
  const res = Object.entries(r.statuses).map(([l, s]) => `<span class="pill ${s}">${esc(l)}</span>`).join(' ');
  const fix = r.fix ? `${esc(r.fix.agent)}: ${esc((r.fix.files || []).join(', ') || 'no files')}` : '';
  return `<tr><td>${r.round}</td><td>${r.ran.length} (${pass} pass)</td><td>${res}</td><td>${r.credits}</td><td>${fix}</td></tr>`;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const CSS = `
:root{--bg:#f7f7f5;--fg:#1b1b1b;--muted:#666;--card:#fff;--red:#c62828;--green:#2e7d32;--line:#e3e3e0}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#eee;--muted:#999;--card:#1e1e1e;--line:#333}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,"Segoe UI","Noto Sans",sans-serif}
header,main,section{max-width:1200px;margin:0 auto;padding:16px}
.brand{font-weight:700;letter-spacing:.04em;color:var(--muted);text-transform:uppercase;font-size:12px}
h1{margin:4px 0 8px;font-size:26px}.status{font-weight:600}.status.ok{color:var(--green)}.status.bad{color:var(--red)}
.objective{color:var(--muted)}.checks{color:var(--muted);margin-top:0}.recorded{background:#fff3cd;color:#5c4600;padding:6px 10px;border-radius:6px;display:inline-block}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
.tile{background:var(--card);border:1px solid var(--line);border-top:6px solid var(--line);border-radius:10px;padding:12px}
.tile.passed{border-top-color:var(--green)}.tile.failed,.tile.error{border-top-color:var(--red)}.tile.inconclusive{border-top-color:#b7791f}.inconclusive .badge{background:#b7791f}.pill.inconclusive{background:#b7791f}
.tilehead{display:flex;justify-content:space-between;align-items:center}.tilehead h3{margin:0;font-size:18px}.tilehead span{color:var(--muted);font-weight:400;font-size:13px}
.badge{padding:2px 10px;border-radius:99px;color:#fff;font-size:13px}.passed .badge{background:var(--green)}.failed .badge,.error .badge{background:var(--red)}
.tile img{width:100%;border:1px solid var(--line);border-radius:6px;margin:10px 0}.noimg{height:120px;display:grid;place-items:center;color:var(--muted)}
.bug{font-weight:600;margin:4px 0}.cause{margin:4px 0;color:var(--muted)}.meta{color:var(--muted);font-size:13px}
table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid var(--line);padding:6px;text-align:left;vertical-align:top}
.pill{padding:1px 8px;border-radius:99px;color:#fff;font-size:12px}.pill.passed{background:var(--green)}.pill.failed,.pill.error{background:var(--red)}
.foot{color:var(--muted);font-size:13px}
`;
