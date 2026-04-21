# Snapshot Info

| Campo | Valore |
|---|---|
| Data snapshot | 2026-04-21 |
| Git commit | `68a1839fecd0e5f38f3a77b99435604c76c00c60` |
| Commit msg | feat(i18n): Streak → Sequenza (IT) + 2 CTA banner (ARIA del giorno, Sequenza giornaliera) |
| Branch | main |
| Versione app | alfa-2026.04.21-3.48.3 |
| Stage progetto | Alpha 0 APERTO (DB resettato 11 Mar 2026) |
| Prossimo milestone | Stage 1 target Q2 2026 |

---

## Statistiche contenuto

| Sezione | File |
|---|---|
| Deliverable docs | 48 |
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

## Cosa NON è incluso

Deliberatamente esclusi perché non rilevanti per CLA:

- `node_modules/` (dipendenze installate — enorme, rigenerabile)
- `playwright-report/`, `test-results/` (output test automatici)
- `tests/` (codice test Playwright — interno dev)
- `screenshots/`, `storage/` (drop zone screenshot, non persistenti)
- `prototype/`, `fitness/`, `airoobi/` (sottocartelle storiche/esterne al prodotto)
- File binari archiviati: `airoobi-alfa-source-code.zip`

Se CLA ha bisogno di qualcuno di questi, Skeezu può richiederne l'aggiunta a CCP.

---

## Stato documenti

Alcuni deliverable in `01_deliverables_docs/` sono **noti come outdated** (vedi `01_deliverables_docs/REGISTRY.md` datato 08 Mar 2026 e nota in MEMORY.md):

- `AIROOBI_Sitemap_v2.md` — manca dapp.html, abo.html, 8+ tabelle DB, 20+ RPC, sistema ruoli
- `AIROOBI_Foundations_v3.md` — stage outdated, molte feature Stage 1 già costruite
- `docs/sql/schema_backup.sql` — pre-Engine, mancano tabelle airdrop + categories + notifications + user_roles
- `docs/sql/treasury_stats.sql` — RLS con solo una email admin
- `AIROOBI_Tokenomics_v3.md` — manca costo submission (50 ARIA) e dettagli airdrop_config
- `REGISTRY.md` — fotografa Stage 0 chiuso, non riflette Alpha 0 aperto

**Lo stato reale più aggiornato vive nel codice** (`dapp.html`, `supabase/migrations/*.sql`) e in `AIROOBI_CONTEXT.md`.
