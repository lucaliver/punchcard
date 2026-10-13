import { disc, parts, puff, type Rect, twinkle } from './actArt';

/**
 * The scene behind the enemy in a fight, one per act: 96×40 cells of flat pixel rects (about 4px each on a phone), standing on the stage's floor. Tone on tone
 * with the night (`--stage-*` in `acts.css`) so it is a place, not a picture: `a` the far shapes, `b` the near ones, `l` things lit, `h` the warning lights,
 * `g` window glass and the first light of day. The enemy hides the middle, so the weight is at the sides and up high.
 */

/** Act 1, the company car park in the morning: a violet dawn behind a chain-link fence and the office towers, two street lamps still on, a car at either side. */
// biome-ignore format: pixel rects read best in rows
const parking = (): string => {
  // the fence's mesh: a pixel every other cell, every other row
  const mesh: Rect[] = [];
  for (let y = 26; y < 36; y += 2) for (let x = (y / 2) % 2; x < 96; x += 2) mesh.push([x, y, 1, 1]);
  const car = (x: number): string =>
    parts('b', [[x, 31, 22, 6], [x + 4, 26, 13, 5]]) +
    parts('a', [[x + 5, 27, 5, 4], [x + 11, 27, 5, 4], [x + 2, 36, 5, 4], [x + 15, 36, 5, 4]]);
  return (
    // the first light of the day, in bands over the towers
    parts('g', [[0, 23, 96, 1], [0, 25, 96, 2], [0, 28, 96, 3]]) +
    parts('a', [[0, 12, 8, 28], [9, 18, 6, 22], [16, 8, 9, 32], [70, 14, 8, 26], [79, 6, 9, 34], [89, 15, 7, 25]]) +
    parts('g', [[2, 15, 2, 1], [2, 20, 2, 1], [19, 12, 2, 1], [19, 17, 2, 1], [82, 10, 2, 1], [82, 16, 2, 1], [92, 19, 2, 1]]) +
    // the fence
    parts('a', mesh) +
    parts('b', [[0, 24, 96, 1], [0, 36, 96, 1], ...[0, 24, 48, 72, 95].map((x): Rect => [x, 23, 1, 17])]) +
    // two street lamps, still lit
    parts('b', [[3, 6, 1, 34], [1, 5, 6, 2], [92, 4, 1, 36], [87, 3, 7, 2]]) +
    twinkle(1, 7, 3.2, 0, 'l', 6, 1) +
    twinkle(87, 5, 4.1, -1.7, 'l', 7, 1) +
    // a car at each side: one with its exhaust, one with a hazard light blinking
    car(8) +
    parts('l', [[29, 32, 1, 2]]) +
    puff(6, 35, 0) +
    car(68) +
    twinkle(68, 32, 1.2, 0, 'h', 1, 2)
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

/** Act 4, the supermarket aisle: a back wall of shelves stacked with products, gondolas with more at either side, a hanging aisle sign and the strip lights. */
// biome-ignore format: pixel rects read best in rows
const aisle = (): string => {
  // a shelf unit: its frame, three shelves and a row of products on each
  const shelf = (x: number, w: number): string =>
    parts('b', [[x, 12, w, 1], [x, 20, w, 1], [x, 28, w, 1], [x, 36, w, 4], [x, 12, 1, 28], [x + w - 1, 12, 1, 28]]) +
    parts('a', [[x + 1, 14, w - 2, 6], [x + 1, 22, w - 2, 6], [x + 1, 30, w - 2, 6]]) +
    parts('l', [3, 11, 19].map((dx): Rect => [x + dx - 2, 15, 3, 3]).filter(([px]) => px < x + w - 2)) +
    parts('h', [6, 14].map((dx): Rect => [x + dx, 23, 3, 3]).filter(([px]) => px < x + w - 2)) +
    parts('l', [4, 9, 15].map((dx): Rect => [x + dx, 31, 3, 3]).filter(([px]) => px < x + w - 2));
  return (
    shelf(0, 22) +
    shelf(74, 22) +
    // the far wall's shelves between them, lower and dimmer
    parts('a', [[24, 20, 48, 20]]) +
    parts('b', [[24, 20, 48, 1], [24, 28, 48, 1], [24, 36, 48, 1]]) +
    parts('g', [30, 38, 46, 54, 62].map((x): Rect => [x, 22, 4, 4])) +
    // the aisle sign, hanging from the ceiling
    parts('b', [[47, 0, 1, 4], [49, 0, 1, 4], [38, 4, 20, 7]]) +
    parts('l', [[40, 6, 16, 1], [40, 8, 10, 1]]) +
    // strip lights, one of them flickering
    parts('l', [[10, 2, 8, 1], [78, 2, 8, 1]]) +
    twinkle(60, 2, 2.2, -0.6, 'l', 8, 1) +
    twinkle(70, 12, 3.1, -1.4, 'h', 2, 2)
  );
};

const SCENES = [parking, office, factory, aisle];

/** The scene behind the enemy of an act (1-based; a later act takes the last scene, like `actDef`). */
export const stageArt = (act: number): string =>
  `<svg class="stage-art-svg" viewBox="0 0 96 40" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges" aria-hidden="true">${SCENES[Math.min(act, SCENES.length) - 1]()}</svg>`;
