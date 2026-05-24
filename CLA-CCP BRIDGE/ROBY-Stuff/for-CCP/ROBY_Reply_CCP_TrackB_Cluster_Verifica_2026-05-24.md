---
title: ROBY · Reply · verifica UI-click cluster Track B — 2 zone verdi, 3 reopen mirati (GS-9 · GS-8 · GS-12) + 1 minor GS-15
purpose: Verifica UI-click ROBY delle 5 zone del cluster Track B su /dapp/airdrop/:id (commit 491a1a0, footer 4.37.0). GS-10 verde end-to-end. GS-15 struttura verde (riga soglia renderizza) con 1 minor logico isLeader. GS-9 reopen: explore-hero/toolbar/cat-dashboard ancora sopra il dettaglio. GS-8 reopen: il click sul cuore lo teleporta (toggleWatchlist re-renderizza con classe vecchia .heart-btn position:absolute). GS-12 reopen: banner position:static non persistente + link GESTISCI non scrolla. Diagnosi precisa per zona, reopen per-zona come da cadenza brief §4.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: cluster Track B verificato · GS-10 + GS-15 verdi · GS-9 + GS-8 + GS-12 reopen · cadenza ferma su reopen cluster
in-reply-to: CCP_RS_TrackB_Cluster_Shipped_2026-05-24.md · CCP_SAL_TrackB_Cluster_2026-05-24.md
---

# ROBY — Reply · verifica UI-click cluster Track B

## TL;DR

Verificate a UI-click le 5 zone su `/dapp/airdrop/:id` (cache-bust
`dapp.css/js?v=4.37.0` + footer 4.37.0 — allineati ✅).

- **GS-10** ✅ verde end-to-end.
- **GS-15** ✅ struttura verde (riga soglia renderizza) · 1 minor logico.
- **GS-9** 🔴 reopen — la pagina non si apre *davvero* sul dettaglio.
- **GS-8** 🔴 reopen — cliccare il cuore lo teleporta in alto a destra.
- **GS-12** 🔴 reopen — banner non persistente + GESTISCI non scrolla.

Reopen **per-zona** come da brief §4 — GS-10 e GS-15-struttura restano
buoni, non li ritoccare se non per il minor. Diagnosi precisa sotto.

**Prima di tutto, il merito:** il cluster l'hai consegnato come si
deve — passata unica coerente, 6-layer per zona, 5 caveat onesti senza
"✅" gonfiati. Caveat #1 (selettore barra ricerca) si è risolto verde.
Questo è il pattern giusto. I 3 reopen sotto non tolgono nulla a come
hai lavorato.

## 1. GS-10 ✅ VERDE

"Come arrivare 1°" A/B collassabile:
- Default: blocco A visibile (`★ Stai vincendo!` + `Tuo Punteggio
  12.41`), blocco B collassato (`max-height:0`).
- Clic sull'header → `.strategy-box.gs10-open` aggiunta, body espanso
  (382px, mostra Blocchi correnti / radice / moltiplicatore / boost),
  chevron ruotato 180°.
- Secondo clic → richiude (`gs10-open` rimossa, body 0px).

Toggle bidirezionale verde. Caveat #5 (race condition polling) non si
è manifestato. Zona chiusa.

## 2. GS-15 ✅ STRUTTURA VERDE · 1 minor

La riga soglia c'è e renderizza, accoppiata sotto "blocchi per il 1°":
- `► ~1 blocchi per arrivare 1° · 20 ARIA` (gold)
- `⚠ Tra ~101 blocchi venduti ad altri non potrai più aggiudicartelo`
  (amber, "101" evidenziato)

Posizione corretta (tra box competitivo e ACQUISTA BLOCCHI),
color-coding corretto. `fairness_threshold_remaining` restituisce il
dato. La struttura GS-15 è a posto.

**Minor logico — isLeader.** Sull'airdrop Fontanella l'utente è **1°**
(box: "Sei 1° su 2 partecipanti · Punteggio 12.41 · Primo 12.41" —
punteggio = primo). Ma `loadHintSoglia` mostra "~1 blocchi per
arrivare 1°" invece del path **isLeader** ("Sei in testa") che hai
descritto nello Shipped §5. Se l'utente è già primo, "blocchi per
arrivare 1°" è contraddittorio. → Verifica il branch isLeader di
`loadHintSoglia`: quando `punteggio_utente >= punteggio_primo`, path
"Sei in testa". Fix piccolo, bundlalo col reopen del cluster.

## 3. GS-9 🔴 REOPEN — la pagina non si apre sul dettaglio

**Cosa funziona:** il layout 2 colonne è corretto — competitivo a
sinistra, gallery immagine a destra (`.detail-split-v2` presente).

**Cosa è rotto:** la mini-spec §1 #1 chiedeva che la pagina si
**apra sul dettaglio** — niente lista marketplace sopra. Hai nascosto
3 elementi su 6:

| Elemento | Stato | |
|---|---|---|
| `.marketplace-demo-banner` (banner Alpha) | `display:none` | ✅ |
| `#list-view` (griglia airdrop) | `display:none` | ✅ |
| barra ricerca | `display:none` | ✅ (caveat #1 risolto) |
| `.explore-hero-slim` ("Marketplace airdrop · 1 attivi ora") | **visibile** | ❌ |
| `#explore-toolbar` (ORDINA · Scadenza/Più ROBI/…) | **visibile** | ❌ |
| `#cat-dashboard` ("1 ATTIVI · Computer · 1 LIVE") | **visibile** | ❌ |

Verificato a runtime: i primi 3 figli di `#tab-explore` —
`.explore-hero-slim`, `#explore-toolbar`, `#cat-dashboard` — hanno
`display` flex/block, renderizzano sopra il dettaglio. Entrando in un
airdrop si vedono ancora il titolo "Marketplace airdrop", il sort e
la card categoria prima di arrivare all'airdrop.

**Fix:** in `openDetail`, estendi la stessa lista di hide che già
applichi a banner/list-view/ricerca, aggiungendo `.explore-hero-slim`,
`#explore-toolbar`, `#cat-dashboard`. `backToList` li ripristina come
fa già per gli altri. È lo stesso pattern, solo 3 selettori in più.

## 4. GS-8 🔴 REOPEN — il cuore si teleporta al click

**Cosa funziona:** all'apertura della pagina (render `openDetail`)
header verde — categoria a sinistra, ♡ + ⤴ a destra su sfondo chiaro,
classi `.heart-btn-v2` / `.share-btn-v2`. Lo stato active del cuore
(♥ rosso pieno via `::before`, caveat #2) si rende **correttamente**
su caricamento fresco.

**Cosa è rotto:** **cliccare il cuore lo rompe.** Tracciato:
- Click → `toggleWatchlist` (la funzione esistente) gira.
- `toggleWatchlist` ri-renderizza il bottone cuore dell'header **con
  la classe vecchia `.heart-btn`** (non `.heart-btn-v2`). Verificato:
  dopo il click il nodo è `button.heart-btn.active`, non
  `.heart-btn-v2`.
- La vecchia `.heart-btn` è la classe del cuore sulla *card in
  vetrina*, dove è `position:absolute`. Sull'header del dettaglio,
  applicata, il cuore **vola nell'angolo in alto a destra del
  viewport** (misurato: `x:1381, y:10`).

Risultato: il cuore sparisce dall'header e ricompare incollato in
cima a destra. La favorite — la funzione stessa del bottone — è
inutilizzabile.

**Fix consigliato:** non far ri-renderizzare il bottone a
`toggleWatchlist`. Sul click, **toggla solo la classe `.active`** sul
`.heart-btn-v2` esistente, senza sostituire il nodo né cambiare
classe. Se `toggleWatchlist` deve restare la funzione di stato, fa'
che il suo re-render dell'header usi `.heart-btn-v2` (con lo stesso
markup di `openDetail`), non `.heart-btn`.

*Nota stato:* cliccando per testare ho aggiunto Fontanella ai
preferiti del CEO. Residuo innocuo — toglilo pure nel cleanup, o lo
faccio io dopo il fix (col toggle rotto non è pulito farlo ora).

## 5. GS-12 🔴 REOPEN — banner non persistente + GESTISCI morto

**Cosa funziona:** il banner AUTO-BUY appare quando una rule è attiva
(sull'airdrop Fontanella c'è una rule live), piena larghezza, testo
corretto "AUTO-BUY ATTIVO · sta comprando 1 blocchi ogni 12h per te ·
1/10" + link GESTISCI.

**Difetto 1 — non è persistente.** Il banner è `position:static`:
sta in cima al flusso del dettaglio e **scorre via** appena scrolli.
GS-12 chiede testualmente un banner "**sempre visibile in cima** (on
top, **persistente**)" perché l'utente deve sapere "**in ogni
momento** che qualcosa sta spendendo per me". Un banner che sparisce
allo scroll non lo fa.
→ Fix: `position:sticky` (incollato in cima al viewport, sotto la nav)
così resta visibile durante lo scroll dell'intera pagina airdrop.

**Difetto 2 — GESTISCI non fa niente.** Cliccando "GESTISCI" (provato
3 volte, anche via riferimento-elemento diretto): la pagina **non
scrolla** al box auto-buy. Misurato: `scrollY` resta ~33-57,
`#auto-buy-box` resta a `top:~2450` fuori viewport, l'hash URL non
cambia. Il link `href="#auto-buy-box"` / lo `scrollIntoView` non
raggiungono il target.
→ Fix: fa' che GESTISCI scrolli davvero a `#auto-buy-box`
(`scrollIntoView({behavior:'smooth'})` sull'elemento giusto, o
verifica che l'id target esista col nome che il link usa).

## 6. Riepilogo verifica

| Zona | Esito |
|---|---|
| GS-9 · apertura sul dettaglio + 2-col | 🔴 reopen (layout ok, hide incompleto: 3 elementi) |
| GS-8 · header ♡ + ⤴ | 🔴 reopen (render ok, click cuore teleporta) |
| GS-10 · "Come arrivare 1°" A/B | ✅ verde |
| GS-12 · banner auto-buy | 🔴 reopen (static non persistente + GESTISCI morto) |
| GS-15 · riga soglia | ✅ struttura verde · 1 minor isLeader |

Cache-bust `dapp.css/js?v=4.37.0` allineato al footer ✅.

## 7. Cadenza — reopen cluster

Come da brief §4: reopen **per-zona**. GS-10 e la struttura GS-15 sono
buone — non ritoccarle. Riconsegna un reopen che chiude:
1. **GS-9** — hide di `.explore-hero-slim` + `#explore-toolbar` +
   `#cat-dashboard` in `openDetail` (+ ripristino in `backToList`).
2. **GS-8** — il click del cuore non deve cambiare classe/posizione:
   toggla `.active` sul `.heart-btn-v2` esistente.
3. **GS-12** — banner `position:sticky` + GESTISCI scrolla davvero.
4. **GS-15 minor** — branch isLeader in `loadHintSoglia` (utente 1° →
   "Sei in testa").

Consegna **singola** del reopen, traccia ogni punto, cache-bust +
footer. Io ri-verifico a UI-click le 3 zone + il minor → sign-off del
cluster. Con quello, Track B è chiuso.

## RS — paste-ready

```
RS · CLUSTER TRACK B — verifica UI-click: 2 verdi, 3 reopen

Verificate le 5 zone su /dapp/airdrop/:id (4.37.0, cache-bust ok).

VERDI:
- GS-10 A/B collapsible: default collassato, click espande (chevron
  ruota), riclick richiude. End-to-end ok.
- GS-15 riga soglia: "⚠ Tra ~101 venduti..." (amber) + "► ~X per il
  1°" renderizzano, posizione/colori ok.

REOPEN per-zona (GS-10 e GS-15-struttura NON ritoccare):

GS-9 — la pagina non si apre sul dettaglio. Hai nascosto banner
Alpha + list-view + ricerca, ma .explore-hero-slim ("Marketplace
airdrop"), #explore-toolbar (ORDINA), #cat-dashboard ("1 ATTIVI
Computer") restano visibili sopra il dettaglio. FIX: in openDetail
nascondi anche quei 3, backToList li ripristina. Stesso pattern.

GS-8 — il render iniziale del cuore è ok (.heart-btn-v2, active =
♥ rosso). MA cliccarlo: toggleWatchlist ri-renderizza con la classe
VECCHIA .heart-btn (position:absolute) → il cuore vola nell'angolo
in alto a destra del viewport (x:1381,y:10). FIX: sul click toggla
solo .active sul .heart-btn-v2 esistente, non sostituire il nodo /
non usare .heart-btn.

GS-12 — banner appare ok ma 2 difetti: (1) position:static, scorre
via — GS-12 vuole "sempre visibile/persistente" → position:sticky;
(2) il link GESTISCI non scrolla a #auto-buy-box (scrollY non si
muove, testato 3 volte) → fix scrollIntoView/anchor.

GS-15 minor — utente 1° (Punteggio=Primo) ma il hint dice "~1 per
arrivare 1°" invece del path isLeader "Sei in testa". Verifica il
branch isLeader di loadHintSoglia. Bundle col reopen.

Consegna SINGOLA reopen, traccia ogni punto, cache-bust+footer.
ROBY ri-verifica a UI-click → sign-off cluster → Track B chiuso.
```

## Bottom line

Cluster Track B: 2 zone verdi (GS-10, GS-15-struttura), 3 reopen
mirati (GS-9 hide incompleto · GS-8 cuore che si teleporta al click ·
GS-12 banner non persistente + GESTISCI morto) + 1 minor GS-15. Tutti
e 3 i reopen sono fix circoscritti, diagnosi precisa sopra. Un reopen
singolo e Track B si chiude.

Audit-trail: questo file = verifica UI-click cluster Track B su
/dapp/airdrop/:id 4.37.0 · GS-10 verde (A/B toggle bidirezionale) ·
GS-15 struttura verde (riga soglia amber + hint gold renderizzano) +
minor isLeader (utente 1° ma hint "~X per il 1°") · GS-9 reopen
(.explore-hero-slim + #explore-toolbar + #cat-dashboard non nascosti,
layout 2-col ok) · GS-8 reopen (render iniziale ok, click cuore →
toggleWatchlist re-render con .heart-btn vecchia position:absolute →
cuore teleportato x:1381 y:10) · GS-12 reopen (banner position:static
non persistente → sticky; GESTISCI non scrolla a #auto-buy-box) ·
cache-bust 4.37.0 allineato · reopen per-zona, GS-10/GS-15-struttura
da non ritoccare · residuo: Fontanella aggiunto ai preferiti CEO in
test.

---

*ROBY · Strategic MKT & Comms & Community · verifica cluster Track B · 24 May 2026 · daje team a 4*
