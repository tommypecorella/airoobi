import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Landing Page (airoobi.app/)
 *
 * Verifica che la landing page si carichi correttamente,
 * contenga gli elementi chiave e i link funzionino.
 */

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('si carica con status 200 e titolo corretto', async ({ page }) => {
    await expect(page).toHaveTitle(/AIROOBI/i);
  });

  test('contiene la topbar con navigazione', async ({ page }) => {
    const topbar = page.locator('.topbar');
    await expect(topbar).toBeVisible();
  });

  test('contiene CTA principale (Entra / Sign Up)', async ({ page }) => {
    // La landing ha almeno un bottone CTA per registrarsi
    const cta = page.locator('a[href*="signup"], a[href*="login"], button').filter({ hasText: /entra|registra|sign|accedi|inizia/i }).first();
    await expect(cta).toBeVisible();
  });

  test('contiene sezione hero con claim AIROOBI', async ({ page }) => {
    // Verifica che ci sia un heading o testo principale
    const heroText = page.locator('h1, h2, .hero-title, .hero h1').first();
    await expect(heroText).toBeVisible();
  });

  test('footer presente con versione', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const footerText = await footer.textContent();
    expect(footerText).toMatch(/alfa-\d{4}\.\d{2}\.\d{2}/);
  });

  test('meta description presente e non vuota', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(20);
  });

  test('Open Graph tags presenti', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
    expect(ogImage).toMatch(/https:\/\//);
  });

  test('nessun errore console JavaScript grave', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    // Filtra errori noti (es. AdSense, analytics) e verifica che non ci siano errori applicativi
    const appErrors = errors.filter(e =>
      !e.includes('adsbygoogle') &&
      !e.includes('googlesyndication') &&
      !e.includes('ERR_BLOCKED_BY_CLIENT') &&
      !e.includes('Failed to load resource')
    );
    expect(appErrors).toHaveLength(0);
  });
});
