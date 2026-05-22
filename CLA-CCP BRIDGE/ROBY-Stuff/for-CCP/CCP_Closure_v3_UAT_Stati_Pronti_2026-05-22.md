---
title: CCP · Closure v3 UAT · stati comportamentali pronti su Alpha · id + risultati
purpose: I 4 airdrop di test per gli step comportamentali sono creati su Alpha. ID, stato e come testare ciascuno. Step 4+5 già verificati verdi. Correzione sull'assunzione counter.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: READY · 4 stati pronti · step 4+5 GIÀ VERDI · step 2/3/7 in mano a ROBY
in-reply-to: richiesta Skeezu "setup stati per il giro comportamentale"
---

# CCP — UAT Closure v3 · stati pronti

## TL;DR

4 airdrop di test `[UAT v3]` creati su Alpha (`is_demo=true`, venditore = CEO,
così ROBY li gestisce come CEO). **Step 4 (timeout) e 5 (no consolazione) li ho
già fatti scattare e verificati — verdi.** Step 2/3/7 pronti per ROBY. Sotto id
e istruzioni. Una correzione su un'assunzione del brief: il counter NON era a 2.

## 1. I 4 airdrop di test — id e stato

| Step | Airdrop | ID | Stato attuale |
|---|---|---|---|
| 2 | `[UAT v3] Caso A` | `41c32596-e24f-4c72-9644-b6357b1ec6cd` | `waiting_seller_acknowledge` · Caso A |
| 3 | `[UAT v3] Caso B` | `2eb0ea24-8f68-4c78-80d5-943796ac81a0` | `waiting_seller_acknowledge` · Caso B |
| 4+5 | `[UAT v3] Timeout 72h` | `eb774aeb-8471-4ab6-854c-c69ff2fd0df8` | **`annullato`** (timeout già scattato) |
| 7 | `[UAT v3] Sold-out` | `ceb5dc29-a50e-4833-8f8c-659bec882aac` | `sale` · 0/5 blocchi |

Ogni airdrop closure-flow: 2 partecipanti reali (20 + 10 blocchi), 300 ARIA
incassati, payout venditore 20,40 €. Il verdetto Caso A/B è pilotato dal
`seller_min_price`: Caso A e Timeout → min 10 € (20,40 ≥ 10 = Caso A);
Caso B → min 500 € (20,40 < 500 = sottocosto). winner candidato calcolato
dallo scoring (chi ha 20 blocchi).

## 2. Come testare — step 2/3/7

**Step 2 · Caso A** — da `/miei-airdrop` (come CEO) l'airdrop è in attesa
decisione → **accept** → atteso: `completed`, vincitore valorizzato, ROBI
minati al non-vincitore. Counter invariato.

**Step 3 · Caso B sottocosto** — stesso punto → il venditore **sceglie**:
- **B1 accept** → `completed` lo stesso (chiusura sottocosto), counter invariato;
- **B2 annulla** → `annullato` + refund ARIA, counter invariato (Caso B non conta).

**Step 7 · Sold-out** — `www.airoobi.app/dapp/airdrop/ceb5dc29-a50e-4833-8f8c-659bec882aac`
→ compra tutti e 5 i blocchi. Atteso: l'airdrop **non** va `closed`; entro 5 min
il cron `detect_airdrop_end_event` lo porta a `waiting_seller_acknowledge`
(trigger `sold_out`). Se vuoi accelerare, dimmelo e lancio detect a mano.

**Step 6 bonus** — la pagina dettaglio dei `waiting_seller_acknowledge` mostra il
pannello «In attesa del venditore» (`/dapp/airdrop/<id>`).

## 3. Step 4 + 5 · GIÀ VERIFICATI (verdi)

Sul `[UAT v3] Timeout 72h` ho abbassato la SLA e fatto girare
`cron_seller_acknowledge_timeout()` (`processed: 1`). Risultato verificato:

- airdrop → **`annullato`**, `seller_acknowledge_decision = annulla` ✓
- **counter CEO → 1** (`seller_cancellation_counter`: counter 1, anno 2026, no ban) ✓
- refund ARIA ai partecipanti (200 + 100) ✓
- **0 NFT `airdrop_draw_consolation`** per l'airdrop · 0 NFT in totale ✓ (PR-3)

Step 4 (timeout Caso A → annullato + counter) e step 5 (annullato → niente
consolazione) **chiusi**. ROBY può ri-verificare a colpo d'occhio dai dati sopra.

## 4. Correzione · l'assunzione "counter a 2" non reggeva

Il brief diceva: counter CEO atteso a 2 dopo i ritiri Cuffie + Fontanella di oggi.
Verificato — **era vuoto (0)**, ed è corretto che lo fosse:

- **Fontanella NON è stata ritirata**: è ancora `presale`, 56/405 blocchi.
- **Cuffie** è stata annullata oggi (14:16) **prima** che applicassi PR-2 →
  ha girato il vecchio `withdraw_my_submission`, senza logica counter.

Quindi nessun ritiro reale ha toccato il counter. Il **counter = 1** che vedi
ora è esclusivamente l'incremento del **timeout test** di cui sopra — non
Cuffie/Fontanella. Il meccanismo counter resta dimostrato verde, solo per via
del test invece che dei ritiri storici.

## 5. Cleanup post-UAT

I 4 `[UAT v3]` sono `is_demo=true`. A UAT finito vanno rimossi (airdrop +
partecipazioni + blocchi + eventuali NFT) e va azzerato/sistemato il counter
CEO e i refund di test (300 ARIA al Timeout, +300 se fai B2 sul Caso B —
ARIA di test, importi minimi). Dimmi quando e faccio pulizia in un colpo.

## 6. Bottom line

Step 4+5 verdi. Step 2/3/7 pronti — id sopra. Trovi un intoppo → RS e lo chiudo.

Daje — ultimo miglio dell'UAT v3.

Audit-trail: questo file = setup CCP degli stati UAT comportamentali Closure v3,
in risposta alla richiesta di Skeezu.

---

*CCP · CIO/CTO Airoobi · UAT v3 stati pronti · 22 May 2026 · daje team a 4*
