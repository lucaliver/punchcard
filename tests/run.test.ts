import { describe, expect, it } from 'vitest';
import { CARDS } from '../src/data/cards';
import { CONFIG } from '../src/data/config';
import { KEEPERS } from '../src/data/keepers';
import { RELICS } from '../src/data/relics';
import { genMap, newRun, offerReward, reachable, removeCard, rollCards, stockShop, takeRelic, transformCard, upgradeCard } from '../src/game/run';
import { makeStage } from '../src/game/waves';

describe('the map', () => {
  for (const act of [1, 2, 3]) {
    it(`night ${act}: every room can be reached and leads to the boss`, () => {
      for (let seed = 1; seed < 40; seed++) {
        const nodes = genMap(seed, act, false);
        const boss = nodes[nodes.length - 1];
        expect(boss.type).toBe('boss');
        // everything is reachable from the foot
        const seen = new Set<number>();
        const walk = (id: number): void => {
          if (seen.has(id)) return;
          seen.add(id);
          for (const n of nodes[id].next) walk(n);
        };
        for (const n of nodes.filter((x) => x.row === 0)) walk(n.id);
        expect(seen.size).toBe(nodes.length);
        // every room but the boss has a road on
        for (const n of nodes) if (n !== boss) expect(n.next.length).toBeGreaterThan(0);
        expect(nodes.some((n) => n.type === 'market')).toBe(true);
        expect(nodes.some((n) => n.type === 'shrine')).toBe(true);
        expect(nodes.filter((n) => n.row === 0).every((n) => n.type === 'watch')).toBe(true);
      }
    });
  }
});

describe('a run', () => {
  it('starts with the keeper’s deck and the first rooms reachable', () => {
    const run = newRun('ronin', 5, false);
    expect(run.deck.map((c) => c.id)).toEqual(KEEPERS.ronin.deck);
    expect(reachable(run).length).toBeGreaterThan(1);
  });

  it('deals reward cards from the keeper’s pool, never a starter card', () => {
    const run = newRun('miko', 9, false);
    for (let i = 0; i < 50; i++) {
      const offer = rollCards(run, 3, 'elite');
      expect(offer.length).toBe(3);
      for (const c of offer) {
        expect(CARDS[c.id].starter).toBeFalsy();
        expect(['any', 'miko']).toContain(CARDS[c.id].keeper);
      }
      expect(new Set(offer.map((c) => c.id)).size).toBe(3);
    }
  });

  it('a boss offers three boss trinkets', () => {
    const run = newRun('miko', 9, false);
    const offer = offerReward(run, 'boss', 8, 0, false);
    expect(offer.relics.length).toBe(3);
    for (const r of offer.relics) expect(RELICS[r].rarity).toBe('boss');
  });

  it('upgrading, removing and transforming change the deck', () => {
    const run = newRun('miko', 3, false);
    const first = run.deck[0];
    expect(upgradeCard(run, first.uid)).toBe(true);
    expect(upgradeCard(run, first.uid)).toBe(false);
    const n = run.deck.length;
    expect(removeCard(run, run.deck[1].uid)).toBe(true);
    expect(run.deck.length).toBe(n - 1);
    const t = transformCard(run, run.deck[0].uid);
    expect(t).not.toBeNull();
    expect(t?.up).toBe(true);
  });

  it('the deck never goes under its minimum', () => {
    const run = newRun('miko', 3, false);
    while (run.deck.length > CONFIG.run.minDeck) removeCard(run, run.deck[0].uid);
    expect(removeCard(run, run.deck[0].uid)).toBe(false);
  });

  it('a trinket that adds flame raises the maximum', () => {
    const run = newRun('miko', 3, false);
    const before = run.maxFlame;
    takeRelic(run, 'lanternGlass');
    expect(run.maxFlame).toBe(before + (RELICS.lanternGlass.mods?.flame ?? 0));
  });

  it('the shop stocks cards and trinkets with prices', () => {
    const run = newRun('tanuki', 4, false);
    const shop = stockShop(run);
    expect(shop.cards.length).toBe(5);
    expect(shop.relics.length).toBe(2);
    for (const c of shop.cards) expect(c.price).toBeGreaterThan(0);
  });
});

describe('a night', () => {
  it('is the same for the same seed and different for another', () => {
    const a = makeStage({ act: 2, floor: 3, kind: 'watch', seed: 77 });
    const b = makeStage({ act: 2, floor: 3, kind: 'watch', seed: 77 });
    const c = makeStage({ act: 2, floor: 3, kind: 'watch', seed: 78 });
    expect(a.spawns).toEqual(b.spawns);
    expect(a.spawns).not.toEqual(c.spawns);
  });

  it('keeps the quiet at the start and the end of the night', () => {
    for (let seed = 1; seed < 30; seed++) {
      const s = makeStage({ act: 1, floor: 2, kind: 'watch', seed });
      for (const sp of s.spawns) {
        expect(sp.t).toBeGreaterThanOrEqual(CONFIG.openingQuiet - 0.01);
        expect(sp.t).toBeLessThanOrEqual(s.duration - CONFIG.tailQuiet + 1);
      }
    }
  });

  it('a boss night has its boss', () => {
    expect(makeStage({ act: 1, floor: 6, kind: 'boss', seed: 1 }).spawns.some((s) => s.foe === 'nurikabe')).toBe(true);
    expect(makeStage({ act: 2, floor: 6, kind: 'boss', seed: 1 }).spawns.filter((s) => s.foe === 'orochi').length).toBe(5);
  });
});

describe('moon phases', () => {
  it('each phase adds its rule on top of the ones below', async () => {
    const { moonMods, MAX_MOON } = await import('../src/data/moons');
    expect(moonMods(0)).toEqual({ hp: 0, flame: 0, elite: 0, price: 0, speed: 0 });
    expect(moonMods(1).hp).toBeGreaterThan(0);
    expect(moonMods(2).flame).toBeLessThan(0);
    expect(moonMods(2).hp).toBe(moonMods(1).hp);
    expect(moonMods(MAX_MOON).speed).toBeGreaterThan(0);
    expect(moonMods(99)).toEqual(moonMods(MAX_MOON));
  });

  it('a higher phase starts the keeper with less flame and makes tougher nights', () => {
    const plain = newRun('miko', 4, false, 0);
    const hard = newRun('miko', 4, false, 2);
    expect(hard.maxFlame).toBeLessThan(plain.maxFlame);
    const a = makeStage({ act: 2, floor: 3, kind: 'watch', seed: 9 });
    const b = makeStage({ act: 2, floor: 3, kind: 'watch', seed: 9, moon: 5 });
    expect(b.hpMul).toBeGreaterThan(a.hpMul);
    expect(b.speedMul).toBeGreaterThan(a.speedMul);
    expect(b.eliteMul).toBeGreaterThan(a.eliteMul);
  });
});
