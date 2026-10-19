import { Rng } from '../core/rng';
import { hasStory } from '../game/events';
import type { RunState } from '../game/run';

/**
 * The Intercom: the building's voice. A line over the map, picked from what the run is going through (a cue) or, failing that, from the act's own
 * tone (cheery in the morning, passive-aggressive after lunch, wrong at night, the office intruding on the weekend). Texts: `intercom.<id>`.
 */
export type IntercomCue =
  | 'start'
  | 'lowHp'
  | 'fullHp'
  | 'bossNext'
  | 'afterElite'
  | 'afterBoss'
  | 'afterEvent'
  | 'afterRest'
  | 'rich'
  | 'janitorFriend'
  | 'newHireFriend'
  | 'internFriend';

export interface IntercomDef {
  id: string;
  /** The acts it can be heard in, first to last (any when missing). */
  acts?: [first: number, last: number];
  /** The moment it answers; without one it is a line of its act. */
  cue?: IntercomCue;
}

/** Pay at which the Intercom starts to mention it. */
const RICH_PAY = 500;
/** HP share under which it notices the hero is hurt, and over which that they are well. */
const LOW_HP = 0.35;
const FULL_HP = 0.95;
/** A cue's lines weigh this against an act's ordinary ones. */
const CUE_WEIGHT = 4;

export const INTERCOM: IntercomDef[] = [
  // ---- the morning: cheery
  { id: 'morning1', acts: [1, 1] },
  { id: 'morning2', acts: [1, 1] },
  { id: 'morning3', acts: [1, 1] },
  { id: 'morning4', acts: [1, 1] },
  { id: 'morning5', acts: [1, 1] },
  { id: 'morning6', acts: [1, 1] },
  { id: 'morning7', acts: [1, 1] },
  { id: 'morning8', acts: [1, 1] },
  { id: 'morning9', acts: [1, 1] },
  // ---- the afternoon: passive-aggressive
  { id: 'afternoon1', acts: [2, 2] },
  { id: 'afternoon2', acts: [2, 2] },
  { id: 'afternoon3', acts: [2, 2] },
  { id: 'afternoon4', acts: [2, 2] },
  { id: 'afternoon5', acts: [2, 2] },
  { id: 'afternoon6', acts: [2, 2] },
  { id: 'afternoon7', acts: [2, 2] },
  { id: 'afternoon8', acts: [2, 2] },
  { id: 'afternoon9', acts: [2, 2] },
  // ---- the night: wrong
  { id: 'night1', acts: [3, 3] },
  { id: 'night2', acts: [3, 3] },
  { id: 'night3', acts: [3, 3] },
  { id: 'night4', acts: [3, 3] },
  { id: 'night5', acts: [3, 3] },
  { id: 'night6', acts: [3, 3] },
  { id: 'night7', acts: [3, 3] },
  { id: 'night8', acts: [3, 3] },
  // ---- the weekend: the office will not leave you alone
  { id: 'weekend1', acts: [4, 4] },
  { id: 'weekend2', acts: [4, 4] },
  { id: 'weekend3', acts: [4, 4] },
  { id: 'weekend4', acts: [4, 4] },
  { id: 'weekend5', acts: [4, 4] },
  { id: 'weekend6', acts: [4, 4] },
  // ---- what the run is going through
  { id: 'start1', cue: 'start' },
  { id: 'start2', cue: 'start' },
  { id: 'lowHp1', cue: 'lowHp' },
  { id: 'lowHp2', cue: 'lowHp' },
  { id: 'lowHp3', cue: 'lowHp' },
  { id: 'fullHp1', cue: 'fullHp' },
  { id: 'bossNext1', cue: 'bossNext' },
  { id: 'bossNext2', cue: 'bossNext' },
  { id: 'afterElite1', cue: 'afterElite' },
  { id: 'afterBoss1', cue: 'afterBoss' },
  { id: 'afterEvent1', cue: 'afterEvent' },
  { id: 'afterRest1', cue: 'afterRest' },
  { id: 'janitorFriend1', cue: 'janitorFriend' },
  { id: 'newHireFriend1', cue: 'newHireFriend' },
  { id: 'internFriend1', cue: 'internFriend' },
  { id: 'rich1', cue: 'rich' },
  { id: 'rich2', cue: 'rich' },
];

/** What the run is going through, as the cues the Intercom answers. */
export function cuesOf(run: RunState): Set<IntercomCue> {
  const cues = new Set<IntercomCue>();
  const here = run.nodes[run.current];
  if (run.path.length <= 1) cues.add('start');
  if (run.hp <= run.maxHp * LOW_HP) cues.add('lowHp');
  else if (run.hp >= run.maxHp * FULL_HP) cues.add('fullHp');
  if (run.money >= RICH_PAY) cues.add('rich');
  // The people the run has been kind to remember it.
  for (const story of ['janitorFriend', 'newHireFriend', 'internFriend'] as const) if (hasStory(run, story)) cues.add(story);
  if (run.cleared) {
    if (here.next.some((id) => run.nodes[id].type === 'boss')) cues.add('bossNext');
    if (here.type === 'elite') cues.add('afterElite');
    if (here.type === 'boss') cues.add('afterBoss');
    if (here.type === 'event') cues.add('afterEvent');
    if (here.type === 'rest') cues.add('afterRest');
  }
  return cues;
}

/** The line the Intercom reads now. The same room always gets the same line; `salt` asks for another (a tap on the speaker). */
export function pickIntercom(run: RunState, act: number, salt = 0): string {
  const cues = cuesOf(run);
  const rng = new Rng((run.seed ^ Math.imul(run.current + 1, 2654435761) ^ Math.imul(salt + 1, 40503)) >>> 0);
  const fits = INTERCOM.filter((l) => (l.cue ? cues.has(l.cue) : !l.acts || (l.acts[0] <= act && act <= l.acts[1])));
  const pool = fits.length ? fits : INTERCOM;
  return rng.weighted(pool, (l) => (l.cue ? CUE_WEIGHT : 1)).id;
}
