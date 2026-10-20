/**
 * A tiny kit for drawing the game's creatures, charms and trinkets as SVG strings. Every drawing lives on a 100×100 board, feet near y=90,
 * with a thick sumi outline and flat jewel colours; `solid` adds a soft shade and a highlight so shapes look lit by a lantern.
 */
export const INK = '#1d1428';

/** The game's colours, as the art uses them (the stylesheet has the same names as tokens). */
export const C = {
  ink: INK,
  paper: '#f3e7cf',
  cream: '#fff3d6',
  white: '#fffaf0',
  red: '#e4452f',
  redDark: '#a92b25',
  gold: '#f5b53f',
  goldLight: '#ffe08a',
  indigo: '#27307a',
  night: '#12163a',
  blue: '#3a6fd0',
  sky: '#8cc8f0',
  teal: '#2fa39a',
  moss: '#5d9a4f',
  leaf: '#9ccc5a',
  pink: '#f08fae',
  violet: '#7a4fa8',
  plum: '#4a2e5e',
  bone: '#ece2c6',
  ghost: '#bfe6ff',
  coal: '#3a3040',
  stone: '#9aa5b5',
  brown: '#8a5a33',
  skin: '#f1d3b0',
} as const;

let clipId = 0;
export interface Look {
  /** Outline width (0 = none). */
  w?: number;
  stroke?: string;
  /** Opacity of the whole shape. */
  op?: number;
  /** Extra attributes written on the element. */
  x?: string;
}

const line = (l: Look): string =>
  l.w === 0 ? '' : `stroke="${l.stroke ?? INK}" stroke-width="${l.w ?? 4}" stroke-linejoin="round" stroke-linecap="round"`;

/** A filled, outlined path. */
export const p = (d: string, fill: string, l: Look = {}): string =>
  `<path d="${d}" fill="${fill}" ${line(l)} ${l.op !== undefined ? `opacity="${l.op}"` : ''} ${l.x ?? ''}/>`;

export const ell = (cx: number, cy: number, rx: number, ry: number, fill: string, l: Look = {}): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${line(l)} ${l.op !== undefined ? `opacity="${l.op}"` : ''} ${l.x ?? ''}/>`;

export const circ = (cx: number, cy: number, r: number, fill: string, l: Look = {}): string => ell(cx, cy, r, r, fill, l);

export const rect = (x: number, y: number, w: number, h: number, fill: string, l: Look & { r?: number } = {}): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${l.r ?? 0}" fill="${fill}" ${line(l)} ${l.op !== undefined ? `opacity="${l.op}"` : ''} ${l.x ?? ''}/>`;

/** A stroke only (no fill). */
export const ln = (d: string, color: string = INK, w = 4, extra = ''): string =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

/** Mixes two `#rrggbb` colours: `t` = 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
  const n = (h: string, i: number): number => Number.parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = (i: number): string =>
    Math.round(n(a, i) + (n(b, i) - n(a, i)) * t)
      .toString(16)
      .padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
}

/**
 * A lit shape: a darker body, the fill shifted up and left over it (so a shade is left along the lower right), a pale glint along the upper left,
 * all clipped to the shape, then the outline. `fill` must be `#rrggbb`.
 */
export function solid(d: string, fill: string, l: Look = {}): string {
  const id = `c${++clipId}`;
  const shade = mix(fill, '#1d1428', 0.3);
  const glint = mix(fill, '#ffffff', 0.6);
  return [
    `<clipPath id="${id}"><path d="${d}"/></clipPath>`,
    `<path d="${d}" fill="${shade}"/>`,
    `<path d="${d}" fill="${fill}" transform="translate(-4 -5)" clip-path="url(#${id})"/>`,
    `<path d="${d}" fill="none" stroke="${glint}" stroke-width="2.4" transform="translate(3 3.5)" clip-path="url(#${id})" opacity=".55"/>`,
    `<path d="${d}" fill="none" ${line(l)}/>`,
  ].join('');
}

/** A round eye with a shine. `look` nudges the pupil. */
export function eye(cx: number, cy: number, r = 6, o: { look?: [number, number]; pupil?: string; lid?: number; iris?: string } = {}): string {
  const [lx, ly] = o.look ?? [0, 0];
  const pr = r * 0.58;
  return [
    ell(cx, cy, r, r * 1.12, '#fffaf0', { w: 2.4 }),
    o.iris ? circ(cx + lx * r * 0.3, cy + ly * r * 0.3, pr * 1.05, o.iris, { w: 0 }) : '',
    circ(cx + lx * r * 0.3, cy + ly * r * 0.3, pr * (o.iris ? 0.6 : 1), o.pupil ?? INK, { w: 0 }),
    circ(cx + lx * r * 0.3 - pr * 0.35, cy + ly * r * 0.3 - pr * 0.4, Math.max(1, pr * 0.34), '#ffffff', { w: 0 }),
    o.lid
      ? `<path d="M${cx - r - 1} ${cy - r * 1.1 + o.lid} L${cx + r + 1} ${cy - r * 1.1 + o.lid}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
      : '',
  ].join('');
}

export const blush = (cx: number, cy: number, rx = 4.5, ry = 2.8, color = '#f27d95'): string => ell(cx, cy, rx, ry, color, { w: 0, op: 0.55 });

export const svg = (inner: string, vb = '0 0 100 100'): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;

/** The drawing as a data URL (for `<img>` and CSS). */
export const dataUrl = (markup: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
