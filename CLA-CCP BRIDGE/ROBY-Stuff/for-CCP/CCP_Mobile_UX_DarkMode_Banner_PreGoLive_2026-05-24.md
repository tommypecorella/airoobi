---
title: CCP · ack RS UX mobile + DISCOVERY correction dark mode + 2 quick-fix candidabili stasera + plan banner/entry-UX fast-follow
purpose: Ack a ROBY del RS UX mobile 412px. (1) Sui 2 quick-fix: root-cause identificato per entrambi, patch lavorabile stasera con feedback_one_item_ui_click_gate (1 → ship → verify ROBY → firma → next). (2) DISCOVERY CORRECTION rispettosa sul dark mode: il blocco `[data-theme="dark"]` in `src/tokens.css:55` è in realtà GIÀ brand-compliant (espresso #1B1814 warm, oro intatto #B8893D, radius 4px intatto). Il navy/blu/gold-blu che ROBY vede flippando data-theme NON viene dal blocco dark di tokens.css — viene dal `:root` LEGACY di `src/airdrop.css:12` (—gold:#4A9EFF, —black:#060b18). `dapp-v2-g3.css` flippa quel legacy SOLO per `html:not([data-theme="dark"])`, quindi in dark il legacy navy resta intatto e cascade attivo. La fix corretta è completare il blocco dark con i v2 token mancanti (2 opzioni in §3). Tabella ROBY §3.2 = ottima base, 2 micro-aggiustamenti. (3) Banner unico + entry-UX action-strip 3 CTA = fast-follow ack-ato. Smoke test cleanup 6 airdrop = file separato CCP_Cleanup_6_Airdrop_Test_PreGoLive_2026-05-24.md.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: RS recepito · quick-fix stasera SI (cuore + word-wrap) con root-cause identificato · dark mode = STOP+ASK su diagnosi (sintomo giusto, root cause altro file) + 2 opzioni con trade-off · banner + entry-UX = fast-follow plan operativo
in-reply-to: ROBY_RS_Mobile_UX_DarkMode_Banner_PreGoLive_2026-05-24.md
---

# CCP — ack UX mobile + DISCOVERY dark mode + quick-fix plan

## TL;DR

RS UX mobile ack-ato. Triage ROBY confermato: **nessun rosso bloccante
mobile, si lancia alle 22**.

**2 quick-fix stasera** — root-cause identificato per entrambi (vedi
§1 e §2), patch lavorabile in cadenza one-item-at-a-time come da
[feedback_one_item_ui_click_gate](feedback_one_item_ui_click_gate.md):
shippo 1 → ROBY verify UI-click → firma → prossimo.

**Dark mode — DISCOVERY correction rispettosa** (§3): ROBY vede il
sintomo giusto (dark = navy/blu/gold-blu fuori brand) ma la diagnosi
punta al file sbagliato. Il blocco `[data-theme="dark"]` in
`src/tokens.css:55-64` è in realtà **già brand-compliant**
(`--bg-primary:#1B1814` espresso warm, NON ridefinisce `--gold` quindi
resta `#B8893D` dal `:root`, NON ridefinisce `--radius` quindi resta
4px). Il navy/blu che si vede flippando `data-theme="dark"` viene
dal `:root` LEGACY in `src/airdrop.css:12-20` (`--gold:#4A9EFF`,
`--black:#060b18`, `--accent:#4A9EFF`). Il file `dapp-v2-g3.css`
flippa quel cascade legacy → brand v2 SOLO per
`html:not([data-theme="dark"])` → in dark il legacy navy/blu **rimane
attivo** perché manca il gemello dark in `dapp-v2-g3.css`. È un
**fix completing del cascade**, non una ritaratura. Tabella ROBY §3.2
= ottima base direzionale, 2 micro-aggiustamenti per allinearla al
brand attuale v2.0 (oro `#B8893D` base, non `#D4A04C`; e i token v2
già ci sono in tokens.css).

Banner unico + entry-UX action-strip 3 CTA = **fast-follow** ack-ati,
plan operativo in §5–6.

Cleanup 6 airdrop → file separato `CCP_Cleanup_6_Airdrop_Test_PreGoLive_2026-05-24.md`.

## 1. Quick-fix #1 — cuore preferiti scuro

### Root-cause
File `src/dapp.css:1063`:
```css
.heart-btn-v2,.share-btn-v2 {
  ...
  color: var(--gray-300);   ← #3F3F3F via dapp-v2-g3.css:45
  ...
}
```
`--gray-300` in `dapp-v2-g3.css:45` è rimappato a `#3F3F3F`. ROBY ha
visto `rgb(63,63,63)` = `#3F3F3F` esatto.

### Patch
Cambiare `.heart-btn-v2,.share-btn-v2 { color: var(--gray-300) }` →
`color: var(--ink-faint)` (in dark = `rgba(245,241,232,0.40)`, in
light = `rgba(15,20,23,0.40)`) → cuore vuoto = grigio soft che legge
"non salvato", coerente con tema.

Stato `.active` resta `#dc2626` (linea `1065-1068`) — pieno coral
quando salvato, semantica corretta.

### Verify-before-fix
Sì, ho greppato `.heart-btn-v2` solo su `dapp.css:1063` + 4 righe
sotto. Nessun override altrove. Patch chirurgica.

### Footer bump
4.45.0 (incrementale post 4.44.0 MNB-1).

## 2. Quick-fix #2 — word-wrap card "ARIA quotidiano"

### Root-cause
`dapp.html:340` ha la card con `display:flex` (definito in
`dapp.css:108`) + `flex-wrap:wrap` + child `.dash-faucet-info`
con `flex:1; min-width:0` (`dapp.css:109`).

`min-width:0` c'è già — quindi il word-wrap a 412px **non è
min-width**. Sospetto principale: il sub-text (`Ricevi <strong>100
ARIA</strong> gratis — ogni giorno, senza limiti`) ha un `<strong>`
che a 412px + padding 20px + bottone "RICEVI" affiancato + gap 14 ha
una larghezza utile di ~200px che spezza male se il sub-text usa
`word-break:break-word` o se uno dei tag inline ha `white-space:nowrap`
ereditato.

Una causa più sottile: il bottone `.dash-faucet-btn` ha
`padding:12px 32px; flex-shrink:0` → occupa ~120px fissi anche a
412px. Resta `412 - 40 (padding card) - 14 (gap) - 120 (btn) ≈ 238px`
per il titolo+sub. Il titolo "Il tuo ARIA quotidiano" a font 18px non
ci sta su una riga → wrap parola-per-riga **se** c'è un `word-break:
break-all` o `overflow-wrap: anywhere` da qualche parte nel cascade.

### Verify-before-fix richiesto su browser live
Questo è il **primo** quick-fix in cui chiedo a ROBY **un grab DOM
DevTools live** (Computed → `word-break`, `overflow-wrap`,
`white-space` su `.dash-faucet-title` e `.dash-faucet-sub` a 412px)
prima di shippare la patch. Pattern
[feedback_ui_click_trace_before_push](feedback_ui_click_trace_before_push.md):
tracciare manualmente catena CSS-specificity prima di shippare fix FE.

Se confermato `word-break:break-all` cascade, fix = forzare
`.dash-faucet-title,.dash-faucet-sub { word-break: normal !important;
overflow-wrap: normal !important; }`.

Se invece è il bottone che a 412px **non wrappa sotto** (il
`flex-shrink:0` lo tiene affiancato spingendo il testo in colonna
larga ~50%), fix = `@media (max-width:480px) { .dash-faucet-card {
flex-direction: column; align-items: stretch; } .dash-faucet-btn {
width: 100%; } }`.

### Cadenza
Aspetto il grab DOM da ROBY → shippo la patch giusta. Se nessun grab
DOM disponibile prima delle 21:30 → vado con il **media-query
flex-direction:column @max-480px** (fix più sicuro, sempre giusto
qualunque sia la cascade culprit; allinea al pattern ISSUE-33 che
già fa identico su `.aria-daily-card` a 640px in
`dapp-v2-g3.css:371-382`).

### Footer bump
4.46.0 se shippato dopo il #1.

## 3. Dark mode — DISCOVERY CORRECTION

### 3.1 Cosa ho trovato io a verifica del repo (post lettura RS ROBY)

ROBY ha visto: flippando `<html data-theme="dark">` la pagina diventa
navy/blu, `--gold` rende blu `#4A9EFF`, radius gonfi 14px, body
`#060b18`.

**Reale stato del repo** (verificato con grep su `src/`):

1. `src/tokens.css:55-64` — il blocco `[data-theme="dark"]` esiste
   ed è **brand-compliant v2** (warm espresso, oro intatto, radius
   intatto). Non è "fuori brand": è **incompleto**.
   ```css
   [data-theme="dark"] {
     --bg-primary: #1B1814;       /* espresso warm — brand ✅ */
     --bg-alt: #2A2620;
     --ink: #F5F1E8;              /* warm white — brand ✅ */
     --ink-soft: rgba(245,241,232,0.65);
     --ink-faint: rgba(245,241,232,0.4);
     --coral: var(--coral-night);
     --line: rgba(255,255,255,0.12);
     --line-soft: rgba(255,255,255,0.08);
   }
   ```
   NON ridefinisce `--gold`, `--gold-light`, `--gold-deep`, `--accent`,
   `--radius`, `--bg-card`, `--bg-elevated`, `--bg-modal`, `--gray-*`.
   Quindi cascadono dal `:root`.

2. Il `:root` di `src/tokens.css:13-53` è brand v2 (oro `#B8893D`,
   radius 4px) → quei token in dark cascadono GIUSTI.

3. **MA** `src/airdrop.css:12-20` ha un `:root` **LEGACY** parallelo:
   ```css
   :root {
     --black:#060b18;          /* navy! */
     --white:#f0f2f8;
     --gold:#4A9EFF;           /* GOLD = BLU LEGACY! */
     --gold-dim:rgba(74,158,255,.25);
     --accent:#4A9EFF;
     --aria:#4A9EFF;
     --kas:#49EACB;
     --red:#ff6b6b;
   }
   ```
   Questo è il **vero responsabile** del "fuori brand" che ROBY vede.

4. `src/dapp-v2-g3.css:12-61` flippa quel legacy → brand v2 con
   `!important`, **MA SOLO** per `html[data-theme="light"]` e
   `html:not([data-theme="dark"])`. Quindi:
   - **light** → `dapp-v2-g3.css :not([data-theme="dark"])` vince
     → oro, radius 4px, bg bianco ✅
   - **dark** → `dapp-v2-g3.css` NON si applica (selettore fallito)
     → tokens.css `[data-theme="dark"]` definisce solo 7 var
     → tutto il resto cascade dal `:root` LEGACY airdrop.css =
     `--gold:#4A9EFF`, `--accent:#4A9EFF`, `--black:#060b18` ❌

**Quindi**: dark mode oggi mostra il legacy navy/blu **non perché il
blocco dark sia fuori brand**, ma **perché manca il gemello dark in
`dapp-v2-g3.css`** che chiuda il cascade come fa il light.

### 3.2 Conseguenza per la tabella ROBY §3.2

La tabella ROBY è **ottima come direzione** ma:

- I valori che cita come "fuori brand nel blocco dark esistente"
  (`--gold:#4A9EFF`, `--radius:14px`, body `#060b18`) **non sono nel
  blocco `[data-theme="dark"]`** — sono nel `:root` legacy di
  airdrop.css. Quindi non bisogna "sostituire il blocco
  `[data-theme="dark"]`" perché quel blocco è già OK; bisogna
  **completarlo** (o farne un gemello in dapp-v2-g3.css).

- Tabella ROBY propone `--gold: #D4A04C` (oro schiarito per contrasto
  su nero). Brand v2.0 attuale ha `--gold: #B8893D` base e
  `--gold-light: #D4A04C` come variante chiara. **Propongo**: in dark
  mantenere `--gold: #B8893D` (coerente light/dark, il brand è uno) e
  usare `--gold-light: #D4A04C` per i casi su sfondo nero saturo dove
  serve più contrasto (label, link). Decisione: ROBY chiama, default
  CCP = mantenere `#B8893D`.

- `--radius: 4px` resta 4px in dark — **concorda con ROBY** (la
  tabella tiene 4px contro i 14px del legacy navy).

- `--bg-card`, `--bg-elevated`, `--bg-modal`, `--glass-bg` mancano
  in tokens.css `[data-theme="dark"]` — **vanno aggiunti**, valori
  ROBY tabella OK con micro-tuning (espresso warm-tinted).

### 3.3 Due opzioni con trade-off

**Opzione A · completare il blocco in `src/tokens.css`** (1 file)
- Aggiungo a `[data-theme="dark"] {}` di tokens.css tutti i v2 token
  mancanti (gold base + light + deep + dim + glow, accent, bg-card,
  bg-elevated, bg-modal, gray-900..400, glass-bg, font-h/b/m,
  radius, espresso, ecc.).
- Pro: tokens.css è source-of-truth design, tutto in un file.
- Contro: tokens.css cresce, e dapp-v2-g3.css resta asimmetrico
  (definisce solo light v2). Disallineamento di pattern.

**Opzione B (preferita CCP) · gemello dark in `src/dapp-v2-g3.css`**
- Replico la sezione `:root[data-theme="light"]` come
  `:root[data-theme="dark"]` con valori brand-dark (warm espresso bg
  + ink warm white + oro intatto + radius 4px + tutti gli stessi
  token con valori dark).
- Pro: simmetrico al pattern Day-1 dapp-v2-g3.css, asset-specific
  PRESERVED stessa logica (aria-blue + kas-green non si toccano),
  un solo file da rivedere quando rifai la palette.
- Contro: dapp-v2-g3.css cresce. Patches dark e light convivono
  nello stesso file ma il pattern lo prevede.

**Opzione C · ripulire `:root` legacy di airdrop.css** (refactor
strutturale)
- Rimuovere `--gold:#4A9EFF` etc. dal `:root` di airdrop.css,
  centralizzando tutto su tokens.css.
- Pro: pulizia definitiva, niente più due `:root` paralleli.
- Contro: refactor strutturale, rischio regressioni cross-pagina
  (qualunque pagina che importa solo airdrop.css senza tokens.css si
  rompe). Non per stasera, **non per il primo go-live**.

**CCP raccomanda B per ora, C come Phase 3 post-lancio.**

### 3.4 Toggle UI

`src/theme.js` **esiste già** e implementa:
- ✅ flip `data-theme` light↔dark
- ✅ persistenza `localStorage.airoobi-theme`
- ✅ smooth transition 0.25s
- ❌ fallback `prefers-color-scheme` (manca)
- ❌ script anti-flash inline nel `<head>` (theme.js è `defer`,
  quindi un microflash light→dark al primo paint se utente in dark)

`dapp.html` **non ha** il bottone `#airoobi-theme-toggle` in topbar
(grep vuoto). Va aggiunto.

Patch dark mode end-to-end:
1. Opzione B → aggiungere `:root[data-theme="dark"]` in
   `dapp-v2-g3.css`.
2. Aggiungere fallback `prefers-color-scheme` in `theme.js`.
3. Aggiungere script anti-flash inline in `<head>` di `dapp.html`
   (mini IIFE che legge localStorage + matchMedia e setta `data-theme`
   PRIMA del primo paint).
4. Aggiungere bottone `#airoobi-theme-toggle` in `.topbar` di
   `dapp.html`, accanto al toggle EN (stesso trattamento, sole/luna
   SVG).

### 3.5 Tempo + scope

Stima: 90 min lavoro + 30 min ROBY verify a UI-click su 3 surface
(dashboard + pagina airdrop + modal acquisto) + ROBY firma. Scope solo
`airoobi.app`. ABO + `airoobi.com` follow-up separati come da §3.3
RS ROBY.

**Dark mode stasera = NO**. Non si tocca a 4h dal go-live. Primo
fast-follow Day 2 post-lancio (lunedì 25 mattina) con tutto il margine
per il UI-click loop.

## 4. Triage finding — confermo ROBY

| Finding | Severità | Decisione CCP |
|---|---|---|
| 2.1 word-wrap card ARIA | visivo evidente | quick-fix stasera SI (root-cause §2 + verify-before-fix DOM grab richiesto) |
| 2.2 cuore #3F3F3F | cosmetico | quick-fix stasera SI (root-cause §1, patch 1-liner) |
| 2.3 share affiancato | ok | nessuna azione (Skeezu pref "sotto" = micro-CSS Day 2) |
| 2.3 share residuo 2 bottoni 0x0 | cleanup | flag per Day 2 housekeeping |
| 2.4 entry-UX 3 CTA | UX | fast-follow §6 |
| 2.5 nav mobile MNB-1 | ✅ | nessuna azione |
| dark mode | feature | fast-follow Day 2 (90+30 min) §3 |
| banner unico | UX | fast-follow §5 |

## 5. Banner rossi — spec recepita, plan fast-follow

Componente unico `.banner-alert-v2`:
- una riga 36-40px (icona + msg ellissato + chevron + ×)
- expand mostra `.banner-detail` sotto
- close = stato in-memory `_dismissedBanners[bannerId]=true` →
  **NON localStorage** → riappare al refresh ✅
- sticky dove già sticky (autobuy GS-12 banner)

Refactor surface: banner fase Alpha, banner autobuy GS-12, warning
soglia GS-15, banner fairness. ~4 banner attuali → componente unico
unificato.

Stima: 3-4h. Day 2-3 post-lancio. **Non blocca go-live.**

## 6. Entry-UX action-strip — spec recepita, plan fast-follow

Riordino `/dashboard`:
1. Header "Bentornato" (resta)
2. **Action-strip 3 CTA** sopra la piega:
   - "Guadagna ARIA" → scroll a GUADAGNI / faucet
   - "Partecipa a un airdrop" → `navigateTo('explore')`
   - "Fai valutare un oggetto" → `navigateTo('submit')` (o equivalente)
3. 3 card saldo (ARIA/ROBI/KAS) scendono sotto (sono *stato*)
4. Micro-nudge "Hai N task da completare oggi" opzionale
5. Griglia AIRDROP/INVITA/WALLET/VENDI resta come shortcut

Stima: 2-3h. Day 2-3 post-lancio. **Non blocca go-live.**

## 7. Cleanup 6 airdrop — file separato

Vedi `CCP_Cleanup_6_Airdrop_Test_PreGoLive_2026-05-24.md`: dry-run
preparato, query transazionale rifinita, standby per GO operativo
Skeezu pre-commit.

## Bottom line

Si lancia alle 22. Quick-fix cuore + word-wrap = stasera con cadenza
1-by-1, ROBY UI-click gate. Dark mode = Day 2 con plan operativo
chiaro (opzione B preferita, blocco `[data-theme="dark"]` di
tokens.css è già OK ma incompleto, vero culprit è `:root` legacy
airdrop.css non flippato per dark in dapp-v2-g3.css). Banner +
entry-UX = Day 2-3. Cleanup 6 airdrop = file separato in standby per
GO Skeezu.

**3 domande aperte per ROBY**:
1. Grab DOM Computed (`word-break`/`overflow-wrap`/`white-space`) su
   `.dash-faucet-title` a 412px? (Se no entro 21:30 → vado con
   media-query flex-direction:column @480px, fix più sicuro.)
2. Dark mode `--gold` base: `#B8893D` (CCP default, coerenza
   light/dark) o `#D4A04C` (tabella ROBY §3.2, schiarito su nero)?
3. Opzione A vs B per chiudere il cascade dark? (CCP raccomanda B.)

Audit-trail: questo file = CCP ack RS ROBY UX mobile 412px · 2
quick-fix candidabili stasera con root-cause identificato + cadenza
one-item-ui-click-gate (cuore #3F3F3F = .heart-btn-v2 dapp.css:1063
color var(--gray-300) rimappato in dapp-v2-g3.css:45 · word-wrap card
ARIA = .dash-faucet-card display:flex con .dash-faucet-info flex:1
min-width:0 già presente, root-cause vero richiede DOM grab DevTools
@412px su .dash-faucet-title — sospetto word-break:break-all cascade
o bottone flex-shrink:0 non wrappa sotto → 2 patch alternative
preparate) · DISCOVERY CORRECTION rispettosa dark mode (blocco
[data-theme="dark"] in tokens.css:55-64 è GIÀ brand-compliant v2,
espresso #1B1814 + warm white + oro intatto B8893D + radius 4px
intatto · vero responsabile navy/blu = :root LEGACY airdrop.css:12-20
con --gold:#4A9EFF --black:#060b18 · dapp-v2-g3.css flippa legacy
brand-v2 SOLO per html:not([data-theme="dark"]) → in dark il legacy
cascade attivo · fix = completare cascade dark) · 3 opzioni dark (A
tokens.css completing · B dapp-v2-g3.css gemello dark = CCP raccomanda
· C refactor :root airdrop.css = Phase 3 post-lancio) · tabella ROBY
§3.2 = ottima base con 2 micro: gold base B8893D non D4A04C +
incompleto non sostituisce · toggle infra esiste in theme.js
(localStorage airoobi-theme + transition smooth) ma manca
prefers-color-scheme + anti-flash inline + bottone in topbar
dapp.html · dark mode stasera = NO 4h dal go-live, primo fast-follow
Day 2 lunedì 25 (90+30 min) · banner unico + entry-UX 3 CTA fast-follow
plan operativo §5-6 (3-4h + 2-3h Day 2-3) · cleanup 6 airdrop file
separato CCP_Cleanup_*.md standby GO Skeezu · 3 domande aperte ROBY
(DOM grab · gold base B8893D vs D4A04C · opzione A vs B vs C) ·
go-live 22:00 non bloccato da UX mobile.

---

*CCP · CIO/CTO Airoobi · ack RS UX mobile + dark mode discovery + quick-fix plan + banner/entry-UX fast-follow · 24 May 2026 · daje team a 4*
