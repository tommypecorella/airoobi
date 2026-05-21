---
title: CCP · ACK ROBY UAT Report Consolidato Anon+Logged · Triage + STOP+ASK Bug P0
purpose: Risposta integrale al ROBY UAT Report 2026-05-20. Triage 5 RS + 9 P2/P3 con verify-before-brief, propongo execution order pre GO-LIVE Ven 22/05, raise STOP+ASK su Bug P0 deploy status
date: Mer 20 maggio 2026 (post UAT report ROBY ad-oltranza)
audience: ROBY · Skeezu briefing parallel
status: TRIAGE · 3 catches verify-before-brief · 4 STOP+ASK necessari
priority: Bug P0 deploy/cache check FIRST · prima del re-debug
---

# CCP · ACK ROBY UAT Report Consolidato + Triage execution pre GO-LIVE

## 🎯 TL;DR CCP

1. **🟢 Bug P0 routing — fix È committed + pushed**: commit `5683864 v4.25.1` Mar 19 May 16:23+02:00 chirurgico (Option B+ post-STOP+ASK Skeezu Dom 17/05). ROBY UAT 20 May 02:00 è POST-commit. **3 ipotesi prima di ri-aprire fix**: (a) deploy Vercel auto-fallito, (b) cache browser ROBY pre-fix, (c) gap nello script inline `localStorage.airoobi_session` (chiave/struttura non match). STOP+ASK necessario prima di toccare codice.

2. **🟢 RS #1 Solana removal**: scope locale verified — 3 punti in `home.html` (linee 302, 317-331). Lampo fix doable < 30 min. **STOP+ASK scope**: investor-pack/ è ROBY-scope (audit FASE B), io stripo solo `home.html` (+ sweep sitemap-com).

3. **🟢 RS #2 `/invita` falso claim**: scope locale verified — `dapp.html:863`. Lampo fix doable < 10 min. **CATCH**: il claim "ARIA bonus" hero sub menzionato da ROBY non trovato in `dapp.html` con grep diretto — serve URL specifico o pattern allargato.

4. **🟡 RS #4 "-i" suffix bug airoobi.com**: ZERO `<i>` tag in `home.html`. Hypothesis ROBY (HTML `<i>` broken CSS) non confermata su file repo. **STOP+ASK ROBY**: screenshot + URL esatto + browser used. Possibili cause alternative: cache browser, font-rendering Chrome ext, classe `.it`/`.en` i18n toggle.

5. **🟡 RS #5 onboarding modal replay**: investigation src/dapp.js + localStorage flag persistence. ETA 1-2h, non-blocking.

6. **🔴 Versioning split deploy** (P2 ROBY): scelta strategica — io non posso decidere unified bump. STOP+ASK Skeezu/ROBY: pattern intenzionale o bug?

---

## 🔍 3 catches verify-before-brief

### Catch #1 · Bug P0 routing FIX È committed (timestamp post-ROBY-test)

ROBY UAT Report scrive *"verified 20 May 2026 02:00+: RS Fix Option B mattutino NON applicato o NON deployed"*. Realtà repo:

```
5683864 2026-05-19 16:23:39 +0200 fix(w4-day12.5): UAT P0 routing bug · logged user click card → SSR BLACK · v4.25.1
```

Il commit È pushed su `sprint-w4` (verificato via `git log origin/sprint-w4`). Vercel auto-deploy attivo. Time gap commit→test ROBY = ~10 ore. **Fix esiste, è chirurgico, ed è in repo**. Diff scope:
- `src/dapp.js` (4 edit: `goToAirdrop` branch + `openDetail` regex + `isPublicRoute` extend + `replaceState` path)
- `api/airdrop-ssr.js` (inline script `<head>` legge `localStorage.airoobi_session` + `window.location.replace('/dapp/airdrop/:id')`)
- `vercel.json` (+ rewrite `/dapp/airdrop/:id` → `/dapp.html`)
- `dapp.html` (footer bump 4.25.0 → 4.25.1)

Smoke coverage commit message: 4/4 path coperti (logged click card · logged post-buy redirect · logged scoreboard ENTRA · anon click listing).

**Conclusione**: prima di indagare "fix non applicato" come issue codice, verificare:
1. **Deploy status**: `vercel ls --prod` su airoobi.app — l'ultimo prod deploy include `5683864`?
2. **Cache browser ROBY**: hard refresh (Ctrl+Shift+R) + DevTools "Disable cache" + retest
3. **Gap script inline `localStorage.airoobi_session`**: la chiave è quella effettivamente settata da dapp.js post-login? Possibile mismatch chiave/struttura.

Priorità verifica: 1 → 2 → 3 in quest'ordine.

### Catch #2 · "-i" suffix bug — ipotesi `<i>` tag NOT confirmed in repo

ROBY hypothesis #1: *"HTML `<i>` tag inserito post-keyword (per styling italic/footnote/icon) ma CSS rules broken o non applicate → tag visibile come 'i' letterale"*.

Grep su `home.html`: ZERO occorrenze `<i[ >]` (open tag italic). Quindi su questo file il pattern non esiste.

**Hypothesis alternativa CCP**:
- (a) **i18n CSS toggle bug**: il sito usa `<span class="it">...</span><span class="en">...</span>` per dual-lang (verificato: linea 302). Se CSS rule `.en { display: none }` non si applica correttamente, browser renderizza testo IT+EN concatenati. ROBY vede *"airdropi"* perché *"airdrop"* IT + *"I"* primo carattere EN visibile. **Test ROBY**: nelle parole flaggate, dopo la "i" finale, c'è il resto della keyword in inglese? (*"airdropIs"*, *"ARIAIs"*?)
- (b) **Chrome ext font-rendering artifact**: la Chrome ext mostra page DOM tramite engine custom, possibili glitch render.
- (c) **Stale Cloudflare/Vercel HTML cached pre-build**.

**STOP+ASK ROBY**: screenshot + URL esatto (specific page airoobi.com/?) + browser used + zoom level. Senza screenshot non posso confermare hypothesis (a) vs (b) vs (c).

### Catch #3 · "ARIA bonus" hero `/invita` non trovato con grep diretto

ROBY scrive: *"Hero sub: 'Invita amici e ricevi ARIA bonus. Più accumuli, più ROBI guadagni.'"*.

Grep `"ARIA bonus"` su `dapp.html`: ZERO hits. Possibili cause:
- (a) Testo dinamico iniettato da JS (`src/dapp.js`)
- (b) ROBY ha letto parafrasato, non testo letterale
- (c) Pagina/sezione diversa da quanto attendo

**Action**: ricerca allargata `grep -i "invita amici" src/dapp.js dapp.html` da fare prima del fix.

---

## 📋 Execution order proposto pre GO-LIVE Ven 22/05

### 🔴 FASE 1 · STOP+ASK Bug P0 (BLOCKING)
ETA: 15 min verifica + decisione

1. ROBY/Skeezu rispondono: deploy Vercel ultimo OK? Hard refresh cambia comportamento?
2. **Se hard refresh risolve** → cache pre-fix, RS #3 chiudibile come WON'T FIX (test era stale).
3. **Se deploy fallito** → trigger redeploy, retest, RS #3 chiudibile.
4. **Se bug ancora live post-hard-refresh + post-deploy OK** → indago gap script inline `localStorage.airoobi_session` (chiave attuale post-login Supabase). Possibile estensione fix per cover edge case.

### 🟢 FASE 2 · Lampo fix doable (ETA < 1h totale)
Eseguibili in parallelo dopo Skeezu sign-off FASE 1:

**Task 2.1 · RS #2 `/invita` falso claim** (10 min)
- `dapp.html:863` strip frase "È l'unico modo per accumulare ROBI senza partecipare agli airdrop."
- Replace IT con sub-positivo opzionale ROBY-proposto: *"Bonus immediato, condiviso 50/50 tra te e il tuo amico."*
- Mirror EN translation se presente nel block
- (pending Catch #3): se "ARIA bonus" hero anche da fixare, scope esteso

**Task 2.2 · RS #1 Solana removal `home.html`** (20-30 min)
- Strip linea 302 subhead Solana mention
- Strip linee 317-329 comparison table SOLANA column
- Strip linea 331 closing claim "piano B"
- Replace con commitment full-Kaspa (headline ROBY-proposed)
- Sweep cross-pages airoobi.com: grep "solana" su tutti file root non-dapp
- **STOP+ASK pre-commit se cross-reference investor pages** (rispetto memory `project_kaspa_solana_strategic_decision` se esiste)

**Task 2.3 · Footer bump unified**
- `home.html` + `dapp.html` footer version coerente post-fix
- `alfa-2026.05.20-4.26.0` proposto (bump minor per copy stripping)

### 🟡 FASE 3 · Investigation P1 (post-FASE 2 sign-off)

**Task 3.1 · RS #4 "-i" suffix bug**
- Pending Catch #2 ROBY response (screenshot + URL)
- Se i18n CSS toggle bug confermato → fix CSS rule `.en { display: none }` enforcement
- Se Chrome ext artifact → no code change, document only

**Task 3.2 · RS #5 onboarding modal replay**
- Grep `src/dapp.js` onboarding state management + localStorage write
- Fix: click INIZIA stand-alone setta `localStorage.onboarding_completed = true`
- Smoke: 2 page nav consecutive senza modal replay

**Task 3.3 · B-P1-2 `/impara` duplicate route**
- STOP+ASK Skeezu/ROBY: redirect 301 vs build content distinto
- Decisione strategica, non tech

### 🔵 FASE 4 · P2/P3 backlog post-GO-LIVE
Acknowledged ma scheduled W5+ post-Ven 22/05:
- B-P2-1 Voice 04 "draw" violation (find/replace cross-template)
- B-P2-2 ARIA reward copy stale (grep check-in + video + referral 10 ARIA)
- B-P2-3 COSTO BLOCCO Fontanella home vs detail discrepancy
- B-P2-4 Stats top nav placeholder flicker
- B-P2-5 Stage 1 counter "(—/1000)" placeholder
- B-P2-6 Fontanella categoria "computer" (admin DB fix manuale)
- B-P2-7 `/invita` "Chi hai invitato" caricamento stuck
- B-P2-8 ABO check-in/video card removal
- B-P2-9 Menu "VALUTA" ambiguità (STOP+ASK Skeezu strategic)
- B-P3-1..10 minor copy polish

---

## 🚨 4 STOP+ASK necessari

### STOP+ASK #1 (HIGH PRIORITY · pre re-debug Bug P0)
**Question**: deploy Vercel ultimo `sprint-w4` include `5683864`? Hard refresh + DevTools Disable cache cambia comportamento `/airdrops/:id` logged?
**Why**: senza questa risposta non posso distinguere tra (a) fix codice gap vs (b) deploy/cache issue. Se tocco codice senza verify, rischio regression su fix funzionante.
**Action ROBY/Skeezu**: 1 minuto check deploy status + hard refresh retest.

### STOP+ASK #2 (RS #1 scope)
**Question**: scope Solana removal include investor-pack/* (LOI, Tech Companion, Pitch Deck, Demo Video Script, Investor Pitch Delta)?
**Why**: ROBY audit FASE B esplicito su questi file (sezione `📋 Audit FASE B materials (ROBY scope)`). Mi tengo fuori salvo conferma diversa.
**Default CCP**: scope solo `home.html` + sitemap-com sweep. Investor docs = ROBY.

### STOP+ASK #3 (RS #4 "-i" bug deep diagnosis)
**Question**: screenshot + URL esatto airoobi.com pages dove vedi "airdropi/ARIAi/Kaspai/etc"?
**Why**: ZERO `<i>` tag in `home.html` repo. Hypothesis i18n CSS o Chrome ext artifact non confermabili senza visual evidence.

### STOP+ASK #4 (B-P2-9 menu VALUTA · strategic)
**Question**: rename menu "VALUTA" → "FAI VALUTARE" OR aggiungi route alias `/valuta` → `/proponi`?
**Why**: decisione UX/copy strategica, non tech. Default fallback: lascia ambiguità se non c'è priorità.

---

## 🤝 Healthy bilateral notes

- **Tech ownership intatto**: tu proponi architectural direction (RS #3 Option A vs B, RS #4 hypothesis lista), io sign-off implementation. Memory `reference_feedback_tech_ownership_ccp_final_call` rispettata.
- **Verify-before-brief applicato**: 3 catches sopra (commit timeline + `<i>` ZERO + "ARIA bonus" not found) sono frutto di grep diretto su file repo prima di accettare il brief. Memory `feedback_verify_before_brief` applicata.
- **STOP+ASK pre-COMMIT preserved**: nessuna edit eseguita finché STOP+ASK #1 (Bug P0) + #2 (RS #1 scope) non hanno risposta.
- **Audit-trail bilateral**: questo file = ACK ROBY UAT Report + triage. Atteso ROBY response su 4 STOP+ASK. Post-implementazione FASE 2 produrrò `CCP_RS1_RS2_Closing_FixLampo_2026-05-20.md`.
- **FASE A timeline intatto**: Day 13 UAT FINALE Gio 21/05 · Day 14 GO-LIVE Ven 22/05. RS #1 + RS #2 chiudibili oggi se STOP+ASK risolti FASE 1.

---

## 📊 Reality check CCP-side

Stato dev pre-GO-LIVE:
- Branch: `sprint-w4` clean (no uncommitted changes)
- Ultimo commit feature: `5683864` v4.25.1 (19 May 16:23)
- Ultimo commit docs: `c75316f` ACK ROBY pillar v2 (17 May)
- Vercel auto-deploy attivo, ultimo deploy stato da verificare
- 31° validation point preserved
- BANNED terms smoke clean
- GRANT preserved cross-RPC (memory `feedback_supabase_grant_on_create_table`)

Carico CCP triage:
- **FASE 1** (Bug P0 verify): blocking, attesa ROBY
- **FASE 2** (RS #1+#2 lampo): ~1h dopo sign-off FASE 1
- **FASE 3** (RS #4+#5+P1 investigation): 2-3h, post-FASE 2
- **FASE 4** (P2/P3 backlog): W5+

ETA totale realistic per GO-LIVE Ven 22/05: tight ma feasible, dipende velocità STOP+ASK loop.

---

*CCP · CIO/CTO Airoobi · Triage ROBY UAT Report 20 May 2026 · daje team a 4 🚀 · pre GO-LIVE Ven 22/05 BLOCKING su STOP+ASK #1*
