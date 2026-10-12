/**
 * The hero's faces. A mood is the hero's own drawing with its eyes and mouth painted over (`HERO_MOODS` ids are `<hero>Blink`, `<hero>Hurt`…): the portrait
 * in a fight swaps to it for a moment (`combat/heroMood.ts`). The sprites are 64 cells wide, so every stroke is bold.
 */
export const MOODS = ['blink', 'hurt', 'tired', 'cheer', 'cast'] as const;
export type Mood = (typeof MOODS)[number];

const INK = '#1b1830';
const PAPER = '#f6f0e4';
const DROP = '#9ab8f0';

/** Where a hero's eyes and mouth are on the 200×200 drawing, and what lies under them (to be painted over). */
interface Face {
  /** Markup that hides the original eyes (shapes in the colour of what is around them). */
  cover: string;
  /** Eye centres, left then right, and half the width of an eye. */
  eyes: [[number, number], [number, number]];
  half: number;
  /** The colour lines on the eyes are drawn in (light on the Rogue's dark mask). */
  line: string;
  /** Brows the cover would have wiped, drawn again. */
  brows: string;
  /** The mouth centre, and the markup that hides the original (if it has one). */
  mouth: [number, number];
  mouthCover: string;
  /** A sweat drop or a spark sits here, a plaster on the cheek at `plaster`. */
  drop: [number, number];
  plaster: [number, number];
}

const rect = (x: number, y: number, w: number, h: number, fill: string): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

const FACES: Record<string, Face> = {
  warrior: {
    cover: rect(71, 89, 20, 14, '#ffa4cb') + rect(109, 89, 20, 14, '#ffa4cb'),
    eyes: [
      [81, 96],
      [119, 96],
    ],
    half: 7,
    line: INK,
    brows: `<path d="M68 84l24 8M132 84l-24 8" stroke="${INK}" stroke-width="6" stroke-linecap="square" fill="none"/>`,
    mouth: [100, 124],
    mouthCover: rect(84, 119, 32, 11, '#ffc490'),
    drop: [60, 48],
    plaster: [64, 126],
  },
  mage: {
    cover: `<circle cx="85" cy="88" r="8" fill="${PAPER}"/><circle cx="115" cy="88" r="8" fill="${PAPER}"/>`,
    eyes: [
      [85, 88],
      [115, 88],
    ],
    half: 6,
    line: INK,
    brows: '',
    mouth: [100, 124],
    mouthCover: '',
    drop: [138, 74],
    plaster: [76, 112],
  },
  necromancer: {
    cover: rect(81, 79, 18, 14, '#d9cfe8') + rect(101, 79, 18, 14, '#d9cfe8'),
    eyes: [
      [90, 87],
      [110, 87],
    ],
    half: 6,
    line: INK,
    brows: `<path d="M82 76l12 3M118 76l-12 3" stroke="${INK}" stroke-width="4" fill="none"/>`,
    mouth: [100, 106],
    mouthCover: rect(86, 100, 28, 9, '#d4c8e4'),
    drop: [122, 62],
    plaster: [118, 100],
  },
  rogue: {
    cover: rect(80, 81, 16, 10, INK) + rect(104, 81, 16, 10, INK),
    eyes: [
      [88, 86],
      [112, 86],
    ],
    half: 6,
    line: PAPER,
    brows: '',
    mouth: [100, 106],
    mouthCover: rect(86, 100, 28, 9, '#ffa0c8'),
    drop: [126, 60],
    plaster: [118, 100],
  },
};

const line = (d: string, stroke: string, w = 5): string =>
  `<path d="${d}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
const outline = 'stroke="#120e18" stroke-width="3" stroke-linejoin="round"';
const drop = ([x, y]: [number, number]): string => `<path d="M${x} ${y - 9}c6 7 8 11 0 14-8-3-6-7 0-14z" fill="${DROP}" ${outline}/>`;
const star = ([x, y]: [number, number]): string => `<path d="M${x} ${y - 9}l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#ffd900" ${outline}/>`;
const plaster = ([x, y]: [number, number]): string =>
  `<g transform="rotate(-24 ${x} ${y})"><rect x="${x - 11}" y="${y - 5}" width="22" height="10" fill="${PAPER}" ${outline}/><path d="M${x - 3} ${y - 5}v10M${x + 3} ${y - 5}v10" stroke="#c9bd98" stroke-width="3"/></g>`;

/** The overlay of one mood: the eyes, the mouth and the extras of that look, drawn over the hero. */
function overlay(f: Face, mood: Mood): string {
  const [[lx, ly], [rx, ry]] = f.eyes;
  const h = f.half;
  const [mx, my] = f.mouth;
  const eyes = (left: string, right: string): string => left + right;
  switch (mood) {
    case 'blink':
      return f.cover + f.brows + line(`M${lx - h} ${ly}h${2 * h}M${rx - h} ${ry}h${2 * h}`, f.line);
    case 'hurt':
      // Screwed-up eyes (> <), a gaping mouth and a drop of sweat.
      return (
        f.cover +
        f.brows +
        eyes(
          line(`M${lx - h} ${ly - 6}L${lx + h - 1} ${ly}L${lx - h} ${ly + 6}`, f.line),
          line(`M${rx + h} ${ry - 6}L${rx - h + 1} ${ry}L${rx + h} ${ry + 6}`, f.line),
        ) +
        f.mouthCover +
        `<rect x="${mx - 9}" y="${my - 4}" width="18" height="10" fill="${INK}"/><rect x="${mx - 9}" y="${my - 4}" width="18" height="3" fill="${PAPER}"/>` +
        drop(f.drop)
      );
    case 'tired':
      // Heavy lids and bags, a wobbly mouth, a plaster and a drop: the battered look of low HP.
      return (
        f.cover +
        f.brows +
        line(`M${lx - h} ${ly}h${2 * h}M${rx - h} ${ry}h${2 * h}`, f.line) +
        line(`M${lx - h + 1} ${ly + 6}q${h - 1} 4 ${2 * h - 2} 0M${rx - h + 1} ${ry + 6}q${h - 1} 4 ${2 * h - 2} 0`, f.line, 3) +
        f.mouthCover +
        line(`M${mx - 9} ${my + 1}q4.5 -5 9 0t9 0`, INK, 4) +
        plaster(f.plaster) +
        drop(f.drop)
      );
    case 'cheer':
      // Eyes shut in a grin: arches over a wide open smile, and a spark.
      return (
        f.cover +
        f.brows +
        line(`M${lx - h} ${ly + 3}Q${lx} ${ly - 9} ${lx + h} ${ly + 3}M${rx - h} ${ry + 3}Q${rx} ${ry - 9} ${rx + h} ${ry + 3}`, f.line) +
        f.mouthCover +
        `<path d="M${mx - 11} ${my - 3}Q${mx} ${my + 14} ${mx + 11} ${my - 3}z" fill="${INK}"/><path d="M${mx - 5} ${my + 4}q5 -3 10 0q-5 5 -10 0z" fill="#ff3d9a"/>` +
        star(f.drop)
      );
    case 'cast':
      // Wide, blazing eyes, a shout, and sparks off the head.
      return (
        f.cover +
        f.brows +
        `<circle cx="${lx}" cy="${ly}" r="${h}" fill="${PAPER}" ${outline}/><circle cx="${rx}" cy="${ry}" r="${h}" fill="${PAPER}" ${outline}/>` +
        `<rect x="${lx - 3}" y="${ly - 3}" width="6" height="6" fill="#ffd900"/><rect x="${rx - 3}" y="${ry - 3}" width="6" height="6" fill="#ffd900"/>` +
        f.mouthCover +
        `<ellipse cx="${mx}" cy="${my + 1}" rx="7" ry="7" fill="${INK}"/>` +
        line('M40 40l-12-10M160 40l12-10M30 78h-14M170 78h14', '#ffd900')
      );
  }
}

/** Every mood of every hero: `<hero>Blink`, `<hero>Hurt`… from the hero's own drawing. */
export function heroMoods(bases: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, face] of Object.entries(FACES)) for (const mood of MOODS) out[moodId(id, mood)] = bases[id] + overlay(face, mood);
  return out;
}

/** The creature id of a hero in a mood. */
export const moodId = (hero: string, mood: Mood): string => `${hero}${mood[0].toUpperCase()}${mood.slice(1)}`;
