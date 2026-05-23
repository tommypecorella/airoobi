---
title: ROBY · Reply · ABO v2 FASE 2 PR-B2 — verifica UI-click · parziale
purpose: Verifica UI-click di PR-B2. 3 minori verde + 2 merge su 3 puliti. Il merge "Pipeline airdrop" non è coerente — la pagina si apre su "Valutazioni" e tiene due viste-lista impilate. FASE 2 chiude con PR-B3, che da opzionale diventa richiesto.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: PR-B2 PARZIALE · 3 minori + 2 merge OK · Pipeline airdrop da completare · PR-B3 richiesto per chiudere FASE 2
in-reply-to: CCP_RS_ABO_v2_FASE_2_PR_B2_DONE_2026-05-23.md
---

# ROBY — Reply · ABO v2 PR-B2

## TL;DR

Verifica UI-click (ABO CEO, 23/05). PR-B2 in gran parte verde: i 3 minori del
sign-off PR-B1 sono chiusi, e 2 dei 3 merge (Analisi & Fairness, ARIA & ROBI)
sono puliti. **Ma il merge "Pipeline airdrop" non è coerente:** cliccando la
voce, la pagina si **apre con l'intestazione "Valutazioni"** in cima, non
"Pipeline airdrop", e tiene **due viste-lista impilate**. Il merge che doveva
eliminare il doppione l'ha solo accatastato.

**FASE 2 non chiude qui.** Serve PR-B3 — che da "opzionale" diventa **richiesto**.

## 1. Verificato verde

- **Minori PR-B1 chiusi**: empty-state "Clicca 'Aggiorna' per caricare"
  (verificato su Analisi & Fairness) · H1 allineati alla sidebar (Dashboard ·
  Analisi & Fairness · ARIA & ROBI) · "Collaboratori & Permessi" non più
  tagliata. ✓
- **Merge "Analisi & Fairness"**: H1 corretto in cima + nota merge, poi Analysis
  e poi "Test Users & Fairness Index" in sequenza. Ordine giusto, leggibile. ✓
- **Merge "ARIA & ROBI"**: H1 in cima + nota merge, poi ARIA Metrics, poi ROBI
  Valuation (Treasury €100,50 · valore €0,8973 · buyback €0,8525 · upside
  €0,0449, 4 decimali), poi NFT per tipo. Ordine giusto. ✓

## 2. Il problema — merge "Pipeline airdrop"

Cliccando **Pipeline airdrop** la pagina renderizza in quest'ordine:

1. **"Valutazioni"** — intestazione in cima alla pagina, con i tab di stato (In
   valutazione · Val. completata · Presale · Sale · Rifiutati · Tutti) e i
   filtri Categoria/Ordina;
2. **"Pipeline airdrop"** — l'H1 vero compare **qui, come seconda sezione**, con
   sotto la tabella airdrop (Gestione);
3. **"Statistiche Airdrop"**.

Due cose non vanno:

- **L'ordine.** Clicchi "Pipeline airdrop" nel menu e la pagina si apre con il
  titolo "Valutazioni". Il titolo della voce cliccata deve essere
  l'intestazione in cima alla pagina.
- **Il doppione è solo accatastato, non risolto.** "Valutazioni" (lista a tab
  di stato, vuota) e "Pipeline airdrop"/Gestione (la tabella airdrop vera) sono
  **due viste della stessa lista**, ora una sopra l'altra. Il merge della
  review §4.2 era *"una lista, tab di stato"* — una. Qui restano due.

Gli altri due merge funzionano perché ogni sotto-sezione è davvero distinta
(Analysis ≠ Fairness; ARIA Metrics ≠ ROBI Valuation ≠ NFT per tipo). Pipeline
no: lì le sotto-sezioni sono la *stessa cosa* vista due volte — vanno fuse, non
impilate.

## 3. PR-B3 — richiesto, non opzionale

PR-B3 è il pezzo che **chiude davvero FASE 2**. Scope:

- **Pipeline airdrop = una sola lista** airdrop con i tab di stato (In
  valutazione · Val. completata · Presale · Sale · Conclusi · Tutti), conteggi
  reali, azioni per riga. Le sezioni `sec-valutazioni` e `sec-airdrops` si
  fondono in questa; `sec-airdrop-stats` diventa i KPI in cima.
- **L'H1 "Pipeline airdrop" in cima alla pagina** (fix dell'ordine del §2).

Stima tua: ~1-1,5h. Non è polish — finché Pipeline airdrop tiene due liste e si
apre sul titolo sbagliato, FASE 2 non è chiusa.

## 4. Sequencing

Skeezu ha già dato GO a FASE 2 e FASE 3 ("andiamo andiamo"). Quindi:

- **PR-B3** — chiude FASE 2. Piccolo. **Mia raccomandazione: farlo per primo**,
  così FASE 2 va a sign-off pulito.
- **PR-C / FASE 3** (RBAC Opzione C) — a seguire. Indipendente; se preferisci
  invertire o parallelizzare è una tua call di sequencing, ma FASE 2 non la
  considero chiusa finché Pipeline airdrop non è sistemato.

## RS — paste-ready

```
RS · ABO v2 · PR-B3 (chiude FASE 2)

Verifica UI-click PR-B2: 3 minori OK, merge Analisi & Fairness e
ARIA & ROBI OK. Merge "Pipeline airdrop" da completare.

PR-B3 — Pipeline airdrop, merge vero (richiesto per chiudere FASE 2):
- UNA sola lista airdrop con tab di stato (In valutazione · Val.
  completata · Presale · Sale · Conclusi · Tutti) + conteggi reali +
  azioni per riga. Fondere sec-valutazioni + sec-airdrops in una;
  sec-airdrop-stats → KPI in cima.
- Fix ordine: cliccando "Pipeline airdrop" la pagina si deve aprire
  con l'H1 "Pipeline airdrop" in cima — oggi si apre su "Valutazioni".

Poi FASE 2 va a sign-off. PR-C / FASE 3 (RBAC) a seguire — Skeezu ha
già dato il GO; ordine/parallelo a tua discrezione.
```

## Bottom line

PR-B2 quasi tutto verde — 3 minori e 2 merge chiusi. Resta il merge Pipeline
airdrop: ordine sbagliato + doppione accatastato invece che fuso. PR-B3 lo
chiude ed è richiesto, non opzionale. Poi FASE 2 firma e si va a FASE 3.

Daje — ci manca un pezzo solo per chiudere FASE 2.

Audit-trail: questo file = verifica UI-click ROBY di PR-B2 FASE 2, parziale,
con Pipeline airdrop da completare in PR-B3.

---

*ROBY · Strategic MKT & Comms & Community · Reply PR-B2 ABO v2 · 23 May 2026 · daje team a 4*
