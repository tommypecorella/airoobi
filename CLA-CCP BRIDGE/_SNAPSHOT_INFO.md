# Snapshot Info

| Campo | Valore |
|---|---|
| Data snapshot | 2026-04-21 |
| Git commit | (updated post-commit — vedi git log) |
| Branch | main |
| Versione app | alfa-2026.04.21-3.48.3 |
| Stage progetto | Alpha 0 APERTO (DB resettato 11 Mar 2026, alpha-launch reset 20 Apr 2026) |
| Prossimo milestone | Stage 1 — Alpha Launch, target Q2 2026 |

---

## Statistiche contenuto

| Sezione | File |
|---|---|
| Deliverable docs | 48+ |
| Pagine app core | 3 |
| Pagine sito | 21 |
| Articoli blog | 38 |
| Source JS/CSS | 9 |
| Public assets | 14 |
| Supabase (migrations + functions) | 140 |
| Scripts | 4 |
| Config meta | 10 |
| **Totale** | **~287 file, ~40MB** |

---

## Stato documenti — TUTTO ALLINEATO al 21 Apr 2026

Tutti i deliverable chiave aggiornati in questa sessione:

| Deliverable | Versione | Note |
|---|---|---|
| `REGISTRY.md` | 21 Apr 2026 | Aggiornato: Alpha 0 aperto, changelog versioni app, pending Stage 1 reali |
| `AIROOBI_Foundations_v3.md` | v3.5 | Welcome grant Alpha-Net, earnings v2 consolidato, scoring v4, One Category Rule, fasi 4-stadi |
| `AIROOBI_Tokenomics_v3.md` | v3.5 | Sequenza giornaliera 50 ARIA, referral 5+5 ROBI, welcome 1000 ARIA + 5 ROBI, submission fee 50 ARIA, scoring v4 |
| `AIROOBI_Sitemap_v2.md` | v2.5 | 30+ tabelle DB, ~60 RPC, sistema ruoli, push notifications, auto-buy, watchlist, company_assets, weekly_checkins |
| `AIROOBI_Airdrop_Engine_v2.md` | v2.5 | Già aggiornato al 19 Apr (non modificato in questa sessione) |
| `AIROOBI_Brand_Guidelines_v3.md` | v3.1 | Già valido (non modificato) |
| `AIROOBI_Cost_Org_v2.md` | v2.1 | Già valido (non modificato) |
| `sql/schema_backup.sql` | 21 Apr 2026 | Snapshot completo 28 tabelle post-Engine v2 + earnings v2 |
| `sql/treasury_stats.sql` | 21 Apr 2026 | RLS via user_roles (non più email hardcoded) |

### Deliverable non aggiornati

Rimangono in formato `.docx` (archivio `business/old/`):
- `AIROOBI_Legal_v1.1_FINAL.docx` (LEG-001)
- `AIROOBI_Year1_Forecast_v1.2_FINAL.docx` (BUS-003)

Questi non hanno un equivalente `.md` aggiornato. Candidati per futura conversione.

**Lo stato reale è adesso allineato tra codice, migration, e documentazione .md.**

---

## Cosa NON è incluso

Deliberatamente esclusi perché non rilevanti per CLA:

- `node_modules/` (dipendenze installate — enorme, rigenerabile)
- `playwright-report/`, `test-results/` (output test automatici)
- `tests/` (codice test Playwright — interno dev)
- `screenshots/`, `storage/` (drop zone screenshot, non persistenti)
- `prototype/`, `fitness/`, `airoobi/` (sottocartelle storiche/esterne al prodotto)
- File binari archiviati: `airoobi-alfa-source-code.zip`

Se CLA ha bisogno di qualcuno di questi, Skeezu può richiederne l'aggiunta a CCP.
