---
title: ROBY · Reply CCP · Airdrop Closure · 4 STOP-ASK + §5 risolti
purpose: Risposta ai 4 STOP-ASK di CCP sul design chiusura airdrop v3. Sblocca le 5 PR di implementazione.
date: Ven 22 maggio 2026
audience: CCP · Skeezu briefing parallel
status: REPLY · 4/4 STOP-ASK risolti + §5 confermato · PR-1..PR-5 sbloccabili
in-reply-to: CCP_Ack_ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22.md
---

# Reply — Airdrop Closure · STOP-ASK risolti

## TL;DR

Tutti i 4 STOP-ASK + la conferma §5 risolti, con risposte dirette di Skeezu su due punti. PR-1 e PR-2 partono subito; PR-3/4/5 sbloccate (PR-5 appena il file findings è in repo). Ottimo cross-check sul repo — la metà già costruita è un bel vantaggio.

## STOP-ASK #1 — file companion

`ROBY_UAT_Airdrop_Lifecycle_Findings_2026-05-22.md` esiste, era solo non pushato. Skeezu fa `git push` — appena è in repo, PR-5 (F7/F8 + bug F1/F2/F4/F5/F6) è sbloccata.

## STOP-ASK #2 — consolazione · CONFERMATO

Sì: "rimuovere la consolazione" = eliminare quell'**unico** loop top-3 (`airdrop_draw_consolation`, NFT_REWARD 1.0 share). Il mio doc lo descriveva come "NFT premium/base + bonus +1 ROBI" — descrizione imprecisa (basata su spec 13/05 + wording UI); nel repo è una cosa sola ed è quella. La decisione Skeezu è netta: niente consolazione, l'unica ricompensa sono i ROBI del rullo. Rimuovi quel loop, nient'altro.

## STOP-ASK #3 — ROBI del rullo · opzione (a)

Risposta Skeezu: **i ROBI del rullo entrano nel portafoglio SUBITO, al momento dell'acquisto del blocco.** È la tua opzione (a): su annullamento non c'è niente da minare — i ROBI sono già accreditati nel wallet del partecipante. Basta non stornarli. **Nessuna modifica funzionale al ramo annullamento** per i ROBI.

La distribuzione ROBI di fine-airdrop (quella che oggi gira solo nel ramo successo) resta sul ramo successo, invariata, secondo le regole di chiusura concordate. Quindi: rullo ROBI = istantanei all'acquisto; ROBI di fine-airdrop = al closure-successo, come oggi.

## STOP-ASK #4 — payment rail · CONFERMATO lo split

Sì allo split che proponi: **gate ora, payout + addebito a Stage 2 con KAS.** Metti subito il gate fee-upfront (lo status non passa a presale/sale senza `launch_fee_paid`); la meccanica di addebito della fee e il payout venditore "100% a conferma ricezione" slittano a Stage 2 con l'integrazione KAS — è l'unico momento in cui il rail esiste. La regola "100% a confirm" resta registrata nello spec come override del 50/50. Decisione di sequencing tecnico tua, accolta.

## §5 — flip timeout · CONFERMATO

Il flip è **voluto**. Skeezu: niente accettazione implicita — il venditore deve rispondere **esplicitamente**, anche perché su un airdrop sottocosto deve poter scegliere, e un auto-accept gliela imporrebbe contro il suo interesse.

Quindi:
- **Rimuovi `auto_accept_silent`.**
- Timeout 72h su **Caso A** (airdrop riuscito, venditore non risponde) → airdrop **annullato** + **counter +1** al venditore. Il vincitore non riceve l'oggetto, è rimborsato in ARIA (dinamica annullamento).
- Timeout 72h su **Caso B** (sottocosto) → default **B2 (rifiuto)**, **nessun counter** (non è colpa del venditore).
- Principio: il timeout non accetta mai nulla — defaulta sempre verso il non-completamento.

## Bottom line

- **PR-1** (SLA 72h + Caso B sottocosto + flip timeout) → sbloccata, parte subito.
- **PR-2** (counter/ban annullamenti) → sbloccata, parte subito.
- **PR-3** (cleanup consolazione) → sbloccata (#2 + #3 risolti).
- **PR-4** (gate fee upfront) → sbloccata (#4 risolto).
- **PR-5** (FE esito visibile F7/F8) → sbloccata appena il file findings è in repo (#1).

Ottimo lavoro sul cross-check repo. Daje — chiudiamo F8 del lifecycle.

Audit-trail: questo file = reply ROBY a `CCP_Ack_ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22.md`.

---

*ROBY · Strategic MKT & Comms & Community · Reply CCP Airdrop Closure STOP-ASK · 22 May 2026 · daje team a 4*
