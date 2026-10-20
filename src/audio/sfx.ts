import { settings } from '../game/settings';

/**
 * Procedural sound (WebAudio): koto plucks, taiko, wooden blocks, bells and wind, all synthesised on demand.
 * The context is made on the first user gesture (browser autoplay policy).
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
const unlockListeners: (() => void)[] = [];

const MASTER = 0.6;

/** The shared graph, for the music module. Null until the first gesture. */
export function audioGraph(): { ctx: AudioContext; music: GainNode; noise: AudioBuffer } | null {
  return ctx && musicBus && noiseBuf ? { ctx, music: musicBus, noise: noiseBuf } : null;
}

export function onAudioUnlock(fn: () => void): void {
  if (ctx) fn();
  else unlockListeners.push(fn);
}

export function applyVolumes(): void {
  if (sfxBus) sfxBus.gain.value = settings.sfx;
  if (musicBus) musicBus.gain.value = settings.music * 0.7;
}

export function unlockAudio(): void {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = MASTER;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    sfxBus = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus.connect(master);
    musicBus.connect(master);
    applyVolumes();
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    for (const fn of unlockListeners.splice(0)) fn();
  }
  if (ctx.state !== 'running') void ctx.resume().catch(() => undefined);
}

export function suspendAudio(on: boolean): void {
  if (!ctx) return;
  if (on) void ctx.suspend().catch(() => undefined);
  else void ctx.resume().catch(() => undefined);
}

/** Pitch multiplier of the sound being played. */
let bend = 1;

function env(g: GainNode, t: number, a: number, peak: number, dur: number): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

export interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  to?: number;
  delay?: number;
  attack?: number;
  /** Output node: the sfx bus by default. */
  out?: AudioNode;
}

export function tone(freq: number, dur: number, o: ToneOpts = {}): void {
  if (!ctx || !sfxBus) return;
  const t = ctx.currentTime + (o.delay ?? 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq * bend, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to * bend, t + dur);
  env(g, t, o.attack ?? 0.005, o.vol ?? 0.3, dur);
  osc.connect(g).connect(o.out ?? sfxBus);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export interface NoiseOpts {
  freq?: number;
  to?: number;
  q?: number;
  vol?: number;
  type?: BiquadFilterType;
  delay?: number;
  attack?: number;
  out?: AudioNode;
}

export function noise(dur: number, o: NoiseOpts = {}): void {
  if (!ctx || !sfxBus || !noiseBuf) return;
  const t = ctx.currentTime + (o.delay ?? 0);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.setValueAtTime((o.freq ?? 1200) * bend, t);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to * bend, t + dur);
  f.Q.value = o.q ?? 1;
  const g = ctx.createGain();
  env(g, t, o.attack ?? 0.004, o.vol ?? 0.3, dur);
  src
    .connect(f)
    .connect(g)
    .connect(o.out ?? sfxBus);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

/** A plucked string, koto-like: a bright attack that rings down. */
export function pluck(freq: number, vol = 0.22, delay = 0, out?: AudioNode, ring = 0.7): void {
  tone(freq, ring, { type: 'triangle', vol, delay, out });
  tone(freq * 2.01, ring * 0.5, { type: 'sine', vol: vol * 0.35, delay, out });
  noise(0.05, { freq: freq * 3, q: 2, vol: vol * 0.5, delay, type: 'bandpass', out });
}

/** A taiko hit: a thump with a skin slap. */
export function taiko(vol = 0.5, delay = 0, out?: AudioNode, pitch = 1): void {
  tone(130 * pitch, 0.35, { type: 'sine', vol, to: 52 * pitch, delay, out });
  noise(0.09, { freq: 900, q: 0.8, vol: vol * 0.5, delay, out });
}

/** A temple bell: inharmonic partials with a long ring. */
export function bell(freq: number, vol = 0.2, delay = 0, out?: AudioNode): void {
  for (const [r, v, d] of [
    [1, 1, 1.6],
    [2.76, 0.5, 1.1],
    [5.4, 0.25, 0.7],
  ])
    tone(freq * r, d, { type: 'sine', vol: vol * v, delay, out });
}

/** A wooden block / clapper. */
export function block(vol = 0.25, delay = 0, pitch = 1, out?: AudioNode): void {
  tone(780 * pitch, 0.07, { type: 'square', vol: vol * 0.4, to: 520 * pitch, delay, out });
  noise(0.05, { freq: 1800 * pitch, q: 3, vol, delay, out });
}

/** Notes of the pentatonic scale the effects climb (a played card sounds a step higher each time it comes soon after the last). */
const PENT = [0, 2, 4, 7, 9];
const note = (root: number, step: number): number => root * 2 ** ((PENT[step % 5] + 12 * Math.floor(step / 5)) / 12);

let chain = 0;
let chainAt = 0;

const SOUNDS = {
  tap: () => block(0.12, 0, 1.4),
  button: () => {
    pluck(note(392, 0), 0.14, 0, undefined, 0.3);
    pluck(note(392, 2), 0.12, 0.06, undefined, 0.3);
  },
  back: () => pluck(note(392, 1), 0.14, 0, undefined, 0.25),
  pick: () => block(0.14, 0, 1.2),
  deny: () => {
    tone(160, 0.14, { type: 'square', vol: 0.1, to: 110 });
    block(0.12, 0, 0.7);
  },
  draw: () => noise(0.07, { freq: 2400, to: 5000, q: 1.2, vol: 0.1 }),
  /** A spirit set down. */
  place: () => {
    const now = performance.now();
    chain = now - chainAt < 1400 ? Math.min(chain + 1, 9) : 0;
    chainAt = now;
    pluck(note(330, chain), 0.2, 0, undefined, 0.5);
    block(0.14, 0, 0.9);
  },
  merge: () => {
    for (let i = 0; i < 4; i++) pluck(note(392, i * 2), 0.18, i * 0.06, undefined, 0.5);
    bell(988, 0.1, 0.2);
  },
  charm: () => {
    noise(0.22, { freq: 1500, to: 4200, q: 1, vol: 0.18 });
    pluck(note(523, 2), 0.14, 0.05, undefined, 0.4);
  },
  shot: () => {
    tone(980, 0.07, { type: 'triangle', vol: 0.06, to: 1500 });
  },
  shotHeavy: () => {
    tone(300, 0.14, { type: 'triangle', vol: 0.12, to: 110 });
    noise(0.12, { freq: 800, q: 0.8, vol: 0.14 });
  },
  slash: () => noise(0.1, { freq: 2600, to: 900, q: 1.5, vol: 0.14 }),
  hit: () => block(0.1, 0, 1 + Math.random() * 0.3),
  foeDie: () => {
    tone(420, 0.28, { type: 'sine', vol: 0.12, to: 880 });
    noise(0.2, { freq: 3000, to: 6000, q: 2, vol: 0.08 });
  },
  bossDie: () => {
    taiko(0.5);
    taiko(0.5, 0.16);
    bell(220, 0.3, 0.1);
    noise(0.8, { freq: 600, to: 3000, q: 0.7, vol: 0.2 });
  },
  unitDie: () => {
    tone(200, 0.25, { type: 'triangle', vol: 0.14, to: 90 });
    noise(0.16, { freq: 700, q: 0.8, vol: 0.12 });
  },
  leak: () => {
    taiko(0.6);
    tone(90, 0.5, { type: 'sawtooth', vol: 0.12, to: 45 });
  },
  oil: () => tone(1320, 0.12, { type: 'sine', vol: 0.09, to: 1760 }),
  warn: () => block(0.1, 0, 1.6),
  slamWarn: () => {
    taiko(0.3, 0, undefined, 1.4);
    taiko(0.3, 0.18, undefined, 1.4);
  },
  slam: () => {
    taiko(0.7, 0, undefined, 0.7);
    noise(0.4, { freq: 300, q: 0.6, vol: 0.3 });
  },
  web: () => noise(0.18, { freq: 3500, to: 6000, q: 4, vol: 0.1 }),
  freeze: () => {
    for (let i = 0; i < 3; i++) tone(1800 + i * 300, 0.3, { type: 'sine', vol: 0.07, delay: i * 0.05, to: 1400 });
  },
  ability: () => {
    bell(523, 0.3);
    bell(784, 0.2, 0.08);
    noise(0.5, { freq: 800, to: 4000, q: 0.7, vol: 0.12 });
  },
  start: () => {
    taiko(0.5);
    taiko(0.5, 0.28);
    pluck(note(262, 0), 0.2, 0.5, undefined, 1.4);
    pluck(note(262, 3), 0.2, 0.6, undefined, 1.4);
  },
  dawn: () => {
    for (let i = 0; i < 6; i++) pluck(note(262, i), 0.2, i * 0.12, undefined, 1.6);
    bell(523, 0.25, 0.2);
    bell(784, 0.2, 0.5);
  },
  lose: () => {
    for (let i = 0; i < 4; i++) tone(220 * 2 ** (-i / 6), 0.6, { type: 'triangle', vol: 0.16, delay: i * 0.25 });
    noise(1.2, { freq: 400, to: 80, q: 0.6, vol: 0.18 });
  },
  coin: () => {
    tone(1568, 0.08, { type: 'square', vol: 0.06 });
    tone(2093, 0.18, { type: 'square', vol: 0.06, delay: 0.07 });
  },
  shoji: () => {
    noise(0.28, { freq: 1200, to: 400, q: 0.5, vol: 0.12 });
    block(0.12, 0.26, 0.8);
  },
  stamp: () => {
    taiko(0.4, 0, undefined, 1.3);
    noise(0.1, { freq: 400, q: 0.6, vol: 0.2 });
  },
  page: () => noise(0.12, { freq: 3000, to: 1800, q: 0.9, vol: 0.1 }),
  heal: () => {
    pluck(note(523, 2), 0.14, 0, undefined, 0.5);
    pluck(note(523, 4), 0.14, 0.08, undefined, 0.5);
  },
  buy: () => {
    tone(1568, 0.08, { type: 'square', vol: 0.06 });
    pluck(note(523, 3), 0.18, 0.05, undefined, 0.6);
  },
  burn: () => noise(0.4, { freq: 600, to: 200, q: 0.5, vol: 0.2 }),
} as const;

export type SfxId = keyof typeof SOUNDS;

export function sfx(id: SfxId, pitch = 1): void {
  if (!ctx || settings.sfx <= 0) return;
  if (ctx.state === 'suspended') return;
  bend = pitch;
  try {
    SOUNDS[id]();
  } finally {
    bend = 1;
  }
}
