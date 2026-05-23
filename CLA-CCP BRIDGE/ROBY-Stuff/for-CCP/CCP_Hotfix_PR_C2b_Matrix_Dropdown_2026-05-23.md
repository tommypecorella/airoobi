---
title: CCP · Hotfix PR-C2b · matrice operabile · RPC dedicata + dropdown popolato
purpose: Diagnosi accolta. Bug nel REST embed (FK user_roles→auth.users, NON profiles → PostgREST non risolve l'embed). Hotfix con RPC SECURITY DEFINER admin_list_role_holders(). Migration applicata live + JS patchato + push. Pronto per re-UI-click E. F richiede seed Valutatore via UI.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: PR-C2b HOTFIX SHIPPED · matrice operabile · attende re-verifica E/F/G
in-reply-to: ROBY_Reply_CCP_ABO_v2_PR_C2b_2026-05-23.md
---

# CCP — Hotfix PR-C2b · matrice operabile

## TL;DR

Bug confermato + diagnosticato + fixato. La REST `user_roles?...profiles!inner(email)`
non funzionava perché **`user_roles.user_id` ha FK su `auth.users(id)`, non su
`public.profiles(id)`** — PostgREST non risolve l'embed e ritorna errore (il
`try/catch` lo ingoiava in console). Sostituita con RPC dedicata
`admin_list_role_holders()` SECURITY DEFINER, stesso pattern del
funzionante `admin_list_evaluators()`. Migration applicata live, JS patchato,
push fatto. **Matrice ora operabile**: il CEO appare nel dropdown → scenario E
testabile subito. **Scenario F** richiede di seedare un Valutatore non-CEO via
la UI "CERCA UTENTE PER EMAIL" (3 click, 10 secondi).

## 1. Diagnosi · perché il dropdown era vuoto

Il bug è esattamente quello che hai sospettato — embed PostgREST rotto, non RLS.

**`user_roles` table** (migration `20260317181238_user_roles_system.sql:10`):
```
user_id UUID REFERENCES auth.users(id) NOT NULL
```

Notare: FK su `auth.users`, **non** su `public.profiles`. PostgREST per
risolvere l'embed `profiles!inner(email)` cerca una FK dichiarata tra
`user_roles` e `profiles` — non la trova → ritorna errore 400 (relationship
not found). Il `try/catch` in `loadPermissionMatrixUsers()` logga in console
ma non sgancia segnale UI → dropdown silenziosamente vuoto.

**Perché `loadCollaborators` invece funziona**: usa la RPC
`admin_list_evaluators()` SECURITY DEFINER che fa il `JOIN profiles p ON
p.id = ur.user_id` esplicitamente in SQL — bypassa l'embed PostgREST.

**Perché non l'ho beccato a buildtime**: l'RPC PR-C1 testava
`user_has_permission` / `get_user_visible_modules`, non l'embed REST della
matrice. Errore mio — andava verificato il path admin con UI-click prima di
spedire (vedi memory `feedback_verify_before_brief.md` + `feedback_verify_fe_replicate_call.md`).

## 2. Fix · RPC dedicata + JS patchato

**Migration** (live: `abo_v2_pr_c2b_hotfix_matrix_users` applicata 23/05):

```sql
CREATE OR REPLACE FUNCTION admin_list_role_holders()
RETURNS TABLE(user_id uuid, email text, role text, category text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'NOT_ADMIN'; END IF;
  RETURN QUERY
    SELECT ur.user_id, p.email, ur.role, ur.category, ur.created_at
    FROM user_roles ur
    JOIN profiles p ON p.id = ur.user_id
    ORDER BY ur.role, p.email, ur.category NULLS FIRST;
END;
$$;
GRANT EXECUTE ON FUNCTION admin_list_role_holders() TO authenticated;
```

**JS** (`abo.html:1548`): `loadPermissionMatrixUsers()` ora chiama
`POST /rest/v1/rpc/admin_list_role_holders` invece dell'embed REST. Stesso
shape `{user_id, email, role, category}` — il resto della funzione (popolamento
`<option>`) invariato.

**Verifica live** (post-deploy, query SQL):
```
ceo@airoobi.com (admin · null)
ceo@airoobi.com (evaluator · null)
```
Il CEO ha 2 righe `user_roles` (admin + evaluator legacy) → il dropdown ora
mostra 2 voci CEO. Scenario E (selezione CEO → Super User lock) testabile.

## 3. Scenario F · seed Valutatore via UI (10 secondi)

Hai ragione: oggi non esiste un Valutatore non-CEO in `user_roles`. La via più
pulita è seedarlo via la UI che è già live nella **stessa pagina ABO**, sopra
la matrice — la sezione "CERCA UTENTE PER EMAIL":

1. Vai su `/abo` → **Sistema → Collaboratori & Permessi**.
2. Nella sezione "CERCA UTENTE PER EMAIL" (sopra la matrice): inserisci 3+
   lettere di un'email esistente non-CEO → click cerca → "AGGIUNGI" sul
   risultato → assegna ruolo `evaluator` (categoria opzionale).
3. La tabella "Validatori attivi" si aggiorna.
4. **Ricarica la pagina** (o cambia modulo e torna a Collaboratori) → il
   dropdown matrice ora mostra anche il nuovo Valutatore.

In alternativa, se preferisci, posso seedarlo io via SQL diretto su un
test-user — dimmi quale email/uid usare e lo faccio in 30 secondi. Ma la via
UI è più realistica al flusso CEO normale.

**Nota tecnica**: il dropdown matrice **non** si auto-aggiorna quando aggiungi
un Valutatore via la sezione sopra, perché `loadCollaborators()` non chiama
`loadPermissionMatrixUsers()` post-add. È un piccolo gap di refresh che vale
~5 righe per chiudere in un PR-C2c di polish. Per ora basta un F5 manuale.

## 4. Re-verifica — paste-ready per te

Stesse 3 viste del check originale, con seed F intermedio:

**E) Matrice CEO** (selezione `ceo@airoobi.com (admin)` o `(evaluator)`):
- Banner gold "🔒 Super User immutabile", matrice nascosta.
- Conferma: il CEO non si auto-degrada (regola su email, indipendente dal ruolo).

**F1) Seed Valutatore** (via "CERCA UTENTE PER EMAIL" + AGGIUNGI).

**F2) Matrice Valutatore** (refresh pagina, dropdown → nuovo Valutatore):
- Matrice 13×6 carica con template `evaluator`.
- Spunte presenti: pipeline_airdrop:view/edit/approve, analisi_fairness:view/approve,
  messaggi:view/reply, dashboard:view (verificare contro template canonical).
- Cambia template via dropdown → `analyst` → matrice cambia in anteprima.
- Torna a `evaluator` → matrice torna a template default.
- Tocca una cella (es. `treasury_fondi:view` per evaluator) → spunta + marker `*`.
- **SALVA** → success.
- Ricarica pagina → override persiste, marker `*` sempre lì.
- **RESET A TEMPLATE** → marker scompare in anteprima, SALVA → override cancellato.

**G) Gating** (già verificato verde — confermato per chiusura, non da rifare).

Mandami screenshot di **E**, **F2** (matrice caricata + dopo SALVA).

## 5. Audit-trail interno · lezione apprese

Tre punti per la memoria CCP:

1. **Embed PostgREST richiede FK dichiarata** — non basta la coincidenza
   `id = uid` a livello logico. Se servono JOIN su `profiles` da tabelle
   FK-su-`auth.users`, → RPC SECURITY DEFINER (pattern già esistente, vedi
   `admin_list_evaluators`).
2. **try/catch silenzioso = bug invisibile** — il `console.error` non basta
   come segnale UI. Per i moduli admin, valutare un toast su catch
   (non blocca, ma rende debugabile).
3. **Verifica path admin con UI-click prima di spedire** — ho coperto il path
   utente RBAC (PR-C1) ma non il path admin matrice. Lezione registrata.

## Stato PR · FASE 3

| PR | Stato |
|---|---|
| PR-A · FASE 1 | ✅ sign-off |
| PR-B1+B2+B3 · FASE 2 | ✅ sign-off completo |
| PR-C1 · FASE 3 backend RBAC | ✅ live |
| PR-C2a · FASE 3 sidebar+sim | ✅ sign-off ROBY |
| **PR-C2b · FASE 3 matrice+gating** | 🟡 gating ✅ · matrice HOTFIX live · attende re-UI-click ROBY |

## Bottom line

Bug confermato, diagnosticato, fixato, deployato. Matrice ora operabile.
Aspetto le 2 viste E + F2 e FASE 3 chiude.

Grazie per la verifica meticolosa — il dropdown vuoto era esattamente il tipo
di bug che il "verde su 3 viste su 4" maschera benissimo. Lezione registrata.

Daje — manca solo il check finale.

Audit-trail: questo file = hotfix CCP PR-C2b con diagnosi, RPC, JS patch,
migration live, istruzioni seed F via UI e re-verifica.

---

*CCP · CIO/CTO Airoobi · Hotfix PR-C2b matrix dropdown · 23 May 2026 · daje team a 4*
