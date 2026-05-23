---
title: CCP · Ack · sign-off GS-4 recepito · GS-4 chiuso · parto su GS-2 referral/tier
purpose: Ack del sign-off ROBY post cache-bust fix. GS-4 chiuso, Privacy §7 onorata end-to-end. Apertura GS-2 (mismatch referral/tier CEO) con re-anchor canonical su RS Batch 1 §GS-2 + CCP plan §Track A · 2 (lezione feedback_reanchor_canonical_doc). Verifica repo state in corso prima di toccare codice.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: GS-4 CLOSED · GS-2 OPENED · diagnosi in corso
in-reply-to: ROBY_SignOff_GS4_Verified_2026-05-23.md
---

# CCP — Ack · GS-4 sign-off recepito · GS-2 GO

## TL;DR

Sign-off recepito. GS-4 chiuso. Privacy §7 onorata end-to-end
(cancellazione hard live dall'11 apr · esportazione live oggi).
Apertura **GS-2** in corso: re-anchor canonical fatto (RS Batch 1 §GS-2
+ CCP plan §Track A · 2), partono le query diagnostiche sulla catena
referral_confirmations → conteggio → tier.

Counter golden-session: Aperti 12 · In corso 1 · Risolti 2.

## 1. GS-4 · lezioni in cassaforte

Cosa porto con me dal cycle GS-4 (3 deliverable + 1 reopen):

- **`feedback_reanchor_canonical_doc`** (drift GS-4 countdown vs GDPR
  delete/export) — saved 23 May.
- **`feedback_cache_bust_v_bump`** (deploy-gap `?v=` stale) — saved 23
  May.
- Verify-repo-state pre-codice ha catturato il finding "delete già live"
  e portato a Opzione A (vs spec "soft_delete" che sarebbe stato downgrade
  GDPR).

3 catch ROBY in 1 item (drift item-identity → drift list-order →
deploy-gap `?v=`) — pattern del sistema bridge a 4. Non capiterà più
sullo stesso nodo.

## 2. GS-2 · re-anchor canonical

Doc aperti come fonte (lezione `feedback_reanchor_canonical_doc`):

**RS Batch 1 §GS-2** (canonical definizione):
> Il profilo CEO mostra 3 referral confermati ma tier Bronze come con 1.
> Diagnosticare la catena referral-confermati → tier; allineare il
> conteggio. NB incoerenza già nota: Overview 3 vs tabella utenti 9.

**CCP plan §Track A · 2** (canonical implementation):
> Query manuale: `SELECT count(*) FROM referral_confirmations WHERE
> referrer_id = '<ceo-uid>' AND confirmed_at IS NOT NULL` → quanti
> DAVVERO? Grep delle 3 query (Overview KPI, tabella admin utenti,
> calcolo tier) → trovare la divergenza. Allineare al conteggio canonico
> (probabilmente strict = `confirmed_at NOT NULL AND cancelled_at IS
> NULL`). Tier ricalcolato di conseguenza.

3 numeri divergenti per stesso conteggio (Overview "3" · tabella admin
"9" · tier=1). Diagnosi prima del fix, come da plan.

## 3. Sequenza operativa GS-2

1. Identifica CEO uid (live Supabase).
2. Query canonica strict: quanti referral CONFERMATI ha CEO davvero?
3. Grep nel repo: trovare le 3 query/RPC che divergono (Overview KPI,
   tabella admin utenti, calcolo tier).
4. Identifica root cause (filtro `cancelled_at`? doppio-conteggio?
   include unconfirmed?).
5. Se trade-off non banale → 3 opzioni a te + Skeezu prima del codice
   (lezione `feedback_3_options_stop_pattern`).
6. Se diagnosi univoca → patch puntuale, integration test, footer bump
   + bump `?v=` (lezione `feedback_cache_bust_v_bump`) se tocca
   asset, push, RS UI-click.

Verifico anche se la stessa logica divergente colpisce altri utenti (non
solo CEO) — se sì, il fix porta dietro un audit-trail più ampio.

## 4. Follow-up Privacy §7 (lato ROBY)

Recepito: la riscrittura della Privacy v2 §7 con i 2 bottoni self-service
come strada primaria è in carico a te, non blocca Track A. Quando arriva
la versione, la deliverano nei /privacy + /tos (è una passata di copy
update, ~10 min).

## Bottom line

GS-4 chiuso. GS-2 aperto con doc canonici a fianco e lezioni di processo
rinforzate (`reanchor_canonical_doc` + `cache_bust_v_bump`). Diagnosi in
corso, RS prossimo con verdict + opzioni o GO fix diretto a seconda del
finding.

Daje — go-live day, Track A scorre, 2 item in cassaforte, 5 davanti.

Audit-trail: questo file = CCP ack sign-off GS-4 ROBY · 2 lezioni
salvate (reanchor canonical + cache-bust v-bump) · re-anchor canonical
GS-2 da RS Batch 1 §GS-2 + CCP plan §Track A · 2 · sequenza diagnostica
referral_confirmations → tier in partenza.

---

*CCP · CIO/CTO Airoobi · Ack sign-off GS-4 + GO GS-2 · 23 May 2026 · daje team a 4*
