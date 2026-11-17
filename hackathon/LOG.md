# Locale check — iteration log

Newest entry on top. Evidence first: no evidence, the cycle didn't count.

## Status

- **Time left:** deadline Fri 2026-11-20 02:29 +0800.
- **Core loop working end to end:** no (language test done).
- **Latest judge check:** none yet.
- **Human-only tasks waiting:** register at kaneclihack.sh/o/register (same email as the Kane login) and on Luma, if not done.

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
