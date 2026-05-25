---
title: ROBY · RS · LB-6 fase 2 — fix canale di consegna articoli + B.11 e referral-program pronti in for-CCP/
purpose: Risponde alla domanda CCP "il file B.11 rewrite non è arrivato in 04_blog_articles/". Causa: ROBY aveva scritto la riscrittura direttamente in 04_blog_articles/, ma il git push standard copre solo ROBY-Stuff/for-CCP/ → la modifica non raggiunge CCP. Fix di canale: tutti i rewrite di articoli LB-6 fase 2 vengono consegnati come file .html dentro for-CCP/, CCP li posiziona in 04_blog_articles/. B.11 (check-in) e referral-program sono pronti adesso in for-CCP/.
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: canale fixato · B.11 + referral-program pronti in for-CCP/ · 3 articoli + mixed/micro a seguire
in-reply-to: CCP — "il file B.11 rewrite non è arrivato in 04_blog_articles/"
---

# ROBY — RS · LB-6 fase 2 · fix canale + B.11 + referral

## TL;DR

CCP non vedeva il rewrite di B.11 perché ROBY l'aveva scritto
**direttamente** in `04_blog_articles/` — ma il git push standard
copre solo `ROBY-Stuff/for-CCP/`, quindi quella modifica non
raggiunge CCP. **Fix di canale**: tutti i rewrite di articoli LB-6
fase 2 vengono consegnati come file `.html` **dentro `for-CCP/`**;
CCP li posiziona in `04_blog_articles/`. **B.11 e referral-program
sono pronti adesso** in `for-CCP/`.

## 1. Il problema di canale

ROBY aveva scritto la riscrittura di B.11 in
`04_blog_articles/check-in-giornaliero-airoobi-perche-importante.html`
(in base all'eccezione "blog = lane nativa repo"). Ma il workflow di
push ROBY→CCP è `git add ROBY-Stuff/for-CCP/` — **non** include
`04_blog_articles/`. Risultato: CCP vede solo il vecchio file (Apr
21). L'eccezione "blog nativo" non regge se il push è for-CCP-only.

**Fix**: per LB-6 fase 2, ogni articolo riscritto è un file `.html`
in `for-CCP/`, nominato `ROBY_LB6_<slug>_REWRITTEN.html`. CCP lo
prende da lì e lo posiziona al path reale in `04_blog_articles/`,
bridge-sync, deploy. Così rientra tutto nel canale che raggiunge CCP.

## 2. Pronti adesso in for-CCP/

### B.11 · check-in giornaliero
- **File ROBY**: `for-CCP/ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html`
- **Posizionare in**: `04_blog_articles/check-in-giornaliero-airoobi-perche-importante.html`
- Riscrittura completa: ancorato alla sequenza giornaliera, calcoli
  rifatti, tesi riancorata al Moltiplicatore di Fedeltà (non più "F3
  seniority 20%" inesistente). Stesso URL, template invariato.

### referral-program
- **File ROBY**: `for-CCP/ROBY_LB6_referral-program_REWRITTEN.html`
- **Posizionare in**: `04_blog_articles/referral-program-airoobi-guadagna-invitando-amici.html`
- **Cambio sostanziale**: l'articolo prometteva referral **+10/+15
  ARIA**. Sbagliato — il referral dà **+5 ROBI a te + +5 ROBI
  all'amico** (non ARIA). Title, description, og, H1 e tutto il body
  riscritti su questo: il referral paga in ROBI, il reward con
  valore reale. Rimosso il box "scritto prima di evoluzioni" e i
  riferimenti a "seniority nell'algoritmo" / "airdrop finale
  mainnet". Stesso URL, template invariato.

Entrambi: HTML statico, niente footer-version / `?v=`, nessun
redirect. Bridge-sync mirror → Pi + deploy.

## 3. In arrivo (stessa modalità for-CCP/)

LB-6 fase 2, ancora da ROBY, file `.html` in `for-CCP/`:
- `guadagnare-crypto-gratis-senza-investire` (rewrite)
- `come-guadagnare-punti-aria-airoobi` (rewrite)
- `streak-settimanale-airoobi-bonus-costanza` (rewrite)
- mixed + micro (`airoobi-explainer`, `video-airdrop`,
  `fair-airdrop:194`, `blog.html` cards, `faq` step 2, `abo` tooltip,
  `diventa-alpha-brave`, `tokens.html:126`) → RS di copy consolidato.

CCP non tocca nulla del residuo finché il file/RS dell'item non è in
for-CCP/.

## RS — paste-ready

```
RS · LB-6 FASE 2 — FIX CANALE + B.11 + REFERRAL PRONTI

Problema: il rewrite B.11 era in 04_blog_articles/ ma il push copre
solo ROBY-Stuff/for-CCP/ → non arrivava a CCP. Fix: i rewrite di
articoli LB-6 fase 2 sono consegnati come .html dentro for-CCP/
(ROBY_LB6_<slug>_REWRITTEN.html); CCP li posiziona in 04_blog_articles/.

PRONTI ORA in for-CCP/:
1. ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html
   → 04_blog_articles/check-in-giornaliero-airoobi-perche-importante.html
2. ROBY_LB6_referral-program_REWRITTEN.html
   → 04_blog_articles/referral-program-airoobi-guadagna-invitando-amici.html
   (cambio sostanziale: referral NON dà +10/+15 ARIA, dà +5/+5 ROBI —
   title/desc/og/body tutti riscritti su questo).

Per ognuno: posiziona al path reale, bridge-sync mirror→Pi, deploy.
HTML statico, niente ?v=/footer, stesso URL, nessun redirect.

IN ARRIVO via for-CCP/: rewrite guadagnare-crypto-gratis +
come-guadagnare-punti-aria + streak-settimanale, poi RS copy mixed/
micro. CCP non tocca il residuo finché il file/RS non droppa.
```

## Bottom line

Canale sistemato: gli articoli LB-6 fase 2 passano da `for-CCP/`, non
da `04_blog_articles/` diretto. B.11 e referral-program sono pronti
lì adesso. Gli altri 3 articoli + mixed/micro arrivano a seguire,
stessa modalità.

Audit-trail: questo file = RS ROBY fix canale LB-6 fase 2 · causa:
rewrite B.11 scritto in 04_blog_articles/ ma git push ROBY→CCP copre
solo ROBY-Stuff/for-CCP/ → CCP non riceveva (vedeva mirror Apr 21) ·
fix: rewrite articoli consegnati come .html in for-CCP/
(ROBY_LB6_<slug>_REWRITTEN.html), CCP posiziona in 04_blog_articles/
+ bridge-sync + deploy · pronti ora: B.11 check-in-giornaliero +
referral-program (quest'ultimo cambio sostanziale referral +10/+15
ARIA → +5/+5 ROBI, title/desc/og/body riscritti) · HTML statico no
?v=/footer stesso URL no redirect · in arrivo via for-CCP/:
guadagnare-crypto-gratis + come-guadagnare-punti-aria + streak-
settimanale rewrite + RS mixed/micro · CCP non tocca residuo finché
file/RS non in for-CCP/.

---

*ROBY · Strategic MKT & Comms & Community · RS LB-6 fase 2 fix canale + B.11 + referral · 25 May 2026 · daje team a 4*
