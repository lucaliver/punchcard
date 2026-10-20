import { card } from '../src/data/cards';
import type { Battle, Unit } from '../src/game/battle';
import { COLS, PLACE_ROW, ROWS } from '../src/game/types';

/** A plain player for the balance runs: reads the lanes, sets blockers in front and shooters behind, fires charms where the parade is thickest. */

const laneFoes = (b: Battle, lane: number): number => b.foes.filter((f) => f.lane === lane && !f.dead).length;

function bestLane(b: Battle, wantQuiet = false): number {
  const lanes = Array.from({ length: COLS }, (_, l) => l);
  const score = (l: number): number => b.laneThreat(l) + laneFoes(b, l) * 2 + (b.units.filter((u: Unit) => u.lane === l).length ? 0 : 0.01);
  return lanes.reduce((best, l) => ((wantQuiet ? score(l) < score(best) : score(l) > score(best)) ? l : best), 2);
}

const isFront = (cardId: string): boolean => {
  const sd = card(cardId).spirit?.(false);
  return !!sd && (!!sd.thorns || !!sd.sticky || sd.atk?.kind === 'melee' || !!sd.revive || !!sd.onDeath);
};

function freeRow(b: Battle, lane: number, front: boolean): number {
  const rows = Array.from({ length: ROWS - PLACE_ROW }, (_, i) => PLACE_ROW + i);
  const order = front ? rows : rows.reverse();
  for (const r of order) if (b.tileFree(lane, r)) return r;
  return -1;
}

/** Tries to play one card. Returns whether it did. */
export function botAct(b: Battle): boolean {
  const foes = b.foes.filter((f) => !f.dead);
  const deepest = foes.reduce((m, f) => Math.max(m, f.y), 0);
  if (b.abilityReady && (foes.length >= 3 || deepest > 4.5)) b.useAbility();
  for (let s = 0; s < b.hand.length; s++) {
    const c = b.hand[s];
    if (!c || b.oil + 1e-6 < b.cardCost(c)) continue;
    const def = card(c.id);
    if (def.kind === 'spirit') {
      const sd = def.spirit?.(c.up);
      if (!sd) continue;
      const producer = !!sd.oil;
      // Merge with a twin first when one stands in a lane that matters.
      const twin = b.units.find((u) => u.cardId === c.id && u.level < 3 && !u.dead);
      if (twin && !producer && b.check(s, twin.lane, twin.row).ok && b.units.filter((u) => u.cardId === c.id).length >= 2) {
        b.play(s, twin.lane, twin.row);
        return true;
      }
      const lane = producer ? bestLane(b, true) : bestLane(b);
      const row = freeRow(b, lane, !producer && isFront(c.id));
      if (row >= 0 && b.check(s, lane, row).ok) {
        if (producer && b.units.filter((u) => u.def.oil).length >= 4) continue;
        b.play(s, lane, row);
        return true;
      }
      // Lane full: try any other.
      for (let l = 0; l < COLS; l++) {
        const r = freeRow(b, l, isFront(c.id));
        if (r >= 0 && b.play(s, l, r)) return true;
      }
      continue;
    }
    const fx = def.fx?.(c.up) ?? [];
    const first = fx[0];
    if (!first) continue;
    if (def.aim === 'lane') {
      const lane = bestLane(b);
      if (laneFoes(b, lane) === 0) continue;
      if (b.play(s, lane)) return true;
    } else if (def.aim === 'tile') {
      const lane = bestLane(b);
      const row = freeRow(b, lane, true);
      if (row >= 0 && b.play(s, lane, row)) return true;
    } else {
      switch (first.k) {
        case 'oil':
          if (b.oil < b.maxOil - 4 && b.play(s)) return true;
          break;
        case 'redeal':
          if (b.oil < 3 && b.play(s)) return true;
          break;
        case 'mend':
          if (b.units.some((u) => u.hp < u.maxHp * 0.6) && b.play(s)) return true;
          break;
        case 'flame':
          if (b.flame < b.maxFlame && b.play(s)) return true;
          break;
        case 'bless':
          if (b.units.filter((u) => u.def.atk).length >= 3 && foes.length >= 2 && b.play(s)) return true;
          break;
        case 'hit':
          if (foes.length >= (first.scope === 'strongest' ? 1 : 3) && b.play(s)) return true;
          break;
        case 'summon':
          if (foes.length >= 2 && b.play(s)) return true;
          break;
        case 'gamble':
          if (b.oil < 6 && b.play(s)) return true;
          break;
        default:
          break;
      }
    }
  }
  return false;
}

/** Plays a whole fight; returns the battle. */
export function runBot(b: Battle, maxSeconds = 400): Battle {
  b.start();
  let next = 0;
  while (b.state === 'playing' && b.time < maxSeconds) {
    b.step(0.1);
    if (b.time >= next) {
      next = b.time + 0.45;
      for (let i = 0; i < 3; i++) if (!botAct(b)) break;
    }
  }
  return b;
}
