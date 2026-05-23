---
title: ROBY · RS · GOLDEN-SESSION batch 1 — GS-1 EVALOBI · GS-2 referral/tier · GS-4 delete/export
purpose: Primi 3 item azionabili della golden-session UAT CEO, impacchettati per CCP. ABO v2 e Privacy/ToS chiusi, CCP libero — go-live day. Nuovi item della golden-session arriveranno in batch successivi.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: RS golden-session batch 1 · 3 item · RS paste-ready
related: GOLDEN-SESSION_2026-05-23.md
---

# ROBY — RS · GOLDEN-SESSION batch 1

## TL;DR

La golden-session è la UAT finale del CEO: quando i suoi item sono risolti,
AIROOBI va live. ABO v2 e Privacy/ToS sono chiusi → CCP è libero. Ecco i **primi
3 item azionabili**. La UAT di Skeezu è in corso: i nuovi item arriveranno in
batch successivi.

## GS-1 · EVALOBI — gestione in ABO + concetto nel prodotto

**Cosa:** EVALOBI sono badge — **nessun valore monetario**, ma con un
**contenuto**: la valutazione dell'oggetto. Vanno gestiti e resi visibili.

CCP-actionable:
- **Sezione EVALOBI in ABO** — esiste già lo stub `sec-evalobi` (vecchio gruppo
  W4, ora fuori dal menu). Costruirla: lista EVALOBI, per ciascuno il suo
  contenuto (la valutazione: esito, valore stimato, motivazione). Tipo NFT di
  riferimento già a DB: `VALUATION`. Reinserire la voce nell'area giusta della
  sidebar ABO v2 (Operations).
- **Info "i" lato dApp** — nel profilo utente, un punto dove l'utente vede i
  **badge EVALOBI che possiede**, con un tooltip "i" che spiega cosa sono.

ROBY-side (non a CCP): la copy del concetto EVALOBI per la guida
(come-funziona) e per il blog la consegno io a parte.

## GS-2 · Mismatch referral/tier nel profilo CEO

**Cosa:** il profilo CEO mostra **3 utenti referral confermati** ma è associato
al tier **Bronze** come se ne avesse **1 solo**. La logica di conteggio
referral → tier è da verificare e correggere.

*Indizio:* incoerenza referral già vista in ABO — Overview "3 Referral
confermati" vs tabella Ultimi utenti che dava "9 referral" sul CEO. Tre numeri
diversi per la stessa cosa: c'è una query/aggregazione che non torna.

CCP-actionable: diagnosticare la catena referral-confermati → tier, allineare
il conteggio, verificare che il tier del profilo rifletta i referral reali.

## GS-4 · Cancellazione & esportazione dati — self-service

**Cosa:** mancano il self-service per i diritti GDPR di cancellazione account
ed esportazione dati (oggi solo soft-delete a schema + esercizio manuale via
email).

CCP-actionable: scaffoldare col **pattern che hai già proposto** tu stesso
nell'ack AdSense — `account_soft_delete(p_user_id)` + `export_user_data()
RETURNS JSONB`, entrambe SECURITY DEFINER, + 2 bottoni nel modulo Profilo dApp
(conferma doppio click per delete, download JSON per export). Quando questo è
live, la Privacy §7 si aggiorna coi bottoni.

## RS — paste-ready

```
RS · GOLDEN-SESSION batch 1 (UAT CEO pre-go-live) · 3 item

GS-1 · EVALOBI — gestione + visibilità
- Costruire la sezione EVALOBI in ABO (stub sec-evalobi esistente):
  lista EVALOBI + contenuto valutazione per ciascuno (tipo NFT
  VALUATION). Reinserire la voce nella sidebar ABO v2 (area Operations).
- dApp: nel profilo, vista dei badge EVALOBI posseduti + tooltip "i"
  che spiega cosa sono.
- (La copy guida/blog del concetto EVALOBI la consegna ROBY a parte.)

GS-2 · Mismatch referral/tier profilo CEO
- Il profilo CEO mostra 3 referral confermati ma tier Bronze come con 1.
- Diagnosticare la catena referral-confermati → tier; allineare il
  conteggio. NB incoerenza già nota: Overview 3 vs tabella utenti 9.

GS-4 · Cancellazione/esportazione dati self-service
- Scaffoldare account_soft_delete(p_user_id) + export_user_data()
  RETURNS JSONB (SECURITY DEFINER) + 2 bottoni nel Profilo dApp
  (delete con conferma doppio click · export download JSON).
- Pattern come da tuo ack AdSense.

Ad ogni consegna ROBY ri-verifica a UI-click. La golden-session
chiude (→ go-live) quando tutti gli item sono risolti.
```

## Nota

Ad ogni consegna CCP, ROBY ri-verifica a UI-click prima del sign-off. La
golden-session è il gate del go-live ufficiale: si chiude quando GS-1, GS-2,
GS-3, GS-4 (e gli eventuali item successivi) sono risolti. Target: oggi.

---

*ROBY · Strategic MKT & Comms & Community · RS GOLDEN-SESSION batch 1 · 23 May 2026 · daje team a 4*
