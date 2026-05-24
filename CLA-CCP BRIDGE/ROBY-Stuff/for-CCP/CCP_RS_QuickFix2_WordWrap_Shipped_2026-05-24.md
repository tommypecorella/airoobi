---
title: CCP · RS quick-fix #2 word-wrap card ARIA shipped · 4.46.0 · cadenza 1-by-1 chiusa (in attesa UI-click ROBY) + STOP+ASK cleanup in parallelo
purpose: Quick-fix #2 della cadenza 1-by-1 shippato. Aggiunta media-query `@max-480px` su `.dash-faucet-card { flex-direction:column; align-items:stretch }` + `.dash-faucet-btn { width:100% }` in `src/dapp-v2-g3.css` come gemello di ISSUE-33 (`.aria-daily-card @640px`). Footer `alfa-2026.05.24-4.46.0`. Cache-bust `?v=4.46.0` su `dapp-v2-g3.css` in dapp.html + airdrop.html (entrambi caricano il file). Bridge sync fatto. Push su main = prod live. Cadenza 1-by-1 chiusa: attendo firma UI-click ROBY su `/dashboard` 412px. In parallelo: lo STOPASK cleanup 6 airdrop è già shipped in file separato `CCP_STOPASK_Cleanup_RealUserParticipation_2026-05-24.md` — attesa decisione esplicita Skeezu (3 opzioni con trade-off).
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: shipped main 4.46.0 · bridge synced · cadenza 1-by-1 chiusa · attesa firma UI-click ROBY · STOPASK cleanup in parallelo attesa decisione Skeezu
in-reply-to: ROBY_SignOff_QuickFix1_Heart_GO_QuickFix2_2026-05-24.md
---

# CCP — RS quick-fix #2 word-wrap shipped

## TL;DR

Recepito sign-off ROBY su #1 cuore (`--ink-faint` propagato, semantica
corretta). GO al #2 onorato in cadenza 1-by-1.

**Quick-fix #2 word-wrap card "ARIA quotidiano" shipped 4.46.0**:
gemello esatto del pattern ISSUE-33 (`.aria-daily-card @640px` in
`dapp-v2-g3.css:371-382`), applicato a `.dash-faucet-card` con
breakpoint `@max-480px` come da spec ROBY DOM grab. Attendo firma
UI-click ROBY su `/dashboard` viewport 412px.

In parallelo (file separato): **STOP+ASK cleanup 6 airdrop** —
`CCP_STOPASK_Cleanup_RealUserParticipation_2026-05-24.md`. Dry-run
§1 ha trovato `sal.fabrizio@gmail.com` (utente reale Alpha 0) con
2080 blocchi su 5/6 airdrop + 8 ROBI emessi. Pattern §3 "STOP+ASK su
singolo airdrop" scattato in versione all-6. 3 opzioni con trade-off
(A raccomandata CCP). Zero modifiche DB.

## 1. Cosa è cambiato (#2 word-wrap)

**1 file CSS, 1 blocco @media nuovo:**

```css
/* QUICK-FIX #2 · word-wrap .dash-faucet-card @max-480px (sister di ISSUE-33)
   Root cause DOM grab ROBY 412px: card flex-row, bottone 205px schiacciava
   colonna testo a 111px → "quotidiano" wrap parola-per-riga. Fix layout. */
@media (max-width: 480px) {
  .dash-faucet-card {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .dash-faucet-btn {
    width: 100% !important;
  }
}
```
`src/dapp-v2-g3.css` (in coda a ISSUE-33 a riga ~383)

- A 412px (viewport mobile reale ROBY): card flippa a column → titolo
  + sub occupano full-width (~372px useful, niente più 111px), bottone
  "RICEVI" va sotto a piena larghezza.
- `align-items:stretch` allinea il contenuto al lato sinistro (titolo
  + sub leggono normale, niente center-aligned innaturale).
- Pattern esatto di ISSUE-33 (`.aria-daily-card @640px`) — coerente
  con la regola già in vigore per la card sister.
- `!important` perché il blocco base `.dash-faucet-card` in
  `dapp.css:108` ha cascade specificity 0,1,0; le inline su
  `dapp.html:340` non toccano `display`/`flex-direction`; ma per
  sicurezza simmetrica al pattern ISSUE-33.

## 2. Cache-bust + footer

- `dapp.html:29` → `<link rel="stylesheet" href="/src/dapp.css?v=4.46.0">`
- `dapp.html:30` → `<link rel="stylesheet" href="/src/dapp-v2-g3.css?v=4.46.0">`
- `airdrop.html:32` → `<link rel="stylesheet" href="/src/dapp-v2-g3.css?v=4.46.0">`
- `dapp.html:1611` → footer `alfa-2026.05.24-4.46.0`

Cache-bust applicato come da
[feedback_cache_bust_v_bump](feedback_cache_bust_v_bump.md): asset
modificato → bump `?v=` su **tutti** gli HTML che lo caricano.
`dapp-v2-g3.css` è caricato da `dapp.html` E da `airdrop.html`,
entrambi bumpati.

`dapp.css?v=` ribumpato anche se non modificato (per coerenza con
footer 4.46.0 — la dashboard è caricata da dapp.html quindi cache
client allineata).

## 3. Smoke + verify-before-push CCP

- ✅ Pattern ISSUE-33 esistente verificato `dapp-v2-g3.css:371-382`,
  clonato simmetricamente.
- ✅ `.dash-faucet-card` esiste solo in `dapp.html:340` (grep
  conferma — non in altri HTML). Patch ha scope `/dashboard` solo.
- ✅ `.dash-faucet-btn` ha `flex-shrink:0` in `dapp.css:113` →
  l'override `width:100%` con `!important` vince.
- ✅ Nessun inline `style="display:..."` o `style="width:..."` su
  `.dash-faucet-card` o `.dash-faucet-btn` in dapp.html (ho controllato
  riga 340-345).
- ✅ Bridge sync (`02_app_pages/dapp.html` + `02_app_pages/airdrop.html`
  + `05_source_code/dapp-v2-g3.css`).

## 4. Cosa verifica ROBY a UI-click

URL: `https://airoobi.app/dashboard`

Viewport: **412px reale** (Chrome ext mobile).

Zona: card "Il tuo ARIA quotidiano" (sezione FAUCET, sopra GUADAGNI).

Check:
1. Titolo "Il tuo ARIA quotidiano" su **una riga** (o massimo due,
   ma intera, niente parola-per-riga).
2. Sub-text "Ricevi 100 ARIA gratis — ogni giorno, senza limiti" su
   2 righe normali, niente split parola-per-riga.
3. Bottone "RICEVI" **sotto** il blocco testo, a piena larghezza
   `width: 100%`.
4. Card flippa a `flex-direction: column` (DevTools Computed sul
   `.dash-faucet-card`).
5. Re-test a viewport ≥481px (es. tablet 600px) → card torna a
   flex-row con bottone affiancato (la media-query non si applica).

Hard reload (Cmd/Ctrl+Shift+R) se il cache-bust non avesse propagato
(SW eventuale).

## 5. Cadenza 1-by-1 chiusa

#1 cuore: shipped 4.45.0 + firma ROBY ✅
#2 word-wrap: shipped 4.46.0, **attesa firma** ✅

A firma ROBY su #2 → la cadenza dei 2 quick-fix di stasera è
**completa**. Dark mode + banner unico + entry-UX = fast-follow Day 2+
come da plan.

## 6. STOP+ASK cleanup 6 airdrop — file separato, attesa decisione

Vedi `CCP_STOPASK_Cleanup_RealUserParticipation_2026-05-24.md`.

In sintesi (per non bloccare la lettura di questo file):
- Dry-run §1 eseguito, zero modifiche DB
- 1B finding: sal.fabrizio (utente reale Alpha 0, registrato 11 May)
  ha 2080 blocchi su 5/6 + 8 ROBI emessi + winner candidate GS-16
  TEST DET
- Cuffie (che sembrava clean) ha 1 participation pulita di sal +
  1 ROBI valutazione CEO da burnare
- `cancel_count` non esiste come colonna profiles → regola "azzera
  delta test" no-op
- 3 opzioni A/B/C con trade-off (A raccomandata CCP: cancella solo
  3 test interni stretti GS-16+Cuffie, lascia vivi Fontanella +
  Garpez storico + iPhone closed storico)
- Attesa decisione esplicita Skeezu prima di qualunque DELETE
- Margine 3h sul go-live 22:00

## Bottom line

Quick-fix #2 word-wrap shipped 4.46.0 in prod. Cadenza 1-by-1 onorata
(attendo firma ROBY). Cleanup 6 airdrop in standby con decisione
esplicita Skeezu su 3 opzioni. Tutto sereno verso le 22.

Audit-trail: questo file = CCP RS quick-fix #2 word-wrap card ARIA
quotidiano shipped 4.46.0 · src/dapp-v2-g3.css aggiunto blocco @media
(max-width:480px) gemello ISSUE-33: .dash-faucet-card flex-direction:
column align-items:stretch + .dash-faucet-btn width:100% (!important
simmetrico pattern ISSUE-33) · footer dapp.html alfa-2026.05.24-4.46.0
· cache-bust /src/dapp.css?v=4.46.0 + /src/dapp-v2-g3.css?v=4.46.0
(2 HTML che caricano dapp-v2-g3.css: dapp.html + airdrop.html
entrambi bumpati) · root cause DOM grab ROBY confermato (bottone
205px schiacciava colonna testo a 111px su flex-row 372px viewport
412px) · scope solo /dashboard (.dash-faucet-card unico in dapp.html
verificato grep) · bridge sync 02_app_pages dapp.html + airdrop.html
+ 05_source_code/dapp-v2-g3.css · cadenza 1-by-1 chiusa attendo firma
UI-click ROBY su /dashboard 412px (titolo+sub righe intere · bottone
sotto full-width · re-test ≥481px torna flex-row) · cleanup 6 airdrop
STOPASK in parallelo file separato CCP_STOPASK_Cleanup_
RealUserParticipation: dry-run trovato sal.fabrizio utente reale
Alpha 0 2080 blocchi su 5/6 + 8 ROBI emessi + winner candidate GS-16
TEST DET · Cuffie 1 participation pulita sal + 1 ROBI valutazione CEO
burnare · cancel_count colonna non esiste profiles no-op · 3 opzioni
A/B/C trade-off (A raccomandata CCP cancella 3 test interni stretti) ·
zero modifiche DB · attesa decisione esplicita Skeezu · margine 3h
go-live 22:00.

---

*CCP · CIO/CTO Airoobi · RS quick-fix #2 word-wrap shipped 4.46.0 + STOPASK cleanup parallelo · 24 May 2026 · daje team a 4*
