---
title: CCP · LB-7 Regulatory Copy Sweep — P1 consumer surfaces shipped + scope reality + 2 STOP+ASK brand
purpose: Risposta CCP al RS LB-7. Sweep grep eseguito (verify-before-sed). P1 consumer-facing sterilizzato e shippato (8 file). Scope reale ~4x il mental model del brief. 2 STOP+ASK genuini per Skeezu (nome prodotto "Tessera Rendimento / yield token" · analogia "buono fruttifero"). Blog layer ~16 articoli gated sulle 2 decisioni. Cadenza LB-6 rispettata: CCP applica → ROBY UI-click verifica.
date: Sab 30 maggio 2026
audience: ROBY · Skeezu (DECISIONE su 2 STOP+ASK)
status: P1 shipped (8 file, footer bumped) · explorer-robi già pulita · 2 STOP+ASK brand bloccano P2 · blog ~16 articoli = batch editoriale gated · pronto per UI-click ROBY su P1
---

# CCP · LB-7 Regulatory Copy Debt Sweep — P1 shipped + 2 STOP+ASK brand

ROBY — sweep partito subito come da GO. Verify-before-sed fatto: ho
greppato tutti i ~17 pattern (espliciti §2.1 + impliciti §2.2 +
"buono fruttifero" + "valgono di più" + "yield/rendimento") su tutto
il repo prima di toccare una riga. **Catch grosso: lo scope è ~4x il
mental model del brief.** Sotto il dettaglio + cosa ho shippato + 2
STOP+ASK genuini che sono di Skeezu, non miei.

## 0. Scope reality — il brief stimava ~12 frasi, la realtà è ~50+ hit su ~30 file

Il pattern "ROBI cresce di valore" non è copy-debt isolata: è la
**narrativa portante** di ROBI su buona parte del sito. In particolare
tutta la famiglia **"Tessera Rendimento = buono fruttifero che cresce
di valore"** è cablata in:
- titoli, meta description e h2 di interi articoli blog
- il **nome del prodotto** stesso ("Tessera Rendimento", reso in EN
  come **"yield tokens"** / **"interest-bearing certificates"**)
- l'analogia **"buono fruttifero postale"** (consolidata: è perfino
  nelle comms rules della mia memoria di progetto)

Questo NON è un problema del tuo RS — il blocco canonico §4 e i pattern
§5 sono ottimi e li ho usati pari pari sul P1. È che il sweep tocca un
nodo brand che va oltre il copy-swap. Da qui i 2 STOP+ASK.

## 1. P1 consumer-facing — SHIPPED (8 file)

Sterilizzazione 1:1 con blocco canonico §4 (media/corta) + pattern §5.
Tutti questi hit erano promesse di apprezzamento **non** legate al nome
prodotto né all'analogia buono-fruttifero → puliti, pre-autorizzati,
shippati. IT + EN entrambi.

| File | Hit | Prima → Dopo (sintesi) |
|---|---|---|
| `home.html` | hero seller | "ROBI che crescono di valore nel tempo" → "ROBI reali — over-collateralizzati per design e riscattabili in KAS" |
| `landing.html` | welcome grant | "5 ROBI che iniziano a crescere di valore" → "5 ROBI — over-collateralizzati e riscattabili in KAS" |
| `tokens.html` | triade token | "ROBI per crescere" → "ROBI da accumulare" |
| `investitori.html` | flow utente | "ROBI che crescono nel tempo" → "ROBI over-collateralizzati, con backing verificabile on-chain" |
| `dapp.html` | KAS note + "vero guadagno" | "aumentare i ROBI / stai costruendo la tua posizione" → "accumulare ROBI — over-collateralizzati, backing on-chain"; "hanno valore reale e crescono nel tempo" → "valore reale, over-collateralizzato e verificabile on-chain" |
| `faq.html` | Q ROBI (JSON-LD + visibile) | "hanno già valore reale e cresceranno nel tempo" → "valore reale, over-collateralizzato per design e verificabile on-chain" |
| `airdrops-public.html` | 3 blocchi (JSON-LD + 2 visibili) | "maturano valore / cresce di valore grazie al treasury backing" → "over-collateralizzati dal treasury, backing verificabile on-chain"; bonus: "blocchi investiti" → "blocchi spesi" (pattern §2.2) |
| `video-airdrop.html` | 2 slide | "Più AIROOBI cresce, più vale il tuo ROBI" → "ROBI over-collateralizzato · backing verificabile on-chain"; "I ROBI crescono" → "I ROBI restano tuoi" |

Footer bumped su tutti i file con version string (home 4.28.0 ·
dapp 4.49.0 · faq/tokens 4.15.0 · landing/airdrops-public 4.13.0 →
tutti data 2026.05.30). `investitori.html` e `video-airdrop.html` non
hanno version string standard (non toccato il footer). **Solo HTML/copy,
nessun JS/CSS → niente cache-bust `?v=` necessario**
([[feedback-cache-bust-v-bump]]).

**Già pulita (nessun hit):** `explorer-robi.html` — zero linguaggio
apprezzamento, già fattuale. La nota §6.1 (anticipare proof-of-reserves)
la tengo per lo Step 4 build, non è sterilizzazione.

**Correttamente NON toccato (fattuale, §2.3 / §6.2):**
- `treasury.html:366` "Quando il treasury cresce, vengono emessi meno
  ROBI per blocco" → descrizione fattuale del treasury, OK
- `abo.html:4319` admin note "cuscinetto per crescita futura del
  Treasury" → treasury growth, non promessa ROBI, low-pri

## 2. STOP+ASK A (Skeezu) — nome prodotto "Tessera Rendimento / yield token"

Il prodotto si chiama **"Tessera Rendimento"**, tradotto in EN come
**"yield tokens"** e descritto come **"interest-bearing certificates"**
(`come-funziona-airdrop.html:154-155`, `video-intro.html:227`,
`blog.html:214`, 2 articoli blog interi).

`Rendimento` = yield/return. `yield-bearing instrument` /
`interest-bearing certificate` è **letteralmente** terminologia da
strumento finanziario (MiFID II), il red flag più forte di tutto LB-7.
Sterilizzare le frasi intorno lasciando "yield token" sarebbe
incoerente e comunque non-conforme.

**Questo è un rename di prodotto su ~20 superfici + filename blog +
regola brand in memoria. Non lo faccio unilateralmente — è Skeezu.**

Opzioni (3-options):
- **(a) minimo:** IT resta "Tessera Rendimento", EN passa a neutro
  ("Reward Token" / "Reward NFT"), si elimina "yield / interest-bearing"
- **(b) ideale:** rename pieno IT+EN a framing backing ("ROBI Reward" /
  "Tessera Backing" / simili) — coerente Position Paper, ma tocca brand
- **(c) debole:** tieni il nome, sterilizza solo le promesse intorno —
  sconsigliato, "yield token" da solo flagga
- Raccomandazione CCP: **(a) come minimo, (b) come ideale.**

## 3. STOP+ASK B (Skeezu) — analogia "buono fruttifero postale"

L'analogia "ROBI è come un buono fruttifero postale che cresce di
valore nel tempo" è **consolidata** (è nelle comms rules della mia
memoria di progetto) e appare in `come-funziona-airdrop.html:155`,
`blog.html:404` + ~6 articoli blog.

Problema: il buono fruttifero **è** la promessa di apprezzamento (un
deposito che matura valore nel tempo). È esattamente ciò che §7 del
Position Paper vuole rimuovere (descrivere il design, mai promettere
il prezzo · pattern MakerDAO/DAI).

Opzioni:
- **(a) drop totale:** via l'analogia, sostituita da over-collateralization
  / backing verificabile (DeFi pattern) — raccomandata CCP
- **(b) reframe:** "come un buono, ma il valore deriva dal backing
  verificabile on-chain, non da un tasso" — più debole, evoca ancora crescita
- **Nota:** se Skeezu firma (a), va aggiornata anche la **comms rule in
  MEMORY.md** ("NFT = buono fruttifero ... crescono di valore") — te lo
  segnalo perché è una regola brand attiva, non solo copy.

## 4. Blog layer P2 — ~16 articoli, batch editoriale GATED su A+B

Questi NON sono 1:1 swap: sono **rewrite editoriali** perché interi
articoli sono costruiti sulla tesi "ROBI cresce di valore / buono
fruttifero / apprezzamento". Esempi più pesanti:
- `blog/cose-robi-tessera-rendimento-airoobi.html` (~13 hit, h2 "Come
  cresce il valore del ROBI", titolo+meta sul nome prodotto)
- `blog/tessera-rendimento-airoobi-come-funziona.html` (~7 hit,
  "apprezzamento del valore unitario", halving "garantisce apprezzamento")
- `blog/fondo-comune-airoobi-garanzia-trasparente.html`,
  `blog/come-funziona-fondo-comune-airoobi.html`,
  `blog/nft-utility-token-differenza.html` (più hit ciascuno)
- + ~11 articoli con 1-3 hit (check-in, referral, guadagnare-crypto,
  come-guadagnare-punti, airdrop-iphone/moto, cosa-succede-airdrop-fallito,
  kaspa-krc20, fair-airdrop, airoobi-nuovo-modello, come-funziona-guida)

**Sono tutti gated su A+B**: la framing del rewrite dipende da come si
chiama il prodotto e se si tiene/droppa il buono fruttifero. Inutile
riscriverli prima. Proposta: una volta firmati A+B, li faccio in **un
batch P2 dedicato** (~half-day CCP), gated UI-click ROBY come il P1.

`come-funziona-airdrop.html` (EDU deliverable,
[[feedback-edu-page-update]]) l'ho **deliberatamente NON mezzo-editato**:
rimuovere solo "prezzo che cresce" lasciando "yield tokens / buoni
fruttiferi" lo lascerebbe incoerente e non-conforme. Entra nel batch P2
appena A+B firmati.

## 5. ETA ricalibrato

- **P1 (fatto):** ~12 superfici sterilizzate, shipped oggi
- **P2 blog + brand (gated A+B):** ~half-day CCP dopo firma Skeezu
- Brief stimava ~2-3h CCP totali → reale ~P1 oggi + ~half-day P2 (lo
  scope era 4x, non per errore tuo ma per quanto è cablata la narrativa)

## RS — paste-ready per te

```
CCP · LB-7 SWEEP — P1 SHIPPED + 2 STOP+ASK BRAND

Verify-before-sed fatto (~17 pattern su tutto il repo). SCOPE REALE
~50+ hit su ~30 file, non ~12 frasi: la narrativa "Tessera Rendimento
= buono fruttifero che cresce di valore" è cablata in titoli/meta/h2 +
nel NOME prodotto (EN = "yield tokens") + analogia buono fruttifero.

P1 CONSUMER SHIPPED (8 file, footer bumped, IT+EN):
home · landing · tokens · investitori · dapp · faq · airdrops-public ·
video-airdrop. Tutte "cresce di valore" → "over-collateralizzato +
backing verificabile on-chain". explorer-robi già pulita.
treasury.html:366 lasciato (fattuale). Solo HTML, no cache-bust.

2 STOP+ASK (SKEEZU, non miei):
A. Nome prodotto "Tessera Rendimento / yield token / interest-bearing":
   red flag MiFID. Rename ~20 superfici = decisione brand.
   Opz: (a) EN→"Reward Token" min · (b) rename pieno backing-framed ·
   (c) tieni nome (sconsigliato). Reco CCP: (a) min, (b) ideale.
B. Analogia "buono fruttifero postale": È la promessa di apprezzamento.
   Opz: (a) drop totale → backing/over-collat (reco) · (b) reframe debole.
   Se (a): aggiornare anche comms rule MEMORY.md.

BLOG P2 ~16 articoli = rewrite editoriali GATED su A+B (~half-day CCP
dopo firma). come-funziona-airdrop (EDU) volutamente non mezzo-editato.

PRONTO per UI-click ROBY sul P1. P2 parte appena Skeezu firma A+B.
```

## Bottom line

P1 consumer-facing pulito e in produzione appena pusho — puoi fare
UI-click su home/dapp/faq/landing/tokens/airdrops-public/video-airdrop
quando vuoi. Il cuore di LB-7 però è la decisione brand: **il prodotto
si chiama "Rendimento/yield" e l'analogia portante è "buono fruttifero"**
— due cose che sono *strutturalmente* la promessa di apprezzamento, non
copy di contorno. Quelle le firma Skeezu (STOP+ASK A + B). Appena
firmate, faccio il batch P2 blog + EDU in un colpo, gated UI-click.

Audit-trail: questo file = CCP Ack RS LB-7 Regulatory Copy Debt Sweep ·
verify-before-sed su ~17 pattern · scope reale ~50+ hit su ~30 file (4x
mental model brief, narrativa Tessera Rendimento/buono fruttifero cablata
in titoli+meta+nome prodotto) · P1 consumer SHIPPED 8 file (home·landing·
tokens·investitori·dapp·faq·airdrops-public·video-airdrop, IT+EN,
"cresce di valore"→over-collateralizzato/backing on-chain, footer bumped
2026.05.30, no cache-bust HTML-only) · explorer-robi già pulita ·
treasury.html:366 + abo:4319 lasciati fattuali · 2 STOP+ASK Skeezu
(A=nome prodotto Tessera Rendimento/yield token red flag MiFID, opz
a/b/c reco a-min b-ideale · B=analogia buono fruttifero, opz a-drop
reco/b-reframe, se a aggiornare comms rule MEMORY.md) · blog P2 ~16
articoli rewrite editoriali gated A+B (~half-day) · come-funziona-airdrop
EDU non mezzo-editato volutamente · cadenza LB-6 rispettata (CCP applica
→ ROBY UI-click) · stato: P1 pronto UI-click, P2 gated firma Skeezu A+B.

---

*CCP · CIO/CTO AIROOBI · Ack RS LB-7 · 30 May 2026 · P1 shipped + 2 STOP+ASK brand a Skeezu · daje team a 4*
