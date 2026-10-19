import type { HeroId, Rarity } from '../game/types';

/**
 * Events: the Water Cooler's little stories. Each one is a scene with a speaker, a few lines and two or three choices; a choice
 * is one outcome or a gamble between several, and what it does is a list of effects the screen shows as chips before the choice is made.
 * Texts: `event.<id>.title`, `.text`, `.<choice>` (the button) and `.<choice>.<n>` (what is said when result `n` comes out).
 */
export type EventFx =
  /** Lose (negative) or gain HP; a loss never kills (HP stops at 1). */
  | { kind: 'hp'; n: number }
  | { kind: 'maxHp'; n: number }
  /** Heal a share of max HP. */
  | { kind: 'heal'; pct: number }
  /** Pay (the run's score): earn (positive) or hand over (negative). */
  | { kind: 'pay'; n: number }
  /** A random stationery, dealt like the Lost & Found's. */
  | { kind: 'relic' }
  /** A random card of this rarity from the hero's pool (`cross`: from any class) is added to the deck. */
  | { kind: 'card'; rarity: Rarity; cross?: boolean }
  /** The player picks a deck card to upgrade / to shred. */
  | { kind: 'upgrade' }
  | { kind: 'shred' }
  /** A random upgradeable card is upgraded without asking. */
  | { kind: 'upgradeRandom' }
  /** A mana crystal for good. */
  | { kind: 'crystal' }
  /** Sets a story flag of the run (read by `EventDef.needs` and `EventDef.unless`). */
  | { kind: 'flag'; id: string };

/** One way a choice can end: `w` is its weight among the choice's results. */
export interface EventResult {
  w: number;
  fx: EventFx[];
}

export interface EventChoice {
  id: string;
  /** What can come out of it: one result is a sure thing, more are a gamble (the chips then show a "?"). */
  results: EventResult[];
}

export interface EventDef {
  id: string;
  /** The acts it can be met in, first to last. */
  acts: [first: number, last: number];
  /** The enemy whose picture speaks; none: the water cooler itself. */
  speaker?: string;
  /** Odds weight among the events that fit (a follow-up to a story the run already started is heavier). */
  weight: number;
  /** Only this hero meets it: a scene about who they are. */
  hero?: HeroId;
  /** A story flag the run must hold / must not hold. */
  needs?: string;
  unless?: string;
  choices: EventChoice[];
}

const sure = (id: string, ...fx: EventFx[]): EventChoice => ({ id, results: [{ w: 1, fx }] });
const gamble = (id: string, ...results: [w: number, ...fx: EventFx[]][]): EventChoice => ({
  id,
  results: results.map(([w, ...fx]) => ({ w, fx })),
});

export const EVENT_LIST: EventDef[] = [
  // ---- the night janitor's story: kind in the morning, a key in the afternoon, the truth at night
  {
    id: 'spill',
    acts: [1, 1],
    speaker: 'nightJanitor',
    weight: 3,
    choices: [
      sure('help', { kind: 'hp', n: -6 }, { kind: 'flag', id: 'janitorFriend' }),
      sure('walk'),
      sure('snitch', { kind: 'pay', n: 40 }, { kind: 'flag', id: 'janitorCold' }),
    ],
  },
  {
    id: 'janitorKey',
    acts: [2, 2],
    speaker: 'nightJanitor',
    weight: 40,
    needs: 'janitorFriend',
    choices: [
      sure('key', { kind: 'upgrade' }, { kind: 'flag', id: 'janitorKey' }),
      sure('ask', { kind: 'heal', pct: 0.3 }, { kind: 'flag', id: 'janitorKey' }),
    ],
  },
  {
    id: 'janitorTruth',
    acts: [3, 3],
    speaker: 'nightJanitor',
    weight: 40,
    needs: 'janitorKey',
    choices: [
      sure('listen', { kind: 'relic' }, { kind: 'flag', id: 'janitorTruth' }),
      sure('thank', { kind: 'maxHp', n: 12 }, { kind: 'flag', id: 'janitorTruth' }),
      sure('ignore', { kind: 'heal', pct: 0.25 }),
    ],
  },
  // ---- the new hire's story: cover for him and he remembers it
  {
    id: 'cover',
    acts: [1, 2],
    speaker: 'newHire',
    weight: 3,
    choices: [sure('lie', { kind: 'hp', n: -5 }, { kind: 'flag', id: 'newHireFriend' }), sure('refuse'), sure('report', { kind: 'pay', n: 40 })],
  },
  {
    id: 'promoted',
    acts: [2, 4],
    speaker: 'newHire',
    weight: 40,
    needs: 'newHireFriend',
    choices: [sure('favour', { kind: 'card', rarity: 'rare' }), sure('money', { kind: 'pay', n: 120 }, { kind: 'maxHp', n: 4 })],
  },
  // ---- the rest of the building
  {
    id: 'pizza',
    acts: [1, 4],
    weight: 2,
    choices: [
      sure('eat', { kind: 'heal', pct: 0.3 }),
      sure('slice', { kind: 'maxHp', n: 4 }),
      gamble('speech', [2, { kind: 'maxHp', n: 8 }], [1, { kind: 'hp', n: -10 }]),
    ],
  },
  {
    id: 'webinar',
    acts: [1, 3],
    speaker: 'hrOrientationVideo',
    weight: 2,
    choices: [
      sure('watch', { kind: 'upgradeRandom' }, { kind: 'hp', n: -6 }),
      sure('nap', { kind: 'heal', pct: 0.25 }),
      sure('question', { kind: 'shred' }),
    ],
  },
  {
    id: 'printer',
    acts: [1, 3],
    speaker: 'printer',
    weight: 2,
    choices: [gamble('kick', [1, { kind: 'relic' }], [2, { kind: 'hp', n: -8 }]), sure('plead', { kind: 'pay', n: 60 }), sure('leave')],
  },
  {
    id: 'suggestion',
    acts: [1, 4],
    weight: 2,
    choices: [
      sure('complain', { kind: 'shred' }, { kind: 'hp', n: -5 }),
      gamble('praise', [1, { kind: 'card', rarity: 'rare' }], [1, { kind: 'pay', n: 50 }]),
      sure('bin'),
    ],
  },
  {
    id: 'wallet',
    acts: [1, 4],
    weight: 2,
    choices: [
      sure('return', { kind: 'maxHp', n: 6 }),
      sure('keep', { kind: 'pay', n: 150 }),
      gamble('count', [1, { kind: 'pay', n: 300 }], [1, { kind: 'hp', n: -12 }]),
    ],
  },
  {
    id: 'review',
    acts: [2, 4],
    speaker: 'hrBitch',
    weight: 2,
    choices: [
      sure('accept', { kind: 'pay', n: 80 }),
      sure('argue', { kind: 'hp', n: -8 }, { kind: 'upgrade' }),
      gamble('cry', [1, { kind: 'heal', pct: 0.4 }], [1, { kind: 'hp', n: -6 }]),
    ],
  },
  {
    id: 'retreat',
    acts: [2, 4],
    speaker: 'happinessOfficer',
    weight: 2,
    choices: [
      gamble('fall', [2, { kind: 'heal', pct: 0.3 }], [1, { kind: 'hp', n: -12 }]),
      sure('escape', { kind: 'upgrade' }, { kind: 'hp', n: -10 }),
      sure('hide', { kind: 'heal', pct: 0.2 }),
    ],
  },
  {
    id: 'replyAll',
    acts: [2, 4],
    speaker: 'snitch',
    weight: 2,
    choices: [
      sure('recall', { kind: 'hp', n: -6 }, { kind: 'card', rarity: 'common' }),
      sure('doubleDown', { kind: 'pay', n: 100 }),
      sure('blame', { kind: 'maxHp', n: -3 }, { kind: 'relic' }),
    ],
  },
  {
    id: 'headhunter',
    acts: [2, 4],
    speaker: 'goblinConsultant',
    weight: 2,
    choices: [sure('hear', { kind: 'maxHp', n: -8 }, { kind: 'card', rarity: 'epic', cross: true }), sure('decline', { kind: 'heal', pct: 0.2 })],
  },
  {
    id: 'ficus',
    acts: [1, 3],
    speaker: 'witheredFicus',
    weight: 2,
    choices: [
      sure('water', { kind: 'hp', n: -4 }, { kind: 'maxHp', n: 5 }),
      sure('mourn', { kind: 'heal', pct: 0.25 }),
      sure('steal', { kind: 'card', rarity: 'common' }),
    ],
  },
  {
    id: 'fridge',
    acts: [1, 3],
    weight: 2,
    choices: [
      gamble('eat', [2, { kind: 'heal', pct: 0.3 }], [1, { kind: 'hp', n: -14 }]),
      sure('tag', { kind: 'pay', n: 30 }),
      sure('bin', { kind: 'maxHp', n: 3 }),
    ],
  },
  // ---- each hero's own scene
  {
    id: 'armClaim',
    hero: 'warrior',
    acts: [1, 2],
    speaker: 'hrBitch',
    weight: 4,
    choices: [
      sure('claim', { kind: 'hp', n: -6 }, { kind: 'pay', n: 120 }),
      sure('prosthetic', { kind: 'hp', n: -10 }, { kind: 'relic' }),
      sure('wave', { kind: 'maxHp', n: 5 }),
    ],
  },
  {
    id: 'passwordReset',
    hero: 'mage',
    acts: [1, 3],
    speaker: 'theNerd',
    weight: 4,
    choices: [
      sure('help', { kind: 'hp', n: -4 }, { kind: 'upgradeRandom' }),
      gamble('snoop', [1, { kind: 'relic' }], [1, { kind: 'hp', n: -10 }]),
      sure('hunter2', { kind: 'pay', n: 100 }),
    ],
  },
  {
    id: 'unionMeeting',
    hero: 'necromancer',
    acts: [1, 3],
    speaker: 'veteran',
    weight: 4,
    choices: [
      sure('oath', { kind: 'hp', n: -6 }, { kind: 'maxHp', n: 6 }),
      sure('dues', { kind: 'pay', n: 100 }),
      gamble('dead', [1, { kind: 'relic' }], [1, { kind: 'hp', n: -12 }]),
    ],
  },
  {
    id: 'staplerHeist',
    hero: 'rogue',
    acts: [1, 3],
    speaker: 'micromanager',
    weight: 4,
    choices: [
      gamble('steal', [2, { kind: 'relic' }], [1, { kind: 'hp', n: -10 }]),
      sure('swap', { kind: 'hp', n: -4 }, { kind: 'card', rarity: 'common' }),
      sure('guard', { kind: 'pay', n: 80 }),
    ],
  },
  // ---- the night shift
  {
    id: 'threeAm',
    acts: [3, 3],
    speaker: 'helpdeskChatbot',
    weight: 3,
    choices: [
      sure('ask', { kind: 'crystal' }, { kind: 'hp', n: -10 }),
      sure('reboot', { kind: 'heal', pct: 0.4 }),
      sure('unplug', { kind: 'upgrade' }),
    ],
  },
  {
    id: 'emptyOffice',
    acts: [3, 3],
    weight: 3,
    choices: [
      sure('sit', { kind: 'heal', pct: 0.45 }),
      gamble('search', [1, { kind: 'relic' }], [1, { kind: 'hp', n: -12 }]),
      sure('leaveLights', { kind: 'maxHp', n: 5 }),
    ],
  },
  // ---- the weekend
  {
    id: 'groupChat',
    acts: [4, 4],
    speaker: 'workWife',
    weight: 4,
    choices: [
      sure('reply', { kind: 'hp', n: -8 }, { kind: 'pay', n: 120 }),
      sure('mute', { kind: 'heal', pct: 0.3 }),
      sure('cut', { kind: 'upgrade' }),
    ],
  },
  {
    id: 'sunday',
    acts: [4, 4],
    weight: 3,
    choices: [
      sure('park', { kind: 'heal', pct: 0.4 }),
      sure('prep', { kind: 'upgradeRandom' }, { kind: 'hp', n: -6 }),
      gamble('gamble', [1, { kind: 'relic' }], [1, { kind: 'hp', n: -10 }]),
    ],
  },
];

export const EVENTS: Record<string, EventDef> = Object.fromEntries(EVENT_LIST.map((e) => [e.id, e]));
