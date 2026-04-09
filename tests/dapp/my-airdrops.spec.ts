import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: I Miei Airdrop (tab-my)
 *
 * Verifica sezione partecipazioni e oggetti proposti.
 */

test.describe('I Miei Airdrop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/miei-airdrop');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('tab my visibile', async ({ page }) => {
    const myTab = page.locator('#tab-my');
    await expect(myTab).toBeVisible();
  });

  test('contiene sezione partecipazioni o messaggio vuoto', async ({ page }) => {
    const content = await page.locator('#tab-my').textContent();
    expect(content).toBeTruthy();
  });
});
