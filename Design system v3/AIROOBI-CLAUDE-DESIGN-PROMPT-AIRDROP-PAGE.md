# PAGINA AIRDROP — prompt per Claude Design (redesign del dettaglio, mobile-first)

> **Header operativo (non fa parte del prompt).**
> Origine: Skeezu, 19 lug 2026 — «Non mi piace la pagina del singolo airdrop, la trovo ancora troppo
> confusionaria». Una v1 a tab è già LIVE (18 lug, commit 2c547aa): barra fissa in basso
> Salita/Info/Impostazioni + header sticky categoria+codice + striscia I TUOI NUMERI. Ha spezzato il
> carico ma NON risolto la radice: troppi box, informazioni duplicate, gerarchia che non guida.
> Estende il prompt madre `AIROOBI-CLAUDE-DESIGN-PROMPT.md` (§leggi brand, §palette-lock, §tipografia,
> §token v3: TUTTO vincolante) e il prompt `AIROOBI-CLAUDE-DESIGN-PROMPT-LASALITA.md` (il componente
> Salita esiste già ed è il cuore della pagina: NON va riprogettato, va messo in scena).
> Implementazione: `src/dapp.js` → `openDetail()` (vanilla JS, un builder HTML unico); la consegna
> sarà applicata come ristrutturazione di markup+CSS mantenendo ID e funzioni.

=== INIZIO PROMPT ===

Sei un senior product designer. Devi ridisegnare la **pagina del singolo airdrop** di AIROOBI (marketplace di airdrop equi, ecommerce-first): è la pagina più importante del prodotto — dove si guarda la corsa, si decide, si fa uno Step — e oggi è **confusionaria**: troppi box impilati, dati ripetuti fino a 4 volte, nessuna gerarchia che dica all'occhio dove andare. Obiettivo: **una pagina che si legge in 3 secondi e si usa con un pollice**.

## 1 · Il concetto (non cambia)
L'airdrop è **una corsa in salita**: più Step percorri (spendendo ARIA), più sali; in vetta c'è l'oggetto (foto reale); lungo il percorso raccogli fiori ROBI. Il componente **LA SALITA** esiste già (vedi prompt dedicato) ed è il protagonista. La pagina deve rispondere, in quest'ordine, a tre domande:
1. **Come sto andando io?** → ARIA spesi · Step percorsi · ROBI in arrivo · posizione
2. **Come va la corsa?** → Salita, distacchi, tempo rimasto, soglia
3. **Cosa faccio ora?** → fare Step (azione primaria), difendere la posizione, automatizzare

Tutto il resto (scheda prodotto, iter, impostazioni) è di supporto e non deve rubare scena.

## 2 · Leggi inviolabili (dal prompt madre)
- **ANTI-GAMBLING anche estetico**: mai slot/jackpot/coriandoli/countdown ansiogeni da casinò. Metafora SPORT (ciclismo/alpinismo): fatica, distacchi, strategia.
- Lessico: Step, vetta, raccolta, percorso, aggiudicazione, «1ª posizione». VIETATI: blocchi, mining, vinci/vincitore, fortuna, estrazione, puntata.
- **ZERO ORO**. Token v3 (lock, già in prod in `src/theme-v3.css`): primary rosso #EF3E4F · ardesia #33404F · bluette #2F6BFF · ARIA #4A9EFF · KAS #49EACB · **light + dark completi**.
- Font: Space Grotesk (display) · Inter (body) · JetBrains Mono (numeri, `tabular-nums`).
- MiCA: mai promesse su prezzo/rendimento ROBI; i ROBI si «raccolgono/guadagnano», mai «rendita».

## 3 · Lo stato attuale — censimento REALE dei blocchi (la materia da riordinare)
La v1 a tab (LIVE) divide così. Nomi = classi reali nel codice:

**Sempre visibili (ogni tab):**
- `detail-autobuy-banner` — banner «auto-step attivo · gestisci» (se attivo)
- `detail-header-v2` — sticky: categoria + #codice (una riga, nowrap) + ♡ preferito + condividi
- `detail-mystrip` — striscia I TUOI NUMERI: ARIA spesi · Step percorsi · ROBI in arrivo
- `detail-title-v2` — titolo oggetto

**Tab SALITA (default):**
- `detail-phase-row` — chip fase (PRESALE/ATTIVO/…) + countdown scadenza
- `detail-position` — box posizione live («Sei 3° · a N Step dal 1°»)
- `detail-hint-soglia` — hint «~X Step per la 1ª posizione» + avviso soglia
- `detail-strategy` — collapsible «Come arrivare 1°» (guida A/B)
- `detail-race-col` — **LA SALITA** + **buy box** (slider 1..max, preset 5/10/25/50/Max, bottone AVANZA, saldo) + hook fiori ROBI

**Tab INFO:**
- `phase-stepper` — iter completo (valutazione → presale → sale → chiusura)
- `detail-gallery` — galleria foto con autoplay
- `product-info-v2` — brand, prezzo/Step, lunghezza percorso, descrizione, highlights, contenuto confezione
- accordion «Dettagli airdrop» — prezzo, percorso, Step alla vetta, tasso raccolta ROBI, scadenza
- `detail-myblocks` — badge «I tuoi Step: N · N ARIA impiegati»
- `detail-stats` — 3 mini-stat: Step alla vetta · ARIA/Step · Step per ROBI

**Tab IMPOSTAZIONI:**
- `auto-buy-box` — **MANTIENI IL PASSO**: Step automatici (quanti / ogni quanto / max)
- `detail-mystats` — «Le tue statistiche»: ROBI che guadagni, % Step tuoi, presale/sale, storico
- `extend box` — estensioni corsa (solo venditore, max 5)

**I problemi da risolvere (diagnosi, non suggerimento di layout):**
1. **Ridondanza**: i numeri personali vivono in 4 posti (mystrip, myblocks, detail-stats, mystats); il prezzo/Step in 3; la scadenza in 2. Consolidare: ogni dato UNA casa.
2. **Sfilza di box fotocopia**: position, hint-soglia, strategy, phase-row sono 4 scatole grigie una sopra l'altra prima ancora della Salita — l'occhio non sa quale conta. Vanno fusi/gerarchizzati (es. un solo «HUD di corsa»?).
3. **L'azione primaria non domina**: il buy box è sotto la Salita, visivamente pari agli altri box. Fare uno Step deve essere l'azione ovvia, sempre raggiungibile (sticky CTA? parte della tab bar?). Decidi tu il pattern, ma UNA azione primaria per schermo.
4. **La scheda prodotto è un muro di testo** senza ritmo (brand, prezzo, desc, liste).

## 4 · Vincoli di struttura
- **Mobile-first 390px** è lo scenario primario. La **tab bar fissa in basso (Salita / Info / Impostazioni) resta**: è già live e piace — puoi rinominare/re-iconare i tab e ridistribuire i blocchi, non eliminarla.
- Restano anche: header sticky categoria+#codice+♡/condividi (mai a capo) e la striscia I TUOI NUMERI sempre in cima. Puoi ridisegnarli, non rimuoverli.
- **LA SALITA non si riprogetta** (ha il suo prompt): definisci solo quanto spazio le dai e cosa le sta intorno.
- Desktop ≥1280px: layout a colonne senza tab bar (oggi: competitivo a SX, Salita+buy a DX) — ridisegnalo pure, ma la pagina resta unica (no tab su desktop).
- Implementazione = ristrutturazione markup+CSS su builder vanilla JS esistente: componenti riordinabili/fondibili, ma niente framework, niente pattern che richiedano librerie.

## 5 · Stati della pagina (tutti da progettare)
1. **Corsa attiva (sale)** — lo stato principale: utente con Step, utente senza Step (mystrip a zero = invito).
2. **Presale** — chip dedicato + messaggio «raccolta ROBI 2x» (senza toni da promo-casinò).
3. **Proposta in valutazione** — corsa non partita: Salita in quiete, messaggio d'attesa, niente buy.
4. **Corsa conclusa** — pannello esito (oggetto assegnato / i tuoi ROBI), niente azioni di corsa; per chi era in vetta e per chi no.
5. **Visitatore non loggato** (pagina pubblica) — CTA registrati/accedi al posto del buy.
6. **Venditore che guarda il proprio airdrop** — vede la corsa ma non partecipa; ha le estensioni.

## 6 · Output attesi
1. **Mockup mobile 390px** dei 3 tab nello stato «corsa attiva con Step» — light + dark.
2. Mockup mobile degli altri stati chiave: presale, in valutazione, conclusa (vetta/non vetta), non loggato.
3. **Mockup desktop 1280px** dello stato principale.
4. **Mappa di consolidamento**: per ognuno dei 14 blocchi del censimento §3, dove finisce (tenuto/fuso/eliminato) e perché — questa è la parte che risolve la confusione.
5. Gerarchia tipografica e spaziatura (quanti livelli di box, radius, bordi — oggi troppi pari-grado).
6. Micro-copy a canone per le etichette nuove (IT prima, EN dopo).

=== FINE PROMPT ===

— CCP · 19 lug 2026 · Base live: `src/dapp.js` → `openDetail()` (v4.68.0) + `src/dapp.css` (v4.59.0, sezione «Dettaglio airdrop MOBILE a tab») · Salita: `renderSalita()` · Prompt collegati: madre + LASALITA + ABO in questa cartella
