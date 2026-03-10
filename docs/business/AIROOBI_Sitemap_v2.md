# AIROOBI — Sitemap & Product Structure
**TECH-002 · Version 2.1 · Final · 10 Marzo 2026**

> v2.0: File unico index.html (non più app.html + index.html). Hash-based routing. /contact → 404. Tutte le schermate integrate.

---

## 1. Architettura File System (Stage 0 — Produzione)

> ⚠️ **IMPORTANTE:** L'intera app è un singolo file HTML — `index.html`. Non esistono file separati app.html o business.html. Il routing è hash-based (#) e funziona sotto protocollo `file://` senza CORS.

| File | Percorso | Contenuto | Note |
|---|---|---|---|
| index.html | / | Intera SPA: landing, auth, app, admin | File unico ~3.400 righe — CSS/JS inline |
| Logo wordmark | /public/images/Logo_long_airoobi_transparent.png | Logo esteso | PNG trasparente |
| Logo symbol | /public/images/Logo_short_airoobi_transparent.png | Solo OO | PNG trasparente |
| ads.txt | /ads.txt | Google AdSense + A-ADS | Necessario per AdSense |
| /docs/ | /docs/ | Documentazione progetto | Cartelle: business/, legal/, product/, tech/ |

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

### 2.2 App Pages (Post-Auth)

| Page | Tab / Sezione | Descrizione |
|---|---|---|
| Marketplace | #marketplace | Grid airdrop P2P + Business, filtri categoria, search |
| Portafoglio | #portafoglio | Le 3 Tessere (Coin, Rendimento, Kaspa), swap, Fondo Comune |
| Dashboard | #dashboard | Stats personali, check-in, streak, missioni |
| NFT Portfolio | #nft | Lista NFT posseduti, valore, storico |
| Leaderboard | #leaderboard | Classifica utenti per ARIA/blocchi |
| Referral | #referral | Link personale, statistiche, reward |
| Profilo / KYC | #profilo | Dati utente, info account, verifica email, elimina account |
| Help / FAQ | #help | Guide, FAQ, chat support |
| Admin Panel | #admin (solo admin) | Visibile solo a tommaso.pecorella@outlook.com |

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
4. Conferma email via link → redirect su airoobi.com con overlay "Email verificata!"
5. Primo login: welcome bonus +10 ARIA + auto-confirm referral se presente

### 3.2 Flusso Acquisto Blocchi
1. User naviga Marketplace → seleziona oggetto → visualizza dettaglio
2. Seleziona N blocchi → sistema mostra riepilogo (N × prezzo ARIA = totale)
3. Preme "Acquista" → VIDEO INTERSTITIAL 15s
4. Dopo video: blocchi assegnati → Tessera Rendimento aggiornata
5. Notifica: "Hai acquistato X blocchi!"

### 3.3 Flusso Swap Tessera Rendimento → KAS
1. User va su tab Portafoglio → Tessera Rendimento
2. Preme "Converti" → inserisce importo (parte o tutto il saldo)
3. VIDEO INTERSTITIAL 15s obbligatorio
4. Dopo video: richiesta elaborazione 24-48h, rimborso garantito 95%
5. KAS accreditati nella Tessera Kaspa

---

## 4. Tech Stack Frontend

| Layer | Tecnologia | Note |
|---|---|---|
| Struttura | HTML5 + Vanilla JS | SPA hash-based, file unico index.html |
| Styling | CSS custom properties | `--black`, `--gold`, `--white`, `--aria`, `--kas` |
| Font | Google Fonts CDN | Cormorant Garamond + Instrument Sans + DM Mono |
| Auth/DB | Supabase JS SDK v2 | Client-side, RLS abilitato |
| Deploy | Vercel | Auto-deploy da push GitHub main |
| DNS/CDN | Cloudflare | Proxy + Analytics + SSL |
| Ads | A-ADS iframe + Google AdSense | A-ADS banner #2429619 attivo · AdSense in revisione |

---

## 5. Supabase — Tabelle e RPC attive

| Tabella/Endpoint | Operazione | Cosa fa |
|---|---|---|
| waitlist | POST + SELECT count | Iscrizione waitlist + conteggio |
| events | POST | Analytics/tracking eventi |
| profiles | GET/POST/PATCH | Profilo utente, total_points, streak, referral_code |
| points_ledger | GET/POST | Registro punti (login_bonus, daily_checkin, video_view...) |
| nft_rewards | GET/POST | NFT EARN + NFT ALPHA BRAVE |
| checkins | GET/POST | Check-in giornaliero |
| video_views | GET/POST | Visualizzazioni video |
| referral_confirmations | GET | Stato conferma referral |
| treasury_stats | GET | Bilancio fondo EUR, NFT mintati, valore unitario |
| investor_leads | POST/GET | Form contatto investitori |
| rpc/confirm_referral | POST | Conferma referral (+10 ARIA referrer, +15 ARIA invitato) |
| rpc/link_referral | POST | Collega referral a profilo |
| rpc/daily_checkin | POST | Esegue check-in |
| rpc/get_user_position | POST | Posizione utente server-side (aggiunto Stage 0) |
| Auth /auth/v1/signup | POST | Registrazione |
| Auth /auth/v1/token | POST | Login |
