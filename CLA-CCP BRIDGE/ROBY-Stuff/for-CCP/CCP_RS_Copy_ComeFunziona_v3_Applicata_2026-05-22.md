---
title: CCP · RS · copy come-funziona-airdrop v3 applicata + live
purpose: Applicata la copy v3 di ROBY su come-funziona-airdrop.html — sezione 06 riscritta (chiusura v3), step 6 aggiornato, fix Voice 04. 2 note di verifica.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: APPLICATA · live in prod · 2 note (lotteria già pulita · 2 righe extra per coerenza)
in-reply-to: ROBY_Copy_ComeFunziona_Airdrop_v3_Closure_2026-05-22.md
---

# CCP — RS · copy come-funziona v3 applicata

## TL;DR

Copy v3 applicata su `come-funziona-airdrop.html` (v3 è già live → timing
rispettato). Sezione 06 riscritta, step 6 aggiornato, fix Voice 04. Footer
bump `4.12.0 → 4.13.0`, bridge mirror sincronizzato. **2 note** sotto.

## 1. Applicato

- **Step 6** (sez. 03): titolo `CLOSED & DRAW` → `CHIUSURA / Closing`; desc
  riscritta v3 (classifica deterministica + 72h conferma venditore + consegna).
- **Sezione 06**: `Se l'airdrop fallisce` → **`La chiusura dell'airdrop`**.
  Riscritta completa con i 5 blocchi H3: *in linea con il valore · sotto il
  prezzo minimo · se viene annullato · consegna oggetto · annullamenti
  ripetuti*. Intro v3. Rimossi i 3 callout vecchi (auto-fail + reciprocità
  mining).
- **id sezione** `#fallimento` → `#chiusura` (TOC aggiornato di conseguenza).
- **Chiusura anticipata**: sottosezione mantenuta (soglia valore + fairness
  lockdown sono ancora nell'engine), solo riallineata nel wording — via
  "ROBI milestone", via la frase su "penalizzazione".
- **Voice 04 · DRAW**: rimosso "DRAW/estrazione" dallo step 6.

## 2. Due note di verifica

**a) Fix Voice 04 "Nessuna lotteria" → già pulito.** Il brief indicava
`riga ~182 "Nessuna lotteria, nessun elemento casuale"`. `grep "lotteria"` su
tutta la pagina = **0 occorrenze**: la riga reale (ora 193) dice già *"Nessuna
componente aleatoria, nessun elemento casuale"* — bonificata in uno sweep
Voice 04 precedente. Nessuna modifica necessaria.

**b) 2 righe extra toccate per coerenza** (sez. 10, fuori dal brief letterale):
dopo il rename di §6 restavano due "fallisce/fallimento" che rendevano la
pagina incoerente — `(no cancel/fallimento)` → `(non sugli airdrop annullati)`
e `Tuoi anche se l'airdrop fallisce (vedi §6)` → `…viene annullato (vedi §6)`.
Riallineate al vocabolario v3. Te lo segnalo per trasparenza.

## 3. Verifica + deploy

- Smoke: 0 residui `fallisce/fallimento/#fallimento/DRAW/lotteria/milestone`;
  TOC `#chiusura` ↔ `id="chiusura"` coerenti; `<section>` bilanciati 11/11.
- Copy ricontrollata contro l'UAT v3 backend (6/6 rami verdi): 72h SLA,
  Caso A/B, annulla→refund, 0 consolazione, fee valutazione non rimborsata,
  counter annullamenti 3/anno + 1000 ARIA + reset 1° gennaio — **tutto allineato**.
- Footer `alfa-2026.05.22-4.13.0`. Bridge mirror `03_site_pages/` sincronizzato.
- Sitemap: nessuna modifica (URL pagina invariato, cambia solo un anchor interno).
- Commit + push → live in prod.

## Bottom line

Copy v3 live. La pagina pubblica ora descrive la chiusura v3 corretta — niente
più auto-fail né consolazione. Manca solo, sul fronte UAT, il tuo giro UI sui
2 airdrop UI-check e poi il cleanup dei 7 demo.

Audit-trail: questo file = applicazione copy ROBY come-funziona v3, in risposta
all'RS di Skeezu.

---

*CCP · CIO/CTO Airoobi · RS copy come-funziona v3 · 22 May 2026 · daje team a 4*
