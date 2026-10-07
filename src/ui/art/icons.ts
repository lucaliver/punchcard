import { pixelIcon } from './riso';

/**
 * Silhouette icons on a 64×64 grid. They use `currentColor` so the context tints them;
 * a few parts use fixed colours for readability (potion liquids, eyes).
 * `el` picks the card art background (element theme). A `wide` one is drawn on a 128×64 grid (the large cards' art).
 */
export type Element = 'steel' | 'fire' | 'ice' | 'arcane' | 'blood' | 'nature' | 'shadow' | 'holy' | 'curse' | 'necro';

const S = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
const HI = 'fill="#fff" opacity=".28"';

const sword = `<path d="M52 5h7v7L30 41l-7-7z"/><path ${HI} d="M55 6l3 1-26 26-2-2z"/><path d="M13 33l18 18-4 4L9 37z"/><path d="M17 45l4 4-9 9-4-4z"/><circle cx="7" cy="57" r="3.5"/>`;
const swordMirror = `<g transform="translate(64 0) scale(-1 1)">${sword}</g>`;
const scales = `<rect x="30" y="8" width="4" height="46"/><rect x="18" y="54" width="28" height="6"/><rect x="8" y="12" width="48" height="4"/><path d="M4 36h20c0 6-4 10-10 10S4 42 4 36zM40 30h20c0 6-4 10-10 10s-10-4-10-10z"/><path d="M14 16L6 36h2l6-16 6 16h2zM50 16l-8 14h2l6-10 6 10h2z"/><g fill="#16121f"><rect x="9" y="30" width="10" height="5"/><path d="M45 26h10v4H45z"/></g>`;
const scalesMirror = `<g transform="translate(64 0) scale(-1 1)">${scales}</g>`;
const shield = `<path d="M32 5l23 8c0 22-8 37-23 46C17 50 9 35 9 13z"/><path ${HI} d="M32 11l17 6c0 16-6 28-17 35z"/>`;
const flame = `<path d="M32 4c4 12 18 18 18 34a18 18 0 0 1-36 0c0-9 5-14 8-18 1 6 4 9 7 9-3-9 0-18 3-25z"/><path fill="#fff" opacity=".35" d="M32 32c3 5 8 7 8 14a8 8 0 0 1-16 0c0-4 3-6 4-8 1 2 2 3 3 3-1-4 0-6 1-9z"/>`;
const snowflake = `<g ${S} stroke-width="4.5"><path d="M32 6v52M9.5 19l45 26M9.5 45l45-26"/><path d="M26 10l6 6 6-6M26 54l6-6 6 6M8 27l8-2-2-8M56 37l-8 2 2 8M8 37l8 2-2 8M56 27l-8-2 2-8"/></g>`;
const skull = `<path d="M32 6C18 6 9 16 9 28c0 8 4 13 8 16v8c0 3 2 5 5 5h20c3 0 5-2 5-5v-8c4-3 8-8 8-16C55 16 46 6 32 6z"/><circle cx="23" cy="30" r="6" fill="#16121f"/><circle cx="41" cy="30" r="6" fill="#16121f"/><path d="M32 36l-4 7h8z" fill="#16121f"/><path d="M25 50v6M32 50v6M39 50v6" stroke="#16121f" stroke-width="2.5"/>`;
const heart = `<path d="M32 56C9 41 4 27 11 17c7-10 18-8 21 1 3-9 14-11 21-1 7 10 2 24-21 39z"/><path ${HI} d="M17 20c3-4 8-4 10 0-4 0-7 3-8 7-2-2-3-5-2-7z"/>`;
const potion = (liquid: string): string =>
  `<path d="M25 5h14v5h-2v11c9 3 15 11 15 20a20 20 0 0 1-40 0c0-9 6-17 15-20V10h-2z"/><path fill="${liquid}" d="M16 40h32a16 16 0 0 1-32 0z"/><circle cx="26" cy="44" r="2.5" fill="#fff" opacity=".6"/><circle cx="36" cy="49" r="1.8" fill="#fff" opacity=".5"/><path ${HI} d="M20 32c2-4 5-6 8-7v4c-3 1-5 3-6 6z"/>`;
const star4 = (cx: number, cy: number, r: number): string =>
  `<path d="M${cx} ${cy - r}Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy}Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r}Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy}Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r}z"/>`;
/** Dodge: a figure darting sideways, speed lines trailing behind it. */
/** Dodge: a little ghost, the hit goes right through it. */
const dodge = `<path d="M32 4C19 4 10 14 10 27v31l8-6 7 6 7-6 7 6 7-6 8 6V27C54 14 45 4 32 4z"/><circle cx="24" cy="26" r="4.5" fill="#16121f"/><circle cx="40" cy="26" r="4.5" fill="#16121f"/><path fill="#16121f" d="M27 36h10v4a5 5 0 0 1-10 0z"/><path ${HI} d="M16 18c3-6 8-9 14-10-6 2-10 7-11 14z"/>`;
const bolt = `<path d="M37 4L14 36h14l-5 24 25-34H33z"/>`;
/** Filled gem = mana (points to spend). */
const crystal = `<path d="M32 4l16 18-16 38-16-38z"/><path ${HI} d="M32 4l16 18H32z"/><path fill="#16121f" opacity=".3" d="M32 60L16 22h16z"/>`;
/** Hollow gem = an empty mana crystal (raises the max; fills over time), like an empty pip in the mana bar. */
const crystalSlot = `<path d="M32 4l16 18-16 38-16-38z"/><path fill="#16121f" d="M32 14l9 10-9 23-9-23z"/>`;
const cloud = `<path d="M18 40a10 10 0 0 1 2-20 13 13 0 0 1 25-2 11 11 0 0 1 3 22z"/>`;
const muscle = `<path d="M4 56V46C4 36 12 26 22 25c8-1 14 3 18 11V20h-4V10c0-4 3-6 7-6h10c4 0 7 2 7 6v10h-4v22c0 9-4 14-10 14z"/><path fill="none" stroke="#16121f" stroke-width="2" opacity=".45" d="M42 4v10M48 4v10M54 4v10M12 46c4-7 12-8 18-4"/>`;
/** A little mouse in profile, running: it scurries off the belt (Fleeting). */
const mouse = `<ellipse cx="29" cy="42" rx="20" ry="13"/><circle cx="48" cy="36" r="10"/><path d="M54 30l10 10-10 6z"/><circle cx="44" cy="25" r="8"/><circle cx="44" cy="25" r="4" fill="#16121f" opacity=".45"/><circle cx="51" cy="34" r="2.2" fill="#16121f"/><circle cx="62" cy="40" r="2" fill="#16121f"/><path d="M18 52h8v6h-8zM38 52h8v6h-8z"/><path ${S} stroke-width="3.5" d="M11 44C2 44 2 30 9 28"/>`;

/** A sheet of paper screwed up, in four stages: 4 is the tight ball, 1 the sheet nearly open again (the Crumple hex shows them as its taps run out). */
const CREASE = `fill="none" stroke="#16121f" stroke-width="2.6" stroke-linejoin="round"`;
const crumple = [
  `<path d="M32 16l9 4 8 8 2 10-4 11-9 8-11 1-9-6-5-10 2-11 7-9z"/><path ${CREASE} d="M23 25l9 6-2 10M39 23l-5 8 9 5M20 39l9-4"/>`,
  `<path d="M30 10l12 3 11 9 4 13-3 13-9 10-13 4-13-4-9-11-1-13 5-12 9-8z"/><path ${CREASE} d="M20 22l12 8-3 12 9 6M44 18l-8 12 14 4M14 38l15-4M30 50l-2 8"/>`,
  `<path d="M8 16l14-6 10 4 12-5 10 7 4 14-4 8 6 12-9 9-14-2-10 6-13-6-4-13 4-10-5-9z"/><path ${CREASE} d="M16 22l14 10-6 14 12 8M46 16l-10 16 16 6M10 40l18-6M22 12l4 14M42 50l-6-10"/>`,
  `<path d="M12 4l18 3 16-4 6 11-3 14 5 14-5 18-20-4-16 5-4-15 4-14-5-14z"/><path ${CREASE} d="M14 22l20 8 16-6M12 44l22-4 14 8M30 8l-4 18 6 16M44 10l-4 14"/>`,
];

export const ICONS: Record<string, { el: Element; svg: string; wide?: boolean }> = {
  ...Object.fromEntries(crumple.map((svg, i) => [`crumple${4 - i}`, { el: 'shadow' as Element, svg }])),
  // ---- warrior
  sword: { el: 'steel', svg: sword },
  shield: { el: 'steel', svg: shield },
  hammer: {
    el: 'steel',
    svg: `<g transform="rotate(-38 32 32)"><rect x="29" y="20" width="6" height="42" rx="2"/><rect x="15" y="6" width="34" height="17" rx="3"/><rect ${HI} x="17" y="8" width="30" height="4" rx="2"/></g>`,
  },
  wall: {
    el: 'steel',
    svg: `<path d="M6 12h24v10H6zM34 12h24v10H34zM6 26h12v10H6zM22 26h20v10H22zM46 26h12v10H46zM6 40h24v10H6zM34 40h24v10H34z"/><path ${HI} d="M6 12h52v3H6z"/>`,
  },
  printerSmash: {
    el: 'steel',
    svg: `<rect x="16" y="6" width="30" height="20"/><path d="M22 12h18M22 18h12" stroke="#16121f" stroke-width="3.5"/><rect x="5" y="26" width="54" height="28" rx="3"/><rect x="13" y="44" width="38" height="5" fill="#16121f"/><path d="M37 26l-7 8 8 5-9 11" stroke="#16121f" stroke-width="4.5" fill="none" stroke-linejoin="miter"/><path d="M0 8l10 2-2 9-10-2zM53 3l10 3-3 9-10-3zM51 57l11 2-2 5-11-2z"/>`,
  },
  blood: {
    el: 'blood',
    svg: `<path d="M32 5c8 14 17 24 17 36a17 17 0 0 1-34 0c0-12 9-22 17-36z"/><path ${HI} d="M24 38c0-5 3-10 6-14-1 6-1 11 1 16-3 2-7 1-7-2z"/>`,
  },
  crossed: { el: 'steel', svg: sword + swordMirror },
  drum: {
    el: 'blood',
    svg: `<ellipse cx="32" cy="24" rx="22" ry="8"/><path d="M10 24v20c0 5 10 9 22 9s22-4 22-9V24c0 5-10 9-22 9s-22-4-22-9z"/><path fill="#16121f" opacity=".35" d="M14 32l6 18M26 34l4 19M38 34l-4 19M50 32l-6 18" stroke="#16121f" stroke-width="2"/><g ${S} stroke-width="4"><path d="M20 4l10 16M46 4L36 20"/></g>`,
  },
  bankrupt: {
    el: 'steel',
    svg: `<path d="M4 26h48v32H4z"/><path d="M6 26l32-14 6 14z"/><rect x="38" y="34" width="22" height="14" rx="2"/><circle cx="46" cy="41" r="3" fill="#16121f"/><path d="M12 4l6 8 6-8-2 12h-8zM30 2l4 5 4-5-1 8h-6z"/>`,
  },
  heart: { el: 'nature', svg: heart },
  fortress: {
    el: 'steel',
    svg: `<path d="M10 12h8v6h6v-6h6v6h4v-6h6v6h6v-6h8v46H10z"/><path fill="#16121f" opacity=".55" d="M26 58V44a6 6 0 0 1 12 0v14z"/><path ${HI} d="M10 22h44v3H10z"/>`,
  },
  picketSign: {
    el: 'blood',
    svg: `<path d="M3.2 3.2h57.6v3.2h-57.6zM3.2 6.4h57.6v3.2h-57.6zM3.2 9.6h25.6v3.2h-25.6zM35.2 9.6h25.6v3.2h-25.6zM3.2 12.8h25.6v3.2h-25.6zM35.2 12.8h25.6v3.2h-25.6zM3.2 16h25.6v3.2h-25.6zM35.2 16h25.6v3.2h-25.6zM3.2 19.2h25.6v3.2h-25.6zM35.2 19.2h25.6v3.2h-25.6zM3.2 22.4h25.6v3.2h-25.6zM35.2 22.4h25.6v3.2h-25.6zM3.2 25.6h57.6v3.2h-57.6zM3.2 28.8h25.6v3.2h-25.6zM35.2 28.8h25.6v3.2h-25.6zM3.2 32h25.6v3.2h-25.6zM35.2 32h25.6v3.2h-25.6zM3.2 35.2h57.6v3.2h-57.6zM3.2 38.4h57.6v3.2h-57.6zM28.8 41.6h6.4v3.2h-6.4zM28.8 44.8h6.4v3.2h-6.4zM28.8 48h6.4v3.2h-6.4zM28.8 51.2h6.4v3.2h-6.4zM28.8 54.4h6.4v3.2h-6.4zM28.8 57.6h6.4v3.2h-6.4zM28.8 60.8h6.4v3.2h-6.4z"/>`,
  },
  fang: { el: 'blood', svg: `<path d="M6 12h52c0 6-3 9-8 10L42 58 34 22h-4l-8 36-8-36c-5-1-8-4-8-10z"/><path ${HI} d="M18 24l6 22 2-24z"/>` },
  quake: {
    el: 'steel',
    svg: `<path d="M4 44h56v14H4z"/><path fill="#16121f" d="M30 44l-4 6 5 3-3 5h5l3-6-5-3 3-5z"/><path d="M12 30l7-6 6 5-4 9zM40 26l8-4 5 8-8 5zM28 14l6-4 4 6-6 4z"/>`,
  },
  // ---- mage
  clippy: {
    el: 'arcane',
    svg: `<path d="M19.2 0h25.6v3.2h-25.6zM12.8 3.2h38.4v3.2h-38.4zM6.4 6.4h22.4v3.2h-22.4zM35.2 6.4h22.4v3.2h-22.4zM6.4 9.6h6.4v3.2h-6.4zM51.2 9.6h6.4v3.2h-6.4zM6.4 12.8h6.4v3.2h-6.4zM16 12.8h9.6v3.2h-9.6zM38.4 12.8h9.6v3.2h-9.6zM51.2 12.8h6.4v3.2h-6.4zM6.4 16h6.4v3.2h-6.4zM16 16h9.6v3.2h-9.6zM38.4 16h9.6v3.2h-9.6zM51.2 16h6.4v3.2h-6.4zM6.4 19.2h6.4v3.2h-6.4zM16 19.2h3.2v3.2h-3.2zM22.4 19.2h3.2v3.2h-3.2zM38.4 19.2h3.2v3.2h-3.2zM44.8 19.2h3.2v3.2h-3.2zM51.2 19.2h6.4v3.2h-6.4zM6.4 22.4h6.4v3.2h-6.4zM16 22.4h9.6v3.2h-9.6zM38.4 22.4h9.6v3.2h-9.6zM51.2 22.4h6.4v3.2h-6.4zM6.4 25.6h6.4v3.2h-6.4zM51.2 25.6h6.4v3.2h-6.4zM6.4 28.8h6.4v3.2h-6.4zM51.2 28.8h6.4v3.2h-6.4zM6.4 32h6.4v3.2h-6.4zM19.2 32h25.6v3.2h-25.6zM51.2 32h6.4v3.2h-6.4zM6.4 35.2h6.4v3.2h-6.4zM19.2 35.2h6.4v3.2h-6.4zM38.4 35.2h6.4v3.2h-6.4zM51.2 35.2h6.4v3.2h-6.4zM6.4 38.4h6.4v3.2h-6.4zM19.2 38.4h6.4v3.2h-6.4zM38.4 38.4h6.4v3.2h-6.4zM51.2 38.4h6.4v3.2h-6.4zM6.4 41.6h6.4v3.2h-6.4zM19.2 41.6h6.4v3.2h-6.4zM38.4 41.6h6.4v3.2h-6.4zM51.2 41.6h6.4v3.2h-6.4zM6.4 44.8h6.4v3.2h-6.4zM19.2 44.8h6.4v3.2h-6.4zM38.4 44.8h6.4v3.2h-6.4zM6.4 48h6.4v3.2h-6.4zM38.4 48h6.4v3.2h-6.4zM6.4 51.2h6.4v3.2h-6.4zM38.4 51.2h6.4v3.2h-6.4zM6.4 54.4h6.4v3.2h-6.4zM38.4 54.4h6.4v3.2h-6.4zM6.4 57.6h38.4v3.2h-38.4zM12.8 60.8h25.6v3.2h-25.6z"/>`,
  },
  /** A fire door seen square on: steel frame, the leaf with a flame sign and a push bar. */
  fireDoor: {
    el: 'arcane',
    svg: `<path d="M12.8 3.2h38.4v57.6H12.8z"/><path fill="#16121f" d="M16 6.4h32v54.4H16z"/><path d="M19.2 9.6h25.6v51.2H19.2z"/><path fill="#16121f" d="M35.2 12.8h3.2v3.2h-3.2zM32 16h6.4v3.2h-6.4zM28.8 19.2h9.6v3.2h-9.6zM22.4 22.4h3.2v3.2h-3.2zM28.8 22.4h9.6v3.2h-9.6zM22.4 25.6h3.2v3.2h-3.2zM28.8 25.6h12.8v3.2h-12.8zM22.4 28.8h19.2v3.2h-19.2zM22.4 32h19.2v3.2h-19.2zM22.4 35.2h19.2v3.2h-19.2zM25.6 38.4h12.8v3.2h-12.8zM28.8 41.6h6.4v3.2h-6.4zM22.4 51.2h19.2v3.2H22.4z"/>`,
  },
  flambe: {
    el: 'fire',
    svg: `<g transform="translate(11 0) scale(.75)">${flame}</g><g transform="translate(46 12) scale(.38)">${flame}</g><rect x="2" y="42" width="46" height="6" rx="2"/><path d="M6 48h38v2a11 11 0 0 1-11 11H17A11 11 0 0 1 6 50z"/><path d="M48 43h14v5H48z"/>`,
  },
  iceLance: { el: 'ice', svg: `<path d="M58 6L48 26 18 56l-8-2-2-8L38 16z"/><path ${HI} d="M58 6L40 18l-2-2z"/><path d="M8 46l10 10-8 4-6-6z"/>` },
  crystal: { el: 'arcane', svg: crystal },
  crystalSlot: { el: 'arcane', svg: crystalSlot },
  flame: { el: 'fire', svg: flame },
  missiles: {
    el: 'arcane',
    svg: [8, 26, 44]
      .map(
        (y, i) =>
          `<path d="M${6 + i * 4} ${y + 12}c10-4 18-6 26-6l4 5c-8 3-18 4-30 1z" opacity=".5"/><circle cx="${44 + i * 3}" cy="${y + 7}" r="7"/>`,
      )
      .join(''),
  },
  dodge: { el: 'arcane', svg: dodge },
  combust: {
    el: 'fire',
    svg: `<path d="M32 2l6 16 16-8-8 16 16 6-16 6 8 16-16-8-6 16-6-16-16 8 8-16-16-6 16-6-8-16 16 8z"/><circle cx="32" cy="32" r="9" fill="#fff" opacity=".5"/>`,
  },
  beetle: {
    el: 'arcane',
    svg: `<ellipse cx="32" cy="38" rx="15" ry="19"/><circle cx="32" cy="15" r="8"/><path d="M32 22v34" stroke="#16121f" stroke-width="3"/><g ${S} stroke-width="4"><path d="M18 28L7 22M17 39H5M18 50L7 57M46 28l11-6M47 39h12M46 50l11 7M28 9l-5-6M36 9l5-6"/></g>`,
  },
  blizzard: {
    el: 'ice',
    svg: `${cloud}<g transform="translate(6 40) scale(.3)">${snowflake}</g><g transform="translate(24 44) scale(.3)">${snowflake}</g><g transform="translate(42 40) scale(.3)">${snowflake}</g>`,
  },
  // ---- neutral
  medkit: {
    el: 'nature',
    svg: `<path d="M19.2 6.4h25.6v3.2h-25.6zM19.2 9.6h6.4v3.2h-6.4zM38.4 9.6h6.4v3.2h-6.4zM19.2 12.8h6.4v3.2h-6.4zM38.4 12.8h6.4v3.2h-6.4zM6.4 16h51.2v3.2h-51.2zM3.2 19.2h57.6v3.2h-57.6zM3.2 22.4h22.4v3.2h-22.4zM38.4 22.4h22.4v3.2h-22.4zM3.2 25.6h22.4v3.2h-22.4zM38.4 25.6h22.4v3.2h-22.4zM3.2 28.8h22.4v3.2h-22.4zM38.4 28.8h22.4v3.2h-22.4zM3.2 32h12.8v3.2h-12.8zM48 32h12.8v3.2h-12.8zM3.2 35.2h12.8v3.2h-12.8zM48 35.2h12.8v3.2h-12.8zM3.2 38.4h12.8v3.2h-12.8zM48 38.4h12.8v3.2h-12.8zM3.2 41.6h12.8v3.2h-12.8zM48 41.6h12.8v3.2h-12.8zM3.2 44.8h22.4v3.2h-22.4zM38.4 44.8h22.4v3.2h-22.4zM3.2 48h22.4v3.2h-22.4zM38.4 48h22.4v3.2h-22.4zM3.2 51.2h22.4v3.2h-22.4zM38.4 51.2h22.4v3.2h-22.4zM3.2 54.4h57.6v3.2h-57.6zM6.4 57.6h51.2v3.2h-51.2z"/>`,
  },
  potionOrange: { el: 'fire', svg: potion('#ff8a1f') },
  energyCan: {
    el: 'arcane',
    svg: `<path d="M32 0h9.6v3.2h-9.6zM19.2 3.2h25.6v3.2h-25.6zM16 6.4h32v3.2h-32zM19.2 9.6h25.6v3.2h-25.6zM19.2 12.8h25.6v3.2h-25.6zM19.2 16h12.8v3.2h-12.8zM41.6 16h3.2v3.2h-3.2zM19.2 19.2h9.6v3.2h-9.6zM38.4 19.2h6.4v3.2h-6.4zM19.2 22.4h6.4v3.2h-6.4zM35.2 22.4h9.6v3.2h-9.6zM19.2 25.6h3.2v3.2h-3.2zM41.6 25.6h3.2v3.2h-3.2zM19.2 28.8h12.8v3.2h-12.8zM38.4 28.8h6.4v3.2h-6.4zM19.2 32h9.6v3.2h-9.6zM35.2 32h9.6v3.2h-9.6zM19.2 35.2h6.4v3.2h-6.4zM32 35.2h12.8v3.2h-12.8zM19.2 38.4h6.4v3.2h-6.4zM28.8 38.4h16v3.2h-16zM19.2 41.6h3.2v3.2h-3.2zM25.6 41.6h19.2v3.2h-19.2zM19.2 44.8h25.6v3.2h-25.6zM19.2 48h25.6v3.2h-25.6zM16 51.2h32v3.2h-32zM19.2 54.4h25.6v3.2h-25.6z"/>`,
  },
  bandage: {
    el: 'nature',
    svg: `<g transform="rotate(45 32 32)"><rect x="8" y="24" width="48" height="16" rx="8"/></g><g transform="rotate(-45 32 32)"><rect x="8" y="24" width="48" height="16" rx="8"/></g><g fill="#16121f" opacity=".4"><circle cx="29" cy="29" r="1.6"/><circle cx="35" cy="29" r="1.6"/><circle cx="29" cy="35" r="1.6"/><circle cx="35" cy="35" r="1.6"/></g>`,
  },
  smoke: {
    el: 'shadow',
    svg: `<circle cx="22" cy="40" r="14"/><circle cx="40" cy="36" r="16"/><circle cx="30" cy="22" r="12" opacity=".8"/><circle cx="48" cy="18" r="7" opacity=".6"/><circle cx="14" cy="18" r="5" opacity=".5"/>`,
  },
  // ---- curses
  slime: {
    el: 'curse',
    svg: `<path d="M10 52c0-18 10-34 22-34s22 16 22 34c0 4-3 6-6 6H16c-3 0-6-2-6-6z"/><circle cx="25" cy="38" r="5" fill="#16121f"/><circle cx="40" cy="38" r="5" fill="#16121f"/><circle cx="26" cy="36.5" r="1.6" fill="#fff"/><circle cx="41" cy="36.5" r="1.6" fill="#fff"/><path ${HI} d="M20 28c3-5 7-8 11-8-4 3-6 6-7 10z"/>`,
  },

  // ---- statuses & intents
  muscle: { el: 'blood', svg: muscle },
  star: { el: 'arcane', svg: star4(32, 32, 28) },
  thorns: { el: 'nature', svg: `<path d="M32 4l5 16 14-8-6 15 15 5-15 5 6 15-14-8-5 16-5-16-14 8 6-15-15-5 15-5-6-15 14 8z"/>` },
  helm: { el: 'steel', svg: `<path d="M10 34C10 18 20 6 32 6s22 12 22 28v22H40V40H24v16H10z"/><path fill="#16121f" d="M18 30h28v6H18z"/>` },
  leaf: {
    el: 'nature',
    svg: `<path d="M10 54C10 26 26 10 56 8c0 30-16 46-44 46z"/><path d="M12 52L42 22" stroke="#16121f" stroke-width="3" opacity=".4"/>`,
  },
  // Enraged (an enemy at half HP): the comic anger vein.
  rage: {
    el: 'blood',
    svg: `<path d="M6 22c10 0 14-4 14-14h9c0 15-8 23-23 23zM58 22c-10 0-14-4-14-14h-9c0 15 8 23 23 23zM6 42c10 0 14 4 14 14h9c0-15-8-23-23-23zM58 42c-10 0-14 4-14 14h-9c0-15 8-23 23-23z"/>`,
  },
  mouse: { el: 'shadow', svg: mouse },
  // A Power: lasts for the rest of the fight.
  infinity: {
    el: 'holy',
    svg: `<ellipse cx="19" cy="32" rx="16" ry="14"/><ellipse cx="45" cy="32" rx="16" ry="14"/><ellipse cx="19" cy="32" rx="7" ry="5" fill="#16121f"/><ellipse cx="45" cy="32" rx="7" ry="5" fill="#16121f"/>`,
  },
  drop: { el: 'nature', svg: `<path d="M32 5c8 14 17 24 17 36a17 17 0 0 1-34 0c0-12 9-22 17-36z"/>` },
  broken: {
    el: 'shadow',
    svg: `<path d="M52 5h7v7L44 27l-7-7z"/><path d="M34 23l7 7-11 11-3-6-4 1z"/><path d="M13 33l18 18-4 4L9 37z"/><path d="M17 45l4 4-9 9-4-4z"/>`,
  },
  crack: {
    el: 'shadow',
    svg: `${shield.replace(HI, 'fill="#16121f" opacity=".0"')}<path d="M34 6l-6 16 8 6-8 12 4 10" stroke="#16121f" stroke-width="4" fill="none"/>`,
  },
  snow: { el: 'ice', svg: snowflake },
  stars: { el: 'holy', svg: star4(16, 20, 12) + star4(44, 16, 10) + star4(32, 44, 14) },
  skull: { el: 'shadow', svg: skull },
  up: { el: 'holy', svg: `<path d="M32 4l24 26H42v28H22V30H8z"/>` },
  hand: {
    el: 'shadow',
    svg: `<path d="M18 58c-6-6-10-14-10-22V22c0-3 2-5 4-5s4 2 4 5v10h2V12c0-3 2-5 4-5s4 2 4 5v18h2V8c0-3 2-5 4-5s4 2 4 5v22h2V12c0-3 2-5 4-5s4 2 4 5v28c0 10-6 18-14 18z"/>`,
  },
  /** The charge intent (a heavy hit on its way): an anvil about to drop. */
  burst: {
    el: 'shadow',
    svg: `<path d="M4 14h52c0 10-6 14-16 14h-2v8l8 6v10H18V42l8-6v-8h-4C12 28 6 24 4 14z"/><path ${HI} d="M10 18h38c-2 3-5 5-10 5H18c-4 0-7-2-8-5z"/>`,
  },
  bolt2: { el: 'arcane', svg: bolt },
  cards: {
    el: 'steel',
    svg: `<rect x="20" y="6" width="28" height="40" rx="4" transform="rotate(12 34 26)" opacity=".55"/><rect x="14" y="14" width="28" height="40" rx="4"/>`,
  },
  pause: { el: 'steel', svg: `<rect x="16" y="10" width="11" height="44" rx="3"/><rect x="37" y="10" width="11" height="44" rx="3"/>` },
  gate: {
    el: 'curse',
    svg: `<rect x="4" y="8" width="56" height="9"/><rect x="4" y="47" width="56" height="9"/><path d="M8 17h7v30H8zM22 17h7v30h-7zM36 17h7v30h-7zM50 17h7v30h-7z"/><rect x="26" y="26" width="12" height="12" fill="#16121f"/>`,
  },
  coffee: {
    el: 'fire',
    svg: `<path d="M8 28h38v16c0 9-7 16-16 16h-6C15 60 8 53 8 44z"/><path d="M46 32h5c6 0 10 4 10 9s-4 9-10 9h-6v-7h6c2 0 3-1 3-2s-1-2-3-2h-5z"/><g ${S} stroke-width="4.5"><path d="M18 22c-4-5 4-8 0-14M28 22c-4-5 4-8 0-14M38 22c-4-5 4-8 0-14"/></g>`,
  },
  // The Coffee Machine's tray: a paper cup with a band, a teaspoon and a fork.
  paperCup: {
    el: 'fire',
    svg: `<path d="M10 14h44l-6 44H16z"/><rect x="6" y="8" width="52" height="9" rx="2"/><path fill="#16121f" opacity=".35" d="M13 30h38l-1 10H14z"/><path ${HI} d="M18 22l-2 26h4z"/>`,
  },
  spoon: {
    el: 'steel',
    svg: `<ellipse cx="32" cy="16" rx="12" ry="14"/><path d="M28 28h8l2 32H26z"/><path ${HI} d="M26 10c2-3 4-4 7-4-4 1-6 4-7 9z"/>`,
  },
  fork: {
    el: 'steel',
    svg: `<path d="M17 4h6v18c0 2 2 3 5 3V4h6v21c3 0 5-1 5-3V4h6v18c0 7-5 11-11 12v26h-6V34c-6-1-11-5-11-12z"/>`,
  },
  clipboard: {
    el: 'steel',
    svg: `<rect x="10" y="8" width="44" height="54" rx="4"/><rect x="21" y="3" width="22" height="12" rx="3" fill="#16121f"/><path d="M17 28l5 5 9-9M17 45l5 5 9-9M37 30h10M37 47h10" fill="none" stroke="#16121f" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  tophat: {
    el: 'shadow',
    svg: `<path d="M17 6h30v38H17z"/><rect x="17" y="32" width="30" height="6" fill="#16121f"/><path d="M3 44h58c0 8-6 13-13 13H16C9 57 3 52 3 44z"/>`,
  },
  target: {
    el: 'fire',
    svg: `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="15" fill="#16121f"/><circle cx="32" cy="32" r="8"/><g ${S} stroke-width="5"><path d="M32 2v14M32 48v14M2 32h14M48 32h14"/></g>`,
  },
  swap: {
    el: 'steel',
    svg: `<path d="M20 4l14 16h-9v26h-10V20H6zM44 60L30 44h9V18h10v26h9z"/>`,
  },
  // Innate: a starting flag ("this card comes first").
  flag: {
    el: 'holy',
    svg: `<rect x="12" y="4" width="7" height="56" rx="2"/><path d="M19 6h34l-9 12 9 12H19z"/><path fill="#fff" opacity=".35" d="M19 6h34l-3 4H19z"/>`,
  },
  skullBomb: {
    el: 'curse',
    svg: `<circle cx="30" cy="38" r="22"/><rect x="38" y="10" width="10" height="10" transform="rotate(45 43 15)"/><path d="M46 10c4-6 10-6 14-2" stroke="currentColor" stroke-width="4" fill="none"/><g fill="#16121f"><path d="M18 32h9v9h-9zM33 32h9v9h-9zM27 45h6v5h-6z"/><path d="M20 52h20v3H20z"/></g>${star4(58, 6, 6)}`,
  },
  bomb: {
    el: 'curse',
    svg: `<circle cx="28" cy="38" r="20"/><rect x="36" y="12" width="10" height="10" transform="rotate(45 41 17)"/><path d="M44 12c4-6 10-6 14-2" stroke="currentColor" stroke-width="4" fill="none"/><path ${HI} d="M16 32c2-6 7-10 12-10-2 4-2 8 0 12-5 1-9 0-12-2z"/>${star4(58, 8, 6)}`,
  },
  bone: {
    el: 'necro',
    svg: `<path d="M8 50l30-30-3-6a6 6 0 1 1 9-6 6 6 0 1 1 6 9l6 3-30 30 3 6a6 6 0 1 1-9 6 6 6 0 1 1-6-9z"/><path d="M52 4L40 22l4 4 18-12z"/>`,
  },
  dasKapital: {
    el: 'necro',
    svg: `<path d="M9.6 3.2h6.4v3.2h-6.4zM19.2 3.2h32v3.2h-32zM9.6 6.4h6.4v3.2h-6.4zM19.2 6.4h32v3.2h-32zM54.4 6.4h6.4v3.2h-6.4zM9.6 9.6h6.4v3.2h-6.4zM19.2 9.6h3.2v3.2h-3.2zM48 9.6h3.2v3.2h-3.2zM54.4 9.6h6.4v3.2h-6.4zM9.6 12.8h6.4v3.2h-6.4zM19.2 12.8h3.2v3.2h-3.2zM48 12.8h3.2v3.2h-3.2zM54.4 12.8h6.4v3.2h-6.4zM9.6 16h6.4v3.2h-6.4zM19.2 16h32v3.2h-32zM54.4 16h6.4v3.2h-6.4zM9.6 19.2h6.4v3.2h-6.4zM19.2 19.2h32v3.2h-32zM54.4 19.2h6.4v3.2h-6.4zM9.6 22.4h6.4v3.2h-6.4zM19.2 22.4h12.8v3.2h-12.8zM38.4 22.4h12.8v3.2h-12.8zM54.4 22.4h6.4v3.2h-6.4zM9.6 25.6h6.4v3.2h-6.4zM19.2 25.6h12.8v3.2h-12.8zM38.4 25.6h12.8v3.2h-12.8zM54.4 25.6h6.4v3.2h-6.4zM9.6 28.8h6.4v3.2h-6.4zM19.2 28.8h3.2v3.2h-3.2zM48 28.8h3.2v3.2h-3.2zM54.4 28.8h6.4v3.2h-6.4zM9.6 32h6.4v3.2h-6.4zM19.2 32h6.4v3.2h-6.4zM44.8 32h6.4v3.2h-6.4zM54.4 32h6.4v3.2h-6.4zM9.6 35.2h6.4v3.2h-6.4zM19.2 35.2h9.6v3.2h-9.6zM41.6 35.2h9.6v3.2h-9.6zM54.4 35.2h6.4v3.2h-6.4zM9.6 38.4h6.4v3.2h-6.4zM19.2 38.4h9.6v3.2h-9.6zM41.6 38.4h9.6v3.2h-9.6zM54.4 38.4h6.4v3.2h-6.4zM9.6 41.6h6.4v3.2h-6.4zM19.2 41.6h6.4v3.2h-6.4zM32 41.6h6.4v3.2h-6.4zM44.8 41.6h6.4v3.2h-6.4zM54.4 41.6h6.4v3.2h-6.4zM9.6 44.8h6.4v3.2h-6.4zM19.2 44.8h6.4v3.2h-6.4zM28.8 44.8h12.8v3.2h-12.8zM44.8 44.8h6.4v3.2h-6.4zM54.4 44.8h6.4v3.2h-6.4zM9.6 48h6.4v3.2h-6.4zM19.2 48h32v3.2h-32zM54.4 48h6.4v3.2h-6.4zM9.6 51.2h6.4v3.2h-6.4zM19.2 51.2h32v3.2h-32zM54.4 51.2h6.4v3.2h-6.4zM9.6 54.4h6.4v3.2h-6.4zM19.2 54.4h32v3.2h-32zM38.4 57.6h6.4v3.2h-6.4zM38.4 60.8h6.4v3.2h-6.4z"/>`,
  },
  gear: {
    el: 'steel',
    // Eight square teeth and a wide hole: it has to read at 20 px.
    svg: `<circle cx="32" cy="32" r="21"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="26.5" y="4" width="11" height="12" transform="rotate(${a} 32 32)"/>`).join('')}<circle cx="32" cy="32" r="10" fill="#16121f"/>`,
  },
  left: { el: 'steel', svg: `<path d="M4 32L30 8v14h30v20H30v14z"/>` },
  cross: { el: 'shadow', svg: `<path d="M8 16l8-8 16 16 16-16 8 8-16 16 16 16-8 8-16-16-16 16-8-8 16-16z"/>` },
  crown: { el: 'holy', svg: `<path d="M6 20l14 12 12-22 12 22 14-12-6 32H12z"/><rect x="12" y="52" width="40" height="6" rx="2"/>` },
  // ---- Card art: one drawing per card, never shared with a rule icon (see content test).
  punchCard: {
    el: 'steel',
    svg: `<path d="M10 6h36l10 10v42H10z"/><g fill="#16121f"><rect x="18" y="16" width="6" height="10"/><rect x="30" y="24" width="6" height="10"/><rect x="42" y="18" width="6" height="10"/><rect x="18" y="38" width="6" height="10"/><rect x="36" y="42" width="6" height="10"/></g>`,
  },
  bobTheBuilder: {
    el: 'steel',
    svg: `<path d="M10 42c0-16 10-28 22-28s22 12 22 28z"/><rect x="4" y="42" width="56" height="9" rx="2"/><rect x="29" y="16" width="6" height="26" fill="#16121f"/>`,
  },
  dunderMifflinBox: {
    el: 'curse',
    svg: `<path d="M6 24l26-10 26 10v30L32 62 6 54z"/><g fill="#16121f"><path d="M32 30v32h-3V30zM6 24l26 8 26-8-26-8zM12 36h8v3h-8z"/></g><path d="M2 20l24-8 6 6-24 8zM62 20l-24-8-6 6 24 8z"/>`,
  },
  liftingWorker: {
    el: 'steel',
    svg: `<path d="M6.4 3.2h51.2v3.2h-51.2zM6.4 6.4h51.2v3.2h-51.2zM6.4 9.6h6.4v3.2h-6.4zM51.2 9.6h6.4v3.2h-6.4zM6.4 12.8h51.2v3.2h-51.2zM6.4 16h51.2v3.2h-51.2zM12.8 19.2h6.4v3.2h-6.4zM44.8 19.2h6.4v3.2h-6.4zM12.8 22.4h6.4v3.2h-6.4zM25.6 22.4h12.8v3.2h-12.8zM44.8 22.4h6.4v3.2h-6.4zM16 25.6h6.4v3.2h-6.4zM25.6 25.6h12.8v3.2h-12.8zM41.6 25.6h6.4v3.2h-6.4zM16 28.8h6.4v3.2h-6.4zM25.6 28.8h12.8v3.2h-12.8zM41.6 28.8h6.4v3.2h-6.4zM19.2 32h25.6v3.2h-25.6zM22.4 35.2h19.2v3.2h-19.2zM22.4 38.4h19.2v3.2h-19.2zM22.4 41.6h19.2v3.2h-19.2zM22.4 44.8h19.2v3.2h-19.2zM22.4 48h6.4v3.2h-6.4zM35.2 48h6.4v3.2h-6.4zM22.4 51.2h6.4v3.2h-6.4zM35.2 51.2h6.4v3.2h-6.4zM22.4 54.4h6.4v3.2h-6.4zM35.2 54.4h6.4v3.2h-6.4zM22.4 57.6h6.4v3.2h-6.4zM35.2 57.6h6.4v3.2h-6.4zM19.2 60.8h9.6v3.2h-9.6zM35.2 60.8h9.6v3.2h-9.6z"/>`,
  },
  doubleClock: {
    el: 'blood',
    svg: `<circle cx="22" cy="28" r="18"/><circle cx="42" cy="38" r="18"/><path d="M42 38V26M42 38l8 5" stroke="#16121f" stroke-width="4.5" stroke-linecap="round" fill="none"/>`,
  },
  grievance: {
    el: 'steel',
    svg: `<path d="M12 4h30l10 10v46H12z"/><rect x="28" y="16" width="8" height="22" fill="#16121f"/><rect x="28" y="44" width="8" height="8" fill="#16121f"/>`,
  },
  youShallNotPass: { el: 'steel', svg: `<path d="M6 10l22 22L6 54V40l8-8-8-8zM32 10l22 22-22 22V40l8-8-8-8z"/>` },
  virus: {
    el: 'nature',
    svg: `<circle cx="32" cy="32" r="16"/><g ${S} stroke-width="5"><path d="M32 4v12M32 48v12M4 32h12M48 32h12M12 12l9 9M43 43l9 9M52 12l-9 9M21 43l-9 9"/></g><g fill="#16121f"><rect x="25" y="26" width="5" height="5"/><rect x="35" y="35" width="5" height="5"/><rect x="34" y="24" width="4" height="4"/></g>`,
  },
  rust: {
    el: 'fire',
    svg: `<path d="M20 6h24l16 26-16 26H20L4 32z"/><circle cx="32" cy="32" r="9" fill="#16121f"/><g fill="#16121f"><rect x="8" y="26" width="6" height="6"/><rect x="48" y="14" width="6" height="6"/><rect x="40" y="46" width="8" height="6"/><rect x="22" y="12" width="5" height="5"/></g>`,
  },
  mop: {
    el: 'steel',
    svg: `<path d="M48 2l8 4-24 36-8-4z"/><path d="M6 42l22 6 8 14H2z"/><g fill="#16121f"><rect x="9" y="54" width="3" height="8"/><rect x="17" y="54" width="3" height="8"/><rect x="25" y="54" width="3" height="8"/></g>`,
  },
  windUp: {
    el: 'steel',
    svg: `<rect x="14" y="6" width="28" height="22"/><g fill="#16121f"><rect x="20" y="13" width="6" height="6"/><rect x="30" y="13" width="6" height="6"/><rect x="22" y="22" width="12" height="3"/></g><rect x="12" y="30" width="32" height="22"/><rect x="14" y="52" width="10" height="10"/><rect x="32" y="52" width="10" height="10"/><rect x="44" y="38" width="6" height="4"/><rect x="50" y="32" width="12" height="16"/><rect x="54" y="38" width="4" height="4" fill="#16121f"/>`,
  },
  windKey: {
    el: 'steel',
    svg: `<circle cx="20" cy="32" r="16"/><circle cx="20" cy="32" r="6" fill="#16121f"/><rect x="32" y="29" width="28" height="7"/><rect x="48" y="36" width="6" height="12"/><rect x="38" y="36" width="5" height="8"/>`,
  },
  sandwich: {
    el: 'nature',
    svg: `<path d="M4 32L32 8l28 24z"/><rect x="4" y="34" width="56" height="8"/><rect x="4" y="46" width="56" height="10"/><path d="M8 42h48l-4 4H12z" fill="#16121f"/>`,
  },
  employeeOfTheMonth: {
    el: 'holy',
    svg: `<rect x="4" y="8" width="46" height="54"/><rect x="10" y="14" width="34" height="32" fill="#16121f"/><circle cx="27" cy="26" r="8.5"/><path d="M14 46c0-9 6-14 13-14s13 5 13 14z"/><rect x="11" y="51" width="32" height="6" fill="#16121f"/><path d="M16 54h6M28 54h10" stroke="#fff" stroke-width="2.5"/><path stroke="#16121f" stroke-width="4" stroke-linejoin="round" d="M50 1l4.4 9.5 10.3 1.2-7.6 7 2 10.2L50 23l-9.1 5 2-10.2-7.6-7 10.3-1.2z"/><path d="M50 1l4.4 9.5 10.3 1.2-7.6 7 2 10.2L50 23l-9.1 5 2-10.2-7.6-7 10.3-1.2z"/>`,
  },
  safetySign: {
    el: 'holy',
    svg: `<path d="M32 4l30 54H2z"/><rect x="28" y="20" width="8" height="20" fill="#16121f"/><rect x="28" y="44" width="8" height="8" fill="#16121f"/>`,
  },
  forklift: {
    el: 'steel',
    svg: `<path d="M6 20h22l8 18v12H6z"/><rect x="40" y="4" width="6" height="48"/><path d="M46 44h16v6H46z"/><circle cx="14" cy="54" r="7"/><circle cx="30" cy="54" r="7"/><rect x="10" y="24" width="14" height="10" fill="#16121f"/>`,
  },
  hazardCoin: {
    el: 'holy',
    svg: `<circle cx="32" cy="32" r="27"/><g fill="#16121f"><path d="M12 24l6-8 30 30-6 8zM26 10l8-3 22 22-3 8z"/><path d="M8 40l3-8 22 22-8 3z"/></g>`,
  },
  megaphone: {
    el: 'blood',
    svg: `<path d="M4 24h12l30-16v48L16 40H4z"/><path d="M14 40l4 18h9l-4-18z"/><g ${S} stroke-width="4.5"><path d="M52 22c6 5 6 15 0 20"/></g>`,
  },
  shoulderCheck: {
    el: 'steel',
    svg: `<circle cx="22" cy="12" r="9"/><path d="M8 26h24l16 10-5 8-11-6v24H14V44l-6 6-6-6z"/><g ${S} stroke-width="4.5"><path d="M52 24l9-6M54 38h9"/></g>`,
  },
  hostileTakeover: {
    el: 'steel',
    svg: `<rect x="3" y="24" width="44" height="32" rx="3"/><path d="M15 24v-9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9h-6v-6h-6v6z"/><rect x="3" y="37" width="44" height="4" fill="#16121f"/><path d="M32 40L58 8" stroke="#16121f" stroke-width="10" stroke-linecap="round"/><path d="M32 40L58 8" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M54 12c5-1 8-5 6-9" stroke="#16121f" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M54 12c5-1 8-5 6-9" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" fill="none"/>`,
  },
  stonks: {
    el: 'blood',
    svg: `<rect x="4" y="4" width="5" height="56"/><rect x="4" y="55" width="56" height="5"/><g ${S} stroke-width="6"><path d="M15 46l11-12 8 8 16-20"/></g><path d="M42 12h18v18z"/>`,
  },
  // Mage
  echo: {
    el: 'arcane',
    svg: `<circle cx="14" cy="32" r="9"/><g ${S} stroke-width="5"><path d="M28 18c8 8 8 20 0 28M38 10c13 12 13 32 0 44M48 4c17 16 17 40 0 56"/></g>`,
  },
  spaghetti: {
    el: 'arcane',
    svg: `<rect x="4" y="54" width="56" height="6" rx="3"/><path d="M8 48C8 30 18 18 32 18s24 12 24 30z"/><g stroke="#16121f" stroke-width="5" stroke-linecap="round" fill="none"><path d="M12 42q5-8 10 0t10 0 10 0 8-3"/><path d="M16 31q5-7 10 0t10 0 8-2"/></g><path d="M48 2h6L42 24h-5z"/>`,
  },
  meltdown: {
    el: 'fire',
    svg: `<path d="M12 6h40v28c0 6-4 4-4 12s-6 10-6 2-4-10-8-2-2 16-6 16-4-12-6-6-6 4-6-2-6-6-4-10z"/><rect x="20" y="14" width="24" height="6" fill="#16121f"/>`,
  },
  fireWall: {
    el: 'fire',
    svg: `<path d="M6 34h52v24H6z"/><path d="M10 34c0-10 8-14 6-26 8 6 10 16 8 26zM28 34c0-8 6-12 4-24 10 8 10 18 8 24zM44 34c0-6 4-10 4-18 6 6 7 12 5 18z"/><g fill="#16121f"><rect x="6" y="45" width="52" height="3"/><rect x="22" y="34" width="3" height="11"/><rect x="40" y="34" width="3" height="11"/><rect x="30" y="48" width="3" height="10"/></g>`,
  },
  match: {
    el: 'fire',
    svg: `<rect x="28" y="26" width="8" height="36" rx="2"/><path d="M32 2c7 7 11 11 11 18a11 11 0 0 1-22 0c0-7 4-11 11-18z"/><ellipse cx="32" cy="24" rx="5" ry="6" fill="#16121f"/>`,
  },
  coffeePot: {
    el: 'arcane',
    svg: `<path d="M16 18h28l6 40H10z"/><path d="M44 22h8c4 0 6 4 6 8v8c0 4-4 6-8 6h-4v-6h4V28h-6z"/><rect x="20" y="8" width="20" height="10"/><rect x="14" y="36" width="34" height="5" fill="#16121f"/>`,
  },
  papers: {
    el: 'arcane',
    svg: `<path d="M8 20h34v40H8z"/><path d="M16 12h34v40h-5V17H16z"/><path d="M24 4h34v40h-5V9H24z"/><g fill="#16121f"><rect x="13" y="28" width="24" height="3"/><rect x="13" y="36" width="24" height="3"/><rect x="13" y="44" width="16" height="3"/></g>`,
  },
  blueScreen: {
    el: 'ice',
    svg: `<rect x="4" y="6" width="56" height="40" rx="3"/><rect x="26" y="46" width="12" height="8"/><rect x="14" y="54" width="36" height="5"/><g fill="#16121f"><rect x="14" y="15" width="5" height="5"/><rect x="14" y="27" width="5" height="5"/><rect x="14" y="38" width="32" height="3"/></g><path d="M34 12c-7 5-7 17 0 22" stroke="#16121f" stroke-width="4" fill="none"/>`,
  },
  kanban: {
    el: 'arcane',
    svg: `<rect x="4" y="8" width="56" height="48" rx="2"/><g fill="#16121f"><rect x="10" y="14" width="12" height="10"/><rect x="26" y="14" width="12" height="10"/><rect x="42" y="14" width="12" height="10"/><rect x="10" y="28" width="12" height="10"/><rect x="26" y="28" width="12" height="10"/><rect x="10" y="42" width="12" height="10"/></g>`,
  },
  thermostat: {
    el: 'ice',
    svg: `<circle cx="32" cy="32" r="27"/><circle cx="32" cy="32" r="17" fill="#16121f"/><circle cx="32" cy="32" r="12"/><path d="M32 32l8-8" stroke="#16121f" stroke-width="4.5"/>`,
  },
  gears: {
    el: 'arcane',
    svg: `<circle cx="22" cy="40" r="13"/><rect x="19.0" y="22" width="6" height="6" transform="rotate(0 22 40)"/><rect x="19.0" y="22" width="6" height="6" transform="rotate(45 22 40)"/><rect x="19.0" y="22" width="6" height="6" transform="rotate(90 22 40)"/><rect x="19.0" y="22" width="6" height="6" transform="rotate(135 22 40)"/><rect x="19.0" y="22" width="6" height="6" transform="rotate(180 22 40)"/><rect x="19.0" y="22" width="6" height="6" transform="rotate(225 22 40)"/><rect x="19.0" y="22" width="6" height="6" transform="rotate(270 22 40)"/><rect x="19.0" y="22" width="6" height="6" transform="rotate(315 22 40)"/><circle cx="22" cy="40" r="5" fill="#16121f"/><circle cx="45" cy="19" r="10"/><rect x="42.5" y="5" width="5" height="5" transform="rotate(0 45 19)"/><rect x="42.5" y="5" width="5" height="5" transform="rotate(51 45 19)"/><rect x="42.5" y="5" width="5" height="5" transform="rotate(103 45 19)"/><rect x="42.5" y="5" width="5" height="5" transform="rotate(154 45 19)"/><rect x="42.5" y="5" width="5" height="5" transform="rotate(206 45 19)"/><rect x="42.5" y="5" width="5" height="5" transform="rotate(257 45 19)"/><rect x="42.5" y="5" width="5" height="5" transform="rotate(309 45 19)"/><circle cx="45" cy="19" r="4" fill="#16121f"/>`,
  },
  digitalDetox: {
    el: 'ice',
    svg: `<rect x="16" y="4" width="32" height="56" rx="5"/><rect x="20" y="10" width="24" height="38" rx="2" fill="#16121f"/><circle cx="32" cy="54" r="2.2" fill="#16121f"/><path d="M6 58L58 6" stroke="#16121f" stroke-width="10" stroke-linecap="round"/><path d="M6 58L58 6" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
  },
  coldCall: {
    el: 'ice',
    svg: `<path d="M8 16c0-6 4-10 10-10h4l4 12-8 4c2 10 10 18 20 20l4-8 12 4v4c0 6-4 10-10 10C24 52 8 36 8 16z"/><g ${S} stroke-width="4"><path d="M44 6v16M36 14h16M38 8l12 12M50 8L38 20"/></g>`,
  },
  powerNap: {
    el: 'arcane',
    svg: `<path d="M4 30c6-6 50-6 56 0 3 8 3 18 0 26-6 6-50 6-56 0-3-8-3-18 0-26z"/><path d="M38 2h18v5L45 18h11v5H38v-5l11-11H38z"/>`,
  },
  blastFurnace: {
    el: 'fire',
    svg: `<path d="M14 60V24l8-8h20l8 8v36z"/><rect x="26" y="2" width="12" height="14"/><path d="M22 60V44c0-6 4-10 10-10s10 4 10 10v16z" fill="#16121f"/><path d="M32 40c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z"/>`,
  },
  plug: {
    el: 'arcane',
    svg: `<rect x="16" y="20" width="32" height="24" rx="4"/><rect x="22" y="4" width="6" height="16"/><rect x="36" y="4" width="6" height="16"/><path d="M28 44h8v8c0 4 4 6 8 6h12v6H44c-8 0-16-4-16-12z"/>`,
  },
  // Necromancer
  cart: {
    el: 'necro',
    svg: `<g ${S} stroke-width="6"><path d="M2 10h10l8 30h32l6-22H15"/></g><path d="M16 18h42l-6 22H20z"/><circle cx="24" cy="52" r="6"/><circle cx="46" cy="52" r="6"/>`,
  },
  pipeLeak: {
    el: 'necro',
    svg: `<path d="M4 10h34c8 0 14 6 14 14v12H40V24c0-2-2-2-2-2H4z"/><path d="M36 36h20v8H36z"/><path d="M46 48c4 6 5 8 5 10a5 5 0 0 1-10 0c0-2 1-4 5-10z"/><path d="M20 26c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z"/>`,
  },
  pingPongTable: {
    el: 'steel',
    svg: `<path d="M14 22h46l-8 16H6z"/><rect x="30" y="8" width="5" height="30"/><path d="M8 38v20h5V38zM48 38v20h5V38z"/><circle cx="14" cy="12" r="4"/>`,
  },
  speech: {
    el: 'necro',
    svg: `<path d="M6 8h52v34H26L12 56V42H6z"/><g fill="#16121f"><circle cx="20" cy="25" r="4"/><circle cx="32" cy="25" r="4"/><circle cx="44" cy="25" r="4"/></g>`,
  },
  kettlebell: {
    el: 'steel',
    svg: `<path d="M18 22c0-11 6-16 14-16s14 5 14 16h-7c0-6-2-9-7-9s-7 3-7 9z"/><circle cx="32" cy="40" r="20"/><rect x="18" y="56" width="28" height="5"/>`,
  },
  envelope: {
    el: 'necro',
    svg: `<rect x="4" y="14" width="56" height="38"/><path d="M4 14l28 22 28-22" stroke="#16121f" stroke-width="4" fill="none"/><path d="M42 46l6-6 6 6-6 6z" fill="#16121f"/>`,
  },
  walkout: {
    el: 'necro',
    svg: `<path d="M4 4h30v56H4z"/><rect x="10" y="10" width="18" height="44" fill="#16121f"/><path d="M24 26h18V16l18 16-18 16V38H24z"/>`,
  },
  pillBottle: {
    el: 'necro',
    svg: `<rect x="14" y="4" width="36" height="12" rx="2"/><path d="M16 18h32v40H16z"/><rect x="16" y="28" width="32" height="20" fill="#16121f"/><path d="M28 31h8v5h5v7h-5v5h-8v-5h-5v-7h5z"/>`,
  },
  zombieHand: {
    el: 'necro',
    svg: `<path d="M20 60V34l-6-8V10h6v14h4V6h6v18h4V8h6v18h4v-8h6v16l-4 10v26z"/><rect x="8" y="58" width="48" height="5"/><g fill="#16121f"><rect x="26" y="40" width="7" height="3"/><rect x="34" y="48" width="7" height="3"/></g>`,
  },
  moon: {
    el: 'necro',
    svg: `<path d="M38 4a28 28 0 1 0 22 42A24 24 0 0 1 38 4z"/><path d="M50 10l2 5 5 1-4 3 1 5-4-3-5 3 2-5-4-3h5z"/>`,
  },
  chainSmoking: {
    el: 'necro',
    svg: `<rect x="2" y="40" width="16" height="14"/><rect x="21" y="40" width="30" height="14"/><rect x="52" y="40" width="10" height="14"/><rect x="56" y="44" width="4" height="4" fill="#16121f"/><g ${S} stroke-width="5"><path d="M42 36l-6-7 6-7-6-7M56 36l-6-7 6-7-6-7"/></g>`,
  },
  // ---- the Sushi Chef's belt (`allYouCanEat`)
  sushiSalmon: {
    el: 'fire',
    svg: `<rect x="6" y="36" width="52" height="20" rx="10" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/><path d="M6 38C8 18 24 12 34 14c14 2 24 10 24 24z" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/><path fill="none" stroke="#16121f" stroke-width="3" stroke-linecap="round" d="M18 34c4-8 8-11 13-12M32 36c4-8 8-11 14-12"/>`,
  },
  sushiPlate: {
    el: 'fire',
    svg: `<ellipse cx="32" cy="40" rx="30" ry="15" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/><ellipse cx="32" cy="40" rx="21" ry="9" fill="#16121f"/><rect x="16" y="24" width="32" height="16" rx="8" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/><path d="M16 30C18 20 28 17 34 18c8 1 14 5 14 12z" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/>`,
  },
  sushiMaki: {
    el: 'nature',
    svg: `<circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="22" fill="#16121f"/><circle cx="32" cy="32" r="17"/><circle cx="32" cy="32" r="10" fill="#16121f"/><circle cx="32" cy="32" r="6"/>`,
  },
  sushiEgg: {
    el: 'holy',
    svg: `<rect x="6" y="36" width="52" height="20" rx="10" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/><rect x="10" y="18" width="44" height="22" rx="4" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/><rect x="26" y="14" width="12" height="44" fill="#16121f"/><path d="M14 26h8M42 26h8M14 32h8M42 32h8" stroke="#16121f" stroke-width="2.5"/>`,
  },
  sushiShrimp: {
    el: 'blood',
    svg: `<rect x="6" y="40" width="52" height="16" rx="8" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/><path d="M6 42c0-20 14-28 28-26 14 2 24 10 24 26z" stroke="#16121f" stroke-width="3" stroke-linejoin="round"/><path fill="none" stroke="#16121f" stroke-width="3" d="M18 40c0-8 4-14 10-17M30 40c0-8 4-14 12-16M42 40c0-6 2-10 7-12"/>`,
  },
  // Boris, a little fish
  fish: {
    el: 'necro',
    svg: `<path d="M4 18l16 10c4-5 10-8 18-8 12 0 22 7 24 14-2 7-12 14-24 14-8 0-14-3-18-8L4 50l5-18z"/><circle cx="48" cy="32" r="4" fill="#16121f"/><path fill="none" stroke="#16121f" stroke-width="3" stroke-linecap="round" d="M34 24c3 5 3 11 0 16M42 44c2 0 4-1 5-2"/><path ${HI} d="M26 28c4-3 9-4 14-3-5 1-9 3-12 6z"/>`,
  },
  karoshi: {
    el: 'necro',
    svg: `<g transform="translate(11 0) scale(.66)"><path d="M32 6C18 6 9 16 9 28c0 8 4 13 8 16v8c0 3 2 5 5 5h20c3 0 5-2 5-5v-8c4-3 8-8 8-16C55 16 46 6 32 6z"/><circle cx="23" cy="30" r="6" fill="#16121f"/><circle cx="41" cy="30" r="6" fill="#16121f"/><path d="M32 36l-4 7h8z" fill="#16121f"/></g><rect x="3" y="42" width="58" height="18" rx="2"/><path d="M8 49h48M8 55h48" stroke="#16121f" stroke-width="3"/><path d="M20 43v6M32 43v6M44 43v6M26 49v6M38 49v6" stroke="#16121f" stroke-width="3"/>`,
  },
  mangioni: {
    el: 'nature',
    svg: `<path d="M12 42c0-19 8-30 20-30s20 11 20 30z"/><path d="M16 34q5-6 10 0t10 0t10 0M21 25q5-5 9 0t9 0M28 18q4-3 8 0" stroke="#16121f" stroke-width="4" fill="none"/><path d="M4 44h56" stroke="#16121f" stroke-width="3"/><path d="M4 46h56c-1 10-12 16-28 16S5 56 4 46z"/><path d="M16 52q16 5 32 0" stroke="#16121f" stroke-width="3" fill="none"/><g transform="rotate(30 52 18)"><rect x="49" y="0" width="6" height="22" rx="3"/><path d="M43 20h18v4c0 5-4 8-9 8s-9-3-9-8z"/><path d="M45 26v12M50 28v12M55 28v12M60 26v12" stroke="currentColor" stroke-width="3.5" fill="none"/></g>`,
  },
  toxicMemo: {
    el: 'necro',
    svg: `<path d="M8 8h48v34L42 56H8z"/><path d="M42 56V42h14z" fill="#16121f"/><path d="M28 14c7 9 10 13 10 17a10 10 0 0 1-20 0c0-4 3-8 10-17z" fill="#16121f"/>`,
  },
  bloodMoney: {
    el: 'necro',
    svg: `<rect x="2" y="16" width="52" height="30" rx="2"/><circle cx="28" cy="31" r="9" fill="#16121f"/><circle cx="28" cy="31" r="4"/><path d="M52 34c5 8 8 12 8 16a8 8 0 0 1-16 0c0-4 3-8 8-16z"/>`,
  },
  smiley: {
    el: 'nature',
    svg: `<circle cx="32" cy="32" r="27"/><g fill="#16121f"><rect x="20" y="18" width="7" height="11"/><rect x="37" y="18" width="7" height="11"/><path d="M16 36h32c-2 9-8 14-16 14s-14-5-16-14z"/></g>`,
  },
  unionCard: {
    el: 'necro',
    svg: `<rect x="10" y="12" width="44" height="48" rx="3"/><rect x="26" y="4" width="12" height="12"/><g fill="#16121f"><circle cx="32" cy="30" r="7"/><path d="M19 50c2-9 7-11 13-11s11 2 13 11z"/></g>`,
  },
  waterCooler: {
    el: 'necro',
    svg: `<path d="M22 2h20c4 4 6 10 6 16s-2 10-6 12H22c-4-2-6-6-6-12s2-12 6-16z"/><circle cx="27" cy="14" r="3" fill="#16121f" opacity=".5"/><circle cx="37" cy="22" r="2.5" fill="#16121f" opacity=".5"/><rect x="14" y="33" width="36" height="28" rx="2"/><rect x="21" y="39" width="22" height="14" fill="#16121f"/><rect x="29" y="39" width="6" height="7"/><rect x="26" y="57" width="12" height="3" fill="#16121f"/>`,
  },
  // Neutral
  bean: {
    el: 'arcane',
    svg: `<ellipse cx="32" cy="32" rx="19" ry="27" transform="rotate(30 32 32)"/><path d="M20 12c14 10 8 30 22 40" stroke="#16121f" stroke-width="5" fill="none"/>`,
  },
  espresso: {
    el: 'arcane',
    svg: `<path d="M3 28h24v14c0 7-5 12-12 12S3 49 3 42z"/><path d="M35 28h24v14c0 7-5 12-12 12s-12-5-12-12z"/><rect x="1" y="56" width="62" height="5"/><g ${S} stroke-width="4"><path d="M13 22c-3-4 3-6 0-11M45 22c-3-4 3-6 0-11"/></g>`,
  },
  // Moka pot: a faceted aluminium pot with a spout, a black handle and a lid knob
  moka: {
    el: 'arcane',
    svg: `<path d="M20 4h22l2 6H18z"/><rect x="29" y="1" width="6" height="5" fill="#16121f"/><path d="M16 12h32l-6 20H22z"/><path d="M22 32h20l8 26H14z"/><rect x="16" y="30" width="32" height="4" fill="#16121f"/><path d="M48 14h8c4 0 6 4 6 10s-2 10-6 10h-6v-5h4c1 0 2-2 2-5s-1-5-2-5h-4z" fill="#16121f"/><path d="M12 12l-6-4v8z"/>`,
  },
  // Swedish flag on a pole: a Nordic cross, off-centre towards the pole
  flagSweden: {
    el: 'nature',
    svg: `<rect x="8" y="4" width="5" height="58"/><path d="M13 8h46v36H13z"/><path fill="#16121f" d="M13 21h46v8H13z"/><path fill="#16121f" d="M24 8h8v36h-8z"/><path ${HI} d="M13 8h46v3H13z"/>`,
  },
  stapler: {
    el: 'steel',
    svg: `<path d="M4 44h56v12H4z"/><path d="M6 40l40-22c6-3 14 0 14 8v10H6z"/><rect x="10" y="47" width="30" height="4" fill="#16121f"/>`,
  },
  stapleRemover: {
    el: 'steel',
    svg: `<path d="M4 40l30-18c4-2 8 0 8 4v6L12 52H4z"/><path d="M4 52h44l12-8v8c0 4-3 8-8 8H4z"/><path fill="#16121f" d="M40 30l14 6-2 4-14-6z"/>`,
  },
  // Sleeve cards
  toolBelt: {
    el: 'steel',
    svg: `<rect x="2" y="22" width="60" height="12"/><rect x="26" y="20" width="12" height="16" fill="#16121f"/><rect x="29" y="23" width="6" height="10"/><path d="M8 34h12v20H8zM44 34h12v16H44z"/><path d="M12 34V14h4v20zM48 34V8l6 6-2 2v18z"/>`,
  },
  floppy: {
    el: 'arcane',
    svg: `<path d="M6 6h44l8 8v44H6z"/><rect x="16" y="6" width="26" height="18" fill="#16121f"/><rect x="32" y="9" width="6" height="12"/><rect x="14" y="34" width="36" height="22" fill="#16121f" opacity=".35"/><rect x="18" y="40" width="28" height="3" fill="#16121f"/><rect x="18" y="47" width="20" height="3" fill="#16121f"/>`,
  },
  burnBook: {
    el: 'necro',
    svg: `<path d="M8 8h40c4 0 8 4 8 8v42H16c-4 0-8-4-8-8z"/><path d="M8 50c0-4 4-8 8-8h40" stroke="#16121f" stroke-width="3" fill="none"/><path d="M32 14c-7 0-12 5-12 11 0 4 2 6 4 8v4h16v-4c2-2 4-4 4-8 0-6-5-11-12-11z" fill="#16121f"/><g fill="currentColor"><rect x="25" y="23" width="5" height="5"/><rect x="34" y="23" width="5" height="5"/></g>`,
  },
  // Time on the belt
  lateClock: {
    el: 'blood',
    svg: `<circle cx="30" cy="34" r="26"/><circle cx="30" cy="34" r="19" fill="#16121f" opacity=".35"/><path d="M30 34V18M30 34l-10 6" stroke="#16121f" stroke-width="5" fill="none"/><path d="M54 4a12 12 0 1 0 8 18 10 10 0 1 1-8-18z"/>`,
  },
  queueTicket: {
    el: 'steel',
    svg: `<path d="M10 8h44v48H10v-8a6 6 0 0 0 0-12v-8a6 6 0 0 0 0-12z"/><g fill="#16121f"><rect x="18" y="16" width="28" height="4"/><path d="M22 28h8v20h-6V34h-2zM34 28h12v5h-7v3h7v12H34v-5h7v-3h-7z"/></g>`,
  },
  scales: { el: 'holy', svg: scales },
  scalesMirror: { el: 'holy', svg: scalesMirror },
  complaintBox: {
    el: 'blood',
    svg: `<rect x="8" y="20" width="48" height="40"/><rect x="4" y="14" width="56" height="8"/><rect x="18" y="16" width="28" height="4" fill="#16121f"/><path d="M26 2h14l2 12H24z" fill="#fff" opacity=".85"/><g fill="#16121f"><rect x="16" y="32" width="32" height="4"/><rect x="16" y="40" width="24" height="4"/><rect x="16" y="48" width="28" height="4"/></g>`,
  },
  // Pop culture
  powerOff: {
    el: 'arcane',
    svg: `<g ${S} stroke-width="7"><path d="M20 16a22 22 0 1 0 24 0"/><path d="M32 6v24"/></g>`,
  },
  powerOn: {
    el: 'arcane',
    svg: `<g ${S} stroke-width="7"><path d="M20 20a18 18 0 1 0 24 0"/><path d="M32 12v20"/></g><g ${S} stroke-width="4"><path d="M8 8l6 6M56 8l-6 6M2 34h6M56 34h6"/></g>`,
  },
  rootKey: {
    el: 'arcane',
    svg: `<circle cx="18" cy="22" r="14"/><circle cx="18" cy="22" r="5" fill="#16121f"/><path d="M28 30l28 28-6 5-4-4-4 4-4-4 4-4-4-4-4 4-4-4 4-4-10-10z"/>`,
  },
  ctrlZ: {
    el: 'steel',
    svg: `<rect x="6" y="8" width="52" height="48" rx="6"/><rect x="6" y="46" width="52" height="10" rx="4" fill="#16121f" opacity=".35"/><path d="M20 16h24v6L28 38h16v6H20v-6l16-16H20z" fill="#16121f"/>`,
  },
  harold: {
    el: 'steel',
    svg: `<circle cx="30" cy="28" r="22"/><g fill="#16121f"><rect x="18" y="22" width="6" height="5"/><rect x="36" y="22" width="6" height="5"/><path d="M15 17l11 3v-4l-10-3zM45 17l-11 3v-4l10-3z"/><path d="M18 34h24c0 7-5 11-12 11s-12-4-12-11z"/></g><rect x="20" y="35" width="20" height="4" fill="#fff" opacity=".7"/><path d="M48 44h12v14H48z"/><path d="M60 46c4 0 4 10 0 10" stroke="currentColor" stroke-width="3" fill="none"/>`,
  },
  scissors: {
    el: 'steel',
    svg: `<circle cx="14" cy="48" r="10"/><circle cx="14" cy="48" r="4" fill="#16121f"/><circle cx="50" cy="48" r="10"/><circle cx="50" cy="48" r="4" fill="#16121f"/><path d="M20 40L50 4l4 4-26 38zM44 40L14 4l-4 4 26 38z"/><path d="M2 28h14M48 28h14" stroke="currentColor" stroke-width="4" stroke-dasharray="4 4"/>`,
  },
  suitcase: {
    el: 'nature',
    svg: `<rect x="4" y="18" width="56" height="38" rx="4"/><path d="M22 18v-8h20v8h-5v-3H27v3z"/><g fill="#16121f"><rect x="16" y="18" width="5" height="38"/><rect x="43" y="18" width="5" height="38"/></g><circle cx="52" cy="10" r="6"/>`,
  },
  // Curses
  calendar: {
    el: 'curse',
    svg: `<rect x="6" y="10" width="52" height="48" rx="3"/><rect x="14" y="2" width="7" height="14"/><rect x="43" y="2" width="7" height="14"/><rect x="6" y="20" width="52" height="4" fill="#16121f"/><path d="M20 30l24 22M44 30L20 52" stroke="#16121f" stroke-width="6"/>`,
  },
  turnstile: {
    el: 'curse',
    svg: `<rect x="4" y="20" width="20" height="42"/><rect x="24" y="28" width="36" height="8"/><path d="M22 28l20-22 6 5-20 22z"/><rect x="8" y="26" width="12" height="8" fill="#16121f"/>`,
  },
  partyHat: {
    el: 'curse',
    svg: `<path d="M32 8L54 60H10z"/><circle cx="32" cy="7" r="6"/><g fill="#16121f"><path d="M25 24h14l3 8H22zM18 42h28l3 8H15z"/></g>`,
  },
  phishingEmail: {
    el: 'curse',
    svg: `<path d="M4 12h56v34H4z"/><path d="M4 14l28 22 28-22" fill="none" stroke="#16121f" stroke-width="4" stroke-linejoin="round"/><path d="M50 46v8a6 6 0 0 1-12 0v-3" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="38" cy="50" r="2.5"/>`,
  },
  tpsReport: {
    el: 'curse',
    svg: `<path d="M16 2h44v54H16z"/><path d="M3 8h44v54H3z" stroke="#16121f" stroke-width="4" stroke-linejoin="round"/><path d="M3 8h44v54H3z"/><rect x="8" y="13" width="34" height="11" fill="#16121f"/><path d="M12 18.5h10" stroke="#fff" stroke-width="4"/><path d="M8 32h34M8 39h34M8 46h20" stroke="#16121f" stroke-width="4"/><rect x="31" y="47" width="11" height="11" fill="#16121f"/><path d="M33 52l3 3 4-6" stroke="#fff" stroke-width="2.5" fill="none"/>`,
  },
  meeting: {
    el: 'curse',
    svg: `<ellipse cx="32" cy="38" rx="28" ry="12"/><circle cx="10" cy="18" r="7"/><circle cx="32" cy="11" r="7"/><circle cx="54" cy="18" r="7"/><rect x="28" y="48" width="8" height="14"/>`,
  },
  papersPlease: {
    el: 'curse',
    svg: `<circle cx="32" cy="9" r="8"/><rect x="26" y="15" width="12" height="16"/><rect x="10" y="30" width="44" height="10" rx="2"/><path d="M4 44h56v16H4z"/><path d="M12 50h40v4H12z" fill="#16121f"/><path d="M16 52h10M32 52h16" stroke="#fff" stroke-width="2"/>`,
  },
  dramaMask: {
    el: 'curse',
    svg: `<path d="M34 24h26v18c0 10-6 18-13 18s-11-6-13-12z"/><path d="M4 6h38v24c0 12-8 20-19 20S4 42 4 30z"/><g fill="#16121f"><path d="M10 16l9 4-9 4zM36 16l-9 4 9 4z"/><path d="M12 38c5-7 17-7 22 0-7-3-15-3-22 0z"/></g>`,
  },
  lips: {
    el: 'curse',
    svg: `<path d="M2 32c8-14 16-18 22-14 5-2 11-2 16 0 6-4 14 0 22 14-8 13-18 19-30 19S10 45 2 32z"/><path d="M6 32c12 5 40 5 52 0" stroke="#16121f" stroke-width="4" fill="none"/>`,
  },
  writeUp: {
    el: 'curse',
    svg: `<path d="M4 6h38v52H4z"/><g fill="#16121f"><rect x="10" y="14" width="26" height="4"/><rect x="10" y="24" width="26" height="4"/><rect x="10" y="34" width="16" height="4"/></g><path d="M38 54l18-36 6 3-18 36-7 3z"/>`,
  },

  pyramidScheme: {
    el: 'steel',
    svg: `<path d="M32 4l28 52H4z"/><path d="M11 47h42M20 28h24" stroke="#16121f" stroke-width="3.5"/><path d="M20 37q12-12 24 0q-12 12-24 0z" fill="#16121f"/><circle cx="32" cy="37" r="4.5"/>`,
  },
  goodVibesOnly: {
    el: 'steel',
    svg: `<circle cx="32" cy="32" r="19"/><path d="M32 2l5 11h-10zM32 62l-5-11h10zM2 32l11-5v10zM62 32l-11 5V27zM11 11l12 4-8 8zM53 53l-12-4 8-8zM53 11l-4 12-8-8zM11 53l4-12 8 8z"/><g fill="#16121f"><circle cx="25" cy="27" r="3.5"/><circle cx="39" cy="27" r="3.5"/><path d="M21 37q11 12 22 0z"/></g>`,
  },
  forkliftCertified: {
    el: 'steel',
    svg: `<rect x="4" y="6" width="56" height="40"/><path d="M12 16h40M12 25h40M12 34h22" stroke="#16121f" stroke-width="3.5"/><circle cx="46" cy="44" r="12"/><path d="M38 52l-4 11 12-5 12 5-4-11z"/><g fill="#16121f">${star4(46, 44, 7)}</g>`,
  },
  crunchTime: {
    el: 'arcane',
    svg: `<circle cx="14" cy="14" r="8"/><circle cx="50" cy="14" r="8"/><circle cx="32" cy="37" r="21"/><path d="M13 55l-5 7M51 55l5 7" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="37" r="15" fill="#16121f"/><path d="M32 37V26M32 37l8 5" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><rect x="30.5" y="24" width="3" height="3"/><rect x="43" y="35.5" width="3" height="3"/><rect x="30.5" y="48" width="3" height="3"/><rect x="18" y="35.5" width="3" height="3"/>`,
  },
  hotDesking: {
    el: 'fire',
    svg: `<rect x="12" y="4" width="40" height="30"/><rect x="29" y="34" width="6" height="8"/><rect x="4" y="42" width="56" height="6"/><rect x="8" y="48" width="6" height="14"/><rect x="50" y="48" width="6" height="14"/><path fill="#16121f" d="M32 9c2 6 9 8 9 15a9 9 0 0 1-18 0c0-4 3-7 5-9 0 3 1 5 3 5-1-4-1-8 1-11z"/>`,
  },
  forgottenLunch: {
    el: 'nature',
    svg: `<rect x="4" y="20" width="56" height="10"/><rect x="8" y="30" width="48" height="26"/><path d="M14 56v6M30 56v4M46 56v6" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><g fill="#16121f"><circle cx="20" cy="42" r="5"/><circle cx="34" cy="38" r="3.5"/><circle cx="44" cy="46" r="4.5"/></g><path d="M20 20c0-8 8-8 8-14M38 20c0-8 8-8 8-14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
  },
  sickDay: {
    el: 'steel',
    svg: `<rect x="24" y="4" width="16" height="42" rx="8"/><circle cx="32" cy="48" r="14"/><rect x="30" y="14" width="4" height="34" fill="#16121f"/><circle cx="32" cy="48" r="7" fill="#16121f"/><path d="M42 14h6M42 22h6M42 30h6" stroke="currentColor" stroke-width="3"/>`,
  },

  quickReboot: {
    el: 'arcane',
    svg: `<rect x="4" y="6" width="56" height="40"/><rect x="10" y="12" width="44" height="28" fill="#16121f"/><path d="M26 46h12l3 10H23z"/><rect x="16" y="56" width="32" height="5"/><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="square"><path d="M41 22a10 10 0 1 0 2 8"/><path d="M42 16v7h-7"/></g>`,
  },
  twoFactorAuth: {
    el: 'arcane',
    svg: `<rect x="16" y="4" width="32" height="56"/><rect x="21" y="11" width="22" height="36" fill="#16121f"/><path d="M25 21h14M25 29h14M25 37h8" stroke="currentColor" stroke-width="3.5"/><circle cx="32" cy="53" r="3" fill="#16121f"/>`,
  },
  cloudBackup: {
    el: 'arcane',
    svg: `<path d="M16 50a13 13 0 0 1 2-26 16 16 0 0 1 30-2 14 14 0 0 1 0 28z"/><path d="M32 46V28M24 35l8-8 8 8" fill="none" stroke="#16121f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  // ---- combo fillers (a debuff with Block, a status with a status)
  blueCollarBlues: {
    el: 'steel',
    svg: `<path d="M20 24a14 14 0 0 1 28 0" fill="none" stroke="currentColor" stroke-width="5"/><rect x="14" y="24" width="46" height="34" rx="4"/><rect x="14" y="36" width="46" height="5" fill="#16121f"/><rect x="33" y="31" width="8" height="14" fill="#16121f"/><path d="M2 30h8M0 40h8M2 50h8" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
  },
  inspectorGadget: {
    el: 'steel',
    svg: `<path d="M12 34c0-14 6-22 16-22s16 8 16 22z"/><path d="M2 38c0-4 12-6 26-6s26 2 26 6-12 8-26 8S2 42 2 38z"/><path fill="#16121f" d="M12 29h32v5H12z"/><circle cx="46" cy="44" r="10" fill="none" stroke="currentColor" stroke-width="5"/><path d="M53 51l8 9" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`,
  },
  holdMusic: {
    el: 'arcane',
    svg: `<path d="M6 28c0-12 12-18 26-18s26 6 26 18v10H46V28c0-4-6-8-14-8s-14 4-14 8v10H6z"/><rect x="4" y="32" width="18" height="16" rx="4"/><rect x="42" y="32" width="18" height="16" rx="4"/><path fill="#16121f" d="M30 58V44l10-3v11" stroke="#16121f" stroke-width="3"/><circle cx="27" cy="58" r="4" fill="#16121f"/><circle cx="37" cy="55" r="4" fill="#16121f"/>`,
  },
  fastTrack: {
    el: 'arcane',
    svg: `<path d="M4 14h56v12a6 6 0 0 0 0 12v12H4V38a6 6 0 0 0 0-12z"/><g fill="#16121f"><path d="M14 22l12 10-12 10zM28 22l12 10-12 10z"/><rect x="46" y="20" width="6" height="24"/></g>`,
  },
  bathroomBreak: {
    el: 'shadow',
    svg: `<rect x="10" y="4" width="44" height="56"/><rect x="16" y="10" width="32" height="44" fill="#16121f"/><circle cx="32" cy="21" r="5"/><path d="M26 28h12l3 14h-4l-1 10h-4l-1-8-1 8h-4l-1-10h-4z"/>`,
  },
  eyeRoll: {
    el: 'curse',
    svg: `<path d="M2 34C12 16 22 10 32 10s20 6 30 24C52 52 42 56 32 56S12 52 2 34z"/><circle cx="32" cy="24" r="13" fill="#16121f"/><circle cx="32" cy="22" r="5"/><path d="M6 24c8-8 16-11 26-11s18 3 26 11" fill="none" stroke="#16121f" stroke-width="3" stroke-linecap="round"/>`,
  },
  smokeBreak: {
    el: 'fire',
    svg: `<rect x="4" y="46" width="42" height="12"/><rect x="4" y="46" width="13" height="12" fill="#16121f" opacity=".45"/><rect x="46" y="46" width="10" height="12" fill="#16121f"/><g ${S} stroke-width="6"><path d="M52 40c-6-7 6-10 0-17s6-10 0-17M36 40c-6-7 6-10 0-17"/></g>`,
  },
  sedativeInTheCoffee: {
    el: 'necro',
    svg: `<path d="M6 26h38v18a14 14 0 0 1-14 14H20A14 14 0 0 1 6 44z"/><path d="M44 31h5a7 7 0 0 1 0 14h-5" fill="none" stroke="currentColor" stroke-width="5"/><path fill="#16121f" d="M10 30h30v4H10z"/><g transform="rotate(-30 28 14)"><rect x="12" y="8" width="32" height="13" rx="6.5"/><path fill="#16121f" d="M28 8h9a6.5 6.5 0 0 1 0 13h-9z"/></g>`,
  },
  spanishInquisition: {
    el: 'blood',
    svg: `<path d="M32 2l15 34H17z"/><rect x="12" y="34" width="40" height="26" rx="7"/><g fill="#16121f"><rect x="19" y="43" width="9" height="4"/><rect x="36" y="43" width="9" height="4"/><path d="M29 6h6v8h6v5h-6v8h-6v-8h-6v-5h6z" opacity=".5"/></g>`,
  },
  paperTrail: {
    el: 'steel',
    svg: `<path d="M12 4h30l10 10v46H12z"/><path fill="#16121f" opacity=".4" d="M42 4l10 10H42z"/><path d="M20 52c8-3 6-9 12-11s12-1 12-9-8-8-12-6-6-9-12-10" fill="none" stroke="#16121f" stroke-width="5" stroke-dasharray="7 5"/><circle cx="20" cy="52" r="4.5" fill="#16121f"/>`,
  },
  overclocked: {
    el: 'fire',
    svg: `<rect x="14" y="14" width="36" height="36"/><g stroke="currentColor" stroke-width="4"><path d="M22 4v10M32 4v10M42 4v10M22 50v10M32 50v10M42 50v10M4 22h10M4 32h10M4 42h10M50 22h10M50 32h10M50 42h10"/></g><rect x="21" y="21" width="22" height="22" fill="#16121f"/><path d="M34 22l-9 12h6l-3 9 11-13h-6z"/>`,
  },
  pettyCash: {
    el: 'holy',
    svg: `<path d="M6 32h52v26H6z"/><path d="M10 18h44l4 14H6z"/><rect x="28" y="30" width="8" height="10" fill="#16121f"/><circle cx="32" cy="9" r="8"/><circle cx="32" cy="9" r="4" fill="#16121f"/>`,
  },

  // ---- archetype fillers (strength, thorns, exhaust, rush, dodge, echo, ...)
  legDay: {
    el: 'steel',
    svg: `<rect x="2" y="12" width="60" height="6"/><rect x="6" y="4" width="8" height="22" rx="2"/><rect x="50" y="4" width="8" height="22" rx="2"/><path d="M18 24h12l-3 36H17zM34 24h12l1 36H37z"/><path fill="#16121f" d="M18 40h12M34 40h12" stroke="#16121f" stroke-width="3"/>`,
  },
  kickHimWhenHesDown: {
    el: 'steel',
    svg: `<path d="M10 4h22v26l22 8v16H6V30z"/><rect x="6" y="50" width="52" height="8" fill="#16121f"/><path d="M12 12h16" stroke="#16121f" stroke-width="3"/><path d="M56 24l6-4M58 34l5 0M54 14l4-6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
  },
  spontaneousCombustion: {
    el: 'fire',
    svg: `<path d="M32 4c10 14 18 24 18 34a18 18 0 0 1-36 0c0-10 8-20 18-34z"/><path fill="#16121f" d="M32 24c3 7 10 9 10 17a10 10 0 0 1-20 0c0-5 3-8 5-10 0 4 2 6 4 6-2-5-1-9 1-13z"/>`,
  },
  hrMediation: {
    el: 'necro',
    svg: `<path d="M4 6h34v22H18l-8 8v-8H4z"/><path d="M26 22h34v22h-6v8l-8-8H26z" fill="#16121f" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><g fill="#16121f"><rect x="19" y="10" width="4" height="10"/><rect x="19" y="22" width="4" height="4"/></g><g fill="currentColor"><circle cx="34" cy="33" r="2.5"/><circle cx="43" cy="33" r="2.5"/><circle cx="52" cy="33" r="2.5"/></g>`,
  },
  whistleblower: {
    el: 'steel',
    svg: `<circle cx="42" cy="38" r="18"/><path d="M4 26h30v14H12z"/><circle cx="42" cy="38" r="7" fill="#16121f"/><path d="M42 20c2-8 10-14 18-12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M6 8l8 6M4 16l8 3" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
  },
  lunchBreak: {
    el: 'nature',
    svg: `<path d="M4 28C4 16 16 8 32 8s28 8 28 20z"/><path d="M4 44h56v6a8 8 0 0 1-8 8H12a8 8 0 0 1-8-8z"/><path fill="#16121f" d="M4 32h56v6l-6 4-6-4-6 4-6-4-6 4-6-4-6 4-6-4z"/>`,
  },
  buyNowPayLater: {
    el: 'holy',
    svg: `<rect x="2" y="10" width="54" height="38" rx="4"/><rect x="2" y="18" width="54" height="8" fill="#16121f"/><rect x="8" y="34" width="14" height="8" fill="#16121f"/><circle cx="46" cy="44" r="16"/><circle cx="46" cy="44" r="11" fill="#16121f"/><path d="M46 36v9h7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
  },
  sparkJoy: {
    el: 'holy',
    svg: `${star4(30, 30, 28)}${star4(54, 54, 9)}${star4(10, 54, 7)}${star4(52, 10, 7)}`,
  },
  matador: {
    el: 'blood',
    svg: `<rect x="4" y="2" width="5" height="60"/><path d="M12 8c10 7 20-6 30 0s12 2 18 0v32c-6 2-8 6-18 0s-20 7-30 0z"/><path d="M24 14v26M36 12v28M48 14v24" stroke="#16121f" stroke-width="2.5" opacity=".45"/>`,
  },
  companyProperty: {
    el: 'steel',
    svg: `<path d="M6 12h34l18 20-18 20H6z"/><circle cx="16" cy="32" r="4.5" fill="#16121f"/><path d="M26 22v20M32 22v20M38 22v20" stroke="#16121f" stroke-width="3.5"/><path d="M29 22v20M35 22v20" stroke="currentColor" stroke-width="1.5"/>`,
  },
  officeShredder: {
    el: 'steel',
    svg: `<rect x="6" y="8" width="52" height="22" rx="3"/><rect x="12" y="16" width="40" height="5" fill="#16121f"/><path d="M12 32v26M21 32v20M30 32v28M39 32v18M48 32v24" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M24 2h16v8H24z"/>`,
  },
  recyclingDay: {
    el: 'nature',
    svg: `<rect x="6" y="8" width="52" height="8"/><rect x="24" y="2" width="16" height="7"/><path d="M12 18h40l-4 42H16z"/><path d="M32 28a9 9 0 1 0 9 8" fill="none" stroke="#16121f" stroke-width="4"/><path d="M42 26v11h-11" fill="none" stroke="#16121f" stroke-width="4" stroke-linejoin="round"/>`,
  },
  fleshWound: {
    el: 'blood',
    svg: `<g transform="rotate(-35 32 32)"><rect x="0" y="18" width="64" height="28" rx="14"/><rect x="21" y="18" width="22" height="28" fill="#16121f" opacity=".4"/><g fill="#16121f"><circle cx="9" cy="28" r="2"/><circle cx="9" cy="36" r="2"/><circle cx="55" cy="28" r="2"/><circle cx="55" cy="36" r="2"/><circle cx="16" cy="32" r="2"/><circle cx="48" cy="32" r="2"/></g></g>`,
  },
  cactusOnTheDesk: {
    el: 'nature',
    svg: `<rect x="25" y="4" width="14" height="46" rx="7"/><path d="M25 36H16a4 4 0 0 1-4-4V20h6v8h7zM39 30h9a4 4 0 0 0 4-4V14h-6v8h-7z"/><path d="M16 46h32l-4 14H20z"/><path d="M32 14v6M32 28v6M20 24v3M44 20v3" stroke="#16121f" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  pumpIron: {
    el: 'steel',
    svg: `<rect x="16" y="28" width="32" height="8"/><rect x="4" y="14" width="12" height="36" rx="3"/><rect x="48" y="14" width="12" height="36" rx="3"/><rect x="0" y="22" width="4" height="20"/><rect x="60" y="22" width="4" height="20"/><path d="M9 20v24M55 20v24" stroke="#16121f" stroke-width="2.5" opacity=".5"/>`,
  },
  speedrun: {
    el: 'arcane',
    svg: `<circle cx="32" cy="36" r="24"/><circle cx="32" cy="36" r="18" fill="#16121f"/><path d="M32 36V22M32 36l10 7" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><rect x="26" y="2" width="12" height="7"/><rect x="29" y="8" width="6" height="6"/><path d="M54 14l6-5" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
  },
  ghostInTheMachine: {
    el: 'arcane',
    svg: `<rect x="4" y="4" width="56" height="42"/><rect x="10" y="10" width="44" height="30" fill="#16121f"/><path d="M32 14c-7 0-11 5-11 11v13l4-3 3 3 4-3 4 3 3-3 4 3V25c0-6-4-11-11-11z"/><g fill="#16121f"><circle cx="28" cy="25" r="2.5"/><circle cx="36" cy="25" r="2.5"/></g><path d="M26 46h12l3 10H23z"/><rect x="16" y="56" width="32" height="5"/>`,
  },
  fidgetSpinner: {
    el: 'arcane',
    svg: `<path d="M32 32V12M32 32L14 42M32 32L50 42" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><circle cx="32" cy="32" r="10"/><circle cx="32" cy="12" r="10"/><circle cx="14" cy="42" r="10"/><circle cx="50" cy="42" r="10"/><g fill="#16121f"><circle cx="32" cy="32" r="4.5"/><circle cx="32" cy="12" r="4"/><circle cx="14" cy="42" r="4"/><circle cx="50" cy="42" r="4"/></g>`,
  },

  fireExit: {
    el: 'steel',
    svg: `<path d="M6 4h36v56H6z"/><path d="M12 10h24v44H12z" fill="#16121f"/><circle cx="24" cy="21" r="5"/><path d="M24 27v12M24 31l-8 4M24 31l8-3M24 39l-7 12M24 39l8 10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M46 24l16 10-16 10z"/>`,
  },
  lostBadge: {
    el: 'steel',
    svg: `<rect x="14" y="14" width="36" height="46"/><rect x="26" y="4" width="12" height="10"/><circle cx="32" cy="30" r="8" fill="#16121f"/><path d="M20 46h24M20 53h16" stroke="#16121f" stroke-width="4"/><path d="M28 28l8 4M36 28l-8 4" stroke="currentColor" stroke-width="3"/>`,
  },

  dressCode: {
    el: 'steel',
    svg: `<path d="M20 4h24l-4 12H24z"/><path d="M26 16h12l-2 6 6 28-10 12-10-12 6-28z"/><path d="M26 30h12M25 40h14" stroke="#16121f" stroke-width="3"/><path d="M12 4l12 12-6 6-12-12zM52 4L40 16l6 6 12-12z" fill="#16121f" opacity=".5"/>`,
  },
  skillIssue: {
    el: 'steel',
    svg: `<path d="M10 4h18v38h26v18H10z"/><path d="M18 12h2v26M18 50h30" stroke="#16121f" stroke-width="3" opacity=".5"/><g fill="#16121f"><circle cx="46" cy="18" r="9"/><rect x="41" y="25" width="10" height="5"/></g><g fill="currentColor"><circle cx="43" cy="17" r="2.2"/><circle cx="49" cy="17" r="2.2"/></g>`,
  },
  meetingTable: {
    el: 'steel',
    svg: `<rect x="4" y="26" width="56" height="12"/><rect x="10" y="38" width="6" height="22"/><rect x="48" y="38" width="6" height="22"/><circle cx="16" cy="14" r="7"/><circle cx="32" cy="14" r="7"/><circle cx="48" cy="14" r="7"/><path d="M6 44h8M50 44h8" stroke="#16121f" stroke-width="3"/>`,
  },
  grudgeLedger: {
    el: 'ice',
    svg: `<path d="M8 6h40a8 8 0 0 1 8 8v46H16a8 8 0 0 1-8-8z"/><path d="M8 52a8 8 0 0 1 8-8h40" fill="none" stroke="#16121f" stroke-width="3"/><g fill="none" stroke="#16121f" stroke-width="3.5" stroke-linecap="round"><path d="M32 14v22M22 18l20 14M22 32l20-14"/></g>`,
  },

  // ---- Rule icons: one concept each.
  overtime: {
    el: 'blood',
    svg: `<circle cx="28" cy="36" r="24"/><path d="M28 36V20M28 36h12" stroke="#16121f" stroke-width="5" fill="none"/><path d="M48 2h6v9h9v6h-9v9h-6v-9h-9v-6h9z"/>`,
  },
  thickSkin: {
    el: 'steel',
    svg: `<path d="M8 8h48v14H8zM8 26h48v14H8zM8 44h48v14H8z"/><g fill="#16121f"><rect x="13" y="13" width="5" height="4"/><rect x="46" y="13" width="5" height="4"/><rect x="13" y="31" width="5" height="4"/><rect x="46" y="31" width="5" height="4"/><rect x="13" y="49" width="5" height="4"/><rect x="46" y="49" width="5" height="4"/></g>`,
  },
  priceTag: {
    el: 'holy',
    svg: `<path d="M4 32L32 4h28v28L32 60z"/><circle cx="46" cy="18" r="6" fill="#16121f"/><path d="M18 40l14-14" stroke="#16121f" stroke-width="7"/>`,
  },
  zzz: { el: 'arcane', svg: `<path d="M4 34h24v7L15 53h13v7H4v-7l13-12H4zM32 6h28v7L45 29h15v7H32v-7l15-16H32z"/>` },
  stolenClock: {
    el: 'arcane',
    svg: `<path d="M32 6a26 26 0 1 0 26 26H32z"/><path d="M32 32V16M32 32H20" stroke="#16121f" stroke-width="5"/><path d="M38 2l24 24H38z"/>`,
  },
  wrench: { el: 'steel', svg: `<path d="M50 4a12 12 0 0 0-15 16L6 49l9 9 29-29A12 12 0 0 0 60 14l-8 8-7-7z"/>` },
  wrenchWhack: {
    el: 'steel',
    svg: `<path d="M48 0h3.2v3.2h-3.2zM57.6 0h3.2v3.2h-3.2zM54.4 3.2h3.2v3.2h-3.2zM25.6 6.4h16v3.2h-16zM25.6 9.6h16v3.2h-16zM25.6 12.8h16v3.2h-16zM48 12.8h9.6v3.2h-9.6zM25.6 16h16v3.2h-16zM48 16h9.6v3.2h-9.6zM25.6 19.2h32v3.2h-32zM22.4 22.4h35.2v3.2h-35.2zM22.4 25.6h32v3.2h-32zM22.4 28.8h25.6v3.2h-25.6zM22.4 32h12.8v3.2h-12.8zM19.2 35.2h12.8v3.2h-12.8zM16 38.4h12.8v3.2h-12.8zM12.8 41.6h12.8v3.2h-12.8zM9.6 44.8h12.8v3.2h-12.8zM6.4 48h12.8v3.2h-12.8zM3.2 51.2h12.8v3.2h-12.8zM3.2 54.4h9.6v3.2h-9.6z"/>`,
  },
  biohazard: {
    el: 'necro',
    svg: `<circle cx="32" cy="18" r="14"/><circle cx="17" cy="43" r="14"/><circle cx="47" cy="43" r="14"/><circle cx="32" cy="35" r="7" fill="#16121f"/><g fill="#16121f"><circle cx="32" cy="11" r="6"/><circle cx="11" cy="47" r="6"/><circle cx="53" cy="47" r="6"/></g>`,
  },
  stone: {
    el: 'steel',
    svg: `<path d="M6 52l6-26 16-18 20 6 10 22-6 18H12z"/><path d="M26 22l6 14-10 8M42 26l-4 12 12 6" stroke="#16121f" stroke-width="4" fill="none"/>`,
  },
  paperBin: {
    el: 'steel',
    svg: `<path d="M14 30h36l-4 30H18z"/><path fill="#16121f" d="M22 36h3v18h-3zM30 36h4v18h-4zM39 36h3v18h-3z"/><path d="M20 8l10-4 10 3 6 8-3 9H18l-4-8z"/><path fill="none" stroke="#16121f" stroke-width="2.4" d="M24 12l6 8M38 10l-4 8M18 22l12-2"/>`,
  },
  luggage: {
    el: 'steel',
    wide: true,
    svg: `<path d="M48 4h32v10h-6V10H54v4h-6z"/><rect x="4" y="14" width="120" height="46" rx="7"/><path fill="#16121f" d="M4 35h120v4H4zM16 24h14v8H16zM98 24h14v8H98z"/><rect x="58" y="32" width="12" height="12"/>`,
  },
  luggageOpen: {
    el: 'steel',
    wide: true,
    svg: `<path d="M48 0h32v8h-6V4H54v4h-6z"/><rect x="8" y="8" width="112" height="22" rx="6"/><path fill="#16121f" d="M8 18h112v3H8zM18 24h14v4H18zM96 24h14v4H96z"/><rect x="4" y="36" width="120" height="26" rx="7"/><path fill="#16121f" d="M12 40h104v7H12zM4 54h120v3H4z"/>`,
  },
  carryOn: {
    el: 'steel',
    wide: true,
    svg: `<path d="M50 14V3h28v11h-5V8H55v6z"/><rect x="6" y="14" width="116" height="40" rx="6"/><path fill="#16121f" d="M30 14h4v40h-4zM94 14h4v40h-4zM42 28h44v4H42z"/><circle cx="22" cy="58" r="5"/><circle cx="106" cy="58" r="5"/>`,
  },
  dutyFree: {
    el: 'steel',
    wide: true,
    svg: `<path d="M97 24V8h8v16zM23 24V14h8v10z"/><path d="M44 22v-9c0-6 6-10 12-10h16c6 0 12 4 12 10v9h-6v-9c0-2-3-4-6-4H56c-3 0-6 2-6 4v9z"/><path d="M12 22h104l-6 40H18z"/><rect x="40" y="32" width="48" height="16" fill="#16121f"/><rect x="46" y="36" width="36" height="3"/><rect x="46" y="42" width="24" height="3"/>`,
  },
  snowGlobe: {
    el: 'steel',
    wide: true,
    svg: `<g transform="translate(32 0)"><circle cx="32" cy="26" r="21"/><path fill="#16121f" d="M32 12l3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/></g><rect x="10" y="44" width="108" height="16" rx="3"/><path fill="#16121f" d="M16 50h96v3H16z"/><circle cx="14" cy="22" r="3"/><circle cx="26" cy="34" r="2.5"/><circle cx="108" cy="16" r="3"/><circle cx="116" cy="32" r="2.5"/><circle cx="98" cy="36" r="2"/>`,
  },
  down: { el: 'shadow', svg: `<path d="M32 60L8 34h14V4h20v30h14z"/>` },
  shutdown: {
    el: 'necro',
    svg: `<g ${S} stroke-width="9"><path d="M20 14a24 24 0 1 0 24 0"/></g><rect x="27" y="2" width="10" height="30" rx="3"/>`,
  },
  snatch: {
    el: 'steel',
    svg: `<rect x="32" y="2" width="24" height="32" rx="2" transform="rotate(15 44 18)"/><path d="M4 44c0-8 6-14 14-14h14l-6 8h12c4 0 6 2 6 6s-2 6-6 6H22l-6 10H4z"/>`,
  },
  speedCards: {
    el: 'arcane',
    svg: `<rect x="28" y="8" width="30" height="44" rx="3"/><g ${S} stroke-width="5.5"><path d="M4 18h18M10 30h14M4 42h18"/></g>`,
  },
  toolbox: {
    el: 'steel',
    svg: `<rect x="4" y="24" width="56" height="34" rx="3"/><path d="M20 24V12h24v12h-7v-5H27v5z"/><rect x="4" y="36" width="56" height="5" fill="#16121f"/><rect x="28" y="31" width="8" height="14" fill="#16121f"/>`,
  },
  rulebook: {
    el: 'curse',
    svg: `<path d="M4 8h24c2 0 4 2 4 4v48c0-2-2-4-4-4H4zM60 8H36c-2 0-4 2-4 4v48c0-2 2-4 4-4h24z"/><circle cx="46" cy="30" r="10" fill="#16121f"/><circle cx="46" cy="30" r="6"/><path d="M39 37l14-14" stroke="#16121f" stroke-width="4"/>`,
  },
  trash: {
    el: 'shadow',
    svg: `<path d="M14 18h36l-4 42H18z"/><rect x="8" y="10" width="48" height="6"/><rect x="26" y="3" width="12" height="7"/><g fill="#16121f"><rect x="23" y="24" width="4" height="30"/><rect x="37" y="24" width="4" height="30"/></g>`,
  },
  // Low HP condition ("below 30%"): a heart split in two.
  heartbreak: {
    el: 'blood',
    svg: `<path d="M30 56C8 41 3 27 10 17c6-9 16-8 20 0l-4 10 6 8-4 10 2 11zM34 56c23-15 28-29 21-39-6-9-16-8-20 0l-3 10 6 8-4 10z"/>`,
  },
  check: { el: 'holy', svg: `<path d="M4 34l10-10 12 12L50 12l10 10-34 34z"/>` },
  gauge: {
    el: 'steel',
    svg: `<path d="M4 46a28 28 0 0 1 56 0z"/><path d="M32 46l16-20" stroke="#16121f" stroke-width="5"/><circle cx="32" cy="46" r="5" fill="#16121f"/><rect x="4" y="48" width="56" height="7"/>`,
  },
  // A card tipping over the end of the belt and falling
  exitSlot: {
    el: 'shadow',
    svg: `<path d="M2 44h28v8H2z"/><g transform="rotate(35 30 44)"><rect x="10" y="12" width="24" height="32" rx="2"/><path fill="#16121f" d="M15 18h14v9H15z"/><path fill="#16121f" d="M15 32h9v4h-9z"/></g><path ${S} stroke-width="4" d="M44 30l4 8M54 34l3 6M46 50l3 7"/>`,
  },
  // A sheet with its corner burnt away: the card is spent (Exhaust).
  burntPaper: {
    el: 'shadow',
    svg: `<path fill-rule="evenodd" d="M10 4h22l-4 9 8 4-3 8 9 3 5 7v27H10zM17 34h30v4H17zM17 43h30v4H17zM17 52h22v4H17z"/><path d="M48 3c3 4 8 6 8 11a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3-1-3-1-5-1-7z"/>`,
  },
  // A light quill feather
  feather: {
    el: 'holy',
    svg: `<path d="M56 6C32 6 14 22 12 44L5 58l4 3 9-12c24-2 38-20 38-43z"/><g fill="none" stroke="#16121f" stroke-width="2.5" stroke-linecap="round"><path d="M9 57L46 18"/><path d="M30 33l-9-1M37 25l-9-2M24 41l-8-1M44 18l-8-2"/></g>`,
  },
  growth: {
    el: 'holy',
    svg: `<rect x="4" y="40" width="14" height="20"/><rect x="25" y="26" width="14" height="34"/><rect x="46" y="8" width="14" height="52"/>`,
  },
  ladder: { el: 'holy', svg: `<path d="M10 2h9v60h-9zM45 2h9v60h-9z"/><path d="M19 10h26v7H19zM19 25h26v7H19zM19 40h26v7H19zM19 55h26v7H19z"/>` },
  // ---- menu buttons
  play: { el: 'holy', svg: `<path d="M14 6l42 26-42 26z"/>` },
  pen: {
    el: 'holy',
    svg: `<path d="M44 4l16 16-26 26-16-16z"/><path fill="#16121f" d="M40 8l16 16-4 4-16-16z"/><path d="M18 30l16 16L4 60z"/><path d="M4 60l18-18" stroke="#16121f" stroke-width="3"/><circle cx="23" cy="41" r="3.5" fill="#16121f"/>`,
  },
  share: { el: 'holy', svg: `<path d="M24 40V18H12L32 0l20 18H40v22z"/><path d="M4 30h12v20h32V30h12v32H4z"/>` },
  // A plain cross, the sign of first aid (Regen).
  redCross: { el: 'blood', svg: `<path d="M22 4h20v18h18v20H42v18H22V42H4V22h18z"/><path ${HI} d="M26 8h8v14h-8z"/>` },
  plus: { el: 'holy', svg: `<path d="M25 6h14v19h19v14H39v19H25V39H6V25h19z"/>` },
  book: {
    el: 'holy',
    // A thick closed book: cover, a spine band and the page block, so it never reads as a pause sign.
    svg: `<path d="M10 8h36c4 0 6 2 6 6v40c0 4-2 6-6 6H14c-4 0-6-2-6-6V12c0-2 1-4 2-4z"/><path d="M14 50h38v8H14c-2 0-4-2-4-4s2-4 4-4z" fill="#fff" opacity=".85"/><g fill="#16121f"><rect x="18" y="8" width="5" height="42"/><rect x="28" y="18" width="18" height="4"/><rect x="28" y="26" width="12" height="4"/><rect x="14" y="52" width="36" height="2"/></g>`,
  },
  question: {
    el: 'holy',
    svg: `<path d="M14 22C14 11 22 4 32 4s18 7 18 16c0 9-6 12-10 15-3 2-3 4-3 9H26c0-8 2-12 7-16 4-3 6-4 6-8 0-3-3-5-7-5s-7 3-7 7z"/><rect x="25" y="49" width="13" height="12"/>`,
  },
  home: { el: 'holy', svg: `<path d="M32 4l28 26h-7v28H39V42H25v16H11V30H4z"/>` },
  door: {
    el: 'shadow',
    svg: `<path d="M10 4h34v56H10z"/><path fill="#16121f" d="M16 10h22v44H16z"/><path d="M16 10l20 6v44l-20-6z"/><path d="M40 28h10v-8l12 12-12 12v-8H40z"/>`,
  },
  bug: {
    el: 'shadow',
    svg: `<ellipse cx="32" cy="38" rx="14" ry="18"/><circle cx="32" cy="16" r="8"/><path d="M4 26h14v6H4zM46 26h14v6H46zM4 42h14v6H4zM46 42h14v6H46zM20 4l6 8-5 3-6-8zM44 4l-6 8 5 3 6-8z"/><path d="M31 22h2v34h-2z" fill="#16121f"/>`,
  },
  // ---- belt speed statuses, Pending tag
  stopwatch: {
    el: 'steel',
    svg: `<circle cx="34" cy="36" r="22"/><rect x="28" y="4" width="12" height="8"/><path d="M34 36V22" stroke="#16121f" stroke-width="6"/><path d="M34 36l9 7" stroke="#16121f" stroke-width="6"/><path d="M2 26h8v5H2zM0 38h8v5H0zM4 50h8v5H4z"/>`,
  },
  siren: {
    el: 'fire',
    svg: `<path d="M16 44a16 16 0 0 1 32 0z"/><rect x="8" y="46" width="48" height="10"/><path d="M29 4h6v10h-6zM8 14l5-4 7 8-5 4zM56 14l-5-4-7 8 5 4z"/><path fill="#16121f" d="M23 38a9 9 0 0 1 6-8v4a5 5 0 0 0-2 4z"/>`,
  },
  cone: {
    el: 'steel',
    svg: `<path d="M26 6h12l16 46H10z"/><path fill="#16121f" d="M22 20h20l3 9H19zM17 36h30l3 9H14z"/><rect x="4" y="52" width="56" height="8"/>`,
  },
  pending: {
    el: 'holy',
    svg: `<path d="M6 10h52v34H26L12 58V44H6z"/><circle cx="18" cy="27" r="4.5" fill="#16121f"/><circle cx="32" cy="27" r="4.5" fill="#16121f"/><circle cx="46" cy="27" r="4.5" fill="#16121f"/>`,
  },
  // ---- new cards (glyphs, slacking statuses, art)
  terminal: {
    el: 'arcane',
    svg: `<rect x="4" y="8" width="56" height="48" rx="3"/><g fill="#16121f"><path d="M12 20l12 9-12 9v-6l5-3-5-3z"/><rect x="28" y="36" width="16" height="5"/></g>`,
  },
  // Two arrows chasing each other: "every time" (a card face's `{*kind}` trigger).
  loop: {
    el: 'steel',
    svg: `<g ${S} stroke-width="8"><path d="M14.3 28.9A18 18 0 0 1 46.7 21.7"/><path d="M49.7 35.1A18 18 0 0 1 17.3 42.3"/></g><path d="M56 31L54.5 12.5L35.5 26z"/><path d="M8 33L9.5 51.5L28.5 38z"/>`,
  },
  undo: {
    el: 'steel',
    svg: `<g ${S} stroke-width="8"><path d="M20 22h20a16 16 0 0 1 0 32H22"/></g><path d="M4 22l18-16v32z"/>`,
  },
  magnifier: {
    el: 'steel',
    svg: `<circle cx="26" cy="26" r="20"/><circle cx="26" cy="26" r="12" fill="#16121f"/><path d="M40 36l20 18-7 7-18-20z"/><path ${HI} d="M18 20c2-4 6-6 10-6-3 2-5 5-6 9z"/>`,
  },
  coin: {
    el: 'holy',
    svg: `<rect x="8" y="44" width="48" height="14" rx="7"/><rect x="8" y="30" width="48" height="14" rx="7"/><ellipse cx="32" cy="22" rx="24" ry="12"/><g fill="#16121f"><rect x="8" y="42" width="48" height="3"/><rect x="8" y="28" width="48" height="3"/><rect x="26" y="18" width="12" height="7"/></g>`,
  },
  ko: {
    el: 'steel',
    svg: `<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"><path d="M32 32c0-4 6-4 6 0s-6 8-12 4-6-14 4-16 18 4 18 14-10 20-22 18-20-12-18-22"/></g><path d="M50 6l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z"/>`,
  },
  thoughtBubble: {
    el: 'arcane',
    svg: `<path d="M18 8h30c8 0 12 5 12 12v8c0 7-4 12-12 12H30l-10 8v-8h-2c-8 0-12-5-12-12v-8C6 13 10 8 18 8z"/><circle cx="12" cy="54" r="5"/><circle cx="4" cy="61" r="3"/><g fill="#16121f"><rect x="20" y="21" width="6" height="6"/><rect x="30" y="21" width="6" height="6"/><rect x="40" y="21" width="6" height="6"/></g>`,
  },
  autopilot: {
    el: 'steel',
    svg: `<path d="M28 4h8l2 8 7 3 7-4 6 6-4 7 3 7 8 2v8l-8 2-3 7 4 7-6 6-7-4-7 3-2 8h-8l-2-8-7-3-7 4-6-6 4-7-3-7-8-2v-8l8-2 3-7-4-7 6-6 7 4 7-3z"/><path d="M26 22l16 10-16 10z" fill="#16121f"/>`,
  },
  seesaw: {
    el: 'steel',
    svg: `<path d="M4 30l56-12 2 6-56 12z"/><path d="M32 30l-10 26h20z"/><rect x="6" y="18" width="12" height="12"/><rect x="46" y="8" width="12" height="10"/>`,
  },
  timer: {
    el: 'steel',
    svg: `<circle cx="32" cy="34" r="26"/><path fill="#16121f" d="M32 14a20 20 0 0 1 20 20H32z"/><rect x="26" y="2" width="12" height="6"/>`,
  },
  skip: {
    el: 'holy',
    svg: `<path d="M4 10l24 22L4 54zM28 10l24 22-24 22z"/><rect x="52" y="10" width="8" height="44"/>`,
  },
  copy: {
    el: 'holy',
    svg: `<rect x="4" y="4" width="36" height="42"/><rect x="10" y="10" width="24" height="30" fill="#16121f"/><rect x="22" y="18" width="38" height="44"/>`,
  },
  addCard: {
    el: 'holy',
    svg: `<rect x="6" y="4" width="34" height="48"/><path fill="#16121f" d="M12 10h22v36H12z"/><path d="M40 30h8v10h10v8H48v10h-8V48H30v-8h10z"/>`,
  },
  lane: {
    el: 'steel',
    svg: `<circle cx="32" cy="32" r="28"/><rect x="12" y="26" width="40" height="12" fill="#16121f"/>`,
  },
  battery: {
    el: 'steel',
    svg: `<rect x="4" y="16" width="50" height="32"/><rect x="54" y="26" width="8" height="12"/><rect x="10" y="22" width="38" height="20" fill="#16121f"/><rect x="12" y="24" width="10" height="16"/>`,
  },
  sun: {
    el: 'holy',
    svg: `<circle cx="32" cy="32" r="14"/><path d="M29 2h6v10h-6zM29 52h6v10h-6zM2 29h10v6H2zM52 29h10v6H52zM9 13l4-4 7 7-4 4zM44 48l4-4 7 7-4 4zM9 51l7-7 4 4-7 7zM44 16l7-7 4 4-7 7z"/>`,
  },
  rocket: {
    el: 'fire',
    svg: `<path d="M32 2c12 8 16 22 12 38H20C16 24 20 10 32 2z"/><circle cx="32" cy="22" r="5" fill="#16121f"/><path d="M20 30l-10 14v8l12-6zM44 30l10 14v8l-12-6z"/><path d="M24 44h16l-4 10h-8z"/><path d="M28 56h8l-4 8z"/>`,
  },
  resignation: {
    el: 'steel',
    svg: `<path d="M6 30h52v30H6z"/><path fill="#16121f" d="M6 30h52v6H6z"/><path d="M14 30V14h8v16zM26 30c0-10 4-18 12-22 2 8-2 16-6 22z"/><path d="M40 30c2-8 8-12 16-12-2 6-6 10-12 12z"/>`,
  },
  hammock: {
    el: 'nature',
    svg: `<rect x="4" y="6" width="6" height="54"/><rect x="54" y="6" width="6" height="54"/><path d="M8 20c8 22 40 22 48 0v8c-8 20-40 20-48 0z"/><circle cx="22" cy="24" r="6"/><path d="M28 26h18l-2 6H28z"/>`,
  },
  palm: {
    el: 'nature',
    svg: `<path d="M30 60c2-14 2-26 0-38h6c3 12 3 24 0 38z"/><path d="M32 22C24 10 12 10 4 16c10-2 18 0 24 8zM34 22c8-12 20-12 28-6-10-2-18 0-24 8zM33 20C30 8 22 2 14 4c8 2 14 8 16 16zM33 20c4-12 12-18 20-16-8 2-14 8-16 16z"/><rect x="4" y="58" width="56" height="6"/>`,
  },
  grind: {
    el: 'steel',
    svg: `<circle cx="32" cy="30" r="26"/><circle cx="32" cy="30" r="19" fill="#16121f"/><path d="M32 11v38M13 30h38M18 17l28 26M46 17L18 43" stroke="#fff" stroke-width="2"/><ellipse cx="32" cy="42" rx="10" ry="7"/><circle cx="40" cy="38" r="4"/><path d="M26 56h12v8H26z"/>`,
  },
  shrug: {
    el: 'holy',
    svg: `<circle cx="32" cy="16" r="10"/><path d="M18 30h28l-2 30H20z"/><path d="M18 32L6 24l-2-12 6 2 2 8 8 4zM46 32l12-8 2-12-6 2-2 8-8 4z"/>`,
  },
  forward: {
    el: 'arcane',
    svg: `<path d="M4 18h40v32H4z"/><path fill="#16121f" d="M8 22l16 12 16-12v4L24 38 8 26z"/><path d="M40 22l20 12-20 12v-7H30V29h10z"/>`,
  },
  followUp: {
    el: 'arcane',
    svg: `<path d="M32 4c-12 0-18 10-18 20v14l-8 10h52l-8-10V24C50 14 44 4 32 4z"/><path d="M24 52h16c0 6-4 10-8 10s-8-4-8-10z"/>`,
  },
  q1: {
    el: 'holy',
    svg: `<rect x="4" y="58" width="56" height="6"/><rect x="10" y="44" width="12" height="14"/>`,
  },
  q2: {
    el: 'holy',
    svg: `<rect x="4" y="58" width="56" height="6"/><rect x="10" y="44" width="12" height="14"/><rect x="26" y="34" width="12" height="24"/>`,
  },
  q3: {
    el: 'holy',
    svg: `<rect x="4" y="58" width="56" height="6"/><rect x="6" y="44" width="11" height="14"/><rect x="20" y="34" width="11" height="24"/><rect x="34" y="22" width="11" height="36"/>`,
  },
  q4: {
    el: 'holy',
    svg: `<rect x="4" y="58" width="56" height="6"/><rect x="4" y="44" width="10" height="14"/><rect x="17" y="34" width="10" height="24"/><rect x="30" y="24" width="10" height="34"/><rect x="43" y="12" width="10" height="46"/><path d="M40 2h22v22l-8-8-10 10-6-6 10-10z"/>`,
  },
  clipboardCopy: {
    el: 'arcane',
    svg: `<rect x="8" y="10" width="36" height="50"/><rect x="18" y="4" width="16" height="10"/><rect x="14" y="20" width="24" height="4" fill="#16121f"/><rect x="14" y="30" width="24" height="4" fill="#16121f"/><rect x="30" y="34" width="28" height="26"/><rect x="34" y="40" width="20" height="4" fill="#16121f"/><rect x="34" y="48" width="20" height="4" fill="#16121f"/>`,
  },
  doneStamp: {
    el: 'holy',
    svg: `<rect x="4" y="4" width="56" height="56"/><rect x="10" y="10" width="44" height="44" fill="#16121f"/><path d="M14 32l8-8 8 8 14-16 8 8-22 24z"/>`,
  },
  urgentFolder: {
    el: 'curse',
    svg: `<path d="M4 14h22l6 6h28v38H4z"/><rect x="28" y="26" width="8" height="18" fill="#16121f"/><rect x="28" y="48" width="8" height="6" fill="#16121f"/>`,
  },
  padlockGate: {
    el: 'curse',
    svg: `<path d="M16 28V18a16 16 0 0 1 32 0v10h-8V18a8 8 0 0 0-16 0v10z"/><rect x="8" y="28" width="48" height="32"/><circle cx="32" cy="40" r="5" fill="#16121f"/><rect x="30" y="42" width="4" height="10" fill="#16121f"/>`,
  },
  favour: {
    el: 'curse',
    svg: `<rect x="24" y="4" width="10" height="30"/><path d="M14 30h32c4 0 6 4 6 8v8c0 10-8 16-18 16h-4c-10 0-16-6-16-16z"/><path fill="#16121f" d="M24 38v8M32 38v8M40 38v8" stroke="#16121f" stroke-width="3"/>`,
  },
  pcLoadLetter: {
    el: 'curse',
    svg: `<rect x="8" y="3" width="26" height="14"/><rect x="2" y="17" width="44" height="26"/><rect x="9" y="43" width="30" height="17"/><rect x="7" y="23" width="22" height="10" fill="#16121f"/><path d="M10 28h6M20 28h6" stroke="#fff" stroke-width="3.5"/><path d="M14 51h20M14 56h12" stroke="#16121f" stroke-width="3.5"/><g transform="rotate(35 50 32)"><path d="M43 0h14c2 0 3 1 3 3v22l-3 30h-10l-4-30V3c0-2 1-3 0-3z" stroke="#16121f" stroke-width="4" stroke-linejoin="round"/><path d="M43 0h14c2 0 3 1 3 3v22l-3 30h-10l-4-30V3c0-2 1-3 0-3z"/></g>`,
  },
  plant: {
    el: 'nature',
    svg: `<path d="M16 40h32l-5 22H21z"/><rect x="12" y="36" width="40" height="6"/><path d="M31 36V20h3v16z"/><path d="M32 22C26 10 14 8 6 12c8 6 16 10 26 10zM33 18c4-10 14-16 24-14-4 8-12 14-24 14zM32 30c-6-6-14-6-20-2 6 4 12 4 20 2z"/>`,
  },
  pizza: {
    el: 'fire',
    svg: `<path d="M6 10c16-8 36-8 52 0L32 62z"/><path fill="#16121f" d="M8 14c16-6 32-6 48 0l-2 4c-14-6-30-6-44 0z"/><circle cx="24" cy="24" r="5" fill="#16121f"/><circle cx="40" cy="26" r="5" fill="#16121f"/><circle cx="32" cy="40" r="4" fill="#16121f"/>`,
  },
  // ---- Eight Hours, Oompa Loompa, Krusty Krab, It's-a Me, Tip Jar, Raise Denied, CC the Boss, Meal Voucher
  // An alarm clock at eight o'clock.
  eightHours: {
    el: 'steel',
    svg: `<circle cx="14" cy="14" r="9"/><circle cx="50" cy="14" r="9"/><circle cx="32" cy="37" r="24"/><path d="M14 54l-6 8M50 54l6 8" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="37" r="18" fill="#16121f"/><path d="M32 37V24M32 37l-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="32" cy="37" r="3"/>`,
  },
  // A smiling face under a bush of hair, in overalls.
  oompaLoompa: {
    el: 'nature',
    svg: `<circle cx="16" cy="16" r="9"/><circle cx="32" cy="10" r="10"/><circle cx="48" cy="16" r="9"/><circle cx="32" cy="34" r="21"/><path d="M6 64c2-9 12-12 26-12s24 3 26 12z"/><path d="M12 25Q32 15 52 25" stroke="#16121f" stroke-width="4" fill="none"/><circle cx="23" cy="33" r="4.5" fill="#16121f"/><circle cx="41" cy="33" r="4.5" fill="#16121f"/><path d="M18 41Q32 58 46 41z" fill="#16121f"/><path d="M24 54v10M40 54v10" stroke="#16121f" stroke-width="4"/>`,
  },
  // One worker on the march with a pickaxe.
  loompa: {
    el: 'nature',
    svg: `<circle cx="26" cy="15" r="9"/><circle cx="19" cy="7" r="5"/><circle cx="27" cy="4" r="5"/><circle cx="35" cy="7" r="5"/><path d="M16 26h20l2 22H14z"/><path d="M20 48l-6 14M32 48l8 14" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M36 30l14-10" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M54 6l-8 52" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M38 12Q54 2 62 18Q50 8 40 20z"/><circle cx="23" cy="15" r="2.5" fill="#16121f"/><circle cx="30" cy="15" r="2.5" fill="#16121f"/><path d="M16 38h20" stroke="#16121f" stroke-width="3"/>`,
  },
  // A Krabby Patty: sesame bun, lettuce, cheese, patty, bun.
  krustyKrab: {
    el: 'fire',
    svg: `<path d="M6 26C6 12 18 3 32 3s26 9 26 23z"/><g fill="#16121f"><ellipse cx="19" cy="14" rx="3.5" ry="2.3"/><ellipse cx="32" cy="9" rx="3.5" ry="2.3"/><ellipse cx="45" cy="14" rx="3.5" ry="2.3"/><ellipse cx="25" cy="21" rx="3.5" ry="2.3"/><ellipse cx="39" cy="21" rx="3.5" ry="2.3"/></g><path d="M4 29h56v3c-3 6-7 6-10 0-3 6-7 6-10 0-3 6-7 6-10 0-3 6-7 6-10 0-3 6-7 6-10 0-3 6-7 6-10 0z"/><rect x="6" y="41" width="52" height="10" rx="5"/><path d="M6 55h52c0 6-4 8-8 8H14c-4 0-8-2-8-8z"/>`,
  },
  // A spotted mushroom with eyes.
  mushroom: {
    el: 'nature',
    svg: `<path d="M3 34C3 14 16 3 32 3s29 11 29 31z"/><circle cx="32" cy="15" r="7" fill="#16121f"/><circle cx="12" cy="28" r="6" fill="#16121f"/><circle cx="52" cy="28" r="6" fill="#16121f"/><path d="M15 38h34v10c0 9-7 15-17 15S15 57 15 48z"/><ellipse cx="25" cy="47" rx="3.5" ry="6" fill="#16121f"/><ellipse cx="39" cy="47" rx="3.5" ry="6" fill="#16121f"/>`,
  },
  // A glass jar of coins with one more on its way in.
  tipJar: {
    el: 'holy',
    svg: `<circle cx="32" cy="6" r="6"/><rect x="12" y="16" width="40" height="8" rx="2"/><path d="M10 28h44v26a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8z"/><path d="M16 33h32v20a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" fill="#16121f"/><circle cx="25" cy="51" r="6"/><circle cx="39" cy="51" r="6"/><circle cx="32" cy="41" r="6"/>`,
  },
  // A rise, with the ban sign through it.
  raiseDenied: {
    el: 'blood',
    svg: `<path d="M32 4l26 28H42v28H22V32H6z"/><path d="M8 6L56 58" stroke="#16121f" stroke-width="11" stroke-linecap="round"/><path d="M8 6L56 58" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
  },
  // An envelope marked CC.
  ccTheBoss: {
    el: 'shadow',
    svg: `<rect x="4" y="10" width="56" height="46"/><path d="M4 12L32 34L60 12" stroke="#16121f" stroke-width="4" fill="none"/><path d="M28 42A6.5 6.5 0 1 0 28 52M44 42A6.5 6.5 0 1 0 44 52" stroke="#16121f" stroke-width="4" fill="none"/>`,
  },
  // A meal ticket with notched sides, a perforated stub, a fork and a knife.
  mealVoucher: {
    el: 'curse',
    svg: `<rect x="4" y="10" width="56" height="44"/><circle cx="4" cy="32" r="6" fill="#16121f"/><circle cx="60" cy="32" r="6" fill="#16121f"/><path d="M20 12v6M20 24v6M20 36v6M20 48v4" stroke="#16121f" stroke-width="3"/><g fill="#16121f"><rect x="25" y="16" width="3.5" height="13"/><rect x="31" y="16" width="3.5" height="13"/><rect x="37" y="16" width="3.5" height="13"/><rect x="25" y="27" width="15.5" height="5"/><rect x="30" y="31" width="5.5" height="19"/><path d="M45 16q9 5 5 21h-5z"/><rect x="45" y="36" width="5" height="14"/></g>`,
  },
  // Large: one card as wide as two.
  large: {
    el: 'steel',
    svg: `<rect x="2" y="16" width="60" height="32"/><path d="M8 32l11-10v6h26v-6l11 10-11 10v-6H19v6z" fill="#16121f"/>`,
  },
  // Max HP up: a heart with an arrow.
  heartUp: {
    el: 'nature',
    svg: `<g transform="translate(-3 0) scale(.95)">${heart}</g><g transform="translate(0 -3)"><path d="M48 30l14 16h-8v16H42V46h-8z" fill="#16121f" stroke="#16121f" stroke-width="6" stroke-linejoin="round"/><path d="M48 30l14 16h-8v16H42V46h-8z"/></g>`,
  },
  // A heart gone half dark: what a hero does when HP drops below half (Forklift Certified).
  halfHeart: {
    el: 'steel',
    svg: `${heart}<clipPath id="hh"><rect x="0" y="0" width="64" height="34"/></clipPath><g clip-path="url(#hh)"><path fill="#16121f" opacity=".6" d="M32 56C9 41 4 27 11 17c7-10 18-8 21 1 3-9 14-11 21-1 7 10 2 24-21 39z"/></g><path d="M4 34h56" stroke="#16121f" stroke-width="3"/>`,
  },
  // The clock behind Eight Hours: a wall clock at eight.
  shiftClock: {
    el: 'steel',
    svg: `<circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="21" fill="#16121f"/><path d="M32 32V16M32 32l-11 11" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="32" cy="32" r="4"/>`,
  },
  // ---- locked content
  lock: {
    el: 'steel',
    svg: `<path d="M18 30V20a14 14 0 0 1 28 0v10h-7V20a7 7 0 0 0-14 0v10z"/><rect x="10" y="30" width="44" height="30"/><circle cx="32" cy="42" r="5" fill="#16121f"/><path d="M29 44h6l2 10H27z" fill="#16121f"/>`,
  },
  // ---- act 2 rules (intents, enemy passives, Blackout, Inflation)
  dots: {
    el: 'shadow',
    svg: `<rect x="4" y="26" width="14" height="14"/><rect x="25" y="26" width="14" height="14"/><rect x="46" y="26" width="14" height="14"/>`,
  },
  runner: {
    el: 'nature',
    svg: `<circle cx="44" cy="9" r="7"/><path d="M30 18h12l10 12-6 5-7-7-4 7 10 8-2 15h-9l2-11-10-8-6 12-6-4 10-19z"/><path d="M2 58h22v4H2z"/>`,
  },
  coinStack: {
    el: 'holy',
    svg: `<path d="M8 44v8c0 5 11 8 24 8s24-3 24-8v-8z"/><ellipse cx="32" cy="44" rx="24" ry="8"/><path d="M8 32v8c0 5 11 8 24 8s24-3 24-8v-8z"/><ellipse cx="32" cy="32" rx="24" ry="8"/><path d="M8 20v8c0 5 11 8 24 8s24-3 24-8v-8z"/><ellipse cx="32" cy="20" rx="24" ry="8"/><path d="M8 44c0 4 11 8 24 8s24-4 24-8M8 32c0 4 11 8 24 8s24-4 24-8M8 20c0 4 11 8 24 8s24-4 24-8" stroke="#16121f" stroke-width="3" fill="none"/>`,
  },
  unpaidBill: {
    el: 'curse',
    svg: `<path d="M10 4h44v56l-7-5-7 5-8-5-8 5-7-5-7 5z"/><path fill="#16121f" d="M18 14h28v4H18zM18 24h28v4H18zM18 34h16v4H18z"/><path fill="#16121f" d="M38 34h8v8h-8z"/>`,
  },
  pushpin: {
    el: 'steel',
    svg: `<path d="M20 4h24l-5 5v13l11 13H14l11-13V9z"/><rect x="30" y="36" width="4" height="24"/>`,
  },
  medal: {
    el: 'holy',
    svg: `<path d="M16 38l-10 22 12-5 7 7 8-26zM48 38l10 22-12-5-7 7-8-26z"/><circle cx="32" cy="24" r="20"/><circle cx="32" cy="24" r="13" fill="#16121f"/>${star4(32, 24, 10)}`,
  },
  mrBurnsEmpire: {
    el: 'holy',
    svg: `<path d="M2 62C10 52 14 42 14 32 14 24 12 20 10 16H42C40 20 38 24 38 32 38 42 42 52 50 62z"/><rect x="52" y="14" width="10" height="48"/><path d="M52 24h10M52 34h10" stroke="#16121f" stroke-width="3"/><path d="M33 33c-2-5-14-5-14 1 0 6 14 4 14 10 0 5-12 6-15 1M26 28v24" stroke="#16121f" stroke-width="4.5" fill="none"/><circle cx="18" cy="8" r="7"/><circle cx="30" cy="5" r="6"/><circle cx="57" cy="7" r="5"/>`,
  },
  huddle: {
    el: 'nature',
    svg: `<circle cx="18" cy="12" r="8"/><path d="M6 32a12 12 0 0 1 24 0v12H6z"/><circle cx="46" cy="12" r="8"/><path d="M34 32a12 12 0 0 1 24 0v12H34z"/><path d="M6 52h36v-5l14 8-14 8v-5H6z"/>`,
  },
  crystalUp: {
    el: 'arcane',
    svg: `<path d="M24 14l14 16-14 34-14-34z"/><path fill="#16121f" d="M24 26l7 8-7 18-7-18z"/><path d="M50 4l12 14H54v14H46V18h-8z"/>`,
  },
  stakhanov: {
    el: 'blood',
    svg: `<path d="M8 38C8 18 18 6 32 6s24 12 24 32z"/><rect x="4" y="34" width="56" height="14" rx="7"/><path d="M4 46h14v8a7 7 0 0 1-14 0zM46 46h14v8a7 7 0 0 1-14 0z"/><path d="M6 37h52" stroke="#16121f" stroke-width="3"/><path d="M8 43h5M17 43h5M27 43h5M37 43h5M47 43h5" stroke="#16121f" stroke-width="3.5"/><path fill="#16121f" d="M32 9l4.5 9.5 10 1.3-7.4 7 1.9 10L32 32l-9 4.8 1.9-10-7.4-7 10-1.3z" transform="translate(0 0) scale(1 .9) translate(0 1)"/>`,
  },
  brownNose: {
    el: 'curse',
    svg: `<path d="M26 4h12v26c10 2 18 8 18 18 0 6-6 10-12 10-5 0-8-3-12-3s-7 3-12 3c-6 0-12-4-12-10 0-10 8-16 18-18z"/><ellipse cx="22" cy="48" rx="4" ry="5" fill="#16121f"/><ellipse cx="42" cy="48" rx="4" ry="5" fill="#16121f"/><path ${HI} d="M29 8h3v20h-3z"/>`,
  },
  uTurn: {
    el: 'arcane',
    svg: `<path d="M4 20l16-14v9h40v10H20v9z"/><path d="M60 44L44 58v-9H4V39h40v-9z"/>`,
  },
  paperCut: {
    el: 'blood',
    svg: `<path d="M10 4h30l14 14v42H10z"/><path fill="#16121f" d="M40 4v14h14z"/><path d="M4 44l56-14" stroke="#16121f" stroke-width="6"/>`,
  },
  pile: {
    el: 'holy',
    svg: `<rect x="4" y="32" width="28" height="28"/><rect x="11" y="20" width="31" height="33" fill="#16121f"/><rect x="14" y="23" width="25" height="27"/><rect x="22" y="5" width="35" height="38" fill="#16121f"/><rect x="25" y="8" width="29" height="32"/>`,
  },
  fordism: {
    el: 'holy',
    svg: `<rect x="10" y="10" width="32" height="4"/><path d="M14 36V14h24v22z"/><rect x="18" y="18" width="16" height="12" fill="#16121f"/><rect x="6" y="36" width="52" height="14" rx="2"/><path d="M38 24h14v12H38z"/><circle cx="18" cy="50" r="8"/><circle cx="48" cy="50" r="8"/><circle cx="18" cy="50" r="3" fill="#16121f"/><circle cx="48" cy="50" r="3" fill="#16121f"/><rect x="2" y="59" width="60" height="4"/>`,
  },
  scanner: {
    el: 'arcane',
    svg: `<rect x="4" y="30" width="56" height="26"/><rect x="10" y="36" width="44" height="6" fill="#16121f"/><path d="M4 26l8-18h40l8 18z"/><rect x="2" y="44" width="60" height="4"/>`,
  },
  ruler: {
    el: 'steel',
    svg: `<rect x="-6" y="24" width="76" height="18" transform="rotate(-35 32 32)"/><g transform="rotate(-35 32 32)" fill="#16121f"><rect x="2" y="24" width="3" height="8"/><rect x="12" y="24" width="3" height="5"/><rect x="22" y="24" width="3" height="8"/><rect x="32" y="24" width="3" height="5"/><rect x="42" y="24" width="3" height="8"/><rect x="52" y="24" width="3" height="5"/></g>`,
  },
  lotus: {
    el: 'nature',
    svg: `<circle cx="32" cy="12" r="9"/><path d="M22 24h20l6 24H16z"/><ellipse cx="32" cy="50" rx="28" ry="9"/><path d="M22 28L8 44l6 4 12-14zM42 28l14 16-6 4-12-14z"/>`,
  },
  calculator: {
    el: 'steel',
    svg: `<rect x="10" y="4" width="44" height="56"/><rect x="16" y="10" width="32" height="12" fill="#16121f"/><g fill="#16121f"><rect x="16" y="28" width="8" height="7"/><rect x="28" y="28" width="8" height="7"/><rect x="40" y="28" width="8" height="7"/><rect x="16" y="39" width="8" height="7"/><rect x="28" y="39" width="8" height="7"/><rect x="40" y="39" width="8" height="18"/><rect x="16" y="50" width="20" height="7"/></g>`,
  },
  watchEye: {
    el: 'arcane',
    svg: `<path d="M2 32C12 14 22 8 32 8s20 6 30 24C52 50 42 56 32 56S12 50 2 32z"/><circle cx="32" cy="32" r="14" fill="#16121f"/><circle cx="32" cy="32" r="7"/><circle cx="32" cy="32" r="3" fill="#16121f"/>`,
  },
  bulbOff: {
    el: 'shadow',
    svg: `<path d="M32 4c12 0 20 8 20 20 0 8-4 12-8 16v8H20v-8c-4-4-8-8-8-16 0-12 8-20 20-20z"/><path d="M26 24l12 12M38 24L26 36" stroke="#16121f" stroke-width="5"/><rect x="20" y="50" width="24" height="5"/><rect x="24" y="57" width="16" height="5"/>`,
  },
  inflation: {
    el: 'holy',
    svg: `<circle cx="24" cy="38" r="20"/><path d="M20 30h10v5h-6v2h6v11H20v-5h6v-2h-6z" fill="#16121f"/><path d="M44 4h16v16l-5-5-8 8-6-6 8-8z"/>`,
  },
  // Class fillers
  releaseTheHounds: {
    el: 'blood',
    svg: `<path d="M2 62L6 32 2 4l22 12 14-2 12 8 11 6 2 6-6 4H34l-4 4 24 8v8l-14 2-8-4-2 10z"/><path d="M34 40h22l-4 9-14-2z" fill="#16121f"/><path d="M40 40l3 6 3-6M49 40l2 5 2-5" fill="#fff"/><circle cx="37" cy="26" r="3.5" fill="#16121f"/><path d="M29 20l12 4" stroke="#16121f" stroke-width="3.5"/><circle cx="59" cy="33" r="2.5" fill="#16121f"/><path d="M8 36C10 24 16 19 25 18" stroke="#16121f" stroke-width="3.5" fill="none"/><path d="M3 52h26" stroke="#16121f" stroke-width="4"/><path d="M8 50v-5M15 50v-5M22 50v-5" stroke="#fff" stroke-width="3"/>`,
  },
  barbedWire: {
    el: 'steel',
    svg: `<rect x="2" y="29" width="60" height="6"/><g ${S} stroke-width="5"><path d="M6 20l14 24M20 20L6 44M26 20l14 24M40 20L26 44M46 20l14 24M60 20L46 44"/></g>`,
  },
  blowOffSteam: {
    el: 'steel',
    svg: `<rect x="4" y="46" width="56" height="12"/><rect x="28" y="28" width="8" height="20"/><ellipse cx="32" cy="26" rx="20" ry="6"/><circle cx="18" cy="10" r="7"/><circle cx="32" cy="6" r="7"/><circle cx="46" cy="10" r="7"/>`,
  },
  steelToes: {
    el: 'steel',
    svg: `<path d="M12 4h24v26c0 4 6 7 12 8 8 2 14 6 14 14v2H12z"/><path d="M16 12h16M16 20h16" stroke="#16121f" stroke-width="3"/><path fill="#16121f" d="M40 38c8 2 18 4 20 10v4H40z"/><rect x="10" y="52" width="54" height="8" fill="#16121f" opacity=".6"/>`,
  },
  overstock: {
    el: 'steel',
    svg: `<rect x="4" y="54" width="56" height="8"/><rect x="6" y="32" width="24" height="20"/><rect x="34" y="32" width="24" height="20"/><rect x="18" y="8" width="28" height="22"/><path d="M18 19h28M18 41h12M34 41h24" stroke="#16121f" stroke-width="3"/>`,
  },
  nigerianPrince: {
    el: 'arcane',
    svg: `<path d="M12 24L8 6l14 10L32 2l10 14L56 6l-4 18z"/><circle cx="32" cy="14" r="3" fill="#16121f"/><rect x="4" y="30" width="56" height="30"/><path d="M4 31l28 20 28-20" stroke="#16121f" stroke-width="4.5" fill="none"/>`,
  },
  thermalShock: {
    el: 'ice',
    svg: `<rect x="24" y="4" width="16" height="42" rx="8"/><circle cx="32" cy="48" r="13"/><rect x="29" y="14" width="6" height="30" fill="#16121f"/><circle cx="32" cy="48" r="7" fill="#16121f"/><path d="M46 12h10M46 22h6M46 32h10M8 12h10M12 22h6M8 32h10" stroke="currentColor" stroke-width="3"/><path d="M40 2l-6 12 6-3-2 12 8-14-6 2z" fill="#fff"/>`,
  },
  yogurt: {
    el: 'necro',
    svg: `<path d="M10 22h44l-6 36H16z"/><rect x="8" y="14" width="48" height="8"/><path d="M40 14c4-8 14-10 18-6-6 0-10 2-12 6z"/><path fill="#16121f" opacity=".45" d="M16 30h32l-2 16H18z"/><circle cx="26" cy="38" r="3" fill="#16121f"/><circle cx="36" cy="42" r="2.5" fill="#16121f"/><circle cx="40" cy="35" r="2" fill="#16121f"/>`,
  },
  rugPull: {
    el: 'blood',
    svg: `<circle cx="36" cy="8" r="7"/><path d="M34 17l-5 14" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M29 32l20-9M31 34l22 7M33 21L16 20" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M16 46h44l4 14H20z"/><path d="M32 46l-4 14M46 46l-4 14" stroke="#16121f" stroke-width="3.5"/><circle cx="9" cy="53" r="7"/><circle cx="9" cy="53" r="2.5" fill="#16121f"/>`,
  },
  petriDish: {
    el: 'necro',
    svg: `<ellipse cx="32" cy="36" rx="29" ry="23"/><ellipse cx="32" cy="36" rx="22" ry="16" fill="#16121f"/><circle cx="24" cy="32" r="4"/><circle cx="39" cy="29" r="3"/><circle cx="35" cy="42" r="5"/><circle cx="22" cy="44" r="2.5"/>`,
  },
  gasMask: {
    el: 'necro',
    svg: `<path d="M12 8h40v22c0 14-8 24-20 24S12 44 12 30z"/><circle cx="22" cy="26" r="8" fill="#16121f"/><circle cx="42" cy="26" r="8" fill="#16121f"/><circle cx="20" cy="23" r="2.5"/><circle cx="40" cy="23" r="2.5"/><rect x="25" y="44" width="14" height="16" rx="3"/><path d="M27 49h10M27 54h10" stroke="#16121f" stroke-width="2"/>`,
  },
  healthPlan: {
    el: 'holy',
    svg: `<rect x="6" y="18" width="52" height="40" rx="4"/><path d="M22 18v-8h20v8" stroke="currentColor" stroke-width="5" fill="none"/><path fill="#16121f" d="M28 26h8v8h8v8h-8v8h-8v-8h-8v-8h8z"/>`,
  },
  sisyphus: {
    el: 'necro',
    svg: `<path d="M2 58L62 38" ${S} stroke-width="6"/><circle cx="46" cy="22" r="17" stroke="#16121f" stroke-width="4"/><circle cx="46" cy="22" r="17"/><path d="M38 14l6 4-2 6M52 28l4 5M40 32l6-3" stroke="#16121f" stroke-width="3" fill="none"/><g ${S} stroke-width="6"><path d="M17 27l2 15M18 31l11-1M19 42L9 52M19 42l8 7"/></g><circle cx="16" cy="19" r="6.5"/>`,
  },
  // Rooms and statuses
  shredder: {
    el: 'steel',
    svg: `<path d="M20 2h24v14H20z"/><rect x="6" y="14" width="52" height="16"/><rect x="12" y="20" width="40" height="4" fill="#16121f"/><path d="M10 30h44v24H10z"/><path d="M14 54h4v8h-4zM22 54h4v6h-4zM30 54h4v8h-4zM38 54h4v6h-4zM46 54h4v8h-4z"/>`,
  },
  parachute: {
    el: 'holy',
    svg: `<path d="M4 30C4 14 16 4 32 4s28 10 28 26c-6-6-10-6-14 0-4-6-10-6-14 0-4-6-10-6-14 0-4-6-8-6-14 0z"/><g ${S} stroke-width="3"><path d="M10 32l20 20M54 32L34 52M32 30v22"/></g><rect x="26" y="50" width="12" height="11"/>`,
  },
  // ---- rooms
  tailor: {
    el: 'holy',
    svg: `<path d="M24 11c0 4 4 7 8 7s8-3 8-7l14 7 4 15-10 3v22H16V36L6 33l4-15z"/><path fill="#16121f" opacity=".35" d="M29 18h6v38h-6z"/><rect x="29" y="56" width="6" height="6"/><path d="M32 2v6" stroke="currentColor" stroke-width="4"/>`,
  },
  lostBox: {
    el: 'holy',
    svg: `<path d="M2 22h60v38H2z"/><path d="M2 22l8-14h44l8 14z"/><path fill="#16121f" opacity=".35" d="M26 8h12v14H26z"/><rect x="18" y="32" width="28" height="16" fill="#16121f"/><path d="M26 36h12v3h-12zM26 42h8v3h-8z" fill="#fff" opacity=".7"/>`,
  },
  vendingMachine: {
    el: 'steel',
    svg: `<rect x="8" y="2" width="48" height="60" rx="2"/><rect x="13" y="8" width="26" height="36" fill="#16121f"/><path fill="#fff" opacity=".75" d="M16 12h8v8h-8zM28 12h8v8h-8zM16 25h8v8h-8zM28 25h8v8h-8zM16 36h20v5H16z"/><rect x="43" y="10" width="8" height="6" fill="#16121f"/><rect x="43" y="22" width="8" height="4" fill="#16121f"/><rect x="43" y="30" width="8" height="4" fill="#16121f"/><rect x="13" y="49" width="38" height="9" fill="#16121f"/>`,
  },
  // ---- act 3 rules
  sleepMask: {
    el: 'shadow',
    svg: `<path d="M4 26c6-10 18-12 28-4 10-8 22-6 28 4 3 12-2 22-13 24-6 1-11-2-15-7-4 5-9 8-15 7C6 48 1 38 4 26z"/><path d="M14 34q6 6 13 0M37 34q6 6 13 0" fill="none" stroke="#16121f" stroke-width="3.5" stroke-linecap="round"/><path d="M44 4h12l-12 12h12" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  funnel: {
    el: 'steel',
    svg: `<path d="M3 6h58L39 32v22l-14 6V32z"/><path ${HI} d="M8 10h24L22 24z"/><path fill="#16121f" opacity=".4" d="M25 40h14v4H25z"/>`,
  },
  /** The big knob that turns a dead belt by hand: a toothed rim around a flat face, a dark pointer to show how far it has turned. */
  crank: {
    el: 'steel',
    svg: `<rect x="28" y="2" width="8" height="10" transform="rotate(0 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(30 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(60 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(90 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(120 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(150 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(180 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(210 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(240 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(270 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(300 32 32)"/><rect x="28" y="2" width="8" height="10" transform="rotate(330 32 32)"/><circle cx="32" cy="32" r="25"/><circle cx="32" cy="32" r="18" fill="none" stroke="#16121f" stroke-width="3"/><path fill="#16121f" d="M29 9h6v22h-6z"/><circle cx="32" cy="32" r="5" fill="#16121f"/>`,
  },
  // VIP Treatment: a velvet rope between two posts.
  vipRope: {
    el: 'steel',
    svg: `<circle cx="14" cy="10" r="7"/><circle cx="50" cy="10" r="7"/><rect x="11" y="16" width="6" height="40"/><rect x="47" y="16" width="6" height="40"/><rect x="6" y="54" width="16" height="6" rx="2"/><rect x="42" y="54" width="16" height="6" rx="2"/><path fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" d="M17 24c10 14 20 14 30 0"/>`,
  },
  conveyorLine: {
    el: 'steel',
    svg: `<path d="M4 44h56v10H4z"/><g fill="#16121f"><circle cx="12" cy="49" r="3"/><circle cx="26" cy="49" r="3"/><circle cx="40" cy="49" r="3"/><circle cx="54" cy="49" r="3"/></g><rect x="6" y="24" width="16" height="18"/><rect x="28" y="30" width="14" height="12"/><path d="M46 20h8v-6l10 10-10 10v-6h-8z"/>`,
  },
  update: {
    el: 'arcane',
    svg: `<path d="M4 6h56v52H4z"/><path fill="#16121f" d="M4 19h56v4H4z"/><path fill="#16121f" d="M9 10h6v5H9zM19 10h6v5h-6z"/><path fill="#16121f" d="M29 27h6v10h11L32 53 18 37h11z"/>`,
  },
  creepClock: {
    el: 'shadow',
    svg: `<circle cx="28" cy="38" r="24"/><circle cx="28" cy="38" r="17" fill="#16121f" opacity=".5"/><path d="M28 26v13l9 5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 4l10 12h-6v12h-8V16h-6z"/>`,
  },
  lowBattery: {
    el: 'steel',
    svg: `<rect x="3" y="18" width="50" height="30"/><rect x="53" y="27" width="8" height="12"/><rect x="9" y="24" width="38" height="18" fill="#16121f"/><rect x="11" y="26" width="7" height="14"/><path d="M30 8l-8 10h6l-4 8 12-12h-7z" fill="#ffd900" stroke="#16121f" stroke-width="2"/>`,
  },
  brainChip: {
    el: 'arcane',
    svg: `<rect x="14" y="14" width="36" height="36" rx="3"/><path d="M20 4h4v10h-4zM30 4h4v10h-4zM40 4h4v10h-4zM20 50h4v10h-4zM30 50h4v10h-4zM40 50h4v10h-4zM4 20h10v4H4zM4 30h10v4H4zM4 40h10v4H4zM50 20h10v4H50zM50 30h10v4H50zM50 40h10v4H50z"/><path d="M32 22c-6 0-9 4-9 8 0 3 2 5 3 6-1 3 1 6 4 6h4c3 0 5-3 4-6 1-1 3-3 3-6 0-4-3-8-9-8z" fill="#16121f"/><path d="M32 24v18M27 30h5M32 34h5" stroke="#fff" stroke-width="2" opacity=".7"/>`,
  },
  gavel: {
    el: 'steel',
    svg: `<g transform="rotate(-35 32 32)"><rect x="8" y="8" width="38" height="18" rx="3"/><rect x="12" y="8" width="6" height="18" fill="#16121f" opacity=".4"/><rect x="34" y="8" width="6" height="18" fill="#16121f" opacity=".4"/><rect x="24" y="24" width="7" height="34" rx="2"/></g><path d="M34 54h28v8H34z"/>`,
  },
  whiteboard: {
    el: 'steel',
    svg: `<rect x="4" y="4" width="56" height="38" rx="1"/><rect x="9" y="9" width="46" height="28" fill="#16121f"/><path fill="#fff" opacity=".75" d="M14 14h16v3H14zM14 21h26v3H14zM14 28h12v3H14zM42 13h9v9h-9z"/><path d="M12 42h6v18h-6zM46 42h6v18h-6zM10 40h44v4H10z"/>`,
  },
  masochist: {
    el: 'blood',
    svg: `<rect x="29" y="34" width="6" height="26"/><circle cx="32" cy="22" r="12"/><path d="M32 2l3 8h-6zM48 8l-3 8-5-5zM54 22l-8 3v-6zM16 8l3 8 5-5zM10 22l8 3v-6z"/><circle cx="32" cy="22" r="4" fill="#16121f"/>`,
  },
  voodooPin: {
    el: 'curse',
    svg: `<circle cx="28" cy="14" r="9"/><path d="M14 28h28l6 14-8 2-4-8v24H20V36l-4 8-8-2z"/><path d="M44 6l14 14-4 4L40 10z"/><circle cx="55" cy="9" r="6" fill="#16121f"/>`,
  },
  flowState: {
    el: 'arcane',
    svg: `<path d="M4 18q7-10 14 0t14 0 14 0 14 0v8q-7-10-14 0t-14 0-14 0-14 0z"/><path d="M4 32q7-10 14 0t14 0 14 0 14 0v8q-7-10-14 0t-14 0-14 0-14 0z"/><path d="M4 46q7-10 14 0t14 0 14 0 14 0v8q-7-10-14 0t-14 0-14 0-14 0z"/>`,
  },
  allNighter: {
    el: 'arcane',
    svg: `<path d="M8 24h34v16a14 14 0 0 1-14 14H22A14 14 0 0 1 8 40z"/><path d="M42 28h6a8 8 0 0 1 0 16h-6v-5h5a3 3 0 0 0 0-6h-5z"/><path d="M16 4h4v14h-4zM28 8h4v10h-4z"/><path fill="#16121f" d="M14 32h22v4H14z"/>`,
  },
  diminishingReturns: {
    el: 'steel',
    svg: `<rect x="6" y="8" width="10" height="48"/><rect x="20" y="20" width="10" height="36"/><rect x="34" y="32" width="10" height="24"/><rect x="48" y="44" width="10" height="12"/>`,
  },
  wellnessSeminar: {
    el: 'holy',
    svg: `<path d="M32 46C14 34 10 24 15 17c5-7 13-6 17 1 4-7 12-8 17-1 5 7 1 17-17 29z"/><rect x="6" y="52" width="52" height="6"/>`,
  },
  hustleCulture: {
    el: 'arcane',
    svg: `<path d="M22 14V8h20v6h14v38H8V14z"/><path fill="#16121f" d="M36 20L24 36h8l-3 12 13-18h-8z"/>`,
  },
  walkInFreezer: {
    el: 'ice',
    svg: `<rect x="12" y="4" width="40" height="56"/><rect x="18" y="10" width="28" height="44" fill="#16121f"/><rect x="40" y="26" width="4" height="14"/><path fill="none" stroke="currentColor" stroke-width="3" d="M30 18v28M22 24l16 16M22 40l16-16"/>`,
  },
  passiveAggressive: {
    el: 'curse',
    svg: `<path d="M8 8h48v36L44 56H8z"/><path fill="#16121f" opacity=".4" d="M44 56V44h12z"/><circle cx="22" cy="22" r="3.5" fill="#16121f"/><circle cx="38" cy="22" r="3.5" fill="#16121f"/><path fill="none" stroke="#16121f" stroke-width="3" d="M16 32q11 10 22 0"/>`,
  },
  coldSweat: {
    el: 'ice',
    svg: `<path d="M32 4c10 14 18 24 18 34a18 18 0 0 1-36 0c0-10 8-20 18-34z"/><path fill="none" stroke="#16121f" stroke-width="3" d="M32 28v22M23 33l18 12M23 45l18-12"/>`,
  },
  coldOpen: {
    el: 'ice',
    svg: `<path d="M4 24h56v34H4z"/><path d="M4 10l52-6 4 12L8 22z"/><g fill="#16121f"><path d="M16 8l8-1-6 13h-8zM34 6l8-1-6 13h-8z"/></g><path fill="none" stroke="#16121f" stroke-width="3.5" stroke-linecap="round" d="M32 30v22M22 36l20 10M22 46l20-10"/>`,
  },
  fortyTabs: {
    el: 'arcane',
    svg: `<path d="M4 20h56v40H4z"/><path d="M4 8h15v12H4zM22 8h15v12H22zM40 8h15v12H40z"/><g fill="#16121f"><rect x="10" y="28" width="44" height="6"/><rect x="10" y="40" width="30" height="4"/><rect x="10" y="50" width="38" height="4"/></g>`,
  },
  /** Forty Tabs Open's chip: browser windows piled on each other. */
  tabs: {
    el: 'arcane',
    svg: `<path d="M22 4h38v32H22z"/><path d="M4 18h40v42H4z"/><g fill="#16121f"><rect x="4" y="18" width="40" height="8"/><rect x="10" y="34" width="26" height="4"/><rect x="10" y="44" width="18" height="4"/></g>`,
  },
  freeCoffee: {
    el: 'fire',
    svg: `<path d="M12 20h40l-5 40H17z"/><rect x="8" y="12" width="48" height="10"/><path fill="#16121f" d="M14 34h36l-1.5 12h-33z"/><g fill="none" stroke="#fff" stroke-width="3"><circle cx="32" cy="40" r="4"/></g><g ${S} stroke-width="4"><path d="M22 8c-3-3 3-5 0-8M32 8c-3-3 3-5 0-8M42 8c-3-3 3-5 0-8"/></g>`,
  },
  workersComp: {
    el: 'holy',
    svg: `<path d="M8 42a24 24 0 0 1 48 0z"/><rect x="4" y="42" width="56" height="9"/><rect x="26" y="10" width="12" height="32" fill="#16121f" opacity=".35"/><path fill="#16121f" d="M24 22h16v6H24z"/><path fill="#16121f" d="M29 17h6v16h-6z"/><rect x="8" y="55" width="48" height="4"/>`,
  },
  revolvingDoor: {
    el: 'steel',
    svg: `<circle cx="32" cy="32" r="28"/><path stroke="#16121f" stroke-width="4" d="M32 8v48M8 32h48"/><circle cx="32" cy="32" r="6" fill="#16121f"/>`,
  },
  stopTheLine: {
    el: 'blood',
    svg: `<path d="M20 4h24l16 16v24L44 60H20L4 44V20z"/><rect x="16" y="26" width="32" height="12" fill="#16121f"/>`,
  },
  hardshipCase: {
    el: 'holy',
    svg: `<path d="M4 12h20l6 6h30v38H4z"/><path fill="#16121f" d="M32 50C21 43 19 37 22 33c3-4 8-3 10 1 2-4 7-5 10-1 3 4 1 10-10 16z"/>`,
  },
  indexFund: {
    el: 'holy',
    svg: `<path d="M28 36V8A26 26 0 1 0 56 36z"/><path d="M36 28V4a26 26 0 0 1 24 24z"/>`,
  },
  trustFall: {
    el: 'steel',
    svg: `<circle cx="46" cy="12" r="8"/><path d="M12 56L32 31" stroke="currentColor" stroke-width="11" stroke-linecap="round"/><circle cx="56" cy="36" r="5.5"/><path d="M56 43v19" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M54 48L38 42" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
  },
  step1: {
    el: 'holy',
    svg: `<path d="M4 60V46h16v14z"/>`,
  },
  // A smoking potato, and a hand shoving a banknote away
  hotPotato: {
    el: 'fire',
    svg: `<path d="M10 40c0-12 10-20 24-20s22 8 20 20c-2 12-12 18-24 18S10 52 10 40z"/><g fill="#16121f"><circle cx="24" cy="38" r="2.5"/><circle cx="38" cy="46" r="2.5"/><circle cx="42" cy="32" r="2"/></g><path d="M22 14c-3-4 3-6 0-11M34 14c-3-4 3-6 0-11M46 14c-3-4 3-6 0-11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
  },
  passTheBuck: {
    el: 'steel',
    svg: `<rect x="4" y="18" width="38" height="26"/><circle cx="23" cy="31" r="7" fill="#16121f"/><path d="M8 22h6M32 40h6" stroke="#16121f" stroke-width="3"/><path d="M40 28h14V18l10 14-10 14V36H40z"/>`,
  },
  // A tear-off calendar page showing a big 1, with a red flag on top
  mayFirst: {
    el: 'holy',
    svg: `<rect x="6" y="10" width="52" height="48"/><rect x="6" y="10" width="52" height="12" fill="#16121f"/><rect x="16" y="4" width="6" height="12"/><rect x="42" y="4" width="6" height="12"/><path d="M28 28h8v24h-8z" fill="#16121f"/><path d="M22 34l6-6v6z" fill="#16121f"/><rect x="22" y="50" width="20" height="4" fill="#16121f"/>`,
  },
  // Echo keyword: a card and its fading copies, side by side
  echoKw: {
    el: 'arcane',
    svg: `<rect x="4" y="14" width="26" height="36"/><rect x="34" y="14" width="14" height="36" opacity=".6"/><rect x="52" y="14" width="8" height="36" opacity=".3"/><rect x="10" y="22" width="14" height="6" fill="#16121f"/><rect x="10" y="34" width="10" height="4" fill="#16121f"/>`,
  },
  // Echo waves: three sound arcs, drawn at the edges of an Echo card's effect (mirrored for the left edge)
  echoWave: {
    el: 'arcane',
    svg: `<path d="M4 20Q20 32 4 44V35Q10 32 4 29z"/><path d="M20 10Q44 32 20 54V43Q31 32 20 21z"/><path d="M38 0Q74 32 38 64V51Q58 32 38 13z"/>`,
  },
  // Anchor: it holds the card at the end of the belt
  anchor: {
    el: 'steel',
    svg: `<circle cx="32" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M30 18h4v32h-4zM16 30h32v4H16z"/><path d="M8 36c0 14 10 22 24 22s24-8 24-22h-6c0 10-8 16-18 16s-18-6-18-16z"/>`,
  },
  step2: {
    el: 'holy',
    svg: `<path d="M4 60V46h16V32h16v28z"/>`,
  },
  step3: {
    el: 'holy',
    svg: `<path d="M4 60V46h14V32h14V18h14v42z"/>`,
  },
  step4: {
    el: 'holy',
    svg: `<path d="M4 60V46h12V32h12V18h12V8h12v52z"/><path d="M52 8V2l10 3z"/>`,
  },
  creditCard: {
    el: 'curse',
    svg: `<rect x="4" y="12" width="56" height="40" rx="5"/><rect x="4" y="20" width="56" height="8" fill="#16121f"/><rect x="10" y="36" width="14" height="10" fill="#16121f"/>`,
  },
  safetyDrill: {
    el: 'steel',
    svg: `<path d="M8 44a24 24 0 0 1 48 0z"/><rect x="4" y="44" width="56" height="8"/><rect x="27" y="14" width="10" height="30" fill="#16121f" opacity=".35"/>`,
  },
  roomba: {
    el: 'steel',
    svg: `<circle cx="32" cy="34" r="26"/><circle cx="32" cy="34" r="9" fill="#16121f"/><path fill="none" stroke="#16121f" stroke-width="3" d="M12 22a26 26 0 0 1 40 0"/>`,
  },
  cleaningOutTheDesk: {
    el: 'steel',
    svg: `<path d="M6 24h52v34H6z"/><path d="M6 24l8-14h36l8 14z"/><rect x="24" y="30" width="16" height="6" fill="#16121f"/>`,
  },
  suggestionBox: {
    el: 'steel',
    svg: `<rect x="22" y="4" width="20" height="24"/><rect x="10" y="22" width="44" height="38"/><rect x="18" y="30" width="28" height="5" fill="#16121f"/>`,
  },
  shieldOff: {
    el: 'steel',
    svg: `<g ${S} stroke-width="5"><path d="M32 6l22 8c0 20-7 34-22 44C17 48 10 34 10 14z"/><path d="M12 8l42 48"/></g>`,
  },
  // ---- stationery: the plain versions of the relics' sprites, small enough for a status chip
  // ---- rogue
  /** On Credit: the receipt of what is owed. */
  debt: {
    el: 'steel',
    svg: `<path d="M12 4h40v54l-5-4-5 4-5-4-5 4-5-4-5 4-5-4z"/><path fill="#16121f" d="M20 14h24v4H20zM20 24h24v4H20zM20 34h12v4H20z"/><path fill="#16121f" d="M36 40h12v5H36z"/>`,
  },
  borrowedStapler: {
    el: 'steel',
    svg: `<path d="M4 44h56v10H4z"/><path d="M4 44c0-8 8-14 20-18l32-10c4-1 6 2 6 5v23z"/><path ${HI} d="M12 40c4-5 10-8 16-10l22-8-26 12z"/><path fill="#16121f" d="M50 36h10v3H50zM8 48h20v3H8z"/>`,
  },
  hideTheEvidence: {
    el: 'shadow',
    svg: `<path d="M14 4h28l12 12v44H14z"/><path ${HI} d="M42 4v12h12z"/><path fill="#16121f" d="M20 24h28v6H20zM20 36h20v6H20zM20 48h24v6H20z"/>`,
  },
  shoplifting: {
    el: 'shadow',
    svg: `<path d="M10 22h44l4 38H6z"/><path ${S} stroke-width="4.5" d="M22 22v-6a10 10 0 0 1 20 0v6"/><path ${HI} d="M14 26h12l-2 28h-8z"/><path fill="#16121f" d="M38 36h12v4H38zM38 44h8v4h-8z"/>`,
  },
  plausibleDeniability: {
    el: 'holy',
    svg: `<ellipse cx="32" cy="9" rx="15" ry="5" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="38" r="22"/><circle cx="24" cy="34" r="4" fill="#16121f"/><circle cx="40" cy="34" r="4" fill="#16121f"/><ellipse cx="32" cy="48" rx="4" ry="5" fill="#16121f"/><path ${HI} d="M16 30c2-8 8-13 15-14-7 3-11 8-12 16z"/>`,
  },
  lostProperty: {
    el: 'shadow',
    svg: `<path d="M4 30C6 14 20 6 32 6s26 8 28 24c-5-4-9-4-14 0-5-4-9-4-14 0-5-4-9-4-14 0-5-4-9-4-14 0z"/><path ${S} stroke-width="4.5" d="M32 30v22a7 7 0 0 1-14 0"/><path fill="#16121f" d="M31 2h2v6h-2z"/><path ${HI} d="M12 26c1-8 7-14 15-16-6 4-9 10-9 16z"/>`,
  },
  dumpsterDive: {
    el: 'nature',
    svg: `<path d="M4 14h56v10H4z"/><path d="M8 28h48l-6 30H14z"/><path ${HI} d="M12 30h8l-3 26h-4z"/><path fill="#16121f" d="M26 32h4v22h-4zM36 32h4v22h-4zM46 32h4v22h-4z" opacity=".5"/><path d="M42 2l8 8-10 2z"/>`,
  },
  salaryAdvance: {
    el: 'holy',
    svg: `<rect x="3" y="14" width="58" height="34" rx="3"/><circle cx="32" cy="31" r="10" fill="#16121f" opacity=".45"/><path fill="#16121f" d="M10 20h8v4h-8zM46 38h8v4h-8z"/><circle cx="32" cy="31" r="4"/><circle cx="52" cy="52" r="10"/><path fill="none" stroke="#16121f" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M52 46v6l4 3"/>`,
  },
  pocketLint: {
    el: 'shadow',
    svg: `<path d="M8 6h48v28c0 14-10 24-24 24S8 48 8 34z"/><path fill="#16121f" opacity=".5" d="M8 6h48v6H8z"/><path fill="none" stroke="#16121f" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" stroke-dasharray="4 3" d="M14 18v16c0 10 8 18 18 18s18-8 18-18V18"/><g fill="#16121f"><circle cx="26" cy="42" r="4"/><circle cx="36" cy="46" r="3"/><circle cx="31" cy="36" r="2.5"/></g>`,
  },
  cleanGetaway: {
    el: 'steel',
    svg: `<path d="M4 24h34l14 14h8v14H4z"/><path ${HI} d="M10 28h22l10 10H10z"/><path fill="#16121f" d="M14 29h10v8H14zM28 29h8l6 8H28z"/><circle cx="18" cy="53" r="7"/><circle cx="46" cy="53" r="7"/><circle cx="18" cy="53" r="3" fill="#16121f"/><circle cx="46" cy="53" r="3" fill="#16121f"/><path d="M0 18h14v3H0zM2 12h10v3H2z"/>`,
  },
  fenceIt: {
    el: 'steel',
    svg: `<path d="M6 16l6-6 6 6v42H6zM22 16l6-6 6 6v42H22zM38 16l6-6 6 6v42H38z"/><path fill="#16121f" opacity=".6" d="M2 28h60v6H2zM2 44h60v6H2z"/><path d="M50 2h12v12L50 14z" fill="#fff" opacity=".0"/>`,
  },
  hushMoney: {
    el: 'holy',
    svg: `<path d="M24 6h16l-4 10c12 6 20 16 20 28 0 10-8 14-24 14S8 54 8 44c0-12 8-22 20-28z"/><path ${HI} d="M16 42c0-8 4-14 10-18-4 6-6 12-5 20z"/><path fill="#16121f" d="M22 38h20v5H22z"/><path fill="none" stroke="#16121f" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M26 38v5M32 38v5M38 38v5"/>`,
  },
  employeeDiscount: {
    el: 'holy',
    svg: `<path d="M4 30L30 4h28v28L32 58z"/><circle cx="46" cy="16" r="4.5" fill="#16121f"/><path fill="#16121f" d="M22 38l18-18 5 5-18 18z"/><circle cx="26" cy="22" r="3.5" fill="#16121f"/><circle cx="38" cy="38" r="3.5" fill="#16121f"/>`,
  },
  grandLarceny: {
    el: 'shadow',
    svg: `<path d="M4 22c8-6 16-6 28-2 12-4 20-4 28 2-2 14-8 22-18 20-6-2-8-6-10-6s-4 4-10 6C12 44 6 36 4 22z"/><ellipse cx="20" cy="30" rx="6" ry="4" fill="#16121f"/><ellipse cx="44" cy="30" rx="6" ry="4" fill="#16121f"/><path ${HI} d="M10 24c6-3 12-3 18-1-6 0-12 2-17 6z"/>`,
  },
  lightFingers: {
    el: 'holy',
    svg: `<path d="M14 58V34l-6-6 4-4 8 8V10h6v18V6h6v22V10h6v20V16h6v32c0 8-6 12-14 12z"/><path ${HI} d="M18 34l-4-4v8z"/><path d="M52 6l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>`,
  },
  lostAndFound: {
    el: 'shadow',
    svg: `<path d="M4 12h56v12H4z"/><path d="M8 24h48v34H8z"/><path ${HI} d="M10 26h6v30h-6z"/><path fill="none" stroke="#16121f" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.5" d="M26 36c0-9 14-9 14 0 0 6-8 6-8 12"/><rect x="29" y="51" width="6" height="5" fill="#16121f"/>`,
  },
  insideJob: {
    el: 'shadow',
    svg: `<rect x="10" y="28" width="44" height="32" rx="3"/><path ${S} stroke-width="5" d="M20 28v-8a12 12 0 0 1 24 0v8"/><circle cx="32" cy="41" r="5" fill="#16121f"/><path fill="#16121f" d="M30 43h4l2 11h-8z"/><path ${HI} d="M14 32h6v24h-6z"/>`,
  },
  identityTheft: {
    el: 'shadow',
    svg: `<rect x="4" y="14" width="56" height="38" rx="3"/><circle cx="20" cy="30" r="7" fill="#16121f"/><path fill="#16121f" d="M8 48c0-9 24-9 24 0zM36 24h18v4H36zM36 32h18v4H36zM36 40h12v4H36z"/><path ${HI} d="M6 16h52v4H6z"/><path d="M12 24c4-3 12-3 16 0-2 2-4 3-8 3s-6-1-8-3z" fill="currentColor"/><path fill="#16121f" d="M14 25h12v3H14z"/>`,
  },
  fireSale: {
    el: 'fire',
    svg: `<path d="M4 40L24 20h26v26L30 62z"/><circle cx="42" cy="30" r="3.5" fill="#16121f"/><g transform="translate(24 -2) scale(.55)">${flame}</g>`,
  },
  restructuring: {
    el: 'steel',
    svg: `<rect x="22" y="4" width="20" height="12"/><path ${S} stroke-width="4" d="M32 16v10M12 26h40M12 26v10M32 26v10M52 26v10"/><rect x="4" y="36" width="16" height="12"/><rect x="24" y="36" width="16" height="12"/><rect x="44" y="36" width="16" height="12"/><path fill="#16121f" d="M2 56L62 50l0 5L2 61z"/>`,
  },
  inventoryShrinkage: {
    el: 'steel',
    svg: `<path d="M8 22l8-14h32l8 14z"/><path d="M8 24h48v34H8z"/><path ${HI} d="M10 26h6v30h-6z"/><path fill="#16121f" d="M24 30h16v10h8L32 54 16 40h8z"/>`,
  },
  stocktake: {
    el: 'steel',
    svg: `<rect x="10" y="10" width="44" height="50" rx="3"/><rect x="22" y="3" width="20" height="11" rx="2"/><path fill="#16121f" d="M17 24h7v7h-7zM28 25h19v5H28zM17 37h7v7h-7zM28 38h19v5H28zM17 50h7v7h-7zM28 51h13v5H28z"/><path ${HI} d="M12 12h4v46h-4z"/>`,
  },
  stickyFingers: {
    el: 'holy',
    svg: `<path d="M8 8h48v36L44 56H8z"/><path ${HI} d="M10 10h6v44h-6z"/><path fill="#16121f" opacity=".4" d="M44 56V44h12z"/><path fill="#16121f" d="M16 18h32v4H16zM16 28h32v4H16zM16 38h20v4H16z"/>`,
  },
  'relic.stressBall': {
    el: 'steel',
    svg: `<circle cx="32" cy="33" r="26"/><path fill="none" stroke="#16121f" stroke-width="3" stroke-linecap="round" opacity=".5" d="M10 26c6 4 8 10 6 18M54 26c-6 4-8 10-6 18"/><path ${HI} d="M18 18c4-5 10-8 16-8-8 2-12 8-13 14z"/>`,
  },
  'relic.thermos': {
    el: 'steel',
    svg: `<rect x="22" y="4" width="20" height="12" rx="3"/><rect x="14" y="18" width="36" height="42" rx="5"/><path fill="#16121f" d="M14 28h36v4H14zM14 48h36v4H14z"/><path ${HI} d="M18 20h5v38h-5z"/>`,
  },
  'relic.ergoChair': {
    el: 'steel',
    svg: `<path d="M18 4h28c4 0 7 3 6 7l-3 24H15L12 11c-1-4 2-7 6-7z"/><path d="M6 38h52v10H6z"/><rect x="28" y="48" width="8" height="8"/><path d="M8 60l24-6 24 6v2H8z"/>`,
  },
  'relic.coffeeMug': {
    el: 'steel',
    svg: `<path d="M20 2c-3 4 3 5 0 10M30 2c-3 4 3 5 0 10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 18h38v28c0 8-6 14-14 14H22c-8 0-14-6-14-14z"/><path fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" d="M46 26h4c6 0 8 4 8 9s-2 9-8 9h-4"/><path fill="#16121f" d="M8 24h38v4H8z"/>`,
  },
  'relic.wallClock': {
    el: 'steel',
    svg: `<circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="22" fill="#fff" opacity=".25"/><path fill="none" stroke="#16121f" stroke-width="5" stroke-linecap="round" d="M32 16v16l11 7"/><circle cx="32" cy="32" r="3" fill="#16121f"/>`,
  },
  'relic.unionArmband': { el: 'steel', svg: `<path d="M6 16h52l-4 32H10z"/><path fill="#16121f" d="M32 22l4 9h10l-8 6 3 10-9-6-9 6 3-10-8-6h10z"/>` },
  'relic.inboxZero': {
    el: 'steel',
    svg: `<path d="M6 14h52v36H6z"/><path fill="none" stroke="#16121f" stroke-width="4" stroke-linejoin="round" d="M6 16l26 20 26-20"/><path ${HI} d="M6 14h52v4H6z"/>`,
  },
  'relic.heavyStapler': {
    el: 'steel',
    svg: `<path d="M4 34c0-8 6-12 14-12h38v10H8z"/><path d="M4 36h56v6c0 2-2 4-4 4H8c-2 0-4-2-4-4z"/><rect x="14" y="48" width="36" height="8" rx="2"/><path fill="#16121f" d="M44 38h8v4h-8z"/><path ${HI} d="M12 26h30v3H12z"/>`,
  },
  'relic.spareBadge': {
    el: 'steel',
    svg: `<rect x="10" y="12" width="44" height="50" rx="4"/><path fill="#16121f" d="M24 6h16v10H24z"/><rect x="28" y="2" width="8" height="8" rx="2"/><circle cx="32" cy="32" r="9" fill="#16121f"/><path fill="#16121f" d="M18 54c0-8 6-12 14-12s14 4 14 12z"/>`,
  },
  'relic.emergencyExit': {
    el: 'steel',
    svg: `<path d="M8 4h48v56H8z"/><path fill="#16121f" d="M14 10h36v44H14z"/><circle cx="26" cy="22" r="4" fill="#fff"/><path fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M24 44l4-12 6 4 4 8M28 32l-6 4M34 36l4-6 6 2"/>`,
  },
  'relic.cargoPants': {
    el: 'steel',
    svg: `<path d="M12 4h40l4 22-6 34H35l-3-30-3 30H18L12 26z"/><path fill="#16121f" d="M12 12h40v3H12z"/><path fill="none" stroke="#16121f" stroke-width="3" d="M16 34h10v10H16zM38 34h10v10H38z"/>`,
  },
  'relic.stickyNotes': {
    el: 'steel',
    svg: `<path d="M10 10h44v44H10z"/><path fill="#16121f" d="M10 10h44v8H10zM18 28h28v3H18zM18 38h20v3H18z"/>`,
  },
  'relic.rubberDuck': {
    el: 'steel',
    svg: `<ellipse cx="28" cy="44" rx="24" ry="14"/><circle cx="42" cy="22" r="13"/><path fill="#16121f" d="M53 20h10l-3 7H53z"/><circle cx="43" cy="19" r="2.5" fill="#16121f"/>`,
  },
  'relic.paperShredder': {
    el: 'steel',
    svg: `<rect x="6" y="10" width="52" height="22" rx="4"/><path fill="#16121f" d="M12 18h40v4H12z"/><path d="M12 36h6v22h-6zM24 36h6v26h-6zM36 36h6v20h-6zM48 36h6v24h-6z"/>`,
  },
  'relic.statuette': {
    el: 'steel',
    svg: `<path d="M6 54h52l3 8H3z"/><path d="M18 52c-4-14-3-26 4-34 4-6 16-6 20 0 7 8 8 20 4 34z"/><path fill="#16121f" d="M26 30h4v4h-4zM36 30h4v4h-4zM28 40h8v3h-8z"/>`,
  },
  'relic.quillPen': {
    el: 'steel',
    svg: `<path d="M58 4C36 8 18 24 10 46l8 8c20-8 36-28 40-50z"/><path fill="none" stroke="#16121f" stroke-width="3" d="M52 10c-4 16-14 30-28 38"/><path d="M8 50l-5 11 12-3z"/>`,
  },
  'relic.paperClip': {
    el: 'steel',
    svg: `<path fill="none" stroke="#16121f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" d="M42 50V18c0-8-5-12-11-12S20 10 20 18v30c0 8 5 12 11 12s11-4 11-12V22c0-3-2-5-5-5s-5 2-5 5v22"/>`,
  },
  'relic.lanyard': {
    el: 'steel',
    svg: `<path d="M12 2h10l14 26-6 4zM52 2H42L28 28l6 4z"/><rect x="26" y="28" width="12" height="8" rx="2"/><rect x="16" y="38" width="32" height="24" rx="3"/><path fill="#16121f" d="M28 42h8v3h-8zM24 52h16v3H24z"/>`,
  },
  'relic.deskPlant': {
    el: 'steel',
    svg: `<path d="M32 36C32 22 22 14 8 16c0 14 10 22 24 20zM32 36c2-18 14-30 28-28-1 18-13 30-28 28z"/><path d="M14 40h36l-4 22H18z"/>`,
  },
  'relic.highlighter': {
    el: 'steel',
    svg: `<path d="M44 4l16 16-30 30-10-2-2-10z"/><path fill="#16121f" d="M12 52l-8 8 12-2z"/><path fill="none" stroke="#16121f" stroke-width="3" d="M36 12l16 16"/>`,
  },
  'relic.holePunch': {
    el: 'steel',
    svg: `<path d="M6 44h52v14H6z"/><path d="M8 20c0-6 4-8 10-8h28c8 0 12 6 12 14v14H8z"/><path fill="#16121f" d="M18 20h12v4H18zM40 30h6v6h-6z"/>`,
  },
  'relic.rubberStamp': {
    el: 'steel',
    svg: `<rect x="24" y="4" width="16" height="16" rx="4"/><path d="M28 20h8v14h-8z"/><path d="M10 34h44c4 0 6 3 6 6v8H4v-8c0-3 2-6 6-6z"/><path fill="#16121f" d="M4 50h56v4H4z"/><path d="M6 58h52v4H6z"/>`,
  },
  'relic.nameTag': {
    el: 'steel',
    svg: `<rect x="8" y="8" width="48" height="48" rx="5"/><path fill="#16121f" d="M8 14c0-3 2-6 6-6h36c4 0 6 3 6 6v14H8zM16 40h32v4H16z"/>`,
  },
  'relic.fireDrillBell': {
    el: 'steel',
    svg: `<path d="M32 6c-14 0-20 10-20 22v12L6 50h52l-6-10V28C52 16 46 6 32 6z"/><circle cx="32" cy="56" r="6"/>`,
  },
  'relic.outOfOffice': {
    el: 'steel',
    svg: `<path d="M12 2h40v60H12z"/><circle cx="32" cy="14" r="7" fill="#16121f"/><path fill="#16121f" d="M18 28h28v18H18zM22 52h20v4H22z"/>`,
  },
  'relic.companyCard': {
    el: 'steel',
    svg: `<rect x="4" y="12" width="56" height="40" rx="5"/><path fill="#16121f" d="M4 20h56v8H4z"/><rect x="10" y="36" width="14" height="10" rx="2" fill="#16121f"/><path fill="#16121f" d="M30 40h24v3H30z"/>`,
  },
};

export const INTENT_ICON: Record<string, string> = {
  attack: 'sword',
  defend: 'shield',
  buff: 'up',
  debuff: 'down',
  curse: 'skull',
  heal: 'heart',
  steal: 'snatch',
  charge: 'burst',
  drain: 'crystal',
  idle: 'dots',
  absorb: 'scanner',
};

/** Pixel icon (see riso.ts). The vector source above is rasterised once at boot. */
export function icon(id: string, cls = ''): string {
  return pixelIcon(id, cls);
}
