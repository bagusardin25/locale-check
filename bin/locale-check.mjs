#!/usr/bin/env node
// locale-check: run one Kane CLI objective in every language of your app, see a red/green grid,
// and let a coding agent fix the red ones while Kane re-checks them.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { CONFIG_NAME, STARTER, UsageError, loadConfig } from '../src/config.mjs';
import { runRound } from '../src/runner.mjs';
import { closedLoop } from '../src/loop.mjs';
import { buildBrief } from '../src/brief.mjs';
import { failing, loadResults, tally } from '../src/results.mjs';
import { writeReport } from '../src/grid.mjs';
import { kaneAvailable, kaneBalance } from '../src/kane.mjs';
import { c } from '../src/term.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const VERSION = '0.1.0';

const HELP = `locale-check ${VERSION}: one Kane CLI objective, every language, red/green grid.

Usage
  locale-check run [--only de,ar] [--failed]   Run Kane in each locale; write results + report
  locale-check loop [--max-rounds 3]            Run, hand failures to a coding agent (Claude Code
                                                by default), re-run only red locales until green
  locale-check failures [--agent]               Print the failing locales as a brief (for an agent)
  locale-check report                           Rebuild the HTML report from results.json
  locale-check status                           One line per locale from the last results
  locale-check init                             Write a starter ${CONFIG_NAME}
  locale-check install-skill [--global]         Install the Claude Code skill
  locale-check doctor                           Check kane-cli, login and credits

Options
  --config <file>        Config file (default ./${CONFIG_NAME})
  --concurrency <n>      Kane runs at a time (default 3)
  --json                 Print results JSON at the end (for agents and CI)

Exit codes: 0 all locales pass · 1 some locale fails · 2 usage or setup error.`;

function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { opts._.push(a); continue; }
    const [k, inline] = a.slice(2).split('=');
    const flag = ['failed', 'json', 'global', 'agent', 'help', 'version'].includes(k);
    opts[k] = flag ? true : inline ?? argv[++i];
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cmd = opts._[0] || (opts.version ? 'version' : 'help');
  if (opts.help || cmd === 'help') { console.log(HELP); return 0; }
  if (cmd === 'version') { console.log(VERSION); return 0; }

  if (cmd === 'init') {
    const file = resolve(opts.config || CONFIG_NAME);
    if (existsSync(file)) throw new UsageError(`${file} already exists`);
    writeFileSync(file, JSON.stringify(STARTER, null, 2) + '\n');
    console.log(`Wrote ${file}. Set "url" (with {locale}) and "locales", then run: locale-check run`);
    return 0;
  }
  if (cmd === 'install-skill') {
    const dest = opts.global ? join(homedir(), '.claude', 'skills', 'locale-check') : resolve('.claude', 'skills', 'locale-check');
    mkdirSync(dest, { recursive: true });
    cpSync(join(HERE, '..', 'skill', 'locale-check'), dest, { recursive: true });
    console.log(`Installed the Claude Code skill to ${dest}. In Claude Code, ask: "check the locales" or run /locale-check.`);
    return 0;
  }
  if (cmd === 'doctor') {
    const v = kaneAvailable();
    console.log(v ? c.green(`kane-cli ${v}`) : c.red('kane-cli not found: npm install -g @testmuai/kane-cli, then kane-cli login'));
    if (v) {
      const b = kaneBalance();
      console.log(b === null ? c.red('Could not read credits: are you logged in? (kane-cli login)') : `Kane credits: ${b}`);
    }
    return v ? 0 : 2;
  }

  const cfg = loadConfig(opts.config);
  if (opts.concurrency) cfg.concurrency = Math.max(1, Number(opts.concurrency));
  const only = opts.only ? String(opts.only).split(',').map((s) => s.trim()).filter(Boolean) : undefined;

  if (cmd === 'run' || cmd === 'loop' || cmd === 'fix') {
    if (!kaneAvailable()) throw new UsageError('kane-cli not found. Install it: npm install -g @testmuai/kane-cli, then kane-cli login');
    const results = cmd === 'run'
      ? (await runRound(cfg, { only, failedOnly: !!opts.failed })).results
      : await closedLoop(cfg, { only, failedOnly: !!opts.failed, maxRounds: opts['max-rounds'] ? Number(opts['max-rounds']) : undefined });
    return finish(cfg, results, opts);
  }
  if (cmd === 'failures') {
    console.log(buildBrief(cfg, loadResults(cfg), { forAgent: !!opts.agent }));
    return failing(cfg, loadResults(cfg)).length ? 1 : 0;
  }
  if (cmd === 'report') {
    console.log(`Report: ${writeReport(cfg, loadResults(cfg))}`);
    return 0;
  }
  if (cmd === 'status') return finish(cfg, loadResults(cfg), opts);
  throw new UsageError(`Unknown command "${cmd}". Try: locale-check help`);
}

function finish(cfg, results, opts) {
  const t = tally(cfg, results);
  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('');
    for (const l of cfg.locales) {
      const r = results.locales[l];
      const s = r?.status || 'pending';
      const mark = s === 'passed' ? c.green('✓ pass ') : s === 'failed' ? c.red('✗ fail ') : c.yellow(`? ${s.slice(0, 5)}`.padEnd(7));
      console.log(`  ${mark} ${l.padEnd(6)} ${c.dim(r?.oneLiner || r?.reason || '')}`);
    }
    console.log('');
    console.log(`${t.passed}/${cfg.locales.length} locales pass. Report: ${cfg.report}`);
  }
  return t.passed === cfg.locales.length ? 0 : 1;
}

main().then((code) => process.exit(code), (err) => {
  console.error(c.red(err instanceof UsageError ? err.message : err.stack || String(err)));
  process.exit(2);
});
