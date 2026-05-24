---
title: CCP · STOP+ASK breve · Opzione B accolta · serve UN rate esplicito ARIA/ROBI per la conversione "sal resta INTERO" · 4 opzioni rate · attesa scelta secca Skeezu
purpose: Skeezu ha dato GO Opzione B "sal resta INTERO" e ha scritto "8 ROBI di sal → CONVERTITI in ARIA al valore ROBI corrente snapshot live". L'unico "valore ROBI snapshot live" che esiste nel sistema è `v_treasury_robi_supply.eur_per_robi_implied = 28.3344 EUR/ROBI`, ma ARIA non ha cambio EUR ufficiale (rimosso apr 2026, MEMORY). Devo dichiarare un rate ARIA/ROBI per inserirlo nel transazionale. 4 opzioni con trade-off (raccomandata 1: 137.5 ARIA/ROBI ponderato sui costi reali sal). Tutti gli altri dati pre-COMMIT pronti. Attendo scelta secca Skeezu, poi lancio BEGIN…COMMIT in ~2 min.
date: Dom 24 maggio 2026
audience: Skeezu
status: pre-COMMIT data gathering completo · 4 opzioni rate ARIA/ROBI in §2 · attesa scelta secca · zero modifiche DB
in-reply-to: ROBY · "RS · DECISIONE CLEANUP — OPZIONE B (TUTTI E 6) · sal COMPENSATO"
---

# CCP — STOP+ASK rate ARIA/ROBI per Opzione B

## TL;DR

GO Opzione B accolto. Tutti i dati pre-COMMIT raccolti, query
transazionale draftata, condizione "sal resta INTERO" mappata.

**1 ambiguità tecnica bloccante**: il rate di conversione 8 ROBI sal
→ ARIA. Lo "snapshot live" disponibile è in EUR (`eur_per_robi_implied
= 28.3344 EUR/ROBI`), ma ARIA non ha cambio EUR (rimosso apr 2026
per compliance — MEMORY). Quindi serve un rate ARIA/ROBI esplicito.

4 opzioni in §2, raccomandata 1. Scelta secca da te + lancio
BEGIN…COMMIT in ~2 min.

## 1. Dati pre-COMMIT pronti

### 1A · ARIA spese sal sui 6 (da points_ledger, NETTO già-rimborsato)

| Airdrop | ARIA spese | Già rimborsate | NETTO da rimborsare |
|---|---|---|---|
| `0dac01af` GS-16 TEST DET | 100 | 0 | **100** |
| `17bf0c89` GS-16 TEST | 1.000 | 0 | **1.000** |
| `5857e29d` Fontanella | 2.000 | 0 | **2.000** |
| `c2f35ea4` iPhone | 7.300 | 0 | **7.300** |
| `e6c69617` Garpez | 50 | 50 | 0 *(già refund)* |
| `39534188` Cuffie | 250 | 500 | 0 *(già refund · sal +250 ARIA)* |
| **TOTALE** | **10.700** | **550** | **10.400** |

Garpez e Cuffie hanno già `airdrop_annullato_refund` / `airdrop_refund`
in points_ledger — non rimborso di nuovo (no double-refund).

**Da accreditare a sal in ARIA refund: 10.400.**

### 1B · ROBI sui 6 (totale, per burning/conversion)

| Airdrop | User | Source | Shares | Azione |
|---|---|---|---|---|
| `0dac01af` | CEO | gs16_rullo_block | 5 | BURN |
| `0dac01af` | sal | gs16_rullo_block | 5 | CONVERT |
| `17bf0c89` | sal | gs16_rullo_block | 1 | CONVERT |
| `39534188` | CEO | object_valuation (VALUATION) | 1 | BURN |
| `5857e29d` | CEO | object_valuation (VALUATION) | 1 | BURN *(non flaggato in STOPASK precedente — mio missing)* |
| `e6c69617` | CEO | airdrop_draw_consolation | 1 | BURN |
| `e6c69617` | sal | airdrop_draw_consolation | 1 | CONVERT |
| `e6c69617` | sal | object_valuation (VALUATION) | 1 | CONVERT |

**Totale**: 16 ROBI emessi sui 6 → 8 CEO (BURN) + 8 sal (CONVERT)

*Nota: nel precedente STOPASK avevo flaggato solo "1 ROBI CEO" — in
realtà CEO ha 8 ROBI sui 6 airdrop (5 rullo + 2 valutazione + 1
consolation). Tutti da burn perché test interni. Correzione esplicita.*

### 1C · Treasury rollback finale

- `robi_rullo_seeded -= 12` (era 12 → 0) ✅ Skeezu
- `robi_rullo_redeemed -= 11` (era 11 → 0) ✅ Skeezu
- `nft_circulating -= 16` (era 104.5714 → 88.5714)
- `nft_minted -= 16` (era 104.5714 → 88.5714)

### 1D · FK cascade map (verificato)

| Tabella figlia | delete_rule |
|---|---|
| `airdrop_block_seeds` | CASCADE ✅ |
| `airdrop_blocks` | **NO ACTION** ⚠️ DELETE esplicito |
| `airdrop_claims` | CASCADE ✅ |
| `airdrop_disputes` | CASCADE ✅ |
| `airdrop_messages` | CASCADE ✅ |
| `airdrop_participations` | **NO ACTION** ⚠️ DELETE esplicito |
| `airdrop_watchlist` | CASCADE ✅ |
| `auto_buy_rules` | CASCADE ✅ |
| `nft_rewards` | **NO ACTION** ⚠️ DELETE esplicito |
| `notification_dispatch_log` | SET NULL (lascia, non blocca) |
| `notifications` | **NO ACTION** ⚠️ DELETE o SET NULL? |
| `platform_aria_ledger` | SET NULL (lascia) |
| `transactions` | SET NULL (lascia) |
| `treasury_transactions` | **NO ACTION** ⚠️ DELETE o lascia con SET NULL? |

→ DELETE espliciti necessari su: `airdrop_blocks`, `airdrop_participations`,
`nft_rewards`, `notifications`, `treasury_transactions` (per
`treasury_transactions` propongo lasciare riga e UPDATE
airdrop_id=NULL — è audit ledger fondi, non lo distruggerei).

### 1E · Baseline saldi (per audit pre/post)

- CEO `total_points`: **7.295 ARIA**
- sal `total_points`: **491.543 ARIA** (ha già 500.000 da admin_grant)

### 1F · `cancel_count` colonna non esistente

Già verificato in STOPASK precedente. Skeezu ha confermato no-op. ✅

## 2. La domanda · rate ARIA per 1 ROBI di sal

8 ROBI di sal × **RATE** = ARIA accreditati sul suo wallet.

| Opzione | Rate | ARIA totali sal | Razionale |
|---|---|---|---|
| **1 (CCP raccomanda)** | **137.5 ARIA/ROBI** (ponderato costo reale) | **1.100** | Costo medio ARIA/ROBI effettivamente speso da sal per ottenere i ROBI di test (100 ARIA per 5 ROBI rullo + 1000 ARIA per 1 ROBI rullo + 0 ARIA per 2 ROBI consolation Garpez). Fedele al "valore reale per sal". |
| 2 | 100 ARIA/ROBI (mining standard 5 blocchi × 20) | **800** | Rate di mining "ufficiale" Alpha 0 — 1 ROBI = 5 blocchi a 20 ARIA. Conservativo. |
| 3 | 1.000 ARIA/ROBI (ceiling rullo random) | **8.000** | Generoso, ceiling osservato sui 6 airdrop. Sal in netto vantaggio rispetto al costo reale. |
| 4 | Custom | (specifica) | Es. "300 ARIA/ROBI" o altro che Skeezu decide |

In tutti i casi, **sal NON perde**: il refund netto ARIA è già
10.400, la conversione ROBI aggiunge sopra (positivo). La domanda è
solo "quanto generoso il bonus ROBI→ARIA".

## 3. Query transazionale finale (pseudocodice, pronta)

```sql
BEGIN;

-- A · Rimborso ARIA refund a sal (NETTO 10.400 + RATE × 8 ROBI)
WITH params AS (SELECT <RATE_ARIA_PER_ROBI>::int AS rate)
INSERT INTO points_ledger (user_id, amount, reason, metadata, created_at)
SELECT 'ac745435-318e-40b3-aef4-5ff397ea6062', 10400, 'cleanup_b_refund_aria',
       jsonb_build_object('cleanup','option_B','airdrops_count',6,'iso',NOW()), NOW()
UNION ALL
SELECT 'ac745435-318e-40b3-aef4-5ff397ea6062', (8 * (SELECT rate FROM params)),
       'cleanup_b_robi_to_aria_conversion',
       jsonb_build_object('robi_converted',8,'rate_aria_per_robi',(SELECT rate FROM params)), NOW();
UPDATE profiles
SET total_points = total_points + 10400 + (8 * <RATE>)
WHERE id = 'ac745435-318e-40b3-aef4-5ff397ea6062';

-- B · DELETE nft_rewards sui 6 (8 CEO burn + 8 sal "convert" — riga eliminata in ogni caso)
DELETE FROM nft_rewards
WHERE airdrop_id IN (<6_IDS>);   -- expected: 8 rows

-- C · DELETE figli senza CASCADE (blocks + participations + notifications)
DELETE FROM airdrop_blocks         WHERE airdrop_id IN (<6_IDS>);
DELETE FROM airdrop_participations WHERE airdrop_id IN (<6_IDS>);
DELETE FROM notifications          WHERE airdrop_id IN (<6_IDS>);
UPDATE treasury_transactions       SET airdrop_id = NULL WHERE airdrop_id IN (<6_IDS>);

-- D · DELETE airdrops (cascade su messages/watchlist/seeds/claims/disputes/auto_buy_rules)
DELETE FROM airdrops WHERE id IN (<6_IDS>);   -- expected: 6 rows

-- E · Treasury rollback
UPDATE treasury_stats SET
  robi_rullo_seeded    = robi_rullo_seeded    - 12,
  robi_rullo_redeemed  = robi_rullo_redeemed  - 11,
  nft_circulating      = nft_circulating      - 16,
  nft_minted           = nft_minted           - 16;

-- F · Verify-before-commit
SELECT * FROM v_treasury_robi_supply;  -- atteso: robi_circulating 88.5714, rullo_seeded 0, redeemed 0, outstanding 0
SELECT COUNT(*) FROM airdrops WHERE id IN (<6_IDS>);  -- atteso: 0
SELECT total_points FROM profiles WHERE id = 'ac745435-318e-40b3-aef4-5ff397ea6062';  -- atteso: 491543 + 10400 + (8*RATE)

COMMIT;
```

## 4. Cosa serve da te

**Una riga**: "Rate 1 / 2 / 3 / 4 con valore X".

A scelta arrivata → lancio in ~2 min, COMMIT verde → CCP_Cleanup_Closing.

## Bottom line

CCP non si ferma per principio: si ferma perché "snapshot live" non
ha unità di misura in ARIA, e "sal resta intero" merita un rate
deliberato. Tutto il resto è pronto. Scegli un rate (la 1 ponderato
è la più "intera" letterale: 1.100 ARIA per gli 8 ROBI test interni)
e CCP esegue.

Audit-trail: questo file = CCP STOP+ASK breve rate ARIA/ROBI per
Opzione B · pre-COMMIT data gathering completo (1A ARIA spese sal
NETTO già-rimborsato 10.400 · 1B 16 ROBI sui 6 airdrop = 8 CEO burn
+ 8 sal convert · correzione esplicita: STOPASK precedente flaggava
solo 1 ROBI CEO Cuffie, in realtà CEO ha 8 ROBI sui 6 = 5 rullo
0dac01af + 1 valutazione Cuffie + 1 valutazione Fontanella + 1
consolation Garpez · 1C treasury rollback -12/-11/-16/-16 da
baseline 12/11/104.5714/104.5714 → 0/0/88.5714/88.5714 · 1D FK
cascade map verificato: 8 cascade automatici + 5 DELETE/UPDATE
espliciti necessari per blocks/participations/nft_rewards/
notifications/treasury_transactions · 1E baseline saldi CEO 7295
ARIA + sal 491543 ARIA · 1F cancel_count no-op confermato) ·
ambiguità tecnica bloccante: rate ARIA/ROBI conversion · snapshot
live disponibile = v_treasury_robi_supply.eur_per_robi_implied
28.3344 EUR ma ARIA no cambio EUR (rimosso apr 2026 MEMORY) ·
4 opzioni rate (1 CCP raccomanda 137.5 ARIA/ROBI ponderato costo
reale = 1100 ARIA bonus sal · 2 100 ARIA/ROBI mining standard = 800 ·
3 1000 ARIA/ROBI ceiling = 8000 · 4 custom) · query transazionale
finale draftata in §3 (A refund + conversion · B DELETE nft_rewards ·
C DELETE figli no-cascade · D DELETE airdrops cascade · E treasury
rollback · F verify) · attesa scelta secca rate · zero modifiche DB
· lancio in ~2 min a rate ricevuto · margine 2.5h sul go-live.

---

*CCP · CIO/CTO Airoobi · STOP+ASK breve rate ARIA/ROBI conversion · 24 May 2026 · daje team a 4*
