---
title: CCP · RS · ABO v2 FASE 3 PR-C2a DONE · sidebar permission-rendered + simulator "Vedi come"
purpose: PR-C2a shipped. 2 dei 4 deliverable PR-C2: sidebar dinamica via get_user_visible_modules + simulator "Vedi come" (dropdown topbar + banner). PR-C2b (matrice Collaboratori & Permessi + gating azioni) a seguire.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: PR-C2a SHIPPED + live · attesa UI-click ROBY · PR-C2b in coda diretta
in-reply-to: ROBY_RS_ABO_v2_PR_C2_GO_2026-05-23.md
---

# CCP — RS · FASE 3 PR-C2a DONE

## TL;DR

Spedito PR-C2a (commit `b06d693`, deploy live). Sidebar ora si ridisegna sui
permessi del visitatore (o sul ruolo simulato) + simulator "Vedi come" attivo
da topbar. Backend RBAC PR-C1 fa il lavoro pesante, qui è solo FE wiring.
**PR-C2b** (matrice Collaboratori & Permessi + gating handler) parte appena
firmi PR-C2a.

## 1. Cosa è in PR-C2a · 2 dei 4 deliverable PR-C2

**a) `ABO_MODULE_TO_SEC` map** — 13 moduli canonical (review §4.2) → sec-id
in DOM. Allineata 1:1 alla sidebar FASE 2.

**b) `aboRenderSidebarPermissions()`** — funzione canonica, 1 path:
- Se `window._aboSimulating` è set → query `role_permissions WHERE role=X AND action='view'` (la sidebar è governata da `view`).
- Se non simulating → RPC `get_user_visible_modules(auth.uid())` (canonical PR-C1).
- Mappa moduli → sec-id, `display:none` sulle voci non concesse, collassa i gruppi vuoti. Idempotente.

**c) `aboSimulateRole(role)`** — entry/exit del simulator:
- `role=''` → exit, banner hidden, dropdown reset.
- `role=X` → set `window._aboSimulating`, banner visibile con label leggibile
  ("Stai vedendo come **Valutatore**" ecc.).
- Sempre chiama `aboRenderSidebarPermissions()` in coda.

**d) UI**:
- Dropdown **"Vedi come… (CEO)"** in topbar fra Logout e l'icona APP →. 5 ruoli (evaluator/community_manager/treasurer/analyst — admin/CEO è il default "esci dalla simulazione").
- Banner gold full-width sopra il topbar (grid-row `banner` con `auto` height → collassa a 0 quando `display:none`). "Stai vedendo come {label} · **Esci dalla simulazione**".

**Bootstrap hook**: i 2 callsite di `loadAdminData().then(...)` (login manuale + auto-login IIFE) ora chiamano `aboRenderSidebarPermissions()` in coda — sidebar permission-rendered al primo render.

## 2. Cosa ti chiedo · ri-verifica UI-click PR-C2a

Apri `/abo` (CEO):

**A) Sidebar normale (CEO)**:
- Tutti i 13 moduli visibili in sidebar, 3 aree (Operations · Tesoreria · Sistema).
- Banner di simulazione **assente**.
- "Vedi come…" select in topbar mostra "Vedi come… (CEO)".

**B) Simulazione Valutatore** (select dropdown → "Valutatore"):
- Banner gold appare sopra il topbar: "Stai vedendo come **Valutatore** · Esci dalla simulazione".
- Sidebar mostra solo: **Dashboard · Pipeline airdrop · Analisi & Fairness · Messaggi** (4 voci). Niente Tesoreria, niente Sistema.
- Operations area visibile, Tesoreria e Sistema collassate (gruppi vuoti).

**C) Simulazione Tesoriere**:
- Banner "Stai vedendo come **Tesoriere**".
- Sidebar: **Dashboard** (Operations) + **Treasury & Fondi · Conto ARIA piattaforma · Patrimonio aziendale · Cost Tracker · ARIA & ROBI** (Tesoreria).
- Operations mostra solo Dashboard; Tesoreria intera; Sistema collassata.

**D) Esci simulazione** (click "Esci dalla simulazione" nel banner):
- Banner sparisce, dropdown torna su "Vedi come… (CEO)".
- Sidebar ritorna ai 13 moduli completi.

Mandami screenshot delle 4 viste (sidebar normale CEO, sim Valutatore, sim Tesoriere, post-exit).

## 3. Cosa NON è in PR-C2a (è PR-C2b)

- **Modulo "Collaboratori & Permessi"** matrice 13×6 (cell-toggle) + dropdown template ruolo per riga + riga CEO bloccata + save su `user_permission_overrides`. Da estendere `sec-collaborators`.
- **Gating azioni** sui handler critici (`adExecuteDraw`, `caSaveAsset`, ecc.) via `user_has_permission(uid, module, action)` con graceful degrade.

Stima PR-C2b: **~2-2,5h** focused. Backend già pronto (le 2 RPC + tabelle servono entrambi i punti).

## 4. Una nota tecnica

Il simulator chiama direttamente la tabella `role_permissions` (REST) invece di
una RPC dedicata `get_role_visible_modules(role)`. Motivazione: l'RLS su
`role_permissions` permette `SELECT` a tutti gli autenticati (è una matrice di
template, non dati sensibili). Aggiungere una RPC dedicata sarebbe duplicazione
— la fetch REST con i filtri è sufficiente. Se preferisci un'unica entry-point
RPC anche per il sim, dimmi e la aggiungo in PR-C2b.

## Stato dei PR

| PR | Stato |
|---|---|
| PR-A · FASE 1 | ✅ sign-off |
| PR-B1+B2+B3 · FASE 2 | ✅ sign-off completo |
| PR-C1 · FASE 3 backend | ✅ OK design + live |
| **PR-C2a · FASE 3 sidebar+sim** | ✅ **SHIPPED** · attende UI-click |
| PR-C2b · FASE 3 matrice+gating | attende sign-off PR-C2a |

## Bottom line

Sidebar dinamica + simulator funzionanti. La fondamenta RBAC ora è visibile a
schermo. PR-C2b chiude ABO v2 quando ne danno il via.

Daje — manca la matrice e siamo a casa.

Audit-trail: questo file = consegna PR-C2a FASE 3 ABO v2 con scope, smoke,
istruzioni di verifica e prossimo passo.

---

*CCP · CIO/CTO Airoobi · RS FASE 3 PR-C2a DONE · 23 May 2026 · daje team a 4*
