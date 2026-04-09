import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth-user.json');
const ADMIN_AUTH_FILE = path.join(__dirname, '.auth-admin.json');

/**
 * AUTH SETUP — Eseguito PRIMA dei test autenticati.
 *
 * Effettua login su airoobi.app e salva i cookie/localStorage
 * in file JSON riutilizzabili da tutti i test successivi.
 *
 * Turnstile (Cloudflare anti-bot) viene bypassato intercettando
 * lo script e iniettando un token finto. Questo funziona perche'
 * il token Turnstile NON viene validato server-side nel login
 * (Supabase Auth non lo verifica).
 */

/** Intercetta Turnstile e inietta token finto */
async function bypassTurnstile(page: import('@playwright/test').Page, containerId: string) {
  // Intercetta lo script Turnstile prima che carichi
  await page.route('**/challenges.cloudflare.com/**', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `window.turnstile={render:function(el,opts){
      var inp=document.createElement("input");
      inp.type="hidden";inp.name="cf-turnstile-response";
      inp.value="test-bypass-token";el.appendChild(inp);
      if(opts&&opts.callback)opts.callback("test-bypass-token");
      return "widget-id";
    },reset:function(){},remove:function(){}};`
  }));
}

/** Inietta token Turnstile nel container se non presente */
async function injectTurnstileToken(page: import('@playwright/test').Page, containerId: string) {
  await page.evaluate((id) => {
    const container = document.getElementById(id);
    if (container && !container.querySelector('[name="cf-turnstile-response"]')) {
      const inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = 'cf-turnstile-response';
      inp.value = 'test-bypass-token';
      container.appendChild(inp);
    }
  }, containerId);
}

setup('login utente normale', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.warn('⚠ TEST_USER_EMAIL / TEST_USER_PASSWORD non configurate — skip auth utente');
    await page.context().storageState({ path: AUTH_FILE });
    return;
  }

  // Bypass Turnstile
  await bypassTurnstile(page, 'login-turnstile');

  await page.goto('https://www.airoobi.app/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Inietta token Turnstile nel DOM (safety net)
  await injectTurnstileToken(page, 'login-turnstile');

  // Compila form login
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);

  // Clicca login
  await page.locator('#login-btn').click();

  // Attendi redirect post-login
  // Su airoobi.app il login redirect va a / (landing con session)
  await page.waitForURL(url => {
    const path = url.pathname;
    return path === '/' || /\/(dapp|airdrops|portafoglio|miei-airdrop)/.test(path);
  }, { timeout: 15_000 });

  // Verifica login riuscito — aspetta che la pagina carichi e il session sia valido
  await page.waitForTimeout(2000);

  // Salva auth state
  await page.context().storageState({ path: AUTH_FILE });
  console.log('✓ Auth utente salvata in', AUTH_FILE);
});

setup('login admin', async ({ page }) => {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('⚠ TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD non configurate — skip auth admin');
    await page.context().storageState({ path: ADMIN_AUTH_FILE });
    return;
  }

  // ABO login NON ha Turnstile — login diretto
  await page.goto('https://www.airoobi.app/admin');
  await page.waitForLoadState('domcontentloaded');

  // Compila form ABO login
  await page.locator('#abo-email').fill(email);
  await page.locator('#abo-password').fill(password);
  await page.locator('#abo-login-btn').click();

  // Attendi che il pannello admin si apra
  await expect(page.locator('#admin-overlay')).toHaveClass(/active/, { timeout: 15_000 });

  // Salva auth state
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
  console.log('✓ Auth admin salvata in', ADMIN_AUTH_FILE);
});
