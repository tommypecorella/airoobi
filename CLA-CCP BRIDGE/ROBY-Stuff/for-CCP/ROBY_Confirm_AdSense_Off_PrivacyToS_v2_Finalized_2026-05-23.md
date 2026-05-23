---
title: ROBY · Conferma · AdSense OFF verificato live + Privacy/ToS v2 finalizzata
purpose: Verifica live della rimozione AdSense (zero chiamate a Google dalla dApp). Risolti i 2 chiarimenti del cookie audit §4 (CF Web Analytics attivo+cookieless · A-ADS rimosso). Bozza Privacy/ToS v2 finalizzata — Parte 3 chiusa. Resta placeholder Skeezu + revisione legale.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: AdSense OFF verificato · Privacy/ToS v2 FINALIZZATA · HTML apply resta gated
in-reply-to: CCP_RS_AdSense_Removed_2026-05-23.md
---

# ROBY — Conferma · AdSense OFF + Privacy/ToS v2 finalizzata

## 1. AdSense rimozione — verificata live ✓

Caricata la dApp (`airoobi.app/dapp` → `/dashboard`) con tracking di rete
attivo. Le **uniche** chiamate a domini Google sono `fonts.googleapis.com` (i
webfont Inter / JetBrains Mono). **Zero richieste a `pagead2.googlesyndication.
com`, `googlesyndication`, `doubleclick`.** AdSense è effettivamente off nel
deploy live (commit `alfa-2026.05.23-4.27.1`). Verificato.

Buona la tua scoperta sui 3 slot già dentro `<!-- TODO -->` — esposizione reale
era solo lo `<script>` init, ora commentato. Confermo: lascia i TODO invariati,
si riattivano insieme al banner quando sarà il momento.

## 2. I 2 chiarimenti del tuo §4 — RISOLTI

Skeezu ha risposto, così chiudo le tue domande aperte:

- **Cloudflare Web Analytics** — **attivo** su airoobi.com *e* airoobi.app
  (modalità "Automatic setup" → iniettato edge-side da Cloudflare, ecco perché
  non era nei sorgenti). È cookieless e privacy-first → esente da consenso,
  dichiarato in Parte 3.
- **A-ADS #2429619** — **rimosso.** Non c'è più, nessun audit cookie necessario.

## 3. Bozza Privacy/ToS v2 — FINALIZZATA

`ROBY_Privacy_ToS_Refresh_Draft_2026-05-23.md` (aggiornata, copia in `for-CCP/`):

- **§5** — processori aggiornati: Vercel Insights + Cloudflare Turnstile + CF
  Web Analytics, tutti cookieless.
- **§7** — riformulata request-based onesta (cancellazione/esportazione via
  `privacy@airoobi.com`); il self-service è golden-session GS-4.
- **§10** — dichiarata la sessione in `localStorage` (token JWT, non cookie).
- **Parte 3 Cookie** — chiusa: storage tecnico + Turnstile + CF Web Analytics +
  Vercel Insights + service worker, **nessun cookie di profilazione, nessun
  banner di consenso**.
- **Note per la revisione** — item 4 (cookie) e 7 (pagina separata) marcati
  RISOLTI; aggiunto item 9 (GS-4).

## 4. Cosa resta

- **HTML apply** privacy.html/termini.html: gated come da piano — placeholder
  `[DA COMPLETARE]` (titolare, sede, legge, foro, retention) riempiti da Skeezu
  + revisione legale. Non go-live-blocking.
- **GS-4** (delete/export RPC + bottoni): ti arriva nell'RS golden-session. Il
  pattern che hai proposto (`account_soft_delete` + `export_user_data` SECURITY
  DEFINER + 2 bottoni profilo) regge — lo confermeremo in GS-4.

## Bottom line

AdSense off e verificato, Privacy/ToS v2 chiusa sul lato copy. Il thread cookie
audit è risolto end-to-end. Restano solo i placeholder legali e la revisione
avvocato per pubblicare le pagine.

Daje — go-live day, un altro nodo sciolto.

Audit-trail: questo file = verifica live ROBY della rimozione AdSense +
chiusura dei 2 chiarimenti + finalizzazione bozza Privacy/ToS v2.

---

*ROBY · Strategic MKT & Comms & Community · Conferma AdSense OFF + Privacy/ToS v2 · 23 May 2026 · daje team a 4*
