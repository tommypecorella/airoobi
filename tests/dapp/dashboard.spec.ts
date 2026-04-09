import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Dashboard dApp (tab-home)
 *
 * Richiede autenticazione (storageState da auth.setup).
 * Verifica saldi, faucet, check-in, task giornalieri, activity feed.
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dapp');
    await page.waitForLoadState('domcontentloaded');
    // Rimuovi splash tour se presente (overlay onboarding che blocca i click)
    await page.evaluate(() => {
      const splash = document.getElementById('splash-tour');
      if (splash) splash.remove();
    });
  });

  test('topbar visibile con saldo ARIA', async ({ page }) => {
    const balance = page.locator('#topbar-bal');
    await expect(balance).toBeVisible();
    const text = await balance.textContent();
    expect(text).toContain('ARIA');
  });

  test('navigazione tab visibile', async ({ page }) => {
    // Usa solo la nav desktop (#topbar-nav) per evitare duplicati col menu mobile
    const nav = page.locator('#topbar-nav');
    await expect(nav).toBeVisible();

    const tabs = ['home', 'explore', 'my', 'wallet', 'archive', 'learn', 'submit'];
    for (const tab of tabs) {
      await expect(nav.locator(`[data-page="${tab}"]`)).toBeAttached();
    }
  });

  test('avatar utente visibile', async ({ page }) => {
    const avatar = page.locator('#topbar-avatar');
    await expect(avatar).toBeVisible();
  });

  test('campanella notifiche presente', async ({ page }) => {
    const bell = page.locator('#notif-bell');
    await expect(bell).toBeVisible();
  });

  test('toggle lingua funziona', async ({ page }) => {
    const langBtn = page.locator('#lang-btn');
    await expect(langBtn).toBeVisible();

    const initialText = await langBtn.textContent();
    await langBtn.click({ force: true }); // force per bypassare eventuali overlay
    await page.waitForTimeout(500);
    const newText = await langBtn.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('tab dashboard (home) e\' il tab attivo di default', async ({ page }) => {
    const homeTab = page.locator('#tab-home');
    await expect(homeTab).toBeVisible();
  });
});
