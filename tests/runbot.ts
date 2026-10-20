import { CARDS } from '../src/data/cards';
import { CONFIG } from '../src/data/config';
import { Battle } from '../src/game/battle';
import {
  afterFight,
  applyBattle,
  battleSetup,
  canUpgrade,
  fightKind,
  heal,
  newRun,
  offerReward,
  reachable,
  removeCard,
  restHeal,
  rollRelics,
  type RunNode,
  type RunState,
  startAct,
  stockShop,
  takeCard,
  takeRelic,
  transformCard,
  upgradeCard,
} from '../src/game/run';
import type { KeeperId } from '../src/game/types';
import { runBot } from './bot';

/** Plays a whole run with plain rules of thumb, to see how far a reasonable player gets. */

const RARITY = { common: 1, rare: 2, epic: 3, legend: 4 } as const;

export function cardScore(run: RunState, id: string): number {
  const def = CARDS[id];
  let s = RARITY[def.rarity];
  const sd = def.spirit?.(false);
  const have = run.deck.filter((c) => c.id === id).length;
  if (def.keeper === run.keeper) s += 0.6;
  if (sd?.atk) s += 1.2;
  if (sd?.oil) s += run.deck.filter((c) => CARDS[c.id].spirit?.(false).oil).length >= 2 ? -2 : 0.8;
  if (sd && !sd.atk && !sd.oil) s += 0.2;
  if (def.kind === 'charm') s -= run.deck.filter((c) => CARDS[c.id].kind === 'charm').length >= 4 ? 2 : 0;
  if (have >= 1 && have < 3) s += 0.7;
  if (have >= 3) s -= 2;
  if (def.cost >= 4) s += 0.3;
  return s - (run.deck.length > 14 ? (run.deck.length - 14) * 0.35 : 0);
}

function chooseCard(run: RunState, ids: string[]): string | null {
  const scored = ids.map((id) => ({ id, s: cardScore(run, id) })).sort((a, b) => b.s - a.s);
  return scored[0] && scored[0].s >= 2.2 ? scored[0].id : null;
}

function pickNode(run: RunState): RunNode {
  const options = reachable(run);
  const hurt = run.flame / run.maxFlame;
  const rank = (n: RunNode): number => {
    switch (n.type) {
      case 'rest':
        return hurt < 0.7 ? 5 : 1;
      case 'market':
        return run.mon >= 70 ? 4 : 1.5;
      case 'shrine':
        return run.deck.length > 11 ? 2.5 : 1;
      case 'treasure':
        return 3.5;
      case 'elite':
        return hurt > 0.7 ? 3 : 0.5;
      case 'boss':
        return 9;
      default:
        return 2;
    }
  };
  return [...options].sort((a, b) => rank(b) - rank(a))[0];
}

export interface RunResult {
  won: boolean;
  act: number;
  fights: number;
  deck: number;
  /** Where it fell: kind and row of the room. */
  fell?: string;
}

export function playRun(keeper: KeeperId, seed: number): RunResult {
  const run = newRun(keeper, seed, false);
  let fights = 0;
  for (let act = 1; act <= CONFIG.run.acts; act++) {
    if (act > 1) startAct(run, act);
    for (let guard = 0; guard < 30; guard++) {
      const node = pickNode(run);
      if (node.type === 'watch' || node.type === 'elite' || node.type === 'boss') {
        const kind = fightKind(node);
        const b = runBot(new Battle(battleSetup(run, node)));
        fights++;
        if (b.state !== 'won') return { won: false, act, fights, deck: run.deck.length, fell: `${kind}@${node.row}` };
        applyBattle(run, node, b.flame, b.stats);
        afterFight(run, kind);
        const early = b.time < b.stage.duration - 1;
        const offer = offerReward(run, kind, b.flame, early ? b.stage.duration - b.time : 0, early);
        if (offer.relics[0]) takeRelic(run, offer.relics[0]);
        const pick = chooseCard(
          run,
          offer.cards.map((c) => c.id),
        );
        const chosen = offer.cards.find((c) => c.id === pick);
        if (chosen) takeCard(run, chosen);
        else run.mon += CONFIG.run.skipPay;
        run.reward = null;
        if (node.type === 'boss') break;
        continue;
      }
      run.at = node.id;
      run.visited[node.type] = (run.visited[node.type] ?? 0) + 1;
      if (node.type === 'rest') {
        if (run.flame / run.maxFlame < 0.7) heal(run, restHeal(run));
        else if (canUpgrade(run)) {
          const best = [...run.deck].filter((c) => !c.up).sort((a, b) => cardScore(run, b.id) - cardScore(run, a.id))[0];
          if (best) upgradeCard(run, best.uid);
        }
      } else if (node.type === 'shrine') {
        const worst = [...run.deck].sort((a, b) => cardScore(run, a.id) - cardScore(run, b.id))[0];
        if (run.deck.length > 9) removeCard(run, worst.uid);
        else transformCard(run, worst.uid);
      } else if (node.type === 'treasure') {
        const relic = rollRelics(run, 3)[0];
        if (relic) takeRelic(run, relic);
      } else if (node.type === 'market') {
        const shop = stockShop(run);
        for (const sc of [...shop.cards].sort((a, b) => cardScore(run, b.card.id) - cardScore(run, a.card.id))) {
          if (cardScore(run, sc.card.id) >= 2.6 && run.mon >= sc.price) {
            run.mon -= sc.price;
            takeCard(run, sc.card);
            sc.sold = true;
          }
        }
        for (const sr of shop.relics) {
          if (run.mon >= sr.price) {
            run.mon -= sr.price;
            takeRelic(run, sr.id);
          }
        }
        if (run.flame / run.maxFlame < 0.6 && run.mon >= shop.healCost) {
          run.mon -= shop.healCost;
          heal(run, Math.ceil(run.maxFlame * 0.5));
        }
      }
    }
  }
  return { won: true, act: CONFIG.run.acts, fights, deck: run.deck.length };
}
