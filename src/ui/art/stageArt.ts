import { disc, parts, puff, type Rect, twinkle } from './actArt';

/**
 * The scene behind the enemy in a fight, one per act: 96×40 cells of flat pixel rects (about 4px each on a phone), standing on the stage's floor. Tone on tone
 * with the night (`--stage-*` in `acts.css`) so it is a place, not a picture: `a` the far shapes, `b` the near ones, `l` things lit, `h` the warning lights,
 * `g` window glass, `w` candle wax. The enemy hides the middle, so the weight is at the sides and up high.
 */

/** A round arch standing on `y0` (its springline), `hw` half its width, `rise` tall, a stroke `th` thick: one rect per row. */
function arch(cx: number, hw: number, y0: number, rise: number, th: number): Rect[] {
  const out: Rect[] = [];
  for (let r = 0; r < rise; r++) {
    const outer = Math.round(hw * Math.sqrt(1 - (r / rise) ** 2));
    const inner = r < rise - th ? Math.round((hw - th) * Math.sqrt(1 - (r / (rise - th)) ** 2)) : 0;
    const y = y0 - r;
    if (inner <= 0) out.push([cx - outer, y, 2 * outer, 1]);
    else out.push([cx - outer, y, outer - inner, 1], [cx + inner, y, outer - inner, 1]);
  }
  return out;
}

/** Act 1, the crypt: a colonnade of round arches, tombs in the gaps, candles on the pillars and a chandelier hanging over the enemy. */
// biome-ignore format: pixel rects read best in rows
const crypt = (): string => {
  const pillars = [0, 31, 63, 93];
  const candles = [1, 32, 64, 94];
  return (
    // tombs and a cross between the pillars, far behind
    parts('a', [
      [10, 33, 5, 7], [11, 32, 3, 1], [20, 30, 2, 10], [18, 32, 6, 2],
      [40, 34, 6, 6], [41, 33, 4, 1], [72, 33, 5, 7], [73, 32, 3, 1], [82, 31, 2, 9], [80, 33, 6, 2],
      [4, 38, 90, 2],
    ]) +
    parts('b', pillars.map((x): Rect => [x, 14, 3, 26])) +
    parts('b', [...arch(16, 14, 14, 11, 2), ...arch(48, 14, 14, 11, 2), ...arch(80, 14, 14, 11, 2)]) +
    // the capital of every pillar, and the chandelier's chain and ring
    parts('b', pillars.map((x): Rect => [x - 1, 13, 5, 2])) +
    parts('b', [[47, 0, 2, 6], [42, 6, 12, 1], [41, 7, 2, 1], [53, 7, 2, 1]]) +
    parts('w', [...candles.map((x): Rect => [x, 27, 2, 3]), [42, 4, 2, 2], [47, 4, 2, 2], [52, 4, 2, 2]]) +
    candles.map((x, i) => twinkle(x, 25, 1.3 + i * 0.35, -i * 0.5, 'l', 2, 2)).join('') +
    [43, 48, 53].map((x, i) => twinkle(x - 1, 2, 1.1 + i * 0.4, -i * 0.3, 'l', 2, 2)).join('')
  );
};

/** Act 2, the open-plan office: tall blinds-and-sunlight windows either side, a clock, cubicle panels with their lit monitors and a filing cabinet. */
// biome-ignore format: pixel rects read best in rows
const office = (): string => {
  // a window: its glass in bars of light (the blinds are the dark rows between), a rooftop skyline at the bottom
  const win = (x: number): string =>
    parts('b', [[x - 1, 3, 20, 1], [x - 1, 25, 20, 2], [x - 1, 3, 1, 22], [x + 18, 3, 1, 22]]) +
    parts('g', [4, 8, 12, 16, 20].map((dy): Rect => [x, dy, 18, 2])) +
    parts('a', [[x + 1, 19, 4, 6], [x + 7, 16, 5, 9], [x + 13, 20, 4, 5]]);
  return (
    win(8) +
    win(70) +
    // the clock and two framed posters on the wall between
    parts('b', [[44, 3, 8, 8], [43, 4, 10, 6], [30, 6, 7, 9], [60, 6, 7, 9]]) +
    parts('l', [[47, 5, 2, 5], [47, 8, 4, 1]]) +
    parts('a', [[31, 7, 5, 7], [61, 7, 5, 7]]) +
    parts('h', [[32, 9, 3, 1], [62, 9, 3, 1]]) +
    // cubicle panels with a monitor each, and a filing cabinet
    parts('a', [[0, 26, 24, 14], [72, 26, 24, 14]]) +
    parts('b', [[0, 25, 25, 2], [71, 25, 25, 2], [3, 30, 8, 6], [13, 32, 8, 4], [76, 31, 6, 5], [86, 28, 8, 12], [86, 31, 8, 1], [86, 35, 8, 1]]) +
    parts('l', [[88, 29, 4, 1], [88, 33, 4, 1], [88, 37, 4, 1]]) +
    twinkle(4, 31, 2.6, 0, 'l', 6, 4) +
    twinkle(14, 33, 3.4, -1.2, 'l', 6, 2) +
    twinkle(77, 32, 3, -0.7, 'l', 4, 3)
  );
};

/** Act 3, the night factory: pipes along the ceiling and down the walls, turning gears, a catwalk with its railing, warning lamps and steam. */
// biome-ignore format: pixel rects read best in rows
const factory = (): string => {
  const gear = (cx: number, cy: number, r: number, cls: string, turn: 'cw' | 'ccw'): string =>
    `<g class="gear ${turn}" style="--cx:${cx}px;--cy:${cy}px">${parts(cls, [
      ...disc(cx, cy, r),
      [cx - r - 2, cy - 1, 2 * r + 4, 2],
      [cx - 1, cy - r - 2, 2, 2 * r + 4],
    ])}</g>`;
  return (
    // the ceiling's pipes with their flanges, and the two that run down the walls
    parts('b', [[0, 1, 96, 3], [0, 6, 96, 2], [6, 8, 3, 32], [88, 8, 3, 24]]) +
    parts('a', [...[16, 34, 52, 74].map((x): Rect => [x, 0, 2, 5]), ...[16, 34, 52, 74].map((x): Rect => [x, 5, 2, 4]), [5, 16, 5, 2], [87, 14, 5, 2], [5, 28, 5, 2]]) +
    // gears, one meshing with the other
    gear(78, 17, 7, 'a', 'cw') +
    gear(66, 25, 4, 'b', 'ccw') +
    gear(20, 22, 5, 'a', 'ccw') +
    // the catwalk: floor, railing and the legs it stands on
    parts('b', [[0, 30, 96, 2], [0, 25, 96, 1], ...Array.from({ length: 17 }, (_, i): Rect => [i * 6, 25, 1, 5])]) +
    parts('a', [[10, 32, 2, 8], [46, 32, 2, 8], [84, 32, 2, 8]]) +
    // warning lamps that blink, and steam off the pipes
    parts('h', [[2, 20, 3, 3], [92, 20, 3, 3]]) +
    twinkle(2, 20, 1.6, 0, 'h', 3, 3) +
    twinkle(92, 20, 2.1, -0.8, 'h', 3, 3) +
    twinkle(47, 12, 2.8, -1, 'l', 2, 2) +
    puff(17, 5, 0) +
    puff(35, 5, -1.7) +
    puff(75, 5, -0.9) +
    puff(7, 14, -2.4)
  );
};

const SCENES = [crypt, office, factory];

/** The scene behind the enemy of an act (1-based; a later act takes the last scene, like `actDef`). */
export const stageArt = (act: number): string =>
  `<svg class="stage-art-svg" viewBox="0 0 96 40" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges" aria-hidden="true">${SCENES[Math.min(act, SCENES.length) - 1]()}</svg>`;
