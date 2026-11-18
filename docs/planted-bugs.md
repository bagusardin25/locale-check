# Planted bugs in the demo shop

> Two more bugs were planted later, blind, by a separate agent, to test a generic objective: zh shipping in the wrong currency unit ([`blind-bug.md`](blind-bug.md)) and de date-hint placeholders ([`blind-bug-2.md`](blind-bug-2.md)). The shop now has six bugs.

The demo shop (`examples/demo-shop/`, served at `http://127.0.0.1:8765/examples/demo-shop/?lang=<code>`) is a small ceramics store in six languages: en, de, ar, ja, id, zh. It contains four planted locale bugs. Each one breaks the checkout in exactly one language, at 1920x1080 and at 1280x800. English and Chinese complete the whole flow, and so does every other locale apart from its own bug. The code has no comments pointing at the bugs. They are the kind of mistake a real team ships.

| Locale | Step | What the user sees |
|---|---|---|
| de | 3 Review & pay | The "Zahlungspflichtig bestellen" button is cut off at the bottom of the payment card |
| ar | 1 Shipping | The Help / chat pill covers the Continue button completely |
| ja | 2 Delivery | A date typed exactly as the hint shows (2026/11/25) is rejected |
| id | 2 Delivery | The button shows the raw key `checkout.continue_to_payment` |

## DE: the Pay button is clipped

- **What the user sees:** on the Review & pay step, the payment card ends partway through the green "Zahlungspflichtig bestellen" button. Only the top 12 px of the 48 px button shows (75 % hidden), and you cannot click its label.
- **Root cause:** `examples/demo-shop/styles.css:815-819`. `.pay-card` has a fixed `height: 25.5rem` (408 px) and `overflow: hidden`, and `styles.css:877-879` pins the button to the bottom with `margin-top: auto`. The height was chosen to fit English, whose content is 374 px tall. The German legal line (`locales/de.json:101`, five lines against two in English) and the longer payment-method hints make the content 468 px tall, so the button overflows the card and the card hides it.
- **Fix:** remove the fixed height and the `overflow: hidden` from `.pay-card`, or use `min-height`, so the card grows with its content.

## AR: an RTL overlap hides Continue

- **What the user sees:** on the Shipping step, the bottom action bar shows the total, but the Continue button ("متابعة") is hidden. The dark "المساعدة / الدردشة" (Help / chat) pill sits on top of it. Clicking there opens the help panel instead.
- **Root cause:** `examples/demo-shop/styles.css:934-937`. `.help-pill` is `position: fixed` with the physical `left: 20px; bottom: 14px`. The step action bar (`styles.css:743-749`) uses `justify-content: flex-end`, which puts Continue at the inline end. In LTR that is the right edge, far from the pill. In RTL the inline end is the left edge, so Continue (x 24–168, y 1018–1066 at 1920x1080) lands entirely under the pill (x 20–225, y 1010–1066). `document.elementFromPoint` at the centre and edges of the button returns the pill.
- **Fix:** position the pill with logical properties (`inset-inline-start` → `inset-inline-end`, or move it to the side opposite the button), so it mirrors in RTL. Reserving space for it in the action bar also works.

## JA: the local date format is rejected

- **What the user sees:** the Delivery step hint says "YYYY/MM/DD の形式で入力してください（例：2026/11/25）". Typing exactly that date gives the red error "日付は YYYY/MM/DD の形式で入力してください（例：2026/11/25）。", so the step cannot continue.
- **Root cause:** `examples/demo-shop/dates.js:21-36`. `parseDate()` chooses the field order from the separator alone. `.` means DD.MM.YYYY. `-` means YYYY-MM-DD when the first part has four digits and DD-MM-YYYY otherwise. Any `/` is read as US MM/DD/YYYY (`dates.js:36`). It never sees the locale's `date_format` (`locales/ja.json`, `"YYYY/MM/DD"`). As a result, 2026/11/25 becomes month 2026, day 11, year 25 and is rejected as invalid (`dates.js:60` in `validateDeliveryDate`, called from `app.js:325`).
- **Fix:** pass the locale's `date_format` into `parseDate()` and read the `/` fields in that order. Alternatively, treat a four-digit first part as the year for `/` the same way the `-` branch does.

## ID: a raw translation key is shown

- **What the user sees:** on the Delivery step, the primary button reads `checkout.continue_to_payment` instead of an Indonesian label. The button still works.
- **Root cause:** `examples/demo-shop/locales/id.json` has no `checkout.continue_to_payment` key. It should sit between `delivery_note` (line 90) and `review_title` (line 91). The other five locale files have it at line 90. `t()` in `examples/demo-shop/i18n.js:24` returns the key itself when a translation is missing, as most i18n libraries do, and `app.js:320` renders it.
- **Fix:** add `"continue_to_payment": "Lanjut ke pembayaran"` to the `checkout` block of `locales/id.json`. Then add a missing-key check to CI, or have the app fall back to English.

## How these were measured

The checks below ran in a Chromium browser pane at 1920x1080 and 1280x800, driving the real flow: product page, Add to cart, cart, Checkout, the three steps and Place order.

- **DE:** the Pay button is 48 px tall and 12 px of it is visible inside the card. The card's content is 468 px tall in a 408 px card. In every other locale the content fits: en 374, ar 388, ja 388, id 374 and zh 370 px.
- **AR:** at five sample points on Continue (the centre and the four edges), `elementFromPoint` returns the help pill. In en, de, ja, id and zh it returns the button itself at all five points.
- **JA:** 2026/11/25 is rejected. en 11/25/2026, de 25.11.2026, ar and id 25-11-2026, and zh 2026-11-25 are all accepted.
- **ID:** the Delivery button text is `checkout.continue_to_payment`. The key diff against `en.json` shows that one key missing and nothing else.
