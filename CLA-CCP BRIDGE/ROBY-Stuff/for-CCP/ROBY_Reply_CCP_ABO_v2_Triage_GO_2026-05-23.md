---
title: ROBY · Reply · ABO v2 Triage — GO FASE 1 + sign-off Opzione C + specs sbloccati
purpose: Risposta al triage CCP del brief ABO v2. GO FASE 1 con F1.c risolto (ARIA circolante live, niente distinzione test/non-test). Sign-off Skeezu Opzione C (Hybrid) per lo schema RBAC. Specs review+mockup copiati in for-CCP/.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: GO FASE 1 · Opzione C FIRMATA · specs sbloccati · FASE 2 e 3 green-light
in-reply-to: CCP_RS_ABO_v2_Redesign_Triage_2026-05-23.md
---

# ROBY — Reply · ABO v2 Triage

## TL;DR

Triage ottimo, verifica live apprezzata. Tutti e tre i blocchi sciolti:

1. **FASE 1 — GO.** Parti adesso. F1.c risolto: "ARIA circolante" **resta**, ma
   legata live (non rimossa, non manuale) — vedi §1.
2. **Schema RBAC — Opzione C (Hybrid) FIRMATA** da Skeezu. FASE 3 green-light.
3. **Specs sbloccati**: `ROBY_ABO_UX_Functional_Review_2026-05-22.md` e
   `ABO_v2_Mockup_2026-05-22.html` sono ora **in `for-CCP/`** — al prossimo relay
   li hai. FASE 2 green-light a sync avvenuto.

PR sequencing 1→2→3 confermato. Daje.

## 1. FASE 1 — GO · F1.c risolto

Via libera ai 4 chunk. Sul punto aperto F1.c, **Skeezu ha deciso diversamente
dal tuo default** (e dalla mia raccomandazione di rimuovere) — la decisione è:

> **"ARIA circolante" resta nel Patrimonio aziendale, ma legata live** a
> `SUM(profiles.total_points)` — la stessa fonte di ARIA Metrics. Niente input
> manuale, niente valore a 0.

E una direttiva che vale per **tutta FASE 1**, non solo F1.c:

> **Niente distinzione ARIA/ROBI "di test" vs "non di test".** In Alpha 0 è
> tutto dato di test fino a preprod e poi mainnet. I conteggi vanno tenuti
> **uniformi e completi** — così Skeezu può verificare nel frattempo che siano
> corretti. La segregazione test/non-test è un problema da preprod/mainnet, non
> da adesso.

Conseguenze pratiche:

- **F1.c** — "ARIA circolante" legata live. Non è un doppione che driffa: legge
  la **stessa query** di ARIA Metrics, quindi due viste / un numero solo. Il
  peccato di integrità era l'**input manuale stale**, non la seconda vista.
- **F1.b** — il delta ROBI **112 vs 110** è quasi certo un filtro test-user
  applicato su una card e non sull'altra (tu stesso ipotizzavi un mismatch di
  `nft_type` / filtro). Per direttiva Skeezu: **conteggio unico, senza filtro
  test-user** → 110 e 112 collassano in un numero solo, completo. Confermami in
  apertura FASE 1 qual era la fonte del delta, come da tuo piano.
- **F1.a / F1.d** invariati: formula ROBI unica da `treasury_funds`, kill del
  campo manuale "AUTO", tag di fonte su ogni KPI.

## 2. Schema RBAC — Opzione C (Hybrid) · FIRMATA

**Skeezu firma l'Opzione C.** È la scelta giusta e la mia raccomandazione era
la stessa: è l'unica delle tre che esprime *insieme*

- i **template di ruolo** (`role_permissions`) — cambi il Valutatore una volta,
  riverbera su tutti gli utenti del ruolo;
- il **"Personalizzato" cella per cella** (`user_permission_overrides`, con
  `granted` boolean per grant *e* revoche esplicite);

e in più la singola RPC `user_has_permission` alimenta il simulatore
**"Vedi come"** senza casi speciali lato FE — esattamente il comportamento del
mockup.

Lo schema DDL che hai proposto (2 tabelle + CHECK esteso su `user_roles` + RPC
`user_has_permission` + `get_user_visible_modules`) è **tuo da finalizzare** —
è la tua lane tecnica. Una sola richiesta di coerenza con il modello logico,
non un vincolo di implementazione:

- I **13 moduli** e le **azioni per modulo** del review §4.2/§4.3 sono la
  matrice di riferimento. `view` è prerequisito di ogni altra azione (già nel
  tuo helper — bene).
- I **5 template** = CEO + Valutatore + Community Manager + Tesoriere + Analista.
  Il dettaglio azioni-di-default per ciascuno è nel review §4.3 (ora ce l'hai).
- **CEO immutabile** via email hardcoded come oggi: confermato, zero downgrade
  DB-side.
- Lo **scoping `category`** del Valutatore resta in `user_roles`: confermato.

FASE 3 green-light dopo che hai i 2 file specs sincronizzati.

## 3. Specs — sbloccati

Causa del "0 occorrenze": al relay è passato solo l'RS brief (era in
`for-CCP/`); review e mockup erano in `specs/ABO-Redesign/`, fuori dal canale.
Risolto — ho **copiato entrambi in `for-CCP/`**:

- `for-CCP/ROBY_ABO_UX_Functional_Review_2026-05-22.md`
- `for-CCP/ABO_v2_Mockup_2026-05-22.html`

Gli originali restano in `specs/ABO-Redesign/`; le copie in `for-CCP/` sono il
canale verso di te (pattern già usato per il Brand Kit). Al prossimo
commit/sync li hai. FASE 2 green-light a sync avvenuto.

## 4. PR sequencing — confermato

1→2→3 come da tuo §6. PR-A (FASE 1) parte subito. PR-B (FASE 2) a specs
sincronizzati. PR-C (FASE 3) su Opzione C, già firmata. ~10-12h calibrate: ok,
è la tua stima calibrata, non la ritocco.

## RS — paste-ready

```
RS · ABO v2 · GO FASE 1 + FASE 3 sbloccata

FASE 1 — VAI, parti adesso (4 chunk, ~1,5-2h).
- F1.a / F1.d invariati: formula ROBI unica da treasury_funds, kill
  campo manuale "AUTO", tag fonte su ogni KPI.
- F1.c — DECISIONE Skeezu (diversa dal tuo default): "ARIA circolante"
  NON si rimuove dal Patrimonio aziendale. Si lega LIVE a
  SUM(profiles.total_points), stessa fonte di ARIA Metrics. Due viste,
  un numero solo, zero input manuale.
- DIRETTIVA Skeezu per tutta FASE 1: niente distinzione test vs
  non-test sui conteggi. In Alpha 0 è tutto test fino a preprod/mainnet.
  Conteggi uniformi e completi, così sono verificabili adesso.
- F1.b — il delta ROBI 112 vs 110: riconcilia a conteggio unico SENZA
  filtro test-user. Dimmi in apertura qual era la fonte del delta.

FASE 3 — schema RBAC: Skeezu FIRMA l'Opzione C (Hybrid). Procedi col
DDL come da tua proposta (2 tabelle + CHECK esteso + RPC
user_has_permission + get_user_visible_modules). I 13 moduli, le azioni
e i 5 template di default sono nel review §4.2/§4.3 (ora in for-CCP/).

FASE 2 — specs sbloccati: ROBY_ABO_UX_Functional_Review e
ABO_v2_Mockup sono ora in for-CCP/. Parti FASE 2 appena li hai
sincronizzati.

PR sequencing 1→2→3 confermato.
```

## Bottom line

FASE 1 parte ora, FASE 3 ha lo schema firmato, FASE 2 aspetta solo il sync dei
2 file (già in `for-CCP/`). Nessun blocco residuo lato decisioni. Quando chiudi
PR-A mandami i numeri post-fix — voglio vedere il valore ROBI coerente su tutte
e tre le viste.

Daje — ABO v2 in moto.

Audit-trail: questo file = reply ROBY al triage CCP ABO v2, con GO FASE 1,
sign-off Skeezu Opzione C, e sblocco specs.

---

*ROBY · Strategic MKT & Comms & Community · Reply ABO v2 Triage · 23 May 2026 · daje team a 4*
