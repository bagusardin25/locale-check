# Locale check: submission checklist

**Official deadline:** Thu 19 Nov 2026, 11:59 PM IST. **Local deadline:** Fri 20 Nov 2026, 02:29 (+0800).
**Form:** kaneclihack.sh/o/submit. **Team:** solo (with Claude Code).

`[x]` done and checked · `[ ]` open · **(you)** = only the entrant can do it.

## Timeline (+0800, from hackathon/PLAN.md)

| Checkpoint | Local time | Done |
|---|---|---|
| Judge check 2, biggest point losses fixed | Thu 19 Nov 09:03 | [ ] |
| Feature freeze (bug fixes only after this) | Thu 19 Nov 15:35 | [ ] |
| Video rendered and uploaded to YouTube | Thu 19 Nov 19:56 | [ ] |
| Complete draft submitted (editable until the deadline) | Thu 19 Nov 22:07 | [ ] |
| Every link checked in a private window | Fri 20 Nov 00:44 | [ ] |
| Final submit, confirmation captured | Fri 20 Nov 01:59 | [ ] |

## Registration and posts (you)

- [ ] testmuai.com sign-up with the same email as the Kane CLI login **(you)**
- [ ] Registered at kaneclihack.sh/o/register **(you)**
- [ ] Registered on Luma **(you)**
- [ ] At least 2 public launch posts (HN, X, Reddit or LinkedIn), each ending with #KaneCLIHackDay. Drafts are in `submission/SOCIAL_POST.md` **(you)**

## Rules and gates (hackathon/RULES.md)

- [x] New-work rule: the repo was started on 18 Nov 2026, inside the event window (first commit is in `git log`). No code was copied from older projects.
- [x] Gate 1, works end to end: `locale-check run` and `loop` ran on the demo shop. The recorded run is in `examples/recorded/demo-shop/`.
- [x] Gate 2, Kane proved something meaningful:
  - It found the 4 planted bugs.
  - In blind tests it caught 1 of the 2 bugs it wasn't told about.
  - It found a real right-to-left bug on Open Library, recorded but not yet reported upstream.
- [x] Gate 3, the agent and Kane talked: Kane's confirmed failures went to Claude Code, Claude edited 4 files, and Kane re-ran only the red languages, which then passed (round 2 in `examples/recorded/demo-shop/results.json`).
- [x] Required technology (Kane CLI) runs in every locale, and its verdict drives the loop.
- [x] English throughout. The video has English captions burned in.

## Video

- [ ] Under 3:00 (target 2:45): actual length: ____
- [ ] Public on YouTube, HD processing finished **(you upload)**
- [ ] Plays in a private window, logged out
- [ ] Shows only what the tool really did. Replays are labelled REPLAY, the demo shop is labelled DEMO, and the blind-test miss is shown.
- [ ] Captions burned in. Music: Kevin MacLeod, "Screen Saver" (CC BY 4.0), with the credit line in the YouTube description. UI sounds: Kenney (CC0).
- [ ] The link is in `README.md` (line 7), `submission/DEVPOST_STORY.md` and the landing page's hero button.

## Form (submission/DEVPOST_STORY.md)

- [x] Name: Locale check
- [x] Tagline (120 characters)
- [x] "About your app" paragraph: what it is, who it's for, which agent, what Kane does
- [x] Links: the repo, the Pages site, the recorded report, and the one-command run
- [ ] Video link added
- [x] No pitch deck: the event is online and the rules ask for none. The old deck template was deleted; get it back from git history if the form asks for slides.
- [ ] Every number re-checked against `hackathon/LOG.md` and `examples/recorded/*/results.json` just before submitting
- [ ] Submitted, with a screenshot of the confirmation saved **(you)**

## Repository (github.com/freddy-tama/locale-check)

- [x] Public. The README covers what it does, the 30-second no-account path, the run steps, how Kane and Claude are used, honest limits, and the repo map.
- [x] LICENSE file present
- [x] No secrets: `.env` and `.env.*` are gitignored and `.env.example` is kept. Commits use the GitHub noreply address.
- [x] `hackathon/private/` is gitignored (it holds the judge briefs about other, unreleased products). The rest of `hackathon/` (plan, log, rules, research) is public on purpose, as build evidence.
- [x] `npm test`: 5 tests pass (the last full check was in the build session, 18 Nov)
- [ ] Re-run `npm test` from a clean clone after feature freeze
- [ ] Optional: tag the submitted commit (`git tag submission`). Pushing a tag needs your word.

## No-account demo

- [x] Pages: https://freddy-tama.github.io/locale-check/ (landing page plus the recorded reports)
- [ ] Kane replay links (`testUrl` in `examples/recorded/*/results.json`) open without a login in a private window. If they don't, say so in the README.
- [x] Demo data is labelled: the demo shop's bugs are planted on purpose (`docs/planted-bugs.md`), and recorded runs say "Recorded run" with the date.

## After submitting

- [ ] No breaking pushes to `main` or Pages during judging; further work goes on a branch
- [ ] Watch email and Discord for judge questions, and answer from `submission/JUDGE_QA.md`
- [ ] Open Library: file the issue (`hackathon/oss/openlibrary/ISSUE.md`) only on your word
