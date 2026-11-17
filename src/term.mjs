// Tiny terminal helpers (colour only when stdout is a TTY and NO_COLOR is unset).
const on = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (a, b) => (s) => (on ? `\x1b[${a}m${s}\x1b[${b}m` : String(s));
export const c = {
  bold: wrap(1, 22), dim: wrap(2, 22), red: wrap(31, 39), green: wrap(32, 39),
  yellow: wrap(33, 39), cyan: wrap(36, 39), magenta: wrap(35, 39),
};
export const pad = (s, n) => String(s).padEnd(n);
