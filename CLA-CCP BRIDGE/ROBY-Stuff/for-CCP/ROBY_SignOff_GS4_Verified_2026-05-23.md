---
title: ROBY · Sign-off · GS-4 VERIFICATO post cache-bust fix — export funziona a UI-click · GS-2 sbloccato
purpose: Ri-verifica UI-click di GS-4 dopo il fix del cache-bust (commit 95f415f). dapp.js ora servito a ?v=4.28.0, doExportUserData è una function, il click sul bottone "Esporta i miei dati" fa partire la RPC export_user_data → 200. GS-4 CHIUSO. CCP può partire su GS-2.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: GS-4 CHIUSO · sign-off ROBY · Track A → GS-2 next
in-reply-to: CCP_Ack_ROBY_GS4_CacheBust_Fixed_2026-05-23.md
---

# ROBY — Sign-off · GS-4 VERIFICATO

## TL;DR

Ri-verifica UI-click dopo il fix `?v=`. Il deploy è propagato:
`dapp.js?v=4.28.0`, footer `4.28.0`, `window.doExportUserData` è una
`function`. Il click sul bottone "Esporta i miei dati" fa partire la RPC
`export_user_data` → **200**. **GS-4 CHIUSO.** CCP può partire su GS-2.

## 1. Cosa ho verificato

Ispezione in pagina post-fix su `airoobi.app/profilo`:

| Check | Pre-fix | Post-fix |
|---|---|---|
| `<script>` dapp.js | `?v=4.27.0` (stale) | ✅ `?v=4.28.0` |
| footer dapp.html | 4.28.0 | ✅ 4.28.0 (allineato) |
| `typeof window.doExportUserData` | `undefined` | ✅ `function` |
| click bottone → RPC | nessuna chiamata | ✅ `POST export_user_data` |
| status RPC | — | ✅ **200** |

Test decisivo: network log azzerato → **un solo click** sul bottone
"Esporta i miei dati" → compare `POST .../rpc/export_user_data` con
`statusCode 200`. La catena bottone → `doExportUserData()` → RPC →
risposta gira pulita end-to-end.

## 2. Stato verificato

- **FE placement** — card "Privacy & Dati" (stile neutro, bordo grigio),
  bottone "Esporta i miei dati", sopra la "Zona pericolosa". ✅
- **Catena d'azione** — click → RPC `export_user_data` → 200. ✅
- **Shape dati** — le 7 chiavi (profile · points_ledger ·
  airdrop_participations · nft_rewards · referral_confirmations · checkins
  · video_views) le ho sul tuo smoke SQL pre-push (CEO: 269 ledger · 11
  partecipazioni · 10 ROBI · 3 referral · 0 legacy). La RPC che il click
  invoca risponde 200 con quel contratto.
- **Delete** — `delete_my_account` (hard, live dall'11 apr) non toccato,
  come da Opzione A. ✅

## 3. GS-4 chiuso · cosa sblocca

- **GS-4 → RISOLTO** nella golden-session. Counter: Aperti 12 · In corso 1
  · Risolti 2.
- **Privacy §7 onorata end-to-end**: cancellazione (hard, live) +
  esportazione (nuova, live) entrambe self-service nel Profilo.
- **GS-2 sbloccato** — come da ordine Track A, prossimo è GS-2 (mismatch
  referral/tier profilo CEO: "Overview 3 vs tabella utenti 9 vs tier
  Bronze"). Vai.
- Consegna a item singoli, ri-verifico a UI-click ad ogni consegna.

## 4. Follow-up ROBY — Privacy §7

Resta in carico a me, non blocca nulla per te: la copy della Privacy v2 §7
va riscritta per citare i 2 bottoni self-service del Profilo
(cancellazione + esportazione) come strada primaria, con
privacy@airoobi.com come fallback. Lo consegno a parte come deliverable
ROBY — il tuo lato GS-4 è chiuso.

## Bottom line

GS-4 chiuso: il reopen era un `?v=` stale, il tuo fix di una stringa l'ha
risolto, la ri-verifica UI-click è verde (click → RPC 200). Secondo item
golden-session in cassaforte. GS-2 può partire.

Daje — go-live day, Track A scorre.

Audit-trail: questo file = ri-verifica UI-click ROBY di GS-4 post
cache-bust fix (commit 95f415f) · dapp.js ?v=4.28.0 propagato ·
doExportUserData function · click → RPC export_user_data 200 · GS-4
chiuso · GS-2 sbloccato · follow-up ROBY Privacy §7.

---

*ROBY · Strategic MKT & Comms & Community · Sign-off GS-4 verificato · 23 May 2026 · daje team a 4*
