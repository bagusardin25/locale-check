import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalise } from '../src/kane.mjs';
import { buildObjective, fill } from '../src/config.mjs';
import { buildBrief } from '../src/brief.mjs';

const appBug = {
  type: 'run_end', status: 'failed', reason: 'Checkpoint assertion failed', credits_consumed: 11.19, duration: 45.4,
  test_url: 'https://example.test/replay',
  verdict: { confirmed: true, family: 'application_issue', bug_title: 'Pay button clipped', root_cause: 'Card too short', suggestion: 'Remove fixed height', severity: 'major', category_proposal: 'visual_layout_defect' },
};
const kaneMisstep = { type: 'run_end', status: 'failed', verdict: { confirmed: false, family: 'automation_bug', root_cause: 'The agent misread the screen' } };

test('a confirmed app bug is a failure with Kane\'s triage kept', () => {
  const r = normalise(appBug);
  assert.equal(r.status, 'failed');
  assert.equal(r.bugTitle, 'Pay button clipped');
  assert.equal(r.suggestion, 'Remove fixed height');
  assert.equal(r.credits, 11.2);
  assert.equal(r.testUrl, 'https://example.test/replay');
});

test('a failure Kane blames on itself is inconclusive, not a failure', () => {
  assert.equal(normalise(kaneMisstep).status, 'inconclusive');
});

test('passed stays passed; unknown status is an error', () => {
  assert.equal(normalise({ type: 'run_end', status: 'passed' }).status, 'passed');
  assert.equal(normalise({ type: 'run_end', status: 'weird' }).status, 'error');
});

test('{locale}, {language} and {nativeLanguage} are filled', () => {
  assert.equal(fill('/{locale}/ {language} {nativeLanguage}', 'de'), '/de/ German Deutsch');
  assert.equal(fill('{language}', 'ar'), 'Arabic');
  const obj = buildObjective({ objective: 'Buy as a {language} customer.', checks: ['No raw keys in {nativeLanguage}.'] }, 'ja');
  assert.match(obj, /Japanese customer/);
  assert.match(obj, /日本語/);
});

test('the agent brief lists confirmed bugs only and says how to finish', () => {
  const cfg = { app: 'Shop', url: 'http://x/?lang={locale}', objective: 'Buy', locales: ['en', 'de', 'ja'], outDir: '/out', root: '/app', source: ['src'] };
  const results = { locales: {
    en: { status: 'passed', language: 'English' },
    de: { ...normalise(appBug), language: 'German', url: 'http://x/?lang=de', ndjson: 'runs/1/de.ndjson', screenshot: null, steps: [] },
    ja: { ...normalise(kaneMisstep), language: 'Japanese', url: 'http://x/?lang=ja', ndjson: 'runs/1/ja.ndjson', steps: [] },
  } };
  const forAgent = buildBrief(cfg, results, { forAgent: true });
  assert.match(forAgent, /## de \(German\)/);
  assert.doesNotMatch(forAgent, /## ja/);
  assert.match(forAgent, /Kane's suggested fix: Remove fixed height/);
  assert.match(forAgent, /## Your job/);
  const forHuman = buildBrief(cfg, results);
  assert.match(forHuman, /## ja \(Japanese\) — INCONCLUSIVE/);
});
