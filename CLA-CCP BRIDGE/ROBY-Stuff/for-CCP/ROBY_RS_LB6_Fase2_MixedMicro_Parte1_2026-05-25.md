---
title: ROBY · RS · LB-6 fase 2 mixed/micro parte 1 — tooltip ABO + verify A.1 + scope onesto del residuo
purpose: Primo blocco del mixed/micro di LB-6 fase 2. (1) VERIFY-FLAG: nel mirror `abo.html:425` l'admin-note A.1 mostra ancora il testo vecchio ("ARIA è una moneta di test — nessun valore monetario … airdrop finale mainnet"), nonostante l'ack CCP dichiarasse A.1 shipped — CCP verifichi se A.1 è davvero live + bridge-synced. (2) Copy corretta per i tooltip admin di ABO (earning model stale). (3) Scope onesto del residuo: il grep ha rivelato che `video-airdrop.html` e `airoobi-explainer.html` sono più pesanti di "3 hit" — sono near-rewrite-class — e c'è un 6° articolo (`come-funziona-airdrop-airoobi-guida-completa`) da riscrivere. Parte 2 a seguire.
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: mixed/micro parte 1 — tooltip ABO copy + verify A.1 · parte 2 (pagine pesanti) a seguire
---

# ROBY — RS · LB-6 fase 2 mixed/micro parte 1

## TL;DR

Il grep del residuo ha mostrato due cose: (a) **A.1 da verificare** —
nel mirror l'admin-note di `abo.html` mostra ancora il testo vecchio,
nonostante fosse dato per shipped; (b) il residuo è **più corposo
del previsto** — `video-airdrop.html` e `airoobi-explainer.html` non
sono "3 hit", sono pagine costruite sul modello video/check-in
(near-rewrite-class), e c'è un 6° articolo da riscrivere. Qui consegno
i tooltip ABO + il verify-flag A.1; il resto in parte 2.

## 1. ⚠️ VERIFY-FLAG · A.1 admin-note ABO

L'ack `CCP_Ack_RS_LB3_LB4_Shipped` dichiarava A.1 (`abo.html:444`
admin-note) **shipped** con la copy €0,10. Ma nel mirror
`CLA-CCP BRIDGE/AIROOBI/02_app_pages/abo.html:425` il testo è ancora:

> "ARIA è una moneta di test — nessun valore monetario. Più ARIA un
> utente muove, più peso ha per l'airdrop finale al lancio mainnet."

= il **testo vecchio**, pre-A.1. Due ipotesi: A.1 non è mai stato
applicato, oppure è live sul Pi ma il **mirror non è stato
bridge-synced**. `abo.html` non ha footer-version → impossibile
distinguerlo dal file. **CCP: verifica se A.1 è live su `airoobi.app`
e ri-sincronizza il mirror.** Se non è live, applica la copy A.1
(già consegnata: "ARIA è la valuta interna di AIROOBI — valore di
riferimento €0,10. In fase testnet si ottiene gratis, non si compra.
Più ARIA un utente ha mosso sulla piattaforma, più alto è il suo
moltiplicatore di fedeltà negli airdrop.").

## 2. Tooltip admin ABO — copy corretta

`abo.html`, oggetto JS `ABO_TIPS` (~riga 3643+). 3 tooltip + 1 label
con earning model stale:

**`ov-checkins`** (riga ~3673) — il check-in standalone è abolito, la
meccanica ora è la sequenza giornaliera:
> IT: "Utenti che hanno timbrato la sequenza giornaliera oggi (reset a mezzanotte UTC)."
> EN: "Users who stamped the daily streak today (resets at midnight UTC)."

**`ov-videos`** (riga ~3674) — il video earning è abolito:
> IT: "Visualizzazioni video totali oggi."
> EN: "Total video views today."
(Tolto "+1 ARIA ciascuna". NB: la card "Video visti oggi" è ora una
metrica di solo engagement — se il video earning è morto, valutare
con Skeezu se tenerla come stat o rimuoverla: decisione UX admin,
fuori da questo fix di copy.)

**`ov-referrals`** (riga ~3675) — il referral dà ROBI, non ARIA:
> IT: "Referral confermati (invitato che ha fatto signup + primo accesso). Bonus +5 ROBI al referente e +5 ROBI all'invitato."
> EN: "Confirmed referrals (invited user signed up + first login). Bonus +5 ROBI to referrer and +5 ROBI to invitee."

**`sec-coin`** (riga ~3654) — le fonti ARIA sono faucet + sequenza:
> IT: "Metriche del token ARIA: circolazione totale, emissione giornaliera, distribuzione per fonte (faucet, sequenza giornaliera)."
> EN: "ARIA token metrics: total supply, daily emission, distribution by source (faucet, daily streak)."

**`sec-overview`** (riga ~3644) — sostituire "check-in" → "sequenza
giornaliera":
> IT: "Panoramica generale: utenti registrati, ARIA in circolo, sequenza giornaliera, referral, valore nominale ROBI."
> EN: "General overview: registered users, ARIA in circulation, daily streak, referrals, ROBI nominal value."

Tutto admin-interno (basso impatto). `abo.html` no footer-version →
nessun bump. Flag UX: le card `adm-checkins` ("Check-in oggi") e
`adm-videos` ("Video visti oggi") — label/esistenza = decisione
Skeezu/CCP (rinominare "Check-in oggi"→"Sequenza oggi"; tenere o
togliere "Video visti oggi").

## 3. Scope onesto del residuo — parte 2

Il grep ha corretto la stima "3 hit" di CCP. Quadro reale:

**Near-rewrite-class** (non sostituzione paragrafale — pagina
costruita sul modello vecchio):
- `video-airdrop.html` — landing: griglia earning con "Video +1/video",
  timeline "Giorno 2: check-in + video +2 ARIA", "+10 ARIA registrazione",
  "ARIA mossi in Alpha → airdrop finale mainnet", "mesi di check-in e
  inviti". Va riscritta.
- `airoobi-explainer.html` — flow steps "Guarda un video — 1 ARIA",
  "Partecipa — fai check-in, guarda i video", "check-in/video/referral",
  "airdrop finale al lancio mainnet". Va riscritta.
- `blog/come-funziona-airdrop-airoobi-guida-completa.html` — 6° articolo:
  ha "F3 seniority" + sezione "Come si riceve ARIA di test" sul modello
  vecchio. Rewrite-class.

**Sostituzione paragrafale/righe**:
- `blog.html` — 3+ card (title + excerpt) che puntano agli articoli
  riscritti, con testo stale ("streak settimanale muove più ARIA",
  "check-in al giorno", "Login, check-in, video, referral"). Vanno
  riallineate ai nuovi titoli/temi. Serve lettura completa di
  `blog.html` per l'elenco completo card.
- `blog/fair-airdrop-cosa-significa-davvero.html:~134` — 1 paragrafo
  (riga lunga, da leggere).
- `tokens.html` e `diventa-alpha-brave.html` — CCP cita tokens:126
  "+10/+15" e diventa-alpha-brave:417 "check-in giornaliero"; il mio
  grep sul mirror non li ha pescati (possibile drift line-number
  mirror vs Pi) — da localizzare con lettura mirata.

Parte 2 = ROBY consegna i 3 rewrite (video-airdrop, airoobi-explainer,
guida-completa) come file `.html` in for-CCP/ + un RS copy per
blog.html/fair-airdrop/tokens/diventa-alpha-brave.

## RS — paste-ready

```
RS · LB-6 FASE 2 MIXED/MICRO PARTE 1 — TOOLTIP ABO + VERIFY A.1

VERIFY A.1: nel mirror abo.html:425 l'admin-note mostra ancora il
testo vecchio "ARIA è una moneta di test — nessun valore monetario …
airdrop finale mainnet". CCP: verifica se A.1 è live su airoobi.app
e ri-sincronizza il mirror. Se non è live, applica la copy A.1 (già
consegnata nello sweep: "ARIA è la valuta interna di AIROOBI — valore
di riferimento €0,10 …").

TOOLTIP ABO (oggetto ABO_TIPS in abo.html, IT+EN):
- ov-checkins → "Utenti che hanno timbrato la sequenza giornaliera
  oggi (reset a mezzanotte UTC)."
- ov-videos → "Visualizzazioni video totali oggi." (tolto "+1 ARIA")
- ov-referrals → "Referral confermati (invitato che ha fatto signup +
  primo accesso). Bonus +5 ROBI al referente e +5 ROBI all'invitato."
- sec-coin → "…distribuzione per fonte (faucet, sequenza giornaliera)."
- sec-overview → "…ARIA in circolo, sequenza giornaliera, referral,
  valore nominale ROBI."
Flag UX (decisione Skeezu/CCP): card "Check-in oggi"→"Sequenza oggi";
card "Video visti oggi" tenere come stat engagement o rimuovere.

PARTE 2 a seguire: video-airdrop.html + airoobi-explainer.html +
blog/come-funziona-airdrop-airoobi-guida-completa.html sono
near-rewrite-class (non 3-hit) → ROBY li consegna come .html in
for-CCP/. + RS copy per blog.html cards / fair-airdrop:134 /
tokens.html / diventa-alpha-brave.html. CCP non tocca finché non droppa.
```

## Bottom line

Mixed/micro parte 1: tooltip ABO corretti + un verify-flag su A.1 (il
mirror sembra non aggiornato). Il residuo è più corposo del previsto
— `video-airdrop` e `airoobi-explainer` sono pagine da riscrivere, non
da ritoccare, più un 6° articolo. ROBY li consegna in parte 2 come
rewrite, stessa modalità dei 5 articoli.

Audit-trail: questo file = RS ROBY LB-6 fase 2 mixed/micro parte 1 ·
VERIFY-FLAG A.1 abo.html admin-note: mirror :425 mostra ancora testo
vecchio "moneta di test nessun valore monetario airdrop finale
mainnet" nonostante ack A.1 shipped → CCP verifica live airoobi.app +
ri-sync mirror, se non live applica copy A.1 €0,10 · tooltip ABO
ABO_TIPS copy corretta IT+EN (ov-checkins → sequenza giornaliera ·
ov-videos tolto +1 ARIA · ov-referrals +5/+5 ROBI · sec-coin fonti
faucet+sequenza · sec-overview check-in→sequenza) admin-interno no
bump · flag UX card Check-in/Video label-o-rimozione decisione
Skeezu/CCP · scope residuo corretto: video-airdrop.html +
airoobi-explainer.html near-rewrite-class (griglia earning video +
timeline check-in + airdrop finale mainnet) + come-funziona-airdrop-
airoobi-guida-completa 6° articolo F3+earning rewrite-class →
parte 2 rewrite .html in for-CCP/ · blog.html cards + fair-airdrop:134
+ tokens.html + diventa-alpha-brave RS copy parte 2 · CCP non tocca
finché file/RS parte 2 non droppa.

---

*ROBY · Strategic MKT & Comms & Community · RS LB-6 fase 2 mixed/micro parte 1 · 25 May 2026 · daje team a 4*
