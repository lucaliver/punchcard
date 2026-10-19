import type { CardTally, Combat } from '../../game/combat';
import { fightFacts, fightSignals, learn, pressureScale } from '../../game/pressure';
import { currentNode, enemyScale, pressureLearns, runMods, type RunState } from '../../game/run';
import { settings } from '../../game/settings';

/** Temporary debug tool: with the debug menus on, every fight of a run is noted down and the run's end saves the notes as a text file, one JSON object per line. */
let lines: string[] = [];
/** What each card did over the whole run, by card id (the fights' `stats.cards` added up). */
let cards: Record<string, CardTally> = {};

/** A new run starts a new file. */
export const resetFightLog = (): void => {
  lines = [];
  cards = {};
};

const round = (x: number, digits = 0): number => {
  const k = 10 ** digits;
  return Math.round(x * k) / k;
};

/** The same numbers, rounded. */
const rounded = <K extends string>(o: Record<K, number>, digits = 0): Record<K, number> =>
  Object.fromEntries(Object.entries<number>(o).map(([k, v]) => [k, round(v, digits)])) as Record<K, number>;

/** The deck as `id` (or `id+` once upgraded) → copies. */
function deckOf(run: RunState): Record<string, number> {
  const deck: Record<string, number> = {};
  for (const c of run.deck) {
    const key = c.up ? `${c.id}+` : c.id;
    deck[key] = (deck[key] ?? 0) + 1;
  }
  return deck;
}

/**
 * One line per fight, written before `applyCombat` so the run still holds what the fight started with: where it was, who against whom, how it went (damage dealt and
 * taken, and by what), what the chores asked, the pressure it read and moved, and the build the hero brought.
 */
export function logFight(run: RunState, combat: Combat): void {
  if (!settings.debugMenus) return;
  const { hero, enemy, time, stats, result } = combat;
  const node = currentNode(run);
  const win = result === 'win';
  const facts = fightFacts(combat, run.maxHp);
  const learned = win && pressureLearns(run);
  for (const [id, c] of Object.entries(stats.cards)) {
    const sum = cards[id] ?? { plays: 0, dmg: 0, block: 0, poison: 0 };
    cards[id] = sum;
    sum.plays += c.plays;
    sum.dmg += round(c.dmg);
    sum.block += round(c.block);
    sum.poison += round(c.poison);
  }
  lines.push(
    JSON.stringify({
      fight: lines.length + 1,
      hero: run.hero,
      enemy: enemy.def.id,
      tier: enemy.def.tier,
      act: enemy.def.act,
      floor: node.floor,
      room: node.type,
      result: result ?? 'unfinished',
      seconds: round(time, 1),
      hp: { start: round(run.hp), end: Math.max(0, round(hero.hp)), max: round(run.maxHp) },
      enemyHp: round(enemy.maxHp),
      dealt: round(stats.damageDealt),
      enemyBlocked: round(stats.enemyBlocked),
      dps: round(facts.dealt / Math.max(time, 1), 2),
      taken: round(stats.damageTaken),
      takenBy: rounded(stats.takenBy),
      hits: stats.hitsTaken,
      biggestHit: round(stats.biggestHit),
      lastHurtBy: stats.lastHurtBy,
      heroBlocked: round(stats.heroBlocked),
      blockGained: round(stats.blockGained),
      healed: round(stats.healed),
      /** What the pressure reads as the HP lost: the damage taken minus the healing. */
      netLoss: round(facts.lost),
      cardsPlayed: combat.cardsPlayed,
      cardsLost: stats.cardsLost,
      abilities: stats.abilities,
      begged: combat.begged,
      enemyStrength: combat.stacks('enemy', 'strength'),
      chores: stats.chores.map((c) => ({ ...c, fined: round(c.fined, 1) })),
      hpTrail: stats.hpTrail,
      pressure: {
        before: rounded(run.pressure, 2),
        enemyScale: rounded(enemyScale(node, runMods(run), run.pressure), 2),
        pressureScale: rounded(pressureScale(run.pressure, runMods(run).hard), 2),
        ...(learned ? { signals: rounded(fightSignals(facts), 2), after: rounded(learn(run.pressure, facts), 2) } : {}),
      },
      build: { deck: deckOf(run), relics: run.relics, rank: run.level, money: run.money, skips: run.skips, crystals: run.crystals },
    }),
  );
}

/** The run's notes: a line per fight, then the run's outcome and card totals. */
export const fightLogText = (outcome: string): string => `${[...lines, JSON.stringify({ run: outcome, cards })].join('\n')}\n`;

/** Saves the run's notes as a text file (nothing if debugging is off or no fight was noted). */
export function saveFightLog(outcome: string): void {
  if (!settings.debugMenus || !lines.length) return;
  const text = fightLogText(outcome);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = `punchcard-fights-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  resetFightLog();
}
