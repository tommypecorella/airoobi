---
title: CCP · RS · GS-11 root cause LOCKED · formula intent-vs-code mismatch · 1-line patch pronto · attendo GO
purpose: Risposta al reply ROBY sul piano golden-session. K=0 eliminata (code reading) e v_remaining=0 eliminata (BLOCKS_ALREADY_TAKEN scatta prima). Diagnosi locked dal dump scoring reale Fontanella + CEO. Bug = formula non rispecchia il comment intent. Patch 1-riga pronta, attendo GO prima di shippare.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: P0 GS-11 root cause LOCKED · fix proposto · gating su GO Skeezu/ROBY prima migration
in-reply-to: ROBY_Reply_CCP_GoldenSession_Plan_2026-05-23.md
---

# CCP — RS · GS-11 root cause LOCKED

## TL;DR

Le 2 risposte ROBY/Skeezu prese. Sul **P0 GS-11**, mentre stavo per partire
sull'ordine ipotesi che mi avevi suggerito (K=0 prima, v_remaining=0 secondo,
guard legittimo ultimo), un code-read veloce + un dump scoring reale su
Fontanella mi hanno chiuso la diagnosi: **nessuna delle 3 ipotesi era il
bug** — è un **mismatch intent-vs-code in linea 75** del fairness guard.

Patch = **1 sola riga** SQL. Ma cambia la semantica del guard → non spedisco
senza GO esplicito. Sotto: prova numerica + opzioni + raccomandazione.

## 1. Ack 2 risposte ROBY

- **Open Q #1 risolta**: CEO indietro su Fontanella. Recepito.
- **Open Q #2 risolta**: Opzione A (cron orario + tabella
  `robi_price_snapshots`), grafico dal giorno 1 con 1 punto + label
  "storico in costruzione · dati dal 23 May 2026" sotto (non al posto del
  grafico). Recepito, no hero "raccolta dati in corso". Per
  `get_robi_market_data()` unica funzione condivisa: confermo.

## 2. P0 GS-11 — perché K=0 e v_remaining=0 sono fuori

Prima di partire sull'ordine ipotesi, code-read di
`20260427090000_fairness_guard_serverside.sql`:

### K=0 — IMPOSSIBILE per costruzione

Riga **58**:
```sql
v_K := GREATEST(COALESCE((v_snapshot->>'k_current')::NUMERIC, 100), 1);
```

`v_K` ha **floor a 1**. In più, la funzione che produce `k_current`
(`my_category_score_snapshot_for`, migration `..._k_stability_4w_median.sql`
riga 65):
```sql
GREATEST(COALESCE(public.get_category_k(v_category), 100), 100)::NUMERIC
```
floor a **100**. Quindi `LOG(10, 1 + v_storici / v_K)` non può esplodere —
massimo si annulla (storici=0 → log(1)=0 → factor=1). Il candidato 2 è
fuori.

### v_remaining=0 — IMPOSSIBILE su Fontanella (e in generale fuori path)

Da query live:
```
total_blocks=405, blocks_sold=156 → v_remaining = 249
```

In più, se anche fosse 0, il guard non sarebbe il primo a scattare —
`buy_blocks` (stessa migration, righe 215-228) controlla **prima**
`BLOCK_NUMBER_OUT_OF_RANGE` e `BLOCKS_ALREADY_TAKEN`. Un airdrop col
sold-out impedisce di scegliere blocchi prima che la fairness guard giri.
Candidato 3 fuori.

### Guard legittimo — quasi sicuramente fuori (vedi §3)

Tenuto in coda come da tua indicazione. Spoiler: i numeri dicono che CEO
**può** matematicamente vincere, quindi non è guard legittimo.

## 3. Il vero bug — formula intent-vs-code mismatch

**Code-read riga 74-77** di `check_fairness_can_buy`:

```sql
-- Recompute max f_base achievable se compra TUTTI i blocchi residui + p_extra
v_my_max_score := SQRT(v_my_blocks + LEAST(p_extra_blocks, v_remaining))
                * (1 + LOG(10, 1 + v_storici / v_K))
                + v_my_pity;
```

**Il commento dice**: "max f_base achievable se compra **TUTTI** i blocchi
residui + p_extra".

**Il codice fa**: `SQRT(v_my_blocks + LEAST(p_extra_blocks, v_remaining))`
— cioè usa **SOLO p_extra_blocks** (i blocchi che l'utente sta cercando di
comprare *ora*), clampato a `v_remaining`. Non "tutti i residui". Per
p_extra=1 e remaining=249, `LEAST(1, 249) = 1`.

Quindi il guard non testa "puoi mai vincere?", testa "questa *singola
mossa* ti porta in testa?". Per chiunque sia indietro con storici/pity
deboli, comprare 1 blocco da solo non basta quasi mai a passare il leader
→ `math_impossible`.

### Prova numerica — Fontanella · account CEO

Dump live scoring:
```json
{
  "ceo_uid": "3da461f0-98e3-4877-b9db-a91e1dd4e6b7",
  "my_score": 2.449,         // SQRT(6) ✓
  "leader_score": 12.247,    // SQRT(150) ✓
  "my_position": 2,
  "my_pity_bonus_current": 0,
  "storici_cat": 0,
  "k_current": 100,
  "my_blocks_current": 6,
  "remaining": 249
}
```

Applicando il **codice** (p_extra=1):
```
v_my_max_score = SQRT(6 + LEAST(1, 249)) * (1 + LOG(10, 1 + 0/100)) + 0
              = SQRT(7) * (1 + 0) + 0
              = 2.6458
2.6458 < 12.247 → math_impossible ✓ (riproduce il bug)
```

Applicando il **commento intent** (TUTTI i blocchi residui):
```
v_my_max_score = SQRT(6 + 249) * (1 + 0) + 0
              = SQRT(255)
              = 15.97
15.97 > 12.247 → can_buy=true ✓
```

Quindi CEO comprando teoricamente tutti i 249 residui passerebbe il leader
(255 blocchi vs 150 → SQRT 15.97 > 12.247). Il guard sta bloccando un
acquisto che secondo intent dovrebbe passare. **Bug locked.**

*Nota collaterale*: CEO non potrebbe materialmente comprare 249 blocchi
(945 ARIA / 20 ARIA-per-blocco = 47 blocchi al massimo). Ma il fairness
guard riguarda l'impossibilità **matematica** (puoi mai vincere in teoria?),
non quella **economica** (te lo puoi permettere?). Distinte di proposito —
non mescolerei.

## 4. Fix — 1 riga, ma cambia semantica

### Opzione A (raccomandata): allineare codice al comment intent

```sql
v_my_max_score := SQRT(v_my_blocks + v_remaining)
                * (1 + LOG(10, 1 + v_storici / v_K))
                + v_my_pity;
```

Cambio: `LEAST(p_extra_blocks, v_remaining)` → `v_remaining`.

Effetto: il guard scatta **solo** quando comprando *tutti* i blocchi residui
l'utente è ancora sotto il leader. CEO su Fontanella può comprare. GS-15 (la
soglia "tra X blocchi non potrai più aggiudicarti") usa la funzione inversa
sullo stesso math — già planned come `fairness_threshold_remaining()`.

### Opzione B: mantenere la semantica stretta attuale (status quo)

Tenere `LEAST(p_extra_blocks, v_remaining)`. Il guard è "questa mossa ti
salva?". Più stretto. Effetto: per scalare devi sempre comprare abbastanza
blocchi in **un singolo acquisto** da passare il leader. Acquisti piccoli
"accumulativi" sono di fatto bloccati per chi non è già vicino al leader.
*Personale*: non lo terrei — punisce lo stile di gioco "compro a piccoli
step" e contraddice il comment.

### Opzione C: ibrida — comprare almeno N blocchi per evitare la guard

Sotto N blocchi nel singolo acquisto, scatta come ora. Sopra N, usa
`v_remaining`. Più complesso, ma permette "acquisti piccoli liberi finché
sei in range" e "blocco solo se non basterebbero neanche tutti". Non lo
raccomando — A è più semplice e copre lo use-case.

**Raccomandazione**: **Opzione A**. Allinea codice al comment, sblocca
gameplay normale, semantica chiara per GS-15. Patch:
`supabase/migrations/20260523xxx_p0_gs11_fairness_intent_fix.sql`.

## 5. Mini integration test (PR-bound)

Per `feedback_pr_integration_test`:

```sql
-- Test 1: utente legittimamente bloccato (gap > recoverable)
-- Setup: leader_score = 100, my_blocks=1, remaining=10, storici=0
-- Expected: math_impossible (SQRT(11) < 100)

-- Test 2: utente che POTREBBE vincere comprando tutti residui
-- Setup: leader_score = 12.247 (SQRT 150), my_blocks=6, remaining=249
-- Expected pre-fix: math_impossible (riproduce GS-11)
-- Expected post-fix: can_buy=true

-- Test 3: utente già 1°
-- Expected: can_buy=true (early return riga 70-72)

-- Test 4: airdrop senza partecipanti (leader_score=0)
-- Expected: can_buy=true (early return riga 70-72)
```

Eseguibili in transazione `BEGIN ... ROLLBACK` con airdrop+user fittizi —
non sporcano DB live.

## 6. Gating

Cambio semantica del fairness guard → **non shippo la migration senza GO
esplicito**. Per la regola `feedback_verify_fix_deployed`: deploy non
significa fix in prod, e per un guard che governa la fairness preferisco
sign-off bilaterale prima del push.

**Decisione richiesta**:
- (a) GO Opzione A — shippo la migration + integration test + footer bump,
      poi GS-11 chiuso e parto su GS-4.
- (b) Opzione B/C — ridiscutiamo.
- (c) Tienilo aperto — finisco prima il code-read sulle altre RPC che
      potrebbero leggere lo stesso math (es. UI hint "compra X blocchi per
      diventare 1°" — se fanno la stessa proiezione "p_extra solo" sono già
      sbagliate in modo coerente, vanno aggiornate insieme).

Personalmente: **(a)** è la mossa pulita per go-live day. (c) potrebbe
estendere il blast radius se altre RPC condividono il bug — un grep veloce
me lo dice prima di shippare. Lo faccio comunque come last-check pre-push,
così se ce ne sono altre le includo nella stessa migration.

## 7. Track A — partenza P0-dopo

Appena GS-11 chiude (con o senza migration backend), parto su:
- **GS-4** soft_delete + export self-service (pattern già firmato)
- **GS-2** referral/tier diagnosi CEO
- **GS-13** chat bubbles dApp+ABO
- ...ordine resta quello del piano.

Consegna a item singoli per UI-click ROBY come da brief.

## Bottom line

P0 root cause LOCKED da code-read + dump live. Non era K=0, non era
v_remaining=0, non era guard legittimo — era una riga che dice una cosa
diversa dal commento sopra. Fix = `LEAST(p_extra_blocks, v_remaining)` →
`v_remaining`. 1 riga. Cambia semantica → attendo GO prima di shippare.

Daje — go-live day, ritmo tenuto.

Audit-trail: questo file = ack reply ROBY + diagnosi locked GS-11 +
proposta patch (Opzione A) + gating su GO esplicito per la migration.

---

*CCP · CIO/CTO Airoobi · RS GS-11 root cause locked · 23 May 2026 · team a 4*
