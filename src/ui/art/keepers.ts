import { blush, C, circ, ell, eye, INK, ln, p, rect, solid, svg } from './kit';

/** The three lantern keepers, as busts. */

export const KEEPER_ART: Record<string, string> = {
  /** Hanae, the shrine maiden: ink-black hair, a gohei wand, the calm of someone who has done this before. */
  miko: svg(
    [
      p('M12 100 Q10 70 30 64 H70 Q90 70 88 100Z', C.white, { w: 3.6 }),
      p('M12 100 Q12 84 22 78 L30 100Z M88 100 Q88 84 78 78 L70 100Z', C.red, { w: 3.4 }),
      p('M36 64 H64 L58 78 H42Z', C.red, { w: 3.2 }),
      p('M44 64 L50 74 L56 64', C.white, { w: 2.2 }),
      p('M22 56 Q2 60 6 92 Q16 90 22 78Z M78 56 Q98 60 94 92 Q84 90 78 78Z', INK, { w: 2.4 }),
      solid('M26 38 Q26 12 50 12 Q74 12 74 38 Q74 62 50 66 Q26 62 26 38Z', C.skin),
      p('M20 40 Q16 2 50 2 Q84 2 80 40 Q76 14 50 18 Q24 14 20 40Z', INK, { w: 2.4 }),
      p('M20 40 Q16 70 28 86 Q24 60 28 42Z M80 40 Q84 70 72 86 Q76 60 72 42Z', INK, { w: 2.4 }),
      p('M34 10 L66 10 L62 20 L38 20Z', C.red, { w: 2.8 }),
      ln('M42 14 H58', C.white, 2),
      eye(40, 40, 5.4, { iris: '#3a2418', look: [0.2, 0.2] }),
      eye(60, 40, 5.4, { iris: '#3a2418', look: [-0.2, 0.2] }),
      ln('M33 32 Q40 29 46 32 M54 32 Q60 29 67 32', INK, 2.4),
      blush(34, 50),
      blush(66, 50),
      ln('M45 54 Q50 57 55 54', C.red, 2.6),
      ln('M88 96 V40', '#b8905a', 4),
      p('M82 40 H94 L92 28 H84Z', C.white, { w: 2.4 }),
      p('M80 28 l-4 8 l4 8 M96 28 l4 8 l-4 8', C.white, { w: 2.2 }),
    ].join(''),
  ),

  /** Ichi, the masterless swordsman: a topknot, a scar, a haori worn thin. */
  ronin: svg(
    [
      p('M4 100 Q4 68 28 62 H72 Q96 68 96 100Z', '#2c3a78', { w: 3.6 }),
      ln('M50 62 L36 100 M50 62 L64 100', '#1c2658', 2.6),
      p('M40 62 H60 L54 76 H46Z', C.paper, { w: 3 }),
      p('M70 22 L96 6 L98 14 L76 32Z', C.coal, { w: 3.6 }),
      p('M82 12 L94 6', C.gold, { w: 3.6 }),
      solid('M26 40 Q26 14 50 14 Q74 14 74 40 Q74 64 50 66 Q26 64 26 40Z', '#e6c294'),
      p('M20 36 Q18 8 50 6 Q82 8 80 36 Q74 20 50 22 Q26 20 20 36Z', INK, { w: 2.4 }),
      p('M44 6 L50 -6 L56 6Z', INK, { w: 2.4 }),
      ln('M32 32 L46 36 M68 32 L54 36', INK, 3.6),
      eye(40, 42, 4.6, { iris: '#3a2418', look: [0.3, 0.2] }),
      eye(60, 42, 4.6, { iris: '#3a2418', look: [-0.3, 0.2] }),
      ln('M30 28 L38 52', '#c4382a', 2.4),
      p('M36 54 Q50 66 64 54 Q50 58 36 54Z', '#3a2a22', { w: 0, op: 0.55 }),
      ln('M43 58 H57', INK, 2.4),
    ].join(''),
  ),

  /** Bunbuku, the tanuki merchant: all belly, a sly smile, a leaf on his head. */
  tanuki: svg(
    [
      p('M10 100 Q8 66 34 60 H66 Q92 66 90 100Z', '#a7825a', { w: 3.6 }),
      ell(50, 86, 26, 18, '#f1dcb8', { w: 3.4 }),
      p('M24 68 H76 L72 78 H28Z', '#2c3a78', { w: 3.2 }),
      circ(50, 73, 4.2, C.gold, { w: 2.4 }),
      solid('M18 44 Q18 20 50 18 Q82 20 82 44 Q82 66 50 68 Q18 66 18 44Z', '#a7825a'),
      p('M20 30 L14 12 L36 22Z M80 30 L86 12 L64 22Z', '#6a5038', { w: 3.4 }),
      ell(36, 44, 9, 8, '#4a3828', { w: 0 }),
      ell(64, 44, 9, 8, '#4a3828', { w: 0 }),
      eye(36, 44, 4.4, { look: [0.3, 0.1] }),
      eye(64, 44, 4.4, { look: [-0.3, 0.1] }),
      ell(50, 56, 12, 9, '#f1dcb8', { w: 0 }),
      circ(50, 52, 3.4, INK, { w: 0 }),
      ln('M40 59 Q50 66 60 59', INK, 2.8),
      p('M36 20 Q50 4 64 20 Q50 14 36 20Z', C.leaf, { w: 3 }),
      ln('M50 6 V18', '#5d8a2a', 2.4),
      rect(8, 78, 14, 20, '#c4883a', { w: 3, r: 6 }),
    ].join(''),
  ),
};
