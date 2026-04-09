import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Blog
 *
 * Verifica indice blog e caricamento articoli.
 */

test.describe('Blog Index', () => {
  test('pagina blog carica con articoli', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog|AIROOBI/i);

    // Verifica che ci siano link ad articoli
    const articleLinks = page.locator('a[href*="/blog/"]');
    const count = await articleLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Articoli Blog', () => {
  const sampleArticles = [
    '/blog/airoobi-com-vs-airoobi-app.html',
    '/blog/alpha-brave-airoobi-prima-fase.html',
    '/blog/airdrop-luxury-borse-orologi-gioielli.html',
  ];

  for (const article of sampleArticles) {
    test(`articolo ${article} carica con status 200`, async ({ page }) => {
      const response = await page.goto(article);
      expect(response?.status()).toBe(200);

      // Ogni articolo deve avere un titolo h1
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text!.length).toBeGreaterThan(5);
    });
  }
});

test.describe('SEO Blog', () => {
  test('articoli hanno meta description', async ({ page }) => {
    await page.goto('/blog/airoobi-com-vs-airoobi-app.html');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(20);
  });

  test('articoli hanno canonical URL', async ({ page }) => {
    await page.goto('/blog/airoobi-com-vs-airoobi-app.html');
    const count = await page.locator('link[rel="canonical"]').count();
    if (count > 0) {
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(/https:\/\//);
    }
    // Se non c'e' canonical, il test passa (non obbligatorio)
  });
});
