// Loads locale-check.json and fills in defaults.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const CONFIG_NAME = 'locale-check.json';

export const DEFAULTS = {
  concurrency: 3,
  outDir: '.locale-check',
  report: 'locale-check-report.html',
  kane: { headless: true, maxSteps: 50, timeout: 600, assertionMode: 'dom' },
  agent: { command: 'claude', maxRounds: 3 },
};

export function loadConfig(path) {
  const file = resolve(path || CONFIG_NAME);
  if (!existsSync(file)) {
    throw new UsageError(`No ${CONFIG_NAME} found at ${file}. Run \`locale-check init\` to create one.`);
  }
  let raw;
  try { raw = JSON.parse(readFileSync(file, 'utf8')); } catch (e) {
    throw new UsageError(`${file} is not valid JSON: ${e.message}`);
  }
  const cfg = {
    ...DEFAULTS, ...raw,
    kane: { ...DEFAULTS.kane, ...(raw.kane || {}) },
    agent: { ...DEFAULTS.agent, ...(raw.agent || {}) },
  };
  for (const key of ['url', 'objective']) {
    if (typeof cfg[key] !== 'string' || !cfg[key].trim()) throw new UsageError(`${CONFIG_NAME}: "${key}" is required`);
  }
  if (!cfg.url.includes('{locale}')) throw new UsageError(`${CONFIG_NAME}: "url" must contain {locale}, e.g. https://example.com/{locale}/checkout`);
  if (!Array.isArray(cfg.locales) || !cfg.locales.length) throw new UsageError(`${CONFIG_NAME}: "locales" must be a non-empty array`);
  cfg.root = dirname(file);
  cfg.outDir = resolve(cfg.root, cfg.outDir);
  cfg.report = resolve(cfg.root, cfg.report);
  return cfg;
}

export function languageName(code, inLocale = 'en') {
  try { return new Intl.DisplayNames([inLocale], { type: 'language' }).of(code) || code; } catch { return code; }
}

/** Fill {locale}, {language} (English name) and {nativeLanguage} in a template string. */
export function fill(template, locale) {
  return template
    .replaceAll('{locale}', locale)
    .replaceAll('{language}', languageName(locale))
    .replaceAll('{nativeLanguage}', languageName(locale, locale));
}

export function buildObjective(cfg, locale) {
  const parts = [fill(cfg.objective, locale)];
  if (Array.isArray(cfg.checks) && cfg.checks.length) {
    parts.push('Throughout the whole flow, also check: ' + cfg.checks.map((c) => fill(c, locale)).join(' '));
  }
  return parts.join('\n');
}

export class UsageError extends Error {}

export const STARTER = {
  app: 'My app',
  url: 'http://localhost:3000/{locale}/',
  locales: ['en', 'de', 'ar', 'ja'],
  objective: [
    '1. Open any product, add it to the cart, open the cart and start checkout.',
    "2. On each checkout step, fill in realistic test details for a customer in a {language}-speaking country. Before you click the step's main button, verify that it is fully visible, that no other element overlaps it, and that its label is written in {language} words rather than a code-like key with dots. Then click it.",
    '3. Verify that the order confirmation appears.',
    'If a verification fails, fail the test at that step.',
  ].join('\n'),
  concurrency: 3,
};
