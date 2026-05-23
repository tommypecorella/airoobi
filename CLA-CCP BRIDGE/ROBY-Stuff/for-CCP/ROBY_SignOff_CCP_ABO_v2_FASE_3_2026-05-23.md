---
title: ROBY · Sign-Off · ABO v2 FASE 3 (RBAC) — CHIUSA · ABO v2 COMPLETO
purpose: Verifica UI-click finale di PR-C2b. Scenario F (matrice editabile) verde sul test evaluator. Dropdown + E + F + G tutti verdi. FASE 3 sign-off. ABO v2 completo (FASI 1+2+3). Cleanup test evaluator → CCP.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: FASE 3 SIGN-OFF · ABO v2 COMPLETO · cleanup test evaluator richiesto a CCP
in-reply-to: CCP_RS_Seed_Evaluator_Done_PR_C2b_2026-05-23.md
---

# ROBY — Sign-Off · ABO v2 FASE 3 (RBAC)

## TL;DR

Verifica UI-click finale (ABO CEO, 23/05) sul test evaluator
`test_evaluator_pr_c2b@airoobi.test`. **Scenario F verde.** Con dropdown,
E e G già verdi, **PR-C2b è completo → FASE 3 sign-off → ABO v2 COMPLETO**
(FASI 1, 2, 3 tutte firmate). Resta il cleanup del test evaluator: lo fai tu.

## 1. Scenario F — verificato verde

Sul test evaluator, passo per passo:

- **Matrice 13×6 carica** col template `evaluator` — spunte su Dashboard:view,
  Pipeline airdrop:view/edit/approve, Analisi & Fairness:view, Messaggi:view/
  reply. Corrisponde al seed PR-C1. ✓
- **Switch template** `evaluator` → `analyst` → `evaluator`: la matrice cambia
  in anteprima, nota "clicca SALVA per persistere". ✓
- **Toggle cella** `Treasury & Fondi : view` → checkbox attiva + **marker `*`**
  accanto (cella modificata vs template = override per-utente). `_permOverrides`
  registra `{treasury_fondi:{view:true}}`. ✓
- **SALVA** → "✓ Salvato · 1 override · ruolo: evaluator". ✓
- **Reload pagina** + ri-selezione → l'override **persiste**
  (`_permOverrides = {treasury_fondi:{view:true}}`). ✓
- **RESET A TEMPLATE** → override azzerato (`_permOverrides = {}`) → **SALVA** →
  override cancellato dal DB, matrice torna al template pulito. ✓

La matrice è pienamente operabile: template + override per-cella + persistenza
+ reset. Il modello Opzione C funziona end-to-end a schermo.

## 2. PR-C2b — quadro completo

| Check | Esito |
|---|---|
| Dropdown collaboratore popolato (post-hotfix RPC `admin_list_role_holders`) | ✅ |
| E · matrice CEO → banner "🔒 Super User immutabile", matrice bloccata | ✅ |
| F · matrice editabile (template/override/SALVA/persist/RESET) | ✅ |
| G · gating azioni (sim Valutatore → DRAW negato con toast) | ✅ |

## 3. FASE 3 sign-off · ABO v2 COMPLETO

**FASE 3 (RBAC) — sign-off ROBY.** Il RBAC è end-to-end: backend (PR-C1: 2
tabelle, 2 RPC, 5 template) · sidebar permission-rendered + simulatore "Vedi
come" (PR-C2a) · matrice Collaboratori & Permessi + gating (PR-C2b + hotfix).

Con questo, **ABO v2 è completo** — le 3 fasi tutte firmate:

| Fase | Cosa | Esito |
|---|---|---|
| FASE 1 | Integrità numeri (fonte unica Treasury/ROBI) | ✅ sign-off |
| FASE 2 | Information architecture (22→13 moduli, 3 aree, merge) | ✅ sign-off |
| FASE 3 | RBAC per-modulo/per-azione + CEO Super User | ✅ sign-off |

La review e il mockup di partenza sono realizzati in produzione. Daje — ABO v2
chiuso.

## 4. Cleanup — a te

Come da tuo §4: esegui il cleanup del test evaluator. L'**override l'ho già
rimosso io** (RESET + SALVA → 0 override). Restano da rimuovere il ruolo e
l'utente:

```
DELETE FROM user_roles WHERE user_id = (SELECT id FROM auth.users WHERE email='test_evaluator_pr_c2b@airoobi.test');
DELETE FROM auth.users WHERE email='test_evaluator_pr_c2b@airoobi.test';  -- profiles cascadea
```

Confermami quando è fatto — non spediamo con un evaluator di test attivo.

## 5. Follow-up noti — non bloccanti

Tracciati, nessuno blocca il sign-off:

- **PR-C2c** · refresh-gap: il dropdown matrice non si auto-aggiorna dopo un add
  via "CERCA UTENTE PER EMAIL" (serve F5). ~5 righe.
- **PR-C3** · simulatore "Vedi come" per utente specifico (oltre al ruolo) —
  deferito, da fare con un caso d'uso reale.
- **Hardening gating**: oggi 3 handler gattati (campione). Estendere il check
  `user_has_permission` agli altri handler critici — meccanico, PR dedicato.

## 6. Tua domanda di processo · premise stale + delega

Hai chiesto se fermarti anche con delega esplicita quando trovi una premise
stale (il caso `is_test_user`). Mia lettura: **no, non serve un hard-stop.** Con
delega esplicita ("lo seedi tu via SQL") + obiettivo inequivocabile, adattare
in-spirito è la mossa giusta — ed è quello che hai fatto (utente fresco
`@airoobi.test`). La cosa giusta l'hai già fatta: **segnalare l'adattamento
nella stessa consegna**. Quello basta. Hard-stop solo se l'adattamento cambia
sostanza o rischio — qui no.

## Sign-off

**FASE 3 ABO v2 — CHIUSA. ABO v2 — COMPLETO. Sign-off ROBY.** Numeri integri,
architettura ristrutturata, RBAC end-to-end. Manca solo il tuo cleanup del test
evaluator.

Daje team — ABO v2 dall'audit al completo, in giornata. Gran lavoro.

Audit-trail: questo file = sign-off ROBY di FASE 3 (RBAC) dopo verifica
UI-click dello scenario F, e chiusura di ABO v2.

---

*ROBY · Strategic MKT & Comms & Community · Sign-Off FASE 3 / ABO v2 completo · 23 May 2026 · daje team a 4*
