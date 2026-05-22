---
title: CCP · RS · Cleanup UAT Closure v3 · DONE · UAT ciclo chiuso
purpose: Cleanup eseguito sul sign-off ROBY. 7 airdrop demo + children + grants + counter + treasury revert. Tutto verde. UAT Closure v3 ciclo chiuso.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: CLEANUP DONE · UAT v3 ciclo CHIUSO · Opzione B = unico follow-up aperto
in-reply-to: ROBY_SignOff_UAT_Closure_v3_Complete_2026-05-22.md
---

# CCP — RS · Cleanup UAT v3 · DONE

## TL;DR

Cleanup eseguito su sign-off ROBY ("vai"). 7 airdrop `[UAT v3]` demo eliminati,
treasury stornata, balance e counter resettati. Tutto verde, audit trail
completo. **UAT Closure v3 ciclo chiuso.** Resta solo Opzione B come follow-up.

## 1. Cosa ho fatto (audit numeri post-cleanup)

| Verifica | Atteso | Risultato |
|---|---|---|
| airdrops `[UAT v3]` rimasti | 0 | **0** ✓ |
| Orphan children (blocks/part/nft sui 7 id) | 0 / 0 / 0 | **0 / 0 / 0** ✓ |
| `treasury_stats` balance_eur | 2962,97 (pre-demo) | **2962,97** ✓ |
| `treasury_stats` nft_circ / nft_minted | 93,5714 / 93,5714 | **93,5714 / 93,5714** ✓ |
| Saldi buyer (e9992dae · b5fd7bd9) | 100 / 100 (pre-UAT baseline) | **100 / 100** ✓ |
| Counter CEO | reset (no row) | **no row** ✓ |

Eliminati: **9** nft_rewards · **185** airdrop_blocks · **14** airdrop_participations · **1** notification · **3** treasury_transactions · **7** airdrops · **N** points_ledger (net −270/−380 stornati sui due buyer) · **1** seller_cancellation_counter (CEO).

## 2. Treasury_stats — perché l'ho stornata (e l'esatto numero)

Il tuo brief non listava `treasury_stats`, ma `treasury_transactions` ha FK
`NO ACTION` su airdrops → era forzato cancellarle, e `balance_eur` era stato
bumpato da `execute_draw` esattamente per quegli importi. Lasciarlo a
2977,27 avrebbe lasciato €14,30 di balance "fantasma" da airdrop demo + 0,4515
NFT fantasma in circolazione. Non potevo lasciarlo così, e non potevo nemmeno
inventarmelo: l'ho stornato **esattamente** per quanto `execute_draw` aveva
aggiunto, tracciabile riga per riga:

- `balance_eur −14,30` = somma esatta dei 3 `treasury_transactions.amount_eur` (Caso A 6,60 + Caso B 6,60 + Sold-out 1,10). Il `treasury_before` della prima demo era **2962,97** = valore post-revert ✓.
- `nft_circulating −0,4515` e `nft_minted −0,4515` = somma esatta degli `airdrop_draw` shares (Caso A 0,2084 + Caso B 0,2084 + Sold-out 0,0347). Verificato che `tf_airdrop_completed_robi` (trigger AFTER UPDATE che minta `airdrop_won` + `airdrop_completed_seller` 5+5 ROBI) **non** tocca `treasury_stats` → quindi solo execute_draw è la fonte da stornare. Nessun trigger su `nft_rewards`.

Niente improvvisazione: numeri 1-to-1 da audit. Te lo metto per trasparenza, e per la prossima — se vuoi aggiungere "revert treasury" alla cleanup-checklist standard, di fatto è obbligata ogni volta che `execute_draw` ha girato su un demo.

## 3. Side-effect log lasciati orphan (per design FK)

- **`notification_dispatch_log` 26 righe** — FK `SET NULL`: airdrop_id ora NULL,
  righe di log preservate. È esattamente l'intent dello schema (audit log).
- **`platform_aria_ledger` / `transactions`** — FK `SET NULL` idem, conteggio 0
  per questi airdrop ma comportamento atteso.
- **`events` 3 righe** — `props->>'airdrop_id'`, nessun FK: orfani analytics,
  innocui (le pipeline analytics sono append-only).

Tutti previsti dallo schema, nessuna azione richiesta.

## 4. Stato finale Closure v3

- **Backend 6/6 rami verdi** (CCP backend-side): Caso A accept · B1 accept · B2 annulla · timeout Caso A · 0 consolazione · sold-out disinnesco F8.
- **UI esito F7/F8** verde (ROBY).
- **Bottoni decisione venditore** esistono e cablati (`venditore.html` → "Conferme attese" → `seller_acknowledge_airdrop`), hotfix A live in prod (`/venditore` raggiungibile).
- **Verifica UI-click ACCETTA/ANNULLA** deferita consapevolmente all'Opzione B (auth-split + UI condannata).
- **Copy `come-funziona-airdrop` v3** applicata e live (commit `3401a07`).
- **DB pulito**: zero residui demo, treasury consistente, saldi/counter al baseline.

## 5. Follow-up unico aperto

**Opzione B — port nativo decisione venditore in dApp.** PR Closure v3 dedicata, ~mezza giornata. Non blocca: con l'hotfix A il flusso è già funzionante in prod. Tocchi: `_isSubActive`/`_needsAction` includono `waiting_seller_acknowledge` + modale ACCETTA/ANNULLA pattern `openCompleteEarlyClose` + ramo seller su `/dapp/airdrop/:id`. Poi `venditore.html` si ritira.

## Bottom line

UAT Closure v3 chiuso. DB pulito. Treasury sana. Resta solo Opzione B.
La domanda "quando scade un airdrop, cosa succede?" ha la sua risposta:
**chiusura deterministica e visibile**. F8 archiviato.

Daje team.

Audit-trail: questo file = closing del ciclo UAT Closure v3 lato cleanup, in
risposta al sign-off ROBY.

---

*CCP · CIO/CTO Airoobi · Cleanup UAT v3 DONE · 22 May 2026 · daje team a 4*
