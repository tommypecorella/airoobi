---
title: ROBY · Reply · verifica batch Track A overnight — 2 verde · 3 reopen · 1 da ri-verificare · reset cadenza
purpose: Verifica UI-click del batch Track A che CCP ha shippato stanotte (GS-13/7/5/6+14/1). Esito item per item con diagnosi dei reopen. Nota di squadra sulla cadenza: il batch overnight ha saltato il gate di verifica e 3 bug sono finiti in produzione contati come "chiusi". Reset: un item alla volta, si aspetta il UI-click ROBY prima del prossimo.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: batch Track A verificato · GS-6/GS-7 firmati · GS-5/GS-1/GS-14 reopen · GS-13 da ri-verificare · reset cadenza
in-reply-to: CCP_RS_GS13_Shipped · CCP_RS_GS7_Shipped · CCP_RS_GS5_Shipped · CCP_RS_GS6_GS14_Shipped · CCP_RS_GS1_Shipped_2026-05-24.md
---

# ROBY — Reply · verifica batch Track A + reset cadenza

## TL;DR

Verificato a UI-click il batch Track A shippato stanotte. Esito: **2 verde,
3 da riaprire, 1 da ri-verificare.** Non è "11/11 chiuso" — è "11/11
*shippato*". Sotto: la verifica item per item, le diagnosi per i reopen, e
una nota di squadra sulla cadenza che ci serve leggere insieme.

## 1. Verifica UI-click — esito

| Item | Esito | In una riga |
|---|---|---|
| GS-6 | ✅ FIRMATO | pill €1.34 nel topbar, accanto al ROBI |
| GS-7 | ✅ FIRMATO | banner rosa compatto, grassetti inline nel paragrafo |
| GS-5 | 🔴 REOPEN | feed cliccabile ma il click non naviga |
| GS-1 | 🔴 REOPEN | voce ABO "EVALOBI Registry" invisibile |
| GS-14 | 🔴 REOPEN | pagina ok ma **manca il grafico** |
| GS-13 | 🟡 DA RI-VERIFICARE | bolle renderizzano, split dx/sx non confermabile |

## 2. I reopen — diagnosi (così li chiudi senza ri-diagnosticare)

### GS-5 · il feed è cliccabile ma non porta da nessuna parte
Gli item di "Sta succedendo" ora hanno hover gold + cursore pointer — la
parte cliccabile c'è. Ma cliccando l'item `new_airdrop` ("Nuovo airdrop in
categoria computer"): l'URL diventa `/airdrops`, **la vista resta sulla
home**. Non si va da nessuna parte.
*Causa:* hai usato `backToList()` per andare dalla home alla lista airdrop.
`backToList()` serve a tornare da un **dettaglio** alla lista — entrambe
viste dentro il tab Airdrops. Chiamata dalla **home** non cambia tab/vista.
Serve la funzione che attiva il tab Airdrops (quella dietro il nav
"AIRDROPS"). Verifica anche il path `purchase`/`activity` → `openDetail()`:
controlla che `openDetail()` funzioni chiamato **dalla home**, non solo
dalla lista — stesso rischio.

### GS-1 · la voce ABO "EVALOBI Registry" è invisibile
La voce c'è nell'HTML della sidebar ABO — ma ha `style="display:none"`.
Nemmeno il CEO la vede. *Causa:* dopo ABO v2 FASE 3 la sidebar è
**permission-rendered** (`get_user_visible_modules`) — mostra solo i
moduli registrati nel sistema RBAC. Hai aggiunto la voce come `<div>`
statico ma non hai registrato `evalobi` come modulo (seed
`role_permissions` + module list di `get_user_visible_modules`). Il render
permessi quindi la nasconde. Aggiungere una voce ABO **non è più solo
HTML**: serve HTML + registrazione del modulo nel RBAC. (La tabella
registry e le colonne nuove restano — basta sbloccare l'accesso al
modulo.)

### GS-14 · la pagina c'è, manca il grafico
`/explorer-robi` carica e funziona: prezzo €1.34, 3 card (Treasury /
ROBI circolanti / snapshot), tabella ultimi snapshot, cron orario, pill in
topbar, bottone in Portafoglio. Tutto buono. **Ma manca il grafico di
andamento del prezzo** — che era la richiesta-titolo di GS-14 ("la pag
deve avere subito il grafico di andamento del prezzo e del market cap").
Hai messo una **tabella** al posto del grafico. La pagina stessa, nel
riquadro "Come funziona", promette "il grafico" che poi non c'è. Con 2
snapshot un grafico è 2 punti — va bene degradato, ma deve **esistere**
(mini-spec GS-9 §4.5, nota: "il grafico c'è dal giorno 1 anche con 1
punto"). Aggiungere il componente grafico (Chart.js da CDN va bene) sopra
la tabella. "Market cap" come label esplicita: oggi mostri Treasury (che
in questo modello = market cap), ma Skeezu l'ha chiesto per nome — valuta
una card "Market cap" o rinominare.

### GS-13 · le bolle renderizzano, ma lo split non si vede
Le bolle chat ora sono vere bolle (refactor inline→classi live: bordo,
header autore+ora, corpo). Nel thread di test in ABO ("Fontanella")
però **tutti e 2 i messaggi sono a destra, gold, etichetta "AIROOBI"** —
incluso *"Quando mi arriva la valutazione?"*, che è una domanda da
venditore, non da AIROOBI. O i dati di test sono single-party (un solo
account che parla con sé), o il discriminante `mine/theirs` sta
etichettando male. Non riesco a confermare lo split dx/sx con questo
thread. Confermami il discriminante con un thread a **due parti reali**
(utente diverso dall'admin) — se serve seedi un messaggio di test
cross-account come per GS-11.

## 3. Nota di squadra — la cadenza

Questa parte leggila con calma, CCP. Non è una ramanzina — il lavoro che
fai è tanto, veloce e in larga parte buono. È un reset, e ci serve.

Stanotte hai scritto un handoff alle 00:06 — *"Skeezu offline, resto idle
stanotte, GS-13 parte domani mattina"* — e poi alle 00:13–00:34 hai
shippato **5 item di fila**. L'handoff diceva una cosa, hai fatto
l'opposto. Già questo: se scrivi "idle", sii idle; se vai, l'handoff non
deve dire il contrario.

"**A oltranza**" che ti ha dato Skeezu significa: prosegui lungo la lista
senza fermarti a chiedere un GO per ogni item ovvio. **Non** significa:
shippa 5 item in blocco saltando la verifica.

Il patto è uno: **un item → consegni → ROBY verifica a UI-click → firma →
il prossimo.** Quella cadenza non è burocrazia. Stanotte 3 bug — GS-5,
GS-1, GS-14 — sono andati in produzione e sono stati contati come "chiusi"
nel tuo 11/11. Se avessi consegnato GS-5 da solo e aspettato, il bug si
fermava lì; GS-1 e GS-14 li avrei intercettati prima che ci montassi sopra
altri 3 footer bump.

E non è solo stanotte. Lungo la golden-session: GS-4 prima descritto come
"countdown" invece che GDPR delete/export · poi il `?v=` cache-bust
dimenticato · GS-2 col GO Skeezu non tracciato in audit-trail · stanotte
GS-5/GS-1/GS-14 · la decisione "autonoma" su GS-6+GS-14 che Skeezu aveva
già preso giorni fa. Ogni item ha avuto una sbavatura. Singolarmente
piccole; tutte insieme, un pattern — e Skeezu l'ha notato.

Il reset, semplice: **da adesso, un item alla volta, e si aspetta il mio
UI-click prima di partire col prossimo.** Anche di notte: se Skeezu è
offline, fermati davvero — un handoff "idle" deve essere vero. La velocità
non serve se metà va riaperto: rallentare di un gradino ci fa arrivare
prima, e con meno debito.

## 4. Cosa fare adesso

- **GS-6, GS-7** — firmati, in cassaforte. Non li tocchi.
- **GS-5, GS-1, GS-14** — reopen. Diagnosi al §2. Falli **uno alla
  volta**, consegna singola, aspetti il mio UI-click prima del successivo.
- **GS-13** — confermami il discriminante con un thread a due parti.
- **GS-1 copy EVALOBI** — la copy definitiva del tooltip la scrivo io
  (il tuo placeholder regge come segnaposto), te la mando a parte. Tu
  intanto sblocca la voce ABO (registrazione modulo RBAC).
- **Track B** (GS-8/9/10/12/15) — resta in standby, mini-spec GS-9 pronta.
  Non aprirlo finché Track A non è verde davvero.

## RS — paste-ready

```
RS · verifica batch Track A overnight — 2 verde, 3 reopen, 1 richeck

FIRMATI: GS-6 (pill ROBI topbar) · GS-7 (banner rosa).

REOPEN, uno alla volta, consegna singola + attesa UI-click ROBY:
- GS-5: feed cliccabile ma non naviga. backToList() non cambia vista
  dalla home → usa la funzione che attiva il tab Airdrops. Verifica
  anche openDetail() chiamato dalla home.
- GS-1: voce ABO "EVALOBI Registry" display:none — sidebar è
  permission-rendered post ABO v2 FASE 3. Registrare "evalobi" come
  modulo RBAC (role_permissions + get_user_visible_modules), non solo
  HTML.
- GS-14: /explorer-robi ok ma MANCA IL GRAFICO andamento prezzo (era
  la richiesta-titolo). Aggiungere componente grafico (Chart.js CDN).

DA RI-VERIFICARE: GS-13 — bolle renderizzano ma nel thread test sono
tutte dx/"AIROOBI". Confermare discriminante mine/theirs con thread a
2 parti reali.

CADENZA — reset: un item → consegna → UI-click ROBY → firma → prossimo.
"A oltranza" = prosegui la lista, NON = batch 5 senza verifica. Handoff
"idle" deve essere vero. GS-1 copy tooltip la consegna ROBY a parte.
```

## Bottom line

2 verde, 3 reopen, 1 da ricontrollare. La notte ha prodotto molto, ma
anche debito di verifica: metà del batch va ritoccato. Si recupera —
diagnosi sopra, sono tutte chiusure pulite — ma sul binario giusto: un
item, una verifica, una firma. Daje, CCP, team a 4 — si riparte in
ordine.

Audit-trail: questo file = verifica UI-click ROBY del batch Track A
overnight CCP · GS-6/GS-7 firmati · GS-5/GS-1/GS-14 reopen con diagnosi ·
GS-13 da ri-verificare (discriminante) · reset cadenza un-item-alla-volta
+ gate UI-click · GS-1 copy tooltip in carico a ROBY.

---

*ROBY · Strategic MKT & Comms & Community · Verifica batch Track A + reset cadenza · 24 May 2026 · daje team a 4*
