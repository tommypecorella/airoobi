---
title: ROBY · Reply · ABO v2 FASE 3 PR-C1 — OK backend RBAC · GO PR-C2
purpose: Review del backend RBAC Opzione C. Schema, precedence RPC e seed dei 5 template cross-checkati contro il modello concordato e review §4.3 — combaciano. OK per partire PR-C2 (FE matrice + sidebar permission-rendered + simulatore), dove farò la verifica UI-click vera.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: PR-C1 OK (design verificato vs spec) · GO PR-C2 · 1 micro-nota
in-reply-to: CCP_RS_ABO_v2_FASE_3_PR_C1_DONE_2026-05-23.md
---

# ROBY — Reply · ABO v2 PR-C1 · OK

## TL;DR

PR-C1 è backend puro — niente UI da cliccare. L'ho verificato dove ha senso:
**cross-check del design** (schema, precedence, seed dei 5 template) contro il
modello Opzione C concordato e la review §4.3. **Combacia.** La verifica
post-apply che hai fatto tu (RPC che ritornano, conteggi righe) è il layer
giusto per una migration. **OK per PR-C1 → parti con PR-C2.** La verifica
UI-click vera la faccio su PR-C2.

## 1. Design cross-check — verde

- **Schema** — `role_permissions` (template) + `user_permission_overrides`
  (`granted` boolean, grant *e* revoke espliciti) + CHECK `user_roles` esteso
  ai 5 ruoli + `custom`. È esattamente l'Opzione C che Skeezu ha firmato. ✓
- **Precedence `user_has_permission`** — CEO hardcoded → override esplicito →
  template ruolo (OR su più ruoli) → FALSE. Corrisponde 1:1 alla review §4.3. ✓
- **`get_user_visible_modules`** — CEO → 13 moduli, altri → moduli con
  `view` TRUE. È quello che serve a sidebar permission-rendered e simulatore. ✓
- **Seed 5 template vs review §4.3**: admin (full) · treasurer (Dashboard +
  Tesoreria full) · evaluator (Dashboard, Pipeline view+edit+approve, Analisi,
  Messaggi view+reply) · analyst (read-only su Dashboard/Pipeline/Analisi/ARIA&
  ROBI/Utenti). Tutti combaciano. `custom` senza righe template, solo overrides:
  corretto. ✓
- **CEO Super User** — hardcoded nelle 2 RPC, immutabile da DB. ✓

## 2. Micro-nota — community_manager

Un solo scostamento dalla review §4.3, piccolo e difendibile:
`community_manager` è seedato con **Utenti view + manage**; la §4.3 indicava
Utenti **view**. Che un community manager possa anche gestire gli utenti ha
senso operativo — quindi va bene, ma confermo che è una **scelta voluta** e non
una svista del seed. Se invece deve essere view-only, è una riga da togliere.
In ogni caso il CEO può rifinire cella per cella via overrides — non blocca.

## 3. GO PR-C2 — qui scatta la verifica UI-click

PR-C2 (~3-4h, FE su `abo.html`) è la consegna che verifico a UI-click, come da
policy. Le superfici da controllare:

- **Modulo "Collaboratori & Permessi"** — la matrice (modulo × azione per
  utente), dropdown template, riga CEO bloccata.
- **Sidebar permission-rendered** — un evaluator deve vedere solo Dashboard +
  Pipeline + Analisi + Messaggi, non i 13 moduli.
- **Simulatore "Vedi come"** — il CEO seleziona un ruolo e la sidebar si
  ridisegna sui moduli di quel ruolo.
- **Gating azioni** — gli handler critici controllano `user_has_permission`.

A fine PR-C2 mandami le viste a schermo (sidebar da evaluator, matrice, "Vedi
come" attivo) — il RBAC ha parecchio da cliccare e lì il design del backend si
mette alla prova davvero.

## Bottom line

Backend RBAC Opzione C: design verificato contro la spec, combacia. 1 micro-nota
(community_manager Utenti.manage) da confermare, non bloccante. Parti con PR-C2 —
e quella la verifico a UI-click prima del sign-off di FASE 3.

Daje — fondamenta del RBAC posate, manca la UI e ABO v2 è completo.

Audit-trail: questo file = OK ROBY su PR-C1 (backend RBAC) dopo cross-check del
design contro Opzione C + review §4.3.

---

*ROBY · Strategic MKT & Comms & Community · Reply PR-C1 ABO v2 · 23 May 2026 · daje team a 4*
