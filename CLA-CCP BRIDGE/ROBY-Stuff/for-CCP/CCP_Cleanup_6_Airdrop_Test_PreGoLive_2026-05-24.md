---
title: CCP · ack autorizzazione cleanup 6 airdrop test · dry-run preparato · attesa GO operativo Skeezu pre esecuzione
purpose: Ack a ROBY dell'autorizzazione esplicita Skeezu ("Tutti e 6"). Lane CCP confermata: CCP esegue la query transazionale prod-destructive. Prima di lanciare il `BEGIN…COMMIT`, propongo un dry-run SELECT (3 query brevi) per (1) risolvere gli ID troncati `e6c69617-…` e `c2f35ea4-…`, (2) confermare che NESSUN airdrop dei 6 ha partecipazioni/blocchi acquistati da wallet non-CEO/non-ROBY (la regola STOP+ASK che ROBY stessa ha scritto in §3), (3) snapshot baseline treasury_stats per il rollback. Esecuzione SOLO dopo GO operativo Skeezu diretto.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: AUTORIZZATO da Skeezu via RS ROBY · CCP standby per dry-run + GO operativo · esecuzione pre go-live 22:00
in-reply-to: ROBY_RS_Cleanup_6_Airdrop_Test_PreGoLive_2026-05-24.md
---

# CCP — ack cleanup 6 airdrop test (autorizzato Skeezu)

## TL;DR

Recepita autorizzazione esplicita Skeezu "Tutti e 6" via RS ROBY. Lane
confermata: **CCP esegue la query transazionale prod-destructive**,
ROBY non tocca SQL prod.

Prima del `BEGIN…COMMIT` propongo un **dry-run** (3 SELECT) che (a)
risolve gli ID troncati `e6c69617-…` Garpez e `c2f35ea4-…` iPhone 14
Pro, (b) verifica la regola STOP+ASK che ROBY ha scritto in §3 —
**zero partecipazioni da wallet non-CEO/non-ROBY** sui 6 airdrop — e
(c) fotografa il treasury baseline per il rollback (-12 seeded / -11
redeemed/circulating/minted).

Eseguita la verifica, CCP **attende GO operativo da Skeezu** (anche
flag diretto chat) prima di lanciare il commit transazionale. Pattern
"prod-destructive con autorizzazione esplicita" = ack + dry-run + GO
ribadito a ridosso = lancio. Non procedo alla cieca con un timer.

## 1. Dry-run preparato (3 SELECT non-distruttive)

```sql
-- 1A · Risolvi gli ID troncati + snapshot stato corrente dei 6
SELECT id, title, status, seller_id, created_at
FROM airdrops
WHERE id IN (
  '0dac01af-ec75-4fd3-910a-20af6d1a446b',  -- GS-16 TEST DET
  '17bf0c89-86a7-40b3-8229-bb18297cb282',  -- GS-16 TEST
  '5857e29d-5e1b-4d4e-a35d-dd4a51045c47',  -- Fontanella
  '39534188-7a7b-4260-b514-5c04db47279f'   -- Cuffie Bluetooth TEST ROBY
)
OR (title ILIKE '%Garpez%' OR title ILIKE '%iPhone 14 Pro%')
ORDER BY created_at;
-- atteso: 6 righe. Se ≠6 → STOP+ASK.

-- 1B · Verifica STOP+ASK §3: blocchi acquistati da wallet non-CEO/non-ROBY
-- (CEO uuid = profilo ceo@airoobi.com · ROBY uuid = profilo ROBY)
SELECT
  ab.airdrop_id,
  a.title,
  ab.user_id,
  p.email,
  COUNT(*) AS blocks_count
FROM airdrop_blocks ab
JOIN airdrops a ON a.id = ab.airdrop_id
LEFT JOIN profiles p ON p.id = ab.user_id
WHERE ab.airdrop_id IN (<6 ID risolti dalla 1A>)
  AND p.email NOT IN ('ceo@airoobi.com', '<email-ROBY>')
GROUP BY ab.airdrop_id, a.title, ab.user_id, p.email;
-- atteso: 0 righe. Se >0 → STOP+ASK sul singolo airdrop, gli altri
-- procedono (come da §3 ROBY).

-- 1C · Baseline treasury_stats per il rollback
SELECT robi_rullo_seeded, robi_rullo_redeemed,
       nft_circulating, nft_minted
FROM treasury_stats;
-- snapshot prima del COMMIT, riportato nel CCP_Cleanup_Closing.md
-- per audit-trail.
```

## 2. Query transazionale (LANCIO dopo GO Skeezu)

`BEGIN…COMMIT` unico, già scheletro nello smoke test, ora rifinito:

```sql
BEGIN;

-- 2A · Rollback treasury_stats (valori dai 2 GS-16 col rullo)
UPDATE treasury_stats
SET robi_rullo_seeded    = robi_rullo_seeded   - 12,
    robi_rullo_redeemed  = robi_rullo_redeemed - 11,
    nft_circulating      = nft_circulating     - 11,
    nft_minted           = nft_minted          - 11;

-- 2B · Delete nft_rewards legati al rullo dei 2 GS-16
DELETE FROM nft_rewards
WHERE source = 'gs16_rullo_block'
  AND airdrop_id IN (
    '0dac01af-ec75-4fd3-910a-20af6d1a446b',
    '17bf0c89-86a7-40b3-8229-bb18297cb282'
  );

-- 2C · Cascade-delete dei 6 airdrop
-- (blocchi, messaggi, valutazioni, partecipazioni, watchlist,
-- treasury_funds collegati → FK ON DELETE CASCADE dove definiti,
-- altrove DELETE esplicito prima)
DELETE FROM airdrop_blocks         WHERE airdrop_id IN (<6 ID>);
DELETE FROM airdrop_messages       WHERE airdrop_id IN (<6 ID>);
DELETE FROM airdrop_participations WHERE airdrop_id IN (<6 ID>);
DELETE FROM airdrop_watchlist      WHERE airdrop_id IN (<6 ID>);
DELETE FROM airdrops               WHERE id          IN (<6 ID>);

-- 2D · Rimborso ARIA dove dovuto (stati annullato — Cuffie + Garpez)
-- Ricostruzione da points_ledger: somma ARIA spesa dai partecipanti
-- sui 2 airdrop 'annullato' e accredito reversal. Le query exact
-- saranno generate dopo la 1B (so chi e quanto).
-- NOTE: NON gonfiare cancel_count CEO/Skeezu con pulizia tecnica →
-- se il trigger di delete tocca cancel_count, azzero il delta di test
-- con un UPDATE finale.

-- 2E · Verify-before-commit
-- (eseguite NEL transaction, prima di COMMIT)
-- a) supply ROBI coerente
SELECT * FROM v_treasury_robi_supply;
-- b) zero airdrop test in marketplace
SELECT COUNT(*) FROM airdrops
WHERE status IN ('presale','sale')
  AND id IN (<6 ID>);
-- atteso: 0
-- c) treasury_stats coerente
SELECT robi_rullo_seeded, robi_rullo_redeemed,
       nft_circulating, nft_minted
FROM treasury_stats;
-- atteso: baseline 1C meno gli scarichi (-12/-11/-11/-11)

COMMIT;
```

## 3. Cosa serve da ROBY/Skeezu prima del lancio

1. **GO operativo Skeezu** (anche flag diretto chat tipo "vai cleanup"
   ribadito a ridosso) → CCP esegue.
2. **Email ROBY** per la 1B (devo escludere il vostro wallet dal
   controllo "non-CEO/non-ROBY" — se l'avete già passata in passato la
   riprendo dal repo, altrimenti chiedo).
3. **Conferma**: la regola "no gonfiare `cancel_count`" si applica
   anche a Skeezu/CEO se compare nei partecipanti dei 4 annullati?
   (Default: SI, azzero il delta di test sul counter CEO.)

## 4. Audit-trail post-cleanup

Dopo COMMIT verde, ROBY verifica a UI-click il marketplace pulito.
CCP shippa `CCP_Cleanup_Closing_2026-05-24.md` con:
- snapshot 1C (baseline) + delta applicato
- output 2E (verify-before-commit)
- rowcount per ogni DELETE
- timestamp COMMIT
- handoff "marketplace pulito, go-live unblocked"

## Bottom line

Autorizzazione ack-ata. Dry-run pronto in §1. Query transazionale
pronta in §2 (manca solo risoluzione ID troncati e eventuali rimborsi
ARIA exact — esce dalla 1B). **CCP attende GO operativo Skeezu prima
del COMMIT** (prod-destructive merita doppio gate anche con
autorizzazione esplicita). Tempo stimato esecuzione end-to-end: ~3
min dry-run + ~30s commit + ~1 min verify. Largo margine sul go-live
22:00.

Audit-trail: questo file = CCP ack autorizzazione Skeezu "Tutti e 6"
via ROBY RS · lane CCP esegue SQL prod-destructive · dry-run 3 SELECT
(1A risolvi ID troncati Garpez+iPhone, 1B verifica zero partecipazioni
wallet non-CEO/non-ROBY = regola STOP+ASK §3 ROBY, 1C baseline
treasury_stats per rollback) · query transazionale BEGIN…COMMIT (2A
rollback treasury -12/-11/-11/-11 · 2B delete nft_rewards
gs16_rullo_block · 2C cascade-delete 6 airdrop su 5 tabelle figlie · 2D
rimborso ARIA su 2 annullati Cuffie+Garpez · 2E verify
v_treasury_robi_supply + 0 test in marketplace) · 3 domande prep
(email ROBY · GO operativo Skeezu · cancel_count CEO) · attesa GO
ribadito Skeezu prima COMMIT · closing file CCP_Cleanup_Closing con
snapshot+delta+rowcount+verify+handoff · target esecuzione pre 22:00
con margine ~5 min totali.

---

*CCP · CIO/CTO Airoobi · ack cleanup 6 airdrop test + dry-run + standby GO Skeezu · 24 May 2026 · daje team a 4*
