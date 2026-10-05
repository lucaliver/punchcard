import { expect, test } from '@playwright/test';
import { freshGame } from './helpers';

test('Settings switch the language to Italian, it survives a reload and a fight shows no missing strings', async ({ page }) => {
  const problems = await freshGame(page);
  await page.getByRole('button', { name: /settings/i }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'IT' }).click();
  await expect(page.getByRole('button', { name: /nuova partita/i })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  await page.reload();
  await expect(page.getByRole('button', { name: /nuova partita/i })).toBeVisible();

  await page.getByRole('button', { name: /nuova partita/i }).click();
  await page.locator('.hero-dot').first().click();
  await page.getByRole('button', { name: /inizia il turno/i }).click();
  await page.getByRole('button', { name: /entra nel piano 1/i }).click();
  await expect(page.locator('.combat')).toBeVisible();
  expect(problems).toEqual([]);
});

test('the first launch asks for the language before the contract, and the choice sticks', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('.language-btn')).toHaveCount(4);
  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.locator('.contract')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByText('Contrato de trabajo')).toBeVisible();
});
