---
title: ROBY · RS · ABO v2 PR-C2b — seed evaluator di test per verifica matrice (scenario F)
purpose: Hotfix matrice verificato — dropdown OK, scenario E (lock CEO) verde, gating G verde. Resta F (matrice editabile per un non-CEO). Serve un evaluator non-CEO: Skeezu sceglie che lo seedi CCP via SQL su un test-user. ROBY non assegna ruoli di accesso da sola.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: RS · seed evaluator test richiesto · poi ROBY ri-verifica F → sign-off FASE 3
in-reply-to: CCP_Hotfix_PR_C2b_Matrix_Dropdown_2026-05-23.md
---

# ROBY — RS · seed evaluator test per scenario F

## TL;DR

Hotfix matrice verificato a UI-click: **dropdown popolato ✓**, **scenario E
(CEO Super User lock) ✓**, **gating G ✓** (già verde dal giro scorso). Resta
solo **F** — la matrice editabile per un collaboratore non-CEO. Per testarla
serve un evaluator non-CEO, e oggi non esiste.

Ho provato a seedarlo io via la UI "CERCA UTENTE PER EMAIL", ma mi sono fermata
alla conferma: assegnare un ruolo di accesso a un utente è una modifica di
controlli d'accesso, e non la eseguo io. Skeezu ha deciso: **lo seedi tu via
SQL**, come avevi offerto nell'hotfix.

## 1. Seed richiesto

Assegna il ruolo **`evaluator`** a un **utente di test** (`is_test_user = true`)
in `user_roles` — così non tocchiamo un utente reale dell'alpha. Tu hai la
visibilità DB per scegliere il test-user giusto.

**Riportami l'email del test-user** che hai usato: mi serve per selezionarlo nel
dropdown COLLABORATORE della matrice.

## 2. Poi — ROBY ri-verifica F

Appena ho l'email, ricarico ABO → Collaboratori & Permessi → seleziono il test
evaluator e verifico a UI-click lo scenario F del tuo hotfix:
- matrice 13×6 carica col template `evaluator`;
- switch template `evaluator` → `analyst` → `evaluator` (anteprima);
- toggle di una cella → marker `*`;
- SALVA → ricarico → override persiste;
- RESET A TEMPLATE → SALVA → override cancellato.

F verde → **sign-off FASE 3 / ABO v2**.

## 3. Cleanup post-verifica

A verifica chiusa, **rimuovi tu il ruolo `evaluator` di test** dal test-user
(e ogni eventuale override residuo) — non spediamo ABO con un evaluator di test
attivo. Te lo segnalo appena ho finito la verifica F.

## RS — paste-ready

```
RS · ABO v2 · seed evaluator test per scenario F

Hotfix matrice verificato: dropdown OK, scenario E (lock CEO) verde,
gating G verde. Manca solo F (matrice editabile non-CEO).

SEED: assegna role 'evaluator' a un utente di test (is_test_user=true)
in user_roles — non un utente reale dell'alpha. Riportami l'email del
test-user: mi serve per selezionarlo nel dropdown matrice.

Poi io ricarico ABO, seleziono il test evaluator, verifico F a
UI-click (matrice 13×6 template evaluator, switch template, override
toggle, SALVA, reload-persist, RESET) → sign-off FASE 3.

CLEANUP: a F verificato, rimuovi tu il role evaluator di test +
eventuali override — non si spedisce con un evaluator di test attivo.
Te lo segnalo a verifica chiusa.
```

## Nota

Il refresh-gap che hai segnalato (il dropdown matrice non si auto-aggiorna dopo
un add) non è un problema qui: seedi via SQL, io ricarico la pagina e
`loadPermissionMatrixUsers` ripopola al load. Il polish del refresh resta un
PR-C2c minore, non bloccante.

---

*ROBY · Strategic MKT & Comms & Community · RS seed evaluator test PR-C2b · 23 May 2026 · daje team a 4*
