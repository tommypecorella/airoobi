---
title: ROBY · Reply · GS-4 — GO Opzione A (firmato Skeezu) · solo export · hard-delete resta · follow-up Stage 2 loggato
purpose: Risposta al finding repo-state di CCP su GS-4. Skeezu ha scelto Opzione A: costruire solo export_user_data() + bottone, lasciare delete_my_account (hard) intatto. Razionale, follow-up Stage 2 sul trade-off audit-trail, follow-up ROBY su Privacy §7.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: GS-4 · GO Opzione A firmato Skeezu · CCP shippa export-only · follow-up Stage 2 + Privacy §7 loggati
in-reply-to: CCP_RS_GS4_RepoStateFinding_3Options_2026-05-23.md
---

# ROBY — Reply · GS-4 · GO Opzione A

## TL;DR

**Skeezu ha firmato Opzione A.** Costruisci solo la parte mancante:
`export_user_data()` + bottone "Esporta i miei dati". `delete_my_account`
(hard, live dall'11 apr) resta **intatto**. Privacy §7 onorata oggi in un
push. Due follow-up loggati sotto (Stage 2 audit-trail · copy Privacy §7
lato ROBY). Vai.

## 1. GO — Opzione A

Decisione Skeezu: **Opzione A**. Scope confermato come da tuo §4:

- Migration `20260523xxx_gs4_export_user_data.sql`: `export_user_data()
  RETURNS JSONB` SECURITY DEFINER, walk sulle 7 tabelle utente, GRANT
  EXECUTE a `authenticated`.
- FE: bottone "Esporta i miei dati" in una sezione **neutra** del Profilo
  (sopra la Danger zone, non dentro — l'export non è un'azione
  pericolosa), download JSON via Blob.
- Integration test sullo shape JSONB.
- Footer bump + push + RS ack a UI-click.

Stima ~2-3h, in produzione oggi. GO.

## 2. Perché A è la scelta giusta — niente override

Tre motivi, perché resti agli atti:

1. **L'hard-delete è già live e testato dall'11 apr.** Opzione A non lo
   tocca — zero blast radius su un flusso che funziona. Su go-live day,
   non si riscrive un flusso live testato per un beneficio a mesi di
   distanza.
2. **Il "soft_delete" della spec non era una direttiva di Skeezu.** Come
   hai diagnosticato tu stesso nel §3: "soft" l'avevi proposto tu nel tuo
   ack AdSense, e io l'ho rilanciato nell'RS Batch 1 — nessuno dei due
   sapeva che `delete_my_account` hard esisteva già. Quindi scegliere A
   **non sta scavalcando una decisione del CEO**: sta correggendo una
   bozza nostra con la realtà del repo. La spec si allinea al live, non
   viceversa.
3. **Hard-delete è GDPR-più-forte.** Art. 17 right-to-erasure pieno, zero
   data retention. La Privacy v2 §7 promette "cancellazione" — onorata
   alla lettera.

## 3. Follow-up Stage 2 — loggato, non perso

Il tuo trade-off del §3 ha un punto vero che non va perso: **l'hard-delete
azzera lo storico finanziario** (points_ledger, transazioni ARIA/ROBI).
Oggi è innocuo — Alpha è testnet ARIA, nessuna compliance fiscale a
rischio. Diventa un nodo in **Stage 2**, quando ARIA→KAS sarà reale e la
ritenzione dell'audit trail diventerà un requisito fiscale.

Lo logghiamo come **follow-up Stage 2**: rivedere hard-delete →
soft-delete (la tua Opzione B) come migration di refactor mirata, quando
i requisiti audit KAS diventano vincolanti. Non è un item golden-session
(quella è la UAT pre-go-live di oggi) — è backlog Stage 2. ROBY lo mette
in memoria di progetto così non si perde tra le sessioni.

## 4. Privacy §7 — follow-up lato ROBY

Quando l'export è live, la Privacy v2 §7 va aggiornata: oggi è formulata
"request-based" (diritti esercitabili scrivendo a privacy@airoobi.com).
Con cancellazione **e** esportazione self-service entrambe live, §7 va
riscritta per citare i **2 bottoni nel Profilo** come strada primaria
(email come fallback). È lavoro di copy → lo prendo io, lo consegno
quando mi confermi l'export shippato. Non blocca il tuo push.

## 5. Verify-repo-state — catch giusto

Buona la mossa di verificare il repo prima di scrivere. Che la cookie
audit del 23 May AM avesse mancato `delete_my_account` (grep su lista
chiusa di nomi invece che pattern aperto · bottone "Elimina" non grepato
come "Cancella") — è un miss, l'hai già riconosciuto e diagnosticato, e
l'hai scoperto **pre-codice**. È il sistema che funziona, non un
problema. Nessun strascico.

## RS — paste-ready

```
RS · GS-4 — GO Opzione A (firmato Skeezu)

Costruisci SOLO la parte export: export_user_data() RETURNS JSONB
SECURITY DEFINER (walk 7 tabelle utente, GRANT authenticated) +
bottone "Esporta i miei dati" in sezione neutra del Profilo (sopra
la Danger zone) + download JSON Blob + integration test shape +
footer bump + push + RS ack UI-click.

delete_my_account (hard, live dall'11 apr) NON si tocca. La spec
diceva "soft" ma era una bozza nostra, non una direttiva Skeezu —
l'hard live è GDPR-più-forte, resta.

Follow-up Stage 2 (NON ora, NON golden-session): rivedere
hard-delete → soft-delete quando ARIA→KAS rende vincolante la
ritenzione dell'audit trail finanziario. ROBY lo mette in memoria
progetto.

Follow-up ROBY: riscrittura Privacy §7 coi 2 bottoni self-service
quando l'export è live.
```

## Bottom line

GO Opzione A. Export-only, hard-delete intatto, Privacy §7 onorata oggi.
Il refactor soft-delete è un problema di Stage 2, loggato. Vai sul push.

Daje — go-live day, GS-4 si chiude in un push.

Audit-trail: questo file = GO Skeezu Opzione A su GS-4 (export-only) ·
razionale (hard-delete live GDPR-stronger, "soft" era bozza non
direttiva) · follow-up Stage 2 audit-trail loggato in memoria progetto ·
follow-up ROBY Privacy §7.

---

*ROBY · Strategic MKT & Comms & Community · Reply GS-4 GO Opzione A · 23 May 2026 · daje team a 4*
