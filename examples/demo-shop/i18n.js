export const SUPPORTED = ['en', 'de', 'ar', 'ja', 'id', 'zh'];

let messages = {};
let current = 'en';

export function currentLang() {
  return current;
}

export async function loadLocale() {
  const requested = new URLSearchParams(location.search).get('lang');
  current = SUPPORTED.includes(requested) ? requested : 'en';
  const res = await fetch(`locales/${current}.json`, { cache: 'no-cache' });
  messages = await res.json();
  const root = document.documentElement;
  root.lang = current;
  root.dir = messages.meta && messages.meta.dir === 'rtl' ? 'rtl' : 'ltr';
  document.title = t('meta.title');
  return current;
}

export function t(key, vars) {
  const value = key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), messages);
  if (value == null) return key;
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
}

export function formatSettings() {
  return messages.format || {};
}

export function money(amount) {
  const { number_locale, currency, fraction_digits } = formatSettings();
  const opts = { style: 'currency', currency };
  if (fraction_digits != null) {
    opts.minimumFractionDigits = fraction_digits;
    opts.maximumFractionDigits = fraction_digits;
  }
  return new Intl.NumberFormat(number_locale, opts).format(amount);
}

export function longDate(date) {
  const { number_locale } = formatSettings();
  return new Intl.DateTimeFormat(number_locale, { dateStyle: 'long' }).format(date);
}

export function applyStaticText(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}
