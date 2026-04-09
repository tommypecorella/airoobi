import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Referral (tab-referral)
 *
 * Verifica link referral, stats, copy to clipboard.
 */

test.describe('Referral', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/referral-dapp');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('tab referral visibile', async ({ page }) => {
    const referralTab = page.locator('#tab-referral');
    await expect(referralTab).toBeVisible();
  });

  test('contiene link referral o invito', async ({ page }) => {
    const content = await page.locator('#tab-referral').textContent();
    // Deve contenere riferimenti al programma referral
    const hasReferral = content?.match(/referral|invit|condivid|share|link/i);
    expect(hasReferral).toBeTruthy();
  });
});
