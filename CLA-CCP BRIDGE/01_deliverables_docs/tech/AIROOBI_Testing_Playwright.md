# AIROOBI — Test Automatici E2E con Playwright

**Codice documento:** TECH-003  
**Versione:** 1.0  
**Data:** 2026-04-09  
**Autore:** ARIA (Claude Code) + DrSkeezu  
**Stato:** Attivo  

---

## Indice

1. [Overview](#1-overview)
2. [Architettura dei Test](#2-architettura-dei-test)
3. [Setup Iniziale](#3-setup-iniziale)
4. [Struttura File](#4-struttura-file)
5. [Configurazione](#5-configurazione)
6. [Autenticazione](#6-autenticazione)
7. [Test Suite — Pagine Pubbliche](#7-test-suite--pagine-pubbliche)
8. [Test Suite — dApp Autenticata](#8-test-suite--dapp-autenticata)
9. [Test Suite — Admin Backoffice](#9-test-suite--admin-backoffice)
10. [Come Eseguire i Test](#10-come-eseguire-i-test)
11. [Interpretare i Risultati](#11-interpretare-i-risultati)
12. [Aggiungere Nuovi Test](#12-aggiungere-nuovi-test)
13. [CI/CD con GitHub Actions](#13-cicd-con-github-actions)
14. [Troubleshooting](#14-troubleshooting)
15. [Glossario](#15-glossario)

---

## 1. Overview

### Cosa sono i test E2E?

I test **End-to-End (E2E)** simulano un utente reale che naviga il sito con un browser. A differenza dei test unitari (che testano singole funzioni), i test E2E verificano che l'intero flusso funzioni: dal caricamento della pagina, all'interazione con i bottoni, fino alla verifica dei risultati.

### Perche' Playwright?

**Playwright** e' un framework di test E2E sviluppato da Microsoft. Lo abbiamo scelto per:

- **Browser reale**: usa Chromium (lo stesso motore di Chrome) per testare
- **Veloce e affidabile**: gestisce automaticamente attese, retry, e race condition
- **Screenshot/Video su failure**: quando un test fallisce, salva screenshot e video per debug
- **Auth persistente**: effettua login una volta sola e riusa le credenziali per tutti i test
- **Report HTML interattivo**: genera report navigabili con dettagli di ogni test

### Cosa testiamo?

| Area | File Test | Cosa verifica |
|------|-----------|---------------|
| Pagine pubbliche | `tests/public/` | Landing, login, signup, blog, SEO, routing |
| dApp autenticata | `tests/dapp/` | Dashboard, airdrops, wallet, submit, referral, learn, archive |
| Admin backoffice | `tests/admin/` | ABO login, sidebar, tutte le sezioni admin |

### Ambiente di test

I test girano contro il **sito LIVE** (`https://www.airoobi.app`), non contro un server locale. Questo garantisce che testiamo esattamente cio' che vedono gli utenti.

---

## 2. Architettura dei Test

```
                    ┌─────────────────────┐
                    │  playwright.config.ts │  ← Configurazione centrale
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼──────┐
    │  auth.setup.ts  │ │              │ │             │
    │  (login once)   │ │              │ │             │
    └───────┬─────────┘ │              │ │             │
            │           │              │ │             │
    ┌───────▼─────┐     │              │ │             │
    │ .auth-*.json│     │              │ │             │
    │ (cookies)   │     │              │ │             │
    └──────┬──────┘     │              │ │             │
           │            │              │ │             │
    ┌──────▼──────┐ ┌───▼────────┐ ┌───▼──────┐     │
    │ tests/dapp/ │ │tests/public│ │tests/admin│     │
    │ (user auth) │ │ (no auth)  │ │(admin auth│     │
    └─────────────┘ └────────────┘ └───────────┘     │
                                                      │
                                        ┌─────────────▼──┐
                                        │ playwright-report│
                                        │ (HTML report)    │
                                        └──────────────────┘
```

### Flusso di esecuzione

1. **auth.setup.ts** esegue per primo: fa login utente + admin e salva i cookie in file JSON
2. **public/** esegue senza auth: testa pagine accessibili a tutti
3. **dapp/** esegue con auth utente: usa i cookie salvati al punto 1
4. **admin/** esegue con auth admin: usa i cookie admin salvati al punto 1
5. **Report** generato alla fine con risultati, screenshot, video

---

## 3. Setup Iniziale

### Prerequisiti

- **Node.js 18+** installato (`node --version`)
- **npm** installato (`npm --version`)
- Accesso al repo airoobi

### Installazione

```bash
# 1. Installa dipendenze
npm install

# 2. Installa browser Chromium per Playwright
npx playwright install chromium

# 3. Copia il file credenziali di esempio
cp .env.test.example .env.test

# 4. Modifica .env.test con credenziali reali
nano .env.test
```

### Configurazione credenziali (.env.test)

```env
# Utente di test (account normale su Supabase)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password-sicura

# Admin di test (account con ruolo admin su Supabase)
TEST_ADMIN_EMAIL=admin@airoobi.com
TEST_ADMIN_PASSWORD=password-admin
```

> **IMPORTANTE**: Il file `.env.test` contiene password e NON deve MAI essere committato. E' gia' nel `.gitignore`.

---

## 4. Struttura File

```
airoobi/
├── playwright.config.ts          ← Configurazione Playwright
├── .env.test.example             ← Template credenziali (committato)
├── .env.test                     ← Credenziali reali (NON committato)
├── package.json                  ← Script npm per i test
├── tests/
│   ├── fixtures/
│   │   ├── auth.setup.ts         ← Script login automatico
│   │   ├── .auth-user.json       ← Cookie utente (auto-generato)
│   │   └── .auth-admin.json      ← Cookie admin (auto-generato)
│   ├── public/                   ← Test pagine pubbliche (NO auth)
│   │   ├── landing.spec.ts       ← Landing page
│   │   ├── navigation.spec.ts    ← Routing e pagine statiche
│   │   ├── login.spec.ts         ← Form login/signup
│   │   ├── blog.spec.ts          ← Blog index + articoli
│   │   └── seo.spec.ts           ← Sitemap, manifest, PWA, performance
│   ├── dapp/                     ← Test dApp (richiede auth utente)
│   │   ├── dashboard.spec.ts     ← Tab Dashboard
│   │   ├── airdrops.spec.ts      ← Tab Esplora + navigazione tab
│   │   ├── wallet.spec.ts        ← Tab Portafoglio
│   │   ├── submit.spec.ts        ← Tab Proponi Oggetto
│   │   ├── referral.spec.ts      ← Tab Referral
│   │   ├── learn.spec.ts         ← Tab Impara
│   │   ├── archive.spec.ts       ← Tab Archivio
│   │   └── my-airdrops.spec.ts   ← Tab I Miei Airdrop
│   └── admin/                    ← Test Admin ABO (richiede auth admin)
│       └── backoffice.spec.ts    ← Tutte le sezioni ABO
├── playwright-report/            ← Report HTML (auto-generato)
└── test-results/                 ← Screenshot/video failure (auto-generato)
```

---

## 5. Configurazione

Il file `playwright.config.ts` definisce:

### Progetti di test

| Progetto | Directory | Auth | Browser | Descrizione |
|----------|-----------|------|---------|-------------|
| `auth-setup` | `tests/fixtures/` | - | Chrome | Esegue login e salva cookie |
| `public` | `tests/public/` | No | Chrome Desktop | Pagine pubbliche |
| `dapp` | `tests/dapp/` | Utente | Chrome Desktop | dApp marketplace |
| `admin` | `tests/admin/` | Admin | Chrome Desktop | Back office |
| `mobile` | `tests/public/` | No | Pixel 5 | Test mobile (landing + nav) |

### Parametri chiave

| Parametro | Valore | Motivo |
|-----------|--------|--------|
| `timeout` | 30s | Sito live puo' essere lento |
| `expect.timeout` | 10s | Attesa elementi DOM |
| `retries` | 0 locale / 1 CI | Retry solo in CI |
| `workers` | 2 locale / 1 CI | Gentili col server live |
| `screenshot` | solo su failure | Debug senza overhead |
| `video` | solo su retry | Pesante, solo quando serve |
| `baseURL` | `https://www.airoobi.app` | Test su sito live |

---

## 6. Autenticazione

### Come funziona

Playwright supporta il concetto di **storageState**: salva cookie e localStorage in un file JSON dopo il login, e li ricarica per tutti i test successivi.

```
auth.setup.ts
  ├── Login utente → salva .auth-user.json
  └── Login admin  → salva .auth-admin.json

tests/dapp/*.spec.ts    → usa .auth-user.json (gia' loggato)
tests/admin/*.spec.ts   → usa .auth-admin.json (gia' loggato)
tests/public/*.spec.ts  → nessuna auth (visitatore anonimo)
```

### Utente di test

L'utente di test deve essere un account Supabase valido con:
- Email e password funzionanti
- Profilo creato (almeno un accesso alla dashboard)

### Admin di test

L'admin di test deve essere un account con:
- Ruolo `admin` nella tabella `user_roles`
- Accesso al back office ABO

### Turnstile (Cloudflare)

La pagina login ha Cloudflare Turnstile. Per i test:
- Il login ABO (`abo.html`) **non ha** Turnstile → funziona direttamente
- Il login utente (`login.html`) **ha** Turnstile → potrebbe richiedere configurazione
- In ambiente di test, Turnstile puo' essere bypassato con la modalita' test di Cloudflare

---

## 7. Test Suite — Pagine Pubbliche

### landing.spec.ts
Verifica la pagina principale di airoobi.app:
- Caricamento con status 200 e titolo corretto
- Topbar con navigazione presente
- CTA principale (registrazione/accesso)
- Footer con versione (`alfa-YYYY.MM.DD-X.XX.X`)
- Meta tag SEO (description, Open Graph)
- Nessun errore JavaScript applicativo in console

### navigation.spec.ts
Verifica il routing su airoobi.app:
- Tutte le route pubbliche rispondono 200 (`/`, `/login`, `/signup`, `/airdrops`, `/blog`, `/explorer`)
- Pagine statiche (`privacy.html`, `termini.html`, `contatti.html`) caricano con contenuto
- Rewrite funzionano (`/admin` → ABO, `/portafoglio-dapp` → dApp)

### login.spec.ts
Verifica le pagine di autenticazione:
- Form login con campi email/password
- Link a signup e forgot password
- Form forgot password si apre correttamente
- Form signup con campi necessari
- Submit vuoto non naviga via dalla pagina

### blog.spec.ts
Verifica il blog:
- Indice blog carica con link ad articoli
- Articoli campione caricano con status 200 e hanno h1
- Meta description presente sugli articoli

### seo.spec.ts
Verifica SEO e infrastruttura tecnica:
- `sitemap.xml` accessibile e valido XML
- `ads.txt` accessibile su airoobi.app
- `manifest.json` valido (PWA)
- `sw.js` accessibile (service worker)
- Landing e dApp caricano entro 5 secondi

---

## 8. Test Suite — dApp Autenticata

Tutti i test in `tests/dapp/` richiedono login utente.

### dashboard.spec.ts
- Topbar con saldo ARIA visibile
- Navigazione tab completa (7 tab)
- Avatar utente visibile
- Campanella notifiche presente
- Toggle lingua IT/EN funziona
- Tab Dashboard attivo di default

### airdrops.spec.ts
- Tab Esplora si apre su `/airdrops`
- Griglia airdrop presente (o messaggio vuoto in alpha)
- Filtri categoria (se presenti)
- Navigazione tra tab funziona (explore → wallet → home)

### wallet.spec.ts
- Tab Portafoglio visibile su `/portafoglio-dapp`
- Contiene riferimenti a ARIA, ROBI, o KAS

### submit.spec.ts
- Tab Proponi visibile su `/proponi`
- Form di submission con input/textarea/select

### referral.spec.ts
- Tab Referral visibile
- Contiene link referral o testo invito

### learn.spec.ts / archive.spec.ts / my-airdrops.spec.ts
- Tab rispettivi visibili
- Contenuto presente (anche se vuoto in alpha)

---

## 9. Test Suite — Admin Backoffice

Tutti i test in `tests/admin/` richiedono login admin.

### backoffice.spec.ts

**Accesso e Layout:**
- Pannello admin si apre (overlay con classe `active`)
- Navbar con titolo "ABO" visibile
- Sidebar con 10+ sezioni di navigazione
- Bottone logout e link APP presenti

**Sezione Overview:**
- Overview attiva di default
- Contiene card con metriche

**Navigazione Sezioni (9 sezioni testate):**
- Ultimi utenti, Valutazioni, Gestione, Analysis
- Treasury, ARIA Metrics, ROBI Valuation
- Cost Tracker, Categorie
- Ogni sezione si apre cliccando nel sidebar

**Tabella Utenti:**
- Sezione utenti contiene tabella dati

**Valutazioni Backoffice:**
- Tabs di stato presenti (in_valutazione, presale, ecc.)

**Cost Tracker:**
- Sezione costi visibile con toolbar

---

## 10. Come Eseguire i Test

### Comandi disponibili

```bash
# Eseguire TUTTI i test
npm test

# Solo pagine pubbliche (no auth necessaria)
npm run test:public

# Solo dApp (richiede .env.test con utente)
npm run test:dapp

# Solo admin (richiede .env.test con admin)
npm run test:admin

# Con browser visibile (per debug)
npm run test:headed

# Modalita' debug interattiva (step-by-step)
npm run test:debug

# UI interattiva Playwright (consigliato per esplorazione)
npm run test:ui

# Visualizzare ultimo report HTML
npm run test:report
```

### Eseguire un singolo file di test

```bash
npx playwright test tests/public/landing.spec.ts
```

### Eseguire un singolo test per nome

```bash
npx playwright test -g "si carica con status 200"
```

### Eseguire con output dettagliato

```bash
npx playwright test --reporter=line
```

---

## 11. Interpretare i Risultati

### Output terminale

```
Running 45 tests using 2 workers

  ✓  [public] › landing.spec.ts:15 › Landing Page › si carica con status 200 (1.2s)
  ✓  [public] › landing.spec.ts:19 › Landing Page › contiene la topbar (0.8s)
  ✗  [dapp] › dashboard.spec.ts:25 › Dashboard › topbar con saldo ARIA (3.1s)
     Error: expect(locator).toBeVisible()
     Locator: #topbar-bal

  44 passed, 1 failed
```

- `✓` = test passato
- `✗` = test fallito (con errore e locator)
- Il tempo indica quanto ha impiegato

### Report HTML

Dopo l'esecuzione, apri il report:

```bash
npm run test:report
```

Il report mostra:
- **Lista test** con stato (pass/fail/skip)
- **Screenshot** su ogni failure
- **Video** se il test era in retry
- **Trace** navigabile (timeline delle azioni)

### Screenshot su failure

Quando un test fallisce, lo screenshot viene salvato in:
```
test-results/[nome-test]/test-failed-1.png
```

### Trace Viewer

Per analizzare un failure in dettaglio:
```bash
npx playwright show-trace test-results/[nome-test]/trace.zip
```

Il trace mostra: timeline, DOM snapshot, network, console log per ogni step.

---

## 12. Aggiungere Nuovi Test

### Struttura di un test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nome Gruppo', () => {
  // Eseguito prima di ogni test nel gruppo
  test.beforeEach(async ({ page }) => {
    await page.goto('/percorso');
  });

  test('descrizione del test', async ({ page }) => {
    // 1. Trova un elemento
    const element = page.locator('#mio-id');

    // 2. Verifica che sia visibile
    await expect(element).toBeVisible();

    // 3. Interagisci
    await element.click();

    // 4. Verifica il risultato
    await expect(page).toHaveURL(/nuova-pagina/);
  });
});
```

### Locator consigliati (in ordine di preferenza)

```typescript
// 1. ID (piu' stabile)
page.locator('#topbar-bal')

// 2. data-testid (aggiungere se manca)
page.locator('[data-testid="faucet-btn"]')

// 3. Ruolo accessibilita'
page.getByRole('button', { name: 'Login' })

// 4. Testo
page.locator('text=Dashboard')

// 5. CSS selector (ultimo resort)
page.locator('.admin-card-val')
```

### Dove mettere il nuovo test

| Tipo | Cartella | Auth necessaria |
|------|----------|-----------------|
| Pagina pubblica | `tests/public/` | No |
| Feature dApp per utenti | `tests/dapp/` | Si (utente) |
| Feature admin ABO | `tests/admin/` | Si (admin) |

### Convenzione nomi

- File: `nome-feature.spec.ts` (kebab-case)
- Descrizioni: in italiano, imperative ("si carica", "contiene", "naviga")
- Un `test.describe` per feature/pagina

---

## 13. CI/CD con GitHub Actions

### Setup (opzionale)

Creare `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install chromium
      - run: npx playwright test --project=public
        # Test autenticati richiedono secrets GitHub
      - run: npx playwright test --project=dapp --project=admin
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          TEST_ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}
          TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Configurare i secrets su GitHub

1. Vai su `github.com/tommypecorella/airoobi/settings/secrets/actions`
2. Aggiungi: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`

---

## 14. Troubleshooting

### "Browser non trovato"

```bash
npx playwright install chromium
```

### "Timeout exceeded" su test auth

Il login potrebbe fallire per Turnstile (captcha). Soluzioni:
- Usa la modalita' test di Cloudflare Turnstile
- Testa prima solo `npm run test:public` (no auth)

### "Element not found" / "Locator not visible"

1. Esegui il test in modalita' headed: `npm run test:headed`
2. Verifica che l'elemento esista nel DOM (F12)
3. Potrebbe servire `waitForTimeout` se il rendering e' asincrono

### Test passano in locale ma falliscono in CI

- Differenze di rete (CI e' piu' lento)
- Aumenta i timeout nel config
- Verifica che i secrets GitHub siano configurati

### Report non si apre

```bash
# Forza apertura
npx playwright show-report playwright-report
```

### Aggiornare Playwright

```bash
npm install -D @playwright/test@latest
npx playwright install chromium
```

---

## 15. Glossario

| Termine | Significato |
|---------|-------------|
| **E2E** | End-to-End: test che simula un utente reale |
| **Playwright** | Framework di test E2E di Microsoft |
| **spec** | File di specifica/test (`.spec.ts`) |
| **Locator** | Selettore per trovare elementi nella pagina |
| **storageState** | Cookie e localStorage salvati per riusare il login |
| **Fixture** | Setup condiviso tra test (es. auth) |
| **Project** | Gruppo di test con configurazione specifica |
| **Worker** | Processo parallelo che esegue test |
| **Trace** | Registrazione dettagliata di un test (DOM, network, console) |
| **Reporter** | Formato di output dei risultati (HTML, list, JSON) |
| **Headed** | Con browser visibile (per debug) |
| **Headless** | Senza browser visibile (default, per CI) |
| **CI** | Continuous Integration (es. GitHub Actions) |
| **Retry** | Riesecuzione automatica di un test fallito |

---

## Appendice: Conteggio Test

| Suite | File | Test | Copertura |
|-------|------|------|-----------|
| Pubbliche | 5 | ~25 | Landing, routing, login, blog, SEO/PWA |
| dApp | 8 | ~20 | Tutti i 8 tab + navigazione |
| Admin | 1 | ~18 | Layout, overview, 9 sezioni, utenti, valutazioni, costi |
| **Totale** | **14** | **~63** | **Copertura completa sito** |

---

*Documento generato il 2026-04-09. Aggiornare quando vengono aggiunti nuovi test o cambiano le pagine.*
