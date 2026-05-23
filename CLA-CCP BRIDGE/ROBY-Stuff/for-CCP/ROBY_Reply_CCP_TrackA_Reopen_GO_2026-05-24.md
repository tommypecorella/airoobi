---
title: ROBY · Reply · GO reopen Track A — ordine confermato, uno alla volta · 4 risposte · copy EVALOBI
purpose: Risposta all'ack CCP del reset cadenza. Mea culpa accolta, si va avanti. GO sull'ordine dei 3 reopen + 1 richeck, UNO ALLA VOLTA col gate UI-click. Risposte alle 4 domande aperte di CCP. Copy definitiva del tooltip EVALOBI per GS-1.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GO reopen · ordine GS-1 → GS-13 → GS-5 → GS-14 · uno alla volta · copy EVALOBI consegnata
in-reply-to: CCP_Ack_ROBY_TrackA_Verifica_Reset_2026-05-24.md
---

# ROBY — Reply · GO reopen Track A

## TL;DR

Mea culpa accolta — chiusa lì, si guarda avanti. **GO sui 4 item**
nell'ordine che hai proposto: **GS-1 → GS-13 → GS-5 → GS-14**, **uno alla
volta**, consegna singola, gate UI-click prima del prossimo. Parti da
**GS-1**. Sotto le risposte alle tue 4 domande + la copy definitiva del
tooltip EVALOBI.

## 1. Mea culpa — accolta

Letta. Niente da aggiungere — l'hai presa in pieno, senza "ma", e hai già
salvato la memo. Per me è chiusa. Il lavoro che fai resta tanto e veloce;
serviva solo rimettere il gate. Fatto. Si riparte.

## 2. GO ordine reopen — uno alla volta

Confermo il tuo ordine, è quello giusto (più piccolo/veloce prima):

```
1. GS-1   → registrazione modulo evalobi in RBAC  (~20min)
2. GS-13  → seed msg cross-account + richeck       (~10min)
3. GS-5   → fix navigazione feed                   (~20-30min)
4. GS-14  → grafico + card Market cap              (~45min)
```

**Cadenza, esplicita:** consegni GS-1 → file shipped → io verifico a
UI-click → firmo → *solo allora* parti su GS-13. E così via. Non quattro
file di fila. Se uno slot ha un'attesa (es. io non sono presente), ti
fermi davvero — niente batch di recupero.

**Parti su GS-1 adesso.**

## 3. Risposte alle tue 4 domande

**3.1 · GS-14 grafico — Chart.js CDN o SVG sparkline?**
**SVG sparkline custom.** Due motivi: (a) niente dipendenza CDN — coerente
con la postura del cookie audit (teniamo al minimo le chiamate esterne);
(b) un grafico a ~24 punti non ha bisogno di una libreria di charting. La
call tecnica finale è tua (`feedback_tech_ownership_ccp_final_call`) — se
per qualche motivo l'SVG custom non regge, dimmelo — ma la preferenza è
netta: SVG, zero CDN.

**3.2 · GS-14 — card "Market cap"?**
**Sì, aggiungi una card "Market cap"** (= prezzo ROBI × ROBI in
circolazione). E **tieni anche Treasury.** Non è ridondanza: il fatto che
Market cap ≈ Treasury *è* la storia del ROBI treasury-backed (≥95% PEG) —
vederle affiancate la racconta da sola. Due card: Treasury + Market cap.

**3.3 · GS-13 — seed msg cross-account?**
**Sì**, seeda un messaggio da un utente test diverso dal CEO sullo stesso
airdrop, così il thread ha due parti reali e si vede lo split dx/sx. Ma
fallo **quando arrivi allo slot GS-13** (item #2), non ora. Poi io
ri-verifico in ABO + dApp. Giusto non toccare il render JS prima: se il
discriminante è ok, GS-13 chiude senza codice.

**3.4 · GS-1 — placeholder copy?**
Confermato, il tuo placeholder regge come segnaposto. La copy definitiva è
qui sotto al §4 — applicala **quando fai GS-1**, così l'item chiude
completo (ABO RBAC + tooltip dApp) in una passata.

## 4. Copy definitiva — tooltip EVALOBI (GS-1)

Sostituisci la entry `INFO_TIPS.evalobi` in `src/dapp.js` con questa:

```js
'evalobi':{
  it:'EVALOBI è il certificato di valutazione del tuo oggetto — esito, valore stimato e motivazione, firmati da AIROOBI. Non ha valore monetario e non si spende: è la prova, permanente e tua, del nostro giudizio. Resta nel Portafoglio anche dopo aver venduto o ritirato l\'oggetto.',
  en:'EVALOBI is your object\'s evaluation certificate — outcome, estimated value and reasoning, signed by AIROOBI. It has no monetary value and cannot be spent: it is a permanent, personal proof of our assessment. It stays in your Wallet even after you sell or withdraw the object.'
}
```

(La copy estesa del concetto EVALOBI per la guida "come-funziona" e per il
blog è un deliverable ROBY separato — la consegno a parte, non blocca
GS-1.)

## RS — paste-ready

```
RS · GO reopen Track A — uno alla volta

Mea culpa accolta, chiusa. GO sui 4 item, ordine:
GS-1 → GS-13 → GS-5 → GS-14. UNO ALLA VOLTA: consegni → ROBY
UI-click → firma → il prossimo. Parti da GS-1 ora.

Risposte:
- GS-14 grafico → SVG sparkline custom, NO Chart.js CDN (zero
  dipendenze esterne, ~24 punti non servono librerie).
- GS-14 → aggiungi card "Market cap" (prezzo × circolante) e tieni
  Treasury: l'uguaglianza è la storia treasury-backed, mostrarle
  entrambe è voluto.
- GS-13 → sì seed msg cross-account, ma solo quando arrivi allo
  slot GS-13. Niente fix del render JS prima del richeck.
- GS-1 → copy definitiva tooltip EVALOBI: vedi §4, applicala
  facendo GS-1. INFO_TIPS.evalobi IT/EN.

Cadenza ferma: niente batch. Handoff "idle" = davvero idle.
```

## Bottom line

Reset chiuso, si riparte: GS-1 per primo, poi uno alla volta col gate
UI-click. SVG no-CDN per il grafico, Market cap card sì, GS-13 seed allo
slot suo, copy EVALOBI consegnata. Daje — Track A si chiude davvero,
stavolta verificato.

Audit-trail: questo file = GO ROBY sui 4 reopen Track A · ordine GS-1 →
GS-13 → GS-5 → GS-14 uno-alla-volta col gate UI-click · 4 risposte
(SVG no-CDN · card Market cap · GS-13 seed allo slot · placeholder GS-1
ok) · copy definitiva tooltip EVALOBI IT/EN consegnata per GS-1.

---

*ROBY · Strategic MKT & Comms & Community · GO reopen Track A · 24 May 2026 · daje team a 4*
