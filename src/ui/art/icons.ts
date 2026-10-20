import { C, circ, ell, INK, ln, p, rect, solid, svg } from './kit';

/** Small icons for stats, the map and buttons: bolder and plainer than the creatures so they read at 20 px. */

export const ICON_ART: Record<string, string> = {
  /** The lantern's flame: what a leak costs. */
  flame: svg(
    [
      solid('M50 4 Q74 30 78 54 Q82 88 50 94 Q18 88 22 54 Q26 36 38 24 Q42 40 50 36 Q52 20 50 4Z', '#f5662a'),
      ell(50, 68, 14, 18, '#ffd36a', { w: 0 }),
      ell(50, 76, 7, 9, '#fff6c8', { w: 0 }),
    ].join(''),
  ),
  /** A drop of oil. */
  oil: svg(
    [solid('M50 6 Q80 46 78 66 Q76 92 50 92 Q24 92 22 66 Q20 46 50 6Z', '#ffc23a'), ell(38, 62, 5, 11, '#fff3b8', { w: 0, op: 0.9 })].join(''),
  ),
  /** Hit points of a spirit. */
  heart: svg([solid('M50 90 Q8 58 10 34 Q12 12 32 12 Q46 12 50 28 Q54 12 68 12 Q88 12 90 34 Q92 58 50 90Z', '#e8506e')].join('')),
  sword: svg(
    [
      p('M50 4 L60 14 L60 60 H40 V14Z', '#dfe6f0', { w: 4 }),
      rect(28, 58, 44, 9, C.gold, { w: 4, r: 3 }),
      rect(44, 66, 12, 24, '#5a3a22', { w: 4, r: 3 }),
    ].join(''),
  ),
  /** Reach, in rows. */
  range: svg(
    [
      ln('M50 92 V14', INK, 8),
      p('M32 34 L50 8 L68 34Z', INK, { w: 4 }),
      ln('M50 92 V14', '#ffe08a', 3.4),
      p('M36 32 L50 12 L64 32Z', '#ffe08a', { w: 0 }),
    ].join(''),
  ),
  /** Seconds between strikes. */
  clock: svg(
    [
      circ(50, 52, 38, '#fff3d6', { w: 5 }),
      ln('M50 52 V28 M50 52 L68 62', INK, 6),
      circ(50, 52, 4, INK, { w: 0 }),
      rect(42, 4, 16, 8, INK, { w: 0, r: 2 }),
    ].join(''),
  ),
  coin: svg(
    [
      circ(50, 50, 40, '#f5b53f', { w: 5 }),
      circ(50, 50, 26, 'none', { w: 3.4, stroke: '#a8742a' }),
      rect(42, 42, 16, 16, '#a8742a', { w: 0 }),
      rect(46, 46, 8, 8, '#f5b53f', { w: 0 }),
    ].join(''),
  ),
  star: svg([solid('M50 6 L62 36 L94 38 L68 58 L78 90 L50 72 L22 90 L32 58 L6 38 L38 36Z', '#ffd24a')].join('')),
  lock: svg(
    [
      p('M28 46 V32 Q28 8 50 8 Q72 8 72 32 V46', 'none', { w: 9 }),
      rect(18, 44, 64, 46, '#8e9ab0', { w: 5, r: 8 }),
      circ(50, 64, 7, INK, { w: 0 }),
      rect(47, 66, 6, 14, INK, { w: 0 }),
    ].join(''),
  ),
  pause: svg([rect(22, 14, 18, 72, '#fff3d6', { w: 5, r: 4 }), rect(60, 14, 18, 72, '#fff3d6', { w: 5, r: 4 })].join('')),
  play: svg([p('M26 12 L86 50 L26 88Z', '#fff3d6', { w: 6 })].join('')),
  gear: svg(
    [
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => rect(42, 2, 16, 20, '#cfd6e2', { w: 4, r: 3, x: `transform="rotate(${i * 45} 50 50)"` })),
      circ(50, 50, 30, '#cfd6e2', { w: 5 }),
      circ(50, 50, 12, INK, { w: 0 }),
    ].join(''),
  ),
  back: svg([p('M62 12 L22 50 L62 88', 'none', { w: 14 }), ln('M62 12 L22 50 L62 88', '#fff3d6', 7)].join('')),
  /** The keeper's ability. */
  bell: svg(
    [
      solid('M26 70 Q26 30 50 24 Q74 30 74 70 L86 82 H14Z', '#f0b93a'),
      circ(50, 90, 7, '#8a5a1c', { w: 4 }),
      circ(50, 18, 5, '#8a5a1c', { w: 4 }),
    ].join(''),
  ),
  cards: svg(
    [
      rect(8, 22, 46, 66, '#e4452f', { w: 4, r: 5, x: 'transform="rotate(-12 31 55)"' }),
      rect(44, 16, 46, 66, '#fff3d6', { w: 4, r: 5, x: 'transform="rotate(10 67 49)"' }),
    ].join(''),
  ),
  /** Stun / freeze. */
  stun: svg([circ(50, 50, 40, '#bfe6ff', { w: 4.4 }), ln('M50 18 V82 M18 50 H82 M28 28 L72 72 M72 28 L28 72', '#fff', 5)].join('')),
  slow: svg([solid('M30 8 H70 V26 L56 50 L70 74 V92 H30 V74 L44 50 L30 26Z', '#8cc8f0'), p('M38 82 H62 V88 H38Z', '#fff3d6', { w: 0 })].join('')),
  burn: svg([solid('M50 4 Q70 28 74 50 Q78 84 50 92 Q22 84 26 50 Q30 34 40 26 Q44 40 50 36 Q52 20 50 4Z', '#ff7a2a')].join('')),
  web: svg(
    [
      ln('M50 6 V94 M6 50 H94 M18 18 L82 82 M82 18 L18 82', '#dfe6f0', 3.4),
      ln('M30 30 L70 30 L70 70 L30 70Z', '#dfe6f0', 3, 'opacity=".9"'),
      circ(50, 50, 8, 'none', { w: 3, stroke: '#dfe6f0' }),
    ].join(''),
  ),
  /** A marked foe: it takes more damage. */
  mark: svg(
    [
      circ(50, 50, 38, 'none', { w: 9 }),
      circ(50, 50, 38, 'none', { w: 4, stroke: C.red }),
      circ(50, 50, 16, 'none', { w: 8 }),
      circ(50, 50, 16, 'none', { w: 3.4, stroke: C.red }),
      ln('M50 4 V30 M50 70 V96 M4 50 H30 M70 50 H96', INK, 7),
      ln('M50 4 V30 M50 70 V96 M4 50 H30 M70 50 H96', C.red, 3),
    ].join(''),
  ),
  /** A moon phase (the difficulty ladder). */
  moon: svg(
    [
      solid('M64 8 Q30 12 26 50 Q24 88 66 92 Q40 76 44 50 Q48 24 64 8Z', '#f6e8b8'),
      circ(74, 26, 2.4, C.goldLight, { w: 0 }),
      circ(82, 46, 1.8, C.goldLight, { w: 0 }),
    ].join(''),
  ),
  /** The lantern the keeper carries: a standing lantern whose flame the field draws live. */
  lantern: svg(
    [
      p('M24 96 H76 V86 H24Z', '#8e9ab0', { w: 3.6 }),
      p('M40 86 V66 H60 V86Z', '#aab4c4', { w: 3.6 }),
      p('M22 66 H78 L72 56 H28Z', '#b9c3d2', { w: 3.6 }),
      rect(30, 24, 40, 32, '#fff3d6', { w: 3.6, r: 3 }),
      ln('M43 24 V56 M57 24 V56', '#a92b25', 3),
      solid('M16 28 L50 4 L84 28Z', '#6b4a32'),
      circ(50, 4, 4, C.gold, { w: 3 }),
    ].join(''),
  ),
  /** Damage handed back to whoever strikes. */
  thorns: svg(
    [
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => p('M42 16 L50 0 L58 16Z', '#cfd6e2', { w: 3.4, x: `transform="rotate(${i * 45} 50 50)"` })),
      circ(50, 50, 28, '#8e9ab0', { w: 4.4 }),
      circ(42, 42, 6, '#dfe6f0', { w: 0 }),
    ].join(''),
  ),
  /** Map nodes. */
  nodeWatch: svg(
    [
      p('M38 8 H62 V18 H38Z', INK, { w: 0 }),
      solid('M24 46 Q22 20 50 18 Q78 20 76 46 Q78 74 50 78 Q22 74 24 46Z', '#e8dcc0'),
      ell(50, 46, 10, 14, '#ffd36a', { w: 0 }),
      rect(36, 76, 28, 8, C.coal, { w: 3.6, r: 2 }),
    ].join(''),
  ),
  nodeElite: svg(
    [
      solid('M24 34 Q24 12 50 12 Q76 12 76 34 Q78 54 50 56 Q22 54 24 34Z', '#d8402e'),
      p('M32 16 L28 2 L42 10Z M68 16 L72 2 L58 10Z', C.bone, { w: 3 }),
      ln('M30 26 L46 32 M70 26 L54 32', INK, 4),
      p('M32 44 Q50 58 68 44', INK, { w: 3 }),
      rect(26, 62, 48, 10, C.gold, { w: 3.4, r: 3 }),
    ].join(''),
  ),
  nodeRest: svg(
    [
      p('M18 80 H82 L74 62 H26Z', '#8a5a33', { w: 4 }),
      solid('M50 14 Q68 34 70 50 Q72 66 50 66 Q28 66 30 50 Q32 40 40 32 Q44 44 50 40Z', '#f5662a'),
      ell(50, 54, 7, 9, '#ffd36a', { w: 0 }),
    ].join(''),
  ),
  nodeMarket: svg(
    [
      solid('M14 36 H86 V90 H14Z', '#b0763a'),
      p('M8 36 L18 16 H82 L92 36Z', C.red, { w: 4 }),
      ln('M30 16 L26 36 M50 16 V36 M70 16 L74 36', C.cream, 4),
      circ(50, 66, 12, C.gold, { w: 3.6 }),
      rect(46, 62, 8, 8, '#a8742a', { w: 0 }),
    ].join(''),
  ),
  nodeShrine: svg(
    [
      p('M18 90 V30 M82 90 V30', C.red, { w: 12 }),
      ln('M18 90 V30 M82 90 V30', C.red, 6),
      p('M4 34 Q50 22 96 34 L92 20 Q50 8 8 20Z', C.coal, { w: 4 }),
      p('M14 46 H86 V56 H14Z', C.red, { w: 3.6 }),
    ].join(''),
  ),
  nodeTreasure: svg(
    [
      solid('M10 46 Q10 22 50 22 Q90 22 90 46V84H10Z', '#8a5a33'),
      rect(8, 44, 84, 12, C.gold, { w: 4, r: 3 }),
      rect(42, 40, 16, 22, C.goldLight, { w: 3.6, r: 3 }),
      circ(50, 52, 3, INK, { w: 0 }),
    ].join(''),
  ),
  nodeBoss: svg(
    [
      solid('M18 52 Q18 14 50 12 Q82 14 82 52 Q82 70 70 74 V86 H30 V74 Q18 70 18 52Z', '#ece2c6'),
      ell(37, 50, 9, 10, INK, { w: 0 }),
      ell(63, 50, 9, 10, INK, { w: 0 }),
      circ(37, 51, 3, C.red, { w: 0 }),
      circ(63, 51, 3, C.red, { w: 0 }),
      p('M8 20 L22 28 L28 6 L40 24 L50 2 L60 24 L72 6 L78 28 L92 20 L86 40 H14Z', C.gold, { w: 3.6 }),
    ].join(''),
  ),
};
