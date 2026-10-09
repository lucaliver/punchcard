import { Combat } from '../src/game/combat';
import { CARDS } from '../src/data/cards';
import { COFFEE_SERVICE } from '../src/data/coffee';
import {
  addPerk,
  advance,
  applyCombat,
  canPerk,
  canVend,
  canShred,
  canUpgrade,
  combatSetup,
  currentNode,
  gainRelic,
  rollRelics,
  newRun,
  rest,
  rollRewards,
  shredCard,
  swapCard,
  upgradeCard,
  vend,
  type RunState,
} from '../src/game/run';
import type { CombatCard, HeroId } from '../src/game/types';

export interface BotOpts {
  /** Seconds between bot decisions (human reaction time). */
  reaction: number;
  /** Probability per decision of doing nothing (distraction / misreads). */
  sloppiness: number;
}

const DT = 1 / 30;

/** A heuristic player: blocks before telegraphed hits, otherwise spends mana on damage. */
const CRYSTALS = ['coffee', 'italianEspresso'];
const BLOCKISH = [
  'bobTheBuilder',
  'fireDoor',
  'karlMarx',
  'pingPongTable',
  'wallStreet',
  'digitalDetox',
  'employeeOfTheMonth',
  'youShallNotPass',
  'secondBreakfast',
  'lookBusy',
  'hideTheEvidence',
  'plausibleDeniability',
  'hushMoney',
];
const DEBUFFS = ['karoshi', 'chainSmoking', 'waterCooler', 'blackFriday', 'walkout'];

/** Taps a second the bot gives Conveyor Sis's mana button (about what a thumb does). */
const TAPS_PER_SECOND = 4;

/** The next right move of the Boss's coffee. */
function botCoffee(c: Combat): void {
  const task = c.task;
  if (!task) return;
  if (task.phase === 'coins') {
    const coin = task.coins.find((x) => !x.used && task.fits(x));
    if (coin) c.coffee({ kind: 'coin', id: coin.id });
  } else if (task.phase === 'code') c.coffee({ kind: 'key', key: task.code[task.keysDone] });
  else if (task.phase === 'place') c.coffee({ kind: 'item', item: COFFEE_SERVICE.find((x) => !task.placed.includes(x))! });
  else if (task.phase === 'sugar') c.coffee(task.dial < task.sugar ? { kind: 'sugar', by: 1 } : { kind: 'start' });
}

export function botDecide(c: Combat, rnd: () => number, opts: BotOpts): void {
  for (let i = 0; c.manaTapOn && i < opts.reaction * TAPS_PER_SECOND; i++) c.tapMana();
  if (rnd() < opts.sloppiness) return;
  if (c.abilityReady()) c.useAbility();
  // The shell game: the bot keeps its eye on the right card and picks it as soon as the cards stop.
  if (c.shells) {
    if (c.shells.phase === 'pick') c.pickShell(c.shells.prizePlace);
    return;
  }
  // The coffee chore: one right move per decision (a person takes a moment for each), cards are out of reach meanwhile.
  if (c.task) {
    botCoffee(c);
    return;
  }
  // The IT guy's window: it postpones it, and plays in the seconds that leaves.
  if (c.popup) {
    c.postponeUpdate();
    return;
  }

  const cards: { card: CombatCard; pos: number }[] = [
    ...c.belt.map((b) => ({ card: b.card, pos: b.pos })),
    ...c.sleeve.filter((x): x is CombatCard => !!x).map((card) => ({ card, pos: -1 })),
  ];
  const e = c.enemy;
  const rate = c.enemyTimeRate();
  const timeToHit = rate > 0 ? (e.move.windup - e.timer) / rate : Infinity;
  const incoming = c.intentDamage(e.move) * (e.move.hits ?? 1);
  // A human taps a petrified card a few times in a row: break one hex per decision.
  const hexed = c.belt.find((b) => b.card.hex && b.card.hex.left > 0 && !c.isCovered(b.card.uid));
  if (hexed) {
    for (let i = 0; i < 5; i++) c.playCard(hexed.card.uid);
    return;
  }
  // The sushi buffet: eat a matching pair (two taps), whatever else is going on.
  const pieces = c.belt.filter((b) => CARDS[b.card.id].pair).sort((a, b) => b.pos - a.pos);
  const first = pieces.find((a) => pieces.some((b) => b !== a && b.card.id === a.card.id));
  if (first) {
    const mate = pieces.find((b) => b !== first && b.card.id === first.card.id)!;
    c.playCard(first.card.uid);
    c.playCard(mate.card.uid);
    return;
  }
  const affordable = cards.filter(
    ({ card, pos }) =>
      !card.hex &&
      !CARDS[card.id].pair &&
      c.isPlayable(card) &&
      !c.isPending(card) &&
      c.canAfford(card) &&
      !c.ruleBlock(card) &&
      (pos < 0 || !c.isCovered(card.uid)),
  );

  const score = ({ card, pos }: { card: CombatCard; pos: number }): number => {
    const def = CARDS[card.id];
    const v = c.cardVals(card);
    const cost = Math.max(1, c.cardCost(card));
    const urgency = pos > 0.75 ? 1.5 : 1;
    switch (def.type) {
      case 'curse':
        if (card.id === 'gatekeeping') return 30;
        return card.id === 'writeUp' && pos > 0.6 ? 50 : c.hero.mana >= c.hero.maxMana - 1 ? 2 : -1;
      case 'power':
        return 30;
      case 'defense':
      case 'skill': {
        if (card.id === 'firstAidKit') return c.hero.hp < c.hero.maxHp * 0.5 ? 40 : -1;
        if (CRYSTALS.includes(card.id)) return 40;
        const blockish = BLOCKISH.includes(card.id);
        if (blockish) {
          const need = incoming > c.hero.block && timeToHit < 1.6;
          return need ? 25 * urgency : c.hero.mana >= c.hero.maxMana ? 1.5 : -1;
        }
        return 6 * urgency;
      }
      default: {
        // Don't feed a Printer while it copies the damage it takes.
        if (c.enemy.move.absorb) return -1;
        if (DEBUFFS.includes(card.id)) return 9;
        if (card.id === 'toxicLeak') return c.stacks('enemy', 'poison') * 0.8;
        const dmg = def.dmg?.length ? c.previewHeroDamage(v[def.dmg[0]], def) * (card.id === 'replyAll' ? v[1] : 1) : 8;
        return (dmg / cost) * urgency;
      }
    }
  };

  const best = affordable
    .map((x) => ({ x, s: score(x) }))
    .filter((o) => o.s > 0)
    .sort((a, b) => b.s - a.s)[0];
  if (best) {
    c.playCard(best.x.card.uid);
    return;
  }
  // Stash a strong card that's about to leave and can't be afforded yet.
  const leaving = c.belt.find((b) => b.pos > 0.8 && c.cardCost(b.card) >= 2 && CARDS[b.card.id].type !== 'curse');
  if (leaving && c.sleeve.includes(null)) c.stash(leaving.card.uid);
}

export function simulateCombat(c: Combat, rnd: () => number, opts: BotOpts, maxTime = 300): void {
  let acc = 0;
  while (!c.result && c.time < maxTime) {
    c.tick(DT);
    acc += DT;
    if (acc >= opts.reaction) {
      acc = 0;
      botDecide(c, rnd, opts);
    }
  }
}

export interface RunOutcome {
  won: boolean;
  act: number;
  floor: number;
  /** The enemy that ended a lost run. */
  killer?: string;
  hp: number;
  combatTimes: number[];
}

export function simulateRun(hero: HeroId, seed: number, opts: BotOpts): RunOutcome {
  let s = seed;
  const rnd = (): number => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  const run: RunState = newRun(hero, seed);
  const combatTimes: number[] = [];
  for (;;) {
    const node = currentNode(run);
    if (node.type === 'promotion') {
      // Crystals first: they grow the mana the rest of the deck needs.
      const card = run.deck.find((c) => c.id === 'italianEspresso' || c.id === 'coffee');
      if (card && canPerk(card, 'fastTrack')) addPerk(run, card.uid, 'fastTrack');
      run.cleared = true;
    } else if (node.type === 'tailor') {
      gainRelic(run, 'cargoPants');
      run.cleared = true;
    } else if (node.type === 'lostFound') {
      const [pick] = rollRelics(run);
      if (pick) gainRelic(run, pick);
      run.cleared = true;
    } else if (node.type === 'vending') {
      if (canVend(run, 'rare') && run.hp > run.maxHp * 0.7) vend(run, 'rare');
      run.cleared = true;
    } else if (node.type === 'crossTraining') {
      // Off-class cards don't help the bot's plan: it walks past the seminar.
      run.cleared = true;
    } else if (node.type === 'copy') {
      // Thin the deck: shred a plain starter card (never a mana crystal).
      const weak = run.deck.find((c) => CARDS[c.id].starterOnly);
      if (weak && canShred(run)) shredCard(run, weak.uid);
      run.cleared = true;
    } else if (node.type === 'rest') {
      if (run.hp < run.maxHp * 0.65) rest(run);
      else {
        const up = run.deck.find((c) => canUpgrade(c) && !['defense', 'skill'].includes(CARDS[c.id].type)) ?? run.deck.find(canUpgrade);
        if (up) upgradeCard(run, up.uid);
        run.cleared = true;
      }
    } else {
      // The bot never begs: a defeat is a defeat, so win rates stay comparable.
      const c = new Combat({ ...combatSetup(run), canBeg: false });
      simulateCombat(c, rnd, opts);
      combatTimes.push(c.time);
      applyCombat(run, c);
      if (c.result === 'lose' || !c.result) return { won: false, act: node.act, floor: node.floor, killer: node.enemy, hp: 0, combatTimes };
      if (c.result === 'win' && node.type !== 'boss') {
        const picks = rollRewards(run, node.type === 'elite' ? 'elite' : 'fight');
        // Swap the best offer in for a plain starter card (never a mana crystal).
        const pick = picks.find((p) => p.def.rarity !== 'common') ?? picks[0];
        const out = run.deck.find((d) => CARDS[d.id].starterOnly);
        if (pick && out) swapCard(run, out.uid, pick.def.id, pick.up);
      }
    }
    if (!advance(run)) return { won: true, act: node.act, floor: node.floor, hp: run.hp, combatTimes };
  }
}
