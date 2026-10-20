import { it } from 'vitest';
import { CARDS } from '../src/data/cards';

/** Static numbers of every spirit (no bot): dps, hp, oil per second, and a rough power per oil spent. Prints a table; asserts nothing. */
it('spirit stats', () => {
  const k = { melee: 0.75, shot: 1, lob: 1.35, pierce: 1.6, pulse: 1.2 } as const;
  const rows: string[] = [];
  for (const c of Object.values(CARDS)) {
    if (c.kind !== 'spirit') continue;
    for (const up of [false, true]) {
      const sd = c.spirit?.(up);
      if (!sd) continue;
      const a = sd.atk;
      const cost = up && c.upCost !== undefined ? c.upCost : c.cost;
      const dps = a ? (a.dmg / a.every) * k[a.kind] * (a.cleave ? 1.3 : 1) : 0;
      const oil = sd.oil ? sd.oil.n / sd.oil.every : 0;
      const aura = sd.aura ? (sd.aura.rate ?? 0) * 6 + (sd.aura.dmg ?? 0) * 6 : 0;
      const power = dps + sd.hp * 0.14 + oil * 4.5 + aura + (sd.thorns ?? 0) * 0.6 + (sd.heal ? (sd.heal.hp / sd.heal.every) * 2 : 0);
      rows.push(
        `${c.id.padEnd(13)}${up ? '+' : ' '} ${c.rarity.padEnd(6)} c${cost} hp${String(sd.hp).padEnd(3)} dps${dps.toFixed(1).padStart(4)} oil${oil.toFixed(2)} power ${power.toFixed(1).padStart(5)} per oil ${(power / cost).toFixed(2)}`,
      );
    }
  }
  console.log(rows.join('\n'));
});
