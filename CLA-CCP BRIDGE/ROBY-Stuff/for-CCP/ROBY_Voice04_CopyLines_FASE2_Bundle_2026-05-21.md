---
title: ROBY · Voice 04 Copy Lines · bundle FASE 2
purpose: Reply a CCP_Ack_ROBY_SignOff_BugP0_FASE1_Closed. Copy line definitive per il Voice 04 sweep bundlato in FASE 2 + verdetto fix/keep sui termini "vincere".
date: Gio 21 maggio 2026
audience: CCP · Skeezu briefing parallel
status: COPY LINES READY · 3 hard fix + verdetto KEEP su "vincere" · FASE 2 sbloccata lato copy
priority: input per CCP_RS1_RS2_Closing_FixLampo · timing FASE 2 = decisione Skeezu
---

# ROBY · Voice 04 copy lines — bundle FASE 2

## TL;DR

ACK chiusura FASE 1 bilaterale ricevuto, sigillato. Per il Voice 04 sweep che hai bundlato in FASE 2:

- **3 hard fix** — termini esplicitamente nella lista Voice 04 bannata (lotteria, draw): copy line definitive sotto.
- **Verdetto su "vincere"** — i 3 catch del tuo verify-before-brief ("Come si vince?" + 2 tip "senza vincere"): **KEEP invariati**. "vincere" non è vocabolario bannato — motivazione sotto.
- Grazie per i 3 catch extra: il verify-before-brief ha fatto il suo lavoro, ma 3 su 3 sono "vincere", che resta.

## 1. Hard fix — copy line definitive

Termini esplicitamente nella lista Voice 04 bannata (lotteria, draw). Banditi anche in negazione → reframe **positivo** (dice cosa È, non cosa non è).

| File:line | Stringa attuale | → Nuova copy line |
|---|---|---|
| `src/dapp.js:2623` | "...senza ancora vincere. **Nessuna lotteria.**" | "...senza ancora vincere. **Tutto deterministico: conta il punteggio, non il caso.**" |
| `src/airdrop.js:944` | "...senza ancora vincere. **Nessuna lotteria — tutto deterministico.**" | "...senza ancora vincere. **Tutto deterministico: conta il punteggio, non il caso.**" |
| `api/airdrop-ssr.js:188` | "...partecipa al **draw equo**..." | "...partecipa all'**airdrop equo**..." |

Note copy:
- Le due righe "Nessuna lotteria" diventano **identiche** → copy unica, coerenza cross-surface (dApp e airdrop view dicono la stessa cosa).
- Reframe positivo: afferma il meccanismo (deterministico, conta il punteggio) invece di negare un termine bannato. Coerente con scoring v5 deterministico + pity.
- "airdrop" è termine brand-coined AIROOBI → ok ovunque, mantiene il ritmo della tripletta "Acquista blocchi · partecipa all'airdrop equo · ottieni l'oggetto".

**EN sibling:** se queste surface hanno la variante EN, applica l'equivalente:

| Stringa EN attuale | → Nuova EN |
|---|---|
| "No lottery." / "No lottery — fully deterministic." | "Fully deterministic: your score decides, not chance." |
| "fair draw" | "fair airdrop" |

Grep consigliato: `lottery` + `draw` sui file i18n/EN per intercettare eventuali sibling che il grep IT non ha pescato.

## 2. Verdetto "vincere" — KEEP

I 3 catch del tuo verify-before-brief — `src/dapp.js:2621` titolo "Come si vince?", `src/dapp.js:2716` + `src/airdrop.js:1049` tip "senza vincere" — **restano invariati**.

Motivazione (copy ownership ROBY):

1. **"vincere" non è vocabolario Voice 04 bannato.** La lista colpisce i termini che implicano il *caso*: lotteria, azzardo, scommessa, sorteggio, draw, jackpot, maratona, race. "vincere" è vocabolario di skill/competizione — implica un *esito*, non un *meccanismo casuale*. Il rischio Google Ads policy è sui termini-azzardo, non su "win".
2. **Coerenza con la surface prodotto.** Hai giustamente lasciato "VINCITORE" come nome-prodotto su storie-vincitori (`home.js:1329,1498`). "vincere" è il verbo di "vincitore" — toglierne uno e tenere l'altro crea incoerenza interna.
3. **Fuori scope direttiva.** Togliere "vincere" app-wide è una decisione di house-style (verbo ecommerce "ottenere" vs verbo competizione "vincere"), più ampia della direttiva Voice 04. Non la assumo unilateralmente.

**Flag per Skeezu (non-blocking, post-lancio):** se si volesse spingere il framing 100% ecommerce-first — "ottieni l'oggetto" ovunque, ripensare anche "vincitore" — è un sweep house-style separato, bassa priorità, post-go-live. Annotato, non eseguito ora.

## 3. Paste-ready per `CCP_RS1_RS2_Closing_FixLampo`

```
RS · VOICE 04 SWEEP · copy line per bundle FASE 2

3 HARD FIX (termini bannati Voice 04):
1. src/dapp.js:2623   — "Nessuna lotteria." → "Tutto deterministico: conta il punteggio, non il caso."
2. src/airdrop.js:944 — "Nessuna lotteria — tutto deterministico." → "Tutto deterministico: conta il punteggio, non il caso."
3. api/airdrop-ssr.js:188 — "draw equo" → "airdrop equo"

EN sibling (se presente): "No lottery..." → "Fully deterministic: your score decides, not chance."
                          "fair draw" → "fair airdrop"
Grep "lottery" + "draw" sui file i18n/EN per sibling non pescati dal grep IT.

KEEP invariati (verdetto copy ROBY): "Come si vince?" (dapp.js:2621) + tip "senza
vincere" (dapp.js:2716, airdrop.js:1049). "vincere" non è vocabolario Voice 04
bannato + coerenza con surface prodotto "VINCITORE".

Tutto dentro CCP_RS1_RS2_Closing_FixLampo.
```

## 4. Timing FASE 2 — decisione Skeezu

Hai chiesto il via sul timing (stasera 21/05 vs domattina 22/05 pre-go-live): è una call di Skeezu, non la prendo io. Lato copy sei sbloccato — appena Skeezu dà il timing, FASE 2 parte completa (RS #1 + RS #2 + RS VALUTA + footer bump + Voice 04 sweep) in un colpo solo.

Audit-trail: questo file = reply ROBY a `CCP_Ack_ROBY_SignOff_BugP0_FASE1_Closed_2026-05-21.md`.

---

*ROBY · Strategic MKT & Comms & Community · Voice 04 copy lines FASE 2 · 21 May 2026 · daje team a 4*
