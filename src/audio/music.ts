import { Rng } from '../core/rng';
import { audioGraph, bell, block, noise, onAudioUnlock, pluck, taiko, tone } from './sfx';

/**
 * The score: generated live from a few rules per track (a scale, a progression, which layers play), so nothing is recorded and every
 * night sounds a little different. Layers: a drone, koto-like plucks, a breathy flute, taiko and wooden blocks.
 */

export type TrackId = 'title' | 'map' | 'night1' | 'night2' | 'night3' | 'boss' | 'rest' | 'market' | 'win' | 'lose';

interface Track {
  bpm: number;
  /** Root frequency in Hz. */
  root: number;
  /** Scale in semitones above the root (five notes). */
  scale: number[];
  /** Scale degrees (0-4) the bass walks through, one per bar. */
  prog: number[];
  pluck: number;
  flute: number;
  drums: number;
  blocks: number;
  /** Notes of the plucks climb through this many octaves. */
  span: number;
}

const YO = [0, 2, 5, 7, 9];
const IN = [0, 1, 5, 7, 8];
const INSEN = [0, 1, 5, 7, 10];
const RYUKYU = [0, 4, 5, 7, 11];

const TRACKS: Record<TrackId, Track> = {
  title: { bpm: 66, root: 220, scale: YO, prog: [0, 3, 2, 4], pluck: 0.55, flute: 0.8, drums: 0.1, blocks: 0, span: 2 },
  map: { bpm: 72, root: 196, scale: YO, prog: [0, 2, 3, 2], pluck: 0.5, flute: 0.6, drums: 0, blocks: 0.2, span: 2 },
  night1: { bpm: 92, root: 220, scale: YO, prog: [0, 0, 3, 4], pluck: 0.6, flute: 0.3, drums: 0.7, blocks: 0.4, span: 2 },
  night2: { bpm: 100, root: 207.65, scale: INSEN, prog: [0, 2, 0, 3], pluck: 0.65, flute: 0.2, drums: 0.8, blocks: 0.5, span: 2 },
  night3: { bpm: 108, root: 185, scale: IN, prog: [0, 1, 0, 4], pluck: 0.7, flute: 0.2, drums: 0.9, blocks: 0.6, span: 2 },
  boss: { bpm: 120, root: 164.81, scale: IN, prog: [0, 0, 1, 4], pluck: 0.8, flute: 0, drums: 1, blocks: 0.8, span: 3 },
  rest: { bpm: 56, root: 196, scale: YO, prog: [0, 3], pluck: 0.35, flute: 0.9, drums: 0, blocks: 0, span: 1 },
  market: { bpm: 112, root: 233, scale: RYUKYU, prog: [0, 3, 0, 4], pluck: 0.8, flute: 0.2, drums: 0.3, blocks: 0.8, span: 2 },
  win: { bpm: 88, root: 261.63, scale: YO, prog: [0, 2, 4, 0], pluck: 0.9, flute: 0.8, drums: 0.4, blocks: 0, span: 3 },
  lose: { bpm: 48, root: 164.81, scale: IN, prog: [0, 1], pluck: 0.2, flute: 0.9, drums: 0, blocks: 0, span: 1 },
};

let current: TrackId | null = null;
let timer = 0;
let nextTime = 0;
let step = 0;
let bar = 0;
let rng = new Rng(1);
let intensity = 0;
let want: TrackId | null = null;

const freqAt = (tr: Track, degree: number): number => {
  const oct = Math.floor(degree / 5);
  return tr.root * 2 ** ((tr.scale[((degree % 5) + 5) % 5] + 12 * oct) / 12);
};

function scheduleStep(tr: Track, t0: number, ctxTime: number): void {
  const g = audioGraph();
  if (!g) return;
  const delay = Math.max(0, t0 - ctxTime);
  const degree = tr.prog[bar % tr.prog.length];
  const beat = step % 8;
  // drone: the root of the bar, once
  if (beat === 0) {
    tone(freqAt(tr, degree - 5), (60 / tr.bpm) * 4, { type: 'sine', vol: 0.16, delay, out: g.music, attack: 0.08 });
    tone(freqAt(tr, degree - 5) * 1.5, (60 / tr.bpm) * 4, { type: 'sine', vol: 0.05, delay, out: g.music, attack: 0.3 });
  }
  // plucks: chord tones and neighbours, a little different each bar
  if (rng.chance(tr.pluck * (beat % 2 === 0 ? 1 : 0.55))) {
    const pick = [0, 2, 4, 5, 7][rng.int(0, 4)] + degree;
    pluck(freqAt(tr, pick + 5 * (tr.span - 1) * (rng.chance(0.3) ? 1 : 0)), 0.13 + rng.next() * 0.05, delay, g.music, 0.9);
  }
  // the flute: a long breathy note now and then
  if (beat === 0 && bar % 2 === 0 && rng.chance(tr.flute)) {
    const f = freqAt(tr, degree + [4, 5, 7][rng.int(0, 2)]);
    const dur = (60 / tr.bpm) * 6;
    tone(f, dur, { type: 'sine', vol: 0.09, delay, out: g.music, attack: 0.35 });
    tone(f * 2, dur, { type: 'sine', vol: 0.02, delay, out: g.music, attack: 0.5 });
    noise(dur, { freq: f * 2, q: 6, vol: 0.02, delay, type: 'bandpass', out: g.music, attack: 0.4 });
  }
  const push = 1 + intensity * 0.6;
  // taiko: the pulse
  if (tr.drums > 0) {
    if (beat === 0) taiko(0.34 * tr.drums * push, delay, g.music, 0.9);
    if (beat === 4 && rng.chance(0.7 + intensity * 0.3)) taiko(0.26 * tr.drums * push, delay, g.music, 1);
    if ((beat === 3 || beat === 7) && rng.chance(tr.drums * 0.35 + intensity * 0.3)) taiko(0.18 * tr.drums, delay, g.music, 1.3);
  }
  // wooden blocks: the ticking of the night
  if (tr.blocks > 0 && beat % 2 === 1 && rng.chance(tr.blocks * 0.6)) block(0.1 * tr.blocks, delay, 1.1 + rng.next() * 0.4, g.music);
  // a bell on the first beat of a new phrase
  if (beat === 0 && bar % 4 === 0 && tr.flute > 0.5) bell(freqAt(tr, degree + 10), 0.07, delay, g.music);
}

function pump(): void {
  const g = audioGraph();
  if (!g || !current) return;
  const tr = TRACKS[current];
  const eighth = 60 / tr.bpm / 2;
  if (nextTime < g.ctx.currentTime) nextTime = g.ctx.currentTime + 0.05;
  while (nextTime < g.ctx.currentTime + 0.25) {
    scheduleStep(tr, nextTime, g.ctx.currentTime);
    nextTime += eighth;
    step++;
    if (step % 8 === 0) bar++;
  }
}

function begin(id: TrackId): void {
  current = id;
  step = 0;
  bar = 0;
  nextTime = 0;
  rng = new Rng(id.length * 977 + Math.floor(Math.random() * 1000));
  clearInterval(timer);
  timer = window.setInterval(pump, 60);
  pump();
}

/** Starts a track (after the first user gesture). The same track again does nothing. */
export function playMusic(id: TrackId): void {
  want = id;
  if (current === id) return;
  onAudioUnlock(() => {
    if (want === id) begin(id);
  });
}

/** 0..1: how hard the fight is pressing; the drums answer. */
export function setIntensity(k: number): void {
  intensity = Math.max(0, Math.min(1, k));
}
