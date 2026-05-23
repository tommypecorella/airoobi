---
title: ROBY · Privacy Policy + Termini di Servizio — Bozza rifatta v2 (allineata al prodotto Alpha 0)
purpose: Riscrittura di privacy.html e termini.html. Le pagine live sono ferme all'era waitlist; questa bozza le allinea al prodotto transazionale attuale (account, airdrop, escrow Closure v3, counter/ban, foto oggetti, processori reali). Copy review-ready per Skeezu + revisione legale.
date: Sab 23 maggio 2026
audience: Skeezu · revisione legale · CCP (per applicazione)
status: BOZZA · NON è parere legale · revisione legale OBBLIGATORIA prima di Stage 1/mainnet
related: 03_site_pages/privacy.html · 03_site_pages/termini.html · 01_deliverables_docs/business/AIROOBI_Legal_Framework.md (LEG-001) · for-CCP/ROBY_RS_Privacy_ToS_Refresh_2026-05-23.md
---

# Privacy & Termini — Bozza v2

## ⚠️ Stato e disclaimer

Questa è una **bozza di copy**, non un parere legale. ROBY ha allineato il testo
al prodotto reale; **la sufficienza legale la deve validare un avvocato.** LEG-001
§4 lo dice esplicito: prima di Stage 1 servono forma societaria, DPO designato e
consulenza di uno studio specializzato. Tutto ciò che è fra `[ ]` è un
**placeholder da completare**; i punti aperti sono raccolti in fondo, §"Note per
la revisione".

Le pagine live (`airoobi.com/privacy.html` e `/termini.html`, "Ultimo
aggiornamento: Marzo 2026") descrivono ancora una semplice waitlist. Questa v2
copre il prodotto Alpha 0 transazionale: account, acquisto blocchi, airdrop,
valutazione oggetti con foto, consegna escrow, ROBI/ARIA, chat, notifiche.

## Come usare questo file

Parte 1 → contenuto di `privacy.html`. Parte 2 → contenuto di `termini.html`.
Parte 3 (Cookie) → sezione dentro `privacy.html` (o pagina a sé, vedi note).
CCP trasforma la copy in HTML mantenendo CSS, topbar e footer esistenti — vedi
l'RS `ROBY_RS_Privacy_ToS_Refresh_2026-05-23.md`.

---

# PARTE 1 — PRIVACY POLICY

**Informativa sul trattamento dei dati personali**
Ultimo aggiornamento: 23 maggio 2026

## 1. Titolare del trattamento

Il titolare del trattamento dei dati personali è `[DA COMPLETARE: ragione
sociale e forma giuridica del titolare]`, con sede in `[DA COMPLETARE: sede
legale]` — di seguito "AIROOBI", "noi".

Per qualsiasi questione relativa ai tuoi dati puoi scrivere a
**privacy@airoobi.com**. `[Se viene designato un Responsabile della protezione
dei dati (DPO), indicarne qui i contatti.]`

## 2. Quali dati raccogliamo

A seconda di come usi AIROOBI, trattiamo le seguenti categorie di dati:

- **Dati dell'account** — indirizzo email, password (conservata in forma
  cifrata), eventuale codice referral di invito, preferenza linguistica.
- **Dati del profilo** — nome o nome visualizzato e immagine del profilo, se
  scegli di inserirli.
- **Dati del portafoglio e di attività** — saldo e movimenti ARIA, ROBI
  ottenuti, blocchi acquistati, partecipazioni agli airdrop, accessi giornalieri
  e altre interazioni con la piattaforma.
- **Contenuti che carichi** — quando proponi un oggetto per la valutazione,
  raccogliamo le **fotografie dell'oggetto** e le informazioni che fornisci
  (descrizione, categoria, prezzo desiderato).
- **Dati di consegna** — quando un airdrop si conclude e un oggetto fisico deve
  essere spedito, trattiamo i dati necessari alla consegna (nome del
  destinatario, indirizzo di spedizione, eventuale codice di tracciamento).
- **Comunicazioni** — i messaggi che scambi nelle chat degli airdrop e le
  comunicazioni che ci invii via email.
- **Dati di verifica dell'identità (KYC)** — documento d'identità, selfie ed
  eventuale prova di indirizzo. Questi dati **non sono raccolti nell'attuale
  fase Alpha 0** (testnet); diventeranno necessari a partire dallo Stage 1, per
  obblighi di legge antiriciclaggio, prima di poter operare con valore reale.
- **Dati tecnici** — informazioni raccolte automaticamente per il funzionamento
  e la sicurezza del sito (vedi §8, Cookie e tecnologie simili).

## 3. Perché trattiamo i tuoi dati e su quale base giuridica

| Finalità | Categorie di dati | Base giuridica (GDPR art. 6) |
|---|---|---|
| Creare e gestire il tuo account, erogare il servizio | account, profilo, portafoglio, attività | Esecuzione del contratto — art. 6(1)(b) |
| Gestire airdrop, valutazioni, consegne e chat | contenuti caricati, consegna, comunicazioni | Esecuzione del contratto — art. 6(1)(b) |
| Sicurezza della piattaforma, prevenzione abusi | dati tecnici, attività | Legittimo interesse — art. 6(1)(f) |
| Verifica dell'identità (dallo Stage 1) | KYC | Obbligo legale (antiriciclaggio) — art. 6(1)(c) |
| Inviarti aggiornamenti e notifiche di prodotto | email, preferenze, iscrizioni push | Consenso — art. 6(1)(a) |

Puoi revocare il consenso in qualsiasi momento; la revoca non pregiudica i
trattamenti già effettuati.

## 4. Per quanto tempo conserviamo i dati

- Dati di account, profilo e portafoglio: per la durata dell'account e,
  successivamente, per il periodo richiesto da obblighi di legge `[DA CONFERMARE
  col legale: periodo di conservazione contabile/fiscale]`.
- Dati di attività: `[DA CONFERMARE — riferimento interno LEG-001: 3 anni]`.
- Dati KYC: per il periodo previsto dalla normativa antiriciclaggio `[DA
  CONFERMARE col legale]`, poi anonimizzati.
- Dati trattati sulla base del consenso (marketing): fino alla revoca del
  consenso.

Alla chiusura dell'account procediamo alla cancellazione o all'anonimizzazione
dei dati, fatti salvi quelli che dobbiamo conservare per obbligo di legge.

## 5. Con chi condividiamo i dati

Non vendiamo i tuoi dati e non li cediamo a terzi per finalità di marketing.
Li trattano per nostro conto, come responsabili del trattamento, fornitori di
servizi selezionati:

- **Supabase** — database e archiviazione dei file (incluse le foto degli
  oggetti). Server nell'Unione Europea (Francoforte).
- **Vercel** — hosting del sito e delle funzioni applicative. Regione UE.
- **Cloudflare** — distribuzione dei contenuti e statistiche aggregate di
  navigazione, con indirizzo IP anonimizzato.
- **Postmark** — invio delle email transazionali. `[Fornitore con sede negli
  Stati Uniti — vedi §6 e Note per la revisione: SCC da formalizzare.]`
- Dallo Stage 1, un **fornitore di verifica dell'identità (KYC)** `[da
  individuare — es. Onfido / Veriff / Jumio]`.

Possiamo inoltre comunicare dati all'autorità giudiziaria o ad autorità
competenti quando previsto dalla legge.

## 6. Dove sono conservati i dati e trasferimenti fuori dall'UE

I dati sono conservati su server situati nell'Unione Europea. Alcuni fornitori
(es. l'invio email) possono comportare un trasferimento verso paesi terzi: in
tal caso il trasferimento avviene sulla base delle garanzie previste dal GDPR
(es. Clausole Contrattuali Standard). `[DA CONFERMARE col legale: stato delle
SCC con i fornitori extra-UE.]`

## 7. I tuoi diritti

Ai sensi del GDPR puoi in qualsiasi momento: accedere ai tuoi dati, chiederne la
rettifica, ottenerne la cancellazione, limitarne il trattamento, opporti al
trattamento e richiedere la portabilità dei dati.

In pratica, su AIROOBI puoi:

- consultare e modificare i dati del profilo dalla tua area personale;
- chiedere la cancellazione dell'account: l'account viene disattivato e i dati
  cancellati o anonimizzati, fatti salvi quelli soggetti a obbligo di
  conservazione legale;
- richiedere l'esportazione dei tuoi dati in formato leggibile;
- disattivare le comunicazioni di marketing dalle preferenze del tuo account.

Per esercitare questi diritti scrivi a **privacy@airoobi.com**. Hai inoltre il
diritto di proporre reclamo al Garante per la protezione dei dati personali.

## 8. Cookie e tecnologie simili

Vedi la Parte 3 di questo documento. `[Se pubblicata come pagina separata,
inserire qui il rinvio: "Consulta la nostra Cookie Policy".]`

## 9. Minori

AIROOBI è riservata a chi ha compiuto 18 anni. Non raccogliamo
consapevolmente dati di minori di 18 anni. Se veniamo a conoscenza di un
account riconducibile a un minore, lo sospendiamo e ne cancelliamo i dati.

## 10. Sicurezza

Adottiamo misure tecniche e organizzative adeguate a proteggere i dati: le
password sono conservate in forma cifrata, l'accesso ai dati è limitato al
personale autorizzato e i nostri fornitori operano in ambienti conformi agli
standard di settore.

## 11. Fase Alpha 0

AIROOBI è attualmente in fase **Alpha 0**, su rete di test e ad accesso su
invito. ARIA è una valuta di test priva di controvalore monetario; non sono
richiesti pagamenti reali. Aggiorneremo questa informativa man mano che la
piattaforma evolve verso le fasi successive.

## 12. Modifiche e contatti

Possiamo aggiornare questa informativa; in caso di modifiche rilevanti te ne
daremo avviso. Per qualsiasi domanda: **privacy@airoobi.com**.

---

# PARTE 2 — TERMINI DI SERVIZIO

**Termini e Condizioni d'uso di AIROOBI**
Ultimo aggiornamento: 23 maggio 2026

## 1. Chi siamo e cos'è AIROOBI

AIROOBI è un marketplace e-commerce in cui l'assegnazione di un oggetto avviene
in base a uno **scoring deterministico** che misura l'impegno e il merito di
partecipazione dell'utente. La piattaforma è gestita da `[DA COMPLETARE:
ragione sociale del gestore]`.

AIROOBI è attualmente in fase **Alpha 0**: opera su rete di test, l'accesso è su
invito e le funzionalità sono in sviluppo attivo e soggette a modifiche.

## 2. Accettazione e modifiche dei termini

Registrando un account e utilizzando AIROOBI accetti questi Termini. Possiamo
aggiornarli per ragioni operative o legali: in caso di modifiche rilevanti te ne
daremo avviso e l'uso continuato della piattaforma dopo l'aggiornamento ne
costituisce accettazione.

## 3. Idoneità e account

Per usare AIROOBI devi avere **almeno 18 anni** e dichiarare di essere
maggiorenne secondo la legge del tuo Paese di residenza. È ammesso **un solo
account per persona**. Sei responsabile della riservatezza delle tue credenziali
e delle attività svolte dal tuo account.

A partire dallo Stage 1 sarà richiesta la **verifica dell'identità (KYC)** prima
di poter operare con valore reale.

## 4. ARIA, ROBI e blocchi

- **ARIA** è la valuta interna della piattaforma. Nella fase Alpha 0 è una
  valuta di **test**, priva di controvalore monetario reale.
- Partecipi a un airdrop acquistando **blocchi** con ARIA. Ogni blocco genera un
  **ROBI**, un certificato digitale (NFT) di partecipazione con un valore
  collegato a un fondo di garanzia trasparente.
- I ROBI ottenuti restano tuoi a prescindere dall'esito dell'airdrop.
- Il funzionamento economico di ARIA e ROBI è descritto nelle pagine informative
  della piattaforma e può evolvere fra le fasi di sviluppo.

## 5. Come funziona un airdrop

Un oggetto proposto da un venditore viene prima **valutato**. Se ammesso, entra
nelle fasi di partecipazione (presale e sale), durante le quali gli utenti
acquistano blocchi. Alla chiusura, l'oggetto è assegnato all'utente con il
**punteggio più alto**, calcolato in modo deterministico sulla base
dell'impegno di partecipazione. L'esito è sempre visibile e verificabile.
L'assegnazione non dipende dal caso.

## 6. Vendere su AIROOBI

Se proponi un oggetto:

- fornisci una descrizione veritiera e fotografie autentiche dell'oggetto;
- per avviare un airdrop versi in anticipo la **commissione di piattaforma**;
  tale commissione **non è rimborsabile**, indipendentemente dall'esito;
- ti impegni a consegnare l'oggetto all'utente assegnatario secondo le modalità
  della Sezione 7;
- garantisci di avere il diritto di disporre dell'oggetto e che esso corrisponde
  a quanto dichiarato.

## 7. Consegna dell'oggetto

La consegna avviene **tramite la piattaforma**, secondo un modello di garanzia
in tre fasi: l'assegnatario richiede la consegna, il venditore spedisce
l'oggetto, l'assegnatario conferma la ricezione. **Il venditore riceve quanto
raccolto solo dopo la conferma di ricezione** da parte dell'assegnatario. Non
sono previsti pagamenti anticipati al venditore.

## 8. Annullamento e rimborsi

Se un airdrop viene annullato, gli ARIA spesi dai partecipanti per l'acquisto
dei blocchi sono **rimborsati**. I ROBI ottenuti restano agli utenti. La
commissione di piattaforma versata dal venditore non è rimborsabile (Sezione 6).

## 9. Annullamenti ripetuti — limite e sospensione della vendita

Per tutelare i partecipanti, gli annullamenti imputabili al venditore sono
conteggiati per anno solare. **Al terzo annullamento nell'anno solare**, la
facoltà di avviare nuovi airdrop come venditore è **sospesa per un mese**.
Durante la sospensione l'utente può comunque partecipare agli airdrop come
acquirente. L'utente può chiudere anticipatamente la sospensione versando
**1.000 ARIA**, che azzera il conteggio. Il conteggio si azzera comunque
automaticamente il 1° gennaio di ogni anno.

## 10. Condotta degli utenti

Non è consentito utilizzare AIROOBI per scopi illeciti, creare più account,
manipolare gli esiti degli airdrop, caricare contenuti falsi o ingannevoli,
o ledere i diritti di altri utenti. In caso di violazione possiamo sospendere
o chiudere l'account.

## 11. Natura del servizio

Nulla di quanto presente sulla piattaforma costituisce consulenza finanziaria,
d'investimento, fiscale o legale. AIROOBI è un servizio di e-commerce; la
partecipazione non garantisce l'assegnazione di un oggetto né un rendimento
economico.

## 12. Proprietà intellettuale

Contenuti, design, marchi, loghi e codice di AIROOBI sono di proprietà del
gestore della piattaforma o dei rispettivi titolari. Non ne è consentita la
riproduzione non autorizzata.

## 13. Limitazione di responsabilità

AIROOBI è offerta in fase **Alpha 0** su rete di test, "così com'è". Nei limiti
consentiti dalla legge, non rispondiamo di interruzioni del servizio, perdita di
dati di test o malfunzionamenti propri di una fase sperimentale. `[Clausola da
rivedere e calibrare col legale.]`

## 14. Legge applicabile e foro

I presenti Termini sono regolati dalla legge `[DA COMPLETARE: legge
applicabile]`. Per le controversie è competente il foro di `[DA COMPLETARE]`,
fatte salve le disposizioni inderogabili a tutela del consumatore.

## 15. Contatti

Per qualsiasi domanda sui presenti Termini: **info@airoobi.com**.

---

# PARTE 3 — COOKIE E TECNOLOGIE SIMILI

AIROOBI utilizza un numero minimo di tecnologie strettamente necessarie:

- **Cookie e archiviazione tecnica necessari** — usati per tenerti
  autenticato durante la sessione e per il corretto funzionamento della
  piattaforma. Sono indispensabili al servizio e non richiedono consenso.
- **Statistiche di navigazione** — utilizziamo uno strumento di analisi
  aggregata che `[DA CONFERMARE CON CCP: verificare se l'attuale strumento
  (Cloudflare Web Analytics) opera senza cookie e con IP anonimizzato — in tal
  caso non è richiesto consenso]`.

`[Se in futuro venissero introdotti cookie o strumenti non essenziali (es.
analytics di terze parti, pixel pubblicitari), sarà necessario un banner di
consenso conforme. Vedi Note per la revisione.]`

Per domande: **privacy@airoobi.com**.

---

## Note per la revisione

Punti che richiedono una decisione di Skeezu e/o del legale prima della
pubblicazione:

1. **Identità del titolare** — la privacy policy e i termini hanno bisogno della
   ragione sociale, della forma giuridica e della sede del soggetto che gestisce
   AIROOBI. Oggi le pagine dicono solo "AIROOBI". LEG-001 §4 segnala la
   costituzione societaria come azione pre-Stage 1.
2. **Clausola non-gambling** — per coerenza con la Voice 04 (vocabolario
   azzardo/sorteggio bandito anche nelle negazioni) ho usato un framing positivo:
   "scoring deterministico", "non dipende dal caso". Se il legale ritiene
   necessaria una clausola esplicita più forte, la sua formulazione prevale sulla
   Voice 04 in un documento legale: è una sua decisione.
3. **Periodi di conservazione** — i valori sono ripresi da LEG-001 §6.1 ma vanno
   confermati dal legale (in particolare gli obblighi contabili/fiscali e i
   termini KYC/antiriciclaggio).
4. **Cookie reali** — la Parte 3 va verificata con CCP su cosa carica
   effettivamente la dApp oggi (sessione Supabase, analytics, eventuali script di
   terze parti). Vedi l'RS per CCP.
5. **Trasferimenti extra-UE** — stato delle Clausole Contrattuali Standard con i
   fornitori non-UE (es. Postmark, USA). LEG-001 §6.3 le segnala "in attesa".
6. **DPO** — LEG-001 §4 indica la designazione di un DPO come azione pre-Stage 1;
   se designato, inserire i contatti in Privacy §1.
7. **Cookie Policy come pagina separata** — ho tenuto la Parte 3 come sezione
   della privacy. Se preferisci una pagina `cookie.html` dedicata con link nel
   footer, è una riga in più nell'RS: dimmelo.
8. **Legge applicabile e foro** — da completare col legale (dipende anche dalla
   forma societaria e sede).

---

*ROBY · Strategic MKT & Comms & Community · Bozza Privacy + Termini v2 · 23 May 2026 · daje team a 4*
