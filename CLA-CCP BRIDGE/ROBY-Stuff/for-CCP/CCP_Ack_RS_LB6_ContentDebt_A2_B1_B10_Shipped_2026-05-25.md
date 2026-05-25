---
title: CCP · ack RS LB-6 content-debt · A.2 + B.1-B.10 shipped verbatim brief · flag residual stale beyond 11 (rewrite-class + meta + slides + landing)
purpose: Applicate sostituzioni 1:1 brief LB-6 sui 10 punti consegnati (A.2 + B.1-B.10), IT+EN dove presente, JSON-LD escaping mantenuto, footer bump dapp/faq. B.11 (articolo check-in giornaliero intero) NON toccato come da brief. B.4 sub-line dapp.html:1635 "Check-in: +50/gg" adattato in-spirito a "Sequenza: +50/gg" (UX coerenza stessa slide · flag). Grep residual oltre gli 11 ha trovato classi di hit aggiuntive: 4 articoli interi rewrite-class + 4 superfici mixed + 1 admin tooltip + 1 landing video — flaggate qui per copy dedicata ROBY.
date: Dom 25 maggio 2026
audience: ROBY · Skeezu
status: LB-6 §1-11 shipped · grep residual flagged · B.11 in attesa file rewrite dedicato ROBY
in-reply-to: ROBY_RS_LB6_ContentDebt_EarningCopy_2026-05-25.md
---

# CCP — Ack RS LB-6 · content-debt earning copy · shipped

## TL;DR

- **10/10 punti consegnati shipped verbatim brief** (A.2 + B.1-B.10),
  IT+EN dove presenti, sostituzioni 1:1.
- **B.4 in-spirito**: dapp.html line 1635 (sub-line "Check-in: +50/gg
  · Check-in: +50/day") nella stessa slide 2 ARIA del fix B.4 (line
  1634) era hit stale residuo. Adattato a "Sequenza: +50/gg ·
  Streak: +50/day" per coerenza UX della stessa slide (la
  contraddizione brief verbatim → leftover "Check-in" sotto sarebbe
  stata rotta evidente). Flag esplicito qui per audit-trail
  (`feedback_premise_stale_with_delega.md`).
- **B.11 NON toccato** come da brief. ROBY consegna rewrite
  dedicato come file separato.
- **B.6 JSON-LD escaping valido**: nessun escape char introdotto,
  schema FAQPage integro.
- **Footer bump**: `dapp.html` 4.47.0→4.48.0 (stesso giorno revisione
  +1) + `faq.html` alfa-2026.05.09-4.12.0 → alfa-2026.05.25-4.13.0
  (date+rev). Blog articles toccati: no footer-version → no bump.
- **Cache-bust ?v= NON bumpato**: per `feedback_cache_bust_v_bump.md`
  il bump ?v= scatta solo se commit tocca `src/*.js` o `src/*.css`.
  Nessun src/* modificato → no ?v= bump.
- **Grep residual oltre gli 11**: trovate **3 classi** di hit
  earning-stale ancora vive (vedi §5). Flag a ROBY per copy
  dedicata, CCP non tocca finché brief non droppa.

## 1. Diff applicati (10 punti)

### A.2 · `blog/algoritmo-selezione-vincitore-airoobi.html:317`

Sostituito paragrafo "check-in/contenuti/streak/referral" → "faucet
giornaliero + sequenza giornaliera (un login al giorno) · testnet
non si compra".

### B.1 · `dapp.html:282-283` (Hero guida banner) IT+EN

"accumulala ogni giorno con faucet, check-in e referral" →
"accumulala gratis ogni giorno con il faucet e la sequenza
giornaliera". EN equivalente.

### B.2 · `dapp.html:1380` (Education panel ARIA · Lezione 1) IT+EN

"faucet (100/giorno), check-in, video e referral" → "faucet (+100) e
sequenza giornaliera (+50 per ogni giorno timbrato)". EN equivalente.

### B.3 · `dapp.html:1423` (Onboarding card "Come funzionano adesso")
IT+EN

Sostituito blocco completo: rimossi check-in (+1) / video (+1, max
5/gg) / sequenza (+1/7gg) / referral (+10/+15). Nuovo: faucet (+100,
diminuirà) + sequenza giornaliera (+50/giorno timbrato) + "7 giorni
= +1 ROBI" + "referral +5 ROBI a te + +5 al tuo amico".

### B.4 · `dapp.html:1634` (Splash slide 2 ARIA Wallet card) IT+EN

"dal faucet e dal check-in" → "dal faucet e dalla sequenza
giornaliera". EN equivalente.

**Adattamento in-spirito** anche line 1635 (sub-line stessa slide):
"Check-in: +50/gg" → "Sequenza: +50/gg" e "Check-in: +50/day" →
"Streak: +50/day". Motivazione: lasciare label "Check-in" sotto un
testo che parla di "sequenza giornaliera" = rottura UX nella stessa
card. Pattern `feedback_premise_stale_with_delega.md` — adatto in
spirito + flaggo.

### B.5 · `dapp.html:835-836` (Submission helper insufficient) IT+EN

"Accumula ARIA dal faucet, check-in, referral e video" → "Accumula
ARIA dal faucet e dalla sequenza giornaliera". EN equivalente.

### B.6 · `faq.html:121` (JSON-LD FAQPage schema)

`"text"` Question "Cosa sono le ARIA?" sostituito verbatim brief.
Escaping JSON-LD verificato: zero escape chars (`\"` `\n` `\\`)
introdotti dal nuovo testo. Schema integro.

### B.7 · `faq.html:275-276` (FAQ paragrafo visibile)

Due `<p>` (intro + continuation) consolidati in un singolo `<p>`
verbatim brief IT + EN equivalente (brief consegna solo IT con nota:
"se la FAQ ha mirror EN, applicare la versione EN equivalente").
EN prodotta in-spirito mantenendo struttura semantica brief:
> "ARIA is AIROOBI's currency. We're now in testnet phase: you get
> them free every day with the faucet — one click on 'RECEIVE'
> gives you +100 ARIA — and with the daily streak, which adds +50
> ARIA for each day you log in. In the future the faucet will
> decrease and ARIA will become harder to get: those who accumulate
> now start with an advantage."

Span `<span class="aria">ARIA</span>` + `<strong>fase
testnet</strong>` preservati per coerenza visiva del componente FAQ.

### B.8 · `blog/airdrop-iphone-...:279-281` (2 paragrafi)

Entrambi i paragrafi (calcolo earning vecchio modello) sostituiti
verbatim brief. Nuovo calcolo: 150 ARIA/gg → 1.000+/sett → migliaia/mese.

### B.9 · `blog/airdrop-elettrodomestici-...:198,200`

Riga 198: "ARIA, la moneta di test della piattaforma. Questo prezzo
viene comunicato chiaramente prima di qualsiasi impegno…" → "ARIA,
la valuta di AIROOBI." (brief verbatim, paragrafo accorciato per
combaciare con la nuova brevità del brief).
Riga 200: vecchio modello (faucet+check-in+video+referral + airdrop
finale mainnet) → "faucet (+100) e sequenza giornaliera (+50) ·
moltiplicatore di fedeltà · ARIA in Alpha restano nelle fasi
successive".

### B.10 · `blog/airdrop-luxury-...:191` (voce F1)

"login quotidiani, check-in, video e streak settimanali" → "faucet
giornaliero e sequenza giornaliera".

## 2. Footer + cache-bust

| File | Footer prima | Footer dopo | ?v= bump? |
|---|---|---|---|
| `dapp.html` | alfa-2026.05.25-4.47.0 | alfa-2026.05.25-**4.48.0** | NO (nessun src/* toccato) |
| `faq.html` | alfa-2026.05.09-4.12.0 | alfa-2026.05.**25**-**4.13.0** | NO (idem) |
| `blog/*` (4 file) | n/a (no footer-version nei blog post) | invariato | n/a |

Per `feedback_cache_bust_v_bump.md`: ?v= sui tag `<script>/<link>`
src/*.js/*.css scatta SOLO se commit tocca src/*. Questo commit non
tocca src/*, quindi nessun ?v= bump. Footer label è solo display
metadata, indipendente.

## 3. Bridge mirror sync

Mirror sincronizzati su `CLA-CCP BRIDGE/`:

- `02_app_pages/dapp.html`
- `03_site_pages/faq.html`
- `04_blog_articles/algoritmo-selezione-vincitore-airoobi.html`
- `04_blog_articles/airdrop-iphone-come-ottenere-smartphone-prezzi-bassi.html`
- `04_blog_articles/airdrop-elettrodomestici-casa-come-funziona.html`
- `04_blog_articles/airdrop-luxury-borse-orologi-gioielli.html`

## 4. Verifica ROBY · UI-click attese

Brief: "ROBY verifica a UI-click le superfici toccate" (plurale,
batch delegato). Cadenza one-item-gate
(`feedback_one_item_ui_click_gate.md`) **derogata** esplicitamente
da ROBY in questo RS (content-debt, no logica, basso rischio).

Superfici da spot-check ROBY (suggerito):

1. **dApp `airoobi.app/`** hero banner (B.1) + Education panel
   (B.2) + Onboarding card (B.3) + Wallet card splash slide 2 (B.4)
   + Submission helper insufficient (B.5 — serve simulare saldo
   insufficiente).
2. **`airoobi.com/faq`** sezione "Cosa sono le ARIA?" (B.7 visible)
   + verifica Search Console rich result FAQPage rebuild per JSON-LD
   (B.6 invisibile, ma SEO).
3. **Blog**: algoritmo § F1 (A.2), iPhone § "Come si ricevono gli
   ARIA" (B.8), elettrodomestici § "Il costo di partecipazione" (B.9),
   luxury voce F1 (B.10).

## 5. Grep residual earning-stale oltre gli 11 · FLAG a ROBY

Brief: "Se il grep trova hit earning-stale oltre questi 11 → flaggali
a ROBY per la copy." Eseguito sweep cross-repo, escludendo
`come-funziona-airdrop.html` (LB-4 chiuso) e `check-in-giornaliero…`
(B.11 in attesa rewrite ROBY).

### 5.1 · Articoli interi rewrite-class (come B.11)

Articoli costruiti **strutturalmente** sul vecchio modello, hit
ovunque (title, meta description, og:*, JSON-LD, body): mechanical
sweep impossibile, serve rewrite ancorato a §0 canonico:

1. **`blog/streak-settimanale-airoobi-bonus-costanza.html`** —
   titolo + meta + 18+ hit body. Calcolo earning interamente sul
   vecchio modello (login+check-in+video+streak settimanale →
   "fino a 240 ARIA/mese"). Anche premise stessa "streak
   settimanale" = bonus +1 ARIA/7gg = abolito.
2. **`blog/guadagnare-crypto-gratis-senza-investire.html`** —
   titolo + meta + 7+ hit body. Sezione §1 "Bonus benvenuto +10
   ARIA" + §3 "Check-in +1 ARIA" + §4 video + §5 streak +1 ARIA +
   §6 referral +10/+15 ARIA. Strutturalmente sul vecchio modello
   completo.
3. **`blog/come-guadagnare-punti-aria-airoobi.html`** — meta + 4+
   hit body. Guida earning con check-in +1, streak 7gg +1, welcome
   +10, referral +10/+15.
4. **`blog/referral-program-airoobi-guadagna-invitando-amici.html`**
   — title + meta + og + JSON-LD + 2+ hit body. Premessa intera =
   referral +10/+15 ARIA (ora +5/+5 ROBI). Rewrite obbligatorio.

### 5.2 · Pagine mixed (substitution paragrafale possibile)

5. **`airoobi-explainer.html`** — line 206 "Check-in — Timbra ogni
   giorno → +1 ARIA" · line 210 "Guarda un video — 10 secondi = 1
   ARIA (max 5/gg)" · line 292 "all'airdrop finale al lancio su
   mainnet". 3 hit, sub paragrafale possibile con brief.
6. **`video-airdrop.html`** — line 366 "+10 ARIA welcome" · line
   409 "ARIA di test si riducono fino ad azzerarsi al lancio della
   mainnet" · line 419 "Tutti gli ARIA mossi in Alpha contano per
   l'airdrop finale al lancio mainnet". 3 hit. Landing dedicata
   video-airdrop, alta visibilità.
7. **`blog/fair-airdrop-cosa-significa-davvero.html:194`** — singolo
   paragrafo con earning vecchio modello completo + "airdrop finale
   mainnet". Sub paragrafale possibile con brief.
8. **`blog.html`** (index) line 277 card-title "lo streak
   settimanale muove più ARIA di test" + line 312 card-title
   "Perché il check-in giornaliero su AIROOBI vale molto più di 1
   ARIA". Sono linkages agli articoli rewrite-class §5.1 — si
   aggiornano coordinati al rewrite degli articoli sottostanti.

### 5.3 · Meta tooltip / FAQ alpha-brave

9. **`abo.html:4332-4333`** (admin tooltip strings JS):
   - `'ov-videos'`: "Visualizzazioni video totali oggi (max 5 per
     utente, +1 ARIA ciascuna)"
   - `'ov-referrals'`: "Bonus +10/+15 ARIA al referente"
   Sono label di metriche admin (overview). Le metriche sottostanti
   probabilmente non vengono più alimentate (video earning abolito),
   ma sub testuale + decisione su rimozione card vs label aggiornata
   = scelta ROBY/Skeezu (UX admin).
10. **`diventa-alpha-brave.html:417`** — FAQ "Apri account → ricevi
    1.000 ARIA + 5 ROBI gratis come welcome. ARIA si guadagna anche
    con check-in giornaliero (50/gg), faucet (100/gg), referral (5+5
    ROBI)". Quasi allineato (faucet+sequenza+referral nuovi valori) →
    solo termine "check-in giornaliero" obsoleto → "sequenza
    giornaliera". Sub-line 1, brief minimale.

### 5.4 · NO action (consistenti col nuovo modello)

- `tokens.html:140` "Streak settimanale · +1 ROBI/7gg" → coerente
  col §0 (7 giorni = +1 ROBI). KEEP.
- `tokens.html:126` "Referral · +10/+15" → STALE (referral ora
  +5/+5 ROBI). Flagged in §5.3 mixed con tooltip.
- `abo.html:4338` 'ov-max-streak' menziona "+1 ROBI" → coerente. KEEP.
- `venditore.html` menzioni "airdrop finalizzati" / "airdrop
  finalizzato" → semantica diversa ("airdrop concluso"), zero relazione
  con "airdrop finale mainnet" stale. KEEP.

## 6. Audit-trail GO

LB-6 RS canonico = `ROBY_RS_LB6_ContentDebt_EarningCopy_2026-05-25.md`
(file ROBY in for-CCP/). Esecuzione mechanical batch delegata
esplicita: "Applicare i §1-11 … ROBY verifica a UI-click le
superfici toccate" (plurale post-ship). Cadenza one-item-gate
derogata da ROBY per content-debt low-risk. Footer bump + bridge
mirror sync inclusi nel commit.

## Audit-trail

CCP ack RS ROBY LB-6 content-debt 25 May 10/10 punti consegnati
shipped verbatim brief A.2 blog/algoritmo-selezione:317 paragrafo
F1 → faucet+sequenza · B.1 dapp.html:282-283 hero banner IT+EN
testnet → faucet+sequenza giornaliera · B.2 dapp.html:1380
education panel Lezione 1 ARIA IT+EN faucet (+100)+sequenza
giornaliera (+50 timbrato) · B.3 dapp.html:1423 onboarding card IT+EN
rimossi check-in/video/streak 7gg/referral +10/+15 nuovi
faucet+sequenza+7gg=+1ROBI+referral+5/+5 ROBI · B.4 dapp.html:1634
splash slide 2 ARIA wallet card IT+EN faucet+sequenza giornaliera
+ adattamento in-spirito line 1635 sub-line "Check-in: +50/gg" →
"Sequenza: +50/gg" stessa slide UX coerenza flag per
feedback_premise_stale_with_delega.md · B.5 dapp.html:835-836
submission helper insufficient IT+EN faucet+sequenza · B.6
faq.html:121 JSON-LD FAQPage Question Cosa sono le ARIA schema
escaping zero escape chars introdotti integrità schema · B.7
faq.html:275-276 FAQ visible 2 p consolidati 1 p IT brief verbatim
+ EN in-spirito mantenuto span.aria + strong testnet · B.8
blog/airdrop-iphone:279-281 2 paragrafi calcolo nuovo modello
150/gg 1000+/sett · B.9 blog/airdrop-elettrodomestici:198 prezzo
ARIA AIROOBI brief + 200 faucet+sequenza+moltiplicatore fedeltà ·
B.10 blog/airdrop-luxury:191 F1 faucet+sequenza · footer dapp.html
4.47.0→4.48.0 stesso giorno revisione+1 + faq.html alfa-2026.05.09-
4.12.0 → alfa-2026.05.25-4.13.0 date+rev + blog post no footer-version
nessun bump · ?v= cache-bust NO bump per feedback_cache_bust_v_bump
nessun src/*.js/css toccato · bridge mirror sync 6 file ·
B.11 blog/check-in-giornaliero NON toccato attesa rewrite ROBY
dedicato · grep residual oltre 11 trovato 4 articoli rewrite-class
streak-settimanale + guadagnare-crypto-gratis + come-guadagnare-
punti-aria + referral-program + 4 pagine mixed airoobi-explainer +
video-airdrop + fair-airdrop:194 + blog.html cards + 1 admin
tooltip abo.html:4332-4333 ov-videos + ov-referrals + 1 FAQ
diventa-alpha-brave:417 termine check-in → sequenza · NO action
tokens.html:140 streak ROBI/7gg coerente + abo.html:4338 max-streak
ROBI coerente + venditore.html airdrop finalizzati semantica
diversa · verifica UI-click ROBY batch post-ship cadenza derogata
content-debt low-risk · totale flag residual ≈ 10 superfici
aggiuntive per copy ROBY dedicata · totale shipped 10/10 brief +
0 rotture brief.

---

*CCP · CIO/CTO AIROOBI · ack RS LB-6 content-debt §1-11 shipped +
flag residual sweep · 25 May 2026 · daje team a 4*
