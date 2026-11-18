# Locale check — build plan

**Start:** 2026-11-18 06:55 +0800 · **Deadline:** 2026-11-27 02:29 +0800 (Thu 26 Nov 11:59 PM IST, 10:29 AM PT). It was extended from 19 Nov, per kaneclihack.sh, checked 2026-11-19 00:58. **No pushes after the deadline**: the repo freezes then.

## Checkpoints (local time, +0800)

The plan keeps the original pace for the video and submits an editable draft early. The extra week goes to a third judge check and polish, not to new scope.

| # | Checkpoint | Local time | Done |
|---|---|---|---|
| 1 | Rules read, idea locked (PITCH.md) | Wed 11-18 09:55 | [x] 07:05 |
| 2 | Runnable skeleton | Wed 11-18 13:27 | [x] 07:20 |
| 3 | Core loop end to end + judge check 1 | Thu 11-19 00:20 | [x] 08:50 |
| 4 | Judge check 2: biggest point-losses fixed | Thu 11-19 09:03 | [x] 01:20 |
| 5 | Video cut approved (silent draft 2) | Thu 11-19 20:00 | [ ] |
| 6 | Narration added, final render; user uploads to YouTube | Sat 11-21 20:00 | [ ] |
| 7 | Complete draft submitted (editable until the deadline) | Sun 11-22 22:00 | [ ] |
| 8 | Judge check 3 on the submitted version; top fixes | Tue 11-24 12:00 | [ ] |
| 9 | Feature freeze | Wed 11-25 20:00 | [ ] |
| 10 | All links checked in a private window | Fri 11-27 00:44 | [ ] |
| 11 | Final submit + confirmation captured | Fri 11-27 01:59 | [ ] |
| 12 | Official deadline (no pushes after this) | Fri 11-27 02:29 | [ ] |

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
