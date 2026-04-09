import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Impara (tab-learn)
 *
 * Verifica contenuti educativi.
 */

test.describe('Impara', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/impara');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('tab learn visibile', async ({ page }) => {
    const learnTab = page.locator('#tab-learn');
    await expect(learnTab).toBeVisible();
  });

  test('contiene contenuti educativi', async ({ page }) => {
    const content = await page.locator('#tab-learn').textContent();
    // Deve avere del contenuto (non vuoto)
    expect(content!.trim().length).toBeGreaterThan(10);
  });
});
