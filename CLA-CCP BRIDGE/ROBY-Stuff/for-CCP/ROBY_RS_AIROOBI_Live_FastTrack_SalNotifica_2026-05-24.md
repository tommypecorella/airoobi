---
title: ROBY · RS · AIROOBI è LIVE (GS-3 chiuso, golden-session 16/16) · avvio fast-track bug fixing post-lancio · CCP manda la notifica a sal
purpose: Skeezu ha dichiarato GS-3 chiuso — la UAT CEO è conclusa, AIROOBI è ufficialmente live (24 May 2026). Questo RS comunica a CCP tre cose: (1) golden-session chiusa 16/16, si passa alla fase live; (2) avvio del fast-track per il bug fixing post-lancio — processo severità-driven P0/P1/P2 con cadenza definita, successore della golden-session per la fase live; (3) CCP manda a sal.fabrizio una notifica in-app che gli dice cosa gli è rimasto (rimborso ARIA pieno + ROBI convertiti = +11.500 ARIA) — copy pronta in §3.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: AIROOBI LIVE · golden-session 16/16 chiusa · fast-track bug fixing avviato · CCP manda notifica sal
---

# ROBY — RS · AIROOBI LIVE + fast-track + notifica sal

## TL;DR

**AIROOBI è live.** Skeezu ha dichiarato GS-3 chiuso: la UAT CEO è
conclusa, golden-session **16/16**. Da qui si cambia modalità.

Tre cose in questo RS: (1) golden-session chiusa, fase live; (2)
**avvio del fast-track bug fixing** — il processo post-lancio,
severità-driven, che sostituisce la cadenza golden-session; (3)
**CCP manda a sal la notifica** su cosa gli è rimasto — copy pronta
in §3.

## 1. Golden-session CHIUSA — AIROOBI live

GS-3 dichiarato da Skeezu. Counter finale: **Aperti 0 · In corso 0 ·
Risolti 16.** Tutti gli item funzionali risolti e verificati a
UI-click, smoke test backend verde, marketplace pulito. Recap di
chiusura: `ROBY_GoLive_Readiness_Recap_GS3_2026-05-24.md`.

La golden-session era la UAT pre-lancio: chiusa. Da adesso la
piattaforma ha utenti reali — la modalità di lavoro cambia.

## 2. Fast-track bug fixing — il processo post-lancio

Il successore della golden-session per la fase live. La golden-session
batchava e iterava con calma (giusto: era pre-lancio). Col prodotto
live e utenti reali dentro, sul **P0 conta la velocità**; sul resto
si tiene la cadenza ordinata. Il fast-track è **severità-driven**.

### 2.1 Triage di severità

- **P0 — bloccante.** Blocca un flusso-prodotto centrale (login,
  acquisto blocchi, FAI VALUTARE, treasury, accredito ROBI), oppure
  c'è perdita di dati / di ARIA-ROBI, oppure è un errore che ogni
  utente sbatte. → **fix lampo immediato**, niente batch, niente
  cerimonia. Appena arriva, CCP lo prende.
- **P1 — degrada.** L'esperienza peggiora ma c'è un workaround, o
  tocca un sottoinsieme di utenti/casi. → **batch giornaliero**.
- **P2 — cosmetico.** Estetica, edge case raro, polish. → **backlog
  fast-follow**, bundlato con l'ondata dark mode / banner / entry-UX.

### 2.2 Il loop

```
bug → ROBY triage severità → RS a CCP → CCP fix (+ cache-bust + footer)
    → ROBY verifica UI-click → firma → live
```

Invariati i pattern che hanno funzionato: **verify-before-fix** lato
CCP, **gate UI-click ROBY** prima della firma, audit-trail per ogni
ship. Il fast-track **non salta la verifica** — comprime solo la
latenza sul P0 (niente attesa di batch).

### 2.3 Cadenza

- **P0** → appena arriva, a qualunque ora utile.
- **P1** → un giro al giorno.
- **P2** → settimanale, o dentro la prossima ondata fast-follow.

### 2.4 Intake & registro

I bug arrivano da: utenti reali, Skeezu, ROBY in test continuo. ROBY
tiene il **registro live dei bug** (`ROBY-Stuff/LIVE-BUGS.md` —
successore della golden-session): ogni voce con ID, severità, stato,
chi l'ha segnalato, data. CCP non deve mantenerlo, lo legge.

### 2.5 Già in coda per il fast-track / fast-follow

- **Riconciliazione conteggio ROBI CEO** — P2, gap minore (topbar 25
  vs 23 atteso, vedi `ROBY_SignOff_Cleanup_Marketplace_Verified`).
- **Dark mode + banner una-riga + entry-UX** — ondata fast-follow,
  plan già in `CCP_Mobile_UX_DarkMode_Banner_PreGoLive` §3-6.
- **2 bottoni "Condividi" 0×0 residui** + **share "sotto" il cuore** —
  P2 housekeeping.
- **Advisor `security_definer_view`** (2, falsi positivi) — P2
  cosmetico, `WITH (security_invoker=on)`.

## 3. CCP manda la notifica a sal — copy pronta

Skeezu chiede che **CCP** mandi a `sal.fabrizio@gmail.com` una
notifica in-app che gli dice **cosa gli è rimasto** dopo la cleanup.
sal è già compensato sul saldo; la notifica chiude il cerchio sul
piano umano.

Canale: notifica in-app (meccanismo a scelta CCP — `notifications` o
messaggio diretto). Copy Voice 04 compliant, pronta:

> **Oggetto:** Il tuo saldo dopo la pulizia pre-lancio di AIROOBI
>
> Ciao,
>
> prima del lancio ufficiale di AIROOBI abbiamo chiuso gli airdrop
> della fase di rodaggio — alcuni di quelli a cui avevi partecipato
> erano airdrop di test della piattaforma.
>
> Ci teniamo che tu non abbia perso nulla. Ecco cosa ti abbiamo
> accreditato sul saldo:
>
> • **10.400 ARIA** — rimborso pieno di tutti i blocchi che avevi
>   acquistato
> • **1.100 ARIA** — i tuoi 8 ROBI convertiti nel loro valore in ARIA
>
> **Totale: +11.500 ARIA**, già nel tuo portafoglio. Li trovi nello
> storico del wallet con la descrizione "cleanup pre go-live". I ROBI
> di quegli airdrop di test sono stati convertiti in ARIA, quindi li
> hai ritrovati tutti — come ARIA, sul saldo.
>
> Grazie di esserci stato fin dai primissimi giorni: sei tra le prime
> persone su AIROOBI e per noi conti. Ci vediamo sugli airdrop veri.
>
> — Il team AIROOBI

Se CCP preferisce, può adattare la forma al formato tecnico del
sistema notifiche (titolo breve + corpo) mantenendo i numeri e il
tono. I numeri (10.400 + 1.100 = 11.500) vengono dal
`CCP_Cleanup_Closing_OptionB §3`.

## RS — paste-ready

```
RS · AIROOBI LIVE + FAST-TRACK BUG FIXING + NOTIFICA SAL

1. AIROOBI È LIVE. Skeezu ha dichiarato GS-3 chiuso, golden-session
   16/16 (Aperti 0 / In corso 0 / Risolti 16). UAT pre-lancio finita.

2. AVVIO FAST-TRACK BUG FIXING (post-lancio, severità-driven):
   - P0 bloccante (flusso centrale rotto / perdita dati-ARIA-ROBI /
     errore per tutti) → fix lampo IMMEDIATO, no batch.
   - P1 degrada (workaround esiste / sottoinsieme) → batch giornaliero.
   - P2 cosmetico → backlog fast-follow (con dark mode/banner/entry-UX).
   Loop invariato: bug → ROBY triage → RS → CCP fix+cache-bust+footer
   → ROBY verifica UI-click → firma. Verify-before-fix e gate UI-click
   RESTANO — il fast-track comprime la latenza P0, non salta la
   verifica. ROBY tiene il registro live ROBY-Stuff/LIVE-BUGS.md.
   In coda: riconciliazione ROBI CEO (P2) · dark mode+banner+entry-UX
   (fast-follow) · 2 share 0x0 + share-position (P2) · advisor
   security_definer_view (P2).

3. CCP MANDA LA NOTIFICA A sal.fabrizio@gmail.com (notifica in-app,
   meccanismo a scelta CCP). Copy pronta in ROBY_RS_AIROOBI_Live_
   FastTrack_SalNotifica §3 — gli dice cosa gli è rimasto: +10.400
   ARIA rimborso blocchi + 1.100 ARIA conversione 8 ROBI = +11.500
   ARIA sul saldo. Voice 04 compliant. Numeri da CCP_Cleanup_Closing
   §3.
```

## 4. Cosa NON è in questo RS

L'evoluzione del modello di collaborazione del team (ROBY · CCP ·
Skeezu · AIRIA) post-lancio è un tema che Skeezu e ROBY stanno
definendo separatamente — arriverà a CCP come proposta dedicata, non
si decide in questo RS.

## Bottom line

AIROOBI è live, golden-session chiusa 16/16. Si passa al fast-track:
P0 lampo, P1 giornaliero, P2 fast-follow, verifica UI-click sempre.
CCP manda a sal la notifica su cosa gli è rimasto (+11.500 ARIA, copy
pronta). L'evoluzione della collaborazione arriva separata.

Audit-trail: questo file = RS ROBY · AIROOBI LIVE GS-3 dichiarato
chiuso da Skeezu golden-session 16/16 (Aperti 0/In corso 0/Risolti
16) · avvio fast-track bug fixing post-lancio severità-driven (P0
bloccante fix lampo immediato no-batch · P1 degrada batch giornaliero
· P2 cosmetico backlog fast-follow) · loop bug→ROBY triage→RS→CCP fix
cache-bust+footer→ROBY verifica UI-click→firma · verify-before-fix +
gate UI-click invariati · ROBY tiene registro live ROBY-Stuff/
LIVE-BUGS.md · coda fast-track/fast-follow (riconciliazione ROBI CEO
P2 · dark mode+banner+entry-UX · 2 share 0x0 + share-position P2 ·
advisor security_definer_view P2) · CCP manda notifica in-app a
sal.fabrizio cosa gli è rimasto (+10.400 ARIA rimborso blocchi +
1.100 ARIA conversione 8 ROBI = +11.500 ARIA, copy Voice 04 pronta
§3, numeri da CCP_Cleanup_Closing §3) · evoluzione collaborazione
team = proposta separata Skeezu+ROBY non in questo RS.

---

*ROBY · Strategic MKT & Comms & Community · RS AIROOBI live + fast-track + notifica sal · 24 May 2026 · daje team a 4*
