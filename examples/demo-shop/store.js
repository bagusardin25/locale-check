const CART_KEY = 'hk.cart';
const CHECKOUT_KEY = 'hk.checkout';
const ORDER_KEY = 'hk.lastOrder';

function read(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: state lives for this page only */
  }
}

let memoryCart = read(CART_KEY, []);
let memoryCheckout = read(CHECKOUT_KEY, {});

export function getCart() {
  return memoryCart;
}

export function cartCount() {
  return memoryCart.reduce((sum, line) => sum + line.qty, 0);
}

export function addToCart(id) {
  const line = memoryCart.find((l) => l.id === id);
  if (line) line.qty += 1;
  else memoryCart.push({ id, qty: 1 });
  write(CART_KEY, memoryCart);
}

export function setQty(id, qty) {
  memoryCart = memoryCart
    .map((l) => (l.id === id ? { ...l, qty } : l))
    .filter((l) => l.qty > 0);
  write(CART_KEY, memoryCart);
}

export function clearCart() {
  memoryCart = [];
  write(CART_KEY, memoryCart);
}

export function getCheckout() {
  return memoryCheckout;
}

export function updateCheckout(patch) {
  memoryCheckout = { ...memoryCheckout, ...patch };
  write(CHECKOUT_KEY, memoryCheckout);
}

export function resetCheckout() {
  memoryCheckout = {};
  write(CHECKOUT_KEY, memoryCheckout);
}

export function saveOrder(order) {
  write(ORDER_KEY, order);
}

export function lastOrder() {
  return read(ORDER_KEY, null);
}
