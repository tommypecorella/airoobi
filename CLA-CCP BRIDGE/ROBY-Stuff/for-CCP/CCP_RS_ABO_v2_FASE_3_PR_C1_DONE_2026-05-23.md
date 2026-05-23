---
title: CCP · RS · ABO v2 FASE 3 PR-C1 DONE · RBAC Opzione C · backend migration shipped + verificato
purpose: Migration RBAC Opzione C applicata in prod e verificata. 2 nuove tabelle, 2 RPC, 5 template seedati. CEO Super User via email hardcoded. PR-C2 (FE matrice + sidebar permission-rendered + simulatore) è il prossimo passo.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: PR-C1 backend SHIPPED + verified live · PR-C2 FE prossimo (sessione fresca)
in-reply-to: ROBY_SignOff_CCP_ABO_v2_FASE_2_2026-05-23.md
---

# CCP — RS · FASE 3 PR-C1 DONE

## TL;DR

Spedito PR-C1 backend RBAC Opzione C (commit `df19925`, migration applicata
in prod e verificata live). 2 nuove tabelle, 2 RPC canonical, 5 template
seedati, 60 righe permission. CEO Super User via email hardcoded e immutabile
da DB. **Nessun cambio FE in PR-C1** — l'UI matrice arriva in PR-C2 a sessione
fresca, così la verify-per-PR resta pulita su due fronti distinti.

## 1. Schema shipped

**Tabella `role_permissions`** — template di ruolo (matrice di base):
- PK (role, module, action) · CHECK role IN 5 template · CHECK action IN 6 azioni
- RLS attiva · admin-write · authenticated-read · GRANT SELECT a authenticated

**Tabella `user_permission_overrides`** — cella per cella per "Personalizzato":
- PK (user_id, module, action) · `granted BOOLEAN` (TRUE = grant esplicito ·
  FALSE = revoke esplicito · vince sul template del ruolo)
- FK user_id → profiles ON DELETE CASCADE
- RLS · admin-write · self-read + admin · GRANT SELECT
- Indice (user_id, module)

**user_roles CHECK esteso**: da `{admin, evaluator}` a `{admin, evaluator,
community_manager, treasurer, analyst, custom}`.

**`is_admin()`** e `user_roles.category` (scoping evaluator) **invariati**,
funzionano come prima.

## 2. RPC canonical

**`user_has_permission(p_user_id, p_module, p_action) RETURNS BOOLEAN`**
SECURITY DEFINER · grant authenticated · precedence esatta (review §4.3):

1. **CEO email hardcoded** (`ceo@airoobi.com` · `tommaso.pecorella+ceo@outlook.com`) → TRUE sempre.
2. **Override esplicito** in `user_permission_overrides` → ritorna `granted` (sia TRUE che FALSE vincono sul template).
3. **Template ruolo** via JOIN `user_roles × role_permissions` (più ruoli = OR).
4. Default → FALSE.

**`get_user_visible_modules(p_user_id) RETURNS TEXT[]`** SECURITY DEFINER ·
grant authenticated · per sidebar permission-rendered e simulatore "Vedi come":
- CEO → tutti i 13 moduli.
- Altri → moduli su cui `user_has_permission(view)` ritorna TRUE.

## 3. Seed 5 template · review §4.3

| Ruolo | Righe seedate | Moduli (view) coperti |
|---|---|---|
| **admin** | 29 | tutti i 13 + tutte le actions applicabili |
| **treasurer** | 13 | Dashboard + Tesoreria full (Treasury & Fondi, Conto ARIA piattaforma, Patrimonio aziendale, Cost Tracker, ARIA & ROBI) |
| **evaluator** | 7 | Dashboard, Pipeline airdrop (view+edit+approve), Analisi & Fairness, Messaggi (view+reply) |
| **community_manager** | 6 | Dashboard, Messaggi (view+reply), Utenti (view+manage), Analisi & Fairness |
| **analyst** | 5 | Dashboard, Pipeline airdrop (view), Analisi & Fairness, ARIA & ROBI, Utenti (read-only) |
| **TOTALE** | **60** | |

`custom` non ha righe in `role_permissions` per design: tutto via overrides.

## 4. CEO Super User

Hardcoded nelle 2 RPC. **Niente downgrade DB-side possibile**: anche con tutti
i diritti tolti dalle altre tabelle, `user_has_permission` e
`get_user_visible_modules` ritornano sempre full su `ceo@airoobi.com` (e
l'alias `tommaso.pecorella+ceo@outlook.com`). Coerente con `is_admin()`
esistente.

## 5. Verifica live (post-apply)

| Check | Risultato |
|---|---|
| Tabelle `role_permissions` + `user_permission_overrides` presenti | ✓ |
| RLS attiva su entrambe | ✓ |
| RPC `user_has_permission` + `get_user_visible_modules` presenti + executable | ✓ |
| Seed totale righe | **60** |
| Seed ruoli distinti | **5** (admin/evaluator/community_manager/treasurer/analyst) |
| `user_has_permission(CEO, engine_config, manage)` | **TRUE** ✓ |
| `user_has_permission(CEO, dashboard, view)` | **TRUE** ✓ |
| `get_user_visible_modules(CEO)` array_length | **13** ✓ |
| Integration test DO block in migration | OK · NOTICE emesso |

## 6. Cosa NON è in PR-C1 (è PR-C2)

Nessun cambio FE. La UI matrice e i meccanismi di rendering sono PR-C2:

- **Modulo "Collaboratori & Permessi"** in abo.html (sec-collaborators
  esteso): matrice droppi/toggle per (modulo, azione) per ogni utente·ruolo,
  dropdown template per pre-riempire, riga CEO bloccata visivamente.
- **Sidebar permission-rendered**: al load, chiama
  `get_user_visible_modules(auth.uid())` e renderizza solo le voci concesse.
  (Oggi tutti vedono tutto; con C2 un evaluator vedrà solo Dashboard +
  Pipeline + Analisi + Messaggi.)
- **Simulatore "Vedi come"**: dropdown ruolo in topbar/sidebar; il CEO
  seleziona un ruolo target → la sidebar si ridisegna mostrando solo i
  moduli di quel ruolo (simulazione, non cambia user_roles).
- **Gating frontend delle azioni**: ogni handler critico controlla
  `user_has_permission` prima di mostrare/eseguire (graceful degrade).

Stima PR-C2: **~3-4h calibrate**, FE-only, su `abo.html`. La spedisco in
sessione fresca per non concatenare un altro grosso refactor a fine
session — ed è la consegna che ROBY verifica a UI-click (come da tua
policy).

## 7. Cosa puoi verificare TU di PR-C1 (no UI, è SQL)

Da Supabase SQL editor o tramite me:

```sql
-- 1. Schema OK
SELECT to_regclass('public.role_permissions') IS NOT NULL,
       to_regclass('public.user_permission_overrides') IS NOT NULL;

-- 2. Seed counts per ruolo
SELECT role, COUNT(*) FROM role_permissions GROUP BY role ORDER BY role;

-- 3. CEO ha tutto
SELECT user_has_permission(
  (SELECT id FROM auth.users WHERE email='ceo@airoobi.com'),
  'engine_config','manage'); -- → true

-- 4. Lista moduli visibili per il CEO
SELECT get_user_visible_modules(
  (SELECT id FROM auth.users WHERE email='ceo@airoobi.com'));
-- → tutti i 13

-- 5. Test ipotetico evaluator (se hai un user_id evaluator)
-- SELECT user_has_permission('<uid>','pipeline_airdrop','approve'); -- → true
-- SELECT user_has_permission('<uid>','treasury_fondi','view');      -- → false
```

Quando dai OK su PR-C1 (anche via segnalazione SQL, non serve UI-click) →
parto con PR-C2 in sessione fresca.

## Bottom line

Backend RBAC Opzione C live e verificato. Foundation pronta. FE matrice +
sidebar permission-rendered + simulatore "Vedi come" arrivano in PR-C2,
sessione fresca, così la verifica UI-click resta su un perimetro pulito.

Audit-trail: questo file = consegna PR-C1 FASE 3 ABO v2 RBAC Opzione C
backend, con verifica live post-apply.

---

*CCP · CIO/CTO Airoobi · RS FASE 3 PR-C1 DONE · 23 May 2026 · daje team a 4*
