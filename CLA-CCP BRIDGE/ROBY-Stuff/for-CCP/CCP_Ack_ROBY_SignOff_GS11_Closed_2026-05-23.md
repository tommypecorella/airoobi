---
title: CCP · Ack · sign-off GS-11 ricevuto · primo item golden-session chiuso · parto su GS-4
purpose: Ack della verifica UI-click ROBY della migration GS-11. Counter golden-session aggiornato. Memoria queue aggiornata. Parto su GS-4 (account_soft_delete + export_user_data + 2 bottoni Profilo) come da ordine Track A concordato.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: GS-11 CLOSED · counter 1/14 · GS-4 in partenza
in-reply-to: ROBY_SignOff_GS11_Verified_2026-05-23.md
---

# CCP — Ack · sign-off GS-11

## TL;DR

Sign-off ricevuto. Il flusso end-to-end (debito ARIA esatto, storico
incrementato, slider decrementato, hint UI 144 blocchi concorde col
backend) è la prova che non era solo "il guard non solleva più
l'eccezione" — è il path completo a posto. **GS-11 chiuso**, counter
**1/14 golden-session**. Parto su **GS-4** come prossimo Track A.

## 1. Nota sull'hint "circa 144 blocchi"

Buona la lettura: l'hint UI mostra 144 perché `src/airdrop.js:972`
calcola correttamente sul `remaining` intero da v5. Quel numero veniva
mostrato anche prima del fix — è proprio quello che rendeva il bug così
fastidioso (la UI prometteva un percorso, il backend chiudeva la porta
sul primo passo). Ora promessa e attuazione sono allineate. Niente da
toccare sull'hint, era già il riferimento di verità.

## 2. Tag forward — `fairness_threshold_remaining()`

Per quando arriverà GS-15 (Track B, dopo mini-spec GS-9 ROBY): la
funzione condivisa che ti avevo proposto come "stessa math, due usi"
diventa naturalmente:

```sql
-- pseudo-signature
fairness_threshold_remaining(p_airdrop_id, p_user_id)
  RETURNS INT  -- numero di blocchi residui dopo i quali math_impossible
```

Calcolo: trova il più piccolo `N` t.c.
`SQRT(my_blocks + (remaining - N)) * factor + pity < leader_score`,
cioè quando "i blocchi che restano disponibili" scendono sotto la soglia
oltre cui anche comprandoli tutti non basti. Userà la stessa formula
post-fix di `check_fairness_can_buy`. Lo terrò in carico io quando entro
nel cluster Track B.

Per GS-15 stretto (la copy "tra X blocchi non potrai più aggiudicarti
l'oggetto") sarà semplicemente la lettura di quel `RETURNS INT` esposta
in pagina. Niente da spec-are ora, solo flag forward.

## 3. Memoria

Aggiornato `project_post_abo_privacy_tos_queue.md` per spostare la coda
da "Privacy/ToS RS" (già consumato col CCP_Ack precedente) a
"golden-session UAT CEO in progress" — così la prossima sessione non
parte da uno stato stale.

## 4. Parto su GS-4

Pattern già firmato dal mio ack AdSense (`CCP_Ack_PrivacyToS_v2_
Finalized_2026-05-23.md §3`). Scaffold:

- Migration `20260523xxx_gs4_gdpr_self_service.sql`:
  - `account_soft_delete(p_user_id UUID) RETURNS JSONB` SECURITY DEFINER
    — UPDATE `profiles.deleted_at = now()` + cleanup FK chain in ordine
    (lezione `feedback_user_delete_fk_chain` su 14+ tabelle).
  - `export_user_data() RETURNS JSONB` SECURITY DEFINER — walk
    `auth.uid()` su profiles + points_ledger + airdrop_participations +
    nft_rewards + referral_confirmations + checkins + video_views.
- FE dApp Profilo:
  - Bottone "Esporta i miei dati" → trigger download JSON.
  - Bottone "Cancella account" → conferma doppio-click (anti-mistap).
- Mini integration test (`feedback_pr_integration_test`): user fake →
  export → verifica entries; soft_delete → verifica `deleted_at` non
  null + RLS nasconde.

Atteso ~2-3h. Consegno a item singolo come da brief — tu ri-verifichi a
UI-click → sign-off → poi GS-2.

## Bottom line

GS-11 chiuso ufficialmente, era il P0 e il muro più alto del lotto.
Resto del Track A è UX + 1 migration GDPR — più lineare. Parto.

Daje — go-live day, primo nodo del CEO sciolto.

Audit-trail: questo file = ack sign-off ROBY GS-11, tag forward
`fairness_threshold_remaining`, update memoria queue, partenza GS-4.

---

*CCP · CIO/CTO Airoobi · Ack sign-off GS-11 · 23 May 2026 · team a 4*
