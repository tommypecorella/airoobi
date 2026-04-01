# AIROOBI_CONTEXT.md
**Knowledge Transfer per AI agents · Aggiornato: 01 Apr 2026 · Stage: Alpha 0 APERTO**

> Questo file viene aggiornato ad ogni modifica rilevante all'architettura, routing, deploy, tokenomics o struttura file.

---

## PROGETTO

AIROOBI = marketplace di airdrop decentralizzato su blockchain Kaspa. Gli utenti guadagnano ARIA coin (check-in, video, referral) e li usano per partecipare ad airdrop. Il sistema usa NFT (Tessere) come garanzia legale.

| | |
|---|---|
| **Sito istituzionale** | airoobi.com |
| **dApp marketplace** | airoobi.app |
| **Repo** | github.com/tommypecorella/airoobi |
| **Founder** | Tommaso Pecorella (DrSkeezu) |
| **Stage** | Alpha 0 APERTO (DB resettato 11 Mar 2026), Stage 1 target Q2 2026 |

---

## STACK

- **Frontend:** HTML5 + Vanilla JS — nessun framework, nessun bundler
- **Deploy:** Vercel (auto-deploy da push GitHub main) — host-based routing in `vercel.json`
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Email:** Postmark (in attesa approvazione)
- **DNS:** Cloudflare
- **Analytics:** Cloudflare Web Analytics + Vercel Analytics
- **Ads:** A-ADS #2429619 + Google AdSense (pub-6346998237302066)
- **Blockchain:** Kaspa (integrazione on-chain da Stage 2)
- **Dev agents:** ARIA/CCP (Claude Code su Raspberry Pi 5) + Cla (Claude Desktop)

---

## ARCHITETTURA FILE

### File HTML principali
| File | Ruolo | Dominio |
|---|---|---|
| `home.html` | Sito istituzionale + dashboard utente + admin panel | airoobi.com |
| `dapp.html` | Marketplace airdrop (hash routing interno) | airoobi.app |
| `login.html` | Login (parametro `returnTo` per redirect) | entrambi |
| `signup.html` | Registrazione (parametro `returnTo` per redirect) | entrambi |
| `abo.html` | Backoffice valutatori/admin | airoobi.app |
| `vendi.html` | Form vendita oggetti | airoobi.com |

### Altri file HTML (secondari)
`blog.html`, `contatti.html`, `investitori.html`, `privacy.html`, `termini.html`, `reset-password.html`, `email-confirm.html`, `email-template.html`, `airoobi-cards.html`, `airoobi-explainer.html`, `video-intro.html`, `video-airdrop.html`

### File statici nella root
| File | Servito su | Contenuto |
|---|---|---|
| `ads-app.txt` | airoobi.app/ads.txt | Google AdSense + A-ADS |
| `ads-com.txt` | airoobi.com/ads.txt | Solo Google AdSense |
| `vercel.json` | — | Routing host-based, rewrites |

> **IMPORTANTE:** Non esiste un file `ads.txt` nella root. I due file `ads-app.txt` e `ads-com.txt` vengono serviti come `/ads.txt` tramite rewrites host-based in `vercel.json`.

---

## ROUTING — DUE DOMINI, UN REPO

Il routing e gestito interamente da `vercel.json` con rewrites host-based. Stesso repo GitHub, due Vercel project separati.

### airoobi.app (dApp)
Le richieste con host `www.airoobi.app` vengono matchate per prime:
- `/` → `dapp.html`
- `/airdrops`, `/esplora`, `/proponi`, `/referral`, `/portafoglio`, `/archivio`, `/impara`, `/gestione` → `dapp.html`
- `/login` → `login.html`, `/signup` → `signup.html`
- `/abo`, `/admin` → `abo.html`
- `/ads.txt` → `ads-app.txt` (Google + A-ADS)

### airoobi.com (sito istituzionale)
Fallback senza host match:
- `/` → `home.html`
- `/dashboard`, `/profilo`, `/portafoglio`, `/guadagni`, `/referral`, `/classifica`, `/vendi`, `/admin` → `home.html`
- `/dapp`, `/airdrops`, `/esplora` ecc. → `dapp.html`
- `/login` → `login.html`, `/signup` → `signup.html`
- `/ads.txt` → `ads-com.txt` (solo Google)

### Redirect
- `airoobi.app` fa redirect a `www.airoobi.app` (config Vercel)
- I curl devono usare `-L` per seguire redirect, oppure puntare a `www.airoobi.app`

---

## CREDENZIALI (anon — pubbliche, embedded nel frontend)

- **Supabase URL:** `https://vuvlmlpuhovipfwtquux.supabase.co`
- **Supabase anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co`
- **Admin:** `tommaso.pecorella+ceo@outlook.com`, `ceo@airoobi.com`

---

## DESIGN SYSTEM

| Elemento | Valore |
|---|---|
| **Palette** | BLACK `#000000` · GOLD `#B8960C` · WHITE `#FFFFFF` |
| **ARIA blue** | `#4A9EFF` |
| **KAS green** | `#49EACB` |
| **Font heading** | Cormorant Garamond |
| **Font body** | Instrument Sans |
| **Font mono** | DM Mono |
| **Tema** | Dark mode only |

---

## TOKENOMICS

| Asset | Tipo | Ruolo |
|---|---|---|
| **ARIA** | Valuta piattaforma (NO peg fiat) | Guadagnata con attivita, usata per comprare blocchi airdrop |
| **ROBI** | NFT Tessera Rendimento (oro) | 1 ROBI = 1 NFT. Si ottiene SOLO partecipando, MAI acquistabile. Riscossione in KAS |
| **Tessera Coin** | Proxy wallet blu | Mostra saldo ARIA |
| **Tessera Kaspa** | Proxy wallet verde | Mostra saldo KAS |

### Guadagno ARIA
| Azione | ARIA |
|---|---|
| Welcome bonus | +10 |
| Login giornaliero | +1 |
| Check-in giornaliero | +1 |
| Video view | +1 (max 5/giorno) |
| Streak settimanale | +1 ogni 7 giorni |
| Referral (invitante) | +10 |
| Referral (invitato) | +15 |

### Regole tassative
- **AICO non esiste piu** — termine deprecato. Solo ARIA e ROBI
- Zero menzione di EUR 0.10 nell'area utente
- DB column `aico_circulating` in `treasury_stats` = ARIA circolante (nome legacy)
- Le Tessere sono proxy wallet ricaricabili, non si convertono direttamente

---

## DB SUPABASE

### Tabelle principali
`profiles`, `points_ledger`, `checkins`, `video_views`, `referral_confirmations`, `nft_rewards`, `events`, `waitlist`, `investor_leads`, `cost_tracker`, `treasury_stats`, `user_roles`, `airdrops`, `airdrop_participations`, `airdrop_blocks`, `airdrop_config`, `treasury_transactions`, `categories`, `notifications`, `asset_registry`, `airdrop_messages`

### Note
- **RLS** abilitato su tutte le tabelle
- **Storage bucket:** `submissions` (foto oggetti valutazione)
- **Email confirm:** DISABILITATO (autoconfirm ON)
- **Profilo:** creato al primo accesso dashboard (`showDashboard`)
- **Tabella `events`:** colonne `event`, `url`, `ua`, `props` (NON event_type/page/user_agent)
- **Migrazioni:** via Supabase CLI in `supabase/migrations/`. Mai SQL raw diretto

### Sistema ruoli
- Tabella `user_roles`: ruoli `admin` e `evaluator`
- CEO (`ceo@airoobi.com`) = admin + evaluator di default
- RPC: `get_my_roles()` ritorna ruoli utente corrente

---

## COMUNICAZIONE — REGOLE TASSATIVE

- **ZERO gergo gambling:** mai "vinci", "perdi", "lotteria", "gioco d'azzardo", "investimento", "scommetti"
- **Framing utente:** "Realizza il tuo desiderio" — partecipi per ottenere l'oggetto a un prezzo ridicolo
- **Framing venditore:** "Vendi il tuo oggetto di valore (min EUR 500)" — incasso garantito a prezzo di mercato
- **NFT = buono fruttifero:** le Tessere Rendimento crescono di valore nel tempo
- **One Category Rule:** se ottieni l'oggetto in una categoria, non puoi piu ottenerlo nella stessa

---

## WORKFLOW OBBLIGATORI

- **Footer version:** formato `alfa-YYYY.MM.DD-build.versione.revisione`
  - Aggiornare su TUTTI i file HTML ad ogni push
  - Versione corrente: **alfa-2026.04.01-1.55.0**
  - File da aggiornare: `home.html`, `dapp.html`, `login.html`, `signup.html`, `vendi.html`
- **Auth:** pagine separate (`login.html`, `signup.html`) con parametro `returnTo`
- **Referral link:** puntano a `airoobi.app/signup`
- **Docs:** aggiornare i docs interessati dalle modifiche
- **Questo file:** aggiornare `AIROOBI_CONTEXT.md` dopo ogni modifica strutturale

---

## PENDING STAGE 1

1. SQL `nft_rewards` su Supabase
2. Postmark SMTP config + verifica email (BLOCCANTE)
3. Template `email-confirm.html` in Supabase Auth
4. Backend API per acquisto blocchi
5. Primo airdrop live
6. Onboarding Alpha Brave (target 1.000 utenti)
7. Implementare regola "One Category Rule"

---

## DOCUMENTAZIONE

Tutti i doc in `/docs`:
- `docs/business/` — business plan completo (solo .md aggiornati)
- `docs/sql/` — schema SQL e backup
- `docs/tech/` — documentazione tecnica
- `docs/legal/` — documenti legali
- `docs/product/` — product docs
- `REGISTRY.md` — master registry deliverable
- `AIROOBI_Airdrop_Engine_v1.md` — algoritmo draw, split economica, NFT distribuzione

---

## CHANGELOG CONTESTO

| Data | Modifica |
|---|---|
| 01 Apr 2026 | ads.txt split per dominio: `ads-app.txt` (Google+A-ADS) e `ads-com.txt` (solo Google), rewrites host-based |
| 29 Mar 2026 | Wallet card ROBI con equivalente KAS |
| 28 Mar 2026 | Definizione completa ROBI, filtro NFT per tipo |
| 25 Mar 2026 | Domain split: airoobi.com (sito) + airoobi.app (dApp), routing host-based |
| 25 Mar 2026 | `index.html` rinominato `home.html` |
| 11 Mar 2026 | Alpha 0 APERTO, DB resettato |
