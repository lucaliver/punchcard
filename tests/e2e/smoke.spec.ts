import { expect, test } from '@playwright/test';
import { freshGame, startRun, winFight } from './helpers';

test.describe('menus', () => {
  test('title, how to play, settings, almanac', async ({ page }) => {
    await freshGame(page);
    await page.getByText('How to play').click();
    await expect(page.locator('.how-modal')).toBeVisible();
    for (let i = 0; i < 5; i++) await page.locator('.how-modal .btn').last().click();
    await page.locator('.how-modal .btn').last().click();
    await expect(page.locator('.how-modal')).toHaveCount(0);
    await page.getByText('Settings', { exact: true }).click();
    await expect(page.locator('.settings-modal')).toBeVisible();
    await page.getByRole('button', { name: 'Italiano' }).click();
    await expect(page.locator('.title-play')).toContainText('Parti');
    await page.getByText('Almanacco').click();
    await expect(page.locator('.almanac')).toBeVisible();
    for (const tab of await page.locator('.al-tab').all()) await tab.click();
  });

  test('only the first keeper is open at the start', async ({ page }) => {
    await freshGame(page);
    await page.click('.title-play');
    await expect(page.locator('.k-foot .btn.big')).toBeEnabled();
    await page.click('.k-arrow.right');
    await expect(page.locator('.k-foot .btn.big')).toBeDisabled();
  });
});

test.describe('a run', () => {
  test('starts on the map with the first rooms reachable', async ({ page }) => {
    await freshGame(page);
    await startRun(page);
    expect(await page.locator('.m-node.reach').count()).toBeGreaterThan(1);
  });

  test('a fight: place a spirit, win, take a card', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await freshGame(page);
    await startRun(page);
    await page.locator('.m-node.reach').first().click();
    await expect(page.locator('.battle')).toBeVisible();
    await expect(page.locator('.start-panel')).toBeVisible();
    await page.click('.start-panel .btn');
    await expect(page.locator('.start-panel')).toHaveCount(0);
    // drag the first spirit card onto the garden
    await page.evaluate(() => {
      const b = (window as unknown as { __battle: { oil: number } }).__battle;
      b.oil = 10;
    });
    const spiritSlot = await page.evaluate(() => {
      const b = (window as unknown as { __battle: { hand: ({ id: string } | null)[] } }).__battle;
      return b.hand.findIndex((c) => c && ['ofudaArcher', 'komainu', 'kodama'].includes(c.id));
    });
    expect(spiritSlot).toBeGreaterThanOrEqual(0);
    const card = page.locator('.b-hand .slot').nth(spiritSlot).locator('.card');
    const cb = (await card.boundingBox()) as { x: number; y: number; width: number; height: number };
    const fb = (await page.locator('.field-canvas').boundingBox()) as { x: number; y: number; width: number; height: number };
    await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
    await page.mouse.down();
    await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height * 0.6, { steps: 8 });
    await page.mouse.up();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __battle: { units: unknown[] } }).__battle.units.length)).toBe(1);
    await winFight(page);
    await expect(page.locator('.end-panel')).toBeVisible({ timeout: 15000 });
    await page.click('.end-panel .btn');
    await expect(page.locator('.reward')).toBeVisible();
    await page.locator('.reward-card').first().click();
    await page.getByText('Take it').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('.map')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('a lost lantern ends the run on the end screen', async ({ page }) => {
    await freshGame(page);
    await startRun(page);
    await page.locator('.m-node.reach').first().click();
    await page.click('.start-panel .btn');
    await page.evaluate(() => {
      const b = (window as unknown as { __battle: { flame: number; step(n: number): void } }).__battle;
      b.flame = 1;
      b.step(120);
    });
    await expect(page.locator('.end-panel')).toBeVisible({ timeout: 15000 });
    await page.click('.end-panel .btn');
    await expect(page.locator('.end')).toBeVisible();
    await page.getByText('Back to the title').click();
    await expect(page.locator('.title')).toBeVisible();
  });
});

test.describe('rooms', () => {
  for (const room of ['rest', 'shrine', 'treasure', 'market']) {
    test(`the ${room} opens and can be left`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await freshGame(page);
      await startRun(page);
      await page.evaluate((r) => (window as unknown as { __game: { enter(t: string): void } }).__game.enter(r), room);
      await expect(page.locator(`.room.${room}`)).toBeVisible();
      if (room === 'rest') {
        await page.locator('.choice:not(:disabled)').first().click();
        if (await page.locator('.deck-modal').count()) {
          await page.locator('.deck-cell:not(.dim)').first().click();
          await page.locator('.deck-modal .btn.red').click();
        }
        await page.getByRole('button', { name: 'Continue' }).click();
      } else if (room === 'treasure') {
        await page.locator('.choice').first().click();
        await page.locator('.relic-tile .btn').first().click();
        await page.getByRole('button', { name: 'Continue' }).click();
      } else if (room === 'shrine') {
        await page.locator('.choice').first().click();
        await page.locator('.deck-cell').first().click();
        await page.locator('.deck-modal .btn.red').click();
        await page.getByRole('button', { name: 'Continue' }).click();
      } else {
        await page.locator('.shop-card').first().click();
        await page.getByRole('button', { name: 'Close' }).click();
        await page.getByRole('button', { name: 'Leave the market' }).click();
      }
      await expect(page.locator('.map')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});
