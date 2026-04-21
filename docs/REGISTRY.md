# AIROOBI — MASTER REGISTRY
**Stage Alpha 0 · APERTO** · Last updated: 21 Aprile 2026

---

## STATO GENERALE

| Progetto | AIROOBI — Fair Airdrop Marketplace |
|---|---|
| Blockchain | Kaspa (KRC-20, integrazione on-chain da Stage 2) |
| Stage corrente | **Alpha 0 — APERTO** (DB resettato 11 Mar 2026, ulteriore reset airdrops 28 Mar 2026 e alpha-launch reset 20 Apr 2026) |
| Stage successivo | **Stage 1 — Alpha Launch** (target Q2 2026, 1.000 utenti Alpha Brave) |
| Repo | github.com/tommypecorella/airoobi |
| Live sito | airoobi.com (istituzionale + dashboard + admin) |
| Live dApp | airoobi.app (marketplace airdrop) |
| Versione app | alfa-2026.04.21-3.48.3 |
| Dev agents | CCP (Claude Code su Raspberry Pi 5) + CLA (Claude Desktop) |

---

## DELIVERABLE — BUSINESS

| ID | Titolo | Versione | Stato | File | Note |
|---|---|---|---|---|---|
| BUS-001 | Business Foundations | v3.4 (19 Apr 2026) | ✅ Aggiornato | `business/AIROOBI_Foundations_v3.md` | Fasi 4-stadi (Alpha/Beta/Pre-Prod/Mainnet), soglie utenti come criterio CORE |
| BUS-002 | Tokenomics & Economic Model | v3.4 (19 Apr 2026) | ✅ Aggiornato | `business/AIROOBI_Tokenomics_v3.md` | Include earnings v2, scoring v4, welcome grant Alpha-Net |
| BUS-003 | Forecast Finanziario | v1.2 FINAL | 📦 Archivio | `business/old/AIROOBI_Year1_Forecast_v1.2_FINAL.docx` | Formato .docx, da riconvertire in .md |
| BUS-004 | Costi & Organizzazione | v2.1 | ✅ | `business/AIROOBI_Cost_Org_v2.md` | Unifica costi + struttura org + competitivo |
| BUS-005 | Struttura Organizzativa | — | ✅ | `business/AIROOBI_Cost_Org_v2.md` | Unificato con BUS-004 |
| BUS-006 | Analisi Competitiva | — | ✅ | `business/AIROOBI_Cost_Org_v2.md` | Unificato con BUS-004 |
| BUS-007 | Airdrop Engine v1 | v1 | 📁 Storico | `business/AIROOBI_Airdrop_Engine_v1.md` | Motore algoritmico prima versione |
| BUS-008 | Airdrop Engine v2 | v2.5 (19 Apr 2026) | ✅ Live | `business/AIROOBI_Airdrop_Engine_v2.md` | Engine in produzione con scoring v4, Fairness Guard, mining model |

---

## DELIVERABLE — BRAND

| ID | Titolo | Stato | File |
|---|---|---|---|
| BRAND-001 | Brand Guidelines v3.1 | ✅ | `business/AIROOBI_Brand_Guidelines_v3.md` |
| BRAND-ASSETS | Loghi + simboli PNG | ✅ | `brand-identity/AIROOBI_Logo_*.png`, `AIROOBI_Symbol_*.png` |

---

## DELIVERABLE — TECH / PRODUCT

| ID | Titolo | Versione | Stato | File |
|---|---|---|---|---|
| TECH-001 | Token mechanics | v3.4 | ✅ | `business/AIROOBI_Tokenomics_v3.md` |
| TECH-002 | Sitemap / Product Structure | v2.5 (21 Apr 2026) | ✅ Aggiornato | `business/AIROOBI_Sitemap_v2.md` |
| TECH-CONTEXT | Knowledge Transfer (handoff CCP↔CLA) | Live | ✅ | `AIROOBI_CONTEXT.md` |
| BACKLOG-ROBI | Backlog ROBI dettagliato | Live | ✅ | `BACKLOG_ROBI.md` |

---

## DELIVERABLE — BACKEND & INFRA

| ID | Titolo | Stato | File |
|---|---|---|---|
| BEA-001 | Architettura Backend | ✅ | `tech/BEA-001.md` |
| INF-001 | Stack Software & Servizi | ✅ | `tech/INF-001.md` |
| INF-002 | Dev Agent Setup (CCP + CLA) | ✅ | `tech/INF-002.md` |
| TEST-001 | Playwright Testing Framework | ✅ | `tech/AIROOBI_Testing_Playwright.md` |

---

## DELIVERABLE — SQL / DATA

| File | Stato | Note |
|---|---|---|
| `sql/schema_backup.sql` | ✅ Aggiornato 21 Apr 2026 | Snapshot schema completo con 30+ tabelle post-Engine v2 |
| `sql/treasury_stats.sql` | ✅ Aggiornato 21 Apr 2026 | RLS usa `is_admin()` per entrambi gli admin |
| `sql/cost_tracker.sql` | ✅ | Schema tracking costi operativi |
| `sql/asset_registry.sql` | ✅ | Censimento asset: ARIA, ROBI, BADGE_FONDATORE, NFT_ALPHA_TIER0 |
| `../supabase/migrations/` | ✅ Source of truth | ~120 migration SQL incrementali autoritative |

---

## DELIVERABLE — LEGAL

| ID | Titolo | Stato | File |
|---|---|---|---|
| LEG-001 | Framework Legale | 📦 Archivio | `business/old/AIROOBI_Legal_v1.1_FINAL.docx` |

---

## DELIVERABLE — BRIDGE / PROTOCOL

| Titolo | Stato | File |
|---|---|---|
| Regole CCP ↔ CLA | ✅ | `bridge/REGOLE.md` |
| Bridge journal operativo | ✅ Live | `bridge/cla-ccp-bridge.md` |
| Mirror materiale per CLA | ✅ | `../CLA-CCP BRIDGE/` (mirror completo repo, ~287 file) |

---

## CHANGELOG VERSIONI APP (dalla v0.7.7)

| Versione | Data | Changelog principale |
|---|---|---|
| v0.7.7 | 08 Mar 2026 | Stage 0 chiuso — prototipo navigabile completo |
| alfa-2026.03.11 | 11 Mar 2026 | **Alpha 0 APERTO** — DB reset, auth live, supabase su vuvlmlpuhovipfwtquux |
| alfa-2026.03.25 | 25 Mar 2026 | Domain split: airoobi.com (sito) + airoobi.app (dApp). `index.html` → `home.html` |
| alfa-2026.03.28 | 28 Mar 2026 | Airdrop Engine v2 live, multi-photo submissions, chat valutazione |
| alfa-2026.04.01 | 01 Apr 2026 | ads.txt split per dominio, treasury_funds, aria_faucet, Alpha Brave badge |
| alfa-2026.04.07 | 07 Apr 2026 | Watchlist, user_preferences, push_subscriptions, auto_buy_rules, activity feed, robi history |
| alfa-2026.04.10 | 10 Apr 2026 | Cancel participation, company_assets, message_notifications |
| alfa-2026.04.15 | 15 Apr 2026 | Scoring v3 two-factors + global category norm |
| alfa-2026.04.19 | 19 Apr 2026 | **Earnings v2** (streak daily 50 ARIA, weekly 1 ROBI, referral 5+5 ROBI). **Scoring v4** (anti-gambling, ARIA cumulative per categoria). Early-close lockdown |
| alfa-2026.04.20 | 20 Apr 2026 | Alpha-launch reset (airdrops puliti), **welcome grant Alpha-Net** (1000 ARIA + 5 ROBI ad ogni nuovo utente) |
| alfa-2026.04.21 | 21 Apr 2026 | drop test infrastructure, fix RPC test_user refs. Streak → Sequenza (IT) |

---

## PENDING STAGE 1

### Bloccanti
- **Postmark SMTP** — attivazione + verifica email (in attesa approvazione)
- **Template `email-confirm.html`** in Supabase Auth (una volta Postmark live)
- **Smart contract KRC-20 Kaspa** per ARIA + Tessere (da Stage 2)

### Feature da completare
- Primo airdrop reale live (non test pool)
- Onboarding **Alpha Brave** — target 1.000 utenti
- Implementare in UI la regola **One Category Rule** (già nel scoring v4, manca enforcement a UI)
- Gestione ruoli via FE (ora solo SQL raw)
- Rinominare `treasury_stats.aico_circulating` → `aria_circulating` (residuo legacy AICO→ARIA)

### Roadmap post-Alpha
Vedi `memory/project_phases_thresholds.md` (4 fasi Alpha/Beta/Pre-Prod/Mainnet con soglie utenti 1k/5k/10k).

---

## REFERENCES

- **AIROOBI_CONTEXT.md** — handoff completo, documento di verità per stato reale
- **Memory CCP** (`/home/drskeezu/.claude/projects/-home-drskeezu-projects-airoobi/memory/MEMORY.md`) — feedback operativi e decisioni
- **Bridge journal** (`bridge/cla-ccp-bridge.md`) — scambio operativo CCP↔CLA in corso
