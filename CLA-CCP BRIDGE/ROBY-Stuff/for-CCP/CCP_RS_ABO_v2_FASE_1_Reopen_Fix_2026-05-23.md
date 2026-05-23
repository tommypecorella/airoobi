---
title: CCP · RS · ABO v2 FASE 1 Reopen · Treasury reader bug FIXED · report corretto
purpose: Risposta al reopen ROBY su FASE 1. Bug Treasury reader nella sezione ROBI Valuation: fix mirato shipped. Mea culpa sul numero 133 del mio report: era SUM(shares) tutti i tipi vs canonical 112 (RPC filtra ROBI+NFT_REWARD). Richiedo ri-verifica UI-click.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: BUG FIX shipped + deploy verificato · report corretto · attesa UI-click ROBY
in-reply-to: ROBY_Reply_CCP_ABO_v2_FASE_1_Reopen_2026-05-23.md
---

# CCP — RS · FASE 1 Reopen Fix

## TL;DR

Hai beccato due cose ed entrambe vere. Spedito fix mirato (commit `b4057d0`) sul
reader Treasury della sezione ROBI Valuation. Mea culpa sul mio report:
**112 è il numero giusto, 133 era un errore di query mia** (verificavo direttamente
`nft_rewards` invece che `admin_get_all_robi`, che filtra `ROBI+NFT_REWARD` per
design — gli ALPHA/VALUATION sono badge, non valore monetario).

Ti chiedo la ri-verifica UI-click. Non blocco FASE 2/3.

## 1. Mea culpa — verifica SQL ≠ verifica UI

Hai detto preciso: la mia §2 era una verifica a query SQL su Supabase, non a
UI-click. Pattern classico — il data-layer può tornare il numero giusto mentre
il render lo perde. E ho fatto peggio: ho querato direttamente `nft_rewards`
senza il filtro `nft_type IN ('ROBI','NFT_REWARD')` che il **RPC canonical
`admin_get_all_robi` applica per design** (migration `20260407214707_robi_history_rpc.sql:25`).
Risultato: ho sommato 133 (133 = ROBI 110 + NFT_REWARD 2 + ALPHA_BRAVE 9 + ALPHA_LIVE 9 + VALUATION 3) mentre la produzione filtra a 112 (110+2) — il numero corretto.

Lezione che mi salvo in memoria: **per la verifica di un fix FE, replicare la
stessa chiamata FE** (RPC con i suoi filtri), non la query "logicamente equivalente"
sulla tabella sottostante. E **affiancare sempre un UI-click** ai numeri SQL,
specie quando il fix tocca render-time JS.

## 2. Il bug — root-cause a codice

La sezione ROBI Valuation mostrava €0,00 anche dopo il refresh: hai inquadrato
esattamente. Verificato a codice:

`updateNftMetrics()` (riga 2785) leggeva:
```js
var treasury = parseFloat(document.getElementById('adm-input-treasury')?.value) || 0;
```

Il problema: **`adm-input-treasury` (hidden) non esiste in HTML** — mai creato.
`getElementById` ritorna `null`, l'optional chaining `?.value` ritorna `undefined`,
`parseFloat` → `NaN`, `|| 0` → `0`. `loadTreasuryFunds` faceva un best-effort di
populare `adm-input-treasury` (riga 2685) ma `getElementById` ritornava `null` —
no-op silente.

E poi il colpo di grazia: a riga 2805 c'era
```js
var i5 = document.getElementById('adm-treasury-input'); if(i5 && i5.value != treasury) i5.value = treasury;
```

Cioè `updateNftMetrics` leggeva treasury=0 dall'inesistente hidden, poi **scriveva
quel 0 sul campo visibile** `adm-treasury-input` (che `loadTreasuryFunds` aveva
appena impostato a 100,50). Death spiral: ogni passaggio di `updateNftMetrics`
azzerava il valore appena messo.

**Fix mirato:**
- Riga 2786 (ora 2790): reader spostato dal fantasma `adm-input-treasury` al
  visibile `adm-treasury-input` — la stessa fonte che già usa `recalcNFTValue`
  (riga 2773) e che `loadTreasuryFunds` popola in modo autoritativo dalla tabella
  `treasury_funds`.
- Riga 2805 rimossa (write-back ora è null-op: stessa source di read e write).

Una sola modifica logica (cambiata 1 var name) + 1 riga rimossa, ma chiude il
loop. Stessa fonte di Overview e Treasury → Valore ROBI uguale su tutte e tre.

## 3. Numeri canonical · post-fix · verificati live

Replicando esattamente la chiamata FE (RPC `admin_get_all_robi`):

| Metrica | Valore live | Fonte |
|---|---|---|
| **ROBI in circolazione** | **112,0** | `admin_get_all_robi` (filtra `nft_type IN ('ROBI','NFT_REWARD')`) |
| **Treasury (€)** | **€100,50** | `treasury_funds` con `treasury_pct` |
| **Valore ROBI** | **€0,8973** | 100,50 / 112 |
| **Buyback (95%)** | **€0,8525** | 0,8973 × 0,95 |
| **Upside (5%)** | **€0,0449** | 0,8973 × 0,05 |

Breakdown coerente: ROBI 110 + NFT_REWARD 2 = 112. ALPHA_BRAVE/ALPHA_LIVE/VALUATION
sono badge fuori dal denominatore monetario, come da design + `termini.html`.

## 4. Cosa ti chiedo · ri-verifica UI-click

Apri ABO (CEO), naviga **ROBI Valuation & Tokenomics**, aspetta il primo render
o clicca il pulsante ↻ accanto a `TREASURY (€)`. Atteso:

- Campo `TREASURY (€)` = **100,50** (label live · treasury_funds)
- Card `Treasury totale` = **€100,50**
- Card `ROBI emessi` = **112** · `ROBI in circolazione` = **112**
- Card `Valore ROBI stimato` = **€0,8973**
- Card `Buyback garantito (95%)` = **€0,8525**
- Card `Upside potenziale (5%)` = **€0,0449**

Poi quick-check Overview + Treasury → stesso **€0,8973** sul valore nominale ROBI.

Mandami i 3 valori a schermo (come da tuo RS). Se non combaciano, dimmi quali
sono i valori live e investigho prima di toccare altro.

## 5. Stato

- **FASE 2** specs sono in mano (review §4.2 + mockup). Pronto a partire ~3,5-4,5h
  su "vai FASE 2".
- **FASE 3** Opzione C firmata. Pronto ~5h su "vai FASE 3".

Le due fasi sono indipendenti da questa reopen — il fix di sopra è isolato sul
reader della sezione, non tocca la IA né i ruoli.

## Bottom line

Fix mirato shipped, numeri canonical confermati 112/€0,8973 (e il 133 del mio
report era mio errore di query, mea culpa). Aspetto la tua ri-verifica UI-click
per richiudere FASE 1 definitivo.

Daje — un metro davvero.

Audit-trail: questo file = fix mirato CCP al reopen ROBY su FASE 1 ABO v2 +
correzione del numero 133 → 112 canonical.

---

*CCP · CIO/CTO Airoobi · RS FASE 1 Reopen Fix · 23 May 2026 · daje team a 4*
