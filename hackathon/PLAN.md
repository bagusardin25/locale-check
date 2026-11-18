# Locale check — build plan

**Start:** 2026-11-18 06:55 +0800 · **Deadline:** 2026-11-20 02:29 +0800 (19 Nov 11:59 PM IST)

## Checkpoints (local time, +0800)

| # | Checkpoint | Local time | Done |
|---|---|---|---|
| 1 | Rules read, idea locked (PITCH.md) | Wed 11-18 09:55 | [x] 07:05 |
| 2 | Runnable skeleton | Wed 11-18 13:27 | [x] 07:20 |
| 3 | Core loop end to end + judge check 1 | Thu 11-19 00:20 | [x] 08:50 |
| 4 | Judge check 2: biggest point-losses fixed | Thu 11-19 09:03 | [x] 01:20 |
| 5 | Feature freeze | Thu 11-19 15:35 | [ ] |
| 6 | Video recorded | Thu 11-19 19:56 | [ ] |
| 7 | Complete draft submitted | Thu 11-19 22:07 | [ ] |
| 8 | All links checked in a private window | Fri 11-20 00:44 | [ ] |
| 9 | Final submit + confirmation captured | Fri 11-20 01:59 | [ ] |
| 10 | Official deadline | Fri 11-20 02:29 | [ ] |

## Scope

- **Must:** CLI + report, demo shop loop red → green, recorded run for judges, real OSS bug, video under 3:00, submission.
- **Should:** generic objective proven on a bug its author didn't know about; agent-built locale verified by Kane; GitHub Pages live URL; Open Library issue filed (user's word).
- **Could:** CI workflow run on the public repo; Stop-hook gate in the skill.

## Cut ladder (cut from the top when behind)

1. CI workflow live run
2. Agent-built Hebrew locale loop
3. Second OSS app
4. Report polish beyond what the video shows

Never cut: the loop, honest labels, the video, the submission.

## Stack

Node 18+ (no npm dependencies), Kane CLI 0.10.4, Claude Code (`claude -p`) as the fixing agent, static demo shop served by `python -m http.server`.
