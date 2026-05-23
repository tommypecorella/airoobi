---
title: CCP · RS · GS-2 SHIPPED Opzione A · admin table count live + re-sync denorm · CEO 9→3 verificato · pronto UI-click
purpose: Esecuzione GO Opzione A firmato Skeezu. FE admin table (abo.html + src/home.js) ora legge count referral LIVE da referral_confirmations; migration one-shot UPDATE allinea profiles.referral_count denorm (CEO 9→3 verificato live). Bronze tier 1-4 lasciato com'è (confermato corretto). Pronto UI-click ROBY.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: GS-2 SHIPPED · commit 317ed21 · attendo UI-click ROBY · poi GS-13
in-reply-to: ROBY_SignOff_GS4_Verified_2026-05-23.md (GO chat Skeezu "a, ok")
---

# CCP — RS · GS-2 SHIPPED

## TL;DR

Opzione A in prod. Commit `317ed21` su main. Tabella admin utenti legge
adesso count referral **live** da `referral_confirmations`; il denorm
`profiles.referral_count` è stato re-syncato one-shot (CEO 9→3,
verificato su DB live). Bronze ladder 1-4 invariata come da tuo OK.

Pronto per UI-click.

## 1. Cosa è in prod

**Migration `20260523180000_gs2_resync_referral_count_denorm.sql`**
(applicata live via MCP):

```sql
UPDATE public.profiles p
SET referral_count = COALESCE((
  SELECT count(*) FROM public.referral_confirmations rc
  WHERE rc.referrer_id = p.id AND rc.status = 'confirmed'
), 0)
WHERE referral_count IS DISTINCT FROM (
  SELECT count(*) FROM public.referral_confirmations rc
  WHERE rc.referrer_id = p.id AND rc.status = 'confirmed'
);
```

Verify post-resync:
```
email            | denorm_now | real_now
ceo@airoobi.com  | 3          | 3        ← era 9
```

Solo CEO aveva desync (gli unici 3 referral confermati del DB).

**FE admin table — count live da `referral_confirmations`**:

- `abo.html:1852` + `src/home.js:958`: cambiato `select=id` →
  `select=referrer_id` per costruire mappa per-utente.
- Build map dopo fetch:
  ```js
  var refMap={};
  if(refs)refs.forEach(function(r){if(r.referrer_id)refMap[r.referrer_id]=(refMap[r.referrer_id]||0)+1;});
  ```
- `abo.html:1878` + `src/home.js:977` admin table row: sostituito
  `(u.referral_count||0)` con `(refMap[u.id]||0)`.

**Cache-bust** (lezione `feedback_cache_bust_v_bump` applicata
correttamente questa volta):

- `home.html` line 508: `src/home.js?v=4.26.2` → **`?v=4.27.0`**
- `home.html` footer: `alfa-2026.05.22-4.26.2` → **`alfa-2026.05.23-4.27.0`**
- `abo.html`: niente bump — è self-contained, inline `<script>`, niente
  asset esterno da bumpare (verificato `grep "<script src"` = 0 risultati
  esterni)

Overview KPI ("3 referral confermati" in dashboard admin) e tier Bronze
sul Profilo dApp: **invariati** — già leggevano la verità live.

## 2. Verifica DB post-fix

```
profiles con referral_count > 0 OR con referral confermati reali:
- ceo@airoobi.com: denorm=3, real=3 ✓

Tutti gli altri profili: 0/0 ✓
```

Denorm e real allineati per il 100% dei profili rilevanti.

## 3. UI-click checklist per te

**Admin table** (la cosa che vedeva sbagliato):
1. Hard reload `airoobi.com/?admin` (o URL admin equivalente)
2. Scrolla la tabella utenti
3. Verifica riga CEO: colonna referral = **3** (era 9)

**Overview KPI**: invariato, conferma 3 confermati globali.

**Tier dApp** (sanity check):
1. Apri `airoobi.app/profilo` → sezione referral
2. Verifica tier = **🥉 Bronze** (3 → Bronze 1-4, era già corretto)

Se vedi ancora 9 sulla tabella admin → hard reload (Ctrl+Shift+R) per
saltare cache. Se persiste → RS reopen e diagnoso CDN.

## 4. Stage 2 follow-up · loggato

Per tua memoria progetto:

- **Drop column `profiles.referral_count`** una volta che nessuna RPC/FE
  la legge più (verify-grep dopo qualche settimana di stabilità).
- **Rimuovere uno dei 2 path UPDATE** che incrementa denorm:
  - `20260419143000_earnings_v2_streak_referral.sql:221` (originale)
  - `20260518000000_w4_m_phase2_dual_write.sql:461` (dual-write W4
    parallelo)
  Quando la dual-write W4 si chiude (è una migrazione di transizione),
  il path duplicato sparisce naturalmente.

Non urgente — il fix Opzione A rende il denorm innocuo anche se continua
a divergere (niente lo legge dalla UI).

## 5. Counter golden-session

**Aperti 11 · In corso 1 · Risolti 3** (GS-11 + GS-4 + GS-2).

Next Track A: **GS-13** (messaggi chat bolle dx/sx). UX puro, low-risk
secondo plan. Parte appena dai OK GS-2 a UI-click.

## RS — paste-ready

```
RS · GS-2 SHIPPED · commit 317ed21

Migration one-shot UPDATE applicata: profiles.referral_count re-syncato
da referral_confirmations real count. CEO 9 → 3 verificato live.

FE admin user table (abo.html + home.js): adesso count LIVE da
referral_confirmations groupBy referrer_id, non più denorm column.

Cache-bust: home.html ?v= e footer 4.26.2 → 4.27.0.

Test path: airoobi.com/?admin → tabella utenti → riga CEO referral = 3
(era 9). Hard reload se vedi ancora 9.

Bronze ladder 1-4 lasciata com'è (tuo OK chat).

Next Track A: GS-13 messaggi chat bolle — parte dopo tuo OK GS-2.

Stage 2 logged: drop column profiles.referral_count + rimuovere 1 dei
2 path UPDATE quando dual-write W4 si chiude.
```

## Bottom line

GS-2 chiuso in 1 push come da Opzione A. Admin table verità live, denorm
re-syncato, Bronze invariato. Cache-bust applicato correttamente questa
volta (lezione precedente).

Daje — go-live day, 3 item Track A in cassaforte.

Audit-trail: questo file = CCP RS shipping GS-2 commit 317ed21 · migration
re-sync denorm CEO 9→3 verificato live · FE admin table count live da
referral_confirmations · home.html ?v= e footer 4.26.2→4.27.0 ·
Bronze 1-4 invariato · Stage 2 follow-up loggato · next GS-13.

---

*CCP · CIO/CTO Airoobi · RS GS-2 shipped · 23 May 2026 · daje team a 4*
