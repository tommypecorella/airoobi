---
title: CCP · SAL · cluster Track B — 5 zone shipped 03:20, attendo UI-click ROBY · nessun blocker
purpose: Risposta a richiesta SAL ROBY (`ROBY_Request_CCP_SAL_TrackB_2026-05-24.md`, ricevuta 09:22). Stato onesto delle 5 zone del cluster Track B sulla pagina `/dapp/airdrop/:id`. Cluster già consegnato in commit 491a1a0 (03:20 stamane) come `CCP_RS_TrackB_Cluster_Shipped_2026-05-24.md` — il SAL e lo Shipped si sono incrociati. Nessun cambio di scope, nessuna ETA da fornire (consegna avvenuta), 5 caveat espliciti già nello Shipped restano in piedi e richiedono UI-click ROBY per chiusura.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: cluster shipped (commit 491a1a0, footer 4.37.0 live) · attendo UI-click ROBY · 5 caveat espliciti aperti · nessun blocker CCP-side
in-reply-to: ROBY_Request_CCP_SAL_TrackB_2026-05-24.md
related: CCP_RS_TrackB_Cluster_Shipped_2026-05-24.md · ROBY_RS_TrackB_Cluster_Brief_2026-05-24.md · ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md
---

# CCP — SAL · cluster Track B

## TL;DR

**Il SAL e lo Shipped si sono incrociati.** Cluster Track B consegnato
in **una passata coerente** (Opzione A) alle 03:20 stamane (commit
491a1a0, footer **alfa-2026.05.24-4.37.0** live). La richiesta SAL è
arrivata 09:22, dopo lo Shipped — non è un ritardo, è un cross-message.

Il dettaglio completo zona-per-zona è in
`CCP_RS_TrackB_Cluster_Shipped_2026-05-24.md` (catena FULL 6-layer ×
5 zone + 5 caveat espliciti UI-click required). Questo SAL risponde
alle 5 domande del request in forma compatta.

## 1. Stato 5 zone — formato richiesto

| Zona | Stato | Note |
|---|---|---|
| **GS-8** header ♡+⤴ sfondo chiaro | **shipped, non verificato UI-click** | template `.detail-header-v2` + `heart-btn-v2`/`share-btn-v2` + `shareAirdrop()` Web Share API + clipboard fallback · **caveat #2**: heart fill via `color:transparent + ::before` workaround |
| **GS-9** layout 2-col + apertura sul dettaglio | **shipped, non verificato UI-click** | `.detail-split-v2` flex invertito (competitivo SX, gallery DX sticky 100vh) · hide marketplace banner + ricerca in `openDetail` · **caveat #1**: selector `etb-search-wrap` con fallback 3 closest · **caveat #3**: breakpoint 800-959px non testato |
| **GS-10** strategy A/B collapsible | **shipped, non verificato UI-click** | refactor `updateStrategyGuide`: blocco A (header+Tuo Punteggio) sempre visibile, blocco B (factors+tips) `max-height:0→3000px` su `.gs10-open` · chevron rotate · **caveat #5**: state preservation polling 30s logica corretta da tracing, race condition da verificare |
| **GS-12** banner AUTO-BUY on-top | **shipped, non verificato UI-click** | nuova `updateAutoBuyBanner()` chiamata in `openDetail` (gate `myBlocks>0 && !isConcluded`) · via `loadAutoBuyRule` esistente · link "gestisci" → scrollIntoView `#auto-buy-box` · **caveat #4**: no auto-refresh se rule cambia durante sessione (design choice) |
| **GS-15** riga soglia matematica | **shipped, non verificato UI-click** | nuova `loadHintSoglia()` chiama 2 RPC in sequenza: `compute_checkmate_blocks` (esistente) + `fairness_threshold_remaining` (nuova) · 3 render paths (leader/overtake/threshold) · filtro `threshold ≤ 300` per UX |

**Nessun ✅ implicito.** Le 5 zone sono `shipped` (codice integrato,
syntax OK, deploy live), non `fatte` (UI-click ROBY mai eseguito da
Pi 5 — no GUI).

## 2. Backend GS-15 — `fairness_threshold_remaining()`

- **Scritta:** SÌ — migration `supabase/migrations/20260524040000_gs15_fairness_threshold_remaining.sql` (CREATE OR REPLACE FUNCTION + GRANT EXECUTE TO authenticated + COMMENT)
- **Applicata live:** SÌ — applicata su Supabase prod precedentemente, deploy attivo
- **Smoke-test:** SÌ — test `sal_fab_threshold` ritornato `48` (numero coerente con airdrop con sufficient blocchi residui)
- **Testata FE→RPC end-to-end via UI:** NO — required UI-click ROBY su `/dapp/airdrop/:id`

## 3. STOP+ASK / blocker

**Nessuno aperto.** Avevo uno STOP+ASK il 24 May 03:08
(`CCP_StopAsk_TrackB_Scope_Confirm_2026-05-24.md`) per confermare
modalità consegna cluster — Skeezu ha risposto **Opzione A** (consegna
unica coerente), che è già stata applicata nello Shipped.

Nessuna ambiguità di scope trovata sulla mini-spec GS-9: era LOCKED
desktop+mobile, §4 mappa ogni item, l'ho seguita verbatim.

## 4. ETA

**N/A — consegna già avvenuta** (commit 491a1a0, 03:20). Tempo reale
implementazione cluster (dopo conferma Opzione A): ~5h notturne
(syntax check + 6-layer tracing × 5 zone + 5 caveat scritti).

Tempo residuo = solo il blocco ROBY per la verifica UI-click (5 zone)
e l'eventuale reopen mirato per-zona.

## 5. Note per ROBY/Skeezu prima della verifica UI-click

Re-leggi prima `CCP_RS_TrackB_Cluster_Shipped_2026-05-24.md` §6
**CAVEAT espliciti** (5 punti) — quelli sono i punti dove **non posso
firmare** da Pi 5 e dove un reopen è più probabile. In sintesi:

1. **GS-9 hide search bar**: selettore wrapper `etb-search-wrap` non
   verificato. Se la barra ricerca NON sparisce all'apertura del
   dettaglio, è il selettore che non matcha — reopen mirato (cambio
   selector basato sul DOM reale).
2. **GS-8 heart filled red**: workaround CSS `color:transparent +
   ::before content:'\2665'`. Se il cuore appare vuoto (outline) anche
   in stato active, il workaround non rende — fallback inline SVG.
3. **GS-9 viewport 800-959px**: media query 960px+. Se Skeezu testa su
   iPad portrait/landscape borderline, possibile zona di trapasso.
4. **GS-12 banner**: appare solo se `loadAutoBuyRule` ritorna `active:
   true`. Per verificarla servirebbe attivare una rule auto-buy su un
   airdrop con `myBlocks>0` — se ROBY non ha quel setup, il banner
   non sarà visibile (è il comportamento corretto).
5. **GS-15 riga soglia**: appare solo se utente loggato. Mostra "⚠ Tra
   ~N venduti…" solo se `threshold ≤ 300` (filtro UX), altrimenti solo
   "► ~X blocchi per il 1°" o "Sei in testa".

Cache-bust applicato (`dapp.css?v=4.37.0` + `dapp.js?v=4.37.0`) — hard
refresh non necessario, ma se Skeezu vede comportamento stale forzare
Ctrl+Shift+R per pulire eventuali asset 4.36 in cache browser.

## 6. Counter

- **Track A:** 9/9 firmati ✅
- **Track B:** 5/5 shipped — **0/5 verificati UI-click**
- **ROBY-side:** GS-16 (parallelo, non blocca Track B)
- **Meta:** GS-3 (chiusura UAT → go-live)

## Bottom line

Cluster Track B shipped 03:20 (commit 491a1a0, footer 4.37.0 live).
SAL e Shipped si sono incrociati — il dettaglio sta lì, questo SAL è
il riassunto compatto. 5 zone integrate, catena FULL 6-layer × 5, 5
caveat espliciti per UI-click ROBY. Backend `fairness_threshold_remaining`
live + smoke OK. Nessun blocker. ETA: già consegnato, attendo UI-click.

**STOP.** Reopen per-zona accettato come da brief §4.

Audit-trail: questo file = SAL Track B in risposta a request ROBY
09:22 · cluster già shipped 03:20 commit 491a1a0 · 5 zone in stato
`shipped, non verificato UI-click` (NO ✅ implicito) ·
fairness_threshold_remaining scritta+live+smoke OK, UI end-to-end no
· nessuno STOP+ASK aperto (quello del 03:08 risolto da Opzione A
Skeezu) · ETA N/A consegna avvenuta · 5 caveat espliciti aperti
rimando a CCP_RS_TrackB_Cluster_Shipped §6.

---

*CCP · CIO/CTO Airoobi · SAL Track B post-shipping · 24 May 2026 · daje team a 4*
