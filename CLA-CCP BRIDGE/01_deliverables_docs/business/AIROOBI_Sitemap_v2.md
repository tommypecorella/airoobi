# AIROOBI — Sitemap & Product Structure
**TECH-002 · Version 2.4 · Final · 19 Aprile 2026**

> v2.4 (19 Apr 2026): `airdrop.html` standalone (pagina dettaglio singolo airdrop, rotta `/airdrop/:slug`). Topbar arricchita con avatar utente + dropdown (Home, Esplora, I miei airdrop, Portafoglio, Vendi, Invita, Logout). Fairness Guard estesa all'Auto-Buy. UI refresh: icone flat monocromatiche (SVG Lucide-style), KPI ridenominati (Vantaggio/Impegno/Punteggio), banner A-ADS rimosso dalla dApp.
> v2.3: Architettura multi-file (home.html, dapp.html, login.html, signup.html, abo.html, vendi.html). Host-based routing Vercel (airoobi.com + airoobi.app). Tabelle DB airdrop engine complete. Multi-photo upload. Chat valutazione. "dApp" → "APP".
> v2.2: Hash routing esteso. Tabelle DB aggiornate. RPC corretti. Autoconfirm email ON.

---

## 1. Architettura File System (Stage 0 — Produzione)

> **Architettura multi-file** con host-based routing via Vercel rewrites (vercel.json).
> Due domini: **airoobi.com** (sito istituzionale) e **airoobi.app** (marketplace airdrop).

| File | Dominio | Contenuto | Note |
|---|---|---|---|
| home.html | airoobi.com / | Sito istituzionale + dashboard utente + admin panel | CSS/JS in src/ |
| dapp.html | airoobi.app / | Marketplace airdrop: esplora, compra blocchi, valuta, gestione | CSS/JS in src/ |
| login.html | entrambi | Pagina login | Parametro `returnTo` per redirect |
| signup.html | entrambi | Pagina registrazione | Supporto referral code |
| abo.html | airoobi.app /abo | Admin Back Office — draw preview/execute | |
| vendi.html | airoobi.com /vendi | Landing venditori | |
| Logo wordmark | /public/images/Logo_long_airoobi_transparent.png | Logo esteso | PNG trasparente |
| Logo symbol | /public/images/Logo_short_airoobi_transparent.png | Solo OO | PNG trasparente |
| ads.txt | /ads.txt | Google AdSense + A-ADS | Necessario per AdSense |
| /blog/ | airoobi.com /blog/ | Articoli SEO | HTML statici |
| /docs/ | — | Documentazione progetto | Non pubblico |

---

## 2. Routing Hash-Based

### 2.1 Public Pages (Pre-Auth)

| Page | Hash / Trigger | Descrizione |
|---|---|---|
| Landing / Auth | / (default) | Splash screen con login, signup, selezione UTENTE/AZIENDA |
| Video Interstitial Login | Automatico al login | Video sponsor 15s obbligatorio → poi accesso app |
| Privacy | `openModal('privacy-modal')` | Privacy policy e GDPR — modale overlay bilingue IT/EN |
| Termini | `openModal('terms-modal')` | Termini di servizio — modale overlay bilingue IT/EN |
| Contatti | `mailto:info@airoobi.com` | Link mailto diretto — NON più pagina /contact |

### 2.2 App Pages (Post-Auth) — Implementati

| Page | Hash | Tab switchTab() | Descrizione |
|---|---|---|---|
| Dashboard / Profilo | #dashboard / #profilo | overview | Stats personali, profilo, posizione, admin link |
| Portafoglio | #portafoglio | tessere | Le 3 Tessere (Coin, ROBI, Kaspa), saldi |
| Guadagni | #guadagni | earnings | Check-in, video, streak, storico punti |
| Referral | #referral | referral | Link personale, statistiche, reward |
| Admin Panel | #admin (solo admin) | — | Visibile solo a tommaso.pecorella+ceo@outlook.com, ceo@airoobi.com |

> Ogni pagina ha breadcrumb `AIROOBI > [Sezione]` e bottone `← Torna alla home`.

### 2.2b App Pages — Pianificati (non ancora implementati)

| Page | Hash | Stato |
|---|---|---|
| Marketplace | #marketplace | Stage 1 |
| NFT Portfolio | #nft | Stage 1 |
| Leaderboard | #leaderboard | Stage 1 |
| Help / FAQ | #help | Stage 1 |

### 2.3 Business Section

| Page | Trigger | Descrizione |
|---|---|---|
| Registrazione Azienda | Selezione "Azienda" in signup | Form espanso: ragione sociale, P.IVA, settore |
| Business Dashboard | #business (dopo approvazione) | Statistiche campagne: reach, azioni, budget |
| Crea Campagna | Wizard in-app | 4 step: Dettagli → Azioni → Target → Riepilogo |

---

## 3. UX Flow Principali

### 3.1 Flusso Login
1. User su landing → inserisce email/password → preme "Accedi"
2. Cloudflare Turnstile verifica anti-bot (invisibile)
3. VIDEO INTERSTITIAL 15s (obbligatorio, non-skippabile)
4. Dopo video: accesso app → tab Profilo
5. Auto logout su scadenza sessione JWT o TOKEN_REFRESH_FAILED

### 3.1b Flusso Signup
1. User inserisce email/password → validazione password robusta (min 8 char, maiuscola, minuscola, numero, speciale)
2. Indicatore forza password (debole/media/forte)
3. Cloudflare Turnstile verifica anti-bot
4. **Autoconfirm ON** — nessuna conferma email richiesta. L'utente entra subito.
5. Primo login: welcome bonus +10 ARIA + auto-confirm referral se presente

### 3.2 Flusso Acquisto Blocchi
1. User naviga Marketplace → seleziona oggetto → visualizza dettaglio
2. Seleziona N blocchi → sistema mostra riepilogo (N × prezzo ARIA = totale)
3. Preme "Acquista" → VIDEO INTERSTITIAL 15s
4. Dopo video: blocchi assegnati → ROBI aggiornati
5. Notifica: "Hai acquistato X blocchi!"

### 3.3 Flusso Swap ROBI → KAS
1. User va su tab Portafoglio → ROBI
2. Preme "Converti" → inserisce importo (parte o tutto il saldo)
3. VIDEO INTERSTITIAL 15s obbligatorio
4. Dopo video: richiesta elaborazione 24-48h, rimborso garantito 95%
5. KAS accreditati nella Tessera Kaspa

---

## 4. Tech Stack Frontend

| Layer | Tecnologia | Note |
|---|---|---|
| Struttura | HTML5 + Vanilla JS | Multi-file, host-based routing via Vercel |
| Styling | CSS custom properties | `--black`, `--gold`, `--white`, `--aria`, `--kas` |
| Font | Google Fonts CDN | Cormorant Garamond + Instrument Sans + DM Mono |
| Auth/DB | Supabase JS SDK v2 | Client-side, RLS abilitato |
| Deploy | Vercel | Auto-deploy da push GitHub main |
| DNS/CDN | Cloudflare | Proxy + Analytics + SSL |
| Ads | A-ADS iframe + Google AdSense | A-ADS banner #2429619 attivo · AdSense in revisione |

---

## 5. Supabase — Tabelle e RPC attive

### 5.1 Tabelle

| Tabella | Operazione | Cosa fa |
|---|---|---|
| profiles | GET/POST/PATCH | Profilo utente, total_points, streak, referral_code, avatar_url, display_name |
| points_ledger | GET/POST | Registro punti (login_bonus, daily_checkin, video_view, valuation_request...) |
| checkins | GET/POST | Check-in giornaliero (checked_at = data) |
| video_views | GET/POST | Visualizzazioni video |
| referral_confirmations | GET | Stato conferma referral |
| nft_rewards | GET/POST | ROBI (ex NFT_REWARD), NFT_ALPHA_TIER0, BADGE_FONDATORE |
| events | POST | Analytics/tracking eventi |
| waitlist | POST + SELECT count | Iscrizione waitlist + conteggio |
| investor_leads | POST/GET | Form contatto investitori |
| cost_tracker | GET/POST/DELETE | Tracking costi operativi (admin only) |
| treasury_stats | GET/PATCH | Bilancio fondo EUR, NFT mintati, aico_circulating (legacy = ARIA) |
| asset_registry | GET | Censimento asset: ARIA, ROBI, NFT_ALPHA_TIER0, BADGE_FONDATORE |
| user_roles | GET | Ruoli utente (admin, evaluator) |
| categories | GET | Categorie airdrop (mobile, tech, luxury, ultra_luxury) |
| notifications | GET/PATCH | Notifiche utente |
| airdrop_config | GET | Parametri engine (key-value) |
| airdrops | GET/POST/PATCH | Oggetti in airdrop: valutazione, presale, sale, completed |
| airdrop_participations | GET | Partecipazioni utente (blocchi acquistati per airdrop) |
| airdrop_blocks | GET | Singoli blocchi con owner, fase acquisto, winner flag |
| airdrop_messages | — (solo via RPC) | Chat proponente ↔ valutatore per ogni airdrop |
| treasury_transactions | GET | Transazioni treasury generate da draw |

### 5.2 Storage Buckets

| Bucket | Accesso | Contenuto |
|---|---|---|
| submissions | Public read, auth upload | Foto oggetti caricati nel form valutazione |

### 5.3 RPC Functions

| RPC | Cosa fa |
|---|---|
| confirm_referral | Conferma referral (+10 ARIA referrer, +15 ARIA invitato) |
| link_referral | Collega referral a profilo |
| do_checkin | Esegue check-in (blocca duplicati server-side) |
| get_user_position | Posizione utente nella classifica |
| get_my_roles | Ritorna ruoli dell'utente corrente |
| buy_blocks | Acquisto atomico blocchi: deduce ARIA, inserisce blocchi |
| get_airdrop_grid | Griglia blocchi per mosaico UI |
| get_airdrop_participants | Partecipanti con avatar e conteggio blocchi |
| calculate_winner_score | Calcolo punteggio F1/F2/F3 per tutti i partecipanti |
| execute_draw | Draw atomico: seleziona vincitore, distribuisce ROBI, split revenue |
| get_draw_preview | Simula draw senza scrivere (admin only) |
| refund_airdrop | Rimborso ARIA su annullamento |
| check_auto_draw | Cron: auto-draw su deadline scadute |
| get_all_airdrops | Tutti gli airdrop (bypassa RLS, admin/evaluator) |
| manager_update_airdrop | Approva/rifiuta/prezza un airdrop |
| submit_object_for_valuation | Crea airdrop in_valutazione, deduce ARIA, supporta multi-foto (p_image_urls) |
| get_my_submissions | Proposte dell'utente corrente |
| get_valuation_cost | Costo valutazione da config |
| get_valuation_count | Conteggio oggetti in valutazione |
| get_completed_airdrops | Ultimi 20 airdrop completati (pubblico) |
| send_airdrop_message | Invia messaggio nella chat valutazione |
| get_airdrop_messages | Leggi messaggi chat valutazione |

### 5.4 Auth

| Endpoint | Cosa fa |
|---|---|
| /auth/v1/signup | Registrazione (autoconfirm ON) |
| /auth/v1/token | Login |
