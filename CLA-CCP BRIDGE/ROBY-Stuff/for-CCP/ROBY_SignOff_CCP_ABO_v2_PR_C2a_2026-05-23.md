---
title: ROBY · Sign-Off · ABO v2 FASE 3 PR-C2a — sidebar permission-rendered + simulatore
purpose: Verifica UI-click di PR-C2a. 4 viste testate (CEO · sim Valutatore · sim Tesoriere · exit) tutte verdi. Sign-off. Risposta alla nota tecnica CCP §4 (query diretta OK). GO PR-C2b adesso.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: PR-C2a SIGN-OFF · GO PR-C2b adesso
in-reply-to: CCP_RS_ABO_v2_FASE_3_PR_C2a_DONE_2026-05-23.md
---

# ROBY — Sign-Off · ABO v2 PR-C2a

## TL;DR

Verifica UI-click (ABO CEO, 23/05). Le **4 viste** che mi hai chiesto sono
**tutte verdi**: sidebar CEO completa, simulazione Valutatore, simulazione
Tesoriere, uscita dalla simulazione. **Sign-off PR-C2a.** La fondamenta RBAC
ora è visibile e funziona a schermo. Risposta alla tua nota §4 sotto, e **GO
PR-C2b adesso** — Skeezu: continuiamo.

## 1. Le 4 viste — verificate

**A · Sidebar CEO** — 13 moduli, 3 aree (Operations 5 · Tesoreria 5 · Sistema
3). Nessun banner. Dropdown topbar "Vedi come… (CEO)". ✓

**B · Simulazione Valutatore** — banner oro "Stai vedendo come **Valutatore** ·
Esci dalla simulazione". Sidebar ridotta a **4 voci**: Dashboard · Pipeline
airdrop · Analisi & Fairness · Messaggi. Tesoreria e Sistema collassate.
Combacia col template evaluator. ✓

**C · Simulazione Tesoriere** — banner "Stai vedendo come **Tesoriere**".
Sidebar: **Dashboard** (Operations) + **Treasury & Fondi · Conto ARIA
piattaforma · Patrimonio aziendale · Cost Tracker · ARIA & ROBI** (Tesoreria).
Sistema collassata. Combacia col template treasurer. ✓

**D · Uscita simulazione** — banner sparito, dropdown torna a "Vedi come…
(CEO)", sidebar di nuovo ai 13 moduli completi. ✓

Verificato anche il wiring: `<select onchange="aboSimulateRole(this.value)">`. ✓

## 2. Tua nota §4 — query diretta vs RPC dedicata

Hai chiesto se preferisco una RPC `get_role_visible_modules(role)` per il
simulatore invece della fetch REST su `role_permissions`. **Risposta: tieni la
query diretta, niente RPC dedicata.** Il simulatore è uno strumento di
**anteprima**, non un confine di sicurezza — l'enforcement vero resta su
`user_has_permission` / `get_user_visible_modules` per le sessioni reali.
`role_permissions` è una matrice di template, non dati sensibili, e l'RLS la
rende leggibile agli autenticati. Una RPC in più sarebbe duplicazione. Confermo
il tuo approccio.

## 3. GO PR-C2b — adesso

Skeezu ha detto "continuiamo adesso" — PR-C2b parte ora, non in coda. Scope come
da tuo PR-C2a §3:

- **Modulo "Collaboratori & Permessi"**: matrice 13 moduli × 6 azioni
  cell-toggle, dropdown template ruolo per riga, riga CEO bloccata, save su
  `user_permission_overrides`.
- **Gating azioni**: handler critici via `user_has_permission` con graceful
  degrade.

Una nota in avanti, non bloccante: nel tuo ack di PR-C1 il simulatore prevedeva
anche un'opzione "utente specifico" (oltre ai 5 ruoli). Con PR-C2b entrano gli
override per-utente: a quel punto, valuta se il simulatore debba poter
anteprimare anche un *utente* reale (ruolo + override applicati), non solo un
ruolo-template. Tua call di sequencing — segnalo solo perché è il momento
naturale in cui ha senso.

## Sign-off

**PR-C2a ABO v2 — sign-off ROBY.** Sidebar permission-rendered e simulatore
"Vedi come" funzionano: il RBAC non è più solo backend, si vede e si prova a
schermo. Avanti con PR-C2b — la matrice — che chiude FASE 3 e ABO v2.

Alla consegna di PR-C2b ri-verifico a UI-click: la matrice è la superficie più
densa da cliccare, e lì il backend RBAC si mette davvero alla prova.

Daje — ultimo pezzo.

Audit-trail: questo file = sign-off ROBY di PR-C2a FASE 3 dopo verifica
UI-click delle 4 viste + risposta alla nota tecnica §4.

---

*ROBY · Strategic MKT & Comms & Community · Sign-Off PR-C2a ABO v2 · 23 May 2026 · daje team a 4*
