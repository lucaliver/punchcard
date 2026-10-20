import { settings } from '../../game/settings';
import type { Battle, BattleEvent, Foe, Unit } from '../../game/battle';
import { CONFIG } from '../../data/config';
import { COLS, PLACE_ROW, ROWS } from '../../game/types';
import { FOES } from '../../data/foes';
import { artImage } from '../art/sprites';
import { BASE_ROWS, type Geometry, geometry, paintBackdrop, THEMES } from './backdrop';
import { FxLayer } from './fx';

/**
 * The field, drawn on one canvas: the backdrop, the spirits and foes (sprites with a little life in them), the lantern, light, and the
 * effects the engine's events call for. It reads the `Battle` and never writes to it.
 */

/** How a spirit's attack looks in flight. Anything not listed uses the plain paper bolt. */
const SHOT_STYLE: Record<string, { color: string; glow: string; kind?: 'bolt' | 'arrow' }> = {
  crane: { color: '#fffaf0', glow: 'rgba(255,240,200,.8)' },
  snowHare: { color: '#e8f6ff', glow: 'rgba(140,200,255,.9)' },
  wisp: { color: '#ffb84a', glow: 'rgba(255,140,40,.9)' },
  ofudaArcher: { color: '#fff3d6', glow: 'rgba(255,90,70,.9)', kind: 'arrow' },
  kuzunoha: { color: '#fff6c8', glow: 'rgba(255,220,120,.95)' },
  acorn: { color: '#a7825a', glow: 'rgba(255,200,120,.6)' },
  bambooCannon: { color: '#3a2810', glow: 'rgba(255,150,60,.9)' },
  teapot: { color: '#cfd6e2', glow: 'rgba(255,255,255,.8)' },
  kamaitachi: { color: '#ecf2ff', glow: 'rgba(180,210,255,.9)' },
};

/** Spirits and foes that give off light. */
const LIGHTS: Record<string, string> = {
  wisp: 'rgba(255,150,50,0.55)',
  toro: 'rgba(255,220,120,0.5)',
  kitsunebi: 'rgba(120,200,255,0.5)',
  chochin: 'rgba(255,200,110,0.4)',
  torii: 'rgba(255,170,90,0.35)',
  kagura: 'rgba(255,230,150,0.3)',
  bell: 'rgba(255,200,100,0.25)',
};

interface View {
  phase: number;
  /** Seconds since last hit / strike / arrival, for flashes and lunges. */
  hit: number;
  strike: number;
  born: number;
  /** Smoothed lane (x) of a foe that changes lanes. */
  x: number;
}

interface Ghost {
  art: string;
  x: number;
  y: number;
  size: number;
  t: number;
  dur: number;
  kind: 'foe' | 'unit' | 'dawn';
  tilt: number;
}

export interface Hint {
  mode: 'tile' | 'lane';
  /** Can the armed card go here? */
  valid: (lane: number, row: number) => boolean;
  merge: (lane: number, row: number) => boolean;
  hover: { lane: number; row: number } | null;
}

export class Field {
  readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  private bg: HTMLCanvasElement | null = null;
  private g: Geometry = geometry(10, 10);
  private dpr = 1;
  private readonly fx = new FxLayer();
  private readonly views = new Map<number, View>();
  private ghosts: Ghost[] = [];
  private t = 0;
  private shake = 0;
  private leakFlash = 0;
  private abilityFlash = 0;
  /** Seconds each lane is lit red by a telegraphed slam. */
  private warn: number[] = Array.from({ length: COLS }, () => 0);
  private hint: Hint | null = null;
  private white = new Map<string, HTMLCanvasElement>();
  private fireflies: { x: number; y: number; p: number; s: number }[] = [];
  private unsub: () => void;

  constructor(
    private readonly battle: Battle,
    private readonly act: number,
  ) {
    this.canvas.className = 'field-canvas';
    this.unsub = battle.events.on((e) => this.onEvent(e));
    for (let i = 0; i < 18; i++) this.fireflies.push({ x: Math.random(), y: Math.random(), p: Math.random() * 6.3, s: 0.4 + Math.random() * 0.8 });
  }

  destroy(): void {
    this.unsub();
  }

  setHint(h: Hint | null): void {
    this.hint = h;
  }

  /** Where a tile's centre is, in css pixels relative to the canvas. */
  centre(lane: number, row: number): { x: number; y: number } {
    return { x: (lane + 0.5) * this.g.tw, y: (row + 0.5) * this.g.th };
  }

  /** The tile under a client point, or null outside the placement area. */
  tileAt(clientX: number, clientY: number): { lane: number; row: number } | null {
    const r = this.canvas.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    if (x < 0 || y < 0 || x >= r.width || y >= r.height) return null;
    const lane = Math.floor(x / this.g.tw);
    const row = Math.floor(y / this.g.th);
    if (lane < 0 || lane >= COLS || row < 0 || row >= ROWS) return null;
    return { lane, row };
  }

  /** The foe or spirit under a client point (a foe wins when it is close to the finger), for a hold to inspect. */
  entityAt(clientX: number, clientY: number): { unit: Unit | null; foe: Foe | null } {
    const r = this.canvas.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    const { tw, th } = this.g;
    let foe: Foe | null = null;
    let best = th * 0.75;
    for (const f of this.battle.foes) {
      const d = Math.hypot(this.foeXY(f).x - x, f.y * th - y);
      if (d < best) {
        best = d;
        foe = f;
      }
    }
    if (foe) return { unit: null, foe };
    const lane = Math.floor(x / tw);
    const row = Math.floor(y / th);
    return { unit: this.battle.unitAt(lane, row), foe: null };
  }

  resize(w: number, h: number): void {
    this.dpr = Math.min(2.5, window.devicePixelRatio || 1);
    this.g = geometry(w, h);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.bg = null;
  }

  private ensureBackdrop(): HTMLCanvasElement {
    if (this.bg) return this.bg;
    const c = document.createElement('canvas');
    c.width = this.canvas.width;
    c.height = this.canvas.height;
    const cx = c.getContext('2d') as CanvasRenderingContext2D;
    cx.scale(this.dpr, this.dpr);
    paintBackdrop(cx, this.g, this.act, this.battle.stage.terrain, this.battle.stage.spawns.length + this.act * 31);
    this.bg = c;
    return c;
  }

  // ————— events —————

  private view(uid: number): View {
    let v = this.views.get(uid);
    if (!v) {
      v = { phase: Math.random() * 6.3, hit: 9, strike: 9, born: 0, x: -1 };
      this.views.set(uid, v);
    }
    return v;
  }

  private unitXY(u: Unit): { x: number; y: number } {
    const v = this.view(u.uid);
    if (v.x < 0) v.x = u.lane;
    return { x: (v.x + 0.5) * this.g.tw, y: (u.row + 0.5) * this.g.th };
  }

  private foeXY(f: Foe): { x: number; y: number } {
    const v = this.view(f.uid);
    if (v.x < 0) v.x = f.lane;
    return { x: (v.x + 0.5) * this.g.tw, y: f.y * this.g.th };
  }

  private onEvent(e: BattleEvent): void {
    const { tw, th } = this.g;
    switch (e.type) {
      case 'spawn': {
        const v = this.view(e.foe.uid);
        v.x = e.foe.lane;
        v.born = 0;
        break;
      }
      case 'place': {
        const { x, y } = this.unitXY(e.unit);
        this.view(e.unit.uid).born = 0;
        this.fx.ring(x, y + th * 0.3, tw * 0.5, e.merged ? '#ffd36a' : '#fff3d6', 0.4);
        this.fx.burst(x, y + th * 0.3, e.merged ? 14 : 8, {
          color: e.merged ? '#ffd36a' : '#fff3d6',
          shape: e.merged ? 'star' : 'dot',
          speed: 110,
          life: 0.5,
          size: 3,
          glow: true,
        });
        if (e.merged) this.fx.float(x, y - th * 0.4, `Lv ${e.unit.level}`, '#ffe08a', 15, 1.1);
        break;
      }
      case 'shot': {
        const from = this.unitXY(e.unit);
        const to = this.foeXY(e.foe);
        const style = SHOT_STYLE[e.unit.cardId] ?? { color: '#fff3d6', glow: 'rgba(255,200,120,.8)' };
        this.view(e.unit.uid).strike = 0;
        const dist = Math.hypot(to.x - from.x, to.y - from.y);
        if (e.kind === 'melee') {
          this.fx.shot({ x0: from.x, y0: from.y, x1: to.x, y1: to.y, dur: 0.22, color: '#fff', glow: style.glow, kind: 'slash', size: tw * 0.2 });
        } else if (e.kind === 'pulse') {
          this.fx.shot({
            x0: from.x,
            y0: from.y + th * 0.2,
            x1: from.x,
            y1: from.y,
            dur: 0.5,
            color: '#fff',
            glow: style.glow,
            kind: 'ring',
            size: Math.max(tw, th) * 1.1,
          });
        } else if (e.kind === 'pierce') {
          this.fx.shot({
            x0: from.x,
            y0: from.y - th * 0.2,
            x1: to.x,
            y1: to.y,
            dur: 0.22,
            color: '#fff6c8',
            glow: style.glow,
            kind: 'beam',
            size: 3,
          });
        } else {
          this.fx.shot({
            x0: from.x,
            y0: from.y - th * 0.15,
            x1: to.x,
            y1: to.y,
            dur: Math.max(0.1, Math.min(0.3, dist / 900)),
            color: style.color,
            glow: style.glow,
            kind: e.kind === 'lob' ? 'lob' : (style.kind ?? 'bolt'),
            size: 4.5,
          });
        }
        break;
      }
      case 'hitFoe': {
        const { x, y } = this.foeXY(e.foe);
        this.view(e.foe.uid).hit = 0;
        const colour = e.src === 'thorns' ? '#ffb4a0' : e.src === 'charm' ? '#ffe08a' : '#fff3d6';
        this.fx.float(
          x + (Math.random() - 0.5) * 12,
          y - th * 0.3 * e.foe.def.size,
          String(Math.max(1, Math.round(e.dmg))),
          colour,
          e.dmg >= 8 ? 20 : 15,
          0.7,
        );
        this.fx.burst(x, y, 4, { color: '#fff3d6', shape: 'spark', speed: 120, life: 0.25, size: 2.2, glow: true });
        break;
      }
      case 'hitUnit': {
        const { x, y } = this.unitXY(e.unit);
        this.view(e.unit.uid).hit = 0;
        this.fx.float(x, y - th * 0.35, `-${Math.round(e.dmg)}`, '#ff8f8f', 14, 0.7);
        this.fx.burst(x, y, 3, { color: '#ff8f8f', speed: 80, life: 0.3, size: 2.4 });
        break;
      }
      case 'foeDied': {
        const { x, y } = this.foeXY(e.foe);
        const size = Math.min(tw * 1.15, th * 1.25) * e.foe.def.size;
        this.ghosts.push({
          art: e.foe.def.art,
          x,
          y: y + th * 0.42,
          size,
          t: 0,
          dur: e.dawn ? 0.9 : 0.45,
          kind: e.dawn ? 'dawn' : 'foe',
          tilt: (Math.random() - 0.5) * 0.5,
        });
        if (!e.dawn) {
          this.fx.burst(x, y, 12, { color: '#bfe6ff', speed: 70, life: 0.8, size: 3, up: 60, glow: true, grow: 0.5 });
          this.fx.burst(x, y, 5, { color: '#fff3d6', shape: 'star', speed: 90, life: 0.5, size: 2.5, glow: true });
        } else {
          this.fx.burst(x, y, 10, { color: '#ffd36a', speed: 50, life: 1.1, size: 3, up: 90, glow: true });
        }
        if (e.foe.def.tier === 'boss' && !e.dawn) {
          this.abilityFlash = 0.9;
          this.fx.burst(this.g.w / 2, this.g.h * 0.4, 60, {
            color: '#ffd36a',
            shape: 'star',
            speed: 260,
            life: 1.4,
            size: 4,
            glow: true,
            gravity: 120,
          });
          this.fx.ring(x, y, tw * 2.2, '#ffd36a', 0.8);
        }
        this.views.delete(e.foe.uid);
        break;
      }
      case 'unitDied': {
        const { x, y } = this.unitXY(e.unit);
        this.ghosts.push({ art: e.unit.def.art, x, y: y + th * 0.42, size: Math.min(tw * 1.1, th * 1.12), t: 0, dur: 0.4, kind: 'unit', tilt: 0 });
        this.fx.burst(x, y, e.expired ? 10 : 14, {
          color: e.expired ? '#9ccc5a' : '#c8b896',
          shape: e.expired ? 'leaf' : 'dot',
          speed: 100,
          life: 0.6,
          size: 3,
          gravity: 140,
        });
        this.views.delete(e.unit.uid);
        break;
      }
      case 'move': {
        const { x, y } = this.unitXY(e.unit);
        this.fx.burst(x, y + th * 0.3, 8, { color: '#fff3d6', shape: 'spark', speed: 90, life: 0.3, size: 2.2 });
        break;
      }
      case 'revive': {
        const { x, y } = this.unitXY(e.unit);
        this.fx.ring(x, y, tw * 0.6, '#ff8a6a', 0.6);
        this.fx.float(x, y - th * 0.4, '!', '#ffb09a', 20, 0.9);
        break;
      }
      case 'leak': {
        const { x } = this.foeXY(e.foe);
        const y = ROWS * th + th * 0.3;
        this.leakFlash = e.spared ? 0 : 0.6;
        if (!e.spared && settings.shake) this.shake = CONFIG.shake;
        this.fx.burst(x, y, 12, { color: e.spared ? '#bfe6ff' : '#ff6a4a', speed: 120, life: 0.5, size: 3, glow: true });
        this.fx.float(x, y - 10, e.spared ? '0' : `-${e.dmg}`, e.spared ? '#bfe6ff' : '#ff6a4a', 22, 1);
        break;
      }
      case 'oil': {
        if (e.lane !== null && e.row !== null) {
          const c = this.centre(e.lane, e.row);
          this.fx.float(c.x, c.y - th * 0.3, `+${e.n}`, '#ffd24a', 16, 0.9);
          this.fx.burst(c.x, c.y, 5, { color: '#ffd24a', speed: 60, life: 0.5, size: 2.4, up: 40, glow: true });
        }
        break;
      }
      case 'heal': {
        const { x, y } = this.unitXY(e.unit);
        this.fx.float(x, y - th * 0.3, `+${Math.round(e.hp)}`, '#9ee89a', 13, 0.7);
        break;
      }
      case 'burst': {
        const x = (e.lane + 0.5) * tw;
        const y = e.y * th;
        this.fx.ring(x, y, e.radius * Math.min(tw, th) * 0.9, '#ffb04a', 0.45);
        this.fx.burst(x, y, 14, { color: '#ff9a3c', speed: 130, life: 0.45, size: 3.4, glow: true });
        break;
      }
      case 'effect':
        this.effectFx(e);
        break;
      case 'foeAct': {
        const { x, y } = this.foeXY(e.foe);
        this.view(e.foe.uid).strike = 0;
        if (e.k === 'web' && e.unit) {
          const u = this.unitXY(e.unit);
          this.fx.shot({ x0: x, y0: y, x1: u.x, y1: u.y, dur: 0.3, color: '#f4f4ff', glow: 'rgba(220,220,255,.7)', kind: 'beam', size: 2 });
        } else if (e.k === 'freeze' && e.unit) {
          const u = this.unitXY(e.unit);
          this.fx.burst(u.x, u.y, 14, { color: '#bfe6ff', shape: 'star', speed: 80, life: 0.7, size: 3, glow: true });
          this.fx.ring(u.x, u.y, tw * 0.5, '#bfe6ff', 0.5);
        } else if (e.k === 'slam') {
          this.shake = Math.max(this.shake, CONFIG.shake * 0.9);
          this.fx.burst(x, y + th * 0.4, 18, { color: '#c8b896', speed: 160, life: 0.5, size: 4, gravity: 100 });
        } else if (e.k === 'volley') {
          for (let l = 0; l < COLS; l++)
            this.fx.shot({
              x0: (l + 0.5) * tw,
              y0: 0,
              x1: (l + 0.5) * tw,
              y1: ROWS * th * 0.7,
              dur: 0.35,
              color: '#ffb4a0',
              glow: 'rgba(255,100,80,.8)',
              kind: 'arrow',
              size: 4,
            });
        } else if (e.k === 'mend') {
          this.fx.ring(x, y, tw * 0.9, '#9ee89a', 0.6);
        } else if (e.k === 'summon') {
          this.fx.burst(x, y, 16, { color: '#7a4fa8', speed: 110, life: 0.6, size: 3.4, glow: true });
        } else if (e.k === 'swap') {
          this.fx.burst(x, y, 6, { color: '#f4f4ff', speed: 60, life: 0.3, size: 2.6 });
        } else if (e.k === 'leap') {
          this.fx.burst(x, y, 8, { color: '#fff3d6', speed: 70, life: 0.35, size: 2.4 });
        }
        break;
      }
      case 'telegraph': {
        this.warn[e.foe.lane] = Math.max(this.warn[e.foe.lane], e.in + 0.2);
        break;
      }
      case 'ability':
        this.abilityFlash = 0.7;
        break;
      case 'dawn':
        this.abilityFlash = 1.2;
        break;
      default:
        break;
    }
  }

  private effectFx(e: Extract<BattleEvent, { type: 'effect' }>): void {
    const { tw, th } = this.g;
    const fx = e.fx;
    const foes = e.foes.map((id) => this.battle.foes.find((f) => f.uid === id)).filter((f): f is Foe => !!f);
    switch (fx.k) {
      case 'hit':
      case 'stun':
        for (const f of foes) {
          const { x, y } = this.foeXY(f);
          if (fx.k === 'stun' || (fx.k === 'hit' && fx.stun))
            this.fx.burst(x, y - th * 0.3, 6, { color: '#ffe08a', shape: 'star', speed: 60, life: 0.8, size: 2.6, glow: true });
          if (fx.k === 'hit') this.fx.burst(x, y, 10, { color: '#ff7a3a', speed: 120, life: 0.5, size: 3, glow: true, up: 40 });
        }
        if (fx.k === 'hit' && (fx.scope === 'lane' || fx.scope === 'lanes3')) {
          const lanes = fx.scope === 'lane' ? [e.lane] : [e.lane - 1, e.lane, e.lane + 1];
          for (const l of lanes)
            if (l >= 0 && l < COLS)
              this.fx.shot({
                x0: (l + 0.5) * tw,
                y0: 0,
                x1: (l + 0.5) * tw,
                y1: ROWS * th,
                dur: 0.35,
                color: '#fff6c8',
                glow: 'rgba(255,130,50,.8)',
                kind: 'beam',
                size: tw * 0.18,
              });
        }
        if (fx.k === 'hit' && fx.scope === 'all') this.abilityFlash = 0.6;
        break;
      case 'push':
        for (const f of foes)
          this.fx.burst(this.foeXY(f).x, this.foeXY(f).y, 8, { color: '#cfeaff', speed: 90, life: 0.4, size: 2.4, shape: 'spark' });
        break;
      case 'bless':
        for (const u of this.battle.units) {
          const { x, y } = this.unitXY(u);
          this.fx.burst(x, y, 6, { color: '#ffe08a', shape: 'star', speed: 50, life: 0.9, size: 2.4, up: 40, glow: true });
        }
        break;
      case 'mend':
        for (const u of this.battle.units) {
          const { x, y } = this.unitXY(u);
          this.fx.burst(x, y, 4, { color: '#9ee89a', speed: 40, life: 0.8, size: 2.6, up: 50, glow: true });
        }
        break;
      case 'zone':
        this.fx.burst((e.lane + 0.5) * tw, ROWS * th * 0.5, 16, { color: '#fff3d6', speed: 40, life: 0.8, size: 2.6, shape: 'spark' });
        break;
      case 'flame': {
        const x = this.g.w / 2;
        const y = ROWS * th + th * 0.4;
        this.fx.burst(x, y, 14, { color: '#ffb84a', speed: 70, life: 0.8, size: 3.2, up: 60, glow: true });
        this.fx.float(x, y - th * 0.7, `+${fx.n}`, '#ffb84a', 20, 1);
        break;
      }
      case 'oil':
        this.fx.burst(this.g.w * 0.5, ROWS * th + th * 0.4, 10, { color: '#ffd24a', speed: 80, life: 0.6, size: 3, up: 70, glow: true });
        break;
      case 'summon':
      case 'copyLast':
        break;
      default:
        break;
    }
  }

  // ————— frame —————

  /** Draws one frame; `dt` is real seconds (0 when paused, so the picture holds). */
  frame(dt: number): void {
    this.t += dt;
    this.fx.update(dt);
    for (const v of this.views.values()) {
      v.hit += dt;
      v.strike += dt;
      v.born += dt;
    }
    for (const g of this.ghosts) g.t += dt;
    this.ghosts = this.ghosts.filter((g) => g.t < g.dur);
    for (let l = 0; l < COLS; l++) this.warn[l] = Math.max(0, this.warn[l] - dt);
    this.leakFlash = Math.max(0, this.leakFlash - dt);
    this.abilityFlash = Math.max(0, this.abilityFlash - dt);
    this.shake = Math.max(0, this.shake - dt * 22);
    if (this.act === 3 && dt > 0 && Math.random() < dt * 5) {
      this.fx.burst(Math.random() * this.g.w, -6, 1, { color: '#f2a7c8', shape: 'leaf', speed: 14, life: 7, size: 3.2, gravity: 22 });
    }
    this.draw();
  }

  private draw(): void {
    const { ctx, g, dpr } = this;
    const b = this.battle;
    const { w, h, th } = g;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (this.shake > 0.1) ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    ctx.drawImage(this.ensureBackdrop(), 0, 0, w, h);
    const dawn = b.state === 'won' ? 1 : b.progress;

    this.drawZones();
    this.drawWarnings();
    this.drawHint();

    // Lantern first (it is behind everything that walks).
    this.drawLantern();

    // Spirits and foes together, back to front.
    type Item = { y: number; draw: () => void };
    const items: Item[] = [];
    for (const u of b.units) items.push({ y: (u.row + 0.92) * th, draw: () => this.drawUnit(u) });
    for (const f of b.foes) items.push({ y: (f.y + 0.42) * th, draw: () => this.drawFoe(f) });
    for (const gh of this.ghosts) items.push({ y: gh.y, draw: () => this.drawGhost(gh) });
    items.sort((a, c) => a.y - c.y);
    for (const it of items) it.draw();

    this.drawLights();
    this.fx.drawShots(ctx);
    this.fx.drawParticles(ctx);
    this.drawFireflies(dawn);
    this.drawMist(dawn);
    this.fx.drawFloaters(ctx);

    // Dawn: a warm light creeps over the field from the top.
    if (dawn > 0.02) {
      const T = THEMES[this.act] ?? THEMES[1];
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, T.dawn);
      grad.addColorStop(1, `${T.dawn}00`);
      ctx.globalAlpha = Math.min(0.4, dawn * dawn * 0.5);
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    if (this.leakFlash > 0) {
      ctx.fillStyle = `rgba(255,60,40,${this.leakFlash * 0.45})`;
      ctx.fillRect(0, ROWS * th * 0.7, w, h);
    }
    if (this.abilityFlash > 0) {
      ctx.fillStyle = `rgba(255,240,200,${Math.min(0.55, this.abilityFlash * 0.5)})`;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  private drawZones(): void {
    const { ctx } = this;
    const { tw, th } = this.g;
    for (let l = 0; l < COLS; l++) {
      const z = this.battle.zone[l];
      if (z.t <= 0) continue;
      ctx.fillStyle = `rgba(255,243,214,${Math.min(0.2, z.t * 0.08)})`;
      ctx.fillRect(l * tw + 4, 0, tw - 8, ROWS * th);
      ctx.strokeStyle = '#e9dcb0';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -this.t * 16;
      ctx.beginPath();
      ctx.moveTo((l + 0.5) * tw, 0);
      ctx.lineTo((l + 0.5) * tw, ROWS * th);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  private drawWarnings(): void {
    const { ctx } = this;
    const { tw, th } = this.g;
    // A slam or a volley about to land lights its lane red.
    for (let l = 0; l < COLS; l++) {
      if (this.warn[l] <= 0) continue;
      ctx.fillStyle = `rgba(255,60,40,${0.12 + 0.1 * Math.sin(this.t * 22)})`;
      ctx.fillRect(l * tw, 0, tw, ROWS * th);
    }
    // The next foes walking in: a lantern at the top of their lane with the foe's own shape in it, swelling as it nears.
    for (const inc of this.battle.incoming()) {
      const k = 1 - Math.max(0, inc.in) / CONFIG.warn;
      const x = (inc.lane + 0.5) * tw;
      const y = th * 0.5;
      const s = 16 + k * 14;
      ctx.globalAlpha = 0.55 + 0.45 * k;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4);
      glow.addColorStop(0, 'rgba(255,90,70,0.9)');
      glow.addColorStop(1, 'rgba(255,90,70,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, s * 2.4, 0, 6.283);
      ctx.fill();
      const img = artImage('nodeWatch');
      if (img) ctx.drawImage(img, x - s / 2, y - s / 2 + Math.sin(this.t * 6 + inc.lane) * 2, s, s);
      const foe = artImage(FOES[inc.foe]?.art ?? '');
      if (foe) {
        const fs = Math.min(tw * 0.62, 30 + k * 12);
        ctx.globalAlpha = 0.5 + 0.4 * k;
        ctx.drawImage(foe, x - fs / 2, y + s * 0.5, fs, fs);
      }
      ctx.globalAlpha = 1;
    }
    // A foe about to slip past: red chevrons over the lantern's line in its lane.
    const seen = new Set<number>();
    for (const f of this.battle.foes) {
      if (f.dead || f.y < ROWS - 1.7 || f.engaged !== null || seen.has(f.lane)) continue;
      seen.add(f.lane);
      const x = (f.lane + 0.5) * tw;
      const y = ROWS * th - th * 0.28;
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 14);
      ctx.fillStyle = `rgba(255,70,50,${0.5 + 0.45 * pulse})`;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 11, y - 8 + i * 9);
        ctx.lineTo(x, y + 2 + i * 9);
        ctx.lineTo(x + 11, y - 8 + i * 9);
        ctx.lineTo(x + 11, y - 3 + i * 9);
        ctx.lineTo(x, y + 7 + i * 9);
        ctx.lineTo(x - 11, y - 3 + i * 9);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private drawHint(): void {
    const h = this.hint;
    if (!h) return;
    const { ctx } = this;
    const { tw, th } = this.g;
    if (h.mode === 'lane') {
      const hl = h.hover?.lane ?? -1;
      for (let l = 0; l < COLS; l++) {
        ctx.fillStyle = l === hl ? 'rgba(255,224,138,0.28)' : 'rgba(255,224,138,0.08)';
        ctx.fillRect(l * tw + 2, 0, tw - 4, ROWS * th);
      }
      return;
    }
    const pulse = 0.55 + 0.25 * Math.sin(this.t * 7);
    for (let l = 0; l < COLS; l++) {
      for (let r = PLACE_ROW; r < ROWS; r++) {
        if (!h.valid(l, r)) continue;
        const hovered = h.hover?.lane === l && h.hover?.row === r;
        const merge = h.merge(l, r);
        ctx.strokeStyle = merge ? '#9ee89a' : '#ffe08a';
        ctx.fillStyle = merge ? 'rgba(158,232,154,0.28)' : 'rgba(255,224,138,0.18)';
        ctx.globalAlpha = hovered ? 1 : pulse;
        ctx.lineWidth = hovered ? 4 : 2.5;
        ctx.beginPath();
        ctx.roundRect(l * tw + 4, r * th + 4, tw - 8, th - 8, 9);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    const hv = h.hover;
    if (hv && !h.valid(hv.lane, hv.row) && hv.row >= PLACE_ROW) {
      ctx.fillStyle = 'rgba(255,70,60,0.25)';
      ctx.beginPath();
      ctx.roundRect(hv.lane * tw + 4, hv.row * th + 4, tw - 8, th - 8, 9);
      ctx.fill();
    }
  }

  private drawLantern(): void {
    const { ctx } = this;
    const { w, th } = this.g;
    const b = this.battle;
    const cx = w / 2;
    const base = (ROWS + BASE_ROWS - 0.08) * th;
    const size = th * 1.72;
    const low = b.flame / b.maxFlame;
    const flick = 1 + 0.06 * Math.sin(this.t * (low < CONFIG.lowFlame ? 22 : 9)) + 0.04 * Math.sin(this.t * 3.1);
    const glowR = th * (1.5 + 2.6 * low) * flick;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(cx, base - size * 0.5, 0, cx, base - size * 0.5, glowR);
    g.addColorStop(0, `rgba(255,200,100,${0.55 * (0.4 + low)})`);
    g.addColorStop(0.5, `rgba(255,150,60,${0.18 * (0.4 + low)})`);
    g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - glowR, base - size * 0.5 - glowR, glowR * 2, glowR * 2);
    ctx.restore();
    const img = artImage('lantern');
    if (img) ctx.drawImage(img, cx - size / 2, base - size * 0.97, size, size);
    // the live flame in the housing
    const fy = base - size * 0.97 + size * 0.42;
    const fh = size * 0.2 * (0.5 + low * 0.8) * flick;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,170,60,0.9)';
    ctx.beginPath();
    ctx.ellipse(cx, fy, fh * 0.55, fh, 0, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,170,0.95)';
    ctx.beginPath();
    ctx.ellipse(cx, fy + fh * 0.2, fh * 0.3, fh * 0.6, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
    if (Math.random() < 0.18 * (0.3 + low)) this.fx.burst(cx, fy - fh, 1, { color: '#ffd36a', speed: 18, life: 1.1, size: 1.8, up: 40, glow: true });
  }

  private sprite(id: string, cx: number, baseY: number, size: number, o: { sx?: number; sy?: number; rot?: number; alpha?: number } = {}): void {
    const img = artImage(id);
    if (!img) return;
    const { ctx } = this;
    const sx = o.sx ?? 1;
    const sy = o.sy ?? 1;
    ctx.save();
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.translate(cx, baseY);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(sx, sy);
    ctx.drawImage(img, -size / 2, -size * 0.94, size, size);
    ctx.restore();
  }

  /** A white silhouette of a drawing, for the flash of a hit. */
  private whiteOf(id: string): HTMLCanvasElement | null {
    let c = this.white.get(id);
    if (c) return c;
    const img = artImage(id);
    if (!img) return null;
    c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const cx = c.getContext('2d') as CanvasRenderingContext2D;
    cx.drawImage(img, 0, 0, 128, 128);
    cx.globalCompositeOperation = 'source-in';
    cx.fillStyle = '#fff';
    cx.fillRect(0, 0, 128, 128);
    this.white.set(id, c);
    return c;
  }

  private flash(id: string, cx: number, baseY: number, size: number, k: number, o: { sx?: number; sy?: number; rot?: number }): void {
    const w = this.whiteOf(id);
    if (!w || k <= 0) return;
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(cx, baseY);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(o.sx ?? 1, o.sy ?? 1);
    ctx.drawImage(w, -size / 2, -size * 0.94, size, size);
    ctx.restore();
  }

  private shadow(cx: number, y: number, rx: number): void {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(8,4,24,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, rx * 0.32, 0, 0, 6.283);
    ctx.fill();
  }

  private bar(cx: number, y: number, w: number, k: number, color: string): void {
    const { ctx } = this;
    const bh = 6;
    ctx.fillStyle = '#1d1428';
    ctx.beginPath();
    ctx.roundRect(cx - w / 2 - 2, y - 2, w + 4, bh + 4, 4);
    ctx.fill();
    ctx.fillStyle = '#4a3a58';
    ctx.fillRect(cx - w / 2, y, w, bh);
    ctx.fillStyle = color;
    ctx.fillRect(cx - w / 2, y, Math.max(0, w * k), bh);
  }

  private icon(id: string, x: number, y: number, s: number): void {
    const img = artImage(id);
    if (img) this.ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
  }

  private drawUnit(u: Unit): void {
    const { tw, th } = this.g;
    const v = this.view(u.uid);
    v.x += (u.lane - (v.x < 0 ? u.lane : v.x)) * 0.22;
    if (v.x < 0) v.x = u.lane;
    const { x } = this.unitXY(u);
    const size = Math.min(tw * 1.08, th * 1.12);
    const baseY = (u.row + 0.92) * th;
    const appear = Math.min(1, v.born / 0.28);
    const pop = appear < 1 ? 1 + Math.sin(appear * Math.PI) * 0.18 - (1 - appear) * 0.6 : 1;
    const bob = Math.sin(this.t * 3 + v.phase) * 0.025;
    const lunge = v.strike < 0.18 ? Math.sin((v.strike / 0.18) * Math.PI) * -th * 0.1 : 0;
    const shakeX = v.hit < 0.2 ? Math.sin(v.hit * 70) * 3 : 0;
    this.shadow(x, baseY - 3, size * 0.34);
    if (u.shrine) {
      this.ctx.strokeStyle = 'rgba(245,181,63,0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.ellipse(x, baseY - 3, size * 0.42, size * 0.15, 0, 0, 6.283);
      this.ctx.stroke();
    }
    const o = { sx: pop * (1 - bob), sy: pop * (1 + bob) };
    const frozen = u.fx.stun > 0;
    this.sprite(u.def.art, x + shakeX, baseY + lunge, size * (u.level >= 2 ? 1 + 0.06 * (u.level - 1) : 1), { ...o, alpha: frozen ? 0.85 : 1 });
    this.flash(u.def.art, x + shakeX, baseY + lunge, size, Math.max(0, 0.7 - v.hit * 4), o);
    if (frozen) {
      this.ctx.fillStyle = 'rgba(160,220,255,0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(x, baseY - size * 0.4, size * 0.4, size * 0.45, 0, 0, 6.283);
      this.ctx.fill();
      this.icon('stun', x + size * 0.3, baseY - size * 0.82, 16);
    }
    if (u.fx.web > 0) this.icon('web', x - size * 0.3, baseY - size * 0.82, 15);
    if (u.fx.blessT > 0) this.icon('star', x + size * 0.3, baseY - size * 0.62, 12);
    if (u.hp < u.maxHp) this.bar(x, baseY - size * 0.98, tw * 0.6, u.hp / u.maxHp, '#7fd69a');
    if (u.life !== null && u.def.lifespan) this.bar(x, baseY + 2, tw * 0.4, Math.max(0, u.life / u.def.lifespan), '#e8c24a');
    if (u.level > 1) {
      for (let i = 0; i < u.level; i++) this.icon('star', x + (i - (u.level - 1) / 2) * 12, baseY + 6, 12);
    }
  }

  private drawFoe(f: Foe): void {
    const { tw, th } = this.g;
    const v = this.view(f.uid);
    // Glide toward the lane it is in.
    if (v.x < 0) v.x = f.lane;
    v.x += (f.lane - v.x) * Math.min(1, 0.25);
    const x = (v.x + 0.5) * tw;
    const baseY = (f.y + 0.42) * th;
    const size = Math.min(tw * 1.15, th * 1.25) * f.def.size;
    const walking = f.engaged === null && f.fx.stun <= 0;
    const sway = walking ? Math.sin(this.t * (4 + f.def.speed * 6) + v.phase) : Math.sin(this.t * 2.4 + v.phase) * 0.3;
    const rot = sway * 0.07;
    const squash = 1 + Math.abs(Math.sin(this.t * (4 + f.def.speed * 6) + v.phase)) * (walking ? 0.05 : 0.015);
    const fly = f.def.fly ? -th * 0.28 - Math.sin(this.t * 4 + v.phase) * 3 : 0;
    const lunge = v.strike < 0.2 ? Math.sin((v.strike / 0.2) * Math.PI) * th * 0.12 : 0;
    const fade = Math.min(1, v.born / 0.3);
    const flap = f.def.fly ? Math.sin(this.t * 15 + v.phase) : 0;
    const o = { sx: (1 + flap * 0.14) / squash, sy: squash * (1 - flap * 0.08), rot };
    this.shadow(x, baseY - 3, size * 0.3 * (f.def.fly ? 0.7 : 1));
    this.sprite(f.def.art, x, baseY + fly + lunge, size, { ...o, alpha: fade });
    this.flash(f.def.art, x, baseY + fly + lunge, size, Math.max(0, 0.75 - v.hit * 4), o);
    const rageAb = f.def.abilities?.find((a) => a.k === 'rage');
    if (rageAb && rageAb.k === 'rage' && f.hp <= f.maxHp * rageAb.at) {
      this.ctx.fillStyle = 'rgba(255,60,40,0.18)';
      this.ctx.beginPath();
      this.ctx.ellipse(x, baseY - size * 0.45, size * 0.45, size * 0.5, 0, 0, 6.283);
      this.ctx.fill();
    }
    if (f.fx.stun > 0) {
      for (let i = 0; i < 3; i++) {
        const a = this.t * 5 + i * 2.09;
        this.icon('star', x + Math.cos(a) * size * 0.28, baseY + fly - size * 0.92 + Math.sin(a) * 4, 11);
      }
    }
    let ix = x - size * 0.36;
    const iy = baseY + fly - size * 1.0;
    if (f.fx.slowT > 0) {
      this.icon('slow', ix, iy, 14);
      ix += 15;
    }
    if (f.fx.vulnT > 0) {
      this.icon('mark', ix, iy, 14);
      ix += 15;
    }
    if (f.fx.burnT > 0) {
      this.icon('burn', ix, iy, 14);
      if (Math.random() < 0.3) this.fx.burst(x, baseY - size * 0.5, 1, { color: '#ff8a2a', speed: 30, life: 0.5, size: 2.4, up: 50, glow: true });
    }
    const big = f.def.tier === 'elite' || f.def.tier === 'boss';
    if (f.hp < f.maxHp || big)
      this.bar(x, baseY + fly - size * 1.02, Math.min(tw * (big ? 0.95 : 0.6), size * 0.8), Math.max(0, f.hp / f.maxHp), big ? '#ff6a5a' : '#ff8f6a');
  }

  private drawGhost(gh: Ghost): void {
    const k = gh.t / gh.dur;
    const { ctx } = this;
    if (gh.kind === 'unit') {
      this.sprite(gh.art, gh.x, gh.y + k * 10, gh.size, { sx: 1 + k * 0.2, sy: 1 - k * 0.6, alpha: 1 - k });
      return;
    }
    const rise = gh.kind === 'dawn' ? k * 40 : k * 18;
    this.sprite(gh.art, gh.x, gh.y - rise, gh.size * (1 - k * 0.3), { rot: gh.tilt * k, alpha: (1 - k) * 0.9 });
    const w = this.whiteOf(gh.art);
    if (w) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 0.9 - k * 1.6);
      ctx.translate(gh.x, gh.y - rise);
      ctx.drawImage(w, -gh.size / 2, -gh.size * 0.94, gh.size, gh.size);
      ctx.restore();
    }
  }

  private drawLights(): void {
    const { ctx } = this;
    const { tw, th } = this.g;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = (x: number, y: number, r: number, c: string): void => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    for (const u of this.battle.units) {
      const c = LIGHTS[u.cardId];
      if (c) glow((u.lane + 0.5) * tw, (u.row + 0.5) * th, th * 1.5, c);
      if (u.shrine) glow((u.lane + 0.5) * tw, (u.row + 0.5) * th, th * 0.9, 'rgba(255,200,90,0.22)');
    }
    for (const f of this.battle.foes) {
      const c = LIGHTS[f.def.id];
      if (c) glow((this.view(f.uid).x + 0.5) * tw, f.y * th, th * 1.3, c);
    }
    ctx.restore();
  }

  /** Act two's fog: a few pale banks drifting across the field. */
  private drawMist(dawn: number): void {
    if (this.act !== 2) return;
    const { ctx } = this;
    const { w, h } = this.g;
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const x = ((this.t * (8 + i * 3) + i * w * 0.37) % (w * 1.6)) - w * 0.3;
      const y = h * (0.18 + i * 0.2);
      const g = ctx.createRadialGradient(x, y, 0, x, y, w * 0.55);
      g.addColorStop(0, `rgba(200,240,230,${0.1 * (1 - dawn * 0.6)})`);
      g.addColorStop(1, 'rgba(200,240,230,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - w * 0.6, y - w * 0.3, w * 1.2, w * 0.6);
    }
    ctx.restore();
  }

  private drawFireflies(dawn: number): void {
    const { ctx } = this;
    const { w, h } = this.g;
    const T = THEMES[this.act] ?? THEMES[1];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const f of this.fireflies) {
      const x = ((f.x + Math.sin(this.t * 0.3 * f.s + f.p) * 0.04) % 1) * w;
      const y = ((f.y + Math.cos(this.t * 0.25 * f.s + f.p) * 0.04) % 1) * h * 0.92;
      const a = (0.25 + 0.75 * Math.max(0, Math.sin(this.t * 1.3 * f.s + f.p))) * (1 - dawn * 0.8);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, T.firefly);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = a * 0.8;
      ctx.fillStyle = g;
      ctx.fillRect(x - 7, y - 7, 14, 14);
    }
    ctx.restore();
  }
}
