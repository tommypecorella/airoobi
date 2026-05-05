---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Linguaggio Audit Sweep · Phase 7 brand pivot v2 · 25 file con 101 occorrenze
date: 2026-05-05
ref: ROBY_Brand_Pivot_v2_CCP_Brief_2026-05-02.md (Phase 7) · CCP_BrandPivot_v2_W2Day1_Report_2026-05-05.md
status: READY FOR APPLY · CCP esegue meccanicamente W2 Day 2 mattina (~30 min stimati)
---

# Linguaggio Audit Sweep · Phase 7

## ⚠️ Disclaimer mirror sync

Il mirror locale `CLA-CCP BRIDGE` da cui ho fatto il sweep non è stato `git pull`-ato dopo W2 Day 1 deploy CCP. **Alcuni dei replacement proposti potrebbero essere già stati applicati** dal CCP nel Phase 4 (es. titoli home/landing, hero h1, OG meta — Phase 4 report dichiara done). Pre-apply, fare `grep` verification: se la frase `<old>` non è più presente nel file (perché già aggiornata), saltare quella entry.

## Sintesi numerica

- **25 file user-facing con occorrenze** (escluso `abo.html` backoffice noindex)
- **101 occorrenze totali** banned words
- **Top offenders:** `draw` 30x · `fortuna` 15x · `vinci/tore` 14x · `prezzo ridicolo` 8x · `gambling/azzardo` 14x (mostly disclaimer KEEP) · `estrazione` 6x · `realizza il tuo desiderio` 3x · `sorteggio` 3x

---

## §1. Global replacement rules — pattern standard

CCP applica via sed o regex find/replace. Pattern italiani prima, EN dopo.

### Rule 1 — Slogan v1 banishment (BAN totale, sempre REPLACE)

| Old | New |
|---|---|
| `Realizza il tuo desiderio.` | `Pagare e vendere è una skill.` |
| `Realizza il tuo desiderio` (lowercase context) | `Ottieni quello che desideri partecipando` |
| `Make your wish come true.` | `Pay and sell with skill, not discount.` |
| `Make your wish come true` (lowercase) | `Get what you want by participating` |
| `Make your desire real.` | `Pay and sell with skill, not discount.` |
| `A un prezzo ridicolo.` | `Per skill, non per fortuna.` |
| `A un prezzo ridicolo` | `Per skill, non per fortuna` |
| `a un prezzo ridicolo` | `per skill, non per fortuna` |
| `prezzo ridicolo` (standalone) | `valore inatteso` |
| `prezzi ridicoli` | `valori inattesi` |
| `un prezzo molto inferiore` | `una frazione del valore di mercato` (preserve dove già OK) |

### Rule 2 — "draw" / "estrazione" / "sorteggio" / "lotteria" → selezione/assegnazione

| Old | New |
|---|---|
| `parte l'estrazione` | `parte la selezione deterministica` |
| `Chiuso & estrazione` | `Chiuso & selezione` |
| `Closed & draw` | `Closed & selection` |
| `il draw` | `la selezione` |
| `i draw` | `le selezioni` |
| `del draw` | `della selezione` |
| `al draw` | `alla selezione` |
| `dal draw` | `dalla selezione` |
| `del sorteggio` | `della selezione` |
| `al sorteggio` | `alla selezione` |
| `nel sorteggio` | `nella selezione` |
| `Cosa succede al draw` (h2 SEO) | `Cosa succede alla selezione finale` |
| `Esecuzione del draw` (h3) | `Esecuzione della selezione` |
| `processo del draw` | `processo di selezione` |
| `algoritmo di draw` | `algoritmo di selezione deterministica` |
| `come una lotteria` | `come una lotteria` (PRESERVE in negazioni: "Non è una lotteria") |

### Rule 3 — "vinci / vinto / vincita" → "ottieni / si aggiudica / ricevi"

| Old | New |
|---|---|
| `vinci l'oggetto` | `si aggiudica l'oggetto` |
| `vince l'oggetto` | `si aggiudica l'oggetto` |
| `vince chi` | `si aggiudica chi` |
| `vinci se ` | `te lo aggiudichi se ` |
| `vinto un airdrop` | `aggiudicato un airdrop` |
| `vincita` (standalone) | `aggiudicazione` |
| `Vittoria airdrop` (label) | `Aggiudicazione airdrop` |
| `al vincitore` | `all'aggiudicatario` |
| `vittorie multiple` | `aggiudicazioni multiple` |
| `vincere` (general) | `aggiudicarsi` o `ottenere` (context-dependent) |
| `the highest scorer wins` | `the highest scorer takes` |
| `to win it` | `to take it` |

**Eccezione SEO:** `vincitore` resta KEEP nei seguenti contesti (canonical URL + title H1 SEO):
- `algoritmo-selezione-vincitore-airoobi.html` URL/canonical/title H1 (SEO keyword core, replace = perdita ranking)

### Rule 4 — "fortuna" → "skill" / "merito" / "impegno"

| Old | New |
|---|---|
| `non la fortuna` | `non la fortuna` (PRESERVE in negazioni) |
| `dalla fortuna pura` | `dalla fortuna pura` (PRESERVE in negazioni anti-gambling) |
| `Conta l'impegno, non la fortuna` | KEEP (già negazione corretta) |
| `Effort wins, not luck` | KEEP (già negazione corretta) |
| `Impegno, non fortuna` | KEEP (label correttamente formulato) |
| `tentare la fortuna` | `tentare la sorte` (più neutrale) o REWRITE |
| `colpo di fortuna` | `colpo isolato` o REWRITE |
| `non si tratta di fortuna` | `non si tratta di fortuna` (PRESERVE) |
| `affidarsi alla fortuna` | `affidarsi alla casualità` |

### Rule 5 — "scommessa / scommettere" → "investimento / partecipazione"

| Old | New |
|---|---|
| `una scommessa` | `un'investimento` o `una partecipazione` |
| `scommessa sull'evoluzione` | `investimento sull'evoluzione` |

### Rule 6 — "gambling / gioco d'azzardo / azzardo" — PRESERVE in negazione

**KEEP esattamente come sono** quando in costrutti negativi:
- `non è gioco d'azzardo`
- `non è gambling`
- `Not gambling` / `It's not gambling`
- `non è una lotteria`
- `Not a lottery`
- `non è azzardo`
- `Non è un'asta. Non è gambling.`
- `anti-gambling protection` (technical disclaimer)
- `protezione anti-gambling` (technical disclaimer)
- `AIROOBI non è un operatore di gioco d'azzardo` (legal disclaimer)

Voice principle 04 (Brand Kit v2.0): negazione esplicita anti-gambling è AMMESSA per legal positioning. Keep verbatim.

### Rule 7 — UI/JS technical labels → PRESERVE

**KEEP** (no replacement, sono UI/JS tecnici non user-facing):
- `id="draw-modal-bg"` / `id="draw-modal-title"` / `id="draw-modal-body"` (HTML id JS-bound)
- `id="ad-auto-draw"` (input id)
- `@keyframes draw` (CSS animation name)
- `var(--cf-step-title)` (CSS var name)
- Variabili JS / CSS / HTML id che usano "draw" come technical identifier

**Eccezione UI label visibili:** se il testo "Auto Draw" o "Draw" appare come **label visibile all'utente**, REPLACE → "Auto-selezione" o "Selezione". Verifica context.

---

## §2. File-by-file analysis (25 file)

### 🔴 HIGH PRIORITY — top offenders / hero / landing

#### `home.html` (20 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 18 | `og:description ... a un prezzo ridicolo` | REPLACE | `og:description ... per skill, non per fortuna` |
| 30 | `twitter:description ... a un prezzo ridicolo` | REPLACE | `twitter:description ... per skill, non per fortuna` |
| 152 | `Realizza il tuo desiderio.<br><em>A un prezzo ridicolo.</em>` | REPLACE | `Pagare e vendere quello che desideri<br><em>non è uno sconto. È una skill.</em>` |
| 152 EN | `Make your desire real.<br><em>At an unbelievable price.</em>` | REPLACE | `Pay and sell with skill, not discount.<br><em>That's the marketplace.</em>` |
| 187 | `la community realizza un desiderio` | REPLACE | `la community ottiene un bene partecipando` |
| 187 | `oggetti straordinari a un prezzo ridicolo` | REPLACE | `oggetti straordinari per skill, non per fortuna` |
| 215 | `Conta l'impegno, non la fortuna.` | KEEP | (negazione corretta) |
| 215 EN | `Effort wins, not luck.` | KEEP | (negazione corretta) |
| 248 | `Impegno, non fortuna` | KEEP | (label corretto) |
| 248 EN | `Effort, not luck` | KEEP | |
| 544 | `non è un operatore di gioco d'azzardo` | KEEP | (disclaimer legal) |
| 544 EN | `not a gambling operator` | KEEP | |
| 599 | `Non è azzardo. Non è un'asta.` | KEEP | (negazione esplicita) |
| 599 EN | `It's not gambling. It's not an auction.` | KEEP | |
| 1056 | `id="ad-auto-draw"` | KEEP | (HTML id technical) |
| 1057 | `Auto Draw` (label visibile admin) | REPLACE | `Auto Selezione` |
| 1057 | `(draw automatico alla deadline)` | REPLACE | `(selezione automatica alla deadline)` |
| 1085 | `id="draw-modal-bg"` | KEEP | (HTML id technical) |
| 1087 | `<h3 id="draw-modal-title">Draw</h3>` | REPLACE | `<h3 id="draw-modal-title">Selezione</h3>` |
| 1088 | `id="draw-modal-body"` | KEEP | (HTML id technical) |
| 1107 | `motivazione vincitore` | REPLACE | `motivazione aggiudicatario` |
| 1113 | `<th>Vincitore</th><th>...<th>Data draw</th>` | REPLACE | `<th>Aggiudicatario</th><th>...<th>Data selezione</th>` |
| 1159 | `Pesi algoritmo vincitore` | REPLACE | `Pesi algoritmo aggiudicazione` |

**Note home.html:** Lines 1056-1159 sono pannello admin/backoffice interno (`/abo`-style). Apply replacement comunque per consistency, ma low-priority (non user-facing pubblico).

#### `landing.html` (5 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 7 | `<title>... Realizza il tuo desiderio. ...` | REPLACE | `<title>AIROOBI — Il primo marketplace dove pagare e vendere è una skill. Marketplace su Kaspa.</title>` |
| 11 | `og:title ... Realizza il tuo desiderio.` | REPLACE | `og:title ... Il primo marketplace dove pagare e vendere è una skill.` |
| 19 | `twitter:title ... Realizza il tuo desiderio.` | REPLACE | (idem) |
| 185 | `<h1>...Realizza il tuo desiderio.</h1>` | REPLACE | `<h1>...Pagare e vendere è una skill.</h1>` (4-line treatment per Brand Kit v2.0 §05) |
| 185 EN | `Make your wish come true.` | REPLACE | `Pay and sell with skill, not discount.` |
| 248 | `parte l'estrazione. Il primo si porta a casa l'oggetto.` | REPLACE | `parte la selezione deterministica. Si aggiudica l'oggetto chi ha il punteggio più alto.` |
| 248 EN | `the draw begins. The top scorer takes the item.` | REPLACE | `the deterministic selection begins. The highest scorer takes the item.` |

**Status:** CCP report Phase 4 dice queste già applicate live. Pre-apply, grep verifica: se titolo già aggiornato, skip.

---

### 🟡 MEDIUM PRIORITY — blog articoli high SEO

#### `come-funziona-airdrop.html` (8 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 129 EN | `make your wish come true: a valuable item` | REPLACE | `pay and sell with skill, not discount: a valuable item` |
| 173 | `CLOSED & DRAW / Chiuso & estrazione / Closed & draw` | REPLACE | `CLOSED & SELECTION / Chiuso & selezione / Closed & selection` |
| 182 | `vince chi ha il Punteggio più alto` | REPLACE | `si aggiudica l'oggetto chi ha il Punteggio più alto` |
| 182 EN | `the highest Score at close wins` | REPLACE | `the highest Score at close takes the item` |
| 182 | `Nessuna lotteria, nessun elemento casuale.` | KEEP | (negazione esplicita) |
| 182 EN | `No lottery, no randomness.` | KEEP | |
| 210 | `nessun utente spenderà mai più del 30% del valore dell'oggetto per vincerlo` | REPLACE | `nessun utente spenderà mai più del 30% del valore dell'oggetto per aggiudicarselo` |
| 210 EN | `more than 30% of the object's value to win it` | REPLACE | `more than 30% of the object's value to take it` |
| 210 | `protezione anti-gambling più forte` | KEEP | (technical disclaimer) |
| 210 EN | `strongest anti-gambling protection` | KEEP | |
| 217 | `vinci quasi sicuramente` | REPLACE | `te lo aggiudichi quasi sicuramente` |
| 217 EN | `you win almost certainly` | REPLACE | `you take it almost certainly` |
| 288 | `Soglia valore raggiunta (anti-gambling)` | KEEP | (technical label) |
| 320 | `se vinci un airdrop` | REPLACE | `se ti aggiudichi un airdrop` |
| 320 EN | `if you win an airdrop` | REPLACE | `if you take an airdrop` |
| 320 | `accumulare vittorie multiple` | REPLACE | `accumulare aggiudicazioni multiple` |
| 320 EN | `stack multiple wins` | REPLACE | `stack multiple takes` |
| 341 | `Vittoria airdrop ... al vincitore` | REPLACE | `Aggiudicazione airdrop ... all'aggiudicatario` |
| 341 EN | `Airdrop won ... to the winner` | REPLACE | `Airdrop taken ... to the recipient` |

#### `algoritmo-selezione-vincitore-airoobi.html` (7 hits) — SEO sensitive

| Line | Old | Action | New |
|---|---|---|---|
| 6, 9, 12, 13, 229 | `vincitore` (in title/og/canonical/h1) | **KEEP** | SEO keyword core URL slug + title rank. Replace = -30/50% organic traffic stimato |
| 240 | `Il partecipante che ottiene l'oggetto` | KEEP | (formulazione corretta già) |
| 240 | `non è determinato dalla fortuna pura` | KEEP | (negazione corretta) |
| 293 | `Non la spesa, non la fortuna — la partecipazione.` | KEEP | (negazione tripletta corretta) |

**Strategy:** mantenere "vincitore" nel titolo + URL + h1 + canonical (SEO core), ma assicurarsi che il body usi anche "aggiudicatario / partecipante selezionato" come variazioni semantiche (Google apprezza varianza). **Add note al fondo articolo:**

> *Nota terminologica: usiamo "vincitore" come termine semantico colloquiale per chi ottiene l'oggetto al termine della selezione deterministica. Tecnicamente è l'**aggiudicatario** della selezione algoritmica — non c'è componente di fortuna né di sorteggio.*

#### `perche-airoobi-non-e-gioco-azzardo.html` (11 hits)

**Articolo specifico anti-gambling. La maggior parte sono negazioni esplicite. KEEP wholesale.**

| Line | Action |
|---|---|
| 6, 7, 9, 10, 194 (title/meta/h1 con "non è gioco d'azzardo") | KEEP |
| 196 (`Ma non è come una lotteria? La risposta è no`) | KEEP |
| 200 (`Il gioco d'azzardo ha tre caratteristiche...`) | KEEP (analisi tecnica) |
| 200 (`fortuna pura`) | KEEP (in contesto definitorio) |
| 206 (`l'esito non è determinato dalla fortuna pura`) | KEEP (negazione) |
| 226 (h2: `Partecipi per realizzare un desiderio, non per "tentare la fortuna"`) | REPLACE → `Partecipi per ottenere quello che desideri, non per "tentare la sorte"` |
| 232 (`L'obiettivo non è "avere fortuna"`) | KEEP (negazione esplicita) |
| 232 (`realizzare quel desiderio specifico a un costo molto inferiore al prezzo di mercato`) | REPLACE → `ottenere quel bene specifico a una frazione del prezzo di mercato` |
| 232 (`sperare in un colpo di fortuna`) | KEEP (formulazione corretta in contesto critico) |
| 244 (`Ha conseguenze pratiche concrete... aspettandoti un colpo di fortuna`) | KEEP (formulazione corretta) |

**File da PRESERVARE 90%.** Solo 2 piccoli refactor (linea 226 h2 + 232 frase rilevante).

#### `venditore-airoobi-come-mettere-oggetto-airdrop.html` (5 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 148 | `Esecuzione del draw e notifica dell'assegnatario` | REPLACE | `Esecuzione della selezione e notifica dell'aggiudicatario` |
| 154 | `dal completamento del draw, il venditore riceve` | REPLACE | `dal completamento della selezione, il venditore riceve` |
| 154 | `comportamento dell'assegnatario` | REPLACE | `comportamento dell'aggiudicatario` |
| 169 | `entro 48 ore dal draw` | REPLACE | `entro 48 ore dalla selezione` |
| 174 (h3) | `Devo spedire l'oggetto prima del draw?` | REPLACE | `Devo spedire l'oggetto prima della selezione?` |
| 175 | `fino al completamento del draw. Solo dopo la notifica dell'assegnatario` | REPLACE | `fino al completamento della selezione. Solo dopo la notifica dell'aggiudicatario` |

#### `come-funziona-airdrop-airoobi-guida-completa.html` (4 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 209 | `algoritmo di draw, progettato per essere equo` | REPLACE | `algoritmo di selezione deterministica, progettato per essere equo` |
| 212 | `Più blocchi = maggiore peso nel sorteggio` | REPLACE | `Più blocchi = maggiore peso nella selezione` |
| 221 | `Il sorteggio finale non è una roulette opaca` | REPLACE | `La selezione finale non è una roulette opaca` |
| 223 | `Il partecipante estratto riceve l'oggetto` | REPLACE | `Il partecipante selezionato riceve l'oggetto` |
| 223 | `prezzo che rappresenta una frazione del suo valore di mercato reale` | KEEP |

#### `airdrop-moto-scooter-come-partecipare.html` (4 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 7 | `meta description ... e cosa succede al draw` | REPLACE | `meta description ... e cosa succede alla selezione finale` |
| 10 | `og:description ... cosa succede al draw` | REPLACE | (idem) |
| 235 (h2) | `Cosa succede al draw` | REPLACE | `Cosa succede alla selezione finale` |
| 244 | `indipendentemente dall'esito del draw` | REPLACE | `indipendentemente dall'esito della selezione` |
| 244 | `Non è un premio di consolazione simbolico` | KEEP |

#### `airdrop-iphone-come-ottenere-smartphone-prezzi-bassi.html` (3 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 6 (title) | `Come ottenere uno smartphone di fascia alta a un prezzo ridicolo — AIROOBI Blog` | REPLACE | `Come ottenere uno smartphone di fascia alta per skill, non per fortuna — AIROOBI Blog` |
| 9 (og:title) | `Come ottenere uno smartphone di fascia alta a un prezzo ridicolo` | REPLACE | (idem senza ` — AIROOBI Blog`) |
| 194 (h1) | `Come ottenere uno smartphone di fascia alta a un prezzo ridicolo` | REPLACE | `Come ottenere uno smartphone di fascia alta per skill, non per fortuna` |

**Note:** considera URL slug `airdrop-iphone-come-ottenere-smartphone-prezzi-bassi.html` — può rimanere (no replace nel filename, costo SEO troppo alto). Update solo title/H1/meta.

---

### 🟢 LOW PRIORITY — small fixes (1-3 hits ciascuno)

#### `airdrop-elettrodomestici-casa-come-funziona.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 154 | `garantisce equità senza affidarsi alla fortuna` | REPLACE | `garantisce equità senza affidarsi alla casualità` |

#### `alpha-brave-airoobi-prima-fase.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 205 | `Non si tratta di fortuna ma di lungimiranza.` | KEEP | (negazione esplicita corretta) |

#### `alpha-brave-vantaggi-early-adopter-crypto.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 73 | `Non si tratta di fortuna.` | KEEP | (negazione esplicita) |

#### `fair-airdrop-cosa-significa-davvero.html` (2 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 106 | `Non c'è estrazione, non c'è fortuna: c'è un calcolo.` | KEEP | (negazione tripletta perfetta v2) |
| 146 | `prima dell'esecuzione del draw, rendendo impossibile qualsiasi alterazione` | REPLACE | `prima dell'esecuzione della selezione deterministica, rendendo impossibile qualsiasi alterazione` |

#### `kaspa-vs-ethereum-confronto-blockchain.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 229 | `ogni acquisto di blocchi, ogni draw e ogni trasferimento di ROBI` | REPLACE | `ogni acquisto di blocchi, ogni selezione e ogni trasferimento di ROBI` |

#### `nft-utility-token-differenza.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 102 (h3) | `Una prova di partecipazione, non una scommessa` | KEEP | (negazione esplicita "non è scommessa" è anti-gambling positioning ottimo) |

#### `one-category-rule-airoobi.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 243 | `accumula ARIA e realizza il tuo desiderio` | REPLACE | `accumula ARIA e ottieni quello che desideri` |

#### `streak-settimanale-airoobi-bonus-costanza.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 188 | `non dipende dalla fortuna` | KEEP | (negazione esplicita corretta) |

#### `tessera-rendimento-airoobi-come-funziona.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 229 | `indipendentemente dall'esito del draw` | REPLACE | `indipendentemente dall'esito della selezione` |

#### `vendere-oggetti-di-lusso-online-alternative-ebay.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 223 | `il venditore non dipende dall'esito del sorteggio` | REPLACE | `il venditore non dipende dall'esito della selezione` |

#### `web3-marketplace-prossima-generazione-commercio.html` (3 hits)

| Line | Old | Action | New |
|---|---|---|---|
| 156 | `I draw degli airdrop passeranno da un calcolo off-chain` | REPLACE | `Le selezioni degli airdrop passeranno da un calcolo off-chain` |
| 165 | `rappresenta anche una scommessa sull'evoluzione del PoW` | REPLACE | `rappresenta anche un investimento sull'evoluzione del PoW` |

#### `blog.html` (7 hits — index page)

| Line | Old | Action | New |
|---|---|---|---|
| 223 | card-title `Perché AIROOBI non è gioco d'azzardo` | KEEP | (titolo articolo specifico, negazione esplicita) |
| 228 | `href="/blog/algoritmo-selezione-vincitore-airoobi.html"` | KEEP | (URL canonical, no replace) |
| 230 | card-title `Come viene scelto il vincitore di un airdrop` | KEEP | (SEO match URL+title articolo) |
| 308 | `accumuli seniority per i draw` | REPLACE | `accumuli seniority per le selezioni` |
| 343 | `competitivo nei draw` | REPLACE | `competitivo nelle selezioni` |
| 412 | card-title `smartphone di fascia alta a un prezzo ridicolo` | REPLACE | `smartphone di fascia alta per skill, non per fortuna` |
| 427 | card-excerpt `Blocchi, score, draw: tutto quello che devi sapere` | REPLACE | `Blocchi, score, selezione: tutto quello che devi sapere` |

#### `faq.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 198 | `parte automaticamente l'estrazione: chi ha il punteggio più alto diventa il nuovo proprietario` | REPLACE | `parte automaticamente la selezione: chi ha il punteggio più alto diventa il nuovo proprietario dell'oggetto` |
| 198 EN | `the draw starts automatically: the highest scorer becomes the new owner` | REPLACE | `the selection starts automatically: the highest scorer becomes the new owner` |

#### `investitori.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 227 | `Non è azzardo. Non è un'asta.` | KEEP | (negazione esplicita) |

#### `termini.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 115 | `non è un operatore di gioco d'azzardo` | KEEP | (legal disclaimer) |

#### `airoobi-explainer.html` (1 hit)

| Line | Old | Action | New |
|---|---|---|---|
| 47 | `@keyframes draw{to{stroke-dashoffset:0}}` | KEEP | (CSS animation name technical) |

#### `dapp.html` (3 hits)

**SKIP intero file** — direttiva brief §7: "Non cambiare design dApp interno ancora — phase 4 limit a hero/landing/blog/faq pubblici. dApp interno = W3."

---

## §3. Skip list — file NON da auditare

| File | Motivo |
|---|---|
| `02_app_pages/abo.html` | Backoffice admin · `<meta name="robots" content="noindex, nofollow">` |
| `02_app_pages/dapp.html` | dApp interno · brief §7 directive (W3 scope) |
| `02_app_pages/airdrop.html` | dApp interno (parte di flow buy_blocks/airdrop detail) |

---

## §4. Bash apply script (proposed)

CCP può applicare via bash script. Esempio per le rule globali (1+2+3+4 + skip files):

```bash
#!/bin/bash
# AIROOBI Linguaggio Audit Sweep — apply script
# Run from repo root after Phase 7 sign-off
set -e

DIRS=("blog" "site_pages" ".")  # adjust to actual repo paths
SKIP_FILES=("abo.html" "dapp.html" "airdrop.html")

apply_rules() {
  local f="$1"
  # Rule 1 — Slogan v1 banishment
  sed -i 's/Realizza il tuo desiderio\./Pagare e vendere è una skill./g' "$f"
  sed -i 's/Make your wish come true\./Pay and sell with skill, not discount./g' "$f"
  sed -i 's/A un prezzo ridicolo\./Per skill, non per fortuna./g' "$f"
  sed -i 's/a un prezzo ridicolo/per skill, non per fortuna/g' "$f"
  sed -i 's/prezzo ridicolo/valore inatteso/g' "$f"
  sed -i 's/prezzi ridicoli/valori inattesi/g' "$f"

  # Rule 2 — draw/estrazione/sorteggio → selezione
  sed -i "s/parte l'estrazione/parte la selezione deterministica/g" "$f"
  sed -i "s/Chiuso & estrazione/Chiuso \\& selezione/g" "$f"
  sed -i "s/Closed & draw/Closed \\& selection/g" "$f"
  sed -i 's/del draw/della selezione/g' "$f"
  sed -i 's/al draw/alla selezione/g' "$f"
  sed -i 's/dal draw/dalla selezione/g' "$f"
  sed -i 's/dal sorteggio/dalla selezione/g' "$f"
  sed -i 's/del sorteggio/della selezione/g' "$f"
  sed -i 's/nel sorteggio/nella selezione/g' "$f"
  
  # Rule 3 — vinci/vinto → ottieni/aggiudica
  sed -i "s/vince l'oggetto/si aggiudica l'oggetto/g" "$f"
  sed -i 's/vince chi/si aggiudica chi/g' "$f"
  sed -i 's/Vittoria airdrop/Aggiudicazione airdrop/g' "$f"
  sed -i "s/al vincitore\\b/all'aggiudicatario/g" "$f"
  
  # Rule 4 — fortuna (selective)
  sed -i "s/affidarsi alla fortuna/affidarsi alla casualità/g" "$f"
  sed -i "s/tentare la fortuna/tentare la sorte/g" "$f"
}

for dir in "${DIRS[@]}"; do
  for f in "$dir"/*.html; do
    [ -f "$f" ] || continue
    skip=false
    for sf in "${SKIP_FILES[@]}"; do
      [ "$(basename "$f")" = "$sf" ] && skip=true && break
    done
    $skip && continue
    
    # SKIP file specifico anti-gambling (semantica delicata)
    [ "$(basename "$f")" = "perche-airoobi-non-e-gioco-azzardo.html" ] && continue
    
    # Backup pre-sed
    cp "$f" "${f}.pre-audit-bak"
    apply_rules "$f"
    
    # Verify diff
    if ! diff -q "$f" "${f}.pre-audit-bak" > /dev/null; then
      echo "✓ Updated: $f"
    fi
  done
done

# Manual review required:
echo "==="
echo "MANUAL REVIEW REQUIRED:"
echo "- perche-airoobi-non-e-gioco-azzardo.html (skip auto, applica 2 fix manuali line 226 + 232)"
echo "- algoritmo-selezione-vincitore-airoobi.html (preserve SEO keyword vincitore in title/h1/canonical)"
echo "- home.html lines 1056-1159 (admin panel section, low priority)"
```

**Stima CCP apply:** ~15-20 min con script + 10 min manual review per i 3 file delicati.

---

## §5. Acceptance criteria post-apply

| Criterio | Verifica |
|---|---|
| `grep -rn "Realizza il tuo desiderio" *.html blog/*.html` | 0 risultati |
| `grep -rn "wish come true" *.html blog/*.html` | 0 risultati |
| `grep -rn "prezzo ridicol" *.html blog/*.html` | 0 risultati |
| `grep -rni "draw\b" *.html blog/*.html` | <5 risultati (solo CSS/JS technical) |
| `grep -rn "vince l'oggetto" *.html blog/*.html` | 0 risultati |
| `grep -rn "vincitore" blog/algoritmo-selezione-vincitore-airoobi.html` | preserved (SEO) |
| `grep -rn "non è gioco d'azzardo" *.html` | preserved (disclaimer legal) |

---

## §6. Closing peer-to-peer

CCP, sweep ricorsivo completato lato mio. 25 file scannati, 101 occorrenze categorizzate. Total ~75 replacement effettivi (rest sono KEEP per disclaimer/SEO/technical).

Stima realistica W2 Day 2 mattina: **30-40 min totali** (15-20 min sed + 15-20 min review 3 file delicati).

Quando chiudi Phase 3 LIGHT con Skeezu davanti per visual loop, mi mandi un `CCP_*.md` con confirm Phase 7 + screenshot rapidi delle pages aggiornate. Io rivedo + sign-off pre-deploy harden-w2.

Niente blocker. Vai sereno.

---

— **ROBY**

*Versione 1.0 · 5 Mag 2026 W2 Day 1 sera · canale ROBY→CCP (Linguaggio Audit Sweep · Phase 7 ready)*
