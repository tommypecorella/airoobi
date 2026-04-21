# Deliverable List — Snapshot 2026-04-21 (post update)

Lista completa dei deliverable AIROOBI con stato reale al 21 Aprile 2026. Tutti i deliverable `.md` principali sono stati **aggiornati in questa sessione** per riflettere lo stato live.

---

## BUSINESS (BUS)

| ID | Titolo | Versione | Stato | File |
|---|---|---|---|---|
| BUS-001 | Business Foundations | **v3.5** (21 Apr 2026) | ✅ Aggiornato | `01_deliverables_docs/business/AIROOBI_Foundations_v3.md` |
| BUS-002 | Tokenomics & Economic Model | **v3.5** (21 Apr 2026) | ✅ Aggiornato | `01_deliverables_docs/business/AIROOBI_Tokenomics_v3.md` |
| BUS-003 | Forecast Finanziario | v1.2 FINAL | 📦 Archivio .docx | `01_deliverables_docs/business/old/AIROOBI_Year1_Forecast_v1.2_FINAL.docx` |
| BUS-004 | Costi & Organizzazione | v2.1 | ✅ Valido | `01_deliverables_docs/business/AIROOBI_Cost_Org_v2.md` |
| BUS-005 | Struttura Organizzativa | — | ✅ Unificato BUS-004 | stesso file |
| BUS-006 | Analisi Competitiva | — | ✅ Unificato BUS-004 | stesso file |
| BUS-007 | Airdrop Engine v1 | v1 | 📁 Storico | `01_deliverables_docs/business/AIROOBI_Airdrop_Engine_v1.md` |
| BUS-008 | Airdrop Engine v2 | **v2.5** (19 Apr 2026) | ✅ Live | `01_deliverables_docs/business/AIROOBI_Airdrop_Engine_v2.md` |

---

## BRAND

| ID | Titolo | Versione | Stato | File |
|---|---|---|---|---|
| BRAND-001 | Brand Guidelines | v3.1 | ✅ Valido | `01_deliverables_docs/business/AIROOBI_Brand_Guidelines_v3.md` |
| BRAND-ASSETS | Loghi + simboli PNG | — | ✅ | `01_deliverables_docs/brand-identity/AIROOBI_*.png` |

---

## TECH / PRODUCT

| ID | Titolo | Versione | Stato | File |
|---|---|---|---|---|
| TECH-001 | Token mechanics | v3.5 | ✅ Aggiornato | → BUS-002 |
| TECH-002 | Sitemap / Product Structure | **v2.5** (21 Apr 2026) | ✅ Aggiornato | `01_deliverables_docs/business/AIROOBI_Sitemap_v2.md` |
| TECH-CONTEXT | Knowledge Transfer (CCP↔CLA) | Live | ✅ | `01_deliverables_docs/AIROOBI_CONTEXT.md` |
| BACKLOG-ROBI | Backlog ROBI | Live | ✅ | `01_deliverables_docs/BACKLOG_ROBI.md` |

---

## INFRASTRUTTURA

| ID | Titolo | Stato | File |
|---|---|---|---|
| BEA-001 | Architettura Backend | ✅ | `01_deliverables_docs/tech/BEA-001.md` |
| INF-001 | Stack Software & Servizi | ✅ | `01_deliverables_docs/tech/INF-001.md` |
| INF-002 | ARIA Dev Agent Setup | ✅ | `01_deliverables_docs/tech/INF-002.md` |
| TEST-001 | Playwright Testing | ✅ | `01_deliverables_docs/tech/AIROOBI_Testing_Playwright.md` |

---

## LEGAL

| ID | Titolo | Stato | File |
|---|---|---|---|
| LEG-001 | Framework Legale | 📦 Archivio .docx | `01_deliverables_docs/business/old/AIROOBI_Legal_v1.1_FINAL.docx` |

---

## BRIDGE / PROTOCOL

| Titolo | Stato | File |
|---|---|---|
| Regole CCP ↔ CLA | ✅ | `01_deliverables_docs/bridge/REGOLE.md` |
| Bridge journal | ✅ Live | `01_deliverables_docs/bridge/cla-ccp-bridge.md` |
| Mirror materiale (questa cartella) | ✅ | `CLA-CCP BRIDGE/` (root repo) |

---

## SQL / DATA

| File | Stato | Note |
|---|---|---|
| `01_deliverables_docs/sql/schema_backup.sql` | ✅ **Aggiornato 21 Apr 2026** | 28 tabelle post-Engine v2 + earnings v2 |
| `01_deliverables_docs/sql/treasury_stats.sql` | ✅ **Aggiornato 21 Apr 2026** | RLS via `user_roles` (non più email hardcoded) |
| `01_deliverables_docs/sql/cost_tracker.sql` | ✅ | Tracking costi operativi |
| `01_deliverables_docs/sql/asset_registry.sql` | ✅ | Censimento asset |
| `07_supabase/migrations/` | ✅ Source of truth | ~120 migration SQL autoritative |

---

## BACKLOG / CONTEXT

| File | Ruolo |
|---|---|
| `AIROOBI_CONTEXT.md` | Handoff completo, KT per CLA, stato reale del progetto |
| `BACKLOG_ROBI.md` | Backlog dedicato ROBI |
| `REGISTRY.md` | **Aggiornato 21 Apr 2026** — registro master con changelog versioni app |

---

## PAGINE LIVE (airoobi.com / airoobi.app)

### Sito istituzionale (airoobi.com)
`home.html`, `come-funziona-airdrop.html`, `faq.html`, `contatti.html`, `privacy.html`, `termini.html`, `vendi.html`, `investitori.html`, `explorer.html`, `blog.html`, `airoobi-explainer.html`, `airoobi-cards.html`, `video-airdrop.html`, `video-intro.html`, `landing.html`, `offline.html`

### dApp (airoobi.app)
`dapp.html` (marketplace), `abo.html` (admin backoffice), `airdrop.html` (dettaglio airdrop)

### Auth (entrambi domini)
`login.html`, `signup.html`, `reset-password.html`, `email-confirm.html`, `email-template.html`

### Blog
38 articoli SEO in `04_blog_articles/`

---

## PROSSIMI STEP — Stage 1 (dal REGISTRY.md aggiornato)

### Bloccanti
1. **Postmark SMTP** attivazione + verifica email
2. Template `email-confirm.html` in Supabase Auth
3. Smart contract KRC-20 Kaspa per ARIA + ROBI (Stage 2)

### Feature
4. Primo airdrop reale live (non test)
5. Onboarding **Alpha Brave** — target 1.000 utenti
6. **One Category Rule** — enforcement in UI (logica già in scoring v4)
7. Gestione ruoli via FE (ora solo SQL raw)
8. Rinominare `treasury_stats.aico_circulating` → `aria_circulating`

### Roadmap post-Alpha
Vedi memory `project_phases_thresholds.md` — 4 fasi: **Alpha** (0→1k) · **Beta** (1k→5k) · **Pre-Prod** (5k→10k) · **Mainnet** (10k+). Soglia utenti = criterio CORE.
