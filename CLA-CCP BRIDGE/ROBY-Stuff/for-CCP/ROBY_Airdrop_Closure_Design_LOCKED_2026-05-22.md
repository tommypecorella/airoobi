---
title: ROBY · Airdrop Closure Design · LOCKED Skeezu · v3 · RS per CCP
purpose: Design completo della chiusura airdrop deciso a tavolino con Skeezu il 22/05. Vincitore + consegna + decisione venditore (incl. scenario sottocosto) + rimborsi/consolazione + fee upfront + sistema counter/ban annullamenti. RS paste-ready. Leggere con ROBY_UAT_Airdrop_Lifecycle_Findings_2026-05-22.
date: Ven 22 maggio 2026
audience: CCP · Skeezu briefing parallel
status: DESIGN LOCKED Skeezu 22/05 · v3 COMPLETO (3 punti confermati: scenario sottocosto · counter anno solare · sblocco 1000 ARIA)
priority: chiude il punto aperto F8 (chiusura senza esito) del UAT lifecycle airdrop
---

# Airdrop Closure Design — LOCKED (v3)

## TL;DR

Design completo della chiusura airdrop, deciso a tavolino con Skeezu (22/05). 6 blocchi: vincitore, consegna, decisione del venditore alla chiusura (incluso lo scenario "sottocosto"), rimborsi/consolazione, fee upfront, sistema counter/ban sugli annullamenti.

## 1. Vincitore — confermato (già locked)

Alla deadline vince il punteggio più alto (scoring v5 deterministico, verificato funzionante nel UAT). Parità → catena 5 criteri già a spec: score → blocchi → ARIA spesi → first-block timestamp → anzianità account. Zero caso.

## 2. Consegna — in-platform 3 fasi · escrow puro "modello Subito.it"

```
Stage 1 · CLAIM      Vincitore inserisce indirizzo di spedizione in-app
Stage 2 · DISPATCH   Venditore conferma spedizione con tracking + corriere
Stage 3 · CONFIRM    Vincitore conferma ricezione + rating venditore
                     → SOLO ORA: pagamento venditore rilasciato al 100%
```

Niente anticipo. Escrow pieno, pagamento unico al 100% alla conferma di ricezione (override dello spec 13/05 che prevedeva 50% al dispatch).

## 3. Decisione del venditore alla chiusura

Alla deadline → estrazione (vincitore calcolato) → **finestra 72h** per la decisione del venditore.

**Caso A — incassato ≥ prezzo minimo del venditore.**
Il venditore accetta → chiusura regolare, parte la consegna (§2). Se non risponde entro 72h → conta come **annullamento del venditore** (ha lasciato cadere un airdrop riuscito → counter +1, §6).

**Caso B — incassato < prezzo minimo ("airdrop sottocosto").**
Non è colpa del venditore: l'oggetto, pur di valore ≥ €500, non ha raccolto abbastanza interesse. Il venditore **sceglie**:
- **B1 · incassa comunque** → chiusura regolare anche se sottocosto. Il vincitore ottiene l'oggetto.
- **B2 · rifiuta** → dinamica annullamento (§4). Il venditore si tiene l'oggetto.

**Nessuno dei due casi B incrementa il counter annullamenti** — l'airdrop sottocosto non è colpa di nessuno. Timeout 72h nel Caso B → default a B2 (rifiuto).

## 4. Rimborsi e consolazione — REGOLA FISSA

**Chiusura regolare** (Caso A accettato, o Caso B1):
- Vincitore → l'oggetto. Non-vincitori → tengono i ROBI minati dal rullo. Nessun rimborso ARIA (l'airdrop si è svolto).

**Annullamento** (annullamento esplicito del venditore, o Caso B2):
- Partecipanti → **rimborso ARIA per intero** + tengono comunque i ROBI minati dal rullo.

In ogni scenario: si **eliminano** la distribuzione NFT di consolazione (premium + base) e il bonus "+1 ROBI top-3". L'unica ricompensa che esiste sono i ROBI del rullo — sempre del partecipante.

## 5. Fee piattaforma venditore — upfront, mai rimborsabile

Per avviare un airdrop il venditore versa **upfront** la fee AIROOBI (il costo della piattaforma). **Non è mai rimborsabile**: la perdi sia che l'airdrop si concluda, sia che lo annulli — è il costo di aver usato la piattaforma. L'airdrop non va live finché la fee non è depositata. Importo/meccanica → CCP/Treasury (la fee 10% è già calcolata sulla quotazione in fase di approvazione ABO).

## 6. Sistema annullamenti venditore — counter anno solare + ban

Counter degli annullamenti per venditore, su **anno solare** (1 gennaio – 31 dicembre).

**Incrementano il counter** (annullamenti imputabili al venditore):
- annullamento esplicito mid-flight (il venditore ritira l'oggetto durante l'airdrop);
- timeout 72h su un airdrop riuscito (Caso A non accettato).

**NON incrementano il counter:** lo scenario sottocosto (Caso B, sia B1 sia B2) — non è colpa del venditore.

Regole del ban:
- **3 annullamenti nell'anno solare → ban dalla vendita per 1 mese.**
- Durante il ban l'utente può **solo partecipare** agli airdrop (comprare blocchi), **non può vendere**.
- Scontare il mese di ban **non azzera** il counter: resta a 3 → il prossimo annullamento fa scattare subito un altro ban. Così fino al 31/12.
- **Reset del counter:** (a) automatico l'1 gennaio per tutti gli utenti; (b) pagamento 1000 ARIA.
- **1000 ARIA:** pagabili **solo durante un ban attivo**, per uscirne subito. Lo sblocco azzera anche il counter.

Razionale Skeezu: l'annullamento deve avere un costo reale (fee persa + counter + ban progressivo), per evitare che i venditori gestiscano gli airdrop alla leggera — ma lo scenario sottocosto, che non è colpa di nessuno, resta esente da penalità.

## 7. Cosa cambia vs comportamento attuale

| Area | Oggi | Dopo (LOCKED 22/05) |
|---|---|---|
| Sotto prezzo minimo | auto-fail → annullato + refund | scelta venditore: incassa sottocosto o rifiuta · non conta nel counter |
| Consolazione loser | NFT premium/base + "+1 ROBI top-3" | niente NFT, niente bonus · solo rullo ROBI |
| Rimborso ARIA su annullamento | sì | sì (invariato) |
| Pagamento venditore | (spec) 50% dispatch + 50% conferma | 100% solo a conferma ricezione |
| Fee AIROOBI | a settlement | upfront all'avvio · mai rimborsabile |
| Timeout venditore | 7gg (TBD) | 72h |
| Annullamenti venditore | nessun limite | counter anno solare · 3/anno → ban vendita 1 mese · sblocco 1000 ARIA |
| Esito airdrop chiuso | non mostrato (F8) | vincitore + stato consegna visibili |

## 8. RS paste-ready per CCP

```
RS · AIRDROP CLOSURE · design LOCKED Skeezu 22/05 (v3) · implementazione

VINCITORE — invariato (scoring v5 + tiebreaker 5 livelli, già a spec).

DECISIONE VENDITORE ALLA CHIUSURA (finestra 72h post-estrazione):
  - incassato >= prezzo minimo: venditore accetta -> chiusura regolare.
    Timeout 72h -> conta come annullamento venditore (counter +1).
  - incassato < prezzo minimo (sottocosto): venditore SCEGLIE -
    (B1) incassa comunque -> chiusura regolare sottocosto;
    (B2) rifiuta -> dinamica annullamento.
    Nessuno dei due casi B incrementa il counter. Timeout -> default B2.

CONSEGNA — 3 fasi escrow "Subito.it": claim -> dispatch -> confirm.
  claim_airdrop_prize -> confirm_airdrop_dispatched -> confirm_airdrop_received
  Pagamento venditore 100% SOLO a confirm ricezione. Niente anticipo 50%
  (override spec 13/05).

RIMBORSI / CONSOLAZIONE:
  - Chiusura regolare: non-vincitori tengono i ROBI del rullo, no rimborso ARIA.
  - Annullamento (esplicito o Caso B2): partecipanti -> rimborso ARIA pieno
    + tengono i ROBI del rullo.
  - RIMUOVERE: distribuzione NFT consolazione (premium+base) + bonus
    "+1 ROBI top-3". Unica ricompensa = ROBI del rullo.
  - refund_airdrop (rimborso ARIA su annullamento) RESTA invariato.

FEE AIROOBI UPFRONT — l'airdrop va live solo se il venditore ha depositato
  upfront la fee piattaforma. Mai rimborsabile (conclusione o annullamento).

SISTEMA ANNULLAMENTI VENDITORE:
  - Counter per venditore su ANNO SOLARE (reset automatico 1 gennaio).
  - Incrementano: annullamento esplicito + timeout 72h su airdrop riuscito.
    NON incrementa: scenario sottocosto (Caso B).
  - 3 annullamenti/anno -> ban vendita 1 mese (puo partecipare, non vendere).
  - Scontare il ban NON azzera il counter (resta a 3).
  - Sblocco anticipato: 1000 ARIA, solo durante un ban attivo -> esce dal ban
    + counter azzerato.

ESITO VISIBILE — chiudere F7/F8 del UAT: airdrop CHIUSO mostra l'esito
  (vincitore + stato consegna), pagina dettaglio renderizza invece di
  fallback al marketplace.

Bug-list completa: ROBY_UAT_Airdrop_Lifecycle_Findings_2026-05-22.md
(F1 prezzo presale · F2 grammatica · F4 submit 0 foto · F5 deadline ABO · F6 /venditore).
```

Audit-trail: questo file = design chiusura airdrop deciso a tavolino con Skeezu il 22/05 (v3, completo). Contraltare atteso: ACK CCP con stima implementazione.

---

*ROBY · Strategic MKT & Comms & Community · Airdrop Closure Design LOCKED v3 · 22 May 2026 · daje team a 4*
