import type { StageId } from '../../game/types';
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

/** The weekend's park: round trees either side, a lamp post still lit, a bench, a path and a fountain's spray, the sun high up. */
// biome-ignore format: pixel rects read best in rows
const park = (): string =>
  parts('l', disc(48, 6, 4)) +
  parts('a', [[8, 4, 10, 1], [10, 3, 6, 1], [74, 8, 12, 1], [76, 7, 8, 1]]) +
  parts('a', [...disc(12, 17, 10), ...disc(86, 19, 9)]) +
  parts('b', [...disc(7, 14, 5), ...disc(91, 15, 5)]) +
  parts('b', [[11, 26, 3, 14], [85, 27, 3, 13]]) +
  parts('l', [[8, 12, 2, 1], [90, 13, 2, 1], [14, 19, 1, 1], [82, 21, 1, 1]]) +
  // the lamp post and the bench
  parts('b', [[26, 14, 1, 26], [24, 12, 5, 2], [66, 33, 14, 2], [66, 30, 14, 1], [67, 35, 1, 4], [78, 35, 1, 4]]) +
  twinkle(24, 12, 3.3, 0, 'l', 5, 1) +
  // a fountain with a thread of water going up and down
  parts('a', [[34, 34, 14, 6], [36, 31, 10, 3]]) +
  parts('b', [[34, 33, 14, 1], [40, 24, 2, 8]]) +
  twinkle(39, 22, 1.4, 0, 'g', 4, 2) +
  twinkle(37, 26, 1.9, -0.7, 'l', 1, 1) +
  twinkle(44, 27, 1.7, -0.3, 'l', 1, 1);

/** The weekend's café terrace: parasols with a scalloped edge, small round tables, strings of lights along the top and pots of flowers. */
// biome-ignore format: pixel rects read best in rows
const terrace = (): string => {
  const parasol = (cx: number, y: number): string =>
    parts('b', [[cx - 9, y + 1, 18, 1], [cx - 7, y, 14, 1], [cx - 4, y - 1, 8, 1], [cx - 1, y - 2, 2, 1]]) +
    parts('h', [[cx - 5, y, 2, 1], [cx + 3, y, 2, 1], [cx - 1, y - 1, 2, 1]]) +
    parts('a', [[cx, y + 2, 1, 18]]) +
    parts('b', [[cx - 7, y + 17, 15, 2], [cx - 5, y + 19, 11, 1]]);
  return (
    // the string of lights, with bulbs that blink out of step
    parts('a', [[0, 2, 96, 1], [0, 3, 8, 1], [88, 3, 8, 1]]) +
    twinkle(10, 4, 2.4, 0, 'l', 2, 2) + twinkle(26, 4, 3.1, -1, 'h', 2, 2) + twinkle(42, 4, 2.2, -0.4, 'l', 2, 2) +
    twinkle(58, 4, 2.9, -1.7, 'h', 2, 2) + twinkle(74, 4, 3.4, -0.9, 'l', 2, 2) + twinkle(88, 4, 2.6, -2, 'h', 2, 2) +
    parasol(14, 12) +
    parasol(82, 14) +
    // little tables and chairs in front, and pots of flowers on the railing
    parts('a', [[2, 31, 24, 1], [4, 32, 1, 8], [22, 32, 1, 8], [72, 32, 22, 1], [74, 33, 1, 7], [91, 33, 1, 7]]) +
    parts('b', [[0, 25, 3, 9], [93, 26, 3, 8]]) +
    parts('a', [[30, 33, 5, 5], [64, 33, 5, 5]]) +
    parts('h', [[30, 31, 2, 2], [33, 30, 2, 2], [64, 31, 2, 2], [67, 30, 2, 2]]) +
    parts('l', [[31, 32, 1, 1], [34, 31, 1, 1]])
  );
};

/** The weekend's back garden: a hedge on one side with a gnome at its foot, a picket fence on the other, a washing line, and smoke from somewhere. */
// biome-ignore format: pixel rects read best in rows
const garden = (): string => {
  const hedge: Rect[] = [[0, 22, 26, 18], [2, 20, 8, 2], [14, 19, 8, 3], [20, 21, 6, 1]];
  const leaves: Rect[] = [];
  for (let y = 24; y < 38; y += 3) for (let x = (y / 3) % 2 ? 1 : 3; x < 25; x += 4) leaves.push([x, y, 1, 1]);
  const fence: Rect[] = [];
  for (let x = 66; x < 96; x += 4) fence.push([x, 24, 2, 16], [x, 23, 1, 1]);
  return (
    parts('a', hedge) + parts('b', leaves) +
    // the gnome, with his hot red cap
    parts('b', [[27, 34, 4, 6]]) + parts('h', [[28, 31, 2, 3], [29, 30, 1, 1]]) + parts('l', [[28, 34, 2, 1]]) +
    parts('a', fence) + parts('b', [[64, 28, 32, 1], [64, 35, 32, 1]]) +
    // the washing line: a sheet, a shirt and a sock
    parts('b', [[34, 6, 1, 20], [60, 6, 1, 20], [34, 7, 27, 1]]) +
    parts('l', [[39, 8, 7, 6]]) + parts('h', [[49, 8, 5, 5], [48, 8, 1, 2], [54, 8, 1, 2]]) + parts('g', [[56, 8, 2, 4]]) +
    // a tree behind the fence, and the smoke
    parts('a', [...disc(80, 12, 8)]) + parts('b', [[79, 18, 3, 6]]) +
    puff(46, 24, 0) + puff(48, 20, -1.4) + puff(45, 16, -2.6) + puff(47, 12, -0.7)
  );
};

/** The weekend's living room: a window with the curtains half drawn, the telly with its glow, framed pictures, a floor lamp and a plant. */
// biome-ignore format: pixel rects read best in rows
const livingRoom = (): string =>
  // the window, its curtains, and the light coming in
  parts('b', [[36, 3, 24, 1], [36, 3, 1, 20], [59, 3, 1, 20], [36, 22, 24, 1], [47, 3, 2, 20]]) +
  parts('g', [[37, 4, 10, 18], [49, 4, 10, 18]]) +
  parts('a', [[30, 2, 8, 22], [58, 2, 8, 22]]) + parts('h', [[32, 4, 1, 18], [62, 4, 1, 18]]) +
  // the telly on a stand, flickering
  parts('b', [[3, 22, 20, 12], [11, 34, 4, 2], [6, 36, 14, 1]]) + parts('a', [[5, 24, 16, 8]]) +
  twinkle(6, 25, 0.9, 0, 'g', 14, 6) + twinkle(8, 27, 1.3, -0.4, 'l', 4, 2) + twinkle(14, 29, 1.1, -0.8, 'h', 3, 1) +
  // pictures on the wall
  parts('b', [[68, 6, 8, 10], [78, 9, 8, 10], [69, 18, 6, 6]]) + parts('a', [[69, 7, 6, 8], [79, 10, 6, 8], [70, 19, 4, 4]]) + parts('l', [[71, 9, 2, 2], [81, 12, 2, 2]]) +
  // the floor lamp, a plant, a rug
  parts('b', [[89, 14, 1, 26], [86, 10, 7, 4]]) + twinkle(86, 10, 4, 0, 'l', 7, 4) +
  parts('b', [[78, 31, 5, 9]]) + parts('a', [[76, 25, 9, 7], [78, 22, 5, 4]]) +
  parts('h', [[0, 38, 96, 2]]);

/** The weekend's dining room: the chandelier, a wall of framed relatives, a china cabinet and the table laid for far too many. */
// biome-ignore format: pixel rects read best in rows
const diningRoom = (): string => {
  const frames: Rect[] = [];
  for (const [x, y] of [[26, 4], [34, 6], [42, 3], [50, 6], [58, 4], [66, 7], [30, 14], [38, 16], [54, 15], [62, 13]]) frames.push([x, y, 6, 8]);
  return (
    // a wall of framed relatives, all looking at you
    parts('b', frames) + parts('a', frames.map(([x, y]): Rect => [x + 1, y + 1, 4, 6])) +
    parts('l', frames.map(([x, y]): Rect => [x + 2, y + 2, 1, 1])) +
    // the chandelier
    parts('b', [[47, 0, 2, 3], [42, 3, 12, 1], [44, 4, 8, 1]]) + twinkle(42, 4, 2.5, 0, 'l', 12, 1) + twinkle(45, 6, 3.2, -1.1, 'l', 1, 2) + twinkle(50, 6, 2.9, -0.4, 'l', 1, 2) +
    // the china cabinet, plates standing in it
    parts('b', [[0, 8, 22, 32], [1, 9, 20, 30]]) + parts('a', [[2, 10, 18, 28]]) +
    parts('b', [[2, 18, 18, 1], [2, 27, 18, 1]]) +
    parts('l', [[4, 12, 4, 5], [10, 12, 4, 5], [16, 12, 3, 5], [4, 21, 4, 5], [10, 21, 4, 5], [16, 21, 3, 5], [4, 30, 4, 5], [10, 30, 4, 5]]) +
    // the long table with its cloth and a dish or two
    parts('b', [[72, 30, 24, 3], [74, 33, 20, 7]]) + parts('h', [[74, 33, 20, 1], [74, 36, 20, 1]]) +
    parts('l', [[76, 28, 5, 2], [84, 28, 5, 2]]) + parts('g', [[90, 24, 2, 6]]) + puff(78, 27, 0) + puff(86, 27, -1.3)
  );
};

/** The weekend's wedding hall: a truss of lights across the top with beams of coloured light, a balloon arch, a speaker stack either side, and round tables. */
// biome-ignore format: pixel rects read best in rows
const ballroom = (): string =>
  parts('b', [[0, 2, 96, 2], [0, 4, 1, 3], [95, 4, 1, 3]]) +
  parts('l', [[8, 4, 3, 2], [28, 4, 3, 2], [50, 4, 3, 2], [70, 4, 3, 2], [86, 4, 3, 2]]) +
  // beams of light fanning down, the colours swapping
  twinkle(9, 6, 2.2, 0, 'g', 5, 14) + twinkle(25, 6, 2.8, -0.8, 'g', 4, 18) + twinkle(66, 6, 2.5, -1.3, 'g', 4, 18) + twinkle(84, 6, 2.1, -0.5, 'g', 5, 14) +
  // the balloon arch behind the DJ
  parts('l', [...disc(34, 12, 3), ...disc(40, 8, 3), ...disc(48, 6, 3), ...disc(56, 8, 3), ...disc(62, 12, 3)]) +
  parts('h', [...disc(37, 10, 2), ...disc(43, 7, 2), ...disc(53, 7, 2), ...disc(59, 10, 2)]) +
  // the speakers
  parts('a', [[0, 18, 14, 22], [82, 18, 14, 22]]) + parts('b', [[0, 18, 14, 1], [82, 18, 14, 1], [3, 22, 8, 8], [85, 22, 8, 8]]) +
  twinkle(5, 24, 0.5, 0, 'l', 4, 4) + twinkle(87, 24, 0.5, -0.25, 'l', 4, 4) +
  // round tables with cloths
  parts('a', [[18, 33, 14, 2], [20, 35, 10, 5], [64, 33, 14, 2], [66, 35, 10, 5]]) + parts('h', [[18, 33, 14, 1], [64, 33, 14, 1]]) + parts('l', [[24, 31, 2, 2], [70, 31, 2, 2]]);

/** The weekend's town hall: columns and a pediment, bunting across the front, a ribbon pulled tight across the steps and a podium with its microphones. */
// biome-ignore format: pixel rects read best in rows
const townHall = (): string => {
  const bunting: string[] = [];
  for (let x = 6; x < 90; x += 6) bunting.push(parts(x % 12 ? 'h' : 'l', [[x, 8, 4, 1], [x + 1, 9, 2, 1], [x + 1, 10, 1, 1]]));
  return (
    parts('a', [[0, 12, 96, 28]]) + parts('b', [[12, 3, 72, 2], [20, 1, 56, 2], [28, -1, 40, 2]]) +
    parts('b', [...[6, 22, 38, 54, 70, 86].map((x): Rect => [x, 12, 3, 24]), [4, 11, 88, 1], [4, 36, 92, 4]]) +
    parts('g', [[12, 16, 4, 14], [28, 16, 4, 14], [62, 16, 4, 14], [78, 16, 4, 14]]) +
    parts('b', bunting.length ? [[0, 7, 96, 1]] : []) + bunting.join('') +
    // a flag on each side
    parts('b', [[2, 0, 1, 12], [93, 0, 1, 12]]) + parts('h', [[3, 0, 6, 4], [87, 0, 6, 4]]) +
    // the ribbon, and a podium with two microphones
    parts('h', [[0, 31, 96, 1], [0, 32, 96, 1]]) + twinkle(44, 30, 1.8, 0, 'l', 8, 1) +
    parts('b', [[10, 28, 8, 12], [8, 27, 12, 1], [12, 23, 1, 4], [16, 23, 1, 4]]) + parts('l', [[11, 22, 3, 2], [15, 22, 3, 2]])
  );
};

/** Monday's bedroom, in the small hours: a window with a moon and the first grey of the morning, a bedside table with its lamp and the red digits of the alarm, a headboard. */
// biome-ignore format: pixel rects read best in rows
const bedroom = (): string =>
  // the window: a moon, a few stars, the morning coming in low
  parts('b', [[38, 2, 20, 1], [38, 2, 1, 22], [57, 2, 1, 22], [38, 23, 20, 1], [47, 2, 2, 22]]) +
  parts('g', [[39, 3, 8, 20], [49, 3, 8, 20]]) + parts('l', [...disc(43, 9, 3)]) + parts('a', [...disc(44, 8, 2)]) +
  twinkle(52, 6, 2.2, 0, 'l', 1, 1) + twinkle(54, 12, 3.1, -1, 'l', 1, 1) + twinkle(41, 17, 2.6, -0.6, 'l', 1, 1) +
  parts('h', [[39, 20, 18, 3]]) +
  // curtains
  parts('a', [[32, 1, 6, 26], [58, 1, 6, 26]]) +
  // the headboard and a pillow edge on the left
  parts('b', [[0, 12, 14, 28], [0, 10, 14, 2]]) + parts('a', [[2, 14, 10, 10]]) + parts('l', [[0, 30, 22, 8]]) + parts('g', [[2, 32, 18, 4]]) +
  // the bedside table, its lamp and the alarm clock, red digits going on and off
  parts('b', [[76, 28, 16, 12], [78, 40, 2, 0]]) + parts('a', [[78, 30, 12, 4]]) +
  parts('b', [[82, 18, 2, 10], [78, 12, 10, 6]]) + twinkle(78, 12, 10, 4, 'l', 10, 6) +
  parts('b', [[68, 33, 8, 7]]) + parts('a', [[69, 34, 6, 3]]) + twinkle(70, 34, 1, 0, 'h', 1, 2) + twinkle(72, 34, 1, -0.5, 'h', 2, 1) + twinkle(74, 34, 1, -0.25, 'h', 1, 2);

/** The weekend's stairwell: a wall of mailboxes, the stairs going up with their railing, a notice board of angry notes and a bare bulb, a "lift out of order" sign. */
// biome-ignore format: pixel rects read best in rows
const stairwell = (): string => {
  const boxes: Rect[] = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 5; col++) boxes.push([2 + col * 5, 18 + row * 7, 4, 6]);
  const steps: Rect[] = [];
  for (let i = 0; i < 8; i++) steps.push([64 + i * 4, 38 - i * 3, 32 - i * 4, 2]);
  return (
    // the mailboxes, a few with a letter sticking out
    parts('b', [[0, 16, 28, 24]]) + parts('a', boxes) + parts('l', [[4, 19, 1, 1], [14, 26, 1, 1], [24, 33, 1, 1], [9, 33, 1, 1]]) + parts('h', [[7, 20, 2, 2], [17, 34, 2, 2]]) +
    // the notice board with its notes
    parts('b', [[34, 8, 22, 16]]) + parts('a', [[35, 9, 20, 14]]) + parts('l', [[37, 11, 6, 5], [45, 12, 7, 6], [38, 18, 5, 4]]) + parts('h', [[47, 19, 4, 3], [40, 11, 1, 1]]) +
    // a sign on the lift doors
    parts('b', [[32, 26, 24, 14]]) + parts('a', [[34, 28, 9, 12], [45, 28, 9, 12]]) + parts('h', [[34, 26, 20, 2]]) +
    twinkle(34, 26, 1.4, 0, 'l', 20, 1) +
    // the stairs going up to the right, their railing, and the bulb
    parts('b', steps) + parts('a', steps.map(([x, y, , ]): Rect => [x, y + 2, 2, 40 - y])) +
    parts('b', [[64, 24, 1, 14], [72, 12, 1, 14], [80, 6, 1, 8], [88, 4, 1, 4], [64, 24, 32, 1]]) +
    parts('b', [[48, 0, 1, 5]]) + twinkle(46, 5, 3.4, 0, 'l', 5, 2) + parts('l', [[47, 4, 3, 1]])
  );
};

/** The scenes of the weekend's places (`EnemyDef.stage`); the supermarket aisle is the weekend's own (the act's default), the rest are where its jobs are met. */
const PLACES: Record<StageId, () => string> = { aisle, park, terrace, garden, livingRoom, diningRoom, ballroom, townHall, stairwell, bedroom };
export const STAGE_IDS = Object.keys(PLACES) as StageId[];

const SCENES = [parking, office, factory, aisle];

/** The scene behind the enemy of an act (1-based; a later act takes the last scene, like `actDef`), or the one of the place the enemy is met in. */
export const stageArt = (act: number, place?: StageId): string =>
  `<svg class="stage-art-svg" viewBox="0 0 96 40" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges" aria-hidden="true">${(place ? PLACES[place] : SCENES[Math.min(act, SCENES.length) - 1])()}</svg>`;
