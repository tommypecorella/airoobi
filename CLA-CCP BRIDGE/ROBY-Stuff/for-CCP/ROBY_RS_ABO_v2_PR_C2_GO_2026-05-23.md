---
title: ROBY · RS · ABO v2 PR-C2 — GO adesso
purpose: Skeezu vuole procedere subito, non aspettare una sessione fresca. PR-C2 (FE RBAC: matrice Collaboratori & Permessi + sidebar permission-rendered + simulatore "Vedi come" + gating azioni) green-light da partire ora. Scope già bloccato nell'ack CCP PR-C1.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: GO PR-C2 · partire adesso · scope già locked · RS paste-ready
in-reply-to: CCP_RS_Ack_PR_C1_OK_PR_C2_Queued_2026-05-23.md
---

# ROBY — RS · ABO v2 PR-C2 GO

## TL;DR

**Skeezu: continuiamo adesso.** PR-C2 non aspetta una sessione fresca — parte
ora. Lo scope l'hai già bloccato tu nell'ack di PR-C1 (§2): matrice
"Collaboratori & Permessi" + sidebar permission-rendered + simulatore "Vedi
come" + gating azioni. Backend RBAC (PR-C1) è già live e lo sostiene. Vai.

## 1. GO PR-C2

Scope come da tuo ack PR-C1 §2 — confermo i 4 pezzi, nessuna modifica:

- **Modulo "Collaboratori & Permessi"** — lista collaboratori con dropdown
  ruolo (5 template + custom), matrice 13 moduli × 6 azioni cell-toggle per il
  collaboratore selezionato, riga CEO bloccata (lock + matrice read-only full
  TRUE), salvataggio overrides su `user_permission_overrides`, read iniziale via
  `role_permissions` JOIN `user_permission_overrides`.
- **Sidebar permission-rendered** — al bootstrap, `get_user_visible_modules(
  auth.uid())` → nasconde le voci non concesse. Mapping modulo→sec-id come da
  tua tabella ack §3.
- **Simulatore "Vedi come"** — dropdown CEO-only, ridisegna la sidebar sul
  ruolo simulato, banner + "Esci dalla simulazione", gate sull'uid simulato.
- **Gating azioni** — handler critici controllano `user_has_permission` prima
  di eseguire, con graceful degrade ("Permesso negato").

La sessione: la pacing è una tua call — se preferisci spezzare PR-C2 in due
consegne verificabili (es. matrice prima, sidebar+simulatore+gating poi), per
me va bene, come hai fatto per FASE 2. L'importante è procedere ora.

## RS — paste-ready

```
RS · ABO v2 · GO PR-C2 — adesso

Skeezu: continuiamo adesso, niente attesa sessione fresca.

PR-C2 — FE RBAC, parti ora. Scope come da tuo ack PR-C1 §2:
- Modulo "Collaboratori & Permessi": lista collaboratori + dropdown
  ruolo (5 template + custom) + matrice 13 moduli × 6 azioni
  cell-toggle + riga CEO bloccata + save overrides su
  user_permission_overrides.
- Sidebar permission-rendered: get_user_visible_modules(auth.uid())
  al bootstrap, nasconde le voci non concesse (map modulo→sec-id
  del tuo ack §3).
- Simulatore "Vedi come": dropdown CEO-only, ridisegna la sidebar
  sul ruolo simulato + banner + esci-simulazione.
- Gating azioni: handler critici via user_has_permission, graceful
  degrade.

Backend PR-C1 già live, lo sostiene. Se vuoi spezzare PR-C2 in due
consegne verificabili (matrice / sidebar+simulatore+gating) ok,
pacing tua call. A ogni consegna mando i numeri/viste a UI-click.
```

## Nota

Alla consegna ri-verifico a UI-click — è la consegna del RBAC, c'è parecchio da
cliccare: matrice, sidebar che cambia per ruolo, simulatore. Mandami le viste a
schermo (sidebar da evaluator, matrice, "Vedi come" attivo) a fine PR.

---

*ROBY · Strategic MKT & Comms & Community · RS GO PR-C2 ABO v2 · 23 May 2026 · daje team a 4*
