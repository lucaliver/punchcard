import { describe, expect, it } from 'vitest';
import { Rng } from '../../src/core/rng';
import { CONFIG, relicGuarantee, rewardOdds, rewardUpgradeChance } from '../../src/data/config';
import { ENEMIES, enemiesFor } from '../../src/data/enemies';
import { HEROES } from '../../src/data/heroes';
import { CARD_LIST, CARDS, RARITY_ORDER, cardCostOf, cardKeywordsOf } from '../../src/data/cards';
import { RELICS } from '../../src/data/relics';
import { WHEEL } from '../../src/data/wheel';
import {
  cardHidden,
  collection,
  discover,
  hasStamp,
  isDiscovered,
  markRated,
  memosOpen,
  ratingDue,
  runHistory,
  stampAct,
  startingFirstRun,
  unlockAll,
} from '../../src/game/meta';
import { ACT_DEFS, MAIN_ACTS } from '../../src/data/acts';
import {
  applyCombat,
  applyWheel,
  canWheel,
  isFirstRun,
  canCopy,
  combatSetup,
  canGiftRelic,
  canRestructure,
  giftRelic,
  restructure,
  canVend,
  currentNode,
  enemyScale,
  restHeal,
  restsBoth,
  rewardChoices,
  rollRewards,
  spinWheel,
  swapCard,
  canShred,
  fightPay,
  gainRelic,
  loadRun,
  newRun,
  pressureLearns,
  photocopyCard,
  rollRelics,
  shredCard,
  skipPay,
  skipReward,
  rollCrossTraining,
  crossTrain,
  SPECIALS,
  vend,
  vendingCost,
} from '../../src/game/run';
import { Combat } from '../../src/game/combat';
import { calm, type FightFacts, fightFacts, fightSignals, learn, pressureScale } from '../../src/game/pressure';
import { settings } from '../../src/game/settings';
import { fightLogText, logFight, resetFightLog } from '../../src/ui/components/debugLog';
import { run, setup } from './helpers';

describe('the handbook bars at the end of a run', () => {
  it('start from how full the handbook was when the run started, and climb with what the run finds', () => {
    startingFirstRun();
    const before = collection();
    for (const k of ['cards', 'foes', 'relics'] as const) expect(before[k].from).toBe(before[k].n);
    const card = CARD_LIST.find((c) => !isDiscovered(c.id) && !cardHidden(c.id));
    expect(card).toBeDefined();
    if (card) discover([card.id]);
    const after = collection();
    expect(after.cards.n).toBe(before.cards.n + 1);
    expect(after.cards.from).toBe(before.cards.n);
    expect(after.cards.total).toBe(before.cards.total);
  });
});

describe('run pay and rewards', () => {
  it('pays a base by tier plus a bonus for every second under par', () => {
    expect(fightPay('normal', CONFIG.pay.par + 20)).toBe(CONFIG.pay.normal);
    expect(fightPay('normal', CONFIG.pay.par - 10)).toBe(CONFIG.pay.normal + 10 * CONFIG.pay.perSecond);
    expect(fightPay('boss', 0)).toBe(CONFIG.pay.boss + CONFIG.pay.par * CONFIG.pay.perSecond);
  });

  it('act 2 always opens on a rule-breaker, and its other fights are dealt as usual', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const nodes = newRun('warrior', seed).nodes.filter((n) => n.act === 2);
      expect(ENEMIES[nodes.find((n) => n.floor === 1)!.enemy!].ruleBreaker, `seed ${seed}`).toBe(true);
    }
  });

  it('an elite offers at least two Legendary cards and a boss only Legendary ones', () => {
    const run = newRun('warrior', 7);
    for (let i = 0; i < 20; i++) {
      expect(rollRewards(run, 'elite').filter((o) => o.def.rarity === 'legendary').length).toBeGreaterThanOrEqual(2);
      const boss = rollRewards(run, 'boss');
      expect(boss).toHaveLength(4);
      expect(boss.every((o) => o.def.rarity === 'legendary')).toBe(true);
      expect(new Set(boss.map((o) => o.def)).size).toBe(4);
    }
  });

  it('a fight reward guarantees a Rare in act 1, an Epic from act 2 and two Epics in act 3, sorted by rarity then cost', () => {
    const run = newRun('warrior', 7);
    const need: Record<number, [string[], number]> = {
      1: [['rare', 'epic', 'legendary'], 1],
      2: [['epic', 'legendary'], 1],
      3: [['epic', 'legendary'], 2],
    };
    for (const act of [1, 2, 3]) {
      run.current = run.nodes.find((n) => n.act === act)!.id;
      const [rarities, count] = need[act];
      for (let i = 0; i < 100; i++) {
        const offer = rollRewards(run, 'fight');
        expect(offer.filter((o) => rarities.includes(o.def.rarity)).length).toBeGreaterThanOrEqual(count);
        for (let j = 1; j < offer.length; j++) {
          const [a, b] = [offer[j - 1], offer[j]];
          const [ra, rb] = [RARITY_ORDER.indexOf(a.def.rarity), RARITY_ORDER.indexOf(b.def.rarity)];
          expect(ra < rb || (ra === rb && cardCostOf({ uid: 0, id: a.def.id, up: a.up }) <= cardCostOf({ uid: 0, id: b.def.id, up: b.up }))).toBe(
            true,
          );
        }
      }
    }
  });

  it('the Rolodex opens every class to the offers, each class as likely as the neutral cards', () => {
    const run = newRun('warrior', 7);
    run.current = run.nodes.find((n) => n.act === 1)!.id;
    const classes = (): Set<string> => new Set(Array.from({ length: 200 }, () => rollRewards(run, 'fight')).flatMap((o) => o.map((x) => x.def.cls)));
    expect(classes().has('mage')).toBe(false);
    run.relics.push('rolodex');
    const seen = classes();
    for (const cls of ['warrior', 'mage', 'necromancer', 'rogue', 'neutral']) expect(seen.has(cls), cls).toBe(true);
    expect(seen.has('curse')).toBe(false);
  });

  it('a Wellness Voucher makes the Break Room give both the nap and the training', () => {
    const r = newRun('warrior', 7);
    expect(restsBoth(r)).toBe(false);
    r.relics.push('wellnessVoucher');
    expect(restsBoth(r)).toBe(true);
  });

  it('an offered card comes upgraded by its rarity and the act, and a swap keeps it so', () => {
    const run = newRun('warrior', 7);
    for (const act of [1, 3]) {
      run.current = run.nodes.find((n) => n.act === act)!.id;
      const offers = Array.from({ length: 300 }, () => rollRewards(run, 'fight')).flat();
      for (const rarity of ['common', 'rare'] as const) {
        const of = offers.filter((o) => o.def.rarity === rarity);
        expect(of.length).toBeGreaterThan(100);
        expect(of.filter((o) => o.up).length / of.length).toBeCloseTo(rewardUpgradeChance(rarity, act), 1);
      }
    }
    const [first] = rollRewards(run, 'elite');
    swapCard(run, run.deck[0].uid, first.def.id, true);
    expect(run.deck[0]).toMatchObject({ id: first.def.id, up: true });
  });
});

describe('run maps', () => {
  const maps = Array.from({ length: 60 }, (_, seed) => newRun('warrior', seed + 2).nodes);

  it('deal several specials per act, all different, and a rest on every road into the boss', () => {
    for (const nodes of maps)
      for (let act = 1; act <= MAIN_ACTS; act++) {
        const specials = nodes.filter((n) => n.act === act && SPECIALS.includes(n.type)).map((n) => n.type);
        expect(specials.length).toBeGreaterThanOrEqual(3);
        expect(new Set(specials).size).toBe(specials.length);
        const boss = nodes.find((n) => n.act === act && n.type === 'boss')!;
        for (const n of nodes.filter((m) => m.next.includes(boss.id))) expect(n.type).toBe('rest');
      }
  });

  it('deal the Restructuring room at most once per run, and in some runs', () => {
    const count = (nodes: { type: string }[]): number => nodes.filter((n) => n.type === 'restructuring').length;
    for (const nodes of maps) expect(count(nodes)).toBeLessThanOrEqual(1);
    expect(maps.some((nodes) => count(nodes) === 1)).toBe(true);
  });

  it('open act 1 with two fights and then always a special room, on the shared road', () => {
    for (const nodes of maps) {
      const road = nodes.filter((n) => n.act === 1 && n.lane === 0.5 && n.type !== 'boss');
      expect(road.map((n) => n.floor)).toEqual([1, 2, 3]);
      expect(road.map((n) => n.type === 'fight')).toEqual([true, true, false]);
      expect(SPECIALS).toContain(road[2].type);
    }
  });

  it("keep away from the last run's enemies while others are left", () => {
    for (let seed = 2; seed < 32; seed++) {
      const before = newRun('warrior', seed).nodes;
      const avoid = [...new Set(before.flatMap((n) => (n.enemy ? [n.enemy] : [])))];
      const nodes = newRun('warrior', seed + 100, [], [], avoid).nodes;
      for (let act = 1; act <= MAIN_ACTS; act++)
        for (const tier of ['elite', 'boss'] as const) {
          const pool = enemiesFor(act, tier);
          const dealt = nodes.filter((n) => n.act === act && n.type === tier).map((n) => n.enemy!);
          if (pool.some((e) => !avoid.includes(e.id))) for (const id of dealt) expect(avoid).not.toContain(id);
        }
      // Normal fights: the enemies new to this run all show up before one of the last run's comes back.
      for (let act = 1; act <= MAIN_ACTS; act++) {
        const fresh = enemiesFor(act, 'normal').filter((e) => !avoid.includes(e.id)).length;
        const fights = nodes.filter((n) => n.act === act && n.type === 'fight').map((n) => n.enemy!);
        // (act 2 opens on a rule-breaker even if the last run met every one of them)
        const opener = act === 2 && !enemiesFor(2, 'normal').some((e) => e.ruleBreaker && !avoid.includes(e.id)) ? 1 : 0;
        for (const id of fights.slice(opener, fresh)) expect(avoid).not.toContain(id);
      }
    }
  });

  it('never offer two choices of the same kind of room', () => {
    for (const nodes of [...maps, newRun('warrior', 1, [1, 2, 3]).nodes])
      for (const n of nodes.filter((m) => m.next.length > 1)) {
        const types = n.next.map((id) => nodes[id].type);
        expect(new Set(types).size).toBe(types.length);
      }
  });

  it('never strand a player: every walk reaches the boss, and every room can be reached (even with a road cut)', () => {
    let cuts = 0;
    for (const nodes of maps) {
      const seen = new Set<number>();
      const walk = (id: number, path: number[]): void => {
        seen.add(id);
        const options = nodes[id].next.filter((n) => !path.includes(n));
        if (!options.length) expect(nodes[id].type).toBe('boss');
        for (const n of options) walk(n, [...path, n]);
      };
      walk(0, [0]);
      expect(seen.size).toBe(nodes.length);
      for (const n of nodes) if (n.lane !== 0.5 && !n.next.some((id) => nodes[id].floor > n.floor && [n.lane, 0.5].includes(nodes[id].lane))) cuts++;
    }
    expect(cuts).toBeGreaterThan(0);
  });
});

describe('the weekend (the bonus act)', () => {
  it('a run has the main acts, and the bonus ones too when asked; the last boss is the one with nothing after it', () => {
    expect(Math.max(...newRun('warrior', 7).nodes.map((n) => n.act))).toBe(MAIN_ACTS);
    const full = newRun('warrior', 7, [], [], [], ACT_DEFS.length);
    expect(Math.max(...full.nodes.map((n) => n.act))).toBe(ACT_DEFS.length);
    const bosses = full.nodes.filter((n) => n.type === 'boss');
    expect(bosses.map((n) => n.act)).toEqual(Array.from({ length: ACT_DEFS.length }, (_, i) => i + 1));
    expect(bosses.filter((n) => !n.next.length).map((n) => n.act)).toEqual([ACT_DEFS.length]);
  });

  it('its fights are of the weekend, and its elites and boss come from the shift before until it has its own', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const nodes = newRun('mage', seed, [], [], [], ACT_DEFS.length).nodes.filter((n) => n.act === ACT_DEFS.length);
      for (const n of nodes.filter((x) => x.type === 'fight')) expect(ENEMIES[n.enemy!].act).toBe(ACT_DEFS.length);
      for (const n of nodes.filter((x) => x.type === 'elite' || x.type === 'boss')) expect(ENEMIES[n.enemy!].tier).toBe(n.type);
    }
  });

  it('a saved run keeps its weekend', () => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      configurable: true,
    });
    const full = newRun('warrior', 7, [], [], [], ACT_DEFS.length);
    store.set('cardstone+:run', JSON.stringify(full));
    expect(loadRun()?.nodes).toHaveLength(full.nodes.length);
    Reflect.deleteProperty(globalThis, 'localStorage');
  });
});

describe('the very first run', () => {
  it('goes on through every act, the later ones dealt like any run', () => {
    const run = newRun('warrior', 1, [1]);
    expect(new Set(run.nodes.map((n) => n.act)).size).toBe(MAIN_ACTS);
    expect(run.nodes.some((n) => n.act > 1 && SPECIALS.includes(n.type))).toBe(true);
  });

  it('has one enemy per floor, whichever lane it takes, and the rests are split between the lanes', () => {
    const run = newRun('warrior', 1, [1]);
    const fights = run.nodes.filter((n) => n.act === 1 && n.type === 'fight');
    const floors = [...new Set(fights.map((n) => n.floor))];
    for (const f of floors) expect(new Set(fights.filter((n) => n.floor === f).map((n) => n.enemy)).size).toBe(1);
    const pool = ['hrOrientationVideo', ...enemiesFor(1, 'normal').map((e) => e.id)];
    expect(fights.every((n) => pool.includes(n.enemy!))).toBe(true);
    for (const lane of [0, 1]) {
      const types = run.nodes.filter((n) => n.act === 1 && n.lane === lane).map((n) => n.type);
      expect(types).toContain('rest');
      expect(types.some((t, i) => t === 'rest' && types[i + 1] === 'rest')).toBe(false);
    }
  });
});

describe('act 2, the first time it is met', () => {
  const nodes = newRun('warrior', 123, [2]).nodes.filter((n) => n.act === 2);

  it('is always the same: the same rooms and enemies whatever the seed', () => {
    const other = newRun('mage', 999, [2]).nodes.filter((n) => n.act === 2);
    const sketch = (list: typeof nodes): string[] => list.map((n) => `${n.floor}:${n.lane}:${n.type}:${n.enemy ?? ''}`);
    expect(sketch(other)).toEqual(sketch(nodes));
  });

  it('opens on a rule-breaker, meets one enemy per floor and has a Tailor, and every walk reaches the boss', () => {
    expect(ENEMIES[nodes[0].enemy!].ruleBreaker).toBe(true);
    const fights = nodes.filter((n) => n.type === 'fight');
    for (const f of new Set(fights.map((n) => n.floor))) expect(new Set(fights.filter((n) => n.floor === f).map((n) => n.enemy)).size).toBe(1);
    expect(nodes.some((n) => n.type === 'tailor')).toBe(true);
    const all = newRun('warrior', 123, [2]).nodes;
    const walk = (id: number, path: number[]): void => {
      const options = all[id].next.filter((n) => !path.includes(n));
      if (!options.length) expect(all[id].type).toBe('boss');
      for (const n of options) walk(n, [...path, n]);
    };
    walk(0, [0]);
    // The Tailor comes once in the whole run.
    expect(all.filter((n) => n.type === 'tailor').length).toBeLessThanOrEqual(1);
  });
});

describe('scripted acts', () => {
  const all = newRun('warrior', 5, [1, 2, 3]).nodes;

  it('are the same whatever the seed, and every room of them can be reached and every walk ends on the final boss', () => {
    const sketch = (list: typeof all): string[] => list.map((n) => `${n.act}:${n.floor}:${n.lane}:${n.type}:${n.enemy ?? ''}:${n.next}`);
    expect(sketch(newRun('mage', 999, [1, 2, 3]).nodes)).toEqual(sketch(all));
    const seen = new Set<number>();
    const walk = (id: number, path: number[]): void => {
      seen.add(id);
      const options = all[id].next.filter((n) => !path.includes(n));
      if (!options.length) expect(all[id], `#${id}`).toMatchObject({ type: 'boss', act: MAIN_ACTS });
      for (const n of options) walk(n, [...path, n]);
    };
    walk(0, [0]);
    expect(seen.size).toBe(all.length);
  });

  it('give every fight, elite and boss an enemy of its own act and tier, and the other rooms none', () => {
    const tier = { fight: 'normal', elite: 'elite', boss: 'boss' } as const;
    for (const n of all) {
      if (n.type in tier) expect(ENEMIES[n.enemy!], `#${n.id}`).toMatchObject({ act: n.act, tier: tier[n.type as keyof typeof tier] });
      else expect(n.enemy).toBeUndefined();
    }
  });
});

describe('the hero ability, once per act', () => {
  it('a fight that uses it spends it for the rest of the act, and the next act has it back', () => {
    const r = newRun('warrior', 5);
    r.current = r.nodes.find((n) => n.act === 1 && n.enemy)!.id;
    expect(new Combat(combatSetup(r)).abilitySpent).toBe(false);
    const fight = new Combat(combatSetup(r));
    fight.abilitySpent = true;
    applyCombat(r, fight);
    expect(r.abilityAct).toBe(1);
    expect(new Combat(combatSetup(r)).abilitySpent).toBe(true);
    r.current = r.nodes.find((n) => n.act === 2 && n.enemy)!.id;
    expect(new Combat(combatSetup(r)).abilitySpent).toBe(false);
  });

  it('a fight that leaves it alone does not spend it', () => {
    const r = newRun('warrior', 5);
    r.current = r.nodes.find((n) => n.act === 1 && n.enemy)!.id;
    applyCombat(r, new Combat(combatSetup(r)));
    expect(r.abilityAct).toBe(0);
  });
});

describe('saved runs', () => {
  it('a run that does not reach the last act is dropped', () => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      configurable: true,
    });
    const run = newRun('warrior', 7);
    const twoActs = run.nodes.filter((n) => n.act <= 2).map((n) => (n.type === 'boss' && n.act === 2 ? { ...n, next: [] } : n));
    store.set('cardstone+:run', JSON.stringify({ ...run, nodes: twoActs }));
    expect(loadRun()).toBeNull();
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('are dropped when their shape is wrong, and kept when it is right', () => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      configurable: true,
    });
    const good = newRun('mage', 3);
    const loadWith = (patch: Record<string, unknown>) => {
      store.set('cardstone+:run', JSON.stringify({ ...good, ...patch }));
      return loadRun();
    };
    expect(loadWith({})).toEqual(JSON.parse(JSON.stringify(good)));
    expect(loadWith({ money: undefined })?.money).toBe(0);
    expect(loadWith({ abilityAct: 2 })?.abilityAct).toBe(2);
    expect(loadWith({ abilityAct: 'two' })?.abilityAct).toBe(0);
    expect(loadWith({ playedIds: ['punch', 'bogus'] })?.playedIds).toEqual(['punch']);
    expect(loadWith({ playedIds: undefined })?.playedIds).toEqual([]);
    expect(
      loadWith({
        cleared: true,
        reward: [
          { id: 'bogus', up: false },
          { id: Object.keys(CARDS)[0], up: true },
        ],
      })?.reward,
    ).toEqual([{ id: Object.keys(CARDS)[0], up: true }]);
    expect(loadWith({ cleared: false, reward: [{ id: Object.keys(CARDS)[0], up: true }] })?.reward).toBeUndefined();
    expect(loadWith({ nodes: undefined })).toBeNull();
    expect(loadWith({ current: 999 })).toBeNull();
    expect(loadWith({ path: [0, 999] })).toBeNull();
    expect(loadWith({ hp: 'lots' })).toBeNull();
    expect(loadWith({ stats: { kills: 1 } })).toBeNull();
    expect(loadWith({ nodes: good.nodes.map((n, i) => (i === 1 ? { ...n, enemy: undefined } : n)) })).toBeNull();
    expect(loadWith({ nodes: good.nodes.map((n, i) => (i === 1 ? { ...n, next: [999] } : n)) })).toBeNull();
    store.set('cardstone+:run', '[1,2]');
    expect(loadRun()).toBeNull();
    Reflect.deleteProperty(globalThis, 'localStorage');
  });
});

describe('the Copy Room', () => {
  it('shreds a card for good, but never below the smallest deck', () => {
    const r = newRun('warrior', 5);
    expect(canShred(r)).toBe(true);
    const gone = r.deck[0];
    shredCard(r, gone.uid);
    expect(r.deck.some((c) => c.uid === gone.uid)).toBe(false);
    while (r.deck.length > CONFIG.shredMinDeck) shredCard(r, r.deck[0].uid);
    expect(canShred(r)).toBe(false);
  });

  it('photocopies a card with its upgrade and perks, for HP', () => {
    const r = newRun('warrior', 5);
    Object.assign(r.deck[0], { up: true, perks: ['fastTrack'] });
    const before = r.deck.length;
    const hp = r.hp;
    photocopyCard(r, r.deck[0].uid);
    const copy = r.deck[r.deck.length - 1];
    expect(r.deck).toHaveLength(before + 1);
    expect(copy).toMatchObject({ id: r.deck[0].id, up: true, perks: ['fastTrack'] });
    expect(copy.uid).not.toBe(r.deck[0].uid);
    expect(r.hp).toBe(hp - CONFIG.copyHpCost);
    r.hp = CONFIG.copyHpCost;
    expect(canCopy(r)).toBe(false);
  });

  it('skipping a card reward pays max HP (less with every skip, never under 1) and a card not on offer, as rare as the rarest shown', () => {
    const r = newRun('warrior', 5);
    const hp = r.maxHp;
    const decked = r.deck.length;
    const shown = rollRewards(r, 'fight').map((o) => o.def.id);
    expect(skipPay(r)).toBe(CONFIG.skipMaxHp);
    const top = Math.max(...shown.map((id) => RARITY_ORDER.indexOf(CARDS[id].rarity)));
    const bonus = skipReward(r, shown);
    expect(bonus && shown.includes(bonus.id)).toBe(false);
    expect(bonus && RARITY_ORDER.indexOf(CARDS[bonus.id].rarity)).toBe(top);
    expect(r.deck.length).toBe(decked + 1);
    expect(r.maxHp).toBe(hp + CONFIG.skipMaxHp);
    expect(skipPay(r)).toBe(CONFIG.skipMaxHp - 1);
    for (let i = 0; i < CONFIG.skipMaxHp + 2; i++) skipReward(r, shown);
    expect(skipPay(r)).toBe(1);
  });

  it('opens on two fights and a Lost and Found, then splits in two lanes', () => {
    const road = newRun('warrior', 1, [1]).nodes.slice(0, 3);
    expect(road.map((n) => n.type)).toEqual(['fight', 'fight', 'lostFound']);
    expect(road.map((n) => n.enemy)).toEqual(['hrOrientationVideo', 'snitch', undefined]);
    expect(road.map((n) => n.lane)).toEqual([0.5, 0.5, 0.5]);
    expect(road[2].next.map((id) => newRun('warrior', 1, [1]).nodes[id].lane)).toEqual([0, 1]);
  });

  it('the Vending Machine drops a card of the rarity paid for, and never takes the last HP', () => {
    const r = newRun('warrior', 5);
    const deck = r.deck.length;
    const [card] = vend(r, 'epic');
    expect(CARDS[card.id].rarity).toBe('epic');
    expect(r.deck).toHaveLength(deck + 1);
    expect(r.hp).toBe(r.maxHp - vendingCost('epic'));
    r.hp = r.maxHp;
    const snack = vend(r, 'rare');
    expect(snack).toHaveLength(2);
    expect(new Set(snack.map((c) => c.id)).size).toBe(2);
    expect(snack.every((c) => CARDS[c.id].rarity === 'rare')).toBe(true);
    r.hp = vendingCost('rare');
    expect(canVend(r, 'rare')).toBe(false);
  });

  it('the Restructuring turns the picked cards into random other cards, from scratch, and keeps the deck as big', () => {
    const r = newRun('warrior', 5);
    const [a, b] = r.deck;
    Object.assign(a, { up: true, perks: ['fastTrack'] });
    const size = r.deck.length;
    const moved = restructure(r, [a.uid, b.uid]);
    expect(moved).toHaveLength(2);
    expect(moved[0].before.id).toBe(a.id);
    for (const { before, after } of moved) {
      expect(after.id).not.toBe(before.id);
      expect(after.up).toBe(false);
      expect(after.perks).toBeUndefined();
      expect(r.deck.some((c) => c.uid === before.uid)).toBe(false);
      expect(r.deck).toContain(after);
    }
    expect(r.deck).toHaveLength(size);
    // The rarity follows the elite's reward odds of the act.
    const rarities = new Set<string>();
    for (let seed = 1; seed <= 60; seed++) {
      const run = newRun('warrior', seed);
      for (const { after } of restructure(run, [run.deck[0].uid])) rarities.add(CARDS[after.id].rarity);
    }
    expect(rarities.size).toBeGreaterThan(1);
    for (const r of rarities) expect(rewardOdds('elite', 1).some(([x]) => x === r)).toBe(true);
  });

  it('the Restructuring leaves curses alone, and gives a stationery the run does not hold', () => {
    const r = newRun('warrior', 5);
    const curse = CARD_LIST.find((c) => c.cls === 'curse');
    expect(curse).toBeTruthy();
    expect(canRestructure(r, { uid: 900, id: curse?.id ?? '', up: false })).toBe(false);
    expect(canRestructure(r, r.deck[0])).toBe(true);
    expect(canGiftRelic(r)).toBe(true);
    const id = giftRelic(r);
    expect(id).toBeTruthy();
    expect(r.relics).toEqual([id]);
    expect(giftRelic(r)).not.toBe(id);
  });

  it('the Raffle lands on any slice from one and the same run, and never on one nobody in the deck could take', () => {
    const r = newRun('warrior', 5);
    const landed = new Set<number>();
    for (let seed = 1; seed <= 80; seed++) landed.add(spinWheel(r, new Rng(seed)));
    expect(landed.size).toBe(WHEEL.length);
    expect(spinWheel(r, new Rng(9))).toBe(spinWheel(r, new Rng(9)));
    // A deck where every card is upgraded and has every perk but one: only that slice can come up.
    for (let seed = 1; seed <= 20; seed++) {
      const run = newRun('warrior', seed);
      for (const c of run.deck) Object.assign(c, { up: true, perks: ['fastTrack', 'budgetCut', 'overtime', 'redTape'] });
      expect(WHEEL[spinWheel(run, new Rng(seed))].id).toBe('tempContract');
    }
  });

  it('the Raffle puts its slice on the picked cards only: an upgrade, a perk that moves the cost either way, or a keyword', () => {
    const r = newRun('warrior', 5);
    const slot = (id: string) => WHEEL.find((s) => s.id === id)!;
    const [a, b, c] = r.deck.filter((x) => canWheel(x, slot('overtime')));
    const price = cardCostOf(a);
    const done = applyWheel(r, slot('overtime'), [a.uid, b.uid]);
    expect(done.map((d) => d.before.uid)).toEqual([a.uid, b.uid]);
    expect(done[0].before.perks).toBeUndefined();
    expect(cardCostOf(a)).toBe(price + 1);
    expect(c.perks).toBeUndefined();
    // The same slice does not stack on a card that has it already.
    expect(canWheel(a, slot('overtime'))).toBe(false);
    expect(applyWheel(r, slot('overtime'), [a.uid])).toHaveLength(0);
    const trained = applyWheel(r, slot('training'), [c.uid]);
    expect(trained[0].before.up).toBe(false);
    expect(c.up).toBe(true);
    const fleeting = applyWheel(r, slot('tempContract'), [c.uid]);
    expect(fleeting[0].after.perks).toEqual(['tempContract']);
    expect(cardKeywordsOf(c)).toContain('fleeting');
    expect(r.cleared).toBe(true);
  });

  it('the Lost & Found offers relics the run does not hold yet', () => {
    const r = newRun('warrior', 5);
    gainRelic(r, 'thermos');
    const offer = rollRelics(r);
    expect(offer).toHaveLength(CONFIG.lostFoundChoices);
    expect(offer).not.toContain('thermos');
    expect(offer).not.toContain('cargoPants');
  });

  it('the Lost & Found box holds a different rarity each, and never less than the act guarantees', () => {
    const rank = (id: string): number => RARITY_ORDER.indexOf(RELICS[id].rarity);
    for (const act of [1, 2, 3]) {
      for (let seed = 1; seed <= 40; seed++) {
        const r = newRun('warrior', seed);
        currentNode(r).act = act;
        const offer = rollRelics(r);
        expect(new Set(offer.map((id) => RELICS[id].rarity)).size, `act ${act} seed ${seed}`).toBe(offer.length);
        expect(Math.max(...offer.map(rank)), `act ${act} seed ${seed}`).toBeGreaterThanOrEqual(RARITY_ORDER.indexOf(relicGuarantee(act)));
        expect(offer.map(rank)).toEqual([...offer.map(rank)].sort((a, b) => a - b));
      }
    }
  });
});

describe('rating', () => {
  it('is asked for once enough runs are over, and never again after it is sent', () => {
    expect(ratingDue()).toBe(runHistory().length >= CONFIG.ratingAfterRuns);
    markRated();
    expect(ratingDue()).toBe(false);
  });
});

describe('act stamps', () => {
  it('beating an act boss stamps that act for the hero, and only that act', () => {
    const r = newRun('mage', 7);
    const boss = r.nodes.find((n) => n.type === 'boss' && n.act === 1);
    expect(boss).toBeDefined();
    r.current = boss?.id ?? 0;
    const c = setup({ hero: HEROES.mage, enemy: ENEMIES.bossSon });
    c.damage('hero', 'enemy', 9999, { raw: true }, 'hero');
    applyCombat(r, c);
    expect(hasStamp('mage', 1)).toBe(true);
    expect(hasStamp('mage', 2)).toBe(false);
    expect(hasStamp('warrior', 1)).toBe(false);
  });
});

describe('the first run nudges to the sleeve', () => {
  it('counts the fights in a row that never touched the sleeve, and only the scripted first run is nudged', () => {
    const r = newRun('warrior', 7, [1]);
    expect(isFirstRun(r)).toBe(true);
    expect(isFirstRun(newRun('warrior', 7))).toBe(false);
    r.current = r.nodes.find((n) => n.type === 'fight')?.id ?? 0;
    applyCombat(r, setup());
    applyCombat(r, setup());
    expect(r.sleeveIdle).toBe(2);
    const c = setup();
    run(c, 4);
    expect(c.stash(c.belt[0].card.uid)).toBe(true);
    expect(c.sleeveUses).toBe(1);
    applyCombat(r, c);
    expect(r.sleeveIdle).toBe(0);
  });
});

describe('management memos', () => {
  it('open for a hero once the last act is stamped for them', () => {
    expect(memosOpen('necromancer')).toBe(false);
    stampAct('necromancer', MAIN_ACTS - 1);
    expect(memosOpen('necromancer')).toBe(false);
    stampAct('necromancer', MAIN_ACTS);
    expect(memosOpen('necromancer')).toBe(true);
    expect(memosOpen('warrior')).toBe(false);
  });

  it('toughen enemies, the belt, the hero, rests and rewards, and stack', () => {
    const plain = newRun('warrior', 7);
    const hard = newRun('warrior', 7, [], ['quotas', 'hostile', 'speedUp', 'benefits', 'noBreaks', 'budget']);
    expect(hard.maxHp).toBe(Math.round(HEROES.warrior.hp * 0.8));
    const node = currentNode(plain);
    expect(enemyScale(node, hard.mods).hp).toBeCloseTo(enemyScale(node).hp * 1.25);
    expect(enemyScale(node, hard.mods).dmg).toBeCloseTo(enemyScale(node).dmg * 1.25);
    expect(enemyScale(node, ['quotas', 'quotas']).hp).toBeCloseTo(enemyScale(node).hp * 1.25 ** 2);
    plain.hp = 1;
    hard.hp = 1;
    expect(restHeal(hard)).toBeLessThan(restHeal(plain));
    expect(restHeal(plain)).toBe(Math.round(0.9 * (plain.maxHp - 1)));
    expect(rewardChoices(plain, 'fight')).toBe(3);
    expect(rewardChoices(plain, 'elite')).toBe(4);
    expect(rewardChoices(plain, 'boss')).toBe(4);
    expect(rewardChoices(hard, 'elite')).toBe(3);
    expect(rollRewards(hard, 'fight')).toHaveLength(2);
    expect(rollRewards(hard, 'elite')).toHaveLength(3);
    const base = setup().beltRate();
    expect(setup({ beltMul: 1.15 }).beltRate()).toBeCloseTo(base * 1.15);
  });

  it('a saved run keeps its known memos and drops the rest', () => {
    const store = new Map<string, string>();
    const stub = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    Object.defineProperty(globalThis, 'localStorage', { value: stub, configurable: true });
    const run = newRun('warrior', 7, [], ['quotas']);
    store.set('cardstone+:run', JSON.stringify({ ...run, mods: ['quotas', 'bogus'] }));
    expect(loadRun()?.mods).toEqual(['quotas']);
    store.set('cardstone+:run', JSON.stringify({ ...run, mods: undefined }));
    expect(loadRun()?.mods).toEqual([]);
    Reflect.deleteProperty(globalThis, 'localStorage');
  });
});

describe('adaptive difficulty', () => {
  const { par, max, rate } = CONFIG.pressure;
  const stubStorage = (store: Map<string, string>): void => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      configurable: true,
    });
  };
  /** Wins the fight of the run's current node: `dealt` damage into the enemy over `seconds`, having lost `lost` HP. */
  const win = (r: ReturnType<typeof newRun>, dealt: number, seconds: number, lost: number, begged = false): void => {
    const fight = new Combat(combatSetup(r));
    fight.result = 'win';
    fight.time = seconds;
    fight.stats.damageDealt = dealt;
    fight.stats.damageTaken = lost;
    fight.begged = begged;
    applyCombat(r, fight);
  };
  const fightRun = (): ReturnType<typeof newRun> => {
    const r = newRun('warrior', 5);
    r.current = r.nodes.find((n) => n.act === 1 && n.type === 'fight')!.id;
    return r;
  };
  /** A fight of 50 s that dealt `dps` damage per second and cost `lost` HP of 80 (all at par unless told otherwise). */
  const facts = (over: Partial<FightFacts> = {}): FightFacts => ({
    tier: 'normal',
    dealt: par.normal.dps * 50,
    seconds: 50,
    lost: par.normal.loss * 80,
    left: 60,
    maxHp: 80,
    begged: false,
    ...over,
  });

  it('says nothing at par, and a full signal far from it, either way', () => {
    expect(fightSignals(facts())).toEqual({ hp: 0, dmg: 0 });
    expect(fightSignals(facts({ dealt: par.normal.dps * 50 * 3, lost: 0 }))).toEqual({ hp: 1, dmg: 1 });
    expect(fightSignals(facts({ dealt: par.normal.dps * 50 * 0.3, lost: 80 }))).toEqual({ hp: -1, dmg: -1 });
    // A bit better than par but inside the dead stretch around it: no signal either.
    expect(fightSignals(facts({ tier: 'boss', dealt: par.boss.dps * 50 * 1.05, lost: par.boss.loss * 80 * 0.95 }))).toEqual({ hp: 0, dmg: 0 });
    // Every tier has its own par: a normal fight's damage per second is a weak boss fight.
    expect(fightSignals(facts({ tier: 'boss', dealt: par.normal.dps * 50 * 0.5 })).hp).toBeLessThan(0);
  });

  it('the speed is the damage dealt per second, Block soaked included, whatever the size of the enemy or the length of the fight', () => {
    const quick = fightSignals(facts({ dealt: par.normal.dps * 20 * 2, seconds: 20 }));
    const long = fightSignals(facts({ dealt: par.normal.dps * 200 * 2, seconds: 200 }));
    expect(quick.hp).toBeCloseTo(long.hp);
    expect(quick.hp).toBeGreaterThan(0);
    // A fight that deals nothing (the enemy fell some other way) is a weak one, not a division by zero.
    expect(fightSignals(facts({ dealt: 0 })).hp).toBe(-1);
    const fight = new Combat(combatSetup(fightRun()));
    fight.stats.damageDealt = 30;
    fight.stats.enemyBlocked = 20;
    expect(fightFacts(fight, 80).dealt).toBe(50);
  });

  it('the HP lost is net of the healing: a hero who healed it all back was not hurt', () => {
    const fight = new Combat(combatSetup(fightRun()));
    fight.stats.damageTaken = 30;
    fight.stats.healed = 12;
    expect(fightFacts(fight, 80).lost).toBe(18);
    fight.stats.healed = 45;
    expect(fightFacts(fight, 80).lost).toBe(0);
  });

  it('each lever follows its own signal', () => {
    const fastButHurt = fightSignals(facts({ dealt: par.normal.dps * 50 * 2, lost: 80 }));
    expect(fastButHurt.hp).toBeGreaterThan(0);
    expect(fastButHurt.dmg).toBeLessThan(0);
    const slowButUntouched = fightSignals(facts({ dealt: par.normal.dps * 50 * 0.5, lost: 0 }));
    expect(slowButUntouched.hp).toBeLessThan(0);
    expect(slowButUntouched.dmg).toBeGreaterThan(0);
  });

  it('moves toward the signal by the rate of the tier, stays inside -1..1 and eases back at par', () => {
    const easy = facts({ dealt: 9999, lost: 0 });
    expect(learn(calm(), easy).hp).toBeCloseTo(rate.normal);
    expect(learn(calm(), { ...easy, tier: 'boss' }).hp).toBeCloseTo(rate.boss);
    let p = calm();
    for (let i = 0; i < 40; i++) p = learn(p, { ...easy, tier: 'elite' });
    expect(p.hp).toBeLessThanOrEqual(1);
    expect(p.hp).toBeGreaterThan(0.99);
    for (let i = 0; i < 40; i++) p = learn(p, facts());
    expect(Math.abs(p.hp)).toBeLessThan(0.01);
    for (let i = 0; i < 40; i++) p = learn(p, facts({ dealt: 1, lost: 80 }));
    expect(p.hp).toBeGreaterThanOrEqual(-1);
    expect(p.dmg).toBeLessThan(-0.99);
  });

  it('a win on the last legs says the fight was not easy, whatever it cost on paper: the damage level goes all the way down', () => {
    const easy = facts({ dealt: 9999, lost: 0 });
    expect(fightSignals({ ...easy, left: 80 * CONFIG.pressure.closeCall - 1 }).dmg).toBe(-1);
    expect(fightSignals({ ...easy, left: 80 * CONFIG.pressure.closeCall }).dmg).toBe(1);
    expect(learn({ hp: 0.8, dmg: 0.5 }, { ...easy, left: 2 })).toEqual({ hp: 0.8 + rate.normal * (1 - 0.8), dmg: -1 });
  });

  it('a hero who begged to stay sends both levels all the way down, which is the full ease-off', () => {
    expect(learn({ hp: 0.8, dmg: 0.5 }, facts({ begged: true }))).toEqual({ hp: -1, dmg: -1 });
    expect(pressureScale({ hp: -1, dmg: -1 }, false)).toEqual({ hp: 0.9, dmg: 0.9 });
    expect(max.down).toBe(0.1);
  });

  it('climbs more than it eases, and less under memos', () => {
    expect(pressureScale(calm(), false)).toEqual({ hp: 1, dmg: 1 });
    expect(pressureScale({ hp: 1, dmg: -1 }, false)).toEqual({ hp: 1 + max.up, dmg: 1 - max.down });
    expect(max.up).toBeGreaterThan(max.down);
    expect(pressureScale({ hp: 1, dmg: 1 }, true).hp).toBe(1 + max.up * CONFIG.pressure.memoUp);
    expect(pressureScale({ hp: -1, dmg: 0 }, true).hp).toBe(1 - max.down);
  });

  it('scales the enemies of the next fight, boss and elite included', () => {
    const r = fightRun();
    const high = { hp: 1, dmg: -1 };
    for (const node of [currentNode(r), ...r.nodes.filter((n) => n.type === 'elite' || n.type === 'boss')]) {
      expect(enemyScale(node, [], high).hp).toBeCloseTo(enemyScale(node).hp * (1 + max.up));
      expect(enemyScale(node, [], high).dmg).toBeCloseTo(enemyScale(node).dmg * (1 - max.down));
    }
    r.pressure = high;
    expect(combatSetup(r).scale).toEqual(enemyScale(currentNode(r), [], high));
  });

  it('reads every won fight from the first one, and never in the very first run', () => {
    const r = fightRun();
    expect(pressureLearns(r)).toBe(true);
    win(r, 9999, 50, 0);
    expect(r.pressure.hp).toBeCloseTo(rate.normal);
    expect(r.pressure.dmg).toBeCloseTo(rate.normal);
    const lost = new Combat(combatSetup(r));
    lost.result = 'lose';
    lost.time = 1;
    const before = { ...r.pressure };
    applyCombat(r, lost);
    expect(r.pressure).toEqual(before);
    const first = newRun('warrior', 1, [1]);
    expect(isFirstRun(first)).toBe(true);
    expect(pressureLearns(first)).toBe(false);
  });

  it('begging to stay eases both levels off at the end of that fight, and the next fights go on from there', () => {
    const r = fightRun();
    win(r, 9999, 50, 0);
    win(r, 9999, 50, 0);
    expect(r.pressure.hp).toBeGreaterThan(0.4);
    win(r, 1, 120, 80, true);
    expect(r.pressure).toEqual({ hp: -1, dmg: -1 });
    expect(enemyScale(currentNode(r), [], r.pressure).hp).toBeCloseTo(enemyScale(currentNode(r)).hp * 0.9);
    win(r, 9999, 50, 0);
    expect(r.pressure.hp).toBeCloseTo(-1 + rate.normal * 2);
  });

  it('the debug fight log has a JSON line per fight (where, how it went, what the pressure read and moved, the build) and a last line with the run', () => {
    settings.debugMenus = true;
    resetFightLog();
    const r = fightRun();
    const fight = new Combat(combatSetup(r));
    fight.result = 'win';
    fight.time = 50;
    fight.stats.damageDealt = 100;
    fight.stats.damageTaken = 12;
    fight.stats.takenBy.hit = 12;
    fight.stats.cards.punch = { plays: 3, dmg: 18, block: 0, poison: 0 };
    logFight(r, fight);
    logFight(r, fight);
    settings.debugMenus = false;
    const [first, , end] = fightLogText('won')
      .trim()
      .split('\n')
      .map((l): unknown => JSON.parse(l));
    expect(first).toMatchObject({
      fight: 1,
      hero: 'warrior',
      enemy: currentNode(r).enemy,
      floor: currentNode(r).floor,
      result: 'win',
      dealt: 100,
      dps: 2,
      takenBy: { hit: 12, dot: 0, self: 0, chore: 0 },
      hp: { start: r.hp, max: r.maxHp },
      pressure: { before: { hp: 0, dmg: 0 }, signals: expect.any(Object), after: expect.any(Object) },
      build: { skips: 0, relics: r.relics },
    });
    // The card totals add up over the run's fights.
    expect(end).toEqual({ run: 'won', cards: { punch: { plays: 6, dmg: 36, block: 0, poison: 0 } } });
    resetFightLog();
  });

  it('is saved with the run, kept inside its range and dropped when it is missing', () => {
    const store = new Map<string, string>();
    stubStorage(store);
    const good = newRun('mage', 3);
    good.pressure = { hp: 0.4, dmg: -0.2 };
    const loadWith = (patch: Record<string, unknown>) => {
      store.set('cardstone+:run', JSON.stringify({ ...good, ...patch }));
      return loadRun();
    };
    expect(loadWith({})?.pressure).toEqual({ hp: 0.4, dmg: -0.2 });
    expect(loadWith({ pressure: { hp: 9, dmg: -9 } })?.pressure).toEqual({ hp: 1, dmg: -1 });
    expect(loadWith({ pressure: undefined })).toBeNull();
    expect(loadWith({ pressure: { hp: 'high', dmg: 0 } })).toBeNull();
    Reflect.deleteProperty(globalThis, 'localStorage');
  });
});

// The debug unlock-all changes the progress for good (the rest of the file counts on a fresh one): its tests come last.
describe('cross-training', () => {
  it("offers two cards of each class but the hero's own, and taking one grows the deck", () => {
    const r = newRun('warrior', 5);
    const offer = rollCrossTraining(r);
    // A hero not hired yet (the Rogue) has no card on offer.
    expect(offer.some((c) => c.cls === 'rogue')).toBe(false);
    unlockAll([], [], []);
    const hired = rollCrossTraining(newRun('warrior', 5));
    expect(hired).toHaveLength(3 * 2);
    expect(new Set(hired.map((c) => c.id)).size).toBe(hired.length);
    for (const cls of ['mage', 'necromancer', 'rogue']) expect(hired.filter((c) => c.cls === cls)).toHaveLength(CONFIG.crossTrainPerClass);
    const deck = r.deck.length;
    crossTrain(r, hired[0].id);
    expect(r.deck).toHaveLength(deck + 1);
    expect(r.cleared).toBe(true);
  });
});

describe('the debug unlock-all', () => {
  it('opens the memos and every act, the weekend too, to every hero', () => {
    unlockAll([], [], []);
    for (const hd of Object.values(HEROES)) {
      expect(memosOpen(hd.id), hd.id).toBe(true);
      for (let act = 1; act <= ACT_DEFS.length; act++) expect(hasStamp(hd.id, act), `${hd.id} ${act}`).toBe(true);
    }
  });
});
