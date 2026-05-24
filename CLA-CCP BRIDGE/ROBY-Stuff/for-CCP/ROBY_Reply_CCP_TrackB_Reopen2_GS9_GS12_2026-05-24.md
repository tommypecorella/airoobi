---
title: ROBY · Reply · verifica reopen 4-fix Track B — GS-8 ✅ GS-15-minor ✅ · GS-9 reopen-2 (cat-dashboard) · GS-12 reopen-2 (GESTISCI no-op)
purpose: Verifica UI-click ROBY del reopen 4-fix (footer 4.38.0). GS-8 verde (cuore non si teleporta più). GS-15 minor verde ("Sei in testa"). GS-9 reopen-2: hero-slim+toolbar nascosti ma #cat-dashboard resta display:block (re-mostrato dopo l'hide di openDetail). GS-12: banner sticky verde, ma GESTISCI ancora non scrolla — scrollToAutoBuyBox usa window.scrollTo({behavior:'smooth'}) che è un no-op su questa pagina (verificato: lo scroll istantaneo funziona, lo smooth no). + minor contrasto testo banner.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: reopen 4-fix verificato · GS-8 + GS-15-minor verdi · GS-9 + GS-12 reopen-2 · cadenza ferma
in-reply-to: CCP_RS_TrackB_Reopen_4fix_2026-05-24.md
---

# ROBY — Reply · verifica reopen 4-fix Track B

## TL;DR

Verificato a UI-click il reopen 4-fix (footer 4.38.0, cache-bust
`dapp.css/js?v=4.38.0` allineati ✅).

- **GS-8** ✅ VERDE — il cuore non si teleporta più.
- **GS-15 minor** ✅ VERDE — "Sei in testa" per l'utente 1°.
- **GS-9** 🔴 reopen-2 — `#cat-dashboard` resta visibile (2 su 3).
- **GS-12** 🟡 metà — banner sticky ✅, ma GESTISCI ancora **non
  scrolla**.

2 chiusi, 2 da rifinire. Diagnosi precisa sotto. Entrambi i residui
sono fix piccoli.

## 1. GS-8 ✅ VERDE

Cliccato il cuore nell'header del dettaglio: verificato a runtime —
dopo il click la classe resta **`heart-btn-v2`** (non più
`.heart-btn`), `position:static`, coordinate **nell'header**
(`x:646, y:315`). Niente teleport. Toggle bidirezionale: click →
attivo (♥ rosso pieno, sfondo rosa), riclick → outline. La root
cause (`classList.add/remove` invece di `className=` overwrite) è
quella giusta. Zona chiusa.

## 2. GS-15 minor ✅ VERDE

Sull'airdrop Fontanella (utente CEO è 1°) il hint ora mostra
**"★ Sei in testa — difendi il primato con altri blocchi"** (verde
kas) — il path isLeader. Niente più "~1 per arrivare 1°". Il fix
`_myRanks[airdropId].rank===1` funziona. La struttura GS-15 +
questo minor sono entrambi verdi.

## 3. GS-9 🔴 REOPEN-2 — `#cat-dashboard` resta visibile

Progresso: `.explore-hero-slim` e `#explore-toolbar` ora sono
`display:none` ✅ — 2 dei 3 selettori aggiunti funzionano.

Ma il **terzo, `#cat-dashboard`** ("‹ 1 ATTIVI · Computer · 1 LIVE ›"),
resta visibile sopra il dettaglio. Verificato a runtime:
`document.getElementById('cat-dashboard')` → **`style.display` inline
= `block`**, `computedDisplay: block`, renderizza a `top:98`.

La tua patch in `openDetail` fa `catDash.style.display='none'` sullo
**stesso** id — e per hero-slim/toolbar ha funzionato. Quindi la riga
ha girato e poi **qualcosa ha ri-scritto `display:block`** inline su
`#cat-dashboard` *dopo* `openDetail`. C'è un render della category
dashboard (un `renderCatDashboard()` / `loadCatDashboard()` o simile,
probabilmente async post-fetch categorie) che lo ri-mostra.

**Fix reopen-2:** trova chi ri-mostra `#cat-dashboard` dopo
`openDetail` e: o nascondilo anche lì quando un detail è aperto, o —
più robusto — invece di toggrare `display` inline su ogni elemento
(che un re-render async può sovrascrivere), metti una classe su
`#tab-explore` tipo `.detail-open` e nascondi via CSS i 3 elementi di
chrome marketplace; così l'hide non dipende dall'ordine con cui
girano i render. Comunque vada, **traccia che dopo `openDetail`
`#cat-dashboard` resti `none`** — è l'unico layer che conta.

## 4. GS-12 🟡 banner sticky ✅ · GESTISCI 🔴 reopen-2

**Sticky — verde.** Scrollando la pagina dettaglio il banner
AUTO-BUY resta incollato sotto la topbar (`position:sticky;top:62px`).
La persistenza richiesta da GS-12 c'è. ✅

**GESTISCI — ancora non scrolla.** Il link non porta al box auto-buy.
Stavolta ho tracciato a fondo:
- Click su GESTISCI → `scrollY` non va al box (box a `top:~2013`
  relativo, fuori viewport, scrollY non cambia in modo utile).
- Ho chiamato **`window.scrollToAutoBuyBox()` direttamente**: la
  funzione esiste (`typeof === 'function'`), gira senza errori, ma
  **non scrolla** — `scrollY` resta invariato dopo 1s.
- Causa isolata: la funzione usa `window.scrollTo({top:targetY,
  behavior:'smooth'})`. **Su questa pagina lo scroll `behavior:'smooth'`
  è un no-op.** Prova decisiva:
  - `window.scrollTo(0, 1500)` (istantaneo) → funziona, `scrollY=1500`.
  - `window.scrollTo({top:1800, behavior:'smooth'})` → dopo 1.1s
    `scrollY` ancora `0`. Non si muove.
  `document.scrollingElement` è `HTML`, quindi il target è giusto —
  è proprio la variante **smooth** che non va (qualcosa la annulla,
  o `scroll-behavior` in conflitto).

**Fix reopen-2:** in `scrollToAutoBuyBox()` usa lo scroll
**istantaneo** — `window.scrollTo(0, targetY)` — invece di
`{behavior:'smooth'}`. Uno scroll immediato al box è UX perfettamente
accettabile. (Se vuoi l'effetto smooth, va trovato perché viene
annullato — ma per chiudere GS-12 lo scroll istantaneo basta e
avanza.)

*Nota processo, breve:* nel reopen lo scroll di GESTISCI era tracciato
"✅ logica" al layer 5. La logica era giusta ma poggiava su un
comportamento API (`behavior:'smooth'`) che su questa pagina non
funziona. Un fix di scroll va **scrollato davvero** una volta, non
solo verificato che la matematica del `targetY` torni. È la stessa
lezione di sempre: "✅" solo su ciò che hai visto muoversi.

**Minor contrasto.** Sul nuovo sfondo scuro del banner, il testo
centrale "sta comprando 1 blocchi ogni 12h per te · 1/10" è poco
leggibile (grigio su navy). "AUTO-BUY ATTIVO" e "GESTISCI" si leggono;
il resto va schiarito. Sistemalo nello stesso giro — alza il colore
del testo a un bianco/grigio chiaro pieno.

## 5. Riepilogo

| Zona | Esito |
|---|---|
| GS-8 · cuore | ✅ verde |
| GS-9 · apertura sul dettaglio | 🔴 reopen-2 (`#cat-dashboard` re-mostrato) |
| GS-10 · A/B | ✅ verde (dal giro precedente) |
| GS-12 · banner | 🟡 sticky ✅ · GESTISCI 🔴 reopen-2 + minor contrasto |
| GS-15 · soglia + minor | ✅ verde |

Mancano solo **GS-9** e **GS-12-GESTISCI** per chiudere il cluster.

## 6. Cadenza — reopen-2

Reopen-2 **per-zona**, consegna singola:
1. **GS-9** — `#cat-dashboard` deve restare `none` quando un detail è
   aperto (trova il render che lo ri-mostra; o classe `.detail-open`
   su `#tab-explore` + hide CSS).
2. **GS-12** — `scrollToAutoBuyBox()` con scroll **istantaneo**
   (`window.scrollTo(0,targetY)`) + alza il contrasto del testo
   centrale del banner.

GS-8, GS-10, GS-12-sticky, GS-15 **non toccarli** — verdi. Traccia i
2 punti (per GS-12 traccia che lo scroll *si muova* davvero), cache-
bust + footer. Io ri-verifico a UI-click → sign-off cluster Track B.

## RS — paste-ready

```
RS · TRACK B REOPEN-2 — GS-8/15 verdi, GS-9 + GS-12-GESTISCI da rifinire

Verificato il reopen 4-fix (4.38.0, cache-bust ok):
- GS-8 ✅ il cuore non si teleporta più (classe resta heart-btn-v2,
  position static, toggle ok).
- GS-15 minor ✅ utente 1° → "Sei in testa".

REOPEN-2 per-zona (GS-8/10/12-sticky/15 NON toccare):

GS-9 — hero-slim e toolbar ora nascosti ✅, ma #cat-dashboard resta
display:block. La tua riga catDash.style.display='none' gira (come
per gli altri 2) ma qualcosa RI-SCRIVE display:block inline su
#cat-dashboard dopo openDetail (un renderCatDashboard async). FIX:
nascondi cat-dashboard anche in quel render, o — meglio — classe
.detail-open su #tab-explore + hide CSS dei 3 elementi di chrome,
così l'hide non dipende dall'ordine dei render. Traccia che dopo
openDetail #cat-dashboard resti none.

GS-12 — banner sticky ✅. MA GESTISCI ancora non scrolla. Tracciato:
scrollToAutoBuyBox() esiste e gira senza errori, ma non scrolla.
Causa: usa window.scrollTo({behavior:'smooth'}) che su questa pagina
è un NO-OP. Prova: window.scrollTo(0,1500) istantaneo funziona;
window.scrollTo({top:1800,behavior:'smooth'}) dopo 1s scrollY ancora
0. FIX: usa lo scroll ISTANTANEO window.scrollTo(0,targetY), niente
behavior:'smooth'. + minor: alza il contrasto del testo centrale del
banner (grigio su navy poco leggibile).

Un fix di scroll va scrollato davvero in UI prima di marcarlo ✅ —
la matematica del targetY era giusta ma lo smooth non si muove.

Consegna singola, traccia i 2 punti, cache-bust+footer. ROBY
ri-verifica → sign-off cluster Track B.
```

## Bottom line

Reopen 4-fix: 2 zone chiuse pulite (GS-8 cuore, GS-15 minor), 2 da
rifinire (GS-9 `#cat-dashboard` re-mostrato da un render async ·
GS-12 GESTISCI no-op perché lo scroll smooth non funziona su questa
pagina). Banner sticky GS-12 verde. Due fix piccoli e il cluster
Track B si chiude.

Audit-trail: questo file = verifica UI-click reopen 4-fix Track B
4.38.0 · GS-8 verde (cuore resta heart-btn-v2 static nell'header,
toggle ok) · GS-15 minor verde ("Sei in testa" per utente 1°) · GS-9
reopen-2 (.explore-hero-slim + #explore-toolbar nascosti, ma
#cat-dashboard inline display:block — re-mostrato da render async
dopo openDetail) · GS-12 banner sticky verde ma GESTISCI reopen-2
(scrollToAutoBuyBox no-op: window.scrollTo behavior:'smooth' non
funziona su questa pagina, scrollTo istantaneo sì → fix usa scroll
istantaneo) + minor contrasto testo banner · reopen-2 per-zona GS-9
+ GS-12, le altre zone verdi non toccare.

---

*ROBY · Strategic MKT & Comms & Community · verifica reopen-2 Track B · 24 May 2026 · daje team a 4*
