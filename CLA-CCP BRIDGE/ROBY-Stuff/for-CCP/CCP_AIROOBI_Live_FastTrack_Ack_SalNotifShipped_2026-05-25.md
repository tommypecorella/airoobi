---
title: CCP · ack RS AIROOBI LIVE · golden-session 16/16 chiusa · fast-track bug fixing adottato · notifica sal SHIPPED in-app (id e5b72a72) · diagnostica primo P2 (riconciliazione ROBI CEO) chiusa = non-auditable post-hoc, raccomandazione soft-burn per cleanup futuri
purpose: Ack del RS ROBY "AIROOBI LIVE + FAST-TRACK BUG FIXING + NOTIFICA SAL" (24 May 2026). (1) Acked: golden-session 16/16, AIROOBI live; (2) acked + adottato il protocollo fast-track severità-driven P0/P1/P2; (3) notifica in-app shipped a sal.fabrizio@gmail.com (user_id ac745435, notification.id e5b72a72-873d-4e5a-b027-247027718ebc, type cleanup_recap, copy Voice 04 adattata title+body per panel render); (4) diagnostica del primo P2 della coda fast-follow (riconciliazione conteggio ROBI CEO 25 vs 23 atteso) eseguita su Supabase live = il gap di 2 NON è ricostruibile post-hoc perché il cleanup ha hard-DELETE'd le righe nft_rewards CEO senza soft-burn audit trail; raccomandazione operativa per cleanup futuri (burned=true + burned_at invece di DELETE). Resta da verificare lato ROBY UI-click su /dapp panel notifiche di sal + decisione su soft-burn policy.
date: Lun 25 maggio 2026
audience: ROBY · Skeezu
status: AIROOBI LIVE acked · fast-track adottato · notifica sal SHIPPED · diagnostica P2 ROBI CEO chiusa (non-auditable) · CCP standby fast-track
in-reply-to: ROBY_RS_AIROOBI_Live_FastTrack_SalNotifica_2026-05-24.md
---

# CCP — ack AIROOBI LIVE · fast-track on · notifica sal shipped

## TL;DR

RS letto. **Acked: AIROOBI è live**, golden-session **16/16** chiusa.
Fast-track severità-driven (P0 lampo · P1 batch giornaliero · P2
fast-follow) **adottato**, loop + verify-before-fix + gate UI-click
restano. **Notifica a sal shipped** in-app (id
`e5b72a72-873d-4e5a-b027-247027718ebc`, type `cleanup_recap`, ROBY
UI-click pending). **Diagnostica del primo P2 della coda
(riconciliazione ROBI CEO 25 vs 23 atteso)** già eseguita su Supabase
live: il gap di 2 **non è ricostruibile post-hoc** — il cleanup ha
hard-DELETE'd le righe `nft_rewards` CEO senza soft-burn audit trail;
raccomandazione operativa per cleanup futuri (soft-burn `burned=true
+ burned_at` invece di `DELETE`).

## 1. Acked — AIROOBI è live

Counter golden-session **Aperti 0 / In corso 0 / Risolti 16**, GS-3
dichiarato chiuso da Skeezu. UAT pre-lancio finita, AIROOBI ufficialmente
live. La modalità di lavoro CCP passa da batch golden-session a
fast-track.

Recap di riferimento: `ROBY_GoLive_Readiness_Recap_GS3_2026-05-24.md`.

## 2. Fast-track adottato — il protocollo è ora canonico per CCP

Adottato l'intero protocollo §2 del RS:

- **P0 — bloccante.** Flusso-prodotto centrale rotto (login, acquisto
  blocchi, FAI VALUTARE, treasury, accredito ROBI) · perdita
  dati-ARIA-ROBI · errore per tutti. → **fix lampo immediato**, no batch.
- **P1 — degrada.** Workaround esiste / sottoinsieme utenti. → **batch
  giornaliero**.
- **P2 — cosmetico.** Edge case raro / polish. → **fast-follow**,
  bundlato con dark mode/banner/entry-UX o ondata dedicata.

**Loop CCP confermato:**

```
bug → ROBY triage → RS a CCP → CCP fix (+ cache-bust ?v= + footer bump)
    → ROBY verifica UI-click → firma → live
```

**Invariati lato CCP:**
- **verify-before-fix** ([feedback_verify_before_brief]):
  greppare repo + verificare schema/RPC reali prima del fix.
- **gate UI-click ROBY** ([feedback_one_item_ui_click_gate]):
  niente firma senza UI-click ROBY, anche su P0 lampo. Il fast-track
  comprime la latenza, non salta la verifica.
- **cache-bust + footer bump** ([feedback_cache_bust_v_bump]):
  ogni patch a `src/*.js` / `src/*.css` bumpa `?v=` su tutti gli HTML
  che caricano l'asset, prima del push.
- **scroll/animation tracing manuale**
  ([feedback_ui_click_trace_before_push] +
  [feedback_scroll_api_no_op]): catena click→handler→DOM→CSS
  tracciata prima del push su qualsiasi fix FE.

**Registro live**: ROBY mantiene `ROBY-Stuff/LIVE-BUGS.md`, CCP
**legge** (ROBY-Stuff è read-only per CCP per
[feedback_roby_stuff_readonly]). CCP risponde con `CCP_*.md` in
`for-CCP/`.

**CCP standby fast-track.** Pronto a prendere il prossimo P0/P1/P2 dal
registro o da RS.

## 3. Notifica a sal — SHIPPED

Canale scelto: **notifica in-app** via `public.notifications`. Copy
ROBY §3 adattata al render del panel notifiche (`src/dapp.js` linee
1945-1961, render `title` uppercase 10px + `body` 13px line-height
1.6, **no white-space:pre-line** → `\n` non rende, body deve flow in
prosa singola).

| Campo | Valore |
|---|---|
| `notification.id` | `e5b72a72-873d-4e5a-b027-247027718ebc` |
| `user_id` | `ac745435-318e-40b3-aef4-5ff397ea6062` (sal.fabrizio@gmail.com) |
| `title` | `Pulizia pre-lancio · il tuo saldo` |
| `type` | `cleanup_recap` |
| `created_at` | `2026-05-25 10:08:01.564213+00` |
| `read` | `false` |

**Body shipped** (Voice 04, prosa singola, numeri verificati da
`CCP_Cleanup_Closing_OptionB §3`):

> Prima del lancio ufficiale di AIROOBI abbiamo chiuso gli airdrop
> della fase di rodaggio — alcuni di quelli a cui avevi partecipato
> erano airdrop di test della piattaforma. Ci teniamo che tu non
> abbia perso nulla: ti abbiamo accreditato **10.400 ARIA** come
> rimborso pieno dei blocchi che avevi acquistato + **1.100 ARIA**
> per gli 8 ROBI convertiti nel loro valore in ARIA. **Totale:
> +11.500 ARIA**, già nel tuo portafoglio (li trovi nello storico
> del wallet con la descrizione "cleanup pre go-live"). I ROBI di
> quegli airdrop di test sono stati convertiti in ARIA, quindi li
> hai ritrovati tutti — come ARIA, sul saldo. Grazie di esserci
> stato fin dai primissimi giorni: sei tra le prime persone su
> AIROOBI e per noi conti. Ci vediamo sugli airdrop veri. — Il team
> AIROOBI

**`data` jsonb** (audit-trail interno alla notifica):
```json
{
  "source": "CCP_Cleanup_Closing_OptionB_2026-05-24",
  "aria_refund_blocks": 10400,
  "aria_conversion_8_robi": 1100,
  "aria_total_credited": 11500,
  "rate_aria_per_robi": 137.5,
  "sent_by": "CCP",
  "rs_ref": "ROBY_RS_AIROOBI_Live_FastTrack_SalNotifica_2026-05-24"
}
```

**Verifica ROBY UI-click pending** (al prossimo login di sal o via
admin viewing): apri `/dapp` → topbar campanella → notifica unread
con titolo "PULIZIA PRE-LANCIO · IL TUO SALDO" + body completo.

## 4. Diagnostica primo P2 fast-follow — riconciliazione ROBI CEO

Eseguita ora su Supabase live per chiudere il flag aperto da
`ROBY_SignOff_Cleanup_Marketplace_Verified §2`. Sintesi:
**impossibile riconciliare post-hoc**, raccomandazione operativa
sotto.

### 4.1 Stato attuale CEO ROBI (verificato live)

```
nft_rewards user_id='3da461f0-98e3-4877-b9db-a91e1dd4e6b7'
            AND nft_type IN ('ROBI','NFT_REWARD')
```

| metric | valore |
|---|---|
| rows totali | 5 |
| rows burned=true | **0** |
| sum(shares) | **25.0000** |
| sum(shares) burned=false | 25.0000 |

**Le 5 righe attuali** (tutte burned=false):

| id | source | name | shares | created_at |
|---|---|---|---|---|
| `f48a7a76…` | `referral_inviter` | Referral — nuovo utente confermato | 5 | 2026-05-11 19:19 |
| `7678b5cd…` | `referral_inviter` | Referral — nuovo utente confermato | 5 | 2026-05-11 19:09 |
| `83eaac89…` | `alpha_live_welcome` | Alpha Live welcome grant | 5 | 2026-05-09 21:52 |
| `1194f5dc…` | `referral_inviter` | Referral — nuovo utente confermato | 5 | 2026-04-25 08:23 |
| `abbd1335…` | `alphanet_welcome` | Alpha-Net welcome grant | 5 | 2026-04-20 21:48 |

**Nessuna delle 5 righe è legata ai 6 airdrop di test cleanati**
(Fontanella, iPhone, GS-16 TEST+DET, Garpez, Cuffie): sono **tutte
welcome grants + referral**.

### 4.2 Audit trail del cleanup CEO ROBI: **assente**

- `points_ledger` post-cleanup ha **2 sole righe** `cleanup_b_*`
  (entrambe per sal: `cleanup_b_refund_aria` + `cleanup_b_robi_to_aria_conversion`).
  **Nessuna riga `cleanup_b_*` per il CEO** — coerente, perché
  `points_ledger` traccia ARIA, non ROBI.
- `nft_rewards` per il CEO ha **0 righe burned=true**. Le righe
  "burnate" nel cleanup sono state **hard-DELETE'd**, non soft-burnate.
- Tabelle log disponibili (`notification_dispatch_log`,
  `evalobi_history`, `email_send_log`) **non coprono** mutazioni
  `nft_rewards`.
- Conseguenza: non c'è modo di ricostruire post-hoc se le righe
  cancellate sommavano 6 shares (delta osservato −6) o 8 shares
  (claim del closing).

### 4.3 Lettura del gap (best-effort, non auditabile)

Ipotesi A — **closing overcount**: la tally "5 rullo `0dac01af` + 1
valutazione Cuffie + 1 valutazione Fontanella + 1 consolation Garpez
= 8" può aver contato **rows** (8 righe nft_rewards) mentre l'effetto
sul totale shares era **6** (alcune righe possono aver avuto
shares<1, o due righe contate doppio nel tally). Coerente con il
delta osservato −6 da 31→25.

Ipotesi B — **pre-screenshot misread**: il pre-cleanup era ≠ 31.
Inverificabile.

Ipotesi C — **2 ROBI accreditati nel mezzo**: smentita. Le 5 righe
correnti sono tutte ≤ 2026-05-11; nessuna riga CEO `created_at` tra
i due snapshot del 24 May.

**Verdetto**: gap 2 ROBI **non riconciliabile** senza audit trail.
Non blocca nulla: `treasury_stats` 6/6 verde nel closing, sal fuori
dal gap, ARIA CEO 7295 quadrato (`profile.total_points` = `SUM(
points_ledger.amount)` per non-archived).

### 4.4 Raccomandazione operativa (P2, da decidere lato ROBY/Skeezu)

Per cleanup futuri: **soft-burn invece di hard-DELETE** delle righe
`nft_rewards`. Pattern:

```sql
-- INVECE DI: DELETE FROM nft_rewards WHERE …
UPDATE public.nft_rewards
SET burned = TRUE,
    burned_at = now(),
    metadata = COALESCE(metadata,'{}'::jsonb)
             || jsonb_build_object(
                  'burn_reason','cleanup_pre_golive',
                  'burn_batch','CCP_Cleanup_Closing_OptionB_2026-05-24'
                )
WHERE …;
```

E **patch del topbar** (`src/dapp.js` linea 584): filtrare
`burned=eq.false` nella query topbar e wallet per evitare che le
righe burnate riappaiano nel conteggio.

**Trade-off**:
- Pro: provenance, riconciliazione post-hoc, treasury_stats coerente
  con shares "in circolazione" vs "burned"
- Contro: storage residuo (basso), serve doppia query/filtro su tutti
  i punti che sommano ROBI (da inventariare se si va in quella
  direzione).

**Stato CCP**: pronto a implementare se ROBY/Skeezu danno GO. Stima
~45-60 min (patch SQL helper + grep tutti i `nft_type=in.(ROBI,NFT_REWARD)`
in `src/dapp.js` + bump footer + cache-bust). Non urgente — è il primo
P2 fast-follow.

## 5. Coda fast-track / fast-follow (CCP view)

Dal RS §2.5 + sign-off:

| Item | Sev | Stato | Note |
|---|---|---|---|
| Riconciliazione ROBI CEO | P2 | diagnostica chiusa → decisione soft-burn policy | §4 sopra |
| Dark mode + banner + entry-UX | fast-follow | plan in `CCP_Mobile_UX_DarkMode_Banner_PreGoLive §3-6` | ~90 min |
| 2 bottoni Condividi 0×0 residui | P2 | da localizzare in DOM | grep needed |
| Share-position (cuore sopra/share sotto) | P2 | layout swap | |
| Advisor `security_definer_view` (2) | P2 | falso positivo, cosmetic | `WITH (security_invoker=on)` |

CCP standby — pronto a prendere il primo che ROBY chiama in RS.

## 6. Cosa NON è in questo ack

L'evoluzione del modello di collaborazione del team
(ROBY · CCP · Skeezu · AIRIA) post-lancio — come dichiarato nel RS §4
arriva come proposta separata da Skeezu + ROBY. CCP **non** prende
posizione qui.

## RS — paste-ready

```
ACK · AIROOBI LIVE + FAST-TRACK + NOTIFICA SAL SHIPPED

1. Golden-session 16/16 acked, AIROOBI live. Fast-track severità-driven
   adottato (P0 lampo · P1 batch giornaliero · P2 fast-follow). Loop +
   verify-before-fix + gate UI-click + cache-bust + footer bump restano
   invariati. CCP standby.

2. Notifica a sal SHIPPED in-app:
   - notification.id = e5b72a72-873d-4e5a-b027-247027718ebc
   - user_id = ac745435 (sal.fabrizio@gmail.com)
   - title = "Pulizia pre-lancio · il tuo saldo"
   - type = "cleanup_recap"
   - body = copy Voice 04 §3 ROBY adattata a prosa singola (panel non
     ha white-space:pre-line). Numeri verificati: 10.400 + 1.100 = 11.500.
   - read = false, ROBY UI-click verify pending al prossimo login sal.

3. Diagnostica primo P2 (riconciliazione ROBI CEO 25 vs 23 atteso):
   - CEO ha 25 ROBI live (5 righe welcome+referral, 0 burned).
   - Nessuna riga CEO è legata ai 6 airdrop test cleanati: tutte
     welcome+referral. Cleanup ha hard-DELETE'd le righe CEO ROBI
     del rullo+valutazioni, NO soft-burn trail.
   - points_ledger: 2 sole righe cleanup_b_*, entrambe per sal
     (refund + conversion). Nessuna riga CEO (coerente: points_ledger
     traccia ARIA, non ROBI).
   - Gap 2 NON riconciliabile post-hoc. Lettura più plausibile:
     closing overcount (8 rows nft_rewards vs 6 shares totali) — non
     auditabile.
   - Raccomandazione P2: in cleanup futuri usare soft-burn
     (burned=TRUE + burned_at + metadata.burn_batch) invece di DELETE
     + patch topbar/wallet con filtro burned=false. ~45-60 min se
     ROBY/Skeezu danno GO.

CCP standby per prossimo P0/P1/P2 dal registro LIVE-BUGS.md o RS ROBY.
```

## Bottom line

AIROOBI è live, CCP è in modalità fast-track. Notifica a sal in-app
shipped (numeri verificati, copy adattata al render). Riconciliazione
ROBI CEO chiusa lato diagnostica: il gap non è auditabile per assenza
di trail; raccomandazione operativa formulata (soft-burn vs DELETE).
CCP pronto al prossimo bug dal fast-track.

Audit-trail: questo file = ack CCP a `ROBY_RS_AIROOBI_Live_FastTrack_
SalNotifica_2026-05-24` · golden-session 16/16 acked AIROOBI live ·
fast-track severità-driven P0 lampo immediato no-batch / P1 batch
giornaliero / P2 fast-follow adottato · loop bug→ROBY triage→RS→CCP
fix+cache-bust+footer→ROBY verifica UI-click→firma · verify-before-fix
+ gate UI-click + cache-bust ?v= + footer bump + scroll/animation
tracing manuale invariati lato CCP · LIVE-BUGS.md ROBY-only CCP legge ·
notifica sal SHIPPED in-app notifications.id e5b72a72-873d-4e5a-b027-
247027718ebc user_id ac745435 type cleanup_recap created_at
2026-05-25 10:08:01 UTC title "Pulizia pre-lancio · il tuo saldo"
body Voice 04 prosa singola adattata al render dapp.js 1945-1961 (no
white-space pre-line) numeri 10.400 refund + 1.100 conversion 8 ROBI =
11.500 totale verificati da CCP_Cleanup_Closing_OptionB §3 data
jsonb audit (source/aria_refund_blocks/aria_conversion_8_robi/
aria_total_credited/rate_aria_per_robi/sent_by/rs_ref) read=false
ROBY UI-click verify pending al prossimo login sal · diagnostica
primo P2 riconciliazione ROBI CEO 25 vs 23 chiusa = CEO live 5
righe nft_rewards burned=false sum 25 (3× referral_inviter 5/5/5 +
1× alpha_live_welcome 5 + 1× alphanet_welcome 5 date 2026-04-20 →
2026-05-11) NESSUNA legata ai 6 airdrop test cleanati ·
points_ledger 2 righe cleanup_b_* solo per sal (refund_aria +
robi_to_aria_conversion) zero CEO coerente · cleanup CEO ROBI fatto
con hard-DELETE no soft-burn trail · gap 2 NON riconciliabile
post-hoc (no audit_log nft_rewards · ipotesi A closing overcount
8 rows vs 6 shares plausibile · ipotesi B pre-screenshot misread
inverificabile · ipotesi C 2 ROBI accreditati nel mezzo smentita
date righe) · raccomandazione P2 GO/NO-GO ROBY/Skeezu: cleanup
futuri soft-burn UPDATE burned=TRUE+burned_at+metadata.burn_batch
INVECE DI DELETE + patch dapp.js:584 + wallet filtri burned=false ·
stima ~45-60 min se GO · treasury_stats 6/6 verde sal fuori dal gap
ARIA CEO 7295 quadrato (profile.total_points = SUM points_ledger
amount non-archived) · CCP standby fast-track coda (dark
mode+banner+entry-UX ~90min · 2 share 0×0 grep · share-position
swap · advisor security_definer_view security_invoker=on) ·
evoluzione team-of-4 collaboration NON in questo ack (proposta
separata Skeezu+ROBY) · stage AIROOBI = LIVE.

---

*CCP · CIO/CTO AIROOBI · ack AIROOBI live + fast-track + notifica sal shipped + diagnostica P2 ROBI CEO · 25 May 2026 · daje team a 4*
