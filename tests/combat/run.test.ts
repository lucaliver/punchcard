import { describe, expect, it } from 'vitest';
import { CONFIG, relicGuarantee, rewardUpgradeChance } from '../../src/data/config';
import { ENEMIES, enemiesFor } from '../../src/data/enemies';
import { HEROES } from '../../src/data/heroes';
import { CARDS, RARITY_ORDER, cardCostOf } from '../../src/data/cards';
import { RELICS } from '../../src/data/relics';
import { hasStamp, markRated, memosOpen, ratingDue, runHistory, stampAct, unlockAll } from '../../src/game/meta';
import { ACT_DEFS } from '../../src/data/acts';
import {
  applyCombat,
  canCopy,
  canVend,
  currentNode,
  enemyScale,
  restHeal,
  rewardChoices,
  rollRewards,
  swapCard,
  canShred,
  fightPay,
  gainRelic,
  loadRun,
  newRun,
  photocopyCard,
  rollRelics,
  shredCard,
  skipPay,
  skipReward,
  rollCrossTraining,
  crossTrain,
  ACTS,
  SPECIALS,
  vend,
  vendingCost,
} from '../../src/game/run';
import { setup } from './helpers';

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

  it('at most one offered card comes upgraded, and a swap keeps it so', () => {
    const run = newRun('warrior', 7);
    for (const act of [1, 3]) {
      run.current = run.nodes.find((n) => n.act === act)!.id;
      const rolls = Array.from({ length: 300 }, () => rollRewards(run, 'fight'));
      expect(rolls.every((offer) => offer.filter((o) => o.up).length <= 1)).toBe(true);
      expect(rolls.filter((offer) => offer.some((o) => o.up)).length / rolls.length).toBeCloseTo(rewardUpgradeChance(act), 1);
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
      for (let act = 1; act <= ACTS; act++) {
        const specials = nodes.filter((n) => n.act === act && SPECIALS.includes(n.type)).map((n) => n.type);
        expect(specials.length).toBeGreaterThanOrEqual(3);
        expect(new Set(specials).size).toBe(specials.length);
        const boss = nodes.find((n) => n.act === act && n.type === 'boss')!;
        for (const n of nodes.filter((m) => m.next.includes(boss.id))) expect(n.type).toBe('rest');
      }
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
      for (let act = 1; act <= ACTS; act++)
        for (const tier of ['elite', 'boss'] as const) {
          const pool = enemiesFor(act, tier);
          const dealt = nodes.filter((n) => n.act === act && n.type === tier).map((n) => n.enemy!);
          if (pool.some((e) => !avoid.includes(e.id))) for (const id of dealt) expect(avoid).not.toContain(id);
        }
      // Normal fights: the enemies new to this run all show up before one of the last run's comes back.
      for (let act = 1; act <= ACTS; act++) {
        const fresh = enemiesFor(act, 'normal').filter((e) => !avoid.includes(e.id)).length;
        const fights = nodes.filter((n) => n.act === act && n.type === 'fight').map((n) => n.enemy!);
        for (const id of fights.slice(0, fresh)) expect(avoid).not.toContain(id);
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

describe('the very first run', () => {
  it('goes on through every act, the later ones dealt like any run', () => {
    const run = newRun('warrior', 1, [1]);
    expect(new Set(run.nodes.map((n) => n.act)).size).toBe(ACTS);
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
      if (!options.length) expect(all[id], `#${id}`).toMatchObject({ type: 'boss', act: ACTS });
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

  it('skipping a card reward pays max HP (one more every few rooms) and a card not on offer, as rare as the rarest shown', () => {
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
    r.path.length = CONFIG.skipMaxHpRooms;
    expect(skipPay(r)).toBe(CONFIG.skipMaxHp + 1);
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
    const card = vend(r, 'epic');
    expect(CARDS[card.id].rarity).toBe('epic');
    expect(r.deck).toHaveLength(deck + 1);
    expect(r.hp).toBe(r.maxHp - vendingCost('epic'));
    r.hp = vendingCost('rare');
    expect(canVend(r, 'rare')).toBe(false);
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

describe('management memos', () => {
  it('open for a hero once the last act is stamped for them', () => {
    expect(memosOpen('necromancer')).toBe(false);
    stampAct('necromancer', ACT_DEFS.length - 1);
    expect(memosOpen('necromancer')).toBe(false);
    stampAct('necromancer', ACT_DEFS.length);
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
    expect(rewardChoices(plain)).toBe(4);
    expect(rewardChoices(hard)).toBe(3);
    expect(rollRewards(hard, 'fight')).toHaveLength(3);
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
