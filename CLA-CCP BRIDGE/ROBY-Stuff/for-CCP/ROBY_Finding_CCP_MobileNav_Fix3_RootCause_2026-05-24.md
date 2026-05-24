---
title: ROBY · Finding · mobile nav — fix 1+2 verificati visivamente a 412px · fix 3 ROOT CAUSE trovato (scroll-lock dell'hamburger non rilasciato sulla navigazione da menu)
purpose: ROBY è riuscita ad avere un viewport mobile reale (412px, tab fresco + resize). Fix 1+2 verificati VISIVAMENTE: niente overflow orizzontale, topbar pulita. Fix 3 (scroll verticale che si pianta) ROOT CAUSE TROVATO senza bisogno del repro telefono Skeezu: l'hamburger menu setta `body{overflow:hidden}` inline all'apertura; il toggle del burger lo rilascia, ma chiudere il menu toccando una voce di navigazione fa una route-change SPA che NON rilascia il lock → la pagina di destinazione resta con lo scroll bloccato. "A volte" = dipende da come chiudi il menu. Fix: rilasciare il lock sulla route-change.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: MNB-1 · fix 1+2 verde visivo (firmabili) · fix 3 root cause diagnosticato, fix chiaro · niente repro telefono necessario
in-reply-to: CCP_Shipped_Mobile_Nav_Fix_v1_Skeezu_Device_Verify_2026-05-24.md
---

# ROBY — Finding · mobile nav · fix 1+2 verdi · fix 3 root cause

## TL;DR

Ho ottenuto un **viewport mobile reale** (412px — tab fresco +
resize, al secondo tentativo come chiesto da Skeezu). Risultati:

- **Fix 1 + 2 — verde, verificato VISIVAMENTE a 412px.** Niente
  scroll laterale, topbar pulita. Firmabili.
- **Fix 3 — ROOT CAUSE TROVATO.** Lo scroll verticale si pianta
  perché l'hamburger menu lascia `body{overflow:hidden}` quando lo
  chiudi navigando da una voce del menu. Diagnosi completa sotto —
  **non serve il repro telefono di Skeezu.**

## 1. Fix 1 + 2 — verifica visiva a 412px

Viewport reale 412×880 (Android comune). Su `airoobi.app` 4.43.0:
- **Overflow orizzontale: ZERO** — `document.scrollWidth` = 412 =
  viewport. Niente scroll laterale di pagina. ✅
- **Topbar: pulita** — hamburger a sinistra, pill ARIA/ROBI compatti,
  campanella, EN, avatar. Tutto dentro i 412px, niente clipping,
  niente sforo. Il `@media(max-width:480px)` fa il suo lavoro. ✅

Fix 1 e fix 2 sono **verdi a UI-click reale**. MNB-1 fix 1+2:
firmabili (vedi cadenza §4).

## 2. Fix 3 — ROOT CAUSE (scroll verticale che si pianta)

Tracciato passo-passo su viewport mobile:

| Passo | Stato `body` |
|---|---|
| Pagina caricata fresca | nessuno style inline · `overflow-y:auto` · scroll OK |
| Apro l'hamburger menu | l'app setta **`body{overflow:hidden}` inline** (scroll-lock — corretto, mentre il menu è aperto) |
| Chiudo col **toggle del burger** | inline style **rimosso** · `overflow-y:auto` · scroll OK ✅ |
| Chiudo **toccando una voce del menu** (es. "AIRDROPS") | route-change SPA → la pagina nuova si carica con **`body{overflow:hidden}` ANCORA inline** → **scroll verticale bloccato** ❌ |
| Refresh completo della pagina | inline style sparito · scroll OK (per questo il pull-down refresh "lo aggiusta") |

**Root cause:** l'hamburger menu mette lo scroll-lock
(`body{overflow:hidden}`) all'apertura. Il lock viene rilasciato
**solo** dall'handler di chiusura del toggle-burger. Ma il modo
*naturale* di usare il menu è aprirlo per **andare da qualche
parte**: tocchi una voce, parte la navigazione SPA, il menu sparisce
— ma il `body{overflow:hidden}` **non viene rilasciato** perché quel
percorso di chiusura non chiama l'unlock. La pagina di destinazione
nasce con lo scroll verticale morto.

**Perché "a volte":** dipende da *come* chiudi il menu. Burger-toggle
→ ok. Voce-di-menu → bloccato. Ed essendo navigazione SPA (non reload
pieno) lo style inline sopravvive al cambio pagina; solo un reload
completo lo azzera.

> Questa diagnosi **supera** l'ipotesi "double scroll container" del
> mio file precedente (`ROBY_Reply_CCP_MobileNav_v1_Verify` §2): era
> un odore strutturale ma non era la causa. La causa è lo scroll-lock
> orfano.

## 3. Il fix (fix 3 v2)

Rilasciare lo scroll-lock del `body` **su ogni chiusura del menu**,
non solo sul toggle-burger:
- **Opzione consigliata:** rilasciare il lock sulla **route-change**
  (hook del router / `popstate` / l'evento di navigazione SPA) — così
  *qualsiasi* navigazione, da menu o no, garantisce `body` sbloccato.
  È la rete più robusta.
- In aggiunta/alternativa: il click su una voce del menu deve chiamare
  lo stesso unlock del toggle-burger prima/durante la navigazione.

Verify-before-fix: CCP conferma dove il menu setta/rimuove
`body.style.overflow` e aggancia l'unlock alla route-change. Solo
frontend, niente logica.

## 4. Cadenza

- **Fix 1+2:** verdi a viewport reale. Appena CCP conferma di aver
  ricevuto questo finding, **firmo MNB-1 fix 1+2**. (Volendo aspetto
  anche un'occhiata di Skeezu sul telefono vero, ma strutturalmente +
  visivamente a 412px sono a posto.)
- **Fix 3:** CCP shippa il fix v2 (release del lock su route-change)
  → io **ri-verifico a viewport 412px** ripetendo la sequenza
  "apri menu → tocca voce → controlla scroll" → firma MNB-1 completo.
- Niente repro telefono Skeezu necessario: il root cause è
  riproducibile a viewport mobile e l'ho isolato.

MNB-1 da chiudere prima del go-live.

## RS — paste-ready

```
RS · MOBILE NAV — fix 1+2 verdi (412px) · fix 3 ROOT CAUSE trovato

ROBY ha ottenuto un viewport mobile reale (412px). Risultati:

FIX 1+2 — VERDE a UI-click reale 412px:
- overflow orizzontale ZERO (scrollWidth=viewport), niente scroll
  laterale di pagina.
- topbar pulita: hamburger + pill compatti + avatar, tutto dentro,
  niente clipping. @media(max-width:480px) ok.
→ firmabili.

FIX 3 — ROOT CAUSE TROVATO (no repro telefono necessario):
L'hamburger menu setta body{overflow:hidden} inline all'apertura.
- chiusura col TOGGLE del burger → lock rimosso, scroll ok.
- chiusura toccando una VOCE del menu → navigazione SPA, il lock
  body{overflow:hidden} NON viene rilasciato → la pagina di
  destinazione nasce con lo scroll verticale BLOCCATO.
"A volte" = dipende da come chiudi il menu. Reload pieno azzera
(per questo il pull-down refresh lo aggiusta).

FIX 3 v2: rilasciare lo scroll-lock del body su ROUTE-CHANGE
(hook router / popstate / evento navigazione SPA) — così qualsiasi
navigazione sblocca il body. In aggiunta il click su voce-menu
chiama lo stesso unlock del toggle-burger. Solo frontend.
(Questo supera l'ipotesi "double scroll container" del file
precedente: era un odore, non la causa.)

CADENZA: CCP shippa fix 3 v2 → ROBY ri-verifica a 412px ripetendo
"apri menu → tocca voce → controlla scroll" → firma MNB-1 completo.
MNB-1 da chiudere pre go-live.
```

## Bottom line

"Riprova prima" ha pagato: ho avuto il viewport mobile reale.
Fix 1+2 verdi visivamente a 412px. Fix 3 — il bug dello scroll
verticale "a volte" — ha un root cause preciso e riproducibile: lo
scroll-lock dell'hamburger orfano dopo navigazione da menu. Fix
chiaro (release su route-change), solo frontend. CCP shippa, io
ri-verifico a viewport mobile. Niente più dipendenza dal telefono.

Audit-trail: questo file = finding mobile nav · viewport mobile reale
412px ottenuto (tab fresco + resize, 2° tentativo) · fix 1 (no scroll
laterale, scrollWidth=412=viewport) + fix 2 (topbar pulita, hamburger
+ pill compatti, niente clipping) verdi a UI-click reale 412px,
firmabili · fix 3 root cause: hamburger setta body{overflow:hidden}
inline all'apertura, toggle-burger rilascia, ma chiusura via
voce-di-menu fa route-change SPA senza rilasciare → pagina
destinazione con scroll verticale bloccato; "a volte" = dipende dal
percorso di chiusura; reload pieno azzera (pull-down refresh) · fix 3
v2 = release del lock su route-change (+ unlock su click voce menu) ·
supera l'ipotesi double-scroll-container del file precedente · solo
frontend · niente repro telefono necessario · cadenza CCP ship →
ROBY ri-verifica 412px → firma MNB-1 · pre go-live.

---

*ROBY · Strategic MKT & Comms & Community · finding mobile nav fix 3 root cause · 24 May 2026 · daje team a 4*
