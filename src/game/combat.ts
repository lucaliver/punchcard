import { Emitter } from '../core/emitter';
import { Rng } from '../core/rng';
import { ANCHOR_POS, BEG_FLAG, CONFIG, EXPIRE_POS, halfAtOf } from '../data/config';
import { STATUSES } from '../data/statuses';
import { CARDS, CARD_LIST, CLASS_HIT, cardCostOf, cardKeywordsOf, cardValsOf, fullCostOf, isLarge } from '../data/cards';
import { HEXES } from '../data/hexes';
import { HEROES } from '../data/heroes';
import { CoffeeTask, type CoffeeAction, type CoffeeResult } from './coffee';
import { ShellGame, type ShellResult } from './shells';
import { RELICS } from '../data/relics';
import type { TKey } from '../core/i18n';
import type {
  BeltCard,
  CardDef,
  CardInst,
  CardLike,
  CardType,
  CombatCard,
  CombatEvent,
  CombatResult,
  EnemyDef,
  HeroDef,
  MoveDef,
  Rarity,
  RustSpot,
  Side,
  StatusDef,
  Keyword,
  Statuses,
} from './types';

const isCurse = (c: CardInst): boolean => CARDS[c.id].type === 'curse';

export interface Fighter {
  hp: number;
  maxHp: number;
  block: number;
  statuses: Statuses;
  blockTimer: number;
  dotTimer: number;
  /** Seconds per decay step of Block. */
  blockDecay: number;
  /** Block below `below` decays `mul` times slower (the hero's passive). */
  slowBlock?: { below: number; mul: number };
}

export interface HeroState extends Fighter {
  mana: number;
  maxMana: number;
  /** Seconds per mana point. */
  regen: number;
  manaTimer: number;
}

export interface EnemyState extends Fighter {
  def: EnemyDef;
  move: MoveDef;
  /** Seconds accumulated towards the current move's wind-up. */
  timer: number;
  moveCount: number;
  /** Main attacks left before the next special move. */
  mainsLeft: number;
  /** Index of the next special move. */
  specialIdx: number;
  halfTriggered: boolean;
  /** The phase it is in (0: the first, `EnemyDef.phases[phase - 1]` after that). */
  phase: number;
  dmgScale: number;
  /** Damage stored by an absorbing move, dealt back by the next releasing one. */
  stored: number;
  /** Free-form state for custom AIs. */
  mem: Record<string, number>;
}

export interface CombatSetup {
  hero: HeroDef;
  hp: number;
  maxHp: number;
  deck: CardInst[];
  relics: string[];
  /** Persistent per-run relic flags (e.g. a once-per-run revive). Mutated in place. */
  relicFlags: Record<string, number>;
  enemy: EnemyDef;
  scale: { hp: number; dmg: number };
  seed: number;
  /** Extra max mana from the run (e.g. Evocation is per-combat, events are permanent). */
  bonusMaxMana?: number;
  /** Belt rows (default `CONFIG.beltRows`). With two rows cards alternate between them and the belt runs a bit slower. */
  beltRows?: number;
  /** Run-wide belt speed multiplier (memos). */
  beltMul?: number;
  /** The hero may beg to stay once if this fight is lost (needs the run's flag `BEG_FLAG` unset too). */
  canBeg?: boolean;
  /** Sleeve slots the run has lost for good (Life Insurance). */
  sleeveLost?: number;
}

interface DamageOpts {
  hits?: number;
  kind?: string;
  /** Skip attacker modifiers (thorns, DoTs, flat item damage). */
  raw?: boolean;
  ignoreBlock?: boolean;
}

export class Combat {
  readonly events = new Emitter<CombatEvent>();
  readonly rng: Rng;
  readonly heroDef: HeroDef;
  readonly relics: string[];
  readonly relicFlags: Record<string, number>;

  time = 0;
  /** Running totals of the fight, for the debug recap and the debug log. */
  readonly stats = {
    /** HP the enemy lost to hits and to damage over time (the part of it that was DoT). */
    damageDealt: 0,
    damageDot: 0,
    /** Damage the enemy's Block soaked up / the hero's Block soaked up. */
    enemyBlocked: 0,
    heroBlocked: 0,
    /** HP the hero lost to damage. */
    damageTaken: 0,
    blockGained: 0,
    healed: 0,
    cardsLost: 0,
    abilities: 0,
  };
  intro: number = CONFIG.introTime;
  result: CombatResult | null = null;

  hero: HeroState;
  enemy: EnemyState;

  draw: CombatCard[] = [];
  discard: CombatCard[] = [];
  exhaust: CombatCard[] = [];
  belt: BeltCard[] = [];
  /** Belt rows the fight has (an enemy may add one: `EnemyDef.deepBelt`). */
  beltRows: number;
  /** Belt rows cards can spawn on right now (an enemy may keep some shut for a while). */
  rowsOpen: number;
  /** The sleeve and the ability are out of reach (`EnemyDef.deepBelt`): nothing can be stashed, the ability can't be used. */
  lowerHidden = false;
  /** The card the hero is dragging around the screen: it can't fall off the belt while held (a `sweep` card for as long as it is held, any other for `CONFIG.dragGrace` seconds). */
  private dragged: number | null = null;
  /** Seconds the dragged card has been held at the end of the belt. */
  private dragEdge = 0;
  private rowAdded = false;
  /** How fast the belt runs in the boss's current phase (`BeltSetting.mul`). */
  private phaseBeltMul: number;
  /** The belt is shut off (`EnemyDef.beltOff`): it only moves when the player turns the crank (`crankBelt`). */
  beltDead = false;
  /** Mana only comes back by tapping the button (`EnemyDef.manaTap`, `tapMana`). */
  manaTapOn = false;
  /** The `pair` card the hero has picked, waiting for its match (`pairUp`). */
  picked: number | null = null;
  /** Total belt travel the player has cranked by hand, in belt widths (the UI scrolls the track stripes by it). */
  beltCranked = 0;
  sleeve: (CombatCard | null)[];

  /** Time accumulated towards the next regular draw onto the belt. */
  private spawnClock = 0;
  /** The pieces a `feed` status still has to deal. */
  private feedQueue: string[] = [];
  /** Seconds the belt still stands before it turns around, and how many turns it was asked for meanwhile (two cancel out). */
  private beltHalt = 0;
  private beltTurns = 0;
  private regenMul = 1;
  private runBeltMul = 1;
  /** Deck uids permanently removed (potions). */
  consumed: number[] = [];
  /** How many times each deck copy with `CardDef.tenure` has been played in the run so far, counting this fight (the run keeps it). */
  tenured: Record<number, number> = {};
  /** Sleeve slots lost for good this fight: they leave the sleeve from the next fight on (Life Insurance). */
  sleeveLost = 0;
  cardsPlayed = 0;
  /** The last card the hero played this fight (rules such as "not the same type twice"). */
  lastPlayed: CardDef | null = null;
  /** Fight time not yet counted as a whole second (see `costDrop`). */
  private second = 0;
  /** Seconds of mana overflow not yet turned into growth (see `onOverflow`). */
  private overflow = 0;
  /** The hero's recent HP losses (fight time, amount), for effects that undo them (Ctrl+Z). */
  private hurtLog: { t: number; n: number }[] = [];
  lastPlayedAt = -Infinity;
  /** Belt row the last card was played from (-1: the sleeve, or nothing yet). */
  lastRow = -1;
  /** The last card played and the values it resolved with, so it can be repeated (a repeat itself doesn't count). */
  private lastPlay: { card: CombatCard; def: CardDef; vals: number[] } | null = null;
  private replaying = false;
  /** Card currently resolving, so effect helpers know its type. */
  private current: { card: CombatCard; def: CardDef; row: number } | null = null;
  /** A target on the enemy's sprite (x, y: where, as a share of the drawing; t: seconds left). Tapped in time, it makes the hero's next attack critical. */
  weakSpot: { x: number; y: number; t: number } | null = null;
  /** Rust spots on the belt: each slows it down, enough stop it. The hero scrubs them off (`scrubRust`). */
  rustSpots: RustSpot[] = [];
  private rustClock = 0;
  private rustId = 0;
  /** The enemy's window over the belt: `ask` waits for a tap, `install` is the fake progress bar (`t` seconds in). Seconds until the next one while none is up (null: not yet counted). */
  popup: { phase: 'ask' | 'install'; t: number } | null = null;
  /** The chore the enemy's move has set (`MoveDef.task`): a window covers the belt and the sleeve until it is done or the move lands. */
  task: CoffeeTask | null = null;
  /** Same, when the chore is the Board's shell game (`MoveDef.task` = 'shells'). */
  shells: ShellGame | null = null;
  /** The chore of the move being charged has been set up already (so a finished one doesn't open again). */
  private taskSeen = false;
  private popupWait: number | null = null;
  /** The hero has sat through an update: Postpone now takes longer. */
  private updated = false;
  /** Free-form per-combat state for relics and powers. */
  mem: Record<string, number> = {};
  /** The hero is down and the fight waits for the answer to the offer to beg (`beg`). */
  begging = false;
  private canBeg: boolean;
  private tempUid = 0;

  constructor(setup: CombatSetup) {
    this.rng = new Rng(setup.seed);
    this.heroDef = setup.hero;
    this.relics = setup.relics;
    this.relicFlags = setup.relicFlags;
    this.beltRows = setup.beltRows ?? setup.enemy.belt?.rows ?? CONFIG.beltRows;
    this.phaseBeltMul = setup.enemy.belt?.mul ?? 1;
    this.rowsOpen = Math.min(setup.enemy.startRows ?? this.beltRows, this.beltRows);
    const h = setup.hero;

    let maxMana = h.maxMana + (setup.bonusMaxMana ?? 0);
    let sleeve = h.sleeve;
    let regenMul = 1;
    let beltMul = setup.beltMul ?? 1;
    let prewarm: number = CONFIG.prewarm;
    for (const id of this.relics) {
      const m = RELICS[id]?.mods;
      if (!m) continue;
      maxMana += m.maxMana ?? 0;
      sleeve += m.sleeve ?? 0;
      regenMul *= m.regen ?? 1;
      beltMul *= m.beltSpeed ?? 1;
      prewarm = Math.max(prewarm, m.startBelt ?? 0);
    }
    sleeve = Math.max(1, sleeve - (setup.sleeveLost ?? 0));
    this.regenMul = regenMul;
    this.runBeltMul = beltMul;
    this.canBeg = !!setup.canBeg && !this.relicFlags[BEG_FLAG];

    this.hero = {
      hp: setup.hp,
      maxHp: setup.maxHp,
      block: 0,
      statuses: {},
      blockTimer: 0,
      dotTimer: 0,
      blockDecay: h.blockDecay,
      slowBlock: h.slowBlock,
      mana: Math.min(CONFIG.startMana, maxMana),
      maxMana: Math.min(maxMana, CONFIG.maxManaCap),
      regen: h.regen,
      manaTimer: 0,
    };
    this.sleeve = new Array(sleeve).fill(null);

    const e = setup.enemy;
    // Round HP to 5s: scaled numbers stay easy to read.
    const maxHp = Math.max(5, Math.round((e.hp * setup.scale.hp) / 5) * 5);
    this.enemy = {
      def: e,
      hp: maxHp,
      maxHp,
      block: e.block ?? 0,
      statuses: {},
      blockTimer: 0,
      dotTimer: 0,
      blockDecay: CONFIG.enemyBlockDecay,
      move: e.main,
      timer: 0,
      moveCount: 0,
      mainsLeft: e.every,
      specialIdx: 0,
      halfTriggered: false,
      phase: 0,
      dmgScale: setup.scale.dmg,
      stored: 0,
      mem: {},
    };
    this.enemy.move = this.nextEnemyMove();
    for (const s of e.start ?? []) this.applyStatus('enemy', s.id, s.v ?? 1, s.t ?? 0, true);
    const box = e.fillSleeve;
    if (box) this.sleeve = this.sleeve.map(() => ({ uid: -++this.tempUid, id: box, up: false, bonus: 0, temp: true }));
    this.hero.maxMana = Math.min(this.hero.maxMana, this.manaCap());
    this.hero.mana = Math.min(this.hero.mana, this.hero.maxMana);

    this.draw = this.rng.shuffle(setup.deck.map((c) => ({ ...c, bonus: 0, temp: false })));
    // Innate cards go on top of the draw pile (the end of the array), so they reach the belt first.
    const innate = this.draw.filter((c) => this.keywords(c).includes('innate'));
    this.draw = [...this.draw.filter((c) => !innate.includes(c)), ...innate];

    this.heroDef.hooks.onCombatStart?.(this);
    for (const id of this.relics) RELICS[id]?.hooks?.onCombatStart?.(this);
    // Prewarm: run the belt on its own until the first card reaches `prewarm`, so the fight starts with
    // the right side filled at the normal spacing (and a second row alternating) without crowding it.
    this.spawnClock = Infinity;
    const step = 1 / 60;
    for (let t = 0; t < (prewarm * CONFIG.beltTime) / this.beltRate(); t += step) this.tickBelt(step);
    if (e.startHex) this.hexCards(e.startHex.id, e.startHex.share);
  }

  // ---------------------------------------------------------------- queries

  get isOver(): boolean {
    return this.result !== null;
  }

  fighter(side: Side): Fighter {
    return side === 'hero' ? this.hero : this.enemy;
  }

  has(side: Side, id: string): boolean {
    const s = this.fighter(side).statuses[id];
    return !!s && (STATUSES[id].kind === 'timed' ? s.t > 0 : s.v > 0);
  }

  /** The product of a speed or damage factor over the side's active statuses (1 when none has it). */
  private mul(side: Side, key: 'timeMul' | 'beltMul' | 'dealtMul' | 'takenMul' | 'regenMul'): number {
    let r = 1;
    for (const id of Object.keys(this.fighter(side).statuses)) {
      const m = STATUSES[id][key];
      if (m !== undefined && this.has(side, id)) r *= m;
    }
    return r;
  }

  /** How close the enemy is to something its statuses count down to, 0 to 1 (the belt reddens). */
  enemyWarning(): number {
    let w = 0;
    for (const [id, s] of Object.entries(this.enemy.statuses)) {
      const warn = STATUSES[id].warning;
      if (warn && this.has('enemy', id)) w = Math.max(w, warn(this, s));
    }
    return Math.min(1, w);
  }

  /** Whether an enemy status is about to go off and wants the red belt to blink. */
  enemyAlarming(): boolean {
    return Object.entries(this.enemy.statuses).some(([id, s]) => STATUSES[id].alarming?.(this, s) && this.has('enemy', id));
  }

  /** Whether the side takes no damage right now (Dodge). */
  isImmune(side: Side): boolean {
    return this.flag(side, 'immune');
  }

  /** Whether the belt plays the hero's cards by itself as they slip off (Autopilot). */
  isAutoplay(): boolean {
    return this.flag('hero', 'autoplay');
  }

  /** Whether the lights are out: the cards' faces are hidden (Blackout). */
  get cardsHidden(): boolean {
    return this.flag('hero', 'hidesCards');
  }

  /** Whether any active status of the side carries this rule flag. */
  private flag(side: Side, key: 'holdsBlock' | 'immune' | 'ignoresRules' | 'autoplay' | 'handsTied' | 'hidesCards'): boolean {
    return Object.keys(this.fighter(side).statuses).some((id) => STATUSES[id][key] && this.has(side, id));
  }

  stacks(side: Side, id: string): number {
    return this.fighter(side).statuses[id]?.v ?? 0;
  }

  cardVals(card: CardLike): number[] {
    return cardValsOf(card);
  }

  /** The values a card's face shows now (`CardDef.shown`): live while it waits on the belt or in the sleeve. */
  shownVals(card: CardLike): number[] {
    const vals = this.cardVals(card);
    return CARDS[card.id].shown?.(this, vals, card as CombatCard) ?? vals;
  }

  /** What playing the card takes from the mana now: nothing for a card On Credit (its cost becomes a debt, see `resolvePlay`), or when a badge makes the next one free. */
  cardCost(card: CardInst): number {
    const cost = this.costOf(card);
    if (cost > 0 && this.keywords(card).includes('credit')) return 0;
    return cost > 0 && this.freeNextId() ? 0 : cost;
  }

  /** What a card costs before credit and free passes: its own cost, or the one a status sets for every card (`StatusDef.flatCost`; X cards keep theirs). */
  costOf(card: CardInst): number {
    const cost = cardCostOf(card);
    if (cost < 0) return cost;
    for (const [id, s] of Object.entries(this.hero.statuses)) if (STATUSES[id].flatCost && this.has('hero', id)) return s.v;
    return cost;
  }

  /** The status that makes the next paid card free (`StatusDef.freeNext`), if one is up. */
  private freeNextId(): string | undefined {
    return Object.keys(this.hero.statuses).find((id) => this.has('hero', id) && STATUSES[id].freeNext);
  }

  canAfford(card: CardInst): boolean {
    const cost = this.cardCost(card);
    return cost < 0 ? this.hero.mana > 0 : this.hero.mana >= cost;
  }

  isPlayable(card: CardInst): boolean {
    const def = CARDS[card.id];
    return !this.keywords(card).includes('unplayable') && !!def.play;
  }

  keywords(card: CardInst): Keyword[] {
    return cardKeywordsOf(card);
  }

  private beltIndex(uid: number): number {
    return this.belt.findIndex((b) => b.card.uid === uid);
  }

  private sleeveIndex(uid: number): number {
    return this.sleeve.findIndex((c) => c?.uid === uid);
  }

  /** Belt row of a card, or -1 when it's not on the belt (sleeve). */
  rowOf(uid: number): number {
    return this.belt[this.beltIndex(uid)]?.row ?? -1;
  }

  /** The highest max mana allowed right now (statuses such as a Spending Freeze lower it). */
  manaCap(): number {
    let cap: number = CONFIG.maxManaCap;
    for (const side of ['hero', 'enemy'] as const) {
      for (const id of Object.keys(this.fighter(side).statuses)) {
        const c = STATUSES[id].manaCap;
        if (c !== undefined && this.has(side, id)) cap = Math.min(cap, c);
      }
    }
    return cap;
  }

  /** A Pending card can't be played (or stashed) until it has ridden the whole belt once this fight. */
  isPending(card: CombatCard): boolean {
    return !card.passed && this.keywords(card).includes('pending');
  }

  /** The sleeve is out of reach: sunk (`EnemyDef.deepBelt`) or under the chore window. */
  private get lowerBarred(): boolean {
    return this.lowerHidden || !!this.task || !!this.shells;
  }

  /**
   * True when this belt card is out of reach, barred by a curse: a wide card (Gatekeeping) stretches left of its face over the cards ahead of it (on both rows if it's
   * tall), and a row lock (Priority Task) holds its whole row, until paid off. An enemy's window over the belt (`popup`, `task`) covers every card.
   */
  isCovered(uid: number): boolean {
    const b = this.belt[this.beltIndex(uid)];
    if (!b) return false;
    // The enemy's window is over the whole belt.
    if (this.popup || this.task || this.shells) return true;
    return this.belt.some((w) => {
      if (w === b) return false;
      const def = CARDS[w.card.id];
      if (def.lockRow && w.row === b.row) return true;
      const span = def.span ?? 1;
      const d = b.pos - w.pos;
      return span > 1 && !isLarge(def) && (def.tall || w.row === b.row) && d > 0 && d < (span - 0.5) * CONFIG.cardWidth;
    });
  }

  /** The status whose rule forbids playing this card now (an enemy passive, a stun…) and why, or null. */
  ruleBlock(card: CardInst, auto = false): { status: string; key: TKey } | null {
    // Root access (sudo): no rule applies.
    if (this.flag('hero', 'ignoresRules')) return null;
    const def = CARDS[card.id];
    for (const side of ['hero', 'enemy'] as const) {
      for (const id of Object.keys(this.fighter(side).statuses)) {
        // A card playing itself (autopilot) isn't stopped by what ties the hero's hands.
        if (auto && STATUSES[id].handsTied) continue;
        const key = this.has(side, id) ? STATUSES[id].canPlay?.(this, side, def, card.uid) : null;
        if (key) return { status: id, key };
      }
    }
    return null;
  }

  /** Damage the hero would deal with `base` from `def` right now (for card previews). */
  previewHeroDamage(base: number, def: CardDef | null): number {
    return this.computeDamage('hero', 'enemy', base, def);
  }

  /** Base damage per hit of an enemy move: what it is charging has lost what `cutMove` took off it. */
  private moveBase(move: MoveDef): number {
    const cut = move === this.enemy.move ? (this.enemy.mem.cut ?? 0) : 0;
    return Math.max(0, (move.dmg ?? 0) - cut);
  }

  /** The move the enemy is charging loses `n` damage per hit (not below 0); the next move starts whole. */
  cutMove(n: number): void {
    this.enemy.mem.cut = (this.enemy.mem.cut ?? 0) + n;
  }

  /** Damage per hit of the given enemy move after modifiers (a releasing move adds what was stored). */
  intentDamage(move: MoveDef): number {
    const stored = move.release ? this.enemy.stored : 0;
    if (!move.dmg && !stored) return 0;
    return this.computeDamage('enemy', 'hero', Math.round(this.moveBase(move) * this.enemy.dmgScale) + stored, null);
  }

  enemyTimeRate(): number {
    return this.mul('enemy', 'timeMul');
  }

  beltRate(): number {
    return (this.beltRows > 1 ? CONFIG.twoRowSpeed : 1) * this.runBeltMul * this.phaseBeltMul * this.beltBoost();
  }

  /** How much statuses speed the belt up (Rush, Hurry, Crunch), slow it down (Slowdown, rust) or stop it (Stalled, full rust, or about to turn around): 1 when none does. */
  beltBoost(): number {
    let r = this.mul('hero', 'beltMul');
    r *= this.rustSpeed();
    if (this.beltHalt > 0 || this.beltDead) r = 0;
    return r;
  }

  // ------------------------------------------------------------------ loop

  tick(dt: number): void {
    if (this.result || this.begging) return;
    if (this.intro > 0) {
      this.intro -= dt;
      return;
    }
    this.time += dt;
    this.second += dt;
    if (this.second >= 1) {
      this.second -= 1;
      for (const card of this.allCards()) {
        const drop = CARDS[card.id].costDrop;
        if (drop !== undefined) card.cut = (card.cut ?? 0) + this.cardVals(card)[drop];
      }
    }
    this.tickHero(dt);
    this.tickFighter('hero', dt);
    this.tickFighter('enemy', dt);
    this.tickRust(dt);
    this.tickPopup(dt);
    this.tickTask(dt);
    if (this.weakSpot) {
      this.weakSpot.t -= dt;
      if (this.weakSpot.t <= 0) this.weakSpot = null;
    }
    if (this.result) return;
    this.tickEnemy(dt);
    if (this.result) return;
    this.tickDeepBelt();
    this.tickBeltOff();
    this.tickManaTap();
    this.tickBeltTurn(dt);
    this.tickBelt(dt);
    for (const id of this.relics) RELICS[id]?.hooks?.tick?.(this, dt);
    this.heroDef.hooks.tick?.(this, dt);
  }

  /** The cards a `feed` status makes the belt serve right now, if any. */
  private feedList(): string[] | undefined {
    for (const id of Object.keys(this.hero.statuses)) if (this.has('hero', id) && STATUSES[id].feed) return STATUSES[id].feed;
    return undefined;
  }

  /** The next piece a `feed` status deals: two of each of two kinds at a time, shuffled, so every piece has a match. */
  private nextFeed(list: string[]): CombatCard {
    if (!this.feedQueue.length) {
      const a = this.rng.pick(list);
      const b = this.rng.pick(list.length > 1 ? list.filter((id) => id !== a) : list);
      this.feedQueue = this.rng.shuffle([a, a, b, b]);
    }
    return { uid: -++this.tempUid, id: this.feedQueue.pop()!, up: false, bonus: 0, temp: true };
  }

  /** The mana timer's whole turns become mana (a full bar keeps none). */
  private fillMana(): void {
    const h = this.hero;
    while (h.manaTimer >= h.regen && h.mana < h.maxMana) {
      h.manaTimer -= h.regen;
      h.mana++;
    }
    if (h.mana >= h.maxMana) h.manaTimer = 0;
  }

  /** `EnemyDef.manaTap`: mana stops coming back by itself; from now on the player taps it out of the button. */
  private tickManaTap(): void {
    const at = this.enemy.def.manaTap;
    if (at === undefined || this.manaTapOn || this.time < at) return;
    this.manaTapOn = true;
    this.events.emit({ type: 'manaTap' });
  }

  /** A tap on the mana button: a share of a mana (`CONFIG.manaTapAmount`) comes back. */
  tapMana(): void {
    if (!this.manaTapOn || this.result || this.intro > 0 || this.hero.mana >= this.hero.maxMana) return;
    this.hero.manaTimer += this.hero.regen * CONFIG.manaTapAmount;
    this.fillMana();
  }

  private tickHero(dt: number): void {
    const h = this.hero;
    if (h.mana < h.maxMana) {
      const rate = this.manaTapOn ? 0 : this.regenMul * this.mul('hero', 'regenMul');
      h.manaTimer += dt * rate;
      this.fillMana();
    } else {
      h.manaTimer = 0;
      // Mana overflowing (full, the regen wasted): every whole second, cards that grow on it do, wherever they are.
      this.overflow += dt;
      if (this.overflow >= 1) {
        this.overflow -= 1;
        for (const card of this.allCards()) card.bonus += CARDS[card.id].onOverflow ?? 0;
      }
    }
  }

  /** A hex already cracked is gone once its card leaves the belt (an uncracked one stays on it through the piles). */
  private shedHex(card: CombatCard): void {
    if (card.hex && card.hex.left <= 0) delete card.hex;
  }

  /** `n` random cards that fit: the belt's first, then the rest of the deck (draw and discard piles). */
  private pickCards(fits: (c: CombatCard) => boolean, n: number, deckOnly = false): CombatCard[] {
    const onBelt = deckOnly ? [] : this.rng.shuffle(this.belt.map((b) => b.card).filter(fits));
    const rest = this.rng.shuffle([...this.draw, ...this.discard].filter(fits));
    return [...onBelt, ...rest].slice(0, n);
  }

  /** Every card of the fight, wherever it is: piles, belt and sleeve. */
  private allCards(): CombatCard[] {
    return [...this.draw, ...this.discard, ...this.exhaust, ...this.belt.map((b) => b.card), ...this.sleeve.filter((c) => c !== null)];
  }

  /** Seconds until Block next decays: a hero with a slow-fade passive keeps a small Block longer. */
  private blockStep(f: Fighter): number {
    return f.slowBlock && f.block < f.slowBlock.below ? f.blockDecay * f.slowBlock.mul : f.blockDecay;
  }

  private tickFighter(side: Side, dt: number): void {
    const f = this.fighter(side);
    // Block decays in steps: a share of the current block (at least 1) per interval, unless a status holds it.
    if (f.block > 0 && !this.flag(side, 'holdsBlock')) {
      f.blockTimer += dt;
      for (let step = this.blockStep(f); f.blockTimer >= step && f.block > 0; step = this.blockStep(f)) {
        f.blockTimer -= step;
        f.block = Math.max(0, f.block - Math.max(1, Math.ceil(f.block * CONFIG.blockDecayShare)));
      }
    } else {
      f.blockTimer = 0;
    }

    let hasDot = false;
    for (const [id, s] of Object.entries(f.statuses)) {
      const def = STATUSES[id];
      if (def.tick && this.has(side, id)) {
        def.tick(this, side, s, dt);
        if (this.result) return;
        if (f.statuses[id] !== s) continue;
      }
      if (def.kind === 'timed' && s.t > 0) {
        if (this.isKept(side, id)) continue;
        s.t -= dt;
        if (s.t <= 0) {
          delete f.statuses[id];
          def.onEnd?.(this, side, s);
        }
      } else if (def.kind === 'dot' && s.v > 0) {
        hasDot = true;
      }
    }
    if (!hasDot) {
      f.dotTimer = 0;
      return;
    }
    f.dotTimer += dt;
    if (f.dotTimer < CONFIG.dotInterval) return;
    f.dotTimer -= CONFIG.dotInterval;
    for (const [id, s] of Object.entries(f.statuses)) {
      if (f.statuses[id] !== s || STATUSES[id].kind !== 'dot' || s.v <= 0) continue;
      const amount = STATUSES[id].halves ? Math.ceil(s.v / 2) : s.v;
      if (STATUSES[id].heals) this.heal(side, amount);
      else {
        const bonus = side === 'enemy' ? this.dotBonus(id) : 0;
        this.damage(side === 'hero' ? 'enemy' : 'hero', side, amount + bonus, { raw: true, ignoreBlock: true, kind: id }, 'dot');
      }
      s.v--;
      if (s.v <= 0) delete f.statuses[id];
      if (this.result) return;
    }
  }

  /** What the hero's statuses add to every tick of a damage-over-time status on the enemy (`StatusDef.dotBonus`). */
  private dotBonus(dot: string): number {
    let n = 0;
    for (const [id, s] of Object.entries(this.hero.statuses)) if (STATUSES[id].dotBonus === dot && this.has('hero', id)) n += s.v;
    return n;
  }

  /** A status another one holds up (`StatusDef.keeps`) doesn't run out. */
  private isKept(side: Side, id: string): boolean {
    return Object.keys(this.fighter(side).statuses).some((k) => STATUSES[k].keeps === id && this.has(side, k));
  }

  private tickEnemy(dt: number): void {
    const e = this.enemy;
    // The chore is done: the move is as good as gone while the cup is held up.
    if (this.task?.phase === 'done' || this.shells?.phase === 'done') return;
    e.timer += dt * this.enemyTimeRate();
    if (e.timer < e.move.windup) return;
    const move = e.move;
    e.timer = 0;
    e.moveCount++;
    if (move.task) this.endTask('close');
    this.resolveMove(move);
    if (this.result) return;
    e.move = this.nextEnemyMove();
    this.events.emit({ type: 'enemyIntent', move: e.move });
  }

  /** Main attack, main attack… then a special move every `every` mains (specials rotate). */
  private nextEnemyMove(): MoveDef {
    this.enemy.mem.cut = 0;
    const e = this.enemy;
    const d = this.foe;
    if (e.mainsLeft > 0 || !d.specials.length) {
      e.mainsLeft--;
      return d.main;
    }
    const m = d.specials[e.specialIdx % d.specials.length];
    e.specialIdx++;
    e.mainsLeft = d.every;
    return m;
  }

  /** Asks for the belt to be reversed: it stops for `beltTurnPause`, then turns around (see `turnBelt`). */
  reverseBelt(): void {
    this.beltTurns++;
    this.beltHalt = CONFIG.beltTurnPause;
  }

  private tickBeltTurn(dt: number): void {
    if (this.beltHalt <= 0) return;
    this.beltHalt -= dt;
    if (this.beltHalt > 0) return;
    if (this.beltTurns % 2) this.turnBelt();
    this.beltTurns = 0;
  }

  /**
   * The exit becomes the entry. Every card keeps its place on the belt and now heads the other way
   * (its position is mirrored, but never past the new exit, `reverseMaxPos`).
   */
  private turnBelt(): void {
    for (const b of this.belt) {
      b.pos = Math.min(1 + CONFIG.cardWidth - b.pos, CONFIG.reverseMaxPos);
    }
    this.events.emit({ type: 'beltReversed' });
  }

  /** The enemy says something (a speech bubble over its sprite). */
  say(key: TKey): void {
    this.events.emit({ type: 'speech', key });
  }

  /** Pins every card on the belt where it is (Team Change): they stay until played, while new cards ride past them. */
  pinBelt(): void {
    for (const b of this.belt) b.pinned = true;
    this.events.emit({ type: 'beltPinned' });
  }

  /** Strips all of a fighter's Block. */
  breakBlock(side: Side): void {
    this.fighter(side).block = 0;
  }

  /** Takes a `share` (0–1) of the enemy's Block and adds it to the hero's. */
  stealBlock(share: number): void {
    const n = Math.floor(this.enemy.block * share);
    if (n <= 0) return;
    this.enemy.block -= n;
    this.gainBlock('hero', n);
  }

  /** `EnemyDef.deepBelt`: the lower part of the screen sinks away, then an extra belt row opens in its place. */
  private tickDeepBelt(): void {
    const at = this.enemy.def.deepBelt;
    if (at === undefined || this.time < at) return;
    if (!this.lowerHidden) {
      this.lowerHidden = true;
      this.events.emit({ type: 'lowerSink' });
      return;
    }
    if (this.rowAdded || this.time < at + CONFIG.sinkTime) return;
    this.rowAdded = true;
    const wasOpen = this.rowsOpen === this.beltRows;
    this.beltRows++;
    if (wasOpen) this.rowsOpen = this.beltRows;
    this.events.emit({ type: 'rowAdded' });
  }

  /** `EnemyDef.beltOff`: the belt is shut off for good; from now on the player scrolls it by hand. */
  private tickBeltOff(): void {
    const at = this.enemy.def.beltOff;
    if (at === undefined || this.beltDead || this.time < at) return;
    this.beltDead = true;
    this.events.emit({ type: 'beltDead' });
  }

  /**
   * The player cranks a shut-off belt by `move` belt widths (it only turns one way: a backward turn does nothing):
   * every row moves together, and new cards arrive as if the belt had run that far.
   */
  crankBelt(move: number): void {
    if (!this.beltDead || this.result || this.intro > 0 || move <= 0) return;
    for (let row = 0; row < this.beltRows; row++) this.moveRow(row, move);
    this.beltCranked += move;
    this.settleBelt(move, 0);
  }

  /** Opens every belt row (the ones an enemy kept shut). */
  openBeltRows(): void {
    if (this.rowsOpen === this.beltRows) return;
    this.rowsOpen = this.beltRows;
    this.events.emit({ type: 'rowsOpen' });
  }

  /** Shuts the belt down to `rows` open rows (a restructuring): the cards on the rows shut go straight to the discard pile. */
  closeBeltRows(rows = 1): void {
    if (this.rowsOpen <= rows) return;
    this.rowsOpen = rows;
    for (const b of this.belt.filter((x) => x.row >= rows)) {
      this.shedHex(b.card);
      this.discard.push(b.card);
      this.events.emit({ type: 'cardDiscarded', card: b.card });
    }
    this.belt = this.belt.filter((x) => x.row < rows);
    this.events.emit({ type: 'rowsClose' });
  }

  /** The enemy lands its main attack right now, outside its pattern (a Micromanager cutting in). */
  enemyStrike(): void {
    if (this.enemyTimeRate() === 0) return;
    this.events.emit({ type: 'text', target: 'enemy', key: 'combat.micromanaged', tone: 'bad' });
    this.resolveMove(this.foe.main);
  }

  /** The pattern the enemy fights with now: its current phase's, or its own when it has none. */
  get foe(): Pick<EnemyDef, 'main' | 'specials' | 'every'> {
    const e = this.enemy;
    return (e.phase ? e.def.phases?.[e.phase - 1] : undefined) ?? e.def;
  }

  /** The special move the enemy will use next (for the UI countdown). */
  nextSpecial(): MoveDef | null {
    const d = this.foe;
    return d.specials.length ? d.specials[this.enemy.specialIdx % d.specials.length] : null;
  }

  private resolveMove(m: MoveDef): void {
    this.events.emit({ type: 'enemyAct', move: m });
    const scale = this.enemy.dmgScale;
    const stored = m.release ? this.enemy.stored : 0;
    if (m.release) this.enemy.stored = 0;
    if (m.dmg || stored) {
      const hits = m.hits ?? 1;
      for (let i = 0; i < hits && !this.result; i++) {
        this.damage('enemy', 'hero', Math.round(this.moveBase(m) * scale) + stored, { kind: 'claw' }, 'enemy', i);
      }
      if (this.result) return;
      for (const [id, s] of Object.entries(this.enemy.statuses)) if (this.has('enemy', id)) STATUSES[id].onAttack?.(this, 'enemy', s);
      if (this.result) return;
    }
    if (m.block) this.gainBlock('enemy', Math.round(m.block * scale));
    if (m.heal) this.heal('enemy', Math.round(m.heal * scale));
    for (const s of m.status ?? []) this.applyStatus(s.target, s.id, s.v ?? 1, s.t ?? 0);
    let queued = 0;
    for (const cu of m.curse ?? []) {
      // Curses arriving on the belt together come in one after the other, spread over the rows (one row's spacing is shared by all).
      const gap = (CONFIG.spacing * (CARDS[cu.id].span ?? 1)) / this.rowsOpen;
      for (let i = 0; i < cu.n; i++) {
        const hex = cu.hex ? { id: cu.hex, left: HEXES[cu.hex].taps, t: HEXES[cu.hex].thaw } : undefined;
        const card = this.addTempCard(cu.id, cu.to, false, cu.to === 'belt' ? -queued++ * gap : 0, hex ? { hex } : {});
        if (hex) this.events.emit({ type: 'hexed', card });
      }
    }
    if (m.steal) for (let i = 0; i < m.steal; i++) this.stealCard();
    if (m.drainMana) this.drainMana(m.drainMana);
    if (m.hex) this.hexCards(m.hex.id, m.hex.share);
    if (m.inflate) this.inflateCards(m.inflate);
    if (m.infect) this.infectCards(m.infect);
    m.fx?.(this);
  }

  private tickBelt(dt: number): void {
    const rate = this.beltRate();
    const move = (dt / CONFIG.beltTime) * rate;
    for (let row = 0; row < this.beltRows; row++) this.moveRow(row, move);
    for (const b of this.belt) {
      b.card.age = (b.card.age ?? 0) + dt;
      this.spreadVirus(b, dt);
    }
    for (const card of [...this.belt.map((b) => b.card), ...this.sleeveCards()]) this.thawHex(card, dt);
    const held = this.belt.find((b) => b.card.uid === this.dragged);
    if (held && held.pos >= EXPIRE_POS - move) this.dragEdge += dt;
    this.settleBelt(move, dt);
  }

  /** After the belt has travelled `move` belt widths (in `dt` seconds): cards that fell off the end expire and the draw clock may deal a new one. */
  private settleBelt(move: number, dt: number): void {
    // Expire cards that fell off the left edge: first they tip over the end for `CONFIG.fallGrace` s, still within reach (to stash them).
    for (let i = this.belt.length - 1; i >= 0; i--) {
      const b = this.belt[i];
      if (b.card.uid === this.dragged && (CARDS[b.card.id].sweep || this.dragEdge < CONFIG.dragGrace)) {
        delete b.falling;
        b.pos = Math.min(b.pos, EXPIRE_POS - move);
      }
      // An Anchor card never falls: where the belt ends it stays, pinned.
      if (!b.pinned && b.pos >= ANCHOR_POS && this.keywords(b.card).includes('anchor')) {
        b.pos = ANCHOR_POS;
        b.pinned = true;
        // It has ridden the whole belt: a Pending card is approved.
        b.card.passed = true;
        delete b.falling;
        this.events.emit({ type: 'beltPinned' });
        continue;
      }
      if (b.pos < EXPIRE_POS) {
        delete b.falling;
        continue;
      }
      if (b.falling === undefined) {
        // On autopilot, a card slipping off plays itself for free if it can (rules…); otherwise it's lost as usual.
        if (this.flag('hero', 'autoplay') && this.playCard(b.card.uid, 'auto') && this.beltIndex(b.card.uid) < 0) continue;
        b.falling = CONFIG.fallGrace;
      } else b.falling -= dt;
      b.pos = EXPIRE_POS;
      if (b.falling > 0) continue;
      this.belt.splice(i, 1);
      this.expire(b.card);
      if (this.result) return;
    }
    // Draw cadence is a fixed clock (scaled with belt speed so spacing stays constant):
    // playing cards quickly never makes new ones arrive sooner. Each row keeps the one-row spacing, so a
    // two-row belt shows twice the cards (more to choose from, mana decides) and each stays in view longer.
    const every = (CONFIG.spacing * CONFIG.beltTime) / this.rowsOpen;
    this.spawnClock = Math.max(0, Math.min(every, this.spawnClock + move * CONFIG.beltTime));
    const row = this.freeRow();
    if (row < 0 || this.spawnClock < every || this.rowGap(row) < CONFIG.minGap) return;
    this.spawnClock -= every;
    this.spawnCard(0, undefined, row);
  }

  /** Moves a row's cards forward (a pinned card stays where it is). */
  private moveRow(row: number, move: number): void {
    for (const b of this.belt) if (b.row === row && !b.pinned) b.pos += move;
  }

  /** Distance from the entry to the newest card of a row (Infinity if the row is empty); a joined card's extra widths trail behind it, so they count as taken. */
  private rowGap(row: number): number {
    let gap = Infinity;
    for (const b of this.belt) {
      if (b.row !== row || b.pinned) continue;
      const def = CARDS[b.card.id];
      gap = Math.min(gap, b.pos - (isLarge(def) ? ((def.span ?? 1) - 1) * CONFIG.spacing : 0));
    }
    return gap;
  }

  /** The row with the most room at the entry, or -1 if every row is full. */
  private freeRow(): number {
    let best = -1;
    for (let r = 0; r < this.rowsOpen; r++) {
      if (this.belt.filter((b) => b.row === r).length >= CONFIG.maxHandBelt) continue;
      if (best < 0 || this.rowGap(r) > this.rowGap(best)) best = r;
    }
    return best;
  }

  private spawnCard(pos: number, card?: CombatCard, row = this.freeRow()): boolean {
    if (row < 0) return false;
    // A tall card rides the top row and hangs over the one below.
    if (card && CARDS[card.id].tall) row = 0;
    let c = card;
    const feed = c ? undefined : this.feedList();
    if (feed) c = this.nextFeed(feed);
    else if (!c) this.feedQueue = [];
    if (!c) {
      if (!this.draw.length) {
        if (!this.discard.length) return false;
        this.draw = this.rng.shuffle(this.discard);
        this.discard = [];
        this.events.emit({ type: 'reshuffle' });
      }
      c = this.draw.pop()!;
      // A fresh draw starts its ride from zero (a card back from the sleeve keeps its age).
      c.age = 0;
      delete c.disc;
    }
    this.belt.push({ card: c, pos, row });
    this.events.emit({ type: 'cardSpawn', card: c });
    return true;
  }

  private expire(card: CombatCard): void {
    const def = CARDS[card.id];
    // A hex stays on the card through the piles until it's broken; one already cracked is gone.
    this.shedHex(card);
    card.passed = true;
    this.stats.cardsLost++;
    if (def.sweep) card.bonus = 0;
    this.events.emit({ type: 'cardExpired', card });
    this.cheapenRandom(this.fallDiscount());
    this.withCard(card, def, () => def.onExpire?.(this, this.cardVals(card), card));
    this.heroDef.hooks.onCardExpired?.(this, card);
    for (const id of this.relics) RELICS[id]?.hooks?.onCardExpired?.(this, card);
    for (const side of ['hero', 'enemy'] as const) {
      for (const [id, s] of Object.entries(this.fighter(side).statuses)) if (this.has(side, id)) STATUSES[id].onExpire?.(this, side, s);
    }
    // A piece of sushi that slipped off is gone, not shuffled back into the deck.
    if (def.pair) {
      if (this.picked === card.uid) this.picked = null;
      return;
    }
    delete card.disc;
    if (this.keywords(card).includes('fleeting')) this.exhaust.push(card);
    else this.discard.push(card);
  }

  /** Puts the card into the first free sleeve slot. Returns false when the sleeve is full. */
  private pocket(card: CombatCard): boolean {
    const slot = this.sleeve.indexOf(null);
    if (slot < 0) return false;
    this.sleeve[slot] = card;
    this.events.emit({ type: 'cardStashed', card, slot });
    return true;
  }

  /** The mana a falling card takes off a random card in the sleeve: the passive's, and what powers add (`StatusDef.catchBonus`). */
  private fallDiscount(): number {
    let n = this.heroDef.fallDiscount ?? 0;
    for (const [id, s] of Object.entries(this.hero.statuses)) if (STATUSES[id].catchBonus && this.has('hero', id)) n += s.v;
    return n;
  }

  // --------------------------------------------------------- player actions

  /** Plays a card from the belt or sleeve. `how`: tapped, dragged onto the stage, or played itself for free (autopilot). Returns false if it couldn't be played. */
  playCard(uid: number, how: 'tap' | 'drag' | 'auto' = 'tap'): boolean {
    const free = how === 'auto';
    if (this.result || this.intro > 0) return false;
    const beltIdx = this.beltIndex(uid);
    const sleeveIdx = this.sleeveIndex(uid);
    // The sleeve is out of reach while it is sunk.
    if (sleeveIdx >= 0 && this.lowerBarred) return false;
    const card = beltIdx >= 0 ? this.belt[beltIdx].card : sleeveIdx >= 0 ? this.sleeve[sleeveIdx] : null;
    if (!card) return false;
    if (beltIdx >= 0 && this.isCovered(uid)) {
      this.events.emit({ type: 'text', target: 'hero', key: 'combat.covered', tone: 'neutral' });
      return false;
    }
    if (card.hex) {
      this.tapHex(card);
      return false;
    }
    if (CARDS[card.id].pair) return how !== 'auto' && beltIdx >= 0 && this.pairUp(card);
    if (!this.isPlayable(card)) {
      this.events.emit({ type: 'text', target: 'hero', key: 'combat.unplayable', tone: 'neutral' });
      return false;
    }
    if (this.isPending(card)) {
      this.events.emit({ type: 'text', target: 'hero', key: 'combat.pending', tone: 'neutral' });
      return false;
    }
    const rule = this.ruleBlock(card, free);
    if (rule) {
      this.events.emit({ type: 'text', target: 'hero', key: rule.key, tone: 'bad' });
      this.events.emit({ type: 'ruled', card });
      return false;
    }
    if (!free && !this.canAfford(card)) {
      this.events.emit({ type: 'cantAfford', card });
      return false;
    }
    if (how === 'drag' && CARDS[card.id].type === 'attack' && this.dragCrits()) this.applyStatus('hero', 'crit', 1);
    this.resolvePlay(card, free);
    return true;
  }

  /** A tap on a `pair` card: it is picked; a tap on a second one with the same id eats both (true), any other tap moves the pick. */
  private pairUp(card: CombatCard): boolean {
    const mate = this.picked === null ? undefined : this.belt.find((b) => b.card.uid === this.picked && b.card.uid !== card.uid)?.card;
    if (!mate || mate.id !== card.id) {
      this.picked = this.picked === card.uid ? null : card.uid;
      this.events.emit({ type: 'cardPicked', card });
      return false;
    }
    this.picked = null;
    this.belt = this.belt.filter((b) => b.card.uid !== card.uid && b.card.uid !== mate.uid);
    this.events.emit({ type: 'cardsPaired', a: mate, b: card });
    this.heal('hero', this.cardVals(card)[0] * 2);
    return true;
  }

  /** Whether something on the enemy turns a dragged attack critical. */
  private dragCrits(): boolean {
    return Object.keys(this.enemy.statuses).some((id) => this.has('enemy', id) && STATUSES[id].critOnDrag);
  }

  /** Pays for a card and plays it from wherever it is (belt or sleeve): the checks are already done. */
  private resolvePlay(card: CombatCard, free: boolean): void {
    const def = CARDS[card.id];
    const beltIdx = this.beltIndex(card.uid);
    const sleeveIdx = this.sleeveIndex(card.uid);
    const cost = this.cardCost(card);
    // X is all the mana there is; a free card still counts it, without spending it.
    const spent = cost < 0 ? this.hero.mana : cost;
    if (!free) this.hero.mana -= spent;
    const nominal = this.costOf(card);
    // On Credit: no mana now, but the regeneration stops for as many seconds as the card costs.
    if (!free && nominal > 0 && this.keywords(card).includes('credit')) this.applyStatus('hero', 'overdrawn', 1, nominal);
    else {
      const badge = this.freeNextId();
      if (badge && !free && cost === 0 && nominal > 0) this.applyStatus('hero', badge, -1, 0, true);
    }
    const row = beltIdx >= 0 ? this.belt[beltIdx].row : -1;
    // An Echo card on the belt is played again and again: it stays where it is (unless it is used up some other way); from the sleeve it is spent as usual.
    const kws = this.keywords(card);
    const echoes = beltIdx >= 0 && kws.includes('echo') && !kws.includes('exhaust') && !kws.includes('consume') && def.type !== 'power';
    if (echoes) this.events.emit({ type: 'cardEchoed', card });
    else {
      if (beltIdx >= 0) this.belt.splice(beltIdx, 1);
      else this.sleeve[sleeveIdx] = null;
    }

    this.cardsPlayed++;
    if (!echoes) this.events.emit({ type: 'cardPlayed', card, from: beltIdx >= 0 ? 'belt' : 'sleeve' });
    const vals = this.cardVals(card);
    if (cost < 0) vals.push(spent);
    // Statuses react to cards played after them: one this card applies doesn't see the card itself.
    const watching = (['hero', 'enemy'] as const).flatMap((side) =>
      Object.keys(this.fighter(side).statuses)
        .filter((id) => this.has(side, id) && STATUSES[id].onCardPlayed)
        .map((id) => [side, id] as const),
    );
    this.replaying = false;
    this.withCard(card, def, () => def.play?.(this, vals, card), row);
    if (def.sweep) card.bonus = 0;
    if (def.tenure && !card.temp) {
      card.tenure = (card.tenure ?? 0) + 1;
      this.tenured[card.uid] = card.tenure;
    }
    if (def.type === 'attack') this.removeStatus('hero', 'crit');
    if (this.result === 'lose') return;

    this.lastPlayed = def;
    this.lastPlayedAt = this.time;
    this.lastRow = beltIdx >= 0 ? row : -1;
    if (!this.replaying) this.lastPlay = { card, def, vals };
    this.heroDef.hooks.onCardPlayed?.(this, card, def, spent);
    for (const [held, hd] of this.held()) hd.inSleeve?.onCardPlayed?.(this, this.cardVals(held), held, def);
    for (const id of this.relics) RELICS[id]?.hooks?.onCardPlayed?.(this, card, def);
    for (const [side, id] of watching) if (this.has(side, id)) STATUSES[id].onCardPlayed?.(this, side, def, card);

    // Inflation lasts until the card is paid for once.
    delete card.tax;
    delete card.virus;
    delete card.disc;
    // Played, a Pending card is back in the approval queue: it must ride the whole belt again before it can be played.
    delete card.passed;
    if (echoes) return;
    const kw = kws;
    if (kw.includes('consume')) {
      if (!card.temp) this.consumed.push(card.uid);
      this.exhaustCard(card);
    } else if (kw.includes('exhaust')) {
      this.exhaustCard(card);
    } else if (def.type === 'power') {
      this.exhaust.push(card);
    } else {
      this.discard.push(card);
    }
  }

  /** Plays, for free, every card of a type that is on the belt now, the one nearest the exit first (skipping any that can't be played right now). */
  playBelt(type: CardType): void {
    const cards = this.belt.filter((b) => CARDS[b.card.id].type === type).sort((a, b) => b.pos - a.pos);
    for (const { card } of cards) {
      if (this.result) return;
      if (
        this.beltIndex(card.uid) < 0 ||
        card.hex ||
        this.isCovered(card.uid) ||
        this.isPending(card) ||
        !this.isPlayable(card) ||
        this.ruleBlock(card)
      )
        continue;
      this.resolvePlay(card, true);
    }
  }

  /** Moves a belt card into the sleeve. If the slot is taken, the two cards swap places. */
  stash(uid: number, slot?: number): boolean {
    if (this.result || this.intro > 0 || this.lowerBarred) return false;
    const beltIdx = this.beltIndex(uid);
    if (beltIdx < 0) return false;
    const target = slot ?? this.sleeve.indexOf(null);
    if (target < 0 || target >= this.sleeve.length) return false;
    const b = this.belt[beltIdx];
    // A hexed card is stuck to the belt until freed; a covered one can't be reached; a pending one waits its turn.
    if (b.card.hex || this.isCovered(uid) || this.isPending(b.card) || CARDS[b.card.id].pair) return false;
    const old = this.sleeve[target];
    // A bulky card can't be swapped out of the sleeve: it has to be played.
    if (old && this.keywords(old).includes('bulky')) return false;
    this.sleeve[target] = b.card;
    // What a card grew while it waited in the sleeve stays there.
    if (old && CARDS[old.id].inSleeve) old.bonus = 0;
    if (old) this.belt[beltIdx] = { card: old, pos: b.pos, row: b.row };
    else this.belt.splice(beltIdx, 1);
    this.events.emit({ type: 'cardStashed', card: b.card, slot: target });
    return true;
  }

  /** The cards waiting in the sleeve (leaving out `except`, the one being played). */
  sleeveCards(except?: number): CombatCard[] {
    return this.sleeve.filter((c): c is CombatCard => c !== null && c.uid !== except);
  }

  /** The sleeve gets one more slot for the rest of the fight (Lost & Found Box). */
  addSleeveSlot(): void {
    this.sleeve.push(null);
    this.events.emit({ type: 'sleeveGrew' });
  }

  /** Every card in the sleeve costs `n` mana less until it is next played (never below 0). */
  cheapenSleeve(n: number, except?: number): void {
    if (n <= 0) return;
    for (const card of this.sleeveCards(except)) this.cheapen(card, n);
    this.events.emit({ type: 'sleeveCheaper' });
  }

  /** One random card of the sleeve costs `n` mana less until it is next played (a fall, with `HeroDef.fallDiscount`). */
  cheapenRandom(n: number): void {
    const cards = this.sleeveCards().filter((card) => !isCurse(card));
    if (n <= 0 || !cards.length) return;
    this.cheapen(this.rng.pick(cards), n);
    this.events.emit({ type: 'sleeveCheaper' });
  }

  private cheapen(card: CombatCard, n: number): void {
    if (isCurse(card)) return;
    card.disc = Math.min((card.disc ?? 0) + n, Math.max(0, fullCostOf(card)));
  }

  /** Every belt card slips off at once, the one nearest the exit first, as if it had fallen off the end. Returns how many. */
  dropBelt(): number {
    const cards = [...this.belt].sort((a, b) => b.pos - a.pos);
    let n = 0;
    for (const b of cards) {
      if (this.result) break;
      const i = this.belt.indexOf(b);
      if (i < 0) continue;
      this.belt.splice(i, 1);
      this.expire(b.card);
      n++;
    }
    return n;
  }

  /** Uses up these sleeve cards (they leave the fight). Returns what they were worth: their costs without the sleeve's discount. */
  private scrap(cards: CombatCard[]): number {
    let worth = 0;
    for (const card of cards) {
      const i = this.sleeveIndex(card.uid);
      if (i < 0) continue;
      this.sleeve[i] = null;
      worth += Math.max(0, fullCostOf(card));
      delete card.disc;
      this.exhaustCard(card);
      this.events.emit({ type: 'cardDiscarded', card });
    }
    return worth;
  }

  /** Uses up every card in the sleeve (but `except`, the card being played). Returns what they were worth (Fire Sale). */
  scrapSleeve(except?: number): number {
    return this.scrap(this.sleeveCards(except));
  }

  /** Uses up one random card of the sleeve. Returns what it was worth, or -1 when the sleeve is empty (Fence It). */
  scrapOne(except?: number): number {
    const cards = this.sleeveCards(except);
    return cards.length ? this.scrap([this.rng.pick(cards)]) : -1;
  }

  /** What a card of the sleeve is worth to `scrapSleeve`, for the card faces that show the damage. */
  sleeveWorth(except?: number): number {
    return this.sleeveCards(except).reduce((n, card) => n + Math.max(0, fullCostOf(card)), 0);
  }

  /** `n` random cards of the discard pile (never curses) come back: into the free slots of the sleeve, or onto the entry of the belt. Returns how many made it. */
  retrieve(n: number, to: 'sleeve' | 'belt'): number {
    let got = 0;
    for (const card of this.rng.shuffle(this.discard.filter((c) => !isCurse(c)))) {
      if (got >= n) break;
      const gap = (CONFIG.spacing * (CARDS[card.id].span ?? 1)) / this.rowsOpen;
      if (!(to === 'sleeve' ? this.pocket(card) : this.spawnCard(-got * gap, card))) continue;
      this.discard.splice(this.discard.indexOf(card), 1);
      if (to === 'belt') card.age = 0;
      got++;
    }
    return got;
  }

  /**
   * Lifts `n` different cards of this rarity from the other heroes (never the hired hero's own, the neutral ones, or a hero still in the works) for this fight:
   * into the sleeve (what doesn't fit goes to the discard pile) or into the draw pile. `up` upgrades them, `cheaper` takes mana off, `hex` hexes each one.
   * Returns how many came.
   */
  loot(rarity: Rarity, n: number, to: 'sleeve' | 'draw', opts: { up?: boolean; cheaper?: number; hex?: string } = {}): number {
    const theirs = (cls: CardDef['cls']): boolean =>
      cls !== 'neutral' && cls !== 'curse' && cls !== this.heroDef.id && !('debug' in (HEROES[cls].unlock ?? {}));
    const pool = CARD_LIST.filter(
      (d) => d.rarity === rarity && theirs(d.cls) && !d.starterOnly && !d.pack && !d.pair && d.play && !d.keywords?.includes('unplayable'),
    );
    const picks = this.rng.shuffle(pool).slice(0, n);
    for (const def of picks) {
      const extra: Partial<CombatCard> = {};
      if (opts.cheaper) extra.cut = opts.cheaper;
      if (opts.hex) extra.hex = { id: opts.hex, left: HEXES[opts.hex].taps, t: HEXES[opts.hex].thaw };
      if (to === 'sleeve') this.addToSleeve(def.id, !!opts.up, extra);
      else this.addTempCard(def.id, 'draw', !!opts.up, 0, extra);
    }
    return picks.length;
  }

  /** A temporary copy of a card goes into the sleeve, or, with no room, into the discard pile. */
  addToSleeve(id: string, up = false, extra: Partial<CombatCard> = {}): void {
    const card: CombatCard = { uid: -++this.tempUid, id, up, bonus: 0, temp: true, ...extra };
    if (this.pocket(card)) return;
    this.discard.push(card);
    this.events.emit({ type: 'cardAdded', card, to: 'discard' });
  }

  /** Plays, for free, the playable belt card nearest the exit. Returns it, or null when none can be played (Inside Job). */
  playNextBelt(): CombatCard | null {
    const next = [...this.belt]
      .sort((a, b) => b.pos - a.pos)
      .find(({ card }) => !card.hex && !this.isCovered(card.uid) && !this.isPending(card) && this.isPlayable(card) && !this.ruleBlock(card));
    if (!next) return null;
    this.resolvePlay(next.card, true);
    return next.card;
  }

  /** Shuffles the draw pile, then stacks it so the dearest cards are drawn first (X cards count as the most mana the hero has). */
  sortDrawByCost(): void {
    const worth = (c: CombatCard): number => (fullCostOf(c) < 0 ? this.hero.maxMana : fullCostOf(c));
    // The pile is drawn from its end.
    this.draw = this.rng.shuffle(this.draw).sort((a, b) => worth(a) - worth(b));
    this.events.emit({ type: 'reshuffle' });
  }

  /** The enemy's current move is stolen: the hero does it to the enemy (damage, Block, healing and statuses with the sides swapped) and the enemy loses it. False when the move does nothing of those. */
  stealMove(): boolean {
    const m = this.enemy.move;
    const scale = this.enemy.dmgScale;
    if (!m.dmg && !m.block && !m.heal && !m.status?.length) return false;
    for (let i = 0; i < (m.hits ?? 1) && m.dmg && !this.result; i++)
      this.damage('hero', 'enemy', Math.round(m.dmg * scale), { kind: 'claw' }, 'hero', i);
    if (this.result) return true;
    if (m.block) this.gainBlock('hero', Math.round(m.block * scale));
    if (m.heal) this.heal('hero', Math.round(m.heal * scale));
    for (const st of m.status ?? []) this.applyStatus(st.target === 'hero' ? 'enemy' : 'hero', st.id, st.v ?? 1, st.t ?? 0);
    this.skipEnemyMove();
    return true;
  }

  /** Takes the enemy's Block and its buffs (`strippable`): the Block becomes the hero's, every buff is put on the hero as it was. Returns how many things it took. */
  stealBuffs(): number {
    const found = this.strippable();
    for (const id of found) {
      if (id === 'block') {
        const n = this.enemy.block;
        this.breakBlock('enemy');
        this.gainBlock('hero', n);
        continue;
      }
      const { v, t } = this.enemy.statuses[id];
      this.removeStatus('enemy', id);
      this.applyStatus('hero', id, v, STATUSES[id].kind === 'timed' ? t : 0);
    }
    return found.length;
  }

  abilityCost(): number {
    return this.heroDef.ability.cost;
  }

  abilityReady(): boolean {
    return !this.result && this.intro <= 0 && !this.lowerHidden && !this.flag('hero', 'handsTied') && this.hero.mana >= this.abilityCost();
  }

  useAbility(): boolean {
    if (!this.abilityReady()) return false;
    this.hero.mana -= this.abilityCost();
    this.stats.abilities++;
    this.events.emit({ type: 'ability', id: this.heroDef.ability.id });
    this.heroDef.ability.use(this);
    return true;
  }

  // ----------------------------------------------------- effect helpers API

  private withCard(card: CombatCard, def: CardDef, fn: () => void, row = -1): void {
    const prev = this.current;
    this.current = { card, def, row };
    try {
      fn();
    } finally {
      this.current = prev;
    }
  }

  /** Hero deals card damage to the enemy. Returns total unblocked damage. */
  hit(base: number, opts: DamageOpts = {}): number {
    const def = this.current?.def ?? null;
    const kind = opts.kind ?? (def ? (CLASS_HIT[def.cls] ?? (def.type === 'attack' ? 'slash' : 'blunt')) : 'blunt');
    let total = 0;
    for (let i = 0; i < (opts.hits ?? 1) && !this.result; i++) {
      total += this.damage('hero', 'enemy', base, { ...opts, kind }, 'hero', i);
    }
    return total;
  }

  /** Cards waiting in the sleeve, with their definitions (their `inSleeve` bonuses are active). */
  private held(): [CombatCard, CardDef][] {
    return this.sleeve.filter((c) => c !== null).map((c) => [c, CARDS[c.id]]);
  }

  /** Strength of a side: the stacks of every status that counts as Strength while active. */
  strengthOf(side: Side): number {
    let n = 0;
    for (const [id, s] of Object.entries(this.fighter(side).statuses)) if (STATUSES[id].strength && this.has(side, id)) n += s.v;
    return n;
  }

  private computeDamage(from: Side, to: Side, base: number, def: CardDef | null): number {
    let dmg = base;
    if (from === 'hero') {
      if (def?.type === 'attack') dmg += this.strengthOf('hero');
      dmg += this.heroDef.hooks.bonusDamage?.(this, def) ?? 0;
      for (const [held, hd] of this.held()) dmg += hd.inSleeve?.bonusDamage?.(this, this.cardVals(held), def) ?? 0;
      dmg *= this.heroDef.hooks.damageMult?.(this, def) ?? 1;
      for (const id of this.relics) dmg *= RELICS[id]?.hooks?.damageMult?.(this, def) ?? 1;
      if (def?.type === 'attack' && this.has('hero', 'crit')) dmg *= CONFIG.critMult;
    } else {
      dmg += this.strengthOf('enemy');
    }
    dmg *= this.mul(from, 'dealtMul') * this.mul(to, 'takenMul');
    if (from === 'hero') dmg = Math.min(dmg - this.hitCut(), this.hitCap());
    return Math.max(0, Math.floor(dmg));
  }

  /** Damage every hit of the hero's cards loses to the enemy's plating (Fine Print). */
  private hitCut(): number {
    let n = 0;
    for (const [id, s] of Object.entries(this.enemy.statuses)) if (STATUSES[id].cutsHits && this.has('enemy', id)) n += s.v;
    return n;
  }

  /** The most one hit of the hero's cards can deal now (Rate Limit), if anything caps it. */
  private hitCap(): number {
    let cap = Infinity;
    for (const [id, s] of Object.entries(this.enemy.statuses)) if (STATUSES[id].capsHits && this.has('enemy', id)) cap = Math.min(cap, s.v);
    return cap;
  }

  /** Core damage routine. Returns HP actually lost. */
  damage(from: Side, to: Side, base: number, opts: DamageOpts, source: Side | 'dot', hitIndex = 0): number {
    if (this.result) return 0;
    const target = this.fighter(to);
    const dmg = opts.raw ? base : this.computeDamage(from, to, base, this.current?.def ?? null);

    // Dodge: immune to every kind of damage while it lasts.
    if (this.flag(to, 'immune')) {
      if (to === 'hero' && source === 'enemy') {
        this.events.emit({ type: 'text', target: 'hero', key: 'combat.dodged', tone: 'good' });
        for (const [id, s] of Object.entries(target.statuses)) if (this.has(to, id)) STATUSES[id].onDodge?.(this, to, s);
      }
      return 0;
    }

    if (to === 'hero' && source === 'enemy') {
      const id = this.relics.find((r) => RELICS[r]?.hooks?.cancelHit?.(this, dmg));
      if (id) {
        this.events.emit({ type: 'relic', id });
        return 0;
      }
    }

    const blocked = opts.ignoreBlock ? 0 : Math.min(target.block, dmg);
    target.block -= blocked;
    // An absorbing enemy stores what the hero's cards deal (damage over time still gets through).
    if (to === 'enemy' && source === 'hero' && this.enemy.move.absorb && dmg - blocked > 0) {
      this.enemy.stored += dmg - blocked;
      this.events.emit({ type: 'absorbed', amount: dmg - blocked });
      return 0;
    }
    const lost = Math.min(target.hp, dmg - blocked);
    target.hp -= lost;
    if (to === 'enemy') {
      this.stats.damageDealt += lost;
      if (source === 'dot') this.stats.damageDot += lost;
      this.stats.enemyBlocked += blocked;
    } else this.stats.heroBlocked += blocked;
    this.events.emit({ type: 'damage', target: to, amount: dmg - blocked, blocked, source, hitIndex, kind: opts.kind ?? 'hit' });
    if (lost > 0) for (const [id, s] of Object.entries(target.statuses)) if (this.has(to, id)) STATUSES[id].onHurt?.(this, to, s, lost);
    if (lost > 0 && to === 'hero') {
      this.stats.damageTaken += lost;
      this.hurtLog.push({ t: this.time, n: lost });
    }

    if (source === 'enemy' && to === 'hero') {
      this.heroDef.hooks.onHeroHit?.(this, lost);
      for (const [held, hd] of this.held()) hd.inSleeve?.onHeroHit?.(this, this.cardVals(held), held, lost);
      const thorns = this.stacks('hero', 'thorns');
      if (thorns > 0) this.damage('hero', 'enemy', thorns, { raw: true, kind: 'thorns' }, 'hero');
      const parry = this.fighter('hero').statuses.parry;
      if (parry && parry.t > 0) {
        delete this.hero.statuses.parry;
        this.events.emit({ type: 'text', target: 'hero', key: 'combat.parried', tone: 'good' });
        this.damage('hero', 'enemy', parry.v, { raw: true, kind: 'slash' }, 'hero');
      }
    }
    if (source === 'hero' && to === 'enemy' && !opts.raw && this.current?.def.type === 'attack') {
      const thorns = this.stacks('enemy', 'thorns');
      if (thorns > 0) this.damage('enemy', 'hero', thorns, { raw: true, kind: 'thorns' }, 'dot');
    }

    this.checkDeaths();
    return lost;
  }

  private checkDeaths(): void {
    if (this.result || this.begging) return;
    const e = this.enemy;
    if (e.hp <= 0 && !this.reprieve()) {
      this.end('win');
      return;
    }
    if (!e.halfTriggered && e.hp <= e.maxHp * halfAtOf(e.def)) {
      e.halfTriggered = true;
      if (e.def.onHalf) {
        e.def.onHalf(this);
        this.events.emit({ type: 'enrage' });
      }
    }
    for (const phases = e.def.phases; phases && e.phase < phases.length && e.hp <= e.maxHp * phases[e.phase].at; ) this.enterPhase(e.phase + 1);
    if (this.hero.hp <= 0) {
      if (this.insured()) return;
      for (const id of this.relics) {
        if (RELICS[id]?.hooks?.onDeath?.(this)) {
          this.events.emit({ type: 'relic', id });
          return;
        }
      }
      if (this.canBeg) {
        this.begging = true;
        this.events.emit({ type: 'beg' });
        return;
      }
      this.end('lose');
    }
  }

  /** A boss crosses into its next phase (`EnemyDef.phases`): the belt changes, and it starts its new pattern from the top. */
  private enterPhase(index: number): void {
    const e = this.enemy;
    const p = e.def.phases![index - 1];
    e.phase = index;
    e.mainsLeft = p.every;
    e.specialIdx = 0;
    this.phaseBeltMul = p.belt.mul;
    this.setBeltRows(p.belt.rows);
    this.skipEnemyMove();
    this.events.emit({ type: 'phase', index });
  }

  /** The belt gets `rows` rows: cards on a row that goes away are discarded; an extra row opens at once unless the belt was shut down. */
  private setBeltRows(rows: number): void {
    if (rows === this.beltRows) return;
    const wasOpen = this.rowsOpen >= this.beltRows;
    for (const b of this.belt.filter((x) => x.row >= rows)) {
      this.shedHex(b.card);
      this.discard.push(b.card);
      this.events.emit({ type: 'cardDiscarded', card: b.card });
    }
    this.belt = this.belt.filter((x) => x.row < rows);
    this.beltRows = rows;
    this.rowsOpen = wasOpen ? rows : Math.min(this.rowsOpen, rows);
    this.events.emit({ type: 'rows' });
  }

  /** True when a status on the hero lets them survive a lethal hit (Life Insurance). */
  private insured(): boolean {
    for (const [id, s] of Object.entries(this.hero.statuses)) if (this.has('hero', id) && STATUSES[id].onDeath?.(this, 'hero', s)) return true;
    return false;
  }

  /** `n` sleeve slots are lost for good: the run takes them off from the next fight on (Life Insurance). */
  loseSleeveSlots(n: number): void {
    this.sleeveLost += n;
  }

  /** True when a status on the enemy lets it survive a lethal hit (Golden Parachute). */
  private reprieve(): boolean {
    for (const [id, s] of Object.entries(this.enemy.statuses)) {
      if (!this.has('enemy', id) || !STATUSES[id].onDeath?.(this, 'enemy', s)) continue;
      this.events.emit({ type: 'revive' });
      return true;
    }
    return false;
  }

  /** The answer to the offer to beg to stay: yes, and the hero is back on their feet (full HP and mana, no debuffs, a spare crystal, Dodge and Strength) for the rest of the fight; no, and it is lost. */
  /** Plays, for free, every card waiting in the sleeve (skipping any that can't be played right now). */
  playSleeve(): void {
    if (this.lowerBarred) return;
    for (const card of this.sleeve.filter((c) => c !== null)) {
      if (this.result) return;
      if (this.sleeveIndex(card.uid) < 0 || card.hex || this.isPending(card) || !this.isPlayable(card) || this.ruleBlock(card)) continue;
      this.resolvePlay(card, true);
    }
  }

  beg(accept: boolean): void {
    if (!this.begging) return;
    this.begging = false;
    if (!accept) {
      this.end('lose');
      return;
    }
    this.canBeg = false;
    this.relicFlags[BEG_FLAG] = 1;
    this.hero.hp = this.hero.maxHp;
    for (const id of Object.keys(this.hero.statuses)) if (!STATUSES[id]?.good) this.removeStatus('hero', id);
    this.addManaCrystals(CONFIG.beg.crystals);
    this.hero.mana = this.hero.maxMana;
    this.applyStatus('hero', 'dodge', 1, CONFIG.beg.dodge);
    this.applyStatus('hero', 'strength', CONFIG.beg.strength);
    this.events.emit({ type: 'begged' });
  }

  private end(result: CombatResult): void {
    if (this.result) return;
    this.result = result;
    if (result === 'win') for (const id of this.relics) RELICS[id]?.hooks?.onCombatEnd?.(this);
    this.events.emit({ type: 'end', result });
  }

  gainBlock(side: Side, n: number): void {
    if (n <= 0 || this.result) return;
    const f = this.fighter(side);
    f.block += n;
    if (side === 'hero') this.stats.blockGained += n;
    f.blockTimer = 0;
    this.events.emit({ type: 'block', target: side, amount: n });
    if (side === 'hero') {
      const jug = this.stacks('hero', 'juggernaut');
      if (jug > 0) this.damage('hero', 'enemy', jug, { raw: true, kind: 'blunt' }, 'hero');
    }
  }

  /** The hero gives up all its Block (Blow Off Steam) and gets back how much it was. */
  spendBlock(): number {
    const n = this.hero.block;
    this.hero.block = 0;
    return n;
  }

  heal(side: Side, n: number): number {
    const f = this.fighter(side);
    const amount = Math.min(n, f.maxHp - f.hp);
    if (amount <= 0) return 0;
    f.hp += amount;
    if (side === 'hero') this.stats.healed += amount;
    this.events.emit({ type: 'heal', target: side, amount });
    return amount;
  }

  /** The hero's max HP grows for this fight, and so does its HP (a mushroom). */
  gainMaxHp(n: number): void {
    const h = this.hero;
    h.maxHp += n;
    h.hp += n;
    this.events.emit({ type: 'heal', target: 'hero', amount: n });
  }

  loseHp(n: number): void {
    const lost = Math.min(this.hero.hp, n);
    this.hero.hp -= lost;
    if (lost > 0) {
      this.stats.damageTaken += lost;
      this.hurtLog.push({ t: this.time, n: lost });
    }
    this.events.emit({ type: 'damage', target: 'hero', amount: lost, blocked: 0, source: 'dot', hitIndex: 0, kind: 'blood' });
    this.checkDeaths();
  }

  gainMana(n: number): void {
    const h = this.hero;
    const before = h.mana;
    h.mana = Math.min(h.maxMana, h.mana + n);
    if (h.mana > before) this.events.emit({ type: 'mana', amount: h.mana - before });
  }

  /** A status that goes off every so often just did: the UI plays its `cue`. */
  cue(side: Side, id: string): void {
    this.events.emit({ type: 'cue', side, id });
  }

  drainMana(n: number): void {
    const lost = Math.min(this.hero.mana, n);
    this.hero.mana -= lost;
    this.events.emit({ type: 'manaDrain', amount: lost });
  }

  /** Adds empty mana crystals: the cap grows, the new crystals fill up over time. */
  addManaCrystals(n: number): void {
    const h = this.hero;
    const before = h.maxMana;
    h.maxMana = Math.min(this.manaCap(), h.maxMana + n);
    if (h.maxMana > before) this.events.emit({ type: 'manaCrystal', amount: h.maxMana - before });
  }

  applyStatus(side: Side, id: string, v: number, t = 0, silent = false): void {
    if (this.result) return;
    const def = STATUSES[id];
    const f = this.fighter(side);
    f.statuses[id] ??= { v: 0, t: 0 };
    const s = f.statuses[id];
    if (def.kind === 'timed') {
      s.t += t || v;
      s.v = Math.max(s.v, t ? v : 1);
    } else {
      s.v += v;
      if (s.v <= 0) delete f.statuses[id];
    }
    if (!silent) this.events.emit({ type: 'status', target: side, id, amount: def.kind === 'timed' ? t || v : v });
    if (side === 'enemy' && v > 0) {
      this.heroDef.hooks.onEnemyStatus?.(this, id, v);
      for (const [k, own] of Object.entries(this.hero.statuses)) if (this.has('hero', k)) STATUSES[k].onEnemyStatus?.(this, id, own);
    }
  }

  /** The most Multitasking charges the hero can hold: the base cap, or more under a status with `multiCap`. */
  multitaskingMax(): number {
    let cap: number = CONFIG.multitaskingMax;
    for (const [id, s] of Object.entries(this.hero.statuses)) if (STATUSES[id].multiCap && this.has('hero', id)) cap = Math.max(cap, s.v);
    return cap;
  }

  /** One more Multitasking charge (up to the cap), with a fresh window. */
  chargeMultitasking(): void {
    const v = Math.min(this.multitaskingMax(), this.stacks('hero', 'multitasking') + 1);
    this.hero.statuses.multitasking = { v, t: CONFIG.multitaskingWindow };
  }

  removeStatus(side: Side, id: string): void {
    delete this.fighter(side).statuses[id];
  }

  /** Speeds the belt up for `t` seconds: cards (and new draws) come faster. A hero status, so it shows with a timer. */
  rushBelt(t: number): void {
    this.applyStatus('hero', 'rush', 1, t);
  }

  /**
   * Adds a temporary card (curses, generated cards) to a pile or straight onto the belt. `at` < 0 queues a belt card
   * just before the entry, so several arriving together come in one after the other. `extra` is what a copy carries over (perks, `fleeting`).
   */
  addTempCard(id: string, to: 'belt' | 'draw' | 'discard', up = false, at = 0, extra: Partial<CombatCard> = {}): CombatCard {
    // Temporary cards get negative uids so they never collide with deck cards.
    const card: CombatCard = { uid: -++this.tempUid, id, up, bonus: 0, temp: true, ...extra };
    if (to === 'belt' && this.spawnCard(at, card)) {
      // already riding
    } else if (to !== 'discard') {
      // A card that finds no room on the belt is shuffled into the draw pile like any other added card (the whole pile, so a short one doesn't keep copies side by side).
      this.draw.push(card);
      this.draw = this.rng.shuffle(this.draw);
    } else {
      this.discard.push(card);
    }
    this.events.emit({ type: 'cardAdded', card, to });
    return card;
  }

  /** Removes every curse from the belt, the sleeve and the piles (one from the run's own deck is gone for good). Returns how many. */
  removeCurses(): number {
    const gone: CombatCard[] = [];
    for (const b of this.belt.filter((x) => isCurse(x.card))) {
      this.belt.splice(this.belt.indexOf(b), 1);
      gone.push(b.card);
      this.events.emit({ type: 'cardDiscarded', card: b.card });
    }
    this.sleeve.forEach((c, i) => {
      if (!c || !isCurse(c)) return;
      this.sleeve[i] = null;
      gone.push(c);
      this.events.emit({ type: 'cardDiscarded', card: c });
    });
    for (const pile of [this.draw, this.discard]) {
      for (let i = pile.length - 1; i >= 0; i--) if (isCurse(pile[i])) gone.push(...pile.splice(i, 1));
    }
    for (const card of gone) if (!card.temp) this.consumed.push(card.uid);
    return gone.length;
  }

  /** What `stripBuffs` would take off the enemy now: its Block (as `'block'`) and every buff (a good status that isn't one of its permanent traits). */
  strippable(): string[] {
    const found = this.enemy.block > 0 ? ['block'] : [];
    for (const id of Object.keys(this.enemy.statuses)) {
      const def = STATUSES[id];
      if (this.has('enemy', id) && def.good && !def.passive && !def.hidden) found.push(id);
    }
    return found;
  }

  /** Strips the enemy of its Block and of every buff. Returns how many things it lost. */
  stripBuffs(): number {
    const found = this.strippable();
    for (const id of found) {
      if (id === 'block') this.breakBlock('enemy');
      else this.removeStatus('enemy', id);
    }
    return found.length;
  }

  /** Hands every debuff the hero carries that can hurt the enemy too (`StatusDef.passable`) over to it, as it was. Returns how many. */
  passDebuffs(): number {
    let n = 0;
    for (const [id, s] of Object.entries(this.hero.statuses)) {
      const def = STATUSES[id];
      if (!def.passable || !this.has('hero', id)) continue;
      const { v, t } = s;
      this.removeStatus('hero', id);
      this.applyStatus('enemy', id, v, def.kind === 'timed' ? t : 0);
      n++;
    }
    return n;
  }

  /** Exhausts the whole belt (no leave-the-belt effects). Returns how many cards it held. */
  exhaustBelt(): number {
    const cards = this.belt.splice(0).map((b) => b.card);
    for (const card of cards) {
      this.shedHex(card);
      this.exhaustCard(card);
      this.events.emit({ type: 'cardDiscarded', card });
    }
    return cards.length;
  }

  /** Uses a card up for this fight and lets the statuses that watch for it (`StatusDef.onExhaust`) react. */
  private exhaustCard(card: CombatCard): void {
    this.exhaust.push(card);
    for (const [id, s] of Object.entries(this.hero.statuses)) if (this.has('hero', id)) STATUSES[id].onExhaust?.(this, 'hero', s, card);
  }

  /** Shuffles up to `n` random cards exhausted this fight back into the draw pile (never consumed or temporary ones). Returns how many. */
  recycleExhausted(n: number): number {
    const back = this.rng.shuffle(this.exhaust.filter((c) => !c.temp && !this.consumed.includes(c.uid))).slice(0, n);
    for (const card of back) {
      this.exhaust.splice(this.exhaust.indexOf(card), 1);
      this.draw.splice(this.rng.int(0, this.draw.length), 0, card);
    }
    if (back.length) this.events.emit({ type: 'reshuffle' });
    return back.length;
  }

  /** HP the hero lost in the last `seconds` of the fight. */
  hpLostWithin(seconds: number): number {
    return this.hurtLog.filter((x) => x.t >= this.time - seconds).reduce((sum, x) => sum + x.n, 0);
  }

  /** The enemy drops the move it is charging and starts on the next one of its pattern. */
  skipEnemyMove(): void {
    const e = this.enemy;
    this.endTask(this.task || this.shells ? 'close' : undefined);
    e.timer = 0;
    e.move = this.nextEnemyMove();
    this.events.emit({ type: 'enemyIntent', move: e.move });
  }

  /** Resolves the last card played again, with the same values. */
  replayLast(): void {
    const last = this.lastPlay;
    if (!last?.def.play) return;
    const play = last.def.play;
    this.replaying = true;
    this.withCard(last.card, last.def, () => play(this, [...last.vals], last.card));
  }

  /** Every belt card becomes a temporary copy of the last card played; the originals go to the discard pile. */
  copyLastOntoBelt(): void {
    const last = this.lastPlay;
    if (!last) return;
    for (const b of this.belt) {
      this.shedHex(b.card);
      this.discard.push(b.card);
      this.events.emit({ type: 'cardDiscarded', card: b.card });
      b.card = { uid: -++this.tempUid, id: last.card.id, up: last.card.up, bonus: 0, temp: true };
      this.events.emit({ type: 'cardSpawn', card: b.card });
    }
  }

  /** The rust the enemy's status brings, if any. */
  private rustDef(): NonNullable<StatusDef['rust']> | undefined {
    for (const id of Object.keys(this.enemy.statuses)) if (this.has('enemy', id) && STATUSES[id].rust) return STATUSES[id].rust;
    return undefined;
  }

  /** Whether the enemy rusts the belt (the mop shows up beside it). */
  get rustsBelt(): boolean {
    return !!this.rustDef();
  }

  /** Whether the rust has piled up enough that the belt is about to stop (the mop warns). */
  get rustAlarm(): boolean {
    const rust = this.rustDef();
    return !!rust && this.rustSpots.length >= rust.max * rust.warn;
  }

  /** Share of the belt's speed the rust leaves: it eases out along a sine (ease-in-out) of the spots' share of `max`, so a few are nothing and many stop the belt. */
  private rustSpeed(): number {
    const max = this.rustDef()?.max;
    if (!max) return 1;
    const share = Math.min(1, this.rustSpots.length / max);
    return (1 + Math.cos(Math.PI * share)) / 2;
  }

  private tickRust(dt: number): void {
    const rust = this.rustDef();
    if (!rust) return;
    this.rustClock += dt;
    if (this.rustClock < rust.every) return;
    this.rustClock -= rust.every;
    // Past the point where the belt is already stopped, more rust changes nothing.
    if (this.rustSpots.length >= rust.max) return;
    if (this.rustSpots.length === 0) this.events.emit({ type: 'rust' });
    this.rustSpots.push({ id: ++this.rustId, x: 0.06 + this.rng.next() * 0.8, y: 0.12 + this.rng.next() * 0.7, grime: 1 });
    this.syncRustStatus();
    // The belt has just stopped dead: he hands the job over.
    if (this.rustSpots.length === rust.max) this.say('status.deferredMaintenance.speech');
  }

  /** The window the enemy's status brings, if any. */
  private popupDef(): NonNullable<StatusDef['popup']> | undefined {
    for (const id of Object.keys(this.enemy.statuses)) if (this.has('enemy', id) && STATUSES[id].popup) return STATUSES[id].popup;
    return undefined;
  }

  /** How far the fake update has got, in percent: 0 to 90 in the first `install` seconds, then the last 10 in as many again (the decimals show); each leg eases out (cubic), so it crawls at the end of both. */
  updateProgress(): number {
    const def = this.popupDef();
    if (!def || this.popup?.phase !== 'install') return 0;
    const u = this.popup.t / def.install;
    const easeOut = (x: number): number => 1 - (1 - Math.min(1, x)) ** 3;
    return u < 1 ? 90 * easeOut(u) : 90 + 10 * easeOut(u - 1);
  }

  private tickPopup(dt: number): void {
    const def = this.popupDef();
    if (!def) {
      this.popup = null;
      return;
    }
    if (!this.popup) {
      this.popupWait ??= def.first;
      this.popupWait -= dt;
      if (this.popupWait > 0) return;
      this.popup = { phase: 'ask', t: 0 };
      this.events.emit({ type: 'popup', phase: 'open' });
      return;
    }
    this.popup.t += dt;
    if (this.popup.phase !== 'install' || this.popup.t < def.install * 2) return;
    this.popup = null;
    this.updated = true;
    this.popupWait = def.every;
    this.applyStatus('enemy', def.patch.id, def.patch.v);
    this.events.emit({ type: 'popup', phase: 'close' });
    this.say('status.updateNeeded.speech');
  }

  /** Whether the window's question can be answered: it's up and has been long enough to be read (`CONFIG.popupArm`). */
  canAnswerUpdate(): boolean {
    return this.popup?.phase === 'ask' && this.popup.t >= CONFIG.popupArm && !this.result;
  }

  /** The hero taps Postpone: the window goes away and comes back in a few seconds. False when there's no question to answer. */
  postponeUpdate(): boolean {
    const def = this.popupDef();
    if (!def || !this.canAnswerUpdate()) return false;
    this.popup = null;
    this.popupWait = (def.postpone[0] + this.rng.next() * (def.postpone[1] - def.postpone[0])) * (this.updated ? def.postponeMul : 1);
    this.events.emit({ type: 'popup', phase: 'close' });
    return true;
  }

  /** The hero taps Update: the progress bar starts and the belt stays covered until it's done. False when there's no question to answer. */
  startUpdate(): boolean {
    if (!this.canAnswerUpdate()) return false;
    this.popup = { phase: 'install', t: 0 };
    this.events.emit({ type: 'popup', phase: 'install' });
    return true;
  }

  /** Sets up the chore of the move being charged, and ends it when it is done (the pour of the coffee, the right card of the shell game). */
  private tickTask(dt: number): void {
    const kind = this.enemy.move.task;
    if (!kind) {
      this.taskSeen = false;
      return;
    }
    const chore = this.task ?? this.shells;
    const id = this.enemy.def.id;
    if (!chore) {
      if (this.taskSeen) return;
      this.taskSeen = true;
      if (kind === 'coffee') this.task = new CoffeeTask(this.rng);
      else this.shells = new ShellGame(this.rng);
      this.events.emit({ type: 'task', phase: 'open' });
      this.say(`enemy.${id}.order`);
      return;
    }
    if (!chore.tick(dt)) return;
    // The chore is done: the move is off, and its maker is left stunned for a moment.
    this.events.emit({ type: 'task', phase: 'done' });
    this.say(`enemy.${id}.calm`);
    this.endTask();
    this.skipEnemyMove();
    this.applyStatus('enemy', 'stun', 1, CONFIG[kind].calm);
  }

  /** Closes the chore window (`phase` tells the UI why: the move landed, or was dropped). */
  private endTask(phase?: 'close'): void {
    this.task = null;
    this.shells = null;
    this.taskSeen = false;
    if (phase) this.events.emit({ type: 'task', phase });
  }

  /** A mistake in a chore takes `c.penalty` s off the move's countdown, up to `c.penaltyMax` in all. */
  private fine(chore: { errors: number; fined: number }, c: { penalty: number; penaltyMax: number }): void {
    const cut = Math.min(c.penalty, c.penaltyMax - chore.fined);
    chore.errors++;
    chore.fined += cut;
    this.enemy.timer += cut;
    this.events.emit({ type: 'task', phase: 'wrong' });
  }

  /**
   * The hero's hand on the machine. A `wrong` one (a coin that bounces, a wrong key, a start with no cup or the wrong sugar) is fined (`fine`).
   * Returns null when there is no chore to do.
   */
  coffee(action: CoffeeAction): CoffeeResult | null {
    const task = this.task;
    if (!task || this.result || this.begging) return null;
    const r = task.act(action);
    if (r === 'wrong') this.fine(task, CONFIG.coffee);
    return r;
  }

  /** The hero turns over the card in this place of the shell game; a wrong one is fined. Returns null when there is no game on. */
  pickShell(place: number): ShellResult | null {
    const game = this.shells;
    if (!game || this.result || this.begging) return null;
    const r = game.pick(place);
    if (r === 'wrong') this.fine(game, CONFIG.shells);
    return r;
  }

  /** The hero scrubs a rust spot with the mop: `amount` of its grime comes off, and it's gone at 0. */
  scrubRust(id: number, amount: number): void {
    const spot = this.rustSpots.find((x) => x.id === id);
    if (!spot) return;
    spot.grime -= amount;
    if (spot.grime <= 0) {
      this.rustSpots = this.rustSpots.filter((x) => x !== spot);
      this.syncRustStatus();
    }
  }

  /** The hero's Rusty Belt chip counts the spots (set silently: it changes all the time). */
  private syncRustStatus(): void {
    if (this.rustSpots.length) this.hero.statuses.rustedBelt = { v: this.rustSpots.length, t: 0 };
    else delete this.hero.statuses.rustedBelt;
  }

  /** The hero starts dragging a card around: a card on the belt is held at its end for a while (see `dragged`). */
  startDrag(uid: number): void {
    this.dragged = this.beltIndex(uid) >= 0 ? uid : null;
    this.dragEdge = 0;
  }

  /** The hero lets go of the card (or it is gone). */
  endDrag(): void {
    this.dragged = null;
    this.dragEdge = 0;
  }

  /**
   * The hero drags a card with `sweep` over another card of the belt: that one is knocked off (it counts as lost, as if it had
   * fallen off the end) and the sweeper grows. False when there is nothing to sweep (a hexed or pinned card stays put).
   */
  sweepCard(uid: number, victim: number): boolean {
    const card = this.belt[this.beltIndex(uid)]?.card ?? this.sleeve[this.sleeveIndex(uid)];
    const sweep = card && CARDS[card.id].sweep;
    const i = this.beltIndex(victim);
    if (!card || !sweep || i < 0 || victim === uid || this.result || this.intro > 0) return false;
    const b = this.belt[i];
    if (b.card.hex || b.pinned) return false;
    const vals = this.cardVals(card);
    card.bonus = Math.min(vals[sweep.max], card.bonus + vals[sweep.by]);
    this.belt.splice(i, 1);
    this.expire(b.card);
    return true;
  }

  /** Shows a target somewhere on the enemy's sprite for `time` seconds. */
  openWeakSpot(time: number): void {
    const m = CONFIG.weakSpotMargin;
    this.weakSpot = { x: m + this.rng.next() * (1 - 2 * m), y: m + this.rng.next() * (1 - 2 * m), t: time };
    this.events.emit({ type: 'weakSpot', x: this.weakSpot.x, y: this.weakSpot.y });
  }

  /** The hero taps the target in time: the next attack is critical. False when there's no target to hit. */
  hitWeakSpot(): boolean {
    if (!this.weakSpot || this.result) return false;
    this.weakSpot = null;
    if (!this.has('hero', 'crit')) this.applyStatus('hero', 'crit', 1);
    return true;
  }

  /** Hexes a random `share` (0–1, rounded up) of the belt cards and of the rest of the deck (draw and discard piles), never curses. */
  hexCards(id: string, share: number): void {
    const hex = HEXES[id];
    const fits = (c: CombatCard): boolean => !c.hex && !isCurse(c);
    const some = (cards: CombatCard[]): CombatCard[] => {
      const ok = cards.filter(fits);
      return this.rng.shuffle(ok).slice(0, Math.ceil(ok.length * share));
    };
    for (const card of [...some(this.belt.map((b) => b.card)), ...some([...this.draw, ...this.discard])]) {
      card.hex = { id, left: hex.taps, t: hex.thaw };
      this.events.emit({ type: 'hexed', card });
    }
  }

  /** `n` random cards (belt first, then the rest of the deck; `deckOnly`: just the piles) are hexed, and cost `cheaper` less for the rest of the fight (Voodoo Pin); `upgrade` upgrades them for it too (Statuette). */
  pinCards(id: string, n: number, cheaper: number, opts: { upgrade?: boolean; deckOnly?: boolean } = {}): void {
    const hex = HEXES[id];
    for (const card of this.pickCards((c) => !isCurse(c) && !c.hex && this.cardCost(c) > 0, n, opts.deckOnly)) {
      card.hex = { id, left: hex.taps, t: hex.thaw };
      card.cut = (card.cut ?? 0) + cheaper;
      if (opts.upgrade) card.up = true;
      this.events.emit({ type: 'hexed', card });
    }
  }

  /** Inflation: `n` random cards (belt first, then the rest of the deck) cost 1 more mana until they're next played. */
  inflateCards(n: number): void {
    for (const card of this.pickCards((c) => !isCurse(c) && this.cardCost(c) >= 0, n)) {
      card.tax = (card.tax ?? 0) + 1;
      this.events.emit({ type: 'inflated', card });
    }
  }

  /** Virus: `n` random cards (belt first, then the rest of the deck) are infected until they're next played. */
  infectCards(n: number): void {
    for (const card of this.pickCards((c) => !isCurse(c) && !c.virus && this.cardCost(c) >= 0, n)) this.infect(card);
  }

  private infect(card: CombatCard): void {
    card.virus = { t: 0, spread: false };
    this.events.emit({ type: 'infected', card });
  }

  /** An infected card on the belt, after its delay, infects the card right behind it (the nearest one that isn't already sick); a curse never counts. */
  private spreadVirus(b: BeltCard, dt: number): void {
    const virus = b.card.virus;
    if (!virus || virus.spread) return;
    virus.t += dt;
    if (virus.t < CONFIG.virusDelay) return;
    const behind = this.belt.filter((x) => x.pos < b.pos && !x.card.virus && !isCurse(x.card)).sort((p, q) => q.pos - p.pos)[0];
    if (!behind) return;
    virus.spread = true;
    this.infect(behind.card);
  }

  /** A cracked hex thaws away over its `thaw` seconds, on the belt or in the sleeve (a card caught or retrieved with its stone still on). */
  private thawHex(card: CombatCard, dt: number): void {
    const hex = card.hex;
    if (!hex || hex.left > 0) return;
    hex.t -= dt;
    if (hex.t > 0) return;
    delete card.hex;
    this.events.emit({ type: 'hexBroken', card });
  }

  /** A tap on a hexed card chips at the hex instead of playing it; the last tap starts the thaw. */
  private tapHex(card: CombatCard): void {
    const hex = card.hex!;
    if (hex.left <= 0) return;
    hex.left--;
    this.events.emit({ type: 'hexTap', card });
  }

  /** Brings the enemy's current move closer by `s` seconds. */
  hurryEnemy(s: number): void {
    const e = this.enemy;
    e.timer = Math.min(e.move.windup, e.timer + s);
  }

  /** The belt card closest to the exit: the one a steal takes. */
  private stealIndex(): number {
    let idx = 0;
    for (let i = 1; i < this.belt.length; i++) if (this.belt[i].pos > this.belt[idx].pos) idx = i;
    return this.belt.length ? idx : -1;
  }

  /** The card a steal is about to take: marked for the last `CONFIG.stealWarn` seconds of the wind-up. */
  stealTarget(): CombatCard | null {
    const e = this.enemy;
    if (!e.move.steal || this.result || e.move.windup - e.timer > CONFIG.stealWarn) return null;
    const idx = this.stealIndex();
    return idx < 0 ? null : this.belt[idx].card;
  }

  /** The enemy steals the belt card closest to the exit; it's gone for this fight. */
  private stealCard(): void {
    const idx = this.stealIndex();
    if (idx < 0) return;
    const [b] = this.belt.splice(idx, 1);
    this.exhaust.push(b.card);
    this.events.emit({ type: 'cardStolen', card: b.card });
  }
}
