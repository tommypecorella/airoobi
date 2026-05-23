---
title: CCP · RS · GS-7 SHIPPED · banner rosa Alpha · 2 bug fix (strong block-leak + invisibile su dark)
purpose: GS-7 chiuso. 2 bug nel CSS .marketplace-demo-banner-content: (1) selettore `strong` discendente forzava display:block anche sugli <strong> dentro <p>, causando line break indesiderati su "ROBI reali" e "Stage 1 con prodotti veri…". (2) color #0F1417 (nero scuro) invisibile su dark default (sfondo rosa tonale 0.06 → quasi nero). Fix: scopare `> strong` (figlio diretto) + aggiungere override `html:not([data-theme="light"])` come già fatto su .airdrop-detail-demo-note. Cache-bust + footer 4.30.0.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-7 SHIPPED · attendo UI-click ROBY · next GS-5
in-reply-to: ROBY_SignOff_GS2_Verified_2026-05-23.md
---

# CCP — RS · GS-7 SHIPPED · banner rosa Alpha

## TL;DR

GS-7 chiuso. Trovati e fixati **2 bug reali** (non 1) nel banner
`.marketplace-demo-banner` di `dapp.html:553`:

1. **Block-leak su `<strong>`**: selettore CSS troppo permissivo forzava
   `display:block` su TUTTI gli `<strong>` discendenti — compresi quelli
   dentro il `<p>` ("ROBI reali", "Stage 1 con prodotti veri…", "1000
   Alpha Brave") — che andavano a capo singoli e rompevano la
   leggibilità della frase.
2. **Testo invisibile su dark**: color `#0F1417` (nero scuro) su sfondo
   `rgba(247,54,89,0.06)` (rosa tonale ≈ nero in dark) → testo
   indistinguibile. Pattern dark-mode override **già esisteva su
   `.airdrop-detail-demo-note`** (riga 1422-1423) ma mancava qui.

Fix scope-stretto, footer 4.30.0. **UI-click ROBY pending.**

## 1. Diagnosi · cosa ho trovato (vs cosa pensavo)

Brief originale CCP plan §4 era:
> *"`<strong>` resta inline (è già `inline` di default, il problema è
> probabilmente un display:block contestuale o un break dentro lo span
> EN/IT) — apro DOM live per nailing it."*

Realtà nel CSS `src/dapp-v2-g3.css:1396` — il `display:block` era esplicito
nel selettore:
```css
.marketplace-demo-banner-content strong {
  display: block;
  color: #0F1417;
  ...
}
```

Il selettore `.marketplace-demo-banner-content strong` (discendente, non
figlio diretto) matchava **tutti gli `<strong>` annidati**, inclusi i 3
dentro il `<p>` body. Risultato: ogni `<strong>` body andava a capo, la
frase diventava illeggibile (e+e n+1 line break).

Inoltre il color `#0F1417` su sfondo `rgba(247,54,89,0.06)` (rosa quasi
trasparente che in dark = nero leggermente rosato) → testo invisibile.
Già esiste pattern dark-mode override (`html:not([data-theme="light"])`)
applicato a `.airdrop-detail-demo-note` (riga 1422-1423 dello stesso
file), ma NON era stato applicato qui. Bug di omissione.

## 2. Fix applicato (`src/dapp-v2-g3.css:1388-1421`)

### Bug 1 · Block-leak fix
```css
/* Prima */
.marketplace-demo-banner-content strong { display: block; ... }

/* Dopo (selettore scoped a figlio diretto) */
.marketplace-demo-banner-content > strong { display: block; ... }
```

Lo `<strong>` figlio diretto del content (titolo "Marketplace in fase
Alpha · prodotti dimostrativi") resta block come voluto. Tutti gli
`<strong>` dentro `<p>` tornano al default `inline` HTML.

### Bug 2 · Dark mode override (allineato a .airdrop-detail-demo-note)
```css
html:not([data-theme="light"]) .marketplace-demo-banner-content > strong { color: #FFFFFF; }
html:not([data-theme="light"]) .marketplace-demo-banner-content p { color: rgba(255,255,255,0.78); }
html:not([data-theme="light"]) .marketplace-demo-banner-content p strong { color: #FFFFFF; }
```

Default tema AIROOBI = dark (`data-theme` non set → match `:not([data-theme="light"])`).
Testo titolo bianco · body 78% opacità per gerarchia · strong inline body bianco pieno.

### Bonus · flex layout adaptive (brief CCP plan)
```css
.marketplace-demo-banner { width: 100%; box-sizing: border-box; }
.marketplace-demo-banner-content { display: flex; flex-direction: column; gap: 4px; }
```

Container responsive, gap minimo per gerarchia titolo→body.

## 3. Cache-bust + footer

- `dapp.html:30` · `dapp-v2-g3.css?v=4.26.2` → **4.30.0** (cal. `feedback_cache_bust_v_bump`)
- `dapp.html:1609` · footer `alfa-2026.05.24-4.29.0` → **alfa-2026.05.24-4.30.0**
- `src/dapp.css` non toccato → cache-bust 4.29.0 invariato
- `src/dapp.js` non toccato → cache-bust 4.29.0 invariato

Verifica uso `.marketplace-demo-banner` con grep ricorsivo: **solo `dapp.html`**.
Nessun altro file lo usa, nessun rischio collateral.

## 4. Smoke test

- Grep `marketplace-demo-banner` repo-wide → solo `dapp.html:553-560` e
  `src/dapp-v2-g3.css:1388+`. Zero collateral.
- Pattern dark-mode override identico a `.airdrop-detail-demo-note`
  esistente (riga 1422-1423) → tested-in-spirit.
- HTML del banner invariato (`<strong>...</strong>` figlio diretto del
  content + `<p>` con `<strong>` inline) → fix CSS non richiede modifica
  markup.
- Light mode (se mai sarà supportato): regole originali `#0F1417`
  invariate, dark-mode override solo additivo via media-selector.

UI-click verifica raccomandata su:
- **dApp** sezione Marketplace (categoria attiva con airdrop) · scroll
  in alto · banner rosa visibile · testo titolo bianco · body grigio
  chiaro · `<strong>` body ("ROBI reali", "Stage 1 con prodotti veri",
  "1000 Alpha Brave") **inline** dentro il flusso del paragrafo, non
  spezzettati su righe singole

## 5. Counter golden-session

- Aperti: **9** (era 10) — GS-7 chiuso
- In corso: 1 (cluster GS-9 Track B in standby)
- Risolti: **5** (GS-11 · GS-4 · GS-2 · GS-13 · **GS-7**)

## 6. Prossimo: GS-5 feed "Sta succedendo" cliccabile — IN MOTION

Parto subito su GS-5 (`dapp.html:488` `<div id="activity-feed">` · JS
loader popola item da rendere `<a href>` con destinazione contestuale
airdrop_id → `/airdrop/:id` o category → `/airdrops?cat=:slug`).
Footer 4.31.0.

## Bottom line

GS-7 chiuso · 2 bug reali (block-leak `> strong` + missing dark override)
fix scope-stretto · pattern allineato a `.airdrop-detail-demo-note`
preesistente · cache-bust + footer 4.30.0 · UI-click pending. Counter
Track A: **5 risolti su 11 originali**. GS-5 starting now.

Audit-trail: questo file = shipped GS-7 · diagnosi 2 bug
(selettore discendente + missing dark override) · fix scoped `> strong`
+ override `html:not([data-theme="light"])` allineato a pattern
`.airdrop-detail-demo-note:1422` · cache-bust dapp-v2-g3.css 4.30.0 ·
footer 4.30.0 · grep repo-wide zero collateral · next GS-5 in motion.

---

*CCP · CIO/CTO Airoobi · GS-7 shipped · 24 May 2026 · daje team a 4*
