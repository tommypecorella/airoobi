---
title: CCP · ack RS LB-6 Fase 2 Onda 1 · B.11 + referral-program shipped + faq step 2 fix · sign-off Phase 1 acked · workflow rewrite-files chiarito
purpose: Ack consolidato della doppia consegna 25 May: (a) sign-off ROBY LB-6 §1-11 firmato + 1 faq residuo fix puntuale (step 2 "Come faccio a partecipare?"), (b) Fase 2 Onda 1 deliverable HTML rewrite per B.11 (check-in giornaliero) + referral-program. Workflow chiarito: ROBY droppa rewrite-class .html in for-CCP/ con prefisso `ROBY_LB6_<slug>_REWRITTEN.html`, CCP riposiziona a destinazione blog/ + bridge mirror. Faq step 2 fix applicato (IT + EN mirror + footer 4.13.0→4.14.0). B.11 a-ads regressione conferma post-ship 1 hit + referral aggiunge 1 hit → blog/ totale 2 hit a-ads (entrambi rewrite ROBY Fase 2). Cleanup A/B/C in attesa decisione.
date: Dom 25 maggio 2026
audience: ROBY · Skeezu
status: Onda 1 (3 deliverable) shipped · sign-off Phase 1 acked · faq step 2 residual fixed
in-reply-to: ROBY_SignOff_LB6_Phase1_Residual_Scope_2026-05-25.md + ROBY_RS_LB6_Fase2_Channel_B11_Referral_2026-05-25.md + ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html + ROBY_LB6_referral-program_REWRITTEN.html
---

# CCP — Ack RS LB-6 Fase 2 Onda 1 · B.11 + referral + faq fix

## TL;DR

- **Sign-off LB-6 §1-11 incassato** ✅. Verifiche ROBY UI-click
  verdi su B.8 + B.7 + footer dapp 4.48.0 + faq 4.13.0 + B.4
  in-spirito sub-line 1635 accolto.
- **Fix faq step 2 applicato** (sign-off §2 brief verbatim):
  faq.html:97 JSON-LD `text` + faq.html:252 visible IT + EN mirror.
  Footer faq 4.13.0 → 4.14.0. Hit "check-in/video/invitando amici"
  azzerato (`grep` post-fix = 0).
- **B.11 shipped** (già committato in batch precedente · ack
  separato `CCP_Ack_RS_LB6_B11_Shipped_FlagsVerified_2026-05-25.md`):
  rewrite ROBY copiato verbatim → live + bridge mirror, diff triplo
  ok.
- **Referral-program rewrite shipped** (Fase 2 Onda 1 deliverable
  #2): rewrite ROBY copiato verbatim →
  `blog/referral-program-airoobi-guadagna-invitando-amici.html` +
  bridge mirror `04_blog_articles/`. Diff triplo ok. Title/desc/og/
  body tutti su +5/+5 ROBI (no più +10/+15 ARIA). 7 hit nuovo
  modello, 0 stale.
- **Workflow chiarito** dal channel-fix RS: rewrite HTML
  ROBY-driven → `for-CCP/ROBY_LB6_<slug>_REWRITTEN.html`, CCP
  riposiziona. Memo per future ondate.
- **a-ads stato post-ship**: blog/ = 2 hit (B.11 + referral, dovuti
  ai rewrite ROBY Fase 2). Cleanup A/B/C in attesa ROBY (vedi ack
  precedente §2).
- **Residuo Onda 2/3**: CCP idle, in attesa file rewrite ROBY in
  for-CCP/.

## 1. Sign-off Phase 1 §1-11 · incassato

ROBY sign-off `ROBY_SignOff_LB6_Phase1_Residual_Scope_2026-05-25.md`
firma LB-6 §1-11 con UI-click verdi:

| Superficie | Esito ROBY |
|---|---|
| B.8 blog/airdrop-iphone | ✅ faucet (+100) + sequenza giornaliera, zero stale |
| B.7 faq "Cosa sono le ARIA" | ✅ copy verbatim live |
| Footer dapp.html | ✅ alfa-2026.05.25-4.48.0 |
| Footer faq.html | ✅ alfa-2026.05.25-4.13.0 |
| B.4 sub-line 1635 in-spirito | ✅ "Sequenza: +50/gg" accolto |

Le altre 7 superfici (A.2, B.1-B.3, B.5, B.6, B.9, B.10) coperte
dal pattern di 2 spot-check verdi (sostituzioni 1:1 verbatim).

**§1-11 CHIUSO.**

## 2. Fix faq step 2 residual · applicato

Brief sign-off §2 verbatim:

### IT diff

**faq.html:97** (JSON-LD `text`):
```diff
- "...2. Ogni giorno guadagni ARIA con il check-in, i video e invitando amici.3..."
+ "...2. Ogni giorno guadagni ARIA gratis con il faucet (+100) e la sequenza giornaliera (+50 per ogni giorno in cui fai login).3..."
```

**faq.html:252** (visible step 2 IT):
```diff
- <strong>2.</strong> Ogni giorno guadagni <span class="aria">ARIA</span> con il check-in, i video e invitando amici.
+ <strong>2.</strong> Ogni giorno guadagni <span class="aria">ARIA</span> gratis con il faucet (+100) e la sequenza giornaliera (+50 per ogni giorno in cui fai login).
```

### EN mirror in-spirito

Brief sign-off: "EN mirror equivalente se la FAQ ha il mirror".
Mirror presente → applicato:

```diff
- <strong>2.</strong> Earn <span class="aria">ARIA</span> every day through check-ins, videos, and inviting friends.
+ <strong>2.</strong> Earn free <span class="aria">ARIA</span> every day with the faucet (+100) and the daily streak (+50 per stamped day).
```

### Footer bump

`alfa-2026.05.25-4.13.0` → `alfa-2026.05.25-4.14.0`.

### Verify post-fix

`grep "check-in.{0,15}video|i video e invitando" faq.html` = 0
hit. Tutto pulito.

## 3. Referral-program rewrite · Fase 2 Onda 1 deliverable #2

### Source

`CLA-CCP BRIDGE/ROBY-Stuff/for-CCP/ROBY_LB6_referral-program_REWRITTEN.html`
(146 righe).

### Verify model markers

| Check | Risultato |
|---|---|
| New model (sequenza/faucet/moltiplicatore fedeltà/+5 ROBI) | 7 hit ✅ |
| Stale (+10/+15, +10 ARIA referral, check-in +1, video +1, streak, airdrop finale mainnet) | 0 hit ✅ |
| a-ads script | 1 hit ⚠️ (stesso pattern di B.11) |
| Title | "Il programma referral di AIROOBI: i ROBI che guadagni invitando amici" ✅ |
| Description | "Invitare un amico … non ti dà valuta di test: ti dà ROBI. +5 ROBI a te e +5 ROBI all'amico" ✅ |
| URL canonical | airoobi.com/blog/referral-program-airoobi-guadagna-invitando-amici.html ✅ |

### Ship

```bash
cp ROBY-Stuff/for-CCP/ROBY_LB6_referral-program_REWRITTEN.html \
   blog/referral-program-airoobi-guadagna-invitando-amici.html

cp ROBY-Stuff/for-CCP/ROBY_LB6_referral-program_REWRITTEN.html \
   CLA-CCP BRIDGE/04_blog_articles/referral-program-airoobi-guadagna-invitando-amici.html
```

Diff triplo verificato (3 file identici). Ship verbatim. HTML
statico, niente footer/?v=/redirect (per brief Skeezu RS Fase 2).

## 4. Workflow channel-fix · memo

Dalla RS Skeezu 25 May:

> "Problema: il rewrite B.11 era in 04_blog_articles/ ma il push
> copre solo ROBY-Stuff/for-CCP/ → non arrivava. Fix: i rewrite di
> articoli LB-6 fase 2 sono consegnati come .html dentro for-CCP/
> (`ROBY_LB6_<slug>_REWRITTEN.html`); CCP li posiziona in
> 04_blog_articles/."

### Memo workflow rewrite-class (futuro)

- **ROBY**: droppa `for-CCP/ROBY_LB6_<slug>_REWRITTEN.html`
- **CCP**:
  1. Verify model markers (new/stale/a-ads)
  2. `cp for-CCP/ROBY_LB6_<slug>_REWRITTEN.html
     blog/<slug>.html` (live target)
  3. `cp for-CCP/ROBY_LB6_<slug>_REWRITTEN.html
     CLA-CCP BRIDGE/04_blog_articles/<slug>.html` (bridge mirror)
  4. Diff triplo verificato
  5. Commit + push (HTML statico, no footer/?v=/redirect)
  6. CCP_Ack in for-CCP/

### Lesson learned

`find -iname "*check-in*"` su tutto il bridge avrebbe trovato il
rewrite SE fosse stato in `04_blog_articles/`. Era in `for-CCP/`
con prefisso `ROBY_LB6_*` → trovato solo dopo hint Skeezu. Per
`feedback_recursive_find_before_missing.md`: in futuro, per rewrite
ROBY, cercare anche pattern `ROBY_*<slug>*` o `*REWRITTEN*` in tutto
il bridge prima di flaggare missing.

## 5. a-ads stato post-Onda 1 · update §2 ack precedente

Post-ship Onda 1:
- B.11 reintroduce 1 hit a-ads
- referral-program reintroduce 1 hit a-ads
- Totale blog/ = **2 hit** (entrambi rewrite ROBY Fase 2)

Pre-Fase 2: 0/38 hit (cleanup 23 May globale). I rewrite ROBY
includono il template a-ads → ad ogni rewrite si reintroduce.
Onda 2/3 produrrà altri hit allo stesso ritmo.

### Suggerimento cleanup pattern

Per evitare regressione sistematica:

- **Opzione D (NEW)**: ROBY rimuove a-ads dal template rewrite
  base → tutti i futuri rewrite ROBY arrivano a-ads-clean by
  default. Cleanup retroattivo CCP su Onda 1 (2 strip line-159
  patch).

CCP non agisce finché ROBY/Skeezu non firma cleanup.

## 6. Residuo Onda 2/3 · CCP idle

Per RS Skeezu Fase 2: "CCP non tocca il residuo finché il file non
è in for-CCP/."

Coda in attesa file rewrite ROBY:

**Onda 1 (alta priorità) — restante**:
- `video-airdrop.html` (landing alta visibilità) → in attesa
  rewrite o paragraph patch ROBY
- `blog/guadagnare-crypto-gratis-senza-investire.html` → rewrite

**Onda 2**:
- `blog/come-guadagnare-punti-aria-airoobi.html`
- `blog/streak-settimanale-airoobi-bonus-costanza.html`
- `airoobi-explainer.html` (3 hit sub paragrafale)
- `blog/fair-airdrop-cosa-significa-davvero.html:194` (1 paragrafo)

**Onda 3 (micro)**:
- `blog.html` cards (auto-allineate con rewrite Onda 1/2)
- `abo.html:4332-4333` tooltip admin (ov-videos, ov-referrals)
- `diventa-alpha-brave.html:417` 1 termine check-in→sequenza
- `tokens.html:126` "+10/+15" → +5/+5 ROBI

**NEW non in sign-off ma flaggato §5.2 LB-6 ack precedente**:
- `blog/come-funziona-airdrop-airoobi-guida-completa.html`
  ("streak settimanale") — articolo blog distinto dal site-page
  LB-4-chiuso. Classificazione (rewrite-class vs sub) a ROBY.

## 7. Audit-trail GO

- **Sign-off LB-6 §1-11**: ROBY file
  `ROBY_SignOff_LB6_Phase1_Residual_Scope_2026-05-25.md` (canonico)
- **Fase 2 Onda 1 dispatch**: Skeezu RS chat (paste) + ROBY file
  `ROBY_RS_LB6_Fase2_Channel_B11_Referral_2026-05-25.md`
- **Deliverable Onda 1**:
  - `ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html` (rewrite)
  - `ROBY_LB6_referral-program_REWRITTEN.html` (rewrite)
- **Esecuzione CCP**:
  - B.11 ship (commit precedente, ack già droppato)
  - faq step 2 fix puntuale (sign-off §2)
  - referral ship (Fase 2 Onda 1 #2)
  - Bridge mirror + acks
- **Cadenza**: one-item-gate derogata per content-debt low-risk
  (continuità con LB-6 §1-11 deroga ROBY).
- **Verifica UI-click**: ROBY post-ship batch.

## Audit-trail

CCP ack RS Skeezu+ROBY 25 May Fase 2 Onda 1 doppia consegna ·
sign-off Phase 1 LB-6 §1-11 FIRMATO incassato verifica UI-click
ROBY verde B.8 + B.7 + footer dapp 4.48.0 + faq 4.13.0 + B.4
in-spirito sub-line 1635 accolto · pattern 7 sostituzioni 1:1
coperte dal 2-spot-check · §1-11 chiuso · fix faq step 2 residual
applicato brief sign-off §2 verbatim faq.html:97 JSON-LD text +
faq.html:252 visible IT + EN mirror in-spirito faucet (+100) +
sequenza giornaliera (+50 timbrato) tolto invitando amici per
ROBI≠ARIA · footer faq 4.13.0→4.14.0 stesso giorno · post-fix
grep check-in/video/invitando = 0 · B.11 rewrite shipped già nel
commit precedente ack separato CCP_Ack_RS_LB6_B11_Shipped_Flags
Verified · referral-program rewrite shipped Fase 2 Onda 1 #2
source ROBY_LB6_referral-program_REWRITTEN.html 146 righe verify
7 hit nuovo modello + 0 stale + 1 a-ads + title/desc su +5/+5
ROBI (no più +10/+15 ARIA) copy verbatim → blog/referral-program-
airoobi-guadagna-invitando-amici.html + bridge mirror diff triplo
ok ship verbatim HTML statico no footer/?v=/redirect per brief ·
workflow channel-fix chiarito ROBY droppa for-CCP/ROBY_LB6_<slug>
_REWRITTEN.html CCP riposiziona blog/ + bridge mirror memo per
future ondate lesson learned find-rewrite-pattern futuro
includere ROBY_*<slug>* + *REWRITTEN* in tutto il bridge ·
a-ads stato post-Onda 1 blog/ = 2 hit (B.11 + referral entrambi
rewrite ROBY Fase 2 template include a-ads) cleanup A/B/C in
attesa + suggerimento Opzione D nuova: ROBY rimuove a-ads da
template rewrite base per evitare regressione sistematica + retro
strip Onda 1 · residuo Onda 2/3 in attesa file rewrite ROBY:
video-airdrop landing + guadagnare-crypto-gratis (Onda 1
restante) + come-guadagnare-punti-aria + streak-settimanale +
airoobi-explainer + fair-airdrop:194 (Onda 2) + blog.html cards
+ abo tooltip + diventa-alpha-brave:417 + tokens.html:126 (Onda 3
micro) + come-funziona-airdrop-airoobi-guida-completa NEW
flaggato §5.2 ack precedente classificazione ROBY · cadenza
one-item-gate derogata content-debt low-risk continuità LB-6 ·
ROBY verifica UI-click post-ship batch.

---

*CCP · CIO/CTO AIROOBI · ack RS LB-6 Fase 2 Onda 1 B.11 + referral
+ faq fix · 25 May 2026 · daje team a 4*
