---
title: CCP · ACK · STOP-ASK 4/4 risolti · spec implementazione locked · 5 PR + Fix Pack
purpose: ACK CCP alle risposte ROBY/Skeezu sui 4 STOP-ASK del Closure Design v3. Spec implementazione bloccata per ogni PR, niente più ambiguità. Pronto a partire.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: ACK · 0 STOP-ASK aperti · spec locked · PR-1..PR-5 + Lifecycle Fix Pack pronti
in-reply-to: ROBY_Reply_CCP_Airdrop_Closure_STOPASK_2026-05-22.md
---

# CCP — ACK · STOP-ASK risolti, spec locked

## TL;DR

4/4 STOP-ASK + §5 ricevuti e recepiti. **Zero ambiguità residue** — sotto blocco la spec di implementazione di ogni PR, così è scolpita prima di toccare il codice. Tutto pronto: 5 PR del Closure Design v3 + il Lifecycle Fix Pack. Aspetto solo il via di Skeezu su *quando* e *cosa per primo* (vedi fondo).

---

## 1. Spec locked — cosa scrivo, PR per PR

### PR-1 · SLA 72h + Caso B sottocosto + flip timeout
- `detect_airdrop_end_event`: SLA acknowledge **24h → 72h**.
- `seller_acknowledge_airdrop`: il ramo decisione calcola `venditore_eur` vs `seller_min_price` (stesso split di `execute_draw`) → distingue **Caso A** (≥ minimo) da **Caso B** (sottocosto). Decisione `accept` / `annulla` valida per entrambi; il *significato* per il counter cambia (vedi PR-2).
- **Rimuovo `auto_accept_silent`** e rinomino il cron `cron_auto_accept_silent_seller` → `cron_seller_acknowledge_timeout`: il timeout **non accetta mai**.
  - Caso A timeout → `annullato` + `refund_airdrop` + **counter +1**.
  - Caso B timeout → B2 (rifiuto) → `annullato` + `refund_airdrop` + **nessun counter**.
- `seller_acknowledge_decision` CHECK: lascio `auto_accept_silent` ammesso per le righe storiche, smetto solo di generarlo (modifica additiva, zero rischio su dati esistenti).

### PR-2 · Counter annullamenti + ban
- Nuova tabella `seller_cancellation_counter` (o colonne su `profiles` — decido in PR, propendo per tabella dedicata per audit): `seller_id`, `counter`, `counter_year`, `ban_until`. **GRANT esplicito a `authenticated`** (default Supabase in evoluzione — niente sorprese).
- Increment su: `annulla` esplicito mid-flight + timeout Caso A. **Mai** su Caso B.
- Gate ban sul flusso vendita: niente nuova submission / niente accettazione valutazione se `ban_until > now()`. Partecipazione resta libera.
- RPC `unlock_seller_ban(p_seller_id)`: addebita **1000 ARIA**, valido **solo durante ban attivo**, azzera counter + `ban_until`.
- Reset 1° gennaio: gestito *idempotente* nel cron (confronto `counter_year`), niente job a rischio.

### PR-3 · Cleanup consolazione
- Rimuovo **l'unico loop top-3** (`source='airdrop_draw_consolation'`, NFT_REWARD 1.0) nel ramo annullamento di `execute_draw`. Nient'altro.
- **Conferma STOP-ASK #3 recepita:** i ROBI del rullo sono accreditati all'acquisto del blocco → su annullamento non si minano e non si stornano. **Ramo annullamento invariato per i ROBI.** La distribuzione ROBI di fine-airdrop resta sul ramo successo, com'è oggi.

### PR-4 · Gate fee upfront
- Solo il gate: lo status non passa a `presale`/`sale` se `launch_fee_paid` non è valorizzata.
- Meccanica di addebito fee + payout venditore "100% a confirm" → **Stage 2 con KAS** (split confermato). La regola 100%-a-confirm resta scritta nello spec come override del 50/50.

### PR-5 · Esito visibile F7/F8 + disinnesco conflitto sold-out
- FE: pagina dettaglio renderizza gli airdrop conclusi (`completed`/`annullato`) invece del fallback marketplace — vincitore, stato consegna, ROBI.
- BE: **rimuovo il setter `closed` da `buy_blocks`** sul sold-out → lascio che `detect_airdrop_end_event` gestisca anche il sold-out (lo sa già fare). Questo è il pezzo emerso dal triage UAT — senza, il sold-out continua a saltare tutta la chiusura v3.

Ogni PR include il mini integration test obbligatorio.

---

## 2. Lifecycle Fix Pack (Troncone B)

Indipendente dal Closure Design, ~mezza giornata, PR unica: F1 prezzo presale · F4 validazione foto · F5 deadline (opzione b — onora l'override, restituisce la leva chiusura anticipata) · F6 redirect `/venditore` → `/miei-airdrop` · F2 plurale · F3 counter più prominente.

**Raccomandazione di sequencing:** farei **F5 per primo** — oggi non si riesce a far scadere un airdrop in UAT, ed è il motivo per cui F8 è rimasto invisibile. Con F5 sistemato, il Closure Design v3 diventa testabile end-to-end.

---

## 3. Stima consolidata

| Blocco | Effort calibrato |
|---|---|
| PR-1 · SLA + Caso B + flip timeout | ~3h |
| PR-2 · counter/ban | ~4h |
| PR-3 · cleanup consolazione | ~1h |
| PR-4 · gate fee upfront | ~1–1.5h |
| PR-5 · F7/F8 + disinnesco sold-out | ~3–4h |
| Lifecycle Fix Pack (F1–F6) | ~4–5h |
| **Totale** | **~2,5 giornate dev** |

Niente tocca la produzione finché le migration non sono applicate su Supabase con conferma esplicita — `supabase migration new`, mai SQL raw.

---

## 4. Bottom line

Spec scolpita, zero blocchi. Pronto a partire. Aspetto da Skeezu solo la decisione di *sequencing* (cosa per primo, e se parto in questa sessione). Il mio consiglio: **Lifecycle Fix Pack prima** (mezza giornata, sblocca il test della scadenza con F5), poi Closure Design v3.

Daje — F8 lo chiudiamo tondo.

Audit-trail: questo file = ACK CCP a `ROBY_Reply_CCP_Airdrop_Closure_STOPASK_2026-05-22.md`. Tutti gli STOP-ASK del ciclo chiusi.

---

*CCP · CIO/CTO Airoobi · ACK STOP-ASK Resolved · spec locked · 22 May 2026 · daje team a 4*
