import { describe, expect, it } from 'vitest';
import { ACT_DEFS, MAIN_ACTS } from '../../src/data/acts';
import { CARDS } from '../../src/data/cards';
import { HEROES } from '../../src/data/heroes';
import { NO_MODS } from '../../src/data/modifiers';
import { rankMax, rankMods, rankSteps } from '../../src/data/rank';
import { Combat, type CombatSetup } from '../../src/game/combat';
import { markRankSeen, promoteRank, rankPick, rankPromotion, rankTop, setRankPick } from '../../src/game/meta';
import { combatSetup, currentNode, enemyScale, finishRun, loadRun, newRun, rewardChoices, runMods, skipPay } from '../../src/game/run';
import { run, setup } from './helpers';

describe('the career ladder', () => {
  const warrior = (level: number) => newRun('warrior', 11, [], [], [], MAIN_ACTS, level);
  const rarityOf = (r: ReturnType<typeof warrior>, extra: number) =>
    r.deck.slice(HEROES.warrior.startDeck.length, HEROES.warrior.startDeck.length + extra).map((c) => CARDS[c.id].rarity);

  it('rank 0 is the plain game, and a hero with no ladder stays there', () => {
    expect(rankMods('warrior', 0)).toBe(NO_MODS);
    expect(runMods(warrior(0))).toBe(NO_MODS);
    expect(warrior(0).deck.map((c) => c.id)).toEqual(newRun('warrior', 11).deck.map((c) => c.id));
    expect(newRun('mage', 11, [], [], [], MAIN_ACTS, 5).level).toBe(0);
    expect(rankMax('mage')).toBe(0);
    expect(rankMax('warrior')).toBe(10);
    expect(warrior(99).level).toBe(10);
  });

  it('every rung hands over its gift as the run begins, and they add up', () => {
    const start = HEROES.warrior.startDeck.length;
    expect(warrior(1).maxHp).toBe(HEROES.warrior.hp + 10);
    expect(warrior(1).hp).toBe(warrior(1).maxHp);
    expect(warrior(2).deck).toHaveLength(start);
    expect(warrior(3).deck).toHaveLength(start + 1);
    expect(rarityOf(warrior(3), 1)).toEqual(['rare']);
    for (const id of ['skillIssue', 'heavyLifting', 'caffeineJolt']) expect(warrior(3).deck.find((c) => c.id === id)?.up, id).toBeFalsy();
    for (const id of ['skillIssue', 'heavyLifting', 'caffeineJolt']) expect(warrior(4).deck.find((c) => c.id === id)?.up, id).toBe(true);
    expect(warrior(4).relics).toHaveLength(0);
    expect(warrior(5).relics).toHaveLength(1);
    expect(warrior(5).crystals).toBe(0);
    expect(warrior(6).crystals).toBe(1);
    expect(warrior(9).deck).toHaveLength(start + 2);
    expect(rarityOf(warrior(9), 2)).toEqual(['rare', 'epic']);
    const top = warrior(10);
    expect(top.deck).toHaveLength(start + 4);
    expect(rarityOf(top, 4)).toEqual(['rare', 'epic', 'legendary', 'legendary']);
    const legends = top.deck.slice(start + 2).map((c) => c.id);
    expect(new Set(legends).size).toBe(2);
    // The gifts are dealt from the run's seed, so the same run is the same every time; the uids stay unique.
    expect(warrior(10).deck.map((c) => c.id)).toEqual(top.deck.map((c) => c.id));
    expect(new Set(top.deck.map((c) => c.uid)).size).toBe(top.deck.length);
  });

  it('the duties and perks that play out in the run are summed from the rungs up to its rank', () => {
    expect(runMods(warrior(1)).restHeal).toBeCloseTo(0.85);
    expect(runMods(warrior(1)).hard).toBe(true);
    expect(runMods(warrior(1)).abilityCost).toBeNull();
    expect(runMods(warrior(2)).abilityCost).toBe(3);
    expect(runMods(warrior(2)).eliteHp).toBeCloseTo(1.1);
    expect(runMods(warrior(3)).enemyDmg).toBeCloseTo(1.1);
    expect(runMods(warrior(4)).beltMul).toBeCloseTo(1.1);
    expect(skipPay(warrior(4))).toBeGreaterThan(0);
    expect(skipPay(warrior(5))).toBe(0);
    expect(runMods(warrior(6)).manaSlow).toBeCloseTo(1.15);
    expect(rewardChoices(warrior(6), 'fight')).toBe(3);
    expect(rewardChoices(warrior(7), 'fight')).toBe(4);
    expect(runMods(warrior(7)).blockFade).toBeCloseTo(1.25);
    expect(runMods(warrior(7)).restBoth).toBe(false);
    expect(runMods(warrior(8)).restBoth).toBe(true);
    expect(runMods(warrior(8)).enemyTime).toBeCloseTo(1.1);
    expect(runMods(warrior(9)).enemyHp).toBeCloseTo(1.1);
    expect(runMods(warrior(9)).noBeg).toBe(false);
    expect(runMods(warrior(10)).noBeg).toBe(true);
    // Memos and a rank pile up.
    const both = newRun('warrior', 11, [], ['quotas'], [], MAIN_ACTS, 9);
    expect(runMods(both).enemyHp).toBeCloseTo(1.25 * 1.1);
  });

  it('the fight is set up with them: the ability price, the begging, the pace of the enemy and of the Block', () => {
    expect(setup({ abilityCost: 3 }).abilityCost()).toBe(3);
    expect(setup().abilityCost()).toBe(HEROES.warrior.ability.cost);
    expect(new Combat(combatSetup(warrior(2))).abilityCost()).toBe(3);
    expect(combatSetup(warrior(9)).canBeg).toBe(true);
    expect(combatSetup(warrior(10)).canBeg).toBe(false);
    expect(setup({ enemyTime: 1.1 }).enemyTimeRate()).toBeCloseTo(1.1);
    expect(setup().enemyTimeRate()).toBe(1);
    const fade = (over: Partial<CombatSetup>): number => {
      const c = setup(over);
      c.hero.block = 10;
      return c.blockRate(c.hero);
    };
    expect(fade({ blockFade: 1.25 })).toBeCloseTo(fade({}) * 1.25);
    const mana = (over: Partial<CombatSetup>): number => {
      const c = setup({ beltRows: 1, ...over });
      run(c, 6);
      return c.hero.mana + c.hero.manaTimer / c.hero.regen;
    };
    expect(mana({ manaSlow: 2 })).toBeCloseTo(mana({}) / 2, 0);
  });

  it('inspections and bosses are tougher, and a normal job is not', () => {
    const r = warrior(2);
    const job = currentNode(r);
    const inspection = { ...job, type: 'elite' as const };
    const boss = { ...job, type: 'boss' as const };
    const mods = runMods(r);
    expect(enemyScale(job, mods).hp).toBeCloseTo(enemyScale(job).hp);
    expect(enemyScale(inspection, mods).hp).toBeCloseTo(enemyScale(inspection).hp * 1.1);
    expect(enemyScale(boss, mods).hp).toBeCloseTo(enemyScale(boss).hp * 1.1);
  });

  it('the rank is saved with the run and a bad one is put right on load', () => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      configurable: true,
    });
    const good = warrior(6);
    const loadWith = (patch: Record<string, unknown>, from = good) => {
      store.set('cardstone+:run', JSON.stringify({ ...from, ...patch }));
      return loadRun();
    };
    expect(loadWith({})?.level).toBe(6);
    expect(loadWith({ level: 99 })?.level).toBe(10);
    expect(loadWith({ level: -3 })?.level).toBe(0);
    expect(loadWith({ level: 2.5 })?.level).toBe(0);
    expect(loadWith({ level: 'high' })?.level).toBe(0);
    expect(loadWith({ level: undefined })?.level).toBe(0);
    expect(loadWith({ level: 4 }, newRun('mage', 3))?.level).toBe(0);
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('a full day won at the top rank promotes the hero; a lower rank, a loss or no ladder does not', () => {
    const top = rankTop('warrior');
    const atBoss = (level: number, acts = MAIN_ACTS) => {
      const r = newRun('warrior', 5, [], [], [], acts, level);
      r.current = r.nodes.filter((n) => n.act === acts && n.type === 'boss').at(-1)!.id;
      return r;
    };
    // Playing a rank below the top one is practice.
    if (top > 0) expect(finishRun(atBoss(top - 1), true).promoted).toBe(0);
    expect(rankTop('warrior')).toBe(top);
    // A loss on the way to the boss isn't a full day.
    expect(finishRun(atBoss(top), false).promoted).toBe(0);
    expect(rankTop('warrior')).toBe(top);
    // A win is, and it picks the new rank for the next shift.
    expect(finishRun(atBoss(top), true).promoted).toBe(top + 1);
    expect(rankTop('warrior')).toBe(top + 1);
    expect(rankPick('warrior')).toBe(top + 1);
    // The weekend that goes wrong still counts: the day was won before it.
    const weekend = newRun('warrior', 5, [], [], [], ACT_DEFS.length, top + 1);
    weekend.current = weekend.nodes.find((n) => n.act > MAIN_ACTS)!.id;
    expect(finishRun(weekend, false).promoted).toBe(top + 2);
  });

  it('a promotion is shown once, a rank is picked up to the top one and not past the ladder', () => {
    const top = rankTop('warrior');
    expect(rankPromotion('warrior')?.to).toBe(top);
    markRankSeen('warrior');
    expect(rankPromotion('warrior')).toBeNull();
    setRankPick('warrior', 1);
    expect(rankPick('warrior')).toBe(1);
    setRankPick('warrior', 99);
    expect(rankPick('warrior')).toBe(top);
    setRankPick('warrior', -4);
    expect(rankPick('warrior')).toBe(0);
    for (let i = 0; i < 12; i++) promoteRank('warrior', rankTop('warrior'));
    expect(rankTop('warrior')).toBe(rankMax('warrior'));
    expect(promoteRank('warrior', rankMax('warrior'))).toBe(0);
    expect(promoteRank('mage', 0)).toBe(0);
    expect(rankTop('mage')).toBe(0);
  });

  it('every rung has a perk and a duty, and the same effect never comes twice', () => {
    const steps = rankSteps('warrior', 10);
    expect(steps).toHaveLength(10);
    const kinds = steps.flatMap((s) => [s.bonus.kind, s.duty.kind]);
    expect(new Set(kinds).size).toBe(kinds.length - steps.filter((s) => s.bonus.kind === 'cards').length + 1);
  });
});
