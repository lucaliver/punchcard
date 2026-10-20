import { expect, type Page } from '@playwright/test';

/** Opens the game with an empty save. */
export async function freshGame(page: Page, save: Record<string, unknown> = {}): Promise<void> {
  await page.addInitScript((extra) => {
    if (!sessionStorage.getItem('hyakki-test-init')) {
      localStorage.clear();
      sessionStorage.setItem('hyakki-test-init', '1');
      localStorage.setItem(
        'hyakki:settings',
        JSON.stringify({ reduceMotion: true, sfx: 0, music: 0, localeChosen: true, seenTour: true, locale: 'en' }),
      );
      for (const [k, v] of Object.entries(extra)) localStorage.setItem(`hyakki:${k}`, JSON.stringify(v));
    }
  }, save);
  await page.goto('/');
  await expect(page.locator('.title')).toBeVisible();
}

/** Title → keeper → intro → map, with the keeper at `index`. */
export async function startRun(page: Page, index = 0): Promise<void> {
  await page.click('.title-play');
  for (let i = 0; i < index; i++) await page.click('.k-arrow.right');
  await page.click('.k-foot .btn.big');
  await page.click('.story-go');
  await expect(page.locator('.map')).toBeVisible();
}

/** Makes the running fight end in a win at once (the engine's own clock, no waiting). */
export async function winFight(page: Page): Promise<void> {
  await page.evaluate(() => {
    const b = (window as unknown as { __battle: { stage: { spawns: unknown[]; duration: number }; time: number } }).__battle;
    b.stage.spawns.length = 0;
    b.stage.duration = b.time + 2.5;
  });
}
