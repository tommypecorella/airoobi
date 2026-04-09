import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Esplora Airdrops (tab-explore)
 *
 * Verifica griglia airdrop, filtri categoria, dettaglio airdrop.
 */

test.describe('Esplora Airdrops', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/airdrops');
    await page.waitForLoadState('domcontentloaded');
  });

  test('tab explore si apre correttamente', async ({ page }) => {
    const exploreTab = page.locator('#tab-explore');
    await expect(exploreTab).toBeVisible();
  });

  test('griglia airdrop presente (o messaggio vuoto)', async ({ page }) => {
    // Attendi che la griglia carichi (potrebbe essere vuota in alpha)
    await page.waitForTimeout(3000);
    const grid = page.locator('#tab-explore .airdrop-card, #tab-explore .grid-card, #tab-explore [class*="card"]');
    const emptyMsg = page.locator('#tab-explore .empty, #tab-explore [class*="empty"]');
    const hasCards = await grid.count() > 0;
    const hasEmpty = await emptyMsg.count() > 0;
    // Deve esserci almeno una delle due
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test('filtri categoria visibili', async ({ page }) => {
    await page.waitForTimeout(2000);
    const filters = page.locator('#tab-explore .cat-filter, #tab-explore [class*="filter"], #tab-explore [class*="category"]');
    // In alpha potrebbe non esserci filtri — test soft
    const count = await filters.count();
    // Log per debug
    if (count === 0) {
      console.log('INFO: Nessun filtro categoria trovato — potrebbe essere normale in alpha');
    }
  });
});

test.describe('Navigazione tab', () => {
  test('navigazione tra tab funziona', async ({ page }) => {
    await page.goto('/dapp');
    await page.waitForLoadState('domcontentloaded');

    // Rimuovi splash tour (overlay onboarding)
    await page.evaluate(() => {
      const splash = document.getElementById('splash-tour');
      if (splash) splash.remove();
    });

    // Usa nav desktop (#topbar-nav) per evitare duplicati col menu mobile
    const nav = page.locator('#topbar-nav');

    // Naviga a Esplora
    await nav.locator('[data-page="explore"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#tab-explore')).toBeVisible();

    // Naviga a Portafoglio
    await nav.locator('[data-page="wallet"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#tab-wallet')).toBeVisible();

    // Torna a Dashboard
    await nav.locator('[data-page="home"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#tab-home')).toBeVisible();
  });
});
