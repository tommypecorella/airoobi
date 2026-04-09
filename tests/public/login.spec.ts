import { test, expect } from '@playwright/test';

/**
 * TEST SUITE: Login & Signup Pages
 *
 * Verifica form, validazione, e UX delle pagine di autenticazione.
 * NON effettua login reale (quello e' in auth.setup.ts).
 */

test.describe('Pagina Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('form login visibile con campi email e password', async ({ page }) => {
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('#login-btn')).toBeVisible();
  });

  test('link a signup presente', async ({ page }) => {
    const signupLink = page.locator('a[href*="signup"]');
    await expect(signupLink).toBeVisible();
  });

  test('link forgot password presente', async ({ page }) => {
    const forgotLink = page.locator('[onclick*="showForgot"], a:has-text("password")').first();
    await expect(forgotLink).toBeVisible();
  });

  test('click su forgot password mostra il form recupero', async ({ page }) => {
    await page.locator('[onclick*="showForgot"]').first().click();
    await expect(page.locator('#forgot-box')).toBeVisible();
    await expect(page.locator('#forgot-email')).toBeVisible();
  });

  test('submit vuoto non naviga via', async ({ page }) => {
    await page.locator('#login-btn').click();
    // Dovremmo restare sulla pagina login
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });

  test('link torna su AIROOBI presente', async ({ page }) => {
    const backLink = page.locator('.back-link');
    await expect(backLink).toBeVisible();
  });
});

test.describe('Pagina Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('form signup visibile', async ({ page }) => {
    // Signup ha almeno email e password
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('link a login presente', async ({ page }) => {
    const loginLink = page.locator('a[href*="login"]');
    await expect(loginLink).toBeVisible();
  });

  test('footer con versione presente', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
