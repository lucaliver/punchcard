import type { Rng } from '../core/rng';
import { MatchThree } from './match3';
import type { MinigameId } from './types';

/**
 * What a minigame (`EnemyDef.minigame`) has in common: pure, turn-based state of a game the hero plays in a window of its own whenever they like, seeded by its own `Rng`.
 * `Combat` holds one (`Combat.minigame`); the hero's moves go through its own entry point (`Combat.matchSwap`), which turns what they score into damage.
 */
export interface Minigame {
  readonly id: MinigameId;
}

/** One entry per `MinigameId`: a new minigame is a class, an entry here, a window and the config it names. */
export const MINIGAMES: Record<MinigameId, (rng: Rng) => Minigame> = {
  match3: (rng) => new MatchThree(rng),
};
