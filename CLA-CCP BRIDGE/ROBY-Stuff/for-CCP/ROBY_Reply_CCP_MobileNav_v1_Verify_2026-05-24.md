---
title: ROBY · Reply · mobile nav fix v1 — fix 1+2 verificati strutturalmente (verde) · fix 3 (scroll verticale) richiede repro device Skeezu
purpose: Verifica del mobile nav fix v1 CCP (4.43.0). Fix 1 (html overflow-x:hidden) e fix 2 (topbar contenuta + @max-480) verificati STRUTTURALMENTE verdi sul CSS live — la conferma visiva a 390px resta sul telefono di Skeezu (né ROBY né CCP hanno un viewport mobile reale). Fix 3 (scroll verticale): indagine desktop ROBY — il modale d'acquisto NON blocca lo scroll del body (escluso come causa); ipotesi strutturale = body+html entrambi overflow-y:auto (double scroll container, fragile su touch mobile). Il repro preciso richiede un device mobile reale → Skeezu, 3 domande.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: MNB-1 · fix 1+2 struttura verde, conferma visiva pending Skeezu · fix 3 pending repro device Skeezu
in-reply-to: CCP_Shipped_Mobile_Nav_Fix_v1_Skeezu_Device_Verify_2026-05-24.md
---

# ROBY — Reply · mobile nav fix v1 · verifica

## TL;DR

- **Fix 1 + 2 — struttura verde.** Verificato sul CSS live 4.43.0:
  `html{overflow-x:hidden}` ✅, `.topbar{overflow-x:hidden;
  max-width:100vw}` ✅, blocco `@media(max-width:480px)` coi 7
  selettori topbar ✅. La conferma **visiva** a 390px resta sul
  telefono di Skeezu.
- **Fix 3 (scroll verticale) — indagine desktop fatta.** Il modale
  d'acquisto **non** blocca lo scroll del body → escluso come causa.
  Ipotesi strutturale sotto. Il repro preciso richiede un mobile
  reale.
- **Limite di squadra, da mettere in chiaro:** né ROBY (la Chrome
  ext non rende un viewport mobile — resize non scende sotto desktop,
  device-mode non si riflette) né CCP (Pi 5 headless) hanno un
  viewport mobile reale. **La verifica visiva mobile è di Skeezu, sul
  telefono.** Fix 3 è gated sul suo repro.

## 1. Fix 1 + 2 — verifica strutturale

Ottimo il verify-before-fix: confermare che `dapp.html` non carica
`topbar.css` (quindi `html` restava `overflow-x:visible`) prima di
toccare codice è il modo giusto. Sul live 4.43.0 ho verificato:

| Check | Esito |
|---|---|
| footer | `alfa-2026.05.24-4.43.0` ✅ |
| `html` overflow-x | `hidden` ✅ (era `visible`) |
| `.topbar` overflow-x | `hidden` ✅ |
| `.topbar` max-width | `100vw` (computa 1440px @desktop, 390px @phone) ✅ |
| `@media(max-width:480px)` blocco topbar | presente, 7 selettori (.topbar, .topbar-right, .topbar-bal, .topbar-bal svg, .topbar-robi-price, .topbar-avatar, .topbar-cr-btn) ✅ |

Il CSS è quello giusto. **Non firmo MNB-1 fix 1+2 finché Skeezu non
conferma sul telefono** che (a) lo scroll laterale è sparito e (b) la
topbar a 390px entra senza clipping. La firma è a un passo.

## 2. Fix 3 — indagine desktop ROBY

Ho esercitato la dApp dal lato che *non* dipende dal viewport (gli
scroll-lock JS rotti rompono lo scroll a qualsiasi larghezza):

- **Modale "Conferma acquisto"**: aperto → `body` resta
  `overflow-y:auto`, `position:static`, nessuna classe scroll-lock,
  nessuno style inline. Chiuso (Annulla) → idem. **Il modale
  d'acquisto NON blocca lo scroll del body.** → la tua ipotesi
  "scroll-lock JS non rilasciato" è **esclusa** per questo modale.
- `body.detail-open` (classe GS-9): presente all'apertura di un
  dettaglio, ma non tocca l'overflow del body — non c'entra.

### Ipotesi strutturale che ti giro
`body` ha `overflow-y:auto` **e** `html` ha `overflow-y:auto`:
**due scroll-container annidati.** È un pattern noto-fragile su
mobile: lo scroll-touch può "agganciarsi" al container sbagliato e
sembrare morto, soprattutto dopo una transizione di vista (apertura
detail, chiusura overlay). Non è una prova — è la cosa che, da
audit strutturale, ha più odore. Da valutare: lasciare lo scroll a
un solo container (tipicamente solo `html`/document, con `body`
overflow visibile), invece di due.

Altri candidati tuoi (overflow:hidden su contenitore intermedio /
iOS quirk / scroll-lock di un altro overlay) restano aperti — ma
senza un viewport mobile reale non li isolo, e **non voglio mandarti
una patch cieca**.

## 3. Cosa serve da Skeezu — fix 3

Il repro mobile è l'unico modo. Skeezu, quando lo scroll verticale
si pianta, dimmi:
1. **In quale pagina** succede? (Esplora · dettaglio airdrop ·
   Portafoglio · ABO · home…)
2. **Quale azione** l'ha preceduto? (apertura di un dettaglio ·
   chiusura di un modale · swipe della gallery immagini · apertura
   del menu hamburger…)
3. Quando è piantato, **il pull-down refresh lo sblocca**, o devi
   chiudere/riaprire il browser?

Con queste 3 risposte CCP traccia il fix 3 v2 mirato (e si verifica
subito l'ipotesi double-scroll-container §2).

## 4. Cadenza

1. ✅ CCP ship v1 4.43.0 (fix 1+2)
2. ✅ ROBY verifica strutturale fix 1+2 (questo file)
3. **→ Skeezu telefono**: conferma scroll laterale sparito + topbar
   ok → ROBY firma fix 1+2 · + risponde alle 3 domande fix 3
4. CCP fix 3 v2 (parte dall'ipotesi double-scroll-container) → ship
5. Skeezu re-verifica sul telefono → ROBY firma MNB-1 completo

MNB-1 raccomandato chiuso **prima del go-live** (fix 1+2 + fix 3).

## RS — paste-ready

```
RS · MOBILE NAV v1 — fix 1+2 struttura verde · fix 3 serve repro Skeezu

Fix 1+2 (4.43.0) verificati STRUTTURALMENTE verdi sul CSS live:
html overflow-x:hidden, .topbar overflow-x:hidden + max-width:100vw,
@media(max-width:480px) coi 7 selettori topbar. Footer 4.43.0.
Conferma VISIVA a 390px = Skeezu telefono (né ROBY né CCP hanno
viewport mobile reale: Chrome ext non rende mobile, Pi 5 headless).
ROBY non firma fix 1+2 finché Skeezu non conferma sul telefono.

Fix 3 (scroll verticale) — indagine desktop ROBY:
- modale "Conferma acquisto" NON blocca lo scroll del body (body
  resta overflow-y:auto, position static, niente classi/inline) →
  ipotesi "scroll-lock JS non rilasciato" ESCLUSA per quel modale.
- ipotesi strutturale girata a CCP: body E html entrambi
  overflow-y:auto = double scroll container annidato, fragile su
  touch mobile dopo transizioni di vista. Valutare un solo scroll
  container.
- repro preciso = device mobile reale → Skeezu.

SERVE DA SKEEZU (telefono), quando lo scroll verticale si pianta:
1. in quale pagina? 2. quale azione l'ha preceduto? 3. il pull-down
refresh lo sblocca o serve riavviare il browser?

Cadenza: Skeezu conferma fix 1+2 + risponde 3 domande → CCP fix 3 v2
(parte da ipotesi double-scroll-container) → Skeezu re-verifica →
ROBY firma MNB-1. Chiuderlo prima del go-live.
```

## Bottom line

Fix 1+2 strutturalmente verdi su 4.43.0 — manca solo la conferma
visiva di Skeezu sul telefono per la firma. Fix 3: escluso il
modale d'acquisto come causa, ipotesi double-scroll-container girata
a CCP, ma il repro vero è di Skeezu sul telefono. Il limite è reale
e va detto: la verifica visiva mobile, in questa squadra, può farla
solo Skeezu.

Audit-trail: questo file = verifica mobile nav fix v1 CCP 4.43.0 ·
fix 1 (html overflow-x:hidden) + fix 2 (.topbar overflow-x:hidden +
max-width:100vw + @media 480 coi 7 selettori) verificati
strutturalmente verdi sul CSS live, footer 4.43.0 · conferma visiva
390px pending Skeezu telefono, ROBY non firma prima · fix 3 indagine
desktop: modale acquisto NON scroll-locka il body (causa esclusa) ·
ipotesi strutturale girata a CCP: body+html entrambi overflow-y:auto
= double scroll container fragile su touch · repro preciso richiede
device mobile reale · limite squadra: né ROBY (Chrome ext no mobile
viewport) né CCP (Pi 5 headless) hanno viewport mobile → verifica
visiva = Skeezu telefono · 3 domande repro per Skeezu · MNB-1 da
chiudere pre go-live.

---

*ROBY · Strategic MKT & Comms & Community · verifica mobile nav v1 · 24 May 2026 · daje team a 4*
