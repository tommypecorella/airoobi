# ABO — prompt per Claude Design (restyle Dashboard & Gestionale, mobile-first, light/dark)

> **Header operativo (non fa parte del prompt).**
> Origine: richiesta Skeezu, 18 lug 2026 — «Adesso rendiamo uno strumento professionale, mobile first.
> Deve essere uno strumento di tipo Dashboard e Gestionale. light/dark mode ovviamente».
> Base tecnica: ABO è LIVE su airoobi.app/abo/*.html (motore unico `abo.html`, vanilla JS, ~4.850 righe).
> Il restyle deve essere **skin, non riscrittura**: nuovo layer token + CSS componenti + ritocchi markup;
> ID, funzioni JS e flussi restano intoccati. Estende il prompt madre `AIROOBI-CLAUDE-DESIGN-PROMPT.md`
> (§leggi brand, §palette-lock, §tipografia, §token: vincolanti anche qui).
> Stato attuale da superare: ABO oggi è dark-only con accent viola #8B5CF6 e font Cormorant Garamond —
> eredità pre-v3, fuori brand.

=== INIZIO PROMPT ===

Sei un senior product designer specializzato in **admin dashboard e gestionali B2B** (riferimenti di qualità: Linear, Stripe Dashboard, Supabase Studio, Vercel Dashboard). Devi ridisegnare **ABO — AIROOBI Back Office**, l'area di comando di AIROOBI (marketplace di airdrop equi, ecommerce-first). Obiettivo: da "pannello admin artigianale" a **strumento professionale, mobile-first, tipo Dashboard + Gestionale, con light/dark mode**.

## 1 · Contesto e utenti

AIROOBI: chi ha un oggetto non lo vende, lo "airdroppa"; gli utenti partecipano con ARIA (testnet) e guadagnano ROBI Reward; l'airdrop è **una corsa in salita verso la vetta** (metafora sport, mai azzardo). ABO è il cruscotto con cui il team gestisce tutto: pipeline airdrop, valutazioni EVALOBI, utenti, treasury, permessi, ticket.

**Chi lo usa:**
- **CEO/founder** — uso quotidiano intenso, spesso **da smartphone** (390px è lo scenario primario, non l'eccezione).
- **Collaboratori con permessi RBAC** — vedono solo i moduli concessi dal loro ruolo (la sidebar si accorcia da sola); esiste un simulatore "Vedi come" per provare la vista di un ruolo.

Sessioni tipiche: check mattutino ("DA FARE OGGI"), gestione di una valutazione in arrivo, chiusura di un airdrop, risposta a un ticket, controllo tesoreria. Densità informativa da gestionale: **tante tabelle, tanti numeri, poche chiacchiere**.

## 2 · Leggi inviolabili (dal prompt madre)

- **ANTI-GAMBLING anche estetico**: MAI slot/rulli/ruote/dadi/jackpot/coriandoli/monete che piovono. Lessico UI: Step, raccolta, vetta, aggiudicazione, ingressi. VIETATI: blocco, mining, streak, vinci/vincitore, fortuna, estrazione.
- **MiCA**: mai UI che suggerisca prezzo/rendimento/apprezzamento di ROBI. Il nominale ROBI in ABO è un dato gestionale interno, non un "prezzo di mercato": niente candele, niente frecce verdi "su del X%" in stile trading.
- **ZERO ORO** (l'attuale viola #8B5CF6 va eliminato insieme all'oro storico).
- **Palette v3 (lock)** — usare i token già in produzione in `src/theme-v3.css`:
  - Light: bg #FFFFFF / #F5F7FA · surface #FFFFFF/#F5F7FA/#E9EDF2 · text #161D26 / #455364 / #5B6A7D · border #D4DBE3 · **primary #EF3E4F** (hover #D91F32) · secondary ardesia #33404F · accent/link bluette #2F6BFF / #1E54E6 · success #0E8A44 · warning #E5820B · error #D91F32 · info #1E54E6 (tutti con varianti -subtle e -text).
  - Dark: bg #0F1216 / #12161B · surface #171B21/#1E242C/#262E38 · text #E8EAED / #AEB9C6 / #7E8B9C · border #2A313A · primary #FF5563 · accent #6284FF · success #2FBE6E · warning #F5A524 · error #FF5563.
  - Colori entità: ARIA #4A9EFF · KAS #49EACB · ROBI = primary.
- **Tipografia v3**: **Space Grotesk** (display/titoli) · **Inter** (body/UI) · **JetBrains Mono** (numeri, codici, tabelle dati — usare `font-variant-numeric: tabular-nums` ovunque ci siano colonne numeriche). Via il Cormorant Garamond.
- **Simbolo ROBI** = il monogramma AIROOBI «OO», mai ♦ né emoji. Icone: flat SVG stroke `currentColor`, mai emoji colorate.

## 3 · Vincoli architetturali (non negoziabili)

- ABO è **un solo file** (`abo.html`) servito su 15 URL tramite rewrite `/abo/:page → /abo.html`; la navigazione fra sezioni è `pushState` + show/hide, **niente SPA framework, niente build step**: vanilla HTML/CSS/JS.
- **Il restyle è un layer**: nuovi token CSS + restyling dei componenti esistenti + eventuali micro-ritocchi di markup. **Vietato** rinominare/eliminare ID, classi agganciate dal JS, funzioni, flussi. Il design deve essere consegnato come sistema riapplicabile alle classi correnti.
- Componenti esistenti da rivestire (nomi reali): `admin-sidebar` (+`admin-sidebar-label`, `admin-sidebar-item`, toggle `#sb-toggle` che collassa a 0px), `admin-nav` (topbar), `admin-section` (+h2), `admin-card`, `admin-grid`, `admin-table` e `adm-tbl` (tabelle dati), `ct-modal` (modali gestione), `bo-tabs`, `tag` (badge stato), `ab-btn` (bottoni), `abo-todo-item` (chips DA FARE OGGI), `admin-note`, form `abo-login-box`.
- Stato persistito già esistente: sidebar collassata (`localStorage abo_sb_collapsed`). Il toggle light/dark dovrà persistere allo stesso modo (chiave `localStorage`, `data-theme` sul root, default = `prefers-color-scheme`).
- Performance: niente librerie esterne, niente immagini decorative pesanti; il file viaggia no-cache.

## 4 · Inventario completo — 15 pagine (slug reali)

Per OGNI pagina serve il layout mobile (390px) e desktop (≥1280px):

1. **/abo/dashboard.html** — Overview: riga di KPI card (utenti, airdrop attivi, valutazioni in corso, segnalazioni aperte, ROBI circolanti), striscia **DA FARE OGGI** (chips cliccabili con contatori: valutazioni da gestire, ticket aperti, decisioni pendenti), attività recente. È la pagina d'atterraggio: deve rispondere in 3 secondi a "cosa devo fare oggi?".
2. **/abo/pipeline-airdrop.html** — Pipeline airdrop per stato (draft → valutazione → accettazione → attivo → in chiusura → completed): tabella/board con righe tappabili che aprono la **modale di gestione** (dati oggetto, foto, calcolatore prezzi/blocchi, azioni di transizione stato, decisione venditore). La modale è il cuore operativo: su mobile oggi è a 2 colonne strette — va ripensata come sheet full-screen a sezioni.
3. **/abo/evalobi-registry.html** — Registro certificati EVALOBI: 4 KPI (totale / GO / NO-GO / in review), tabella 10 colonne (codice certificato EVA-XXXXXX linkato, codice airdrop, oggetto, range €, esito, date…), filtro esito, CTA «+ Emetti da airdrop».
4. **/abo/analisi-fairness.html** — Analisi & Fairness: metriche di equità del motore (distribuzioni, pity/boost di garanzia), grafici semplici.
5. **/abo/messaggi.html** — Messaggi/notifiche di piattaforma inviate agli utenti.
6. **/abo/segnalazioni.html** — **Ticket management** (easy service desk): filtro stato (open / in_review / resolved / rejected), tabella ticket (utente, pagina di provenienza, testo, data, stato), azioni per riga PRENDI / RISOLVI+premio ROBI (0-100) / RESPINGI. Serve un pattern chiaro di stato+azione, anche da telefono.
7. **/abo/utenti.html** — Tabella utenti (email, ARIA, ROBI, ingressi settimanali, referral) + pannello **Distribuzione ROBI per fonte** (welcome, valutazioni, vetta, segnalazioni…). Le tabelle larghe qui sono il caso peggiore per mobile: progettare il pattern riga→card espandibile.
8. **/abo/treasury-fondi.html** — Fondi treasury (importo €, % a copertura, flag TEAM «Dal team AIROOBI», card riepilogo €team/€totale), movimenti, e blocco **Service Balance (AIROOBI)**: registro movimenti ± con giroconto «GIRA AL TREASURY».
9. **/abo/conto-aria-piattaforma.html** — Conto ARIA della piattaforma: saldo, movimenti.
10. **/abo/patrimonio-aziendale.html** — Patrimonio: righe asset manuali + **righe virtuali AUTO** (ROBI conto CEO × nominale, ARIA CEO) marcate come calcolate/non editabili; nota fissa: il treasury è custodito, non posseduto.
11. **/abo/aria-robi.html** — Parametri monetari: nominale ROBI (formula unica treasury/shares), ratio ARIA-per-ROBI, snapshot storici. Presentazione da "pannello parametri", non da exchange.
12. **/abo/collaboratori-permessi.html** — RBAC: elenco collaboratori con ruolo, **matrice permessi** (15 moduli × azioni view/edit/approve/draw/reply/manage) con override per utente, simulatore «Vedi come». La matrice è il componente più denso di tutto ABO: su mobile va risolta (es. selezione modulo → lista azioni), non semplicemente compressa.
13. **/abo/categorie.html** — Categorie oggetti (V_cat, parametri).
14. **/abo/engine-config.html** — Config del motore (chiavi/valori, interruttori tipo `alpha_brave_rules_active`): pattern "settings" con conferme sui toggle pericolosi.
15. **/abo/cost-tracker.html** — Cost tracker: registro costi con modale di inserimento (oggi grid 3 colonne → 2 su mobile).

**Elementi trasversali:** topbar (logo/ambiente + avatar + logout), sidebar a 3 aree (OPERATIONS / TESORERIA / SISTEMA) collassabile via `#sb-toggle` (≤768px oggi è nascosta: serve il pattern mobile — bottom nav? drawer? proponi), login gate minimale, toast/feedback azioni, stato "salvataggio…" sulle azioni async.

## 5 · Requisiti di design

1. **Mobile-first 390px.** Ogni tabella deve avere una strategia dichiarata: (a) riga→card con campi prioritari + expand, oppure (b) scroll orizzontale con prima colonna sticky e azioni sempre raggiungibili. Mai azioni tagliate fuori dallo schermo. Hit-target ≥44px. Righe tappabili con affordance visibile.
2. **Light + dark completi**, dagli stessi token v3, con toggle in topbar persistito. Il dark non è un filtro invert: superfici e bordi dedicati (valori in §2). Default: sistema.
3. **Gerarchia da gestionale**: KPI card sobrie (numero grande JetBrains Mono + label + delta discreto), titoli Space Grotesk, zero decorazione gratuita. Il primario rosso #EF3E4F si usa **con parsimonia**: CTA principali, stati critici, brand mark — non come tappezzeria.
4. **Sistema di stato unificato** (i `tag`): un solo linguaggio per tutti gli stati dell'app (pipeline airdrop, ticket, esiti EVALOBI, ruoli) — colore semantico + label, mai colore da solo.
5. **Densità regolabile implicita**: desktop compatto (righe ~40px), mobile arioso. Numeri sempre tabular-nums allineati a destra; codici (EVA-XXXXXX, #airdrop) in mono con copy-on-tap.
6. **Empty state e loading** disegnati per ogni pagina (oggi: "Caricamento…" nudo). Skeleton leggeri, empty con azione suggerita.
7. **Modali**: desktop = dialog centrato max ~640px; mobile = bottom-sheet/full-screen con header sticky (titolo + chiudi) e footer sticky con le azioni. La modale gestione airdrop (la più complessa) merita un layout a sezioni collassabili.
8. **Accessibilità**: contrasto AA su entrambi i temi, focus ring 2px visibile (#2F6BFF light / #6284FF dark), `prefers-reduced-motion` rispettato, aria-label su azioni icona.
9. **Motion**: micro-transizioni 120-200ms `cubic-bezier(0.2,0,0,1)` (token v3 esistenti), niente animazioni scenografiche: è uno strumento di lavoro.

## 6 · Output attesi

1. **Token sheet ABO**: mappa completa dei token (riuso v3 + eventuali token specifici admin, es. superfici tabella, riga hover, sticky header) per light e dark.
2. **Component sheet** riapplicabile alle classi reali (§3): sidebar (desktop espansa/collassata + pattern mobile), topbar con theme toggle, KPI card, tabella dati (desktop + entrambe le strategie mobile), tag di stato, bottoni (primario/secondario/ghost/distruttivo), modale/bottom-sheet, chips DA FARE OGGI, toast, empty/skeleton, form fields.
3. **Mockup completi light + dark, mobile 390px + desktop 1280px** per le 4 pagine chiave: **dashboard**, **pipeline-airdrop** (inclusa modale gestione), **segnalazioni**, **collaboratori-permessi** (inclusa matrice mobile).
4. Wireframe/indicazioni per le altre 11 pagine (bastano i pattern applicati).
5. **Motion-spec** sintetica (transizioni sezione, apertura sheet, toast, collasso sidebar).
6. Nota di **migrazione CSS**: ordine consigliato di sostituzione dei token attuali (`--gold`→primary, `--black/--white`→surface/text, font swap) per applicare la skin senza toccare il JS.

=== FINE PROMPT ===

— CCP · 18 lug 2026 · Base live: `abo.html` (alfa-18.07.2026-1.8.0) · Token brand: `src/theme-v3.css` · Prompt madre: `AIROOBI-CLAUDE-DESIGN-PROMPT.md` · Loghi/spec: `files/canale-digithon/DESIGN SYSTEM/`
