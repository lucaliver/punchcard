import type { Combat } from '../game/combat';
import type { Rarity, RelicDef } from '../game/types';
import { CARDS } from './cards';

/** A relic shows itself in the fight: a floating name over the hero. */
const proc = (c: Combat, id: string): void => c.events.emit({ type: 'relic', id });

const STRESS_BALL_BLOCK = 20;
const THERMOS_HEAL = 5;
const STAPLER_EVERY = 6;
export const STAPLER_DAMAGE = 6;
const MUG_EVERY = 4;
export const MUG_MANA = 1;
const CLOCK_EVERY = 10;
export const CLOCK_BLOCK = 4;
/** How far in the belt has run when a fight with Sticky Notes starts (belt widths): most of its length, so it opens full. */
const STICKY_BELT = 0.8;
const DUCK_BLOCK = 25;
/** Share of max HP the Rubber Duck squeaks at. */
const DUCK_HP = 0.5;
const SHREDDER_EVERY = 2;
export const SHREDDER_BLOCK = 3;
/** The belt's speed with a Lanyard. */
const LANYARD_SPEED = 1.15;
/** Share of max HP the Emergency Exit gets you back on your feet with. */
const EXIT_HP = 0.35;
/** The rarities the Quill Pen writes off: those cards start every fight Fleeting. */
const QUILL_RARITIES: readonly Rarity[] = ['common', 'rare'];
/** Cards the Statuette petrifies at the start of a fight. */
const STATUETTE_CARDS = 5;
const PLANT_EVERY = 15;
export const PLANT_HEAL = 2;
export const HIGHLIGHTER_MULT = 2;
export const PUNCH_DAMAGE = 2;
/** How long the Name Tag leaves the enemy Vulnerable at the start of a fight (s). */
export const NAME_TAG_TIME = 8;
/** Share of max HP the Fire Drill Bell rings at. */
const BELL_HP = 0.3;
export const BELL_STUN = 5;
/** The smallest hit the Out-of-Office Sign turns away. */
const OOO_MIN_HIT = 15;

/**
 * Relics found in the Lost & Found (and one sold by the Tailor). `n` is the number their text shows (`{n}`); the hooks and
 * modifiers use the same constants, so text and effect can't drift apart.
 */
const defs: RelicDef[] = [
  {
    id: 'stressBall',
    rarity: 'common',
    n: STRESS_BALL_BLOCK,
    hooks: {
      onCombatStart: (c) => {
        c.gainBlock('hero', STRESS_BALL_BLOCK);
        proc(c, 'stressBall');
      },
    },
  },
  {
    id: 'thermos',
    rarity: 'rare',
    n: THERMOS_HEAL,
    hooks: { onCombatEnd: (c) => void (c.heal('hero', THERMOS_HEAL) > 0 && proc(c, 'thermos')) },
  },
  { id: 'ergoChair', rarity: 'common', n: 20, mods: { regen: 1.2 } },
  {
    id: 'coffeeMug',
    rarity: 'common',
    n: MUG_EVERY,
    progress: (c) => ((c.mem.mug ?? 0) % MUG_EVERY) / MUG_EVERY,
    hooks: {
      onCardPlayed: (c) => {
        c.mem.mug = (c.mem.mug ?? 0) + 1;
        if (c.mem.mug % MUG_EVERY) return;
        c.gainMana(MUG_MANA);
        proc(c, 'coffeeMug');
      },
    },
  },
  {
    id: 'wallClock',
    rarity: 'common',
    n: CLOCK_EVERY,
    progress: (c) => (c.mem.clock ?? 0) / CLOCK_EVERY,
    hooks: {
      tick: (c, dt) => {
        c.mem.clock = (c.mem.clock ?? 0) + dt;
        if (c.mem.clock < CLOCK_EVERY) return;
        c.mem.clock -= CLOCK_EVERY;
        c.gainBlock('hero', CLOCK_BLOCK);
        proc(c, 'wallClock');
      },
    },
  },
  {
    id: 'unionArmband',
    rarity: 'rare',
    n: 1,
    hooks: {
      onCombatStart: (c) => {
        c.applyStatus('hero', 'strength', 1);
        proc(c, 'unionArmband');
      },
    },
  },
  {
    id: 'inboxZero',
    rarity: 'epic',
    n: 1,
    hooks: {
      onCombatStart: (c) => {
        c.gainMana(c.hero.maxMana);
        proc(c, 'inboxZero');
      },
    },
  },
  {
    id: 'heavyStapler',
    rarity: 'rare',
    n: STAPLER_EVERY,
    progress: (c) => ((c.mem.stapler ?? 0) % STAPLER_EVERY) / STAPLER_EVERY,
    hooks: {
      onCardPlayed: (c) => {
        c.mem.stapler = (c.mem.stapler ?? 0) + 1;
        if (c.mem.stapler % STAPLER_EVERY) return;
        c.damage('hero', 'enemy', STAPLER_DAMAGE, { raw: true, kind: 'blunt' }, 'hero');
      },
    },
  },
  { id: 'spareBadge', rarity: 'epic', n: 1, mods: { maxMana: 1 } },
  {
    id: 'emergencyExit',
    rarity: 'epic',
    n: Math.round(EXIT_HP * 100),
    armed: (c) => !c.relicFlags.emergencyExit,
    hooks: {
      // Once per run: the flag lives in the run, so it survives the fight.
      onDeath: (c) => {
        if (c.relicFlags.emergencyExit) return false;
        c.relicFlags.emergencyExit = 1;
        c.heal('hero', Math.round(c.hero.maxHp * EXIT_HP));
        return true;
      },
    },
  },
  { id: 'stickyNotes', rarity: 'epic', n: 1, mods: { startBelt: STICKY_BELT } },
  {
    id: 'rubberDuck',
    rarity: 'common',
    n: DUCK_BLOCK,
    armed: (c) => !c.mem.duck,
    hooks: {
      // Once per fight, the first time the hero is under half HP.
      tick: (c) => {
        if (c.mem.duck || c.hero.hp > c.hero.maxHp * DUCK_HP) return;
        c.mem.duck = 1;
        c.gainBlock('hero', DUCK_BLOCK);
        proc(c, 'rubberDuck');
      },
    },
  },
  {
    id: 'paperShredder',
    rarity: 'epic',
    n: SHREDDER_EVERY,
    progress: (c) => ((c.mem.shredder ?? 0) % SHREDDER_EVERY) / SHREDDER_EVERY,
    hooks: {
      onCardExpired: (c) => {
        c.mem.shredder = (c.mem.shredder ?? 0) + 1;
        if (c.mem.shredder % SHREDDER_EVERY) return;
        c.gainBlock('hero', SHREDDER_BLOCK);
        proc(c, 'paperShredder');
      },
    },
  },
  {
    id: 'statuette',
    rarity: 'rare',
    n: STATUETTE_CARDS,
    hooks: {
      // The cards are upgraded for this fight only (combat cards are copies), but each must be chipped free first.
      onCombatStart: (c) => {
        c.pinCards('petrify', STATUETTE_CARDS, 0, { upgrade: true });
        proc(c, 'statuette');
      },
    },
  },
  {
    id: 'paperClip',
    rarity: 'rare',
    n: 1,
    hooks: {
      // Every Pending card of the deck starts the fight already approved (it is still pending again after each play).
      onCombatStart: (c) => {
        for (const card of c.draw) if (c.keywords(card).includes('pending')) card.passed = true;
        proc(c, 'paperClip');
      },
    },
  },
  {
    id: 'quillPen',
    rarity: 'epic',
    n: 1,
    hooks: {
      // The cards are copies made for the fight: the deck itself keeps them as they were.
      onCombatStart: (c) => {
        for (const card of c.draw) if (QUILL_RARITIES.includes(CARDS[card.id].rarity)) card.fleeting = true;
        proc(c, 'quillPen');
      },
    },
  },
  { id: 'lanyard', rarity: 'epic', n: Math.round((LANYARD_SPEED - 1) * 100), mods: { beltSpeed: LANYARD_SPEED } },
  { id: 'companyCard', rarity: 'epic', n: 1, mods: { rewardCards: 1 } },
  {
    id: 'deskPlant',
    rarity: 'common',
    n: PLANT_EVERY,
    progress: (c) => (c.mem.plant ?? 0) / PLANT_EVERY,
    hooks: {
      tick: (c, dt) => {
        c.mem.plant = (c.mem.plant ?? 0) + dt;
        if (c.mem.plant < PLANT_EVERY) return;
        c.mem.plant -= PLANT_EVERY;
        if (c.heal('hero', PLANT_HEAL) > 0) proc(c, 'deskPlant');
      },
    },
  },
  {
    id: 'highlighter',
    rarity: 'common',
    n: HIGHLIGHTER_MULT,
    armed: (c) => !c.mem.highlighter,
    hooks: {
      // The first attack of the fight: its previews are doubled too, until it is played.
      damageMult: (c, def) => (def?.type === 'attack' && !c.mem.highlighter ? HIGHLIGHTER_MULT : 1),
      onCardPlayed: (c, _card, def) => {
        if (def.type !== 'attack' || c.mem.highlighter) return;
        c.mem.highlighter = 1;
        proc(c, 'highlighter');
      },
    },
  },
  {
    id: 'holePunch',
    rarity: 'epic',
    n: PUNCH_DAMAGE,
    hooks: {
      onCardExpired: (c) => {
        c.damage('hero', 'enemy', PUNCH_DAMAGE, { raw: true, kind: 'blunt' }, 'hero');
        proc(c, 'holePunch');
      },
    },
  },
  {
    id: 'rubberStamp',
    rarity: 'rare',
    n: 1,
    hooks: {
      // The Lost Badge status: the first card that costs mana is free.
      onCombatStart: (c) => {
        c.applyStatus('hero', 'lostBadge', 1);
        proc(c, 'rubberStamp');
      },
    },
  },
  {
    id: 'nameTag',
    rarity: 'common',
    n: NAME_TAG_TIME,
    hooks: {
      onCombatStart: (c) => {
        c.applyStatus('enemy', 'vulnerable', 1, NAME_TAG_TIME);
        proc(c, 'nameTag');
      },
    },
  },
  {
    id: 'fireDrillBell',
    rarity: 'epic',
    n: Math.round(BELL_HP * 100),
    armed: (c) => !c.mem.bell,
    hooks: {
      // Once per fight, the first time the hero is under the threshold.
      tick: (c) => {
        if (c.mem.bell || c.hero.hp > c.hero.maxHp * BELL_HP) return;
        c.mem.bell = 1;
        c.applyStatus('enemy', 'stun', 1, BELL_STUN);
        proc(c, 'fireDrillBell');
      },
    },
  },
  {
    id: 'outOfOffice',
    rarity: 'legendary',
    n: OOO_MIN_HIT,
    armed: (c) => !c.mem.ooo,
    hooks: {
      // Once per fight: the first big hit never lands.
      cancelHit: (c, dmg) => {
        if (c.mem.ooo || dmg < OOO_MIN_HIT) return false;
        c.mem.ooo = 1;
        return true;
      },
    },
  },
  // The Tailor's: not found in the Lost & Found.
  { id: 'cargoPants', rarity: 'special', n: 1, mods: { sleeve: 1 } },
];

export const RELICS: Record<string, RelicDef> = Object.fromEntries(defs.map((r) => [r.id, r]));
export const RELIC_LIST: readonly RelicDef[] = defs;

/** The sum of a numeric modifier over the relics a run holds (the hero sheet shows the stats as the fight will start). */
export const relicSum = (relics: readonly string[], key: 'sleeve' | 'maxMana' | 'rewardCards'): number =>
  relics.reduce((s, id) => s + (RELICS[id]?.mods?.[key] ?? 0), 0);
