# Locale check — iteration log

Newest entry on top. Evidence first: no evidence, the cycle didn't count.

## Status

- **Time left:** deadline Fri 2026-11-20 02:29 +0800.
- **Core loop working end to end:** no (language test done).
- **Latest judge check:** none yet.
- **Human-only tasks waiting:** register at kaneclihack.sh/o/register (same email as the Kane login) and on Luma, if not done.

## Cycle 2 — 2026-11-18 07:00–08:00 · CLI, demo shop, first red grid

- **Built:** `bin/locale-check.mjs` + `src/` (zero npm deps), demo shop `examples/demo-shop/` (Opus subagent; bugs documented in `docs/planted-bugs.md`), skill `skill/locale-check/SKILL.md`, CI example `examples/ci/locale-check.yml` (not yet run in Actions).
- **Problems found and fixed (all real, all in the tool, not in Kane's results):**
  1. Parallel Kane runs drove each other's browser. Cause: kane-cli picks the first free CDP port in 9222–9230 *before* its Chrome binds it, and all runs share one Chrome profile. Fix: a throwaway `--chrome-profile` per run, plus a launch gate that starts the next run only after the previous run's first step event.
  2. Chrome exits with code 21 when `--user-data-dir` is a Windows 8.3 short path (`C:\Users\ABCDEF~1\...`, what `os.tmpdir()` returns here). Fix: `realpathSync.native`.
  3. Throwaway profiles (~60 MB each) stayed locked a few seconds after kane-cli exits. Fix: retrying cleanup and a flush at the end of each round.
  4. Objective wording: global "checks" were applied at the wrong moment (zh checked for a Continue button on the storefront) and negative wording ("is covered") confused the analyzer (en false fail). Fix: numbered steps with a positive check at the step where it applies.
  5. Kane triages its own failures in `run_end.verdict`: every false failure so far was `confirmed:false, family:automation_bug`; every real bug was `confirmed:true, family:application_issue`. locale-check now calls the former **inconclusive**, retries it once, and never sends it to the agent as a bug.
- **Evidence:** `.locale-check/results.json` rounds 1–3 (gitignored). Round 3: en ✓, zh ✓, de ✗ "Place order button cut off by its card", ar ✗ "shipping Continue button not in the visible, unobstructed area", ja ✗ "rejected a date in the exact YYYY/MM/DD format it tells customers to use", id ✗ "code-like label instead of Indonesian text". Exactly the four planted bugs, each in its own locale.
- **Cost:** about 45–60 credits and 1.5–3.5 min per locale for the 5-step checkout; a 6-locale round ≈ 280 credits and ~7 min at 3 in parallel.
- **Closed loop on the lab page:** Kane failed the clipped button → `claude -p` read the brief and edited the CSS → Kane re-ran only that locale → pass.

## Cycle 1 — 2026-11-18 06:54–07:00 · Kane language test

- **Target:** the first risk: can Kane read and click non-Latin labels, and does it fail a cosmetic break?
- **Pages:** `lab/kane-language-test/` (`ar.html` RTL form, `ja.html` form, `de-clipped.html` German pay button half cut off by `overflow:hidden`). Served with `python -m http.server 8765`.
- **Evidence:** NDJSON in `kane-runs/langtest/` (gitignored). All runs `--agent --headless`, Kane CLI 0.10.4.

| Run | Objective language | Mode | Result | Time | Credits |
|---|---|---|---|---|---|
| Arabic RTL form: type name, pick دبي, click ادفع الآن, check confirmation | English with Arabic labels quoted | dom | passed | 68 s | 19.5 |
| Japanese form: type 山田 花子, pick 大阪府, click 注文を確定する, check message | Japanese | dom | passed | 75 s | 19.4 |
| German pay button, first page (button was actually fully visible; my page error) | English | dom / visual | passed (correct) | 43 / 49 s | 21.8 / 17.5 |
| German pay button half clipped (card 162 px) | English | dom | **failed: `assertion_error.confirmed_product_bug`** | 45 s | 11.2 |
| same | English | visual | **failed: `assertion_error.confirmed_product_bug`** | 35 s | 9.3 |

- Balance 11200 → 11076.16: 123.8 credits for 6 runs, about **10–22 credits and 35–75 s per run**.
- **Findings:**
  - Kane handles Arabic, RTL and Japanese labels, and a Japanese objective (its summary came back in Japanese).
  - A visibility condition written into the objective ("fully visible, not cut off by its container") makes a clipped button fail in both DOM and visual mode. The failure `summary` names the cause and a fix ("increase the card height or remove its clipping"), which is exactly what the Claude loop needs.
  - Local runs record no video file. Each run uploads a shareable Test Manager page (`test_url` in `run_end`) with a step-by-step replay and an Autoplay button, plus an evidence pack (`.evidence` zip) with a screenshot per step. The grid will link the replay and show the last screenshot. Call it a "Kane replay", not a video.
- **Effect:** Gate 2 risk (non-Latin) retired. No fallback idea needed.
- **Next:** RULES.md and PITCH.md, then the demo shop.
