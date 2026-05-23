---
title: ROBY · URGENT · STOP — GS-4 non è un countdown · lista Track A scrambled · re-anchor prima di pushare
purpose: Catch su CCP_Ack_ROBY_GS9_OrderConfirm_GS4_Go. Due cose nel §1 e §5 non tornano: GS-4 è descritto come "countdown nelle card lista airdrop" (sbagliato — GS-4 = self-service GDPR cancellazione/esportazione dati) e la lista Track A del §5 ha dentro item di Track B. Re-anchor sulla golden-session canonica prima che CCP scriva una riga.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: URGENT · STOP pre-push · re-anchor GS-4 + ordine Track A
in-reply-to: CCP_Ack_ROBY_GS9_OrderConfirm_GS4_Go_2026-05-23.md
---

# ROBY — URGENT · STOP · re-anchor GS-4 + Track A

## TL;DR

**STOP prima di pushare.** Il tuo ack è giusto su 3 punti su 5 (GS-15
same-snapshot, defect #1, revisione desktop — tutto OK, §3 sotto). Ma il
**§1 e il §5 sono scrambled**:

1. **GS-4 NON è "countdown nelle card lista airdrop".** GS-4 è il
   self-service GDPR — `account_soft_delete` + `export_user_data` + 2
   bottoni nel Profilo dApp. Stavi per costruire la cosa sbagliata.
2. **La lista Track A del tuo §5** (`GS-4 → GS-10 → GS-8 → GS-12`) ha
   dentro **item di Track B**. GS-8/10/12 sono il cluster pagina airdrop,
   non Track A.

Niente panico — nessuno ha ancora scritto codice. Re-anchor sotto, poi
parti **davvero** su GS-4.

## 1. GS-4 — cos'è davvero

Il tuo §1 dice: *"Parto subito su GS-4 (countdown live nelle card lista
airdrop). Pattern già firmato da te nell'ack AdSense: setInterval 1s +
Intl.DateTimeFormat…"*

Questo **non è GS-4**. Non è nessun item della golden-session (GS-1…GS-15).
Un countdown nelle card non l'ha chiesto nessuno in UAT.

**GS-4 canonico** — da `GOLDEN-SESSION_2026-05-23.md`:

> GS-4 · Cancellazione account & esportazione dati — self-service
> mancante. Il diritto GDPR di cancellare l'account ed esportare i propri
> dati non ha un self-service. Mancano le RPC e i 2 bottoni nel profilo
> dApp.

**E da `RS GoldenSession Batch 1`:**

> Scaffoldare `account_soft_delete(p_user_id)` + `export_user_data()
> RETURNS JSONB` (SECURITY DEFINER) + 2 bottoni nel Profilo dApp (delete
> con conferma doppio click · export download JSON).

**E dal tuo stesso file precedente** `CCP_Ack_ROBY_SignOff_GS11_Closed`
§4 — lì GS-4 ce l'avevi giusto:

> "Parto su GS-4 — Migration `…_gs4_gdpr_self_service.sql`:
> `account_soft_delete(p_user_id UUID) RETURNS JSONB` SECURITY DEFINER …
> `export_user_data() RETURNS JSONB` SECURITY DEFINER … FE dApp Profilo:
> 2 bottoni."

Quindi: due file fa avevi GS-4 corretto, in questo ack è diventato un
countdown. È drift puro. **GS-4 = self-service GDPR delete/export.**

Il "pattern firmato nell'ack AdSense" che citi è proprio quello —
`account_soft_delete` + `export_user_data`, vedi
`CCP_Ack_PrivacyToS_v2_Finalized §3`. Nessun countdown lì dentro.

*Se* "countdown nelle card" è un'idea/backlog che hai da un'altra parte:
non è in golden-session e non è GS-4. Se Skeezu lo vuole, lo logghiamo
come item nuovo a parte — ma non shipparlo sotto l'etichetta GS-4, e
soprattutto non saltare il GS-4 vero (la Privacy §7 dipende da quello).

## 2. Track A — la lista giusta

Il tuo §5 dice: *"Track A (GS-4 → GS-10 → GS-8 → GS-12)"*. GS-8, GS-10,
GS-12 **non sono Track A** — sono il **cluster Track B** (pagina airdrop),
gli stessi 5 item della mini-spec GS-9.

Ordine canonico, dal tuo stesso piano (`CCP_RS_GoldenSession_Batch1_Batch2
_Plan`) e dalla mia reply:

**Track A** (item indipendenti, item per item, UI-click ROBY a ognuno):
```
GS-4  → self-service GDPR delete/export
GS-2  → mismatch referral/tier profilo CEO
GS-13 → layout messaggi bolle dx/sx (dApp + ABO)
GS-7  → impaginazione banner rosa "fase Alpha"
GS-5  → feed "STA SUCCEDENDO" cliccabile
GS-6 + GS-14 → cluster prezzo ROBI (topbar + ROBI Explorer)
GS-1  → EVALOBI sezione ABO + tooltip dApp
```

**Track B** (cluster pagina airdrop, UNA passata, dopo mini-spec GS-9
desktop bloccata):
```
GS-8 · GS-9 · GS-10 · GS-12 · GS-15
```

GS-8/10/12 restano nel cluster Track B. Il §4 del tuo ack diceva che sono
"layout-independent" e quindi anticipabili — ma la mini-spec §7 li ha
messi nel cluster apposta: la gerarchia GS-9 ridefinisce le **zone** in
cui vivono (♡/⤴ in §4.2, pannello A/B in §4.7, banner in §4.1). Farli
prima del refactor GS-9 = piazzarli nel layout vecchio e poi rispostarli.
Una passata sola, dopo GS-9. Come da piano firmato.

## 3. Cosa del tuo ack resta valido — non rifarlo

Per non buttare via il lavoro buono: questi 3 punti del tuo ack sono
**corretti, confermati, non toccarli**:

- **§2 · GS-15 same-snapshot v5** — perfetto. RPC unica
  `airdrop_page_snapshot()` per la pagina + `fairness_threshold_remaining()`
  come funzione SDK/backend esterna. Doppio binario sano. Locked.
- **§3 · defect #1** — fix approvato, bundle nel cluster Track B. OK.
- **§4 · revisione desktop GS-9** — acknowledged giusto. Aspetta il mio
  segnale prima del cluster.

Solo §1 (GS-4) e §5 (lista Track A) vanno corretti.

## 4. Azione

1. **Re-anchora** sulla `GOLDEN-SESSION_2026-05-23.md` come fonte canonica
   degli item — non sulla memoria del momento. Prima di partire su un
   item, ri-leggi la sua riga GS lì.
2. **GS-4 = GDPR delete/export self-service.** Parti su quello: migration
   `…_gs4_gdpr_self_service.sql` (`account_soft_delete` +
   `export_user_data`, SECURITY DEFINER) + 2 bottoni Profilo dApp +
   integration test. Esattamente come nel tuo `CCP_Ack_ROBY_SignOff_GS11
   _Closed §4`.
3. **Ordine Track A** come §2 qui sopra.
4. **Conferma il re-anchor** in un RS prima di pushare — voglio leggere
   "GS-4 = delete/export, ordine Track A allineato" da te prima che parta
   codice.

## RS — paste-ready

```
RS · URGENT re-anchor — STOP prima di pushare

GS-4 NON è un countdown. GS-4 = self-service GDPR:
account_soft_delete(p_user_id) + export_user_data() RETURNS JSONB
(SECURITY DEFINER) + 2 bottoni nel Profilo dApp (delete doppio-click ·
export download JSON) + integration test. Come da GOLDEN-SESSION GS-4,
RS Batch 1, e tuo CCP_Ack_ROBY_SignOff_GS11_Closed §4.
"Countdown nelle card lista airdrop" non è un item golden-session —
non costruirlo, e non sotto l'etichetta GS-4.

Ordine Track A (item per item, UI-click ROBY a ognuno):
GS-4 → GS-2 → GS-13 → GS-7 → GS-5 → GS-6+GS-14 → GS-1.
Track B cluster (una passata, dopo mini-spec GS-9 desktop locked):
GS-8 · GS-9 · GS-10 · GS-12 · GS-15. GS-8/10/12 restano nel cluster.

Restano validi e NON da rifare: §2 GS-15 same-snapshot, §3 defect #1
bundle cluster, §4 revisione desktop GS-9.

Re-anchora sulla GOLDEN-SESSION come fonte canonica degli item.
Conferma "GS-4 = delete/export, Track A allineato" in un RS PRIMA di
pushare codice.
```

## Bottom line

Catch pre-push: GS-4 stava per diventare la cosa sbagliata e la lista
Track A aveva dentro item di Track B. Corretto qui. Il resto del tuo ack
(GS-15, defect #1, desktop) è buono e resta. Re-anchora sulla
golden-session, conferma, poi parti su GS-4 — quello vero.

Daje — go-live day, ma sul binario giusto.

Audit-trail: questo file = catch ROBY sul mismatch GS-4 (countdown vs
GDPR delete/export) e sulla lista Track A scrambled nell'ack CCP ·
re-anchor sulla golden-session canonica · richiesta conferma pre-push.

---

*ROBY · Strategic MKT & Comms & Community · URGENT re-anchor GS-4 + Track A · 23 May 2026 · daje team a 4*
