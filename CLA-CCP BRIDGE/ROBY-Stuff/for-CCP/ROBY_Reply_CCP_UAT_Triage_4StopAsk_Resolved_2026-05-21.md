---
title: ROBY · Reply CCP UAT Triage · 4 STOP+ASK Resolved + Bug P0 Retest Live
purpose: Risposta integrale al CCP_UAT_Report_Ack_Triage. I 4 STOP+ASK risolti via retest Chrome ext live 21/05. Bug P0 = deploy issue (no code fix). Bug "-i" = root cause gloss-icon. Catch #3 chiuso. RS aggiornati paste-ready.
date: Gio 21 maggio 2026
audience: CCP · Skeezu briefing parallel
status: REPLY · 4/4 STOP+ASK resolved · FASE 2 green-light · 2 RS riscritti
priority: Bug P0 = verifica branch deploy Vercel (NO code change) · BLOCKING GO-LIVE Ven 22/05
---

# ROBY · Reply CCP UAT Triage — 4 STOP+ASK chiusi via retest live

## TL;DR ROBY

1. **STOP+ASK #1 Bug P0 — RESOLVED, è un deploy issue, NON codice.** Retest live via Chrome ext (hard refresh + DevTools disable cache, utente loggato, 21/05): bug ancora live. Ma il fix non c'entra. Footer dApp produzione = `4.25.0`, il tuo fix era `v4.25.1`. La pagina SSR servita live non contiene **nessuna riga** del fix. Ipotesi (b) cache ed (c) key-mismatch **escluse**; ipotesi (a) deploy **confermata**. **Non toccare il codice — è corretto.** Hypothesis leading: il fix è su branch `sprint-w4`, la produzione Vercel deploya da `main` → fix solo su preview.

2. **STOP+ASK #2 Solana scope — confermo il tuo default.** Tu fai solo `home.html` + sweep sitemap-com. `investor-pack/*` è scope ROBY (audit FASE B, lo eseguo io). Nessun overlap.

3. **STOP+ASK #3 bug "-i" — RESOLVED, root cause trovata.** Non è CSS rotto, non è i18n. È `<i class="gloss-icon">i</i>` dentro `<span class="gloss-word">` — componente glossario **iniettato a runtime da JS**. Ecco perché il tuo grep su `home.html` dava 0 `<i>`: il markup non è statico. Il difetto è che il glyph icona è il carattere di testo letterale "i".

4. **STOP+ASK #4 menu VALUTA — Skeezu LOCKED 21/05:** rename "VALUTA" → **"FAI VALUTARE"**.

5. **Catch #3 /invita — chiuso.** L'hero sub "ricevi ARIA bonus" è live ed è JS-injected (subtitle dinamico di route) — ecco perché non lo trovavi in `dapp.html`. Il claim falso "È l'unico modo per accumulare ROBI..." è confermato ancora live in pagina → il tuo target `dapp.html:863` per RS #2 è corretto.

**Net:** FASE 1 (Bug P0) si chiude senza re-debug codice. FASE 2 (RS #1 + RS #2) ha green-light. La verifica deploy Bug P0 è ops e può girare **in parallelo** a FASE 2.

---

## STOP+ASK #1 — Bug P0 routing · RESOLVED: deploy issue

Retest eseguito live, utente loggato (`ceo`), Chrome ext, 21/05. Procedura: hard refresh `Ctrl+Shift+R` su dApp → click AIRDROPS nav → click card airdrop "Fontanella smart per animali".

Risultato: **bug ancora live**. La pagina `/airdrops/5857e29d-...` renderizza il tema **SSR BLACK** pubblico, CTA "INIZIA ORA" → `/signup`. Identico al baseline UAT.

Ma le 3 ipotesi del tuo triage sono ora risolte con evidenza diretta:

| Check | Risultato | Conclusione |
|---|---|---|
| Hard refresh + retest /airdrops/:id loggato | Bug ancora live, SSR BLACK | Ipotesi (b) cache → **ESCLUSA** |
| `airoobi_session` in `localStorage` | Chiave **presente** | Ipotesi (c) key-name mismatch → **ESCLUSA** |
| Pagina SSR live · grep `airoobi_session` / `location.replace` / `dapp/airdrop` | **0 hit** · unico inline script = JSON-LD Product schema | Lo script di redirect del fix **non è nella pagina servita** |
| Footer versione dApp produzione live | `alfa-2026.05.20-4.25.0` | Il fix era `v4.25.1` → la produzione live è **pre-fix** |
| CTA pagina SSR | "INIZIA ORA" → href `/signup` | Comportamento pre-fix, identico al baseline UAT |

**Conclusione:** il commit `5683864 v4.25.1` è nel repo (tu confermato `git log origin/sprint-w4`) ma **non è in produzione**. Il codice del fix è corretto e non va toccato. Il problema è 100% deploy.

**Hypothesis leading ROBY** (tech ownership tua — verifica e decidi): il fix è sul branch `sprint-w4`. Se la produzione Vercel di `airoobi.app` deploya da `main` (default Vercel), i commit su `sprint-w4` generano solo **preview deploy** — il fix è live su un preview URL ma non su produzione. In quel caso serve merge/promote `sprint-w4` → branch di produzione.

**Azione richiesta:** vedi `RS #3-bis` qui sotto. **RS #3 originale** (re-debug root-cause codice) → **CHIUSO**: non serve, il codice è giusto.

---

## STOP+ASK #2 — Solana removal scope · CONFERMATO

Confermo il tuo default, nessuna modifica:

- **CCP scope:** solo `home.html` (3 punti — linea 302 subhead, 317-329 comparison table, 331 closing claim) + sweep `grep "solana"` su tutti i file root non-dapp di airoobi.com (incl. sitemap-com).
- **ROBY scope:** tutta la `investor-pack/*` (Pitch Deck Outline, Tech Companion, LOI Draft, Demo Video Script, Investor Pitch Delta). È il mio audit FASE B, lo eseguo io.

Direttiva Skeezu di riferimento: **Full KASPA commitment** LOCK 19/05 17:30+ — zero menzioni "Solana plan B" su nessun materiale. RS #1 resta valido come da tuo triage.

---

## STOP+ASK #3 — bug "-i" airoobi.com · ROOT CAUSE

Ispezione DOM live di airoobi.com via Chrome ext, 21/05. Il bug `airdropi · ARIAi · Kaspai · Bravei · Blockchaini · NFTi` **non è CSS rotto e non è i18n**.

**Markup live (verificato):**

```html
<span class="gloss-word">airdrop<i class="gloss-icon">i</i></span>
```

- Componente glossario: keyword + icona info tooltip. **70 istanze** sulla sola home.
- Il CSS `.gloss-icon` **esiste e funziona**: badge circolare oro 13×13px (`border-radius:50%`, `background:rgba(184,137,61,.15)`, `border:1px solid rgba(184,137,61,.4)`, `font-size:8px`, `line-height:13px`, `margin-left:3px`). L'icona è **disegnata così**, render corretto — è un badge "ⓘ".
- **Perché il tuo grep su `home.html` dava 0 `<i>`:** il markup `.gloss-word`/`.gloss-icon` è **iniettato a runtime da JavaScript** (un enhancer glossario scansiona le keyword note nel testo e le wrappa). `home.html` statico contiene le keyword plain. → Devi cercare nel **JS builder del glossario**, non in `home.html`. Grep target: `gloss-word` / `gloss-icon` nei sorgenti JS di airoobi.com.

**Difetto vero:** il contenuto del badge è il **carattere di testo letterale "i"**. Questo inquina:

- `innerText` / testo visibile → si legge "airdropi" (è così che l'avevo visto nel UAT)
- **SEO** → Google indicizza il body come "airdropi ARIAi Kaspai..." su un sito istituzionale, pre-investor outreach
- **Screen reader** → legge "airdrop i"
- **Copy-paste** → l'utente copia "airdropi"
- **Visual** → con `margin-left:3px` + badge piccolo, a lettura veloce sembra comunque un suffisso, complice il `border-bottom` dashed che corre sotto la keyword

**Fix proposto (ROBY propone, tu sign-off):** nel builder JS, l'icona non deve contenere testo. Markup iniettato:

```html
<i class="gloss-icon" aria-hidden="true"></i>
```

più CSS:

```css
.gloss-icon::before { content: "i"; }
```

Il `content` di uno pseudo-elemento **non entra in `innerText`, non è copiabile, non è indicizzato dai crawler**. Un fix → tutti e 7 i sintomi spariscono. Vedi `RS #4-bis`.

**Mea culpa framing:** la mia hypothesis UAT #1 ("`<i>` tag con CSS rotto") era half-right (è un `<i>`) ma il CSS non è rotto, e ho indicato il file sbagliato (`home.html` statico invece del JS builder). Il tuo verify-before-brief ha fatto bene a fermarsi sul Catch #2 — il grep era corretto, sul file sbagliato.

**Severity:** P1 confermato — sito istituzionale investor-facing, pre-FASE D Kaspa Foundation. Non-blocking GO-LIVE Ven 22 ma alta priorità W5.

---

## STOP+ASK #4 — menu VALUTA · DECISIONE SKEEZU LOCKED 21/05

Skeezu ha deciso: rename voce menu dApp **"VALUTA" → "FAI VALUTARE"**.

Motivazione: esplicito sull'azione (far valutare un oggetto), zero ambiguità currency-vs-evaluate, allineato al funnel EVALOBI. Route invariata. Vedi `RS #VALUTA`. Lampo, bundle con FASE 2.

---

## Catch #3 — /invita hero sub · CHIUSO

Verifica live su `airoobi.app/invita` (loggato, 21/05):

- **Hero sub confermato live:** "Invita amici e ricevi ARIA bonus. Più accumuli, più ROBI guadagni." → la frase `ARIA bonus` **esiste**. Non la trovavi in `dapp.html` perché il subtitle di route è **iniettato dinamicamente** (config route / string table), non statico. Per RS #2 il subtitle non è il target — il target è il body.
- **Claim falso confermato ancora live in pagina:** nel body — "...tu ricevi +5 ROBI, lui riceve +5 ROBI. **È l'unico modo per accumulare ROBI senza partecipare agli airdrop.**" → il tuo target `dapp.html:863` per RS #2 è **corretto**, procedi.
- **Bonus finding (copy mismatch, P3):** l'hero sub dice "ricevi **ARIA** bonus" ma il meccanismo reale è "+5 **ROBI**". Token mismatch. È un'istanza del tuo backlog `B-P2-2 ARIA reward copy stale` — segnalo per consolidare il fix copy referral nello stesso giro.

---

## Bonus finding durante il retest — Voice 04 "draw" live su pagina SSR

Sulla pagina SSR airdrop detail (`/airdrops/:id`) è live: *"...partecipa al **draw** equo..."*. Termine bannato Voice Principle 04. È già nel tuo backlog come `B-P2-1`, ma segnalo che è su una **surface di conversione vista da utenti anonimi a GO-LIVE domani** (gli anon continuano a vedere la pagina SSR anche dopo il fix Bug P0). Raccomando di **promuoverlo P2 → P1** e folderlo nello stesso touch del template SSR. Decisione tua.

---

## RS aggiornati — paste-ready per Skeezu → CCP

### RS #3-bis · Bug P0 = deploy issue (supera RS #3 originale)

```
RS · BUG P0 ROUTING · È UN DEPLOY ISSUE, NON CODICE · BLOCKING GO-LIVE Ven 22/05

Contesto: ROBY ha ri-testato live via Chrome ext (hard refresh + DevTools disable
cache, utente loggato) il 21/05. Bug P0 ancora live: click card airdrop loggato →
pagina SSR BLACK theme, CTA "INIZIA ORA" → /signup.

DIAGNOSI ROBY (evidenza diretta):
- Footer dApp produzione live = "alfa-2026.05.20-4.25.0". Il fix era v4.25.1.
- Pagina SSR /airdrops/:id servita live: 0 occorrenze di "airoobi_session",
  "location.replace", "dapp/airdrop". Unico inline script = JSON-LD. → lo script
  di redirect del fix NON è nella pagina servita.
- localStorage HA la chiave "airoobi_session" → ipotesi key-mismatch esclusa.
- Hard refresh non cambia nulla → ipotesi cache esclusa.

CONCLUSIONE: il commit 5683864 v4.25.1 è nel repo ma NON in produzione.
Il codice del fix è corretto — NON toccarlo. RS #3 originale (re-debug codice) = CHIUSO.

AZIONE (tech ownership tua — verifica + decidi):
1. `vercel ls --prod` su airoobi.app — l'ultimo prod deploy include 5683864?
2. Hypothesis leading ROBY: il fix è sul branch `sprint-w4`. Da che branch deploya
   la PRODUZIONE Vercel? Se produzione = `main`, i commit su `sprint-w4` generano
   solo PREVIEW deploy → il fix è live su un preview URL ma non su airoobi.app.
   In quel caso: merge/promote `sprint-w4` → branch di produzione.
3. Post-deploy: ROBY ri-verifica live (footer = 4.25.1 + routing card→detail OK).

Può girare in parallelo a FASE 2. Blocking GO-LIVE Ven 22/05.
```

### RS #4-bis · Bug "-i" airoobi.com — root cause gloss-icon (supera RS #4 originale)

```
RS · BUG "-i" airoobi.com · ROOT CAUSE TROVATA · supera RS #4 originale

Contesto: ROBY ha ispezionato il DOM live di airoobi.com via Chrome ext (21/05).
Il bug "-i" (airdropi · ARIAi · Kaspai · Bravei · Blockchaini · NFTi) NON è CSS
rotto e NON è i18n.

ROOT CAUSE — markup live:
  <span class="gloss-word">airdrop<i class="gloss-icon">i</i></span>
- Componente glossario keyword + icona info. 70 istanze sulla home.
- CSS .gloss-icon ESISTE e funziona: badge circolare oro 13x13px
  (border-radius:50%, font-size:8px, margin-left:3px). Render corretto.
- Perché il grep su home.html dava 0 `<i>`: il markup .gloss-word/.gloss-icon è
  INIETTATO A RUNTIME da JS (enhancer glossario che wrappa le keyword). home.html
  statico ha le keyword plain. → cerca nel JS builder del glossario.
  Grep target: "gloss-word" / "gloss-icon" nei sorgenti JS di airoobi.com.

DIFETTO VERO: il contenuto del badge è il CARATTERE DI TESTO letterale "i".
Inquina: innerText → "airdropi" · SEO (Google indicizza "airdropi ARIAi Kaspai")
· screen reader → "airdrop i" · copy-paste → "airdropi".

FIX (proposta ROBY — tu sign-off):
Nel builder JS, l'icona non deve contenere testo. Markup iniettato:
  <i class="gloss-icon" aria-hidden="true"></i>     (vuoto)
+ CSS:
  .gloss-icon::before { content: "i"; }
Il content di uno pseudo-elemento NON entra in innerText, non è copiabile, non è
indicizzato. Un fix → tutti e 7 i sintomi spariscono.

Smoke verify post-fix: web_fetch home + investor page, grep 0 hit su
airdropi/ARIAi/Kaspai/Bravei/Blockchaini/Referrali/NFTi.

Severity P1 · investor-facing · pre-FASE D Kaspa Foundation. Non-blocking
GO-LIVE Ven 22 ma alta priorità W5.
```

### RS #VALUTA · rename menu (decisione Skeezu LOCKED 21/05)

```
RS · STOP+ASK #4 VALUTA · DECISIONE SKEEZU LOCKED 21/05

Menu dApp "VALUTA" (ambiguo: currency vs evaluate) → rename in "FAI VALUTARE".
Esplicito sull'azione, allineato al funnel EVALOBI. Route invariata.
Aggiorna anche eventuale aria-label della voce menu.
Lampo — bundle con FASE 2.
```

---

## Green-light esecuzione

Stato STOP+ASK: **4/4 risolti**. Sblocchi:

- **FASE 1 (Bug P0):** chiusa lato re-debug codice. Resta solo la verifica/redeploy ops → `RS #3-bis`. È ops, **non blocca FASE 2**.
- **FASE 2 (RS #1 Solana home.html + RS #2 /invita claim falso + RS #VALUTA + footer bump):** **GREEN-LIGHT**. Procedi quando vuoi.
- **FASE 3 (RS #4-bis "-i" + RS #5 onboarding modal):** RS #4-bis ora ha root cause + fix definito, non serve più la mia hypothesis-list. Procedibile post-FASE 2.
- **FASE 4 (P2/P3 backlog):** confermato W5+, con raccomandazione di promuovere `B-P2-1 draw` a P1.

Audit-trail: questo file = reply ROBY al tuo triage. Atteso da te: `CCP_RS1_RS2_Closing_FixLampo` post-FASE 2 + esito verifica deploy Bug P0.

Timeline GO-LIVE Ven 22/05 intatta: tight ma feasible, il blocker era il deploy del fix già esistente — non c'è codice nuovo da scrivere per il P0.

---

*ROBY · Strategic MKT & Comms & Community · Reply CCP UAT Triage 21 May 2026 · 4 STOP+ASK chiusi via retest Chrome ext live · daje team a 4*
