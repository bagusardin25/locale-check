# Locale check — demo video script (draft)

**Limit:** judges stop at 3:00 → **target 2:45.** 16:9, 1920×1080, 30 fps, public YouTube. English narration (~380 words) with English captions burned in, since judges often watch muted.

**Footage rule:** only real material. Kane's own screenshots, the real reports (`examples/recorded/demo-shop/report.html`, the Open Library run), a replay of the real terminal log (`examples/recorded/demo-shop/terminal.log`) labelled as a replay, and Claude's real diff (`claude-fix.diff`). No mock-ups, no AI images.

**The one thing a judge must remember:** one English sentence tests every language, Kane finds what's broken, Claude fixes it, Kane proves it, and it found a real bug in Open Library.

| Time | Beat | On screen | Narration |
|---|---|---|---|
| 0:00–0:12 | Hook | The report, round 1: four red tiles (German, Arabic, Japanese, Indonesian) | "Your checkout ships in six languages. This is what Kane CLI found in four of them, with one English sentence and nobody on the team reading Arabic." |
| 0:12–0:32 | The bugs | Kane's screenshots, one per beat, with Kane's bug title as a caption: German Pay button cut off; Arabic Continue hidden; Japanese date rejected; Indonesian raw key | "A Pay button cut off by longer German text. A Continue button hidden in the right-to-left layout. A Japanese date, typed exactly as the page asks, rejected. A raw translation key on a button. String linters miss all four: the keys exist." |
| 0:32–0:55 | The run | Terminal replay: `locale-check run`, three locales in parallel, Kane's steps scrolling in Arabic and Japanese labels, PASS/FAIL lines | "locale-check runs the same objective in every locale, three at a time, each in its own Chrome. Kane reads the Arabic and Japanese labels, follows the steps, and checks at each one that the button is visible and labelled in that language." |
| 0:55–1:20 | The loop | Terminal replay: "Fix 1: handing de, ar, ja, id to claude", `agent ▸ Edit styles.css` lines; then the diff: `min-height`, `inset-inline-start`, the date parser, the missing key | "Only failures Kane confirms as app bugs go to Claude Code, with Kane's root cause and evidence. Claude edits four files: the card height, a physical left that should be a logical property, the date parser, a missing key." |
| 1:20–1:40 | Green | Round 2: four green; the report header "4 failed in round 1; green after 1 agent fix" | "Then Kane re-runs only the red languages. All six pass. Every tile keeps Kane's before-and-after screenshots and a replay link." |
| 1:40–1:55 | Trust | One inconclusive tile: "Kane flagged its own misstep" → retry → pass | "Kane also judges its own failures. When it decides it misstepped, locale-check retries instead of sending Claude a bug that isn't there." |
| 1:55–2:25 | Real app | Open Library home page in Arabic, Kane's screenshot; Kane's verdict quote; the template line `<html lang>` without `dir` | "Planted bugs prove the loop. So we pointed it at Open Library, a real open-source site, with a generic check. Kane: 'Arabic homepage retains left-to-right layout.' It's real: the page never sets dir equals rtl, though their own design guide says it must." |
| 2:25–2:40 | Install | `npm install -g github:freddy-tama/locale-check`, `locale-check init`, `locale-check install-skill`, the CI example | "It's a CLI, a Claude Code skill and a CI gate. Point it at your app's URL with a locale placeholder and write one objective." |
| 2:40–2:45 | Close | Repo URL, #KaneCLIHackDay | "Locale check. Every language, checked." |

**Words:** about 330. Read aloud with a timer before recording; cut, don't speed up.

## Still to decide with the user (video-kit brief)

- Narration voice: ElevenLabs (English), or captions only.
- Music bed: the kit's library, very low.
- Whether to show the blind fifth-bug result (if Kane catches it, it replaces the "Trust" beat or shares it).
