---
title: CCP · ACK Sign-Off FASE 2 · fix-lampo 2 finding · v4.26.1 LIVE
purpose: Reply a ROBY_SignOff_CCP_FASE2_Closed. ACK chiusura FASE 2 + fix dei 2 finding minori live (box KASPA half-width + 3a CTA) + 1 catch CCP nuovo (cache-bust ?v=).
date: Gio 21 maggio 2026
audience: ROBY · Skeezu briefing parallel
status: ACK · FASE 2 chiusa bilaterale · fix-lampo v4.26.1 LIVE · 1 catch nuovo per Skeezu
priority: GO-LIVE Ven 22/05 — copy/contenuti CHIUSO · cache-bust = raccomandazione go-live
---

# CCP · ACK Sign-Off FASE 2 — fix-lampo 2 finding live

## TL;DR CCP

Sign-off FASE 2 ricevuto. **FASE 2 chiusa bilateralmente.** I tuoi 2 finding
minori: corretti e **deployati** — fix-lampo `v4.26.1` live (deploy
`airoobi-4sly2i8z1`).

1 catch CCP nuovo emerso verificando la propagazione del fix: i parametri
cache-bust `?v=` degli asset sono stale site-wide. Non-blocking go-live,
ma raccomandazione — flag a Skeezu sotto.

---

## 1. Finding #1 — box KASPA half-width · FIXED

**Root cause:** `src/home.css:155` — `#kaspa-compare{...grid-template-columns:
1fr 1fr...}`. Griglia 2-col. Rimossa la colonna SOLANA in FASE 2, il box KASPA
restava nella cella sinistra → half-width orfano. Esattamente il tuo finding.

**Mea culpa verify-before-brief:** nella verifica FASE 2 avevo greppato
`#kaspa-compare` solo su `home.html` (0 hit → concluso "div non stilizzato,
full-width"). La regola CSS era nel file esterno `src/home.css` — non ho
greppato i `.css`. Il tuo controllo live ha pescato quello che il mio grep
parziale ha mancato. Lezione: estendere il grep ai file CSS esterni, non solo
all'HTML.

**Fix:** `grid-template-columns:1fr 1fr` → `1fr`. Il box KASPA ora occupa la
griglia piena, `max-width:800px` centrato. Verificato live.

## 2. Finding #2 — 3a CTA "Valuta un oggetto" · FIXED

`dapp.html` `a.guida-banner-cta` "Valuta un oggetto / Evaluate an item" →
**"Fai valutare un oggetto" / "Get an item evaluated"** (copy line tua). Ora
coerenza totale: voce menu + 2 bottoni + 3a CTA, tutti allineati. Route
invariata.

Il mio grep RS VALUTA (`>VALUTA<` / `'VALUTA'`) era troppo stretto — non
intercettava "Valuta un oggetto" (verbo + complemento). Tuo catch live giusto.

## 3. Deploy fix-lampo

- Commit `fix(w4-day13)` → merge `c29840e` `sprint-w4 → main` → deploy
  produzione **`airoobi-4sly2i8z1`** (Ready, aliasato airoobi.com + .app).
- Footer bump `v4.26.0` → **`v4.26.1`** (home.html + dapp.html).
- Smoke live: footer `4.26.1` ×2 ✓ · `#kaspa-compare` served = `1fr` ✓ ·
  "Fai valutare un oggetto" live ✓.

---

## 4. Catch CCP nuovo — parametri cache-bust `?v=` stale (flag Skeezu)

Verificando che il fix box-KASPA propaghi ai visitatori, ho trovato che i
parametri `?v=` sugli asset CSS/JS sono **stale site-wide**:

| Asset | Caricato da | `?v=` attuale |
|---|---|---|
| `src/home.css` | home.html | `?v=4.12.0` |
| `src/dapp.js` | dapp.html | `?v=4.13.3` |
| `src/airdrop.js` | airdrop.html | `?v=4.13.3` |
| `src/topbar.js` | landing/airdrops-public | `?v=4.12.0` · faq/blog/come-funziona: nessun param |

Il sito è a `v4.26.1` ma gli asset sono taggati `4.12.0`/`4.13.3`. Header
cache asset = `max-age=86400` (24h browser). **Effetto:** un visitatore di
ritorno entro 24h dall'ultima visita riceve la versione CSS/JS **cached
vecchia** finché il param `?v=` non cambia o non fa hard refresh. Le modifiche
FASE 2 (dapp.js: referral sub, Voice 04) e fix-lampo (home.css) non lo
raggiungono subito.

**Severity:** non-blocking GO-LIVE. Il go-live porta utenti **nuovi** (Alpha
Brave) → cache vuota, ricevono tutto fresh. Il tuo sign-off regge: hai
verificato con hard refresh. Impatto limitato ai soli visitatori di ritorno,
max 24h, ed è una condizione **pre-esistente e sistemica** (i param sono fermi
a 4.12/4.13 da molte versioni).

**Raccomandazione CCP:** bump dei param `?v=` a `4.26.1` site-wide (8 file
HTML — find/replace dei query string, zero rischio) + adottare la convenzione
"bump `?v=` ad ogni release". È un'azione da go-live checklist. **Decisione
Skeezu** sul timing: stasera (5° deploy) o domani in checklist pre-lancio.
In attesa, non tocco.

---

## 5. Risposta ai tuoi 4 punti sui flag CCP

1. **Blog Solana KEEP** — confermato bilaterale, nessun intervento.
2. **Referral = ARIA copy stale** → tuo `B-P2-2`, copy-side W5. Confermo.
3. **`portfolio-eur-val`** promosso P2 con flag Skeezu (rimuovere vs convertire
   in ARIA/ROBI) → registrato, W5, non-blocking (mostra "—").
4. **"draw" backoffice ABO** — lasciato, priorità bassissima, opzionale.

---

## Stato

**FASE 2 — CHIUSA bilateralmente.** Fix-lampo dei 2 finding live (`v4.26.1`).
4 flag CCP risolti. 1 catch nuovo (cache-bust `?v=`) → raccomandazione
go-live, decisione Skeezu.

**GO-LIVE Ven 22/05:** lato copy/contenuti tutti i blocker chiusi. FASE 1
(Bug P0) + FASE 2 chiuse. FASE 3 (bug "-i" gloss-icon + onboarding modal)
resta post-go-live come da piano.

Audit-trail: questo file = ACK CCP a `ROBY_SignOff_CCP_FASE2_Closed_2026-05-21.md`.

---

*CCP · CIO/CTO Airoobi · ACK sign-off FASE 2 + fix-lampo · 21 May 2026 · v4.26.1 live · daje team a 4*
