---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Editorial audit request · airoobi.app rejection AdSense "Contenuti di scarso valore" · diagnosi pre-resubmit
date: 2026-05-09
ref: Skeezu screenshot AdSense console 2026-05-09 (status airoobi.app: Richiede attenzione · Contenuti di scarso valore · Last update 18 Apr 2026)
status: REQUEST · CCP audit editoriale completo richiesto · NO action su codice (Skeezu directive: prima ok Google, poi integration)
---

# Editorial Audit Request · AdSense rejection airoobi.app

## Contesto

Skeezu mi ha mostrato console AdSense:
- **Sito registrato:** `airoobi.app`
- **Stato:** "Richiede attenzione"
- **Motivo rejection:** "Contenuti di scarso valore" (thin content policy violation)
- **ads.txt:** "Non trovato"
- **Ultimo aggiornamento:** 18 Apr 2026 (PRE-fix Day 7 del 3 May)

**Strategic context Skeezu:**
- Vuole entrate da rewarded video ads (utenti dApp guardano video sponsored → ricevono +1 ARIA, max 5/giorno per design originario `AIROOBI_CONTEXT.md:125` + tabella `video_views` "sospesa in Alpha")
- Roadmap: prima ok Google AdSense → poi attivare wire technical integration → poi Ad Manager per rewarded video format
- **NO action CCP su codice/wiring per ora.** Solo audit + raccomandazione strategica

## Mio errore di assunzione (dichiaro upfront)

Avevo dato per scontato che `airoobi.app` fosse solo dApp behind-login, raccomandando pivot ad `airoobi.com` per AdSense. Skeezu mi ha mostrato che `airoobi.app` ha 5 URL pubbliche con content:
- `https://www.airoobi.app/`
- `https://www.airoobi.app/airdrops`
- `https://www.airoobi.app/impara`
- `https://www.airoobi.app/blog`
- `https://www.airoobi.app/faq`

Quindi la diagnosi reale richiede recon repo lato CCP, non assunzioni.

## Cosa serve da CCP

**Editorial audit completo** delle 5 URL pubbliche su `airoobi.app` da prospettiva Googlebot crawler + AdSense reviewer. Output: report `CCP_AdSense_Editorial_Audit_*.md` in for-CCP/ con sezioni sotto.

### A · Inventory content per URL (5 URL × 6 attributi)

Per ognuna delle 5 URL pubbliche:

1. **Word count actual** del content text-rich crawlabile (escludi nav/footer/UI chrome ripetitivi). Distingui: word count IT puro + word count EN puro (Skeezu fa bilingue inline su molte pagine, importante separare per evitare false count gonfiato).
2. **Tipologia content** (educational long-form / Q&A FAQ / blog index / card grid / landing CTA / glossary)
3. **SSR vs CSR**: cosa Googlebot vede effettivamente nel response HTML server-side prima JS execution (importante: SPA con CSR puro = invisibile a crawler base, anche se rendering finale è ricco)
4. **Originalità content**: text è originale e specifico AIROOBI o è generico/template/duplicato? Eventuali duplicate cross-URL (stesso shell dApp ripetuto su /airdrops e /impara è classic thin signal)
5. **Meta tags presenti**: `<title>`, `<meta description>`, `<meta robots>`, `<link rel="canonical">`, `<link rel="alternate" hreflang="...">`. Quale meta strategy è applicata (per pagina)
6. **Schema.org structured data**: presenza JSON-LD (Article, FAQPage, BreadcrumbList, Organization, WebSite). Importante per AdSense reviewer credibility

### B · Cross-domain duplicate content check

`airoobi.com/blog` e `airoobi.app/blog` — sono gli stessi 38 articoli? Dopo i fix Day 7 il leak inverso (com → app) era stato chiuso, ma:

1. Verifica se i 38 articoli `.html` sono effettivamente serviti da `airoobi.app/blog/<slug>.html` (lista actual + curl spot check 3-5 articoli random)
2. Verifica canonical tag su ogni articolo: punta a `airoobi.com` o `airoobi.app`?
3. Verifica sitemap-app.xml: include i blog articles? Se sì, le URL puntano a quale dominio?
4. Verifica robots.txt: ci sono sezioni `/airdrops`, `/portafoglio`, `/proponi`, `/miei-airdrop`, `/invita` (probabilmente UI shell auth-only) → sono `noindex` o crawlable? Se crawlable senza content reale → thin signal moltiplicatore.

### C · Crawler shell pollution detection

Probabile root cause #1 di "thin content": SPA dApp che renderizza chrome menu/wallet/forms/modali su ogni route, anche `/airdrops` e `/impara` (che dovrebbero essere educational/marketplace public). Googlebot vede 5.000 parole di chrome dApp duplicato across URL = duplicate content + thin proper signal.

Verifica:
1. Su `/airdrops` non-loggato: HTML server-side risposto contiene chrome dApp completo o è SSR pulito con solo content marketplace?
2. Su `/impara` non-loggato: idem — chrome dApp polluting il content educational?
3. Quanto del HTML è "scaffolding ripetuto" vs "content unique per URL"?

### D · Sitemap + robots.txt verification

1. `airoobi.app/sitemap.xml` (post-fix Day 7 = `sitemap-app.xml` rewrite) — quante URL include? Tutte le 5 pubbliche + 38 blog articles + altro?
2. `airoobi.app/robots.txt` — quale strategy? Permette crawl di `/airdrops`, `/impara`, `/blog`, `/faq`? Blocca le route auth-only?
3. ads.txt — file presente o no? Se no, dove dovrebbe stare e cosa dovrebbe contenere (Google publisher ID Skeezu riceverà post-AdSense approval)

### E · Quality grading per URL (1-10 da AdSense reviewer perspective)

Per ognuna delle 5 URL, dai grade 1-10 dove:
- 10 = blog SEO-grade lungo originale 1500+ parole con structured data
- 7-8 = page solida con content originale 800+ parole + meta + structured data
- 5-6 = content presente ma scarno o mal strutturato
- 3-4 = mostly UI shell con poco content text
- 1-2 = quasi vuoto o pure landing CTA

### F · Diagnosi finale + raccomandazioni

1. **Quale URL è il colpevole primario** del rejection "thin content"? Quali secondari?
2. **Top 3 fix priorità HIGH** che muoverebbero ago della bilancia (es. "SSR pulito su /airdrops senza chrome dApp", "trascrizione testo Lezione 3+4 video impara", "ads.txt setup")
3. **Top 3 fix priorità MEDIUM** (es. "JSON-LD FAQPage su /faq", "embed 3 blog teaser su home", "hreflang IT/EN separato invece di bilingue inline")
4. **Top 3 fix priorità LOW / nice-to-have** (es. "schema BreadcrumbList", "paginazione blog", "increase article meta description coverage")
5. **Stima ETA implementation** per fix HIGH+MEDIUM (CCP scope, post-Skeezu sign-off ROBY plan)
6. **Stima probabilità approval re-submission** post-fix HIGH+MEDIUM applicati (rough %)

## Modalità execution

- **Audit only**, NO code change. Skeezu directive: prima ok Google → poi integration.
- Output: `CCP_AdSense_Editorial_Audit_2026-05-09.md` (o data completion) in `for-CCP/`
- ETA stimato CCP: 1-2h work (lettura repo + curl spot check + analysis + report)
- Pattern: stesso recon preventivo del MEGA closure W2 Day 5 (`feedback_verify_before_edit.md` applicato in modalità "audit-only" invece di "pre-edit")

## Cosa farà ROBY post-CCP audit

1. Sign-off audit-trail simmetrico (`ROBY_Reply_CCP_Editorial_Audit_*.md`)
2. Strategic content brief per Skeezu (cosa scrivere/riscrivere/trascrivere) — questo è scope ROBY (Strategic MKT/Comms), non CCP
3. Plan operativo round patch CCP per fix HIGH+MEDIUM (separato, post-Skeezu sign-off su strategic content brief)
4. Decision dialog Skeezu su:
   - Resubmit airoobi.app dopo fix? O parallel-submit airoobi.com come secondary?
   - Mantenere bilingue inline o switch a hreflang separato (impatto SEO + content management)
   - Roadmap blog content production W3+ (40 articoli sono tanti se obsoleti, magari 20 freschi + 20 retired)

## Reference files

- `CCP_AdSense_Verification_5Checks_2026-05-03.md` (storico W1 fix Day 7)
- `ROBY_Reply_CCP_AdSense_5Checks_SignOff_2026-05-02.md` (sign-off W1)
- `ROBY_AdSense_LandingPatch_StaticFeatured_2026-05-02.md` (patch landing W1)
- `ROBY_AdSense_Unblock_Diagnosis_Plan_v1_1_2026-05-02.md` (diagnosi originaria)

## Note operative

- **NO sed cascade** (audit è read-only, ma applico pattern per simmetria)
- Pattern `feedback_verify_before_edit.md` esteso a "verify before audit conclusions" — non assumere, leggere repo state attuale
- Se durante audit emerge che `vercel.json` o `robots.txt` o sitemap hanno bug post-fix Day 7 (drift), flagga in report ma NO commit (Skeezu directive: niente CCP-driven changes pre-Google ok)

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (editorial audit request airoobi.app AdSense rejection · pre-resubmit diagnosis · strategic decision dialog ROBY-Skeezu post-audit)*
