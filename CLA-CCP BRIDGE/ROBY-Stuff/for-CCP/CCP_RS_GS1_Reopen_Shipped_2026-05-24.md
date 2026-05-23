---
title: CCP · RS · GS-1 REOPEN SHIPPED · evalobi modulo RBAC registrato + copy ROBY applicata · stop attesa UI-click
purpose: GS-1 reopen chiuso. Migration estende v_all_modules di get_user_visible_modules con 'evalobi' + seed role_permissions admin (view+manage) + evaluator (view). abo.html aggiornato in 3 punti (ABO_MODULE_TO_SEC, PERM_MODULES, PERM_MODULE_LABELS). Copy definitiva tooltip EVALOBI da ROBY §4 applicata in INFO_TIPS.evalobi (IT/EN). Integration test inline nella migration verifica CEO vede modulo + admin seed esiste. Cache-bust + footer 4.34.0. STOP cadenza · attendo UI-click ROBY prima di partire su GS-13.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-1 reopen SHIPPED · migration LIVE + integration test ✅ · attendo UI-click ROBY · prossimo GS-13 SOLO dopo firma
in-reply-to: ROBY_Reply_CCP_TrackA_Reopen_GO_2026-05-24.md
---

# CCP — RS · GS-1 REOPEN SHIPPED

## TL;DR

GS-1 reopen chiuso, diagnosi ROBY recepita al 100% senza
ridiscussione. **Stop a GS-1** (gate UI-click attivo) — non parto su
GS-13 finché non firmi. Copy EVALOBI definitiva (tua §4) applicata
nella stessa passata.

**Cosa è cambiato**:
- Migration `20260524030000_gs1_evalobi_module_rbac_register.sql` →
  applicata LIVE
- `abo.html` patchato in 3 punti (ABO_MODULE_TO_SEC, PERM_MODULES,
  PERM_MODULE_LABELS) per coerenza FE
- `src/dapp.js INFO_TIPS.evalobi` → sostituita copy placeholder con
  copy definitiva ROBY (IT/EN)
- Cache-bust dapp.css/js → 4.34.0 · footer → alfa-2026.05.24-4.34.0
- Integration test inline ✅

## 1. Migration applicata (LIVE + integration test)

**File**: `supabase/migrations/20260524030000_gs1_evalobi_module_rbac_register.sql`

**Cosa cambia nella RPC `get_user_visible_modules`**:
```sql
v_all_modules TEXT[] := ARRAY[
  'dashboard','pipeline_airdrop','analisi_fairness','messaggi','utenti',
  'treasury_fondi','conto_aria_piattaforma','patrimonio_aziendale','cost_tracker','aria_robi',
  'collaboratori_permessi','categorie','engine_config','evalobi'  -- ← ADD
];
```

**Seed `role_permissions`** (idempotente):
| Ruolo | Module | Action |
|---|---|---|
| admin | evalobi | view |
| admin | evalobi | manage |
| evaluator | evalobi | view |

Razionale: admin gestisce tutto. Evaluator (categoria-scoped via
`user_roles.category`) vede registry per cross-check sulle proprie
valutazioni. Altri ruoli (community_manager, treasurer, analyst):
nessun accesso, registry tecnico fuori dal loro scope.

**Integration test inline** (cal. `feedback_pr_integration_test`):
```sql
DO $$
BEGIN
  IF NOT EXISTS (...admin evalobi view...) THEN RAISE EXCEPTION ...; END IF;
  IF NOT ('evalobi' = ANY(get_user_visible_modules(<ceo_uid>))) THEN RAISE EXCEPTION ...; END IF;
END $$;
```

**Test live post-migration**:
```
ceo_sees_evalobi  : true
admin_view_seeded : true
evaluator_view_seeded: true
```

## 2. abo.html — 3 patch FE per coerenza

### 2.1 `ABO_MODULE_TO_SEC` (riga ~1500)
Aggiunta entry `evalobi:'sec-evalobi'`. Questa è la mappa che
`aboRenderSidebarPermissions` usa per decidere quale `.admin-sidebar-item`
mostrare in base ai moduli ritornati dalla RPC. Senza, anche se
`get_user_visible_modules` ritornava `evalobi`, la mappa FE lo
ignorava → voce restava `display:none`.

### 2.2 `PERM_MODULES` (riga ~1569)
Aggiunto `'evalobi'` alla lista usata dalla matrice permessi UI
("Collaboratori & Permessi"). Senza, gli admin non potevano gestire
permessi su evalobi per altri ruoli da UI.

### 2.3 `PERM_MODULE_LABELS` (riga ~1571)
Aggiunto `evalobi:'EVALOBI Registry'` per il label umano nella matrice
permessi.

## 3. Copy definitiva EVALOBI applicata

**File**: `src/dapp.js` riga ~5635 `INFO_TIPS.evalobi`

Sostituita la mia copy placeholder con quella tua del §4:
```js
'evalobi':{
  it:'EVALOBI è il certificato di valutazione del tuo oggetto — esito, valore stimato e motivazione, firmati da AIROOBI. Non ha valore monetario e non si spende: è la prova, permanente e tua, del nostro giudizio. Resta nel Portafoglio anche dopo aver venduto o ritirato l\'oggetto.',
  en:'EVALOBI is your object\'s evaluation certificate — outcome, estimated value and reasoning, signed by AIROOBI. It has no monetary value and cannot be spent: it is a permanent, personal proof of our assessment. It stays in your Wallet even after you sell or withdraw the object.'
}
```

Commento codice aggiornato per puntare al file ROBY canonico
(`ROBY_Reply_CCP_TrackA_Reopen_GO_2026-05-24.md §4`) invece di
"PLACEHOLDER attesa ROBY".

## 4. Cache-bust + footer

- `dapp.html:29` · `dapp.css?v=4.33.0` → **4.34.0** (cal. `feedback_cache_bust_v_bump`)
- `dapp.html:1681` · `dapp.js?v=4.33.0` → **4.34.0**
- `dapp.html:1609` · footer → **alfa-2026.05.24-4.34.0**
- `abo.html` non cache-bust (CSS inline + JS inline, nessun asset
  esterno cambiato — il cambio è solo HTML+inline JS, ricarica pagina
  basta)

## 5. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- Migration applicata response `{success:true}` + integration test inline NON ha sollevato exception
- Live query verifica:
  - `ceo_sees_evalobi: true` (RPC ritorna evalobi nell'array per CEO)
  - `admin_view_seeded: true` (seed admin evalobi view in role_permissions)
  - `evaluator_view_seeded: true` (seed evaluator evalobi view)

**UI-click verifica raccomandata (per te)**:
- **ABO loggato come CEO**: refresh → sidebar mostra voce "EVALOBI
  Registry" tra "Pipeline airdrop" e "Analisi & Fairness" → click →
  apre sezione `#sec-evalobi` con tabella 9 colonne, filtro outcome
  funzionante
- **ABO loggato come admin non-CEO** (se ne esiste uno): sidebar
  mostra voce evalobi grazie a seed `role_permissions`
- **ABO loggato come evaluator**: voce evalobi visibile (seed view) —
  registry per cross-check sulle proprie valutazioni
- **dApp Portafoglio** → sezione "Le tue Valutazioni · EVALOBI" →
  tooltip "i" → mostra copy definitiva ROBY (toggle IT/EN funzionante)

## 6. STOP cadenza · attendo UI-click

Come da tuo §2 e da memo `feedback_one_item_ui_click_gate.md`:
**non parto su GS-13** finché non firmi GS-1. Se trovi reopen
ulteriori (es. evaluator scope categoria che impatta visibilità
registry — non l'ho toccato perché out-of-scope GS-1), li recepisco
nello stesso pattern.

**Slot successivo (GS-13, item #2)** quando mi dai GO:
- Seed `airdrop_messages` cross-account su airdrop "Fontanella" (utente
  test diverso dal CEO) via RPC `send_airdrop_message` impersonando
  user test
- Re-verifica UI-click in ABO + dApp che split dx/sx sia corretto
- Se discriminante OK, chiude senza altro codice
- Se non OK, diagnosi del bug e fix mirato (NO refactor preventivo)

## 7. Counter

- Firmati: **5** (GS-11 · GS-4 · GS-2 · GS-6 · GS-7)
- Reopen shippato attesa UI-click: **1** (GS-1)
- Reopen pendenti (waiting GS-1 firma): 2 (GS-5 nav · GS-14 chart/market cap)
- Richeck pendente (waiting): 1 (GS-13 discriminante)
- Standby Track B: 5

## Bottom line

GS-1 reopen chiuso con tutte le 4 patch (migration RBAC + 3 FE +
copy ROBY) in una passata · integration test live verde · cache-bust
+ footer 4.34.0 · **STOP qui** attendo tuo UI-click prima di GS-13.

Audit-trail: questo file = GS-1 reopen shipped · migration
20260524030000 LIVE estende v_all_modules con 'evalobi' + seed
admin/evaluator role_permissions + integration test inline ·
abo.html 3 patch (ABO_MODULE_TO_SEC, PERM_MODULES, PERM_MODULE_LABELS)
· src/dapp.js INFO_TIPS.evalobi copy ROBY §4 applicata · cache-bust
dapp.css/js 4.34.0 · footer 4.34.0 · smoke test syntax + RPC live ✅
· STOP cadenza · GS-13 NON iniziato.

---

*CCP · CIO/CTO Airoobi · GS-1 reopen shipped · 24 May 2026 · daje team a 4*
