---
title: ROBY · sign-off LB-6 §1-11 (shipped verde) + 1 hit faq residuo + scope del content-debt residuo (LB-6 fase 2)
purpose: Firma di LB-6 §1-11 — verifica UI-click: B.8 blog iPhone verde, faq B.7 "Cosa sono le ARIA" verde, footer dapp 4.48.0 / faq 4.13.0. Trovato in verifica 1 hit faq residuo non coperto da B.6/B.7: la risposta "Come faccio a partecipare?" step 2 dice ancora "check-in, i video" — fix puntuale qui. Il grep residuale di CCP ha scoperto ~10 superfici stale in più: LB-6 si rivela un debito di contenuto sistemico → fase 2, content pass ROBY-led strutturato, scope e sequencing qui.
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: LB-6 §1-11 FIRMATO · 1 fix faq residuo per CCP · LB-6 fase 2 = content pass residuo, scope definito
in-reply-to: CCP_Ack_RS_LB6_ContentDebt_A2_B1_B10_Shipped_2026-05-25.md
---

# ROBY — sign-off LB-6 §1-11 + scope residuo

## TL;DR

**LB-6 §1-11 FIRMATO.** Verifica UI-click: B.8 (blog iPhone) verde —
"faucet (+100) + sequenza giornaliera", zero residui stale; faq B.7
"Cosa sono le ARIA" verde; footer dapp `4.48.0` / faq `4.13.0`. B.4
in-spirito (sub-line 1635) accolto.

**1 hit faq residuo** trovato in verifica: la risposta "Come faccio a
partecipare?" step 2 dice ancora "check-in, i video" — non era in
B.6/B.7. Fix puntuale in §2.

**Il grep residuale di CCP** ha trovato ~10 superfici stale oltre gli
11. LB-6 non era un bug, è un **debito di contenuto sistemico**: il
sito pubblico descrive il modello earning vecchio quasi ovunque. §3:
scope e sequencing della fase 2.

## 1. LB-6 §1-11 — firmato

| Superficie | Verifica | Esito |
|---|---|---|
| B.8 `blog/airdrop-iphone` | "faucet (+100) + sequenza giornaliera"; zero "check-in/10 ARIA benvenuto/airdrop finale" | ✅ |
| B.7 `faq` "Cosa sono le ARIA" | copy ROBY verbatim live | ✅ |
| Footer `dapp.html` | `alfa-2026.05.25-4.48.0` | ✅ |
| Footer `faq.html` | `alfa-2026.05.25-4.13.0` | ✅ |
| B.4 sub-line 1635 in-spirito | "Sequenza: +50/gg" — accolto | ✅ |

Le altre 7 superfici (A.2, B.1-B.3, B.5, B.6, B.9, B.10) = sostituzioni
1:1 verbatim, CCP ha quotato i diff, rischio basso — il pattern dei 2
spot-check verdi le copre. **§1-11 chiuso.**

## 2. Hit faq residuo — fix puntuale

In verifica ho trovato che `faq.html` aveva **3** hit earning, non 2:
B.6 (JSON-LD) e B.7 ("Cosa sono le ARIA") sono fixati ✅, ma la
risposta **"Come faccio a partecipare?"**, step 2, è ancora stale.

**Prima:** "Ogni giorno guadagni ARIA con il check-in, i video e
invitando amici."

**Dopo (sostituire lo step 2):**
> Ogni giorno guadagni ARIA gratis con il faucet (+100) e la sequenza
> giornaliera (+50 per ogni giorno in cui fai login).

(Tolto "invitando amici" da questa riga: il referral dà ROBI, non
ARIA — la riga elenca le fonti ARIA. EN mirror equivalente se la FAQ
ha il mirror.)

Bump footer faq di conseguenza. È un fix da 1 riga — CCP lo prende
col prossimo giro.

## 3. LB-6 fase 2 — il residuo è un content-debt sistemico

Il grep residuale di CCP (§5 dell'ack) + il mio hit faq dicono la
stessa cosa: **il sito pubblico è stato scritto sul vecchio modello
earning quasi ovunque.** Non è più "11 hit", è la narrativa di
acquisizione che va riallineata. Scope reale:

### 3.A · Articoli interi da riscrivere (rewrite-class, come B.11)
Title + meta + body strutturati sul vecchio modello — serve rewrite
ancorato al canonico, non sostituzione:
1. `blog/streak-settimanale-airoobi-bonus-costanza.html`
2. `blog/guadagnare-crypto-gratis-senza-investire.html`
3. `blog/come-guadagnare-punti-aria-airoobi.html`
4. `blog/referral-program-airoobi-guadagna-invitando-amici.html`

### 3.B · Pagine a sostituzione paragrafale
5. `airoobi-explainer.html` (3 hit)
6. `video-airdrop.html` (3 hit — **landing, alta visibilità**)
7. `blog/fair-airdrop-cosa-significa-davvero.html:194` (1 paragrafo)
8. `blog.html` index — 2 card-title (si aggiornano coi rewrite 3.A)
9. `faq.html` "Come faccio a partecipare?" step 2 (§2 sopra)

### 3.C · Meta / micro
10. `abo.html:4332-4333` tooltip admin (ov-videos, ov-referrals +10/+15)
11. `diventa-alpha-brave.html:417` FAQ — solo "check-in giornaliero" → "sequenza giornaliera"
12. `tokens.html:126` "Referral +10/+15" → +5/+5 ROBI

### Sequencing raccomandato ROBY (per impatto di acquisizione)
Il sito è il funnel della Crescita: priorità a ciò che un nuovo
utente vede e che oggi gli mente di più.
- **Onda 1 (alta priorità):** `video-airdrop.html` (landing) ·
  `referral-program` article (la premessa intera è sbagliata —
  referral +10/+15 ARIA invece di +5/+5 ROBI · ed è una leva di
  crescita) · `guadagnare-crypto-gratis` (keyword di acquisizione).
- **Onda 2:** `come-guadagnare-punti-aria` · `streak-settimanale` ·
  `airoobi-explainer` · `fair-airdrop:194`.
- **Onda 3 (micro):** faq step 2 · blog.html cards · abo tooltip ·
  diventa-alpha-brave · tokens.html:126.

ROBY produce la copy / i rewrite per onda; CCP applica per onda. Il
decidere quanto andare a fondo e con che ritmo è una chiamata di
Skeezu — è tempo della corsia Crescita.

## RS — paste-ready

```
RS · SIGN-OFF LB-6 §1-11 + FAQ HIT RESIDUO + SCOPE FASE 2

LB-6 §1-11 FIRMATO. UI-click: B.8 blog iPhone verde (faucet+sequenza,
zero stale), faq B.7 verde, footer dapp 4.48.0 / faq 4.13.0, B.4
in-spirito accolto. Le altre 7 = sostituzioni 1:1 verbatim, coperte.

FIX FAQ RESIDUO (3° hit, non in B.6/B.7): faq.html risposta "Come
faccio a partecipare?" step 2 — sostituire:
"Ogni giorno guadagni ARIA con il check-in, i video e invitando
amici."
→ "Ogni giorno guadagni ARIA gratis con il faucet (+100) e la
sequenza giornaliera (+50 per ogni giorno in cui fai login)."
(tolto "invitando amici" — referral dà ROBI non ARIA). Bump footer
faq. EN mirror se presente.

LB-6 FASE 2 — content-debt residuo: il grep residuale (~10 superfici)
+ il faq hit confermano che il sito pubblico è stale sul modello
earning quasi ovunque. ROBY-led, a onde:
- Onda 1: video-airdrop.html (landing) · blog/referral-program ·
  blog/guadagnare-crypto-gratis.
- Onda 2: come-guadagnare-punti-aria · streak-settimanale ·
  airoobi-explainer · fair-airdrop:194.
- Onda 3 micro: faq step 2 · blog.html cards · abo tooltip ·
  diventa-alpha-brave · tokens.html:126.
ROBY consegna copy/rewrite per onda → CCP applica per onda. CCP non
tocca nulla del residuo finché l'RS dell'onda non droppa.
```

## Bottom line

LB-6 §1-11 firmato — la prima ondata di pulizia earning è live. Ma il
grep ha confermato che il debito è sistemico: il funnel pubblico
(landing, blog, FAQ) descrive ancora rewards che non esistono. LB-6
fase 2 è una vera passata di contenuto della corsia Crescita — la
scopo a onde, priorità all'acquisizione. Quanto a fondo andare e con
che ritmo lo decide Skeezu.

Audit-trail: questo file = ROBY sign-off LB-6 §1-11 · verifica
UI-click B.8 blog iPhone verde (faucet+sequenza, zero stale) + faq
B.7 "Cosa sono le ARIA" verde + footer dapp 4.48.0/faq 4.13.0 + B.4
in-spirito 1635 accolto · altre 7 superfici sostituzioni 1:1 verbatim
coperte dagli spot-check · §1-11 chiuso · TROVATO 1 hit faq residuo
3° (non in B.6/B.7): faq.html "Come faccio a partecipare?" step 2
"check-in, i video" → "faucet (+100) e sequenza giornaliera (+50)" +
tolto "invitando amici" (referral dà ROBI non ARIA) + bump footer ·
LB-6 FASE 2 content-debt sistemico: grep residuale CCP ~10 superfici
(4 articoli rewrite-class streak-settimanale/guadagnare-crypto-gratis/
come-guadagnare-punti-aria/referral-program · 4 mixed airoobi-explainer/
video-airdrop/fair-airdrop:194/blog.html · 3 micro abo tooltip/
diventa-alpha-brave/tokens.html:126) + faq step 2 · sequencing ROBY a
3 onde per impatto acquisizione (onda 1 video-airdrop landing +
referral-program + guadagnare-crypto) · ROBY-led copy/rewrite per
onda, CCP applica per onda · ritmo e profondità = decisione Skeezu
corsia Crescita.

---

*ROBY · Strategic MKT & Comms & Community · sign-off LB-6 §1-11 + scope residuo · 25 May 2026 · daje team a 4*
