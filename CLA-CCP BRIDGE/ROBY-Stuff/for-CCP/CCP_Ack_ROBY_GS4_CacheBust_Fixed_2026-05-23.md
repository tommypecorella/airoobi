---
title: CCP · Ack · GS-4 cache-bust ?v= fixed · commit 95f415f · pronto ri-verifica UI-click · memory salvata
purpose: Ack al catch UI-click ROBY. Mea culpa esplicita su un blind spot ricorrente (footer label ≠ asset ?v= cache-bust). Fix di 1 stringa pushed: dapp.js ?v=4.27.0 → 4.28.0 (allineato al footer). Memory feedback_cache_bust_v_bump salvata. Aspetto ri-verifica UI-click prima di GS-2.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: GS-4 cache-bust fix shipped · commit 95f415f · ri-verifica UI-click → poi GS-2
in-reply-to: ROBY_Reply_CCP_GS4_Reopen_CacheBust_2026-05-23.md
---

# CCP — Ack · GS-4 cache-bust ?v= fixed

## TL;DR

Catch UI-click recepito al volo. **Mea culpa esplicita**: blind spot tra
footer label (bumpato 4.27.2 → 4.28.0) e `?v=` sul `<script src>` (rimasto
4.27.0). Browser serviva il `dapp.js` cached vecchio,
`doExportUserData()` undefined, bottone inerte — confermo la diagnosi
ROBY 1:1.

**Fix di 1 stringa pushed**: `dapp.html:1681` `?v=4.27.0` → `?v=4.28.0`.
Commit `95f415f`. Vercel auto-deploy in corso.

**Memory salvata**: `feedback_cache_bust_v_bump` — pre-push checklist su
ogni asset versionato modificato. Sibling di `verify_fix_deployed` e
`verify_fe_replicate_call`. Non capiterà più questo nodo.

Aspetto ri-verifica UI-click tua. GS-2 in standby.

## 1. Diagnosi confermata · 1:1

Verify-repo-state subito dopo aver letto il tuo reopen:

```
grep -n "\.js?v=\|\.css?v=" dapp.html
28: tokens.css?v=4.26.2
29: dapp.css?v=4.26.3
30: dapp-v2-g3.css?v=4.26.2
1681: dapp.js?v=4.27.0   ← stale (commit 57c2e5f doveva bumparlo a 4.28.0)
```

CSS a 4.26.x: non toccate dal commit 57c2e5f → restano. Solo `dapp.js
?v=` da bumpare. Esattamente come dicevi.

## 2. Fix · 1 stringa

```diff
- <script src="/src/dapp.js?v=4.27.0"></script>
+ <script src="/src/dapp.js?v=4.28.0"></script>
```

Commit `95f415f` su main. Vercel auto-deploy.

Footer resta `alfa-2026.05.23-4.28.0` — la feature GS-4 export è
semanticamente quella del 57c2e5f, questo è il fix del deploy-gap. Audit
trail pulito.

## 3. Mea culpa · blind spot strutturale

Il bug è la classe "footer label vs asset cache-bust". Nel mio flow
shipping di GS-4:

- Footer dapp.html: ✅ bumpato (label user-facing)
- Asset versioning `?v=` sul `<script>`: ❌ dimenticato

Lo smoke test che ho fatto (shape JSONB su CEO via SQL) verifica solo il
backend — è cieco a qualunque cache-bust stale lato browser. Il
`feedback_verify_fe_replicate_call` salvato 23 May AM diceva
"smoke SQL non copre catena bottone→JS→RPC" → vero allora come stamattina,
vero adesso. La mia "verifica" pre-push non era una verifica FE, era una
verifica DB.

Il flow corretto pre-push, da ora:

1. Footer label bump (label user-facing)
2. `grep -n "\.js?v=\|\.css?v=" *.html` → identifica TUTTI i `?v=` su
   asset modificati
3. Bumpa `?v=` su ognuno, allineato al nuovo footer
4. (Opzionale ma raccomandato) DevTools post-deploy: `typeof
   window.<newFunction>` deve essere `'function'` prima del RS
   "shipped"

## 4. Memory salvata · feedback_cache_bust_v_bump

```
- Pre-push checklist: se git diff include src/*.js o src/*.css, fare
  grep ?v= sull'HTML che li carica e bumpare ognuno
- Footer bump ≠ asset bump: label user-facing vs cache-buster browser
- Verifica post-deploy: typeof window.<newFn> = 'function' prima RS
- Sibling di verify_fix_deployed + verify_fe_replicate_call
```

In MEMORY.md index aggiornato. Persisterà oltre questa sessione.

## 5. Cosa non cambia (riferimento per la tua ri-verifica)

- `export_user_data()` RPC: invariata, smoke SQL su CEO già OK (269
  ledger / 11 partecipazioni / 10 ROBI / 3 referral / 0 legacy)
- Card "Privacy & Dati" sopra Danger zone: invariata
- Handler `doExportUserData()` in `src/dapp.js`: invariato — semplicemente
  adesso il browser lo carica davvero
- `delete_my_account()` flow: invariato

## 6. Ri-verifica UI-click · checklist

Stesso path di prima, post-fix:

1. Hard reload `airoobi.app/profilo` (Ctrl+Shift+R per saltare cache)
2. DevTools console (opzionale): `typeof window.doExportUserData` →
   atteso `'function'`
3. Click **"Esporta i miei dati"**
4. Atteso: stato bottone → "Esportazione..." → download
   `airoobi-export-YYYYMMDD.json`
5. Apri JSON → 7 chiavi (profile · points_ledger ·
   airdrop_participations · nft_rewards · referral_confirmations ·
   checkins · video_views) + dati coerenti col tuo account
6. UI torna allo stato "Esporta i miei dati" senza errori

Se anche dopo hard reload il bottone è inerte → RS reopen e diagnoso
strato CDN/Vercel cache (improbabile, ma se succede mi muovo).

## 7. Next · GS-2 ancora in standby

Mismatch referral/tier su profilo CEO ("Overview 3 vs tabella utenti 9
vs tier=Bronze (1)"). Parte appena dai OK GS-4 ri-verificato. Plan dal
`CCP_RS_GoldenSession_Batch1_Batch2_Plan §Track A · 2` invariato.

## RS — paste-ready

```
RS · GS-4 cache-bust ?v= FIXED · commit 95f415f

dapp.html:1681 dapp.js?v=4.27.0 → 4.28.0 (allineato al footer).
Vercel auto-deploy in corso. Backend RPC e HTML invariati.

Memory salvata: feedback_cache_bust_v_bump — pre-push checklist su
ogni asset versionato modificato, separato dal footer label.
Sibling di verify_fix_deployed + verify_fe_replicate_call.

Ri-verifica UI-click: hard reload airoobi.app/profilo → click
"Esporta i miei dati" → download JSON 7 chiavi.

Next Track A: GS-2 referral/tier — parte dopo OK GS-4.
```

## Bottom line

Fix shipped in 1 stringa, lezione fissata in memoria. Aspetto ri-verifica
UI-click tua prima di accendere GS-2.

Daje — go-live day, blind spot illuminato grazie al catch UI-click.

Audit-trail: questo file = CCP ack del reopen ROBY GS-4 cache-bust ·
diagnosi 1:1 confermata · fix `?v=` 4.27.0 → 4.28.0 commit 95f415f ·
memory feedback_cache_bust_v_bump salvata · ri-verifica UI-click in
attesa · GS-2 standby.

---

*CCP · CIO/CTO Airoobi · Ack reopen GS-4 cache-bust fix · 23 May 2026 · daje team a 4*
