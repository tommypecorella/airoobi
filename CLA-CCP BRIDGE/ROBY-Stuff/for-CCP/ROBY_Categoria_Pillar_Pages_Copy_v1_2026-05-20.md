---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (CIO/CTO · Pi 5)
cc: Skeezu (Founder)
subject: 📝 6 Categoria Pillar Pages Copy v1 · brand-coherent 300-500 parole ognuna · CCP wires HTML pages /categoria/:slug quando ready post-FASE-A
date: 2026-05-20 W3 Day 5 Mer sera (ROBY async FASE B prep)
output-target-CCP: 06_public_assets/copy/categorie/{slug}.md · 6 files separated when CCP estrae · plus /api/categoria-ssr.js wires content
audience: SSR public pages indexable Google · pillar+spoke SEO pattern · category-cluster authority
brand-voice: Italian Editorial Manifesto v2 · brand pollution viral layer extension · Voice Principle 04 STRICT (NO gambling/maratona/race/agonismo/runner/champion vocab)
status: v1 DRAFT · ready CCP wire post-FASE-A-go-live Ven 22/05
---

# 📝 6 Categoria Pillar Pages Copy v1

## Strategic context

6 categoria pillar pages target SEO long-tail Italian e-commerce queries:
- `/categoria/elettronica` · "elettronica usata · refurb · smartphone airdrop · iPhone"
- `/categoria/luxury` · "watches luxury · Rolex · Audemars · Patek airdrop"
- `/categoria/moto` · "moto usate · scooter · accessori moto airdrop"
- `/categoria/gioielli` · "gioielli oro · diamanti · pietre preziose airdrop"
- `/categoria/vintage` · "vintage anni '70-80-90 · collezione · usato premium airdrop"
- `/categoria/arte-collezione` · "arte contemporanea · collezione · stampe · sculture airdrop"

Pillar+spoke pattern · ogni pagina hub linka:
- Top: airdrop attivi della categoria (live data via `get_airdrops_by_category(slug)` RPC · CCP wires)
- Middle: blog post tag-matched (filtered by categoria tag)
- Bottom: winner stories archive della categoria (filter `/storie-vincitori/cat/{slug}` · clean URL Day 12 ready)

300-500 parole brand-coherent · Italian Editorial Manifesto v2 · authority signal SEO depth.

---

## CATEGORIA 1 · ELETTRONICA

### Slug: `elettronica`

### Hero title (H1)
"Elettronica · partecipa per ottenerla"

### Subtitle / lede paragraph
Smartphone, tablet, laptop, gaming console, audio premium, smartwatch, cuffie. L'elettronica di valore non si vende e si compra solo · su AIROOBI si partecipa per ottenerla, un blocco alla volta.

### Body copy (~400 parole)

L'elettronica di valore è il regno della velocità. Modelli che escono ogni sei mesi, prezzi che cambiano ogni settimana, oggetti che valgono molto più del loro listino quando sono nuovi e molto meno quando finiscono in un cassetto.

AIROOBI è la piattaforma italiana dove l'elettronica trova una seconda vita più equa.

**Per chi vende:** se hai uno smartphone, un tablet, una console, delle cuffie premium che non usi più · l'attesa su eBay o Subito può durare settimane o mesi. Su AIROOBI il tuo oggetto viene valutato, riceve un certificato EVALOBI permanente blockchain-based, e diventa protagonista di un evento di partecipazione che si chiude entro 7-14 giorni. Liquidi velocemente, mantieni il valore, e il certificato AIROOBI resta associato all'oggetto anche se decidi di venderlo altrove.

**Per chi partecipa:** ottieni uno smartphone iPhone 15 Pro a una frazione del prezzo, compri blocchi di partecipazione da €1.50 ciascuno, e la matematica decide il vincitore in modo deterministico e trasparente. Non è una lotteria · è skill-based commerce. Più partecipi alla categoria elettronica, più cresce il tuo bonus pity, più vinci probabilmente al prossimo evento.

**Quality criteria per categoria elettronica:**
- Brand identificabile (Apple · Samsung · Sony · Microsoft · Nintendo · Sennheiser · Bose · ecc.)
- Modello e anno verificabili
- Condizione minima "usato eccellente" (no graffi importanti · funzionalità 100%)
- Documentazione provenance se disponibile (scontrino · scatola · accessori originali)

Durata standard eventi elettronica: 7-10 giorni.

Valore floor: €500 EUR.

### Pillar+spoke links
- "Airdrop elettronica attivi adesso" (live grid via RPC `get_airdrops_by_category('elettronica')`)
- Blog tag `elettronica` · "Come ottenere uno smartphone refurb con AIROOBI" · "Airdrop iPhone come funziona" · "Smartwatch Apple e Samsung · airdrop e fairness"
- "Storie vincitori elettronica" (`/storie-vincitori/cat/elettronica`)

### CTA
"Vendi la tua elettronica con AIROOBI" → `/vendi` form proposta valutazione
"Partecipa al prossimo airdrop elettronica" → `/airdrops?category=elettronica`

---

## CATEGORIA 2 · LUXURY

### Slug: `luxury`

### Hero title (H1)
"Luxury · valore reale, evento equo"

### Subtitle / lede paragraph
Orologi Rolex, Audemars Piguet, Patek Philippe. Borse Hermès, Chanel, Louis Vuitton. Penne stilografiche premium. Accessori designer riconoscibili. Su AIROOBI il luxury trova partecipazione skill-based, certificazione permanente, e seconda vita organizzata.

### Body copy (~450 parole)

Il luxury vale per autenticità, provenance, e mercato secondario attivo. Non per fortuna. Non per gambling. AIROOBI è la piattaforma italiana dove il luxury si vende e si ottiene attraverso eventi di partecipazione deterministici e trasparenti.

**Per chi vende:** un Rolex Submariner, una borsa Hermès Birkin, una penna Montblanc · sono oggetti che richiedono mesi di trattative su mercati tradizionali. Acquirenti che chiedono certificazioni, gemmologi che verificano pietre, autenticatori che validano provenance. Su AIROOBI il tuo oggetto viene professionalmente valutato dal nostro team, riceve un certificato EVALOBI permanente blockchain-based con price range suggested, e diventa protagonista di un evento dove decine di partecipanti competono trasparentemente per ottenerlo. Liquidazione in 14 giorni invece di 6 mesi. Il certificato AIROOBI accompagna l'oggetto per tutta la sua vita futura, anche post-vendita.

**Per chi partecipa:** ottieni un orologio di valore €5.000-15.000 comprando blocchi di partecipazione da €1.50 ciascuno. La matematica del nostro algoritmo scoring v5 + pity decide il vincitore in modo deterministico · partecipanti vedono in tempo reale quanti blocchi servono per superare il leader corrente o per fare scacco matto · trasparenza totale, zero ambiguità.

**Quality criteria per categoria luxury:**
- Brand riconosciuto internazionalmente (Rolex · Patek Philippe · Audemars Piguet · Hermès · Chanel · Louis Vuitton · ecc.)
- Modello e referenza identificabili
- Condizione "nuovo" o "come nuovo" (no usura visibile)
- Documentazione obbligatoria: scontrino originale · garanzia · scatola · libretti · certificazioni gemmologiche se applicabile

Durata standard eventi luxury: 14 giorni (categoria premium · audience più selezionata · partecipanti motivati).

Valore floor: €1.500 EUR (sopra il floor standard AIROOBI · categoria premium-only).

### Pillar+spoke links
- "Airdrop luxury attivi adesso" (live grid)
- Blog tag `luxury` · "Vendere il tuo Rolex con AIROOBI · perché funziona" · "Borse Hermès e Chanel · airdrop equi" · "Orologi vintage · valore vs investment"
- "Storie vincitori luxury" (`/storie-vincitori/cat/luxury`)

### CTA
"Vendi il tuo oggetto luxury su AIROOBI" → `/vendi` form proposta valutazione premium
"Partecipa al prossimo airdrop luxury" → `/airdrops?category=luxury`

---

## CATEGORIA 3 · MOTO

### Slug: `moto`

### Hero title (H1)
"Moto · ottieni la tua libertà su due ruote"

### Subtitle / lede paragraph
Moto stradali, scooter, vintage, café racer, accessori riconoscibili come caschi Arai/Shoei o tute Dainese. Su AIROOBI la passione per due ruote trova eventi di partecipazione trasparenti, certificazione blockchain, e liquidazione veloce.

### Body copy (~400 parole)

Vendere una moto richiede tempo. Foto, annunci su portali generalisti, telefonate da curiosi senza intenzione di acquisto reale, prove su strada, contrattazioni. Mesi di attesa per liquidare un valore che si svaluta ogni giorno che passa nel tuo garage.

AIROOBI riorganizza il mercato motociclistico italiano in eventi di partecipazione trasparenti.

**Per chi vende la propria moto:** un Ducati Monster, un Yamaha XSR700, uno Honda Africa Twin · oggetti di valore €4.000-15.000 che meritano di trovare il proprietario giusto rapidamente. Su AIROOBI proponi il tuo veicolo per la valutazione · il nostro team verifica documentazione · libretto · service history · condizione · stato gomme · poi assegna un certificato EVALOBI permanente blockchain-based. La tua moto diventa protagonista di un evento di partecipazione che si chiude entro 14 giorni · vincitore matematicamente determinato · liquidazione veloce e trasparente.

**Per chi partecipa:** ottieni una moto Ducati a una frazione del prezzo di mercato comprando blocchi di partecipazione da €1.50 ciascuno. Più blocchi compri, più cresce il tuo score · ma anche partecipare a molti eventi della categoria moto fa crescere il tuo pity bonus per il prossimo evento · sistema deterministico, trasparente, anti-fortuna.

**Quality criteria per categoria moto:**
- Marca riconosciuta (Ducati · BMW Motorrad · Yamaha · Honda · Kawasaki · Triumph · Harley-Davidson · KTM · ecc.)
- Modello e anno identificabili
- Documentazione obbligatoria: libretto di circolazione · certificato di proprietà · service history se disponibile
- Condizione minima "usato eccellente" · gomme con almeno 50% di vita residua
- Foto 360° complete (esterno · interno cruscotto · motore · gomme)
- Località di ritiro/consegna inclusa nella proposta valutazione

Durata standard eventi moto: 14 giorni (oggetti di alto valore · audience motivata).

Valore floor: €2.500 EUR.

### Pillar+spoke links
- "Airdrop moto attivi adesso" (live grid)
- Blog tag `moto` · "Vendere la tua moto su AIROOBI · processo step-by-step" · "Ducati Monster · airdrop e fairness" · "Accessori moto premium · Dainese Arai · come funziona"
- "Storie vincitori moto" (`/storie-vincitori/cat/moto`)

### CTA
"Vendi la tua moto su AIROOBI" → `/vendi` form proposta valutazione
"Partecipa al prossimo airdrop moto" → `/airdrops?category=moto`

---

## CATEGORIA 4 · GIOIELLI

### Slug: `gioielli`

### Hero title (H1)
"Gioielli · valore certificato, evento trasparente"

### Subtitle / lede paragraph
Oro, diamanti, pietre preziose, gioielli firmati o vintage. Su AIROOBI ogni gioiello viene professionalmente valutato, riceve un certificato EVALOBI permanente blockchain-based, e diventa protagonista di un evento di partecipazione equo e deterministico.

### Body copy (~400 parole)

Il mondo dei gioielli vive di certificazione e fiducia. Un anello con diamante senza certificato gemmologico vale meno della metà. Una collana d'oro senza garanzia di pesatura e titolo viene scontata aggressivamente da compro-oro tradizionali.

AIROOBI risolve il gap di fiducia con tecnologia blockchain + valutazione professionale.

**Per chi vende:** il tuo anello di famiglia, la collana ereditata, il bracciale acquistato anni fa che non indossi più · oggetti che meritano valutazione equa e trasparenza totale. Su AIROOBI proponi il gioiello per valutazione · il nostro team verifica metallo (oro 18kt · 14kt · platino · argento) · pietre preziose (taglio · purezza · carati · certificazione GIA se disponibile) · provenance e firma se firmato. Riceve un certificato EVALOBI permanente blockchain-based che accompagnerà l'oggetto per sempre · anche se decidi di rivenderlo altrove dopo l'esperienza AIROOBI.

**Per chi partecipa:** ottieni gioielli di valore €1.000-€10.000 comprando blocchi di partecipazione da €1.50 ciascuno. La matematica decide il vincitore in modo trasparente · partecipanti vedono in tempo reale quanti blocchi mancano per superare il leader · scacco matto display elimina ogni ambiguità · zero gambling, solo skill-based commerce.

**Quality criteria per categoria gioielli:**
- Metallo identificabile (oro 18kt+ · platino · argento 925+)
- Pietre preziose con certificazione gemmologica preferibile (GIA · IGI · HRD)
- Provenance documentata se firmato (Tiffany · Cartier · Bulgari · Pomellato · ecc.)
- Condizione "nuovo" · "come nuovo" · o "vintage" (categoria separata per pezzi pre-1980)
- Foto macro dettagliate · peso in grammi · misure precise

Durata standard eventi gioielli: 10-14 giorni (categoria premium · valutazione richiede tempo).

Valore floor: €1.000 EUR.

### Pillar+spoke links
- "Airdrop gioielli attivi adesso" (live grid)
- Blog tag `gioielli` · "Come funziona la valutazione gioielli su AIROOBI" · "Vendere oro · perché AIROOBI è migliore del compro-oro" · "Diamanti certificati GIA · airdrop trasparenti"
- "Storie vincitori gioielli" (`/storie-vincitori/cat/gioielli`)

### CTA
"Vendi il tuo gioiello su AIROOBI" → `/vendi` form proposta valutazione gemmologica
"Partecipa al prossimo airdrop gioielli" → `/airdrops?category=gioielli`

---

## CATEGORIA 5 · VINTAGE

### Slug: `vintage`

### Hero title (H1)
"Vintage · anni '70-'80-'90 hanno trovato casa"

### Subtitle / lede paragraph
Abbigliamento vintage di marca, accessori designer pre-2000, fotocamere meccaniche, vinili, console retro-gaming, audio vintage hi-fi. Su AIROOBI il vintage trova certificazione blockchain, valutazione esperta, e eventi di partecipazione organizzati per veri appassionati.

### Body copy (~400 parole)

Il vintage non è solo vecchio · è storia, design, irripetibilità. Una giacca Levi's anni '70, un Walkman Sony 1983, un vinile Pink Floyd prima stampa, una camera Leica meccanica · valgono perché non si producono più, perché chi li possiede li ha curati negli anni, perché chi li cerca non trova nulla di simile su nessun marketplace generalista.

AIROOBI è la piattaforma italiana dove gli oggetti vintage di valore trovano comunità di appassionati veri.

**Per chi vende:** se hai un capo vintage di marca degli anni '70-'90, un accessorio designer pre-2000, una fotocamera meccanica, un audio hi-fi vintage Marantz/Pioneer/McIntosh · proponilo per valutazione AIROOBI. Il nostro team verifica autenticità (etichette · matricole · provenance) · condizione (vintage richiede gestione delicata) · rarità (prima stampa? edizione limitata? colorway raro?). Riceve un certificato EVALOBI permanente blockchain-based che documenta la storia dell'oggetto · l'autenticità · il momento della valutazione AIROOBI. Liquidazione in 14 giorni con audience selezionata di veri appassionati · zero scambi su Subito con curiosi che svalutano l'oggetto.

**Per chi partecipa:** ottieni vintage iconico a valori che riflettono il vero mercato · NON il prezzo gonfiato dei dealer online specializzati. Eventi di partecipazione da €1.50 a blocco · math-deterministic · partecipanti vedono in tempo reale chi è in gara e chi è escluso · trasparenza totale.

**Quality criteria per categoria vintage:**
- Età minima 25 anni (pre-2000)
- Brand riconoscibile internazionalmente OR rarità documentata
- Condizione "vintage buono" · "vintage eccellente" · "vintage perfetto" (scala AIROOBI)
- Documentazione provenance dove possibile (foto storiche · scontrini originali · libretti)
- Foto dettagliate ogni etichetta · matricola · usura · particolari

Durata standard eventi vintage: 14 giorni (categoria nicchia · audience selezionata · partecipanti motivati).

Valore floor: €800 EUR.

### Pillar+spoke links
- "Airdrop vintage attivi adesso" (live grid)
- Blog tag `vintage` · "Vendere abbigliamento vintage anni '70 su AIROOBI" · "Fotocamere meccaniche · valutazione e airdrop" · "Vinili prima stampa · come funziona la certificazione AIROOBI"
- "Storie vincitori vintage" (`/storie-vincitori/cat/vintage`)

### CTA
"Vendi il tuo vintage su AIROOBI" → `/vendi` form proposta valutazione vintage
"Partecipa al prossimo airdrop vintage" → `/airdrops?category=vintage`

---

## CATEGORIA 6 · ARTE-COLLEZIONE

### Slug: `arte-collezione`

### Hero title (H1)
"Arte e collezione · valore culturale, evento equo"

### Subtitle / lede paragraph
Arte contemporanea, stampe firmate, sculture, fotografia d'autore, oggetti da collezione (sneakers limited drops, action figures rare, comics first edition, memorabilia sportivo). Su AIROOBI ogni pezzo riceve valutazione esperta, certificazione blockchain, evento di partecipazione organizzato.

### Body copy (~450 parole)

L'arte e gli oggetti da collezione non si comprano · si trovano. Un quadro firmato che cerchi da anni · una sneaker limited drop disponibile solo in 500 pezzi al mondo · un comic first edition · una scultura contemporanea di un artista emergente · oggetti che vivono di rarità, provenance, e community appassionata.

AIROOBI organizza il mercato italiano dell'arte e collezione in eventi di partecipazione trasparenti, certificati blockchain, con audience selezionata.

**Per chi vende:** la stampa firmata che hai in salotto da dieci anni, la sneaker Off-White × Nike che non hai mai indossato, l'action figure Hot Toys edizione limitata, il comic Spider-Man prima edizione, la scultura contemporanea acquistata da galleria · oggetti che meritano valutazione esperta e mercato di acquirenti motivati. Su AIROOBI proponi il pezzo per valutazione · il nostro team verifica autenticità (firma · numerazione · provenance galleria/dealer · documentazione COA) · condizione (arte e collezione richiedono storage perfetto) · rarità (edizione · drop · prima stampa). Riceve certificato EVALOBI permanente blockchain-based che documenta autenticità + provenance per l'eternità.

**Per chi partecipa:** ottieni arte contemporanea, sneakers limited, comics first edition, action figures rare a valori che riflettono il vero mercato secondario · NON il prezzo speculativo di reseller online. Eventi di partecipazione da €1.50 a blocco · math-deterministic · scoring v5 con pity per partecipanti loyali alla categoria.

**Quality criteria per categoria arte-collezione:**
- Autenticità documentabile (firma artista · numerazione · COA · provenance galleria/dealer)
- Per arte: edizione limitata preferibile (numerazione visibile)
- Per sneakers/streetwear: drop limited identificabile (SKU · numero di serie · colorway codename)
- Per comics: grading CGC/CBCS preferibile (almeno 8.0+)
- Per memorabilia sportivo: autografo certificato (PSA/DNA · JSA · Beckett) preferibile
- Condizione "nuovo" · "come nuovo" · o "vintage" preserved con storage perfetto
- Foto dettagliate ogni firma · numerazione · imperfezione · COA

Durata standard eventi arte-collezione: 14 giorni (categoria nicchia premium · audience appassionata e selezionata).

Valore floor: €1.000 EUR (categoria premium-minded).

### Pillar+spoke links
- "Airdrop arte e collezione attivi adesso" (live grid)
- Blog tag `arte-collezione` · "Vendere arte contemporanea su AIROOBI · perché funziona" · "Sneakers limited drops · airdrop e fairness" · "Comics first edition · come valutiamo l'autenticità"
- "Storie vincitori arte e collezione" (`/storie-vincitori/cat/arte-collezione`)

### CTA
"Vendi la tua arte o collezione su AIROOBI" → `/vendi` form proposta valutazione esperta
"Partecipa al prossimo airdrop arte-collezione" → `/airdrops?category=arte-collezione`

---

## Cross-cutting brand voice notes (Italian Editorial Manifesto v2)

### Vocabolario LOCKED v0.4-3
- ✅ Evento · partecipazione · attivi · esclusi · scacco matto · blocco · skill-based · math-deterministic · trasparente · evento equo · valore reale · certificato · pollution layer · brand-coherent · audience selezionata · marketplace utility-driven
- ❌ BANNED: maratona · race · agonismo · runner · champion · vinci · perdi · lotteria · gambling · azzardo · sorteggio · scommessa · jackpot · fortuna

### Tone
Editoriale Italian premium · NOT corporate stiff · NOT casual streetwear · sweet spot informato e accessibile · brand v2 G3 Architectural for institutional pages (.com investitori) · G2 Marni Minimal for dApp (.app dashboard).

### CTA pattern
Ogni pagina chiude con 2 CTA:
1. "Vendi {oggetto} su AIROOBI" → `/vendi` form proposta valutazione (categoria-specifica entry point)
2. "Partecipa al prossimo airdrop {categoria}" → `/airdrops?category={slug}` filtered listing

### Schema.org structured data (CCP wires SSR)
- `Article` type per pillar page content
- `CollectionPage` type per pillar page (collection of airdrops + blog + storie)
- `BreadcrumbList` JSON-LD (home → /categoria → /categoria/{slug}) (Sprint W4 Day 12+ pattern preserved)

---

## CCP Implementation Brief

### Files to create

**Single canonical copy file** (this document) · output `06_public_assets/copy/categorie/` extracted per slug:
- `06_public_assets/copy/categorie/elettronica.md`
- `06_public_assets/copy/categorie/luxury.md`
- `06_public_assets/copy/categorie/moto.md`
- `06_public_assets/copy/categorie/gioielli.md`
- `06_public_assets/copy/categorie/vintage.md`
- `06_public_assets/copy/categorie/arte-collezione.md`

### Vercel SSR function

`/api/categoria-ssr.js` (pattern existing `/api/winner-story-ssr.js` reuse):
- Route: `airoobi.com/categoria/:slug` (vercel.json rewrite)
- Function workflow:
  1. Read slug from query param
  2. Whitelist check slug (`['elettronica', 'luxury', 'moto', 'gioielli', 'vintage', 'arte-collezione']`)
  3. Render HTML page with copy from `06_public_assets/copy/categorie/{slug}.md` (markdown → HTML server-side)
  4. Fetch airdrops attivi categoria via RPC `get_airdrops_by_category(slug)`
  5. Render Schema.org Article + CollectionPage + BreadcrumbList JSON-LD
  6. Render OG meta tags (dynamic per categoria)
  7. Cache-Control: `public, max-age=300, s-maxage=3600`

### Acceptance criteria
- ✅ 6 categoria pillar pages live `/categoria/{slug}`
- ✅ Schema.org Article + CollectionPage + BreadcrumbList JSON-LD valid
- ✅ Live airdrop grid render per categoria
- ✅ Blog tag-matched links functional
- ✅ Winner stories cross-reference `/storie-vincitori/cat/{slug}` (Sprint W4 Day 12 clean URL ready)
- ✅ Mobile 380px responsive
- ✅ Italian Voice 04 BANNED smoke pre-commit zero hits
- ✅ Brand v2 G3 visual consistency

### ETA stima CCP
- SSR function `/api/categoria-ssr.js` · ~2h
- 6 markdown extraction + asset wiring · ~1h
- vercel.json rewrite + cache headers · ~30 min
- Sitemap dynamic regen include 6 categoria URLs · ~30 min
- TOTALE ~4h focused autonomous push · post-FASE-A-go-live W5+ window

---

## Closing

6 categoria pillar pages copy v1 DRAFT · 300-500 parole ognuna · brand-coherent · Italian Editorial Manifesto v2 · Voice Principle 04 STRICT preserved · pillar+spoke pattern SEO depth · CCP wires post-FASE-A-go-live Ven 22/05 quando ready (sprint W5+ candidate).

— **ROBY** (Strategic MKT, Comms & Community Manager · Claude Desktop) · 20 May 2026 W3 Day 5 Mer sera · FASE B Kaspa Foundation + brand pollution SEO expansion async

*6 categoria pillar pages copy v1 DRAFT · elettronica · luxury · moto · gioielli · vintage · arte-collezione · brand-coherent 300-500 parole ognuna · pillar+spoke SEO pattern · CCP wires HTML post-FASE-A-go-live W5+ · target SEO surface expansion + brand pollution viral layer extended · daje 🚀*
