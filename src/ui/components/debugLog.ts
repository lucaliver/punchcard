import type { Combat } from '../../game/combat';
import type { RunState } from '../../game/run';
import { settings } from '../../game/settings';

/** Temporary debug tool: with the debug menus on, every fight of a run is noted down and the run's end saves the notes as a .txt file. */
let lines: string[] = [];

/** A new run starts a new file. */
export const resetFightLog = (): void => {
  lines = [];
};

/** One line per fight: who against whom, how long it took, the damage the hero took and what was left of its HP. */
export function logFight(run: RunState, combat: Combat): void {
  if (!settings.debugMenus) return;
  const { hero, enemy, time, damageTaken, result } = combat;
  lines.push(
    [
      `${run.hero} vs ${enemy.def.id} (${enemy.def.tier}, act ${enemy.def.act})`,
      result ?? 'unfinished',
      `${time.toFixed(1)}s`,
      `damage taken ${Math.round(damageTaken)}`,
      `final HP ${Math.max(0, Math.round(hero.hp))}/${Math.round(hero.maxHp)}`,
    ].join(' | '),
  );
}

/** Saves the run's notes as a text file (nothing if debugging is off or no fight was noted). */
export function saveFightLog(outcome: string): void {
  if (!settings.debugMenus || !lines.length) return;
  const text = `${[...lines, `run: ${outcome}`].join('\n')}\n`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = `punchcard-fights-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  resetFightLog();
}
