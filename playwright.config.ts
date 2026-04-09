import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Carica credenziali test da .env.test
dotenv.config({ path: path.join(__dirname, '.env.test') });

/**
 * AIROOBI — Playwright E2E Test Configuration
 *
 * Test contro il sito LIVE:
 *   - airoobi.app  → dApp marketplace (landing, airdrops, wallet, admin)
 *   - airoobi.com  → sito istituzionale
 *
 * Auth:
 *   I test autenticati usano storageState salvato da auth.setup.ts.
 *   Le credenziali vengono lette dalle env vars:
 *     TEST_USER_EMAIL / TEST_USER_PASSWORD   → utente normale
 *     TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD  → utente admin
 */

// Paths per auth state persistente
export const AUTH_FILE = path.join(__dirname, 'tests', 'fixtures', '.auth-user.json');
export const ADMIN_AUTH_FILE = path.join(__dirname, 'tests', 'fixtures', '.auth-admin.json');

export default defineConfig({
  testDir: './tests',

  /* Timeout per singolo test: 30s (sito live, può essere lento) */
  timeout: 30_000,

  /* Timeout per expect/assertion */
  expect: { timeout: 10_000 },

  /* Retry 1 volta in CI, 0 in locale */
  retries: process.env.CI ? 1 : 0,

  /* Massimo parallelismo: 2 worker (gentili col sito live) */
  workers: process.env.CI ? 1 : 2,

  /* Reporter: HTML per analisi locale, list per CI */
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],

  /* Impostazioni globali condivise da tutti i test */
  use: {
    /* Screenshot su failure per debug */
    screenshot: 'only-on-failure',

    /* Video solo su retry (pesante) */
    video: 'on-first-retry',

    /* Trace su retry per debug avanzato */
    trace: 'on-first-retry',

    /* Locale italiano come il sito */
    locale: 'it-IT',

    /* Viewport desktop standard */
    viewport: { width: 1280, height: 720 },

    /* Ignora errori HTTPS (non dovrebbero esserci, ma safety) */
    ignoreHTTPSErrors: true,
  },

  /* ═══════════════════════════════════════════
     PROGETTI DI TEST
     ═══════════════════════════════════════════ */
  projects: [
    /* ── SETUP: login utente ── */
    {
      name: 'auth-user-setup',
      testMatch: /auth\.setup\.ts/,
      grep: /login utente/,
      use: { ...devices['Desktop Chrome'] },
    },

    /* ── SETUP: login admin ── */
    {
      name: 'auth-admin-setup',
      testMatch: /auth\.setup\.ts/,
      grep: /login admin/,
      use: { ...devices['Desktop Chrome'] },
    },

    /* ── 1. PAGINE PUBBLICHE (no auth) ── */
    {
      name: 'public',
      testDir: './tests/public',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.airoobi.app',
      },
    },

    /* ── 2. dAPP AUTENTICATA (utente normale) ── */
    {
      name: 'dapp',
      testDir: './tests/dapp',
      dependencies: ['auth-user-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.airoobi.app',
        storageState: AUTH_FILE,
      },
    },

    /* ── 3. ADMIN BACKOFFICE (utente admin) ── */
    {
      name: 'admin',
      testDir: './tests/admin',
      dependencies: ['auth-admin-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.airoobi.app',
        storageState: ADMIN_AUTH_FILE,
      },
    },

    /* ── 4. MOBILE (pagine pubbliche, viewport mobile) ── */
    {
      name: 'mobile',
      testDir: './tests/public',
      testMatch: /landing|navigation/,
      use: {
        ...devices['Pixel 5'],
        baseURL: 'https://www.airoobi.app',
      },
    },
  ],

  /* Nessun webServer — test su sito live */
});
