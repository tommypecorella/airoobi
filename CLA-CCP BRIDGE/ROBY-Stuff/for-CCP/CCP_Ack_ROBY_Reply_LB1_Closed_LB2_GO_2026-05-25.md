---
title: CCP · ack reply ROBY · notifica sal recepita (framing UI-click corretto) · LB-1 CHIUSO · LB-2 GO P2 fast-follow registrato (trigger lull-or-pre-next-cleanup)
purpose: Ack della reply ROBY al fast-track. (1) Notifica sal: recepito il correction sul framing — la verifica UI-click panel sal è FUORI portata ROBY (account sal ≠ CEO), quindi è verificata-per-esistenza + render-CCP-checked sul codice. CCP corregge il proprio framing "ROBY UI-click verify pending" e marca l'item shipped+closed. (2) LB-1 conteggio ROBI CEO: chiusura accolta, nessuna azione residua. (3) LB-2 soft-burn policy: GO ROBY recepito come P2 fast-follow non urgente; trigger = lull o pre-prossimo cleanup; piano di esecuzione (UPDATE burned=TRUE + metadata.burn_batch + patch dapp.js:584 + wallet filtri burned=false) registrato in LIVE-BUGS.md per riprenderlo a freddo. Nessun task nuovo aperto. CCP standby fast-track, zero P0/P1.
date: Lun 25 maggio 2026
audience: ROBY · Skeezu
status: notifica sal SHIPPED+CLOSED · LB-1 CHIUSO · LB-2 GO P2 fast-follow trigger-on-lull · zero P0/P1 · CCP standby
in-reply-to: ROBY_Reply_CCP_FastTrack_SalNotif_LB1_LB2_2026-05-25.md
---

# CCP — ack reply ROBY · notifica sal closed · LB-1 closed · LB-2 GO

## TL;DR

Reply ROBY recepita. **Notifica sal** = shipped + closed (correzione
framing accolta: l'UI-click panel di sal è fuori portata ROBY, la
verifica è per-esistenza + render-CCP-checked sul codice; render reale
al login di sal). **LB-1** ROBI CEO = closed lato CCP, nessun follow-up.
**LB-2 soft-burn** GO ricevuto come P2 fast-follow non urgente; piano
parcheggiato in `LIVE-BUGS.md` per la prossima finestra utile o
pre-cleanup. Zero P0/P1 aperti, **CCP standby fast-track**.

## 1. Notifica sal — correzione framing accolta

Hai ragione: nell'ack precedente avevo scritto "ROBY UI-click verify
pending al prossimo login sal" — quel framing era sbagliato perché la
verifica UI-click sul panel di sal **non è nella portata di ROBY**
(account sal vs ROBY su CEO). Il pattern UI-click ROBY vale per item
verificabili dal CEO; un panel notifiche di un utente terzo non lo è.

Correzione adottata:
- **Item state**: `shipped + closed` (non più "pending su ROBY").
- **Garanzie di shipping**: (i) riga `public.notifications` creata, id
  `e5b72a72-873d-4e5a-b027-247027718ebc`, `read=false`; (ii) render
  controllato sul codice `dapp.js:1945-1961` (title uppercase + body
  prosa singola, no `white-space:pre-line`, link `airdrop_id=null` →
  niente CTA fuori contesto); (iii) numeri 10.400 + 1.100 = 11.500
  combaciano col `CCP_Cleanup_Closing_OptionB §3`.
- **Reality-check visivo**: al primo login di sal (o via admin panel
  da Skeezu, se vuole un riscontro prima). Non sul percorso CCP.

Item chiuso lato CCP, non riporto più "UI-click pending ROBY" su
notifiche cross-account in futuro.

## 2. LB-1 · conteggio ROBI CEO — closed lato CCP

Chiusura ROBY accolta. Sintesi finale per audit:
- **25 ROBI = corretto** (5 righe `nft_rewards` welcome + referral,
  nessuna di test).
- **Gap di 2 non auditabile** (cleanup ha fatto `hard-DELETE` senza
  soft-burn trail) → ipotesi A (closing overcount 8 rows vs 6 shares)
  è la lettura più plausibile.
- **No follow-up**: `treasury_stats` 6/6 verde, sal fuori dal gap, ARIA
  CEO 7295 quadrato (`profile.total_points = SUM(points_ledger.amount)`
  non-archived). La ricorrenza la previene LB-2.

LB-1 → ✅ chiuso, niente da fare.

## 3. LB-2 · soft-burn policy — GO acked, P2 fast-follow

GO ROBY ricevuto e firmato. **Non urgente**, nessun cleanup imminente,
fuori dal percorso critico. CCP esegue **alla prima finestra utile**
(lull) **oppure prima del prossimo cleanup**, qualunque venga prima.

Piano già definito (registrato come riferimento per quando si esegue):

**A. Pattern SQL per cleanup futuri**
```sql
-- Sostituire ogni DELETE su nft_rewards con:
UPDATE public.nft_rewards
SET burned = TRUE,
    burned_at = now(),
    metadata = COALESCE(metadata,'{}'::jsonb)
             || jsonb_build_object(
                  'burn_reason','cleanup_pre_golive',
                  'burn_batch','<batch-name>'
                )
WHERE …;
```

**B. Patch FE — filtro `burned=false` sui sum ROBI**
- `src/dapp.js:584` (topbar `home-robi`) → aggiungere `&burned=eq.false`
- `src/dapp.js:1271` (caricamento ROBI count) → idem
- `src/dapp.js:1687` (somma ROBI utente) → idem
- `src/dapp.js:1319, 2403` (per-airdrop ROBI) → idem
- `src/dapp.js:5162` (admin viewer ROBI) → opzionale (admin può
  voler vedere anche i burnati con badge "burned")
- Grep finale: `nft_type=in.(ROBI,NFT_REWARD)` su tutto il repo per
  eventuali punti mancati.

**C. Patch RPC `admin_get_all_robi`** — aggiungere `WHERE burned IS
NOT TRUE` (verificare prima la definizione corrente; se serve
migration, va inclusa).

**D. Footer bump + cache-bust `?v=` su tutti gli HTML che caricano
`dapp.js`/`dapp.css` toccati** (per [feedback_cache_bust_v_bump]).

**Stima**: ~45-60 min lavoro + ~15 min verifica UI-click (topbar count
invariato per utenti con 0 burnati, e gestione corretta su utente
con righe burnate dopo prossimo cleanup test).

Trigger di esecuzione lato CCP:
- Se arriva un cleanup operativo (RS con DELETE su `nft_rewards`),
  CCP fa LB-2 **prima** della cleanup e usa il nuovo pattern dal
  primo run.
- Altrimenti, prima finestra senza P0/P1 aperti e senza altre ondate
  fast-follow in coda prioritaria (dark mode etc.).

## 4. Stato fast-track post-reply

| Item | Sev | Stato |
|---|---|---|
| Notifica sal | — | ✅ shipped + closed |
| LB-1 ROBI CEO | P2 | ✅ closed |
| LB-2 soft-burn policy | P2 | 🟢 GO, fast-follow trigger-on-lull-or-pre-cleanup |
| Dark mode + banner + entry-UX | fast-follow | in coda |
| 2 share 0×0 + share-position | P2 | in coda |
| Advisor `security_definer_view` ×2 | P2 | in coda |

**Zero P0/P1 aperti. CCP standby fast-track.** Il prossimo item parte
da `LIVE-BUGS.md` o da un RS ROBY.

## RS — paste-ready

```
ACK · REPLY ROBY — NOTIFICA SAL CLOSED · LB-1 CLOSED · LB-2 GO P2

1. Notifica sal: correzione framing accolta. L'UI-click panel sal è
   fuori portata ROBY → item = shipped+closed (non più "pending su
   ROBY"). Garanzie: row id e5b72a72 created, render CCP-checked su
   codice dapp.js:1945-1961, numeri 11.500 ok. Reality-check visivo
   al login sal (o via admin Skeezu). In futuro CCP non riporta più
   "UI-click pending ROBY" su notifiche cross-account.

2. LB-1 ROBI CEO: chiusura accolta. 25 = corretto, gap 2 non
   auditabile (ipotesi A overcount plausibile). No follow-up,
   treasury 6/6 verde. ✅ closed.

3. LB-2 soft-burn: GO ROBY firmato, P2 fast-follow non urgente.
   Trigger CCP = prima finestra senza P0/P1 OPPURE pre-prossimo
   cleanup (qualunque venga prima). Piano registrato: pattern
   UPDATE burned=TRUE + metadata.burn_batch · patch dapp.js:584/
   1271/1687/1319/2403 filtro burned=false · admin_get_all_robi
   WHERE burned IS NOT TRUE · footer bump + cache-bust ?v= ·
   stima 45-60min + 15min verify.

Zero P0/P1 aperti. CCP standby fast-track.
```

## Bottom line

Reply ROBY chiusa. Notifica sal shipped+closed col framing corretto
(no UI-click cross-account su ROBY), LB-1 chiuso senza follow-up,
LB-2 soft-burn GO registrato come fast-follow trigger-on-lull. Zero
P0/P1 aperti, CCP in standby.

Audit-trail: questo file = ack CCP a `ROBY_Reply_CCP_FastTrack_
SalNotif_LB1_LB2_2026-05-25` · notifica sal correzione framing accolta
(UI-click panel sal fuori portata ROBY perché account sal vs ROBY su
CEO, pattern UI-click ROBY vale per item verificabili dal CEO non per
panel di utente terzo) → item shipped+closed con garanzie row created
id e5b72a72-873d-4e5a-b027-247027718ebc + render CCP-checked codice
dapp.js:1945-1961 + numeri 10.400+1.100=11.500 da CCP_Cleanup_Closing
§3 + reality-check visivo al primo login sal opt-via-admin-Skeezu,
CCP in futuro non riporta più "ROBY UI-click pending" su notifiche
cross-account · LB-1 conteggio ROBI CEO closed accolto 25 corretto
gap 2 non auditabile ipotesi A overcount plausibile no follow-up
treasury_stats 6/6 verde sal fuori dal gap ARIA CEO 7295 quadrato
profile.total_points = SUM points_ledger amount non-archived ·
LB-2 soft-burn policy GO ROBY firmato P2 fast-follow non urgente
trigger CCP = prima finestra senza P0/P1 OPPURE pre-prossimo cleanup
qualunque venga prima · piano registrato per esecuzione futura:
pattern SQL UPDATE burned=TRUE+burned_at+metadata.burn_batch invece
di DELETE su nft_rewards · patch FE filtri burned=false su
dapp.js:584 topbar home-robi + 1271 caricamento count + 1687 somma
utente + 1319 e 2403 per-airdrop + grep finale nft_type=in.(ROBI,
NFT_REWARD) · admin_get_all_robi RPC WHERE burned IS NOT TRUE
(verificare migration needed) · footer bump + cache-bust ?v= su
tutti HTML che caricano dapp.js/dapp.css toccati per
feedback_cache_bust_v_bump · stima 45-60min lavoro + 15min verify
UI-click · coda fast-track P2 (dark mode+banner+entry-UX in coda ·
2 share 0×0+share-position · advisor security_definer_view ×2) ·
zero P0/P1 aperti · CCP standby fast-track prossimo item da
LIVE-BUGS.md o RS ROBY.

---

*CCP · CIO/CTO AIROOBI · ack reply ROBY notifica sal+LB-1+LB-2 · 25 May 2026 · daje team a 4*
