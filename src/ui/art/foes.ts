import { blush, C, circ, ell, eye, INK, ln, p, rect, solid, svg } from './kit';

/** The Night Parade, front on. Each is a 100×100 drawing; menace comes from silhouettes, big eyes and teeth. */

const fangs = (x: number, y: number, n = 3, w = 5, h = 6): string =>
  Array.from({ length: n }, (_, i) => p(`M${x + i * w} ${y} l${w / 2} ${h} l${w / 2} ${-h}Z`, C.white, { w: 1.6 })).join('');

export const FOE_ART: Record<string, string> = {
  /** One-legged umbrella, one eye, one leg, tongue out. */
  karakasa: svg(
    [
      p('M44 70 L44 84 L56 84 L56 70Z', C.skin, { w: 3.5 }),
      p('M38 84 H62 L60 91 H40Z', C.brown, { w: 3.5 }),
      solid('M12 56 Q50 -2 88 56 Q75 50 69 58 Q59 50 50 58 Q41 50 31 58 Q25 50 12 56Z', C.red),
      ln('M50 14 L28 54 M50 14 L50 54 M50 14 L72 54', C.redDark, 2.4),
      circ(50, 12, 3.4, C.gold, { w: 3 }),
      eye(50, 38, 11, { look: [0.3, 0.5] }),
      p('M36 62 Q50 72 64 62 Q60 66 56 78 Q52 86 47 78 Q44 70 36 62Z', C.pink, { w: 3 }),
      ln('M50 70 V78', C.redDark, 2),
    ].join(''),
  ),

  /** A paper lantern come alive, mouth wide open. */
  chochin: svg(
    [
      p('M42 12 L58 12 L56 22 L44 22Z', C.coal, { w: 3.5 }),
      ln('M50 22 Q70 6 74 18', INK, 3),
      solid('M24 52 Q22 22 50 22 Q78 22 76 52 Q78 82 50 82 Q22 82 24 52Z', C.cream),
      ln('M26 38 Q50 46 74 38 M24 56 Q50 66 76 56', C.red, 3.2),
      rect(30, 78, 40, 9, C.coal, { w: 3.5, r: 2 }),
      eye(50, 36, 9.5, { iris: C.red, look: [0, 0.5] }),
      p('M30 56 Q50 90 70 56 Q50 62 30 56Z', C.plum, { w: 3.5 }),
      p('M42 66 Q50 92 60 70 Q52 74 42 66Z', C.pink, { w: 3 }),
      fangs(36, 58, 5, 5.6, 6),
    ].join(''),
  ),

  /** A straw sandal on tiny legs, eyebrows for thongs. */
  zori: svg(
    [
      p('M36 78 L34 90 M64 78 L66 90', INK, { w: 3.5 }),
      circ(33, 90, 3, C.skin, { w: 3 }),
      circ(67, 90, 3, C.skin, { w: 3 }),
      solid('M24 56 Q24 26 50 26 Q76 26 76 56 Q76 82 50 82 Q24 82 24 56Z', '#d9b36a'),
      ln('M30 40 Q50 30 70 40 M28 52 Q50 44 72 52 M28 64 Q50 56 72 64', '#a8802e', 2.2),
      p('M42 30 Q50 12 58 30 Q50 36 42 30Z', C.red, { w: 3 }),
      eye(41, 52, 6),
      eye(59, 52, 6),
      p('M44 68 Q50 74 56 68 Q50 70 44 68Z', INK, { w: 2 }),
    ].join(''),
  ),

  /** A water imp with a dish on its head. */
  kappa: svg(
    [
      p('M24 70 Q50 56 76 70 L74 84 Q50 92 26 84Z', '#7a5a38', { w: 3.5 }),
      solid('M28 62 Q50 50 72 62 Q76 84 50 90 Q24 84 28 62Z', C.moss),
      ell(50, 76, 13, 11, '#e6dc94', { w: 3 }),
      p('M26 70 L18 82 M74 70 L82 82', C.moss, { w: 4.5 }),
      solid('M24 34 Q24 14 50 14 Q76 14 76 34 Q78 56 50 58 Q22 56 24 34Z', C.moss),
      ell(50, 15, 14, 5.4, '#bfe9d9', { w: 3 }),
      eye(38, 34, 8.5, { look: [0.4, 0.3] }),
      eye(62, 34, 8.5, { look: [-0.4, 0.3] }),
      p('M36 46 Q50 40 64 46 Q64 54 50 54 Q36 54 36 46Z', C.gold, { w: 3.2 }),
      ln('M44 49 H56', INK, 2.4),
    ].join(''),
  ),

  /** A crow with its wings spread. Flies over the spirits. */
  karasu: svg(
    [
      p('M50 38 Q26 14 4 28 Q18 30 20 40 Q12 44 14 54 Q30 46 40 54Z', '#2a2438', { w: 3.5 }),
      p('M50 38 Q74 14 96 28 Q82 30 80 40 Q88 44 86 54 Q70 46 60 54Z', '#2a2438', { w: 3.5 }),
      ln('M20 38 Q30 36 40 46 M80 38 Q70 36 60 46', '#5a4e72', 2.4),
      solid('M36 34 Q36 20 50 20 Q64 20 64 34 L64 60 Q64 76 50 78 Q36 76 36 60Z', '#34304a'),
      p('M42 76 L38 88 M58 76 L62 88', C.gold, { w: 3.5 }),
      p('M43 30 L50 38 L57 30 L50 32Z', C.gold, { w: 3 }),
      eye(43, 28, 4.6, { look: [0.3, 0.5] }),
      eye(57, 28, 4.6, { look: [-0.3, 0.5] }),
      p('M44 34 L50 46 L56 34Z', '#f0a23c', { w: 3 }),
    ].join(''),
  ),

  /** A woman whose neck goes on and on. */
  rokurokubi: svg(
    [
      p('M28 90 Q30 66 50 62 Q70 66 72 90Z', '#6a3f8a', { w: 3.5 }),
      ln('M32 86 Q50 78 68 86', C.pink, 2.6),
      ln('M50 62 Q70 54 38 46 Q24 42 46 32', C.skin, 12),
      solid('M30 22 Q30 6 48 6 Q68 6 68 22 Q68 38 50 40 Q30 38 30 22Z', C.skin),
      p('M28 24 Q26 4 48 4 Q70 4 70 24 Q64 10 50 12 Q36 10 28 24Z', INK, { w: 2 }),
      p('M28 24 Q26 38 34 40 Q30 32 32 24Z', INK, { w: 2 }),
      p('M72 24 Q74 38 66 40 Q70 32 68 24Z', INK, { w: 2 }),
      ln('M38 24 L44 22 M56 22 L62 24', INK, 2.6),
      circ(41, 26, 2.3, INK, { w: 0 }),
      circ(59, 26, 2.3, INK, { w: 0 }),
      p('M44 33 Q50 38 56 33', C.red, { w: 2.4 }),
    ].join(''),
  ),

  /** A red ox-demon with great horns. */
  ushioni: svg(
    [
      solid('M16 90 Q14 56 36 52 H64 Q86 56 84 90Z', C.red),
      p('M16 36 Q4 24 10 10 Q22 20 30 30Z', C.bone, { w: 3.5 }),
      p('M84 36 Q96 24 90 10 Q78 20 70 30Z', C.bone, { w: 3.5 }),
      solid('M24 30 Q24 8 50 8 Q76 8 76 30 Q78 52 50 56 Q22 52 24 30Z', '#c93a2b'),
      p('M38 44 Q50 38 62 44 Q62 54 50 54 Q38 54 38 44Z', C.pink, { w: 3 }),
      circ(45, 48, 1.8, INK, { w: 0 }),
      circ(55, 48, 1.8, INK, { w: 0 }),
      ln('M32 24 L44 30 M68 24 L56 30', INK, 3.4),
      eye(39, 31, 5.2, { iris: C.gold }),
      eye(61, 31, 5.2, { iris: C.gold }),
      p('M40 56 l3 8 l3 -8 M54 56 l3 8 l3 -8', C.white, { w: 1.8 }),
      p('M10 76 H30 L26 92 H12Z', C.coal, { w: 3 }),
    ].join(''),
  ),

  /** A spider with a woman's face. */
  jorogumo: svg(
    [
      ln('M30 60 L8 40 L6 70 M30 66 L10 86 M70 60 L92 40 L94 70 M70 66 L90 86 M40 70 L30 92 M60 70 L70 92', INK, 5.4),
      ln('M30 60 L8 40 L6 70 M30 66 L10 86 M70 60 L92 40 L94 70 M70 66 L90 86 M40 70 L30 92 M60 70 L70 92', '#6a3f8a', 2.4),
      solid('M24 66 Q24 46 50 46 Q76 46 76 66 Q76 88 50 90 Q24 88 24 66Z', '#6a3f8a'),
      ln('M34 60 Q50 68 66 60 M34 72 Q50 80 66 72', C.pink, 2.4),
      circ(50, 78, 4, C.gold, { w: 2.6 }),
      solid('M32 28 Q32 8 50 8 Q68 8 68 28 Q68 46 50 48 Q32 46 32 28Z', C.skin),
      p('M30 30 Q26 4 50 4 Q74 4 70 30 Q66 12 50 14 Q34 12 30 30Z', INK, { w: 2 }),
      p('M40 30 L46 28 M54 28 L60 30', INK, { w: 2.4 }),
      circ(42, 32, 2.4, C.red, { w: 0 }),
      circ(58, 32, 2.4, C.red, { w: 0 }),
      p('M43 40 Q50 45 57 40', C.red, { w: 2.4 }),
      circ(50, 20, 2.2, C.red, { w: 0 }),
    ].join(''),
  ),

  /** A great wall of stone with a face. */
  nurikabe: svg(
    [
      p('M14 92 V28 Q14 12 30 12 H70 Q86 12 86 28 V92Z', '#6f7d97', { w: 4.4 }),
      solid('M14 92 V28 Q14 12 30 12 H70 Q86 12 86 28 V92Z', '#7e8caa'),
      ln('M14 44 H44 M56 44 H86 M14 66 H34 M46 66 H86 M26 82 H60 M72 82 H86', '#55617a', 2.4),
      ln('M30 12 V44 M70 12 V44 M46 44 V66 M34 66 V92', '#55617a', 2.4),
      eye(36, 34, 9, { iris: C.gold, look: [0, 0.5] }),
      eye(64, 34, 9, { iris: C.gold, look: [0, 0.5] }),
      p('M30 56 Q50 74 70 56 Q50 60 30 56Z', C.plum, { w: 3.4 }),
      fangs(36, 57, 5, 5.6, 6),
      p('M6 56 H16 L16 78 H8Z M94 56 H84 L84 78 H92Z', '#7e8caa', { w: 3.4 }),
    ].join(''),
  ),

  /** A two-tailed cat in a towel. */
  bakeneko: svg(
    [
      ln('M72 78 Q96 70 88 46 M70 82 Q94 90 94 66', '#e6a35a', 7),
      solid('M26 62 Q26 48 50 48 Q74 48 74 62 L74 88 Q50 94 26 88Z', '#f0a85c'),
      p('M32 90 V84 M44 91 V84 M56 91 V84 M68 90 V84', INK, { w: 3.4 }),
      solid('M20 30 L22 8 L38 20 Q50 18 62 20 L78 8 L80 30 Q82 52 50 54 Q18 52 20 30Z', '#f0a85c'),
      p('M26 18 L30 26 L34 22Z M74 18 L70 26 L66 22Z', C.pink, { w: 1.8 }),
      p('M30 14 Q50 -2 70 14 L66 22 Q50 12 34 22Z', C.sky, { w: 3 }),
      ln('M38 14 L36 22 M50 10 V18 M62 14 L64 22', C.white, 2),
      eye(38, 36, 6, { iris: C.goldLight, look: [0.3, 0.2] }),
      eye(62, 36, 6, { iris: C.goldLight, look: [-0.3, 0.2] }),
      p('M46 44 L50 47 L54 44Z', C.pink, { w: 2 }),
      ln('M50 47 V50 M42 51 Q50 56 58 51', INK, 2.2),
      ln('M30 42 H16 M30 46 L16 50 M70 42 H84 M70 46 L84 50', INK, 1.8),
    ].join(''),
  ),

  /** The faceless one. */
  nopperabo: svg(
    [
      solid('M22 92 Q18 54 36 46 H64 Q82 54 78 92Z', '#4a3e68'),
      ln('M50 46 V92 M34 60 Q42 76 36 92 M66 60 Q58 76 64 92', '#33294c', 2.4),
      p('M38 46 H62 L58 56 H42Z', C.paper, { w: 3 }),
      solid('M26 30 Q26 6 50 6 Q74 6 74 30 Q74 52 50 54 Q26 52 26 30Z', '#f4eee2'),
      ln('M36 18 Q44 12 50 12', C.white, 3, 'opacity=".7"'),
      blush(36, 38, 5, 3, '#e9c4c0'),
      blush(64, 38, 5, 3, '#e9c4c0'),
    ].join(''),
  ),

  /** A fox-fire wisp, a flame with eyes and a curl of a tail. */
  kitsunebi: svg(
    [
      solid('M50 6 Q70 30 76 52 Q82 80 50 90 Q18 80 24 52 Q28 36 40 26 Q42 40 50 36 Q50 20 50 6Z', '#55b6ee'),
      ell(50, 64, 14, 18, '#bfe6ff', { w: 0, op: 0.75 }),
      eye(41, 62, 5.4, { look: [0.3, 0.2], iris: C.indigo }),
      eye(59, 62, 5.4, { look: [-0.3, 0.2], iris: C.indigo }),
      p('M44 74 Q50 80 56 74', INK, { w: 2.6 }),
      p('M72 40 Q92 34 88 14 Q80 24 70 26Z', '#55b6ee', { w: 3 }),
    ].join(''),
  ),

  /** A snake-woman out of the marsh. */
  nureonna: svg(
    [
      p('M50 52 Q28 60 30 78 Q32 92 54 90 Q76 88 70 70 Q66 62 52 72 Q44 76 50 82', '#2d8d7a', { w: 3.6 }),
      ln('M34 78 Q44 74 50 82 M56 88 Q68 84 66 74', '#8ad6b8', 2.2),
      solid('M34 56 Q34 44 50 44 Q66 44 66 56 L64 70 Q50 74 36 70Z', '#7ab0d8'),
      solid('M32 26 Q32 6 50 6 Q68 6 68 26 Q68 44 50 46 Q32 44 32 26Z', '#bfe3de'),
      p('M26 24 Q28 -2 50 2 Q74 -2 74 24 Q70 10 50 12 Q30 10 26 24Z', '#1d2a3a', { w: 2 }),
      p('M26 24 Q22 52 34 62 Q30 44 34 30Z M74 24 Q78 52 66 62 Q70 44 66 30Z', '#1d2a3a', { w: 2 }),
      eye(42, 26, 4.4, { iris: C.red, look: [0, 0.4] }),
      eye(58, 26, 4.4, { iris: C.red, look: [0, 0.4] }),
      ln('M45 38 Q50 41 55 38', C.red, 2.4),
    ].join(''),
  ),

  /** A crow-goblin with a long nose and a feather fan. */
  tengu: svg(
    [
      p('M50 40 Q20 20 2 34 Q16 34 18 44 Q8 50 12 62 Q28 52 40 60Z', '#3a2a52', { w: 3.5 }),
      p('M50 40 Q80 20 98 34 Q84 34 82 44 Q92 50 88 62 Q72 52 60 60Z', '#3a2a52', { w: 3.5 }),
      solid('M30 62 Q34 46 50 46 Q66 46 70 62 L72 86 Q50 92 28 86Z', '#e8dcc0'),
      p('M40 46 H60 L56 60 H44Z', '#c4382a', { w: 3 }),
      p('M36 84 L32 92 M64 84 L68 92', INK, { w: 3.6 }),
      solid('M30 30 Q30 8 50 8 Q70 8 70 30 Q70 46 50 48 Q30 46 30 30Z', '#df4c3b'),
      p('M36 8 L50 -2 L64 8Z', INK, { w: 3 }),
      p('M44 36 L50 34 L88 38 L50 46Z', '#e65a46', { w: 3.4 }),
      eye(39, 28, 5.4, { look: [0.4, 0.3] }),
      eye(61, 28, 5.4, { look: [-0.4, 0.3] }),
      ln('M32 22 L44 26 M68 22 L56 26', INK, 3),
    ].join(''),
  ),

  /** A hairy earth spider with a demon's face. */
  tsuchigumo: svg(
    [
      ln('M28 56 L6 38 L8 66 M28 66 L8 84 M72 56 L94 38 L92 66 M72 66 L92 84 M36 74 L26 94 M64 74 L74 94', INK, 5.6),
      ln('M28 56 L6 38 L8 66 M28 66 L8 84 M72 56 L94 38 L92 66 M72 66 L92 84 M36 74 L26 94 M64 74 L74 94', '#7a6a58', 2.6),
      solid('M18 62 Q18 36 50 36 Q82 36 82 62 Q82 90 50 90 Q18 90 18 62Z', '#8a7866'),
      ln('M28 46 L22 40 M40 40 L38 32 M60 40 L62 32 M72 46 L78 40 M24 70 L16 72 M76 70 L84 72', '#5a4a3c', 2.2),
      p('M30 38 L24 22 L38 32Z M70 38 L76 22 L62 32Z', C.bone, { w: 3 }),
      eye(38, 54, 6.4, { iris: C.red, look: [0.2, 0.5] }),
      eye(62, 54, 6.4, { iris: C.red, look: [-0.2, 0.5] }),
      circ(50, 46, 3, C.red, { w: 2 }),
      p('M32 68 Q50 86 68 68 Q50 72 32 68Z', C.plum, { w: 3 }),
      fangs(37, 69, 5, 5, 5.4),
    ].join(''),
  ),

  /** The snow woman, pale and still. */
  yukionna: svg(
    [
      solid('M16 92 Q18 56 38 48 H62 Q82 56 84 92Z', '#e6f1fb'),
      ln('M32 92 Q40 70 50 66 Q60 70 68 92', '#b6d2ec', 2.4),
      p('M38 50 H62 L58 62 H42Z', '#9fc3e8', { w: 3 }),
      solid('M32 28 Q32 8 50 8 Q68 8 68 28 Q68 48 50 50 Q32 48 32 28Z', '#f2f8ff'),
      p('M26 26 Q26 0 50 2 Q74 0 74 26 Q72 8 50 14 Q28 8 26 26Z', '#1b1d3a', { w: 2 }),
      p('M26 26 Q18 56 30 80 Q28 52 34 32Z M74 26 Q82 56 70 80 Q72 52 66 32Z', '#1b1d3a', { w: 2 }),
      eye(42, 30, 4.6, { iris: '#6fb4ee', look: [0, 0.2] }),
      eye(58, 30, 4.6, { iris: '#6fb4ee', look: [0, 0.2] }),
      ln('M46 41 Q50 43 54 41', '#7b9cc8', 2.4),
      circ(14, 24, 2.6, C.white, { w: 1.4 }),
      circ(88, 40, 2.2, C.white, { w: 1.4 }),
      circ(10, 56, 2, C.white, { w: 1.4 }),
      circ(90, 74, 2.8, C.white, { w: 1.4 }),
    ].join(''),
  ),

  /** A blue oni ringed with drums. */
  onidrummer: svg(
    [
      ...[22, 78].map((x) => circ(x, 58, 13, C.red, { w: 3.6 })),
      ...[22, 78].map((x) => circ(x, 58, 6, C.gold, { w: 3 })),
      ...[50].map((x) => circ(x, 22, 0, C.red, { w: 0 })),
      solid('M24 92 Q22 56 38 50 H62 Q78 56 76 92Z', '#3a64c8'),
      p('M30 74 H70 V84 H30Z', C.red, { w: 3 }),
      solid('M28 30 Q28 8 50 8 Q72 8 72 30 Q74 52 50 54 Q26 52 28 30Z', '#4a7ae0'),
      p('M36 12 L40 0 L46 12Z M54 12 L60 0 L64 12Z', C.bone, { w: 3 }),
      eye(40, 30, 5.6, { iris: C.gold }),
      eye(60, 30, 5.6, { iris: C.gold }),
      ln('M32 23 L45 28 M68 23 L55 28', INK, 3.4),
      p('M36 42 Q50 52 64 42 Q50 46 36 42Z', C.plum, { w: 3 }),
      fangs(40, 42, 4, 5, 5.4),
      ln('M16 40 L34 62 M84 40 L66 62', C.white, 4),
      ln('M16 40 L34 62 M84 40 L66 62', INK, 1.4),
    ].join(''),
  ),

  /** One of Orochi's eight heads: a great serpent rising out of the ground. */
  orochi: svg(
    [
      p('M36 92 Q22 56 40 44 Q54 34 60 18', '#3a8f56', { w: 14 }),
      ln('M36 92 Q22 56 40 44 Q54 34 60 18', '#3a8f56', 11),
      ln('M30 84 Q30 66 40 54 M30 70 Q36 62 42 60', '#9be0a8', 2.2),
      solid('M28 24 Q30 4 56 6 Q80 8 80 26 Q80 42 56 44 Q30 44 28 24Z', '#48a864'),
      p('M34 8 L28 -2 L44 6Z M70 10 L80 0 L74 16Z', C.gold, { w: 3 }),
      eye(46, 22, 5.8, { iris: C.red, look: [0.4, 0.2] }),
      eye(66, 22, 5.8, { iris: C.red, look: [-0.4, 0.2] }),
      p('M44 36 Q56 46 70 36 Q56 40 44 36Z', C.plum, { w: 3 }),
      p('M54 40 L48 50 M54 40 L60 50', C.red, { w: 2.6 }),
      ln('M50 38 V42', C.white, 3),
      fangs(47, 36, 4, 5.4, 5),
    ].join(''),
  ),

  /** A Noh mask of jealousy with horns, in a kimono. */
  hannya: svg(
    [
      solid('M22 92 Q22 62 40 56 H60 Q78 62 78 92Z', '#7a4fa8'),
      ln('M30 90 Q40 72 50 70 Q60 72 70 90', C.pink, 2.4),
      solid('M26 34 Q26 10 50 10 Q74 10 74 34 Q72 60 50 62 Q28 60 26 34Z', '#f4efe4'),
      p('M30 18 L18 0 L40 12Z M70 18 L82 0 L60 12Z', C.gold, { w: 3.4 }),
      p('M24 28 Q18 54 30 64 Q30 46 32 34Z M76 28 Q82 54 70 64 Q70 46 68 34Z', INK, { w: 2 }),
      ln('M32 24 L44 30 M68 24 L56 30', INK, 3.6),
      ell(40, 34, 5, 3.4, C.gold, { w: 2.6 }),
      ell(60, 34, 5, 3.4, C.gold, { w: 2.6 }),
      circ(40, 34, 1.6, INK, { w: 0 }),
      circ(60, 34, 1.6, INK, { w: 0 }),
      blush(34, 44, 5, 3, '#f0777a'),
      blush(66, 44, 5, 3, '#f0777a'),
      p('M34 50 Q50 64 66 50 Q50 54 34 50Z', INK, { w: 2.4 }),
      fangs(38, 51, 5, 5, 5),
    ].join(''),
  ),

  /** A skeleton. */
  bones: svg(
    [
      p('M50 52 V74 M34 58 H66 M36 66 H64 M38 74 H62', C.bone, { w: 5.6 }),
      ln('M50 52 V74 M34 58 H66 M36 66 H64 M38 74 H62', INK, 1.6, 'opacity=".5"'),
      p('M34 58 L22 76 M66 58 L78 76', C.bone, { w: 5.6 }),
      p('M42 76 L36 92 M58 76 L64 92', C.bone, { w: 5.6 }),
      circ(22, 78, 4, C.bone, { w: 3 }),
      circ(78, 78, 4, C.bone, { w: 3 }),
      solid('M24 30 Q24 6 50 6 Q76 6 76 30 Q76 42 66 46 V54 H34 V46 Q24 42 24 30Z', C.bone),
      ell(39, 30, 8, 9, INK, { w: 0 }),
      ell(61, 30, 8, 9, INK, { w: 0 }),
      circ(39, 31, 2.6, C.red, { w: 0 }),
      circ(61, 31, 2.6, C.red, { w: 0 }),
      p('M47 40 L50 46 L53 40Z', INK, { w: 1.6 }),
      ln('M38 50 V54 M44 50 V54 M50 50 V54 M56 50 V54 M62 50 V54', INK, 2),
    ].join(''),
  ),

  /** A little skull on legs. */
  bonelet: svg(
    [
      p('M40 76 L36 92 M60 76 L64 92', C.bone, { w: 5 }),
      circ(35, 92, 3.4, C.bone, { w: 2.6 }),
      circ(65, 92, 3.4, C.bone, { w: 2.6 }),
      solid('M20 48 Q20 16 50 16 Q80 16 80 48 Q80 62 68 66 V78 H32 V66 Q20 62 20 48Z', C.bone),
      ell(37, 48, 9, 10, INK, { w: 0 }),
      ell(63, 48, 9, 10, INK, { w: 0 }),
      circ(37, 49, 2.8, C.red, { w: 0 }),
      circ(63, 49, 2.8, C.red, { w: 0 }),
      p('M46 60 L50 68 L54 60Z', INK, { w: 1.6 }),
      ln('M38 72 V78 M46 72 V78 M54 72 V78 M62 72 V78', INK, 2.2),
    ].join(''),
  ),

  /** A purple oni with an iron-studded club. */
  onibrute: svg(
    [
      p('M78 84 L88 24 L100 28 L90 88Z', '#6b4a32', { w: 3.4 }),
      circ(84, 26, 2, C.coal, { w: 0 }),
      circ(94, 32, 2, C.coal, { w: 0 }),
      circ(88, 44, 2, C.coal, { w: 0 }),
      solid('M10 92 Q8 52 32 48 H68 Q92 52 90 92Z', '#7a4fb8'),
      p('M26 70 H74 V84 H26Z', '#2c2840', { w: 3.4 }),
      solid('M22 30 Q22 6 50 6 Q78 6 78 30 Q80 52 50 54 Q20 52 22 30Z', '#8a5ec8'),
      p('M30 12 L28 -2 L42 8Z M70 12 L72 -2 L58 8Z M50 10 L46 -2 L54 -2Z', C.bone, { w: 3 }),
      eye(38, 30, 6, { iris: C.gold }),
      eye(62, 30, 6, { iris: C.gold }),
      ln('M28 22 L44 28 M72 22 L56 28', INK, 4),
      p('M32 42 Q50 56 68 42 Q50 46 32 42Z', C.plum, { w: 3 }),
      fangs(36, 43, 5, 6, 6),
    ].join(''),
  ),

  /** A biwa lute that plays itself. */
  biwa: svg(
    [
      solid('M30 94 Q16 66 30 46 Q40 38 50 38 Q60 38 70 46 Q84 66 70 94Z', '#9a5b30'),
      ell(50, 68, 15, 20, '#6e3d1d', { w: 3 }),
      p('M44 38 V4 H56 V38Z', '#5a3418', { w: 3.4 }),
      p('M42 4 H58 V12 H42Z', '#3a2210', { w: 3 }),
      ln('M46 40 V84 M54 40 V84', C.goldLight, 1.6),
      eye(42, 60, 5.4, { look: [0.3, 0.3] }),
      eye(58, 60, 5.4, { look: [-0.3, 0.3] }),
      p('M40 76 Q50 86 60 76 Q50 80 40 76Z', INK, { w: 2.6 }),
      p('M18 56 Q4 48 10 36 M82 56 Q96 48 90 36', C.skin, { w: 4.4 }),
      circ(10, 34, 3.4, C.skin, { w: 3 }),
      circ(90, 34, 3.4, C.skin, { w: 3 }),
    ].join(''),
  ),

  /** A skeleton too tall to fit the picture. */
  gashadokuro: svg(
    [
      p('M6 92 L14 56 M94 92 L86 56', C.bone, { w: 8 }),
      p('M30 56 H70 M32 66 H68 M36 76 H64 M40 86 H60', C.bone, { w: 7 }),
      ln('M50 50 V92', C.bone, 8),
      ln('M30 56 H70 M32 66 H68 M36 76 H64 M40 86 H60 M50 50 V92', INK, 1.6, 'opacity=".45"'),
      solid('M12 34 Q12 -2 50 -2 Q88 -2 88 34 Q88 52 74 56 V66 H26 V56 Q12 52 12 34Z', C.bone),
      ell(32, 32, 14, 16, INK, { w: 0 }),
      ell(68, 32, 14, 16, INK, { w: 0 }),
      circ(32, 33, 4.4, C.red, { w: 0 }),
      circ(68, 33, 4.4, C.red, { w: 0 }),
      p('M45 46 L50 56 L55 46Z', INK, { w: 2 }),
      ln('M30 60 V66 M38 60 V66 M46 60 V66 M54 60 V66 M62 60 V66 M70 60 V66', INK, 2.6),
      ln('M20 14 L30 20 M80 14 L70 20', INK, 3),
    ].join(''),
  ),

  /** The nine-tailed fox in a kimono: the shape of the tails says it all. */
  tamamo: svg(
    [
      ...[-60, -42, -24, -8, 8, 24, 42, 60].map((a) =>
        p('M50 70 Q50 40 56 18 Q66 36 62 70Z', a % 2 ? '#fff0c4' : '#f6d27a', { w: 3, x: `transform="rotate(${a} 50 78)"` }),
      ),
      solid('M24 92 Q24 62 40 56 H60 Q76 62 76 92Z', '#e8e0f4'),
      p('M36 74 H64 V84 H36Z', '#8a2f55', { w: 3 }),
      p('M40 56 H60 L56 64 H44Z', C.red, { w: 3 }),
      solid('M28 34 L26 10 L40 22 Q50 20 60 22 L74 10 L72 34 Q74 54 50 58 Q26 54 28 34Z', '#fff6e4'),
      p('M31 22 L31 14 L37 22Z M69 22 L69 14 L63 22Z', C.red, { w: 1.6 }),
      p('M31 36 L40 40 M69 36 L60 40', C.red, { w: 3 }),
      eye(41, 38, 5, { iris: '#e8a02a', look: [0, 0.3] }),
      eye(59, 38, 5, { iris: '#e8a02a', look: [0, 0.3] }),
      p('M46 46 L50 49 L54 46Z', INK, { w: 2 }),
      ln('M42 52 Q50 56 58 52', C.red, 2.4),
    ].join(''),
  ),

  /** The supreme commander: a calm old man with a head far too long. */
  nurarihyon: svg(
    [
      solid('M16 92 Q14 62 34 56 H66 Q86 62 84 92Z', '#2c2f6a'),
      ln('M34 56 L50 92 L66 56', C.goldLight, 2.6),
      circ(50, 76, 4.4, C.gold, { w: 2.4 }),
      p('M40 56 H60 L56 66 H44Z', C.paper, { w: 3 }),
      solid('M32 42 Q30 22 38 6 Q50 -6 62 6 Q70 22 68 42 Q66 58 50 60 Q34 58 32 42Z', '#f1d8b8'),
      ell(50, 4, 26, 6, '#d6bfa0', { w: 0, op: 0.0 }),
      p('M34 24 Q50 14 66 24', 'none', { w: 2 }),
      ln('M38 32 L46 34 M54 34 L62 32', INK, 2.6),
      circ(42, 36, 2.2, INK, { w: 0 }),
      circ(58, 36, 2.2, INK, { w: 0 }),
      ln('M44 48 Q50 52 56 48', C.redDark, 2.4),
      ln('M46 54 Q50 66 54 54', C.white, 3.4),
      ln('M36 40 L28 46 M64 40 L72 46', '#d6bfa0', 2.6),
      p('M22 60 Q10 54 12 40 M78 60 Q90 54 88 40', '#2c2f6a', { w: 5 }),
    ].join(''),
  ),
};
