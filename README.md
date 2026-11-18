# Locale check

**One plain-English test, every language your app ships. Kane CLI finds what breaks in German, Arabic or Japanese; Claude Code fixes it; Kane re-checks until the grid is green.**

<!-- HERO: screenshot of the report, red → green -->

Built for the **Kane CLI Online Hackathon** (TestMu AI, Nov 2026) · **Video:** _TODO_ · **Recorded report (no account needed):** [`examples/recorded/`](examples/recorded/)

## The problem

Translations ship in batches, and nobody on the team reads all of them. String linters check that keys exist. They don't notice that the German "Zahlungspflichtig bestellen" pushes the Pay button out of its card, that an Arabic layout puts a help bubble on top of Continue, that the Japanese date format the page asks for is then rejected, or that a raw key like `checkout.continue_to_payment` is on a button. Users find these, usually at checkout.

## What it does

`locale-check run` runs **one** Kane CLI objective in every locale of your app, in a real Chrome, a few at a time, and writes a one-file report: one tile per language, red or green, with Kane's screenshot, its root cause and fix suggestion, and a link to its step-by-step replay.

`locale-check loop` closes the loop: the failures Kane **confirmed as app bugs** go to Claude Code with Kane's evidence, Claude edits the code, and Kane re-runs **only the red languages**, until everything passes.

```
locale-check.json ──► Kane CLI × locale (en de ar ja id zh) ──► results.json + report.html
        ▲                                                            │ red locales, Kane's verdict,
        │                                                            ▼ NDJSON + screenshot
        └──────── Kane re-runs only red locales ◄──── Claude Code fixes the app (claude -p)
```

## Try it

**In 30 seconds, no account:** open [`examples/recorded/report.html`](examples/recorded/report.html). It is a real recorded run on the demo shop (round 1 red, Claude's fix, round 2 green), with links to Kane's replays.

**Run it yourself** (needs Node 18+, Python for the static server, and a Kane CLI login with credits):

```bash
npm install -g @testmuai/kane-cli && kane-cli login
git clone https://github.com/freddy-tama/locale-check && cd locale-check
python -m http.server 8765 --bind 127.0.0.1          # serves the demo shop (leave running)
node bin/locale-check.mjs run                         # Kane in 6 languages → locale-check-report.html
node bin/locale-check.mjs loop --resume               # Claude Code fixes the red ones, Kane re-checks
git restore examples/demo-shop                        # put the planted bugs back
```

**Use it on your app:**

```bash
npm install -g github:freddy-tama/locale-check
locale-check init            # writes locale-check.json: url with {locale}, locales, objective
locale-check run
locale-check install-skill   # Claude Code skill: "check the locales" → run, fix, re-run until green
```

## The demo shop and what Kane found

`examples/demo-shop/` is a small ceramics store in six languages with **four planted bugs**, each in one language, each the kind of thing a real team ships. They are documented in [`docs/planted-bugs.md`](docs/planted-bugs.md) and are not marked in the code.

| Locale | Planted bug | What Kane reported (its own words, round 3) |
|---|---|---|
| de | Pay card has a fixed height sized for English | "The Place order button … is cut off by its card" |
| ar | Help pill uses `left:` instead of a logical property; in RTL it covers Continue | "The shipping form's Continue button is not available in the visible, unobstructed area" |
| ja | Date parser reads every `a/b/c` as US MM/DD/YYYY | "The delivery form rejected a date written in the exact YYYY/MM/DD format it tells customers to use" |
| id | One missing translation key | "The delivery checkout button shows a code-like label instead of Indonesian text" |
| en, zh | none | pass |

## A real bug in a real app

_TODO: the open-source finding._

## How it works

- **One objective, many locales.** `locale-check.json` holds a URL with `{locale}`, the locale list and an objective written as numbered steps. `{language}` in the objective becomes the language name, so Kane fills a German address for German.
- **Kane CLI does the browsing and the judging.** Each locale is `kane-cli run "<objective>" --url <url> --agent --headless`. Kane reads Arabic and Japanese labels, follows the steps, and checks visibility at each step. Assertions are DOM-based with a vision fallback.
- **Trust what Kane trusts.** On a failure Kane triages itself in `run_end.verdict`: `application_issue` (confirmed app bug) or `automation_bug` (its own misstep). locale-check shows the second as **inconclusive**, retries it once, and never sends it to the agent as a bug.
- **Parallel and isolated.** Three locales run at once, each with its own throwaway Chrome profile. The next run starts only after the previous one's browser is up, because kane-cli picks a free debugging port before Chrome binds it.
- **The loop.** `locale-check failures --agent` prints the brief Claude gets: per red locale, Kane's bug title, root cause, suggested fix, last steps, and paths to the NDJSON and screenshot. `loop` pipes it to `claude -p` (file edits only, no shell), records which files changed, and re-runs only the red locales.
- **CI gate.** [`examples/ci/locale-check.yml`](examples/ci/locale-check.yml) fails a pull request while any locale is red (exit code 1) and uploads the report. Written for this project; not yet run in GitHub Actions.

## Honest limits

- Kane needs a TestMu AI login and credits. The 5-step checkout cost about 45–60 credits and 1.5–3.5 minutes per locale; a 6-locale round is about 280 credits and 7 minutes.
- Kane's verdicts are AI judgements. Two of the first twelve shop runs failed for Kane's own reasons; Kane labelled both as its own misstep, which is why locale-check retries those instead of reporting them as bugs.
- Local Kane runs record step screenshots and an online replay, not a video file.
- Wording matters: positive checks placed at the step where they apply ("Verify that the Continue button is fully visible and no other element overlaps it, then click it") worked; global or negative wording produced false failures.

## Repo map

| Path | What |
|---|---|
| `bin/locale-check.mjs` | CLI entry |
| `src/` | Kane runner, results, report, agent loop, zip reader for Kane evidence packs |
| `skill/locale-check/` | Claude Code skill |
| `examples/demo-shop/` | Six-language demo store with planted bugs |
| `examples/recorded/` | A recorded run for judges without a Kane account |
| `lab/kane-language-test/` | The first-hour test: Arabic, Japanese and a clipped German button |
| `hackathon/` | Plan, rules, log of every cycle with evidence |

MIT licence.
