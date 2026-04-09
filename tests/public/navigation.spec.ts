import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Navigazione e Routing (airoobi.app)
 *
 * Verifica che tutte le route pubbliche rispondano correttamente
 * e che il routing host-based funzioni.
 */

test.describe('Routing pagine pubbliche airoobi.app', () => {
  const publicRoutes = [
    { path: '/', expectedTitle: /AIROOBI/i, desc: 'Landing' },
    { path: '/login', expectedTitle: /Login/i, desc: 'Login' },
    { path: '/signup', expectedTitle: /Registra|Sign/i, desc: 'Signup' },
    { path: '/airdrops', expectedTitle: /AIROOBI/i, desc: 'Airdrops (dApp)' },
    { path: '/blog', expectedTitle: /Blog|AIROOBI/i, desc: 'Blog' },
    { path: '/explorer', expectedTitle: /Explorer|AIROOBI/i, desc: 'ARIA Explorer' },
  ];

  for (const route of publicRoutes) {
    test(`${route.desc} (${route.path}) carica con status 200`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(route.expectedTitle);
    });
  }
});

test.describe('Pagine statiche', () => {
  const staticPages = [
    { path: '/privacy.html', contains: /privacy|dati|cookie/i },
    { path: '/termini.html', contains: /termin|condizion|servizi/i },
    { path: '/contatti.html', contains: /contatt|email|scriv/i },
  ];

  for (const page_ of staticPages) {
    test(`${page_.path} carica e contiene contenuto`, async ({ page }) => {
      const response = await page.goto(page_.path);
      expect(response?.status()).toBe(200);
      const body = await page.textContent('body');
      expect(body).toMatch(page_.contains);
    });
  }
});

test.describe('Redirect e rewrite', () => {
  test('/admin rewrite a abo.html (back office)', async ({ page }) => {
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/ABO|Back Office/i);
  });

  test('/portafoglio-dapp rewrite a dapp.html', async ({ page }) => {
    const response = await page.goto('/portafoglio-dapp');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/AIROOBI/i);
  });
});
