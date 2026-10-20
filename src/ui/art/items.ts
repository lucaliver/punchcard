import { C, circ, ell, eye, INK, ln, p, rect, solid, svg } from './kit';

/** Charms (the pictures of one-shot cards) and trinkets (relics). Objects, so no faces: a shape you read at a glance. */

const tag = (x: number, y: number, w: number, h: number, rot = 0): string =>
  `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${rect(x, y, w, h, C.cream, { w: 3.2, r: 2 })}${rect(x + w * 0.3, y + h * 0.18, w * 0.4, h * 0.2, C.red, { w: 0 })}${ln(`M${x + w * 0.5} ${y + h * 0.42} V${y + h * 0.86}`, INK, 2.6)}${ln(`M${x + w * 0.3} ${y + h * 0.58} H${x + w * 0.7}`, INK, 2.2)}</g>`;

export const CHARM_ART: Record<string, string> = {
  /** A goma fire: flames in a bowl, with a talisman held over them. */
  goma: svg(
    [
      p('M14 74 Q50 100 86 74 L80 62 H20Z', '#6a3a22', { w: 3.6 }),
      solid('M50 6 Q70 28 74 46 Q78 66 50 68 Q22 66 26 46 Q30 36 40 28 Q42 40 50 36 Q52 22 50 6Z', '#f5662a'),
      ell(50, 50, 9, 12, '#ffd36a', { w: 0 }),
      tag(66, 20, 20, 36, 12),
    ].join(''),
  ),

  /** A kekkai: a barrier of light, square and sealed. */
  kekkai: svg(
    [
      rect(10, 10, 80, 80, 'rgba(140,200,240,0.35)', { w: 4, r: 6 }),
      ln('M10 36 H90 M10 64 H90 M36 10 V90 M64 10 V90', '#bfe6ff', 2.6),
      circ(50, 50, 16, C.cream, { w: 3.4 }),
      ln('M50 38 V62 M38 50 H62', C.red, 4),
    ].join(''),
  ),

  /** The pentagram of Seimei: five points in a ring of light. */
  pentagram: svg(
    [
      circ(50, 52, 40, 'rgba(255,211,106,0.25)', { w: 4 }),
      circ(50, 52, 33, 'none', { w: 2.4, stroke: C.gold }),
      p('M50 14 L62 72 L14 36 L86 36 L38 72Z', 'rgba(255,243,214,0.5)', { w: 4 }),
      ...[0, 72, 144, 216, 288].map((a) =>
        circ(50 + Math.sin((a * Math.PI) / 180) * 33, 52 - Math.cos((a * Math.PI) / 180) * 33, 4, C.red, { w: 2.2 }),
      ),
    ].join(''),
  ),

  /** The Shiki Swarm: paper birds, a whole flock of them, from one sleeve. */
  shikiSwarm: svg(
    [
      ...[
        [10, 20, 0.6],
        [46, 8, 0.7],
        [64, 40, 0.55],
        [20, 54, 0.75],
        [48, 66, 0.6],
      ].map(
        ([x, y, k]) =>
          `<g transform="translate(${x} ${y}) scale(${k})">${p('M0 40 L36 28 L72 40 L36 60Z', C.cream, { w: 4 })}${p('M20 36 L4 8 L36 30Z', '#fffaf0', { w: 4 })}${p('M52 36 L68 8 L36 30Z', '#f0e6cf', { w: 4 })}${p('M46 30 L66 22 L60 36Z', C.red, { w: 3.6 })}</g>`,
      ),
    ].join(''),
  ),

  /** The sun goddess: a disc of light with rays, and a mirror at its heart. */
  amaterasu: svg(
    [
      ...Array.from({ length: 12 }, (_, i) => p('M46 6 L50 -2 L54 6Z', '#ffd36a', { w: 3, x: `transform="rotate(${i * 30} 50 50)"` })),
      ...Array.from({ length: 12 }, (_, i) => ln('M50 14 V26', '#fff1a8', 3, `transform="rotate(${i * 30 + 15} 50 50)"`)),
      circ(50, 50, 32, '#ffc23a', { w: 4.4 }),
      circ(50, 50, 24, '#fff3d6', { w: 3.4 }),
      circ(50, 50, 15, '#e8f2f8', { w: 3 }),
      ln('M42 44 Q48 38 56 42', C.white, 3.4),
      circ(50, 50, 4, C.red, { w: 2.4 }),
    ].join(''),
  ),

  ofuda: svg([tag(30, 10, 40, 80, 0), circ(50, 24, 5, C.red, { w: 2.4 })].join('')),

  sake: svg(
    [
      solid('M38 30 Q22 40 22 64 Q22 88 50 88 Q78 88 78 64 Q78 40 62 30Z', '#e8dcc0'),
      rect(42, 10, 16, 24, '#e8dcc0', { w: 3.4, r: 4 }),
      rect(40, 8, 20, 6, C.red, { w: 3, r: 2 }),
      ln('M32 60 Q50 70 68 60', C.blue, 3.4),
      ell(50, 62, 8, 7, C.blue, { w: 0, op: 0.45 }),
      p('M60 86 H92 L88 96 H64Z', '#f6e7c6', { w: 3 }),
    ].join(''),
  ),

  gust: svg(
    [
      ln('M12 34 H62 Q80 34 80 20 Q80 8 66 10', C.sky, 9),
      ln('M12 34 H62 Q80 34 80 20 Q80 8 66 10', INK, 2, 'opacity=".5"'),
      ln('M20 56 H78 Q94 56 92 70 Q90 82 76 80', '#cfeaff', 9),
      ln('M28 78 H50 Q60 78 60 86', C.sky, 7),
      ...[0, 1, 2].map((i) => p(`M${70 + i * 8} ${44 + i * 14} q6 -6 12 0 q-6 6 -12 0Z`, C.leaf, { w: 2.2 })),
    ].join(''),
  ),

  fireFan: svg(
    [
      p('M48 92 L26 40 Q50 14 74 40Z', C.cream, { w: 3.6 }),
      ln('M48 90 L36 48 M48 90 L48 40 M48 90 L60 48', '#d9c9a0', 2),
      ln('M48 92 L48 100', C.brown, 6),
      solid('M50 4 Q68 22 72 38 Q76 58 52 62 Q30 58 34 40 Q40 30 46 22 Q46 34 52 32 Q54 18 50 4Z', '#f5662a'),
      ell(52, 46, 9, 12, '#ffd36a', { w: 0 }),
    ].join(''),
  ),

  maneki: svg(
    [
      solid('M22 90 Q20 60 34 52 H66 Q80 60 78 90Z', C.white),
      solid('M26 40 Q26 20 50 20 Q74 20 74 40 Q74 58 50 60 Q26 58 26 40Z', C.white),
      p('M28 26 L26 8 L42 20Z M72 26 L74 8 L58 20Z', C.white, { w: 3.4 }),
      p('M30 20 L30 14 L36 20Z M70 20 L70 14 L64 20Z', C.pink, { w: 0 }),
      p('M70 52 Q84 46 86 28 Q92 20 96 28 Q96 52 78 62Z', C.white, { w: 3.4 }),
      circ(40, 38, 2.8, INK, { w: 0 }),
      circ(60, 38, 2.8, INK, { w: 0 }),
      p('M46 46 L50 49 L54 46Z', C.pink, { w: 2 }),
      ln('M50 49 V52 M44 53 Q50 57 56 53', INK, 2),
      rect(38, 58, 24, 7, C.red, { w: 2.6, r: 2 }),
      circ(50, 70, 7, C.gold, { w: 3 }),
      rect(47, 67, 6, 6, C.paper, { w: 1.6 }),
    ].join(''),
  ),

  oilJar: svg(
    [
      solid('M30 30 Q16 44 20 70 Q24 92 50 92 Q76 92 80 70 Q84 44 70 30Z', '#b0763a'),
      rect(34, 18, 32, 14, '#8a5a33', { w: 3.4, r: 3 }),
      p('M50 40 Q62 56 60 66 Q56 78 50 78 Q44 78 40 66 Q38 56 50 40Z', '#ffd36a', { w: 3 }),
      ell(50, 66, 5, 7, '#fff6c8', { w: 0 }),
      ln('M30 52 H70', '#5e3a1c', 2.4, 'opacity=".5"'),
    ].join(''),
  ),

  riceBall: svg(
    [
      solid('M50 12 Q88 62 82 78 Q72 92 50 92 Q28 92 18 78 Q12 62 50 12Z', C.white),
      p('M30 78 Q50 96 70 78 L66 58 H34Z', '#26352e', { w: 3.4 }),
      circ(44, 40, 2, '#e8dcc0', { w: 0 }),
      circ(58, 50, 2, '#e8dcc0', { w: 0 }),
      circ(46, 62, 1.6, '#f6e7c6', { w: 0 }),
      p('M48 20 Q58 14 64 20', C.red, { w: 0 }),
    ].join(''),
  ),

  talismanStorm: svg(
    [tag(6, 28, 26, 52, -22), tag(37, 14, 26, 52, 4), tag(68, 30, 26, 52, 24), tag(22, 52, 22, 40, -8), tag(56, 56, 22, 40, 10)].join(''),
  ),

  sacredRope: svg(
    [
      p('M8 30 Q50 52 92 30', 'none', { w: 11 }),
      ln('M8 30 Q50 52 92 30', '#e9dcb0', 8),
      ln('M8 30 Q50 52 92 30', '#b89c58', 3, 'stroke-dasharray="6 5"'),
      ...[26, 50, 74].map(
        (x, i) =>
          `<g transform="translate(${x} ${i === 1 ? 46 : 42})">${p('M0 0 l8 10 l-8 8 l8 10 l-8 8 l-8 -8 l8 -10 l-8 -8 l8 -10Z', C.white, { w: 2.8 })}</g>`,
      ),
    ].join(''),
  ),

  salt: svg(
    [
      solid('M10 74 Q10 94 50 94 Q90 94 90 74 Q90 66 50 66 Q10 66 10 74Z', '#7a8a9c'),
      p('M18 70 Q26 40 50 20 Q74 40 82 70 Q50 82 18 70Z', C.white, { w: 3.6 }),
      ln('M36 62 Q50 40 56 30', '#dfe8f0', 3),
      circ(26, 26, 2, '#fff', { w: 1.2 }),
      circ(78, 36, 2.4, '#fff', { w: 1.2 }),
      circ(68, 14, 1.8, '#fff', { w: 1.2 }),
    ].join(''),
  ),

  omamori: svg(
    [
      p('M50 4 V12', INK, { w: 4 }),
      solid('M26 22 Q50 12 74 22 L80 84 Q50 94 20 84Z', '#c4382a'),
      p('M32 24 Q50 18 68 24 L70 40 Q50 46 30 40Z', C.goldLight, { w: 3 }),
      ln('M40 58 H60 M40 70 H60 M50 52 V80', C.goldLight, 3.4),
      ln('M30 84 Q50 78 70 84', C.gold, 3),
      p('M44 92 V100 M56 92 V100', C.gold, { w: 3.4 }),
    ].join(''),
  ),

  shide: svg(
    [
      ln('M6 14 H94', '#b89c58', 5),
      ...[18, 40, 62, 84].map(
        (x, i) =>
          `<g transform="translate(${x} ${16 + (i % 2) * 4})">${p('M-8 0 H8 V22 L0 28 L8 34 V56 L-8 56 V34 L0 28 L-8 22Z', C.white, { w: 3 })}</g>`,
      ),
    ].join(''),
  ),

  exorcism: svg(
    [
      circ(50, 50, 40, 'none', { w: 3.6 }),
      circ(50, 50, 30, 'none', { w: 2.4, stroke: C.red }),
      ...[0, 1, 2, 3, 4, 5].map((i) => tag(43, 4, 14, 24, i * 60).replace('<g transform="rotate(', `<g transform="rotate(`)),
      solid('M38 56 Q38 44 50 44 Q62 44 62 56 L66 72 H34Z', '#c49a3c'),
      circ(50, 76, 4, C.coal, { w: 2.6 }),
    ].join(''),
  ),

  kunai: svg(
    [
      p('M50 2 L62 40 L56 60 H44 L38 40Z', '#cfd6e2', { w: 3.6 }),
      ln('M50 6 V54', '#8e9ab0', 2),
      rect(44, 58, 12, 8, C.coal, { w: 3, r: 2 }),
      rect(46, 66, 8, 22, '#4a3a58', { w: 3, r: 2 }),
      ln('M46 72 H54 M46 78 H54', C.red, 2),
      circ(50, 92, 6, 'none', { w: 3.4 }),
    ].join(''),
  ),

  riposte: svg(
    [
      p('M14 8 L56 58 L50 66 L6 18Z', '#cfd6e2', { w: 3.4 }),
      p('M86 8 L44 58 L50 66 L94 18Z', '#cfd6e2', { w: 3.4 }),
      rect(30, 56, 14, 6, C.gold, { w: 3, r: 2, x: 'transform="rotate(-40 37 59)"' }),
      rect(56, 56, 14, 6, C.gold, { w: 3, r: 2, x: 'transform="rotate(40 63 59)"' }),
      p('M24 66 L40 84 L32 92 L16 76Z', C.red, { w: 3 }),
      p('M76 66 L60 84 L68 92 L84 76Z', C.red, { w: 3 }),
      circ(50, 34, 4, C.goldLight, { w: 0 }),
    ].join(''),
  ),

  lastStand: svg(
    [
      ln('M24 4 V96', C.brown, 6),
      p('M24 8 H88 V70 H24Z', C.red, { w: 3.6 }),
      p('M24 8 H88 V16 H24Z', C.coal, { w: 3 }),
      circ(56, 42, 14, C.white, { w: 3 }),
      ln('M46 52 L56 30 L66 52 M49 46 H63', INK, 3.4),
      ln('M24 4 V96', C.brown, 0),
      circ(24, 4, 4, C.gold, { w: 3 }),
    ].join(''),
  ),

  pouch: svg(
    [
      solid('M24 40 Q8 62 18 80 Q30 94 50 94 Q70 94 82 80 Q92 62 76 40Z', '#8a2f55'),
      p('M30 36 Q50 50 70 36 L66 26 Q50 36 34 26Z', '#6a2040', { w: 3.4 }),
      ln('M34 28 Q50 38 66 28', C.gold, 3),
      circ(50, 66, 11, C.gold, { w: 3.2 }),
      rect(46, 62, 8, 8, '#8a2f55', { w: 2, r: 1 }),
      circ(26, 22, 5, C.goldLight, { w: 2.6 }),
      circ(76, 18, 5, C.goldLight, { w: 2.6 }),
    ].join(''),
  ),

  henge: svg(
    [
      p('M50 6 Q86 20 82 54 Q76 84 50 90 Q24 84 18 54 Q14 20 50 6Z', '#8cc152', { w: 3.6 }),
      ln('M50 10 V88', '#5d8a2a', 2.4),
      ln('M50 30 Q28 18 26 40 Q34 60 54 52 Q70 44 62 34 Q54 28 46 38', C.white, 3.8),
      circ(36, 16, 2.4, C.goldLight, { w: 1.4 }),
      circ(80, 76, 2.4, C.goldLight, { w: 1.4 }),
    ].join(''),
  ),

  parade: svg(
    [
      ln('M4 24 Q50 38 96 24', INK, 3),
      ...[16, 38, 60, 82].map(
        (x, i) =>
          `<g transform="translate(${x} ${(i % 2 ? 40 : 34) + 2})">${rect(-9, 0, 18, 6, C.coal, { w: 2.4, r: 1 })}${ell(0, 24, 12, 18, i % 2 ? C.red : C.cream, { w: 3 })}${ln('M-10 18 H10 M-11 30 H11', INK, 2)}${rect(-8, 38, 16, 5, C.coal, { w: 2.4, r: 1 })}</g>`,
      ),
    ].join(''),
  ),

  dice: svg(
    [
      `<g transform="rotate(-14 34 62)">${rect(8, 36, 50, 50, C.white, { w: 3.6, r: 9 })}${[
        [22, 50],
        [44, 72],
        [33, 61],
      ]
        .map(([x, y]) => circ(x, y, 4.4, INK, { w: 0 }))
        .join('')}</g>`,
      `<g transform="rotate(16 68 38)">${rect(46, 12, 44, 44, C.red, { w: 3.6, r: 8 })}${[
        [58, 24],
        [78, 24],
        [58, 44],
        [78, 44],
      ]
        .map(([x, y]) => circ(x, y, 4, C.white, { w: 0 }))
        .join('')}</g>`,
    ].join(''),
  ),
};

export const RELIC_ART: Record<string, string> = {
  /** A furin wind chime: a bell of glass and a paper strip that tells the wind what to say. */
  windChime: svg(
    [
      ln('M50 4 V22', INK, 4),
      solid('M24 56 Q24 24 50 22 Q76 24 76 56 L82 62 H18Z', '#bfe6ff'),
      circ(50, 66, 4, C.red, { w: 2.4 }),
      ln('M50 70 V84', INK, 2.4),
      p('M38 82 H62 V100 L50 94 L38 100Z', C.cream, { w: 3 }),
      ln('M50 84 V92', C.red, 2.4),
    ].join(''),
  ),
  /** A koinobori carp banner: it swims against the current, on principle. */
  koiBanner: svg(
    [
      ln('M20 6 V96', C.brown, 5),
      circ(20, 6, 4, C.gold, { w: 3 }),
      solid('M20 22 Q56 10 82 30 Q94 40 88 52 Q94 62 82 66 Q56 80 20 58Z', '#e4452f'),
      p('M82 30 L98 24 L96 40Z M82 66 L98 72 L96 56Z', '#c4382a', { w: 3 }),
      eye(40, 34, 6, { look: [-0.4, 0.2] }),
      ln('M52 28 Q58 42 52 56 M64 30 Q70 42 64 54', '#f0a58a', 2.4),
    ].join(''),
  ),
  /** A gourd of sake that never quite empties. */
  sakeGourd: svg(
    [
      ln('M50 4 Q56 14 50 22', C.leaf, 4),
      solid('M36 24 Q36 14 50 14 Q64 14 64 24 Q60 34 66 44 Q82 56 78 72 Q72 94 50 94 Q28 94 22 72 Q18 56 34 44 Q40 34 36 24Z', '#d49a3c'),
      ln('M40 36 Q50 40 60 36', '#8a5a33', 3),
      rect(34, 54, 32, 18, C.cream, { w: 2.6, r: 3 }),
      ln('M40 62 H60', INK, 2.4),
      p('M44 8 H56 L54 14 H46Z', C.red, { w: 2.6 }),
    ].join(''),
  ),
  /** The Daruma's second eye: the wish was granted, so it watches. */
  darumaEye: svg(
    [
      circ(50, 52, 40, '#e03a2f', { w: 4.4 }),
      ell(50, 50, 28, 22, C.cream, { w: 3.4 }),
      circ(50, 50, 11, INK, { w: 0 }),
      circ(46, 46, 3.4, C.white, { w: 0 }),
      ln('M26 34 Q36 24 46 30 M74 34 Q64 24 54 30', INK, 3.6),
      ln('M34 78 H66', C.goldLight, 3.4),
    ].join(''),
  ),

  oilFlask: svg(
    [
      solid('M38 24 Q18 36 18 62 Q18 90 50 90 Q82 90 82 62 Q82 36 62 24Z', '#d0a038'),
      rect(40, 8, 20, 20, '#a8802a', { w: 3.4, r: 3 }),
      circ(50, 8, 5, C.coal, { w: 3 }),
      ln('M28 60 Q50 70 72 60', '#8a6a1c', 3),
      p('M50 42 Q58 52 56 58 Q54 64 50 64 Q46 64 44 58 Q42 52 50 42Z', '#fff0a0', { w: 2.4 }),
    ].join(''),
  ),
  wickTrimmer: svg(
    [
      p('M24 14 L62 62 L54 70 L16 22Z', '#cfd6e2', { w: 3.4 }),
      p('M76 14 L38 62 L46 70 L84 22Z', '#cfd6e2', { w: 3.4 }),
      circ(30, 78, 14, 'none', { w: 5.4, stroke: INK }),
      circ(70, 78, 14, 'none', { w: 5.4, stroke: INK }),
      circ(30, 78, 14, 'none', { w: 2.6, stroke: C.red }),
      circ(70, 78, 14, 'none', { w: 2.6, stroke: C.red }),
      circ(50, 56, 3, C.gold, { w: 2.4 }),
    ].join(''),
  ),
  paperFan: svg(
    [
      p('M50 90 L8 38 Q50 4 92 38Z', C.cream, { w: 3.6 }),
      ln('M50 90 L22 30 M50 90 L36 18 M50 90 L50 14 M50 90 L64 18 M50 90 L78 30', '#c9a850', 2.4),
      circ(50, 40, 12, C.red, { w: 0 }),
      circ(50, 40, 7, C.cream, { w: 0 }),
      circ(50, 90, 5, C.brown, { w: 3 }),
    ].join(''),
  ),
  lanternGlass: svg(
    [
      p('M36 12 H64 V22 H36Z', C.coal, { w: 3.4 }),
      solid('M28 28 Q24 64 30 80 H70 Q76 64 72 28Z', '#bfe6ff'),
      ell(50, 58, 12, 18, '#ffd36a', { w: 2.6 }),
      ell(50, 62, 6, 10, '#fff6c8', { w: 0 }),
      rect(26, 78, 48, 10, C.coal, { w: 3.4, r: 3 }),
      ln('M50 10 V4', INK, 4),
    ].join(''),
  ),
  luckyPaw: svg(
    [
      solid('M24 92 Q18 56 32 44 Q40 30 50 34 Q60 30 68 44 Q82 56 76 92Z', '#f2c14a'),
      circ(36, 26, 9, '#f2c14a', { w: 3.6 }),
      circ(50, 18, 9, '#f2c14a', { w: 3.6 }),
      circ(64, 26, 9, '#f2c14a', { w: 3.6 }),
      ell(50, 62, 14, 12, C.pink, { w: 3 }),
      ln('M30 82 H70', INK, 3, 'opacity=".5"'),
    ].join(''),
  ),
  geta: svg(
    [
      p('M12 40 Q8 56 16 62 H84 Q92 56 88 40 Q50 28 12 40Z', '#c4883a', { w: 3.6 }),
      rect(24, 62, 12, 24, '#8a5a33', { w: 3.4, r: 2 }),
      rect(64, 62, 12, 24, '#8a5a33', { w: 3.4, r: 2 }),
      ln('M50 36 Q34 34 28 50 M50 36 Q66 34 72 50', C.red, 5),
      circ(50, 34, 4, C.red, { w: 2.6 }),
    ].join(''),
  ),
  thickBamboo: svg(
    [
      solid('M28 92 V14 Q28 6 50 6 Q72 6 72 14 V92Z', '#8cc152'),
      ln('M28 36 H72 M28 62 H72', '#5d8a2a', 3.4),
      ell(50, 8, 22, 6, '#e8e0b0', { w: 3.4 }),
      p('M72 36 Q94 28 96 14 Q80 18 72 28Z', '#6fa23a', { w: 3 }),
    ].join(''),
  ),
  whetstone: svg(
    [
      solid('M10 56 L24 34 H90 L80 60 Z', '#8e9ab0'),
      p('M10 56 H80 V76 H10Z', '#6e7a8c', { w: 3.4 }),
      p('M30 24 L78 12 L80 20 L32 34Z', '#cfd6e2', { w: 3.2 }),
      circ(46, 46, 2, '#fff', { w: 0 }),
      circ(66, 44, 1.6, '#fff', { w: 0 }),
    ].join(''),
  ),
  fortuneScroll: svg(
    [
      rect(22, 14, 56, 72, C.cream, { w: 3.6, r: 4 }),
      rect(16, 8, 68, 10, '#8a5a33', { w: 3.4, r: 4 }),
      rect(16, 82, 68, 10, '#8a5a33', { w: 3.4, r: 4 }),
      ln('M34 34 H66 M34 46 H66 M34 58 H54', INK, 3),
      circ(64, 68, 8, C.red, { w: 2.6 }),
      ln('M60 68 H68 M64 64 V72', C.cream, 2.4),
    ].join(''),
  ),
  incense: svg(
    [
      ln('M50 90 V30', '#8a5a33', 7),
      ln('M50 36 V28', '#e8dcc0', 5),
      circ(50, 26, 4, '#ff7a3a', { w: 2.4 }),
      ln('M50 20 Q40 12 50 4 Q60 -2 52 -8', '#dfe8f0', 3.6, 'opacity=".8"'),
      p('M22 90 Q50 100 78 90 L72 82 Q50 90 28 82Z', '#c49a3c', { w: 3.4 }),
      ell(50, 84, 28, 8, '#7a8a9c', { w: 0, op: 0.5 }),
    ].join(''),
  ),
  redLantern: svg(
    [
      p('M40 8 H60 V16 H40Z', C.coal, { w: 3.4 }),
      solid('M22 48 Q20 18 50 16 Q80 18 78 48 Q80 80 50 82 Q20 80 22 48Z', '#e4452f'),
      ln('M24 34 Q50 42 76 34 M22 50 Q50 60 78 50 M24 66 Q50 74 76 66', '#a92b25', 2.6),
      ell(50, 50, 10, 14, '#ffd36a', { w: 0, op: 0.55 }),
      rect(36, 80, 28, 8, C.coal, { w: 3.4, r: 2 }),
      ln('M50 88 V98', INK, 3),
      circ(50, 98, 3, C.gold, { w: 2 }),
    ].join(''),
  ),
  samuraiSeal: svg(
    [
      rect(28, 56, 44, 36, '#8a5a33', { w: 3.6, r: 4 }),
      rect(36, 12, 28, 48, C.red, { w: 3.6, r: 6 }),
      ln('M44 24 H56 M44 34 H56 M50 24 V50 M44 44 H56', C.cream, 3.2),
      ell(50, 88, 22, 4, '#000', { w: 0, op: 0.18 }),
    ].join(''),
  ),
  mamori: svg(
    [
      p('M50 4 V12', INK, { w: 4 }),
      solid('M24 20 Q50 10 76 20 L82 86 Q50 96 18 86Z', '#2c3a78'),
      p('M50 30 L72 40 V58 Q72 76 50 84 Q28 76 28 58 V40Z', C.goldLight, { w: 3.4 }),
      ln('M50 40 V72 M40 52 H60', C.red, 3.6),
      p('M44 92 V100 M56 92 V100', C.gold, { w: 3.4 }),
    ].join(''),
  ),
  wideSleeve: svg(
    [
      solid('M10 14 H60 Q92 20 92 56 Q92 84 66 90 L10 90Z', '#7a4fa8'),
      ln('M10 40 H72 M10 64 H78', '#c9a8e8', 2.4),
      circ(24, 52, 8, C.goldLight, { w: 2.6 }),
      ln('M30 78 Q56 70 78 80', C.pink, 3),
      p('M10 14 H30 V90 H10Z', '#5a3b80', { w: 3.4 }),
    ].join(''),
  ),
  mirror: svg(
    [
      circ(50, 44, 34, '#d6b25a', { w: 4 }),
      circ(50, 44, 26, '#e8f2f8', { w: 3 }),
      ln('M36 30 Q46 24 58 28', C.white, 4),
      circ(50, 44, 26, 'none', { w: 2, stroke: '#a8c0d0' }),
      rect(44, 76, 12, 18, '#d6b25a', { w: 3.4, r: 3 }),
      circ(50, 10, 3, C.red, { w: 2.4 }),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
        ln(
          `M${50 + Math.cos((i / 8) * 6.283) * 36} ${44 + Math.sin((i / 8) * 6.283) * 36} l${Math.cos((i / 8) * 6.283) * 6} ${Math.sin((i / 8) * 6.283) * 6}`,
          C.gold,
          3,
        ),
      ),
    ].join(''),
  ),
  kitsuneMask: svg(
    [
      solid('M12 30 L14 4 L34 20 Q50 16 66 20 L86 4 L88 30 Q90 62 50 94 Q10 62 12 30Z', '#fff6e4'),
      p('M18 20 L18 10 L26 18Z M82 20 L82 10 L74 18Z', C.red, { w: 0 }),
      ln('M24 38 Q34 34 42 42 M76 38 Q66 34 58 42', C.red, 4),
      ln('M34 50 Q50 60 66 50', C.red, 3.4, 'opacity="0"'),
      p('M46 66 L50 72 L54 66Z', INK, { w: 2.4 }),
      ln('M50 72 V82', INK, 3, 'opacity="0"'),
      p('M26 56 Q50 74 74 56', 'none', { w: 0 }),
      ln('M30 60 Q36 66 38 76 M70 60 Q64 66 62 76', C.red, 3.2),
      circ(50, 24, 4, C.red, { w: 2.4 }),
    ].join(''),
  ),
  teaCup: svg(
    [
      ln('M36 24 Q32 12 40 6 M52 22 Q50 10 58 4', '#dfe8f0', 3.4, 'opacity=".85"'),
      solid('M12 40 H88 Q90 76 66 88 H34 Q10 76 12 40Z', '#e8f0f8'),
      ell(50, 40, 38, 8, '#8fbf6a', { w: 3.6 }),
      ell(50, 40, 30, 5, '#b4dc88', { w: 0 }),
      ln('M20 58 H80', '#2c3a78', 3),
      rect(30, 86, 40, 8, '#2c3a78', { w: 3.4, r: 3 }),
      p('M86 46 Q100 48 94 62 Q90 68 82 66', 'none', { w: 0 }),
    ].join(''),
  ),
};
