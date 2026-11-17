const MIN_LEAD_DAYS = 2;

function normalizeDigits(text) {
  return text
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[０-９]/g, (d) => String(d.charCodeAt(0) - 0xFF10))
    .replace(/／/g, '/')
    .replace(/[－‐-–]/g, '-')
    .replace(/．/g, '.');
}

function toDate(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function parseDate(input) {
  const text = normalizeDigits(input);
  const match = text.match(/^(\d{1,4})([./-])(\d{1,2})\2(\d{1,4})$/);
  if (!match) return null;
  const [, a, sep, b, c] = match;
  const first = Number(a);
  const middle = Number(b);
  const last = Number(c);

  if (sep === '.') {
    return toDate(last, middle, first);
  }
  if (sep === '-') {
    return a.length === 4 ? toDate(first, middle, last) : toDate(last, middle, first);
  }
  return toDate(last, first, middle);
}

export function formatPattern(date, pattern) {
  const pad = (n) => String(n).padStart(2, '0');
  return pattern
    .replace('YYYY', String(date.getFullYear()))
    .replace('MM', pad(date.getMonth() + 1))
    .replace('DD', pad(date.getDate()));
}

export function addDays(base, days) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

export function exampleDate(pattern) {
  return formatPattern(addDays(new Date(), 7), pattern);
}

export function validateDeliveryDate(input) {
  if (!input || !input.trim()) return { error: 'date_required' };
  const date = parseDate(input);
  if (!date) return { error: 'date_invalid' };
  if (date < addDays(new Date(), MIN_LEAD_DAYS)) return { error: 'date_too_soon' };
  return { date };
}

export function toISO(date) {
  return formatPattern(date, 'YYYY-MM-DD');
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
