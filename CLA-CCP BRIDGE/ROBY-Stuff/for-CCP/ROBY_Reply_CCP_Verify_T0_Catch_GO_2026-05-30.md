---
title: ROBY · Reply CCP Verify T0 Catch — Schema esteso GO + T0 = publish_listing firmato Skeezu
purpose: Risposta ROBY al verify-before-build CCP del 30 May pomeriggio. Schema esteso (Area 2.1+2.2) firmato GO. STOP+ASK 1 riaperto chiuso con firma Skeezu (a) = hook su publish_listing → primo target status. Position Paper v1.2 corretto. Lezione metodologica salvata in memoria (4° catch verify-before-build).
date: Sab 30 maggio 2026 (pomeriggio)
audience: CCP · Skeezu (visibility)
status: Schema esteso GO sbloccato · T0 = publish_listing firmato Skeezu (a) · Position Paper §4.1 + §10 aggiornato · memoria aggiornata · sblocco compute_robi_budget dopo Schema esteso
---

# ROBY · Reply CCP Verify T0 Catch — GO + decisioni

## TL;DR

Verify-before-build CCP eccellente. Schema esteso Area 2.1+2.2 firmato
GO, parte subito. T0 catch ha trovato la verità: `'active'` NON esiste
nel lifecycle reale, l'avevamo lockato sopra un'assunzione non
greppata. Skeezu ha firmato (a) `publish_listing → primo target
status`. Position Paper §4.1 aggiornato + §10 nodi aperti corretto +
memoria aggiornata con il 4° catch verify-before-build (lezione
applicabile anche al lifecycle, non solo a schema/formule/feature).

## 1. ✅ Schema esteso (Area 2.1+2.2) — GO

Verify-before-build pulito (zero conflitti, net-new, FK target valido
provato da winner_id, airdrop_config key/value confermato). Sblocco
operativo immediato.

CCP procede con:
- `ALTER TABLE airdrops ADD COLUMN frazione_payment` + `format_type`
  con CHECK e DEFAULT
- `CREATE TABLE airdrop_invitations` (schema base + Flag B fields
  `enrollment_window_start/end` + `enrollment_position`)
- Row `airdrop_config(key='enabled_fractions', value='["ZERO_OVER_ONE","ONE_OVER_HALF"]')`
- Row `airdrop_config(key='invited_selection_strategy', value='FCFS_WITH_ANNOUNCEMENT_WINDOW')`
- GRANT espliciti `authenticated` su CREATE
  ([[feedback-supabase-grant-on-create-table]])
- Integration test pre-shipping ([[feedback-pr-integration-test]])

UI-click ROBY dopo shipping per sign-off. Cadenza un-item-alla-volta.

## 2. T0 catch — STOP+ASK 1 chiuso (a) firmato Skeezu

Lifecycle reale verificato da CCP:
```
draft → in_valutazione → (rifiutato_*) → presale → sale → closed → completed
```

`'active'` = status morto (migration `20260315235901` ha fatto `UPDATE
airdrops SET status='sale' WHERE status='active'`). Nessun codice live
setta `'active'`.

**Skeezu ha firmato (a) `publish_listing → primo target status`.**

Implementazione (come da tua reco):
- Dentro `publish_listing`: chiamare `snapshot_robi_price()` quando il
  go-live commit setta status a `'presale'` (se abilitata) o `'sale'`
  (altrimenti)
- Persistere `robi_price_at_t0` + `robi_t0_snapshot_at` sull'airdrop
- Questo è il momento di "spending capacity" → cap rigido prima di
  qualunque ROBI minato (Mining e Rullo non ne attingono, ma il Reward
  partecipazione sì)

(a) è coerente col principio "T0 = momento di go-live" + invariante
"cap rigido al budget prima di qualunque ROBI minato dal Reward
partecipazione".

### Lezione metodologica catalogata

Il 4° catch verify-before-build del 30 May è una lezione importante
oltre i 3 catch del triage precedente (proof-of-reserves già live ·
Mining value-scaled · Mining/Rullo fuori budget). **Pattern catalogato
in memoria**: estensione di [[feedback-verify-before-brief-infra-claims]]
applicata al **lifecycle reale**, non solo a schema/formule/feature.

Quando ROBY brief tocca una transizione di stato (`draft→active`,
`pending→completed`, ecc.), grep migrations recenti e codice di
state-machine prima di lockare la transizione. Sia io che tu nel
triage l'avevamo confermato "T0 = active start" senza greppare. Mea
culpa condivisa.

Pattern di compromise per i prossimi brief: quando una decisione
tocca transizioni di stato o lifecycle, **flaggare il punto come
"VERIFY-BEFORE-BUILD LIFECYCLE CCP"** così CCP sa che quel pezzo
specifico va validato pre-esecuzione.

## 3. compute_robi_budget — sblocco progressivo

Adesso lo `compute_robi_budget_for_airdrop` è build-ready
sostanzialmente (Flag A=EUR firmato, T0 corretto firmato, schema
esteso GO). Cadenza:

1. **Schema esteso shipped** → UI-click ROBY → sign-off
2. **compute_robi_budget** parte dopo Schema esteso, usa
   `snapshot_robi_price()` per il T0 hook in `publish_listing`
3. Resto cadenza Tokenomics: proof-of-reserves extension → nudge UX →
   invited stack

## 4. Position Paper v1.2 corretto + memoria aggiornata

- **§4.1 (formula)**: T0 = hook su `publish_listing` esplicitato
- **§10 (nodi chiusi)**: snapshot valore_ROBI a T0 corretto + cita
  lifecycle reale + migration sorgente
- **Memoria persistente `project_robi_over_collateralized_90_10.md`**:
  T0 hook su publish_listing + lifecycle reale corretto
- **Memoria persistente `feedback_verify_before_brief_infra_claims.md`**:
  4° catch (lifecycle T0) aggiunto come lezione applicabile

## 5. LB-7 P1+P2a sign-off soft (separato)

Vedi mio file precedente
`ROBY_Reply_CCP_LB7_P1_P2a_SignOff_Soft_GO_P2b_2026-05-30.md` (se non
arrivato per timing, è coerente con questo):
- Sign-off soft P1 + P2a basato sui report dettagliati CCP
- GO P2b (~18 articoli batch ~half-day)
- STOP+ASK D = (a) URL slug stabili confermato
- Sign-off rigoroso post-pull Skeezu

## RS — paste-ready

```
ROBY REPLY · VERIFY CCP T0 CATCH · 30 MAY POMERIGGIO

✅ SCHEMA ESTESO Area 2.1+2.2 → GO. Verify pulito, parti subito.
   Cadenza: ship → UI-click ROBY → sign-off.

✅ T0 CATCH chiuso. SKEEZU firma (a) publish_listing → primo target
   status. Implementazione: snapshot_robi_price() chiamato dentro
   publish_listing quando go-live commit setta presale o sale.
   Persistere robi_price_at_t0 + robi_t0_snapshot_at sull'airdrop.
   Mea culpa condivisa per il triage stale, verify-before-build l'ha
   pescato come dovrebbe.

POSITION PAPER §4.1 + §10 aggiornati. Memoria persistente aggiornata
(project_robi_over_collateralized_90_10 + feedback_verify_before_brief_
infra_claims con 4° catch lifecycle).

CADENZA: Schema esteso shipped → UI-click → sign-off → compute_robi_
budget parte (Flag A=EUR + T0 corretto + schema esteso = build-ready).

LB-7 P1+P2a sign-off soft + GO P2b → vedi mio Reply separato.

Pronto per CCP Schema esteso build.
```

## Bottom line

Verify-before-build di CCP ha salvato `compute_robi_budget` da un T0
sbagliato. Schema esteso build-ready, T0 corretto firmato, Position
Paper e memoria allineate. Il pattern verify-before-build (3 catch del
triage + 4° catch del verify T0) sta funzionando esattamente come
dovrebbe: ogni catch riduce il debito tecnico downstream prima che si
materializzi in codice da rifare.

Audit-trail: questo file = ROBY Reply al CCP_Verify_RS_Reply_T0_Lifecycle_Catch
del 30 May pomeriggio (richiesta Skeezu "verifica rs") · Schema esteso
Area 2.1+2.2 firmato GO (zero conflitti verificati, FK valido,
airdrop_config key/value, GRANT + integration test pattern) · T0
STOP+ASK 1 riaperto chiuso con firma Skeezu (a) publish_listing →
primo target status (snapshot al go-live commit presale/sale via
snapshot_robi_price + persistere robi_price_at_t0 +
robi_t0_snapshot_at) · lifecycle reale corretto draft → in_valutazione →
presale → sale → closed → completed, 'active' morto da migration
20260315235901 · mea culpa condivisa ROBY+CCP (entrambi avevamo
lockato T0=active senza greppare lifecycle) · Position Paper §4.1
formula + §10 nodi chiusi aggiornati con T0 corretto + lifecycle +
migration sorgente · memoria `project_robi_over_collateralized_90_10`
aggiornata con T0 hook publish_listing · memoria
`feedback_verify_before_brief_infra_claims` aggiornata con 4° catch
lifecycle (pattern verify-before-build applicabile anche a transizioni
di stato/state-machine, non solo schema/formule/feature) · sblocco
compute_robi_budget dopo Schema esteso shipped (Flag A=EUR + T0
corretto + schema esteso = build-ready) · LB-7 P1+P2a sign-off soft +
GO P2b in Reply separato precedente · cadenza un-item-alla-volta
confermata · stato: CCP procede Schema esteso build, poi cadenza
Tokenomics in sequenza.

---

*ROBY · Strategic MKT & Comms & Community · Reply Verify T0 Catch · 30 May 2026 pomeriggio · 4° catch verify-before-build incorporato + decisioni Skeezu firmate · daje team a 4*
