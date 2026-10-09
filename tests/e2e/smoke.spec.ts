import { expect, type Page, test } from '@playwright/test';
import { ENEMY_LIST } from '../../src/data/enemies';
import { combat, freshGame, signAndStart, startFight } from './helpers';

test('title, hero select and journey render without errors', async ({ page }) => {
  const problems = await freshGame(page);
  await expect(page.locator('.title-screen .logo')).toHaveText(/punchcard/i);
  await page.getByRole('button', { name: /new run/i }).click();
  await expect(page.locator('.hero-slide')).toHaveCount(4);
  // Carousel: the hero in view is the one that starts.
  await page.locator('.hero-arrow.next').click();
  await expect(page.locator('.hero-dot').nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.hero-select')).toHaveAttribute('data-hero', 'mage');
  await page.getByRole('button', { name: /start shift/i }).click();
  await expect(page.locator('.node.current')).toBeVisible();
  expect(problems).toEqual([]);
});

test('the poster boss and the icons are there when the home opens straight after a reload', async ({ page }) => {
  const problems = await freshGame(page);
  await page.reload();
  await expect(page.locator('.title-screen')).toBeVisible();
  await expect(page.locator('.poster-boss img.ink-W')).toBeVisible();
  await expect(page.locator('[data-art-sprite], [data-art-icon]')).toHaveCount(0);
  expect(problems).toEqual([]);
});

test('a tab left open for a day asks for a reload on the home', async ({ page }) => {
  const problems = await freshGame(page);
  const banner = page.locator('.stale-banner');
  await expect(banner).toBeHidden();
  await page.evaluate(() => {
    const now = Date.now();
    Date.now = () => now + 25 * 3600_000;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(banner).toBeVisible();
  await expect(banner).toContainText(/no run in progress/i);
  expect(problems).toEqual([]);
});

test('a hero who has won a full day can pin up management memos before a run', async ({ page }) => {
  const problems = await freshGame(page, { stamps: ['warrior:3'] });
  await page.getByRole('button', { name: /new run/i }).click();
  const memos = page.locator('.memo-btn');
  await expect(memos).toBeVisible();
  await memos.click();
  await page.locator('.setting.memo .switch').first().click();
  await page.locator('.setting.memo .switch').nth(5).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(memos.locator('b')).toHaveText('2');
  // Other heroes haven't earned them.
  await page.locator('.hero-arrow.next').click();
  await expect(memos).toBeHidden();
  await page.locator('.hero-arrow.prev').click();
  await expect(memos).toBeVisible();
  await page.getByRole('button', { name: /start shift/i }).click();
  await expect.poll(() => page.evaluate('window.__game.run.mods')).toEqual(['quotas', 'budget']);
  expect(problems).toEqual([]);
});

test('an uncaught error shows the machine jam window, and Restart reloads the game', async ({ page }) => {
  await freshGame(page);
  await page.evaluate(() => {
    setTimeout(() => {
      throw new Error('boom');
    });
  });
  const jam = page.locator('.modal', { hasText: /machine jam/i });
  await expect(jam).toBeVisible();
  await expect(jam.locator('.crash-detail')).toHaveText('Error: boom');
  // Not dismissable: a tap on the backdrop leaves it open.
  await page.mouse.click(5, 5);
  await expect(jam).toBeVisible();
  await jam.getByRole('button', { name: 'Restart' }).click();
  await expect(page.locator('.title-screen .logo')).toBeVisible();
  await expect(jam).toBeHidden();
});

test('a fight can be played and won, then a reward is offered', async ({ page }) => {
  const problems = await freshGame(page);
  await startFight(page);
  await expect(page.locator('.belt-cards .card').first()).toBeVisible();
  await combat(page, 'c.gainMana(3);');
  const before = (await combat(page, 'return c.enemy.hp;')) as number;
  const uid = (await combat(page, "return c.belt.find((b) => b.card.id === 'punch')?.card.uid ?? null;")) as number | null;
  if (uid !== null) {
    await page.locator(`.belt-cards .card[data-uid="${uid}"]`).dispatchEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 });
    await page.locator('.combat').dispatchEvent('pointerup', { pointerId: 1, clientX: 0, clientY: 0 });
    await expect.poll(() => combat(page, 'return c.enemy.hp;')).toBeLessThan(before);
  }
  await combat(page, "c.damage('hero', 'enemy', 999, { raw: true }, 'hero');");
  await expect(page.locator('.reward')).toBeVisible({ timeout: 5000 });
  // Reward = swap: the whole deck on top, 4 offers below; Swap needs one of each.
  await expect(page.locator('.swap-deck .card')).toHaveCount(20);
  await expect(page.locator('.swap-offer .card')).toHaveCount(4);
  const swap = page.getByRole('button', { name: 'Swap' });
  await expect(swap).toBeDisabled();
  await page.locator('.swap-deck .card').first().click();
  await page.locator('.swap-offer .card').first().click();
  await expect(swap).toBeEnabled();
  await swap.click();
  // Back on the map: act 1 starts on a single road, so the one floor ahead is open.
  await expect(page.locator('.node.open')).toHaveCount(1);
  const deck = (await page.evaluate('window.__game.run.deck.length')) as number;
  expect(deck).toBe(20);
  expect(problems).toEqual([]);
});

test('the combat layout never moves when statuses appear', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  const snap = () =>
    page.evaluate(() =>
      ['.belt', '.hero-row', '.threat', '.enemy-art .riso']
        .map((s) => {
          const r = document.querySelector(s)!.getBoundingClientRect();
          return `${Math.round(r.top)}/${Math.round(r.height)}`;
        })
        .join(' '),
    );
  const a = await snap();
  await combat(
    page,
    "for (const id of ['poison', 'burn', 'strength']) c.applyStatus('enemy', id, 3); c.applyStatus('enemy', 'weak', 1, 5); c.applyStatus('hero', 'strength', 2); c.applyStatus('hero', 'dodge', 1); c.gainBlock('hero', 9);",
  );
  // Let the one-shot reactions (the buff pop scales the sprite for a moment) settle.
  await page.waitForTimeout(700);
  // The sprite bobs a few pixels while idle: compare size only for it.
  const norm = (s: string) =>
    s
      .split(' ')
      .map((x, i) => (i === 3 ? x.split('/')[1] : x))
      .join(' ');
  expect(norm(await snap())).toBe(norm(a));
});

test('compendium shows cards, enemies and relics in separate sections', async ({ page }) => {
  const problems = await freshGame(page);
  await page
    .locator('.menu')
    .getByRole('button', { name: /handbook/i })
    .click();
  await expect(page.locator('.comp-grid .card').first()).toBeVisible();
  await expect(page.locator('.foe').first()).toBeHidden();
  await page.getByRole('tab', { name: /personnel/i }).click();
  await expect(page.locator('.foe').first()).toBeVisible();
  await page.getByRole('tab', { name: /act 3/i }).click();
  await expect(page.getByRole('tab', { name: /act 3/i })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.comp-grid')).toBeHidden();
  await page.getByRole('tab', { name: /stationery/i }).click();
  await expect(page.locator('.relic-line').first()).toBeVisible();
  await expect(page.locator('.foe').first()).toBeHidden();
  expect(problems).toEqual([]);
});

for (const height of [844, 600]) {
  test(`title poster, time card and menu fit (height ${height})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height });
    await freshGame(page);
    for (const sel of ['.poster', '.poster .logo', '.timecard-cta', '.desk-clock', '.menu .btn >> nth=-1']) {
      await expect(page.locator(sel)).toBeInViewport({ ratio: 0.9 });
    }
    // The boss is cut by the poster's edge on purpose.
    await expect(page.locator('.poster-boss')).toBeVisible();
  });
}

test('the fight waits for Start; meanwhile things can be held to read them', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.getByRole('button', { name: /enter floor 1/i }).click();
  const clock = () => page.evaluate('window.__combat.time + window.__combat.intro');
  const before = await clock();
  await page.waitForTimeout(600);
  expect(await clock()).toBe(before);
  // Hold the ability button: an info sheet opens, nothing is played.
  const ability = page.locator('.js-ability');
  await ability.dispatchEvent('pointerdown');
  await page.waitForTimeout(500);
  await ability.dispatchEvent('pointerup');
  await expect(page.locator('.modal .info')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.locator('.js-start').click();
  await expect.poll(clock).not.toBe(before);
});

test('pausing switches to the pause theme and resuming restores the fight music', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  const track = () => page.evaluate('window.__game.musicTrack()');
  expect(await track()).toBe('combat');
  await page.locator('.js-pause').click();
  expect(await track()).toBe('pause');
  await page.getByRole('button', { name: /resume/i }).click();
  expect(await track()).toBe('combat');
});

test('keyboard: Space starts the fight, then pauses and resumes it; D opens the deck and Esc closes it', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.getByRole('button', { name: /enter floor 1/i }).click();
  await page.keyboard.press('Space');
  await expect(page.locator('.js-start')).toHaveCount(0);
  // The fight runs once the clock-in card is away.
  await expect(page.locator('.timecard')).toHaveCount(0);
  await page.keyboard.press('Space');
  await expect(page.locator('.modal-back')).toBeVisible();
  expect(await page.evaluate('window.__game.musicTrack()')).toBe('pause');
  await page.keyboard.press('Space');
  await expect(page.locator('.modal-back')).toHaveCount(0);
  expect(await page.evaluate('window.__game.musicTrack()')).toBe('combat');
  await page.keyboard.press('d');
  await expect(page.locator('.modal-back')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.modal-back')).toHaveCount(0);
});

test('pause → main menu keeps the run: Continue restarts the same floor', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await combat(page, 'c.hero.hp -= 10;');
  await page.locator('.js-pause').click();
  await page.getByRole('button', { name: 'Main menu' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('.title-screen')).toBeVisible();
  await page.getByRole('button', { name: /back to work/i }).click();
  await expect(page.locator('.node.current')).toBeVisible();
  const run = (await page.evaluate('({ floor: window.__game.run.current, hp: window.__game.run.hp, max: window.__game.run.maxHp })')) as {
    floor: number;
    hp: number;
    max: number;
  };
  expect(run.floor).toBe(0);
  expect(run.hp).toBe(run.max);
});

test('tapping the backdrop over the pause button closes the pause menu without reopening it', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  const pause = page.locator('.js-pause');
  await pause.click();
  await expect(page.locator('.modal')).toBeVisible();
  const box = (await pause.boundingBox())!;
  // A real tap where the pause button sits (the backdrop covers it).
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);
  await expect(page.locator('.modal')).toHaveCount(0);
});

test('campfire upgrade: tapping selects, the Upgrade button confirms', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  const floor = await page.evaluate(
    '(() => { const g = window.__game; const n = g.run.nodes.find((x) => x.type === "rest"); g.run.current = n.id; g.run.cleared = false; g.goJourney(); return n.floor; })()',
  );
  await page.getByRole('button', { name: new RegExp(`enter floor ${floor}`, 'i') }).click();
  await page.getByRole('button', { name: /training/i }).click();
  const upgrade = page.getByRole('button', { name: 'Upgrade', exact: true });
  await expect(upgrade).toBeDisabled();
  // The grid lists only upgradable cards: the starter's upgraded attack and defense are not in it.
  await expect(page.locator('.deck-grid .card.is-up')).toHaveCount(0);
  await page.locator('.deck-grid .card').first().click();
  await expect(page.locator('.deck-grid .card.sel')).toHaveCount(1);
  // Only the selected card is shown upgraded, and there is no Cancel button.
  await expect(page.locator('.deck-grid .card.is-up')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Cancel' })).toHaveCount(0);
  await expect(page.locator('.modal')).toBeVisible();
  await upgrade.click();
  await expect(page.locator('.node.open').first()).toBeVisible();
  const upgraded = (await page.evaluate('window.__game.run.deck.filter((c) => c.up).length')) as number;
  expect(upgraded).toBe(3); // the starter's upgraded attack and defense, plus the new one
});

/** Turns the run's first fight past the opening into a room of this type (rooms are dealt at random) and returns its floor. */
const roomFloor = (page: Page, type: string): Promise<number> =>
  page.evaluate(
    `(() => { const g = window.__game; const n = g.run.nodes.find((x) => x.type === "fight" && x.floor > 3); n.type = "${type}"; n.enemy = undefined; g.run.current = n.id; g.run.cleared = false; g.goJourney(); return n.floor; })()`,
  ) as Promise<number>;

test('copy room: photocopy costs HP and adds the card, shred removes one', async ({ page }) => {
  await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  const floor = await roomFloor(page, 'copy');
  await page.getByRole('button', { name: new RegExp(`enter floor ${floor}`, 'i') }).click();
  await expect(page.locator('.room-art')).toBeVisible();
  const deck = (): Promise<number> => page.evaluate('window.__game.run.deck.length') as Promise<number>;
  const before = await deck();
  await page.getByRole('button', { name: /photocopy/i }).click();
  await page.locator('.deck-grid .card').first().click();
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await expect(page.locator('.node.open').first()).toBeVisible();
  expect(await deck()).toBe(before + 1);
  // Back in the room (as if revisited): shredding takes one away.
  await page.evaluate('(() => { const g = window.__game; g.run.cleared = false; g.goJourney(); })()');
  await page.getByRole('button', { name: new RegExp(`enter floor ${floor}`, 'i') }).click();
  await page.getByRole('button', { name: /shred/i }).first().click();
  await page.locator('.deck-grid .card').first().click();
  await page.getByRole('button', { name: 'Shred', exact: true }).click();
  await expect(page.locator('.node.open').first()).toBeVisible();
  expect(await deck()).toBe(before);
});

test('tailor: cargo pants add a sleeve slot to the hero sheet and the fight', async ({ page }) => {
  await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  const floor = await roomFloor(page, 'tailor');
  await page.getByRole('button', { name: new RegExp(`enter floor ${floor}`, 'i') }).click();
  await page.getByRole('button', { name: /cargo pants/i }).click();
  await expect(page.locator('.node.open').first()).toBeVisible();
  expect(await page.evaluate('window.__game.run.relics')).toEqual(['cargoPants']);
  await page.locator('.hero-chip').last().click();
  await expect(page.locator('.hero-sheet .stat.sleeve')).toContainText('2');
  await expect(page.locator('.hero-sheet')).toContainText('Cargo Pants');
});

test('debug menus: the fight menu kills the enemy, the map menu opens rooms and rewards and keeps the progress', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await page.locator('.combat .debug-fab').click();
  await page.getByRole('button', { name: 'Restore my HP' }).click();
  // Block 50 for the hero, and the enemy drops the move it was charging.
  await page.locator('.combat .debug-fab').click();
  await page.getByRole('button', { name: 'Give me 50 Block' }).click();
  expect(await combat(page, 'return c.hero.block;')).toBeGreaterThanOrEqual(50);
  await combat(page, 'c.enemy.timer = 2;');
  await page.locator('.combat .debug-fab').click();
  await page.getByRole('button', { name: 'Skip enemy move' }).click();
  expect(await combat(page, 'return c.enemy.timer < 1;')).toBe(true);
  await page.locator('.combat .debug-fab').click();
  await page.getByRole('button', { name: 'Kill enemy' }).click();
  await expect(page.getByRole('button', { name: /^swap$/i })).toBeVisible({ timeout: 8000 });
  await page.locator('.skip-btn').click();
  await expect(page.locator('.node.open').first()).toBeVisible();
  // Rooms from the map menu leave the current room's state alone.
  await page.evaluate('window.__game.run.hp = 30');
  await page.locator('.journey .debug-fab').click();
  await page.getByRole('button', { name: 'Break Room' }).click();
  await expect(page.getByRole('button', { name: /nap/i })).toBeVisible();
  await page.getByRole('button', { name: /nap/i }).click();
  await expect(page.locator('.node.open').first()).toBeVisible({ timeout: 6000 });
  expect(await page.evaluate('window.__game.run.cleared')).toBe(true);
  // Skipping to the next act lands on its map, rested, and can be repeated.
  const map = page.locator('.journey:not(.leaving)');
  for (const act of ['2', '3']) {
    await page.evaluate('window.__game.run.hp = 30');
    await map.locator('.debug-fab').click();
    await page.getByRole('button', { name: 'Skip to next act' }).click();
    await expect(map).toHaveAttribute('data-act', act);
    expect(await page.evaluate('window.__game.run.hp === window.__game.run.maxHp')).toBe(true);
    await page.locator('.act-intro').click();
    await expect(page.locator('.act-intro')).toBeHidden();
    // The boss just fell: no road is lit from it across the new act's map.
    await expect(page.locator('.path .step.lamp')).toHaveCount(0);
  }
  await map.locator('.debug-fab').click();
  await expect(page.getByRole('button', { name: 'Skip to next act' })).toBeHidden();
});

test('coming back from the background while paused keeps the pause → fight music hand-off', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await page.locator('.js-pause').click();
  // The dev server serves source modules: load the music module in the page (a variable keeps tsc out of it).
  await page.evaluate(async (url) => {
    const m = await import(url);
    m.suspendMusic(true);
    m.suspendMusic(false);
  }, '/src/audio/music.ts');
  expect(await page.evaluate('window.__game.musicTrack()')).toBe('pause');
  await page.getByRole('button', { name: /resume/i }).click();
  expect(await page.evaluate('window.__game.musicTrack()')).toBe('combat');
});

test('map: where the road splits, the player picks one of the two lanes and enters it', async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  // The end of the very first run's shared road (floor 3): two lanes ahead.
  await page.evaluate(
    '(() => { const g = window.__game; const n = g.run.nodes.find((x) => x.act === 1 && x.floor === 3); g.run.current = n.id; g.run.path = [0, 1, 2]; g.run.cleared = true; g.goJourney(); })()',
  );
  const enter = page.locator('.journey:not(.leaving)').getByRole('button', { name: /choose your path/i });
  await expect(enter).toBeDisabled();
  await page.locator('.journey:not(.leaving) .node.open .dot').last().click();
  await page
    .locator('.journey:not(.leaving)')
    .getByRole('button', { name: /enter floor 4/i })
    .click();
  const at = (await page.evaluate('({ floor: window.__game.run.nodes[window.__game.run.current].floor, path: window.__game.run.path.length })')) as {
    floor: number;
    path: number;
  };
  expect(at).toEqual({ floor: 4, path: 4 });
  expect(problems).toEqual([]);
});

test('map: holding a node explains it, even one out of reach, without picking it', async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  const boss = page.locator('.node.boss .dot');
  await boss.scrollIntoViewIfNeeded();
  await boss.hover();
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  await expect(page.locator('.modal')).toContainText('Boss');
  await expect(page.locator('.node.boss')).not.toHaveClass(/current/);
  expect(problems).toEqual([]);
});

test('map: rooms far ahead are lost in fog', async ({ page }) => {
  const problems = await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await expect(page.locator('.journey:not(.leaving) .node.fog').first()).toBeVisible();
  expect(problems).toEqual([]);
});

test('closing the pause menu keeps the fight paused while another window is still open', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  // Hold the ability: its info sheet pauses the fight.
  const ability = page.locator('.js-ability');
  await ability.dispatchEvent('pointerdown');
  await page.waitForTimeout(500);
  await ability.dispatchEvent('pointerup');
  await expect(page.locator('.modal .info')).toBeVisible();
  // The app goes to the background: the pause menu opens on top.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.getByRole('button', { name: /resume/i }).click();
  const clock = () => page.evaluate('window.__combat.time');
  const before = await clock();
  await page.waitForTimeout(400);
  expect(await clock()).toBe(before);
});

test('heroes 2 to 4 start locked: padlock, how to unlock, no start', async ({ page }) => {
  const problems = await freshGame(page, { locked: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await expect(page.locator('.hero-slide.locked')).toHaveCount(3);
  await page.locator('.hero-arrow.next').click();
  await expect(page.locator('.hero-select')).toHaveAttribute('data-hero', 'mage');
  await expect(page.locator('.hero-slide.current .hero-unlock')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Locked' })).toBeDisabled();
  // The Locked button and the silhouette do what the padlock does: rattle its chains.
  const lock = page.locator('.hero-slide.current .hero-lock');
  await page.getByRole('button', { name: 'Locked' }).click({ force: true });
  await expect(lock).toHaveClass(/rattle/);
  await expect(lock).not.toHaveClass(/rattle/);
  await page.locator('.hero-slide.current .hero-sprite').click({ position: { x: 10, y: 10 } });
  await expect(lock).toHaveClass(/rattle/);
  expect(problems).toEqual([]);
});

test('skipping a reward adds max HP', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await combat(page, "c.damage('hero', 'enemy', 999, { raw: true }, 'hero');");
  await expect(page.locator('.reward')).toBeVisible({ timeout: 5000 });
  const max = (await page.evaluate('window.__game.run.maxHp')) as number;
  await page.locator('.skip-btn').click();
  await expect(page.locator('.journey')).toBeVisible();
  expect(await page.evaluate('window.__game.run.maxHp')).toBe(max + 3);
});

test('closing the game on the reward screen keeps the same offers for Continue, and taking one clears them', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await combat(page, "c.damage('hero', 'enemy', 999, { raw: true }, 'hero');");
  await expect(page.locator('.reward')).toBeVisible({ timeout: 5000 });
  const offers = (): Promise<unknown> => page.evaluate('JSON.stringify(window.__game.run.reward)');
  const before = await offers();
  expect(before).toBeDefined();
  await page.reload();
  await page.getByRole('button', { name: /back to work/i }).click();
  await expect(page.locator('.reward')).toBeVisible();
  expect(await offers()).toBe(before);
  await page.locator('.skip-btn').click();
  await expect(page.locator('.journey')).toBeVisible();
  expect(await offers()).toBeUndefined();
});

test('debug menus are off by default, the switch appears after 5 taps on the version, and shows them at once', async ({ page }) => {
  await freshGame(page, { debug: false });
  await expect(page.locator('.debug-fab')).toBeHidden();
  await page.getByRole('button', { name: /settings/i }).click();
  const sw = page.getByRole('switch', { name: 'Debug menus' });
  await expect(sw).toBeHidden();
  for (let i = 0; i < 4; i++) await page.locator('.version').click();
  await expect(sw).toBeHidden();
  await page.locator('.version').click();
  await expect(sw).toBeVisible();
  await page.getByRole('switch', { name: 'Debug menus' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('.debug-fab')).toBeVisible();
});

test('calling in sick needs a long press on the confirm button', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await page.locator('.js-pause').click();
  await page.getByRole('button', { name: 'Call in sick' }).click();
  const confirm = page.getByRole('button', { name: 'Hold to confirm' });
  await confirm.click();
  await expect(page.locator('.combat')).toBeVisible();
  const box = (await confirm.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.up();
  await expect(page.locator('.combat')).toBeVisible();
  await page.mouse.down();
  await expect(page.locator('.combat')).toBeHidden();
});

test('debug button: pick a hero and an enemy, the fight starts against it', async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /debug/i }).click();
  await page.locator('.debug-fight .seg button').nth(1).click();
  await page.locator('.debug-tabs button').last().click();
  const foe = page.locator('.debug-foe').last();
  const enemy = await foe.getAttribute('data-enemy');
  await foe.click();
  await expect(page.locator('.combat')).toBeVisible();
  const picked = await page.evaluate('({ hero: window.__game.run.hero, enemy: window.__combat.enemy.def.id })');
  expect(picked).toEqual({ hero: 'mage', enemy });
  expect(problems).toEqual([]);
});

test("the Boss's Son's weak spot: a touch on the target makes your next attack critical", async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /debug/i }).click();
  await page.locator('.debug-tabs button').last().click();
  await page.locator('.debug-foe[data-enemy="bossSon"]').click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  const spot = page.locator('.weak-spot.on');
  await expect(spot).toBeVisible({ timeout: 15000 });
  const box = (await spot.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(spot).toBeHidden();
  expect(await combat(page, "return c.has('hero', 'crit');")).toBe(true);
  expect(problems).toEqual([]);
});

test('Mr. Roboto: dragging it over the belt knocks the other cards off and grows it, letting go plays it on the spot', async ({ page }) => {
  const problems = await freshGame(page);
  await startFight(page);
  const uid = (await combat(
    page,
    "c.hero.mana = c.hero.maxMana = 10; c.addTempCard('mrRoboto', 'belt'); return c.belt[c.belt.length - 1].card.uid;",
  )) as number;
  // The first time it rides in, a coach mark explains it.
  await page.getByRole('button', { name: 'Got it!' }).click();
  const card = page.locator(`.belt-cards .card[data-uid="${uid}"]`);
  await expect(card).toBeVisible();
  const box = (await card.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  // Press this very card (another one may ride over it), then drag it over the other cards with the mouse.
  await card.dispatchEvent('pointerdown', { pointerId: 1, clientX: x, clientY: y });
  await page.mouse.move(x, y);
  const others = page.locator(`.belt-cards .card:not(.fall-out):not([data-uid="${uid}"])`);
  const before = await others.count();
  expect(before).toBeGreaterThan(0);
  for (let i = 0; i < 3; i++) {
    const b = await others.first().boundingBox();
    if (!b) break;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
  }
  expect(((await combat(page, `return c.belt.find((b) => b.card.uid === ${uid})?.card.bonus ?? 0;`)) as number) > 0).toBe(true);
  expect(await others.count()).toBeLessThan(before);
  const hp = (await combat(page, 'return c.enemy.hp;')) as number;
  await page.mouse.move(x, y, { steps: 6 });
  await page.locator('.combat').dispatchEvent('pointerup', { pointerId: 1, clientX: x, clientY: y });
  await expect.poll(() => combat(page, 'return c.enemy.hp;')).toBeLessThan(hp - 3);
  expect(problems).toEqual([]);
});

test("the Sick Coworker's virus shows on the cards it infects and goes away when they are played", async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /debug/i }).click();
  await page.locator('.debug-tabs button').last().click();
  await page.locator('.debug-foe[data-enemy="sickCoworker"]').click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  await combat(page, 'c.infectCards(1);');
  await expect(page.locator('.belt-cards .card.sick')).toHaveCount(1);
  // It spreads along the belt by itself.
  await expect(async () => expect(await page.locator('.belt-cards .card.sick').count()).toBeGreaterThan(1)).toPass({ timeout: 12000 });
  await page.waitForTimeout(800);
  const uid = (await combat(
    page,
    'c.hero.mana = c.hero.maxMana = 10; const b = c.belt.find((x) => x.card.virus); c.playCard(b.card.uid); return b.card.uid;',
  )) as number;
  expect(await combat(page, `return c.discard.concat(c.exhaust).find((x) => x.uid === ${uid})?.virus ?? null;`)).toBeNull();
  expect(problems).toEqual([]);
});

test("the Night Janitor's rust spots slow the belt, and only dragging the mop over a spot scrubs it off", async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /debug/i }).click();
  await page.locator('.debug-tabs button').last().click();
  await page.locator('.debug-foe[data-enemy="nightJanitor"]').click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  await combat(page, 'c.rustSpots.push({ id: 100, x: 0.5, y: 0.5, grime: 1 }, { id: 101, x: 0.15, y: 0.5, grime: 1 });');
  await expect(page.locator('.belt-rust i')).toHaveCount(2);
  const mop = page.locator('.mop.on');
  await expect(mop).toBeVisible();
  await expect(mop).not.toHaveClass(/alarm/);
  // Three quarters of the rust it takes to stop the belt: the mop shakes and blinks.
  await combat(page, 'for (let i = 0; i < 15; i++) c.rustSpots.push({ id: 200 + i, x: 0.5, y: 0.5, grime: 1 });');
  await expect(mop).toHaveClass(/alarm/);
  await combat(page, 'c.rustSpots.splice(2);');
  await expect(mop).not.toHaveClass(/alarm/);
  // The stage settles after the fight's intro: measure once it has.
  await page.waitForTimeout(1500);
  const m = (await mop.boundingBox())!;
  const spot = (await page.locator('.belt-rust i[data-id="100"]').boundingBox())!;
  const x = spot.x + spot.width / 2;
  const y = spot.y + spot.height / 2;
  await mop.dispatchEvent('pointerdown', { pointerId: 1, clientX: m.x + m.width * 0.3, clientY: m.y + m.height * 0.85 });
  // The mop's head follows the finger.
  await page.mouse.move(x, y, { steps: 10 });
  const head = (await mop.boundingBox())!;
  expect(Math.abs(head.x + head.width * 0.3 - x)).toBeLessThan(2);
  expect(Math.abs(head.y + head.height * 0.85 - y)).toBeLessThan(2);
  // Another finger can play a card meanwhile without dropping the mop.
  const cardUid = (await combat(page, 'c.hero.mana = c.hero.maxMana = 10; return c.belt[0].card.uid;')) as number;
  await page.locator(`.belt-cards .card[data-uid="${cardUid}"]`).dispatchEvent('pointerdown', { pointerId: 2, clientX: 5, clientY: 5 });
  await page.locator('.combat').dispatchEvent('pointerup', { pointerId: 2, clientX: 5, clientY: 5 });
  await expect(page.locator('.mop.dragging')).toHaveCount(1);
  // Scrubbing back and forth over the spot takes it off; the other one, never touched, stays.
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(x - 12, y, { steps: 4 });
    await page.mouse.move(x + 12, y, { steps: 4 });
  }
  await page.locator('.combat').dispatchEvent('pointerup', { pointerId: 1 });
  expect(await combat(page, 'return c.rustSpots.map((s) => s.id).filter((id) => id >= 100);')).toEqual([101]);
  expect(problems).toEqual([]);
});

test("the Nerd's update window covers the belt: Postpone sends it away for a few seconds, Update runs a progress bar and then patches him", async ({
  page,
}) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /debug/i }).click();
  await page.locator('.debug-tabs button').last().click();
  await page.locator('.debug-foe[data-enemy="theNerd"]').click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  // Nobody tells you about it: no status chip, and no trait line before the fight.
  await expect(page.locator('.foe-traits')).toHaveCount(0);
  const popup = page.locator('.update-popup.on');
  await expect(popup).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.js-estatus .status', { hasText: /update/i })).toHaveCount(0);
  expect(await page.locator('.js-estatus .status').count()).toBe(
    await combat(page, "return Object.keys(c.enemy.statuses).filter((id) => id !== 'updateNeeded').length;"),
  );
  // It covers the belt, but for a margin that leaves its edges (and the running stream) in view.
  const belt = (await page.locator('.belt').boundingBox())!;
  const win = (await popup.boundingBox())!;
  expect(win.width).toBeGreaterThanOrEqual(belt.width - 17);
  expect(win.height).toBeGreaterThanOrEqual(belt.height - 11);
  // The buttons wake up a moment after the window shows.
  await expect(page.locator('.js-postpone')).toBeEnabled();
  await page.locator('.js-postpone').tap();
  await expect(popup).toBeHidden();
  // It's back within a few seconds; this time, update.
  await expect(popup).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.js-update')).toBeEnabled();
  await page.locator('.js-update').tap();
  await expect(page.locator('.update-popup.installing')).toBeVisible();
  await expect(page.locator('.up-pct')).toHaveText(/^\d+%$/);
  // Past 90% the decimals show.
  await combat(page, 'c.popup.t = 6.5;');
  await expect(page.locator('.up-pct')).toHaveText(/^\d+\.\d{2}%$/);
  await combat(page, 'c.popup.t = 11.95;');
  await expect(popup).toBeHidden();
  expect(await combat(page, 'return c.enemy.statuses.strength?.v ?? 0;')).toBeGreaterThanOrEqual(1);
  expect(problems).toEqual([]);
});

test("the Boss's coffee: a chore window covers the belt and the sleeve; pay, key in the code, prepare, and the move is off", async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /debug/i }).click();
  await page.locator('.debug-tabs button').last().click();
  await page.locator('.debug-foe[data-enemy="slavesCeo"]').click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  await expect.poll(() => combat(page, 'return c.intro <= 0;')).toBe(true);
  // Hurry the boss to its coffee move.
  await combat(page, 'while (!c.enemy.move.task) c.skipEnemyMove();');
  const win = page.locator('.task-window.on');
  await expect(win).toBeVisible();
  // (it stamps in: measure once it has settled)
  await page.waitForTimeout(400);
  // It covers the belt and the sleeve; the enemy's move bar and the ability stay in view (the ability above the window).
  const box = (await win.boundingBox())!;
  for (const sel of ['.belt', '.js-sleeve']) {
    const b = (await page.locator(sel).boundingBox())!;
    expect(b.y).toBeGreaterThanOrEqual(box.y - 1);
    expect(b.y + b.height).toBeLessThanOrEqual(box.y + box.height + 1);
  }
  const threat = (await page.locator('.threat').boundingBox())!;
  expect(threat.y + threat.height).toBeLessThanOrEqual(box.y + 1);
  const ability = (await page.locator('.js-ability').boundingBox())!;
  expect(
    await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('.js-ability') !== null,
      [ability.x + ability.width / 2, ability.y + ability.height / 2],
    ),
  ).toBe(true);
  // The Boss's note says what he wants.
  await expect(page.locator('.tk-drink')).not.toBeEmpty();
  // Step 1: coins. One goes in by a drag, the rest by taps.
  const nextCoin = (): Promise<number | null> =>
    combat(page, "const t = c.chore; return t.phase === 'coins' ? (t.coins.find((x) => !x.used && t.fits(x))?.id ?? null) : null;") as Promise<
      number | null
    >;
  const first = (await nextCoin())!;
  const coin = (await page.locator('.tk-coin').nth(first).boundingBox())!;
  const slot = (await page.locator('.tk-slot').boundingBox())!;
  await page.mouse.move(coin.x + coin.width / 2, coin.y + coin.height / 2);
  await page.mouse.down();
  await page.mouse.move(slot.x + slot.width / 2, slot.y + slot.height / 2, { steps: 6 });
  await page.mouse.up();
  expect(await combat(page, 'return c.chore.paid > 0;')).toBe(true);
  for (let id = await nextCoin(); id !== null; id = await nextCoin()) await page.locator('.tk-coin').nth(id).tap();
  // Step 2: the code. A wrong key costs seconds off the countdown.
  await expect(page.locator('.tk-pad')).toBeVisible();
  const code = (await combat(page, 'return c.chore.code;')) as number[];
  const wrong = (code[0] % 9) + 1;
  const timer = (await combat(page, 'return c.enemy.timer;')) as number;
  await page
    .locator('.tk-key')
    .nth(wrong - 1)
    .tap();
  expect(await combat(page, 'return c.chore.errors;')).toBe(1);
  // The window shakes and flashes but never goes away (no opacity dip).
  await page.waitForTimeout(80);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.task-window')!).opacity)).toBe('1');
  expect(((await combat(page, 'return c.enemy.timer;')) as number) - timer).toBeGreaterThan(1.5);
  for (const n of code)
    await page
      .locator('.tk-key')
      .nth(n - 1)
      .tap();
  // Step 3: the cup goes under the spout by a drag, the fork bounces, the spoon by a tap.
  await expect(page.locator('.tk-item[data-item="cup"]')).toBeVisible();
  const errors = (await combat(page, 'return c.chore.errors;')) as number;
  await page.locator('.tk-item[data-item="fork"]').tap();
  expect(await combat(page, 'return c.chore.errors;')).toBe(errors + 1);
  const cupBox = (await page.locator('.tk-item[data-item="cup"]').boundingBox())!;
  const spotBox = (await page.locator('.tk-spot').boundingBox())!;
  await page.mouse.move(cupBox.x + cupBox.width / 2, cupBox.y + cupBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(spotBox.x + spotBox.width / 2, spotBox.y + spotBox.height / 2, { steps: 6 });
  await page.mouse.up();
  await page.locator('.tk-item[data-item="spoon"]').tap();
  // Step 4: the sugar, start.
  await expect(page.locator('.tk-dial')).toBeVisible();
  const sugar = (await combat(page, 'return c.chore.sugar;')) as number;
  for (let i = 0; i < sugar; i++) await page.locator('.tk-step-btn').last().tap();
  await page.locator('.tk-start').tap();
  await expect(page.locator('.tk-brew')).toBeVisible();
  // The pour takes a while; the served cup is celebrated, then the window leaves and the move with it.
  await expect(page.locator('.task-window.served')).toBeVisible({ timeout: 10000 });
  await expect(win).toBeHidden({ timeout: 12000 });
  expect(await combat(page, "return c.has('enemy', 'stun');")).toBe(true);
  expect(await combat(page, 'return c.hero.hp === c.hero.maxHp;')).toBe(true);
  expect(problems).toEqual([]);
});

test('the Board: a head lost at each third of its HP changes the belt, and the audit is a shell game with covered cards', async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /debug/i }).click();
  await page.locator('.debug-tabs button').last().click();
  await page.locator('.debug-foe[data-enemy="theBoard"]').click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  await expect.poll(() => combat(page, 'return c.intro <= 0;')).toBe(true);
  const rows = (): Promise<string> => page.locator('.belt').evaluate((el) => (el as HTMLElement).style.getPropertyValue('--rows'));
  // Phase 1: three rows. A third of its HP later it loses a head, and the belt is back to two rows.
  expect(await rows()).toBe('3');
  const face = (): Promise<string> => page.locator('.enemy-art .riso').evaluate((el) => el.outerHTML);
  const first = await face();
  await combat(page, "c.enemy.block = 0; c.damage('hero', 'enemy', c.enemy.hp - 200, { raw: true }, 'hero');");
  await expect.poll(rows).toBe('2');
  expect(await face()).not.toBe(first);
  // Phase 3: the audit covers the belt with three covered cards; the right one ends it.
  await combat(page, "c.damage('hero', 'enemy', c.enemy.hp - 100, { raw: true }, 'hero');");
  await combat(page, 'while (!c.enemy.move.task) c.skipEnemyMove();');
  const win = page.locator('.shell-window.on');
  await expect(win).toBeVisible();
  await expect(page.locator('.sh-card')).toHaveCount(3);
  await expect.poll(() => combat(page, "return c.chore.phase === 'pick';"), { timeout: 15000 }).toBe(true);
  const prize = (await combat(page, 'return c.chore.prize;')) as number;
  await page
    .locator('.sh-card')
    .nth((prize + 1) % 3)
    .tap();
  await expect(page.locator('.shell-window.jolt, .shell-window.on')).toBeVisible();
  expect(await combat(page, 'return c.chore.errors;')).toBe(1);
  await expect.poll(() => combat(page, "return c.chore.phase === 'pick';"), { timeout: 15000 }).toBe(true);
  const right = (await combat(page, 'return c.chore.prize;')) as number;
  await page.locator('.sh-card').nth(right).tap();
  await expect(page.locator('.shell-window.served')).toBeVisible();
  await expect(win).toBeHidden({ timeout: 12000 });
  expect(await combat(page, "return c.has('enemy', 'stun');")).toBe(true);
  expect(problems).toEqual([]);
});

test('after the first run the home points at the handbook, once', async ({ page }) => {
  const problems = await freshGame(page);
  const hint = page.locator('.handbook-hint');
  await expect(hint).toBeHidden();
  await page.evaluate(() => {
    const meta = JSON.parse(localStorage.getItem('cardstone+:meta') ?? '{}');
    meta.history = [
      {
        hero: 'warrior',
        result: 'lose',
        act: 1,
        floor: 2,
        kills: 1,
        cards: 5,
        pay: 10,
        elites: 0,
        damageTaken: 9,
        memos: 0,
        deck: [{ id: 'punch', up: false }],
        relics: [],
        time: 30,
        begged: false,
        at: Date.now(),
      },
    ];
    localStorage.setItem('cardstone+:meta', JSON.stringify(meta));
  });
  await page.reload();
  await expect(hint).toBeVisible();
  await page
    .locator('.menu')
    .getByRole('button', { name: /handbook/i })
    .click();
  await page.reload();
  await expect(hint).toBeHidden();
  expect(problems).toEqual([]);
});

test('handbook history: tapping a run opens its payslip, stationery and deck', async ({ page }) => {
  const problems = await freshGame(page);
  await page.evaluate(() => {
    const meta = JSON.parse(localStorage.getItem('cardstone+:meta') ?? '{}');
    const deck = [...Array(3).fill({ id: 'punch', up: false }), { id: 'bobTheBuilder', up: true }];
    meta.history = [
      {
        hero: 'warrior',
        result: 'win',
        act: 2,
        floor: 9,
        kills: 7,
        cards: 80,
        pay: 300,
        elites: 1,
        damageTaken: 40,
        memos: 0,
        deck,
        relics: ['stressBall'],
        time: 300,
        begged: false,
        at: Date.now(),
      },
    ];
    localStorage.setItem('cardstone+:meta', JSON.stringify(meta));
  });
  await page.reload();
  await page
    .locator('.menu')
    .getByRole('button', { name: /handbook/i })
    .click();
  await page.getByRole('tab', { name: /history/i }).click();
  await page.locator('.run-log').first().click();
  await expect(page.locator('.run-detail .payslip')).toBeVisible();
  await expect(page.locator('.run-detail .act-btn')).toBeVisible();
  await expect(page.locator('.run-detail .hero-feature')).toHaveCount(1);
  await expect(page.locator('.run-detail .deck-grid .card')).toHaveCount(2);
  expect(problems).toEqual([]);
});

test('debug: Unlock all hires every hero and reveals every card and enemy in the handbook', async ({ page }) => {
  await freshGame(page, { locked: true });
  await page.getByRole('button', { name: /debug/i }).click();
  await page.getByRole('button', { name: /unlock all/i }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page
    .locator('.menu')
    .getByRole('button', { name: /handbook/i })
    .click();
  await expect(page.locator('.card.undiscovered')).toHaveCount(0);
  await page.getByRole('tab', { name: /personnel/i }).click();
  await expect(page.locator('.foe h3', { hasText: '????' })).toHaveCount(0);
  await page.getByRole('button', { name: /back/i }).click();
  await expect(page.locator('.timecard-cta')).toHaveCount(1);
  await page.getByRole('button', { name: /new run/i }).click();
  await expect(page.locator('.hero-dot.locked')).toHaveCount(0);
});

test('handbook: the ? button explains how to read a card', async ({ page }) => {
  await freshGame(page);
  await page
    .locator('.menu')
    .getByRole('button', { name: /handbook/i })
    .click();
  await page.getByRole('button', { name: /how to read a card/i }).click();
  await expect(page.locator('.anatomy .spot')).toHaveCount(6);
});

test('after the Act 1 boss the map turns to Act 2', async ({ page }) => {
  const problems = await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.evaluate(
    '(() => { const g = window.__game; const boss = g.run.nodes.find((n) => n.type === "boss" && n.act === 1); g.run.current = boss.id; g.run.path.push(boss.id); g.run.cleared = true; g.goJourney(); })()',
  );
  await expect(page.locator('.journey:not(.leaving) .act-banner .h1')).toHaveText(/act 2/i);
  await expect(page.locator('.journey:not(.leaving) .node.open')).toHaveCount(1);
  await page
    .locator('.journey:not(.leaving)')
    .getByRole('button', { name: /enter floor 1/i })
    .click();
  await expect(page.locator('.combat')).toBeVisible();
  expect(await page.evaluate('window.__combat.enemy.def.act')).toBe(2);
  expect(problems).toEqual([]);
});

test('after the Act 2 boss the map turns to Act 3, the night shift, and its clock runs past midnight', async ({ page }) => {
  const problems = await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.evaluate(
    '(() => { const g = window.__game; const boss = g.run.nodes.find((n) => n.type === "boss" && n.act === 2); g.run.current = boss.id; g.run.path.push(boss.id); g.run.cleared = true; g.goJourney(); })()',
  );
  await expect(page.locator('.journey:not(.leaving) .act-banner .h1')).toHaveText(/act 3/i);
  await expect(page.locator('.journey:not(.leaving) .act-banner .sub')).toHaveText(/night shift/i);
  await page
    .locator('.journey:not(.leaving)')
    .getByRole('button', { name: /enter floor 1/i })
    .click();
  await expect(page.locator('.combat')).toBeVisible();
  expect(await page.evaluate('window.__combat.enemy.def.act')).toBe(3);
  expect(problems).toEqual([]);
});

test('tapping the hero portrait in a fight shows the deck in play and pauses', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await page.locator('.hero-portrait').click();
  // The warrior's 20-card deck, identical copies grouped (the upgraded Punch and Hard Hat and the Innate Coffee stand apart).
  await expect(page.locator('.modal h2')).toContainText('20');
  await expect(page.locator('.modal .deck-grid .card')).toHaveCount(9);
  const clock = () => page.evaluate('window.__combat.time');
  const before = await clock();
  await page.waitForTimeout(300);
  expect(await clock()).toBe(before);
});

test('once signed, the contract is never shown again: the game opens on the title', async ({ page }) => {
  await freshGame(page);
  await page.reload();
  await expect(page.locator('.title-screen')).toBeVisible();
  await expect(page.locator('.splash')).toHaveCount(0);
});

test('signing the contract leads to the studio card, then to the title', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('cardstone+:settings', JSON.stringify({ localeChosen: true }));
  });
  await page.reload();
  await signAndStart(page);
  await expect(page.locator('.studio')).toBeVisible();
  await expect(page.locator('.title-screen')).toBeVisible({ timeout: 5000 });
});

test('reset progress wipes saves after a confirmation', async ({ page }) => {
  await freshGame(page);
  page.on('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /debug/i }).click();
  await page.getByRole('button', { name: /reset progress/i }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  // Everything is gone, the language too: the first launch starts over.
  await expect(page.locator('.language')).toBeVisible();
  expect(await page.evaluate("Object.keys(localStorage).filter((k) => k.startsWith('cardstone+:')).length")).toBe(0);
});

test('tapping the version in Settings, or pressing it shorter than the hold, does nothing', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: /settings/i }).click();
  const version = page.locator('.modal .version');
  await version.tap();
  await version.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(600);
  await expect(page.locator('.modal')).toHaveCount(1);
  await expect(page.getByText(/erase everything/i)).toBeHidden();
});

test('the version shows in Settings from the home screen only', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: /settings/i }).click();
  await expect(page.locator('.modal .version')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  // The map's settings (the run is on the journey once the hero is picked) and the pause menu's have none.
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.getByRole('button', { name: /settings/i }).click();
  await expect(page.locator('.modal .setting').first()).toBeVisible();
  await expect(page.locator('.modal .version')).toHaveCount(0);
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: /enter floor 1/i }).click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  await page.locator('.js-pause').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Settings' }).click();
  await expect(page.locator('.modal .setting').first()).toBeVisible();
  await expect(page.locator('.modal .version')).toHaveCount(0);
});

test('holding the version in Settings opens the reset confirmation', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: /settings/i }).click();
  await page.locator('.modal .version').hover();
  await page.mouse.down();
  await page.waitForTimeout(1200);
  await page.mouse.up();
  await expect(page.getByText(/erase everything/i)).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('.language')).toBeVisible();
});

test('handbook: enemies not met yet are silhouettes with no move pattern', async ({ page }) => {
  await freshGame(page);
  await page
    .locator('.menu')
    .getByRole('button', { name: /handbook/i })
    .click();
  await page.getByRole('tab', { name: /personnel/i }).click();
  await expect(page.locator('.foe.undiscovered').first()).toBeVisible();
  await expect(page.locator('.foe.undiscovered .move, .foe.undiscovered [data-status]')).toHaveCount(0);
});

test('handbook: pressing a status in a move pattern explains it', async ({ page }) => {
  await freshGame(page, { met: ENEMY_LIST.map((e) => e.id) });
  await page
    .locator('.menu')
    .getByRole('button', { name: /handbook/i })
    .click();
  await page.getByRole('tab', { name: /personnel/i }).click();
  await page.locator('.foe [data-status]').first().click();
  await expect(page.locator('.modal .info')).toBeVisible();
});

test('the very first fight opens on a tour of the board, one step at a time, before Clock in', async ({ page }) => {
  const problems = await freshGame(page, { tutorial: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.getByRole('button', { name: /enter floor 1/i }).click();
  await expect(page.locator('.coach-count')).toHaveText('1/5');
  for (let i = 0; i < 4; i++) await page.locator('.coach .btn').click();
  await page.getByRole('button', { name: 'Got it!' }).click();
  await expect(page.locator('.coach')).toHaveCount(0);
  await expect(page.locator('.js-start')).toBeVisible();
  expect(await page.evaluate("JSON.parse(localStorage.getItem('cardstone+:settings')).seenTutorial")).toBe(true);
  expect(problems).toEqual([]);
});

test('the first Kamikaze on the belt stops the fight to say where it is safe', async ({ page }) => {
  const problems = await freshGame(page);
  await startFight(page);
  await combat(page, "c.addTempCard('kamikaze', 'belt');");
  await expect(page.locator('.coach')).toBeVisible();
  const clock = () => page.evaluate('window.__combat.time');
  const before = await clock();
  await page.waitForTimeout(300);
  expect(await clock()).toBe(before);
  await page.getByRole('button', { name: 'Got it!' }).click();
  await expect(page.locator('.coach')).toHaveCount(0);
  expect(await page.evaluate("JSON.parse(localStorage.getItem('cardstone+:settings')).seenTips")).toEqual(['kamikaze']);
  expect(problems).toEqual([]);
});

test('releasing the hold that opened a card does not press Close underneath', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: 'Handbook' }).click();
  const card = page.locator('.comp-grid .card').first();
  await card.hover();
  await page.mouse.down();
  await expect(page.locator('.modal')).toBeVisible();
  // Phones send the release's click where the finger lifts: on the modal's button, without a press of its own there.
  await page.getByRole('button', { name: 'Close' }).dispatchEvent('click', { detail: 1 });
  await expect(page.locator('.modal')).toBeVisible();
  await page.mouse.up();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('.modal')).toHaveCount(0);
});

test('a full mana bar blinks only once the fight has started', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.getByRole('button', { name: /enter floor 1/i }).click();
  await combat(page, 'c.hero.mana = c.hero.maxMana;');
  await page.waitForTimeout(200);
  await expect(page.locator('.mana-row')).not.toHaveClass(/full/);
  await page.locator('.js-start').click();
  await combat(page, 'c.hero.mana = c.hero.maxMana;');
  await expect(page.locator('.mana-row')).toHaveClass(/full/);
});

test('lost and found: three relics, keeping one', async ({ page }) => {
  await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  const floor = await roomFloor(page, 'lostFound');
  await page.getByRole('button', { name: new RegExp(`enter floor ${floor}`, 'i') }).click();
  await expect(page.locator('.relic-row .relic-card')).toHaveCount(3);
  await page.locator('.relic-row .relic-card').nth(1).click();
  await expect(page.locator('.node.open').first()).toBeVisible();
  expect(await page.evaluate('window.__game.run.relics.length')).toBe(1);
});

test('cross-training: four cards of the hired classes (not the Rogue yet), taking one', async ({ page }) => {
  await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  const floor = await roomFloor(page, 'crossTraining');
  await page.getByRole('button', { name: new RegExp(`enter floor ${floor}`, 'i') }).click();
  await expect(page.locator('.cross-offer .card')).toHaveCount(4);
  const take = page.getByRole('button', { name: /take it/i });
  await expect(take).toBeDisabled();
  const deck = (await page.evaluate('window.__game.run.deck.length')) as number;
  await page.locator('.cross-offer .card').nth(2).click();
  await take.click();
  await expect(page.locator('.node.open').first()).toBeVisible();
  expect(await page.evaluate('window.__game.run.deck.length')).toBe(deck + 1);
});

test('vending machine: a card drops into the deck and costs HP', async ({ page }) => {
  await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  const floor = await roomFloor(page, 'vending');
  await page.getByRole('button', { name: new RegExp(`enter floor ${floor}`, 'i') }).click();
  const deck = (await page.evaluate('window.__game.run.deck.length')) as number;
  await page.getByRole('button', { name: /snack/i }).click();
  await expect(page.locator('.node.open').first()).toBeVisible();
  expect(await page.evaluate('window.__game.run.deck.length')).toBe(deck + 1);
  expect(await page.evaluate('window.__game.run.hp < window.__game.run.maxHp')).toBe(true);
});

test('Power Socket: the belt goes dead and a crank knob turns it, both rows', async ({ page }) => {
  await freshGame(page, { veteran: true });
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.evaluate('(() => { const g = window.__game; g.run.nodes[g.run.current].enemy = "powerSocket"; })()');
  await page.getByRole('button', { name: /enter floor 1/i }).click();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  await expect.poll(() => combat(page, 'return c.intro <= 0')).toBe(true);
  await expect(page.locator('.crank')).toBeHidden();
  // Fast-forward past the blackout, long enough for both rows to carry cards.
  await combat(page, 'for (let i = 0; i < 60 * 14; i++) c.tick(1 / 60);');
  await expect(page.locator('.crank')).toBeVisible();
  await expect(page.locator('.speech')).toBeVisible();
  expect(await combat(page, 'return new Set(c.belt.map((b) => b.row)).size')).toBe(2);
  // The newest card of each row (free to move), followed by uid.
  const uids = (await combat(
    page,
    'return [0, 1].map((r) => c.belt.filter((b) => b.row === r).sort((a, b) => a.pos - b.pos)[0].card.uid)',
  )) as number[];
  const left = (i: number): Promise<number> =>
    page.evaluate((u) => document.querySelector(`.belt-cards .card[data-uid="${u}"]`)?.getBoundingClientRect().left ?? NaN, uids[i]);
  await page.waitForTimeout(500);
  const before = [await left(0), await left(1)];
  const beltW = (await page.locator('.belt-cards').boundingBox())!.width;
  const knob = (await page.locator('.crank').boundingBox())!;
  const cx = knob.x + knob.width / 2;
  const cy = knob.y + knob.height / 2;
  const radius = knob.width * 0.4;
  // One full clockwise turn (screen y points down, so a growing angle is clockwise).
  const at = (deg: number): [number, number] => [cx + radius * Math.cos((deg * Math.PI) / 180), cy + radius * Math.sin((deg * Math.PI) / 180)];
  await page.mouse.move(...at(-90));
  await page.mouse.down();
  for (let d = -90; d <= 270; d += 15) await page.mouse.move(...at(d));
  await page.waitForTimeout(150);
  const cranked = (await combat(page, 'return c.beltCranked')) as number;
  expect(cranked).toBeCloseTo(0.1, 2);
  const way = (await page.locator('.belt.ltr').count()) ? 1 : -1;
  const during = [await left(0), await left(1)];
  for (const i of [0, 1]) expect(Math.abs(during[i] - before[i] - way * cranked * beltW)).toBeLessThan(1.5);
  // Turning back does nothing: the crank only goes one way.
  for (let d = 270; d >= 90; d -= 15) await page.mouse.move(...at(d));
  await page.mouse.up();
  expect((await combat(page, 'return c.beltCranked')) as number).toBeCloseTo(cranked, 5);
});

test('an elite reward adds a card to the deck instead of swapping one', async ({ page }) => {
  await freshGame(page);
  await page.getByRole('button', { name: /new run/i }).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await expect(page.locator('.node.current')).toBeVisible();
  const size = (await page.evaluate('window.__game.run.deck.length')) as number;
  await page.locator('.journey .debug-fab').click();
  await page.getByRole('button', { name: 'Elite card reward' }).click();
  const add = page.getByRole('button', { name: 'Add', exact: true });
  await expect(add).toBeDisabled();
  await page.locator('.swap-offer .card').first().click();
  await expect(add).toBeEnabled();
  await add.click();
  await expect(page.locator('.journey')).toBeVisible({ timeout: 6000 });
  expect(await page.evaluate('window.__game.run.deck.length')).toBe(size + 1);
});

test('losing the first fight offers to beg to stay, once, and the fight goes on', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await combat(page, "c.damage('enemy', 'hero', 999, { raw: true }, 'enemy');");
  const offer = page.locator('.modal', { hasText: /beg to stay/i });
  await expect(offer).toBeVisible();
  await offer.getByRole('button', { name: 'Beg', exact: true }).click();
  await expect(offer).toBeHidden();
  expect(await page.evaluate('window.__combat.hero.hp === window.__combat.hero.maxHp')).toBe(true);
  expect(await page.evaluate('window.__combat.result')).toBeNull();
  // The second time is final.
  await combat(page, "delete c.hero.statuses.dodge; c.damage('enemy', 'hero', 9999, { raw: true, ignoreBlock: true }, 'enemy');");
  await expect(page.locator('.end')).toBeVisible({ timeout: 8000 });
});

test('a stun covers the belt with one veil, not a badge on every card', async ({ page }) => {
  await freshGame(page);
  await startFight(page);
  await combat(page, "c.applyStatus('hero', 'stun', 1, 6);");
  await expect(page.locator('.belt-stun.on')).toBeVisible();
  await expect(page.locator('.belt-cards .rule-badge')).toHaveCount(0);
  await combat(page, 'delete c.hero.statuses.stun;');
  await expect(page.locator('.belt-stun.on')).toHaveCount(0);
});

test('the Rogue, once hired, has a sleeve of three that fits on the screen, and a fall makes a card in it cheaper', async ({ page }) => {
  const problems = await freshGame(page, { heroes: ['rogue'] });
  await page.getByRole('button', { name: /new run/i }).click();
  await expect(page.locator('.hero-slide')).toHaveCount(4);
  await page.locator('.hero-dot').nth(3).click();
  await page.getByRole('button', { name: /start shift/i }).click();
  await page.getByRole('button', { name: /enter floor 1/i }).click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __combat: { intro: number } }).__combat.intro <= 0)).toBe(true);
  await expect(page.locator('.sleeve-slot')).toHaveCount(3);
  const cost = (await combat(
    page,
    "c.discard.push({ uid: 900, id: 'borrowedStapler', up: false, bonus: 0, temp: false }); c.retrieve(1, 'sleeve'); const card = c.sleeve.find((x) => x); c.dropBelt(); return card.disc ?? 0;",
  )) as number;
  expect(cost).toBeGreaterThan(0);
  // The three slots fit in the room left of the ability button.
  const fits = await page.evaluate(() => {
    const room = document.querySelector('.sleeve')!.getBoundingClientRect();
    return [...document.querySelectorAll('.sleeve-slot')].every((s) => {
      const r = s.getBoundingClientRect();
      return r.left >= room.left - 0.5 && r.right <= room.right + 0.5;
    });
  });
  expect(fits).toBe(true);
  // A fourth slot (Lost & Found Box) joins them.
  await combat(page, 'c.addSleeveSlot();');
  await expect(page.locator('.sleeve-slot')).toHaveCount(4);
  expect(problems).toEqual([]);
});

test('after two runs the home asks for stars, then a review window sends it', async ({ page }) => {
  const problems = await freshGame(page, { veteran: true });
  await expect(page.locator('.rate-banner')).toBeHidden();
  await page.evaluate(() => {
    const log = { hero: 'warrior', result: 'lose', begged: false, deck: [], relics: [] } as Record<string, unknown>;
    for (const k of ['act', 'floor', 'kills', 'cards', 'pay', 'elites', 'damageTaken', 'memos', 'time', 'at']) log[k] = 1;
    const meta = JSON.parse(localStorage.getItem('cardstone+:meta') ?? '{}');
    localStorage.setItem('cardstone+:meta', JSON.stringify({ ...meta, history: [log, log] }));
  });
  await page.reload();
  await page.locator('.splash, .title-screen').first().waitFor();
  await expect(page.locator('.rate-banner')).toBeVisible();
  await page.locator('.rate-banner .rate-star').nth(3).click();
  await expect(page.locator('.rate-form .rate-star.on')).toHaveCount(4);
  await page.locator('.rate-text').fill('Great shift');
  await page.getByRole('button', { name: /send review/i }).click();
  await expect(page.locator('.rate-banner')).toBeHidden();
  expect(problems).toEqual([]);
});

test("the Sushi Chef's omakase: a slip lists the pieces, the belt serves sushi and covers nothing; eating them in order ends the move", async ({
  page,
}) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /debug/i }).click();
  await page.locator('.debug-tabs button').last().click();
  await page.locator('.debug-foe[data-enemy="sushiChef"]').click();
  await expect(page.locator('.combat')).toBeVisible();
  const start = page.locator('.js-start');
  if (await start.count()) await start.click();
  await expect.poll(() => combat(page, 'return c.intro <= 0;')).toBe(true);
  await combat(page, 'while (!c.enemy.move.task) c.skipEnemyMove();');
  // The test is about taps, not the clock: the move waits.
  await combat(page, 'c.enemy.move = { ...c.enemy.move, windup: 999 };');
  const slip = page.locator('.sushi-slip.on');
  await expect(slip).toBeVisible();
  const length = (await combat(page, 'return c.chore.order.length;')) as number;
  await expect(slip.locator('.ss-piece')).toHaveCount(length);
  await expect(slip.locator('.ss-piece.next')).toHaveCount(1);
  // No window: the belt and the sleeve stay in reach, and the pieces ride the belt.
  await expect(page.locator('.task-window.on')).toHaveCount(0);
  await expect(page.locator('.belt-cards .card.sushi').first()).toBeVisible({ timeout: 10000 });
  /** Taps the piece the slip wants next (it moves: the tap lands where it is now). */
  const eatNext = async (): Promise<void> => {
    let uid: number | null = null;
    await expect
      .poll(
        async () =>
          (uid = (await combat(
            page,
            'const b = c.belt.find((x) => x.card.id === c.chore.next && x.pos > 0.2 && x.pos < 0.8); return b ? b.card.uid : null;',
          )) as number | null),
        {
          timeout: 15000,
        },
      )
      .not.toBeNull();
    const box = (await page.locator(`.belt-cards .card[data-uid="${uid}"]`).boundingBox())!;
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  };
  // A wrong piece costs seconds and flashes the slip.
  const timer = (await combat(page, 'return c.enemy.timer;')) as number;
  await expect
    .poll(
      () => combat(page, 'return c.belt.some((b) => b.card.id !== c.chore.next && b.card.id.startsWith("sushi") && b.pos > 0.2 && b.pos < 0.8);'),
      { timeout: 15000 },
    )
    .toBe(true);
  const uidWrong = (await combat(
    page,
    'return c.belt.find((b) => b.card.id !== c.chore.next && b.card.id.startsWith("sushi") && b.pos > 0.2 && b.pos < 0.8).card.uid;',
  )) as number;
  const wrongBox = (await page.locator(`.belt-cards .card[data-uid="${uidWrong}"]`).boundingBox())!;
  await page.touchscreen.tap(wrongBox.x + wrongBox.width / 2, wrongBox.y + wrongBox.height / 2);
  expect(await combat(page, 'return c.chore.errors;')).toBe(1);
  expect(((await combat(page, 'return c.enemy.timer;')) as number) - timer).toBeGreaterThan(1.5);
  for (let i = 0; i < length; i++) {
    await eatNext();
    await expect(slip.locator('.ss-piece.eaten')).toHaveCount(i + 1);
  }
  await expect(page.locator('.sushi-slip.served')).toBeVisible();
  await expect(slip).toBeHidden({ timeout: 6000 });
  expect(await combat(page, "return c.has('enemy', 'stun');")).toBe(true);
  expect(await combat(page, 'return c.belt.some((b) => b.card.id.startsWith("sushi"));')).toBe(false);
  expect(problems).toEqual([]);
});
