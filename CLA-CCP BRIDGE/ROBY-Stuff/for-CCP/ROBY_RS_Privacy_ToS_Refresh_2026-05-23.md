---
title: ROBY · RS · Privacy + Termini refresh — applicazione copy v2
purpose: privacy.html e termini.html live sono ferme all'era waitlist. Bozza v2 allineata al prodotto pronta. CCP: (1) cookie audit subito, (2) applicazione gated su copy finale (placeholder + revisione legale).
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: RS BRIEF · cookie audit richiesto subito · applicazione HTML gated su copy finale
related: ROBY_Privacy_ToS_Refresh_Draft_2026-05-23.md (in for-CCP/) · 03_site_pages/privacy.html · termini.html
---

# Privacy + Termini refresh — RS per CCP

## TL;DR

`privacy.html` e `termini.html` (live, footer airoobi.com) hanno copy **ferma
all'era waitlist** — "Ultimo aggiornamento: Marzo 2026", parlano di iscrizione
alla waitlist, la privacy dichiara "non raccogliamo altri dati in questa fase"
(falso: oggi c'è account, airdrop, foto oggetti, consegna escrow, chat, ROBI).

Bozza v2 allineata al prodotto Alpha 0 pronta: `ROBY_Privacy_ToS_Refresh_Draft_
2026-05-23.md` (in `for-CCP/`). Due cose da te:

1. **Subito** — cookie audit: dimmi cosa carica davvero il sito/dApp, serve a
   finalizzare la sezione Cookie (§2 sotto).
2. **Dopo** — applicazione HTML: **gated**. Non si tocca il live finché Skeezu
   non riempie i placeholder `[DA COMPLETARE]` e la revisione legale non è
   chiusa. È copy legale: non spedibile a metà.

## 1. Cosa cambia

La bozza v2 è già scritta come copy review-ready, sezione per sezione:

- **Parte 1 → `privacy.html`**: titolare, categorie dati reali (account,
  portafoglio, foto oggetti, consegna, chat, KYC futuro), basi giuridiche,
  retention, responsabili esterni (Supabase, Vercel, Cloudflare, Postmark),
  diritti, minori 18+, fase Alpha 0.
- **Parte 2 → `termini.html`**: cos'è AIROOBI, account/idoneità, ARIA/ROBI/
  blocchi, come funziona un airdrop, vendere (fee upfront non rimborsabile),
  consegna escrow 3 fasi, annullamento/rimborsi, **counter/ban annullamenti**
  (3/anno → ban vendita 1 mese, 1000 ARIA per uscirne), condotta, IP, foro.
- **Parte 3 → sezione Cookie** dentro `privacy.html` (o pagina `cookie.html`
  separata — vedi nota nel draft, decisione Skeezu).

Applicazione tecnica: mantieni CSS, topbar, footer e struttura `.legal-content`
esistenti — si sostituisce solo il contenuto del body e si porta "Ultimo
aggiornamento" a **23 maggio 2026**. Niente rewrite di pagina.

## 2. Cookie audit — STOP+ASK (rispondi subito, è indipendente)

La sezione Cookie ha un placeholder che solo tu puoi chiudere. Mi serve, per
sito (airoobi.com) e dApp (airoobi.app):

- Cookie / `localStorage` / `sessionStorage` usati per l'autenticazione
  (sessione Supabase): quali, e sono **strettamente necessari**?
- Cloudflare Web Analytics: gira **senza cookie** e con **IP anonimizzato**?
  La privacy attuale afferma "non è richiesto alcun banner" — è ancora vero?
- Ci sono **script di terze parti** che impostano cookie (analytics non-CF,
  pixel, embed)? Il service worker `sw.js` traccia qualcosa?

Se è tutto solo "strettamente necessario" + analytics cookieless → nessun banner
di consenso, e la Parte 3 è ok così. Se c'è anche solo un cookie non essenziale
→ serve un banner di consenso conforme: dimmelo e aggiorno la copy.

Bonus: conferma che `delete_account` (soft delete) e l'export dati JSON
funzionano come li descrive LEG-001 §6.2 — la privacy promette cancellazione ed
esportazione su richiesta.

## 3. Applicazione — gated

L'HTML **non va in produzione** finché:

- Skeezu (con il legale) riempie i `[DA COMPLETARE]`: ragione sociale del
  titolare, sede, legge applicabile, foro, periodi di conservazione;
- la revisione legale è chiusa (LEG-001 §4: obbligatoria pre-Stage 1).

Quando la copy è finale, applichi a `privacy.html` + `termini.html`, footer
bump, smoke, push. ~30-45 min di lavoro, zero rischio (solo contenuto statico).

## RS — paste-ready

```
RS · PRIVACY + TERMINI REFRESH

Contesto: privacy.html e termini.html live hanno copy ferma alla
waitlist. Bozza v2 allineata al prodotto in for-CCP/
ROBY_Privacy_ToS_Refresh_Draft_2026-05-23.md.

ADESSO — cookie audit (indipendente, rispondimi):
- Cookie/localStorage/sessionStorage per auth (sessione Supabase):
  quali e sono strettamente necessari?
- Cloudflare Web Analytics gira senza cookie + IP anonimizzato?
- Script di terze parti che settano cookie? sw.js traccia?
- Conferma che delete_account (soft delete) + export dati JSON
  funzionano come da LEG-001 §6.2.
Serve per finalizzare la sezione Cookie.

DOPO — applicazione HTML (GATED, non spedire prima):
- Gate: Skeezu riempie i [DA COMPLETARE] (titolare, sede, legge,
  foro, retention) + revisione legale chiusa.
- Poi: sostituisci il body .legal-content di privacy.html e
  termini.html con la copy v2, mantieni CSS/topbar/footer, porta
  "Ultimo aggiornamento" a 23 maggio 2026. Footer bump, smoke, push.
- Parte 3 (Cookie): sezione dentro privacy.html, salvo Skeezu chieda
  una pagina cookie.html separata.

È copy legale: non va in prod a metà.
```

## Note

- Non è parere legale: la bozza è copy allineata al prodotto, la sufficienza
  legale la valida un avvocato (LEG-001 §4).
- Le pagine legali vivono nel repo (`03_site_pages/`): la copy v2 è in
  `for-CCP/` solo per il relay.
- Indipendenza: il cookie audit (§2) puoi farlo e rispondermi subito; non è
  bloccato da nulla. L'applicazione HTML (§3) è l'unica parte gated.

---

*ROBY · Strategic MKT & Comms & Community · RS Privacy + Termini refresh · 23 May 2026 · daje team a 4*
