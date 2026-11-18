# Locale check: demo video script (v2)

**Length:** 2:45 (judges stop at 3:00). 16:9, 1920×1080, 30 fps, public YouTube.
**Voice:** English narration from ElevenLabs, about 285 words (about 105 words a minute with pauses), recorded only after the cut is approved.
**Captions:** the narration, burned in, because judges often watch muted.
**Footage:** real material only. That means Kane's own screenshots, the recorded reports, replays of the recorded terminal logs and Claude's real diff. Every replay carries an on-screen label. There are no mock-ups and no AI images.

**The one promise** (every shot is tested against it): *Write one test in English. Kane checks it in every language, Claude fixes what Kane confirms, and Kane proves the fix. It also works on a real site.*

## What changed from v1, and why

| Change | Why (source) |
|---|---|
| The film opens on the broken German button, not on the report or the tool | Open on the viewer's problem and the stakes, not the product (Duarte, three-act structure). Lead with the most visual thing inside 5–10 s (Ali Mattu, via NASW) |
| The shots were picked first and the words written around them | "Find the visuals first" (Joss Fong, Vox, via NASW) |
| The shape is broken, fix, green, then the limits, then the real site | Alternate "what is" and "what could be" (Duarte's Sparkline). Show what is lost if it fails (Pixar rule 16) |
| The old line "string linters miss all four" is gone | It was wrong: the Indonesian bug is a missing key, which a linter can catch. Now it says three of the four are layout and input bugs |
| The blind-test miss is in the film (¥2,000 shipping) | Credibility: Google's edited Gemini demo and Apple's withdrawn Siri ad show what happens when a demo oversells. Labels belong in the frame, not in the description |
| About 285 words instead of 330, with a 1.5 s silence before the green result | Density should rise and fall like loudness, so give a pause before the payoff (Walter Murch, Transom). Cut words, never speed up the audio (Devpost) |
| Each cut puts the new key element where the eye already is | After a cut, the eyes stay where they were (NN/g eye-tracking) |
| A callout appears exactly when the voice names it | Overlays that match the spoken line were looked at 82% of the time (NN/g) |
| Zooms only when the text would not read at full frame: a context frame, then a detail frame | The zoom must point at the evidence, and the hold starts once the text is readable (Open Design, product demo zoom) |
| The Hebrew build loop gets 7 s (beat 6b), taken from the Open Library beat | Judge check 2: it is the clearest "agent built, Kane rejected, agent fixed" proof. One line, three states, so the promise stays one promise |
| Beat 8 says "confirmed", not "found" | The missing `dir` was spotted by hand before Kane ran. Kane's generic check confirmed what readers see (judge check 2) |
| Beat 6 shows round 3 | Claude's fix touched shared files, so en and zh were re-checked on the fixed code (19 Nov, both pass) before "all six pass" is said |

Full notes and URLs: [`hackathon/research/video-craft-research.md`](../hackathon/research/video-craft-research.md) and [`hackathon/research/video-resources.md`](../hackathon/research/video-resources.md). The key sources are listed at the end.

## Beat sheet

The labels top left are persistent chips: **REPLAY** means a recorded run replayed, **DEMO** means the demo shop with planted bugs, **REAL SITE** means Open Library.

| # | Time | Beat | On screen (source file) | Camera and eye | Narration |
|---|---|---|---|---|---|
| 1 | 0:00–0:07 | Cold open | Kane's German screenshot from round 1 (`examples/recorded/demo-shop/runs/2026-11-18T00-07-48-472/de.jpg`), full frame. Chip: DEMO | Slow push toward the clipped Pay button, which ends right of centre. A thin outline draws round the button as the voice says "cut in half" | "This checkout works in English. In German, the Pay button is cut in half." |
| 2 | 0:07–0:20 | Stakes | The round-1 report grid with six tiles: en and zh green; de, ar, ja and id red (`examples/recorded/demo-shop/report.html`). Chip: REPLAY · 18 Nov | The German tile sits where the button just was, so the eye lands on it. Pull back to the whole grid. The other three red tiles pulse once each as they are counted | "Four of its six languages were broken like this. It's our demo shop, with bugs planted on purpose. Three of the four would pass any translation linter: they're layout and input bugs." |
| 3 | 0:20–0:34 | The promise | The objective's numbered steps as written in `examples/recorded/demo-shop/results.json` (objective), on a card. The `{language}` placeholder fills in as English, Deutsch, العربية, 日本語, Bahasa Indonesia and 中文, and the card fans out into six lanes | The same object changes state, so the viewer sees one test become six | "Locale check takes one test, written once in English, and runs it with Kane CLI in every language: three Chromes at a time, each in its own profile." |
| 4 | 0:34–0:58 | Kane finds | Replay of `examples/recorded/demo-shop/terminal.log`, lines 1–110, sped up and labelled "REPLAY · 10 min shown in 9 s". Zoom on Kane's real step line in Arabic, "إتمام الشراء يجري الضغط عليه". Then four context-and-detail pairs, each a Kane screenshot with Kane's bug title as the callout:<br>• "Place order button is clipped by the payment card"<br>• "Shipping Continue button is absent from the checkout form" (ar)<br>• "Delivery date rejects its own displayed YYYY/MM/DD example" (ja)<br>• "Delivery continue button displays untranslated localization key" (id) | Terminal wide, then a punch-in on the Arabic line as the voice says "Arabic". Each bug title types on as it is named. The screenshot dims everywhere except the faulty element | "Kane reads each page in its own language, the Arabic buttons and the Japanese date hint, and checks every step. It came back with four bugs, each with a title, a root cause and a screenshot." |
| 5 | 0:58–1:16 | Claude fixes | Terminal replay: "handing de, ar, ja, id to claude". Then `examples/recorded/demo-shop/claude-fix.diff` as four detail frames: `height` → `min-height`; `left` → `inset-inline-start`; the date parser; `"checkout.continue_to_payment": "Lanjut ke pembayaran"`. A small counter reads "4 files · 54 s" (round 1 `fix.seconds`) | Each diff hunk is centred where the bug title was, and the removed and added lines are highlighted red and green | "Only bugs Kane confirms go to Claude Code, with Kane's evidence. Claude changes four files in fifty-four seconds: a fixed card height, a left that should follow reading direction, the date parser, a missing translation." |
| 6 | 1:16–1:34 | Kane proves | The report's round table: round 2 marks ✓ under the four red languages, with a soft tick each. Then the round-3 row (en and zh ✓, labelled "round 3 · 19 Nov, re-check on the fixed code"). Then the header "6 of 6 languages pass" and the German before-and-after screenshots | **1.5 s of silence** (music only) before the first round-2 check. Hold on the full table for at least 2 s | "Then Kane re-runs the four red languages, and later English and Chinese too, because Claude touched shared files. All six pass. Every tile keeps Kane's before and after screenshots." |
| 6b | 1:34–1:41 | Agent builds | Hebrew build loop (`examples/recorded/hebrew-build-loop/`): the task line from `terminal.log` line 2, "Add Hebrew (he) as a seventh language", then Kane's round-1 Hebrew screenshot with its title "Shipping Continue button missing after completed address form" (✗), then the round-2 pass (✓). Chip: REPLAY · Hebrew build loop | One frame, three states: task, ✗, ✓, each where the last one was | "It works the other way round too: Claude adds Hebrew, Kane rejects it, Claude fixes it." |
| 7 | 1:41–2:03 | Honest limits | (a) Terminal line 112: "[zh] Kane flagged its own misstep, not an app bug", then "retry 1", then PASS. (b) Blind test v2: German screenshot with Kane's title "Delivery-date guidance exposes unresolved German template keys", stamped CAUGHT. Chinese screenshot with ¥2,000 shipping on a ¥198 mug, stamped MISSED (`examples/recorded/blind-test-v2/runs/2026-11-18T00-58-41-249/`). Chip: REPLAY · blind test | The two stamps sit side by side, so they are read as one fair score | "It's honest about its limits. When Kane decides it stumbled, the tool retries instead of blaming the app. In a blind test, Kane caught one of two bugs we hid from it. It missed ¥2,000 shipping on a ¥198 mug: it checks what you ask." |
| 8 | 2:03–2:24 | Real site | Open Library in Arabic: Kane's screenshot (`examples/openlibrary/.locale-check/runs/2026-11-18T00-28-42-600/ar.jpg`). Kane's verdict as a quote card: "Arabic homepage retains left-to-right layout." Then `base.html.jinja:6`, `<html lang="{{ layout.lang }}">`, with the missing `dir` marked. Then one line from their design guide: Arabic layouts "must mirror under `dir="rtl"`". Chip: REAL SITE · found 18 Nov · not yet reported | Context frame (the whole page, with the headings sitting left), then a detail frame (the `<html>` line). An arrow shows the direction the layout should take | "Then a real site: Open Library. We'd spotted a missing attribute by hand. Kane's generic check, naming no element, confirmed what readers see: Arabic homepage retains left-to-right layout. The page never sets the direction, though their own design guide says it must mirror." |
| 9 | 2:24–2:38 | Use it | Three commands typed: `npm install -g github:freddy-tama/locale-check`, `locale-check init`, `locale-check install-skill`. Then the CI file (`examples/ci/locale-check.yml`) with the label "example, not yet run in Actions" | Plain terminal, large type (at least 36 px) | "It's a CLI, a Claude Code skill and a CI gate. Give it your URL with a locale placeholder and one objective." |
| 10 | 2:38–2:45 | Close | End card: "Locale check: every language, checked.", github.com/freddy-tama/locale-check, freddy-tama.github.io/locale-check, #KaneCLIHackDay | Hold still. Music resolves | "Locale check. Every language, checked." |

Word count about 285. Before the voice is recorded, read it aloud against a timer. If a beat runs long, cut words; never speed up the audio.

**Update the chip on beat 8 before the final render** if the Open Library issue is filed (user's word only): "reported upstream" plus the issue number.

## Craft rules for this cut

- **Captions** (Netflix English style guide): at most 42 characters a line and two lines. Break after punctuation and before "and", "to" or "with". Show each for at least 5/6 s and at most 7 s, with a gap of at least 2 frames. Never let a caption run across a hard cut unless the speech does. Read at no more than 17 characters a second, below Netflix's 20, because the viewer is also reading the screen.
- **Placement:** keep everything inside the 90% graphics-safe area (EBU R95), so 96 px margins at 1920. Captions sit centred at the bottom, no wider than 68% of the frame (BBC). Move them up if they would cover the evidence.
- **Contrast:** at least 4.5:1, white captions on a band of about 80% black (WCAG 1.4.3).
- **Type size:** captions about 44 px. Terminal and diff text at least 36 px tall on screen, so zoom until it is.
- **Motion:** every move points at the evidence, and the hold starts only once the text is readable. Never zoom out before a verdict has been read. Use one easing curve throughout.
- **Cuts:** cut when a thought ends (Murch). Emotion and story come before rhythm. Put the next shot's key element where the last shot's focus was (NN/g).
- **Sound:** the voice, one quiet music bed, and soft ticks on tile flips, and nothing else (Murch's limit of about two and a half layers). The music sits about 20 dB under the voice and ducks while it speaks. Leave silence before the green result. Master to about −14 LUFS integrated, −1 dBTP (YouTube normalises loudness; this figure is observed behaviour, not a YouTube document).
- **Honesty:** the REPLAY, DEMO and REAL SITE chips stay in the frame for the whole beat. Every number on screen comes from a file in `examples/recorded/` (Kurzgesagt's "sourcesheet" habit).

## Resources (free, downloaded 18 Nov with the user's yes, kept outside the repo)

| Use | Pick | Licence | Credit |
|---|---|---|---|
| Captions and labels | Inter, weight 600 (woff2) | SIL OFL 1.1 | none needed |
| Terminal and diff | JetBrains Mono, weight 400 (woff2) | SIL OFL 1.1 | none needed |
| Music bed | The kit's code-made bed (`synth:music`, soft pad, no arpeggio under the voice); fallback: Kevin MacLeod, "Screen Saver" | own code / CC BY 4.0 | MacLeod: credit line in the YouTube description; Content ID claims possible but disputable |
| Tile flips, stamps | Kenney Interface Sounds (click, confirmation) | CC0 | none needed |

## Key sources

- Duarte, three-act structure and the Sparkline: https://www.duarte.com/blog/business-communication-demands-3-act-story-structure/
- Joss Fong and Ali Mattu, via NASW: https://www.nasw.org/node/262945
- NN/g, eye-tracking on video cuts and overlays: https://www.nngroup.com/articles/talking-head-video/
- Walter Murch, on density and silence: https://transom.org/2005/walter-murch/ · rule of six: https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch
- Open Design, product demo zooms: https://open-design.ai/blog/product-demo-zoom-effects/ · launch storytelling: https://open-design.ai/blog/product-launch-video-storytelling/
- Devpost, demo video tips: https://info.devpost.com/blog/6-tips-for-making-a-hackathon-demo-video · judging: https://info.devpost.com/blog/hackathon-judging-tips
- Netflix English timed-text style guide: https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-Timed-Text-Style-Guide
- WCAG 2.2, contrast (minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- On honest demos: https://www.cnbc.com/2023/12/08/google-faces-controversy-over-edited-gemini-ai-demo-video.html
