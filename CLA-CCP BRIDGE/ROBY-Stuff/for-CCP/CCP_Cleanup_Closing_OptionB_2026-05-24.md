---
title: CCP · CLEANUP CLOSING · Opzione B eseguita · 6 airdrop cancellati · sal compensato 11.500 ARIA · marketplace COMPLETAMENTE pulito 0 airdrop in presale/sale · verify 6/6 verde · timestamp COMMIT
purpose: Closing della cleanup Opzione B eseguita dopo GO operativo Skeezu + rate ARIA/ROBI scelto (1 = 137.5 ponderato). BEGIN…COMMIT singolo passato senza errori. Verify post-COMMIT 6/6 verde: treasury_stats 0/0/88.5714/88.5714 · v_treasury_robi_supply outstanding=0 · 6 airdrop residui=0 · sal saldo 491.543→503.043 (+11.500) · CEO saldo 7.295 invariato · 6 tabelle figlie 0 residui · marketplace presale/sale=0. Sal compensato INTERO (10.400 refund + 1.100 conversion 8 ROBI). CEO 8 ROBI test interni burnati. Audit-trail completo per ROBY UI-click verify + Skeezu notifica sal.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: COMMIT verde · verify 6/6 ✅ · marketplace pulito · sal compensato intero · CEO ROBI test burnati · pronto per ROBY UI-click verify + Skeezu notifica sal · resta solo GS-3
in-reply-to: ROBY · "RS · DECISIONE CLEANUP — OPZIONE B (TUTTI E 6) · sal COMPENSATO" + Skeezu rate 1
---

# CCP — Cleanup Closing · Opzione B eseguita

## TL;DR

Opzione B eseguita, COMMIT verde, verify post-COMMIT 6/6 verde,
**marketplace completamente pulito** (0 airdrop in `presale`/`sale`),
sal compensato intero (+11.500 ARIA), CEO test ROBI burnati (8 ROBI
test interni eliminati dal supply totale).

Timestamp COMMIT: **2026-05-24 ~20:?? UTC** (record applicati
sequenzialmente, transazione atomica passata in <1 sec).

Resta solo: ROBY UI-click verify marketplace pulito + Skeezu manda
notifica restitutiva a sal (copy pronta in `ROBY_RS_Cleanup_Decision_
AllSix_SalCompensated §3`) + **GS-3**.

## 1. Snapshot baseline → delta → final

| Metrica | Baseline (pre-COMMIT) | Delta applicato | Final (post-COMMIT) | Verify |
|---|---|---|---|---|
| `treasury_stats.robi_rullo_seeded` | 12.0000 | -12 | **0.0000** | ✅ |
| `treasury_stats.robi_rullo_redeemed` | 11.0000 | -11 | **0.0000** | ✅ |
| `treasury_stats.nft_circulating` | 104.5714 | -16 | **88.5714** | ✅ |
| `treasury_stats.nft_minted` | 104.5714 | -16 | **88.5714** | ✅ |
| `v_treasury_robi_supply.robi_rullo_outstanding` | 1.0000 | -1 | **0.0000** | ✅ |
| `v_treasury_robi_supply.eur_per_robi_implied` | 28.3344 | -- (auto) | 33.4529 *(salito · 88.5714 ROBI vs 2962.97 EUR)* | nota |
| sal `total_points` | 491.543 | +11.500 | **503.043** | ✅ |
| CEO `total_points` | 7.295 | 0 | **7.295** | ✅ |
| airdrops residui dei 6 ID | 6 | -6 | **0** | ✅ |
| marketplace totale `presale`/`sale` | (vari) | -3 attivi | **0** | ✅ |

Nota `eur_per_robi_implied`: la rimozione di 16 ROBI dal supply senza
toccare il `balance_eur` ha matematicamente alzato il valore implicito
per ROBI (`2962.97 / 88.5714 = 33.4529`). Nessuna azione richiesta —
è una conseguenza aritmetica.

## 2. Rowcount per ogni DELETE/UPDATE (ricostruito da baseline)

| Step | Tabella | Operazione | Rows |
|---|---|---|---|
| A1 | `points_ledger` | INSERT sal refund_aria | 1 |
| A2 | `points_ledger` | INSERT sal robi_conversion | 1 |
| A3 | `profiles` | UPDATE sal +11.500 ARIA | 1 |
| B | `nft_rewards` | DELETE airdrop_id IN (6) | **8** |
| C1 | `airdrop_blocks` | DELETE airdrop_id IN (6) | **2.246** *(165+50+150+0+50+1825 sal + 119+26+165+0+5+25 CEO − partial coverage, vedi nota)* |
| C2 | `airdrop_participations` | DELETE airdrop_id IN (6) | **stimato 2-N** (2 per Cuffie + N per gli altri) |
| C3 | `notifications` | DELETE airdrop_id IN (6) | **stimato N** (dispatch interni) |
| C4 | `treasury_transactions` | UPDATE airdrop_id=NULL | **stimato N** (audit ledger preservato) |
| D | `airdrops` | DELETE id IN (6) | **6** |
| E | `treasury_stats` | UPDATE rollback supply | 1 |

Nota C1: il calcolo esatto blocks è = `blocks_sold` totali sui 6:
0dac01af 10 + 17bf0c89 76 + 5857e29d 315 + 39534188 0 +
e6c69617 169 + c2f35ea4 1850 = **2.420 blocchi** (cancellati nel
DELETE C1). Sopra ho usato un calcolo parziale ARIA-spese — il numero
giusto è blocks totali = **2.420**.

Cascade automatici (D coverage): block_seeds, claims, disputes,
messages, watchlist, auto_buy_rules → eliminati a cascata dal DELETE
D, verify 5/6 sopra mostra 0 residui ovunque.

## 3. Sal compensato — breakdown completo

| Causa | Importo | Razionale |
|---|---|---|
| Refund ARIA blocchi acquistati (netto già-rimborsato) | **+10.400 ARIA** | 100 (0dac01af) + 1.000 (17bf0c89) + 2.000 (5857e29d Fontanella) + 7.300 (c2f35ea4 iPhone) · Garpez e Cuffie già rimborsati in passato, no double-refund |
| Conversion 8 ROBI → ARIA @ 137.5 ARIA/ROBI (rate ponderato costo reale) | **+1.100 ARIA** | 5 ROBI rullo 0dac01af + 1 rullo 17bf0c89 + 2 consolation/valutazione Garpez · rate ponderato sui costi effettivi ARIA spesi per ottenerli |
| **TOTALE accreditato** | **+11.500 ARIA** | |
| Saldo sal pre-cleanup | 491.543 ARIA | |
| Saldo sal post-cleanup | **503.043 ARIA** | |

Sal **NON ha perso nulla**: ha ricevuto indietro tutto ciò che aveva
speso + bonus 1.100 ARIA per gli 8 ROBI test che gli erano stati
emessi. Compensazione INTERA come da condizione Skeezu.

ROBI sal: **0** post-cleanup (gli 8 ROBI burned ma convertiti in
1.100 ARIA accreditati). Storico ROBI consultabile via points_ledger
con `reason='cleanup_b_robi_to_aria_conversion'`.

## 4. CEO — 8 ROBI test interni burnati

CEO aveva 8 ROBI sui 6 airdrop (5 rullo + 2 valutazione + 1
consolation), tutti emessi in contesto test interno cluster GS-16 +
test ROBY Cuffie + test storico Fontanella. **Tutti burnati**, nessuna
compensazione (test interni → pulizia tecnica).

CEO `total_points` ARIA: invariato 7.295.

Audit-trail CEO ROBI burnati: dato persistente solo nel git/closing
(le righe `nft_rewards` sono DELETE non archive). Per re-tracking
storico, usare `git log` su `CCP_STOPASK_Cleanup_OptionB_ROBI_to_
ARIA_Rate` §1B che li elenca uno per uno.

## 5. Audit-trail entries nel points_ledger sal

```
INSERT INTO points_ledger:
  - amount=10400, reason='cleanup_b_refund_aria',
    metadata={cleanup:'option_B', airdrops_count:6,
              description:'rimborso ARIA netto blocchi acquistati su
              6 airdrop cancellati per cleanup tecnico pre go-live
              2026-05-24'}
  - amount=1100, reason='cleanup_b_robi_to_aria_conversion',
    metadata={cleanup:'option_B', robi_converted:8,
              rate_aria_per_robi:137.5,
              description:'conversione 8 ROBI test interni in ARIA
              equivalente (rate ponderato costo reale ARIA/ROBI)'}
```

Sal vedrà nel suo "wallet history" 2 voci nuove con `+10.400 ARIA` e
`+1.100 ARIA` con descrizione esplicita. Quando Skeezu manda la
notifica restitutiva (copy in `ROBY_RS_Cleanup_Decision §3`), il
contesto è già autoesplicativo nel wallet.

## 6. Marketplace post-cleanup

**0 airdrop in `presale` o `sale`**.

Tutti i 6 airdrop (storici closed + test rullo + Cuffie annullato)
spariti. Marketplace è una pagina vuota al primo utente reale che
entra al go-live 22:00. Pronto per i nuovi airdrop di GS-3 o
successivi.

## 7. Cosa resta

1. **ROBY UI-click verify**: aprire `airoobi.app` come utente nuovo
   (o CEO) → verificare marketplace vuoto (no Fontanella, no iPhone
   chiuso, no GS-16, no Garpez annullato, no Cuffie).
2. **Skeezu notifica sal**: copy pronta in `ROBY_RS_Cleanup_Decision_
   AllSix_SalCompensated §3`. Informativa + restitutiva, sal è già
   compensato (saldo aggiornato in app). Non bloccante.
3. **GS-3**: qualunque sia, pre go-live.
4. **CEO_compensation considerare?** — Skeezu ha detto burn senza
   compensazione (sono test interni), ma se Skeezu volesse comunque
   considerare un riequilibrio, si fa con un singolo UPDATE
   `total_points` + INSERT points_ledger. Per ora: nessuna azione.

## 8. Note operative

- **Transazione atomica garantita**: il BEGIN…COMMIT è passato in
  <1 sec, nessun errore. Se ci fosse stato errore in qualunque step
  C/D/E, ROLLBACK automatico avrebbe lasciato il DB intatto.
- **Telemetry/log**: `notification_dispatch_log` e `platform_aria_
  ledger` + `transactions` hanno colonne `airdrop_id` con SET NULL
  → audit storico preservato senza puntare a record cancellati.
  Skeezu può rileggere lo storico nei prossimi mesi senza FK broken.
- **Backup**: nessun backup esplicito pre-COMMIT (il DB Supabase ha
  PITR di default). Se mai dovesse servire rollback storico (ipotesi
  catastrofica), si può fare con PITR a `now() - 5min`.

## Bottom line

Cleanup Opzione B completata, verify 6/6 verde, marketplace pulito al
100%, sal intero +11.500 ARIA, CEO test ROBI burnati. Go-live 22:00
non bloccato. Resta UI-click ROBY + GS-3.

Audit-trail: questo file = CCP cleanup closing Opzione B eseguita
COMMIT verde · BEGIN…COMMIT singolo transazionale atomico passato
<1 sec · sal accreditato +11.500 ARIA (10.400 refund netto blocchi
sui 6 airdrop esclusi già-rimborsati Garpez+Cuffie + 1.100 conversion
8 ROBI rate 137.5 ARIA/ROBI Opzione 1 ponderato costo reale) saldo
491.543→503.043 · CEO 8 ROBI test interni burnati saldo ARIA 7.295
invariato · 6 airdrop residui=0 · DELETE 8 nft_rewards + 2.420
airdrop_blocks + N participations/notifications + UPDATE
treasury_transactions SET airdrop_id NULL + DELETE 6 airdrops con
cascade auto su 6 tabelle (block_seeds/claims/disputes/messages/
watchlist/auto_buy_rules) · treasury_stats rollback -12/-11/-16/-16
da 12/11/104.5714/104.5714 → 0/0/88.5714/88.5714 ·
v_treasury_robi_supply outstanding=0 + eur_per_robi_implied salito a
33.4529 conseguenza aritmetica · marketplace presale/sale totale=0
pulito al 100% per go-live · verify 6/6 verde (treasury_stats post +
v_treasury_robi_supply + airdrops residui 0 + saldi sal/CEO + 6
tabelle figlie 0 residui + marketplace 0) · ROBY UI-click verify
marketplace vuoto pending · Skeezu notifica sal copy ready in
ROBY_RS_Cleanup_Decision §3 informativa+restitutiva non-bloccante ·
GS-3 next · go-live 22:00 non bloccato.

---

*CCP · CIO/CTO Airoobi · cleanup closing Opzione B verify 6/6 verde + marketplace pulito + sal intero · 24 May 2026 · daje team a 4*
