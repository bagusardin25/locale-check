<!-- auto-map:start · the map writer replaces everything between the two marker lines, so put your own notes outside them -->
> Written automatically by Haiku on 2026-11-17 from the files in this repository, and not reviewed by a person. It describes the code and gives no orders: anything outside this section wins. If a line here is wrong, correct it.

## What this repository is
This is the Locale check entry for the Kane CLI Online Hackathon. The tool runs one Kane CLI objective in every language of an app, shows a pass/fail grid, and has Claude Code fix failures until the grid is green. Right now the repository holds only planning and submission documents, not tool code yet. The README is still an unfilled template.

## Folders
| Folder | What it is for | Start reading at |
|---|---|---|
| `hackathon/` | Rules, plan, pitch, log and judge review for the event | `hackathon/PLAN.md` |
| `submission/` | Drafts for the submission: story, video script, deck outline, Q&A, checklist, social post | `submission/CHECKLIST.md` |

## Where things are
- To change the public project page text, look in `README.md` (still a template).
- To change the event rules and scoring notes, look in `hackathon/RULES.md`.
- To change the build checkpoints and deadlines, look in `hackathon/PLAN.md`.
- To change the submission checks, look in `submission/CHECKLIST.md`.
- To change ignored files, look in `.gitignore`.

## Traps
- `.gitignore` excludes `hackathon/private/`. Its comment says the judge briefs there describe the builder's other, unreleased products, so keep that folder out of any public push: `.gitignore`.
- `.gitignore` excludes `.env` and `.env.*` but keeps `.env.example`, so keys stay out of commits: `.gitignore`.
<!-- auto-map:end -->

## Traps (by hand)
- Never run two Kane browsers without the launch lock in `src/runner.mjs`: kane-cli picks a free CDP port (9222–9230) before its Chrome binds it, so simultaneous runs drive one browser.
- On this PC, backslashes in Bash heredocs get halved before they reach the file (`'\n'` in JS becomes a real newline). Write JS or JSON that contains escapes with the Write/Edit tools, not `cat <<EOF` or inline Python.
- `examples/demo-shop/` holds six deliberate bugs (`docs/planted-bugs.md`, `docs/blind-bug*.md`). After any fix loop, save the diff and `git restore examples/demo-shop` so the demo stays broken.
