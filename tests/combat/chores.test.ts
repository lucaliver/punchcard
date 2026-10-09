import { describe, expect, it } from 'vitest';
import type { Combat } from '../../src/game/combat';
import { CoffeeTask } from '../../src/game/coffee';
import { Rng } from '../../src/core/rng';
import { CONFIG } from '../../src/data/config';
import { ENEMIES } from '../../src/data/enemies';
import { setup, run, coffeeOf, shellsOf } from './helpers';

describe("the Boss's coffee", () => {
  /** The machine's coffee move is up first, then it idles for good. */
  const coffeeFight = (): Combat => {
    const idle = { id: 'wait', intent: 'idle', windup: 9999 } as const;
    const c = setup({
      enemy: { ...ENEMIES.coffeeMachine, main: idle, specials: [ENEMIES.coffeeMachine.specials[0]], every: 1 },
      hp: 80,
      maxHp: 80,
    });
    c.skipEnemyMove();
    return c;
  };
  /** Puts in coins the slot takes until the price is paid. */
  const pay = (c: Combat): void => {
    const task = coffeeOf(c);
    while (task.phase === 'coins') c.coffee({ kind: 'coin', id: task.coins.find((x) => !x.used && task.fits(x))!.id });
  };
  /** Does the whole chore with the right moves, up to pressing start (the fork on the tray is a mistake: it costs seconds). */
  const doChore = (c: Combat): void => {
    const task = coffeeOf(c);
    pay(c);
    for (const key of task.code) expect(c.coffee({ kind: 'key', key })).toBe('ok');
    expect(c.coffee({ kind: 'item', item: 'fork' })).toBe('wrong');
    expect(c.coffee({ kind: 'item', item: 'cup' })).toBe('ok');
    expect(c.coffee({ kind: 'item', item: 'spoon' })).toBe('ok');
    for (let i = 0; i < task.sugar; i++) c.coffee({ kind: 'sugar', by: 1 });
    expect(c.coffee({ kind: 'start' })).toBe('ok');
  };

  it('a window covers the belt and the sleeve; doing the chore in time cancels the move and stuns the machine', () => {
    const c = coffeeFight();
    const phases: string[] = [];
    const said: string[] = [];
    c.events.on((e) => {
      if (e.type === 'task') phases.push(e.phase);
      if (e.type === 'speech') said.push(e.key);
    });
    expect(c.chore).toBeNull();
    run(c, CONFIG.introTime + 0.1);
    expect(c.chore?.phase).toBe('coins');
    const uid = c.belt[0].card.uid;
    expect(c.isCovered(uid)).toBe(true);
    expect(c.playCard(uid)).toBe(false);
    expect(c.stash(uid)).toBe(false);
    // Out of order, a step does nothing and costs nothing.
    const before = c.enemy.timer;
    expect(c.coffee({ kind: 'start' })).toBe('ignored');
    expect(c.enemy.timer).toBe(before);
    doChore(c);
    expect(c.chore?.phase).toBe('brew');
    run(c, CONFIG.coffee.brewTime + CONFIG.coffee.doneHold + 0.1);
    expect(c.chore).toBeNull();
    expect(c.hero.hp).toBe(80);
    expect(c.has('enemy', 'stun')).toBe(true);
    expect(phases).toEqual(['open', 'wrong', 'done']);
    expect(said).toEqual(['enemy.coffeeMachine.order', 'enemy.coffeeMachine.calm']);
    expect(c.isCovered(uid)).toBe(false);
  });

  it('a mistake takes seconds off the countdown, up to a cap; when it runs out the hit lands and the window closes', () => {
    const c = coffeeFight();
    const phases: string[] = [];
    c.events.on((e) => {
      if (e.type === 'task') phases.push(e.phase);
    });
    run(c, CONFIG.introTime + 0.1);
    const task = coffeeOf(c);
    pay(c);
    const wrong = (task.code[0] % CONFIG.coffee.keys) + 1;
    const t0 = c.enemy.timer;
    expect(c.coffee({ kind: 'key', key: wrong })).toBe('wrong');
    expect(c.enemy.timer).toBeCloseTo(t0 + CONFIG.coffee.penalty, 5);
    for (let i = 0; i < 10; i++) c.coffee({ kind: 'key', key: wrong });
    expect(task.fined).toBe(CONFIG.coffee.penaltyMax);
    expect(task.keysDone).toBe(0);
    run(c, ENEMIES.coffeeMachine.specials[0].windup);
    expect(c.hero.hp).toBeLessThan(80);
    expect(phases).toContain('close');
    expect(phases.filter((x) => x === 'wrong')).toHaveLength(11);
  });

  it('no handful of coins fewer than the minimum ever makes the price, and a price has cents', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const task = new CoffeeTask(new Rng(seed));
      const n = task.coins.length;
      for (let mask = 1; mask < 1 << n; mask++) {
        const picked = task.coins.filter((_, i) => mask & (1 << i));
        if (picked.reduce((sum, x) => sum + x.value, 0) === task.price)
          expect(picked.length, `seed ${seed}`).toBeGreaterThanOrEqual(CONFIG.coffee.minCoins);
      }
      expect(task.price).toBeGreaterThanOrEqual(CONFIG.coffee.price[0]);
      expect(task.price).toBeLessThanOrEqual(CONFIG.coffee.price[1]);
    }
  });

  it('the slot only takes coins the purse can still make the price with, so any order of good coins pays up', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const task = new CoffeeTask(new Rng(seed));
      for (const coin of task.coins) {
        if (task.phase !== 'coins') break;
        const was = task.paid;
        const fits = task.fits(coin);
        expect(task.act({ kind: 'coin', id: coin.id }), `seed ${seed}`).toBe(fits ? 'ok' : 'wrong');
        if (!fits) expect(task.paid).toBe(was);
      }
      expect(task.paid, `seed ${seed}`).toBe(task.price);
      expect(task.phase).toBe('code');
    }
  });
});

describe('the Board', () => {
  const idle = { id: 'wait', intent: 'idle', windup: 9999 } as const;
  /** The Board with its moves put away, so the phases can be walked through by damage alone. */
  const quietBoard = () =>
    setup({
      enemy: { ...ENEMIES.theBoard, main: idle, specials: [], phases: ENEMIES.theBoard.phases!.map((p) => ({ ...p, main: idle, specials: [] })) },
    });
  const hit = (c: Combat, n: number): void => {
    c.damage('hero', 'enemy', n, { raw: true }, 'hero');
  };

  it('loses a head at 200 and again at 100 HP: its pattern and its belt change each time', () => {
    const c = quietBoard();
    run(c, CONFIG.introTime);
    const seen: number[] = [];
    c.events.on((e) => {
      if (e.type === 'phase') seen.push(e.index);
    });
    expect(c.enemy.maxHp).toBe(300);
    expect(c.stacks('enemy', 'strength')).toBe(2);
    expect(c.beltRows).toBe(3);
    const slow = c.beltRate();
    c.enemy.block = 0;
    hit(c, 99);
    expect(c.enemy.phase).toBe(0);
    hit(c, 1);
    expect(c.enemy.hp).toBe(200);
    expect(c.enemy.phase).toBe(1);
    expect(c.beltRows).toBe(2);
    expect(c.rowsOpen).toBe(2);
    expect(c.belt.every((b) => b.row < 2)).toBe(true);
    expect(c.beltRate()).toBeGreaterThan(slow);
    expect(c.foe).toBe(c.enemy.def.phases![0]);
    hit(c, 100);
    expect(c.enemy.phase).toBe(2);
    expect(c.beltRows).toBe(2);
    expect(c.foe).toBe(c.enemy.def.phases![1]);
    expect(seen).toEqual([1, 2]);
  });

  it('one big blow can take it through two phases at once', () => {
    const c = quietBoard();
    c.enemy.block = 0;
    hit(c, 250);
    expect(c.enemy.phase).toBe(2);
  });
});

describe('the shell game', () => {
  const audit = ENEMIES.theBoard.phases![1].specials[0];
  /** The audit is up first, then the Board idles for good. */
  const auditFight = (move = audit): Combat => {
    const c = setup({
      enemy: {
        ...ENEMIES.theBoard,
        belt: undefined,
        phases: undefined,
        start: [],
        main: { id: 'wait', intent: 'idle', windup: 9999 },
        specials: [move],
        every: 1,
      },
    });
    c.skipEnemyMove();
    return c;
  };
  /** Runs until the cards have been shuffled and wait for a pick. */
  const untilPick = (c: Combat): void => {
    for (let i = 0; i < 60 * 30 && c.chore?.phase !== 'pick'; i++) c.tick(1 / 60);
  };

  it('a window covers the belt and the sleeve; the right card in time cancels the move and stuns the Board', () => {
    const c = auditFight();
    const said: string[] = [];
    c.events.on((e) => {
      if (e.type === 'speech') said.push(e.key);
    });
    run(c, CONFIG.introTime + 0.1);
    const game = shellsOf(c);
    expect(game.phase).toBe('show');
    expect(c.isCovered(c.belt[0].card.uid)).toBe(true);
    expect(c.pickShell(0)).toBe('ignored');
    untilPick(c);
    expect([...game.slots].sort()).toEqual([0, 1, 2]);
    expect(c.pickShell(game.prizePlace)).toBe('ok');
    run(c, CONFIG.shells.doneHold + 0.1);
    expect(c.chore).toBeNull();
    expect(c.hero.hp).toBe(80);
    expect(c.has('enemy', 'stun')).toBe(true);
    expect(said).toEqual(['enemy.theBoard.order', 'enemy.theBoard.calm']);
  });

  it('a wrong card costs seconds and starts the round again; when the countdown runs out the hit lands', () => {
    const c = auditFight();
    run(c, CONFIG.introTime + 0.1);
    untilPick(c);
    const game = shellsOf(c);
    const t0 = c.enemy.timer;
    expect(c.pickShell((game.prizePlace + 1) % 3)).toBe('wrong');
    expect(c.enemy.timer).toBeCloseTo(t0 + CONFIG.shells.penalty, 5);
    expect(game.phase).toBe('reveal');
    run(c, CONFIG.shells.revealTime + 0.1);
    expect(game.phase).toBe('show');
    expect(game.round).toBe(1);
    run(c, audit.windup);
    expect(c.hero.hp).toBeLessThan(80);
    expect(c.chore).toBeNull();
  });

  it('the penalty stops at its cap', () => {
    const c = auditFight({ ...audit, windup: 999 });
    run(c, CONFIG.introTime + 0.1);
    const game = shellsOf(c);
    for (let i = 0; i < 10; i++) {
      untilPick(c);
      c.pickShell((game.prizePlace + 1) % 3);
      run(c, CONFIG.shells.revealTime + 0.1);
    }
    expect(game.fined).toBe(CONFIG.shells.penaltyMax);
  });
});
