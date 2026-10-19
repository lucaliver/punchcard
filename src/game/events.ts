import { EVENT_LIST, type EventChoice, type EventDef, type EventFx, type EventResult } from '../data/events';
import { canGiftRelic, canShred, canUpgrade, currentNode, giftCard, giftRelic, rngOf, shredCard, upgradeCard, type RunState } from './run';
import type { CardInst } from './types';

/** The smallest max HP an event may leave the hero with. */
const MIN_MAX_HP = 10;

const FLAG = (id: string): string => `story.${id}`;
const DONE = (id: string): string => `event.${id}`;

/** Whether the run holds a story flag (set by an event's `flag` effect). */
export const hasStory = (run: RunState, id: string): boolean => !!run.relicFlags[FLAG(id)];

/** Whether the run has already met this event (every event comes once per run). */
export const eventDone = (run: RunState, id: string): boolean => !!run.relicFlags[DONE(id)];

/** The events the current room can deal: in this act, not met yet, and with the story they need told (or not told). */
export function eligibleEvents(run: RunState): EventDef[] {
  const { act } = currentNode(run);
  return EVENT_LIST.filter(
    (e) =>
      (!e.hero || e.hero === run.hero) &&
      e.acts[0] <= act &&
      act <= e.acts[1] &&
      !eventDone(run, e.id) &&
      (!e.needs || hasStory(run, e.needs)) &&
      (!e.unless || !hasStory(run, e.unless)),
  );
}

/** The event of the room the player is in: weighted among the ones that fit (a chapter of a story the run began is far likelier than a new scene). */
export function rollEvent(run: RunState): EventDef {
  const rng = rngOf(run);
  const pool = eligibleEvents(run);
  // An act whose whole list is spent (a very long run of the same hero) deals the first one again rather than an empty room.
  const event = pool.length ? rng.weighted(pool, (e) => e.weight) : EVENT_LIST[0];
  run.rng = rng.state;
  return event;
}

/** A pick the player makes by hand (a deck card), as opposed to the effects that just happen. */
export const needsPick = (fx: EventFx): fx is Extract<EventFx, { kind: 'upgrade' | 'shred' }> => fx.kind === 'upgrade' || fx.kind === 'shred';

/** Whether an effect can happen now: a price must be payable, a card must be there to change. */
export function fxPossible(run: RunState, fx: EventFx): boolean {
  switch (fx.kind) {
    case 'hp':
      return fx.n >= 0 || run.hp > -fx.n;
    case 'maxHp':
      return fx.n >= 0 || run.maxHp + fx.n >= MIN_MAX_HP;
    case 'pay':
      return fx.n >= 0 || run.money >= -fx.n;
    case 'relic':
      return canGiftRelic(run);
    case 'upgrade':
    case 'upgradeRandom':
      return run.deck.some(canUpgrade);
    case 'shred':
      return canShred(run);
    case 'heal':
    case 'card':
    case 'crystal':
    case 'flag':
      return true;
  }
}

/** A choice can be made when every result it may end in is possible. */
export const choicePossible = (run: RunState, choice: EventChoice): boolean => choice.results.every((r) => r.fx.every((fx) => fxPossible(run, fx)));

/** What an effect did, for the screen to show. */
export interface Done {
  fx: EventFx;
  /** HP actually gained (positive) or lost (negative) by an hp or a heal effect. */
  hp?: number;
  card?: CardInst;
  relic?: string;
}

/** The result a choice ends in (a gamble is rolled here, from the run's own rng). */
export function rollResult(run: RunState, choice: EventChoice): EventResult {
  if (choice.results.length === 1) return choice.results[0];
  const rng = rngOf(run);
  const result = rng.weighted(choice.results, (r) => r.w);
  run.rng = rng.state;
  return result;
}

/** Applies one effect that needs no pick. A pick (`needsPick`) is left to the screen, which calls `pickUpgrade` / `pickShred`. */
export function applyFx(run: RunState, fx: EventFx): Done {
  switch (fx.kind) {
    case 'hp': {
      const before = run.hp;
      run.hp = Math.min(run.maxHp, Math.max(1, run.hp + fx.n));
      return { fx, hp: run.hp - before };
    }
    case 'heal': {
      const before = run.hp;
      run.hp = Math.min(run.maxHp, run.hp + Math.round(run.maxHp * fx.pct));
      return { fx, hp: run.hp - before };
    }
    case 'maxHp':
      run.maxHp = Math.max(MIN_MAX_HP, run.maxHp + fx.n);
      run.hp = Math.min(run.maxHp, fx.n > 0 ? run.hp + fx.n : run.hp);
      return { fx };
    case 'pay':
      run.money = Math.max(0, run.money + fx.n);
      return { fx };
    case 'relic':
      return { fx, relic: giftRelic(run) };
    case 'card':
      return { fx, card: giftCard(run, fx.rarity, fx.cross) };
    case 'upgradeRandom': {
      const rng = rngOf(run);
      const pool = run.deck.filter(canUpgrade);
      const card = pool.length ? rng.pick(pool) : undefined;
      run.rng = rng.state;
      if (card) upgradeCard(run, card.uid);
      return { fx, card };
    }
    case 'crystal':
      run.crystals++;
      return { fx };
    case 'flag':
      run.relicFlags[FLAG(fx.id)] = 1;
      return { fx };
    case 'upgrade':
    case 'shred':
      return { fx };
  }
}

export const pickUpgrade = (run: RunState, uid: number): void => upgradeCard(run, uid);
export const pickShred = (run: RunState, uid: number): void => shredCard(run, uid);

/** The scene is over: it won't come again in this run, and the room is done. */
export function finishEvent(run: RunState, id: string): void {
  run.relicFlags[DONE(id)] = 1;
  run.cleared = true;
}
