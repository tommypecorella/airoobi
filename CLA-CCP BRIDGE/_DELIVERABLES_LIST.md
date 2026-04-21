# Deliverable List — Snapshot 2026-04-21

Lista completa dei deliverable AIROOBI con stato reale al 21 Aprile 2026. Fonte: `01_deliverables_docs/REGISTRY.md` + `AIROOBI_CONTEXT.md` + MEMORY.md di CCP, integrato con lo stato live.

> REGISTRY.md nel repo è fermo all'08 Mar 2026 (Stage 0 chiuso). Questa lista riflette lo stato corrente.

---

## BUSINESS (BUS)

| ID | Titolo | Stato | File | Note |
|---|---|---|---|---|
| BUS-001 | Fondamenti e Vision (v3.1) | ⚠️ Stage outdated | `business/AIROOBI_Foundations_v3.md` | Contenuti validi, ma stage fermo; molte feature Stage 1 già live |
| BUS-002 | Tokenomics (v3.2) | ⚠️ Parziale | `business/AIROOBI_Tokenomics_v3.md` | Manca costo submission (50 ARIA) e dettagli airdrop_config |
| BUS-003 | Forecast Finanziario | 📦 Archivio old | `business/old/AIROOBI_Year1_Forecast_v1.2_FINAL.docx` | Non più in .md |
| BUS-004 | Struttura dei Costi (v2.1) | ✅ | `business/AIROOBI_Cost_Org_v2.md` | Include team/infra |
| BUS-005 | Struttura Organizzativa | ✅ | `business/AIROOBI_Cost_Org_v2.md` | Unificato con BUS-004 |
| BUS-006 | Analisi Competitiva (v2.1) | ✅ | `business/AIROOBI_Cost_Org_v2.md` | Unificato con BUS-004 |

---

## BRAND

| ID | Titolo | Stato | File |
|---|---|---|---|
| BRAND-001 | Brand Guidelines v3.1 | ✅ | `business/AIROOBI_Brand_Guidelines_v3.md` |
| BRAND-ASSETS | Loghi + simboli | ✅ | `brand-identity/` (PNG) + `06_public_assets/images/AIROOBI_*` |

---

## TECH / PRODUCT

| ID | Titolo | Stato | File |
|---|---|---|---|
| TECH-001 | Tokenomics / token mechanics | ⚠️ Parziale | `business/AIROOBI_Tokenomics_v3.md` |
| TECH-002 | Sitemap / product architecture (v2.2) | ❌ Molto outdated | `business/AIROOBI_Sitemap_v2.md` — manca dapp.html, abo.html, 8+ tabelle DB, 20+ RPC, sistema ruoli |
| TECH-ENGINE | Airdrop Engine v1/v2 | ✅ | `business/AIROOBI_Airdrop_Engine_v1.md`, `v2.md` |
| TECH-CONTEXT | Handoff completo CCP | ✅ | `AIROOBI_CONTEXT.md` (documento KT principale) |
| BEA-001 | Architettura Backend | ✅ | `tech/BEA-001.md` |
| INF-001 | Stack Software & Servizi | ✅ | `tech/INF-001.md` |
| INF-002 | ARIA Dev Agent Setup | ✅ | `tech/INF-002.md` |
| TEST-001 | Playwright Testing | ✅ | `tech/AIROOBI_Testing_Playwright.md` |

---

## LEGAL

| ID | Titolo | Stato | File |
|---|---|---|---|
| LEG-001 | Framework Legale | 📦 Archivio old | `business/old/AIROOBI_Legal_v1.1_FINAL.docx` |

---

## BRIDGE / PROTOCOL

| Titolo | Stato | File |
|---|---|---|
| REGOLE CCP ↔ CLA | ✅ | `bridge/REGOLE.md` |
| Bridge journal live | ✅ | `bridge/cla-ccp-bridge.md` |

---

## SQL / DATA

| File | Stato | Note |
|---|---|---|
| `sql/schema_backup.sql` | ❌ Pre-Engine | Mancano tabelle airdrop + categories + notifications + user_roles |
| `sql/treasury_stats.sql` | ⚠️ | RLS con solo una email admin |
| `sql/cost_tracker.sql` | ✅ | |
| `sql/asset_registry.sql` | ✅ | |
| `07_supabase/migrations/` | ✅ Source of truth | ~120 migration SQL incrementali, autoritative |

---

## BACKLOG / CONTEXT

| File | Ruolo |
|---|---|
| `AIROOBI_CONTEXT.md` | Handoff completo, KT per Cla, stato reale del progetto |
| `BACKLOG_ROBI.md` | Backlog dedicato ROBI |
| `REGISTRY.md` | Registro storico (08 Mar 2026, outdated) |

---

## PAGINE LIVE (airoobi.com / airoobi.app)

### Sito istituzionale (airoobi.com)
`home.html` (homepage), `come-funziona-airdrop.html`, `faq.html`, `contatti.html`, `privacy.html`, `termini.html`, `vendi.html`, `investitori.html`, `explorer.html`, `blog.html`, `airoobi-explainer.html`, `airoobi-cards.html`, `video-airdrop.html`, `video-intro.html`, `landing.html`, `offline.html`

### dApp (airoobi.app)
`dapp.html` (marketplace airdrop), `abo.html` (pannello admin/backoffice), `airdrop.html` (pagina singolo airdrop)

### Auth (entrambi domini)
`login.html`, `signup.html`, `reset-password.html`, `email-confirm.html`, `email-template.html`

### Blog
38 articoli SEO in `04_blog_articles/`

---

## PROSSIMI STEP (Stage 1)

1. SQL nft_rewards su Supabase
2. Postmark SMTP config + verifica email (BLOCCANTE)
3. Template email-confirm.html in Supabase Auth
4. Backend API per acquisto blocchi
5. Primo airdrop live
6. Onboarding Alpha Brave (target 1.000 utenti)
7. Implementare regola "One Category Rule"
8. Rinominare `treasury_stats.aico_circulating` → `aria_circulating` (residuo legacy AICO→ARIA)
