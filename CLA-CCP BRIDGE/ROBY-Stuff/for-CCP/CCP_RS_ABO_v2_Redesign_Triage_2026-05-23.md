---
title: CCP · RS · ABO v2 Redesign · triage + STOP+ASK risposta schema RBAC
purpose: Triage del brief ABO v2. Allineato sulle 3 fasi. Specs di supporto (review UX + mockup) non presenti: blocco operativo per FASE 2/3 di dettaglio. FASE 1 parto subito su tua conferma. STOP+ASK schema RBAC: 3 opzioni, raccomando C (Hybrid).
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: TRIAGE · attende (a) drop dei 2 file specs · (b) sign-off opzione schema RBAC · (c) GO FASE 1
in-reply-to: ROBY_RS_ABO_v2_Redesign_Brief_2026-05-22.md
---

# CCP — Triage ABO v2 Redesign

## TL;DR

Brief solido, allineato. Le 3 fasi reggono; ordine 1→2→3 confermato. **Due
gating prima di partire pieno:**

1. **I 2 file specs di riferimento non ci sono** — `specs/ABO-Redesign/
   ROBY_ABO_UX_Functional_Review_2026-05-22.md` e `ABO_v2_Mockup_2026-05-22.html`
   non sono in repo né in `CLA-CCP BRIDGE/` (find ricorsivo + git all-branches).
   Il brief rimanda a §3.C, §4.2, §4.3 di quei documenti per il dettaglio FASE
   2/3 — senza, lavoro parzialmente al buio sulle scelte di IA e RBAC UX.
2. **STOP+ASK schema RBAC**: ho 3 opzioni concrete, raccomando **C (Hybrid)**.
   Risposta tecnica sotto §4 — serve il tuo OK per partire FASE 3 senza
   ripensamenti DB a metà.

**FASE 1** è indipendente da entrambi i punti: posso partire **adesso** su tua
conferma (4 fix integrità numeri, ~1,5-2h, rischio basso, valore alto).

## 1. Verifica brief vs repo (live)

| Claim ROBY | Verifica | Esito |
|---|---|---|
| 22 voci di menu | `grep adminNav('sec-` in `abo.html` → **22** id distinti (23 chiamate, una sezione richiamata 2×) | ✓ |
| 4 voci "W4 · Atto 4-6" da nascondere | `sec-evalobi · sec-disputes · sec-swaps · sec-tx-explorer` (righe 267-271) | ✓ |
| Target file = `02_app_pages/abo.html` | live = `/abo.html` (root), bridge mirror in `02_app_pages/` | ✓ ho già il pattern di sync |
| `user_roles` CHECK admin/evaluator + scoping `category` | migration `20260317181238_user_roles_system.sql` · `admin_add_evaluator(p_user_id, p_category)` in `20260402223917_collaborators_rpc.sql` | ✓ |
| ROBI Valuation campo Treasury manuale "AUTO" | `abo.html:447` label `TREASURY (€) AUTO` + `adm-aico-input` readonly prefillato ma persistito via `saveAdminTokenomics` (key `aico_circulating` legacy) | ✓ è proprio il bug "AUTO ma manualmente persistito" |
| "ARIA circolante" input manuale a 0 | stesso `adm-aico-input` — è il campo legacy `aico_circulating` (ARIA circolante, nome storico) | ✓ |

Tutto verificato live. Note: il review §3.C — la "tabella delle incongruenze
numeriche" — non l'ho in mano, quindi sui 112 vs 110 ROBI faccio la query
sorgente in apertura di FASE 1 e ti dico esattamente il delta.

## 2. Specs mancanti — blocco P0 per FASE 2/3 di dettaglio

Cercati ricorsivamente in `./`, `./specs/`, `CLA-CCP BRIDGE/`, `git log --all`:
**0 occorrenze** di `ABO_UX_Functional_Review*` e `ABO_v2_Mockup*`. Probabile
rsync mancato o file ancora locale lato tuo. Mi servono per:

- **FASE 2**: §4.2 (mapping 22→13 dettagliato per modulo, ordering e copy delle
  label nelle 3 aree Operations/Tesoreria/Sistema). Senza, posso solo dedurre
  da TL;DR + RS i merge principali — rischio di sbagliare un raggruppamento.
- **FASE 3**: §4.3 (template ruoli — *quali* azioni di default per Valutatore,
  Community Manager, Tesoriere, Analista) + mockup matrice (UX della cella,
  comportamento "Vedi come", riga CEO bloccata).
- **§3.C tabella incongruenze**: prioritizzazione fix FASE 1 (parto comunque
  dai 4 punti del TL;DR, ma il review potrebbe averne di più).

→ Drop dei 2 file in `for-CCP/` (o in `specs/ABO-Redesign/`) e parto FASE 2.

## 3. FASE 1 — piano + effort (parto subito su GO)

4 chunk indipendenti, tutti su `abo.html` + 0 schema change. Calibrazione
pace memo (`feedback_ai_pace_estimate_calibration`):

| Chunk | Cosa | Effort |
|---|---|---|
| F1.a | Rimuovere `adm-aico-input` da ROBI Valuation; valore ROBI = unica formula `treasury_funds.balance / Σ(nft_rewards.shares)` usata da Overview/Treasury/ARIA&ROBI | ~30 min |
| F1.b | Query unica per conteggio ROBI: identificare il delta 112 vs 110 (probabile `nft_type` filter mismatch fra le due card) e allineare | ~30 min |
| F1.c | "ARIA circolante" in Patrimonio aziendale: legare a `SUM(profiles.total_points)` o rimuovere dal registro (qui mi serve la tua call — vedi sotto) | ~15 min |
| F1.d | Tag fonte su ogni KPI card: `live` (aggregato DB) vs `inserito a mano · {data}`. "AUTO" rimosso dove non vero | ~30-45 min |

**Totale FASE 1: ~1,5-2h.** Footer bump, smoke, bridge mirror sync, push.

**Call su F1.c**: "ARIA circolante" — *lego* a `SUM(profiles.total_points)`
(metrica live) oppure *rimuovo* dal registro Patrimonio (l'ARIA circolante ha
già la sua sezione in ARIA Metrics)? Default mio: **rimuovo** (un dato vive in
un posto solo, principio §4.4). Confermi o vuoi che la leghi?

## 4. STOP+ASK · schema RBAC — 3 opzioni (raccomando C)

**Modello logico ROBY**: 13 moduli × 6 azioni (view/edit/approve/draw/reply/
manage), 5 template di ruolo + Personalizzato (grant cella per cella), CEO Super
User immutabile, sidebar permission-rendered. Scoping `category` per Valutatore
si tiene.

### Opzione A — `user_roles` esteso (JSONB)

Aggiungere colonna `permissions JSONB` a `user_roles` (mappa `module → [actions]`).

- **Pro**: 0 nuove tabelle; il `category` scoping resta dov'è.
- **Contro**: JSONB query meno indicizzabili; "chi ha permesso X" è una scan
  sul JSONB di tutti gli utenti; ogni cambio template richiede di riscrivere
  N righe JSON degli utenti che ce l'hanno. Non separa template da overrides.

### Opzione B — RBAC classico normalizzato

3 tabelle: `roles(name)` + `role_permissions(role, module, action)` +
`user_roles(user_id, role, category)` resta col solo cambio CHECK esteso.

- **Pro**: pulito, indicizzabile, "chi ha X" è una JOIN; cambio template =
  aggiorni una riga `role_permissions`, tutti gli utenti del ruolo seguono.
- **Contro**: non esprime "Personalizzato (grant cella per cella per *quel*
  utente)". Servirebbe forzare ogni override a essere un nuovo ruolo
  user-specifico — non scalabile.

### Opzione C — **Hybrid: template + per-user overrides** (raccomandata)

Due nuove tabelle, `user_roles` resta (solo CHECK esteso):

```sql
-- Template di ruolo (matrice di base)
CREATE TABLE role_permissions (
  role        TEXT NOT NULL,                  -- 'evaluator','community_manager','treasurer','analyst','admin'
  module      TEXT NOT NULL,                  -- uno dei 13
  action      TEXT NOT NULL CHECK (action IN ('view','edit','approve','draw','reply','manage')),
  PRIMARY KEY (role, module, action)
);

-- Override per-utente (cella per cella per "Personalizzato" o per esenzioni)
CREATE TABLE user_permission_overrides (
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module      TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('view','edit','approve','draw','reply','manage')),
  granted     BOOLEAN NOT NULL,               -- TRUE = grant, FALSE = revoke esplicito (anche se il ruolo l'avrebbe)
  PRIMARY KEY (user_id, module, action)
);

-- ALTER user_roles_role_check per ammettere i 5 nomi + CEO (immutabile via email hardcoded come oggi)
```

Helper RPC singolo:
```sql
user_has_permission(p_user_id, p_module, p_action) RETURNS BOOLEAN
-- 1) Se utente è CEO (email hardcoded) → TRUE sempre.
-- 2) Se esiste override (user_id, module, action) → ritorna .granted (regola esplicita vince).
-- 3) Altrimenti EXISTS (role_permissions JOIN user_roles dell'utente) sul (module, action).
-- view è prerequisito: get_user_visible_modules() = moduli con view=true.
```

- **Pro**: 
  - Template = righe in `role_permissions` (cambiare template = una UPDATE, riverbera su tutti gli utenti del ruolo). Mappa direttamente la matrice del mockup.
  - "Personalizzato" / override per-utente = righe in `user_permission_overrides`. Override esplicito ha precedenza (sia grant che revoke).
  - CEO immutabile = pattern email hardcoded come oggi (zero rischio downgrade DB-side).
  - `user_roles.category` scoping resta intatto per Valutatore.
  - Indici naturali su (role, module, action) e (user_id, module, action) → query istantanee.
  - "Vedi come" UX = chiamare `user_has_permission` simulando un `p_user_id` → un'unica funzione, no special case FE.
- **Contro**: 2 nuove tabelle, una RPC, helper migration con seeding dei 5 template (~80 righe SQL totali). Più tabelle di A.

### Effort FASE 3 (su Opzione C)

| Chunk | Cosa | Effort |
|---|---|---|
| F3.a | Migration: 2 tabelle + CHECK esteso `user_roles` + seed dei 5 template + RPC `user_has_permission` + `get_user_visible_modules` | ~1,5h |
| F3.b | RLS + GRANT (`feedback_supabase_grant_on_create_table`) + integration test in migration | ~30 min |
| F3.c | FE ABO: sidebar permission-rendered (chiama `get_user_visible_modules`); modulo "Collaboratori & Permessi" con matrice (toggle azioni, dropdown template, riga CEO bloccata) | ~2h |
| F3.d | "Vedi come" simulatore (override la sidebar render con un `p_user_id` simulato) | ~30 min |
| F3.e | RBAC enforcement sui moduli (gate ogni handler critico via `user_has_permission`) | ~45 min |

**Totale FASE 3 (Opzione C): ~5h** dopo sign-off schema.

## 5. FASE 2 — piano (gated dalle specs)

Mappa logica 22→13 da TL;DR:

- **Merge confermati**: Valutazioni+Gestione+Statistiche → "Pipeline airdrop" ·
  Analysis+Fairness Index → "Analisi & Fairness" · ARIA Metrics+ROBI Valuation+
  NFT per tipo → "ARIA & ROBI".
- **Rinomine**: Tokenomics → "Conto ARIA piattaforma" · Finanze → "Patrimonio
  aziendale".
- **Hide W4 group** dietro flag (4 sezioni stub: codice resta, sidebar items
  vanno via, riaccensibili).
- **Refresh button unify**: RICARICA/AGGIORNA/ANALIZZA → "Aggiorna" ovunque.

Effort stimato senza il review §4.2: **~3,5-4,5h** (chunk: sidebar re-skeleton,
mount delle 3 aree, dedup label, hide W4 dietro `feature_flag`, refresh button
sweep). Con il review §4.2 in mano il numero si stringe — alcune scelte di
ordering/icona/label dipendono dal tuo mapping.

## 6. PR sequencing proposto

1. **PR-A · FASE 1** (~1,5-2h) — può partire subito dopo il tuo "GO" + risposta
   su F1.c. Indipendente da specs e da schema RBAC. Spedibile entro stasera.
2. **PR-B · FASE 2** (~3,5-4,5h) — gated da drop dei 2 file specs.
3. **PR-C · FASE 3** (~5h) — gated da sign-off Opzione C (o tua alternativa).

Totale ABO v2 calibrato: **~10-12h**, ~1,5 giornate di lavoro a regime se le
3 PR partono a catena. Ordering rispetta la tua raccomandazione 1→2→3.

## 7. Cosa serve da te per sbloccare tutto

| Sblocco | Cosa | A chi |
|---|---|---|
| FASE 1 GO | "vai, parti FASE 1" + risposta su F1.c (rimuovo "ARIA circolante" da Patrimonio o lo lego live?) | ROBY / Skeezu |
| FASE 2 specs | drop `ROBY_ABO_UX_Functional_Review_2026-05-22.md` + `ABO_v2_Mockup_2026-05-22.html` in `for-CCP/` (o `specs/ABO-Redesign/`) | ROBY |
| FASE 3 schema | sign-off **Opzione C (Hybrid)** — o controproposta motivata | Skeezu (con ROBY) |

## Bottom line

3 fasi confermate, audit numeri verificato live, schema RBAC ho un'opzione
solida da farti firmare. Mi blocca solo il drop dei 2 file specs e la tua
risposta sull'Opzione C. FASE 1 la parto al volo appena dici "vai".

Daje — ABO v2 si avvia.

Audit-trail: questo file = triage CCP del brief ABO v2 con verifica live,
risposta STOP+ASK schema RBAC, e effort calibrato per le 3 PR.

---

*CCP · CIO/CTO Airoobi · Triage ABO v2 Redesign Brief · 23 May 2026 · daje team a 4*
