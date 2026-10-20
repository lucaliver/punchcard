import { Emitter } from '../core/emitter';
import { Rng } from '../core/rng';
import { nextUid } from '../core/util';
import { CONFIG } from '../data/config';
import { CARDS, card, costOf, fxOf, spiritOf } from '../data/cards';
import { foe as foeDef } from '../data/foes';
import { KEEPERS } from '../data/keepers';
import { RELICS, relicMods } from '../data/relics';
import {
  COLS,
  type CardInst,
  type Effect,
  type FoeAbility,
  type FoeDef,
  type KeeperId,
  PLACE_ROW,
  ROWS,
  type Scope,
  type SpiritDef,
  type StageDef,
  type Terrain,
} from './types';

/**
 * The fight engine. Pure and deterministic: no DOM, no clock, only `rng` and the `dt` it is stepped with, so a seed replays and the balance
 * bot can run thousands of fights. The UI subscribes to `events` and reads the state each frame; it never writes to it, it calls the actions.
 */

export interface UnitFx {
  /** Seconds it cannot act. */
  stun: number;
  /** Seconds its attacks are slowed by a web. */
  web: number;
  /** Extra damage share, and for how long. */
  bless: number;
  blessT: number;
}

export interface Unit {
  uid: number;
  cardId: string;
  def: SpiritDef;
  /** Set down from an upgraded card. */
  up: boolean;
  lane: number;
  row: number;
  level: number;
  hp: number;
  maxHp: number;
  /** Seconds until its next strike / oil / heal. */
  cd: number;
  prodT: number;
  healT: number;
  /** Seconds until it may slide to another lane. */
  roamT: number;
  /** Seconds it has left (a decoy), or null. */
  life: number | null;
  fx: UnitFx;
  revived: boolean;
  /** Bonus read from auras this tick. */
  rateAura: number;
  dmgAura: number;
  /** On a shrine tile. */
  shrine: boolean;
  /** Seconds since it was set down. */
  age: number;
  dead: boolean;
}

export interface FoeFx {
  stun: number;
  slow: number;
  slowT: number;
  burn: number;
  burnT: number;
  /** Seconds a foe takes extra damage. */
  vulnT: number;
}

export interface Foe {
  uid: number;
  def: FoeDef;
  lane: number;
  /** In rows; see `types.ts`. */
  y: number;
  hp: number;
  maxHp: number;
  cd: number;
  fx: FoeFx;
  /** One timer per ability of its definition. */
  ab: number[];
  leaped: boolean;
  /** Speed granted by a hasten aura this tick. */
  boost: number;
  /** The spirit it is fighting now (read by the UI). */
  engaged: number | null;
  age: number;
  dead: boolean;
}

export type BattleEvent =
  | { type: 'start' }
  | { type: 'spawn'; foe: Foe }
  | { type: 'place'; unit: Unit; merged: boolean }
  | { type: 'played'; slot: number; card: CardInst; lane: number; row: number }
  | { type: 'draw'; slot: number; card: CardInst }
  | { type: 'shuffle' }
  | { type: 'shot'; unit: Unit; foe: Foe; kind: 'shot' | 'lob' | 'pierce' | 'pulse' | 'melee'; dmg: number }
  | { type: 'hitFoe'; foe: Foe; dmg: number; src: 'unit' | 'charm' | 'burn' | 'thorns' | 'burst' | 'dawn' }
  | { type: 'hitUnit'; unit: Unit; dmg: number; by: Foe | null }
  | { type: 'foeDied'; foe: Foe; dawn: boolean }
  | { type: 'unitDied'; unit: Unit; expired: boolean }
  | { type: 'revive'; unit: Unit }
  | { type: 'move'; unit: Unit; from: number }
  | { type: 'leak'; foe: Foe; dmg: number; spared: boolean }
  | { type: 'oil'; n: number; lane: number | null; row: number | null }
  | { type: 'heal'; unit: Unit; hp: number }
  | { type: 'flame'; n: number }
  | { type: 'effect'; fx: Effect; lane: number; row: number; foes: number[] }
  | { type: 'burst'; lane: number; y: number; radius: number }
  | { type: 'foeAct'; foe: Foe; k: FoeAbility['k'] | 'strike'; unit: Unit | null; extra?: number }
  | { type: 'telegraph'; foe: Foe; k: 'slam' | 'volley'; in: number }
  | { type: 'ability' }
  | { type: 'dawn' }
  | { type: 'won'; early: boolean }
  | { type: 'lost' };

export interface BattleSetup {
  seed: number;
  keeper: KeeperId;
  deck: CardInst[];
  relics: string[];
  stage: StageDef;
  /** Flame at the start of the fight, and the most it can hold. */
  flame: number;
  maxFlame: number;
}

export interface BattleStats {
  kills: number;
  leaks: number;
  flameLost: number;
  played: number;
  merges: number;
  spiritsLost: number;
  oilSpent: number;
  damage: number;
}

export type PlayCheck = { ok: true } | { ok: false; reason: 'state' | 'empty' | 'oil' | 'tile' | 'target' | 'merge' | 'nothing' };

const UNIT_REACH = 0.95;

export class Battle {
  readonly rng: Rng;
  readonly events = new Emitter<BattleEvent>();
  readonly stage: StageDef;
  readonly keeperId: KeeperId;
  readonly relics: string[];
  private readonly mods: ReturnType<typeof relicMods>;
  state: 'ready' | 'playing' | 'won' | 'lost' = 'ready';
  /** Seconds fought. */
  time = 0;
  flame: number;
  readonly maxFlame: number;
  oil: number;
  readonly maxOil: number;
  readonly regen: number;
  units: Unit[] = [];
  foes: Foe[] = [];
  terrain: Terrain[][];
  readonly handSize: number;
  hand: (CardInst | null)[] = [];
  /** Seconds until each empty slot is filled. */
  refill: number[] = [];
  drawPile: CardInst[] = [];
  discardPile: CardInst[] = [];
  vanished: CardInst[] = [];
  /** Per lane: foes there walk slower for a while. */
  zone: { slow: number; t: number }[] = Array.from({ length: COLS }, () => ({ slow: 0, t: 0 }));
  abilityCd: number;
  readonly abilityMax: number;
  stats: BattleStats = { kills: 0, leaks: 0, flameLost: 0, played: 0, merges: 0, spiritsLost: 0, oilSpent: 0, damage: 0 };
  /** The spirit played last (for Henge). */
  lastSpirit: CardInst | null = null;
  private spawnIdx = 0;
  private lastBreathUsed = false;
  private killCount = 0;
  private leakCount = 0;
  private acc = 0;
  private readonly hpBonus: number;
  private readonly dmgBonus: number;

  constructor(setup: BattleSetup) {
    this.rng = new Rng(setup.seed);
    this.stage = setup.stage;
    this.keeperId = setup.keeper;
    this.relics = [...setup.relics];
    const keeper = KEEPERS[setup.keeper];
    this.mods = relicMods(this.relics);
    this.flame = setup.flame;
    this.maxFlame = setup.maxFlame;
    this.maxOil = keeper.maxOil + this.mods.maxOil;
    this.oil = Math.min(this.maxOil, keeper.oil + this.mods.startOil);
    this.regen = CONFIG.oil.regen + this.mods.regen;
    this.handSize = keeper.hand + this.mods.hand;
    this.terrain = setup.stage.terrain.map((col) => [...col]);
    this.hpBonus = this.mods.hp + (keeper.passive.k === 'hardy' ? keeper.passive.n : 0);
    this.dmgBonus = this.mods.dmg;
    this.abilityMax = keeper.ability.cd * (1 - this.abilityFast());
    this.abilityCd = this.abilityMax * 0.4;

    this.drawPile = this.rng.shuffle(setup.deck.map((c) => ({ ...c })));
    // The opening hand always has something to play for the first few coins of oil.
    const first = this.drawPile.slice(0, this.handSize);
    if (!first.some((c) => card(c.id).kind === 'spirit')) {
      const i = this.drawPile.findIndex((c) => card(c.id).kind === 'spirit');
      if (i >= 0) [this.drawPile[0], this.drawPile[i]] = [this.drawPile[i], this.drawPile[0]];
    }
    for (let i = 0; i < this.handSize; i++) {
      this.hand.push(this.drawPile.shift() ?? null);
      this.refill.push(0);
    }
  }

  private hasHook(k: NonNullable<(typeof RELICS)[string]['hook']>['k']): boolean {
    return this.relics.some((id) => RELICS[id]?.hook?.k === k);
  }

  private abilityFast(): number {
    let n = 0;
    for (const id of this.relics) {
      const hook = RELICS[id]?.hook;
      if (hook?.k === 'abilityFast') n += hook.n / 100;
    }
    return Math.min(0.6, n);
  }

  // ————— clock —————

  start(): void {
    if (this.state !== 'ready') return;
    this.state = 'playing';
    this.events.emit({ type: 'start' });
  }

  /** Advances the fight by `dt` seconds of real time, in fixed ticks. */
  step(dt: number): void {
    if (this.state !== 'playing') return;
    this.acc += dt;
    while (this.acc >= CONFIG.tick && this.state === 'playing') {
      this.acc -= CONFIG.tick;
      this.tick(CONFIG.tick);
    }
  }

  private tick(dt: number): void {
    this.time += dt;
    this.oil = Math.min(this.maxOil, this.oil + this.regen * dt);
    this.abilityCd = Math.max(0, this.abilityCd - dt);
    this.tickHand(dt);
    this.tickZones(dt);
    this.tickSpawns();
    this.computeAuras();
    this.tickUnits(dt);
    this.tickFoes(dt);
    this.reap();
    if (this.state !== 'playing') return;
    if (this.time >= this.stage.duration) {
      this.dawn();
      return;
    }
    if (this.spawnIdx >= this.stage.spawns.length && this.foes.length === 0 && this.time > 2) {
      this.state = 'won';
      this.events.emit({ type: 'won', early: true });
    }
  }

  private dawn(): void {
    this.events.emit({ type: 'dawn' });
    for (const f of this.foes) {
      f.dead = true;
      this.events.emit({ type: 'foeDied', foe: f, dawn: true });
    }
    this.foes = [];
    this.state = 'won';
    this.events.emit({ type: 'won', early: false });
  }

  // ————— hand —————

  private tickHand(dt: number): void {
    for (let i = 0; i < this.hand.length; i++) {
      if (this.hand[i]) continue;
      this.refill[i] -= dt;
      if (this.refill[i] <= 0) this.fill(i);
    }
  }

  private fill(slot: number): void {
    if (this.drawPile.length === 0) {
      if (this.discardPile.length === 0) {
        this.refill[slot] = 0.5;
        return;
      }
      this.drawPile = this.rng.shuffle(this.discardPile);
      this.discardPile = [];
      this.events.emit({ type: 'shuffle' });
      this.refill[slot] = CONFIG.hand.shuffleDelay;
      return;
    }
    const c = this.drawPile.shift() as CardInst;
    this.hand[slot] = c;
    this.events.emit({ type: 'draw', slot, card: c });
  }

  private redeal(): void {
    for (let i = 0; i < this.hand.length; i++) {
      const c = this.hand[i];
      if (c) this.discardPile.push(c);
      this.hand[i] = null;
    }
    for (let i = 0; i < this.hand.length; i++) {
      this.refill[i] = 0;
      this.fill(i);
      if (!this.hand[i]) this.refill[i] = 0.4 * (i + 1);
    }
  }

  /** What a card costs the keeper right now. */
  cardCost(c: CardInst): number {
    let base = costOf(c);
    const keeper = KEEPERS[this.keeperId];
    if (card(c.id).kind === 'charm' && base > 1) {
      if (keeper.passive.k === 'charmCut') base = Math.max(1, base - keeper.passive.n);
      base = Math.max(1, base - this.mods.charmCut);
    }
    if (keeper.passive.k === 'firstFree' && this.stats.played === 0) return 0;
    return base;
  }

  // ————— playing —————

  /** Is this tile one a spirit may be set on (free and a legal one)? */
  tileFree(lane: number, row: number): boolean {
    return lane >= 0 && lane < COLS && row >= PLACE_ROW && row < ROWS && this.terrain[lane][row] !== 'rock' && !this.unitAt(lane, row);
  }

  unitAt(lane: number, row: number): Unit | null {
    for (const u of this.units) if (u.lane === lane && u.row === row && !u.dead) return u;
    return null;
  }

  check(slot: number, lane = -1, row = -1): PlayCheck {
    if (this.state !== 'playing') return { ok: false, reason: 'state' };
    const c = this.hand[slot];
    if (!c) return { ok: false, reason: 'empty' };
    if (this.oil + 1e-6 < this.cardCost(c)) return { ok: false, reason: 'oil' };
    const def = card(c.id);
    if (def.kind === 'spirit') {
      if (lane < 0 || row < 0 || lane >= COLS || row >= ROWS || row < PLACE_ROW) return { ok: false, reason: 'tile' };
      if (this.terrain[lane][row] === 'rock') return { ok: false, reason: 'tile' };
      const there = this.unitAt(lane, row);
      if (!there) return { ok: true };
      return there.cardId === c.id && there.level < CONFIG.maxLevel ? { ok: true } : { ok: false, reason: there.cardId === c.id ? 'merge' : 'tile' };
    }
    if (def.aim === 'lane' && (lane < 0 || lane >= COLS)) return { ok: false, reason: 'target' };
    if (def.aim === 'tile') {
      if (!this.lastSpirit) return { ok: false, reason: 'nothing' };
      if (!this.tileFree(lane, row)) return { ok: false, reason: 'tile' };
    }
    return { ok: true };
  }

  /** Plays the card in `slot` on a tile (spirits, and charms aimed at a tile) or a lane (`row` ignored). Returns whether it was played. */
  play(slot: number, lane = -1, row = -1): boolean {
    if (!this.check(slot, lane, row).ok) return false;
    const c = this.hand[slot] as CardInst;
    const def = card(c.id);
    this.oil -= this.cardCost(c);
    this.stats.oilSpent += this.cardCost(c);
    this.stats.played++;
    this.hand[slot] = null;
    this.refill[slot] = Math.max(0.15, CONFIG.hand.drawDelay - this.mods.drawCut);
    if (def.vanish) this.vanished.push(c);
    else this.discardPile.push(c);
    this.events.emit({ type: 'played', slot, card: c, lane, row });
    if (def.kind === 'spirit') {
      const sd = spiritOf(c) as SpiritDef;
      this.lastSpirit = c;
      this.place(c.id, sd, lane, row, c.up);
    } else {
      this.applyEffects(fxOf(c), lane, row);
    }
    return true;
  }

  private place(cardId: string, sd: SpiritDef, lane: number, row: number, up = false): Unit {
    const there = this.unitAt(lane, row);
    if (there) {
      // Merging an upgraded card into a plain spirit upgrades the whole.
      if (up && !there.up) {
        there.def = sd;
        there.up = true;
      }
      there.level++;
      there.maxHp = this.maxHpOf(there.def, there.level);
      there.hp = there.maxHp;
      this.stats.merges++;
      this.events.emit({ type: 'place', unit: there, merged: true });
      return there;
    }
    const shrine = this.terrain[lane][row] === 'shrine';
    const u: Unit = {
      uid: nextUid(),
      cardId,
      def: sd,
      up,
      lane,
      row,
      level: 1,
      hp: 0,
      maxHp: 0,
      cd: sd.atk ? sd.atk.every * 0.5 : 0,
      prodT: 0,
      healT: 0,
      roamT: 0,
      life: sd.lifespan ?? null,
      fx: { stun: 0, web: 0, bless: 0, blessT: 0 },
      revived: false,
      rateAura: 0,
      dmgAura: 0,
      shrine,
      age: 0,
      dead: false,
    };
    u.maxHp = this.maxHpOf(sd, 1);
    u.hp = u.maxHp;
    this.units.push(u);
    this.events.emit({ type: 'place', unit: u, merged: false });
    return u;
  }

  private levelMul(level: number): number {
    return 1 + CONFIG.levelGrowth * (level - 1);
  }

  private maxHpOf(sd: SpiritDef, level: number): number {
    return Math.max(1, Math.round(sd.hp * this.levelMul(level) * (1 + this.hpBonus)));
  }

  // ————— effects —————

  /** Foes an effect reaches. */
  foesOf(scope: Scope, lane: number): Foe[] {
    const live = this.foes.filter((f) => !f.dead);
    switch (scope) {
      case 'front': {
        const inLane = live.filter((f) => f.lane === lane);
        return inLane.length ? [inLane.reduce((a, b) => (b.y > a.y ? b : a))] : [];
      }
      case 'fronts': {
        const out: Foe[] = [];
        for (let l = 0; l < COLS; l++) out.push(...this.foesOf('front', l));
        return out;
      }
      case 'lane':
        return live.filter((f) => f.lane === lane);
      case 'lanes3':
        return live.filter((f) => Math.abs(f.lane - lane) <= 1);
      case 'all':
        return live;
      case 'strongest':
        return live.length ? [live.reduce((a, b) => (b.hp > a.hp ? b : a))] : [];
    }
  }

  private applyEffects(list: Effect[], lane: number, row: number, from: Unit | null = null): void {
    for (const fx of list) this.applyEffect(fx, lane, row, from);
  }

  private applyEffect(fx: Effect, lane: number, row: number, from: Unit | null): void {
    const hit: number[] = [];
    switch (fx.k) {
      case 'hit':
        for (const f of this.foesOf(fx.scope, lane)) {
          hit.push(f.uid);
          this.hurtFoe(f, this.scaled(fx.dmg), 'charm');
          if (fx.stun) f.fx.stun = Math.max(f.fx.stun, fx.stun);
          if (fx.slow) this.slowFoe(f, fx.slow[0], fx.slow[1]);
          if (fx.burn) this.burnFoe(f, fx.burn[0], fx.burn[1]);
          if (fx.mark) f.fx.vulnT = Math.max(f.fx.vulnT, fx.mark);
        }
        break;
      case 'stun':
        for (const f of this.foesOf(fx.scope, lane)) {
          hit.push(f.uid);
          f.fx.stun = Math.max(f.fx.stun, fx.secs);
        }
        break;
      case 'push':
        for (const f of this.foesOf(fx.scope, lane)) {
          hit.push(f.uid);
          f.y = Math.max(CONFIG.spawnY, f.y - fx.rows);
        }
        break;
      case 'burst':
        this.burst(from ? from.lane : lane, from ? from.row + 0.5 : row + 0.5, fx.dmg, fx.radius);
        break;
      case 'oil':
        this.gainOil(fx.n, null, null);
        break;
      case 'bounty':
        this.gainOil(Math.min(fx.max, fx.per * this.foes.filter((f) => !f.dead).length), null, null);
        break;
      case 'redeal':
        this.redeal();
        break;
      case 'mend':
        for (const u of this.units) {
          if (u.dead || (fx.scope === 'lane' && u.lane !== lane)) continue;
          this.healUnit(u, fx.hp);
        }
        break;
      case 'flame':
        this.flame = Math.min(this.maxFlame, this.flame + fx.n);
        this.events.emit({ type: 'flame', n: fx.n });
        break;
      case 'bless':
        for (const u of this.units) {
          if (u.dead || (fx.scope === 'lane' && u.lane !== lane)) continue;
          u.fx.bless = Math.max(u.fx.bless, fx.atk);
          u.fx.blessT = Math.max(u.fx.blessT, fx.secs);
        }
        break;
      case 'zone':
        this.zone[lane] = { slow: fx.slow, t: Math.max(this.zone[lane].t, fx.secs) };
        break;
      case 'summon':
        if (fx.at === 'target') {
          if (this.tileFree(lane, row)) this.place('summon', fx.spirit, lane, row);
        } else {
          const free: [number, number][] = [];
          for (let l = 0; l < COLS; l++) for (let r = PLACE_ROW; r < ROWS; r++) if (this.tileFree(l, r)) free.push([l, r]);
          this.rng.shuffle(free);
          for (let i = 0; i < fx.n && i < free.length; i++) this.place('summon', fx.spirit, free[i][0], free[i][1]);
        }
        break;
      case 'copyLast': {
        const last = this.lastSpirit;
        const sd = last ? spiritOf(last) : null;
        if (last && sd && this.tileFree(lane, row)) this.place(last.id, sd, lane, row, last.up);
        break;
      }
      case 'gamble': {
        const win = this.rng.chance(0.5);
        if (win) this.gainOil(fx.win, null, null);
        else this.oil = Math.max(0, this.oil - fx.lose);
        break;
      }
    }
    this.events.emit({ type: 'effect', fx, lane, row, foes: hit });
  }

  /** Damage from a charm or ability, with the relics' share. */
  private scaled(dmg: number): number {
    return Math.max(1, Math.round(dmg * (1 + this.dmgBonus)));
  }

  private gainOil(n: number, lane: number | null, row: number | null): void {
    this.oil = Math.min(this.maxOil, this.oil + n);
    this.events.emit({ type: 'oil', n, lane, row });
  }

  private healUnit(u: Unit, hp: number): void {
    const gain = Math.min(hp, u.maxHp - u.hp);
    if (gain <= 0) return;
    u.hp += gain;
    this.events.emit({ type: 'heal', unit: u, hp: gain });
  }

  useAbility(): boolean {
    if (this.state !== 'playing' || this.abilityCd > 0) return false;
    this.abilityCd = this.abilityMax;
    const keeper = KEEPERS[this.keeperId];
    this.events.emit({ type: 'ability' });
    this.applyEffects(keeper.ability.fx, 2, 4);
    return true;
  }

  /** Takes a spirit back off the field for half of what it cost (its levels included). Returns the oil, or -1 if it cannot be taken back. */
  recall(uid: number): number {
    if (this.state !== 'playing') return -1;
    const u = this.units.find((x) => x.uid === uid && !x.dead);
    if (!u || !CARDS[u.cardId]) return -1;
    const refund = Math.floor(card(u.cardId).cost * u.level * 0.5);
    this.killUnit(u, true, true);
    if (refund > 0) this.gainOil(refund, u.lane, u.row);
    return refund;
  }

  /** What recalling a spirit would give back. */
  recallValue(u: Unit): number {
    return CARDS[u.cardId] ? Math.floor(card(u.cardId).cost * u.level * 0.5) : 0;
  }

  get abilityReady(): boolean {
    return this.state === 'playing' && this.abilityCd <= 0;
  }

  // ————— spawns —————

  private tickSpawns(): void {
    const { spawns } = this.stage;
    while (this.spawnIdx < spawns.length && spawns[this.spawnIdx].t <= this.time) {
      const s = spawns[this.spawnIdx++];
      this.spawnFoe(s.foe, s.lane, CONFIG.spawnY);
    }
  }

  /** Spawns still ahead that are inside the warning window, for the lane markers: `in` is seconds to go. */
  incoming(): { lane: number; foe: string; in: number }[] {
    const out: { lane: number; foe: string; in: number }[] = [];
    for (let i = this.spawnIdx; i < this.stage.spawns.length; i++) {
      const s = this.stage.spawns[i];
      if (s.t - this.time > CONFIG.warn) break;
      out.push({ lane: s.lane, foe: s.foe, in: s.t - this.time });
    }
    return out;
  }

  /** Seconds until the next foe walks in, or null when none are left to come. */
  nextSpawnIn(): number | null {
    return this.spawnIdx < this.stage.spawns.length ? this.stage.spawns[this.spawnIdx].t - this.time : null;
  }

  spawnFoe(id: string, lane: number, y: number): Foe {
    const def = foeDef(id);
    const maxHp = Math.max(1, Math.round(def.hp * this.stage.hpMul * (def.tier === 'elite' || def.tier === 'boss' ? this.stage.eliteMul : 1)));
    const f: Foe = {
      uid: nextUid(),
      def,
      lane: Math.max(0, Math.min(COLS - 1, lane)),
      y,
      hp: maxHp,
      maxHp,
      cd: def.every * 0.6,
      fx: { stun: 0, slow: 0, slowT: 0, burn: 0, burnT: 0, vulnT: 0 },
      ab: (def.abilities ?? []).map((a) => ('every' in a ? a.every * (0.55 + this.rng.next() * 0.3) : 0)),
      leaped: false,
      boost: 0,
      engaged: null,
      age: 0,
      dead: false,
    };
    this.foes.push(f);
    this.events.emit({ type: 'spawn', foe: f });
    return f;
  }

  private tickZones(dt: number): void {
    for (const z of this.zone) if (z.t > 0) z.t = Math.max(0, z.t - dt);
  }

  // ————— units —————

  /** The spirits an aura reaches (for drawing its links). */
  auraTargets(a: Unit): Unit[] {
    return a.def.aura && !a.dead ? this.neighbours(a, a.def.aura.to) : [];
  }

  private neighbours(a: Unit, to: 'adjacent' | 'lane' | 'all'): Unit[] {
    return this.units.filter(
      (b) =>
        !b.dead && b !== a && (to === 'all' || (to === 'lane' ? b.lane === a.lane : Math.abs(b.lane - a.lane) <= 1 && Math.abs(b.row - a.row) <= 1)),
    );
  }

  private computeAuras(): void {
    for (const u of this.units) {
      u.rateAura = 0;
      u.dmgAura = 0;
    }
    for (const a of this.units) {
      const aura = a.def.aura;
      if (!aura || a.dead || a.fx.stun > 0) continue;
      const k = this.levelMul(a.level);
      for (const b of this.neighbours(a, aura.to)) {
        b.rateAura += (aura.rate ?? 0) * k;
        b.dmgAura += (aura.dmg ?? 0) * k;
      }
    }
  }

  private tickUnits(dt: number): void {
    for (const u of this.units) {
      if (u.dead) continue;
      u.age += dt;
      if (this.mods.regenHp > 0 && u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + this.mods.regenHp * dt);
      if (u.fx.stun > 0) u.fx.stun = Math.max(0, u.fx.stun - dt);
      if (u.fx.web > 0) u.fx.web = Math.max(0, u.fx.web - dt);
      if (u.fx.blessT > 0) {
        u.fx.blessT -= dt;
        if (u.fx.blessT <= 0) u.fx.bless = 0;
      }
      if (u.life !== null) {
        u.life -= dt;
        if (u.life <= 0) {
          this.killUnit(u, true);
          continue;
        }
      }
      if (u.fx.stun > 0) continue;
      const boost = u.shrine ? 1 + CONFIG.shrineBoost : 1;
      const k = this.levelMul(u.level);
      if (u.def.oil) {
        u.prodT += dt * boost;
        if (u.prodT >= u.def.oil.every) {
          u.prodT -= u.def.oil.every;
          this.gainOil(Math.max(1, Math.round(u.def.oil.n * k)), u.lane, u.row);
        }
      }
      if (u.def.heal) {
        u.healT += dt;
        if (u.healT >= u.def.heal.every) {
          u.healT -= u.def.heal.every;
          for (const b of this.neighbours(u, u.def.heal.to)) this.healUnit(b, u.def.heal.hp * k);
        }
      }
      if (u.def.roam) {
        u.roamT += dt;
        if (u.roamT >= u.def.roam.every) {
          u.roamT = 0;
          this.roam(u);
        }
      }
      if (u.def.trap) {
        const hot = this.foes.find((f) => !f.dead && f.lane === u.lane && Math.abs(f.y - (u.row + 0.5)) < 0.9);
        if (hot) {
          this.burst(u.lane, u.row + 0.5, u.def.trap.dmg * k, u.def.trap.radius, u.def.trap.stun);
          this.killUnit(u, true, true);
          continue;
        }
      }
      const atk = u.def.atk;
      if (!atk) continue;
      u.cd -= dt * (1 + u.rateAura) * (u.fx.web > 0 ? CONFIG.webSlow : 1) * boost;
      if (u.cd > 0) continue;
      if (this.strike(u, boost)) u.cd = atk.every;
      else u.cd = 0;
    }
  }

  /** A roaming spirit slides to the next lane when the parade is clearly thicker there (and the tile is free). */
  private roam(u: Unit): void {
    const here = this.laneThreat(u.lane);
    let best = -1;
    let bestThreat = here * 1.3 + 2;
    for (const l of [u.lane - 1, u.lane + 1]) {
      if (l < 0 || l >= COLS || !this.tileFree(l, u.row)) continue;
      const threat = this.laneThreat(l);
      if (threat > bestThreat) {
        best = l;
        bestThreat = threat;
      }
    }
    if (best < 0) return;
    const from = u.lane;
    u.lane = best;
    u.shrine = this.terrain[best][u.row] === 'shrine';
    this.events.emit({ type: 'move', unit: u, from });
  }

  /** The foes a spirit's attack can reach, nearest first. */
  private reachable(u: Unit, range: number): Foe[] {
    const uy = u.row + 0.5;
    return this.foes
      .filter((f) => !f.dead && f.lane === u.lane && f.y <= uy + CONFIG.behindRange && uy - f.y <= range && f.y > CONFIG.spawnY - 0.01)
      .sort((a, b) => b.y - a.y);
  }

  private strike(u: Unit, boost: number): boolean {
    const atk = u.def.atk;
    if (!atk) return false;
    const targets = this.reachable(u, atk.kind === 'melee' ? UNIT_REACH : atk.range);
    if (targets.length === 0) return false;
    const dmg = Math.max(1, Math.round(atk.dmg * this.levelMul(u.level) * (1 + u.dmgAura + u.fx.bless + this.dmgBonus) * boost));
    switch (atk.kind) {
      case 'melee': {
        const hit = atk.cleave ? targets : [targets[0]];
        for (const f of hit) {
          this.events.emit({ type: 'shot', unit: u, foe: f, kind: 'melee', dmg });
          this.hitWith(f, dmg, atk, 'unit');
        }
        break;
      }
      case 'shot': {
        this.events.emit({ type: 'shot', unit: u, foe: targets[0], kind: 'shot', dmg });
        this.hitWith(targets[0], dmg, atk, 'unit');
        break;
      }
      case 'lob': {
        const t = targets[0];
        this.events.emit({ type: 'shot', unit: u, foe: t, kind: 'lob', dmg });
        const radius = atk.splash ?? 0.8;
        for (const f of this.foes) {
          if (f.dead) continue;
          if (Math.hypot(f.lane - t.lane, f.y - t.y) <= radius) this.hitWith(f, dmg, atk, 'unit');
        }
        this.events.emit({ type: 'burst', lane: t.lane, y: t.y, radius });
        break;
      }
      case 'pierce':
      case 'pulse': {
        this.events.emit({ type: 'shot', unit: u, foe: targets[0], kind: atk.kind, dmg });
        for (const f of targets) this.hitWith(f, dmg, atk, 'unit');
        break;
      }
    }
    return true;
  }

  private hitWith(f: Foe, dmg: number, atk: NonNullable<SpiritDef['atk']>, src: 'unit'): void {
    this.hurtFoe(f, dmg, src);
    if (atk.stun) f.fx.stun = Math.max(f.fx.stun, atk.stun);
    if (atk.slow) this.slowFoe(f, atk.slow[0], atk.slow[1]);
    if (atk.burn) this.burnFoe(f, atk.burn[0], atk.burn[1]);
  }

  private slowFoe(f: Foe, k: number, secs: number): void {
    if (k >= f.fx.slow || f.fx.slowT <= 0) f.fx.slow = k;
    f.fx.slowT = Math.max(f.fx.slowT, secs);
  }

  private burnFoe(f: Foe, dps: number, secs: number): void {
    f.fx.burn = Math.max(f.fx.burn, dps);
    f.fx.burnT = Math.max(f.fx.burnT, secs);
  }

  hurtFoe(f: Foe, dmg: number, src: 'unit' | 'charm' | 'burn' | 'thorns' | 'burst' | 'dawn'): void {
    if (f.dead) return;
    let d = dmg;
    if (src !== 'burn') {
      if (f.fx.vulnT > 0) d *= 1 + CONFIG.vulnerable;
      d = Math.max(1, d - (f.def.armor ?? 0));
    }
    f.hp -= d;
    this.stats.damage += d;
    if (src !== 'burn') this.events.emit({ type: 'hitFoe', foe: f, dmg: d, src });
    if (f.hp <= 0) f.dead = true;
  }

  private burst(lane: number, y: number, dmg: number, radius: number, stun = 0): void {
    this.events.emit({ type: 'burst', lane, y, radius });
    const d = this.scaled(dmg);
    for (const f of this.foes) {
      if (f.dead) continue;
      if (Math.hypot(f.lane - lane, f.y - y) <= radius) {
        this.hurtFoe(f, d, 'burst');
        if (stun) f.fx.stun = Math.max(f.fx.stun, stun);
      }
    }
  }

  private hurtUnit(u: Unit, dmg: number, by: Foe | null): void {
    if (u.dead) return;
    u.hp -= dmg;
    this.events.emit({ type: 'hitUnit', unit: u, dmg, by });
    if (u.hp <= 0) this.killUnit(u, false);
  }

  private killUnit(u: Unit, expired: boolean, silent = false): void {
    if (u.dead) return;
    if (!expired && u.def.revive && !u.revived) {
      u.revived = true;
      u.hp = Math.max(1, Math.round(u.maxHp * u.def.revive));
      this.events.emit({ type: 'revive', unit: u });
      return;
    }
    u.dead = true;
    if (!expired) this.stats.spiritsLost++;
    this.events.emit({ type: 'unitDied', unit: u, expired });
    if (!silent && u.def.onDeath) this.applyEffects(u.def.onDeath, u.lane, u.row, u);
    if (!expired && this.hasHook('chime')) this.applyEffect({ k: 'push', rows: 1, scope: 'lane' }, u.lane, u.row, null);
  }

  // ————— foes —————

  private frontBlocker(f: Foe): Unit | null {
    let best: Unit | null = null;
    for (const u of this.units) {
      if (u.dead || u.lane !== f.lane) continue;
      const uy = u.row + 0.5;
      if (uy < f.y - 0.1) continue;
      if (!best || u.row < best.row) best = u;
    }
    return best;
  }

  private nearestUnit(f: Foe): Unit | null {
    let best: Unit | null = null;
    for (const u of this.units) {
      if (u.dead || u.lane !== f.lane || u.row + 0.5 < f.y - 0.1) continue;
      if (!best || u.row < best.row) best = u;
    }
    return best;
  }

  private tickFoes(dt: number): void {
    for (const f of this.foes) f.boost = 0;
    for (const f of this.foes) {
      if (f.dead) continue;
      for (const a of f.def.abilities ?? []) {
        if (a.k !== 'hasten') continue;
        for (const g of this.foes) if (g !== f && !g.dead && Math.hypot(g.lane - f.lane, g.y - f.y) <= a.radius) g.boost = Math.max(g.boost, a.speed);
      }
    }
    for (const f of [...this.foes]) {
      if (f.dead) continue;
      f.age += dt;
      if (f.fx.burnT > 0) {
        f.fx.burnT -= dt;
        f.hp -= f.fx.burn * dt;
        this.stats.damage += f.fx.burn * dt;
        if (f.fx.burnT <= 0) f.fx.burn = 0;
        if (f.hp <= 0) {
          f.dead = true;
          continue;
        }
      }
      if (f.fx.slowT > 0) f.fx.slowT -= dt;
      if (f.fx.vulnT > 0) f.fx.vulnT -= dt;
      if (f.fx.stun > 0) {
        f.fx.stun = Math.max(0, f.fx.stun - dt);
        continue;
      }
      this.tickAbilities(f, dt);
      if (f.dead) continue;
      this.moveFoe(f, dt);
    }
  }

  private speedOf(f: Foe): number {
    let s = f.def.speed * (1 + f.boost) * this.stage.speedMul;
    if (f.fx.slowT > 0) s *= 1 - f.fx.slow;
    const z = this.zone[f.lane];
    if (z.t > 0) s *= 1 - z.slow;
    for (const a of f.def.abilities ?? []) if (a.k === 'rage' && f.hp <= f.maxHp * a.at) s *= a.speed;
    return s;
  }

  private moveFoe(f: Foe, dt: number): void {
    const def = f.def;
    const blocker = def.fly ? null : this.frontBlocker(f);
    f.engaged = null;
    if (blocker) {
      const uy = blocker.row + 0.5;
      const stopAt = uy - def.reach;
      if (f.y >= stopAt - CONFIG.contactSlack) {
        // In contact: leap over it, or fight it.
        if (!f.leaped && def.abilities?.some((a) => a.k === 'leap')) {
          f.leaped = true;
          f.y = uy + 0.75;
          this.events.emit({ type: 'foeAct', foe: f, k: 'leap', unit: blocker });
          return;
        }
        f.engaged = blocker.uid;
        f.cd -= dt;
        if (f.cd <= 0 && def.dmg > 0) {
          f.cd = def.every;
          this.events.emit({ type: 'foeAct', foe: f, k: 'strike', unit: blocker });
          if (blocker.def.thorns) this.hurtFoe(f, blocker.def.thorns * this.levelMul(blocker.level), 'thorns');
          if (blocker.def.sticky) this.slowFoe(f, blocker.def.sticky[0], blocker.def.sticky[1]);
          this.hurtUnit(blocker, def.dmg, f);
        }
        return;
      }
      f.y = Math.min(stopAt, f.y + this.speedOf(f) * dt);
      return;
    }
    f.y += this.speedOf(f) * dt;
    if (f.y >= ROWS) this.leak(f);
  }

  private leak(f: Foe): void {
    f.dead = true;
    this.leakCount++;
    let spared = false;
    for (const id of this.relics) {
      const hook = RELICS[id]?.hook;
      if (hook?.k === 'leakSpare' && this.leakCount % hook.every === 0) spared = true;
    }
    this.events.emit({ type: 'leak', foe: f, dmg: f.def.leak, spared });
    if (spared) return;
    if (f.def.leak >= this.flame && !this.lastBreathUsed && this.hasHook('lastBreath')) {
      this.lastBreathUsed = true;
      this.flame = 1;
      this.stats.leaks++;
      this.stats.flameLost += f.def.leak - 1;
      this.events.emit({ type: 'flame', n: 0 });
      return;
    }
    this.stats.leaks++;
    this.stats.flameLost += f.def.leak;
    this.flame = Math.max(0, this.flame - f.def.leak);
    if (this.flame <= 0 && this.state === 'playing') {
      this.state = 'lost';
      this.events.emit({ type: 'lost' });
    }
  }

  private tickAbilities(f: Foe, dt: number): void {
    const abilities = f.def.abilities ?? [];
    for (let i = 0; i < abilities.length; i++) {
      const a = abilities[i];
      if (!('every' in a)) continue;
      f.ab[i] -= dt;
      if (a.k === 'slam' || a.k === 'volley') {
        if (f.ab[i] <= 1 && f.ab[i] + dt > 1) this.events.emit({ type: 'telegraph', foe: f, k: a.k, in: 1 });
      }
      if (f.ab[i] > 0) continue;
      if (this.perform(f, a)) f.ab[i] = a.every;
      else f.ab[i] = 0.5;
    }
  }

  /** Runs a periodic ability; returns false when it had nothing to act on (it tries again soon). */
  private perform(f: Foe, a: FoeAbility): boolean {
    switch (a.k) {
      case 'web': {
        const u = this.nearestUnit(f);
        if (!u) return false;
        u.fx.web = Math.max(u.fx.web, a.secs);
        this.events.emit({ type: 'foeAct', foe: f, k: 'web', unit: u });
        return true;
      }
      case 'freeze': {
        const u = this.nearestUnit(f);
        if (!u) return false;
        u.fx.stun = Math.max(u.fx.stun, a.secs);
        this.events.emit({ type: 'foeAct', foe: f, k: 'freeze', unit: u });
        return true;
      }
      case 'mend': {
        let any = false;
        for (const g of this.foes) {
          if (g === f || g.dead || g.hp >= g.maxHp || Math.hypot(g.lane - f.lane, g.y - f.y) > a.radius) continue;
          g.hp = Math.min(g.maxHp, g.hp + a.hp);
          any = true;
        }
        if (any) this.events.emit({ type: 'foeAct', foe: f, k: 'mend', unit: null });
        return any;
      }
      case 'swap': {
        const options = [f.lane - 1, f.lane + 1].filter((l) => l >= 0 && l < COLS);
        const to = this.rng.pick(options);
        this.events.emit({ type: 'foeAct', foe: f, k: 'swap', unit: null, extra: to });
        f.lane = to;
        return true;
      }
      case 'summon': {
        for (let i = 0; i < a.n; i++) {
          const lane = Math.max(0, Math.min(COLS - 1, f.lane + (i - (a.n - 1) / 2) * 1));
          this.spawnFoe(a.foe, Math.round(lane), Math.max(CONFIG.spawnY, f.y - 0.2));
        }
        this.events.emit({ type: 'foeAct', foe: f, k: 'summon', unit: null });
        return true;
      }
      case 'slam': {
        const victims = this.units.filter((u) => !u.dead && u.lane === f.lane && u.row + 0.5 >= f.y - 0.1);
        this.events.emit({ type: 'foeAct', foe: f, k: 'slam', unit: null });
        for (const u of victims) this.hurtUnit(u, a.dmg, f);
        return true;
      }
      case 'volley': {
        this.events.emit({ type: 'foeAct', foe: f, k: 'volley', unit: null });
        for (let l = 0; l < COLS; l++) {
          let front: Unit | null = null;
          for (const u of this.units) if (!u.dead && u.lane === l && (!front || u.row < front.row)) front = u;
          if (front) this.hurtUnit(front, a.dmg, f);
        }
        return true;
      }
      case 'leap':
      case 'hasten':
      case 'split':
      case 'rage':
        return true;
    }
  }

  // ————— deaths —————

  private reap(): void {
    // Foes that fell: split into smaller ones, count the kill, and let the relics notice.
    const fallen = this.foes.filter((f) => f.dead && f.hp <= 0);
    for (const f of fallen) {
      this.stats.kills++;
      this.killCount++;
      this.events.emit({ type: 'foeDied', foe: f, dawn: false });
      for (const a of f.def.abilities ?? []) {
        if (a.k !== 'split') continue;
        for (let i = 0; i < a.n; i++) {
          const lane = Math.max(0, Math.min(COLS - 1, f.lane + (i % 2 === 0 ? 0 : i % 4 === 1 ? 1 : -1)));
          this.spawnFoe(a.foe, lane, Math.max(CONFIG.spawnY, f.y - 0.15 * i));
        }
      }
      for (const id of this.relics) {
        const hook = RELICS[id]?.hook;
        if (hook?.k === 'killOil' && this.killCount % hook.every === 0) this.gainOil(1, null, null);
      }
    }
    this.foes = this.foes.filter((f) => !f.dead);
    this.units = this.units.filter((u) => !u.dead);
  }

  // ————— queries for the screens —————

  /** The foes that stand between the lantern and a lane's top, nearest first. */
  laneThreat(lane: number): number {
    let t = 0;
    for (const f of this.foes) if (f.lane === lane && !f.dead) t += f.hp * (0.5 + f.y / ROWS);
    return t;
  }

  get tile(): { cols: number; rows: number } {
    return { cols: COLS, rows: ROWS };
  }

  /** Share of the night that has passed. */
  get progress(): number {
    return Math.min(1, this.time / this.stage.duration);
  }

  /** The oil a card still needs. */
  missing(c: CardInst): number {
    return Math.max(0, this.cardCost(c) - this.oil);
  }
}
