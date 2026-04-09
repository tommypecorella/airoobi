import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: SEO & Technical Health
 *
 * Verifica sitemap, robots, manifest, service worker, performance base.
 */

test.describe('SEO Assets', () => {
  test('sitemap.xml accessibile e valido', async ({ request }) => {
    const response = await request.get('https://www.airoobi.app/sitemap.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<urlset');
    expect(body).toContain('airoobi');
  });

  test('robots.txt accessibile', async ({ request }) => {
    const response = await request.get('https://www.airoobi.app/robots.txt');
    // robots.txt puo' non esistere, ma se esiste deve essere 200
    if (response.status() === 200) {
      const body = await response.text();
      expect(body.length).toBeGreaterThan(0);
    }
  });

  test('ads.txt accessibile su airoobi.app', async ({ request }) => {
    const response = await request.get('https://www.airoobi.app/ads.txt');
    expect(response.status()).toBe(200);
  });
});

test.describe('PWA', () => {
  test('manifest.json accessibile e valido', async ({ request }) => {
    const response = await request.get('https://www.airoobi.app/manifest.json');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name || manifest.short_name).toBeTruthy();
  });

  test('service worker registrabile', async ({ page }) => {
    await page.goto('/');
    // sw.js deve essere accessibile
    const swResponse = await page.request.get('https://www.airoobi.app/sw.js');
    expect(swResponse.status()).toBe(200);
  });
});

test.describe('Performance base', () => {
  test('landing carica entro 5 secondi', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('dapp carica entro 5 secondi', async ({ page }) => {
    const start = Date.now();
    await page.goto('/airdrops', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });
});

test.describe('Security headers', () => {
  test('risposta ha header base', async ({ request }) => {
    const response = await request.get('https://www.airoobi.app/');
    const headers = response.headers();
    // Vercel aggiunge alcuni header di default
    expect(headers['content-type']).toContain('text/html');
  });
});
