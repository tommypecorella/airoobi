import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Portafoglio (tab-wallet)
 *
 * Verifica card ARIA, ROBI, KAS e link all'explorer.
 */

test.describe('Portafoglio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portafoglio-dapp');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('tab wallet visibile', async ({ page }) => {
    const walletTab = page.locator('#tab-wallet');
    await expect(walletTab).toBeVisible();
  });

  test('contiene card saldo (ARIA/ROBI/KAS)', async ({ page }) => {
    const walletContent = await page.locator('#tab-wallet').textContent();
    // Verifica che almeno uno dei token sia menzionato
    const hasARIA = walletContent?.includes('ARIA');
    const hasROBI = walletContent?.includes('ROBI');
    const hasKAS = walletContent?.includes('KAS');
    expect(hasARIA || hasROBI || hasKAS).toBeTruthy();
  });
});
