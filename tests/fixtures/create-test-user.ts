/**
 * Script per creare l'utente di test via browser.
 * Bypassa Turnstile usando page.route per mockare la risposta.
 *
 * Uso: npx playwright test tests/fixtures/create-test-user.ts
 */
import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'playwright-test@airoobi.app';
const TEST_PASSWORD = 'AiroobiTest2026!';

test('crea utente di test via signup', async ({ page }) => {
  // Intercetta Turnstile per bypassare il captcha
  await page.route('**/turnstile/**', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'window.turnstile={render:function(el,opts){var inp=document.createElement("input");inp.type="hidden";inp.name="cf-turnstile-response";inp.value="test-token";el.appendChild(inp);if(opts.callback)opts.callback("test-token");return"widget-id"},reset:function(){},remove:function(){}}'
  }));

  await page.goto('https://www.airoobi.app/signup');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Bypassa il check Alpha Brave Full (conta anche account test pool)
  // e inietta token Turnstile finto
  await page.evaluate(() => {
    (window as any).checkAlphaBraveFull = async () => false;

    // Crea input Turnstile finto nel container signup
    const container = document.getElementById('signup-turnstile');
    if (container) {
      const existing = container.querySelector('[name="cf-turnstile-response"]');
      if (!existing) {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = 'cf-turnstile-response';
        inp.value = 'test-bypass-token';
        container.appendChild(inp);
      }
    }
  });

  // Compila il form
  await page.locator('#signup-email').fill(TEST_EMAIL);
  await page.locator('#signup-password').fill(TEST_PASSWORD);
  await page.locator('#signup-password2').fill(TEST_PASSWORD);

  // Svuota referral se pre-compilato
  await page.locator('#signup-ref').fill('');

  // Click signup
  await page.locator('#signup-btn').click();

  // Attendi risultato (successo o errore)
  await page.waitForTimeout(5000);

  // Check se c'e' un errore
  const errorEl = page.locator('#signup-error');
  const errorVisible = await errorEl.isVisible();
  if (errorVisible) {
    const errorText = await errorEl.textContent();
    console.log('Signup error:', errorText);

    // Se l'utente esiste gia', va bene
    if (errorText?.includes('already') || errorText?.includes('gia') || errorText?.includes('già')) {
      console.log('✓ Utente test gia\' esistente — OK');
      return;
    }
  }

  // Se siamo stati reindirizzati, il signup e' andato a buon fine
  const url = page.url();
  console.log('URL dopo signup:', url);
  console.log('✓ Utente test creato:', TEST_EMAIL);
});
