# Locale check — idea card

**One line:** Locale check helps developers of multilingual web apps catch broken translations before users do, by running one plain-English Kane objective in every language and handing the failures to Claude Code to fix.

**User and moment:** a developer who just merged a batch of new German, Arabic and Japanese strings from the translators, minutes before a release.

**Today (before):** they click through the app in English. Nobody checks Arabic or Japanese because nobody on the team reads them. Unit tests pass because the keys exist. Users find the clipped Pay button, the broken right-to-left step and the rejected date format.

**With us (after):** `locale-check run` drives the same checkout in six languages with Kane in a real browser. A red tile shows what broke, with Kane's replay. Claude Code reads Kane's evidence, fixes the CSS or validation, and Kane re-checks only the red languages until the grid is green.

**Core loop:** objective + URL + locales → Kane runs per locale → results JSON + grid (red/green, replay links) → failures + Kane NDJSON to Claude Code → fix → re-run red locales → green.

## What a judge sees

A grid of six tiles: EN ✓, DE ✗ "Pay button cut off by the cart panel", AR ✗ "Next button inside the shipping step overlaps the summary in RTL", JA ✗ "Delivery date 2026/11/20 rejected", ID ✗ "raw key checkout.pay_now shown", ZH ✓. Each tile has Kane's last screenshot and a link to its step-by-step replay. Then Claude Code edits three files, Kane re-runs four languages, and the grid turns green.

**Wow moment:** Kane, told only "the Pay button must be fully visible", fails German on its own and writes the cause ("the cart panel is too short and hides overflow"), and Claude fixes it from that sentence.

## Why this needs AI and the required tech

Without Kane you would write six Playwright scripts with locale-specific selectors, and none of them would notice a half-hidden button. Kane takes one English objective and works in any script, including RTL, and judges visibility. Without Claude the grid is just a report.

**Data:** a demo shop with planted, labelled bugs (shows the loop) plus a real open-source multilingual app (shows it finds unplanted bugs).

## Fit to the judging criteria

| Criterion | Why this idea scores |
|---|---|
| Ships | one command, one grid file, a skill to install |
| Verified | four kinds of locale bug plus one real OSS bug |
| Closed loop | Kane verdict → Claude fix → Kane re-run of red locales only |
| Craft | nobody in the field tests locales; useful to anyone shipping translations |

## Alternatives and our wedge

| Alternative | What it misses |
|---|---|
| i18n linters (missing-key checks) | only find missing keys, not layout, RTL or validation bugs |
| Visual-diff tools | need baselines per locale and flag every pixel change |
| Manual clicking | nobody on the team reads Arabic or Japanese |

## Risks and scope

- **Biggest risk:** Kane on non-Latin text and on cosmetic breaks. **Retired 2026-11-18 07:00** (LOG cycle 1).
- **Must:** demo shop, CLI, grid, Claude loop, recorded run, OSS bug.
- **Should:** CI gate (GitHub Action), pseudo-locale.
- **Could:** mobile viewport per locale.
- **Out of scope:** dashboards, accounts, settings.
