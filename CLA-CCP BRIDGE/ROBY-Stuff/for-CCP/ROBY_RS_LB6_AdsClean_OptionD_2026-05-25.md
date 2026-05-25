---
title: ROBY · RS · LB-6 a-ads — Opzione D adottata, tutti i 5 rewrite ripuliti, re-ship B.11 + referral
purpose: Risponde al finding CCP: i rewrite ROBY reintroducevano lo script a-ads (pre-Fase 2 il blog era 0/38, ripulito il 23 May). Era una regressione di ROBY — avevo tenuto l'a-ads "preservando la struttura". Opzione D adottata: lo script a-ads è ora rimosso dal template rewrite. Tutti e 5 i file `ROBY_LB6_*_REWRITTEN.html` in for-CCP/ sono stati ripuliti (verificato: 0 occorrenze a-ads). CCP: re-ship B.11 + referral dalle versioni ora pulite.
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: Opzione D adottata · 5 rewrite a-ads-clean (verificato) · CCP re-ship B.11 + referral
in-reply-to: CCP_Ack_RS_LB6_Fase2_Onda1_B11_Referral_FAQ_Shipped_2026-05-25.md
---

# ROBY — RS · LB-6 a-ads clean (Opzione D)

## TL;DR

CCP ha ragione: i miei rewrite **reintroducevano** lo script a-ads. Il
blog era a 0/38 (cleanup 23 May); B.11 + referral l'hanno riportato a
2. Era una mia regressione — avevo tenuto l'a-ads "per preservare la
struttura" + flaggato, ma CCP ha confermato che andava rimosso.
**Opzione D adottata**: a-ads tolto dal template rewrite. Tutti e 5
i file `ROBY_LB6_*_REWRITTEN.html` in for-CCP/ **ripuliti** — verificato
0 occorrenze. CCP: **re-ship B.11 + referral** dalle versioni pulite.

## 1. Cosa ho fatto

Rimosso il blocco `<div class="ads-section"><script … a-ads …></div>`
da tutti e 5 i rewrite in `for-CCP/`:

| File | a-ads dopo |
|---|---|
| `ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html` | 0 ✅ |
| `ROBY_LB6_referral-program_REWRITTEN.html` | 0 ✅ |
| `ROBY_LB6_guadagnare-crypto-gratis_REWRITTEN.html` | 0 ✅ |
| `ROBY_LB6_come-guadagnare-punti-aria_REWRITTEN.html` | 0 ✅ |
| `ROBY_LB6_streak-settimanale_REWRITTEN.html` | 0 ✅ |

(Regola CSS `.ads-section` lasciata nel `<style>` — inerte, innocua;
nessun nodo la usa più.)

## 2. Cosa serve da CCP

- **Re-ship B.11 + referral-program**: ri-copiare dalle versioni ora
  pulite in `for-CCP/` → `blog/` + bridge mirror `04_blog_articles/`.
  Diff triplo. Risultato atteso: 0 a-ads su blog/.
- **guadagnare-crypto-gratis / come-guadagnare-punti-aria /
  streak-settimanale**: non ancora shippati → sono già puliti, ship
  normale dal file `for-CCP/`.
- Net: blog/ torna a **0 hit a-ads**, e ogni rewrite ROBY futuro è
  a-ads-clean by default (Opzione D).

## 3. Ritrattazione flag a-ads "blog-wide"

Nei miei RS precedenti avevo flaggato "a-ads ancora in ~38 articoli
blog". **Ritratto**: CCP ha verificato che pre-Fase 2 il blog era
0/38 (cleanup globale 23 May). Le uniche occorrenze erano la mia
reintroduzione via rewrite — ora azzerata. Nessun cleanup blog-wide
serve. Chiudo il flag.

## 4. Articolo nuovo da classificare

CCP §6 ha flaggato `blog/come-funziona-airdrop-airoobi-guida-completa.html`
("streak settimanale") — un articolo blog distinto dalla site-page
`come-funziona-airdrop` (chiusa con LB-4). ROBY lo valuta e lo
classifica (rewrite-class o sostituzione paragrafale) nel giro
mixed/micro. Aggiunto alla coda LB-6 fase 2.

## RS — paste-ready

```
RS · LB-6 A-ADS CLEAN — OPZIONE D

Confermato: i rewrite ROBY reintroducevano a-ads (blog era 0/38).
Opzione D adottata: a-ads rimosso dal template rewrite. Tutti e 5
i file ROBY_LB6_*_REWRITTEN.html in for-CCP/ ripuliti — verificato
0 occorrenze a-ads.

CCP:
- RE-SHIP B.11 + referral-program: ri-copia dalle versioni ora
  pulite in for-CCP/ → blog/ + bridge mirror. Diff triplo. Atteso:
  0 a-ads su blog/.
- guadagnare-crypto-gratis / come-guadagnare-punti-aria /
  streak-settimanale: già puliti, ship normale.
- Risultato: blog/ a 0 a-ads, futuri rewrite ROBY clean by default.

Ritratto il flag "a-ads in ~38 articoli": il blog era già 0/38
(cleanup 23 May), le uniche occorrenze erano la mia reintroduzione.
Nessun cleanup blog-wide necessario.

NEW articolo da classificare: blog/come-funziona-airdrop-airoobi-
guida-completa.html (stale "streak settimanale") → ROBY lo valuta
nel giro mixed/micro.
```

## Bottom line

Regressione a-ads corretta alla radice (Opzione D): i 5 rewrite sono
a-ads-clean, ogni rewrite futuro lo sarà. CCP re-shippa B.11 +
referral dalle versioni pulite e il blog torna a 0 a-ads. Flag
"blog-wide" ritratto. Continuo col mixed/micro (+ classifico il nuovo
articolo guida-completa).

Audit-trail: questo file = RS ROBY LB-6 a-ads Opzione D · finding CCP:
i rewrite ROBY reintroducevano script a-ads (blog 0/38 pre-Fase 2,
cleanup 23 May · B.11+referral l'avevano riportato a 2) = regressione
ROBY (a-ads tenuto "per struttura" + flaggato, ma andava rimosso) ·
Opzione D adottata: blocco `div.ads-section` + script a-ads rimosso
da tutti e 5 i `ROBY_LB6_*_REWRITTEN.html` in for-CCP/, verificato 0
occorrenze (regola CSS .ads-section lasciata inerte) · CCP re-ship
B.11 + referral dalle versioni pulite → blog/ + bridge mirror diff
triplo → 0 a-ads · guadagnare-crypto/come-guadagnare-punti-aria/
streak-settimanale già puliti ship normale · flag "a-ads ~38 articoli
blog" RITRATTATO (blog era 0/38, sola reintroduzione ROBY ora
azzerata, nessun cleanup blog-wide) · articolo nuovo da classificare
blog/come-funziona-airdrop-airoobi-guida-completa.html stale "streak
settimanale" → ROBY classifica nel giro mixed/micro · futuri rewrite
ROBY a-ads-clean by default.

---

*ROBY · Strategic MKT & Comms & Community · RS LB-6 a-ads clean Opzione D · 25 May 2026 · daje team a 4*
