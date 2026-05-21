---
title: CCP · FASE 2 Closing · RS#1 + RS#2 + RS VALUTA + Voice04 · v4.26.0 LIVE
purpose: Closing report FASE 2. Esecuzione RS #1 (Solana removal) + RS #2 (/invita) + RS VALUTA + Voice 04 sweep bundlato. Deploy produzione verificato live. Catch verify-before-brief + backlog flags.
date: Gio 21 maggio 2026
audience: ROBY · Skeezu briefing parallel
status: CLOSED · FASE 2 LIVE su airoobi.com + airoobi.app · v4.26.0 · GO-LIVE Ven 22/05 ready
priority: re-verifica ROBY · 3 backlog flag per W5
---

# CCP · FASE 2 Closing — RS#1 + RS#2 + RS VALUTA + Voice04 live

## TL;DR CCP

FASE 2 eseguita e **deployata in produzione**. Deploy `airoobi-d9asa3hd5`,
merge `2dfd498` `sprint-w4 → main`. **v4.26.0 live** su airoobi.com + airoobi.app.
Smoke live 9/9 PASS.

2 decisioni Skeezu durante l'esecuzione (controvalore EUR + bottoni VALUTA),
3 catch verify-before-brief → backlog W5. Dettaglio sotto.

GO-LIVE Ven 22/05: tutti i blocker copy chiusi.

---

## 1. RS #1 · Full KASPA commitment (home.html)

Skeezu LOCK 19/05. Sezione `#kaspa` di home.html:

- **Subhead** (riga 302): copy "monitorando anche Solana come alternativa" →
  "AIROOBI è costruito su Kaspa. Punto. La sua architettura unica — DAG,
  1 blocco/secondo, fair launch — è l'unica che soddisfa i requisiti del
  marketplace." (IT+EN).
- **Comparison table**: rimossa interamente la colonna SOLANA (box + 6 righe
  pro/contro). Resta il solo box KASPA, full-width.
- **Box KASPA**: eyebrow "Prima scelta" → "La scelta di AIROOBI" (rimuove
  l'implicazione di un'alternativa); ultimo bullet "⚠ Smart contract in
  sviluppo" → "✓ Smart contract Kaspa in arrivo — AIROOBI tra i primi a
  deployarli" (signal awareness tech mantenuto, come da tua PRESERVAZIONE).
- **Closing claim** (riga 331): "Se non saranno pronti in tempo, Solana è il
  piano B" → rimosso.

**Catch verify-before-brief — mention Solana negli articoli blog:** il grep
`solana` ha pescato `blog/blockchain-kaspa-ghostdag-spiegato.html` e
`blog/kaspa-krc20-token-standard-spiegato.html` ("Kaspa non è Ethereum, non è
Solana"). **NON toccate.** Non sono narrativa plan-B: sono educational tech che
*distingue* Kaspa da Solana — rafforzano il commitment, non lo indeboliscono.
Rimuoverle danneggerebbe articoli SEO legittimi. Fuori dallo scope tuo
("file root non-dapp" — i blog sono in `blog/`). Flag per tua conferma.

Smoke: `grep solana home.html` → 0 hit. ✓

---

## 2. RS #2 · /invita brand integrity (dapp.html + src/dapp.js)

Skeezu LOCK 20/05.

- **Claim falso** (`dapp.html` hero subtitle, IT+EN): rimossa la frase "È
  l'unico modo per accumulare ROBI senza partecipare agli airdrop" / "It's the
  only way to grow ROBI...". Brevità preferita: rimosso senza replace, il
  subtitle resta completo ("...tu ricevi +5 ROBI, lui riceve +5 ROBI.").
- **Hero sub route** (`src/dapp.js` PAGE_HEADERS.referral): "Invita amici e
  ricevi ARIA bonus..." → "Invita amici e accumula ROBI insieme. +5 ROBI per
  ogni invito confermato." (IT+EN). Chiude il token-mismatch ARIA/ROBI che
  avevi segnalato (Catch #3).

**Catch verify-before-brief — controvalore EUR su /invita (STOP+ASK Skeezu):**
leggendo la sezione ho trovato 2 punti di controvalore EUR sui reward ROBI —
viola la regola tassativa "MAI menzionare controvalore EUR" (memory). Non era
nel tuo brief. Ho fermato e chiesto a Skeezu.
- pill hero "≈ €11,16 valore generato per ogni invito confermato"
- riga step-4 "≈ €11 di valore generato in totale"

**Decisione Skeezu: riformula in ROBI.** Applicato:
- pill → "**+10 ROBI** · generati per ogni invito confermato"
- step-4 → "+5 ROBI · **10 ROBI generati in totale, 5 per ciascuno**"

Elimina il controvalore EUR, mantiene l'elemento di conversione. Copy fattuale
(conteggio token, non creativa) — te la giro per review formale.

Smoke: `grep "unico modo" dapp.html` → 0 · `grep euro;11` → 0. ✓

---

## 3. RS VALUTA · rename menu (Skeezu LOCK 21/05)

"Valuta" (ambiguo currency/evaluate) → "Fai valutare" / "Get evaluated".

- `src/topbar.js` voce menu AUTH_LINKS (no aria-label presente da aggiornare)
- `dapp.html` nav menu ×2

**Catch verify-before-brief — 2 bottoni CTA "VALUTA" (STOP+ASK Skeezu):**
oltre alla voce menu, `dapp.html` ha 2 bottoni CTA "VALUTA" (`onclick
navigateTo('submit')`) con la stessa ambiguità, fuori dallo scope letterale di
RS VALUTA ("voce menu"). Chiesto a Skeezu.

**Decisione Skeezu: rinomina anche i bottoni.** Applicato → menu + 2 bottoni
tutti "FAI VALUTARE" / "GET EVALUATED". Coerenza totale, route invariata.

Smoke: `grep "Fai valutare|FAI VALUTARE" dapp.html` → 4 hit (2 menu + 2 CTA). ✓

---

## 4. Voice 04 sweep (bundlato in FASE 2)

Copy line da `ROBY_Voice04_CopyLines_FASE2_Bundle`. 3 hard fix applicati:

| File | Da | A |
|---|---|---|
| `src/dapp.js` (IT+EN) | "Nessuna lotteria." / "No lottery." | "Tutto deterministico: conta il punteggio, non il caso." / "Fully deterministic: your score decides, not chance." |
| `src/airdrop.js` (IT+EN) | "Nessuna lotteria — tutto deterministico." / "No lottery — fully deterministic." | come sopra |
| `api/airdrop-ssr.js` | "partecipa al draw equo" | "partecipa all'airdrop equo" |

**KEEP** confermato come da tuo verdetto: "Come si vince?" + tip "senza
vincere" invariati.

**Catch verify-before-brief — "draw" nel backoffice ABO:** il sweep full-repo
`\bdraw\b` ha pescato ~9 occorrenze in `abo.html` (Auto-draw, Draw Modal, Data
draw, auto-close+draw). È il **backoffice admin/evaluator**, UI interna non
user-facing — "draw" lì è il nome tecnico dell'operazione di estrazione. Non
toccato (fuori scope Voice 04 = copy pubblica). Flag a te per decidere se
allineare anche la terminologia admin (priorità bassa, interno).

Smoke: `grep lotteria|lottery|draw equo` sui file pubblici toccati → 0 hit. ✓

---

## 5. Footer bump v4.26.0

Risolto lo split versioning: `home.html` (era 4.25.0) + `dapp.html` (era
4.25.1) → unificati a **`alfa-2026.05.21-4.26.0`**. Data allineata al deploy
(21/05) — chiude anche il P3 cosmetico footer-date che avevi segnalato.

---

## 6. Deploy + smoke live

- Commit FASE 2: `feat(w4-day13)` su `sprint-w4` → merge `2dfd498` `merge(w4-day13)`
  su `main` → push → GitHub integration auto-deploy.
- Deploy produzione: **`airoobi-d9asa3hd5`** · Ready · aliasato
  `airoobi.com` + `airoobi.app` (+ www).
- `sprint-w4` riallineato a `main`.

Smoke live post-deploy — **9/9 PASS**:

| Surface | Check | Esito |
|---|---|---|
| airoobi.com/home.html | footer `4.26.0` | ✓ |
| airoobi.com/home.html | `grep solana` → 0 | ✓ |
| airoobi.com/home.html | box KASPA "La scelta di AIROOBI" | ✓ |
| airoobi.app/dapp.html | footer `4.26.0` | ✓ |
| airoobi.app/dapp.html | `grep "unico modo"` → 0 | ✓ |
| airoobi.app/dapp.html | `grep euro;11` → 0 | ✓ |
| airoobi.app/dapp.html | "Fai valutare" ×4 (menu+CTA) | ✓ |
| airoobi.app/dapp.html | pill "+10 ROBI" | ✓ |
| airoobi.app SSR /airdrops/:id | "airdrop equo", 0 "draw equo" | ✓ |

---

## 7. Backlog flag per ROBY (W5, non-blocking GO-LIVE)

1. **Referral = ARIA (copy stale)** — `src/home.js:382` (articolo blog "Come
   accumulare ARIA": "referral tu +10 ARIA, amico +15 ARIA") e
   `email-confirm.html:79` ("ARIA bonus per ogni amico") dicono che il referral
   dà ARIA. Ma /invita + `project_earnings_v2` dicono referral = ROBI (+5/+5).
   Incoerenza token. Rientra nel tuo `B-P2-2 ARIA reward copy stale`. Non
   toccato (fuori scope RS #2 = /invita).
2. **`portfolio-eur-val`** — `dapp.html:449`: campo valore portafoglio in EUR
   (mostra "—"). Potenziale controvalore EUR sul tab Portafoglio. Surface
   diversa da /invita, decisione tua/Skeezu — segnalo per coerenza con la
   regola "MAI controvalore EUR".
3. **"draw" backoffice ABO** — vedi §4. Terminologia admin interna, priorità
   bassa.

---

## Stato

**FASE 2 — CHIUSA.** RS #1 + RS #2 + RS VALUTA + Voice 04 sweep live in
produzione, v4.26.0. Smoke 9/9 PASS. 2 decisioni Skeezu integrate, 3 catch
verify-before-brief flaggati per W5.

**GO-LIVE Ven 22/05:** lato copy/contenuti tutti i blocker chiusi.

Atteso da ROBY: re-verifica live + sign-off FASE 2. Audit-trail: questo file =
closing CCP per `ROBY_Voice04_CopyLines_FASE2_Bundle_2026-05-21.md` e per il
bundle RS #1/#2/VALUTA.

---

*CCP · CIO/CTO Airoobi · FASE 2 Closing · 21 May 2026 · v4.26.0 live · daje team a 4*
