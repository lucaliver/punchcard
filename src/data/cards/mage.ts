import type { Combat } from '../../game/combat';
import type { CardDef } from '../../game/types';

/** Whole seconds of Rush the belt has left (Any% Speedrun). */
const rushLeft = (c: Combat): number => (c.has('hero', 'rush') ? Math.floor(c.fighter('hero').statuses.rush.t) : 0);

export const mageCards: CardDef[] = [
  // Starters
  {
    id: 'clippy',
    face: '{dmg:0}',
    cls: 'mage',
    type: 'attack',
    rarity: 'common',
    starterOnly: true,
    cost: 1,
    vals: [3],
    upVals: [5],
    art: 'clippy',
    play: (c, v) => void c.hit(v[0]),
  },
  {
    id: 'fireDoor',
    face: '{block:0}',
    cls: 'mage',
    type: 'defense',
    rarity: 'common',
    starterOnly: true,
    cost: 2,
    vals: [8],
    upVals: [11],
    art: 'fireDoor',
    play: (c, v) => c.gainBlock('hero', v[0]),
  },
  {
    id: 'coldCall',
    face: '{dmg:0}|{chill:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'common',
    cost: 2,
    vals: [4, 5],
    upVals: [6, 10],
    art: 'coldCall',
    play: (c, v) => {
      c.hit(v[0], { kind: 'ice' });
      c.applyStatus('enemy', 'chill', 1, v[1]);
    },
  },

  // Commons
  {
    id: 'flambe',
    face: '{dmg:0}|{burn:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'common',
    cost: 4,
    vals: [14, 3],
    upVals: [18, 4],
    art: 'flambe',
    play: (c, v) => {
      c.hit(v[0], { kind: 'fire' });
      c.applyStatus('enemy', 'burn', v[1]);
    },
  },
  {
    id: 'coldShoulder',
    face: '{dmg:0}|{?snow}{dmg:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'common',
    cost: 3,
    vals: [7, 16],
    upVals: [9, 20],
    art: 'iceLance',
    play: (c, v) => void c.hit(c.has('enemy', 'chill') ? v[1] : v[0], { kind: 'ice' }),
  },
  {
    id: 'caffeineJolt',
    face: '{mana:0}',
    cls: 'mage',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    vals: [2],
    upVals: [3],
    art: 'coffeePot',
    play: (c, v) => c.gainMana(v[0]),
  },
  {
    id: 'staticShock',
    face: '{dmg:0}×{1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'common',
    cost: 0,
    vals: [1, 2],
    upVals: [2, 3],
    art: 'plug',
    play: (c, v) => void c.hit(v[0], { kind: 'arcane' }),
  },
  {
    id: 'digitalDetox',
    face: '{block:0}|{chill:1}',
    cls: 'mage',
    type: 'defense',
    rarity: 'common',
    cost: 3,
    vals: [10, 7],
    upVals: [14, 12],
    art: 'digitalDetox',
    play: (c, v) => {
      c.gainBlock('hero', v[0]);
      c.applyStatus('enemy', 'chill', 1, v[1]);
    },
  },
  {
    id: 'burnout',
    face: '{burn:0}',
    cls: 'mage',
    type: 'attack',
    rarity: 'common',
    cost: 2,
    vals: [2],
    upVals: [4],
    art: 'match',
    play: (c, v) => c.applyStatus('enemy', 'burn', v[0]),
  },

  // Rares
  {
    id: 'replyAll',
    face: '{dmg:0}×{1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'rare',
    cost: 4,
    vals: [4, 4],
    upVals: [5, 5],
    art: 'missiles',
    play: (c, v) => void c.hit(v[0], { hits: v[1] }),
  },
  {
    id: 'lookBusy',
    face: '{dodge:0}',
    cls: 'mage',
    type: 'defense',
    rarity: 'epic',
    cost: 2,
    upCost: 1,
    vals: [2],
    upVals: [3],
    keywords: ['exhaust'],
    art: 'papers',
    play: (c, v) => c.applyStatus('hero', 'dodge', 1, v[0]),
  },
  {
    id: 'meltdown',
    face: '{dmg}={burn}×{0}|{burn}=0',
    cls: 'mage',
    type: 'attack',
    rarity: 'rare',
    cost: 3,
    upCost: 2,
    vals: [3],
    upVals: [4],
    art: 'meltdown',
    play: (c, v) => {
      const burn = c.stacks('enemy', 'burn');
      c.removeStatus('enemy', 'burn');
      c.hit(burn * v[0], { kind: 'fire' });
    },
  },

  // Epics
  {
    id: 'metamorphosis',
    face: '{stun:0}',
    cls: 'mage',
    type: 'skill',
    rarity: 'legendary',
    cost: 4,
    vals: [7],
    upVals: [9],
    keywords: ['pending'],
    art: 'beetle',
    play: (c, v) => c.applyStatus('enemy', 'stun', 1, v[0]),
  },
  {
    id: 'officeAC',
    face: '{dmg:0}|{chill:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'epic',
    cost: 4,
    vals: [16, 12],
    upVals: [22, 16],
    art: 'blizzard',
    play: (c, v) => {
      c.hit(v[0], { kind: 'ice' });
      c.applyStatus('enemy', 'chill', 1, v[1]);
    },
  },

  // Archetype synergy: Multitasking and Chill
  {
    id: 'spaghettiCode',
    face: '{dmg:0}×{1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    vals: [0, 3],
    upVals: [2, 3],
    art: 'spaghetti',
    // Every hit gets the Multitasking bonus.
    play: (c, v) => void c.hit(v[0], { hits: v[1] }),
  },
  {
    id: 'echoChamber',
    face: '{dmg:0}×{1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    vals: [2, 2],
    upVals: [3, 2],
    art: 'echo',
    play: (c, v) => void c.hit(v[0], { hits: v[1] }),
  },
  {
    id: 'blueScreen',
    face: '{dmg:0}|{?snow}{stun:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'rare',
    cost: 3,
    vals: [8, 7],
    upVals: [11, 10],
    art: 'blueScreen',
    play: (c, v) => {
      const chilled = c.has('enemy', 'chill');
      c.hit(v[0], { kind: 'ice' });
      if (chilled) c.applyStatus('enemy', 'stun', 1, v[1]);
    },
  },

  // Legendary
  {
    id: 'blastFurnace',
    face: '{dmg:0}',
    cls: 'mage',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    upCost: 4,
    vals: [30],
    keywords: ['pending'],
    art: 'blastFurnace',
    play: (c, v) => void c.hit(v[0], { kind: 'fire' }),
  },

  // Workplace additions
  {
    id: 'thermostatWar',
    face: '{burn:0}|{chill:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'common',
    cost: 2,
    vals: [2, 6],
    upVals: [4, 12],
    art: 'thermostat',
    play: (c, v) => {
      c.applyStatus('enemy', 'burn', v[0]);
      c.applyStatus('enemy', 'chill', 1, v[1]);
    },
  },
  {
    id: 'sprintPlanning',
    face: '{rush:0}|{mana:1}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    vals: [4, 2],
    upVals: [7, 4],
    art: 'kanban',
    play: (c, v) => {
      c.rushBelt(v[0]);
      c.gainMana(v[1]);
    },
  },
  {
    id: 'firewall',
    face: '{block:0}|{burn:1}',
    cls: 'mage',
    type: 'defense',
    rarity: 'epic',
    cost: 3,
    vals: [12, 4],
    upVals: [16, 6],
    art: 'fireWall',
    play: (c, v) => {
      c.gainBlock('hero', v[0]);
      c.applyStatus('enemy', 'burn', v[1]);
    },
  },

  // Sleeve card: every attack played while it waits there is cached into it
  {
    id: 'clearCache',
    face: '{dmg:0}|{?sleeve}{grow:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    vals: [4, 1],
    upVals: [7, 2],
    art: 'floppy',
    inSleeve: {
      onCardPlayed: (_c, v, card, played) => {
        if (played.type === 'attack') card.bonus += v[1];
      },
    },
    play: (c, v, card) => {
      c.hit(v[0]);
      card.bonus = 0;
    },
  },
  // Pop culture: IT support
  // Filling the class out: a cheap ward, and a Burn + Chill payoff
  {
    id: 'nigerianPrince',
    face: '{block:0}',
    cls: 'mage',
    type: 'defense',
    rarity: 'common',
    cost: 1,
    vals: [5],
    upVals: [8],
    art: 'nigerianPrince',
    play: (c, v) => c.gainBlock('hero', v[0]),
  },
  {
    id: 'thermalShock',
    face: '{dmg:0}|{?snow+burn}{dmg:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    vals: [8, 26],
    upVals: [11, 34],
    art: 'thermalShock',
    play: (c, v) => {
      const shock = c.has('enemy', 'chill') && c.has('enemy', 'burn');
      c.hit(shock ? v[1] : v[0]);
      // The glass cracks: the Chill is spent.
      if (shock) c.removeStatus('enemy', 'chill');
    },
  },
  // Multitasking and mana
  {
    id: 'flowState',
    face: '{multi:0}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    vals: [8],
    upVals: [12],
    art: 'flowState',
    play: (c, v) => c.applyStatus('hero', 'flowState', 1, v[0]),
  },
  {
    id: 'hustleCulture',
    face: '{hp:0}|{multi:1}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    vals: [5, 5],
    upVals: [3, 5],
    art: 'hustleCulture',
    play: (c, v) => {
      c.loseHp(v[0]);
      c.applyStatus('hero', 'hustle', 1, v[1]);
    },
  },
  {
    id: 'wellnessSeminar',
    face: '{regen:0}×{multi}',
    cls: 'mage',
    type: 'skill',
    rarity: 'legendary',
    cost: 2,
    vals: [2],
    upVals: [3],
    keywords: ['exhaust'],
    art: 'wellnessSeminar',
    play: (c, v) => c.applyStatus('hero', 'regen', v[0] * c.stacks('hero', 'multitasking')),
  },
  {
    id: 'allNighter',
    face: '{manaRegen:0}|{dark:1}',
    cls: 'mage',
    type: 'skill',
    rarity: 'epic',
    cost: 0,
    vals: [5, 5],
    upVals: [8, 5],
    art: 'allNighter',
    play: (c, v) => {
      c.applyStatus('hero', 'brownNosing', 1, v[0]);
      c.applyStatus('hero', 'blackout', 1, v[1]);
    },
  },
  {
    id: 'walkInFreezer',
    face: '{chill:0}×X',
    cls: 'mage',
    type: 'attack',
    rarity: 'rare',
    cost: -1,
    vals: [5],
    upVals: [7],
    art: 'walkInFreezer',
    // X cost: the engine appends the mana spent as the last value.
    play: (c, v) => c.applyStatus('enemy', 'chill', 1, v[0] * v[v.length - 1]),
  },
  {
    id: 'parkour',
    face: '{dodge:0}|{rush:1}',
    cls: 'mage',
    type: 'defense',
    rarity: 'legendary',
    cost: 2,
    vals: [1, 3],
    upVals: [3, 6],
    keywords: ['exhaust'],
    art: 'runner',
    // Over the desks and out of reach, but the belt keeps up with you.
    play: (c, v) => {
      c.applyStatus('hero', 'dodge', 1, v[0]);
      c.rushBelt(v[1]);
    },
  },
  // Filling the common and defence slots: a mana and belt boost, Block from Multitasking, Block from the sleeve
  {
    id: 'quickReboot',
    face: '{mana:0}|{rush:1}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    vals: [2, 2],
    upVals: [3, 3],
    art: 'quickReboot',
    play: (c, v) => {
      c.gainMana(v[0]);
      c.rushBelt(v[1]);
    },
  },
  {
    id: 'twoFactorAuth',
    face: '{block}={multi}×{0}',
    cls: 'mage',
    type: 'defense',
    rarity: 'rare',
    cost: 1,
    vals: [3],
    upVals: [4],
    art: 'twoFactorAuth',
    play: (c, v) => c.gainBlock('hero', c.stacks('hero', 'multitasking') * v[0]),
  },
  // Rush with Block, Burn with Poison, Multitasking turned into Burn and mana
  {
    id: 'fastTrack',
    face: '{block:0}|{rush:1}',
    cls: 'mage',
    type: 'defense',
    rarity: 'rare',
    cost: 2,
    vals: [8, 4],
    upVals: [11, 6],
    art: 'fastTrack',
    play: (c, v) => {
      c.gainBlock('hero', v[0]);
      c.rushBelt(v[1]);
    },
  },
  {
    id: 'smokeBreak',
    face: '{burn:0}|{poison:1}',
    cls: 'mage',
    type: 'attack',
    rarity: 'rare',
    cost: 3,
    vals: [3, 3],
    upVals: [4, 4],
    art: 'smokeBreak',
    play: (c, v) => {
      c.applyStatus('enemy', 'burn', v[0]);
      c.applyStatus('enemy', 'poison', v[1]);
    },
  },
  {
    id: 'overclocked',
    face: '{burn:0}×{multi}',
    cls: 'mage',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    vals: [2],
    upVals: [3],
    art: 'overclocked',
    play: (c, v) => {
      const charges = c.stacks('hero', 'multitasking');
      c.removeStatus('hero', 'multitasking');
      if (charges > 0) c.applyStatus('enemy', 'burn', v[0] * charges);
    },
  },
  {
    id: 'pettyCash',
    face: '{dmg:0}|{mana:1}×{multi}',
    cls: 'mage',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    vals: [4, 1],
    upVals: [6, 1],
    art: 'pettyCash',
    play: (c, v) => {
      c.hit(v[0]);
      c.gainMana(v[1] * c.stacks('hero', 'multitasking'));
    },
  },
  // Poison into Burn, Rush with a payoff, Dodge with teeth, a tap-spam charger
  {
    id: 'spontaneousCombustion',
    face: '{poison}|{burn}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    vals: [3],
    upVals: [2],
    art: 'spontaneousCombustion',
    play: (c, v) => {
      const poison = c.fighter('enemy').statuses.poison;
      if (!poison) return;
      c.removeStatus('enemy', 'poison');
      c.applyStatus('enemy', 'burn', Math.ceil(poison.v / v[0]));
    },
  },
  {
    id: 'speedrun',
    face: '{dmg:0}|+{1}/{rush}',
    cls: 'mage',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    vals: [4, 3],
    upVals: [5, 4],
    dmg: [0],
    art: 'speedrun',
    shown: (c, v) => [v[0] + v[1] * rushLeft(c), v[1]],
    play: (c, v) => void c.hit(v[0] + v[1] * rushLeft(c)),
  },
  {
    id: 'matador',
    face: '{dodge:0}|{?dodge}{stun:1}',
    cls: 'mage',
    type: 'defense',
    rarity: 'epic',
    cost: 2,
    vals: [2, 3],
    upVals: [3, 4],
    art: 'matador',
    play: (c, v) => {
      c.applyStatus('hero', 'dodge', 1, v[0]);
      c.applyStatus('hero', 'matador', v[1], v[0]);
    },
  },
  {
    id: 'ghostInTheMachine',
    face: '{dodge:0}|{*cards}{dodge:1}',
    cls: 'mage',
    type: 'defense',
    rarity: 'rare',
    cost: 2,
    vals: [3, 0.5],
    upVals: [4, 0.5],
    art: 'ghostInTheMachine',
    play: (c, v) => {
      c.applyStatus('hero', 'dodge', 1, v[0]);
      c.applyStatus('hero', 'ghostInTheMachine', v[1], v[0]);
    },
  },
  {
    id: 'fidgetSpinner',
    face: '{multi}×{0}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    vals: [1],
    upVals: [2],
    keywords: ['fleeting', 'echo'],
    art: 'fidgetSpinner',
    play: (c, v) => {
      for (let i = 0; i < v[0]; i++) c.chargeMultitasking();
    },
  },
  {
    id: 'cloudBackup',
    face: '{block:0}|{sleeve}{block:1}',
    cls: 'mage',
    type: 'defense',
    rarity: 'epic',
    cost: 3,
    vals: [12, 6],
    upVals: [16, 8],
    art: 'cloudBackup',
    play: (c, v) => c.gainBlock('hero', v[0] + v[1] * c.sleeve.filter((x) => x !== null).length),
  },

  // Sleeve payoff and a Chill to Burn bridge
  {
    id: 'crunchTime',
    face: '{sleeve}',
    cls: 'mage',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    vals: [],
    keywords: ['pending'],
    art: 'crunchTime',
    play: (c) => c.playSleeve(),
  },
  {
    id: 'hotDesking',
    face: '{chill}|{burn}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    vals: [2],
    upVals: [1],
    art: 'hotDesking',
    play: (c, v) => {
      const chill = c.fighter('enemy').statuses.chill;
      if (!chill) return;
      c.removeStatus('enemy', 'chill');
      c.applyStatus('enemy', 'burn', Math.ceil(chill.t / v[0]));
    },
  },

  // Powers
  {
    id: 'coldOpen',
    face: '{*dmg}{chill:0}',
    cls: 'mage',
    type: 'power',
    rarity: 'epic',
    cost: 2,
    vals: [1],
    upVals: [2],
    art: 'coldOpen',
    play: (c, v) => c.applyStatus('hero', 'coldOpen', v[0]),
  },
  {
    id: 'fortyTabs',
    face: '{*timer}{multi}',
    cls: 'mage',
    type: 'power',
    rarity: 'epic',
    cost: 3,
    upCost: 2,
    vals: [],
    art: 'fortyTabs',
    play: (c) => c.applyStatus('hero', 'fortyTabs', 1),
  },
  {
    id: 'freeCoffee',
    face: '{*timer}{mana:0}',
    cls: 'mage',
    type: 'power',
    rarity: 'legendary',
    cost: 4,
    upCost: 3,
    vals: [1],
    art: 'freeCoffee',
    play: (c, v) => c.applyStatus('hero', 'freeCoffee', v[0]),
  },
  {
    id: 'krustyKrab',
    face: '{copy}{addCard}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    upCost: 0,
    vals: [],
    art: 'krustyKrab',
    play: (c) => c.applyStatus('hero', 'krustyKrab', 1),
  },
  {
    id: 'tipJar',
    face: '{mana:0}|{?crystal}{grow}',
    cls: 'mage',
    type: 'skill',
    rarity: 'rare',
    cost: 0,
    vals: [1],
    upVals: [2],
    // Every second of wasted (overflowing) mana is another tip in the jar; the jar is emptied when played.
    onOverflow: 1,
    bonusIdx: 0,
    art: 'tipJar',
    play: (c, v, card) => {
      c.gainMana(v[0]);
      card.bonus = 0;
    },
  },

  // Generated during a fight (never offered as rewards).
  {
    id: 'turnItOn',
    face: '{mana:0}',
    cls: 'mage',
    type: 'skill',
    rarity: 'special',
    cost: 0,
    vals: [4],
    art: 'powerOn',
    play: (c, v) => c.gainMana(v[0]),
  },
];
