---
title: ROBY · SignOff · MNB-1 navigazione mobile COMPLETO — 3 fix verdi a viewport reale 412px
purpose: Firma MNB-1 (Mobile Nav Bug). Verifica UI-click a viewport mobile reale 412px su airoobi.app 4.44.0. Fix 1 (no scroll laterale) + fix 2 (topbar contenuta) verdi. Fix 3 v2 (scroll-lock hamburger) verificato sulla sequenza esatta del root cause: menu aperto → body locked → chiusura da voce-menu → lock rilasciato, scroll ok; + browser back (popstate) → lock rilasciato, menu chiuso, scroll ok. Tutti e 3 i fix verdi. MNB-1 chiuso. I bug di navigazione mobile non sono più un blocker go-live.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: MNB-1 FIRMATO · 3/3 fix verdi a 412px · navigazione mobile non più blocker go-live
in-reply-to: CCP_Shipped_MobileNav_Fix3_v2_LockReleaseOnNav_2026-05-24.md
---

# ROBY — SignOff · MNB-1 navigazione mobile COMPLETO

## TL;DR

**MNB-1 è chiuso.** Verifica UI-click a viewport mobile reale 412px
su `airoobi.app` 4.44.0: tutti e 3 i fix verdi. Lo scroll laterale è
sparito, la topbar è contenuta, e lo scroll verticale non si pianta
più — il lock orfano dell'hamburger ora viene rilasciato su ogni
navigazione. I bug di navigazione mobile **non sono più un blocker
go-live.**

## 1. Fix 1 — scroll laterale · VERDE

Viewport reale 412px: `document.scrollWidth` = 412 = viewport →
overflow orizzontale **zero**, la pagina non scrolla di lato. ✅

## 2. Fix 2 — topbar contenuta · VERDE

A 412px la topbar è pulita: hamburger, pill ARIA/ROBI compatti,
campanella, EN, avatar — tutto dentro il viewport, niente clipping,
niente sforo. Il `@media(max-width:480px)` opera. ✅

## 3. Fix 3 v2 — scroll-lock hamburger · VERDE

Verificato sulla **sequenza esatta del root cause**, a 412px:

| Passo | Esito |
|---|---|
| Pagina caricata | body senza inline style, `overflow-y:auto` ✅ |
| Apro l'hamburger | body `overflow:hidden` (lock applicato — corretto, menu aperto) ✅ |
| Chiudo **toccando una voce** ("AIRDROPS") → nav SPA | body inline **rimosso**, `overflow-y:auto`, **scroll funziona** ✅ |
| Apro il menu + **browser back (popstate)** | body inline **rimosso**, `overflow-y:auto`, scroll funziona, **menu chiuso** ✅ |

Entrambi i percorsi che prima lasciavano il lock orfano —
click-voce-menu e browser back/forward — ora rilasciano lo
scroll-lock. Lo scroll verticale non si pianta più. ✅

## 4. Nota — CCP ha lavorato bene

Verify-before-fix: CCP ha confermato la diagnosi ROBY nel codice
(`navigateTo()` rimuoveva `active` dal menu ma non resettava
`body.style.overflow`; stesso buco nel `popstate`). Fix chirurgico —
4 righe, `body.style.overflow=''` su `navigateTo` + `popstate`,
scope minimo, nessun helper centralizzato che avrebbe rischiato di
toccare le pagine multi-page non-SPA. Pulito.

## 5. Stato MNB-1 e go-live

- **MNB-1: CHIUSO.** 3/3 fix verdi a viewport reale.
- I bug di navigazione mobile (scroll laterale + scroll verticale che
  si pianta) **non sono più un blocker per il go-live.**
- Footer prod `alfa-2026.05.24-4.44.0`.
- Resta in piedi, **separata**, l'iniziativa post go-live: il
  **redesign mobile-first completo** della dApp (navigazione,
  partecipazione airdrop, wallet) — pattern audit → mockup HTML →
  review Skeezu → RS a CCP. Quella parte quando dai il via.

## 6. Counter

- **MNB-1** (Mobile Nav Bug, item UAT separato dai golden numerati):
  ✅ CHIUSO — fix 1+2+3 firmati.
- **Golden-session**: invariata, **14/16** — resta GS-15 reopen
  (soglia contraddittoria, pending fix CCP + ri-verifica ROBY) e GS-3
  (chiusura UAT → go-live).

## RS — paste-ready

```
RS · MNB-1 NAVIGAZIONE MOBILE FIRMATO — 3/3 fix verdi

Verifica UI-click a viewport mobile reale 412px su airoobi.app 4.44.0:
- Fix 1 (scroll laterale): scrollWidth=412=viewport, zero overflow
  orizzontale. VERDE.
- Fix 2 (topbar): a 412px tutto contenuto, hamburger + pill compatti,
  niente clipping. VERDE.
- Fix 3 v2 (scroll-lock hamburger): sequenza root cause verificata —
  menu aperto → body overflow:hidden → chiusura da voce-menu (nav
  SPA) → body rilasciato, scroll OK · + browser back (popstate) →
  body rilasciato, menu chiuso, scroll OK. VERDE.

MNB-1 CHIUSO, 3/3 fix firmati. I bug di navigazione mobile non sono
più un blocker go-live. Footer 4.44.0.

Resta separata l'iniziativa post go-live: redesign mobile-first
completo della dApp (quando Skeezu dà il via).

Golden-session invariata 14/16 (GS-15 reopen + GS-3 meta).
```

## Bottom line

MNB-1 chiuso — la navigazione mobile della dApp è a posto: niente più
scroll laterale, topbar contenuta, scroll verticale che non si pianta
più. Verificato a viewport mobile reale, non solo strutturale. Il
redesign mobile-first completo resta un'iniziativa a parte per dopo
il lancio. Lato golden-session il quadro non cambia: 14/16, mancano
GS-15 reopen e GS-3.

Audit-trail: questo file = sign-off MNB-1 · verifica UI-click
viewport mobile reale 412px airoobi.app 4.44.0 · fix 1 scroll
laterale verde (scrollWidth=412=viewport) · fix 2 topbar contenuta
verde (412px, hamburger+pill compatti, no clipping) · fix 3 v2
scroll-lock hamburger verde su entrambi i percorsi (chiusura da
voce-menu nav SPA + browser back popstate → body.style.overflow
rilasciato, scroll funziona, menu chiuso) · CCP verify-before-fix +
fix chirurgico 4 righe scope minimo · MNB-1 chiuso 3/3, non più
blocker go-live · iniziativa redesign mobile-first completo resta
separata post go-live · golden-session invariata 14/16 (GS-15 reopen
+ GS-3 meta).

---

*ROBY · Strategic MKT & Comms & Community · MNB-1 firmato · 24 May 2026 · daje team a 4*
