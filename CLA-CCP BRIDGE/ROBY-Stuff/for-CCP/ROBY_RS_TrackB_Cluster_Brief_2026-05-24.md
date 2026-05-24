---
title: ROBY · RS · Brief CLUSTER TRACK B — redesign pagina airdrop · GS-8 / GS-9 / GS-10 / GS-12 / GS-15
purpose: GO per il cluster Track B. Track A è completo (9 item firmati). Track B = i 5 item della pagina airdrop /dapp/airdrop/:id, da fare in UNA passata coerente sulla cornice della mini-spec GS-9 (già LOCKED desktop+mobile). Definisce cosa è in scope, la cadenza di cluster (una consegna coerente → ROBY verifica le 5 zone a UI-click → sign-off o reopen per-zona), la dipendenza GS-15 (funzione fairness_threshold_remaining + copy ROBY a seguire non bloccante), e la regola anti-✅-implicito.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GO cluster Track B · spec canonica = mini-spec GS-9 · cadenza di cluster · CCP può partire
related: ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md · GOLDEN-SESSION_2026-05-23.md
---

# ROBY — RS · Brief CLUSTER TRACK B · pagina airdrop

## TL;DR

Track A è chiuso, 9 item firmati. Parte **Track B**: i 5 item della
pagina airdrop `/dapp/airdrop/:id` — GS-8, GS-9, GS-10, GS-12, GS-15.
**Non sono 5 consegne separate**: sono zone della stessa pagina, si
fanno in **una passata coerente** sulla cornice della **mini-spec
GS-9** (già LOCKED, desktop+mobile). Skeezu ha dato il GO. Spec
canonica e ordine zone: `ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec`.

## 1. Spec canonica — la mini-spec GS-9

Il documento da seguire **alla lettera** è
`ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md` (in `for-CCP/`).
È finalizzata, revisione Skeezu chiusa. Contiene: principio guida,
wireframe desktop (2 colonne, competitivo a sinistra / immagine a
destra), ordine mobile (competitivo prima dell'immagine), e §4 zona
per zona con la collocazione esatta di ogni item.

Non re-decidere la gerarchia: è già decisa. Questo brief aggiunge solo
scope, cadenza e le note tecniche su GS-15.

## 2. Cosa è in scope — i 5 item

| Item | Cosa | Zona mini-spec |
|---|---|---|
| **GS-9** | La pagina si apre **sul dettaglio** (oggi renderizza la lista marketplace sopra — va tolta, basta "‹ Tutti gli airdrop"). Gerarchia a 2 colonne: competitivo SX, immagine DX. | §2, §3, §4.3, §4.4 |
| **GS-8** | Header airdrop: ♡ preferiti su sfondo **chiaro** col cuore visibile + **⤴ condividi** accanto, stessa grafica — coerenti con la card in vetrina. | §4.2 |
| **GS-10** | Pannello "Come arrivare 1°": blocco A (header + "Tuo punteggio") sempre visibile, blocco B (dettaglio scoring) collassato di default. Clic su A espande/richiude B. | §4.7 |
| **GS-12** | Banner **AUTO-BUY attivo** on-top, piena larghezza, visibile **solo** quando l'auto-buy è attivo. Il toggle di attivazione resta nella config in fondo. | §4.1 |
| **GS-15** | Riga **soglia di aggiudicabilità**: "⚠ Tra ~N blocchi venduti ad altri non potrai più aggiudicartelo", accoppiata sotto "~X blocchi per il 1°". | §4.5 |

Tutto ciò che oggi è in pagina (descrizione, specifiche, statistiche,
storico, config auto-buy, CTA "Hai un oggetto di valore?") **non si
rimuove** — si ricolloca sotto la piega, ordine §4.8.

## 3. GS-15 — note tecniche (l'unico item con un pezzo backend)

GS-15 ha due parti; te ne tocca **una sola**:

- **Parte 2 — soglia (CCP).** La riga §4.5 è guidata dalla funzione
  `fairness_threshold_remaining()` — quella che avevi già taggato come
  forward da GS-11 (stessa formula post-fix del fairness guard). Il
  numero è "blocchi residui prima che, per *questo* utente, vincere
  diventi matematicamente impossibile". Costruisci la funzione +
  la riga in pagina.
- **Parte 1 — claim "corsa in salita" (ROBY).** La narrativa/claim è
  un deliverable ROBY, te lo mando a parte. **Non ti blocca**: la
  microcopy della riga soglia è già nella mini-spec §4.5 ("⚠ Tra ~N
  blocchi…"), usala verbatim. Il claim ROBY è copy di contorno, si
  innesta dopo senza toccare la struttura.

Nota dalla mini-spec §4.5 da tenere presente: la riga distingue
**impossibilità matematica** ("~N blocchi e sei fuori") da
**fattibilità economica** ("ti servono ~144 blocchi = ~X ARIA, ne hai
Y"). Per questa passata: implementa la **soglia matematica**
(`fairness_threshold_remaining()`) — è il countdown onesto richiesto da
GS-15. La seconda riga economica è un raffinamento copy che valuto io
in verifica; **prevedi solo che ci sia spazio**, non implementarla ora
se non hai il dato pulito. Se la fai, flaggala; se no, niente "✅" su
quella sotto-riga.

## 4. Cadenza — cluster, non batch

Track B è un cluster: **una consegna coerente**, non 5 spezzoni e non
5 deploy. Questo **non viola** la cadenza un-item — la cadenza
nasceva contro il batch di item *scollegati* shippati saltando il
gate. Qui i 5 item sono zone della stessa pagina, progettati dalla
mini-spec per una passata sola: spezzarli sarebbe artificiale.

Come funziona:
1. CCP implementa il redesign completo della pagina su
   `/dapp/airdrop/:id` — tutte e 5 le zone.
2. CCP **traccia la catena** di ogni zona prima di consegnare. Vale
   identica la regola di GS-1 reopen-3: **niente "✅" accanto a una
   zona che non hai verificato**. Se una zona non l'hai potuta
   tracciare da Pi 5, scrivi "non verificato, da UI-click ROBY" — non
   un ✅ ottimista.
3. Consegna singola del cluster + cache-bust `?v=` + footer.
4. **Io verifico le 5 zone a UI-click una per una.** Sign-off solo se
   tutte e 5 verdi. Se una zona è rotta → **reopen di quella zona**,
   non dell'intero cluster: le altre 4 restano buone.

Quindi: una consegna, cinque verifiche, un sign-off (o reopen
mirati). Niente STOP+ASK necessari — la mini-spec non lascia ambiguità
di scope; se ne trovi una, fermati e chiedi.

## 5. Fuori scope

- Logica scoring/fairness: invariata (GS-11 già chiuso).
- Slogan, voce, brand: invariati.
- Il claim "corsa in salita" (copy ROBY) arriva a parte, non lo
  attendere.
- GS-16 (accredito ROBI del rullo) **non è Track B** — è verifica
  ROBY-side, la faccio io in parallelo.

## RS — paste-ready

```
RS · GO CLUSTER TRACK B — redesign pagina airdrop

Track A completo (9 firmati). Parte Track B: GS-8/9/10/12/15, i 5
item della pagina /dapp/airdrop/:id, in UNA passata coerente.

SPEC CANONICA: ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md
(in for-CCP/, LOCKED desktop+mobile). Seguila alla lettera — la
gerarchia è già decisa, §4 mappa ogni item zona per zona.

SCOPE:
- GS-9: la pagina si apre SUL dettaglio (togli la lista marketplace
  renderizzata sopra). 2 colonne: competitivo SX, immagine DX.
- GS-8: header ♡ preferiti sfondo chiaro + ⤴ condividi, coerenti
  con la card in vetrina.
- GS-10: "Come arrivare 1°" blocco A visibile / B collassato,
  clic su A espande-richiude.
- GS-12: banner AUTO-BUY attivo on-top, solo se attivo.
- GS-15 (parte 2): riga soglia "⚠ Tra ~N blocchi…" da
  fairness_threshold_remaining() (la funzione taggata da GS-11).
  Microcopy riga = mini-spec §4.5 verbatim.
Sotto la piega §4.8: descrizione/statistiche/storico/config
auto-buy/CTA valutazione — niente rimosso, solo ricollocato.

GS-15 parte 1 (claim "corsa in salita") = copy ROBY a parte, NON
ti blocca. Riga economica §4.5: prevedi lo spazio, implementala
solo se hai il dato pulito, altrimenti flagga "non fatta".

CADENZA CLUSTER: una consegna coerente (no 5 spezzoni). Traccia la
catena di OGNI zona — niente "✅" su zone non verificate (regola
GS-1 reopen-3). Cache-bust ?v= + footer. ROBY verifica le 5 zone a
UI-click una per una → sign-off, o reopen della singola zona rotta.

Fuori scope: scoring/fairness invariati, brand invariato, GS-16
(ROBY-side). Se trovi ambiguità di scope, STOP+ASK.
```

## Bottom line

Track B parte ora. Cornice = mini-spec GS-9, già locked. CCP fa il
redesign della pagina airdrop in una passata, traccia ogni zona,
consegna coerente. Io verifico le 5 zone a UI-click. Con Track B
firmato + GS-16 verificato, la golden-session è chiusa e AIROOBI va
live.

Audit-trail: questo file = GO cluster Track B · 5 item pagina airdrop
GS-8/9/10/12/15 in una passata · spec canonica mini-spec GS-9 LOCKED ·
GS-15 parte 2 (soglia, fairness_threshold_remaining) a CCP, parte 1
(claim corsa-in-salita) copy ROBY a seguire non bloccante · cadenza
di cluster: una consegna coerente, traccia ogni zona, niente ✅
implicito, ROBY verifica 5 zone a UI-click, reopen per-zona · GS-16
fuori Track B (ROBY-side).

---

*ROBY · Strategic MKT & Comms & Community · GO cluster Track B · 24 May 2026 · daje team a 4*
