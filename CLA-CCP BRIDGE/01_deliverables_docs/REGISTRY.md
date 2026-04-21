# AIROOBI — MASTER REGISTRY
**Stage 0 · Closed** · Last updated: 08 Mar 2026

---

## STATO GENERALE

| Progetto | AIROOBI — Fair Airdrop Marketplace |
|---|---|
| Blockchain | Kaspa |
| Stage corrente | Stage 0 — Alpha Setup (CHIUSO) |
| Stage successivo | Stage 1 — Alpha Launch |
| Repo | github.com/tommypecorella/airoobi |
| Live | airoobi.com |
| Dev agent | ARIA (OpenClaw + Claude Code su Raspberry Pi 5) |

---

## DELIVERABLE — BUSINESS

| ID | Titolo | Stato | Note |
|---|---|---|---|
| BUS-001 | Fondamenti e Vision | ✅ Completato | Modello AIROOBI, meccanismo core |
| BUS-002 | Tokenomics | ✅ Completato | ARIA, Tessere, Fondo Comune |
| BUS-003 | Forecast Finanziario | ✅ Completato | Proiezioni Alpha → Mainnet |
| BUS-004 | Struttura dei Costi | ✅ Completato | Infrastruttura, team AI, ops |
| BUS-005 | Struttura Organizzativa | ✅ Completato | Fondatore + AI agents come staff |
| BUS-006 | Analisi Competitiva | ✅ Completato | Posizionamento vs competitor |

---

## DELIVERABLE — LEGALE

| ID | Titolo | Stato | Note |
|---|---|---|---|
| LEG-001 | Framework Legale | ✅ Completato | Distinzione da gambling, GDPR, NFT |

---

## DELIVERABLE — PRODOTTO

| ID | Titolo | Stato | Note |
|---|---|---|---|
| PRD-001 | Product Requirements | ✅ Completato | Feature set completo |
| PRD-002 | React Mockup | ✅ Completato | Componenti UI base |
| PRD-003 | Prototipo HTML Standalone | ✅ Completato | 122KB, 20+ schermate collegate |
| PRD-004 | Category Strategy | ✅ Completato | Posizionamento marketplace |
| PRD-005 | Growth & Gamification | ✅ Completato | Check-in, streak, referral, missioni |
| MOCKUP-001 | Prototipo Navigabile v0.7.7 | ✅ Completato | Percorso utente completo, live su airoobi.com |

---

## DELIVERABLE — BACKEND & ARCHITETTURA

| ID | Titolo | Stato | Note |
|---|---|---|---|
| BEA-001 | Architettura Backend | ✅ Completato | Stack completo, DB schema, RLS |

---

## DELIVERABLE — INFRASTRUTTURA

| ID | Titolo | Stato | Note |
|---|---|---|---|
| INF-001 | Stack Software & Servizi | ✅ Completato | Servizi attivi, costi, roadmap infra |
| INF-002 | ARIA — Dev Agent Setup | ✅ Completato | OpenClaw, Claude Code, Telegram, Pi 5 |

---

## VERSIONE PROTOTIPO LIVE

| Versione | Data | Changelog |
|---|---|---|
| v0.1 | Gen 2026 | Landing page base |
| v0.5 | Feb 2026 | Auth Supabase, dashboard base |
| v0.7.0 | Mar 2026 | Portafoglio tessere, swap, referral |
| v0.7.3 | 08 Mar 2026 | Fix JS WhatsApp, redesign tessere orizzontale, fix explainer |
| v0.7.4 | 08 Mar 2026 | Nav mobile solo burger, tessere concetto proxy wallet |
| v0.7.5 | 08 Mar 2026 | Modali Privacy/Terms bilingui IT+EN |
| v0.7.6 | 08 Mar 2026 | Footer fix Investitori→modal |
| v0.7.7 | 08 Mar 2026 | Footer fix Contatti→mailto |

---

## STAGE 0 — CHECKLIST CHIUSURA

- [x] Landing page live con sezioni complete
- [x] Sistema auth (registrazione, login, email confirm)
- [x] Dashboard utente (portafoglio, tessere, referral, missioni)
- [x] Prototipo navigabile completo
- [x] Privacy Policy e Terms bilingui
- [x] Google AdSense applicato (in revisione)
- [x] A-ADS banner attivo
- [x] Cloudflare Web Analytics attivo
- [x] Vercel Analytics attivo
- [x] Supabase: tabelle users, events, referrals, nft_rewards
- [x] ARIA dev agent operativo sul Pi 5
- [x] Documentazione business completa (BUS-001~006)
- [x] Framework legale (LEG-001)
- [x] Architettura backend documentata (BEA-001)
- [ ] Postmark approvazione SMTP (in attesa)
- [ ] Google AdSense approvazione finale
- [ ] SQL nft_rewards da eseguire su Supabase

---

## PROSSIMI STEP — STAGE 1

- Attivazione Postmark → email transazionali live
- SQL nft_rewards su Supabase
- Backend: endpoint API per acquisto blocchi
- Sistema airdrop alpha: primo evento live
- Onboarding Alpha Brave (target: 1.000 utenti)
