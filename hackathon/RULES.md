# Kane CLI Online Hackathon — rules and scoring function

- **Event:** Kane CLI Online Hackathon by TestMu AI, 12–26 Nov 2026 (extended from 19 Nov) · kaneclihack.sh · rules taken from the planning session's reading of the event pages (HANDOFF §1), 2026-11-18.
- **Deadline:** Thu 26 Nov 2026 11:59 PM IST (10:29 AM PT) → local **Fri 2026-11-27 02:29 +0800**. Extended from 19 Nov, per kaneclihack.sh, checked 2026-11-19 00:58 +0800. The page says "No pushes after this".
- **Format:** online · **Team:** solo (the user, with Claude Code).
- **Theme:** build something where a coding agent and Kane CLI work together.

## Gates (checked first; miss one and nothing else is scored)

1. The app works end to end.
2. Kane caught or proved something meaningful. Installing it, or one trivial flow added at the end, does not count.
3. The agent and Kane talked: agent output triggered a Kane run, or a Kane result made the agent act.

## Judging (the scoring function)

| Criterion | Weight | What they ask | Our proof — what a judge will see |
|---|---|---|---|
| Ships | 25% | A real flow that runs end to end, not slides | `npx`-style one command runs Kane in six languages on the demo shop and writes the grid; a recorded run for judges without a Kane login |
| Verified | 25% | Kane caught or confirmed something meaningful | Kane fails four planted locale bugs (clipped German Pay button, Arabic RTL step, rejected local date, raw key) and one real, unplanted bug in an open-source multilingual app |
| Closed loop | 25% | The agent built, Kane verified, the result went back to the agent; tighter is better | Claude Code skill: Kane's failure summary and NDJSON go to Claude, Claude edits the code, Kane re-runs only the red languages, until green |
| Craft | 25% | "Did you reach for something interesting? Does this feel like a thing a developer would want to install tonight?" | Nobody else in ~60 entries tests locales; installs as a Claude Code skill and a CI gate; one-file grid |

- **Tie-break:** Verified, then Closed loop.
- **Do judges have to run it?** They want to see it working within 30 s: live URL or one-command run. Kane needs a login and credits, so ship a recorded run (results JSON + grid + replay links) that opens with no account.
- **Judges:** three TestMu engineers, averaged.

## Must-haves

- [ ] Required technology: Kane CLI, run by the tool for every language; its verdict drives the agent loop.
- [ ] Public GitHub repo with README (repo started 2026-11-18, inside the event window).
- [ ] YouTube demo video, **under 3:00** (judges stop at 3:00).
- [ ] "About your app" paragraph: what it is, who it's for, which agent, what Kane does.
- [ ] Live URL or one-command run.
- [ ] 2+ public launch posts (HN, X, Reddit or LinkedIn) ending with #KaneCLIHackDay.
- [ ] Fallback for login or paid services: recorded run.
- [ ] New-work rule: old idea fine, old codebase not. Nothing copied from older projects.
- [ ] Registration: testmuai.com signup (same email as the Kane login), kaneclihack.sh/o/register, Luma. **User does these.**

## Prizes

| Prize | Extra |
|---|---|
| $1,500 / $1,000 / $500 | each with $250 OpenAI credits, 1:1 with founders, 3 months Kane Pro, blog post |

## Assumptions and open questions

- Video length: Luma says 3 min or less, the site says 3–5 min. Safe choice: under 3:00.
- "Kane replay" links (Test Manager share pages) are assumed to open without a login. Check in a private window before submitting.
