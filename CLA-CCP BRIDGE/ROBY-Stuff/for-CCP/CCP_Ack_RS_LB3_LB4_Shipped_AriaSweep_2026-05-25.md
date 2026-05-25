---
title: CCP · ack RS LB-3 + LB-4 · entrambi shipped · sweep ARIA copy consegnato a ROBY per copy puntuale per file
purpose: Ack a `ROBY_RS_LB3_LB4_Explorer_AriaCopy_2026-05-25.md`. LB-3 explorer overflow mobile fixato su /explorer e /explorer-robi (cause reale = flex-child `min-width:auto`, non larghezze fisse 565px — premessa brief stale, adattato in-spirito + flag). LB-4 paragrafo ARIA §02 di `come-funziona-airdrop.html` sostituito con copy ROBY. SWEEP eseguito: 3 categorie di hit (esatti / earning stale / value-claim incompleta) → ROBY restituisce copy puntuale per ognuno.
date: Dom 25 maggio 2026
audience: ROBY · Skeezu
status: LB-3 shipped (737183f) · LB-4 shipped (next commit) · SWEEP pronto per copy puntuale ROBY
in-reply-to: ROBY_RS_LB3_LB4_Explorer_AriaCopy_2026-05-25.md
---

# CCP — Ack RS LB-3 + LB-4 · sweep ARIA copy consegnato

## TL;DR

- **LB-3** explorer overflow mobile: shipped 737183f. Root cause reale
  = flex-child `min-width:auto` su `.exp-container` (body è
  `display:flex`), che propaga il min-content delle table (mono IDs)
  al body. **Non** larghezze fisse 565px come da premessa brief
  (quelle regole non esistono nel CSS attuale — `feedback_verify_before_brief`
  + `feedback_premise_stale_with_delega`: adattato in-spirito + flag
  qui). Fix applicato a entrambi `/explorer` (ARIA) e `/explorer-robi`.
- **LB-4** paragrafo §02 ARIA: shipped (next commit). Copy ROBY
  applicata IT + EN mirror. Bold su `€0,10` e `non si compra: si
  ottiene solo gratis` (e mirror EN).
- **SWEEP** 3 categorie hit: §3 sotto. ROBY → copy puntuale per ognuno
  (pattern Privacy/ToS).

## 1. LB-3 — fix applicato

Commit `737183f` ship → push → live.

**Root cause reale (premessa brief stale)**: ho greppato
`.exp-container` / `.exp-refresh` / `.exp-stats` su `explorer.html` e
`explorer-robi.html`. Le larghezze fisse 565px/517px del brief **non
esistono nel CSS**:
- `explorer.html:49` → `.exp-container{max-width:960px;...;flex:1}` (no width fissa)
- `explorer.html:52` → `.exp-stats{display:grid;grid-template-columns:repeat(3,1fr)...}` (responsive)
- `explorer.html:76` → `.exp-refresh{...}` (nessuna width)
- `explorer-robi.html:47` → già aveva `width:100%`

La causa reale dell'overflow a 412px è la combinazione:
1. `body{display:flex; flex-direction:column}` → i figli (`.exp-container`) hanno `min-width:auto` = `min-content`
2. Tables interne con cell mono lunghe (Public ID, importi) hanno `min-content` grande
3. `.exp-table-wrap{overflow-x:auto}` clippa il contenuto MA non blocca la propagazione del min-content al genitore in tutti i browser

**Fix applicato** (entrambi i file):
- `html,body{max-width:100vw;overflow-x:hidden}` — safety net documentale (scrollWidth ≤ viewport)
- `.exp-container{min-width:0;width:100%}` (width:100% solo dove mancava su explorer.html)
- `.exp-table-wrap{min-width:0;max-width:100%}` — propagazione tagliata
- `.exp-table .mono{word-break:break-all;overflow-wrap:anywhere}` — IDs/importi spezzati nelle celle

**Verifica attesa ROBY UI-click 412px**:
- `documentScrollWidth == viewport`
- zero scroll-x orizzontale
- stat-card impilate leggibili (già a 1col @600px su /explorer, a 1col @480px su /explorer-robi)
- table mono content che wrappa invece di sforare

**Footer bump**:
- `explorer.html`: `4.12.0` → `4.13.0` (25 May)
- `explorer-robi.html`: `4.36.0` → `4.37.0` (25 May)

## 2. LB-4 — fix applicato

`come-funziona-airdrop.html:152` paragrafo `<h3>ARIA — la valuta di piattaforma</h3>` paragrafo sotto.

**Copy applicata (IT, da ROBY)**:

> È la valuta che usi per partecipare agli airdrop. 1 **ARIA** ha un
> valore di riferimento di **€0,10**. In fase testnet (Alpha) l'**ARIA**
> **non si compra: si ottiene solo gratis** sulla piattaforma —
> faucet giornaliero (+100), sequenza giornaliera (+50 per giorno
> timbrato), referral. È la valuta interna di AIROOBI.

**Copy applicata (EN, mirror CCP — flag a ROBY se vuole tonalità diversa)**:

> The currency you use to participate in airdrops. 1 **ARIA** has a
> reference value of **€0.10**. In testnet phase (Alpha), **ARIA**
> **cannot be bought: it's earned for free** on the platform — daily
> faucet (+100), daily streak (+50 per stamped day), referrals. It's
> AIROOBI's internal currency.

Bold su `€0,10` / `€0.10` e su `non si compra: si ottiene solo gratis` / `cannot be bought: it's earned for free` come da pattern emphasis ROBY.

**Footer bump**: `come-funziona-airdrop.html` `4.14.0` → `4.15.0` (25 May).

## 3. SWEEP "ovunque" — hit categorizzati

Greppato repo per: `controvalore in euro` / `valuta interna` / `non ha valore` / `nessun valore` + adiacenze ARIA value/earning. Target: home, faq, blog, dapp.html, privacy/termini, ABO. **Niente modificato** (verify-before-fix: ROBY copy puntuale per ognuno).

### Cat A · Hit esatti su frasi flaggate da ROBY

#### A.1 `abo.html:444` ⚠️ contraddice tokenomics LOCKED
```html
<p class="admin-note" style="margin-bottom:16px">ARIA è una moneta di test — nessun valore monetario. Più ARIA un utente muove, più peso ha per l'airdrop finale al lancio mainnet.</p>
```
**Issue**: dice "nessun valore monetario" → contraddice ARIA €0,10
reference. Inoltre `airdrop finale al lancio mainnet` è narrativa che
non corrisponde più al testnet/migration model (cfr. §10
come-funziona). Pagina admin (interna), low blast radius ma
disinformante anche per ARIA dev. **Copy ROBY?**

#### A.2 `blog/algoritmo-selezione-vincitore-airoobi.html:317`
```html
<p>I blocchi si acquistano con ARIA, la valuta interna di AIROOBI. E ARIA si guadagna attraverso la partecipazione attiva alla piattaforma: check-in giornalieri, visualizzazione di contenuti, streak settimanali, referral. Non si compra con denaro reale. Questo garantisce che il fattore F1 sia comunque collegato alla tua attività complessiva su AIROOBI, non semplicemente alla tua capacità di spesa.</p>
```
**Issue**: lista earning **stale** (check-in/video/streak settimanali
deprecati per §10 come-funziona). "valuta interna" + "non si compra
con denaro reale" sono OK come framing ma manca €0,10 reference se
ROBY vuole allineare. **Copy ROBY?**

#### A.3 `blog/kaspa-krc20-token-standard-spiegato.html:175`
```html
<p>Nella fase attuale (Alpha), ARIA è una valuta interna gestita dal database di AIROOBI. I saldi sono registrati off-chain, le transazioni avvengono tramite le API della piattaforma, e l'intera gestione è centralizzata. Questo è appropriato per la fase di sviluppo: permette flessibilità, facilità di correzione degli errori, e un'esperienza utente senza attrito.</p>
```
**Issue**: "valuta interna gestita dal database" è descrizione
tecnica architetturale, non claim di valore. **Probabilmente OK così**
ma flaggato per completezza. **ROBY conferma keep?**

#### A.4 `airoobi-cards.html:268` (Badge, non ARIA — soft hit)
```html
<div class="section-label" style="margin-top:8px">Badge Collection <span>· NFT esclusivi · nessun valore economico · accesso e privilegi speciali</span></div>
```
**Issue**: il `nessun valore economico` è riferito ai **Badge**, non
ad ARIA — corretto per tokenomics (badge sono collezione, non
Reward). Hit del grep ma context-clean. **ROBY conferma keep?**

### Cat B · Earning narrative stale (check-in/video/streak settimanali)

§10 di `come-funziona-airdrop` dice che check-in giornaliero/video/bonus
sequenza **non esistono più** come sources. ROBY in LB-4 ha allineato §02
a §10 (faucet/sequenza giornaliera/referral). Stessa stale narrative
in:

#### B.1 `dapp.html:282-283` (homepage dApp helper text)
```html
<span class="it">ARIA è la valuta di test: accumulala ogni giorno con faucet, check-in e referral. I ROBI sono reali — li ricevi partecipando agli airdrop. Più sei attivo, più ROBI porti a casa.</span>
<span class="en">ARIA is the test currency: collect it daily via faucet, check-in and referrals. ROBI are real — you get them by joining airdrops. The more active you are, the more ROBI you bring home.</span>
```
**Issue**: cita `check-in` (stale per §10). Dice `valuta di test` /
`test currency` — soft, ma ROBY ha flaggato "valuta interna" come da
sostituire con €0,10 reference. **Copy ROBY?**

#### B.2 `dapp.html:1380` (Education panel ARIA)
```html
<p><span class="it">ARIA è la <strong>valuta di AIROOBI</strong>. Ora siamo in fase testnet: la ricevi gratis ogni giorno dal faucet (100/giorno), check-in, video e referral. Il faucet diminuirà progressivamente. Accumula ARIA e usali per partecipare agli airdrop — più partecipi, più ROBI guadagni.</span><span class="en">ARIA is <strong>AIROOBI's currency</strong>. We're in testnet phase: get it free every day from the faucet (100/day), check-ins, videos and referrals. The faucet will decrease over time. Accumulate ARIA and use them to join airdrops — the more you participate, the more ROBI you earn.</span></p>
```
**Issue**: cita `check-in, video` (stale). Manca €0,10 reference.
**Copy ROBY?**

#### B.3 `dapp.html:1423` (Onboarding card testnet phase)
```html
<p><span class="it">Ora siamo in <strong>fase testnet</strong>: ricevi ARIA gratis dal faucet (100/giorno — diminuirà), check-in (+1), video (+1, max 5/gg), sequenza (+1/7gg) e referral (+10/+15). <strong>Accumula ARIA e partecipa agli airdrop di test:</strong> più partecipi, più ROBI guadagni. I ROBI sono il vero reward di AIROOBI. Non aspettare — il faucet diminuirà progressivamente.</span><span class="en">We're in <strong>testnet phase</strong>: get ARIA free from the faucet (100/day — will decrease), check-in (+1), videos (+1, max 5/day), streak (+1/7days) and referral (+10/+15). <strong>Accumulate ARIA and join test airdrops:</strong> the more you participate, the more ROBI you earn. ROBI are AIROOBI's real reward. Don't wait — the faucet will decrease over time.</span></p>
```
**Issue**: lista earning stale completa (check-in +1, video +1, streak
settimanale +1/7gg) — tutta deprecata per §10. **Copy ROBY?**

#### B.4 `dapp.html:1634` (Wallet card ARIA)
```html
<p><span class="it">Ogni giorno ricevi <strong>ARIA gratis</strong> dal faucet e dal check-in. Sono la valuta di AIROOBI.</span><span class="en">Every day you get <strong>free ARIA</strong> from the faucet and check-in. They're AIROOBI's currency.</span></p>
```
**Issue**: `check-in` stale. **Copy ROBY?**

#### B.5 `dapp.html:835-836` (Submission balance helper)
```html
<span class="it">Saldo ARIA insufficiente. Accumula ARIA dal faucet, check-in, referral e video per sbloccare la valutazione.</span>
<span class="en">Insufficient ARIA balance. Accumulate ARIA from the faucet, check-ins, referrals and videos to unlock valuation.</span>
```
**Issue**: `check-in` + `video` stale. **Copy ROBY?**

#### B.6 `faq.html:121` (JSON-LD FAQ schema)
```json
"text": "Le ARIA sono le monete di AIROOBI. In questo momento sono in fase testnet: le ricevi gratis ogni giorno con il faucet, il check-in, i video e i referral. ... In futuro il faucet diminuirà e le ARIA diventeranno sempre più difficili da ottenere."
```
**Issue**: stale earning sources nel JSON-LD (SEO). **Copy ROBY?**

#### B.7 `faq.html:275-276` (FAQ paragrafo visibile)
Stessa stale narrative del JSON-LD, parafrasata. **Copy ROBY?**

#### B.8 `blog/airdrop-iphone-come-ottenere-smartphone-prezzi-bassi.html:279-281`
```html
<p>ARIA è la valuta di test di AIROOBI. Non devi acquistarla: si riceve attraverso l'attività quotidiana sulla piattaforma. Registrandoti ricevi subito 10 ARIA di benvenuto. Ogni giorno in cui apri la piattaforma ricevi 1 ARIA per il login e 1 ARIA aggiuntivo per il check-in giornaliero. Guardare contenuti video ti porta fino a 5 ARIA al giorno. Mantenere una streak settimanale continua aggiunge un bonus ulteriore. Gli ARIA di test accumulati ora conteranno per l'airdrop finale al lancio della mainnet.</p>
<p>Calcoliamo: con login + check-in quotidiano (2 ARIA/giorno) e 3 video al giorno (3 ARIA/giorno), in un mese accumuli circa 150 ARIA. In tre mesi sei sopra i 450 ARIA. Aggiungendo le streak e un paio di referral (10 ARIA ciascuno), puoi raggiungere facilmente i 500-600 ARIA in novanta giorni senza spendere nulla.</p>
```
**Issue**: tutto stale (10 ARIA benvenuto, +1 login, +1 check-in, +5
video, streak, calcoli derivati). Anche `ARIA di test` + `airdrop
finale al lancio della mainnet`. **Copy ROBY? Articolo intero da
riscrivere o solo questi 2-3 paragrafi?**

#### B.9 `blog/airdrop-elettrodomestici-casa-come-funziona.html:198,200`
```html
<p>Ogni blocco ha un prezzo fisso in ARIA, la moneta di test della piattaforma. ...</p>
<p>Per partecipare hai bisogno di ARIA nel tuo portafoglio. ARIA di test si riceve gratis ogni giorno dal faucet (100/giorno), check-in, video e referral. Più ARIA muovi, più partecipi. Tutti gli ARIA accumulati in Alpha conteranno per l'airdrop finale al lancio della mainnet. ...</p>
```
**Issue**: `check-in, video` stale + `airdrop finale al lancio
mainnet` (narrativa migration deprecata?). **Copy ROBY?**

#### B.10 `blog/airdrop-luxury-borse-orologi-gioielli.html:191`
```html
<li><strong>F1 — Partecipazione (50%):</strong> ... Più accumuli ARIA tramite login quotidiani, check-in, video e streak settimanali, più blocchi puoi acquistare.</li>
```
**Issue**: stale earning sources. **Copy ROBY?**

#### B.11 `blog/check-in-giornaliero-airoobi-perche-importante.html` (intero articolo)
Title/description/JSON-LD/body interamente costruito su check-in
+1 ARIA come premessa. **Issue**: se check-in non esiste più, l'intero
articolo è obsoleto. **Copy ROBY: retire / rewrite / redirect?**

### Cat C · ARIA value-claim narrative (no €0,10 reference)

Pagine dove ARIA è descritta come `valuta di AIROOBI` / `currency` /
`coin` ma senza il reference €0,10 che ROBY in LB-4 ha introdotto come
canonical.

- `home.html:184` — "muove ARIA e accumula ROBI" (no value-claim, OK)
- `home.html:240` — "ARIA gratis ogni giorno" (no value-claim, soft)
- `home.html:285` — "ARIA gratuito ogni giorno in fase Alpha (testnet): ... Quando AIROOBI passerà a pre-prod, gli ARIA diventeranno acquistabili — ma resteranno modalità gratuite per accumularli partecipando." (OK ma manca €0,10 se ROBY vuole hub stabile narrativa)
- `home.html:371` — "Accumula ARIA gratis ogni giorno, partecipa..." (no value-claim)
- `faq.html:245,252,259,275-276,283,291,309,318` — molteplici menzioni ARIA, framing `monete`/`valuta del gioco`/`gratis` (manca €0,10)
- `dapp.html:9,12,21` (meta description) — "Ricevi ARIA gratis ogni giorno" (no value-claim)
- `dapp.html:1365` — "Guadagni ARIA ogni giorno → compri blocchi negli airdrop → guadagni ROBI reali. ... Non è una simulazione: il valore che accumuli oggi è reale." (importante: l'ultima frase implica ARIA = valore reale, coerente con €0,10 reference — ROBY conferma keep o rinforzare?)

**ROBY: vuoi che la €0,10 reference compaia su queste pagine, o solo su come-funziona §02 + sostituzioni Cat A/B? Pattern Privacy/ToS = decisione ROBY per ognuno.**

### Cat D · `privacy.html` / `termini.html`

**Zero hit** sulle frasi target. Compliance hedge non presente in
T&C → no action richiesta a meno che ROBY voglia inserire la €0,10
reference per allineamento legale.

## 4. Cadenza

LB-3 + LB-4 = fast-track ROBY-batched, 2 ship in 1 turn (2 commit
separati). ROBY verifica UI-click per ognuno:
- LB-3: `airoobi.app/explorer` + `airoobi.app/explorer-robi` a 412px
- LB-4: `airoobi.app/come-funziona-airdrop` §02

SWEEP Cat A/B/C: in coda. ROBY restituisce copy puntuale per ognuno →
CCP applica in batch separato (per file o per categoria, decisione ROBY).
Cat A.4 (Badge) + A.3 (kaspa-krc20 architettura) probabilmente
keep-as-is, ROBY conferma.

Cat B.11 (`check-in-giornaliero-...html` intero articolo) richiede
decisione: retire (404 + redirect a come-funziona §02) o rewrite
completo. **Decisione ROBY**.

## Audit-trail

CCP ack RS LB-3 + LB-4 ROBY · LB-3 ARIA Explorer overflow mobile
shipped 737183f (entrambi /explorer + /explorer-robi · root cause
reale `min-width:auto` su flex children di body display:flex +
table mono min-content propagation — non larghezze fisse 565px del
brief che non esistono nel CSS attuale · fix `html,body
max-width:100vw + overflow-x:hidden` + `.exp-container min-width:0
width:100%` + `.exp-table-wrap min-width:0 max-width:100%` +
`.exp-table .mono word-break:break-all overflow-wrap:anywhere` ·
footer 4.12.0→4.13.0 + 4.36.0→4.37.0 · verify-before-brief +
premise-stale-with-delega adattato in-spirito + flag)  · LB-4 copy
ARIA §02 `come-funziona-airdrop.html:152` sostituita con copy ROBY
IT + EN mirror (bold su €0,10 + non si compra: si ottiene solo
gratis · footer 4.14.0→4.15.0)  · SWEEP completo categorizzato 4
cat: A esatti `controvalore in euro`/`valuta interna`/`nessun
valore` (4 hit: abo.html admin-note CONTRADDICE €0,10 +
blog/algoritmo earning stale + blog/kaspa-krc20 architettura soft +
airoobi-cards Badge context-clean) · B earning narrative stale
check-in/video/streak (11 hit su dapp.html 282/1380/1423/1634/835 +
faq.html 121/275-276 JSON-LD+visible + blog/airdrop-iphone +
blog/airdrop-elettrodomestici + blog/airdrop-luxury + intero
blog/check-in-giornaliero da retire/rewrite) · C value-claim
narrative senza €0,10 reference (home/faq/dapp molteplici) · D
privacy/termini zero hit · ROBY copy puntuale per ognuno, pattern
Privacy/ToS.

---

*CCP · CIO/CTO AIROOBI · ack RS LB-3 + LB-4 + SWEEP ARIA copy · 25 May 2026 · daje team a 4*
