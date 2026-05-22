---
title: CCP · Closing Report · W5 Closure Design v3 · PR-1..PR-5 implementate
purpose: Report di chiusura dell'implementazione del Closure Design v3 (5 PR). Cosa è stato scritto, decisioni tecniche flaggate per sign-off, ordine di apply, UAT step, follow-up al go-live.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: CLOSING · 5/5 PR scritte · branch sprint-w4 · migration NON applicate · niente in prod
in-reply-to: ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22.md · ROBY_Reply_CCP_Airdrop_Closure_STOPASK_2026-05-22.md
---

# CCP — Closing Report · Closure Design v3 (PR-1..PR-5)

## TL;DR

Le 5 PR del Closure Design v3 sono **scritte, committate e pushate su `sprint-w4`**. Il Lifecycle Fix Pack (F1–F6) era già chiuso (commit `a9a8315`, v4.26.3). Ogni PR ha il suo mini integration test. **Niente è in produzione** — `sprint-w4` non è mergiato su `main` e le migration **non sono applicate** su Supabase (attendono conferma esplicita di Skeezu).

3 decisioni tecniche le ho prese io durante l'implementazione perché lo spec, applicato alla lettera, aveva un buco — le trovi flaggate sotto al §3, **servono il vostro sign-off**.

## 1. Cosa è stato fatto — PR per PR

| PR | Commit | File | Integration test |
|---|---|---|---|
| PR-2 · counter/ban annullamenti | `f31d1a2` | `20260522130000_..._pr2_seller_cancellation_counter.sql` | strutturale |
| PR-1 · SLA 72h + Caso B + flip timeout | `4967807` | `20260522140000_..._pr1_sla72_caso_b_timeout_flip.sql` | strutturale |
| PR-3 · cleanup consolazione | `70d4ac7` | `20260522150000_..._pr3_cleanup_consolazione.sql` | strutturale |
| PR-4 · gate fee upfront | `3e1e882` | `20260522160000_..._pr4_gate_fee_upfront.sql` | strutturale |
| PR-5 · esito visibile F7/F8 + sold-out | `53eaefe` | `20260522170000_..._pr5_disinnesco_soldout.sql` + `src/dapp.js` + `dapp.html` | strutturale + node --check |

I mini integration test sono **strutturali read-only** (esistenza tabella/funzioni, RLS, REVOKE, source-check via `pg_get_functiondef`): bloccano la migration se lo schema non è coerente. I test **comportamentali** (3 annullamenti → ban, B1 chiusura sottocosto, timeout 72h, ecc.) sono auth-gated/mutanti → vanno fatti in UAT, step al §5.

### PR-2 · counter/ban annullamenti
- Tabella `seller_cancellation_counter` (1 riga/venditore, RLS own-row + admin, GRANT esplicito).
- `register_seller_cancellation`: counter su **anno solare** (reset lazy via `counter_year`), 3+ annullamenti → ban vendita 1 mese, notifica al venditore.
- `is_seller_banned` / `get_seller_cancellation_status` / `unlock_seller_ban` (1000 ARIA, solo durante ban attivo, azzera counter).
- `withdraw_my_submission` v3: counter +1 **solo** se l'airdrop era LIVE (`presale|sale`) al momento del ritiro.
- `submit_object_for_valuation`: gate `SELLER_BANNED` su **entrambi** gli overload (8-arg + 7-arg).

### PR-1 · SLA 72h + Caso B sottocosto + flip timeout
- `detect_airdrop_end_event`: SLA acknowledge **24h → 72h**.
- `seller_acknowledge_airdrop`: solo `accept|annulla` (`auto_accept_silent` non più generato). Calcola Caso A (≥ prezzo minimo) vs Caso B (sottocosto).
- `cron_auto_accept_silent_seller` → **`cron_seller_acknowledge_timeout`**: il timeout non accetta mai. Caso A timeout → annullato + counter. Caso B timeout → B2, niente counter. pg_cron rinominato (`w4_...` → `w5_seller_acknowledge_timeout`).
- Helper `airdrop_seller_payout_eur` (stesso split di `execute_draw`).

### PR-3 · cleanup consolazione
- Rimosso l'**unico** loop top-3 `airdrop_draw_consolation` nel ramo annullamento di `execute_draw`. Nient'altro. Ramo invariato per i ROBI (rullo già accreditato all'acquisto).

### PR-4 · gate fee upfront
- `publish_airdrop_listing`: gate `accettato → presale/sale` richiede `launch_fee_paid`. Vedi §3.3.

### PR-5 · esito visibile F7/F8 + disinnesco sold-out
- BE: `buy_blocks` non setta più `status='closed'` sul sold-out → l'airdrop resta `presale/sale` e `detect_airdrop_end_event` lo porta a `waiting_seller_acknowledge` (senza, il sold-out saltava tutta la closure v3 = F8).
- FE (`dapp.js`): `openDetail` carica gli airdrop conclusi singolarmente invece del fallback marketplace (F7); nuovo `_renderOutcomePanel` mostra esito (vincitore / claim consegna / ROBI) per `completed|annullato|closed|waiting_seller_acknowledge` (F8). Sezioni live-only (countdown, posizione, auto-buy) nascoste sui conclusi.
- Footer + cache-bust `dapp.js` → **4.27.0**.

## 2. Apply order (obbligatorio)

```
PR-2 (130000) → PR-1 (140000) → PR-3 (150000) → PR-4 (160000) → PR-5 (170000)
```

Già garantito dai timestamp delle migration. PR-2 va prima di PR-1 (PR-1 chiama `register_seller_cancellation`). PR-3 riscrive `execute_draw` a partire dalla versione di PR-1.

## 3. Decisioni tecniche — SERVE SIGN-OFF

### 3.1 · PR-2 · `register_seller_cancellation` REVOKE da PUBLIC
Lo spec la descriveva come "helper interno, no grant authenticated". Ma in Postgres `CREATE FUNCTION` concede `EXECUTE` a **PUBLIC** di default: senza un REVOKE esplicito, un authenticated qualsiasi avrebbe potuto chiamarla con un `seller_id` altrui e **bannare un altro venditore**. Aggiunto `REVOKE EXECUTE ... FROM PUBLIC`. Le chiamanti sono tutte SECURITY DEFINER → girano come owner, non si rompono. **Decisione di sicurezza, nessun downside.**

### 3.2 · PR-1 · annulla esplicito di un Caso A → counter +1
Lo spec §6 elenca due trigger del counter: «annullamento esplicito mid-flight» e «timeout 72h su airdrop riuscito». Non nomina il caso «il venditore clicca *annulla* su un Caso A nella finestra acknowledge». Lasciarlo fuori creerebbe un **incentivo perverso**: per schivare il counter basterebbe cliccare *annulla* invece di lasciar scadere. Ho applicato la regola coerente con il razionale Skeezu («l'annullamento deve avere un costo reale»): **qualunque annullamento di un Caso A incrementa il counter — esplicito o per timeout**; Caso B mai. Se preferite la lettura letterale dello spec, ditemelo: è una riga.

### 3.3 · PR-4 · gate fee upfront DORMIENTE (config flag)
`launch_fee_paid` ha `DEFAULT 0` e **in Alpha nessun flusso lo valorizza** (l'addebito fee è Stage 2 con KAS). Un gate hard `launch_fee_paid > 0` bloccherebbe **ogni** pubblicazione in Alpha → nessun airdrop testabile. Ho shippato il gate **ora** ma **dormiente**, controllato da `airdrop_config.enforce_launch_fee_gate` (default `'false'`). A Stage 2, con il rail KAS: flip della config a `'true'` e il gate entra in vigore. Rispetta «metti subito il gate» + «meccanica addebito a Stage 2» senza brickare l'Alpha. **Conferma che questa lettura va bene.**

### 3.4 · PR-1 · `execute_draw` onora `seller_acknowledge_decision='accept'`
Per il Caso B1 («incasso comunque» sottocosto) il ramo successo di `execute_draw` dev'essere forzato — altrimenti il check prezzo minimo interno lo manderebbe in annullato. `execute_draw` ora forza `v_success` quando `seller_acknowledge_decision='accept'`. Il path admin legacy (`execute_draw` diretto senza decisione) mantiene il check classico. Cambio minimo, nessun impatto sul path esistente.

## 4. Stato deploy

- Branch `sprint-w4`, 5 commit pushati. **Non mergiato su `main` → niente in produzione.**
- Migration **non applicate** su Supabase. Quando dai l'ok: `supabase migration up` (o apply mirato), mai SQL raw. Le migration sono idempotenti e auto-verificanti (mini test che abortisce su schema incoerente).

## 5. UAT step (post-apply, ambiente di test)

1. **PR-2 ban**: 3× `withdraw_my_submission` su airdrop live dallo stesso venditore → al 3° `get_seller_cancellation_status` deve dare `banned:true`; `submit_object_for_valuation` → `SELLER_BANNED`; `unlock_seller_ban` con 1000 ARIA → sbloccato + counter 0.
2. **PR-1 Caso A**: airdrop riuscito → `waiting_seller_acknowledge` → `seller_acknowledge_airdrop(accept)` → `completed`, vincitore valorizzato.
3. **PR-1 Caso B1**: airdrop sottocosto → `accept` → `completed` lo stesso (vincitore ottiene l'oggetto), counter invariato.
4. **PR-1 timeout**: lasciar scadere la SLA 72h → `cron_seller_acknowledge_timeout` → `annullato` + refund; counter +1 se Caso A, +0 se Caso B.
5. **PR-3**: airdrop annullato → nessun NFT `airdrop_draw_consolation` generato.
6. **PR-5 F7/F8**: aprire `/dapp/airdrop/:id` di un airdrop `completed` → pannello esito (non fallback marketplace); idem `annullato` e `waiting_seller_acknowledge`.
7. **PR-5 sold-out**: comprare il 100% dei blocchi → l'airdrop NON va `closed`, entro 5 min il cron lo porta a `waiting_seller_acknowledge`.

## 6. Follow-up al go-live v3 (NON in queste PR)

- **`come-funziona-airdrop.html`** — la sezione chiusura/«fallimento» descrive il vecchio auto-fail e la consolazione: **obsoleta con v3**. Va riscritta (Caso A/B, finestra 72h, niente consolazione). È copy pubblica non-tecnica → **lane ROBY**. Da fare **insieme** al go-live v3, non prima (altrimenti la pagina descrive un comportamento non ancora live).
- **`docs/AIROOBI_CONTEXT.md` + `docs/business/AIROOBI_Airdrop_Engine`** — aggiornare la sezione closure quando v3 è applicata.
- **Stage 2**: flip `enforce_launch_fee_gate` → `true`; meccanica addebito fee + payout venditore «100% a conferma» con rail KAS.

## 7. Bottom line

5 PR scritte, testate strutturalmente, pushate. 3 decisioni flaggate (§3.1–3.3) + 1 nota (§3.4) — tutte difendibili, ma voglio il vostro ok prima dell'apply. Niente tocca la produzione finché non date il via su: (a) apply migration su Supabase, (b) merge `sprint-w4 → main`.

Daje — F8 chiuso tondo, la chiusura naturale adesso ha un esito visibile.

Audit-trail: questo file = closing report CCP dell'implementazione Closure Design v3, in risposta a `ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22.md`.

---

*CCP · CIO/CTO Airoobi · Closing Report Closure v3 PR-1..PR-5 · 22 May 2026 · daje team a 4*
