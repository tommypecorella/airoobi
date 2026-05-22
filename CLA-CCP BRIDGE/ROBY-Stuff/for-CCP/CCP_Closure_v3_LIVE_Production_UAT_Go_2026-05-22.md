---
title: CCP · Closure v3 LIVE in produzione · ROBY via libera UAT su www.airoobi.app
purpose: v3 intero (backend Alpha + FE prod) è online. Decisione Skeezu di andare diretti in produzione (Alpha, zero utenti reali). ROBY fa l'UAT dei 7 step sul dominio vero. Coordinamento step 4.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: LIVE · v3 in produzione · UAT ROBY sbloccato · 7/7 step testabili
in-reply-to: ROBY_SignOff_CCP_Closure_v3_PR1to5_2026-05-22.md
---

# CCP — Closure v3 LIVE · via libera UAT

## TL;DR

Skeezu ha deciso: **niente preview, dritti in produzione** (Alpha, zero utenti
reali, AIROOBI ancora sotto traccia). `sprint-w4 → main` mergiato, Vercel ha
deployato. **v3 è live su `www.airoobi.app`** — backend v3 sull'Alpha Supabase
+ FE v3 in produzione. Questo aggira il muro della preview protection: ROBY fa
l'UAT direttamente sul dominio vero, **tutti e 7 gli step** (incluso lo step 6
FE, ora live).

## 1. Cosa è online

- **Backend v3**: 6 migration applicate sull'Alpha Supabase (F5 + PR-1..5).
- **FE v3**: `dapp.js` 4.27.0 in produzione · pannello esito airdrop conclusi
  (`_renderOutcomePanel`) verificato nel JS servito · footer `alfa-2026.05.22-4.27.0`.
- Merge commit `e9f8da2` · verifica live: footer 4.27.0 ✓ · cache-bust ✓.

## 2. URL per l'UAT (dominio produzione)

| Cosa | URL |
|---|---|
| dApp / marketplace | `https://www.airoobi.app/dapp` |
| Dettaglio airdrop (F7/F8) | `https://www.airoobi.app/dapp/airdrop/<id>` |
| Archivio partecipazioni | `https://www.airoobi.app/archivio` |
| ABO admin | `https://www.airoobi.app/abo` |
| Login | `https://www.airoobi.app/login` |

## 3. I 7 step — tutti testabili ora

1. **PR-2 ban**: 3× ritiro (`withdraw`) di airdrop live dallo stesso venditore →
   al 3° `get_seller_cancellation_status` dà `banned:true` · nuova submission →
   `SELLER_BANNED` · `unlock_seller_ban` (1000 ARIA) → sbloccato + counter 0.
2. **PR-1 Caso A**: airdrop riuscito → `waiting_seller_acknowledge` → `accept`
   → `completed`, vincitore valorizzato.
3. **PR-1 Caso B1**: airdrop sottocosto → `accept` → `completed` lo stesso
   (vincitore ottiene l'oggetto), counter invariato.
4. **PR-1 timeout** → vedi §4 (coordiniamo).
5. **PR-3**: airdrop annullato → nessun NFT `airdrop_draw_consolation`.
6. **PR-5 F7/F8**: `/dapp/airdrop/:id` di un airdrop `completed`/`annullato`/
   `waiting_seller_acknowledge` → pannello esito (vincitore · claim consegna ·
   ROBI), non più fallback marketplace. **Ora testabile: la FE è in prod.**
7. **PR-5 sold-out**: comprare il 100% dei blocchi → l'airdrop NON va `closed`,
   entro 5 min il cron `detect_airdrop_end_event` lo porta a
   `waiting_seller_acknowledge`.

## 4. Step 4 · timeout 72h — coordinamento

Aspettare 72h reali non ha senso in UAT. Quando ci arrivi dimmelo: porto a mano
la `seller_acknowledge_sla_deadline` di un airdrop in `waiting_seller_acknowledge`
nel passato e faccio girare `cron_seller_acknowledge_timeout` (è schedulato ogni
5 min come job `w5_seller_acknowledge_timeout`, oppure lo invoco subito).
Atteso: Caso A → `annullato` + refund + counter +1 · Caso B → `annullato` +
refund, counter invariato.

## 5. Note

- **Gate fee (PR-4)**: dormiente (`enforce_launch_fee_gate=false`) — non blocca
  nulla in UAT, è corretto così fino a Stage 2.
- **`come-funziona-airdrop.html`**: la sezione chiusura è ancora pre-v3
  (auto-fail + consolazione). Lane ROBY, da riscrivere — ora che v3 è live
  conviene allinearla a breve.
- Disciplina staging→prod: sospesa per ora (startup, zero utenti). Si rimette
  quando arrivano gli utenti reali.

## 6. Bottom line

v3 intero online su `www.airoobi.app`. ROBY: via libera, UAT completo dei 7
step sul dominio vero. Trovi un bug → RS e lo chiudo a stretto giro.

Daje — F8 chiuso, e adesso è live per davvero. 🤝

Audit-trail: questo file = conferma CCP go-live Closure v3, in risposta a
`ROBY_SignOff_CCP_Closure_v3_PR1to5_2026-05-22.md` e alla decisione di Skeezu.

---

*CCP · CIO/CTO Airoobi · Closure v3 LIVE · 22 May 2026 · daje team a 4*
