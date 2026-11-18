// Writes the one-file HTML report: the score, one status chip per language, the loop round by
// round (Kane runs → the coding agent fixes → Kane re-runs the red ones), and one tile per locale
// with Kane's screenshot, its verdict and a link to Kane's step-by-step replay.
// Self-contained: inline CSS, a few lines of inline JS for the screenshot viewer, screenshots
// embedded as data URIs. Every string that comes from Kane or the agent goes through esc().
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function writeReport(cfg, results) {
  writeFileSync(cfg.report, renderReport(cfg, results));
  return cfg.report;
}

// One entry per status: the word shown, the colour tone (CSS class t-*) and the icon.
// Inconclusive and error share the "no verdict" tone, as they share yellow in the CLI.
const STATUS = {
  passed: { word: 'Passes', count: 'pass', tone: 'pass', icon: 'check' },
  failed: { word: 'Fails', count: 'fail', tone: 'fail', icon: 'cross' },
  inconclusive: { word: 'Inconclusive', count: 'inconclusive', tone: 'warn', icon: 'question' },
  error: { word: 'Run error', count: 'run error', tone: 'warn', icon: 'bang' },
  pending: { word: 'Not run yet', count: 'not run yet', tone: 'idle', icon: 'circle' },
};
const statusOf = (r) => (!r ? 'pending' : STATUS[r.status] && r.status !== 'pending' ? r.status : 'error');

export function renderReport(cfg, results) {
  const locales = results.locales || {};
  const rounds = results.rounds || [];
  const order = cfg.locales || results.order || Object.keys(locales);
  const now = Object.fromEntries(order.map((l) => [l, statusOf(locales[l])]));
  const counts = { passed: 0, failed: 0, inconclusive: 0, error: 0, pending: 0 };
  for (const l of order) counts[now[l]]++;
  const total = order.length;
  const allGreen = total > 0 && counts.passed === total;
  const credits = rounds.reduce((s, r) => s + (Number(r.credits) || 0), 0);
  const app = results.app || 'Your app';
  const names = Object.fromEntries(order.map((l) => [l, {
    native: locales[l]?.nativeLanguage || displayName(l, l),
    english: locales[l]?.language || displayName(l, 'en'),
  }]));

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="design-direction" content="CI-style test report; colours follow the locale-check CLI (green pass, red fail, yellow no verdict, magenta agent); platform faces with per-script stacks; see the CSS comment">
<title>Locale check · ${esc(app)} · ${counts.passed} of ${total} pass</title>
<style>${CSS}</style></head>
<body>
${SPRITE}
<header class="top"><div class="wrap bar">
  <span class="brand">${icon('globe')}Locale check</span>
  <span class="bar-meta">Updated ${fmtTime(results.updatedAt)}</span>
</div></header>
${recordedBanner(results.recorded)}
<main>
<section class="wrap hero" aria-labelledby="score">
  <h1 id="score"><span class="app" dir="auto">${esc(app)}</span><span class="score">${counts.passed} of ${total} languages pass</span></h1>
  ${stateLine(counts, total, allGreen, results)}
  <ul class="chips" aria-label="Latest verdict per language">${order.map((l) => chip(l, now[l], names[l])).join('')}</ul>
</section>
<div class="wrap story">
  ${loopSection(order, rounds, counts, total, credits)}
  ${objectiveSection(results, order, locales)}
</div>
<section class="wrap tiles-sec" aria-labelledby="tiles-h">
  <h2 id="tiles-h">Latest verdict per language</h2>
  <p class="lede">Kane's last screenshot, what it found, and a link to its step-by-step replay.</p>
  <div class="tiles">
${order.map((l) => tile(cfg, locales[l], l, now[l], names[l])).join('\n')}
  </div>
</section>
</main>
<footer class="wrap foot"><div class="foot-in">
  <p><strong>${fmtNum(credits)}</strong> Kane credits in total, across ${rounds.length} round${rounds.length === 1 ? '' : 's'}</p>
  <p>Updated ${fmtTime(results.updatedAt)} · written by ${esc(results.tool || 'locale-check')}</p>
</div></footer>
<dialog class="viewer" id="viewer" aria-label="Kane's screenshot">
  <form method="dialog" class="vbar"><p class="vcap"></p><button type="submit" class="vclose">${icon('cross')}<span>Close</span></button></form>
  <img alt="">
</dialog>
<script>${JS}</script>
</body></html>`;
}

// ---------- header pieces ----------

function recordedBanner(recorded) {
  if (!recorded) return '';
  const text = typeof recorded === 'string' ? recorded : 'These results were recorded earlier and are shown as recorded.';
  return `<div class="recorded" role="note"><div class="wrap"><span class="rec-tag">${icon('play')}Recorded run</span><p dir="auto">${esc(text)}</p></div></div>`;
}

function stateLine(counts, total, allGreen, results) {
  if (!total) return '<p class="state"><span class="lead">No languages configured.</span></p>';
  if (allGreen) {
    // Tell the loop's story when there was one: how many were red at first, and how many agent fixes it took.
    const rounds = results?.rounds || [];
    const firstRed = rounds.length ? Object.values(rounds[0].statuses || {}).filter((s) => s === 'failed').length : 0;
    const fixes = rounds.filter((r) => r.fix).length;
    const story = firstRed && fixes
      ? `${firstRed} failed in round 1; green after ${fixes} agent fix${fixes > 1 ? 'es' : ''}, re-checked by Kane.`
      : 'Every language completes the objective.';
    return `<p class="state"><span class="count t-pass">${dot('passed')}All green</span><span class="lead">${esc(story)}</span></p>`;
  }
  const parts = ['failed', 'inconclusive', 'error', 'pending'].filter((s) => counts[s])
    .map((s) => `<span class="count t-${STATUS[s].tone}">${dot(s)}${counts[s]} ${STATUS[s].count}</span>`);
  const notes = [];
  if (counts.failed) notes.push('Red: Kane confirmed a bug in the app.');
  if (counts.inconclusive || counts.error) notes.push('Yellow: no verdict yet (Kane\'s own misstep or a crash); a re-run decides.');
  return `<p class="state"><span class="lead">Needs attention</span>${parts.join('')}</p>${notes.length ? `
  <p class="state-note">${notes.join(' ')}</p>` : ''}`;
}

function chip(l, s, n) {
  const S = STATUS[s];
  return `<li><a class="chip t-${S.tone}" href="#${anchor(l)}">${dot(s)}<span class="chip-name"><bdi${langAttr(l)}>${esc(n.native)}</bdi></span><span class="chip-sub"><code>${esc(l)}</code> · ${S.word}</span></a></li>`;
}

// ---------- the loop ----------

function loopSection(order, rounds, counts, total, credits) {
  if (!rounds.length) {
    return `<section class="panel loop" aria-labelledby="loop-h"><h2 id="loop-h">The loop, round by round</h2>
  <p class="lede">No rounds yet. <code>locale-check run</code> starts the first one; <code>locale-check loop</code> also hands failures to the coding agent.</p></section>`;
  }
  const first = rounds[0];
  const firstPass = Object.values(first.statuses || {}).filter((s) => s === 'passed').length;
  const fixes = rounds.filter((r) => r.fix);
  const agents = [...new Set(fixes.map((r) => agentName(r.fix.agent)))];
  const wall = secondsBetween(first.startedAt, rounds[rounds.length - 1].finishedAt);
  const story = `Round 1: ${firstPass} of ${(first.ran || []).length} passed. Now: ${counts.passed} of ${total}`
    + (fixes.length ? `, after ${fixes.length} fix${fixes.length > 1 ? 'es' : ''} by ${agents.map(esc).join(' and ')}` : '') + '.';
  const totals = [`${rounds.length} round${rounds.length > 1 ? 's' : ''}`, fmtDur(wall), `${fmtNum(credits)} Kane credits`].filter(Boolean).join(' · ');
  const body = rounds.map((r) => roundRow(order, r) + (r.fix ? fixRow(order, r.fix) : '')).join('\n');
  return `<section class="panel loop" aria-labelledby="loop-h">
  <h2 id="loop-h">The loop, round by round</h2>
  <p class="lede"><strong>${story}</strong><br><span class="quiet">${totals}</span></p>
  <div class="matrix-wrap"><table class="matrix">
    <caption class="sr">Kane's verdict for each language in each round, with the agent's fixes between rounds</caption>
    <thead><tr><th scope="col" class="rh">Round</th>${order.map((l) => `<th scope="col">${esc(l)}</th>`).join('')}</tr></thead>
    <tbody>
${body}
    </tbody>
  </table></div>
  <ul class="legend" aria-label="Key">${['passed', 'failed', 'inconclusive', 'error'].map((s) => `<li><span class="cell t-${STATUS[s].tone}">${icon(STATUS[s].icon)}</span>${legendWord(s)}</li>`).join('')}<li><span class="cell t-none"></span>not run in that round</li></ul>
</section>`;
}

const legendWord = (s) => ({ passed: 'passes', failed: 'fails (app bug)', inconclusive: 'inconclusive (Kane\'s own misstep)', error: 'run error' }[s]);

function roundRow(order, r) {
  const statuses = r.statuses || {};
  const ran = r.ran || Object.keys(statuses);
  const pass = ran.filter((l) => statuses[l] === 'passed').length;
  const meta = [fmtDur(secondsBetween(r.startedAt, r.finishedAt)), r.credits != null ? `${fmtNum(r.credits)} credits` : null].filter(Boolean).join(' · ');
  const cells = order.map((l) => {
    if (!ran.includes(l)) return `<td><span class="cell t-none" title="${esc(l)}: not run in round ${esc(r.round)}"><span class="sr">not run</span></span></td>`;
    const s = statusOf({ status: statuses[l] });
    return `<td><span class="cell t-${STATUS[s].tone}" title="${esc(l)}, round ${esc(r.round)}: ${STATUS[s].word}">${icon(STATUS[s].icon)}<span class="sr">${STATUS[s].word}</span></span></td>`;
  }).join('');
  return `<tr class="round"><th scope="row"><span class="rn">Round ${esc(r.round)}</span><span class="rs">Kane ran ${ran.length}: ${pass} pass</span>${meta ? `<span class="rs">${meta}</span>` : ''}</th>${cells}</tr>`;
}

function fixRow(order, fix) {
  const agent = agentName(fix.agent);
  const files = fix.files || [];
  const forList = (fix.for || []).map((l) => `<code>${esc(l)}</code>`).join(' ');
  const head = fix.ok === false
    ? `<b class="agent">${esc(agent)}</b> stopped before finishing its fix for ${forList}`
    : `<b class="agent">${esc(agent)}</b> fixed ${forList}: ${files.length ? `<b>${files.length} file${files.length > 1 ? 's' : ''} changed</b>` : 'no files changed'}`;
  const lines = String(fix.summary || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const lead = (lines[0] || '').replace(/^#+\s*/, '').replace(/^\*\*(.+)\*\*:?$/, '$1');
  const more = lines.length > 1 || lead.length > 220
    ? `<details class="more"><summary>${esc(agent)}'s full summary</summary><div class="pre" dir="auto">${esc(String(fix.summary).trim())}</div></details>` : '';
  return `<tr class="fix"><td colspan="${order.length + 1}"><div class="fixbox">
  <p class="fix-head">${icon('pencil')}<span>${head}${Number.isFinite(fix.seconds) ? ` <span class="quiet">· ${fmtDur(fix.seconds)}</span>` : ''}</span></p>
  ${files.length ? `<ul class="files" aria-label="Files the agent changed">${files.map((f) => `<li><code dir="ltr">${esc(f)}</code></li>`).join('')}</ul>` : ''}
  ${lead ? `<p class="fix-lead" dir="auto">${esc(lead)}</p>` : ''}
  ${more}
</div></td></tr>`;
}

// ---------- the objective ----------

function objectiveSection(results, order, locales) {
  const text = String(results.objective || '').trim();
  const blocks = [];
  let list = null;
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*(\d+)[.)]\s+(.*)$/.exec(line);
    if (m) {
      list ||= [];
      list.push(`<li value="${m[1]}" dir="auto">${placeholders(esc(m[2]))}</li>`);
      continue;
    }
    if (list) { blocks.push(`<ol class="steps">${list.join('')}</ol>`); list = null; }
    if (line.trim()) blocks.push(`<p dir="auto">${placeholders(esc(line.trim()))}</p>`);
  }
  if (list) blocks.push(`<ol class="steps">${list.join('')}</ol>`);

  // Show what each placeholder becomes, from the names already in the results.
  const ran = order.filter((l) => locales[l]);
  const examples = [];
  if (/\{language\}/.test(text) && ran.length) examples.push(`<code class="ph">{language}</code> → ${ran.slice(0, 3).map((l) => esc(locales[l].language || l)).join(', ')}…`);
  if (/\{nativeLanguage\}/.test(text) && ran.length) examples.push(`<code class="ph">{nativeLanguage}</code> → ${ran.slice(0, 3).map((l) => `<span${langAttr(l)}>${esc(locales[l].nativeLanguage || l)}</span>`).join(', ')}…`);
  if (/\{locale\}/.test(text) || /\{locale\}/.test(results.url || '')) examples.push(`<code class="ph">{locale}</code> → ${order.slice(0, 3).map(esc).join(', ')}…`);

  const checks = results.checks?.length
    ? `<p class="kv-h">Also checked throughout the flow</p><ul class="checks">${results.checks.map((c) => `<li dir="auto">${placeholders(esc(c))}</li>`).join('')}</ul>` : '';
  return `<section class="panel objective" aria-labelledby="obj-h">
  <h2 id="obj-h">One objective, run in every language</h2>
  <p class="lede">Kane CLI gets this plain-English objective once per language${examples.length ? ', with the placeholders filled in' : ''}.</p>
  <div class="obj">${blocks.join('\n') || '<p>No objective recorded.</p>'}</div>
  ${checks}
  ${examples.length ? `<p class="kv">${examples.join('<br>')}</p>` : ''}
  ${results.url ? `<p class="kv"><span>App URL</span> <code dir="ltr">${esc(results.url)}</code></p>` : ''}
</section>`;
}

const placeholders = (html) => html.replace(/\{([A-Za-z_]+)\}/g, '<code class="ph">{$1}</code>');

// ---------- one tile per locale ----------

function tile(cfg, r, l, s, n) {
  const S = STATUS[s];
  const head = `<header class="tile-head">
    <div><h3><bdi${langAttr(l)}>${esc(n.native)}</bdi></h3><p class="sub"><code>${esc(l)}</code>${n.english && n.english !== n.native ? ` · ${esc(n.english)}` : ''}</p></div>
    <span class="badge">${dot(s)}${S.word}</span>
  </header>`;
  if (!r) {
    return `<article class="tile t-idle" id="${anchor(l)}">${head}
  <div class="shot none"><span>Kane has not run this language yet.</span></div>
  <div class="tile-body"><p class="note">Run <code>locale-check run --only ${esc(l)}</code> to check it.</p></div>
</article>`;
  }
  const credits = r.credits != null ? `${fmtNum(r.credits)} credits${r.earlierAttempts?.length ? ' incl. retry' : ''}` : null;
  const meta = [r.round != null ? `Round ${esc(r.round)}` : null, fmtDur(r.duration ?? r.wallSeconds), credits].filter(Boolean);
  const replay = safeUrl(r.testUrl);
  return `<article class="tile t-${S.tone}" id="${anchor(l)}">${head}
  ${shot(cfg, r, l, n)}
  <div class="tile-body">
    ${verdict(r, s)}
    ${retries(r.earlierAttempts)}
    ${before(cfg, r.history)}
    ${r.summary ? `<details class="more"${s === 'passed' ? ' open' : ''}><summary>Kane's full summary</summary><div class="pre" dir="auto">${esc(String(r.summary).trim())}</div></details>` : ''}
  </div>
  <footer class="tile-meta">${meta.map((m) => `<span>${m}</span>`).join('')}${replay ? `<a class="replay" href="${esc(replay)}" target="_blank" rel="noopener noreferrer">Kane replay${icon('external')}<span class="sr"> for ${esc(n.english)}, step by step (opens in a new tab)</span></a>` : ''}</footer>
</article>`;
}

function shot(cfg, r, l, n) {
  const p = r.screenshot ? join(cfg.outDir, r.screenshot) : null;
  if (!p || !existsSync(p)) return '<div class="shot none"><span>No screenshot from Kane for this run.</span></div>';
  const mime = /\.png$/i.test(p) ? 'image/png' : /\.webp$/i.test(p) ? 'image/webp' : 'image/jpeg';
  const caption = `${n.english} (${l}) · round ${r.round ?? '?'} · Kane's last screenshot`;
  return `<button type="button" class="shot" data-caption="${esc(caption)}" aria-label="Enlarge Kane's last screenshot for ${esc(n.english)}"><span class="frame"><img src="data:${mime};base64,${readFileSync(p).toString('base64')}" alt="Kane's last screenshot of the app in ${esc(n.english)}"></span><span class="shot-cap">${icon('expand')}Kane's last screenshot · enlarge</span></button>`;
}

function verdict(r, s) {
  if (s === 'passed') {
    return `<p class="kicker">Kane's verdict</p><p class="said" dir="auto">${esc(r.oneLiner || r.reason || 'Objective completed')}</p>`;
  }
  if (s === 'failed') {
    const facts = [
      r.rootCause ? `<div><dt>Root cause</dt><dd dir="auto">${esc(r.rootCause)}</dd></div>` : '',
      r.suggestion ? `<div><dt>Suggested fix</dt><dd dir="auto">${esc(r.suggestion)}</dd></div>` : '',
    ].join('');
    return `<p class="kicker">Bug Kane confirmed</p><p class="bug" dir="auto">${esc(r.bugTitle || r.oneLiner || r.reason || 'Kane reported a failure')}</p>${facts ? `<dl class="facts">${facts}</dl>` : ''}`;
  }
  if (s === 'inconclusive') {
    return `<p class="kicker">No verdict: Kane misstepped</p><p class="said" dir="auto">${esc(r.oneLiner || r.reason || '')}</p><p class="note">Kane judged that this failure came from its own automation, not from the app, so there is nothing to fix yet.</p>`;
  }
  return `<p class="kicker">No verdict: run crashed</p><p class="said" dir="auto">${esc(r.reason || r.oneLiner || 'kane-cli stopped without a result')}</p><p class="note">kane-cli stopped before Kane reached a verdict; this says nothing about the app.</p>`;
}

function retries(earlier) {
  if (!earlier?.length) return '';
  const parts = earlier.map((a, i) => {
    const what = a.status === 'error' ? 'crashed (run error)' : 'flagged its own misstep (inconclusive)';
    const url = safeUrl(a.testUrl);
    return `attempt ${i + 1} ${what}${url ? ` · <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">replay<span class="sr"> of attempt ${i + 1}, opens in a new tab</span></a>` : ''}`;
  });
  return `<p class="retry">${icon('retry')}<span>Kane retried: ${parts.join('; ')}.</span></p>`;
}

// Earlier rounds for this language (newest first): the red verdict from before a fix.
function before(cfg, history) {
  const red = (history || []).filter((h) => h.status === 'failed').slice().reverse();
  if (!red.length) return '';
  return red.map((h) => {
    const p = h.screenshot ? join(cfg.outDir, h.screenshot) : null;
    const img = p && existsSync(p)
      ? `<img loading="lazy" src="data:image/jpeg;base64,${readFileSync(p).toString('base64')}" alt="Kane's screenshot from round ${esc(h.round)}, before the fix">`
      : '';
    const url = safeUrl(h.testUrl);
    return `<details class="before" open><summary>${icon('retry')}Before the fix · round ${esc(h.round)} · ${STATUS.failed.word}</summary>
      <p class="bug" dir="auto">${esc(h.bugTitle || h.oneLiner || '')}</p>
      ${h.rootCause ? `<p class="note" dir="auto">${esc(h.rootCause)}</p>` : ''}
      ${img}
      ${url ? `<p class="note"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Kane replay of round ${esc(h.round)}<span class="sr"> (opens in a new tab)</span></a></p>` : ''}
    </details>`;
  }).join('');
}

// ---------- small helpers ----------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icon = (name) => `<svg class="i" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
const dot = (s) => `<span class="dot t-${STATUS[s].tone}">${icon(STATUS[s].icon)}</span>`;
const anchor = (l) => `lang-${String(l).replace(/[^A-Za-z0-9_-]/g, '_')}`;
const langAttr = (l) => (/^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$/.test(String(l)) ? ` lang="${l}"` : '');
const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null);
const agentName = (a) => String(a || 'agent').split(/[\\/]/).pop().replace(/\.(exe|cmd|bat)$/i, '');
const fmtNum = (n) => (Number.isFinite(Number(n)) ? (Math.round(Number(n) * 10) / 10).toLocaleString('en-US') : '?');
const secondsBetween = (a, b) => { const d = (Date.parse(b) - Date.parse(a)) / 1000; return Number.isFinite(d) && d >= 0 ? d : null; };
function displayName(code, inLocale) {
  try { return new Intl.DisplayNames([inLocale], { type: 'language' }).of(code) || code; } catch { return code; }
}
function fmtDur(sec) {
  if (sec == null || !Number.isFinite(Number(sec))) return null;
  sec = Math.round(Number(sec));
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m} min${sec % 60 ? ` ${sec % 60} s` : ''}`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
function fmtTime(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return esc(iso || 'unknown');
  const d = new Date(t).toISOString();
  return `<time datetime="${d}">${d.slice(0, 10)} ${d.slice(11, 16)} UTC</time>`;
}

// Icons drawn on a 24 px grid, stroked in currentColor.
const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5.5 12.5l4.2 4.2L18.5 7.8"/></symbol>
<symbol id="i-cross" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></symbol>
<symbol id="i-question" viewBox="0 0 24 24"><path d="M9.3 9.4a2.8 2.8 0 1 1 4.1 2.4c-.9.5-1.4 1.1-1.4 2.1v.4"/><path d="M12 17.6v.1"/></symbol>
<symbol id="i-bang" viewBox="0 0 24 24"><path d="M12 6.8v6.6"/><path d="M12 17.4v.1"/></symbol>
<symbol id="i-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/></symbol>
<symbol id="i-pencil" viewBox="0 0 24 24"><path d="M4.5 19.5l1-4.2L15.8 5a1.8 1.8 0 0 1 2.6 0l.6.6a1.8 1.8 0 0 1 0 2.6L8.7 18.5z"/><path d="M13.8 7l3.2 3.2"/></symbol>
<symbol id="i-external" viewBox="0 0 24 24"><path d="M10 6.5H7.2A1.7 1.7 0 0 0 5.5 8.2v8.6c0 .9.8 1.7 1.7 1.7h8.6c.9 0 1.7-.8 1.7-1.7V14"/><path d="M13.5 5.5h5v5M18.5 5.5l-7 7"/></symbol>
<symbol id="i-expand" viewBox="0 0 24 24"><path d="M14 5.5h4.5V10M10 18.5H5.5V14M18.5 5.5L13.5 10.5M5.5 18.5l5-5"/></symbol>
<symbol id="i-retry" viewBox="0 0 24 24"><path d="M5.5 12a6.5 6.5 0 1 0 2-4.7"/><path d="M5.5 4.5v3.8h3.8"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5"/><path d="M10.4 9.3v5.4l4.3-2.7z"/></symbol>
<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.3 2.2 3.4 4.9 3.4 8s-1.1 5.8-3.4 8c-2.3-2.2-3.4-4.9-3.4-8s1.1-5.8 3.4-8z"/></symbol>
</svg>`;

// Screenshot viewer: click a screenshot to see it full size; Esc, Close or the backdrop closes it.
const JS = `(()=>{const d=document.getElementById('viewer');if(!d||!d.showModal)return;const im=d.querySelector('img'),cap=d.querySelector('.vcap');
document.addEventListener('click',(e)=>{const b=e.target.closest&&e.target.closest('button.shot');if(b){const s=b.querySelector('img');im.src=s.src;im.alt=s.alt;cap.textContent=b.dataset.caption||'';d.showModal();return;}if(e.target===d)d.close();});
d.addEventListener('close',()=>im.removeAttribute('src'));})();`;

const CSS = `
/* Direction: a test report a developer trusts at a glance. It is seen at 1920x1080 in a demo
   video and opened from disk after a run, by developers who ship translations and by hackathon
   judges. Feel: precise, calm and honest, like a CI run summary set in a few restrained greys
   (the way Linear builds hierarchy from greys, not hues), so that red and green carry the message.
   Colour speaks the CLI's own language (src/term.mjs): green PASS, red FAIL, yellow for "no
   verdict" (inconclusive or crashed; the loop treats both alike), magenta for the coding agent.
   There is no brand accent: links are ink and underlined, so any hue on this page means a status
   or the agent. Status fills are spaced in lightness and checked for colour-blind separation
   (dataviz validator); every status also carries an icon and a word. Ground: cool near-white with
   white panels, not warm paper, because the screenshots are warm-toned and must stand apart.
   Type: the platform UI face (Segoe UI, SF, Noto) with per-script stacks for Arabic, Japanese and
   Chinese, because the file must open offline with no font requests, and the native language
   names (Deutsch, العربية, 日本語) are the visual feature. Mono only for locale codes, file paths
   and placeholders. Sizes: fluid scale over 360-1920 px (body 16-17 px, ratio 1.2-1.333), the
   score at 37-72 px so it survives video compression; prose capped near 72ch. */
:root{
  color-scheme:light dark;
  --bg:#f3f5f8;--surface:#fff;--surface-2:#f7f8fa;--line:#dde1e7;--line-strong:#8d939c;
  --ink:#16191d;--ink-2:#4a5059;--ink-3:#626873;
  --pass:#2f9a7a;--pass-ink:#0d6a50;--pass-tint:#e6f5ef;--on-pass:#fff;
  --fail:#c8302a;--fail-ink:#a3221b;--fail-tint:#fdecea;--on-fail:#fff;
  --warn:#e5a632;--warn-edge:#b57f12;--warn-ink:#7a5200;--warn-tint:#fdf3e0;--on-warn:#2b1d03;
  --idle:#8d939c;--idle-ink:#4a5059;--idle-tint:#eef1f5;
  --agent:#a62f86;--agent-ink:#8a1f6c;--agent-tint:#fbeef7;
  --inverse:#16191d;--on-inverse:#f3f5f8;--scrim:rgb(10 12 14 / .82);
  --sans:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans","Helvetica Neue",Arial,"Geeza Pro","Noto Sans Arabic","Hiragino Sans","Yu Gothic UI","PingFang SC","Microsoft YaHei UI","Noto Sans CJK JP",sans-serif;
  --mono:ui-monospace,"Cascadia Mono","SF Mono",Menlo,Consolas,"Liberation Mono","Noto Sans Mono",monospace;
  --t-small:clamp(0.8125rem,0.79rem + 0.1vw,0.9375rem);
  --t-body:clamp(1rem,0.9856rem + 0.0641vw,1.0625rem);
  --t-1:clamp(1.125rem,1.0578rem + 0.2988vw,1.4163rem);
  --t-2:clamp(1.35rem,1.2259rem + 0.5517vw,1.8879rem);
  --t-5:clamp(2.3328rem,1.8392rem + 2.1938vw,4.4718rem);
  --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:24px;--s6:32px;--s7:48px;
  --r-s:6px;--r-m:10px;--gutter:clamp(16px,3vw,48px);--max:112rem;
}
@media (prefers-color-scheme:dark){:root{
  --bg:#121417;--surface:#1b1e22;--surface-2:#22262b;--line:#2e3339;--line-strong:#6b727c;
  --ink:#eceff3;--ink-2:#c0c6ce;--ink-3:#9aa1ab;
  --pass:#5cc29f;--pass-ink:#7fd8b8;--pass-tint:#14271f;--on-pass:#0f1412;
  --fail:#e5574a;--fail-ink:#ff9d90;--fail-tint:#2d1715;--on-fail:#140d0c;
  --warn:#f3c66f;--warn-edge:#f3c66f;--warn-ink:#f3c66f;--warn-tint:#2a2212;--on-warn:#1b1405;
  --idle:#6b727c;--idle-ink:#c0c6ce;--idle-tint:#202429;
  --agent:#e57cc8;--agent-ink:#f59ad9;--agent-tint:#2a1526;
  --inverse:#eceff3;--on-inverse:#16191d;
}}
.t-pass{--tone:var(--pass);--tone-ink:var(--pass-ink);--tint:var(--pass-tint);--on:var(--on-pass);--edge:var(--pass)}
.t-fail{--tone:var(--fail);--tone-ink:var(--fail-ink);--tint:var(--fail-tint);--on:var(--on-fail);--edge:var(--fail)}
.t-warn{--tone:var(--warn);--tone-ink:var(--warn-ink);--tint:var(--warn-tint);--on:var(--on-warn);--edge:var(--warn-edge)}
.t-idle{--tone:var(--idle);--tone-ink:var(--idle-ink);--tint:var(--idle-tint);--on:var(--idle-ink);--edge:var(--idle)}

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 var(--t-body)/1.55 var(--sans)}
:lang(ja){font-family:system-ui,-apple-system,"Segoe UI","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic UI","Meiryo UI","Noto Sans CJK JP","Noto Sans JP",sans-serif}
:lang(zh){font-family:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei UI","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC",sans-serif}
:lang(zh-TW),:lang(zh-HK),:lang(zh-Hant){font-family:system-ui,-apple-system,"Segoe UI","PingFang TC","Microsoft JhengHei UI","Noto Sans CJK TC",sans-serif}
:lang(ko){font-family:system-ui,-apple-system,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic","Noto Sans CJK KR",sans-serif}
:lang(ar),:lang(fa),:lang(ur){font-family:system-ui,-apple-system,"Segoe UI","Geeza Pro","SF Arabic","Noto Sans Arabic","Noto Naskh Arabic",sans-serif}
.wrap{max-width:var(--max);margin-inline:auto;padding-inline:var(--gutter)}
.sr{position:absolute;top:0;left:0;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.i{width:1em;height:1em;flex:none;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
code{font-family:var(--mono);font-size:.9em}
code code,.chip-sub code,.sub code,.kv code,.note code{font-size:1em}
a{color:inherit;text-decoration-thickness:1px;text-underline-offset:.18em}
a:hover{text-decoration-thickness:2px}
:focus-visible{outline:2.5px solid var(--ink);outline-offset:3px}
h2{font-size:var(--t-2);line-height:1.2;letter-spacing:-0.01em;margin:0 0 var(--s2)}
.lede{margin:0 0 var(--s5);color:var(--ink-2);max-width:72ch}
.quiet{color:var(--ink-3);font-weight:400}

/* top bar and recorded banner */
.top{background:var(--surface);border-bottom:1px solid var(--line)}
.bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--s1) var(--s4);min-height:52px;padding-block:var(--s2)}
.brand{display:inline-flex;align-items:center;gap:var(--s2);font-weight:700}
.brand .i{width:1.3em;height:1.3em;stroke-width:1.7}
.bar-meta{color:var(--ink-3);font-size:var(--t-small)}
.recorded{background:var(--inverse);color:var(--on-inverse)}
.recorded .wrap{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2) var(--s4);padding-block:var(--s3)}
.recorded p{margin:0;max-width:96ch}
.rec-tag{display:inline-flex;align-items:center;gap:var(--s2);padding:4px 12px 4px 8px;border:1.5px solid currentColor;border-radius:999px;font-size:var(--t-small);font-weight:700;letter-spacing:.07em;text-transform:uppercase}
.rec-tag .i{width:1.3em;height:1.3em;stroke-width:1.8}
.rec-tag .i path{fill:currentColor}

/* hero: the score and one chip per language */
.hero{padding-block:var(--s7) var(--s6)}
h1{margin:0;display:flex;flex-direction:column;gap:var(--s1)}
h1 .app{font-size:var(--t-1);font-weight:600;color:var(--ink-2);line-height:1.3}
h1 .score{font-size:var(--t-5);font-weight:700;line-height:1.04;letter-spacing:-0.03em;font-variant-numeric:tabular-nums;text-wrap:balance}
.state{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2) var(--s3);margin:var(--s4) 0 0;font-size:var(--t-1)}
.state .lead{font-weight:600}
.state-note{margin:var(--s2) 0 0;color:var(--ink-3);font-size:var(--t-small)}
.count{display:inline-flex;align-items:center;gap:var(--s2);padding:4px 16px 4px 4px;border:1px solid var(--edge);border-radius:999px;background:var(--tint);color:var(--tone-ink);font-weight:600}
.dot{display:inline-grid;place-items:center;width:1.7em;height:1.7em;flex:none;border-radius:50%;background:var(--tone);color:var(--on)}
.dot .i{width:1.15em;height:1.15em;stroke-width:2.8}
.dot.t-idle{background:transparent;border:1.5px dashed var(--idle);color:var(--idle-ink)}
.dot.t-idle .i{stroke-width:2}
.chips{list-style:none;margin:var(--s6) 0 0;padding:0;display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr))}
.chip{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:var(--s3);align-items:center;height:100%;padding:var(--s3) var(--s4);background:var(--surface);border:1px solid var(--line);border-top:4px solid var(--tone);border-radius:var(--r-m);color:var(--ink);text-decoration:none}
.chip .dot{grid-row:span 2;font-size:var(--t-1)}
.chip-name{font-size:var(--t-1);font-weight:600;line-height:1.25;overflow-wrap:break-word}
.chip-sub{font-size:var(--t-small);font-weight:600;color:var(--tone-ink);line-height:1.35}
.chip-sub code{color:var(--ink-2);font-weight:400}
.chip:hover{background:var(--tint)}

/* the loop and the objective, side by side on wide screens */
.story{display:grid;gap:var(--s5);grid-template-columns:minmax(0,1fr);padding-bottom:var(--s7)}
@media (min-width:1100px){.story{grid-template-columns:minmax(0,7fr) minmax(0,5fr);align-items:start}}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-m);padding:var(--s5) clamp(16px,2vw,32px)}
.matrix-wrap{position:relative;overflow-x:auto}
.matrix{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.matrix th,.matrix td{padding:var(--s2) 2px;text-align:center;vertical-align:middle}
.matrix thead th{padding-block:0 var(--s2);border-bottom:1px solid var(--line);font:600 var(--t-small)/1.3 var(--mono);color:var(--ink-2)}
.matrix thead th.rh{font-family:var(--sans);text-align:start}
.matrix tbody th{text-align:start;font-weight:400;padding-inline-end:var(--s3);min-width:6.5rem}
@media (min-width:700px){.matrix tbody th{min-width:9rem}}
.matrix tr.round{border-top:1px solid var(--line)}
.matrix tbody tr:first-child{border-top:0}
.rn{display:block;font-weight:700}
.rs{display:block;font-size:var(--t-small);color:var(--ink-3);line-height:1.4}
.cell{display:inline-grid;place-items:center;width:clamp(1.75rem,1.5rem + 1vw,2.75rem);height:clamp(1.75rem,1.5rem + 1vw,2.75rem);border-radius:var(--r-s);background:var(--tone);color:var(--on);vertical-align:middle}
.cell .i{width:62%;height:62%;stroke-width:2.8}
.cell.t-warn{box-shadow:inset 0 0 0 1px var(--edge)}
.cell.t-none{background:transparent;box-shadow:inset 0 0 0 1px var(--line)}
.legend{list-style:none;margin:var(--s4) 0 0;padding:0;display:flex;flex-wrap:wrap;gap:var(--s2) var(--s4);font-size:var(--t-small);color:var(--ink-2)}
.legend li{display:inline-flex;align-items:center;gap:var(--s2)}
.legend .cell{width:1.5rem;height:1.5rem}
.matrix tr.fix td{padding:var(--s1) 0 var(--s3);text-align:start}
.fixbox{margin-inline-start:var(--s3);padding:var(--s3) var(--s4);background:var(--agent-tint);border-inline-start:4px solid var(--agent);border-radius:0 var(--r-s) var(--r-s) 0}
.fix-head{display:flex;align-items:flex-start;gap:var(--s2);margin:0}
.fix-head .i{width:1.25em;height:1.25em;margin-top:.15em;color:var(--agent-ink)}
.fix-head .agent{color:var(--agent-ink)}
.files{list-style:none;margin:var(--s2) 0 0;padding:0;display:flex;flex-wrap:wrap;gap:var(--s2)}
.files code{display:inline-block;padding:2px 8px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-s);font-size:var(--t-small);overflow-wrap:anywhere}
.fix-lead{margin:var(--s2) 0 0;color:var(--ink-2);max-width:80ch;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;line-clamp:3;overflow:hidden}
.more{margin-top:var(--s2)}
.more summary{cursor:pointer;width:fit-content;padding-block:var(--s1);color:var(--ink-2);font-size:var(--t-small);font-weight:600}
.pre{margin-top:var(--s2);max-height:24rem;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--ink-2)}
@media (pointer:coarse){.more summary{padding-block:var(--s3)}}

/* objective */
.obj{max-width:72ch}
.obj p{margin:0 0 var(--s3)}
.steps{margin:0 0 var(--s3);padding-inline-start:1.7em}
.steps li{margin-bottom:var(--s2);padding-inline-start:.25em}
.steps li::marker{font-weight:700;color:var(--ink-2)}
.ph{padding:0 4px;border:1px solid var(--line);border-radius:var(--r-s);background:var(--surface-2);color:var(--ink);white-space:nowrap}
.kv-h{margin:var(--s4) 0 var(--s1);font-weight:600}
.checks{margin:0;padding-inline-start:1.3em;max-width:72ch}
.kv{margin:var(--s4) 0 0;font-size:var(--t-small);color:var(--ink-3)}
.kv code{color:var(--ink-2);overflow-wrap:anywhere}
.objective .kv + .kv{margin-top:var(--s2)}

/* tiles */
.tiles-sec{padding-bottom:var(--s7)}
.tiles{display:grid;gap:var(--s5);grid-template-columns:repeat(auto-fill,minmax(min(100%,28rem),1fr))}
.tile{display:flex;flex-direction:column;min-width:0;background:var(--surface);border:1px solid var(--line);border-top:5px solid var(--tone);border-radius:var(--r-m);overflow:hidden;scroll-margin-top:var(--s5)}
.tile.t-idle{border-style:dashed;border-top-style:solid}
.tile-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:var(--s2) var(--s3);padding:var(--s4) var(--s5);background:var(--tint)}
.tile h3{margin:0;font-size:var(--t-2);line-height:1.2;font-weight:700}
.sub{margin:var(--s1) 0 0;color:var(--ink-2);font-size:var(--t-small)}
.badge{display:inline-flex;align-items:center;gap:var(--s2);padding:4px 16px 4px 4px;border:1px solid var(--edge);border-radius:999px;background:var(--surface);color:var(--tone-ink);font-weight:700}
.shot{display:block;width:calc(100% - 2 * var(--s5));margin:var(--s4) var(--s5) 0;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:start;cursor:zoom-in}
.frame{display:block;aspect-ratio:16/9;overflow:hidden;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-s)}
.frame img{display:block;width:100%;height:100%;object-fit:contain}
.shot:hover .frame{border-color:var(--line-strong)}
.shot-cap{display:inline-flex;align-items:center;gap:var(--s2);margin-top:var(--s2);color:var(--ink-3);font-size:var(--t-small)}
.shot:hover .shot-cap{color:var(--ink);text-decoration:underline}
.shot.none{display:grid;place-items:center;aspect-ratio:16/9;padding:var(--s4);background:var(--surface-2);border:1px dashed var(--line-strong);border-radius:var(--r-s);cursor:default;color:var(--ink-2);font-size:var(--t-small);text-align:center}
.tile-body{flex:1;display:flex;flex-direction:column;gap:var(--s2);padding:var(--s4) var(--s5)}
.kicker{margin:0;font-size:var(--t-small);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tone-ink)}
.bug{margin:0;font-size:var(--t-1);font-weight:600;line-height:1.35;text-wrap:pretty}
.said{margin:0;font-size:var(--t-1);line-height:1.4}
.facts{margin:var(--s1) 0 0;display:grid;gap:var(--s3)}
.facts dt{font-size:var(--t-small);font-weight:700;color:var(--ink-2)}
.facts dd{margin:0}
.note{margin:0;color:var(--ink-2);font-size:var(--t-small)}
.retry{display:flex;align-items:flex-start;gap:var(--s2);margin:var(--s1) 0 0;padding:var(--s2) var(--s3);border-radius:var(--r-s);background:var(--warn-tint);color:var(--ink);font-size:var(--t-small)}
.retry .i{width:1.2em;height:1.2em;margin-top:.15em;color:var(--warn-ink)}
.before{margin:var(--s2) 0 0;padding:var(--s2) var(--s3);border-radius:var(--r-s);background:var(--fail-tint);border:1px dashed var(--fail);font-size:var(--t-small)}
.before summary{cursor:pointer;display:flex;align-items:center;gap:var(--s2);font-weight:600;color:var(--fail-ink)}
.before summary .i{width:1.1em;height:1.1em}
.before .bug{margin:var(--s2) 0 var(--s1)}
.before img{display:block;width:100%;height:auto;margin-top:var(--s2);border-radius:var(--r-s);border:1px solid var(--line)}
.tile-meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s1) var(--s4);padding:var(--s3) var(--s5);border-top:1px solid var(--line);color:var(--ink-3);font-size:var(--t-small);font-variant-numeric:tabular-nums}
.replay{margin-inline-start:auto;display:inline-flex;align-items:center;gap:var(--s2);min-height:40px;padding:0 var(--s4);border:1.5px solid var(--ink);border-radius:999px;color:var(--ink);font-weight:600;text-decoration:none}
.replay:hover{background:var(--ink);color:var(--surface)}
.replay .i{width:1.1em;height:1.1em}

/* footer */
.foot{padding-bottom:var(--s7);color:var(--ink-2);font-size:var(--t-small)}
.foot-in{padding-top:var(--s5);border-top:1px solid var(--line)}
.foot p{margin:0 0 var(--s1)}
.foot strong{color:var(--ink);font-size:var(--t-1);font-variant-numeric:tabular-nums}

/* screenshot viewer */
.viewer{width:min(96vw,1920px);max-width:none;max-height:96vh;padding:var(--s3);border:0;border-radius:var(--r-m);background:var(--surface);color:var(--ink)}
.viewer::backdrop{background:var(--scrim)}
.vbar{display:flex;align-items:center;justify-content:space-between;gap:var(--s3);margin:0 0 var(--s2)}
.vcap{margin:0;font-weight:600}
.vclose{display:inline-flex;align-items:center;gap:var(--s2);min-height:44px;padding:0 var(--s4);border:1.5px solid var(--ink);border-radius:999px;background:var(--surface);color:var(--ink);font:inherit;font-weight:600;cursor:pointer}
.viewer img{display:block;width:100%;max-height:calc(96vh - 5rem);object-fit:contain}

@media (prefers-color-scheme:dark){.frame img{filter:brightness(.9)}}
@media (prefers-reduced-motion:no-preference){.chip,.frame,.replay{transition:background-color .15s,border-color .15s,color .15s}}
@media (max-width:520px){.tile-meta .replay{margin-inline-start:0;width:100%;justify-content:center;min-height:44px}}
`;
