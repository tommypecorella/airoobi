---
title: ROBY · RS · ABO v2 — GO FASE 2 + FASE 3
purpose: Skeezu dà il via libera. FASE 2 (information architecture) e FASE 3 (RBAC Opzione C) green-light, indipendenti, ordine a discrezione CCP. Include il polish precisione decimale emerso dal sign-off FASE 1.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: GO FASE 2 + FASE 3 · indipendenti · RS paste-ready
in-reply-to: CCP_RS_ABO_v2_FASE_1_Reopen_Fix_2026-05-23.md · ROBY_SignOff_CCP_ABO_v2_FASE_1_2026-05-23.md
---

# ROBY — RS · ABO v2 GO FASE 2 + 3

## TL;DR

FASE 1 chiusa (sign-off). Skeezu dà il **GO a FASE 2 e FASE 3**. Sono
indipendenti — ordine e sequencing a te. Tutta la spec è già in mano: review
§4.2/§4.3 + mockup (`for-CCP/`), triage con Opzione C, reply reopen.

## 1. FASE 2 — Information architecture

Come da review §4.2 e mockup: 22 voci → 13 moduli in 3 aree (Operations /
Tesoreria / Sistema). Merge — Valutazioni+Gestione+Statistiche → "Pipeline
airdrop" · Analysis+Fairness Index → "Analisi & Fairness" · ARIA Metrics+ROBI
Valuation+NFT per tipo → "ARIA & ROBI". Rinomine — Tokenomics → "Conto ARIA
piattaforma" · Finanze → "Patrimonio aziendale". Hide gruppo "W4 · ATTO 4-6"
dietro flag. Refresh button unify (RICARICA/AGGIORNA/ANALIZZA → "Aggiorna").

**Aggancia qui il polish dal sign-off FASE 1:** uniformare la precisione del
valore ROBI — oggi Overview/Treasury lo mostrano a 4 decimali (`€0,8973`), la
sezione ROBI Valuation a 2 (`€0,90`). Stesso numero, display incoerente. Porta
tutto a **4 decimali** (`€0,8973`) — coerente con un "valore nominale".

## 2. FASE 3 — RBAC Opzione C

Opzione C (Hybrid) firmata da Skeezu. Procedi col DDL come da tua proposta nel
triage: `role_permissions` (template) + `user_permission_overrides` (per-utente)
+ CHECK esteso su `user_roles` + RPC `user_has_permission` /
`get_user_visible_modules`, RLS+GRANT, integration test in migration. Modulo
"Collaboratori & Permessi" coi 5 template + grant cella per cella, sidebar
permission-rendered, simulatore "Vedi come". I 13 moduli, le azioni e i default
dei 5 template sono nel review §4.2/§4.3; la UX della matrice nel mockup.

## RS — paste-ready

```
RS · ABO v2 · GO FASE 2 + FASE 3

FASE 1 chiusa (sign-off ROBY). Skeezu dà il via a FASE 2 e FASE 3.
Sono indipendenti — sequencing e ordine a tua discrezione.

FASE 2 — Information architecture (~3,5-4,5h)
- 22 voci → 13 moduli, 3 aree, come review §4.2 + mockup.
- Merge: Pipeline airdrop / Analisi & Fairness / ARIA & ROBI.
- Rinomine: Conto ARIA piattaforma · Patrimonio aziendale.
- Hide gruppo "W4 · ATTO 4-6" dietro flag. Refresh button → "Aggiorna".
- POLISH dal sign-off FASE 1: valore ROBI a 4 decimali ovunque
  (€0,8973) — oggi ROBI Valuation lo mostra a 2 (€0,90), incoerente
  con Overview/Treasury.

FASE 3 — RBAC Opzione C (~5h)
- DDL come da tua proposta nel triage: role_permissions +
  user_permission_overrides + CHECK esteso user_roles + RPC
  user_has_permission / get_user_visible_modules + RLS/GRANT +
  integration test in migration.
- Modulo "Collaboratori & Permessi": 5 template + grant cella per
  cella, sidebar permission-rendered, simulatore "Vedi come".
- 13 moduli / azioni / default template: review §4.2-§4.3 + mockup.

Ad ogni consegna mando i numeri/stati a UI-click: ROBY ri-verifica
sulla pagina renderizzata prima del sign-off.
```

## Nota

Ad ogni PR consegnata, ROBY ri-verifica a **UI-click** sulla pagina live (non
solo sul report) prima del sign-off — come per FASE 1. Mandami screenshot o i
valori a schermo a fine PR.

---

*ROBY · Strategic MKT & Comms & Community · RS GO FASE 2+3 ABO v2 · 23 May 2026 · daje team a 4*
