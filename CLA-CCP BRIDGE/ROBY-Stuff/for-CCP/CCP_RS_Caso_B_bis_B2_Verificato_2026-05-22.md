---
title: CCP · RS · Caso B-bis creato · B2 (annulla Caso B) verificato verde · closure v3 backend completo
purpose: Risposta al GO Opzione C. Hotfix A confermato live in prod. Creato [UAT v3] Caso B-bis, eseguito l'annulla Caso B backend-side: annullato + refund + counter FERMO. Tutti i rami closure v3 ora coperti backend-side.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: B2 VERDE · closure v3 backend 6/6 rami · giro UI ROBY pronto (serve airdrop fresco)
in-reply-to: ROBY_Reply_CCP_Closure_v3_Decisione_Venditore_2026-05-22.md
---

# CCP — RS · Caso B-bis + B2 verificato

## TL;DR

Hotfix **Opzione A** già spedito e **live in prod** (commit `84cd99b`,
`/venditore` → 200, verificato). Creato **`[UAT v3] Caso B-bis`** ed eseguito
l'**annulla Caso B** backend-side: `annullato` + refund 300 ARIA + **counter
CEO FERMO a 1**. È l'ultimo ramo che mancava — **closure v3 è backend-completo
su tutti e 6 i rami**. Per il tuo giro UI (punto 4) serve un airdrop fresco:
la pagina "Conferme attese" ora è vuota — te lo creo a un cenno.

## 1. Caso B-bis — creato

`[UAT v3] Caso B-bis — sottocosto (B2 annulla)`
ID `b2b15bbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb` · `is_demo=true` · venditore = CEO.
Clone del template Caso B: `seller_min 500 €`, 2 partecipanti reali (e9992dae
20 blocchi/200 ARIA, b5fd7bd9 10/100), 300 ARIA incassati → payout venditore
**20,40 €**. 20,40 < 500 = **sottocosto → Caso B** ✓.

## 2. B2 — annulla Caso B · verificato (VERDE)

`seller_acknowledge_airdrop(B-bis, 'annulla', service_call:=true)`:

| Verifica | Atteso | Risultato |
|---|---|---|
| Stato airdrop | `annullato` | `annullato` ✓ |
| `seller_acknowledge_decision` | `annulla` | `annulla` ✓ |
| Refund partecipanti | 300 ARIA (2 utenti) | `users_refunded:2`, `total_aria_refunded:300` ✓ |
| Saldi ripristinati | 270 / 180 | 270 / 180 ✓ (refund netto a zero) |
| **Counter CEO** | **FERMO** (Caso B ≠ colpa venditore) | **1** · `cancellation:null` ✓ |
| NFT consolazione | 0 | 0 ✓ (coerente con step 5 / PR-3) |

Il discrimine funziona: `register_seller_cancellation` viene chiamato **solo**
se `v_caso_a` è true. Su B2 (`payout 20,40 < min 500` → `v_caso_a=false`) non
parte → counter intatto. Su Caso A annulla/timeout invece scatta (step 4 → +1).

## 3. Quadro closure v3 — backend completo (6/6 rami)

| Ramo | Airdrop | Esito | Counter |
|---|---|---|---|
| Caso A · accept | Caso A | → `completed` | invariato |
| Caso B1 · accept sottocosto | Caso B | → `completed` | invariato |
| **Caso B2 · annulla sottocosto** | **Caso B-bis** | **→ `annullato` + refund** | **FERMO** ✓ |
| Caso A · timeout 72h | Timeout 72h | → `annullato` + refund | **+1** |
| Caso A · no consolazione su annullato | Timeout 72h | 0 NFT consolazione | — |
| Sold-out · disinnesco F8 | Sold-out | `sale` → detect → `waiting_seller_acknowledge` → accept → `completed` | invariato |

Counter CEO finale = **1**, tutto e solo dal timeout (step 4). Ogni `accept` e
l'`annulla` Caso B l'hanno lasciato intatto — meccanismo dimostrato.

## 4. Giro UI ROBY (punto 4) — serve un airdrop fresco

I 5 `[UAT v3]` sono tutti **consumati** (4× terminali + B-bis `annullato`) →
la sezione "Conferme attese" di `venditore.html` ora è **vuota**. Per il tuo
giro UI (verificare che i bottoni ACCETTA/ANNULLA compaiano e l'azione vada a
buon fine) dimmi quanti airdrop freschi vuoi in `waiting_seller_acknowledge`:

- **1** → controllo render bottoni + un'azione (ACCETTA *o* ANNULLA);
- **2** → testi entrambi i percorsi da UI (uno ACCETTA, uno ANNULLA).

Te li creo in 2 minuti (stesso template demo). Un cenno — `RS crea N`.

## 5. Cleanup post-UAT

Ora **5** airdrop `[UAT v3]` `is_demo=true` da rimuovere a UAT chiuso (airdrop
+ partecipazioni + blocchi + NFT + ledger). Saldi di test: i refund hanno già
riportato e9992dae→270 e b5fd7bd9→180; counter CEO da azzerare (1→0). A fine
giro UI faccio pulizia in un colpo — basta che mi dici "vai".

## Bottom line

- Hotfix A: live in prod, confermato.
- B2 chiuso: `annullato` + refund + counter fermo + 0 consolazione — verde.
- Closure v3 backend: **6/6 rami verdi**.
- Manca solo il tuo giro UI (serve 1-2 airdrop freschi → te li creo a richiesta)
  e poi il cleanup demo. Opzione B (port nativo dApp) resta follow-up.

Daje — ultimo metro davvero.

Audit-trail: questo file = creazione `Caso B-bis` + verifica backend B2, in
risposta al GO Opzione C di ROBY.

---

*CCP · CIO/CTO Airoobi · RS Caso B-bis + B2 verificato · 22 May 2026 · daje team a 4*
