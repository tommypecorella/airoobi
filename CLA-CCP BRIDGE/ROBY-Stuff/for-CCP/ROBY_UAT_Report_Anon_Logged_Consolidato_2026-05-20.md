---
title: 🔍 ROBY UAT Report Consolidato · Anon + Logged · Bridge Chrome ext via Cowork
purpose: Consegna integrale a CCP delle findings UAT giro Chrome live · pre-GO-LIVE Ven 22/05 · 2 direttive Skeezu LOCKED + N issue priorizzate + RS lampo paste-ready
date: Mercoledì 20 maggio 2026 (sessione iniziata Mar 19/05 17:00+, continuazione overnight)
audience: CCP · Skeezu briefing parallel
status: UAT REPORT · ad-oltranza coverage · Chrome ext bridge confermato funzionante via pairing browser (prerequisito = paired)
critical-flag: BUG P0 ROUTING `/airdrops/:id` LOGGED ANCORA LIVE · auth-split SSR/dApp Next.js identificato come ROOT CAUSE
---

# 🔍 ROBY UAT Report Consolidato · giro Anon + Logged · 19-20 May 2026

## ⚡ TL;DR

1. **🚨 Bug P0 routing ANCORA LIVE** post RS Fix Lampo Option B di stamattina (19/05). Confermato logged come `ceo@airoobi.com`: `/airdrops/:id` rende BLACK theme SSR public con CTA "INIZIA ORA → /signup" per utente autenticato. Fix non applicato o non deployed.

2. **🚨 Root cause comune identificato — auth-split SSR vs dApp Next.js**: bug P0 + bug `/venditore` (CEO loggato reindirizzato a `/login.html?returnTo=%2Fvenditore`) condividono stessa frattura architettonica. SSR static pages (`/airdrops/:id`, `/venditore`, `/login.html`) usano session cookie A; dApp Next.js (`/dashboard`, `/portafoglio`, `/login`) usa cookie B. Bridge tra i due mancante.

3. **🆕 2 direttive Skeezu LOCKED 19-20 May 2026** (cumulative):
   - **Full KASPA commitment** · eliminare ogni menzione di "Solana plan B" da airoobi.com (LOCK 19/05 17:30+).
   - **Rimuovere falso claim `/invita`** · *"È l'unico modo per accumulare ROBI senza partecipare agli airdrop"* (LOCK 20/05).

4. **🚨 Bug critico copy `airoobi.com`**: "suffix -i" tokenizing dilagante (*airdropi · ARIAi · Kaspai · Bravei · Blockchaini · Referrali · NFTi*). Quasi certamente HTML `<i>` tag inserito + CSS broken. Institutional site letto da investitori = severity ALTA.

5. **🟡 Versioning split deploy disuniforme**: airoobi.com v4.25.0 (20 mag) / signup v4.15.0 (16 mag) / dashboard+login+home v4.12.0 (9 mag). Pattern intenzionale ma user vede inconsistency su numeri/copy stale.

6. **🟡 8+ blog post stale**: formula scoring v5 obsoleta (50/30/20 additivo invece di √blocchi × Moltiplicatore × Boost), reward removed ancora promessi (video, check-in stand-alone, referral 10/15 ARIA).

---

## 📋 Coverage map

| Surface | Anon | Logged | Theme | Versioning | Status |
|---|---|---|---|---|---|
| `airoobi.app/` HOME | ✅ | ✅ | LIGHT dApp | v4.12.0 | tested |
| `/airdrops` list | ✅ | — | LIGHT dApp | v4.12.0 | tested (pre-Stage 1 placeholders) |
| `/airdrops/:id` Fontanella | ✅ baseline | 🚨 BUG P0 LIVE | BLACK SSR public | v4.12.0 | bug confermato cross-state |
| `/come-funziona-airdrop` | ✅ | — | LIGHT dApp | v4.12.0 | 11 sezioni audited |
| `/impara` | 🚨 DUPLICATO | — | LIGHT dApp | v4.12.0 | bug route alias |
| `/faq` | ✅ | — | LIGHT dApp | v4.12.0 | audited |
| `/blog` | ⚠️ 38 post stale | — | LIGHT dApp | v4.12.0 | content drift |
| `/signup` | ✅ | — | LIGHT minimal | **v4.15.0** | tested |
| `/login` | ✅ | — | LIGHT minimal | v4.12.0 | tested |
| `/login.html` | — | 🚨 fallback bug | LIGHT minimal legacy | v4.12.0 | auth-split |
| `/proponi` | ✅ redirect login | ⚠️ marketplace, NOT form | LIGHT dApp | **v4.25.0** | routing inconsistente |
| `/dashboard` | — | ✅ | LIGHT dApp | v4.12.0 | tested completo |
| `/portafoglio` | — | ✅ comprehensive | LIGHT dApp | **v4.25.0** | 260 transazioni storico |
| `/miei-airdrop` | — | ✅ | LIGHT dApp | **v4.25.0** | 1 proposta + 3 archivio |
| `/invita` | — | ✅ + 1 copy bug | LIGHT dApp | **v4.25.0** | referral tier + claim falso |
| `/abo` admin | — | ✅ comprehensive | DARK purple admin | **v4.25.0** | 8 sezioni sidebar |
| `/venditore` | 🚨 not tested | 🚨 auth bug | — | — | bloccato auth-split |
| EN toggle | ✅ partial | — | — | — | chrome OK · blog content NO |
| `airoobi.com/` | ✅ + 🚨 -i bug | — | LIGHT institutional | **v4.25.0** | tested · suffix-i critical |

---

## 🚨 Bug list prioritized

### P0 · BLOCKING — Pre GO-LIVE Ven 22/05

#### B-P0-1 · Routing `/airdrops/:id` logged → BLACK SSR + `/signup` CTA
**Stato attuale (20/05 verified)**: confermato bug ancora live post-RS-fix-Option-B-mattutino. Logged come `ceo@airoobi.com`, navigato `/airdrops/5857e29d-5e1b-4d4e-a35d-dd4a51045c47`:
- BLACK theme cinematic stripped layout (no nav HOME/AIRDROPS/VALUTA/INVITA/MIEI/PORTAFOGLIO)
- CTA "INIZIA ORA" → `href="/signup"` (verified via accessibility tree)
- Stesso comportamento anon, zero distinction logged/anon

**Atteso post-fix**: logged user deve vedere LIGHT dApp client-side route con buy_blocks form + saldo ARIA + nav menu pieno.

**Severity**: BLOCKING pre go-live. È il primo touchpoint conversion seller → buyer experience.

#### B-P0-2 · Auth-split SSR vs dApp Next.js (root cause comune)
**Sintomi osservati**:
- `/airdrops/:id` non riconosce sessione dApp → BLACK SSR served to logged user
- `/venditore` redirect a `/login.html?returnTo=%2Fvenditore` per CEO loggato → seller dashboard non accessibile
- `/proponi` per CEO loggato renderizza marketplace list (NON form di submission seller) → expected behavior unclear

**Hypothesis**: due session cookie systems separati. `/login` (Next.js) mette cookie A; `/login.html` (legacy static) richiede cookie B. SSR public pages (`/airdrops/:id`, `/venditore`) usano session lookup pattern legacy che non vede cookie A.

**Fix proposto (ROBY · CCP signs off su stack)**: 
- Option 1: unified auth → SSR public pages consume same session cookie come dApp Next.js
- Option 2: redirect SSR public → dApp client route quando session attiva (es. `/airdrops/:id` con session → 302 a dApp `/airdrop?id=X`)
- Option 3: server-side detect logged + render dApp-style layout invece di SSR public template

**Severity**: BLOCKING. È la spinal column del bug P0 e probabilmente di altri micro-bug che emergeranno post-GO-LIVE.

### P1 · CRITICAL — Pre-Stage 1 fix

#### B-P1-1 · Suffix "-i" tokenizing dilagante su airoobi.com
**Sintomo**: tutto il body copy del sito institutional ha keyword con suffisso "i" innaturale:
- "airdropi" (invece di "airdrop")
- "ARIAi" (invece di "ARIA")
- "Kaspai" (invece di "Kaspa")
- "Bravei" (invece di "Brave")
- "Blockchaini" (invece di "Blockchain")
- "Referrali" (invece di "Referral")
- "NFTi" (invece di "NFT")

**Hypothesis**: HTML `<i>` tag inserito post-keyword (per styling italic/footnote/icon) ma CSS rules broken o non applicate → tag visibile come "i" letterale. Alternativa: i18n tokenization gone wrong (variable name terminating in "i").

**Action**: CCP grep HTML source airoobi.com homepage e identifica origine tag/template. Smoke verify post-fix: web_fetch + check zero suffix "-i" su parole keyword.

**Severity**: CRITICAL. Institutional site letto da investitori/partner. Fa sembrare AIROOBI dilettantesco.

#### B-P1-2 · `/impara` page = duplicate di `/come-funziona-airdrop`
**Sintomo**: URL `/impara` carica contenuto identico (stesso title HTML, stesso body, stesse 11 sezioni) di `/come-funziona-airdrop`. EDU menu offre IMPARA come voce distinta, ma utente che clicca trova duplicato.

**Hypothesis**: route alias mal configurato OR placeholder non costruito.

**Action**: CCP definisce scope `/impara`:
- Option A: redirect 301 `/impara` → `/come-funziona-airdrop` (rimuovi EDU > IMPARA dropdown)
- Option B: build content distinto (educational hub: blog + FAQ + glossary + tutorial)
- Decisione strategica ROBY/Skeezu necessaria prima del fix tech

**Severity**: medium-high UX. Confonde utente nuovo, ridondanza navigation.

#### B-P1-3 · Onboarding modal replay su ogni page navigation
**Sintomo**: il modale 5-step "Bentornato, ceo · Benvenuto su AIROOBI. Ti spieghiamo tutto in 30 secondi" riappare su ogni page nav, anche dopo click INIZIA. Solo la checkbox "Ho capito, non ricordarmelo più" + INIZIA setta dismissal persistente. Click INIZIA da solo NON salva flag.

**Hypothesis**: localStorage flag `onboarding_completed` settato solo on checkbox + INIZIA, non on INIZIA standalone.

**Action**: CCP fix logic — INIZIA singleton click deve settare flag persistente. La checkbox dovrebbe essere only escape route, non requirement.

**Severity**: medium. Utenti repeat user trovano modal in faccia su ogni nav → annoying churn factor.

### P2 · HIGH — Da pianificare W5+ (post GO-LIVE)

#### B-P2-1 · Voice 04 "DRAW" violation cross-surface
**Sintomo**: vocabolario gambling-adjacent "draw/sorteggio" appare in 2/3 surface:
- ✅ `/faq`: usa "selezione" (compliant)
- ⚠️ `/come-funziona-airdrop` §6: "**CLOSED & DRAW / Chiuso & selezione**" (violation)
- ⚠️ `/airdrops/:id` Fontanella detail: *"partecipa al **draw** equo"* (violation)

**Reference**: memory `feedback_voice_principle_04_anti_gambling_strict.md` (Skeezu 6 May 2026 directive).

**Action**: CCP find/replace "draw" → "selezione" o "distribuzione" o "ranking finale" su:
- Detail airdrop template
- `/come-funziona-airdrop` §6 phase 6 naming

#### B-P2-2 · ARIA reward copy stale cross-properties
**Sintomo**: FAQ + welcome banner dashboard + alcuni blog post ancora promettono ARIA da reward dichiarati removed in `/come-funziona-airdrop` §10:
- "Check-in +1 ARIA stand-alone" (removed)
- "Video visti +1 ARIA max 5/gg" (removed)
- "Referral 10 ARIA / 15 ARIA" (removed — referral è ora +5 ROBI / +5 ROBI)

**Action**: CCP grep "check-in" + "video" + "referral 10 ARIA" cross-properties. Aggiorna tutto a fonte single-source `/come-funziona-airdrop` §10.

#### B-P2-3 · Discrepancy COSTO BLOCCO Fontanella (home vs detail)
- Home airoobi.app card: *"Fontanella smart per animali · 10 ARIA · 405 rimasti"*
- Detail `/airdrops/:id`: *"COSTO BLOCCO 20 ARIA · BLOCCHI TOTALI 405 · BLOCCHI VENDUTI 0"*

**Hypothesis**: home v4.12.0 stale vs detail v4.25.0 aggiornato. Quale è il valore corretto?

**Action**: CCP verifica DB source-of-truth e re-sync home card.

#### B-P2-4 · Stats top nav placeholder su prime page nav
**Sintomo**: navigando da dashboard a `/proponi` o `/portafoglio`, top nav stats mostrano `A —` `R —` (placeholder) per ~1-2 secondi prima di caricare valori reali (600 / 26). Visible flicker.

**Action**: CCP — pre-fetch or SSR stats top nav.

#### B-P2-5 · Stage 1 counter "(—/1000)" su /proponi
**Sintomo**: `/proponi` mostra *"Stage 1 con prodotti veri parte al raggiungimento dei 1.000 Alpha Brave (—/1000)"* — il counter è "—" placeholder invece di "9/1000".

**Action**: data fetch fix.

#### B-P2-6 · Categoria "computer" lowercase / categoria sbagliata Fontanella
**Sintomo**: 
- Detail page: categoria mostrata come "computer" lowercase mentre il design system rende uppercase CSS "COMPUTER" (display only)
- Più grave: "Fontanella smart per animali" è categorizzata come "COMPUTER" ma è un oggetto **animali/casa/elettrodomestico**, non un PC.

**Action**: 
- (admin manuale) ri-categorizzare Fontanella in categoria appropriata (e.g. "Casa & elettrodomestici" se esiste, o "Sport & Outdoor" come pet care)
- (CCP) verificare categoria assegnazione UX in admin form

#### B-P2-7 · "Chi hai invitato" + "Sei stato invitato da" hung "Caricamento..."
**Sintomo**: su `/invita`, sezioni "Chi hai invitato" (tabella partecipanti) e "Sei stato invitato da" mostrano spinner "Caricamento..." stuck. Data fetch failing o hung.

**Action**: CCP fix data fetch.

#### B-P2-8 · ABO Overview tracking metric "Check-in oggi" + "Video visti oggi" stale
**Sintomo**: admin panel `/abo` Overview ha card statistiche per "Check-in oggi" e "Video visti oggi" — feature dichiarate removed in `/come-funziona-airdrop` §10. Stale metric tracking in admin.

**Action**: CCP rimuove card admin per feature deprecated, oppure rinomina coerente con nuova architettura reward (faucet + sequenza).

#### B-P2-9 · Menu "VALUTA" ambiguità linguistica (`/valuta` 404)
**Sintomo**: nav menu logged item "VALUTA" punta a `/proponi` (= "valuta un oggetto" verbo, NOT currency). URL diretto `/valuta` ritorna 404 NOT_FOUND. Utente che cerca wallet/currency typing `/valuta` trova errore.

**Action proposta**: 
- Option A: rinomina menu item "PROPONI" o "FAI VALUTARE"
- Option B: aggiungi route alias `/valuta` → `/proponi`
- Option C: lascia ambiguità (rischio user friction)

### P3 · MINOR — Backlog

#### B-P3-1 · Copy weak
- FAQ: *"a un prezzo incredibilmente basso"* → AVREI: *"a una frazione del valore"*
- Dashboard modal: *"Oggetti di valore. A un prezzo incredibile."* (stesso pattern)
- FAQ: *"Pensale come la valuta del gioco"* → AVREI: *"della piattaforma"* (Voice 04 gambling-adjacent)
- airoobi.com: *"Il top holder riceve l'oggetto"* (anglicismo) vs airoobi.app: *"chi è in 1ª posizione si aggiudica l'oggetto"* — uniformare.
- airoobi.com claim *"Stai guadagnando già adesso"* ripetuto 3× — borderline aggressivo. AVREI: *"Dal primo check-in maturano ROBI"* (fact-based).

#### B-P3-2 · EN translation gaps
- Tab title HTML rimane IT dopo switch EN (SSR template cache).
- Blog cards titoli + excerpt NOT translated (solo CTA "READ →" translated). 38 articoli IT-only impact EN growth.

#### B-P3-3 · Login CTA blu vs gold ovunque
Bottone "LOGIN" su `/login` è BLUE (#5A9DEB ~), tutti gli altri primary CTA gold. Pattern action/link blue VS promo/conversion gold — confermare intenzionalità o uniformare.

#### B-P3-4 · "Oo" monogram signup/login vs "AIROOBI" full logo
`/signup` e `/login` mostrano "Oo" monogram blue invece del logo full AIROOBI gold. Brand consistency questionable. Confermare intenzionalità o full logo unificato.

#### B-P3-5 · Footer FAQ ridotto
Footer `/faq` ha solo "airoobi.com Airdrops Blog Impara" senza Login/Registrati/FAQ self-link. Inconsistent con footer altre pages.

#### B-P3-6 · "Piattaforma riservata ai maggiorenni (18+)" cross-properties
Disclaimer 18+ presente su tutti i footer + signup checkbox obbligatoria. Solitamente legato a gambling/lottery framing. Per marketplace e-commerce utility-driven non strettamente necessario. Confermare con Skeezu se intenzionalità legale o residuo framing.

#### B-P3-7 · "5 ROBI con garanzia ≥95% PEG"
Claim numerico su airoobi.com hero "5 ROBI starter · ROBI con garanzia ≥95% PEG". Verificare con CCP/Treasury se valore attuale Fondo Comune supports ≥95% PEG o se è forecast.

#### B-P3-8 · "Garpez" 18 mag entry 1 ROBI storico portafoglio
Voce non identificata "Garpez · 18 mag 2026 · 1 ROBI". Test data o source non documentata. Da check.

#### B-P3-9 · KAS card "PRESTO" + "tuo per sempre"
Card KAS in `/portafoglio` ha badge "PRESTO" (Stage 2 unlock) + claim *"≈ 802.27 KAS · On-chain · tuo per sempre"*. Asset che non esiste ancora ma è promesso "tuo per sempre" — claim borderline value-prop.

#### B-P3-10 · Admin grant +1.000.000.000 ARIA visible in storico CEO
Storico transazioni `/portafoglio` mostra plain text *"Assegnazione admin · 22/04/2026 · +1.000.000.000 ARIA"*. OK per CEO ma se utente normal vedesse simile audit-trail confonderebbe. Filtro role-based visibility da verificare.

---

## 🆕 Direttive Skeezu LOCKED 19-20 May 2026 — RS LAMPO ready per CCP

### RS #1 · Full KASPA commitment · Rimozione Solana plan B (LOCK 19 May 2026)

```
RS · LAMPO · Rimuovi Solana plan B copy da airoobi.com (full KASPA commitment)

Skeezu LOCKED 19 May 2026 17:30+: eliminare ogni menzione di "Solana plan B" da airoobi.com. 
Decisione definitiva: full Kaspa, no fallback narrativo.

Scope:

1. SEZIONE PERCHÉ/BLOCKCHAIN airoobi.com homepage
   - Strip headline subhead "Perché Kaspa? AIROOBI punta su Kaspa per la sua architettura unica. 
     Ma stiamo monitorando anche Solana come alternativa, in attesa che gli smart contract 
     su Kaspa siano pronti."
   - Strip comparison table Kaspa vs Solana (entrambe le colonne, pros/cons)
   - Strip claim closing "La decisione finale dipenderà dalla maturità degli smart contract 
     su Kaspa. Se non saranno pronti in tempo, Solana è il piano B."

2. REPLACE con commitment full-Kaspa
   - Headline: "Perché Kaspa? La blockchain per il commercio digitale."
   - Sub: "AIROOBI è costruito su Kaspa. Punto. La sua architettura unica — DAG, 
     1 blocco/secondo, fair launch — è l'unica che soddisfa i requisiti del marketplace."
   - Mantieni la lista pro-Kaspa (1 blocco/secondo, zero pre-mine, PoW, DAG, fee quasi zero)
   - Aggiungi single bullet "Smart contract Kaspa in arrivo — AIROOBI sarà tra i primi a deployarli"
   - NO comparison table, NO mention di chain alternative

3. CONTROLLA cross-references altre pagine
   - grep "Solana" + "piano B" + "alternativa" su airoobi.com sitemap intera
   - Cattura tutte le occurrence e neutralizza (può esserci in roadmap/investor pages)

4. PRESERVAZIONE
   - Mantieni la frase "stiamo monitorando l'evoluzione di Kaspa smart contract" come signal 
     di awareness tech (non Solana)
   - Footer/copyright/Alpha Brave counter intatti

5. DEPLOY
   - Bump airoobi.com footer version (es. alfa-2026.05.20-4.26.0 o successivo)
   - Smoke verify post-deploy: web_fetch e grep "solana" → 0 hits expected

Rationale: full-Kaspa commitment è il messaggio per investitori/community pre-FASE D 
Kaspa Foundation. Plan-B narrativa apriva una porta che Skeezu vuole chiusa.

ETA atteso: lampo (1-2 file affected, copy refactor simple). 
STOP+ASK pre-commit se cross-reference investor pages necessita decisione strategica.
```

### RS #2 · Rimozione falso claim `/invita` (LOCK 20 May 2026)

```
RS · LAMPO · Rimuovi falso claim "unico modo accumulare ROBI" da /invita

Skeezu LOCKED 20 May 2026: eliminare la frase 
"È l'unico modo per accumulare ROBI senza partecipare agli airdrop." 
dalla pagina /invita referral page.

Rationale: il claim è fattualmente falso. ROBI si accumulano in molti modi alternativi 
oltre referral:
- Welcome grant alpha-net (+5 ROBI registrazione iniziale)
- Welcome grant alpha-live (+5 ROBI fase transition)
- "Oggetto accettato" (+1 ROBI venditore quando proposta valutata ok)
- "Airdrop vinto" (+5 ROBI aggiudicatario)
- "Airdrop concluso" (+5 ROBI venditore)
- "Settimana completa" (+1 ROBI timbrare 7gg consecutivi)
- "ROBI scoperti nel rullo" (frazionari, istantanei)
- ROBI mining (sospeso in Alpha, attivo da Stage 1)

Lasciare claim falso = brand integrity issue + potenziale legal exposure (advertising claim 
unfounded).

Scope:
1. /invita section "ALPHA BRAVE REFERRAL · Invita un amico, guadagnate insieme"
   - Strip frase "È l'unico modo per accumulare ROBI senza partecipare agli airdrop."
   - Replace con sub-positivo: "Bonus immediato, condiviso 50/50 tra te e il tuo amico. 
     Cumulabile con tutti gli altri modi di accumulare ROBI."
   (oppure rimuovi senza replace, brevità preferita)

2. Smoke verify pre-commit: grep "unico modo per accumulare ROBI" → 0 hits

3. /invita sub-title FIX paralleli:
   - Hero sub: "Invita amici e ricevi ARIA bonus. Più accumuli, più ROBI guadagni."
   - INCONSISTENZA: hero dice "ARIA bonus" ma body dice "+5 ROBI". Referral è ROBI, NOT ARIA.
   - Replace: "Invita amici e accumula ROBI insieme. +5 ROBI per ogni invito confermato."

ETA: lampo (single page edit).
```

### RS #3 · Bug P0 routing `/airdrops/:id` logged — Option B+ (consolidated)

```
RS · CRITICAL · Bug P0 routing /airdrops/:id LOGGED — Auth-split SSR/dApp fix

Verified 20 May 2026 02:00+: RS Fix Option B mattutino NON applicato o NON deployed. 
Bug P0 ancora live in produzione airoobi.app v4.12.0.

Scope (root-cause fix, NOT surface patch):

1. INVESTIGATE auth-split tra SSR public pages e dApp Next.js
   - SSR public: /airdrops/:id, /venditore, /login.html
   - dApp Next.js: /dashboard, /portafoglio, /miei-airdrop, /invita, /proponi, /login
   - Session cookie unified o split?
   - Se split → Stage 2+ refactor → consolidare cookie domain/path
   - Se unified → /airdrops/:id template ignora session check

2. SHORT-TERM FIX (pre go-live Ven 22/05)
   Option A (raccomandato): SSR /airdrops/:id detect session at request time
   - if session_user → 302 redirect a dApp /airdrop?id=:id (client-side route con buy_blocks form)
   - if no session → render BLACK SSR public (current behavior anon)
   
   Option B: SSR template logica branch
   - if session_user → render LIGHT dApp-style layout con menu + buy_blocks form embedded
   - if no session → render current BLACK SSR public
   
   Option A preferito (preserves separation of concerns; dApp logic stays in dApp routes)

3. SAME FIX applies to /venditore
   - if session_user → redirect a /venditore Seller Dashboard dApp Next.js route
   - if no session → redirect a /login (NOT /login.html)
   - Risolve sia auth-split sia ambiguità login route

4. SMOKE VERIFY post-deploy
   - logged user → /airdrops/:id → expect LIGHT dApp + buy_blocks form
   - anon → /airdrops/:id → expect BLACK SSR public + "INIZIA ORA" /signup CTA
   - logged user → /venditore → expect Seller Dashboard accessibile
   - cross-state check: 2 browser tab side-by-side (anon + logged) confronto

5. AUDIT-TRAIL
   - CCP_Bug_P0_Routing_RootCause_Fix_2026-05-20.md in for-CCP/ post-implementazione

ETA: CCP best judgment. Skeezu disponibile per STOP+ASK su scelta Option A vs B.

GO-LIVE BLOCKING: Ven 22/05 soft launch DIPENDE da questo fix. Coordinazione necessaria 
con audit ABO/Seller side-effects.
```

### RS #4 · Suffix "-i" tokenizing bug airoobi.com (P1)

```
RS · CRITICAL · Suffix "-i" tokenizing bug airoobi.com institutional

Sintomo: body copy airoobi.com homepage contiene keyword con suffisso "i" innaturale:
- "airdropi" (invece di "airdrop")
- "ARIAi" (invece di "ARIA")
- "Kaspai" (invece di "Kaspa")
- "Bravei" (invece di "Brave")
- "Blockchaini" (invece di "Blockchain")
- "Referrali" (invece di "Referral")
- "NFTi" (invece di "NFT")

Hypothesis (ROBY · CCP signs off):
1. HTML <i> tag inserito post-keyword (per styling italic/footnote/icon) ma CSS rules broken 
   o non applicate → tag visibile come "i" letterale.
2. i18n tokenization gone wrong (variable name terminating in "i").
3. Template engine artifact (Liquid/Jinja2 plurale italian gone wrong).

Investigation steps:
1. CCP curl https://airoobi.com/ e inspect raw HTML
2. Identifica pattern: parola seguita da <i> tag o testo "i" letterale?
3. Se <i> tag → check CSS rules per .icon, .italic, .footnote-marker → fix CSS o rimuovere tag
4. Se i18n → check template variables e fallback path

Action:
- Fix template/CSS
- grep test post-fix: 0 hits "airdropi" + "ARIAi" + "Kaspai" + "Bravei" + "Blockchaini" + "Referrali" + "NFTi"
- Smoke verify web_fetch homepage + investor page

Severity: alta. Institutional site letto da investitori/partner pre-FASE D Kaspa Foundation.

ETA: lampo se è singolo CSS rule, mezza giornata se template engine refactor.
```

### RS #5 · Onboarding modal replay every page (P1)

```
RS · MEDIUM · Onboarding modal replay every page nav

Sintomo: modale 5-step "Bentornato · AVANTI →" riappare ad ogni page nav anche se utente 
ha cliccato INIZIA su altra page. Solo checkbox "Ho capito, non ricordarmelo più" + INIZIA 
setta dismissal persistente.

Bug logic: localStorage flag `onboarding_completed` settato solo on (checkbox + INIZIA), 
non on INIZIA standalone.

Fix:
- Click INIZIA da solo → set localStorage.onboarding_completed = true
- Checkbox optional escape route, non requirement
- Behavior atteso: dopo PRIMO completo run-through tutorial (INIZIA), mai più riappare.

Alternative: dismissal flag side-effect del modal stesso (close X → set flag too)

ETA: small fix React state + localStorage write.
```

---

## 📋 Audit FASE B materials (ROBY scope)

Post-LOCK full-Kaspa, audit + strip Solana references da:

| File | Path | Status check |
|---|---|---|
| Pitch deck v1 outline | `investor-pack/AIROOBI_Kaspa_Foundation_Pitch_Deck_v1_Outline_2026-05-17.md` | grep "Solana" pending |
| Tech Companion v1 | `investor-pack/AIROOBI_Kaspa_Tech_Companion_v1_2026-05-20.md` | grep pending |
| LOI Draft v1 | `investor-pack/AIROOBI_Kaspa_LOI_Draft_v1_2026-05-20.md` | grep pending |
| Demo Video Script v1 | `investor-pack/AIROOBI_Kaspa_Demo_Video_Script_v1_2026-05-20.md` | grep pending |
| Investor Pitch v1.2 Delta | `investor-pack/AIROOBI_Investor_Pitch_v1.2_Update_Delta_2026-05-17.md` | grep pending |

ROBY action ad oltranza overnight: grep cross-file, strip references, refactor "Solana plan B leva urgency" → "full-Kaspa commitment = trust signal massimo" (no fallback = trust higher).

---

## 🧠 Memory updates pending (ROBY scope)

A fine sessione coordinata aggiornamento:

1. **NEW** `project_full_kaspa_commitment_lock_2026-05-19.md`
   - Skeezu LOCKED 19 May 2026 full Kaspa, no Solana fallback
   - Cross-properties stripping required
   - Impact FASE B materials + airoobi.com institutional copy

2. **NEW** `feedback_invita_unique_claim_falso_removed_2026-05-20.md`
   - Claim verifiability check obbligatorio pre-copy LIVE
   - Pattern: every quantitative or exclusivity claim must trace to source-of-truth

3. **DEPRECATE** `reference_cowork_chrome_ext_bridging_limit.md`
   - Confermato 20 May 2026: bridge funzionante via browser pairing
   - Prerequisito = Chrome browser paired (NOT architectural limit)
   - Update entry: status DEPRECATED, replaced con prerequisite note

4. **UPDATE** `project_critical_holes_2026-04-27.md`
   - Rimuovi "Solana plan B emerged" se flagged come strategic note
   - Aggiungi B-P0-2 auth-split SSR/dApp Next.js come architectural concern Stage 2

5. **NEW** `project_dapp_versioning_split_deploy_pattern_2026-05-20.md`
   - Pattern intenzionale: pages aggiornate indipendentemente (v4.12 / v4.15 / v4.25)
   - Implicazione: user vede inconsistency numeri/copy stale durante transition
   - Mitigazione: bump unified version o accept friction

---

## 📊 Reality check timeline

Mar 19/05 sera-notte → Mer 20/05 mattina overnight:
- ROBY UAT Chrome ext live (post pairing bridge unlocked)
- 2 direttive Skeezu LOCKED 19-20 May
- 9 task anon completati + 8 task logged completati + tutto consolidato in questo .md

Reality timeline aggiornata (CCP attention):
- **OGGI Mer 20/05** · CCP deve action su RS #3 (Bug P0 root-cause) + RS #1 (Solana removal) + RS #2 (claim falso /invita) + RS #4 (-i bug) + RS #5 (onboarding modal)
- **Gio 21/05** · UAT FINALE official (post-fix re-verify lista bug P0/P1)
- **Ven 22/05** · GO-LIVE soft launch — BLOCKING su RS #3 deploy verified

Ordine priorità suggerita CCP:
1. RS #3 (Bug P0 routing root-cause) — blocking go-live
2. RS #2 (claim falso /invita) — directive Skeezu LOCK, ETA lampo
3. RS #1 (Solana removal) — directive Skeezu LOCK, ETA lampo
4. RS #4 (-i bug airoobi.com) — pre-FASE D investor blocking
5. RS #5 (onboarding modal replay) — UX polish, non-blocking

---

## 🤝 Healthy bilateral notes

- **Tech ownership**: CCP final call su scelta Option A vs B su auth-split (`reference feedback_tech_ownership_ccp_final_call.md`). ROBY proposes architectural direction, CCP signs off implementation.
- **Verify-before-edit**: tutti i RS sopra contengono path/file/grep specifici osservati live via Chrome ext. CCP grep verifica esistenza pre-edit (vedi feedback memory).
- **Audit-trail bilateral**: questo file `ROBY_UAT_Report_Anon_Logged_Consolidato_2026-05-20.md` è ROBY audit-trail. Attendo CCP_*.md di rincalzo post-implementazione (audit-trail post-commit pattern).
- **STOP+ASK pre-commit critical**: RS #3 auth-split fix è infra DB/session — STOP+ASK necessaria su decisione Option A vs B prima del deploy.

---

*ROBY · Strategic MKT/Comms/Community Manager · Claude Desktop Cowork mode · Mercoledì 20 maggio 2026 · UAT giro Chrome ext live ad oltranza · daje team a 4 🚀 · pre GO-LIVE Ven 22/05*
