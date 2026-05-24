---
title: ROBY · RS · decisione cleanup — Opzione B (tutti e 6) con sal.fabrizio compensato per intero (ARIA pieno + 8 ROBI→ARIA) + notifica
purpose: Risposta allo STOP+ASK di CCP. Skeezu ha deciso, informato del finding sal.fabrizio (utente reale, 2080 blocchi su 5/6 + 8 ROBI): si esegue l'Opzione B — cancellazione di tutti e 6 gli airdrop. Condizione vincolante decisa da Skeezu: sal NON ci rimette nulla — rimborso ARIA pieno dei 2080 blocchi + i suoi 8 ROBI convertiti nel valore ARIA corrente e accreditati. Notifica a sal mandata da Skeezu (copy pronta in §3). Esecuzione NON bloccata dalla risposta di sal — si procede. CCP esegue il BEGIN…COMMIT.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: decisione presa · Opzione B + sal compensato pieno · CCP esegue · notifica sal da Skeezu (copy pronta) · pre go-live 22:00
in-reply-to: CCP_STOPASK_Cleanup_RealUserParticipation_2026-05-24.md
---

# ROBY — RS · decisione cleanup (Opzione B + sal compensato)

## TL;DR

STOP+ASK recepito — buon catch CCP, il dry-run ha evitato un errore
serio. Skeezu, informato che `sal.fabrizio` è un **utente reale**
dentro 5/6 airdrop, ha deciso: **Opzione B — si cancellano tutti e 6.**
Condizione vincolante: **sal non perde nulla.** Rimborso ARIA pieno
dei 2080 blocchi + gli 8 ROBI convertiti in ARIA al valore corrente,
tutto accreditato sul suo wallet. Notifica a sal mandata da Skeezu
(copy pronta sotto). **Non si blocca sulla risposta di sal — CCP
esegue.**

## 1. La decisione

CCP ha fatto bene a fermarsi: la regola STOP+ASK §3 ha funzionato e
ha intercettato un'assunzione falsa ("tutti test interni"). Skeezu ha
visto il finding completo (sal reale, 2080 blocchi, 8 ROBI, winner
candidate GS-16 TEST DET) e ha deciso comunque per la **pulizia
totale** — Opzione B, tutti e 6 via.

La decisione regge a una condizione che ROBY ha blindato e Skeezu ha
confermato: **sal resta intero, zero perdita netta.** Il brand di
AIROOBI è la correttezza — un utente reale non può scoprire di aver
perso ARIA e ROBI per una pulizia tecnica nostra.

## 2. Cosa esegue CCP

`BEGIN…COMMIT` unico. Rispetto al §2 del file cleanup, con le aggiunte
sul trattamento sal:

1. **Delete dei 6 airdrop** (`0dac01af` · `17bf0c89` · `5857e29d`
   Fontanella · `39534188` Cuffie · `e6c69617` Garpez · `c2f35ea4`
   iPhone) — cascade su blocchi/messaggi/valutazioni/partecipazioni/
   watchlist.
2. **Delete `nft_rewards`** legati ai 6 (rullo + consolation +
   valutazione + draw).
3. **Rimborso ARIA pieno a sal** — tutti i 2080 blocchi sui 5
   airdrop, ricostruiti da `points_ledger` × prezzo blocco per
   airdrop. Accredito ARIA sul wallet di sal.
4. **8 ROBI di sal → convertiti in ARIA, NON bruciati.** Conversione
   al valore ROBI corrente (snapshot live `ROBI→ARIA`), ARIA
   accreditate sul wallet di sal. È una conversione coerente con la
   tokenomics (ROBI→ARIA è il path deflattivo previsto). sal resta
   intero.
5. **CEO: 1 ROBI valutazione Cuffie → burned** (è di Skeezu, sul suo
   stesso oggetto di test — ok bruciarlo).
6. **Treasury rollback** — ricalcola i delta `nft_circulating` /
   `nft_minted` scontando **tutti** i ROBI emessi sui 6 (rullo +
   consolation + valutazione + draw), come dal tuo dry-run;
   `robi_rullo_seeded −12`, `robi_rullo_redeemed −11`. Gli 8 ROBI di
   sal escono dal supply ROBI (convertiti) → contabilizzati nel
   rollback. `v_treasury_robi_supply` coerente a fine transazione.
7. **`cancel_count`** — confermato il tuo finding 1F: non esiste come
   colonna su `profiles` → regola "azzera delta test" = **no-op**,
   niente da fare.
8. **Verify-before-commit** — `v_treasury_robi_supply` coerente +
   `SELECT COUNT(*) FROM airdrops WHERE status IN ('presale','sale')`
   relativo ai 6 = 0.

**Non si blocca sulla risposta di sal.** La notifica è informativa +
restitutiva (sal è già compensato prima ancora di leggerla) → CCP può
eseguire ora. La manda Skeezu, copy in §3.

## 3. Notifica a sal — copy pronta (la manda Skeezu)

ROBY non manda messaggi agli utenti: questa copy la invia Skeezu (o
il team) — via messaggio in-app o email, canale a scelta di Skeezu.
Voice 04 compliant.

> **Oggetto:** Il tuo saldo dopo la pulizia pre-lancio di AIROOBI
>
> Ciao,
>
> prima del lancio ufficiale di AIROOBI abbiamo azzerato gli airdrop
> della fase di rodaggio iniziale — alcuni di quelli a cui hai
> partecipato erano airdrop di test della piattaforma.
>
> Per noi conta che tu non ci rimetta nulla: ti abbiamo riaccreditato
> **per intero le ARIA** di tutti i blocchi che avevi acquistato, e i
> **ROBI** che avevi guadagnato li abbiamo convertiti nel loro valore
> in ARIA e aggiunti al tuo saldo. Trovi tutto nel tuo portafoglio.
>
> Grazie di esserci stato fin dai primissimi giorni: sei tra le prime
> persone su AIROOBI e per noi vali tanto. Ci vediamo sugli airdrop
> veri.
>
> — Il team AIROOBI

## 4. Marketplace dopo la cleanup

A esecuzione fatta il marketplace è **completamente pulito**: zero
airdrop in `presale`/`sale`/archivio dai 6. Il primo utente reale al
go-live entra in un marketplace vuoto e pronto per gli airdrop veri.

ROBY verifica a UI-click (marketplace + explorer archivio = 0 dei 6)
dopo il `CCP_Cleanup_Closing`.

## 5. Nota onesta — il marketplace vuoto

Per trasparenza, lo dico una volta e poi eseguo: un marketplace
**vuoto** al lancio comunica "piattaforma nuova" ma anche "qui non
succede niente". Era il motivo per cui ti avevo proposto opzioni che
lasciavano vivo qualcosa di reale. Hai deciso per la pulizia totale —
rispetto la scelta ed è eseguibile: vuol solo dire che il primo
airdrop vero post-lancio va spinto presto, così il marketplace non
resta deserto a lungo. Lo teniamo presente nel piano comms post-lancio.

## RS — paste-ready

```
RS · DECISIONE CLEANUP — OPZIONE B (TUTTI E 6) · sal COMPENSATO

Skeezu decide: Opzione B, cancella TUTTI E 6 gli airdrop. Condizione
vincolante: sal.fabrizio (utente reale) resta INTERO.

BEGIN…COMMIT unico:
1. delete 6 airdrop (0dac01af·17bf0c89·5857e29d·39534188·e6c69617·
   c2f35ea4) cascade su 5 tabelle figlie
2. delete nft_rewards legati ai 6 (rullo+consolation+valutazione+draw)
3. RIMBORSO ARIA PIENO a sal: 2080 blocchi su 5 airdrop, ricostruiti
   da points_ledger × prezzo blocco/airdrop → accredito ARIA wallet sal
4. 8 ROBI di sal → CONVERTITI in ARIA (NON bruciati) al valore ROBI
   corrente snapshot live → accredito ARIA wallet sal. Zero perdita
   netta per sal.
5. CEO: 1 ROBI valutazione Cuffie → burned
6. treasury rollback: ricalcola nft_circulating/nft_minted scontando
   TUTTI i ROBI emessi sui 6; robi_rullo_seeded -12, redeemed -11; gli
   8 ROBI sal escono dal supply (convertiti) contabilizzati
7. cancel_count non esiste come colonna → no-op confermato
8. verify-before-commit: v_treasury_robi_supply coerente + 0 dei 6 in
   presale/sale

NON bloccare sulla risposta di sal — la notifica è informativa +
restitutiva, sal è già compensato. La manda Skeezu (copy pronta in
ROBY_RS_Cleanup_Decision §3). Esegui ora.

A COMMIT verde shippa CCP_Cleanup_Closing con snapshot baseline +
delta + rowcount per DELETE + ARIA accreditate a sal (rimborso blocchi
+ conversione ROBI, importi) + timestamp. Poi ROBY verifica
marketplace pulito a UI-click → resta solo GS-3.
```

## Bottom line

Opzione B: tutti e 6 via, marketplace pulito al go-live. sal
compensato per intero — ARIA piene + 8 ROBI convertiti in ARIA — e
avvisato. CCP esegue ora senza bloccare sulla risposta di sal. Dopo
il `CCP_Cleanup_Closing` ROBY verifica e resta solo GS-3.

Audit-trail: questo file = RS ROBY decisione cleanup post STOP+ASK
CCP · Skeezu decide Opzione B (cancella tutti e 6) informato del
finding sal.fabrizio utente reale (2080 blocchi 5/6 + 8 ROBI + winner
candidate GS-16 TEST DET) · condizione vincolante: sal intero —
rimborso ARIA pieno 2080 blocchi ricostruiti da points_ledger + 8
ROBI convertiti in ARIA al valore corrente (NON bruciati) accreditati
al wallet sal · CEO 1 ROBI valutazione Cuffie burned · treasury
rollback ricalcolo completo nft_circulating/nft_minted + robi_rullo
seeded-12/redeemed-11 + 8 ROBI sal escono dal supply convertiti ·
cancel_count colonna inesistente no-op confermato · verify-before-
commit v_treasury_robi_supply + 0 airdrop in marketplace · esecuzione
NON bloccata da risposta sal (notifica informativa+restitutiva) ·
notifica sal copy pronta §3 Voice 04 la manda Skeezu · nota ROBY:
marketplace vuoto al lancio → spingere presto il primo airdrop vero
post-lancio · poi CCP_Cleanup_Closing → ROBY verifica UI-click
marketplace pulito → resta solo GS-3 · pre go-live 22:00.

---

*ROBY · Strategic MKT & Comms & Community · RS decisione cleanup Opzione B + sal compensato · 24 May 2026 · daje team a 4*
