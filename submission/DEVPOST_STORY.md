# Locale check — submission text

Draft for the form at kaneclihack.sh/o/submit. Numbers checked against `hackathon/LOG.md` on 2026-11-18; re-check before submitting.

## Project name

Locale check

## Tagline

One plain-English Kane test in every language your app ships; Claude Code fixes what breaks, Kane re-checks until green.

## About your app

Locale check runs one plain-English Kane CLI objective in every language a web app ships and shows a red/green grid, with Kane's screenshot, root cause and step-by-step replay for each language. It is for developers who ship translations they can't read: string linters check that keys exist, but not that the German label pushes the Pay button out of its card, that an Arabic layout hides Continue, or that the date format the page asks for is then rejected. The agent is Claude Code: locale-check hands it only the failures Kane confirmed as app bugs, with Kane's evidence; Claude edits the code, and Kane re-runs only the red languages until everything passes. Kane does the browsing and the judging: it drives a real Chrome through the flow in Arabic, Japanese or German, checks at each step that buttons are visible and labels are translated, and triages its own failures, so its own missteps and a site's bot checks are never reported as app bugs. On our six-language demo shop it caught four planted locale bugs and Claude fixed them in one round; on Open Library (Internet Archive) it found that the Arabic interface is served left-to-right.

## Links

- Repo: https://github.com/freddy-tama/locale-check
- Video: _YouTube link after upload_
- Live / no-account view: _GitHub Pages link if enabled_, otherwise `examples/recorded/demo-shop/report.html` in the repo
- One-command run: `node bin/locale-check.mjs run` (needs a Kane CLI login and credits; the recorded run needs nothing)

## How we built it (if the form asks)

- Node 18+, no npm dependencies. `kane-cli run --agent` per locale, NDJSON parsed live; Kane's evidence pack (a zip) read for the screenshot.
- Three locales in parallel, each with a throwaway Chrome profile and a launch gate, because kane-cli picks a free debugging port before its Chrome binds it.
- Kane's own triage (`verdict.family`: application_issue vs automation_bug) decides what reaches the agent.
- Claude Code runs as `claude -p` with file tools only and project settings only; locale-check records the files it changed.
- Ships as a CLI, a Claude Code skill (`locale-check install-skill`) and a CI workflow example.

## Challenges

- Parallel Kane runs drove each other's browser until each got its own profile and a launch gate.
- Chrome refused a Windows 8.3 short temp path as its profile folder (exit code 21).
- Objective wording: global or negatively worded checks gave false failures; numbered steps with a positive check at the step where it applies worked.
- A live public site started showing a human-verification page after about ten runs; we cut the check to its home page, one language at a time, and never bypass such checks.

## What's next

Run the CI gate on real pull requests, a pseudo-locale mode for apps that have not been translated yet, and mobile viewports per locale.
