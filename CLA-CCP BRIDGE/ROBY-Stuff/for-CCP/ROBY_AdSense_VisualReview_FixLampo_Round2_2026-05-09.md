---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Fix Lampo Round 2 · 18 issue da visual review Skeezu (7 non-loggato + 11 loggato) · estensione coverage v2.2 + sweep aads + content rewrite FAQ
date: 2026-05-09
ref: ROBY_AdSense_R4_AirdropsPublic_ContentBrief_2026-05-09.md (R4 brief content) + CCP_Round_Patch_AdSense_Fase2_H2_2026-05-09.md (H2 SHIPPED) + Skeezu visual review chat 2026-05-09 evening
status: BRIEF READY · CCP fix lampo round atteso · ETA stima 4-6h post calibration ROBY estimate (-30% standard) → real estimate 3-4.5h
---

# Fix Lampo Round 2 · 18 issue post visual review Skeezu

## TL;DR

Skeezu ha fatto visual review v4.3.0 LIVE e identificato 18 issue (7 da non-loggato + 11 da loggato). Pattern dominante: **legacy v1 navy blue/black NON pivotato a brand v2.2** in molte sezioni dApp loggata (override coverage MEGA closure ~80%, restante 20% include parti critical dropdown menu + portafoglio + dashboard percorso + marketplace airdrops + airdrop detail). Plus **a-ads ad banner placeholder visibile cross-page** (non-loggato + loggato). Plus 3 fix chirurgici + 2 content rewrite FAQ.

**Categorizzazione:**
- **A.** CSS sweep "blu legacy → v2.2 light/gold" (10 items, IL PEZZO GROSSO)
- **B.** Rimozione a-ads banners (4+ items, sweep grep-based)
- **C.** CSS singoli fix chirurgici (3 items)
- **D.** Content rewrite FAQ (2 items, ROBY content già preparato)
- **E.** Backlog W3 (gap commemorativo brand archive — NO action questo round)

ETA stimato CCP: **4-6h ROBY initial estimate** → calibrato `feedback_roby_estimate_calibration.md` -30% chunk implementativi puri → **3-4.5h real estimate**. Skeezu directive "subito" applicabile, batch atomico singolo round.

---

## A · CSS sweep "blu legacy → v2.2 light/gold" (10 items)

Pattern comune: parti dApp loggata + 1 pagina educational hanno tema navy blue/black v1 (background `#1a1a1a`/`#0d0d0d` o variants, accent `#4A9EFF` blu Aria legacy, contrast text gray-300 su navy = illeggibile). Override CSS extension necessaria su `dapp-v2-g3.css` (o file equivalente) per portare tutto a brand v2.2 (BG `#FAFAF7` light, ink `#1B1814`, accent `var(--airoobi-gold)` Renaissance #B8893D).

### A.1 · Menu EDU dropdown · ILLEGGIBILE

**Symptom (screenshot 1 loggato):** dropdown menu EDU (COME FUNZIONA / IMPARA / BLOG / FAQ) con BG navy blu scuro su contenuto light page → contrast fail per voci link che appaiono grigio chiaro su navy
**Fix:** override `.nav-dropdown-menu` (o classe equivalente) → BG `var(--airoobi-bg, #FAFAF7)` + ink `var(--airoobi-ink, #1B1814)` + box-shadow soft + border subtle

### A.2 · Menu utente avatar dropdown · ILLEGGIBILE

**Symptom (screenshot 2 loggato):** dropdown profilo utente (top-right avatar click) con BG navy blu, voci link "ceo@airoobi.com / Home / Profilo / Portafoglio / +Invita amici / Vendi (airdroppa) / Cambia password / Come funziona / Gestisci (ABO) / Logout / Elimina account" tutti illeggibili (testo grigio su navy)
**Fix:** override `.user-menu-dropdown` (o equivalente) → stesso pattern di A.1 + danger zone (Logout + Elimina account) preserva color coral `var(--airoobi-coral)` per visibility

### A.3 · Dashboard "Il tuo percorso" cards · ILLEGGIBILE

**Symptom (screenshot 3 loggato):** cards "Blocchi acquistati 327 / ARIA investiti 5251 / Con noi dal 11 mar 2026" con BG navy + label text quasi invisibile (colore navy chiaro su navy scuro)
**Fix:** override `.stats-bar`, `.stats-bar-item`, `.journey-stat` (extend dal MEGA closure pattern) → BG light + ink + numeri prominent gold

### A.4 · Portafoglio cards ARIA/ROBI/KAS · ILLEGIBILE

**Symptom (screenshot loggato):** /portafoglio cards 3 (ARIA 999.990.399 / ROBI 10 / KAS —) con BG navy + valori grandi colorati (ARIA blu legacy, ROBI gold, KAS teal) + sub text grigio chiaro su navy. Globalmente coerente come "wallet finance dark theme" ma rompe brand v2.2 light.
**Fix:** override `.wallet-card`, `.asset-card` (estend per famiglia) → BG light + retain accent colors (ARIA blu, ROBI gold, KAS teal) ma su BG light + sub text muted ink. Plus chart "ANDAMENTO ROBI" → BG light + linea gold

### A.5 · /explorer · ILLEGGIBILE (no screenshot, recon CCP necessario)

**Symptom (no screenshot fornito):** Skeezu directive "rendere leggibile pag /explorer"
**Fix CCP recon:** verifica template route /explorer, applica pattern override v2.2 light theme se trova legacy dark. Se template è particolare (es. data table heavy), Skeezu potrebbe volere variant — flag se ambiguo.

### A.6 · /invita link box · BLU LEGACY

**Symptom (screenshot loggato):** sezione "Il tuo link per invitare amici" su BG navy + input field bianco + button "COPIA" gold OK + 4 button outline (WhatsApp/Telegram/X/Twitter/Email) outline white su navy = bordi invisibili
**Fix:** override `.referral-link-box`, `.share-buttons` → BG light + button outline ink visible

### A.7 · /proponi tipo airdrop cards + regole box · BLU LEGACY

**Symptom (screenshot loggato):** sezione "TIPO DI AIRDROP" con 3 card Flash/Standard/Extended in navy bg + valori "6h/24h/72h" blu legacy + sub text grigio. Plus box "Regole" navy bg + text grigio
**Fix:** override `.airdrop-type-card`, `.airdrop-rules-box` → light theme + valori grandi gold + sub ink-muted

### A.8 · /airdrops marketplace · BLU LEGACY (PRIORITY · "pagina più importante dell'app" Skeezu)

**Symptom (screenshot loggato):** marketplace airdrops con search bar navy + filter pills navy ("TUTTI" gold OK / PREFERITI/SOLO MIEI/categoria pills outline grigi su navy) + category cards "47 attivi/12 in arrivo" navy + categoria cards navy con sub text invisibile + airdrop cards con badge "PRESALE · 2X MINING" blu legacy
**Fix:** override `.marketplace-search`, `.filter-pill`, `.category-card`, `.airdrop-card`, `.badge-presale-mining` → light theme cross-section. Badge "PRESALE · 2X MINING" da blu legacy → gold accent
**Note Skeezu:** "stilizzarla bene, è la pagina più importante dell'app" — CCP applica brand v2.2 con cura extra (visual hierarchy, gold accent strategici, white space generoso, manifesto-tone)

### A.9 · /airdrops/:id detail page · BLU LEGACY

**Symptom (screenshot loggato Artemide Tolomeo Lampade):** preview area navy + "Oo" simbolo top-left mancante o renderizzato come placeholder (vedi freccia rossa Skeezu) + purchase widget navy + slider gold + "ACQUISTA BLOCCHI" CTA black + tessere airdrop placeholder grid + badge "PRESALE 2x" blu legacy
**Fix:**
1. **Restore "Oo" simbolo top-left nav** (verificare path `/AIROOBI_Symbol_Black.png` o equivalent v2.2)
2. Override `.airdrop-detail-preview`, `.purchase-widget`, `.airdrop-blocks-grid` → light theme
3. Slider già gold OK ma verificare che sia coerente con v2.2 (no blu cyan v1 residue)
4. Badge "PRESALE 2x" → gold accent invece di blu

### A.10 · /come-funziona-airdrop blu refuso → gold sweep (non-loggato review)

**Symptom (screenshot non-loggato):** H1 "Come funziona un airdrop" gradient blu + pill "In questa pagina" 11 sezioni in light blue/navy
**Skeezu directive (chiarito A+B):** "blu è refuso layout precedente, usare oro" → cross-page sweep su tutte pagine educational legacy che hanno azzurrino residue
**Fix:** sweep grep `--blue-*`, `#4A9EFF`, `rgba(74,158,255,*)` cross-domain (specifically `come-funziona-airdrop.html`, `come-funziona-airdrop.css` o equivalente). Sostituire con `var(--airoobi-gold)` o `var(--airoobi-ink)` a seconda del contesto (titoli/gradient → gold, pill BG → light gold tinted, pill text → ink)
**Note:** verifica anche se altre pagine educational hanno stesso refuso (es. `impara/*` se esiste, `faq.html` ha titolo blu pure → stessa categoria)

---

## B · Rimozione a-ads banners ovunque (4+ items, sweep grep-based)

**Symptom cross-page (screenshots multipli):**
- Non-loggato #1 landing.app: "Web3 ads with onchain targeting · Advertise to crypto natives with Slise · slise.xyz" sotto sezione "Ultimi articoli"
- Loggato #4 dashboard: "Advertise in this ad space · Create a campaign in just 5 minutes · aads.com" banner nero grande
- Loggato #9 /proponi: "Advertise in this ad space" sotto regole box
- Loggato #8 in generale: ovunque banner aads visibili

**Skeezu directive:** **rimuovere TUTTI gli aads banner cross-page**, sia su pagine non-loggato che loggato. Pattern era ad-tester legacy (a-ads.com publisher fallback), ora va rimosso completamente.

**Fix CCP:**
1. Grep ricorsivo `a-ads.com\|aads.com\|aads.js\|2429619` cross-repo
2. Identifica template injection points (probabile JS snippet inline `<script async src="//www.a-ads.com/2429619/aads.js"></script>` + container DIV)
3. Edit chirurgico per rimuovere tutti i container ad + script src
4. Smoke verify cross-page (curl spot 5+ URL): zero `aads` reference rimasti
5. **Important Skeezu directive Round 1 NON eseguito a fondo:** in Fase 1 round patch i blog articles MIRROR avevano ancora `<script async src="//www.a-ads.com/2429619/aads.js"></script>` ma CCP non li ha toccati (out of scope round patch). Ora questo round include sweep cross-domain inclusi blog articles + dApp pages + landing pages.

**Note ROBY:** ads.txt LIVE corretto (Fase 1 confirmed, AdSense console re-verified da Skeezu). Rimuovere aads.com banner NON tocca ads.txt (è il file pubblicitario AdSense, file separato). Solo rimozione visual ad placeholder a-ads.com legacy fallback.

---

## C · CSS singoli fix chirurgici (3 items)

### C.1 · airdrops-public.html hero H1 font-size reduction (non-loggato #2)

**Symptom (screenshot non-loggato):** hero H1 "Il primo marketplace dove vendere e ottenere quello che desideri... È una skill." troppo grande, percezione "rettangolo bianco" a sinistra (Skeezu chiarito A: "diminuisci il font")
**Fix:** edit airdrops-public.html hero H1 CSS `font-size: clamp(2rem, 5vw, 3.5rem)` → `clamp(1.75rem, 4vw, 2.75rem)` (riduce ~25% scale)
**Note:** mantieni rhythm e leggibilità. Verifica mobile <480px scaling.

### C.2 · /faq logo errato → bg_white version (non-loggato #6)

**Symptom (screenshot non-loggato):** /faq mostra logo "AIROOBI · Dream Robe E-Commerce" su BG grigio scuro baked-in (sembra sbagliato/bg-color cotto in PNG)
**Skeezu directive:** "logo airoobi sbagliato, ci vuole quello con bg_white"
**Fix:** verificare path attuale logo /faq + sostituire con `/AIROOBI_Logo_Black.png` (logo nero su transparent — visibile su BG light) oppure variante `bg_white` se naming diverso (recon CCP path)
**Verify:** check 06_public_assets/images/ canonical path dei logo + scegli quello corretto

### C.3 · /signup + /login footer version stale (non-loggato #7)

**Symptom (screenshot non-loggato):** /signup footer mostra `alfa-2026.04.27-W1.day1` invece di `alfa-2026.05.09-4.3.0` (current version post v4.3.0 deploy)
**Skeezu directive:** "verifica anche la pag di login"
**Fix:** grep `alfa-2026.04.27-W1.day1` + variants stale cross-repo, sed update a `alfa-2026.05.09-4.3.0` (verify-pre-edit pattern). Spot check signup.html + login.html + qualsiasi altra pagina con version footer stale.

---

## D · Content rewrite FAQ (2 items, ROBY content già preparato)

### D.1 · FAQ Q2 ARIA "0.10 cent + gratis fino preprod" (non-loggato #3)

**Symptom:** FAQ Q2 attuale dice "ARIA si accumula gratuitamente" senza specificare prezzo nominale + roadmap pre-prod/prod
**Skeezu directive:** specificare 0.10 cent/ARIA + gratis fino preprod + future modalità accumulo gratis
**Nuova versione (ROBY content):**

```html
<h3>
  <span class="it" lang="it">Come ottengo ARIA per partecipare?</span>
  <span class="en" lang="en">How do I get ARIA to participate?</span>
</h3>
<p>
  <span class="it" lang="it">Ogni ARIA ha un valore di <strong>0,10 centesimi</strong>. Adesso, durante la fase Alpha, puoi ottenere ARIA <strong>gratuitamente</strong> dal faucet quotidiano, dalla sequenza di check-in giornaliera, invitando amici che si registrano e completando le sezioni educative del marketplace. Quando AIROOBI passerà a pre-produzione e produzione, gli ARIA diventeranno acquistabili — ma resteranno attive diverse modalità per accumularli gratuitamente partecipando alla community. Più sei presente in fase Alpha, più ARIA accumuli senza pagare nulla, costruendo un vantaggio strutturale per quando il marketplace andrà LIVE.</span>
  <span class="en" lang="en">Each ARIA is worth <strong>0.10 cents</strong>. Right now, during the Alpha phase, you can get ARIA <strong>for free</strong> from the daily faucet, the daily check-in sequence, by inviting friends who register, and completing the educational sections of the marketplace. When AIROOBI moves to pre-production and production, ARIA will become purchasable — but several free accumulation methods will remain active by participating in the community. The more you're present in Alpha phase, the more ARIA you accumulate without paying anything, building a structural advantage for when the marketplace goes LIVE.</span>
</p>
```

**Fix CCP:** sostituire Q2 attuale in `airdrops-public.html` con il nuovo HTML sopra. Aggiornare anche JSON-LD FAQPage `mainEntity` array (Q2 acceptedAnswer text) con la versione IT corrispondente.

### D.2 · FAQ Q3 ROBI "no tessere di rendimento" (non-loggato #4)

**Symptom:** FAQ Q3 attuale dice "ROBI sono tessere di rendimento" — Skeezu non vuole più "tessere di rendimento", semmai "portafoglio che contiene ROBI"
**Nuova versione (ROBY content):**

```html
<h3>
  <span class="it" lang="it">Cosa sono i ROBI e a cosa servono?</span>
  <span class="en" lang="en">What are ROBI and what are they for?</span>
</h3>
<p>
  <span class="it" lang="it">ROBI sono asset digitali del tuo <strong>portafoglio AIROOBI</strong> che maturano valore se non ricevi un oggetto in un airdrop. Ogni partecipazione conta: se non ricevi l'oggetto, accumuli ROBI proporzionali ai blocchi investiti. ROBI cresce di valore nel tempo grazie al meccanismo di treasury backing AIROOBI, e si può convertire ogni lunedì entro un cap settimanale. Niente è sprecato.</span>
  <span class="en" lang="en">ROBI are digital assets in your <strong>AIROOBI wallet</strong> that mature in value if you don't receive an item in an airdrop. Every participation counts: if you don't receive the item, you accumulate ROBI proportional to the blocks invested. ROBI grows in value over time thanks to the AIROOBI treasury backing mechanism, and can be converted every Monday within a weekly cap. Nothing is wasted.</span>
</p>
```

**Fix CCP:** sostituire Q3 attuale in `airdrops-public.html` con il nuovo HTML sopra. Aggiornare anche JSON-LD FAQPage `mainEntity` array (Q3 acceptedAnswer text) con la versione IT corrispondente.

**Note ROBY:** "tessere di rendimento" era naming legacy. "Portafoglio che contiene ROBI" è più chiaro per utente generalista + coerente con la sezione `/portafoglio` che esiste già nella dApp. Aggiungo anche update a `feedback_voice_principle_04_anti_gambling_strict.md` o crea nuova entry con "tessere di rendimento" come deprecated naming.

---

## E · Backlog W3 (no immediate action)

### E.1 · /legacy/design-system-v1.html commemorativo (gap discovered durante questo review)

**Pattern:** `feedback_brand_evolution_archive.md` (memoria, firmato Skeezu 2 May 2026) lockava "ad ogni brand pivot, Phase 0 = creare /legacy/design-system-vN.html con snapshot del design uscente. Asset-trail visivo permanente."

**Gap discovered:** durante brand pivot v2 (2-7 May 2026) il pattern Phase 0 archive NON è stato eseguito. `/legacy/design-system-v1.html` snapshot del brand v1 (BLACK + GOLD #B8960C + Cormorant) NON esiste.

**Mio default:** backlog W3 (post AdSense approval). Skeezu può promuovere a priority HIGH se vuole recovery imminent.

---

## Acceptance criteria post-fix-lampo

Smoke verify post-deploy v4.4.0:

### A · Coverage v2.2 light/gold sweep
1. ✅ Menu EDU dropdown light theme leggibile (curl /dapp.html spot check menu CSS)
2. ✅ Menu utente dropdown light theme + danger zone coral preserved
3. ✅ Dashboard "Il tuo percorso" cards light theme
4. ✅ /portafoglio ARIA/ROBI/KAS cards light theme + accent colors preserved
5. ✅ /explorer leggibile (CCP recon scope)
6. ✅ /invita link box light + button outline visible
7. ✅ /proponi tipo airdrop cards + regole box light
8. ✅ /airdrops marketplace search + filter + category + cards light + manifesto-tone
9. ✅ /airdrops/:id detail page light + "Oo" simbolo top-left restored
10. ✅ /come-funziona-airdrop blu refuso eliminato (sweep cross-page)

### B · A-ads sweep
11. ✅ landing.app: zero "Web3 ads with onchain targeting / slise.xyz" banner
12. ✅ /dashboard: zero "Advertise in this ad space / aads.com" banner
13. ✅ /proponi: zero a-ads banner sotto regole
14. ✅ Cross-page grep: zero `a-ads.com\|aads.com\|aads.js\|2429619` reference

### C · CSS chirurgici
15. ✅ airdrops-public.html hero H1 ridotto (clamp 1.75-2.75rem)
16. ✅ /faq logo correct (bg_white path)
17. ✅ /signup + /login footer version `alfa-2026.05.09-4.4.0` (post version bump)

### D · Content rewrite FAQ
18. ✅ airdrops-public.html FAQ Q2 ARIA con "0.10 cent" + "gratis fino preprod"
19. ✅ airdrops-public.html FAQ Q3 ROBI senza "tessere di rendimento" + "portafoglio AIROOBI"
20. ✅ JSON-LD FAQPage mainEntity Q2+Q3 acceptedAnswer aggiornato

### E · Version bump + smoke
21. ✅ Version bump 4.3.0 → 4.4.0 cross-files (footer + cache busters)
22. ✅ Smoke prod Googlebot UA su 5 URL + spot check 3 dApp page loggato (via screenshot Skeezu post-deploy)

---

## Numeri di riferimento

| Category | Items |
|---|---:|
| A · CSS sweep blu legacy → v2.2 light/gold | 10 |
| B · Rimozione a-ads banners | 4+ (sweep cross-domain) |
| C · CSS singoli fix chirurgici | 3 |
| D · Content rewrite FAQ | 2 |
| E · Backlog W3 (no action) | 1 |
| **Total fix immediate** | **19** |
| Files modificati stimati | 15-25 (override CSS extension + html chirurgici + sweep aads cross-domain) |
| Lines added/removed stimati | +400/-200 |
| Version bump | 4.3.0 → 4.4.0 |
| ETA stimato CCP (calibrato) | 3-4.5h batch atomico |
| Probability success post-fix | brand v2.2 coverage 95%+ across dApp loggata + acquisition funnel ready |

---

## Pattern operativi (recap memoria)

- **NO sed cascade** (`feedback_verify_before_sed.md`) — Edit chirurgici + grep verify pre-patch
- **NO rewrite legacy CSS dApp** (`feedback_override_css_pattern.md`) — extend selectors only su `dapp-v2-g3.css` o file equivalente
- **Pattern verify_before_edit** applicato ovunque (recon classi/path Pre-edit)
- **Pragmatic adaptation** OK se 5 criteri rispettati (`feedback_pragmatic_adaptation_accepted.md`)
- **Audit-trail immediate post-commit** (`feedback_audit_trail_immediate_post_commit.md`) — file CCP_*.md generato CONTESTUALMENTE
- **§A Discoveries** documentate se 3+ stale findings durante execution

---

## Skeezu standby + manual actions post-deploy

1. **Skeezu visual review post-fix lampo round 2** v4.4.0 (~10-15 min spot check su tutte 18 issue)
2. **Se OK** → click "Richiedi revisione" in console AdSense (criteri readiness 7/8 met → 8/8 met dopo questo round)
3. **Se issue residuali** → fix lampo round 3 lampo (SLA ≤2h CCP)

---

## Closing · pre-AdSense re-submission readiness target

Sprint AdSense unblock W2 Day 5 evening evolved in fix lampo round 2 più esteso del previsto. Era atteso ~7 issue da non-loggato review, sono diventati 18 con loggato review che ha rivelato **gap coverage v2.2 nelle parti dApp loggata** (override CSS che il MEGA closure aveva lasciato a 80% coverage).

Post questo round patch v4.4.0, brand v2.2 coverage dovrebbe raggiungere **95%+ cross-dApp** (loggato + non-loggato) + zero a-ads banner residue + content FAQ aggiornato + 3 fix chirurgici. Re-submission AdSense pronta.

ETA totale (calibrato): **3-4.5h CCP batch atomico**. Skeezu directive: subito.

CCP, daje, chiudiamo anche questo round. Pattern memoria + 5 criteri pragmatic adaptation + verify-pre-edit ovunque.

Standby ROBY:
1. ⏳ Skeezu lancia RS prompt CCP per fix lampo round 2
2. ⏳ CCP shippa + audit-trail file CCP_FixLampo_Round2_*.md
3. ⏳ ROBY sign-off ack simmetrico
4. ⏳ Skeezu visual review v4.4.0 (~10-15 min)
5. ⏳ Re-submission AdSense console (manual Skeezu)
6. ⏳ Attesa Google review (5-21 giorni)

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (fix lampo round 2 brief · 18 issue da visual review Skeezu non-loggato + loggato · 10 CSS sweep + 4+ aads removal + 3 CSS chirurgici + 2 FAQ rewrite + 1 backlog W3 · ETA 3-4.5h calibrato · pre-AdSense re-submission readiness 8/8 target)*
