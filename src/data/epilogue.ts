import { hasStory } from '../game/events';
import type { RunState } from '../game/run';

/**
 * The last lines of a run, said after the title of its end: one about the hero and one about the story the run told (the Night Janitor, the New
 * Hire), when it told one. Texts: `epilogue.<hero>.<win|lose>` and `epilogue.<story>.<win|lose>`.
 */
export function epilogueKeys(run: RunState, won: boolean): string[] {
  const end = won ? 'win' : 'lose';
  const story = [
    hasStory(run, 'janitorTruth') ? `janitorTruth.${end}` : undefined,
    hasStory(run, 'newHireFriend') ? `newHire.${end}` : undefined,
    hasStory(run, 'janitorFriend') ? `janitorFriend.${end}` : undefined,
  ].find(Boolean);
  return [`${run.hero}.${end}`, ...(story ? [story] : [])].map((k) => `epilogue.${k}`);
}
