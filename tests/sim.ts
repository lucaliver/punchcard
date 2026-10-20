import { CARDS } from '../src/data/cards';
import { KEEPERS } from '../src/data/keepers';
import { Battle } from '../src/game/battle';
import type { CardInst, KeeperId } from '../src/game/types';
import { type FightKind, makeStage } from '../src/game/waves';
import { runBot } from './bot';

let uid = 1;
export const deckOf = (ids: string[]): CardInst[] => ids.map((id) => ({ uid: uid++, id, up: false }));

export function fight(keeper: KeeperId, deck: CardInst[], act: number, floor: number, kind: FightKind, seed: number, relics: string[] = []): Battle {
  const k = KEEPERS[keeper];
  const stage = makeStage({ act, floor, kind, seed });
  const b = new Battle({ seed, keeper, deck, relics, stage, flame: k.flame, maxFlame: k.flame });
  return runBot(b);
}

export function winRate(
  keeper: KeeperId,
  deckIds: string[],
  act: number,
  floor: number,
  kind: FightKind,
  n = 30,
): { win: number; flameLeft: number } {
  let win = 0;
  let flame = 0;
  for (let i = 0; i < n; i++) {
    const b = fight(keeper, deckOf(deckIds), act, floor, kind, 1000 + i * 7);
    if (b.state === 'won') {
      win++;
      flame += b.flame;
    }
  }
  return { win: win / n, flameLeft: win ? flame / win : 0 };
}

export const allCardIds = Object.keys(CARDS);
