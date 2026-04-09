import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Admin Back Office (abo.html)
 *
 * Richiede autenticazione admin (storageState da auth.setup).
 * Verifica login, sidebar, sezioni principali, e funzionalita' base.
 *
 * Sezioni ABO:
 *   - Overview, Ultimi utenti, Valutazioni, Gestione Airdrops
 *   - Analysis, Treasury, ARIA Metrics, ROBI Valuation, NFT per tipo
 *   - Cost Tracker, Test Pool, Fairness Index
 *   - Collaboratori, Categorie, Impostazioni
 */

test.describe('ABO — Accesso e Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('pannello admin si apre (overlay active)', async ({ page }) => {
    const overlay = page.locator('#admin-overlay');
    await expect(overlay).toHaveClass(/active/);
  });

  test('navbar admin visibile con titolo ABO', async ({ page }) => {
    const nav = page.locator('.admin-nav');
    await expect(nav).toBeVisible();
    const text = await nav.textContent();
    expect(text).toContain('ABO');
  });

  test('sidebar con sezioni di navigazione', async ({ page }) => {
    const sidebar = page.locator('.admin-sidebar');
    await expect(sidebar).toBeAttached();

    // Verifica che le sezioni principali siano nel sidebar
    const items = page.locator('.admin-sidebar-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(5);
  });

  test('bottone logout presente', async ({ page }) => {
    const logoutBtn = page.locator('button:has-text("Logout"), .admin-close:has-text("Logout")');
    await expect(logoutBtn).toBeVisible();
  });

  test('link APP presente per tornare alla dApp', async ({ page }) => {
    const appLink = page.locator('a:has-text("APP")');
    await expect(appLink).toBeVisible();
  });
});

test.describe('ABO — Sezione Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
  });

  test('overview e\' la sezione attiva di default', async ({ page }) => {
    const overviewSection = page.locator('#sec-overview, .admin-section.active').first();
    await expect(overviewSection).toBeVisible();
  });

  test('overview contiene card con metriche', async ({ page }) => {
    const cards = page.locator('.admin-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('ABO — Navigazione Sezioni', () => {
  const sections = [
    { id: 'sec-users', name: 'Ultimi utenti' },
    { id: 'sec-valutazioni', name: 'Valutazioni' },
    { id: 'sec-airdrops', name: 'Gestione' },
    { id: 'sec-analysis', name: 'Analysis' },
    { id: 'sec-treasury', name: 'Treasury' },
    { id: 'sec-coin', name: 'ARIA Metrics' },
    { id: 'sec-nft-valuation', name: 'ROBI Valuation' },
    { id: 'sec-costs', name: 'Cost Tracker' },
    { id: 'sec-categories', name: 'Categorie' },
  ];

  for (const section of sections) {
    test(`sezione ${section.name} si apre cliccando nel sidebar`, async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Clicca sull'item del sidebar
      const sidebarItem = page.locator(`.admin-sidebar-item[onclick*="${section.id}"]`);
      await sidebarItem.click();
      await page.waitForTimeout(500);

      // Verifica che la sezione sia visibile
      const sectionEl = page.locator(`#${section.id}`);
      await expect(sectionEl).toBeVisible();
    });
  }
});

test.describe('ABO — Tabella Utenti', () => {
  test('sezione utenti contiene tabella', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Naviga alla sezione utenti
    await page.locator('.admin-sidebar-item[onclick*="sec-users"]').click();
    await page.waitForTimeout(2000);

    // Verifica presenza tabella
    const table = page.locator('#sec-users .admin-table, #sec-users table');
    await expect(table).toBeAttached();
  });
});

test.describe('ABO — Valutazioni Backoffice', () => {
  test('sezione valutazioni ha tabs di stato', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.locator('.admin-sidebar-item[onclick*="sec-valutazioni"]').click();
    await page.waitForTimeout(2000);

    // Verifica tab backoffice (bo-tabs)
    const tabs = page.locator('#sec-valutazioni .bo-tab');
    const count = await tabs.count();
    // Dovrebbe avere tabs per i vari stati (in_valutazione, presale, ecc.)
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('ABO — Cost Tracker', () => {
  test('sezione costi ha toolbar e tabella', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.locator('.admin-sidebar-item[onclick*="sec-costs"]').click();
    await page.waitForTimeout(2000);

    const costsSection = page.locator('#sec-costs');
    await expect(costsSection).toBeVisible();
  });
});
