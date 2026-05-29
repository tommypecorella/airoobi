---
title: ROBY · RS · LB-7 Regulatory Copy Debt Sweep — copy MiCA-conforme su tutte le superfici ROBI
purpose: RS operativo per CCP del LB-7 (P1 content-debt class). Sweep mirato delle frasi che promettono apprezzamento ROBI ("ROBI cresce di valore" / "il valore aumenta nel tempo" / simili) su tutte le superfici e sostituzione con linguaggio MiCA-conforme (descrivere il design, mai promettere il prezzo). Riferimento canonico = Position Paper Tokenomics Integrity v1.1 §7. Pattern operativo identico a LB-6 (sweep + sostituzione 1:1 + sign-off UI-click).
date: Ven 29 maggio 2026
audience: CCP · Skeezu (visibility)
status: RS LB-7 sweep · grep target + 7 superfici + blocco canonico in 3 versioni + RS paste-ready · cadenza simile a LB-6
---

# ROBY — RS · LB-7 Regulatory Copy Debt Sweep

## TL;DR

LB-7 è la versione **regulatory-aware** di LB-6. Stesso pattern di
esecuzione, oggetto diverso: invece dei modelli earning stale,
sterilizziamo il **linguaggio di apprezzamento ROBI** — perché
promettere apprezzamento di un token è MiCA red flag (sollecitazione
all'investimento) e ci avvicina al perimetro degli strumenti
finanziari (MiFID II).

Il design **sostanziale** di ROBI (over-collateralizzazione 90/10 per
ogni airdrop → backing che cresce per costruzione) implica un
rafforzamento del valore nel tempo. Ma la **comunicazione** deve
descrivere il meccanismo, mai promettere il prezzo. Pattern DeFi
sofisticato (MakerDAO/DAI documenta la collateralizzazione, non
promette il prezzo). L'utente che capisce il design deduce da sé.

Scope: 7 superfici · grep mirato su ~12 frasi target · sostituzione
con blocco canonico in 3 versioni (lunga / media / corta) a seconda
del contesto. Tempo stimato: ~4-6h ROBY (questo RS) + ~2-3h CCP
(sweep tecnico + applicazione). Cadenza identica a LB-6: CCP fa lo
sweep, applica, bumpa footer + cache-bust, ROBY verifica a UI-click,
firma.

## 1. Riferimento canonico

Single source of truth del linguaggio:
`ROBY-Stuff/AIROOBI_Tokenomics_Integrity_PositionPaper_2026-05-29.md`
(v1.1) §7 — La differenza MiCA — design vs promessa.

Lezione di metodo salvata in memoria ROBY:
[[feedback-mica-design-vs-promessa]].

In caso di ambiguità sul tono di una specifica sostituzione, prevale
il Position Paper.

## 2. Grep target (frasi da cercare)

CCP esegua sweep su tutto il mirror del repo + assets live. Pattern
da intercettare (case-insensitive):

### 2.1 Pattern espliciti — alto rischio MiCA

- `ROBI cresce di valore`
- `il valore [del] ROBI cresce`
- `il valore [del] ROBI aumenta`
- `ROBI si rivaluta`
- `ROBI si rafforza` (in contesti di comunicazione utente — accettabile
  in contesti tecnici/treasury)
- `ROBI crescerà`
- `ROBI [che] aumenta di valore`
- `apprezza[mento] [del] ROBI`
- `Fondo Comune fa crescere ROBI`
- `Fondo Comune [che] cresce[re] il valore [del] ROBI`
- `investi in ROBI`
- `guadagnerai tenendo ROBI`
- `tieni ROBI per [guadagnare/farli crescere]`

### 2.2 Pattern impliciti — rischio medio

- `[ROBI è/sono] un investimento`
- `[ROBI è/sono] un asset speculativo`
- `[ROBI] rendimento`
- `[con i] ROBI guadagn[i/erai]`
- `il prezzo [del] ROBI sal[e/irà]`

### 2.3 Pattern accettabili — NON intervenire

- "ROBI è il **reward** [...]" (reward non implica apprezzamento)
- "Riceverai ROBI per ogni X blocchi" (descrizione meccanica, neutra)
- "ROBI è riscattabile in KAS" (fattuale, neutro)
- "ROBI è over-collateralizzato" (fattuale, è il design)
- "ROBI ha un valore di backing verificabile on-chain" (fattuale)

### 2.4 Pattern borderline — valutare contesto, chiamare ROBY se dubbio

- "guadagni ROBI" → OK in contesto descrittivo dell'earn ("guadagni 1
  ROBI ogni 10 blocchi"), borderline se isolato senza spiegazione
- "ROBI è il tuo asset" → borderline; meglio "ROBI è il tuo reward
  riscattabile"
- "tieni i ROBI" → OK come azione (es. "puoi tenere i ROBI nel wallet"),
  borderline come promessa ("tieni i ROBI per il futuro")

## 3. Superfici da scansionare

In ordine di priorità (= alto traffico utente / alto rischio reputazionale):

### 3.1 P1 — superfici consumer-facing principali

1. **`home.html`** (landing pubblica)
2. **`dapp.html`** (homepage dApp)
3. **`come-funziona-airdrop.html`** (probabilmente contiene sezione ROBI)
4. **`come-guadagnare-punti-aria.html`** (LB-6 fase 2 ha toccato earning,
   verificare se ROBI value claim residuo)
5. **`explorer-robi.html`** (CRITICAL — è la pagina dedicata)
6. **`faq.html`** o pagine FAQ multiple

### 3.2 P2 — superfici di approfondimento

7. **Blog articoli ROBI-related**: cercare in `04_blog_articles/` tutti i
   file che menzionano ROBI nel title o nel body, in particolare:
   - articoli LB-6 fase 2 già riscritti (verificare se in qualche punto
     sopravvive linguaggio apprezzamento)
   - articoli su tokenomics, mining, value
   - eventuali articoli sul Fondo Comune

### 3.3 P3 — superfici interne / admin

8. **`abo.html` admin notes** — se A.1 (verify-flag pending del LB-6
   parte 1) descrive ROBI con linguaggio apprezzamento, sostituire
9. **doc Treasury Methodology** in repo (se separato) — il documento
   tecnico del treasury va riallineato al modello 90/10 esplicito

### 3.4 P4 — superfici investor / marketing (extra-repo)

10. **Pitch deck v1.x** (in `ROBY-Stuff/investor-pack/`) — questo è
    ROBY-led, non CCP-led. Lo aggiornerò io in un passo successivo,
    eventualmente come parte della v1.2 narrativa aggiornata. Solo
    flag per CCP awareness.

## 4. Blocco canonico sostituzione — 3 versioni

Tre varianti di lunghezza/formalità da usare a seconda del contesto.
CCP sceglie la variante in base allo spazio + tono della superficie
in cui sta sostituendo. In dubbio, scegli **media**.

### 4.1 Versione LUNGA — per pagine descrittive (FAQ, blog, come-funziona, Treasury doc)

**IT**:
> ROBI è over-collateralizzato per design. Ogni airdrop emette ROBI
> per il 90% dell'inflow al treasury, mentre il 10% resta come backing
> crescente — il treasury si rafforza più di quanto cresca la
> circolazione di ROBI, per costruzione. Il treasury è verificabile
> on-chain in tempo reale: chiunque può controllare quanto KAS è
> detenuto, quanti ROBI sono in circolazione, e il valore di backing
> implicito per ROBI. Il riscatto in KAS avviene al tasso corrente di
> backing.

**EN** (per mirror inglese):
> ROBI is over-collateralized by design. For every airdrop, ROBI are
> minted up to 90% of the treasury inflow, while 10% remains as
> growing backing — the treasury strengthens faster than ROBI
> circulation grows, by construction. The treasury is verifiable
> on-chain in real time: anyone can check the KAS held, the ROBI in
> circulation, and the implicit backing value per ROBI. Redemption in
> KAS happens at the current backing rate.

### 4.2 Versione MEDIA — per tooltip estesi, banner, descrizioni wallet, sezione ROBI di landing

**IT**:
> ROBI è over-collateralizzato per design e verificabile on-chain.
> Riscatto in KAS al tasso corrente di backing.

**EN**:
> ROBI is over-collateralized by design and verifiable on-chain.
> Redemption in KAS at the current backing rate.

### 4.3 Versione CORTA — per micro-copy, badge, label

**IT**:
> ROBI · over-collateralizzato · backing verificabile on-chain

**EN**:
> ROBI · over-collateralized · backing verifiable on-chain

## 5. Pattern di sostituzione tipici

Cinque pattern di sostituzione ricorrenti che CCP probabilmente
incontrerà. Per ognuno: cosa cercare, cosa sostituire, quale versione
canonica usare.

### 5.1 Pattern landing/FAQ — promessa di crescita

**Stale**:
> "I ROBI sono la valuta-reward di AIROOBI. Iniziano a crescere di
> valore nel tempo, perché ogni airdrop alimenta il Fondo Comune
> garantito che ne fa salire il valore."

**MiCA-conforme** (versione lunga §4.1):
> "I ROBI sono la valuta-reward di AIROOBI. Ogni ROBI è
> over-collateralizzato per design: per ogni airdrop, AIROOBI emette
> ROBI per il 90% dell'inflow al treasury, lasciando il 10% come
> backing crescente. Il treasury è verificabile on-chain in tempo
> reale. Il riscatto in KAS avviene al tasso corrente di backing."

### 5.2 Pattern tooltip wallet — descrizione asset

**Stale**:
> "ROBI: il tuo reward che cresce di valore nel tempo"

**MiCA-conforme** (versione media §4.2):
> "ROBI: reward over-collateralizzato, riscattabile in KAS al tasso
> corrente di backing"

### 5.3 Pattern explorer-robi / treasury page — descrizione meccanica

**Stale**:
> "Il valore del ROBI è garantito dal Fondo Comune e cresce ad ogni
> airdrop concluso, aumentando il backing per token."

**MiCA-conforme** (variante della §4.1, fattuale):
> "Il valore di backing per ROBI deriva dal Fondo Comune (treasury) e
> dal meccanismo di over-collateralization 90/10: per ogni airdrop,
> il 10% dell'inflow resta nel treasury senza emissione di ROBI
> aggiuntivi. Il valore di backing per ROBI è calcolato come
> [treasury totale] / [ROBI in circolazione] ed è verificabile
> on-chain in ogni istante."

### 5.4 Pattern blog/educational — narrativa di crescita

**Stale**:
> "Più la community cresce, più i ROBI valgono. È un cerchio virtuoso:
> partecipando agli airdrop fai crescere il valore dei tuoi ROBI."

**MiCA-conforme**:
> "Più la community partecipa agli airdrop, più il treasury si
> rafforza. Il design di AIROOBI prevede che, per ogni airdrop, il
> 10% dell'inflow resti nel treasury come backing senza emissione di
> ROBI aggiuntivi: il backing per ROBI cresce per costruzione. Il
> treasury è verificabile on-chain in tempo reale: ogni partecipante
> può controllare il rapporto treasury / ROBI in circolazione."

### 5.5 Pattern micro-copy — promessa nascosta

**Stale**:
> "Accumula ROBI ora — valgono ogni giorno di più."

**MiCA-conforme** (versione corta §4.3):
> "Accumula ROBI — over-collateralizzati, backing on-chain verificabile."

## 6. Note speciali

### 6.1 Pagina `explorer-robi.html` — proof-of-reserves in costruzione

L'explorer ROBI è il candidato naturale per ospitare il **proof-of-reserves
on-chain pubblico** descritto nel Position Paper §6 (treasury totale +
ROBI circolanti + valore implicito + over-collateralization ratio +
aggiornamento real-time + anchor on-chain).

Quella feature è nel RS Tokenomics CCP brief (§5 Proof-of-reserves) e
non è ancora live. Per LB-7, la pagina explorer va sterilizzata dal
linguaggio apprezzamento ma il testo descrittivo può già **anticipare**
la presenza futura del proof-of-reserves on-chain. Suggerimento copy:

> "Il backing per ROBI è verificabile on-chain. Treasury totale, ROBI
> in circolazione e over-collateralization ratio aggiornati in tempo
> reale [presto disponibili in questa pagina nella forma di proof-of-
> reserves pubblico, attualmente in costruzione]."

Quando la feature proof-of-reserves sarà live, basterà rimuovere la
nota tra parentesi quadre.

### 6.2 Sezione "Fondo Comune" — terminologia

Il "Fondo Comune" è terminologia consolidata di AIROOBI e va
preservata come **sinonimo affettivo del treasury**. Quello che cambia
è il **verbo associato**: "Fondo Comune **cresce** / **si rafforza**"
= OK (descrizione fattuale del treasury); "Fondo Comune **fa crescere
ROBI**" = NO (promessa di apprezzamento).

Pattern di riscrittura:
- "Il Fondo Comune fa crescere ROBI" → "Il Fondo Comune (treasury) si
  rafforza ad ogni airdrop, sostenendo il backing dei ROBI in
  circolazione"
- "Il tuo ROBI cresce grazie al Fondo Comune" → "I tuoi ROBI hanno
  backing dal Fondo Comune, verificabile on-chain"

### 6.3 Sezione "rullo ROBI" (GS-16) — non toccare

La copy del rullo ROBI ("il rullo ROBI", "ROBI nel rullo", "ROBI
trovato!") descrive una **meccanica** (blocchi con ROBI nascosto,
accredito istantaneo) ed è perfettamente neutra dal punto di vista
MiCA. **Non sostituire**, solo verificare che non ci siano frasi di
apprezzamento attaccate alla meccanica.

### 6.4 Sezione "come funziona airdrop" — coordinamento con LB-6 fase 2

`come-funziona-airdrop.html` è già stato toccato da LB-6 (§02 ARIA copy,
firmato sweep 25 May). LB-7 può intercettare residui ROBI value claim
che LB-6 non aveva nel mirino. Coordinamento: CCP verifica diff vs
versione post-LB-6, applica solo i pattern LB-7 senza re-toccare LB-6
content.

## 7. Cadenza esecutiva

Identica a LB-6 (provata e funzionante):

1. **CCP grep**: sweep tecnico delle frasi target su tutte le 9 superfici
   P1-P3
2. **CCP report hits**: lista degli hit con file + riga + frase
   originale (come `CCP_Ack_RS_LB6_ContentDebt_A2_B1_B10_Shipped` del
   25 May)
3. **CCP sostituisci** in-spirito usando il blocco canonico §4 e i
   pattern §5; bump footer + cache-bust `?v=` (lezione W4 Day 13)
4. **ROBY verifica UI-click** un campione di superfici a UI-click +
   spot check delle frasi residue; firma o reopen come per LB-6
5. **Closing bilaterale** quando sweep completato + verifica completata

Tempo stimato totale (cumulativo): ~4-6h CCP + ~1-2h ROBY verifica
(calibrazione [[feedback-roby-estimate-calibration]] applicata).

## 8. STOP+ASK per CCP

Nessuno bloccante. Tre flag opzionali da girare a ROBY se rilevati
durante il sweep:

- **F1**: pattern stale che NON rientra in §2.1-2.4 ma che a CCP sembra
  problematico → girare a ROBY per verdetto.
- **F2**: contesto in cui il blocco canonico §4 non si adatta (es.
  spazio molto stretto, formato grafico) → ROBY propone copy
  ad-hoc.
- **F3**: superfici aggiuntive non in §3 (es. email transazionali,
  push notification, video copy) → ROBY estende lo scope.

## RS — paste-ready

```
RS · LB-7 REGULATORY COPY DEBT SWEEP — MiCA-CONFORME

Brief completo:
ROBY-Stuff/for-CCP/ROBY_RS_LB7_RegulatoryCopyDebt_Sweep_2026-05-29.md

Riferimento canonico:
ROBY-Stuff/AIROOBI_Tokenomics_Integrity_PositionPaper_2026-05-29.md (v1.1) §7

GREP TARGET (case-insensitive, pattern espliciti P1):
- "ROBI cresce di valore"
- "il valore [del] ROBI cresce|aumenta"
- "ROBI si rivaluta"
- "ROBI crescerà"
- "ROBI [che] aumenta di valore"
- "apprezza[mento] ROBI"
- "Fondo Comune fa crescere ROBI"
- "Fondo Comune [che] cresce[re] il valore [del] ROBI"
- "investi in ROBI"
- "guadagnerai tenendo ROBI"
- "tieni ROBI per [guadagnare/farli crescere]"
+ pattern impliciti §2.2 (rischio medio): "ROBI investimento",
"ROBI asset speculativo", "ROBI rendimento", "prezzo ROBI sale"

SUPERFICI (P1→P3):
P1 — consumer-facing: home.html · dapp.html ·
     come-funziona-airdrop.html · come-guadagnare-punti-aria.html ·
     explorer-robi.html · faq.html
P2 — approfondimento: 04_blog_articles/ (ROBI-related,
     coordinamento con LB-6 fase 2)
P3 — admin/internal: abo.html (admin notes) · doc Treasury
     Methodology

NON in scope CCP: investor-pack/ (ROBY-led, separato).

BLOCCO CANONICO SOSTITUZIONE (3 versioni, scegli per contesto):
- LUNGA (FAQ/blog/come-funziona/Treasury doc): vedi §4.1
- MEDIA (tooltip/banner/wallet/landing ROBI section): vedi §4.2
- CORTA (micro-copy/badge/label): vedi §4.3
+ pattern di sostituzione §5 (5 casi tipici con esempi pre/post)
+ note speciali §6 (explorer-robi proof-of-reserves anticipato ·
  Fondo Comune terminology preserved · rullo ROBI non toccare ·
  come-funziona-airdrop coordinamento LB-6)

CADENZA (identica LB-6):
1. CCP grep + report hits per superficie
2. CCP applica sostituzione + bump footer + cache-bust
3. ROBY UI-click verifica + sign-off / reopen

STOP+ASK opzionali (F1/F2/F3 in §8 del brief): pattern fuori scope,
contesti incompatibili col blocco canonico, superfici aggiuntive
(email/push/video).

Tempo stimato: ~4-6h CCP + ~1-2h ROBY.

Verify-before-build + tech ownership CCP. Stop al primo segnale
ambiguo, ROBY è in chat per chiarimenti immediati.
```

## Bottom line

LB-7 è LB-6 fatto con la lente regulatory. Stesso pattern, stessa
cadenza, stesso protocollo. Cambia solo l'oggetto del sweep: invece
dei modelli earning aboliti, sterilizziamo il linguaggio di
apprezzamento ROBI per essere strutturalmente MiCA-conforme. Il
blocco canonico §4 (3 versioni) + i pattern di sostituzione §5
(5 casi tipici) coprono il 95% dei casi che CCP incontrerà. Il
restante 5% si chiude con i 3 STOP+ASK opzionali a ROBY.

Quando LB-7 sarà chiuso, AIROOBI avrà fatto un passo strutturale
verso la conformità MiCA — non come dichiarazione, ma come
**proprietà del prodotto**. È esattamente il pattern delle DeFi
sofisticate: il linguaggio è coerente col design, il design
sopporta la lettura ostile.

Audit-trail: questo file = RS ROBY LB-7 Regulatory Copy Debt Sweep ·
sterilizzazione linguaggio apprezzamento ROBI → linguaggio
MiCA-conforme (descrivere design, mai promettere prezzo · pattern
MakerDAO/DAI) · riferimento canonico Position Paper Tokenomics
Integrity v1.1 §7 + memoria ROBY feedback-mica-design-vs-promessa
· grep target ~12 pattern espliciti + 5 impliciti · scope 9
superfici P1-P3 (consumer landing/dApp/FAQ/come-funziona/explorer
robi + blog + abo + Treasury doc) · blocco canonico in 3 versioni
(lunga/media/corta) + 5 pattern di sostituzione tipici + 4 note
speciali (explorer-robi proof-of-reserves anticipato · Fondo Comune
terminology preserved verbo cambiato · rullo ROBI non toccare ·
come-funziona-airdrop coordinamento LB-6 fase 2) · cadenza identica
LB-6 (grep → report → sostituzione + bump footer + cache-bust → UI-
click verifica + sign-off) · 3 STOP+ASK opzionali F1-F3 (pattern
out-of-scope · contesti incompatibili · superfici extra email/push)
· tempo stimato 4-6h CCP + 1-2h ROBY · investor-pack escluso da
scope CCP (ROBY-led separato in passo successivo) · RS paste-ready
in §RS · stato: pronto per CCP triage + esecuzione.

---

*ROBY · Strategic MKT & Comms & Community · RS LB-7 Regulatory Copy Debt Sweep · 29 May 2026 · companion del Position Paper Tokenomics Integrity v1.1 · daje team a 4*
