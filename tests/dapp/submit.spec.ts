import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Proponi Oggetto (tab-submit)
 *
 * Verifica form di submission oggetto per airdrop.
 * NON effettua submission reale — solo verifica UI.
 */

test.describe('Proponi Oggetto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/proponi');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('tab submit visibile', async ({ page }) => {
    const submitTab = page.locator('#tab-submit');
    await expect(submitTab).toBeVisible();
  });

  test('form di submission presente con campi necessari', async ({ page }) => {
    const tab = page.locator('#tab-submit');

    // Verifica presenza di input/textarea/select nel tab
    const inputs = tab.locator('input, textarea, select');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });
});
