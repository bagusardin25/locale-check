import { loadLocale, t, money, longDate, formatSettings, applyStaticText, currentLang } from './i18n.js';
import { PRODUCTS, SHIPPING, findProduct, productArt } from './products.js';
import * as store from './store.js';
import { validateDeliveryDate, exampleDate, toISO, fromISO } from './dates.js';

const main = document.getElementById('main');

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const arrowBack = '<svg class="icon icon-flip" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function currency() {
  return formatSettings().currency;
}

function priceOf(product) {
  return product.prices[currency()];
}

function cartLines() {
  return store
    .getCart()
    .map((line) => ({ ...line, product: findProduct(line.id) }))
    .filter((line) => line.product);
}

function totals() {
  const subtotal = cartLines().reduce((sum, l) => sum + priceOf(l.product) * l.qty, 0);
  const shipping = subtotal > 0 ? SHIPPING[currency()] : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}

function updateCartCount() {
  const count = store.cartCount();
  const el = document.getElementById('cart-count');
  el.textContent = String(count);
  el.dataset.empty = count === 0 ? 'true' : 'false';
}

function setStepFooter(html) {
  const existing = document.getElementById('step-footer');
  if (existing) existing.remove();
  document.body.classList.toggle('has-step-footer', Boolean(html));
  if (!html) return;
  const footer = document.createElement('div');
  footer.className = 'step-footer';
  footer.id = 'step-footer';
  footer.innerHTML = html;
  document.body.appendChild(footer);
}

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

/* ---------- Views ---------- */

function viewHome() {
  const cards = PRODUCTS.map(
    (p) => `
    <li>
      <a class="product-card" href="#/product/${p.id}" id="product-${p.id}">
        <div class="product-tile" style="background:${p.tile}">${productArt(p.id)}</div>
        <div class="product-card-body">
          <h2 class="product-name">${esc(t(`products.${p.id}.name`))}</h2>
          <p class="product-short">${esc(t(`products.${p.id}.short`))}</p>
          <p class="product-price">${esc(money(priceOf(p)))}</p>
        </div>
      </a>
    </li>`
  ).join('');

  main.innerHTML = `
    <section class="container home">
      <div class="home-intro">
        <p class="eyebrow">${esc(t('home.eyebrow'))}</p>
        <h1 class="page-title" tabindex="-1">${esc(t('home.title'))}</h1>
        <p class="lead">${esc(t('home.lead'))}</p>
      </div>
      <ul class="product-grid" role="list">${cards}</ul>
    </section>`;
}

function viewProduct(id) {
  const p = findProduct(id);
  if (!p) return viewHome();
  const name = t(`products.${p.id}.name`);
  const details = t(`products.${p.id}.details`);
  const detailItems = Array.isArray(details) ? details.map((d) => `<li>${esc(d)}</li>`).join('') : '';

  main.innerHTML = `
    <section class="container product-page">
      <a class="back-link" href="#/">${arrowBack}<span>${esc(t('product.back'))}</span></a>
      <div class="product-layout">
        <div class="product-hero" style="background:${p.tile}">${productArt(p.id, esc(name))}</div>
        <div class="product-info">
          <h1 class="page-title" tabindex="-1">${esc(name)}</h1>
          <p class="product-short">${esc(t(`products.${p.id}.short`))}</p>
          <p class="product-price product-price-lg">${esc(money(priceOf(p)))}</p>
          <p class="measure">${esc(t(`products.${p.id}.description`))}</p>
          <p class="stock"><span class="stock-dot" aria-hidden="true"></span>${esc(t('product.in_stock'))}</p>
          <button type="button" class="btn btn-primary btn-lg" id="add-to-cart">${esc(t('product.add_to_cart'))}</button>
          <div class="added-note" id="added-note" role="status" aria-live="polite"></div>
          <h2 class="section-title">${esc(t('product.details'))}</h2>
          <ul class="detail-list">${detailItems}</ul>
        </div>
      </div>
    </section>`;

  document.getElementById('add-to-cart').addEventListener('click', () => {
    store.addToCart(p.id);
    updateCartCount();
    document.getElementById('added-note').innerHTML = `
      <svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 10.5 3.2 3L15 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>${esc(t('product.added'))}</span>
      <a href="#/cart" id="view-cart">${esc(t('product.view_cart'))}</a>`;
  });
}

function viewCart() {
  const lines = cartLines();
  if (lines.length === 0) {
    main.innerHTML = `
      <section class="container cart-page">
        <h1 class="page-title" tabindex="-1">${esc(t('cart.title'))}</h1>
        <div class="empty-state">
          <h2>${esc(t('cart.empty_title'))}</h2>
          <p>${esc(t('cart.empty_body'))}</p>
          <a class="btn btn-primary" href="#/">${esc(t('cart.browse'))}</a>
        </div>
      </section>`;
    return;
  }
  const { subtotal, shipping, total } = totals();
  const rows = lines
    .map(
      (l) => `
      <li class="cart-line" data-id="${l.id}">
        <div class="cart-thumb" style="background:${l.product.tile}">${productArt(l.id)}</div>
        <div class="cart-line-main">
          <h2 class="cart-line-name"><a href="#/product/${l.id}">${esc(t(`products.${l.id}.name`))}</a></h2>
          <p class="product-short">${esc(t(`products.${l.id}.short`))}</p>
          <button type="button" class="link-button" data-action="remove">${esc(t('cart.remove'))}</button>
        </div>
        <div class="qty" role="group" aria-label="${esc(t('cart.quantity'))}">
          <button type="button" class="qty-btn" data-action="dec" aria-label="${esc(t('cart.decrease'))}">−</button>
          <output class="qty-value">${l.qty}</output>
          <button type="button" class="qty-btn" data-action="inc" aria-label="${esc(t('cart.increase'))}">+</button>
        </div>
        <p class="cart-line-price">${esc(money(priceOf(l.product) * l.qty))}</p>
      </li>`
    )
    .join('');

  main.innerHTML = `
    <section class="container cart-page">
      <h1 class="page-title" tabindex="-1">${esc(t('cart.title'))}</h1>
      <div class="cart-layout">
        <ul class="cart-lines" role="list">${rows}</ul>
        <aside class="card cart-summary" aria-labelledby="summary-title">
          <h2 id="summary-title" class="card-title">${esc(t('cart.summary'))}</h2>
          <dl class="totals">
            <div><dt>${esc(t('cart.subtotal'))}</dt><dd>${esc(money(subtotal))}</dd></div>
            <div><dt>${esc(t('cart.shipping'))}</dt><dd>${esc(money(shipping))}</dd></div>
            <div class="totals-grand"><dt>${esc(t('cart.total'))}</dt><dd>${esc(money(total))}</dd></div>
          </dl>
          <a class="btn btn-primary btn-block" href="#/checkout/shipping" id="checkout-button">${esc(t('cart.checkout'))}</a>
        </aside>
      </div>
    </section>`;

  main.querySelectorAll('.cart-line').forEach((row) => {
    row.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      const line = store.getCart().find((l) => l.id === row.dataset.id);
      if (!line) return;
      if (action === 'inc') store.setQty(line.id, line.qty + 1);
      if (action === 'dec') store.setQty(line.id, line.qty - 1);
      if (action === 'remove') store.setQty(line.id, 0);
      updateCartCount();
      viewCart();
    });
  });
}

const STEPS = ['shipping', 'delivery', 'review'];

function stepper(active) {
  const index = STEPS.indexOf(active);
  return `
    <ol class="stepper">
      ${STEPS.map((s, i) => {
        const state = i < index ? 'done' : i === index ? 'current' : 'todo';
        return `<li class="step-${state}"${i === index ? ' aria-current="step"' : ''}>
          <span class="step-num">${i + 1}</span><span class="step-label">${esc(t(`checkout.steps.${s}`))}</span></li>`;
      }).join('')}
    </ol>`;
}

function field({ id, name, label, value = '', autocomplete, type = 'text', hint = '', inputmode = '', dir = '' }) {
  const hintId = hint ? `${id}-hint` : '';
  return `
    <div class="field" data-field="${name}">
      <label for="${id}">${esc(label)}</label>
      ${hint ? `<p class="field-hint" id="${hintId}">${esc(hint)}</p>` : ''}
      <input id="${id}" name="${name}" type="${type}" value="${esc(value)}"
        ${autocomplete ? `autocomplete="${autocomplete}"` : ''} ${inputmode ? `inputmode="${inputmode}"` : ''}
        ${dir ? `dir="${dir}"` : ''} aria-describedby="${hintId} ${id}-error">
      <p class="field-error" id="${id}-error" role="alert"></p>
    </div>`;
}

function showFieldError(form, name, message) {
  const wrap = form.querySelector(`[data-field="${name}"]`);
  const input = wrap.querySelector('input');
  wrap.querySelector('.field-error').textContent = message || '';
  wrap.classList.toggle('has-error', Boolean(message));
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function checkoutShell(step, inner) {
  return `
    <section class="container checkout">
      <a class="back-link" href="${step === 'shipping' ? '#/cart' : `#/checkout/${STEPS[STEPS.indexOf(step) - 1]}`}">${arrowBack}<span>${esc(step === 'shipping' ? t('checkout.back_to_cart') : t('checkout.back'))}</span></a>
      <h1 class="page-title" tabindex="-1">${esc(t('checkout.title'))}</h1>
      <p class="step-count">${esc(t('checkout.step_of', { n: STEPS.indexOf(step) + 1 }))}</p>
      ${stepper(step)}
      ${inner}
    </section>`;
}

function footerTotal() {
  return `<span class="step-footer-total"><span>${esc(t('cart.total'))}</span> <strong>${esc(money(totals().total))}</strong></span>`;
}

function validateShipping(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'name_required';
  if (!values.street.trim()) errors.street = 'street_required';
  if (!values.city.trim()) errors.city = 'city_required';
  if (!values.postal.trim()) errors.postal = 'postal_required';
  else if (!/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/.test(values.postal.trim())) errors.postal = 'postal_invalid';
  const digits = values.phone.replace(/\D/g, '');
  if (!values.phone.trim()) errors.phone = 'phone_required';
  else if (!/^[+\d\s().-]+$/.test(values.phone.trim()) || digits.length < 6) errors.phone = 'phone_invalid';
  return errors;
}

function viewShipping() {
  const saved = store.getCheckout().shipping || {};
  main.innerHTML = checkoutShell(
    'shipping',
    `
    <form class="step-panel" id="shipping-form" novalidate>
      <h2 class="step-title">${esc(t('checkout.shipping_title'))}</h2>
      ${field({ id: 'ship-name', name: 'name', label: t('checkout.full_name'), value: saved.name, autocomplete: 'name' })}
      ${field({ id: 'ship-street', name: 'street', label: t('checkout.street'), value: saved.street, autocomplete: 'address-line1' })}
      <div class="field-row">
        ${field({ id: 'ship-city', name: 'city', label: t('checkout.city'), value: saved.city, autocomplete: 'address-level2' })}
        ${field({ id: 'ship-postal', name: 'postal', label: t('checkout.postal_code'), value: saved.postal, autocomplete: 'postal-code', dir: 'ltr' })}
      </div>
      ${field({ id: 'ship-phone', name: 'phone', label: t('checkout.phone'), value: saved.phone, autocomplete: 'tel', type: 'tel', inputmode: 'tel', hint: t('checkout.phone_hint'), dir: 'ltr' })}
    </form>`
  );
  setStepFooter(`${footerTotal()}<button type="submit" form="shipping-form" class="btn btn-primary btn-lg" id="continue-shipping">${esc(t('checkout.continue'))}</button>`);

  const form = document.getElementById('shipping-form');
  const read = () => Object.fromEntries(['name', 'street', 'city', 'postal', 'phone'].map((n) => [n, form.elements[n].value]));

  form.addEventListener('input', (e) => {
    store.updateCheckout({ shipping: read() });
    const wrap = e.target.closest('.field');
    if (wrap && wrap.classList.contains('has-error')) {
      const errors = validateShipping(read());
      showFieldError(form, wrap.dataset.field, errors[wrap.dataset.field] ? t(`errors.${errors[wrap.dataset.field]}`) : '');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = read();
    const errors = validateShipping(values);
    ['name', 'street', 'city', 'postal', 'phone'].forEach((n) => showFieldError(form, n, errors[n] ? t(`errors.${errors[n]}`) : ''));
    const first = Object.keys(errors)[0];
    if (first) {
      form.elements[first].focus();
      return;
    }
    store.updateCheckout({ shipping: values, shippingDone: true });
    go('#/checkout/delivery');
  });
}

function viewDelivery() {
  const saved = store.getCheckout().deliveryRaw || '';
  const pattern = formatSettings().date_format;
  const example = exampleDate(pattern);
  main.innerHTML = checkoutShell(
    'delivery',
    `
    <form class="step-panel" id="delivery-form" novalidate>
      <h2 class="step-title">${esc(t('checkout.delivery_title'))}</h2>
      <div class="field field-date" data-field="date">
        <label for="delivery-date">${esc(t('checkout.delivery_date'))}</label>
        <p class="field-hint" id="delivery-date-hint">${esc(t('checkout.delivery_hint', { format: pattern, example }))}</p>
        <input id="delivery-date" name="date" type="text" value="${esc(saved)}" placeholder="${esc(pattern)}"
          autocomplete="off" dir="ltr" aria-describedby="delivery-date-hint delivery-date-error">
        <p class="field-error" id="delivery-date-error" role="alert"></p>
      </div>
      <div class="delivery-note">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7" cy="17.5" r="1.8" fill="currentColor"/><circle cx="17" cy="17.5" r="1.8" fill="currentColor"/></svg>
        <p>${esc(t('checkout.delivery_note'))}</p>
      </div>
    </form>`
  );
  setStepFooter(`${footerTotal()}<button type="submit" form="delivery-form" class="btn btn-primary btn-lg" id="continue-delivery">${esc(t('checkout.continue_to_payment'))}</button>`);

  const form = document.getElementById('delivery-form');
  const input = form.elements.date;
  const check = () => {
    const result = validateDeliveryDate(input.value);
    showFieldError(form, 'date', result.error ? t(`errors.${result.error}`, { format: pattern, example }) : '');
    return result;
  };

  input.addEventListener('input', () => {
    store.updateCheckout({ deliveryRaw: input.value });
    if (form.querySelector('.has-error')) check();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = check();
    if (result.error) {
      input.focus();
      return;
    }
    store.updateCheckout({ deliveryRaw: input.value, deliveryISO: toISO(result.date), deliveryDone: true });
    go('#/checkout/review');
  });
}

function viewReview() {
  const state = store.getCheckout();
  const ship = state.shipping;
  const { subtotal, shipping, total } = totals();
  const payment = state.payment || 'cod';
  const items = cartLines()
    .map(
      (l) => `
      <li class="review-line">
        <div class="cart-thumb cart-thumb-sm" style="background:${l.product.tile}">${productArt(l.id)}</div>
        <span class="review-line-name">${esc(t(`products.${l.id}.name`))} <span class="muted">× ${l.qty}</span></span>
        <span class="review-line-price">${esc(money(priceOf(l.product) * l.qty))}</span>
      </li>`
    )
    .join('');

  main.innerHTML = checkoutShell(
    'review',
    `
    <div class="review-grid">
      <section class="card review-card" aria-labelledby="review-title">
        <h2 class="card-title" id="review-title">${esc(t('checkout.review_title'))}</h2>
        <ul class="review-lines" role="list">${items}</ul>
        <dl class="review-facts">
          <div>
            <dt>${esc(t('checkout.ship_to'))}</dt>
            <dd>${esc(ship.name)}<br>${esc(ship.street)}<br>${esc(ship.postal)} ${esc(ship.city)}<br><span dir="ltr">${esc(ship.phone)}</span></dd>
            <a class="edit-link" href="#/checkout/shipping">${esc(t('checkout.edit'))}</a>
          </div>
          <div>
            <dt>${esc(t('checkout.deliver_on'))}</dt>
            <dd>${esc(longDate(fromISO(state.deliveryISO)))}</dd>
            <a class="edit-link" href="#/checkout/delivery">${esc(t('checkout.edit'))}</a>
          </div>
        </dl>
        <dl class="totals">
          <div><dt>${esc(t('cart.subtotal'))}</dt><dd>${esc(money(subtotal))}</dd></div>
          <div><dt>${esc(t('cart.shipping'))}</dt><dd>${esc(money(shipping))}</dd></div>
        </dl>
      </section>
      <aside class="card pay-card" aria-labelledby="pay-title">
        <h2 class="card-title" id="pay-title">${esc(t('checkout.payment_title'))}</h2>
        <fieldset class="pay-options">
          <legend class="visually-hidden">${esc(t('checkout.payment_title'))}</legend>
          <label class="pay-option" for="pay-cod">
            <input type="radio" name="payment" id="pay-cod" value="cod" ${payment === 'cod' ? 'checked' : ''}>
            <span><span class="pay-option-name">${esc(t('checkout.cod'))}</span><span class="pay-option-hint">${esc(t('checkout.cod_hint'))}</span></span>
          </label>
          <label class="pay-option" for="pay-bank">
            <input type="radio" name="payment" id="pay-bank" value="bank" ${payment === 'bank' ? 'checked' : ''}>
            <span><span class="pay-option-name">${esc(t('checkout.bank'))}</span><span class="pay-option-hint">${esc(t('checkout.bank_hint'))}</span></span>
          </label>
        </fieldset>
        <div class="pay-total"><span>${esc(t('checkout.total_label'))}</span><strong>${esc(money(total))}</strong></div>
        <p class="legal">${esc(t('checkout.legal'))}</p>
        <button type="button" class="btn btn-primary btn-lg btn-block" id="place-order">${esc(t('checkout.place_order'))}</button>
      </aside>
    </div>`
  );
  setStepFooter('');

  main.querySelectorAll('input[name="payment"]').forEach((radio) =>
    radio.addEventListener('change', () => store.updateCheckout({ payment: radio.value }))
  );

  document.getElementById('place-order').addEventListener('click', () => {
    const chosen = main.querySelector('input[name="payment"]:checked')?.value || 'cod';
    const number = `HK-${String(Math.floor(100000 + Math.random() * 900000))}`;
    store.saveOrder({ number, deliveryISO: state.deliveryISO, payment: chosen, total, currency: currency() });
    store.clearCart();
    store.resetCheckout();
    updateCartCount();
    go('#/confirmation');
  });
}

function viewCheckout(step) {
  const lines = cartLines();
  const state = store.getCheckout();
  if (lines.length === 0) return location.replace('#/cart');
  if (step !== 'shipping' && !state.shippingDone) return location.replace('#/checkout/shipping');
  if (step === 'review' && !state.deliveryDone) return location.replace('#/checkout/delivery');
  if (step === 'shipping') return viewShipping();
  if (step === 'delivery') return viewDelivery();
  return viewReview();
}

function viewConfirmation() {
  const order = store.lastOrder();
  if (!order) return location.replace('#/');
  main.innerHTML = `
    <section class="container confirmation">
      <div class="confirm-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="currentColor"/><path d="m14 24.5 7 6.5 13-14" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <h1 class="page-title" id="confirmation-title" tabindex="-1">${esc(t('confirmation.title'))}</h1>
      <p class="order-number-label">${esc(t('confirmation.order_number'))}</p>
      <p class="order-number" id="order-number">${esc(order.number)}</p>
      <p class="measure">${esc(t('confirmation.body', { date: longDate(fromISO(order.deliveryISO)) }))}</p>
      <p class="muted">${esc(t('confirmation.payment', { method: t(order.payment === 'bank' ? 'checkout.bank' : 'checkout.cod') }))}</p>
      <a class="btn btn-secondary" href="#/" id="continue-shopping">${esc(t('confirmation.continue'))}</a>
    </section>`;
}

/* ---------- Router ---------- */

const ROUTES = [
  [/^#\/?$/, () => viewHome()],
  [/^#\/product\/([\w-]+)$/, (m) => viewProduct(m[1])],
  [/^#\/cart$/, () => viewCart()],
  [/^#\/checkout\/(shipping|delivery|review)$/, (m) => viewCheckout(m[1])],
  [/^#\/confirmation$/, () => viewConfirmation()],
];

function render() {
  const hash = location.hash || '#/';
  setStepFooter('');
  const route = ROUTES.find(([pattern]) => pattern.test(hash));
  const view = route ? route[0].exec(hash) : null;
  if (route) route[1](view);
  else viewHome();
  document.body.dataset.route = hash.split('/')[1] || 'home';
  updateCartCount();
  window.scrollTo(0, 0);
  const heading = main.querySelector('h1');
  if (heading && document.activeElement !== document.body) heading.focus({ preventScroll: true });
}

function initChrome() {
  const select = document.getElementById('lang-select');
  select.value = currentLang();
  select.addEventListener('change', () => {
    const url = new URL(location.href);
    url.searchParams.set('lang', select.value);
    location.href = url.toString();
  });

  document.querySelector('[data-skip]').addEventListener('click', (e) => {
    e.preventDefault();
    main.focus();
  });

  const pill = document.getElementById('help-chat');
  const panel = document.getElementById('help-panel');
  const toggle = (open) => {
    panel.hidden = !open;
    pill.setAttribute('aria-expanded', String(open));
  };
  pill.addEventListener('click', () => toggle(panel.hidden));
  document.getElementById('help-close').addEventListener('click', () => {
    toggle(false);
    pill.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) toggle(false);
  });
}

async function start() {
  await loadLocale();
  applyStaticText();
  initChrome();
  window.addEventListener('hashchange', render);
  render();
}

start();
