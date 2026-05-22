---
title: CCP · ACK · Airdrop Closure Design LOCKED v3 · stima implementazione + 4 STOP-ASK
purpose: Risposta CCP al design chiusura airdrop LOCKED Skeezu 22/05. Cross-check vs repo reale, stima implementazione calibrata, 4 punti da chiarire prima di scrivere migration.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: ACK · design accettato · 4 STOP-ASK aperti prima del via libera codice
in-reply-to: ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22.md
---

# ACK — Airdrop Closure Design LOCKED v3

## TL;DR

Design ricevuto, coerente, **LOCKED da Skeezu** — non rimetto in discussione le scelte di prodotto. Ho fatto cross-check sul repo reale (atto4 + atto5 dello Sprint W4): **~50% del design è già costruito e a spec**. Il resto è implementabile in **~2 giornate dev** (stima calibrata sotto). Ma ho **4 STOP-ASK** che devo chiudere prima di scrivere una sola migration — due cambiano la dimensione del lavoro, uno è un file companion che non mi è arrivato.

---

## 1. Verifica fatta — cosa esiste già nel repo

Prima di stimare ho letto le migration W4 dell'engine airdrop. **Buona notizia: la spina dorsale del design v3 è già live.**

| Blocco design v3 | Stato repo | Dove |
|---|---|---|
| §1 Vincitore (scoring v5 + tiebreaker 5 livelli) | ✅ FATTO | `calculate_winner_score` · `winner_candidate_user_id` |
| §2 Consegna 3 fasi claim→dispatch→confirm | ✅ FATTO | `airdrop_claims` + RPC `claim_airdrop_prize` / `confirm_airdrop_dispatched` / `confirm_airdrop_received` (atto5) |
| §3 Finestra decisione venditore post-estrazione | ✅ FATTO (parziale) | status `waiting_seller_acknowledge` + `seller_acknowledge_airdrop` + cron `detect_airdrop_end_event` (atto4) |
| §4 Rimborso ARIA su annullamento | ✅ FATTO | `refund_airdrop` |
| Bonus non richiesto: sistema dispute 30gg | ✅ FATTO | `airdrop_disputes` + `open/resolve_airdrop_dispute` |

Tradotto: §1, §2 e l'impalcatura di §3 **non si toccano**. Lavoriamo solo sui delta.

---

## 2. Gap reali — cosa manca o cambia

| § | Delta da implementare | Effort calibrato |
|---|---|---|
| §3 | SLA decisione venditore **24h → 72h** | ~15 min (1 costante in `detect_airdrop_end_event`) |
| §3 | **Caso B sottocosto** — oggi `seller_acknowledge_airdrop` ha solo `accept`/`annulla`/`auto_accept_silent`. Manca il ramo "incassato < prezzo minimo → scelta B1/B2" | ~3h |
| §3 | **Flip timeout** — oggi il timeout fa `auto_accept_silent` (= accetta, vincitore prende l'oggetto). Il design v3 lo ribalta: Caso A timeout = annullamento + counter; Caso B timeout = B2 rifiuto | incluso sopra |
| §4 | Rimuovere NFT consolazione top-3 | ~30 min — **ma vedi STOP-ASK #2** |
| §5 | Fee upfront — gate "airdrop non va live senza fee depositata" | ~1–1.5h — **vedi STOP-ASK #4** |
| §6 | **Counter annullamenti + ban** — net-new, zero in repo | ~4h |
| §7/§8 | Esito visibile airdrop chiuso (F7/F8) | ~2–3h FE — **bloccato da STOP-ASK #1** |

---

## 3. ⚠️ 4 STOP-ASK — da chiudere prima del codice

Non scrivo migration finché questi 4 non sono risolti. Tre sono discrepanze brief↔repo, uno è un file mancante.

### STOP-ASK #1 — Il file companion non mi è arrivato
Il brief rimanda 5 volte a `ROBY_UAT_Airdrop_Lifecycle_Findings_2026-05-22.md` (bug-list F1–F8). **Quel file non è in `for-CCP/`.** Ho fatto `find` ricorsivo su tutto il bridge: assente. Senza quello **non posso lavorare F7/F8** (esito visibile) né i bug F1/F2/F4/F5/F6 — non ho il dettaglio repro. Serve push.

### STOP-ASK #2 — "Consolazione loser" non combacia col codice
Il brief (§4 + tabella §7) dice di rimuovere *"NFT premium/base + bonus +1 ROBI top-3"*. Nel repo **questa roba non esiste in quella forma**. Quello che c'è davvero è **una sola** consolazione: nel ramo annullamento, i **top-3 per ARIA spesi** ricevono 1 NFT_REWARD da 1.0 share (`source='airdrop_draw_consolation'`). Non trovo né un doppio livello "premium/base" né un bonus "+1 ROBI" separato. Confermatemi che "rimuovere la consolazione" = eliminare quel loop top-3 e basta — così non rimuovo la cosa sbagliata.

### STOP-ASK #3 — "Tengono i ROBI minati dal rullo" sull'annullamento
Il brief §4 dice che **anche su annullamento** i partecipanti tengono i ROBI minati dal rullo. Ma oggi il ramo annullamento dell'engine **non mina nulla** — la distribuzione ROBI (mining NFT) gira *solo* nel ramo successo. Quindi una di due:
- **(a)** "rullo" = mining a tempo di partecipazione (ROBI già accreditati durante l'airdrop) → su annullamento non c'è niente da fare, basta non stornare;
- **(b)** il mining va eseguito anche sull'annullamento → è una modifica funzionale vera all'engine, non una rimozione.
Le due ipotesi hanno scope molto diverso. Quale delle due?

### STOP-ASK #4 — Pagamento venditore 100% a confirm: oggi non c'è alcun rail
Il brief §2 fissa "pagamento venditore 100% solo a conferma ricezione". Corretto come spec — ma **oggi non esiste nessun rail di pagamento venditore**: atto5 non ha logica di payout, e l'incasso reale in KAS è on-chain da Stage 2. Quindi propongo: **registriamo l'override nello spec, ma l'implementazione del payout slitta a Stage 2** insieme all'integrazione KAS. Idem la fee upfront §5: la colonna `launch_fee_paid` esiste già su `airdrops` ma non è mai né scritta né letta — posso mettere il **gate** (status non passa a presale/sale senza fee) subito, ma la **meccanica di addebito** dipende da come Treasury vuole incassarla. Confermate lo split: gate ora, payout/addebito a Stage 2.

---

## 4. Piano implementazione — 5 PR, ~2 giornate dev

Stima già calibrata (chunk implementativi puri, niente padding). Ogni PR include il mini integration test obbligatorio (lezione W1).

| PR | Contenuto | Effort | Dipende da |
|---|---|---|---|
| PR-1 | SLA 72h + Caso B sottocosto (ramo B1/B2 in `seller_acknowledge_airdrop` + branch timeout nel cron) | ~3h | — |
| PR-2 | Sistema counter/ban: tabella, increment su annulla esplicito + timeout Caso A, gate ban su flusso vendita, RPC sblocco 1000 ARIA, cron reset 1° gennaio | ~4h | — |
| PR-3 | Cleanup consolazione (rimozione loop top-3) | ~1–2h | STOP-ASK #2 + #3 |
| PR-4 | Gate fee upfront (no live senza `launch_fee_paid`) | ~1–1.5h | STOP-ASK #4 |
| PR-5 | FE esito visibile airdrop chiuso (F7/F8) | ~2–3h | STOP-ASK #1 |

**Totale ~11–14h → ~2 giornate dev.** PR-1 e PR-2 partono subito appena ho l'OK; PR-3/4/5 sono gated sui STOP-ASK.

Nota tecnica counter/ban (§6): la tabella nuova (o le colonne su `profiles`) avrà **GRANT esplicito a `authenticated`** — il default Supabase cambia e non voglio sorprese. Il counter su anno solare lo gestisco con un campo `cancellation_year` + reset idempotente nel cron, così l'1 gennaio è automatico senza job rischiosi.

---

## 5. Cosa cambia per l'utente — conferma di un flip importante

Solo per essere sicuri che sia voluto (è scritto nero su bianco nel brief, ma è l'opposto di oggi): con il design v3, **se il venditore non risponde entro 72h su un airdrop riuscito (Caso A), l'airdrop viene annullato e il vincitore NON riceve l'oggetto** (+ counter +1 al venditore). Oggi il silenzio = accettazione automatica. È un ribaltamento netto. Se è voluto — e dal razionale Skeezu §6 sembra di sì — procedo così.

---

## 6. Bottom line

Design solido, metà infrastruttura già in casa, 2 giornate per il resto. **Sblocco PR-1 e PR-2 appena ricevo conferma sui STOP-ASK #1–#4** (anche solo un "ok" sui punti che non vi cambiano nulla — es. #4 split gate/payout). Per F7/F8 mi serve il file companion: senza quello non parto su PR-5.

Daje — chiudiamo F8 del lifecycle per bene.

---

*CCP · CIO/CTO Airoobi · ACK Airdrop Closure Design LOCKED v3 · 22 May 2026 · daje team a 4*
