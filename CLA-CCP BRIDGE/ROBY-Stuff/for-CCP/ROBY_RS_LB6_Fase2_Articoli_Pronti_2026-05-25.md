---
title: ROBY · RS · LB-6 fase 2 — tutti e 5 gli articoli blog riscritti, pronti in for-CCP/
purpose: Consegna consolidata dei 5 articoli blog riscritti per LB-6 (B.11 check-in + i 4 rewrite-class della fase 2). Ognuno è un file .html in for-CCP/ (canale corretto: il git push copre for-CCP/, non 04_blog_articles/). CCP posiziona ognuno al path reale in 04_blog_articles/, bridge-sync mirror→Pi, deploy. Tutti ancorati al modello canonico (faucet +100 · sequenza giornaliera +50 · settimana completa +1 ROBI · referral +5/+5 ROBI · check-in/video/bonus 7gg-ARIA aboliti). Resta solo il mixed/micro (RS copy a seguire).
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: 5 articoli riscritti pronti in for-CCP/ · CCP posiziona + bridge-sync + deploy · mixed/micro a seguire
---

# ROBY — RS · LB-6 fase 2 · articoli pronti

## TL;DR

Tutti e **5 gli articoli blog** del debito earning sono riscritti da
zero e pronti come file `.html` in `for-CCP/`. CCP posiziona ognuno
al path reale in `04_blog_articles/`, bridge-sync, deploy. Restano
solo le superfici mixed/micro (RS di copy a seguire).

## 1. I 5 file da posizionare

| File in `for-CCP/` | → Posizionare in `04_blog_articles/` |
|---|---|
| `ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html` | `check-in-giornaliero-airoobi-perche-importante.html` |
| `ROBY_LB6_referral-program_REWRITTEN.html` | `referral-program-airoobi-guadagna-invitando-amici.html` |
| `ROBY_LB6_guadagnare-crypto-gratis_REWRITTEN.html` | `guadagnare-crypto-gratis-senza-investire.html` |
| `ROBY_LB6_come-guadagnare-punti-aria_REWRITTEN.html` | `come-guadagnare-punti-aria-airoobi.html` |
| `ROBY_LB6_streak-settimanale_REWRITTEN.html` | `streak-settimanale-airoobi-bonus-costanza.html` |

Per ognuno: posiziona al path, bridge-sync mirror→Pi, deploy. HTML
statico — niente `?v=`/footer-version, **stesso URL**, nessun
redirect. Template HTML di ogni file invariato rispetto all'originale
(topbar, breadcrumb, stili, CTA, footer) — è cambiato solo il
contenuto.

## 2. Cosa è stato corretto (comune ai 5)

Tutti ancorati al **modello canonico**:
- ARIA = faucet +100/giorno + sequenza giornaliera +50/giorno timbrato.
- Settimana completa (7/7) = +1 ROBI · referral = +5 ROBI a te + +5
  all'amico (ROBI, **non** ARIA) · oggetto accettato +1 ROBI.
- Eliminati ovunque: check-in standalone +1 ARIA, video +1 (max
  5/gg), bonus sequenza 7gg in ARIA, welcome +10 ARIA, login +1 ARIA.
- Eliminata la narrativa stale "airdrop finale al lancio mainnet" →
  sostituita col modello reale (Moltiplicatore di Fedeltà · ROBI
  portati nelle fasi successive · valore di riscatto che cresce col
  Fondo Comune).
- Eliminati i fattori di scoring inesistenti ("F1 50% / F2 / F3
  seniority 20%") → riancorati a Base+Boost / Moltiplicatore di
  Fedeltà come da `come-funziona-airdrop`.
- Rimossi i box "Aggiornato · scritto prima di evoluzioni" — gli
  articoli ora SONO aggiornati. `article-meta` → "Aggiornato · 25
  Maggio 2026".

Note per file:
- **referral-program**: cambio sostanziale — l'articolo prometteva
  referral +10/+15 ARIA; riscritto su +5/+5 ROBI, con la leva "il
  referral ti paga in ROBI, la moneta buona".
- **streak-settimanale**: riancorato — la "striscia settimanale" non
  dà più +1 ARIA/7gg, dà +1 ROBI a settimana completa. Tabella
  ricalcolata (4.500 ARIA + ~4 ROBI/mese). Tolto il vecchio prezzo
  blocco "50 ARIA" (stale): la copy non pinna più un prezzo blocco
  fisso.
- **guadagnare-crypto-gratis** + **come-guadagnare-punti-aria**:
  guide earning ristrutturate sul modello a 2 fonti ARIA + ROBI.

## 3. Nota a-ads (flag invariato)

I 5 file mantengono lo `<script>` a-ads come nell'originale (è
struttura, non earning-copy). Resta il flag già aperto: memoria dice
A-ADS rimosso 23 May → ~38 articoli blog lo hanno ancora → cleanup
P2 separato, CCP verifica quando vuole.

## 4. Resta — mixed/micro

LB-6 fase 2, ultimo blocco: `airoobi-explainer.html`,
`video-airdrop.html` (landing), `fair-airdrop:194`, `blog.html`
card-titles, `faq` "Come faccio a partecipare?" step 2, `abo.html`
tooltip, `diventa-alpha-brave.html`, `tokens.html:126`. Arriva come
RS di copy consolidato (sostituzioni paragrafali/riga). CCP non tocca
quelle finché l'RS non droppa.

## RS — paste-ready

```
RS · LB-6 FASE 2 — 5 ARTICOLI BLOG RISCRITTI PRONTI

I 5 articoli del debito earning sono riscritti, file .html in
for-CCP/. Posizionali:
- ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html
  → 04_blog_articles/check-in-giornaliero-airoobi-perche-importante.html
- ROBY_LB6_referral-program_REWRITTEN.html
  → 04_blog_articles/referral-program-airoobi-guadagna-invitando-amici.html
- ROBY_LB6_guadagnare-crypto-gratis_REWRITTEN.html
  → 04_blog_articles/guadagnare-crypto-gratis-senza-investire.html
- ROBY_LB6_come-guadagnare-punti-aria_REWRITTEN.html
  → 04_blog_articles/come-guadagnare-punti-aria-airoobi.html
- ROBY_LB6_streak-settimanale_REWRITTEN.html
  → 04_blog_articles/streak-settimanale-airoobi-bonus-costanza.html

Per ognuno: posiziona al path, bridge-sync mirror→Pi, deploy. HTML
statico, niente ?v=/footer, stesso URL, nessun redirect, template
invariato (solo contenuto cambiato). Tutti sul modello canonico
(faucet +100 · sequenza +50 · settimana completa +1 ROBI · referral
+5/+5 ROBI · aboliti check-in/video/bonus-7gg-ARIA/welcome-ARIA ·
niente "airdrop finale mainnet" · niente F1/F2/F3).

a-ads: i 5 file lo mantengono come da originale (flag blog-wide già
aperto, cleanup P2 separato).

RESTA: mixed/micro (airoobi-explainer · video-airdrop landing ·
fair-airdrop:194 · blog.html cards · faq step 2 · abo tooltip ·
diventa-alpha-brave · tokens.html:126) → RS copy a seguire. CCP non
tocca finché non droppa.

ROBY verifica le superfici a UI-click post-deploy.
```

## Bottom line

I 5 articoli blog del debito earning sono riscritti e pronti in
for-CCP/. Con questo la parte "rewrite-class" di LB-6 fase 2 è
completa lato ROBY. Resta solo il mixed/micro, più leggero, in
arrivo come RS di copy. CCP posiziona i 5 file, bridge-sync, deploy;
ROBY verifica a UI-click.

Audit-trail: questo file = RS ROBY LB-6 fase 2 · 5 articoli blog
riscritti da zero pronti come .html in for-CCP/ (B.11 check-in +
referral-program + guadagnare-crypto-gratis + come-guadagnare-punti-
aria + streak-settimanale) → CCP posiziona ognuno al path reale in
04_blog_articles/ + bridge-sync mirror→Pi + deploy · HTML statico no
?v=/footer stesso URL no redirect template invariato · tutti
ancorati al modello canonico (faucet +100 · sequenza giornaliera +50
· settimana completa +1 ROBI · referral +5/+5 ROBI · oggetto
accettato +1 ROBI · aboliti check-in standalone/video/bonus-7gg-ARIA/
welcome-ARIA/login-ARIA · narrativa "airdrop finale mainnet"
sostituita con Moltiplicatore di Fedeltà + ROBI fasi successive ·
scoring inesistente F1/F2/F3 riancorato a Base+Boost) · referral
cambio sostanziale +10/+15 ARIA → +5/+5 ROBI · streak-settimanale
riancorato a settimana completa = +1 ROBI tabella ricalcolata +
rimosso prezzo blocco stale 50 ARIA · a-ads mantenuto flag blog-wide
P2 separato · resta mixed/micro (airoobi-explainer · video-airdrop
landing · fair-airdrop:194 · blog.html cards · faq step 2 · abo
tooltip · diventa-alpha-brave · tokens.html:126) RS copy a seguire ·
ROBY verifica UI-click post-deploy.

---

*ROBY · Strategic MKT & Comms & Community · RS LB-6 fase 2 articoli pronti · 25 May 2026 · daje team a 4*
