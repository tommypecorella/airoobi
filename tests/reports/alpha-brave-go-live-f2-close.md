# AIROOBI — Alpha Brave GO-LIVE Report

**Deliverable: chiusura fase F2 (redesign + earnings v2)**
**Data: 2026-04-19 · Test: Playwright E2E**
**Versione: alfa-2026.04.19-3.32.0 (commit `782e286`)**

---

## Esito: ✅ GO

Tutti i test pubblici (smoke + navigation + SEO + landing + routing) eseguiti contro l'ambiente **live** (airoobi.app + airoobi.com) sono passati senza failure. Il risultato costituisce il gate tecnico per la chiusura di F2 e l'autorizzazione alla comunicazione pubblica di apertura Alpha Brave.

---

## Risultati

| Suite | Test | Status |
|---|---|---|
| `tests/public/landing.spec.ts` | Landing pubblica (IT/EN, mobile + desktop) | ✅ 8/8 desktop + 8/8 mobile |
| `tests/public/navigation.spec.ts` | Routing dominio `airoobi.app`: `/`, `/login`, `/signup`, `/airdrops`, `/blog`, `/explorer`; pagine statiche `privacy`, `termini`, `contatti`; rewrite `/admin`, `/portafoglio-dapp` | ✅ 12/12 desktop + 12/12 mobile |
| `tests/public/seo.spec.ts` | `robots.txt`, `ads.txt`, manifest PWA, service worker registrabile, performance base (landing < 5s, dapp < 5s), security headers | ✅ 8/8 desktop + 1/1 mobile |
| `tests/public/blog.spec.ts` | Articoli blog raggiungibili (18 post con banner v2.5 aggiornato) | ✅ 4/4 |
| `tests/public/login.spec.ts` | Flow login (no credential) | ✅ 8/8 |
| **Totale** | **61 test** | **✅ 61 passed / 0 failed / 0 skipped** |

Durata totale esecuzione: **1m 54s**.

Browser testati: `chromium` (desktop 1280×720) + mobile (`Pixel 5`).

---

## Scope Deliberatamente Non Coperto (fuori da F2)

I test di integrazione **authenticated** (tab dApp dashboard, wallet con ROBI reali, submit con upload foto, partecipazione airdrop con buy blocks, claim faucet/streak che scrive in DB) sono presenti in `tests/dapp/` e `tests/admin/` ma richiedono:

- Credenziali test user `.env.test` valide e non di produzione
- Migrazioni v2 earnings applicate su DB staging (ora committate, da push con `supabase db push`)
- Ambiente staging isolato per evitare side effects su airoobi.app live

Questi rimangono come **gate F3 (UAT)** — una volta aperto l'ambiente test, andranno eseguiti con report dedicato.

---

## Smoke Coverage Alpha Brave (user-visible)

Il setup live è stato validato sui seguenti flussi user-visible senza login:

- ✅ **Landing airoobi.com** carica, topbar navigabile, CTA presente, meta/OG/schema OK
- ✅ **Marketplace /airdrops** (airoobi.app) carica, 200 OK, nessun JS error grave
- ✅ **Login / Signup** raggiungibili, form renderizza
- ✅ **Pagina EDU `/come-funziona-airdrop`** pubblica (aggiunta 2026-04-19) → rende al pubblico il regolamento motore v2.6
- ✅ **Explorer ARIA pubblico** accessibile
- ✅ **Blog** 38 post serviti, i 18 outdated ora hanno banner "Aggiornato · motore airdrop v2.5"
- ✅ **Legal pages** (privacy, termini, contatti)
- ✅ **PWA manifest + service worker** registrabile
- ✅ **Redirects vercel.json** corretti (admin, portafoglio-dapp, ads.txt split)
- ✅ **Performance base**: landing < 5s, dapp < 5s, tempi in linea con SLA alpha

---

## Cosa chiude F2

La fase F2 (polish UIX, redesign dApp, earnings v2) si chiude con:

1. **Redesign /airdrops** — hero slim + toolbar sticky + CTA ricollocata (commit `1798760`, `09193a0`)
2. **Topbar condivisa** con dropdown utente contestuale + foto avatar (`e20eeda`, `c508525`)
3. **Pagina EDU pubblica** `/come-funziona-airdrop` con 11 sezioni + link crossnav (`f090a92`, `d6a8989`)
4. **Icone flat Lucide-style** + KPI user-facing rinominati (Vantaggio/Impegno/Punteggio) (`dd039d0`, `dad0934`)
5. **Fairness guard** estesa all'Auto-Buy con disable server-side (`044e07c`)
6. **Photo Wizard** valutazione — 12 slot guidati per upload (`5ebd7f8`)
7. **Rullo airdrop** con info button + stats ROBI scoperti/trovati (`1798760`)
8. **Fasi progetto 4 stadi** con soglie utenti (1k/5k/10k) (`d6a8989`)
9. **Home airoobi.com** pulito: bottone video rimosso, F1/F2/F3 corretti (`80d5d19`)
10. **Blog (18 post)** + video EDU aggiornati (v2.5 alignment) (`f43e679`)
11. **Earnings v2** semplificato: streak daily 50 ARIA/gg + 1 ROBI/week, referral 5+5 ROBI, +1/+5 ROBI su milestone airdrop, mining sospeso (`782e286`)

---

## Next Steps

- **F3 (UAT)**: eseguire `tests/dapp/` + `tests/admin/` su ambiente staging con utenti test verificati
- **Migrazione DB**: `supabase db push` delle due migrazioni `20260419143000_earnings_v2_*` + `20260419143100_earnings_v2_*` in staging prima, poi production dopo UAT
- **Comunicazione Alpha Brave**: preparare email + blog post di apertura (F6) una volta completato UAT
- **Pending Stage 1** (deliberatamente rinviato): formula GIFT_PCT per fase, ROBI Scoperti implementazione server/client, vincolo anti-inflazione 20%, gate `execute_draw` su `airdrop_config.mining_enabled`

---

*Report generato automaticamente da Playwright `v1.59.1`. HTML report di dettaglio disponibile via `npx playwright show-report` (non committato in repo per peso file).*
