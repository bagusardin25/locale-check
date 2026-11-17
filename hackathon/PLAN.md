# Locale check — build plan

**Lane:** standard · **Start:** 2026-11-18 06:55 +0800 · **Deadline:** 2026-11-20 02:29 +0800

## Checkpoints

Times are in this computer's local time (中国标准时间 +0800).

| # | Checkpoint | Local time | From start | Before deadline | Done |
|---|---|---|---|---|---|
| 1 | Rules read, idea locked (PITCH.md) | Wed 2026-11-18 09:55 | 3h 00m | 1d 16h | [ ] |
| 2 | Skeleton deployed (with permission) or runnable | Wed 2026-11-18 13:27 | 6h 32m | 1d 13h | [ ] |
| 3 | Core loop works end to end + judge check 1 | Thu 2026-11-19 00:20 | 17h 26m | 1d 2h | [ ] |
| 4 | Judge check 2: biggest point-losses fixed | Thu 2026-11-19 09:03 | 1d 2h | 17h 26m | [ ] |
| 5 | Feature freeze | Thu 2026-11-19 15:35 | 1d 8h | 10h 54m | [ ] |
| 6 | Video recorded | Thu 2026-11-19 19:56 | 1d 13h | 6h 32m | [ ] |
| 7 | Complete draft submitted | Thu 2026-11-19 22:07 | 1d 15h | 4h 21m | [ ] |
| 8 | All links checked in a private window | Fri 2026-11-20 00:44 | 1d 17h | 1h 45m | [ ] |
| 9 | Final submit + confirmation captured | Fri 2026-11-20 01:59 | 1d 19h | 30m | [ ] |
| 10 | Official deadline | Fri 2026-11-20 02:29 | 1d 19h | 0m | [ ] |

> Guide: `scripts/init_project.py --deadline` fills the table above. If a checkpoint slips, cut scope (see the cut ladder); never cut the video or submission time.

## Scope

- **Must:** the core loop end to end, the required tech in the loop, deployed or runnable, video, submission form
- **Should:** {{...}}
- **Could:** {{...}}

## Cut ladder (cut from the top when behind)

1. {{nice-to-have screens}}
2. {{secondary integrations}}
3. {{second scenario / persona}}
4. {{polish beyond the 3 demo screens}}

Never cut: the core loop, honest data labels, the video, the submission.

## Stack and hosting

- {{framework, AI provider, database, hosting. Prefer what the team and the agent know best, plus whatever the rules require}}
- Deploy target: {{e.g. Vercel / Netlify / Cloudflare Pages / Render / Hugging Face Spaces}}. Skeleton deployed by the first checkpoint, with permission.

## Roles (teams)

| Person | Owns | First deliverable |
|---|---|---|
| {{...}} | {{...}} | {{...}} |
