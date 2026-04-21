# AIROOBI — Sitemap & Product Structure
**TECH-002 · Version 2.5 · Final · 21 Aprile 2026**

> v2.5 (21 Apr 2026): Tabelle DB complete (30+), RPC live (~60+), sistema ruoli, push notifications, auto-buy, watchlist, user_preferences, company_assets, weekly_checkins. UI: Streak → Sequenza (IT). Welcome grant Alpha-Net nel trigger `handle_new_user`. Alpha-launch reset airdrops (20 Apr 2026).
> v2.4 (19 Apr 2026): `airdrop.html` standalone (pagina dettaglio singolo airdrop, rotta `/airdrop/:slug`). Topbar arricchita con avatar utente + dropdown (Home, Esplora, I miei airdrop, Portafoglio, Vendi, Invita, Logout). Fairness Guard estesa all'Auto-Buy. UI refresh: icone flat monocromatiche (SVG Lucide-style), KPI ridenominati (Vantaggio/Impegno/Punteggio), banner A-ADS rimosso dalla dApp.
> v2.3: Architettura multi-file (home.html, dapp.html, login.html, signup.html, abo.html, vendi.html). Host-based routing Vercel (airoobi.com + airoobi.app). Tabelle DB airdrop engine complete. Multi-photo upload. Chat valutazione. "dApp" → "APP".
> v2.2: Hash routing esteso. Tabelle DB aggiornate. RPC corretti. Autoconfirm email ON.

---

## 1. Architettura File System (Alpha 0 — Produzione)

> **Architettura multi-file** con host-based routing via Vercel rewrites (`vercel.json`).
> Due domini: **airoobi.com** (sito istituzionale) e **airoobi.app** (marketplace airdrop).

### 1.1 File HTML principali

| File | Dominio | Contenuto | Note |
|---|---|---|---|
| `home.html` | airoobi.com / | Sito istituzionale + dashboard utente + admin panel | CSS/JS in `src/home.{css,js}` |
| `dapp.html` | airoobi.app / | Marketplace: esplora, compra blocchi, valuta, gestione | CSS/JS in `src/dapp.{css,js}` |
| `airdrop.html` | airoobi.app /airdrop/:slug | Pagina dettaglio singolo airdrop | CSS/JS in `src/airdrop.{css,js}` |
| `abo.html` | airoobi.app /abo, /admin | Admin Back Office: draw preview/execute, gestione ruoli, treasury | Standalone |
| `login.html` | entrambi /login | Pagina login (parametro `returnTo`) | |
| `signup.html` | entrambi /signup | Pagina registrazione (supporto referral code) | |
| `vendi.html` | airoobi.com /vendi | Landing venditori | |
| `reset-password.html` | entrambi | Recupero password | |
| `come-funziona-airdrop.html` | airoobi.com /come-funziona-airdrop | **Pagina EDU pubblica** (no auth), fonte di verità utente | Deliverable utente |
| `faq.html` | airoobi.com /faq | FAQ pubbliche | |
| `privacy.html`, `termini.html` | entrambi | Privacy + Termini bilingui | |
| `investitori.html`, `explorer.html` | airoobi.com | Pagine investitori | |
| `contatti.html` | airoobi.com /contatti | Form contatti + info | |
| `blog.html` + `blog/*.html` | airoobi.com /blog | 38+ articoli SEO | |
| `airoobi-cards.html`, `airoobi-explainer.html` | airoobi.com | Landing explainer/cards | |
| `video-intro.html`, `video-airdrop.html` | airoobi.com | Video story asset | |
| `email-confirm.html`, `email-template.html` | Supabase Auth / Postmark | Template email | |
| `offline.html` | Service worker fallback | Pagina offline | |

### 1.2 File statici root

| File | Servito su | Contenuto |
|---|---|---|
| `ads-app.txt` | airoobi.app/ads.txt | Google AdSense + A-ADS |
| `ads-com.txt` | airoobi.com/ads.txt | Solo Google AdSense |
| `manifest.json` | /manifest.json | PWA manifest |
| `sw.js` | /sw.js | Service worker per offline + push |
| `sitemap.xml` | airoobi.app/sitemap.xml | Sitemap SEO app |
| `sitemap-com.xml` | airoobi.com/sitemap.xml | Sitemap SEO sito |
| `favicon.ico`, `logo-black.png`, `logo-white.png`, `og-image.png` | Static | Branding |

### 1.3 Asset & src

| Percorso | Contenuto |
|---|---|
| `src/` | CSS/JS sorgenti: `home.{css,js}`, `dapp.{css,js}`, `airdrop.{css,js}`, `topbar.{css,js}`, `styles/brand.css` |
| `public/images/` | Immagini airdrop (mockup), loghi AIROOBI PNG, esempi utilizzo logo |
| `public/icons/`, `public/fonts/` | Placeholder (futuri asset) |
| `docs/brand-identity/` | Loghi + simboli canonici PNG |
| `scripts/` | Script Node: `report.js`, `auto_draw.js`, `ratio_optimizer.js`, `crontab.txt` |
| `supabase/migrations/` | ~120 SQL migration incrementali (source of truth DB) |
| `supabase/functions/` | Edge functions: `check-deadlines`, `process-auto-buy`, `send-push` |

---

## 2. Routing (host-based, Vercel)

Vedi `vercel.json` per dettagli completi. Stesso repo GitHub, due Vercel project separati.

### 2.1 airoobi.app (dApp) — dominio primario marketplace

Le richieste con host `www.airoobi.app` vengono matchate per prime:

| Path | Rewrite | Descrizione |
|---|---|---|
| `/` | `dapp.html` | Home marketplace (dashboard faucet/sequenza, esplora airdrop) |
| `/airdrops`, `/esplora` | `dapp.html` | Tab Esplora |
| `/proponi` | `dapp.html` | Tab Submit (proponi oggetto) |
| `/referral`, `/invita` | `dapp.html` | Tab Referral |
| `/portafoglio-dapp`, `/miei-airdrop` | `dapp.html` | Tab Portafoglio / I miei airdrop |
| `/archivio`, `/impara` | `dapp.html` | Archivio airdrop conclusi / EDU link |
| `/gestione` | `dapp.html` | Pannello valutatore (ruolo `evaluator`) |
| `/airdrop/:slug` | `airdrop.html` | Pagina dettaglio airdrop singolo |
| `/abo`, `/admin` | `abo.html` | Admin backoffice |
| `/login`, `/signup` | relative .html | Auth |
| `/ads.txt` | `ads-app.txt` | Google + A-ADS |

**Redirect:** `airoobi.app` → `www.airoobi.app` (config Vercel).

### 2.2 airoobi.com (sito istituzionale) — fallback senza host match

| Path | Rewrite |
|---|---|
| `/` | `home.html` |
| `/dashboard`, `/profilo`, `/guadagni`, `/referral`, `/classifica`, `/admin` | `home.html` |
| `/vendi` | `vendi.html` |
| `/come-funziona-airdrop` | `come-funziona-airdrop.html` |
| `/faq`, `/contatti`, `/privacy`, `/termini` | relative .html |
| `/investitori`, `/explorer` | relative .html |
| `/blog`, `/blog/:slug` | `blog.html`, `blog/*.html` |
| `/dapp`, `/airdrops`, `/esplora` | `dapp.html` (redirect semantic) |
| `/login`, `/signup` | relative .html |
| `/ads.txt` | `ads-com.txt` (solo Google) |

### 2.3 Routing interno dapp.html

Dopo il rewrite Vercel, `dapp.html` usa `navigateTo(page, event)` per gestire le tab: `home`, `explore`, `submit`, `referral`, `my`, `wallet`, `archive`, `learn`. Lo stato è persistito con `history.pushState`.

---

## 3. UX Flow Principali

### 3.1 Flusso Signup
1. User inserisce email/password → validazione robusta (min 8 char, maiuscola, numero, speciale)
2. Indicatore forza password (debole/media/forte)
3. Cloudflare Turnstile verifica anti-bot
4. **Autoconfirm ON** — nessuna conferma email richiesta. L'utente entra subito.
5. Trigger `handle_new_user` esegue:
   - Crea riga in `profiles` con `total_points = 1000`, `referral_code` univoco
   - Inserisce `points_ledger` row `alphanet_welcome +1000`
   - Inserisce `nft_rewards` row `ROBI shares=5 source=alphanet_welcome`
   - Auto-assegna `BADGE_ALPHA_BRAVE` (trigger separato)
   - Auto-conferma referral se presente (`+5 ROBI` inviter + `+5 ROBI` invitato via `confirm_referral`)

### 3.2 Flusso Login
1. User su `/login` → inserisce email/password
2. Auth Supabase (JWT) → redirect a `returnTo` (default `/`)
3. Primo accesso dashboard: `showDashboard` chiama `loadHomeDashboard()` che inizializza state (faucet, sequenza, saldi)

### 3.3 Flusso Daily Engagement (Earnings v2)
1. User apre dApp → banner guida rapida (dismissable, localStorage) con CTA: Valuta oggetto, Esplora airdrop, ARIA del giorno, Sequenza giornaliera, Dashboard
2. **Faucet:** sezione `#faucet-section`, bottone "RICEVI" → `claim_faucet()` RPC → +100 ARIA
3. **Sequenza giornaliera:** sezione `#streak-section`, calendario 7-day, bottone "TIMBRA OGGI" → `daily_checkin_v2()` RPC → +50 ARIA, se settimana completa (7/7) +1 ROBI

### 3.4 Flusso Acquisto Blocchi
1. User naviga Esplora → seleziona airdrop → `airdrop.html`
2. Visualizza dettaglio + card "Come arrivare 1°" (via `my_category_score_snapshot`)
3. Seleziona N blocchi → `buy_blocks(airdrop_id, n)` RPC (atomico)
4. **Fairness Guard:** se `my_max_reachable < leader_score` → bloccato con messaggio "matematicamente impossibile"
5. Notifica + update UI mosaico blocchi

### 3.5 Flusso Draw Airdrop
1. Deadline raggiunta → cron `check_auto_draw()` (edge function `check-deadlines`)
2. RPC `execute_draw(airdrop_id)` atomico:
   - Calcola scoring v4 via `calculate_winner_score`
   - Seleziona vincitore (rank 1)
   - Assegna +5 ROBI winner + +5 ROBI seller (se completed success)
   - Split revenue → `treasury_transactions`
   - Marca `is_winner_block` sul blocco vincente
3. Notifiche push ai partecipanti
4. Airdrop → status `completed`

### 3.6 Flusso Swap ROBI → KAS
1. Tab Portafoglio → ROBI card → "Converti"
2. Importo (parte o tutto) → richiesta 24-48h
3. Rimborso garantito ≥95% in KAS nella Tessera Kaspa

---

## 4. Tech Stack Frontend

| Layer | Tecnologia | Note |
|---|---|---|
| Struttura | HTML5 + Vanilla JS | Multi-file, host-based routing Vercel, nessun bundler |
| Styling | CSS custom properties | `--black`, `--gold`, `--white`, `--aria`, `--kas` |
| Font | Google Fonts CDN | Cormorant Garamond + Instrument Sans + DM Mono |
| Auth/DB | Supabase JS SDK v2 | Client-side, RLS abilitato ovunque |
| Deploy | Vercel | Auto-deploy da push GitHub main, 2 project (airoobi.com + airoobi.app) |
| DNS/CDN | Cloudflare | Proxy + Analytics + SSL |
| PWA | `manifest.json` + `sw.js` | Service worker per offline + push notifications |
| Push | Web Push API | Tabella `push_subscriptions`, edge function `send-push` |
| Ads | A-ADS iframe + Google AdSense | #2429619 attivo · AdSense in revisione |
| Testing | Playwright | Config in `playwright.config.ts`, tests in `tests/` |

---

## 5. Supabase — Schema DB completo

Project: `vuvlmlpuhovipfwtquux`. **RLS abilitato su tutte le tabelle.**

### 5.1 Tabelle — Core utenti

| Tabella | Operazione | Cosa fa |
|---|---|---|
| `profiles` | GET/POST/PATCH | Profilo utente: total_points, current_streak, longest_streak, last_checkin, referral_code, referred_by, referral_count, avatar_url, display_name, first_name, last_name, deleted_at, public_id |
| `points_ledger` | GET/POST | Registro movimenti ARIA (reason: `alphanet_welcome`, `streak_day`, `daily_checkin`, `faucet`, `valuation_request`, `block_purchase`, `refund`, ecc.) |
| `checkins` | GET/POST | Check-in legacy (deprecato da earnings v2, sostituito da `weekly_checkins`) |
| `video_views` | GET/POST | Visualizzazioni video (sospese in Alpha) |
| `weekly_checkins` | GET | **Sequenza giornaliera v2** (earnings v2): `week_start` (lun), `days_checked` smallint[], `robi_awarded` boolean |
| `referral_confirmations` | GET | Stato conferma referral (pending/confirmed), device_hash, ip_hash |
| `user_roles` | GET | Ruoli utente: `admin`, `evaluator` (+ `category` opzionale per evaluator) |
| `user_preferences` | GET/POST/PATCH/DELETE | Preferenze alert per categoria airdrop |
| `push_subscriptions` | GET/POST/DELETE | Subscription Web Push (endpoint, keys_p256dh, keys_auth) |

### 5.2 Tabelle — Asset & NFT

| Tabella | Operazione | Cosa fa |
|---|---|---|
| `nft_rewards` | GET/POST | ROBI (nft_type='ROBI'), NFT_ALPHA_TIER0, BADGE_FONDATORE, BADGE_ALPHA_BRAVE, BADGE_VALUATION. Colonne: shares, source, phase, metadata |
| `asset_registry` | GET | Censimento asset ufficiali (ARIA, ROBI, Badge) |

### 5.3 Tabelle — Airdrop engine

| Tabella | Operazione | Cosa fa |
|---|---|---|
| `airdrops` | GET/POST/PATCH | Oggetti in airdrop: status (`in_valutazione`, `valutazione_completata`, `accettato`, `presale`, `sale`, `closed`, `completed`, `annullato`), deadline, block_price_aria, presale_block_price, total_blocks, blocks_sold, winner_id, winner_score, draw_executed_at, draw_scores JSONB, seller_desired_price, seller_min_price, object_value_eur, split revenue cols, product_info JSONB, submitted_by, rejection_reason, cancelled_at, duration_type |
| `airdrop_participations` | GET | Partecipazioni utente: blocks_count, aria_spent, cancelled_at |
| `airdrop_blocks` | GET | Singoli blocchi: owner_id, purchased_at, is_winner_block, purchased_phase |
| `airdrop_config` | GET | Parametri engine key-value (valuation_cost_aria, presale_duration_hours, sale_duration_hours, mining_enabled) |
| `airdrop_messages` | via RPC | Chat proponente ↔ valutatore (body, sender_id, is_admin) |
| `airdrop_watchlist` | GET/POST/DELETE | Preferiti airdrop per utente |
| `auto_buy_rules` | GET/POST/PATCH/DELETE | Regole auto-buy: blocks_per_interval (1-10), interval_hours (1,2,4,6,12), max_blocks, active, last_executed_at |
| `categories` | GET | Categorie airdrop (id, label_it, label_en, sort_order) — 16 categorie attive |
| `treasury_transactions` | GET | Transazioni treasury post-draw (type, amount_eur, airdrop_id) |

### 5.4 Tabelle — Treasury & Business

| Tabella | Operazione | Cosa fa |
|---|---|---|
| `treasury_stats` | GET/PATCH | Stato aggregato: balance_eur, nft_minted/circulating, nft_max_supply, aico_circulating (= ARIA, nome legacy), revenue_ads, revenue_adsense |
| `treasury_funds` | GET/POST | Versamenti Founder nel Fondo Comune (admin only) |
| `company_assets` | GET/POST/PATCH/DELETE | Asset aziendali: fiat, crypto, nft (wallet_address, value_eur, amount) — admin only |
| `cost_tracker` | GET/POST/DELETE | Tracking costi operativi: category (fisso/variabile/una_tantum), status (da_pagare/pagato/free/freemium/abbandonato/in_ritardo) — admin only |

### 5.5 Tabelle — Analytics & Communication

| Tabella | Operazione | Cosa fa |
|---|---|---|
| `events` | POST | Analytics eventi: `event`, `url`, `ua`, `props` JSONB (NON event_type/page/user_agent) |
| `notifications` | GET/PATCH | Notifiche utente: title, body, read, airdrop_id |
| `waitlist` | POST + count | Iscrizione waitlist pre-alpha (lang, source, referral_code) |
| `investor_leads` | POST/GET | Form contatto investitori |

### 5.6 Tabelle — Legacy

| Tabella | Stato |
|---|---|
| `airdrop_manager_permissions` | Legacy, sostituita da `user_roles`. Presente ma non usata |
| `checkins` | Legacy, sostituita da `weekly_checkins` (earnings v2) |

### 5.7 Storage Buckets

| Bucket | Accesso | Contenuto |
|---|---|---|
| `submissions` | Public read, auth upload | Foto oggetti caricati nel form valutazione (multi-foto supportato) |

### 5.8 RPC Functions attive (~60+)

**Auth / Ruoli:**
- `get_my_roles()` — ritorna ruoli utente corrente
- `is_admin()` — helper boolean, usato nelle RLS policy

**ARIA earning:**
- `claim_faucet()` — +100 ARIA/giorno
- `daily_checkin_v2()` — sequenza giornaliera +50 ARIA, +1 ROBI se settimana completa
- `claim_checkin()` — wrapper deprecato → `daily_checkin_v2`
- `get_my_weekly_streak()` — snapshot settimana corrente per UI
- `confirm_referral()` — +5 ROBI inviter + +5 ROBI invitato
- `link_referral(code)` — collega referral_code a profile

**Airdrop engine:**
- `submit_object_for_valuation(...)` — crea airdrop `in_valutazione`, deduce 50 ARIA, supporta multi-foto (`p_image_urls` JSONB)
- `get_my_submissions()`, `get_my_submissions_v2()` — proposte dell'utente
- `withdraw_submission(airdrop_id)` — ritira proposta, rimborsa ARIA anche ai partecipanti se già in sale
- `accept_valuation(airdrop_id)` — venditore accetta quotazione AIROOBI (+1 ROBI submission)
- `reject_valuation(airdrop_id)` — venditore rifiuta quotazione
- `manager_update_airdrop(...)` — admin/evaluator approva/rifiuta/prezza
- `buy_blocks(airdrop_id, n)` — acquisto atomico blocchi (deduce ARIA, inserisce blocks, check Fairness Guard)
- `cancel_participation(airdrop_id)` — annulla partecipazione, rimborso ARIA
- `calculate_winner_score(airdrop_id)` — scoring v4 (ritorna JSONB array ranked)
- `my_category_score_snapshot(airdrop_id)` — card "Come arrivare 1°" per utente
- `execute_draw(airdrop_id)` — draw atomico, ROBI, split revenue
- `get_draw_preview(airdrop_id)` — simula draw senza scrivere (admin)
- `check_auto_draw()` — cron: auto-draw su deadline scadute
- `refund_airdrop(airdrop_id)` — rimborso su annullamento
- `get_airdrop_grid(airdrop_id)`, `get_airdrop_participants(airdrop_id)` — view mosaico + lista
- `get_all_airdrops()` — admin/evaluator bypassa RLS
- `get_completed_airdrops()` — pubblico, ultimi 20
- `get_valuation_cost()`, `get_valuation_count()` — costo submission + conteggio coda
- `user_airdrop_ranks(user_id)` — classifica storica utente
- `user_airdrop_detail_stats(user_id, airdrop_id)` — dettaglio partecipazione
- `get_fairness_analysis(airdrop_id)` — analisi fairness (admin)

**Messaggi / Chat:**
- `send_airdrop_message(airdrop_id, body)`, `get_airdrop_messages(airdrop_id)` — chat valutazione
- `message_notifications(...)` — notifiche messaggi

**Watchlist / Auto-buy / Preferences:**
- `toggle_watchlist(airdrop_id)` — aggiunge/rimuove preferito
- `upsert_auto_buy(...)` — crea/aggiorna regola auto-buy
- `process_auto_buy()` — cron (edge function `process-auto-buy`) esegue regole attive

**Activity / Feed:**
- `activity_feed_rpc(...)` — feed attività per home
- `robi_history_rpc(user_id)` — storico ROBI utente

**Leaderboard / Classifica:**
- `get_user_position()`, `get_leaderboard()` — posizione + top utenti (ceo escluso, test users esclusi)

**Push / Notifications:**
- `save_push_subscription(endpoint, keys_p256dh, keys_auth)` — salva subscription Web Push
- Edge function `send-push` — invia notifiche push ai subscribers

**Admin utilities:**
- `delete_account(user_id)` — soft delete (deleted_at)
- `collaborators_rpc()` — gestione evaluators
- `admin_robi_check(user_id)` — debug ROBI (ex `debug_robi_check`)

### 5.9 Cron Jobs (Supabase pg_cron o edge function scheduler)

| Cron | Frequenza | Cosa fa |
|---|---|---|
| `check-deadlines` | Ogni 5 min | Controlla deadline airdrop → auto-draw |
| `process-auto-buy` | Ogni ora (adattativo sub-hour per intervalli brevi) | Esegue regole auto-buy attive |
| `auto_state_transitions` | Ogni ora | Presale → sale → closed transitions |

### 5.10 Auth endpoints

| Endpoint | Cosa fa |
|---|---|
| `/auth/v1/signup` | Registrazione (autoconfirm ON, trigger `handle_new_user`) |
| `/auth/v1/token` | Login |
| `/auth/v1/recover` | Reset password |

---

## 6. Sistema Ruoli

| Ruolo | Accesso | Come si assegna |
|---|---|---|
| `admin` | Tutto: pannello admin, treasury, gestione airdrop, ruoli, company_assets, costi | Manual via SQL su `user_roles`. Default: `ceo@airoobi.com` e `tommaso.pecorella+ceo@outlook.com` |
| `evaluator` | Backoffice valutazione airdrop (`abo.html`), opzionale filtro categoria | Assegnato da admin via `collaborators_rpc` |

RPC `get_my_roles()` ritorna array ruoli per utente corrente. La legacy `airdrop_manager_permissions` è migrata ma ancora presente (non usata).

---

## 7. Service Worker & PWA

- `manifest.json`: nome, icone, start_url, display mode
- `sw.js`: cache offline + push notifications listener
- `offline.html`: fallback quando rete assente
- `push_subscriptions`: salvate via `save_push_subscription` RPC
- Notifiche push attivate per: airdrop publish, message notifications, auto_buy success, draw completed

---

## 8. Riferimenti cross-doc

- **BUS-001** `AIROOBI_Foundations_v3.md` (v3.5) — stato progetto + fasi
- **BUS-002** `AIROOBI_Tokenomics_v3.md` (v3.5) — economia + earnings v2 + scoring v4
- **BUS-008** `AIROOBI_Airdrop_Engine_v2.md` (v2.5) — algoritmo draw + Fairness Guard
- **TECH-CONTEXT** `AIROOBI_CONTEXT.md` — KT completo per CCP/CLA
- **sql/schema_backup.sql** — snapshot schema DB (21 Apr 2026, post Engine v2 + earnings v2)
- **memory/project_phases_thresholds.md** — fasi Alpha/Beta/Pre-Prod/Mainnet
