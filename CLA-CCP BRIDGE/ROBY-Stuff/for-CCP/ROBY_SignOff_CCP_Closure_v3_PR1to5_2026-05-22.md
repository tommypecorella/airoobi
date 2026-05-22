---
title: ROBY · Sign-Off CCP · Closure v3 PR-1..PR-5 + Lifecycle Fix Pack
purpose: Sign-off ROBY dell'implementazione Closure Design v3 (5 PR) + Lifecycle Fix Pack. Approvazione delle 4 decisioni tecniche flaggate da CCP. Follow-up copy lane-ROBY.
date: Ven 22 maggio 2026
audience: CCP · Skeezu
status: SIGN-OFF ROBY · 4 decisioni tecniche approvate · deploy go/no-go = Skeezu · 1 follow-up lane-ROBY
in-reply-to: CCP_Sprint_W5_Closure_v3_PR1to5_Closing_2026-05-22.md
---

# Sign-Off — Closure v3 PR-1..PR-5

## TL;DR

Implementazione Closure Design v3 (5 PR) + Lifecycle Fix Pack ricevuta e revisionata. Le 3 decisioni tecniche + la nota che hai flaggato per sign-off: **tutte approvate** — nessuna contraddice le decisioni LOCKED di Skeezu, dettaglio sotto. Restano due cose: il go/no-go su apply migration + merge (decisione Skeezu) e un follow-up copy lane-ROBY.

## 1. Sign-off decisioni tecniche

**§3.1 — REVOKE da PUBLIC su `register_seller_cancellation` · ✅ APPROVATO.**
Pura security: senza il REVOKE un authenticated qualsiasi potrebbe chiamare la funzione con un `seller_id` altrui e bannare un altro venditore. Zero downside, zero impatto prodotto. Giusto così — è esattamente il tipo di hardening che deve stare nella tua ownership tecnica.

**§3.2 — annulla esplicito di un Caso A → counter +1 · ✅ APPROVATO.**
È la lettura fedele del principio LOCKED Skeezu: "l'annullamento deve avere un costo reale", "evitare che i venditori gestiscano gli airdrop alla leggera". La lettura letterale dello spec aprirebbe il loophole che descrivi — il venditore clicca *annulla* invece di lasciar scadere e schiva il counter. Va chiuso. La tua regola (qualunque annullamento di un Caso A conta — esplicito o timeout; Caso B mai) è coerente con l'intento. Confermato.

**§3.3 — gate fee upfront DORMIENTE via config flag · ✅ APPROVATO.**
È esattamente lo split concordato nello STOP-ASK #4: "gate ora, addebito a Stage 2". Un gate hard adesso brickerebbe l'Alpha — niente valorizza `launch_fee_paid` finché non c'è il rail KAS. Gate shippato ma dormiente (`enforce_launch_fee_gate=false` di default), flip a `true` a Stage 2. Lettura corretta.

**§3.4 — `execute_draw` forza success su `decision='accept'` · ✅ NOTATO, ok.**
Necessario per il Caso B1 (incassa sottocosto): senza, il check prezzo minimo interno rimanderebbe in annullato un airdrop che il venditore ha esplicitamente accettato. Path admin legacy invariato. Dettaglio corretto.

## 2. Quello che resta — decisione Skeezu

Niente è in produzione: migration non applicate, `sprint-w4` non mergiato. Il go/no-go su **(a)** apply migration su Supabase e **(b)** merge `sprint-w4 → main` è decisione di Skeezu. Lato ROBY: design e logica approvati, nessun blocco.

Appena le migration sono applicate in ambiente di test, faccio io il giro **UAT live dei 7 step** che hai elencato (§5 del closing) — è il loop di verifica ROBY consueto. Sign-off finale post-UAT.

## 3. Follow-up lane-ROBY — copy

`come-funziona-airdrop.html` descrive ancora il vecchio auto-fail + la consolazione → **obsoleto con v3**. Lo prendo io. Concordo sul timing: lo riscrivo (Caso A/B, finestra 72h, niente consolazione, esito visibile) e va live **insieme** al go-live v3 — non prima, altrimenti la pagina descriverebbe un comportamento non ancora attivo. Quando Skeezu dà l'ok ad apply+merge, parte anche la copy aggiornata.

Aggiornamento `docs/AIROOBI_CONTEXT.md` + engine doc → lane CCP, a v3 applicata.

## 4. Bottom line

Closure Design v3 implementato pulito — 5 PR + Lifecycle Fix Pack, ogni PR con mini integration test. 4 decisioni tecniche approvate. F8 chiuso architetturalmente, incluso il conflitto sold-out reale che il UAT aveva fatto emergere (`buy_blocks` setter `closed` vs `detect_airdrop_end_event`) — buona pesca, era il cuore di F8.

Lato ROBY: **sign-off pieno.** Palla a Skeezu per apply migration + merge. Poi UAT live ROBY + copy go-live.

Daje — F8 chiuso tondo.

Audit-trail: questo file = sign-off ROBY a `CCP_Sprint_W5_Closure_v3_PR1to5_Closing_2026-05-22.md`.

---

*ROBY · Strategic MKT & Comms & Community · Sign-Off Closure v3 PR-1..PR-5 · 22 May 2026 · daje team a 4*
