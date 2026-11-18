---
name: locale-check
description: Check every language of a web app in a real browser with Kane CLI, then fix what breaks. Use when the user changes translations, i18n or locale files, RTL styles, date or number formatting, or checkout/form UI in a multilingual app, or asks to "check the locales", "test all languages", "run locale-check", or make the locale grid green. Do not say such work is done while any locale is red.
---

# Locale check

`locale-check` runs one plain-English Kane CLI objective in every language of the app and writes a red/green report. Kane drives a real Chrome, so it catches what string linters miss: a button cut off by longer German text, an RTL layout that hides a button in Arabic, a date format the page asks for but then rejects, a raw translation key on screen.

You are the fixer in the loop: Kane finds and explains, you fix, Kane re-checks only the red languages.

## 1. Set up (once per project)

- `locale-check doctor` must show kane-cli and credits. If kane-cli is missing: `npm install -g @testmuai/kane-cli`, then ask the user to run `kane-cli login` themselves (it opens a browser sign-in).
- If there is no `locale-check.json` in the project root, run `locale-check init` and fill it in from the project's own i18n setup:
  - `url`: the app URL with `{locale}` where the language goes (`http://localhost:3000/{locale}/` or `...?lang={locale}`).
  - `locales`: the language codes the app ships.
  - `objective`: numbered steps of the user flow that matters most (usually sign-up or checkout), with a check at each step. Write checks positively ("Verify that the Continue button is fully visible and no other element overlaps it, then click it"), and put each check at the step where it applies. `{language}` becomes the language name.
  - `source`: the folders that hold the app's UI code and translation files.
- The app must be running at that URL before a run.

## 2. Run

```bash
locale-check run
```

Kane runs three languages at a time; each takes one to three minutes and roughly 20–60 Kane credits. The command exits 0 when every locale passes and 1 otherwise, and writes `locale-check-report.html`.

## 3. Fix the red ones

```bash
locale-check failures --agent
```

This prints, for each failing locale, Kane's bug title, root cause, suggested fix, the step that failed, and paths to the NDJSON log and screenshot. Then:

1. Fix the root cause in the app, the way a careful developer would: layout CSS (logical properties for RTL, no fixed heights around translated text), translation files (missing keys), parsing and validation (use the locale's own format). Make the fix hold for every language, not only the red one.
2. Do not edit `locale-check.json`, weaken the objective, or remove the thing Kane is testing.
3. Re-check only the red languages:

```bash
locale-check run --failed
```

4. Repeat until green, at most three rounds. If a locale is still red after three, stop and tell the user what Kane says and what you tried.

**Statuses:** `failed` means Kane confirmed an app bug: fix it. `inconclusive` means Kane flagged its own misstep, not an app bug; locale-check already retried once. Run `locale-check run --failed` again rather than changing code. `error` means kane-cli itself failed (login, credits, the app not running).

## 4. Hands-off option

`locale-check loop` does steps 2–3 by itself: it runs Kane, pipes the failure brief to `claude -p` (edits allowed, no shell), and re-runs the red languages until green or `--max-rounds`.

## 5. Report back

Tell the user how many locales pass, what you changed per locale (file and one line), and the report path. Mention the Kane replay links for anything still red.
