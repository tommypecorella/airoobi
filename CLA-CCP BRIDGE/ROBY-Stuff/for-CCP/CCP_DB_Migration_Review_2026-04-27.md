---
from: CCP (Claude Code · CIO/CTO · Raspberry Pi 5)
to: Skeezu (founder)
cc: ROBY (per visibility)
subject: Review 13 migration LOCAL-only pre-Day1 — verdict push-readiness
date: 2026-04-27 (sera)
status: review completa · 10 SAFE / 2 BLOCKER / 1 INSPECT
ack_required: decisione Skeezu su 2 BLOCKER prima del db push totale
---

# DB migration review — 13 migration pre-mie LOCAL-only

> **Scope:** verifica push-readiness delle 13 migration committate tra il 19 Apr e il 24 Apr 2026 ma **mai applicate al DB Supabase live**. La review precede il push totale (autorizzato da Skeezu) di 17 migration (13 pre-mie + 4 Day 1 sprint W1).

## Sintesi esecutiva

- **10 / 13** safe-to-push diretto (idempotency garantita via `CREATE OR REPLACE`, `IF NOT EXISTS`, `ON CONFLICT`, gate guards).
- **2 / 13** sono BLOCKER — richiedono intervento prima del push totale.
- **1 / 13** è INSPECT (operazione DELETE destructiva ma corretta — segnalo per visibility).

Tempo stimato risoluzione BLOCKER: 15-30 min. Push totale post-fix: 2-3 min.

---

## Tabella verdict per migration

| # | Migration | Scope | Idempotent? | Risk | Verdict |
|---|---|---|---|---|---|
| 1 | `20260419200000_fix_early_close_notifications_schema.sql` | `ALTER TABLE ADD COLUMN IF NOT EXISTS data` + `CREATE OR REPLACE FUNCTION early_close_airdrop` | ✅ | Low | **SAFE** |
| 2 | `20260419200100_fix_complete_airdrop_seller_accept_args.sql` | `CREATE OR REPLACE FUNCTION complete_airdrop_seller_accept` (1 arg fix → 2 arg fix) | ✅ | Low | **SAFE** (superseded da #3) |
| 3 | `20260419200200_fix_complete_airdrop_seller_accept_status.sql` | `CREATE OR REPLACE FUNCTION complete_airdrop_seller_accept` (status `closed` → `sale`) | ✅ | Low | **SAFE** |
| 4 | `20260420190000_fix_valuation_badge_duplicates.sql` | `DELETE` dedup esistenti (n.id NOT IN ...) + `CREATE UNIQUE INDEX IF NOT EXISTS` + `CREATE OR REPLACE FUNCTION auto_create_valuation_badge` | ⚠️ DELETE eseguibile 1 volta; INDEX e FUNCTION sì | Med | **INSPECT** — DELETE distrugge righe duplicate ma è correttiva (mantiene la più vecchia) |
| 5 | `20260420225000_alpha_launch_reset.sql` | DO block con `IF NOT EXISTS (test_users) THEN RAISE NOTICE 'skip'` — full DB wipe se gate scatta | ✅ guard | High se gate non scatta, ma guard previene | **SAFE** (idempotent via guard) |
| 6 | `20260420230000_alphanet_welcome_grant_trigger.sql` | `CREATE OR REPLACE FUNCTION handle_new_user` con welcome 1000 ARIA + 5 ROBI | ✅ | Low | **SAFE** |
| 7 | `20260421000000_drop_test_infrastructure.sql` | `DROP FUNCTION IF EXISTS` + `DROP COLUMN IF EXISTS is_test_user` + `CREATE OR REPLACE FUNCTION get_leaderboard` | ✅ | Low | **SAFE** |
| 8 | `20260421001000_fix_rpcs_drop_is_test_user_refs.sql` | Riscrive 6 RPC post-DROP `is_test_user`. **Solo 3 RPC ricreate** nel file (`admin_get_all_robi`, `admin_search_user`, `auto_assign_alpha_brave`). Le altre 3 (`get_aria_explorer`, `get_airdrop_analysis`, `get_leaderboard(UUID)`) **mancano** — il file dichiara "Per brevità non incluso qui il body completo — vedi lo snapshot pg_dump post-migrazione." | ❌ INCOMPLETA | **HIGH** | 🚨 **BLOCKER** |
| 9 | `20260421230000_platform_aria_ledger.sql` | `CREATE TABLE IF NOT EXISTS platform_aria_ledger` + 4 RPC `CREATE OR REPLACE` + backfill `INSERT ... NOT EXISTS guard` | ✅ | Low | **SAFE** |
| 10 | `20260422010000_bulk_populate_airdrops.sql` | DO block: grant 1B ARIA al CEO + INSERT 128 airdrop con dati hardcoded. **Nessun guard di idempotency.** Re-applicato → 128 airdrop duplicati + grant 1B doppio. | ❌ | **HIGH** | 🚨 **BLOCKER** |
| 11 | `20260422030000_fix_bulk_airdrop_photos.sql` | DO block con CTE `photos(title, url)` + UPDATE airdrops `WHERE title = ...`. Idempotent in pratica (UPDATE su same value = no-op). | ✅ effettivo | Low | **SAFE** |
| 12 | `20260422040000_create_airdrops_storage_bucket.sql` | `INSERT INTO storage.buckets ON CONFLICT DO UPDATE` + DO block con `IF NOT EXISTS` su pg_policies | ✅ | Low | **SAFE** |
| 13 | `20260424120000_scoring_v5_pity.sql` | 5 `CREATE OR REPLACE FUNCTION` (calculate_winner_score, my_category_score_snapshot, ecc.) + `INSERT INTO airdrop_config` | ✅ | Med — cambia logica scoring engine | **SAFE** (idempotent ma comportamento DB cambia) |

---

## I 2 BLOCKER in dettaglio

### 🚨 BLOCKER #8 — `20260421001000_fix_rpcs_drop_is_test_user_refs.sql` incompleto

**Problema:** il file ricrea solo 3 delle 6 RPC dichiarate nell'header. Le altre 3 (`get_aria_explorer`, `get_airdrop_analysis`, `get_leaderboard(UUID)`) sono presumibilmente già aggiornate sul DB live via MCP/manual il 21 Apr. Se applico `db push` ora, queste 3 RPC restano nella versione "rotta" che referenzia la colonna `is_test_user` (droppata in #7), perché `db push` non modifica RPC se non c'è la `CREATE OR REPLACE` corrispondente nel file di migration.

**Risultato atteso post-push se non risolto:**
- `get_aria_explorer()` → fail con `column profiles.is_test_user does not exist`
- `get_airdrop_analysis(UUID)` → idem
- `get_leaderboard(p_user_id UUID)` → idem

Tutte e 3 queste RPC sono usate dalle dashboard ABO + explorer FE. Se rotte, breakage immediato post-push.

**Risoluzione consigliata:**

```bash
# 1. Pg_dump delle 3 RPC dal DB live (versione corrente, già fixed via MCP)
supabase db dump --data-only=false --schema-only \
  --schema public > /tmp/live_schema.sql
grep -A 50 "FUNCTION public.get_aria_explorer\|FUNCTION public.get_airdrop_analysis\|FUNCTION public.get_leaderboard" /tmp/live_schema.sql > /tmp/missing_rpcs.sql

# 2. Append a fine del file 20260421001000_fix_rpcs_drop_is_test_user_refs.sql
cat /tmp/missing_rpcs.sql >> supabase/migrations/20260421001000_fix_rpcs_drop_is_test_user_refs.sql

# 3. Verifico syntax + push
```

**Tempo stimato:** 10 min (5 dump + 5 append/check).

**Posso farlo io** dopo tua autorizzazione esplicita ("sì, completa #8 con pg_dump live").

---

### 🚨 BLOCKER #10 — `20260422010000_bulk_populate_airdrops.sql` non-idempotent

**Problema:** se eseguito, duplica i 128 airdrop alpha + grant 1B ARIA al CEO secondo. Il DB live ha già i dati popolati (memoria CCP `feedback_bulk_populate_aria_ceo.md`). `supabase db push` proverà ad applicarlo perché è in stato LOCAL-only nella migration_history.

**Risoluzione consigliata:** marcare la migration come "già applicata" senza ri-eseguirla, via `supabase migration repair`.

```bash
supabase migration repair --status applied 20260422010000
```

Questo aggiunge la riga in `supabase_migrations.schema_migrations` con il timestamp ma non esegue il body. Il DB resta intatto.

**Stessa cosa potrebbe servire per le altre migration storiche già applicate via MCP** (es. #5 `alpha_launch_reset` se anche lì il guard non scatta correttamente). Conviene fare un audit di **TUTTE** le 13 LOCAL-only confrontandole con `pg_dump` per capire quali sono state davvero applicate via MCP e quali no.

**Tempo stimato:** 5 min per repair singolo, 30 min per audit completo.

---

## Approccio consigliato — 3 step

**Step 1 (audit, 30 min)** — confrontare ogni migration LOCAL-only con il DB live per capire effettivamente cosa è applicato. Output: tabella "applied via MCP" / "not applied" per ognuna.

**Step 2 (repair, 5-10 min)** — `supabase migration repair --status applied <ts>` per ogni migration già applicata via MCP. Allinea il history table senza ri-eseguire il body.

**Step 3 (push, 5 min)** — `supabase db push` applica solo le migration ancora unapplied (nessun rischio duplicazione). Le mie 4 Day 1 vanno nel batch.

**Alternativa rapida (15 min, più rischio)** — accettare il rischio + pushare TUTTO + fixare a mano le 3 RPC rotte di #8 post-push. **Sconsigliato** — preferisco approccio pulito.

---

## Cosa serve da te (Skeezu)

Conferma 1 di 4:

**A.** "Procedi con audit + repair + push." (approccio pulito, 45 min totali)
**B.** "Solo push delle 4 mie Day 1 con `db execute --file`, salta le 13 pre-mie per ora." (5 min, ma rompe dipendenze: scoring_v5 non live → mie migration `my_category_score_snapshot_for` riferisce versione v5 che non esiste live; vincolo non risolto)
**C.** "Push totale 17 senza repair, fixo io a mano post-push se rompe." (rischio alto, 5 min se va, 60 min se rompe)
**D.** "Fammi vedere prima la diff tra il pg_dump live e i 13 file LOCAL." (audit-only, 30 min, decido dopo)

Mia raccomandazione: **A**.

---

— **CCP** (CIO/CTO Airoobi)

*Versione 1.0 · 27 Apr 2026 · canale CCP→Skeezu (decision request, db push readiness)*
