---
title: CCP · RS · 2 airdrop UI-check creati (id) · copy come-funziona BLOCCATA (file non in for-CCP)
purpose: Risposta all'RS "crea 2 airdrop + applica copy". Task 1 fatto: 2 airdrop freschi in waiting_seller_acknowledge, id passati. Task 2 bloccato: ROBY_Copy_ComeFunziona_Airdrop_v3_Closure non è in for-CCP/ (cercato ricorsivamente + git).
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: TASK 1 DONE · TASK 2 BLOCCATO (file copy mancante)
in-reply-to: RS Skeezu/ROBY "crea 2 airdrop freschi + applica copy come-funziona"
---

# CCP — RS · 2 airdrop UI-check + copy come-funziona

## TL;DR

**Task 1 fatto.** 2 airdrop `[UAT v3]` freschi in `waiting_seller_acknowledge`,
id sotto. **Task 2 bloccato:** `ROBY_Copy_ComeFunziona_Airdrop_v3_Closure`
**non è in `for-CCP/`** — cercato ricorsivamente in tutto `CLA-CCP BRIDGE/` e
in git (origin allineato, mai committato). Appena lo droppi lo applico.

## 1. I 2 airdrop UI-check — id

| # | Titolo | ID | Caso | Stato |
|---|---|---|---|---|
| 1 | `[UAT v3] UI-check #1 — Caso A (min 10)` | `c1c1c1c1-1111-4111-8111-111111111111` | A (payout 20,40 ≥ 10) | `waiting_seller_acknowledge` |
| 2 | `[UAT v3] UI-check #2 — Caso B (min 500)` | `c2c2c2c2-2222-4222-8222-222222222222` | B (payout 20,40 < 500) | `waiting_seller_acknowledge` |

Stesso template demo: venditore = CEO, 2 partecipanti (e9992dae 20 blocchi,
b5fd7bd9 10), 300 ARIA incassati, `is_demo=true`, SLA 72h. Te ne ho fatto uno
per caso (A e B) così il giro UI copre entrambi gli scenari.

## 2. Come fare il giro UI

Loggato come CEO → `www.airoobi.app/venditore` → sezione **"Conferme attese"**:
compaiono entrambi. Su ciascuna card i bottoni **✓ ACCETTA** / **✕ ANNULLA**.

Suggerimento per un giro pulito:
- **ACCETTA il #1 (Caso A)** → atteso `completed`, vincitore + payout 20,40 €.
- **ANNULLA il #2 (Caso B)** → atteso `annullato` + refund, **counter CEO
  fermo** (Caso B non conta).

Se inverti (ANNULLA il #1 Caso A) il counter sale di 1 — niente di grave, lo
azzeriamo nel cleanup. Decidi tu: i 2 airdrop sono indipendenti.

## 3. Task 2 — copy come-funziona · BLOCCATA

`come-funziona-airdrop.html` descrive ancora il vecchio comportamento
(auto-fail sotto il minimo + consolazione) — confermo che va aggiornata a v3.
Ma il file sorgente **non c'è**:

- `find -iname` ricorsivo su tutto `CLA-CCP BRIDGE/` → nessun
  `*ComeFunziona*Closure*` / `*Copy_ComeFunziona*`.
- `git log --all` → mai committato. `origin/main` allineato al locale.
- L'ultimo file ROBY in `for-CCP/` è `ROBY_Reply_CCP_Closure_v3_Decisione_Venditore`.

Probabile: non ancora droppato / rsync non passato / nome diverso. **Non
invento la copy** — appena il file è in `for-CCP/` (o passami il nome esatto)
la applico subito: aggiorno `come-funziona-airdrop.html` v3, footer bump, smoke,
push, e aggiorno la sitemap se cambiano anchor pubblici. ~20-30 min.

## 4. Cleanup post-UAT — stato aggiornato

Ora **7** airdrop `[UAT v3]` `is_demo=true` (4 originali + B-bis + 2 UI-check).
Da pulire a giro finito, in un colpo:
- 7 airdrop + partecipazioni + blocchi + NFT + ledger;
- grant ARIA di test: +500 a e9992dae e +500 a b5fd7bd9 (per finanziare i 2
  UI-check) — da stornare;
- counter CEO → reset a 0.

Saldi attuali test: e9992dae 370, b5fd7bd9 480 (variano col tuo giro UI: l'airdrop
che ANNULLI rimborsa i partecipanti). Dimmi "vai" e sistemo tutto.

## Bottom line

- Task 1: 2 airdrop UI-check pronti — `c1c1c1c1-…1111` (Caso A) · `c2c2c2c2-…2222` (Caso B).
- Task 2: bloccato — droppa `ROBY_Copy_ComeFunziona_Airdrop_v3_Closure` in `for-CCP/` e parto.
- Dopo il tuo giro UI → cleanup 7 airdrop + grant + counter in un colpo.

Daje.

Audit-trail: questo file = creazione 2 airdrop UI-check + segnalazione file
copy mancante, in risposta all'RS di Skeezu/ROBY.

---

*CCP · CIO/CTO Airoobi · RS 2 airdrop UI-check + copy come-funziona · 22 May 2026 · daje team a 4*
