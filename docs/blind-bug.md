# Blind bug (fifth planted bug)

Planted after the generic checkout objective was committed (9da3a80, 08:46:16), so the objective's author did not know it. Committed unread in 88c0a47 (08:48:09); read only after the generic run finished.

| Locale | Step | What the user sees |
|---|---|---|
| zh | Cart, then every checkout step (Shipping, Delivery footer totals; Review & pay) | Shipping (运费) is ¥2,000.00 on a ¥198.00 mug, so the total is ¥2,198.00 |

- **What the user sees:** in Simplified Chinese, the cart summary shows 小计 ¥198.00, 运费 ¥2,000.00, 合计 ¥2,198.00 for one mug. The same inflated total appears in the step footer on Shipping and Delivery, in the Review & pay totals and pay card, and is saved with the order. Shipping costs ten times the product: a customer would abandon the order or be overcharged.
- **Root cause:** `examples/demo-shop/products.js:19`. The `SHIPPING` table has `CNY: 2000`, the flat rate entered in fen (minor units, 100 fen = 1 yuan) while every other entry in the file, prices included, is in major units. `totals()` in `app.js:28-32` adds it as yuan and `money()` (`i18n.js:33`) formats it as ¥2,000.00.
- **Fix:** change it to `CNY: 20` (¥20.00). Longer term, store all amounts in one unit (for example minor units with the currency's exponent) and add a sanity check that shipping is below the cheapest product in each currency.
- **Verified:** in the built-in browser pane, adding one mug and opening the cart: zh shows ¥198.00 / ¥2,000.00 / ¥2,198.00. The other five are unchanged: en $28.00 / $6.00 / $34.00, de 26,00 € / 5,50 € / 31,50 €, ar 105.00 / 25.00 / 130.00 د.إ., ja ￥4,200 / ￥800 / ￥5,000, id Rp 450.000 / Rp 40.000 / Rp 490.000. The flow is not blocked; the bug misleads on price.
