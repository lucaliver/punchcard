import type { Combat } from '../game/combat';
import type { Rarity, RelicDef } from '../game/types';
import { CARDS, cardCostOf } from './cards';

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
/** HP lost to ring the Fire Drill Bell once. */
const BELL_LOSS = 30;
export const BELL_STUN = 5;
/** The smallest hit the Out-of-Office Sign turns away. */
const OOO_MIN_HIT = 15;
/** Seconds without a Lost Badge before Flexitime hands out one. */
const FLEX_EVERY = 15;
/** The share of the belt, from its exit, where Just-in-Time Delivery halves what a card costs. */
const JIT_LAST = 0.2;
/** Cards that would fall which a fight's Safety Net pins at the end of the belt instead. */
const NET_CARDS = 3;
const LOCKER_CUT = 1;
const STOCK_MANA = 2;
/** The share of max HP the Stock Options cost when they are taken. */
export const STOCK_HP = 0.25;
const CARDIGAN_MANA = 2;
/** The Revenge Spreadsheet gives 1 Strength for each curse an enemy deals, up to this many in a fight. */
export const REVENGE_MAX = 5;
/** Rooms more the Floor Plan lets you see on the map. */
const PLAN_VISION = 2;

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
    n: BELL_LOSS,
    progress: (c) => (c.mem.bell ?? 0) / BELL_LOSS,
    hooks: {
      // Every BELL_LOSS HP the hero loses (whatever takes it) rings the bell.
      tick: (c) => {
        const taken = c.stats.damageTaken;
        c.mem.bell = (c.mem.bell ?? 0) + taken - (c.mem.bellSeen ?? 0);
        c.mem.bellSeen = taken;
        while (c.mem.bell >= BELL_LOSS) {
          c.mem.bell -= BELL_LOSS;
          c.applyStatus('enemy', 'stun', 1, BELL_STUN);
          proc(c, 'fireDrillBell');
        }
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
  { id: 'rolodex', rarity: 'legendary', n: 0, openPool: true },
  { id: 'wellnessVoucher', rarity: 'epic', n: 0, restBoth: true },
  { id: 'cheatSheet', rarity: 'rare', n: 1, mods: { abilityCost: -1 } },
  {
    id: 'correctionFluid',
    rarity: 'rare',
    n: 1,
    armed: (c) => !c.mem.fluid,
    hooks: {
      // Once per fight: the first curse card an enemy deals never reaches the deck.
      wipeCurse: (c) => {
        if (c.mem.fluid) return false;
        c.mem.fluid = 1;
        return true;
      },
    },
  },
  { id: 'goldWatch', rarity: 'legendary', n: 0, abilityEveryFight: true },
  { id: 'floorPlan', rarity: 'rare', n: PLAN_VISION, mods: { vision: PLAN_VISION } },
  {
    id: 'stockOptions',
    rarity: 'epic',
    n: STOCK_MANA,
    mods: { maxMana: STOCK_MANA },
    onGain: (run) => {
      run.maxHp = Math.max(1, run.maxHp - Math.round(run.maxHp * STOCK_HP));
      run.hp = Math.min(run.hp, run.maxHp);
    },
  },
  {
    id: 'flexitime',
    rarity: 'epic',
    n: FLEX_EVERY,
    progress: (c) => (c.mem.flexitime ?? 0) / FLEX_EVERY,
    hooks: {
      tick: (c, dt) => {
        // The clock waits while a badge is up: the next one is FLEX_EVERY s after the last was used.
        if (c.has('hero', 'lostBadge')) return;
        c.mem.flexitime = (c.mem.flexitime ?? 0) + dt;
        if (c.mem.flexitime < FLEX_EVERY) return;
        c.mem.flexitime = 0;
        c.applyStatus('hero', 'lostBadge', 1);
        proc(c, 'flexitime');
      },
    },
  },
  {
    id: 'justInTime',
    rarity: 'epic',
    n: Math.round(JIT_LAST * 100),
    hooks: {
      cost: (c, card, cost) => {
        if (cost < 2) return cost;
        const onBelt = c.belt.find((b) => b.card.uid === card.uid);
        return onBelt && onBelt.pos >= 1 - JIT_LAST ? Math.ceil(cost / 2) : cost;
      },
    },
  },
  {
    id: 'safetyNet',
    rarity: 'rare',
    n: NET_CARDS,
    armed: (c) => (c.mem.net ?? 0) < NET_CARDS,
    hooks: {
      // Curses and cards nobody can play are left to fall: that is how they leave.
      anchorCard: (c, card) => {
        if ((c.mem.net ?? 0) >= NET_CARDS || CARDS[card.id].type === 'curse' || CARDS[card.id].sushi || c.keywords(card).includes('unplayable'))
          return false;
        c.mem.net = (c.mem.net ?? 0) + 1;
        return true;
      },
    },
  },
  {
    id: 'lockerKey',
    rarity: 'rare',
    n: LOCKER_CUT,
    hooks: {
      // The card keeps the discount (`CombatCard.cut`) for the rest of the fight, however often it comes round again.
      onCardExpired: (c, card) => {
        if (CARDS[card.id].type === 'curse' || c.keywords(card).includes('fleeting') || cardCostOf(card) < 1) return;
        card.cut = (card.cut ?? 0) + LOCKER_CUT;
        proc(c, 'lockerKey');
      },
    },
  },
  {
    id: 'bulletproofCardigan',
    rarity: 'rare',
    n: CARDIGAN_MANA,
    hooks: {
      onHitAbsorbed: (c) => {
        c.gainMana(CARDIGAN_MANA);
        proc(c, 'bulletproofCardigan');
      },
    },
  },
  {
    id: 'revengeSpreadsheet',
    rarity: 'epic',
    n: 1,
    progress: (c) => (c.mem.revenge ?? 0) / REVENGE_MAX,
    hooks: {
      onCurse: (c) => {
        if ((c.mem.revenge ?? 0) >= REVENGE_MAX) return;
        c.mem.revenge = (c.mem.revenge ?? 0) + 1;
        c.applyStatus('hero', 'strength', 1);
        proc(c, 'revengeSpreadsheet');
      },
    },
  },
  {
    id: 'assortedBiscuitTin',
    rarity: 'rare',
    n: 0,
    hooks: {
      // The first live tick, so the hit is seen (the stage is still dark while the stationery's start hooks run).
      tick: (c) => {
        if (c.mem.biscuits) return;
        c.mem.biscuits = 1;
        c.damage('hero', 'enemy', c.deckSize(), { raw: true, kind: 'blunt' }, 'hero');
        proc(c, 'assortedBiscuitTin');
      },
    },
  },
  // The Tailor's: not found in the Lost & Found.
  { id: 'cargoPants', rarity: 'special', n: 1, mods: { sleeve: 1 } },
];

export const RELICS: Record<string, RelicDef> = Object.fromEntries(defs.map((r) => [r.id, r]));
export const RELIC_LIST: readonly RelicDef[] = defs;

/** The sum of a numeric modifier over the relics a run holds (the hero sheet shows the stats as the fight will start). */
export const relicSum = (relics: readonly string[], key: 'sleeve' | 'maxMana' | 'rewardCards' | 'abilityCost' | 'vision'): number =>
  relics.reduce((s, id) => s + (RELICS[id]?.mods?.[key] ?? 0), 0);

/** What the hero's ability costs with these relics (never under 1). */
export const abilityCostWith = (cost: number, relics: readonly string[]): number => Math.max(1, cost + relicSum(relics, 'abilityCost'));

/** Whether these relics make the hero's ability ready again at every fight (the Gold Watch), not once per act. */
export const abilityEveryFight = (relics: readonly string[]): boolean => relics.some((id) => RELICS[id]?.abilityEveryFight);
