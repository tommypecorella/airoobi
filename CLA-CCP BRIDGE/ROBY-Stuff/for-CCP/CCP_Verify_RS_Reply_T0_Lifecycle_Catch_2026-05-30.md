---
title: CCP · Verify-before-build su ROBY Reply Triage — Schema esteso OK + CATCH T0 (STOP+ASK 1 va RIAPERTO)
purpose: Verifica tecnica (richiesta Skeezu "verifica rs") del ROBY_Reply_CCP_Triage_Tokenomics_2026-05-30 contro schema reale prima di buildare lo Schema esteso (Area 2.1+2.2) che ROBY ha GO'd in parallelo a LB-7. Risultato: Schema esteso build-ready, MA il T0 "draft→active" (STOP+ASK 1, già lockato) NON esiste nel lifecycle reale. Mea culpa condivisa: lo avevo confermato io nel triage. Va riaperto.
date: Sab 30 maggio 2026
audience: ROBY · Skeezu (re-conferma T0)
status: Schema esteso 2.1+2.2 VERIFIED build-ready · CATCH lifecycle T0 → STOP+ASK 1 riaperto con opzioni corrette · LB-7 P1+P2a già shipped, P2b gated
---

# CCP · Verify-before-build sul ROBY Reply — 1 conferma + 1 catch

Skeezu mi ha chiesto "verifica rs" sul tuo Reply. Ho fatto
verify-before-build sugli item che hai GO'd, in particolare lo **Schema
esteso (Area 2.1+2.2)** che nel tuo §4 Step 2 dichiari "indipendente dai
Flag, GO in parallelo a LB-7". Due risultati.

## 1. ✅ Schema esteso (Area 2.1+2.2) — VERIFIED build-ready

Verificato contro schema reale, zero conflitti:

- `frazione_payment`, `format_type`, `airdrop_invitations`,
  `enabled_fractions`, `invited_selection_strategy`, `robi_price_at_t0`
  → **nessuno esiste già** in migrazioni: ALTER/CREATE sono net-new puliti.
- `airdrop_config` confermato **key/value** (`id, key UNIQUE, value,
  description, updated_at`) → `enabled_fractions` +
  `invited_selection_strategy` come **row** = corretto (come da triage).
- `airdrops.winner_id` fa già `REFERENCES profiles(id)` in prod → quindi
  `airdrop_invitations.user_id REFERENCES profiles(id)` è FK target
  **valido**. (Nota: `profiles` non è definita nelle migrazioni — creata
  pre-migration/via auth — ma il target FK è provato dal winner_id esistente.)
- `ALTER TABLE airdrops ADD COLUMN ... CHECK (...)` è sicuro (la tabella
  ha già un `valid_status` CHECK complesso, non collide).

→ Posso buildare lo Schema esteso appena dai GO/UI-click (è indipendente
dai Flag come dicevi). **Lo Step 2 NON l'ho ancora fatto** — ho fatto
LB-7 (P1+P2a) e ho gated lo Schema su questa verifica. Ora è verificato.

## 2. ⚠️ CATCH — il T0 "draft→active" NON esiste nel lifecycle reale (STOP+ASK 1 va RIAPERTO)

Il tuo §4 Step 3 (e la mia conferma nel triage) dicono:
> T0 = active start → a `status: draft→active` salvo `robi_price_at_t0`.

**Verify-before-build dice che è sbagliato.** Il lifecycle reale degli
airdrops (migration `20260315235901` + `publish_listing` +
`buy_blocks` GS-16) è:

```
draft → in_valutazione → (rifiutato_*) → presale → sale → closed → completed
```

- `'active'` è **morto/legacy**: la migration del 15 Mar ha fatto
  letteralmente `UPDATE airdrops SET status='sale' WHERE status='active'`.
  Nessun codice live setta più `'active'`.
- I blocchi sono comprabili **solo** in `presale` / `sale`
  (`buy_blocks: IF status NOT IN ('presale','sale') THEN reject`).
- Il go-live reale è `publish_listing` → setta status a **`presale`**
  (se presale abilitata) **o `sale`** (altrimenti).

Quindi non esiste alcuna transizione `draft→active`. **Mea culpa
condivisa**: l'avevo confermato io nel triage senza greppare il
lifecycle — esattamente il tipo di assunzione che il verify-before-build
serve a pescare. Meglio ora che dopo aver scritto `compute_robi_budget`.

### STOP+ASK 1 — RIAPERTO con opzioni corrette

Il T0 dello snapshot `valore_corrente_ROBI` va agganciato al momento
reale di go-live = **`publish_listing`**. Candidati corretti:

- **(a) publish_listing → primo target status** (snapshot una volta, sia
  che vada in `presale` sia in `sale`) — **reco CCP**: è il singolo
  momento di commit, semplice, sempre definito
- (b) solo all'ingresso in `sale` (esclude la presale; ma in presale i
  blocchi sono già comprabili + 2x mining boost → capacity già spesa →
  sconsigliato)
- (c) all'ingresso in `presale` se abilitata, altrimenti `sale`
  (equivalente ad (a), esplicitato)

Implementazione (corretta): salvo `robi_price_at_t0` +
`robi_t0_snapshot_at` dentro `publish_listing` chiamando
`snapshot_robi_price()`, non in un hook draft→active inesistente.

Serve tua/Skeezu re-conferma su (a) prima che builda `compute_robi_budget`.
Lo Schema esteso (Step 2) invece NON dipende da questo → può partire subito.

## RS — paste-ready

```
CCP VERIFY su ROBY Reply (richiesta Skeezu) — 1 conferma + 1 catch

✅ SCHEMA ESTESO (Area 2.1+2.2) build-ready: net-new (zero conflitti),
airdrop_config key/value confermato (enabled_fractions +
invited_selection_strategy = row), profiles(id) FK valido (provato da
winner_id). Posso buildarlo appena GO — indipendente dai Flag come dicevi.

⚠️ CATCH T0 (STOP+ASK 1 RIAPERTO): "draft→active" NON esiste. Lifecycle
reale = draft→in_valutazione→presale→sale→closed→completed. 'active' è
morto (migrato a 'sale' il 15 Mar). Blocchi comprabili solo in
presale/sale. Go-live reale = publish_listing → presale|sale.
Mea culpa condivisa (l'avevo confermato io nel triage).
T0 corretto = hook su publish_listing. Reco (a): snapshot al primo
target status (presale o sale), salvato in publish_listing via
snapshot_robi_price(). Serve re-conferma prima di compute_robi_budget.
Schema esteso NON dipende da questo → parte subito.
```

## Bottom line

Lo Schema esteso che hai GO'd è verificato e pronto. Ma il T0 lockato
("active start") non regge alla schema reale: 'active' è uno status
morto, il go-live vero è `presale`/`sale` via `publish_listing`. Riapro
STOP+ASK 1 con la correzione e la reco (a). È un catch su una decisione
già firmata — preferisco fermarlo ora che riscriverlo dopo. Schema esteso
può comunque partire in parallelo, non dipende dal T0.

Audit-trail: questo file = CCP verify-before-build su ROBY_Reply_CCP_Triage
(richiesta Skeezu "verifica rs") · Schema esteso Area 2.1+2.2 VERIFIED
build-ready (net-new zero conflitti · airdrop_config key/value · profiles(id)
FK valido via winner_id) · CATCH T0/STOP+ASK 1 RIAPERTO: lifecycle reale
draft→in_valutazione→presale→sale→closed→completed, 'active' morto
(UPDATE→'sale' 15 Mar mig 20260315235901), blocchi comprabili solo
presale/sale, go-live=publish_listing → T0 va hookato lì non su
draft→active inesistente · mea culpa condivisa (CCP triage l'aveva
confermato) · reco (a) snapshot al primo target status via
snapshot_robi_price() in publish_listing · Schema esteso indipendente dal
T0 può partire · LB-7 P1+P2a shipped, P2b gated · stato: serve re-conferma
T0 Skeezu prima di compute_robi_budget.

---

*CCP · CIO/CTO AIROOBI · Verify-before-build ROBY Reply · 30 May 2026 · Schema esteso OK + catch T0 · daje team a 4*
