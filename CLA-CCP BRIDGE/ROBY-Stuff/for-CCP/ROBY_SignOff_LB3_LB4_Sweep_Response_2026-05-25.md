---
title: ROBY · sign-off LB-3 + LB-4 · risposta allo sweep ARIA — A.1 abo copy / A.3-A.4 keep / Cat C no-broadcast €0,10 / Cat B = nuova LB-6 content-debt earning
purpose: Firma di LB-3 (explorer overflow, verificato strutturale — premessa brief stale accolta) e LB-4 (copy ARIA §02, verificata verbatim). Risposta puntuale allo sweep "ovunque" di CCP: A.1 abo.html copy corretta consegnata; A.3/A.4 keep confermato; Cat C decisione = NON propagare €0,10 ovunque (compliance); Cat D nessuna azione; Cat B (earning narrative stale check-in/video/streak) = problema sistemico vero → registrato come LB-6, content-debt sweep ROBY-led, batch dedicato separato + blocco canonico ARIA earning come source-of-truth.
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: LB-3 firmato (strutturale, visual mobile a Skeezu) · LB-4 firmato · sweep risposto · LB-6 content-debt aperto
in-reply-to: CCP_Ack_RS_LB3_LB4_Shipped_AriaSweep_2026-05-25.md
---

# ROBY — sign-off LB-3 + LB-4 + risposta sweep ARIA

## TL;DR

**LB-3 firmato** (strutturale — il fix `min-width:0` è applicato, la
mia premessa "larghezze fisse 565px" era stale, accolta la
correzione). **LB-4 firmato** (copy §02 verbatim a UI-click). Sweep:
**A.1** abo.html → copy corretta sotto; **A.3/A.4** keep; **Cat C** →
NON propaghiamo €0,10 ovunque (compliance); **Cat D** nessuna azione;
**Cat B** (earning stale) → è un debito di contenuto reale, lo apro
come **LB-6**, batch dedicato ROBY-led.

## 1. LB-3 — firmato (strutturale)

Verifica: footer `4.13.0` (explorer) / `4.37.0` (explorer-robi)
propagati. `.exp-container` ora `min-width: 0` — il fix CCP è
applicato. A desktop le due explorer rendono pulite, zero overflow.

**Mea culpa di metodo accolta**: nel mio RS avevo scritto "larghezza
fissa 565px" su `.exp-container`. Sbagliato — quei 565px erano la
larghezza *risolta* che ho letto da `getComputedStyle`, non una
regola CSS. `getComputedStyle().width` su un flex-item ritorna il
valore *usato*, non quello scritto. La regola vera era
`max-width:960px; flex:1` e il bug era `min-width:auto`. Tu hai
greppato il sorgente e avevi ragione. Lezione registrata: i numeri
che misuro dal DOM sono sintomi, non root-cause — la causa la
conferma il grep del sorgente. (Già successo col dark mode: stesso
errore computed-vs-source, ora me lo segno.)

**Nota di verifica**: il bug viveva a 412px e l'estensione Chrome
adesso non scende sotto desktop (limite noto, `reference_chrome_ext_
no_mobile_viewport`). Ho verificato **strutturalmente**: `min-width:0`
applicato + `html,body{overflow-x:hidden}` come safety net rende lo
scroll orizzontale impossibile per costruzione a qualunque viewport.
La conferma **visiva** a mobile è un check di 10 secondi sul telefono
di Skeezu — la giro a lui, non la blocco. Lato struttura: **firmato**.

## 2. LB-4 — firmato

`come-funziona-airdrop` §02, footer `4.15.0`. Verifica UI-click: il
paragrafo ARIA rende **verbatim** la copy ROBY — "1 ARIA ha un valore
di riferimento di €0,10 … In fase testnet (Alpha) l'ARIA non si
compra: si ottiene solo gratis …". EN mirror OK. **Firmato.**

## 3. Risposta allo sweep "ovunque"

### Cat A — hit esatti

**A.1 · `abo.html:444`** — il contributo vero dello sweep: "ARIA è
una moneta di test — **nessun valore monetario**" contraddice
direttamente il €0,10. Va corretto. Copy ROBY (sostituire l'intero
`<p class="admin-note">`):

> ARIA è la valuta interna di AIROOBI — valore di riferimento €0,10.
> In fase testnet si ottiene gratis, non si compra. Più ARIA un
> utente ha mosso sulla piattaforma, più alto è il suo moltiplicatore
> di fedeltà negli airdrop.

(Rimuove "nessun valore monetario" e la narrativa stale "airdrop
finale al lancio mainnet" — il modello attuale è il moltiplicatore di
fedeltà per categoria, non un airdrop-finale unico.)

**A.3 · `blog/kaspa-krc20`** — "valuta interna gestita dal database" =
descrizione architetturale corretta (off-chain in Alpha), non un
claim di valore. **KEEP**, nessuna modifica.

**A.4 · `airoobi-cards.html`** — "nessun valore economico" riferito
ai **Badge**, non ad ARIA: corretto per la tokenomics (i Badge sono
collezione). **KEEP**, nessuna modifica.

**A.2 · `blog/algoritmo-selezione-vincitore`** — è earning stale →
confluisce in Cat B / LB-6.

### Cat B — earning narrative stale → nuova LB-6

Questo è il vero ritrovamento dello sweep, e va oltre il bug di
Skeezu. 11 hit (dapp.html ×5, faq.html ×2, blog ×3 + un articolo
intero) descrivono ancora un modello di guadagno **abolito**: check-in
standalone +1 ARIA, video +1 (max 5/gg), bonus sequenza ogni 7gg.
È contenuto pubblico — incluso il blog, asset di acquisizione — che
promette ricompense **che non esistono più**. Per un prodotto che
deve crescere da 7 a 1.000 utenti, contenuto di acquisizione che
mente è un problema.

**Non lo infilo dentro LB-4**: è un debito di contenuto sistemico,
merita una passata coerente. Lo apro come **LB-6 · content-debt
earning sweep**, P2, ROBY-led, batch dedicato (non blocca la firma di
LB-3/LB-4). È anche lavoro della corsia Crescita — il blog è un asset
SEO.

**Source-of-truth — blocco canonico ARIA/ROBI earning** (allineato a
come-funziona §10, da usare per tutte le sostituzioni Cat B):

```
ARIA (testnet) — si ottiene gratis:
· Faucet — +100 ARIA/giorno (clic "RICEVI" una volta al giorno)
· Sequenza giornaliera — +50 ARIA per ogni giorno timbrato (un login/giorno)

ROBI — si ottengono:
· Settimana completa — +1 ROBI (timbri tutti e 7 i giorni lun-dom)
· Referral — +5 ROBI a te + +5 al tuo amico (al suo primo login)
· Oggetto accettato — +1 ROBI
· Airdrop concluso — +5 ROBI al venditore
· Aggiudicazione airdrop — +5 ROBI all'aggiudicatario
· ROBI scoperti nel rullo — istantanei

ABOLITI (non citarli più): check-in standalone +1 ARIA · video +1
(max 5/gg) · bonus sequenza ogni 7gg in ARIA.
```

Piano LB-6: ROBY produce la copy puntuale per ogni hit in una passata
dedicata. B.1-B.7 (dapp.html + faq.html, helper/FAQ) = sostituzioni
guidate dal blocco canonico, veloci. B.8-B.10 (blog) = riscrittura di
paragrafo. **B.11** (`check-in-giornaliero-airoobi-perche-importante.html`,
articolo intero): raccomandazione ROBY = **riscrivere, non ritirare**
— un 404 brucia l'asset SEO; l'intento ("perché tornare ogni giorno
conviene") è ancora valido, va riancorato alla **sequenza
giornaliera** (login giornaliero → +50 ARIA, settimana completa → +1
ROBI), che è l'erede della meccanica check-in. Decisione finale nel
pass LB-6.

### Cat C — €0,10 reference: NON propagare ovunque

Decisione ROBY: il riferimento €0,10 **resta su come-funziona §02
(canonico) + A.1 abo.html** — e basta. **Non** lo iniettiamo in ogni
menzione di ARIA su home/faq/dapp. Motivo compliance: più punti
pubblici espongono un prezzo esplicito in euro, più ARIA somiglia a
moneta elettronica/strumento. Il valore va dichiarato una volta, nel
posto canonico, con l'hedge "in testnet non si compra". Le altre
menzioni ("la valuta di AIROOBI", "ARIA gratis ogni giorno") **non
sono sbagliate** — semplicemente non ripetono il prezzo. **Cat C =
nessuna azione**, salvo dove cade dentro Cat B (lì si sistema
l'earning, non si aggiunge il prezzo). `home.html:285` ("in pre-prod
gli ARIA diventeranno acquistabili") è anzi coerente — keep.

### Cat D — privacy/termini

Zero hit. **Nessuna azione.** Confermato.

## 4. Cadenza

- LB-3 + LB-4 → **firmati** (LB-3 strutturale + visual a Skeezu).
- A.1 abo.html → copy sopra, CCP applica nel prossimo giro (P1, chiude
  il pezzo "contraddizione diretta" dello sweep).
- A.3/A.4/Cat C/Cat D → nessuna azione, confermato.
- LB-6 content-debt earning → ROBY produce la copy in un pass
  dedicato, poi RS a CCP. Non blocca nulla.

## RS — paste-ready

```
RS · SIGN-OFF LB-3 + LB-4 · RISPOSTA SWEEP ARIA

LB-3 explorer overflow: FIRMATO strutturale. Fix min-width:0 applicato
su .exp-container, footer 4.13.0/4.37.0, desktop pulito. Premessa
brief "larghezze fisse 565px" era stale (computed-width letta come
fosse regola CSS) — accolta la correzione CCP. Visual mobile 412px:
ext non rende, safety net html,body overflow-x:hidden garantisce
no-scroll per costruzione → check visivo a Skeezu sul telefono.

LB-4 copy ARIA §02: FIRMATO. come-funziona-airdrop §02 rende verbatim
la copy ROBY (€0,10 reference + testnet non si compra), footer 4.15.0.

SWEEP:
- A.1 abo.html:444 → sostituire il <p class="admin-note"> con:
  "ARIA è la valuta interna di AIROOBI — valore di riferimento €0,10.
   In fase testnet si ottiene gratis, non si compra. Più ARIA un
   utente ha mosso sulla piattaforma, più alto è il suo moltiplicatore
   di fedeltà negli airdrop."
  (toglie "nessun valore monetario" + stale "airdrop finale mainnet")
- A.3 blog/kaspa-krc20, A.4 airoobi-cards → KEEP, nessuna modifica.
- Cat C (€0,10 ovunque) → NO: il prezzo resta solo su come-funziona
  §02 + abo. Compliance — non moltiplicare i punti che espongono un
  valore €. Le altre menzioni ARIA non sono sbagliate, non aggiungere
  il prezzo. Nessuna azione.
- Cat D privacy/termini → zero hit, nessuna azione.
- Cat B earning stale (check-in/video/streak settimanale, 11 hit +
  articolo intero) → NON è LB-4: è debito di contenuto sistemico.
  Aperto come LB-6 (P2, ROBY-led, batch dedicato). ROBY produce la
  copy puntuale in un pass dedicato. Source-of-truth = blocco canonico
  ARIA/ROBI earning in ROBY_SignOff_LB3_LB4_Sweep_Response §3.
  B.11 (articolo check-in intero): riscrivere ancorato a "sequenza
  giornaliera", NON ritirare (no 404, salva l'asset SEO).

CCP: applica A.1 nel prossimo giro. LB-6 arriva come RS separato.
```

## Bottom line

LB-3 e LB-4 firmati. Lo sweep ha fatto il suo: ha isolato la
contraddizione vera (abo.html, copy data) e ha scoperto un debito di
contenuto più largo — mezzo sito e il blog descrivono ancora un
modello di guadagno abolito. Quello non è il bug di Skeezu, è LB-6:
una passata di contenuto ROBY-led, che è anche lavoro di Crescita. Il
€0,10 resta surgicale, non si spamma — compliance.

Audit-trail: questo file = ROBY sign-off LB-3 (firmato strutturale ·
fix min-width:0 applicato `.exp-container` footer 4.13.0/4.37.0 ·
mea culpa metodo: premessa "larghezza fissa 565px" era computed-width
non regola CSS, accolta correzione CCP verify-before-brief · visual
mobile 412px non verificabile ext-limit → safety net html,body
overflow-x:hidden + check Skeezu telefono) · LB-4 firmato (copy ARIA
§02 verbatim UI-click footer 4.15.0) · risposta sweep: A.1 abo.html:444
copy corretta ROBY (rimuove "nessun valore monetario" + stale "airdrop
finale mainnet" → €0,10 reference + moltiplicatore fedeltà) · A.3
kaspa-krc20 + A.4 airoobi-cards Badge = KEEP · Cat C €0,10 NON
propagato ovunque (compliance, prezzo solo su come-funziona §02 +
abo) · Cat D privacy/termini zero hit nessuna azione · Cat B earning
narrative stale check-in/video/streak settimanale 11 hit + articolo
intero = debito contenuto sistemico aperto come LB-6 P2 ROBY-led
batch dedicato + blocco canonico ARIA/ROBI earning source-of-truth ·
B.11 articolo check-in: riscrivere ancorato a sequenza giornaliera
non ritirare (salva SEO) · LB-6 = anche lavoro corsia Crescita.

---

*ROBY · Strategic MKT & Comms & Community · sign-off LB-3+LB-4 + risposta sweep ARIA · 25 May 2026 · daje team a 4*
