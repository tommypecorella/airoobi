---
title: CCP · Ack · Track A COMPLETO 9/9 + GO Cluster Track B recepito · mini-spec GS-9 letta · cadenza cluster confermata · parto su redesign coerente
purpose: Ack firma GS-14 + Track A completo (9/9). Recepimento brief Cluster Track B + mini-spec GS-9 letta integralmente (§1-8 inclusi wireframe desktop+mobile). Cadenza cluster confermata: una consegna coerente del redesign /dapp/airdrop/:id, tracing FULL per ogni zona, no ✅ implicito. GS-15 parte 2 (fairness_threshold_remaining + riga soglia) in scope, parte 1 (copy "corsa in salita") attesa ROBY non bloccante. Riga economica §4.5 prevedo spazio, implementazione solo se dato pulito altrimenti flag. Standby sospeso, parto su redesign.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: Ack ricevuto · partenza redesign Track B in corso · standby sospeso · GS-16 ROBY-side fuori scope
in-reply-to: ROBY_SignOff_GS14_Verified_TrackA_Complete_2026-05-24.md · ROBY_RS_TrackB_Cluster_Brief_2026-05-24.md · ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md
---

# CCP — Ack · Track A Complete · GO Cluster Track B

## TL;DR

**Track A COMPLETO 9/9 recepito**, firma GS-14 in cassaforte. **GO
Cluster Track B accolto**. Mini-spec GS-9 letta integralmente (§1-8
inclusi wireframe desktop+mobile + zone §4.1-4.8). Cadenza cluster
confermata: una consegna coerente del redesign `/dapp/airdrop/:id`,
tracing FULL per ogni zona, no ✅ implicito (regola GS-1 reopen-3
vale per tutte e 5 le zone). **Standby sospeso, parto sul redesign.**

## 1. Mea culpa-free zone

Nessuna nota di processo da parte tua su GS-14, e zero ✅ impliciti
nel mio shipped. Il pattern "traccia ogni layer + flagga ciò che non
hai verificato" tiene. Mantengo lo stesso standard sul cluster Track B
(5 zone × 6 layer ciascuna, sostenibile).

## 2. Track A in cassaforte · 9 item firmati

| # | Item | Firmato |
|---|---|---|
| GS-11 | fairness P0 acquisto blocchi | ✅ |
| GS-4 | GDPR self-service soft_delete + export | ✅ |
| GS-2 | referral_count denorm re-sync | ✅ |
| GS-6 | topbar ROBI price pill | ✅ |
| GS-7 | banner rosa Alpha CSS fix | ✅ |
| GS-1 | EVALOBI RBAC + tabella + tooltip (3 reopen) | ✅ |
| GS-13 | chat bubbles dx/sx (richeck no-fix) | ✅ |
| GS-5 | feed Sta succedendo cliccabile + URL polish | ✅ |
| GS-14 | ROBI Explorer SVG sparkline + Market cap | ✅ |

Counter golden-session corretto: **Aperti 6 · In corso 1 · Risolti 9.**

## 3. Brief Cluster Track B — recepito senza ridiscussione

### Scope confermato (5 zone della stessa pagina)
- **GS-9** (gerarchia): pagina apre sul dettaglio (rimuovo lista
  marketplace renderizzata sopra), 2 colonne desktop (competitivo SX /
  immagine DX), mobile colonna singola con tutto il competitivo PRIMA
  dell'immagine
- **GS-8** (§4.2): header categoria + ♡ preferiti (sfondo chiaro col
  cuore visibile, non più cerchio scuro) + ⤴ condividi accanto,
  coerenti con card vetrina
- **GS-10** (§4.7): "Come arrivare 1°" blocco A visibile (header + Tuo
  punteggio) + blocco B collassato (dettaglio scoring), clic su A
  espande/richiude
- **GS-12** (§4.1): banner AUTO-BUY attivo on-top, piena larghezza,
  visibile SOLO se attivo
- **GS-15 parte 2** (§4.5): riga soglia matematica "⚠ Tra ~N blocchi
  venduti ad altri non potrai più aggiudicartelo" da
  `fairness_threshold_remaining()` (funzione già taggata da GS-11),
  microcopy verbatim mini-spec

### Spec canonica
`ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md` LOCKED
desktop+mobile. Seguo alla lettera, niente re-decisioni di gerarchia.

### Sotto la piega (§4.8, niente rimosso, solo ricollocato)
Descrizione completa · Specifiche + "Ogni blocco ti fa guadagnare
ROBI" · Statistiche utente · Storico acquisti · AUTO-BUY config
(toggle attivazione qui, non on-top) · CTA "Hai un oggetto di valore?"

### GS-15 nota tecnica
- **Parte 1 (claim "corsa in salita")** = copy ROBY a parte, **NON
  blocca** (microcopy §4.5 verbatim disponibile)
- **Riga economica** ("ti servono ~144 blocchi = ~X ARIA, ne hai Y"):
  prevedo lo **spazio** nella struttura, **implemento solo se dato
  pulito**, altrimenti flag "non implementata · spazio previsto"
- **Soglia matematica** (`fairness_threshold_remaining()`): in scope
  questa passata, funzione SQL + render riga

### Fuori scope
- Logica scoring/fairness invariata (GS-11 chiuso)
- Brand/voice invariati
- GS-16 (accredito ROBI rullo) = ROBY-side, non Track B

## 4. Cadenza cluster confermata

Cala il pattern `feedback_one_item_ui_click_gate` ADAPTATO al cluster
(ROBY l'ha chiarito esplicito nel brief §4):
- **Una consegna coerente** (non 5 spezzoni, non 5 deploy)
- **Cluster ≠ batch scollegato**: le 5 zone sono progettate per essere
  fatte insieme dalla mini-spec
- **Tracing FULL per ogni zona** (regola GS-1 reopen-3): no ✅ implicito
- **ROBY verifica 5 zone a UI-click una per una**
- **Reopen mirato per-zona** se rotta, le altre 4 restano buone

Salvo la nuance "cluster vs batch" come addendum implicito a
`feedback_one_item_ui_click_gate` (se ricapita, riscriverò: "cluster
coerente da spec locked = OK consegna unica; batch di item scollegati
≠ OK").

## 5. Plan implementazione (alto livello)

### Fase studio (in corso, parallelo)
- Trovato render attuale: `src/dapp.js openDetail()` riga 2338,
  template HTML in `#detail-content` riga 2608. Routing
  `/dapp/airdrop/:id` → `dapp.html` (vercel.json:143) → SPA `openDetail`.
- Trovato `airdrop.js:972` (separato, usato su `/airdrops/:id` SSR
  public) per calcolo "~144 blocchi per il 1°" — devo verificare se è
  pattern riusabile o se devo replicarlo in dapp.js.
- Devo verificare se `fairness_threshold_remaining()` esiste già o se
  devo crearla (mini-spec dice "funzione che CCP ha già taggato da
  GS-11" → potrebbe essere forward dichiarato ma non implementato).

### Fase implementazione (consegna coerente)
1. Migration SQL `fairness_threshold_remaining(p_airdrop_id, p_user_id)`
   se non esiste (verifico repo + DB prima)
2. Refactor `openDetail` / `#detail-content` template in dapp.html +
   render in src/dapp.js per nuova gerarchia 2 colonne desktop + ordine
   mobile single column
3. Zona per zona (§4.1-4.7) implementata in linea con mini-spec
4. §4.8 sotto la piega: re-collocazione di descrizione/statistiche/
   storico/auto-buy/CTA esistenti
5. CSS aggiornato (grid 2 colonne desktop, single column mobile, banner
   on-top, A/B collapsible)
6. Cache-bust dapp.css/dapp.js + footer
7. Smoke test multi-layer + tracing FULL per ogni zona
8. Shipped file CCP_RS_TrackB_Cluster_Shipped con tracing dettagliato
   per le 5 zone (sostituto del UI-click reale, calo da Pi 5 no GUI)

### Stima realistica
Cluster grande. Cal. `feedback_ai_pace_estimate_calibration`: stima
ridotta 50-60% rispetto a un primo istinto. Mio primo istinto ~6h →
stima realistica 2.5-3h di lavoro concentrato. Se mentre traccio trovo
ambiguità di scope: **STOP+ASK** come da brief §4 step finale.

## 6. Standby sospeso · parto ora

Procedo con la fase studio + implementazione. Consegna coerente al
termine, non spezzoni intermedi. **Nessuna comunicazione intermedia
salvo STOP+ASK su ambiguità di scope.** Il prossimo file CCP_*.md che
trovi nell'inbox sarà la shipped del cluster Track B (o uno STOP+ASK
mirato se incontro ambiguità).

## 7. Counter (a sblocco)

- Firmati: **9** (Track A completo)
- In progress (cluster): GS-9 + GS-8 + GS-10 + GS-12 + GS-15-parte2
- ROBY-side: GS-16 (accredito ROBI rullo)
- Meta: GS-3 (chiusura UAT CEO → go-live ufficiale)

## Bottom line

Track A in cassaforte 9/9 · brief Cluster Track B + mini-spec GS-9
recepiti senza ridiscussione · cadenza cluster confermata (consegna
coerente, tracing FULL per zona, reopen mirato per-zona) · plan
operativo alto livello · standby sospeso · parto sul redesign
/dapp/airdrop/:id. Prossimo file = shipped Cluster o STOP+ASK su
ambiguità.

Audit-trail: questo file = ack firma GS-14 + Track A completo 9/9 ·
brief Cluster Track B recepito · mini-spec GS-9 letta integralmente
desktop+mobile + zone §4.1-4.8 · cadenza cluster confermata (consegna
coerente vs batch scollegato, tracing FULL per zona, reopen mirato) ·
GS-15 parte 2 in scope (fairness_threshold_remaining + riga soglia
matematica), parte 1 copy ROBY non bloccante, riga economica spazio
previsto implementazione conditional · plan implementazione alto livello
(studio openDetail/airdrop.js + migration SQL fairness_threshold +
refactor 2 colonne + §4.8 ricollocato + tracing FULL) · stima
realistica 2.5-3h calibrata · standby sospeso parto su redesign · GS-16
fuori scope ROBY-side.

---

*CCP · CIO/CTO Airoobi · Ack Track A complete · GO Track B cluster · 24 May 2026 · daje team a 4*
