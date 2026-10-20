import { Rng } from '../core/rng';
import { CONFIG } from '../data/config';
import { moonMods } from '../data/moons';
import { BOSS_OF_ACT, FOES } from '../data/foes';
import { COLS, type FoeDef, PLACE_ROW, ROWS, type Spawn, type StageDef, type Terrain } from './types';

export type FightKind = 'watch' | 'elite' | 'boss';

export interface StageOpts {
  act: number;
  /** How far into the act (0-based): later fights are bigger. */
  floor: number;
  kind: FightKind;
  seed: number;
  /** A tamer first fight: the guided one. */
  gentle?: boolean;
  /** The moon phase of the run (0 = none). */
  moon?: number;
}

/** Foes an act deals as ordinary company, with the ones it introduces counted double. */
function pool(act: number, tier: FoeDef['tier']): { def: FoeDef; w: number }[] {
  return Object.values(FOES)
    .filter((f) => f.tier === tier && f.acts.includes(act))
    .map((def) => ({ def, w: (def.acts[0] === act ? 2 : 1) / Math.sqrt(def.cost) }));
}

function terrainFor(rng: Rng, boss: boolean): Terrain[][] {
  const grid: Terrain[][] = Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => 'ground' as Terrain));
  const free: [number, number][] = [];
  for (let l = 0; l < COLS; l++) for (let r = PLACE_ROW; r < ROWS; r++) free.push([l, r]);
  rng.shuffle(free);
  const [rMin, rMax] = CONFIG.stage.rocks;
  const [sMin, sMax] = CONFIG.stage.shrines;
  const rocks = boss ? 1 : rng.int(rMin, rMax);
  const shrines = boss ? 2 : rng.int(sMin, sMax);
  for (let i = 0; i < rocks; i++) {
    const [l, r] = free.pop() as [number, number];
    grid[l][r] = 'rock';
  }
  for (let i = 0; i < shrines; i++) {
    const [l, r] = free.pop() as [number, number];
    grid[l][r] = 'shrine';
  }
  return grid;
}

/** The night's parade: when each foe walks in, and in which lane. Dealt from a budget, so the same seed is the same night. */
export function makeStage(opts: StageOpts): StageDef {
  const rng = new Rng(opts.seed ^ 0x9e3779b9);
  const { act, floor, kind } = opts;
  const moon = moonMods(opts.moon ?? 0);
  const cfg = CONFIG.stage;
  const duration = cfg.duration[kind] + (act - 1) * 4;
  let budget = cfg.budget.base + cfg.budget.perFloor * floor + cfg.budget.perAct * (act - 1);
  if (kind === 'elite') budget *= cfg.budget.elite;
  if (kind === 'boss') budget *= 0.65;
  if (opts.gentle) budget *= 0.6;

  const normals = pool(act, 'normal');
  const minions = pool(act, 'minion');
  const picked: FoeDef[] = [];
  let left = budget;
  while (left > 0.5) {
    const choices = normals.filter((n) => n.def.cost <= left + 0.6);
    const from = choices.length ? choices : minions.length ? minions : normals;
    const def = rng.weighted(from, (c) => c.w).def;
    picked.push(def);
    left -= def.cost;
    if (picked.length > 80) break;
  }

  const start = CONFIG.openingQuiet;
  const end = duration - CONFIG.tailQuiet;
  const spawns: Spawn[] = [];
  const recent: number[] = [];
  const pickLane = (): number => {
    const lane = rng.weighted([0, 1, 2, 3, 4], (l) => (recent.includes(l) ? 0.25 : 1));
    recent.push(lane);
    if (recent.length > 2) recent.shift();
    return lane;
  };

  // Spread the company over the night: a gentle ramp, and now and then a pair walking in together.
  let i = 0;
  const slots = picked.length;
  let t: number = start;
  while (i < slots) {
    const frac = i / Math.max(1, slots - 1);
    const gap = ((end - start) / Math.max(1, slots)) * (1.35 - 0.7 * frac);
    t = Math.min(end, t + gap * (0.65 + rng.next() * 0.7));
    const pair = i + 1 < slots && rng.chance(0.18);
    spawns.push({ t, lane: pickLane(), foe: picked[i].id });
    i++;
    if (pair) {
      spawns.push({ t: t + 0.3 + rng.next() * 0.8, lane: pickLane(), foe: picked[i].id });
      i++;
    }
  }

  if (kind === 'elite') {
    const elites = pool(act, 'elite');
    const def = elites.length ? rng.weighted(elites, () => 1).def : null;
    if (def) spawns.push({ t: duration * 0.42, lane: rng.int(1, COLS - 2), foe: def.id });
  }
  let boss: string | undefined;
  if (kind === 'boss') {
    boss = BOSS_OF_ACT[act];
    if (act === 2) for (let l = 0; l < COLS; l++) spawns.push({ t: 7 + l * 2.2, lane: l, foe: boss });
    else spawns.push({ t: 7, lane: 2, foe: boss });
  }

  spawns.sort((a, b) => a.t - b.t);
  return {
    act,
    duration,
    spawns,
    terrain: terrainFor(rng, kind === 'boss'),
    hpMul: (1 + cfg.foeHpAct * (act - 1) + cfg.foeHpFloor * floor) * (1 + moon.hp),
    eliteMul: 1 + moon.elite,
    speedMul: 1 + moon.speed,
    boss,
  };
}
