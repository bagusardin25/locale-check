# Locale check: judge Q&A prep

Every answer here rests on a file in this repo. Judges probe the weakest claim first, so the weak spots are listed at the end.

| # | Likely question | Our answer (facts only) | Evidence to show |
|---|---|---|---|
| 1 | What exactly did you build during the hackathon, and what existed before? | Everything in this repo was built from 18 Nov 2026, 06:51 +0800 (the first commit):<br>• the CLI<br>• the six-language demo shop and its planted bugs<br>• the Claude Code skill and the CI example<br>• the recorded runs and the landing page<br>Kane CLI, Claude Code and Node existed before. No code came from older projects. | `git log`, `hackathon/LOG.md` |
| 2 | What does the AI actually do? What happens when it's wrong? | **Kane** drives a real Chrome through the flow in each language, checks each step, and triages its own failures.<br>**Claude Code** edits the app, and only for failures Kane marked as confirmed app bugs.<br>**When Kane is wrong:** if it labels a failure as its own misstep, locale-check calls it inconclusive, retries once, and never sends it to Claude. Kane did this on 3 of its first 12 shop runs.<br>**When Claude is wrong:** Kane re-runs the red languages, so a bad fix stays red. The loop stops after 3 rounds by default. Claude's edits are never committed, so a person reviews the diff. | `src/loop.mjs`, `examples/recorded/demo-shop/terminal.log` line 112, README "Honest limits" |
| 3 | Is the data real? | **The demo shop** is ours, and its six bugs are planted on purpose and documented (`docs/planted-bugs.md`, `docs/blind-bug*.md`).<br>**The recorded runs** are real Kane output from 18 Nov: verdicts, screenshots and replay links. Nothing re-runs when you open them.<br>**Open Library** is a real public site, tested as it is. | `examples/recorded/*/results.json` (`recorded` field), `docs/planted-bugs.md` |
| 4 | How is this different from Playwright tests, string linters or pseudo-localisation? | **String linters** check that keys exist. Three of our four bugs had every key: a clipped button, an RTL overlap and a date parser.<br>**Playwright** needs selectors and expected text for every language.<br>**Here** you write one English objective. Kane reads each language's own labels, so adding a language costs a config line, not a test. | README "The problem", `locale-check.json` |
| 5 | Who is the user? Did you talk to any? | Developers who ship translations they can't read, often from translation services or AI. We have **not** interviewed users yet. The next step is the CI gate on real pull requests in an open-source multilingual project. | `submission/DEVPOST_STORY.md` "What's next" |
| 6 | What was the hardest technical problem? | **Parallel runs:** Kane runs started in parallel drove each other's Chrome, because kane-cli picks a free debugging port before its Chrome binds it. The fix is a throwaway profile per run plus a launch gate.<br>**Wording:** global or negative checks gave false failures. Numbered steps, each with a positive check at the step it applies to, fixed that. | `hackathon/LOG.md` Cycle 2, `src/runner.mjs` |
| 7 | Why did you need Kane CLI? | Without Kane you'd write per-language selectors and assertions, and nobody could judge an Arabic or Japanese page they can't read.<br>Kane reads the labels, decides whether the button is really visible, writes the bug title and root cause Claude acts on, and separates its own missteps from app bugs. That triage is what keeps false bugs away from the agent. | `examples/recorded/demo-shop/results.json` (`bugTitle`, `rootCause`, `reasonCode`) |
| 8 | Does it scale? What does it cost? | **Per locale** (5-step checkout): about 45–60 Kane credits and 1.5–3.5 min.<br>**Per round:** six locales take about 280 credits and 7 min, three at a time.<br>**The recorded loop:** Kane reported 510.5 credits for round 1, the fix and round 2, while the account balance dropped 589.<br>**Claude's fix:** 54 s.<br>**Scaling:** add languages through concurrency. Re-runs touch only the red languages. | README "Honest limits", `results.json` `rounds[].credits` |
| 9 | Privacy, safety, misuse? | Kane uses throwaway Chrome profiles and made-up test customer details.<br>Claude runs with file tools only (Read, Edit, Write, Glob, Grep), with project settings only, and nothing is committed for you.<br>When Open Library showed a human-verification page, we stopped and cut the check down. We never bypass bot checks. | `src/loop.mjs:97`, README Open Library section |
| 10 | What's next? | **Next features:** run the CI gate on real pull requests, add a pseudo-locale mode for apps not translated yet, and test mobile viewports per language.<br>**Open Library:** report the RTL bug upstream (the draft issue and patch are ready). | `submission/DEVPOST_STORY.md`, `hackathon/oss/openlibrary/` |
| 11 | Isn't the objective written around your planted bugs? | Yes for the first one, so we ran blind tests:<br>• another agent planted bugs we didn't know about, against a generic objective committed beforehand<br>• v1 caught 3 of 5<br>• v2 caught the blind German template-key bug but missed ¥2,000 shipping on a ¥198 mug<br>So Kane caught **1 of 2 blind bugs**. It is strong on layout, text and validation, and weak on "does this number make sense". | README "Isn't the objective tailored to the bugs?", `examples/recorded/blind-test-v*/` |
| 12 | Is the Open Library bug real and unknown? | Kane's verdict was "Arabic homepage retains left-to-right layout". The page source agrees: `<html lang="ar">` with no `dir`, from `base.html.jinja:6`. Their own design guide says Arabic layouts must mirror under `dir="rtl"`. We found no existing report. We haven't filed it yet. | README "A real bug in a real app", `hackathon/oss/openlibrary/ISSUE.md` |

## Weak spots we know about

- **1 of 2 blind bugs.**
  - Framing: this is the honest number, and we show it in the video.
  - Kane checks what the objective asks. The miss tells users to write concrete checks ("shipping costs less than the item").
  - We stopped at v2 on purpose, because tuning after the fact would be cheating.
- **The Open Library comparison run is missing.**
  - The planned evidence was English and German passing beside Arabic. The site became unreachable from this machine (a TLS reset), after a human-verification page.
  - The finding rests on the first run's screenshot and log, and on the page source.
- **The CI example has never run in GitHub Actions.**
  - It says so in the file and in the README.
  - The local CLI it calls is what ran.
- **Kane needs a login and credits.**
  - The recorded runs and the Pages site let judges see everything with no account.
  - The replay links have to open without a login. Check them in a private window before submitting.
- **The AI verdicts can be wrong.** Kane's own triage caught all three of its false failures. We show this in the video rather than hide it.
