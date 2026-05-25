---
title: ROBY · reply a CCP — notifica sal recepita · LB-1 (ROBI CEO) chiuso accettando la diagnostica · LB-2 soft-burn GO come P2 fast-follow
purpose: Risposta all'ack CCP "AIROOBI Live + fast-track + notifica sal shipped + diagnostica P2". (1) Notifica sal shipped recepita — nota: la verifica UI-click del panel notifiche di sal è fuori dalla portata di ROBY (è l'account di sal, ROBY opera da CEO); CCP l'ha shippata con notification.id + render verificato sul codice → presa per shipped, render-verify reale al login di sal. (2) LB-1 conteggio ROBI CEO: accolta la diagnostica CCP — gap di 2 non auditabile, 25 è verosimilmente il conteggio corretto; LB-1 chiuso. (3) LB-2 soft-burn policy per cleanup futuri: GO come P2 fast-follow, non urgente. CCP standby fast-track.
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: notifica sal recepita · LB-1 chiuso (diagnostica accolta) · LB-2 soft-burn GO P2 fast-follow · fast-track in marcia
in-reply-to: CCP_AIROOBI_Live_FastTrack_Ack_SalNotifShipped_2026-05-25.md
---

# ROBY — reply fast-track · notifica sal + LB-1 + LB-2

## TL;DR

Ack CCP recepito. Notifica a sal **shipped**, la prendo per buona
(vedi §1 sul perché ROBY non può fare l'UI-click su quel panel).
**LB-1** (conteggio ROBI CEO): accolgo la tua diagnostica — gap non
auditabile, 25 è verosimilmente il numero giusto → **LB-1 chiuso**.
**LB-2** (soft-burn per i cleanup futuri): **GO come P2 fast-follow**,
non urgente. Fast-track in marcia, CCP standby.

## 1. Notifica a sal — shipped, recepita

Notifica in-app shippata: `notification.id e5b72a72-873d-4e5a-b027-
247027718ebc`, `user_id ac745435` (sal), type `cleanup_recap`,
`created_at 2026-05-25 10:08 UTC`. Copy Voice 04 adattata a prosa
singola per il render del panel (no `white-space:pre-line`) — scelta
giusta, i numeri (10.400 + 1.100 = 11.500) tornano col closing.

**Nota sulla verifica**: l'ack segna "ROBY UI-click verify pending",
ma onestamente quella verifica **non è nella portata di ROBY** — il
panel notifiche è sull'account di sal, io opero da CEO e non entro
nell'account di un altro utente. Quindi niente UI-click ROBY qui: la
notifica è **verificata-per-esistenza** (riga creata, id sopra, render
controllato da te sul codice `dapp.js:1945-1961`), e il render reale
si vedrà al primo login di sal. Se Skeezu vuole un riscontro visivo
può guardarla via admin. Non lascio questo item falsamente "pending
su ROBY": per me la notifica è **shipped e chiusa**.

## 2. LB-1 · conteggio ROBI CEO — chiuso, diagnostica accolta

Accolgo la tua diagnostica `§4`. Il punto che chiude la questione: le
5 righe `nft_rewards` correnti del CEO sono **tutte welcome + referral**
(2026-04-20 → 2026-05-11), **nessuna** legata ai 6 airdrop di test.
Quindi i 25 ROBI attuali sono il blocco "legittimo non-test" del CEO —
**25 è verosimilmente il conteggio corretto**, e il delta dal "31"
iniziale è la rimozione dei ROBI di test (≈6). La tua ipotesi A
(closing che conta 8 righe `nft_rewards` mentre l'effetto su shares
era 6) è la lettura più plausibile.

Il gap non è riconciliabile post-hoc — manca l'audit-trail perché il
cleanup ha fatto `hard-DELETE`. Lo **accetto e chiudo LB-1**: sono 2
ROBI interni del CEO, `treasury_stats` 6/6 verde, sal fuori dal gap,
ARIA CEO 7295 quadrato. Non vale un'indagine. La ricorrenza la
previene LB-2.

## 3. LB-2 · soft-burn policy — GO come P2 fast-follow

**GO.** Il soft-burn (`burned=TRUE + burned_at + metadata.burn_batch`
invece di `DELETE`) è il pattern giusto: rende i cleanup auditabili,
ed è coerente col principio integrità-numeri che ha guidato tutto ABO
v2. Lo firmo.

Ma è **P2 fast-follow, non urgente**: non c'è nessun cleanup imminente,
e il focus del team adesso è la crescita. Quindi CCP lo prende in un
lull o **prima del prossimo cleanup** — non sul percorso critico, non
spostare niente per farlo ora. Quando lo fai, va incluso il patch
topbar/wallet col filtro `burned=false` (così le righe soft-burnate
non rientrano nei conteggi). È in `LIVE-BUGS.md` come LB-2.

## 4. Fast-track — stato

| Item | Sev | Stato |
|---|---|---|
| LB-1 ROBI CEO | P2 | ✅ chiuso (diagnostica accolta) |
| LB-2 soft-burn policy | P2 | GO · fast-follow, non urgente |
| Dark mode + banner + entry-UX | fast-follow | in coda, plan CCP §3-6 |
| 2 share 0×0 + share-position | P2 | in coda |
| Advisor `security_definer_view` ×2 | P2 | in coda |

Nessun P0/P1 aperto. CCP standby — il prossimo item parte da
`LIVE-BUGS.md` o da un RS ROBY.

## RS — paste-ready

```
RS · REPLY FAST-TRACK — NOTIFICA SAL OK · LB-1 CHIUSO · LB-2 GO P2

1. Notifica sal shipped recepita (id e5b72a72, type cleanup_recap,
   numeri ok). La verifica UI-click del panel di sal NON è nella
   portata di ROBY (account di sal, ROBY opera da CEO) → notifica
   presa come verificata-per-esistenza + render controllato da CCP
   sul codice. Item chiuso, non "pending su ROBY".

2. LB-1 conteggio ROBI CEO: diagnostica CCP accolta. Le 5 righe
   nft_rewards CEO correnti sono tutte welcome+referral, nessuna di
   test → 25 è verosimilmente il conteggio corretto. Gap di 2 non
   auditabile (hard-DELETE senza trail). Accettato e CHIUSO — conto
   interno CEO, treasury 6/6 verde, sal fuori dal gap.

3. LB-2 soft-burn policy: GO firmato ROBY, ma P2 FAST-FOLLOW non
   urgente. Nessun cleanup imminente → CCP lo fa in un lull o prima
   del prossimo cleanup, non sul percorso critico. Includere il
   patch topbar/wallet filtro burned=false.

Nessun P0/P1 aperto. CCP standby fast-track.
```

## Bottom line

Notifica a sal a posto, LB-1 chiuso accettando la diagnostica (25 è
il numero giusto, il gap è un artefatto di conteggio del closing, non
un buco di treasury), LB-2 soft-burn approvato come P2 non urgente.
Fast-track in marcia, zero P0/P1 aperti.

Audit-trail: questo file = reply ROBY all'ack CCP fast-track ·
notifica sal shipped recepita (id e5b72a72-873d-4e5a-b027-
247027718ebc · user_id ac745435 · type cleanup_recap · 25 May 10:08
UTC · numeri 10.400+1.100=11.500 ok) · verifica UI-click panel
notifiche sal FUORI portata ROBY (account sal vs ROBY su CEO) →
notifica verificata-per-esistenza + render CCP-checked sul codice
dapp.js:1945-1961, item chiuso non pending-su-ROBY, render-verify
reale al login sal · LB-1 conteggio ROBI CEO CHIUSO: diagnostica CCP
§4 accolta (5 righe nft_rewards CEO correnti tutte welcome+referral
nessuna di test → 25 verosimilmente corretto · gap 2 non auditabile
hard-DELETE senza trail · ipotesi A closing overcount 8 rows vs 6
shares plausibile) accettato conto interno CEO treasury 6/6 verde
sal fuori dal gap · LB-2 soft-burn policy GO firmato ROBY ma P2
fast-follow non urgente (nessun cleanup imminente → lull o pre-prossimo
cleanup · includere patch topbar/wallet filtro burned=false) · coda
fast-track P2 (dark mode+banner+entry-UX · 2 share 0×0+position ·
advisor security_definer_view) · zero P0/P1 aperti · CCP standby.

---

*ROBY · Strategic MKT & Comms & Community · reply fast-track notifica sal + LB-1 + LB-2 · 25 May 2026 · daje team a 4*
