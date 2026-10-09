import { PAL as c } from './riso';

/**
 * The cards' own paintings, hand-built as vectors on a 160×68 grid (160×80 for a `wide` one: a large card's, twice as wide as high).
 * `riso.ts` prints each at 56 pixels wide in the ink swatches (gradients snap to dithered ramps), lit from the top-left; the card's
 * type colour offsets under it like the icon's. Colours come from `PAL` (never a hex), so every fill lands exactly on an ink.
 * They are shown in place of a card's icon while the Card art debug switch is on; a card without one keeps its icon.
 */
export interface CardPicture {
  svg: string;
  wide?: boolean;
}

/** Gradient ramps from light to dark (top-left to bottom-right); a picture carries only the ones it uses. */
const RAMPS: Record<string, { stops: string[]; x2?: number; y2?: number; radial?: boolean }> = {
  org: { stops: [c.Y, c.O, c.R] },
  blu: { stops: [c.tB, c.B, c.N] },
  pnk: { stops: [c.tP, c.P, c.R] },
  wht: { stops: [c.W, c.tK] },
  grn: { stops: [c.YB, c.G, c.N], y2: 0.3 },
  yel: { stops: [c.W, c.Y, c.O] },
  cof: { stops: [c.O, c.R, c.K] },
  stl: { stops: [c.W, c.tK, c.BK] },
  vio: { stops: [c.tV, c.V, c.N] },
  flm: { stops: [c.Y, c.O, c.P] },
  dk: { stops: [c.tK, c.K] },
  rsun: { stops: [c.W, c.Y, c.O], radial: true },
  rwht: { stops: [c.W, c.W, c.tK], radial: true },
  rcof: { stops: [c.O, c.R, c.K], radial: true },
  rpnk: { stops: [c.tP, c.P], radial: true },
  rblu: { stops: [c.tB, c.B, c.N], radial: true },
};

const defsFor = (body: string): string =>
  `<defs>${Object.entries(RAMPS)
    .filter(([id]) => body.includes(`url(#${id})`))
    .map(([id, r]) => {
      const stops = r.stops.map((s, i) => `<stop offset="${i / (r.stops.length - 1)}" stop-color="${s}"/>`).join('');
      return r.radial
        ? `<radialGradient id="${id}" cx=".35" cy=".3" r=".85">${stops}</radialGradient>`
        : `<linearGradient id="${id}" x1="0" y1="0" x2="${r.x2 ?? 1}" y2="${r.y2 ?? 1}">${stops}</linearGradient>`;
    })
    .join('')}</defs>`;

const pic = (body: string, wide = false): CardPicture => ({ svg: defsFor(body) + body, wide });

// ---- drawing helpers: every solid shape carries the same black outline
const O = `stroke="${c.K}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const g = (id: string): string => `url(#${id})`;
const sh = (d: string, fill: string): string => `<path d="${d}" fill="${fill}" ${O}/>`;
const rr = (x: number, y: number, w: number, h: number, fill: string, rx = 0): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${O}/>`;
const ci = (x: number, y: number, r: number, fill: string): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${O}/>`;
const el = (x: number, y: number, rx: number, ry: number, fill: string): string =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${O}/>`;
/** A plain filled rectangle, no outline. */
const fl = (x: number, y: number, w: number, h: number, fill: string, rx = 0): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const ln = (d: string, stroke: string = c.K, w = 2): string =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** A line with a black edge: white steam, a wire, a rope. */
const cord = (d: string, ink: string, w: number): string => `${ln(d, c.K, w + 3.4)}${ln(d, ink, w)}`;
const hi = (x: number, y: number, w: number, h: number): string => fl(x, y, w, h, c.W, 1);
const star = (cx: number, cy: number, ro: number, ri: number, n: number, rot = 0): string => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro;
    const a = rot + (Math.PI * i) / n;
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return `${d}z`;
};
/** A four-point sparkle. */
const sp = (x: number, y: number, r: number, fill: string = c.W): string => sh(star(x, y, r, r / 2.4, 4, 0.2), fill);
/** A little speech-mark burst of impact lines around a point. */
const burst = (x: number, y: number, ro: number, ri: number, fill: string): string => sh(star(x, y, ro, ri, 9, 0.3), fill);

/** A pie slice (angles in degrees, clockwise from three o'clock). */
const pie = (cx: number, cy: number, r: number, a0: number, a1: number): string => {
  const p = (a: number): string => `${(cx + r * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(cy + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
  return `M${cx} ${cy}L${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}z`;
};

/** A staircase of four steps going up to the right, the one numbered `n` lit and topped by a bubble with that many pips (a step of the Step 1–4 chain). */
const stairs = (n: number): string => {
  const dots = (cx: number, cy: number): string =>
    (
      [
        [[0, 0]],
        [
          [-4, -4],
          [4, 4],
        ],
        [
          [-5, -5],
          [0, 0],
          [5, 5],
        ],
        [
          [-4, -4],
          [4, -4],
          [-4, 4],
          [4, 4],
        ],
      ] as number[][][]
    )[n - 1]
      .map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="2" fill="${c.K}"/>`)
      .join('');
  const steps = [0, 1, 2, 3].map((i) => rr(10 + i * 34, 54 - i * 13, 36, 14 + i * 13, i === n - 1 ? g('yel') : g('blu'))).join('');
  const bx = 28 + (n - 1) * 34;
  const by = 54 - (n - 1) * 13 - 17;
  return `${steps}${ci(bx, by, 11, c.W)}${dots(bx, by)}`;
};

export const CARD_ART: Record<string, CardPicture> = {
  punch: pic(`
${burst(100, 34, 34, 19, g('rsun'))}
<g transform="rotate(8 112 32)">${rr(92, 6, 38, 50, g('wht'))}${rr(92, 6, 38, 10, c.P)}${ln('M98 24h26M98 31h20M98 38h24M98 45h16', c.K, 1.6)}${fl(97, 9, 12, 2, c.W)}</g>
${sh('M84 22l8 5-2 6 8 2-6 6 4 7-9-3-4 7-3-8-8-1 5-6-4-7 8 3z', c.K)}
${rr(4, 20, 26, 30, g('blu'))}${rr(28, 18, 7, 34, g('wht'))}
${sh('M35 19h24a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8H35z', g('org'))}
${rr(56, 19, 22, 9, g('org'), 4)}${rr(56, 28, 22, 9, g('org'), 4)}${rr(56, 37, 22, 9, g('org'), 4)}${rr(52, 46, 22, 9, g('org'), 4)}
${hi(60, 21, 8, 2)}${hi(60, 30, 8, 2)}${hi(60, 39, 8, 2)}${hi(40, 22, 10, 3)}${ln('M40 46c6-3 14-3 20 0', c.K, 2)}${fl(8, 24, 6, 14, c.tB)}`),

  wrenchWhack: pic(`
${burst(72, 50, 26, 13, g('rsun'))}
${sh('M46 8l32 9c0 24-12 38-32 46C26 55 14 41 14 17z', g('blu'))}${ln('M46 8l-7 14 9 7-9 11 7 9', c.K, 2)}${hi(22, 20, 3, 14)}
<g transform="rotate(-38 108 32)">${rr(78, 28, 62, 10, g('stl'), 3)}${ci(70, 33, 14, g('stl'))}${fl(52, 29, 16, 9, c.K)}${ci(142, 33, 6, g('stl'))}${hi(84, 30, 40, 2)}</g>
${sp(24, 50, 6)}${sp(110, 56, 5)}${ln('M126 12l8-6M134 24l10-2', c.K, 2)}`),

  hostileTakeover: pic(`
${rr(66, 6, 34, 54, g('blu'))}${rr(80, 0, 6, 8, g('stl'))}
${[0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((q) => fl(70 + q * 10, 12 + r * 9, 6, 5, r === 2 && q === 1 ? c.Y : c.W)).join('')).join('')}
${sh('M16 36h36a12 12 0 0 1 12 12v10a6 6 0 0 1-6 6H22a8 8 0 0 1-8-8z', g('org'))}
${rr(52, 38, 34, 8, g('org'), 4)}${rr(52, 47, 34, 8, g('org'), 4)}${rr(50, 56, 34, 7, g('org'), 3)}${ln('M56 46.5h26M56 55.5h26')}${hi(20, 40, 14, 2)}
${sp(120, 18, 7)}${sp(132, 44, 5)}${sh('M118 30l3-6 3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4z', c.Y)}`),

  shoulderCheck: pic(`
${rr(88, 8, 46, 52, g('blu'), 4)}${rr(94, 14, 34, 40, g('pnk'), 3)}${ln('M111 14v40M94 34h34', c.W, 3)}
${burst(86, 34, 22, 11, g('rsun'))}
${el(56, 38, 36, 26, g('stl'))}${sh('M32 26l8-18 8 16zM50 20l8-18 8 16zM68 24l10-14 4 16z', g('stl'))}
${ln('M26 42c8 12 36 16 58 0', c.K, 2)}${ci(36, 44, 3, c.W)}${ci(56, 54, 3, c.W)}${ci(76, 46, 3, c.W)}${hi(36, 24, 16, 3)}
${ln('M2 18h14M0 34h12M4 50h14', c.K, 2.4)}`),

  doubleShift: pic(`
${ci(100, 34, 20, g('wht'))}${sh('M84 14l-8-8 8-4 6 8zM116 14l8-8-8-4-6 8z', c.P)}${ln('M100 34v-12M100 34l9 6', c.K, 2.4)}
${ci(64, 38, 24, g('wht'))}${sh('M44 18l-10-10 10-4 8 10zM84 18l10-10-10-4-8 10z', c.P)}${ci(64, 38, 3, c.K)}
${ln('M64 38v-16M64 38l12 8M64 20v-2M64 58v-2M44 38h2M82 38h2', c.K, 2.4)}${hi(50, 26, 8, 2)}
${sh('M134 38c-5 8-8 11-8 16a8 8 0 0 0 16 0c0-5-3-8-8-16z', g('pnk'))}
${sh('M22 6l9 12-9 24-9-24z', g('blu'))}${hi(18, 12, 3, 8)}${sp(138, 12, 6)}`),

  picketDrums: pic(`
<g transform="rotate(-24 50 22)">${rr(12, 19, 74, 6, g('yel'), 3)}${ci(12, 22, 7, c.W)}</g>
<g transform="rotate(24 110 22)">${rr(74, 19, 74, 6, g('yel'), 3)}${ci(148, 22, 7, c.W)}</g>
${sh('M40 30v26c0 6 18 10 40 10s40-4 40-10V30z', g('pnk'))}${el(80, 30, 40, 10, g('wht'))}
${ln('M46 40l14 22M62 40l14 24M78 40l14 24M94 40l14 24M110 40l-6 14M50 40l-4 6', c.W, 3)}${ln('M40 30v26M120 30v26', c.K, 2.4)}${hi(54, 28, 24, 2)}
${sp(18, 52, 6)}${sp(144, 50, 6)}${ln('M14 8l6 6M146 8l-6 6', c.K, 2.4)}`),

  stonks: pic(`
${ln('M14 6v54h130', c.K, 3)}
${rr(24, 40, 14, 20, g('grn'))}${rr(46, 32, 14, 28, g('grn'))}${rr(68, 22, 14, 38, g('pnk'))}${rr(90, 14, 14, 46, g('grn'))}
${fl(29, 34, 4, 6, c.K)}${fl(51, 24, 4, 8, c.K)}${fl(73, 14, 4, 8, c.K)}${fl(95, 8, 4, 6, c.K)}
${cord('M16 52L128 8', c.Y, 4)}${sh('M138 4l-8 20-6-8-12-2z', c.Y)}
${ci(128, 46, 14, g('yel'))}${ln('M128 38v16M123 42c0-6 10-6 10 0s-10 6-10 12 10 4 10-1', c.K, 2.2)}${hi(120, 40, 3, 6)}`),

  justCause: pic(`
${rr(78, 36, 8, 28, g('cof'))}
<g transform="rotate(-7 82 22)">${rr(30, 4, 104, 40, g('wht'), 2)}${rr(30, 4, 104, 8, c.P)}
${sh('M72 18h14v14l-3 4h-8l-3-4z', c.P)}${fl(71, 40, 16, 2, c.K)}
${sh('M100 16l10 20M110 16l-10 20', c.P)}${ln('M100 16l10 20M110 16l-10 20', c.P, 4)}${ln('M38 18h26M38 26h20M38 34h24', c.K, 2)}</g>
${sp(18, 54, 6)}${sp(140, 56, 5)}`),

  grievance: pic(`
<g transform="rotate(-6 66 34)">${rr(24, 4, 66, 58, g('wht'), 2)}${rr(24, 4, 66, 10, c.P)}${fl(30, 7, 22, 3, c.W)}
${ln('M31 22h46M31 29h40M31 36h44M31 43h30', c.K, 2)}${ln('M34 55c6-8 8 4 14-4s8 6 14-2', c.B, 2.4)}</g>
${sh('M104 4c20 0 30 10 30 24s-10 24-30 24l-14 12 2-14c-10-4-16-12-16-22 0-14 10-24 28-24z', g('pnk'))}
${fl(100, 14, 8, 22, c.W, 3)}${fl(100, 40, 8, 8, c.W, 3)}
${ln('M140 6l8-4M146 22l10-2M138 52l10 4', c.K, 2.4)}`),

  safetyRegs: pic(`
${sh('M80 4l26 56H54z', g('yel'))}${sh('M80 4l26 56H80z', c.Y)}
${sh('M80 14l17 36H63z', c.W)}${fl(77, 26, 6, 14, c.P, 2)}${ci(80, 45, 3, c.P)}
${rr(44, 58, 72, 6, c.K)}${ln('M52 58l-4 6M64 58l-4 6M76 58l-4 6M88 58l-4 6M100 58l-4 6M112 58l-4 6', c.Y, 3)}
${sp(26, 22, 7)}${sp(134, 30, 6)}${ln('M22 44l8 4M130 48l8-4', c.K, 2.4)}`),

  forklift: pic(`
${rr(100, 4, 8, 54, g('stl'))}${rr(104, 52, 36, 5, g('stl'))}${rr(108, 26, 26, 26, g('cof'))}${ln('M108 39h26M121 26v26', c.K, 2)}
${ln('M32 32V10h46v22', c.K, 3.4)}${rr(36, 22, 16, 10, g('dk'), 2)}
${sh('M20 58V38a6 6 0 0 1 6-6h58a6 6 0 0 1 6 6v20z', g('yel'))}${fl(24, 46, 62, 5, c.O)}${hi(26, 35, 18, 2)}
${ci(38, 58, 11, g('dk'))}${ci(38, 58, 4, c.W)}${ci(78, 58, 9, g('dk'))}${ci(78, 58, 3, c.W)}
${sp(16, 14, 6)}${sp(148, 16, 5)}`),

  heavyLifting: pic(`
${rr(12, 30, 136, 6, g('stl'), 2)}${rr(32, 8, 14, 50, g('blu'), 3)}${rr(114, 8, 14, 50, g('blu'), 3)}${rr(48, 18, 10, 30, g('pnk'), 2)}${rr(102, 18, 10, 30, g('pnk'), 2)}
${fl(35, 12, 3, 20, c.tB)}${fl(117, 12, 3, 20, c.tB)}${fl(50, 21, 2, 14, c.tP)}${fl(104, 21, 2, 14, c.tP)}
${ln('M4 14h8M2 50h8M150 14h8M152 52h6', c.K, 2.4)}`),

  hydraulicPress: pic(
    `
${rr(20, 4, 14, 72, g('stl'), 2)}${rr(126, 4, 14, 72, g('stl'), 2)}${rr(14, 4, 132, 16, g('blu'), 2)}${rr(70, 20, 20, 24, g('stl'), 2)}${rr(76, 44, 8, 8, g('stl'))}
${ci(106, 12, 6, g('wht'))}${ln('M106 12l3-3', c.P, 2)}${ci(54, 12, 3, c.Y)}
${rr(46, 50, 68, 10, g('stl'), 2)}${rr(50, 60, 60, 8, g('cof'), 1)}${ln('M56 64h46', c.K, 1.6)}
${rr(10, 68, 140, 8, g('dk'), 1)}
${sp(34, 54, 7, c.Y)}${sp(126, 56, 7, c.Y)}${sp(40, 36, 5)}${sp(122, 36, 5)}${ln('M26 62l-10 4M134 62l10 4', c.K, 2.4)}`,
    true,
  ),

  hazardPay: pic(`
${ci(92, 34, 24, g('yel'))}
${ci(66, 34, 26, g('yel'))}${ln('M66 12a22 22 0 1 0 0.1 0', c.O, 2)}
${sh(pie(66, 34, 17, -150, -90), c.K)}${sh(pie(66, 34, 17, -30, 30), c.K)}${sh(pie(66, 34, 17, 90, 150), c.K)}${ci(66, 34, 5, c.Y)}${ln('M66 34m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0', c.K, 2)}
${hi(48, 18, 8, 3)}
${sh('M134 30c-5 9-8 12-8 18a8 8 0 0 0 16 0c0-6-3-9-8-18z', g('pnk'))}${hi(130, 42, 2, 4)}${sp(24, 14, 6)}${sp(140, 10, 5)}`),

  toolBelt: pic(`
${rr(30, 4, 8, 34, g('cof'))}${rr(24, 2, 20, 10, g('stl'), 2)}
${rr(100, 8, 8, 32, g('yel'), 3)}${sh('M102 8h4l-1-6h-2z', g('stl'))}
${rr(112, 14, 6, 26, g('stl'), 2)}
${rr(4, 32, 152, 16, g('cof'), 2)}${ln('M10 40h140', c.W, 1.4)}
${rr(14, 42, 34, 24, g('org'), 3)}${ln('M14 50h34', c.K, 2)}${rr(104, 42, 34, 24, g('org'), 3)}${ln('M104 50h34', c.K, 2)}
${rr(66, 28, 28, 24, g('yel'), 4)}${rr(72, 33, 16, 14, g('cof'), 2)}${fl(76, 38, 8, 4, c.Y)}${hi(70, 30, 12, 2)}
${ci(66, 56, 9, g('pnk'))}${ci(66, 56, 3, c.W)}${ln('M66 47v-3', c.K, 2)}${sp(148, 12, 6)}${sp(10, 20, 5)}`),

  releaseTheHounds: pic(`
${sh('M52 16L38 4 28 34l22 8z', g('cof'))}${sh('M108 16l14-12 10 30-22 8z', g('cof'))}
${el(80, 36, 32, 28, g('org'))}
${el(80, 48, 20, 14, g('wht'))}${sh('M72 40l8-4 8 4-8 8z', c.K)}
${ln('M60 26l12 6M100 26l-12 6', c.K, 3.4)}${ci(66, 32, 5, c.P)}${ci(94, 32, 5, c.P)}${ci(66, 33, 2, c.K)}${ci(94, 33, 2, c.K)}
${sh('M64 52l4 9 4-9zM72 54l4 9 4-9zM84 54l4 9 4-9zM92 52l4 9 4-9z', c.W)}${ln('M62 52q18 8 36 0', c.K, 2.4)}
${rr(46, 60, 68, 8, g('pnk'), 3)}${ci(58, 64, 2, c.W)}${ci(80, 64, 2, c.W)}${ci(102, 64, 2, c.W)}
${sh('M86 64c-2 4-3 5-3 7a3 3 0 0 0 6 0c0-2-1-3-3-7z', c.tB)}${ln('M20 16l8 4M140 20l-8 4M16 40l8 0', c.K, 2.4)}`),

  barbedWire: pic(`
${rr(6, 6, 12, 60, g('cof'), 2)}${rr(142, 6, 12, 60, g('cof'), 2)}
${[0, 1, 2, 3].map((i) => `<ellipse cx="${34 + i * 28}" cy="38" rx="16" ry="26" fill="none" stroke="${c.K}" stroke-width="5.4"/><ellipse cx="${34 + i * 28}" cy="38" rx="16" ry="26" fill="none" stroke="${c.tK}" stroke-width="2.2"/>`).join('')}
${[0, 1, 2, 3].map((i) => `${sh(`M${34 + i * 28} 10l-5-7M${34 + i * 28} 10l5-7`, c.K)}${ln(`M${34 + i * 28 - 6} 6l12 8M${34 + i * 28 + 6} 6l-12 8`, c.K, 2.4)}`).join('')}
${ln('M18 38h124', c.K, 1.4)}${sp(80, 60, 6, c.Y)}`),

  blowOffSteam: pic(`
${ci(54, 34, 28, g('wht'))}${ln('M54 12a22 22 0 0 1 22 22', c.P, 5)}${ln('M54 12a22 22 0 0 0-22 22M54 12a22 22 0 0 1 12 3', c.K, 1.4)}
${ln('M54 14v3M54 51v3M32 34h3M73 34h3M38 18l2 2M70 18l-2 2M38 50l2-2M70 50l-2-2', c.K, 2)}${ln('M54 34L68 20', c.K, 3)}${ci(54, 34, 4, c.K)}${hi(36, 22, 8, 2)}
${rr(46, 60, 30, 8, g('stl'), 2)}${rr(80, 36, 28, 10, g('stl'), 2)}${ci(100, 26, 7, g('pnk'))}${ln('M100 33v3', c.K, 3)}
${ci(122, 28, 12, c.W)}${ci(138, 38, 9, g('wht'))}${ci(124, 48, 8, c.W)}${ci(146, 24, 6, g('wht'))}${ln('M114 50l-6 6M132 54l-2 8', c.K, 2.4)}`),

  steelToes: pic(`
${sh('M34 4h34v34l36 8c10 3 16 8 16 14v8H30z', g('yel'))}
${sh('M94 44c12 3 26 6 26 16v8H94z', g('stl'))}${ln('M94 44c12 3 26 6 26 16', c.K, 2.4)}${hi(98, 48, 14, 3)}
${ln('M40 14h24M40 22h24M42 30h24', c.W, 2.4)}${rr(30, 60, 92, 8, g('dk'), 2)}${fl(36, 63, 78, 2, c.tK)}
${rr(32, 2, 38, 8, g('pnk'), 2)}${sp(128, 40, 7)}${sp(22, 24, 5)}${ln('M128 54l8 4', c.K, 2.4)}`),

  overstock: pic(`
${rr(8, 38, 54, 28, g('yel'), 1)}${fl(28, 38, 14, 28, c.tK)}${rr(66, 34, 56, 32, g('yel'), 1)}${fl(86, 34, 14, 32, c.tK)}${rr(124, 44, 30, 22, g('yel'), 1)}
${ln('M8 38h54M66 34h56', c.K, 2)}
<g transform="rotate(-8 60 22)">${rr(22, 8, 52, 28, g('yel'), 1)}${fl(42, 8, 14, 28, c.tK)}${rr(26, 20, 12, 10, c.P)}</g>
${sh('M116 36l6-4 6 4v6h-12z', c.W)}${hi(14, 42, 8, 2)}${hi(72, 38, 10, 2)}${sp(142, 20, 6)}${sp(104, 12, 5)}`),

  masochist: pic(`
${sh('M80 62C32 38 24 20 36 10c10-6 32-2 44 12 12-14 34-18 44-12 12 10 4 28-44 52z', g('pnk'))}
${hi(40, 16, 10, 3)}
${[
  [30, 36, 14, 44],
  [128, 36, 144, 44],
  [80, 12, 80, 2],
  [58, 56, 50, 66],
  [104, 58, 112, 66],
]
  .map(([x1, y1, x2, y2]) => `${ln(`M${x1} ${y1}L${x2} ${y2}`, c.K, 5)}${ln(`M${x1} ${y1}L${x2} ${y2}`, c.tK, 2.4)}${ci(x2, y2, 2.6, c.W)}`)
  .join('')}
${ln('M66 30q6 6 12 0M86 30q6 6 12 0', c.K, 2.6)}${sh('M70 42q10 8 20 0', c.K)}${sp(20, 20, 5)}${sp(142, 20, 5)}`),

  bobTheBuilder: pic(`
${rr(14, 50, 32, 12, g('org'))}${rr(22, 38, 32, 12, g('org'))}${rr(114, 50, 32, 12, g('org'))}${ln('M30 38v12M130 50v12', c.R, 1.6)}${hi(16, 52, 10, 2)}${hi(24, 40, 10, 2)}${hi(116, 52, 10, 2)}
${sh('M44 40a36 30 0 0 1 72 0z', g('yel'))}${rr(73, 10, 14, 30, g('org'))}${rr(32, 38, 96, 9, g('yel'), 4)}
${ln('M50 32a30 24 0 0 1 12-12', c.W, 2.6)}${fl(40, 44, 80, 2, c.O)}${sp(138, 16, 7)}`),

  bellaCiao: pic(`
${cord('M108 22a14 14 0 0 1 0 24M120 14a26 26 0 0 1 0 40M132 8a38 38 0 0 1 0 52', c.Y, 3.2)}
${rr(48, 40, 10, 20, g('blu'), 2)}${rr(16, 26, 16, 16, g('blu'), 3)}${sh('M32 28l60-20v50L32 40z', g('pnk'))}${rr(88, 4, 9, 56, g('wht'), 3)}
${sh('M44 33l40-12v6L44 38z', c.W)}${ln('M52 36v6M66 30v14', c.R, 1.6)}${hi(19, 28, 6, 2)}`),

  skillIssue: pic(`
${sh('M80 6l32 50H48z', g('wht'))}${fl(69, 24, 22, 10, c.P)}${fl(58, 42, 44, 10, c.B)}${sh('M80 6l32 50H48z', 'none')}
${el(80, 56, 36, 7, g('pnk'))}${ci(80, 6, 5, g('yel'))}
${cord('M71 22v22h14', c.W, 2)}${sp(30, 30, 8, c.Y)}${sp(132, 24, 9, c.Y)}${sp(128, 52, 6)}`),

  cactusOnTheDesk: pic(`
${sh('M18 56h124l-4 8H22z', g('cof'))}${rr(18, 52, 124, 6, g('org'))}
${sh('M72 34H58a5 5 0 0 1-5-5V16a5 5 0 0 1 10 0v6h9z', g('grn'))}${sh('M90 30h14a5 5 0 0 0 5-5V12a5 5 0 0 0-10 0v6h-9z', g('grn'))}
${rr(72, 6, 18, 38, g('grn'), 9)}${ln('M79 10v32M85 10v32', c.N, 1.4)}${fl(74, 12, 2, 24, c.YB)}
${sh('M64 44h34l-5 9H69z', g('pnk'))}${rr(62, 38, 38, 8, g('pnk'), 1)}${hi(65, 40, 12, 2)}
${ln('M70 10l-3-2M92 10l3-2M52 20l-3-1M112 18l3-2M66 36l-3 2M96 36l3 2', c.W, 1.6)}
${sh(star(81, 5, 7, 3, 5, -Math.PI / 2), c.P)}${ci(81, 5, 2, c.Y)}
${sh('M112 40h26l-6 12h-14z', g('blu'))}${fl(116, 43, 14, 2, c.W)}${rr(30, 40, 20, 12, c.W)}${fl(33, 43, 12, 2, c.B)}${fl(33, 47, 8, 2, c.B)}`),

  stopTheLine: pic(`
${sh('M36 52h88v12H36z', g('yel'))}${ln('M44 52l-6 12M60 52l-6 12M76 52l-6 12M92 52l-6 12M108 52l-6 12M124 52l-6 12', c.K, 3)}
${el(80, 52, 40, 8, g('stl'))}${rr(64, 36, 32, 16, g('dk'), 2)}
${sh('M48 38a32 26 0 0 1 64 0c0 4-14 8-32 8s-32-4-32-8z', g('pnk'))}${hi(58, 18, 14, 3)}
${ln('M28 12l8 8M132 12l-8 8M14 30h12M146 30h-12', c.K, 2.6)}${sp(22, 50, 6)}${sp(140, 52, 6, c.Y)}`),

  hardshipCase: pic(`
${sh('M20 18h34l8-10H20z', g('yel'))}${rr(20, 16, 108, 48, g('yel'), 2)}${ln('M20 28h108', c.O, 2)}
<g transform="rotate(6 100 38)">${rr(78, 22, 38, 34, c.Y)}${ci(90, 36, 2, c.K)}${ci(104, 36, 2, c.K)}${ln('M88 48q8-6 16 0', c.K, 2.4)}${sh('M106 38c-2 4-3 5-3 7a3 3 0 0 0 6 0c0-2-1-3-3-7z', g('blu'))}</g>
${ln('M30 36h36M30 44h30M30 52h34', c.K, 2)}${rr(132, 14, 8, 22, g('stl'), 3)}${sp(144, 50, 6)}`),

  indexFund: pic(`
${rr(18, 44, 20, 22, g('blu'))}${rr(44, 34, 20, 32, g('blu'))}${rr(70, 22, 20, 44, g('blu'))}${rr(96, 8, 20, 58, g('blu'))}
${hi(21, 47, 3, 10)}${hi(47, 37, 3, 14)}${hi(73, 25, 3, 18)}${hi(99, 11, 3, 24)}
${cord('M14 40L58 28 84 16 126 4', c.Y, 3)}${sh('M132 2l-2 14-8-6z', c.Y)}
${ci(136, 50, 14, g('yel'))}${ln('M136 42v16M131 46c0-6 10-6 10 0s-10 6-10 12 10 4 10-1', c.K, 2.2)}${sp(14, 14, 6)}`),

  trustFall: pic(`
<g transform="rotate(62 70 26)">${ci(70, 8, 9, g('yel'))}${rr(62, 18, 16, 28, g('blu'), 3)}${rr(62, 44, 7, 16, g('dk'), 2)}${rr(71, 44, 7, 16, g('dk'), 2)}${ln('M62 26l16 8M78 26l-16 8', c.K, 2.4)}</g>
${sh('M82 60c-8-6-6-14 2-12l12 8 8 6c4 4-2 10-8 6z', g('org'))}${sh('M128 60c8-6 6-14-2-12l-12 8-8 6c-4 4 2 10 8 6z', g('org'))}
${ln('M96 54v-2M104 52v-2M112 54v-2', c.R, 2)}${ln('M8 14h14M4 28h12M14 44h14', c.K, 2.4)}${sp(140, 14, 6)}${ln('M116 12v12M116 30v2', c.P, 3.6)}`),

  step1: pic(stairs(1)),
  step2: pic(stairs(2)),
  step3: pic(stairs(3)),
  step4: pic(
    `${stairs(4)}${sh('M124 6c10 2 14 8 12 14l-4 8h-16l-4-8c-2-6 2-12 12-14z', g('yel'))}${ln('M128 14v12M124 18c0-5 8-5 8 0s-8 4-8 9 8 3 8-1', c.K, 2)}${sp(150, 14, 6)}${sp(104, 8, 5, c.Y)}`,
  ),

  hotPotato: pic(`
${sh('M26 40c-4-16 14-26 38-24s46 8 48 24-18 26-46 24-36-8-40-24z', g('yel'))}${ci(54, 36, 2, c.R)}${ci(78, 28, 2, c.R)}${ci(92, 44, 2, c.R)}${ci(64, 50, 2, c.R)}${hi(40, 22, 12, 3)}
${sh('M70 18c-10-8 0-16 2-20 2 6 8 6 6 14 6-2 9-8 6-13 12 8 10 22-4 26-10 3-18-2-10-7z', g('flm'))}${sh('M80 18c-4-4 0-8 2-10 2 4 6 4 4 8 4 0 4 4-2 6-4 2-8-2-4-4z', c.Y)}
${sp(128, 14, 6)}${ln('M126 40l10-4M126 50l10 4M16 20l8 6', c.K, 2.4)}`),

  goodVibesOnly: pic(`
${sh(star(80, 36, 38, 28, 14, 0.1), g('pnk'))}${ci(80, 36, 26, g('yel'))}
${el(70, 30, 3, 5, c.K)}${el(90, 30, 3, 5, c.K)}${ln('M64 42q16 14 32 0', c.K, 3)}${ci(62, 40, 4, c.tP)}${ci(98, 40, 4, c.tP)}${hi(64, 20, 10, 3)}
${sp(18, 14, 6)}${sp(142, 56, 6)}${sp(140, 12, 5, c.Y)}`),

  forkliftCertified: pic(`
${rr(26, 8, 108, 50, g('wht'), 2)}${rr(32, 14, 96, 38, c.W)}${ln('M32 14h96v38H32z', c.Y, 2)}
${ln('M40 24h36M40 32h30M40 40h34', c.K, 2)}
${sh('M92 44V32h14l4 6h6v6z', g('yel'))}${ln('M114 22v22', c.K, 2.4)}${ci(96, 46, 3, c.K)}${ci(108, 46, 3, c.K)}
${sh('M110 52l-6 14 8-4 4 8 4-16z', g('pnk'))}${ci(118, 52, 12, g('pnk'))}${ci(118, 52, 7, c.Y)}${sp(18, 22, 6)}`),

  dressCode: pic(`
${sh('M44 8l36 18 36-18 8 16-44 18-44-18z', g('wht'))}${ln('M80 26L44 8M80 26l36-18', c.K, 2)}
${sh('M70 26h20l-2 10H72z', g('pnk'))}${sh('M72 36h16l8 30-16 6-16-6z', g('pnk'))}${ln('M70 46l20-6M68 56l24-6', c.W, 2.4)}
${ln('M26 60h14M120 60h14M26 66h10', c.K, 2.4)}${ci(46, 58, 2, c.K)}${sp(138, 20, 6)}`),

  inspectorGadget: pic(`
${sh('M84 20a24 14 0 0 1 48 0z', g('dk'))}${el(108, 20, 34, 6, g('dk'))}${fl(88, 16, 40, 4, c.P)}
${cord('M86 54l8 6-6 4 10 6-6 4 8 6', c.tK, 2.6)}${ci(116, 74, 0.1, c.K)}${ci(112, 62, 6, g('pnk'))}
<circle cx="66" cy="34" r="26" fill="${c.W}" stroke="${c.K}" stroke-width="10.4"/><circle cx="66" cy="34" r="26" fill="none" stroke="${g('stl')}" stroke-width="6"/>
${hi(50, 20, 12, 3)}${hi(48, 26, 4, 8)}${ln('M76 36l6-8M82 40l10 2', c.K, 2.4)}${el(66, 34, 8, 5, c.W)}${ci(66, 34, 3, c.B)}
${sp(138, 44, 6)}${sp(18, 58, 5)}`),

  spanishInquisition: pic(`
${burst(80, 36, 40, 24, g('rsun'))}
${cord('M34 42v18M46 46v20M114 46v20M126 42v18', c.P, 1.6)}${ci(34, 62, 4, g('pnk'))}${ci(46, 67, 4, g('pnk'))}${ci(114, 67, 4, g('pnk'))}${ci(126, 62, 4, g('pnk'))}
${sh('M52 40a28 26 0 0 1 56 0z', g('pnk'))}${el(80, 42, 54, 11, g('pnk'))}${hi(62, 18, 12, 3)}${ln('M26 42c14 8 94 8 108 0', c.R, 2)}
${fl(77, 6, 6, 12, c.P)}${sp(18, 12, 6)}${sp(142, 14, 6)}`),

  paperTrail: pic(`
${[
  [22, 46, -14, 26],
  [52, 34, -8, 28],
  [86, 22, 0, 30],
  [122, 10, 8, 32],
]
  .map(
    ([x, y, r, h]) =>
      `<g transform="rotate(${r} ${x + 14} ${y + h / 2})">${rr(x, y, 28, h, g('wht'))}${ln(`M${x + 4} ${y + 8}h20M${x + 4} ${y + 14}h16M${x + 4} ${y + 20}h20`, c.K, 1.6)}</g>`,
  )
  .join('')}
${ln('M14 64q40 4 56-10t60-36', c.K, 2.4)}${ln('M14 64q40 4 56-10t60-36', c.W, 1.2)}
${rr(138, 44, 6, 18, g('stl'), 3)}${sp(150, 30, 6)}${sp(10, 20, 5)}`),

  legDay: pic(`
${sh('M44 4h36l8 30-8 8H48z', g('yel'))}${hi(52, 10, 6, 14)}${ln('M62 12c6 6 6 16 2 24', c.O, 2)}
${sh('M52 42h30l-4 14H56z', g('yel'))}${rr(54, 54, 26, 8, c.W, 1)}${fl(54, 57, 26, 2, c.P)}
${sh('M50 62h36c10 0 14 4 14 8v2H44z', g('pnk'))}${fl(46, 70, 54, 2, c.K)}
${sh('M112 14c-3 6-5 8-5 11a5 5 0 0 0 10 0c0-3-2-5-5-11z', g('blu'))}${sh('M30 22c-3 6-5 8-5 11a5 5 0 0 0 10 0c0-3-2-5-5-11z', g('blu'))}
${ln('M96 10l12-6M100 28l14 0M96 46l12 6', c.K, 2.4)}${sp(138, 40, 6)}`),

  whistleblower: pic(`
${cord('M100 22C110 4 134 6 140 20', c.P, 2)}
${cord('M126 28a14 14 0 0 1 0 22M138 22a24 24 0 0 1 0 34M150 16a34 34 0 0 1 0 46', c.Y, 2.6)}
${sh('M56 22a24 20 0 1 0 0.1 0z', g('stl'))}${rr(70, 28, 40, 14, g('stl'), 3)}${rr(84, 20, 18, 8, c.K, 2)}${ci(52, 38, 7, c.K)}${hi(40, 28, 10, 3)}${ci(98, 18, 6, c.W)}${sp(14, 14, 6)}`),

  fleshWound: pic(`
<g transform="rotate(-28 80 36)">${rr(16, 22, 128, 28, g('yel'), 14)}${rr(58, 22, 44, 28, g('wht'))}${ci(70, 31, 1.6, c.K)}${ci(80, 31, 1.6, c.K)}${ci(90, 31, 1.6, c.K)}${ci(70, 41, 1.6, c.K)}${ci(80, 41, 1.6, c.K)}${ci(90, 41, 1.6, c.K)}${hi(24, 26, 24, 3)}</g>
${sh('M118 44c-5 9-8 12-8 18a8 8 0 0 0 16 0c0-6-3-9-8-18z', g('pnk'))}${sh('M36 52c-3 6-5 8-5 11a5 5 0 0 0 10 0c0-3-2-5-5-11z', g('pnk'))}${hi(113, 56, 3, 5)}${sp(138, 12, 6)}${sp(22, 12, 5)}`),

  pumpIron: pic(`
${sh('M56 22a24 18 0 0 1 48 0', 'none')}<path d="M56 24a24 22 0 0 1 48 0" fill="none" stroke="${c.K}" stroke-width="12.4" stroke-linecap="round"/><path d="M56 24a24 22 0 0 1 48 0" fill="none" stroke="${g('stl')}" stroke-width="7" stroke-linecap="round"/>
${ci(80, 46, 28, g('dk'))}${rr(64, 34, 32, 8, c.W, 2)}${fl(68, 37, 24, 2, c.K)}${hi(62, 40, 8, 6)}
${sh('M126 14c-3 6-5 8-5 11a5 5 0 0 0 10 0c0-3-2-5-5-11z', g('blu'))}${sh('M30 16c-3 6-5 8-5 11a5 5 0 0 0 10 0c0-3-2-5-5-11z', g('blu'))}
${burst(130, 50, 14, 7, c.Y)}${ln('M18 44l10 0M16 56l12-4', c.K, 2.4)}`),

  buyNowPayLater: pic(`
<g transform="rotate(-9 64 38)">${rr(18, 10, 88, 54, g('blu'), 6)}${fl(20, 20, 84, 9, c.K)}${rr(28, 34, 18, 13, g('yel'), 2)}${ln('M52 40h40M28 56h30', c.W, 2.4)}</g>
${ci(124, 46, 20, g('wht'))}${ln('M124 46v-12M124 46l9 6M124 28v2M124 64v2M106 46h2M142 46h2', c.K, 2.4)}${ci(124, 46, 3, c.K)}${hi(112, 36, 8, 2)}
${sp(22, 58, 6)}${sp(146, 14, 6)}`),

  eightHours: pic(`
${ci(80, 36, 30, g('wht'))}<circle cx="80" cy="36" r="30" fill="none" stroke="${c.K}" stroke-width="6"/>
${ln('M80 10v5M80 57v5M54 36h5M101 36h5M62 18l3 4M98 18l-3 4M62 54l3-4M98 54l-3-4', c.K, 2.6)}
${ln('M80 36L66 44', c.K, 4)}${ln('M80 36V16', c.K, 3)}${ci(80, 36, 4, c.P)}${hi(60, 20, 10, 3)}
${cord('M122 18a22 22 0 0 1 8 22', c.Y, 3)}${sh('M132 38l-6 8-6-8z', c.Y)}${cord('M38 54a22 22 0 0 1-8-22', c.Y, 3)}${sh('M28 34l6-8 6 8z', c.Y)}
${sp(144, 56, 6)}${sp(16, 12, 6)}`),

  raiseDenied: pic(`
${sh('M64 4h32l-4 22H68z', g('cof'))}${rr(50, 26, 60, 12, g('cof'), 3)}${rr(56, 38, 48, 6, g('dk'), 1)}${hi(70, 8, 4, 12)}
${rr(22, 48, 116, 18, c.W, 1)}${ln('M30 58h26M30 63h18', c.K, 1.6)}
<g transform="rotate(-10 100 57)">${rr(78, 48, 52, 16, c.W)}${ln('M78 48h52v16H78z', c.P, 3.4)}${ln('M88 52l8 8M96 52l-8 8M104 54h20M104 59h14', c.P, 2.4)}</g>
${sp(18, 22, 6)}${sp(144, 22, 6)}${ln('M32 40l8 4M128 40l-8 4', c.K, 2.4)}`),

  itsAMe: pic(`
${sh('M52 38h56v18a10 10 0 0 1-10 10H62a10 10 0 0 1-10-10z', g('wht'))}
${el(72, 52, 3, 7, c.K)}${el(88, 52, 3, 7, c.K)}
${sh('M22 40a58 36 0 0 1 116 0z', g('pnk'))}${ci(46, 28, 10, c.W)}${ci(80, 14, 11, c.W)}${ci(114, 28, 10, c.W)}${hi(32, 24, 8, 3)}
${sp(18, 12, 6, c.Y)}${sp(144, 12, 6, c.Y)}${sp(140, 54, 5)}`),

  passTheBuck: pic(`
${rr(18, 22, 70, 36, g('grn'), 3)}${el(53, 40, 14, 11, c.W)}${ln('M53 32v16M49 36c0-5 8-5 8 0s-8 4-8 9 8 3 8-1', c.K, 2)}${ln('M24 28h8M74 52h8', c.W, 2.4)}
${cord('M96 38C108 16 132 18 138 34', c.P, 3)}${sh('M144 40l-12-2 6-10z', c.P)}
<g transform="rotate(10 124 46)">${rr(106, 38, 44, 24, g('grn'), 3)}${el(128, 50, 8, 6, c.W)}</g>
${sp(20, 8, 6)}${sp(120, 8, 5)}`),

  printerSmash: pic(
    `
${burst(100, 42, 36, 18, g('rsun'))}
${rr(44, 16, 62, 14, c.W, 1)}${ln('M52 22h40M52 26h30', c.K, 1.6)}
${rr(30, 28, 100, 38, g('wht'), 3)}${rr(40, 34, 40, 10, g('dk'), 2)}${ln('M44 38l10 4M58 36l12 6', c.W, 1.6)}${ci(104, 38, 3, c.P)}${ci(114, 38, 3, c.Y)}${rr(94, 46, 28, 6, g('stl'), 1)}
${rr(50, 62, 56, 8, c.W, 1)}${ln('M56 66h30', c.P, 2.4)}
<g transform="rotate(-38 44 20)">${rr(40, 2, 8, 40, g('cof'), 2)}${rr(26, -2, 36, 14, g('stl'), 2)}</g>
<g transform="rotate(14 20 62)">${rr(8, 56, 24, 18, c.W)}${ln('M12 62h14M12 67h10', c.K, 1.6)}</g><g transform="rotate(-20 142 22)">${rr(130, 14, 24, 18, c.W)}${ln('M134 20h14M134 25h10', c.K, 1.6)}</g>
${sp(150, 58, 7, c.Y)}${sp(14, 36, 6)}`,
    true,
  ),

  declareBankruptcy: pic(
    `
${sh('M24 36c0-8 8-10 16-10h72c8 0 16 2 16 10v28H24z', g('cof'))}${sh('M24 36c8-14 20-18 40-18h24c24 0 36 6 44 18z', g('org'))}${ln('M44 26h72', c.O, 2)}
${el(80, 40, 40, 8, c.K)}${ln('M60 30l-6-8M100 30l8-8', c.K, 2.4)}
<g transform="rotate(-6 60 12)">${sh('M44 6c-6-4-12 0-10 6 4 2 8 2 12 0z', c.W)}${sh('M60 6c6-4 12 0 10 6-4 2-8 2-12 0z', c.W)}${rr(54, 4, 6, 12, g('dk'), 2)}</g>
${ci(132, 62, 11, g('yel'))}${ln('M132 56v12', c.K, 2.2)}${ci(148, 54, 8, g('yel'))}${ci(118, 70, 7, g('yel'))}${ln('M96 70h6M104 62l4-2', c.K, 2.4)}
<g transform="rotate(-14 84 56)">${rr(44, 46, 80, 24, c.W)}${ln('M44 46h80v24H44z', c.P, 4.4)}${fl(52, 52, 40, 4, c.P)}${fl(52, 60, 28, 3, c.P)}${fl(100, 54, 16, 10, c.P)}</g>
${sp(14, 18, 7)}${sp(148, 14, 6, c.Y)}`,
    true,
  ),

  backPay: pic(
    `
${rr(16, 14, 100, 52, c.W, 2)}${rr(16, 14, 100, 12, g('grn'), 2)}${fl(22, 18, 28, 3, c.W)}${ln('M24 36h50M24 44h44M24 52h30', c.K, 2)}${rr(80, 40, 28, 18, g('yel'), 2)}${ln('M85 49h18', c.K, 2.4)}
${ln('M120 22l8-6M124 38h12', c.K, 2.4)}
${sh('M108 26l10 4v26l-12-4zM124 24l10 6v26l-10-6z', c.W)}${sh('M104 24c8 2 14 6 14 6v-4z', c.K)}
${sh('M112 18c0-6 8-8 12-4l12 28c1 6-3 10-8 8L110 36c-2-4-2-12 2-18z', c.W)}${sh('M106 20l6 26 6-26zM126 24l6 24 6-24z', c.W)}
${sh('M110 50c-3 8-5 10-5 13a5 5 0 0 0 10 0c0-3-2-5-5-13z', g('pnk'))}${sh('M132 52c-3 8-5 10-5 13a5 5 0 0 0 10 0c0-3-2-5-5-13z', g('pnk'))}
${sp(148, 12, 6)}${sp(10, 70, 5)}`,
    true,
  ),

  pyramidScheme: pic(
    `
${sh('M80 6L130 68H30z', g('yel'))}${ln('M52 38h56M42 52h76M64 24h32', c.O, 2)}${ln('M80 6L80 68M62 38v14M98 38v14M52 52v16M108 52v16', c.O, 1.4)}
${sh('M80 6l14 18H66z', g('pnk'))}${el(80, 17, 7, 4, c.W)}${ci(80, 17, 2.4, c.K)}
${ln('M80 -2v4M60 8l-6-4M100 8l6-4M44 20l-8-2M116 20l8-2', c.Y, 2.6)}
${ci(24, 62, 9, g('yel'))}${ci(14, 70, 8, g('yel'))}${ci(138, 62, 9, g('yel'))}${ci(148, 70, 8, g('yel'))}${ln('M24 57v10M138 57v10', c.K, 2)}
${sp(22, 22, 7)}${sp(140, 28, 7)}`,
    true,
  ),
};
