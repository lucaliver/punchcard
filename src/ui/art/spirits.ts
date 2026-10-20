import { blush, C, circ, ell, eye, INK, ln, p, rect, solid, svg } from './kit';

/** The spirits that answer the lantern: rounder, warmer and friendlier than the parade. */

export const SPIRIT_ART: Record<string, string> = {
  /** A tree spirit, white and hollow-eyed, with a sprout. */
  kodama: svg(
    [
      p('M50 22 Q44 8 32 10 Q36 22 50 22Z', C.leaf, { w: 3 }),
      p('M50 22 Q58 6 70 10 Q66 22 50 22Z', '#7fb43a', { w: 3 }),
      solid('M32 62 Q50 56 68 62 L72 86 Q50 94 28 86Z', '#e8f2dc'),
      solid('M24 44 Q24 20 50 20 Q76 20 76 44 Q76 66 50 68 Q24 66 24 44Z', '#eef6e4'),
      ell(40, 44, 4.8, 7, INK, { w: 0 }),
      ell(60, 44, 4.8, 7, INK, { w: 0 }),
      circ(41.6, 41, 1.7, '#fff', { w: 0 }),
      circ(61.6, 41, 1.7, '#fff', { w: 0 }),
      ell(50, 57, 3.2, 3.8, INK, { w: 0 }),
      blush(32, 54),
      blush(68, 54),
    ].join(''),
  ),

  /** A roadside Jizo statue in a red bib. */
  jizo: svg(
    [
      ell(50, 88, 32, 6, '#6e7a8c', { w: 3.4 }),
      solid('M26 90 Q24 56 38 50 H62 Q76 56 74 90Z', '#aab4c4'),
      p('M36 52 H64 L60 66 H40Z', C.red, { w: 3.4 }),
      ln('M42 74 Q50 82 58 74', '#7a8698', 2.6),
      p('M38 70 Q50 82 62 70', '#8e9ab0', { w: 0 }),
      solid('M30 32 Q30 10 50 10 Q70 10 70 32 Q70 52 50 54 Q30 52 30 32Z', '#b9c3d2'),
      ln('M40 34 Q43 31 46 34 M54 34 Q57 31 60 34', INK, 2.6),
      ln('M46 42 Q50 45 54 42', INK, 2.4),
      circ(50, 21, 2.2, '#8e9ab0', { w: 2 }),
      p('M24 74 Q32 62 40 70', C.moss, { w: 0, op: 0.7 }),
      p('M62 84 Q70 72 76 82Z', C.moss, { w: 0, op: 0.7 }),
    ].join(''),
  ),

  /** A folded paper crane that shoots. */
  crane: svg(
    [
      p('M20 60 L50 50 L80 60 L50 80Z', C.cream, { w: 3.4 }),
      p('M22 60 L50 50 L50 80Z', '#e8dcc0', { w: 0 }),
      p('M33 55 L11 22 L50 49Z', '#fffaf0', { w: 3.4 }),
      p('M67 55 L89 24 L50 49Z', '#f0e6cf', { w: 3.4 }),
      p('M11 22 L24 30 L33 55Z', C.red, { w: 3.4 }),
      p('M52 50 L70 30 L75 36 L58 55Z', C.cream, { w: 3.4 }),
      p('M70 30 L84 24 L76 38Z', C.red, { w: 3.4 }),
      circ(74, 31, 1.8, INK, { w: 0 }),
      p('M22 60 L7 74 L38 68Z', '#e8dcc0', { w: 3.4 }),
      ln('M50 80 L50 90', INK, 0),
    ].join(''),
  ),

  /** A rice cake that sticks to whatever hits it. */
  mochi: svg(
    [
      solid('M14 74 Q10 40 36 32 Q50 28 64 32 Q90 40 86 74 Q80 90 50 90 Q20 90 14 74Z', '#fbf6ec'),
      p('M40 36 Q50 20 62 34 Q52 38 40 36Z', C.leaf, { w: 3 }),
      circ(51, 30, 2.2, '#7fb43a', { w: 0 }),
      eye(36, 62, 5.4, { look: [0.2, 0.2] }),
      eye(64, 62, 5.4, { look: [-0.2, 0.2] }),
      p('M43 72 Q50 80 57 72 Q50 75 43 72Z', INK, { w: 2.4 }),
      blush(27, 72, 5, 3),
      blush(73, 72, 5, 3),
      circ(70, 46, 4, '#8a3d4a', { w: 2.4 }),
    ].join(''),
  ),

  /** A snow rabbit with berry eyes and leaf ears. */
  snowHare: svg(
    [
      p('M36 40 Q22 14 36 8 Q46 24 44 42Z', C.leaf, { w: 3 }),
      p('M64 40 Q78 14 64 8 Q54 24 56 42Z', '#7fb43a', { w: 3 }),
      solid('M18 74 Q16 44 50 40 Q84 44 82 74 Q80 92 50 92 Q20 92 18 74Z', '#f6fbff'),
      circ(38, 62, 5.2, C.red, { w: 2.6 }),
      circ(62, 62, 5.2, C.red, { w: 2.6 }),
      circ(39.6, 60.4, 1.5, '#fff', { w: 0 }),
      circ(63.6, 60.4, 1.5, '#fff', { w: 0 }),
      p('M46 70 L50 74 L54 70Z', C.pink, { w: 2.2 }),
      ln('M50 74 V78 M44 78 Q50 82 56 78', INK, 2),
      circ(14, 34, 2.4, '#fff', { w: 1.4 }),
      circ(88, 48, 2.8, '#fff', { w: 1.4 }),
      circ(10, 66, 2, '#fff', { w: 1.4 }),
    ].join(''),
  ),

  /** A friendly flame that stings. */
  wisp: svg(
    [
      solid('M50 4 Q72 30 78 54 Q84 84 50 92 Q16 84 22 54 Q28 36 40 26 Q42 42 50 38 Q50 22 50 4Z', '#f59a2a'),
      ell(50, 66, 16, 20, '#ffe08a', { w: 0, op: 0.85 }),
      ell(50, 72, 8, 10, '#fff6c8', { w: 0, op: 0.9 }),
      eye(41, 64, 5, { look: [0.3, 0.2], iris: '#8a3d1c' }),
      eye(59, 64, 5, { look: [-0.3, 0.2], iris: '#8a3d1c' }),
      p('M44 76 Q50 82 56 76', INK, { w: 2.6 }),
      blush(33, 74, 4, 2.6, '#f2705a'),
      blush(67, 74, 4, 2.6, '#f2705a'),
    ].join(''),
  ),

  /** A stone lantern: its light speeds up the spirits beside it. */
  toro: svg(
    [
      p('M26 92 H74 V84 H26Z', '#8e9ab0', { w: 3.4 }),
      p('M40 84 V66 H60 V84Z', '#aab4c4', { w: 3.4 }),
      p('M24 66 H76 V58 H24Z', '#b9c3d2', { w: 3.4 }),
      rect(34, 36, 32, 22, '#9aa5b5', { w: 3.4 }),
      rect(40, 41, 20, 12, '#ffd36a', { w: 2.8 }),
      ell(50, 47, 7, 5, '#fff1b8', { w: 0 }),
      solid('M14 38 L50 10 L86 38Z', '#8e9ab0'),
      circ(50, 8, 5, '#aab4c4', { w: 3.4 }),
      p('M8 40 H92', C.coal, { w: 3.4 }),
    ].join(''),
  ),

  /** A bamboo cannon on a wooden stand. */
  bambooCannon: svg(
    [
      p('M20 90 L34 62 H66 L80 90Z', '#8a5a33', { w: 3.6 }),
      ln('M34 72 H66 M28 82 H72', '#5e3a1c', 2.4),
      solid('M36 66 L30 14 H70 L64 66Z', '#8cc152'),
      ln('M33 34 H67 M35 52 H65', '#5d8a2a', 3),
      ell(50, 14, 20, 6, '#2a2438', { w: 3.4 }),
      ell(50, 14, 11, 3, '#ff9a3c', { w: 0 }),
      ln('M70 38 Q86 38 84 24', C.coal, 2.6),
      circ(84, 22, 3.2, '#ffcf5a', { w: 2 }),
      eye(43, 50, 4.4),
      eye(57, 50, 4.4),
    ].join(''),
  ),

  /** A Daruma doll that always gets up again. */
  daruma: svg(
    [
      solid('M14 66 Q10 22 50 18 Q90 22 86 66 Q84 92 50 92 Q16 92 14 66Z', '#e03a2f'),
      ell(50, 44, 25, 21, '#f8efdd', { w: 3.4 }),
      ln('M30 34 Q38 24 46 32 M70 34 Q62 24 54 32', INK, 3.6),
      eye(39, 44, 6, { look: [0.1, 0.2] }),
      circ(61, 44, 5.4, INK, { w: 0 }),
      circ(59.6, 42.6, 1.6, '#fff', { w: 0 }),
      ln('M32 56 Q50 68 68 56', INK, 2.4),
      ln('M42 70 H58 M38 78 H62', C.goldLight, 3),
      p('M44 52 L50 56 L56 52', '#d9a05a', { w: 0 }),
    ].join(''),
  ),

  /** A temple bell with a stern little face; it rings the whole lane. */
  bell: svg(
    [
      p('M12 92 V14 H88 V92', 'none', { w: 5.6, stroke: '#6b4a2e' }),
      rect(8, 8, 84, 10, '#8a5a33', { w: 3.4, r: 3 }),
      ln('M50 18 V28', INK, 4),
      solid('M30 34 Q30 26 50 26 Q70 26 70 34 L82 78 H18Z', '#c49a3c'),
      ln('M30 52 H74 M26 66 H78', '#8a6a1c', 3),
      rect(18, 76, 64, 8, '#a8802a', { w: 3.4, r: 3 }),
      eye(41, 58, 4.6, { look: [0.2, 0.3] }),
      eye(59, 58, 4.6, { look: [-0.2, 0.3] }),
      ln('M36 48 L46 52 M64 48 L54 52', INK, 2.6),
      p('M72 86 H94', '#6b4a2e', { w: 5 }),
    ].join(''),
  ),

  /** A sickle weasel: long, fast, three claws. */
  kamaitachi: svg(
    [
      ln('M78 70 Q96 66 92 44', '#8a5a33', 8),
      ln('M78 70 Q96 66 92 44', '#c78a52', 4.4),
      solid('M14 68 Q16 46 40 44 Q66 40 76 60 Q80 84 50 86 Q18 88 14 68Z', '#c78a52'),
      ell(46, 72, 20, 10, '#ecd2a8', { w: 0 }),
      solid('M10 50 Q8 30 28 26 Q44 26 46 44 Q40 56 24 58 Q10 58 10 50Z', '#d49a60'),
      p('M18 28 L14 14 L28 24Z M34 26 L40 14 L44 30Z', '#d49a60', { w: 3 }),
      eye(24, 40, 4.4, { look: [-0.3, 0.3] }),
      circ(12, 50, 2, INK, { w: 0 }),
      p('M56 52 Q72 40 80 22 Q70 30 52 44Z', '#e8e0d0', { w: 3.2 }),
      p('M62 60 Q80 50 90 34 Q78 40 58 54Z', '#e8e0d0', { w: 3.2 }),
    ].join(''),
  ),

  /** A little shrine maiden of paper with a bow and a talisman arrow. */
  ofudaArcher: svg(
    [
      p('M30 90 L34 62 H66 L70 90Z', C.red, { w: 3.4 }),
      solid('M32 62 Q32 50 50 50 Q68 50 68 62Z', C.white),
      solid('M32 36 Q32 14 50 14 Q68 14 68 36 Q68 54 50 56 Q32 54 32 36Z', C.skin),
      p('M28 38 Q22 8 50 8 Q78 8 72 38 Q68 18 50 20 Q32 18 28 38Z', INK, { w: 2 }),
      p('M28 38 Q24 56 32 64 Q30 48 34 40Z M72 38 Q76 56 68 64 Q70 48 66 40Z', INK, { w: 2 }),
      p('M44 10 L56 10 L58 16 L42 16Z', C.red, { w: 2.6 }),
      circ(42, 36, 2.8, INK, { w: 0 }),
      circ(58, 36, 2.8, INK, { w: 0 }),
      blush(37, 44, 3.6, 2.4),
      blush(63, 44, 3.6, 2.4),
      ln('M47 46 Q50 48 53 46', INK, 2),
      ln('M84 18 Q96 50 84 82', '#8a5a33', 3.6),
      ln('M84 18 L70 50 L84 82', C.white, 1.6),
      p('M60 50 H88 L92 54 L88 58 H60Z', C.cream, { w: 2.6 }),
      p('M82 48 L94 54 L82 60Z', C.red, { w: 0 }),
    ].join(''),
  ),

  /** A stone lion-dog guardian. */
  komainu: svg(
    [
      p('M18 92 H82 V82 H18Z', '#6e7a8c', { w: 3.4 }),
      solid('M26 82 Q24 58 38 54 H62 Q76 58 74 82Z', '#aab4c4'),
      p('M34 82 V68 M66 82 V68', '#7a8698', { w: 3 }),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return circ(50 + Math.cos(a) * 28, 38 + Math.sin(a) * 26, 8.4, '#8e9ab0', { w: 3 });
      }),
      solid('M28 38 Q28 16 50 16 Q72 16 72 38 Q72 56 50 58 Q28 56 28 38Z', '#bfc9d8'),
      eye(40, 34, 5.2, { look: [0.1, 0.3] }),
      eye(60, 34, 5.2, { look: [-0.1, 0.3] }),
      ln('M32 26 L44 30 M68 26 L56 30', INK, 3),
      p('M42 44 Q50 38 58 44 Q58 54 50 54 Q42 54 42 44Z', '#7a8698', { w: 3 }),
      p('M46 46 l2 5 l2 -5 M52 46 l2 5 l2 -5', C.white, { w: 1.4 }),
      circ(50, 8, 3, C.red, { w: 2.4 }),
    ].join(''),
  ),

  /** A sacred dancer with a fan and bells: every spirit in her lane dances harder. */
  kagura: svg(
    [
      p('M24 92 Q24 60 40 54 H60 Q76 60 76 92Z', C.white, { w: 3.4 }),
      p('M30 76 H70 L74 92 H26Z', C.red, { w: 3.4 }),
      p('M40 54 H60 L56 64 H44Z', C.red, { w: 3 }),
      solid('M32 36 Q32 14 50 14 Q68 14 68 36 Q68 54 50 56 Q32 54 32 36Z', C.skin),
      p('M28 38 Q22 6 50 8 Q78 6 72 38 Q68 18 50 20 Q32 18 28 38Z', INK, { w: 2 }),
      p('M30 16 L50 0 L70 16 L62 20 L50 12 L38 20Z', C.gold, { w: 3 }),
      circ(50, 6, 2.6, C.red, { w: 1.6 }),
      ln('M38 36 Q42 34 46 36 M54 36 Q58 34 62 36', INK, 2.4),
      ln('M46 46 Q50 49 54 46', C.red, 2.4),
      blush(37, 44),
      blush(63, 44),
      p('M78 56 L96 34 L96 62Z', C.red, { w: 3 }),
      ln('M78 56 L96 48', C.gold, 1.8),
      p('M18 62 L6 46 M22 66 L4 58', C.gold, { w: 3.4 }),
      circ(6, 46, 3, C.goldLight, { w: 2 }),
      circ(4, 58, 3, C.goldLight, { w: 2 }),
    ].join(''),
  ),

  /** A torii gate that hums with power. */
  torii: svg(
    [
      p('M20 92 V30 M80 92 V30', C.red, { w: 12 }),
      ln('M20 92 V30 M80 92 V30', C.red, 7),
      p('M6 34 Q50 24 94 34 L90 22 Q50 12 10 22Z', C.coal, { w: 3.4 }),
      p('M6 26 Q50 16 94 26', C.red, { w: 0 }),
      p('M14 46 H86 V56 H14Z', C.red, { w: 3.4 }),
      p('M44 46 H56 V62 H44Z', C.coal, { w: 3.2 }),
      ell(50, 76, 22, 14, '#ffe9a0', { w: 0, op: 0.7 }),
      ell(50, 76, 12, 8, '#fff6d6', { w: 0, op: 0.9 }),
      eye(42, 74, 3.6),
      eye(58, 74, 3.6),
    ].join(''),
  ),

  /** The white fox of the old story, with her tails behind. */
  kuzunoha: svg(
    [
      p('M50 74 Q28 60 22 30 Q34 44 50 56Z', '#fff6e4', { w: 3.4 }),
      p('M50 74 Q72 60 78 30 Q66 44 50 56Z', '#fff6e4', { w: 3.4 }),
      solid('M22 92 Q22 62 38 56 H62 Q78 62 78 92Z', '#fff6e4'),
      p('M34 74 H66 V86 H34Z', '#e4452f', { w: 3 }),
      p('M40 56 H60 L56 64 H44Z', C.red, { w: 3 }),
      solid('M30 36 L28 8 L42 20 Q50 18 58 20 L72 8 L70 36 Q72 56 50 58 Q28 56 30 36Z', '#fffaf0'),
      p('M33 20 L33 12 L39 20Z M67 20 L67 12 L61 20Z', C.pink, { w: 1.6 }),
      ln('M34 38 L42 41 M66 38 L58 41', C.red, 3),
      eye(42, 40, 4.6, { iris: '#c9602a', look: [0, 0.3] }),
      eye(58, 40, 4.6, { iris: '#c9602a', look: [0, 0.3] }),
      p('M47 48 L50 51 L53 48Z', INK, { w: 2 }),
      ln('M43 53 Q50 57 57 53', C.red, 2.2),
      circ(50, 12, 3, C.red, { w: 2.2 }),
    ].join(''),
  ),

  /** A wandering monk in a basket hat. */
  wanderer: svg(
    [
      p('M28 92 Q26 60 40 54 H60 Q74 60 72 92Z', '#4f4a70', { w: 3.4 }),
      p('M40 54 H60 L56 66 H44Z', C.paper, { w: 3 }),
      p('M66 60 L84 92', C.brown, { w: 4.4 }),
      p('M62 62 L70 70', C.coal, { w: 5 }),
      solid('M18 34 Q18 10 50 6 Q82 10 82 34 Q70 42 50 42 Q30 42 18 34Z', '#d9b36a'),
      ln('M28 22 L24 38 M40 16 L38 40 M50 12 V42 M60 16 L62 40 M72 22 L76 38', '#a8802e', 2.2),
      ln('M18 34 Q50 46 82 34', INK, 0),
      p('M38 44 H62 L60 52 H40Z', C.skin, { w: 3 }),
      circ(45, 47, 1.6, INK, { w: 0 }),
      circ(55, 47, 1.6, INK, { w: 0 }),
      p('M24 66 L12 80', C.skin, { w: 5 }),
      circ(12, 82, 3.6, C.skin, { w: 3 }),
    ].join(''),
  ),

  /** A bundle of bamboo, tied. */
  bambooWall: svg(
    [
      ...[16, 32, 48, 64, 80].map((x, i) => rect(x - 6.5, 10 + (i % 2) * 5, 13, 82 - (i % 2) * 5, i % 2 ? '#7fb43a' : '#9ccc5a', { w: 3.4, r: 4 })),
      ...[16, 32, 48, 64, 80].map((x) => ln(`M${x - 6} 38 H${x + 6} M${x - 6} 64 H${x + 6}`, '#5d8a2a', 2.6)),
      rect(10, 46, 80, 7, '#e4452f', { w: 3, r: 2 }),
      eye(40, 74, 4),
      eye(60, 74, 4),
    ].join(''),
  ),

  /** A swordsman who has not moved, and will. */
  iaido: svg(
    [
      p('M18 92 Q16 64 34 58 H66 Q84 64 82 92Z', '#2c3a78', { w: 3.4 }),
      p('M30 76 H70 V84 H30Z', C.gold, { w: 0, op: 0.7 }),
      p('M62 70 L96 56 L98 62 L66 78Z', C.ghost, { w: 3 }),
      p('M56 72 L66 66 L70 74 L60 80Z', C.red, { w: 3 }),
      solid('M24 34 Q24 12 50 10 Q76 12 76 34 Q74 52 50 54 Q26 52 24 34Z', C.skin),
      p('M20 30 Q20 6 50 4 Q80 6 80 30 L72 24 Q50 14 28 24Z', INK, { w: 2 }),
      p('M46 -2 H54 V6 H46Z', INK, { w: 2 }),
      ln('M32 34 L44 38 M68 34 L56 38', INK, 3.4),
      circ(41, 40, 2.6, INK, { w: 0 }),
      circ(59, 40, 2.6, INK, { w: 0 }),
      ln('M42 48 H58', INK, 2.4),
      ln('M36 44 L40 48', '#c4382a', 2),
    ].join(''),
  ),

  /** A sword rack that sharpens everything near it. */
  swordRack: svg(
    [
      p('M14 92 V20 M86 92 V20', C.brown, { w: 9 }),
      ln('M14 92 V20 M86 92 V20', '#a8703c', 4),
      rect(8, 28, 84, 8, '#a8703c', { w: 3.4, r: 2 }),
      rect(8, 58, 84, 8, '#a8703c', { w: 3.4, r: 2 }),
      p('M24 56 L72 40 L74 46 L26 62Z', C.ghost, { w: 3 }),
      p('M72 40 L90 32 L92 38 L74 46Z', C.coal, { w: 3 }),
      p('M26 28 L72 12 L74 18 L28 34Z', C.ghost, { w: 3 }),
      p('M72 12 L90 4 L92 10 L74 18Z', C.red, { w: 3 }),
      eye(34, 80, 4.2),
      eye(50, 80, 4.2),
      ln('M36 90 Q42 94 48 90', INK, 2),
    ].join(''),
  ),

  /** A haunted helmet whose owner is long gone. */
  kabuto: svg(
    [
      p('M20 80 Q50 100 80 80 L76 64 H24Z', '#3a3a58', { w: 3.4 }),
      ln('M28 70 H72 M30 78 H70', C.gold, 2.4),
      solid('M20 66 Q18 26 50 20 Q82 26 80 66Z', '#4a4a78'),
      p('M50 4 L40 34 L50 28 L60 34Z', C.gold, { w: 3.2 }),
      p('M28 40 Q50 52 72 40 L72 52 Q50 62 28 52Z', C.coal, { w: 3 }),
      ell(40, 62, 6, 4.4, '#ffd36a', { w: 2 }),
      ell(60, 62, 6, 4.4, '#ffd36a', { w: 2 }),
      circ(40, 62, 2, INK, { w: 0 }),
      circ(60, 62, 2, INK, { w: 0 }),
      p('M16 70 Q8 86 14 94 L24 82Z M84 70 Q92 86 86 94 L76 82Z', '#4a4a78', { w: 3 }),
    ].join(''),
  ),

  /** A warrior behind an oni mask. */
  oniMask: svg(
    [
      p('M16 92 Q14 62 32 56 H68 Q86 62 84 92Z', '#7a2f2a', { w: 3.4 }),
      p('M22 66 H78 M26 76 H74', C.gold, { w: 2.4 }),
      p('M74 40 L92 20 L96 26 L80 48Z', C.coal, { w: 4 }),
      solid('M24 34 Q24 12 50 12 Q76 12 76 34 Q78 54 50 56 Q22 54 24 34Z', '#d8402e'),
      p('M32 16 L28 2 L42 10Z M68 16 L72 2 L58 10Z', C.bone, { w: 3 }),
      ell(40, 34, 5.4, 3.8, C.goldLight, { w: 2.6 }),
      ell(60, 34, 5.4, 3.8, C.goldLight, { w: 2.6 }),
      ln('M30 26 L46 32 M70 26 L54 32', INK, 3.4),
      p('M32 44 Q50 58 68 44 Q50 48 32 44Z', INK, { w: 2.4 }),
      p('M38 46 l3 6 l3 -6 M54 46 l3 6 l3 -6', C.white, { w: 1.6 }),
    ].join(''),
  ),

  /** A brawler with a sake gourd and a lot to say. */
  brawler: svg(
    [
      p('M26 92 Q24 62 38 56 H62 Q76 62 74 92Z', '#3f6fd6', { w: 3.4 }),
      p('M38 56 H62 L56 66 H44Z', C.paper, { w: 3 }),
      p('M72 64 L88 72 Q96 80 90 88 Q82 92 76 82Z', '#c4883a', { w: 3.4 }),
      circ(88, 66, 4, '#f6d98a', { w: 2.6 }),
      solid('M28 36 Q28 14 50 14 Q72 14 72 36 Q72 54 50 56 Q28 54 28 36Z', C.skin),
      p('M24 24 H76 V32 H24Z', C.white, { w: 3 }),
      circ(50, 28, 3.4, C.red, { w: 2.2 }),
      ln('M34 38 L44 40 M66 38 L56 40', INK, 3),
      circ(41, 42, 2.4, INK, { w: 0 }),
      circ(59, 42, 2.4, INK, { w: 0 }),
      blush(34, 48),
      blush(66, 48),
      p('M42 49 Q50 56 58 49 Q50 52 42 49Z', INK, { w: 2 }),
      p('M10 66 L28 62 L30 74 L12 80Z', C.skin, { w: 3.4 }),
    ].join(''),
  ),

  /** A leaf with a face: the tanuki's oldest trick. */
  leafDecoy: svg(
    [
      p('M50 94 Q48 88 48 82', '#5d8a2a', { w: 4 }),
      solid('M50 8 Q92 24 86 62 Q80 86 50 90 Q20 86 14 62 Q8 24 50 8Z', '#8cc152'),
      ln('M50 12 V86 M50 34 L30 22 M50 50 L26 40 M50 66 L26 58 M50 34 L70 22 M50 50 L74 40 M50 66 L74 58', '#5d8a2a', 2.4),
      eye(38, 52, 6),
      eye(62, 52, 6),
      p('M44 64 Q50 72 56 64 Q50 67 44 64Z', INK, { w: 2.4 }),
      blush(30, 62, 4.4, 2.8),
      blush(70, 62, 4.4, 2.8),
      p('M32 22 L24 8 L40 16Z M68 22 L76 8 L60 16Z', '#6a5a46', { w: 3 }),
    ].join(''),
  ),

  /** A tanuki with an acorn for a hat and a slingshot. */
  acorn: svg(
    [
      p('M72 66 Q92 50 88 78 Q80 84 70 78Z', '#8a6a4a', { w: 3.4 }),
      solid('M24 90 Q22 62 38 56 H62 Q78 62 76 90Z', '#a7825a'),
      ell(50, 76, 14, 12, '#f1dcb8', { w: 3 }),
      solid('M26 44 Q26 28 50 28 Q74 28 74 44 Q74 60 50 62 Q26 60 26 44Z', '#a7825a'),
      p('M26 34 L22 22 L38 30Z M74 34 L78 22 L62 30Z', '#6a5038', { w: 3 }),
      ell(38, 46, 7.4, 6.4, '#4a3828', { w: 0 }),
      ell(62, 46, 7.4, 6.4, '#4a3828', { w: 0 }),
      eye(38, 46, 3.6),
      eye(62, 46, 3.6),
      ell(50, 54, 8, 6, '#f1dcb8', { w: 0 }),
      circ(50, 52, 2.4, INK, { w: 0 }),
      solid('M24 28 Q24 8 50 8 Q76 8 76 28 Q50 34 24 28Z', '#c4883a'),
      p('M46 6 L50 -2 L54 6Z', '#6a5038', { w: 2.4 }),
      ln('M14 40 L22 52 M30 56 L14 40 M14 40 L6 30', '#6a4a28', 3),
    ].join(''),
  ),

  /** The bunbuku teakettle: a pot with ears, a tail and a lot of steam. */
  teapot: svg(
    [
      ln('M36 22 Q32 10 40 4 M50 20 Q48 8 56 2 M62 22 Q60 12 68 8', '#dfe8f0', 3.4, 'opacity=".8"'),
      p('M74 60 Q96 52 92 82 Q84 88 74 78Z', '#8a6a4a', { w: 3.4 }),
      ln('M78 66 Q88 66 90 76', '#4a3828', 3),
      p('M26 36 L22 22 L38 30Z M74 36 L78 22 L62 30Z', '#4a3828', { w: 3.2 }),
      solid('M18 62 Q16 34 50 30 Q84 34 82 62 Q82 90 50 92 Q18 90 18 62Z', '#4b4e60'),
      rect(36, 24, 28, 9, '#3a3c4c', { w: 3.4, r: 3 }),
      circ(50, 22, 3.4, '#6a6e84', { w: 2.6 }),
      ell(50, 64, 20, 18, '#f1dcb8', { w: 0, op: 0.95 }),
      ell(38, 54, 7, 6, '#2a2430', { w: 0 }),
      ell(62, 54, 7, 6, '#2a2430', { w: 0 }),
      eye(38, 54, 3.8),
      eye(62, 54, 3.8),
      circ(50, 62, 3, INK, { w: 0 }),
      ln('M42 70 Q50 76 58 70', INK, 2.6),
    ].join(''),
  ),

  /** A tanuki who drums on his own belly. */
  bellyDrum: svg(
    [
      solid('M12 70 Q10 36 50 32 Q90 36 88 70 Q84 94 50 94 Q16 94 12 70Z', '#a7825a'),
      ell(50, 70, 26, 22, '#f1dcb8', { w: 3.4 }),
      ln('M30 70 Q50 82 70 70', '#c9a878', 2.4),
      p('M28 40 L24 26 L40 34Z M72 40 L76 26 L60 34Z', '#6a5038', { w: 3.4 }),
      ell(38, 44, 7.6, 6.6, '#4a3828', { w: 0 }),
      ell(62, 44, 7.6, 6.6, '#4a3828', { w: 0 }),
      eye(38, 44, 3.8),
      eye(62, 44, 3.8),
      circ(50, 52, 2.8, INK, { w: 0 }),
      p('M42 58 Q50 66 58 58 Q50 62 42 58Z', INK, { w: 2.4 }),
      ln('M12 40 L30 66 M88 40 L70 66', '#6a4a28', 4),
      circ(12, 38, 4, '#c4883a', { w: 3 }),
      circ(88, 38, 4, '#c4883a', { w: 3 }),
    ].join(''),
  ),

  /** A sake barrel that pours a little courage into the spirits nearby. */
  sakeStall: svg(
    [
      p('M20 40 Q16 66 20 90 H80 Q84 66 80 40Z', '#b0763a', { w: 3.6 }),
      ln('M18 56 H82 M17 76 H83', '#5e3a1c', 3.6),
      ln('M34 40 V90 M50 40 V90 M66 40 V90', '#8a5a33', 2.2),
      ell(50, 40, 30, 8, '#d8a060', { w: 3.6 }),
      ell(50, 38, 24, 5, '#ffe9b0', { w: 0, op: 0.8 }),
      p('M40 56 H60 V74 H40Z', C.white, { w: 3 }),
      eye(46, 64, 3.2),
      eye(54, 64, 3.2),
      p('M62 28 L80 12 L84 18 L68 34Z', '#8a5a33', { w: 3.2 }),
      circ(83, 15, 6, '#c4883a', { w: 3 }),
    ].join(''),
  ),

  /** The Great Kettle: a golden pot that keeps the oil coming. */
  kettle: svg(
    [
      ln('M26 20 Q22 6 32 0 M50 16 Q46 2 56 -4 M72 20 Q68 8 78 4', '#dfe8f0', 3.4, 'opacity=".85"'),
      p('M76 62 Q100 50 94 86 Q84 92 74 80Z', '#a8802a', { w: 3.4 }),
      ln('M80 68 Q92 68 92 80', '#5e3a1c', 3),
      p('M24 34 L18 18 L36 28Z M76 34 L82 18 L64 28Z', '#6a4a18', { w: 3.4 }),
      solid('M10 62 Q8 30 50 26 Q92 30 90 62 Q90 94 50 96 Q10 94 10 62Z', '#e0a83a'),
      rect(32, 18, 36, 10, '#c0862a', { w: 3.6, r: 4 }),
      circ(50, 16, 4.4, '#f5d070', { w: 3 }),
      ln('M22 50 Q50 40 78 50', '#a8802a', 3),
      ell(50, 66, 26, 20, '#fff0c4', { w: 0, op: 0.9 }),
      ell(36, 54, 8.6, 7, '#3a2810', { w: 0 }),
      ell(64, 54, 8.6, 7, '#3a2810', { w: 0 }),
      eye(36, 54, 4.4),
      eye(64, 54, 4.4),
      circ(50, 64, 3.4, INK, { w: 0 }),
      p('M38 72 Q50 84 62 72 Q50 78 38 72Z', INK, { w: 2.4 }),
      circ(50, 86, 2.4, C.red, { w: 0 }),
    ].join(''),
  ),
};
