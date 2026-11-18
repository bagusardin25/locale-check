export const PRODUCTS = [
  {
    id: 'mug',
    tile: 'var(--tile-oat)',
    prices: { USD: 28, EUR: 26, AED: 105, JPY: 4200, IDR: 450000, CNY: 198 },
  },
  {
    id: 'dripper',
    tile: 'var(--tile-celadon)',
    prices: { USD: 34, EUR: 32, AED: 125, JPY: 5200, IDR: 540000, CNY: 238 },
  },
  {
    id: 'bowl',
    tile: 'var(--tile-iron)',
    prices: { USD: 46, EUR: 44, AED: 170, JPY: 6900, IDR: 730000, CNY: 328 },
  },
];

export const SHIPPING = { USD: 6, EUR: 5.5, AED: 25, JPY: 800, IDR: 40000, CNY: 2000 };

export function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

const speckles = (points, color) =>
  points.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join('');

const ART = {
  mug: `
    <ellipse cx="156" cy="204" rx="80" ry="9" fill="#2b2a26" opacity=".10"/>
    <path d="M206 98h12a34 34 0 0 1 0 68h-12" fill="none" stroke="#d8ccb3" stroke-width="15" stroke-linecap="round"/>
    <path d="M206 98h12a34 34 0 0 1 0 68h-12" fill="none" stroke="#c6b899" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    <path d="M100 66h112v114a22 22 0 0 1-22 22h-68a22 22 0 0 1-22-22z" fill="#e7ddc8"/>
    <path d="M100 172h112v8a22 22 0 0 1-22 22h-68a22 22 0 0 1-22-22z" fill="#b48a64"/>
    <path d="M100 166c20 4 38 9 56 6s36-8 56-4v8H100z" fill="#e7ddc8"/>
    <path d="M100 66h18v108h-18z" fill="#fff" opacity=".22"/>
    <ellipse cx="156" cy="66" rx="56" ry="9" fill="#d6c9ad"/>
    <ellipse cx="156" cy="67" rx="49" ry="6" fill="#8a6f55"/>
    ${speckles([[124, 92, 1.6], [148, 108, 1.2], [176, 88, 1.8], [190, 120, 1.3], [132, 136, 1.5], [168, 146, 1.1], [118, 158, 1.2], [196, 152, 1.6], [156, 126, 1.4], [184, 104, 1]], '#6c5a47')}
  `,
  dripper: `
    <ellipse cx="160" cy="206" rx="74" ry="8" fill="#2b2a26" opacity=".10"/>
    <path d="M118 170h84l-6 30h-72z" fill="#d9e4de" stroke="#b9cbc1" stroke-width="2"/>
    <rect x="96" y="150" width="128" height="16" rx="8" fill="#93b8a6"/>
    <path d="M86 56h148l-38 96h-72z" fill="#a8c9b8"/>
    <path d="M86 56h30l-8 96h-24z" fill="#fff" opacity=".18"/>
    <path d="M128 70l12 70M160 70v70M192 70l-12 70" stroke="#86ab99" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="160" cy="56" rx="74" ry="10" fill="#bcd6c8"/>
    <ellipse cx="160" cy="57" rx="66" ry="7" fill="#7fa592"/>
  `,
  bowl: `
    <ellipse cx="160" cy="196" rx="96" ry="9" fill="#2b2a26" opacity=".10"/>
    <path d="M132 176h56l-4 16h-48z" fill="#b48a64"/>
    <path d="M52 104c6 46 50 78 108 78s102-32 108-78z" fill="#9b3d24"/>
    <path d="M52 104c6 46 50 78 108 78s102-32 108-78" fill="none" stroke="#4d2416" stroke-width="7" opacity=".55"/>
    <path d="M70 116c10 28 40 50 74 56" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".14"/>
    <ellipse cx="160" cy="104" rx="108" ry="22" fill="#5a2a19"/>
    <ellipse cx="160" cy="106" rx="98" ry="17" fill="#8e3920"/>
    <ellipse cx="160" cy="110" rx="70" ry="10" fill="#7a301b"/>
  `,
};

export function productArt(id, label = '') {
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="art" viewBox="0 0 320 240" ${a11y}>${ART[id] || ''}</svg>`;
}
