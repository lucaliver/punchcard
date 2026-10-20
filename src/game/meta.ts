import { loadRaw, store } from '../core/save';
import { CARDS } from '../data/cards';
import { CONFIG } from '../data/config';
import { FOES } from '../data/foes';
import { KEEPER_IDS } from '../data/keepers';
import { MAX_MOON } from '../data/moons';
import { RELICS } from '../data/relics';
import type { KeeperId } from './types';

/** Progress that outlives a run: keepers unlocked, what has been met, records, and the last runs. */

export interface RunLog {
  keeper: KeeperId;
  won: boolean;
  /** The night (1-3) the run reached, and the rooms cleared. */
  act: number;
  fights: number;
  kills: number;
  /** The moon phase it was played at. */
  level: number;
  deck: string[];
  relics: string[];
  at: number;
}

export interface Meta {
  unlocked: KeeperId[];
  seenCards: string[];
  seenFoes: string[];
  seenRelics: string[];
  /** Bosses beaten, by night number. */
  bosses: number[];
  runs: number;
  wins: number;
  bestAct: number;
  history: RunLog[];
  /** The first guided run has been played to its end. */
  introDone: boolean;
  /** The highest moon phase a run may be started at. */
  moon: number;
}

const defaults = (): Meta => ({
  unlocked: ['miko'],
  seenCards: [],
  seenFoes: [],
  seenRelics: [],
  bosses: [],
  runs: 0,
  wins: 0,
  bestAct: 0,
  history: [],
  introDone: false,
  moon: 0,
});

const strings = (v: unknown, known: Record<string, unknown>): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && x in known))] : [];

function validate(raw: Record<string, unknown> | null): Meta {
  const m = defaults();
  if (!raw) return m;
  m.unlocked = [
    ...new Set([
      ...m.unlocked,
      ...(Array.isArray(raw.unlocked) ? (raw.unlocked as unknown[]).filter((k): k is KeeperId => KEEPER_IDS.includes(k as KeeperId)) : []),
    ]),
  ];
  m.seenCards = strings(raw.seenCards, CARDS);
  m.seenFoes = strings(raw.seenFoes, FOES);
  m.seenRelics = strings(raw.seenRelics, RELICS);
  m.bosses = Array.isArray(raw.bosses)
    ? [...new Set((raw.bosses as unknown[]).filter((x): x is number => typeof x === 'number' && x >= 1 && x <= CONFIG.run.acts))]
    : [];
  m.runs = typeof raw.runs === 'number' && raw.runs >= 0 ? Math.floor(raw.runs) : 0;
  m.wins = typeof raw.wins === 'number' && raw.wins >= 0 ? Math.floor(raw.wins) : 0;
  m.bestAct = typeof raw.bestAct === 'number' ? Math.max(0, Math.min(CONFIG.run.acts, Math.floor(raw.bestAct))) : 0;
  m.introDone = raw.introDone === true;
  m.moon = typeof raw.moon === 'number' ? Math.max(0, Math.min(MAX_MOON, Math.floor(raw.moon))) : 0;
  if (Array.isArray(raw.history)) {
    for (const h of raw.history.slice(0, CONFIG.historyMax) as Record<string, unknown>[]) {
      if (!h || !KEEPER_IDS.includes(h.keeper as KeeperId) || typeof h.at !== 'number') continue;
      m.history.push({
        keeper: h.keeper as KeeperId,
        won: h.won === true,
        act: typeof h.act === 'number' ? h.act : 1,
        fights: typeof h.fights === 'number' ? h.fights : 0,
        level: typeof h.level === 'number' ? h.level : 0,
        kills: typeof h.kills === 'number' ? h.kills : 0,
        deck: strings(h.deck, CARDS),
        relics: strings(h.relics, RELICS),
        at: h.at,
      });
    }
  }
  return m;
}

export const meta: Meta = validate(loadRaw<Record<string, unknown>>('meta'));

export const saveMeta = (): void => store('meta', meta);

export const isUnlocked = (k: KeeperId): boolean => meta.unlocked.includes(k);

/** Marks what a screen has shown, so the almanac can list it. Returns whether anything was new. */
export function discover(kind: 'seenCards' | 'seenFoes' | 'seenRelics', ids: readonly string[]): boolean {
  let fresh = false;
  for (const id of ids) {
    if (!meta[kind].includes(id)) {
      meta[kind].push(id);
      fresh = true;
    }
  }
  if (fresh) saveMeta();
  return fresh;
}

const UNLOCK_BY_BOSS: Partial<Record<number, KeeperId>> = { 1: 'ronin', 2: 'tanuki' };

/** A boss of the night fell. Returns the keeper it unlocks, if any is new. */
export function bossDown(act: number): KeeperId | null {
  if (!meta.bosses.includes(act)) meta.bosses.push(act);
  const k = UNLOCK_BY_BOSS[act] ?? null;
  const fresh = k && !meta.unlocked.includes(k) ? k : null;
  if (fresh) meta.unlocked.push(fresh);
  saveMeta();
  return fresh;
}

export function logRun(log: RunLog): void {
  meta.runs++;
  if (log.won) {
    meta.wins++;
    if (log.level >= meta.moon && meta.moon < MAX_MOON) meta.moon = log.level + 1;
  }
  meta.bestAct = Math.max(meta.bestAct, log.act);
  meta.history.unshift(log);
  meta.history.length = Math.min(meta.history.length, CONFIG.historyMax);
  saveMeta();
}

export function resetMeta(): void {
  Object.assign(meta, defaults());
  saveMeta();
}
