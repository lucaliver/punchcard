import type { Rng } from '../core/rng';
import { CoffeeTask } from './coffee';
import { ShellGame } from './shells';
import { SushiOrder } from './sushi';
import type { TaskId } from './types';

/**
 * What every chore (`MoveDef.task`) has in common: pure state of something the hero does by hand while an enemy move charges, seeded by `combat.rng`.
 * `Combat` holds one at a time (`Combat.chore`) and only needs this much; the hand's own moves go through the chore's class (`Combat.coffee`, `Combat.pickShell`).
 */
export interface Chore {
  readonly id: TaskId;
  /** Where it stands; `'done'` once the hero has finished it (the move is off while the result is shown). */
  readonly phase: string;
  /** Whether its window covers the belt and the sleeve (belt cards and stashing are out of reach meanwhile). */
  readonly covers: boolean;
  /** The card id the belt deals instead of the deck while the chore is on, given the ids riding it now; null lets the deck deal. */
  serve?(onBelt: string[]): string | null;
  /** Mistakes so far, and the seconds they have cost the hero (`Combat` adds them to the move's countdown). */
  errors: number;
  fined: number;
  /** Advances by simulated time; true once it is done and has been shown long enough. */
  tick(dt: number): boolean;
}

/** One entry per `TaskId`: a new chore is a class, an entry here, a window and the config it names. */
export const CHORES: Record<TaskId, (rng: Rng) => Chore> = {
  coffee: (rng) => new CoffeeTask(rng),
  shells: (rng) => new ShellGame(rng),
  sushi: (rng) => new SushiOrder(rng),
};
