import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Archivio (tab-archive)
 *
 * Verifica sezione airdrop completati.
 */

test.describe('Archivio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/archivio');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('tab archive visibile', async ({ page }) => {
    const archiveTab = page.locator('#tab-archive');
    await expect(archiveTab).toBeVisible();
  });

  test('contiene lista archivio o messaggio vuoto', async ({ page }) => {
    const content = await page.locator('#tab-archive').textContent();
    // In alpha potrebbe essere vuoto, ma il tab deve renderizzare
    expect(content).toBeTruthy();
  });
});
