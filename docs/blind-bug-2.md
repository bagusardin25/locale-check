# Blind bug 2 (sixth planted bug)

Planted after the generic objective v2 was committed (73e9c41, 08:56:09), so the objective's author did not know it. Committed unread in 9d6be15 (08:58:29); read only after the v2 run finished.

| Locale | Step | What the user sees |
|---|---|---|
| de | 2 Lieferung (Delivery) | The date hint reads "Format {Format}, zum Beispiel {Beispiel}. Frühestens in 2 Tagen lieferbar." with raw placeholders instead of the format and an example date |

- **What the user sees:** on the Delivery step in German, the hint under "Wunschliefertermin" shows the literal tokens `{Format}` and `{Beispiel}`. The customer is not told which date format to type or given an example. Only the grey input placeholder (DD.MM.YYYY) still hints at it, and it disappears once you start typing. Every other locale shows the real format and an example date there.
- **Root cause:** `examples/demo-shop/locales/de.json:88`. The translator translated the placeholder names along with the text (`{format}` became `{Format}`, `{example}` became `{Beispiel}`). `t()` in `examples/demo-shop/i18n.js:26` only substitutes names present in `vars`, and `app.js:309` passes `{ format, example }`, so the unknown names are left in the string as-is.
- **Fix:** restore the placeholder names: `"delivery_hint": "Format {format}, zum Beispiel {example}. Frühestens in 2 Tagen lieferbar."`. Longer term, add a CI check that every translation uses exactly the same `{placeholder}` names as `en.json`, and have `t()` warn about unreplaced placeholders.
- **Verified:** in the built-in browser pane at 1280x800, walking product → Add to cart → Shipping (filled, Continue) → Delivery in all six locales. de shows `Format {Format}, zum Beispiel {Beispiel}. ...` (screenshot taken). The other five are unchanged: en "Format MM/DD/YYYY, for example 11/25/2026.", ar "الصيغة DD-MM-YYYY، مثل 25-11-2026.", ja "YYYY/MM/DD の形式で入力してください（例：2026/11/25）", id "Format DD-MM-YYYY, misalnya 25-11-2026.", zh "格式为 YYYY-MM-DD，例如 2026-11-25。". The example date is today plus 7 days, so it moves. The flow is not blocked: a correctly typed date (for example 25.11.2026) is still accepted. The bug misleads by hiding the required format.
