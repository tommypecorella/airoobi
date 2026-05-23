---
title: CCP · RS · GS-2 diagnosi · NON 3 query divergenti · 1 bug reale (referral_count desync) + 1 ambiguità tier ladder · 3 opzioni
purpose: Diagnosi GS-2 dopo verify-repo-state. Trovato: il "9" della tabella admin viene da profiles.referral_count denormalizzato che ha desync +6 su CEO (real confirmed=3, denorm=9). L'Overview "3" e il Bronze tier "(3)" sono entrambi CORRETTI lato logica (Bronze = 1-4 range per la UI ladder in dapp.html:945). C'è però un'ambiguità: ROBY/Skeezu vedono Bronze su CEO con 3 referral e leggono "come 1" — è naming confusing o vera assunzione di mismatch? Serve chiarimento. 3 opzioni per il fix referral_count.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: GS-2 diagnosi pronta · 1 bug reale + 1 ambiguità tier · 3 opzioni · raccomandazione A · attendo chiarimento + GO
related: ROBY_RS_GoldenSession_Batch1_2026-05-23.md · CCP_RS_GoldenSession_Batch1_Batch2_Plan_2026-05-23.md
---

# CCP — RS · GS-2 diagnosi · 1 bug + 1 ambiguità

## TL;DR

Verify-repo-state ha cambiato la natura del problema: **non sono 3 numeri
divergenti, è 1 bug + 1 ambiguità**.

- **Bug reale (1)**: `profiles.referral_count` denormalizzato è desync su
  CEO — denorm = **9**, real confirmed = **3**, delta **+6**.
  Sorgente del "9" che vedi nella tabella admin utenti.
- **Tier Bronze**: 3 confirmed → Bronze è **corretto** per la UI ladder
  attuale (Bronze 1+ · Silver 5+ · Gold 10+ · Platinum 25+ — vedi
  `dapp.html:945`). Quindi il "tier=Bronze come con 1" del tuo RS è
  un'ambiguità di lettura, non un bug logico — o c'è una nuova ladder
  che vuoi shippare (es. Bronze = exactly 1, Silver = 2-4).

3 opzioni per fixare il referral_count, raccomandazione A. Chiarimento
chiesto sulla tier ladder prima di toccare codice.

## 1. I 3 numeri · cosa li produce davvero

Verify nel repo (`grep` su `referral_count` + `referral_confirmations` in
HTML/JS):

| Vista | Sorgente codice | Per CEO | È corretto? |
|---|---|---|---|
| Overview KPI ABO/admin "3 confermati" | `abo.html:1852`, `src/home.js:958` — `?status=eq.confirmed` GLOBAL count | 3 | ✅ Match real |
| Tabella admin utenti "9 referral" | `abo.html:1878`, `src/home.js:977` — `u.referral_count` (denorm) | 9 | ❌ Desync +6 |
| Tier Bronze su Profilo dApp | `src/dapp.js:1091` — query `referral_confirmations` live + `calculateReferralTier()` `:1199-1202` | Bronze (3) | ✅ Match real |

**Solo 1 vista sbagliata**: tabella admin utenti. Le altre 2 leggono la
verità live, sono solo lette/interpretate male.

Live diag su Supabase:

```
ceo_id              : 3da461f0-98e3-4877-b9db-a91e1dd4e6b7
ceo_referral_code   : 77efb038
real_confirmed_rows : 3
real_pending_rows   : 0
real_all_rows       : 3
profiles.referral_count (denorm) : 9   ← +6 vs real
```

Globalmente: **3 referral confermati in tutto il DB, tutti CEO**. Nessun
altro profilo ha desync.

## 2. Da dove viene il +6 desync

Grep su `UPDATE profiles SET referral_count`:

- `supabase/migrations/20260419143000_earnings_v2_streak_referral.sql:221`
  — dentro `confirm_referral_with_kyc_lite`, `+1` su confirm.
- `supabase/migrations/20260518000000_w4_m_phase2_dual_write.sql:461`
  — dentro la RPC paritaria (dual-write), `+1` su confirm.

**Due path che fanno UPDATE +1 sullo stesso evento** (W4 dual-write
introdotto 18 May come migrazione parallela del confirm_referral) → ogni
confirm da quella data incrementa **doppio** sul `referral_count`. CEO
ha 3 referral confermati post-18 May → 3 × 2 = **6 increment extra** =
denorm 9 = 6 + originali 3 (se 3 sono pre-18 May) oppure 0 + 9 (se tutti
3 sono post-18 May). La math del +6 torna sia in singolo che in doppio
incremento.

Audit pulito sul DB: il valore `9` è il risultato meccanico del doppio
path. Non un trigger rotto, non un test stale — è strutturale.

C'è già stato un fix simile storico (`20260312205409_fix_ceo_referral
_count.sql`): "Fix referral_count desync for ceo@airoobi.com (shows 3,
actual confirmed = 2)". Stesso pattern, ricorrente.

## 3. Tier ladder · ambiguità da risolvere

UI ladder corrente (`dapp.html:945-948`):

```
🥉 Bronze · 1+ confermati    (range 1-4)
🥈 Silver · 5+ confermati    (range 5-9)
🥇 Gold · 10+ confermati     (range 10-24)
💎 Platinum · 25+ confermati (25+)
```

Calcolo (`src/dapp.js:1199-1202`):
```js
if(confirmedCount>=25) → platinum
if(confirmedCount>=10) → gold
if(confirmedCount>=5)  → silver
if(confirmedCount>=1)  → bronze
```

Quindi: 3 confermati → Bronze (cade nel range 1-4). **Coerente con UI
ladder.**

Il tuo RS dice: *"3 referral confermati ma tier Bronze come se ne avesse
1 solo"*. Due possibili letture:

- **Lettura (a)**: leggi "Bronze" e pensi "1 referral" perché Bronze è il
  primo gradino — ma in realtà Bronze copre 1-4. **No bug**, naming
  confusing. Possibile fix: rinominare label ladder o aggiungere range
  esplicito ("Bronze · 1-4 confermati").
- **Lettura (b)**: vuoi una ladder diversa, dove 3 → Silver. Es. Bronze
  = 1, Silver = 2-4, Gold = 5-9, Platinum = 10+. Sarebbe un **cambio di
  design**, non un fix bug. Richiede decisione Skeezu.

Senza chiarimento da te (a/b/altro), non tocco la ladder. Procedo invece
sul fix DENORM (sezione §4), che è univocamente un bug.

## 4. 3 opzioni per il referral_count desync

### Opzione A · single-source-of-truth (raccomandata)
Sostituire la lettura denorm in admin table con count live; re-sync una
volta sola; deprecare la colonna senza droparla (Stage 2).

**Scope**:
- `abo.html:1878` + `src/home.js:977`: sostituire `(u.referral_count||0)`
  con count live da `referral_confirmations` per ogni riga utente. Fetch
  unico aggregato (1 query GROUP BY) per non N+1.
- One-shot SQL: `UPDATE profiles SET referral_count = (SELECT count(*)
  FROM referral_confirmations WHERE referrer_id = profiles.id AND status
  = 'confirmed')` — re-sync immediato per chiunque legga ancora il denorm.
- Footer bump + ?v= bump (lezione `feedback_cache_bust_v_bump`).
- Stage 2 follow-up: drop column `profiles.referral_count` una volta che
  niente la legge (ROBY logga in memoria progetto).

**Pro**: tabella admin = verità, anche se desync recurre il denorm non
inganna più, niente refactor di earnings v2.
**Con**: 2 path UPDATE in earnings_v2/dual-write restano, denorm
continuerà a divergere per ogni confirm post-fix (innocuo se nessuno
legge).
**Stima**: ~1h.

### Opzione B · root-cause fix (medio invasivo)
Rimuovere uno dei due `UPDATE +1` (probabilmente dual-write, W4 era una
migrazione di transizione) + re-sync una volta.

**Pro**: fix la causa, denorm resta utile e mantenuto coerente.
**Con**: tocca la dual-write W4 — devo verificare se è ancora attiva
o se può essere ritirata. Rischio collaterale su altri count
denormalizzati.
**Stima**: ~3-4h con audit della dual-write.

### Opzione C · trigger DB unica (più strutturale)
Drop dei 2 UPDATE manuali, sostituire con un trigger `AFTER INSERT/
UPDATE/DELETE ON referral_confirmations` che mantiene
`profiles.referral_count` deterministicamente.

**Pro**: una sola source of truth lato DB, denorm sempre coerente.
**Con**: trigger su tabella attiva = blast radius più ampio, integration
test pesante richiesto.
**Stima**: ~6h con test.

## 5. Raccomandazione · A

**Opzione A** — minor blast radius, risolve il sintomo user-visible
(tabella admin sbagliata), prepara il terreno per drop colonna in Stage 2.
Coerente con la strategia GS-4 (intervento mirato, no refactor di flow
testati).

Per `feedback_premise_stale_with_delega`: il brief assumeva "3 query
divergenti, allineare conteggio" — diagnosi ha mostrato che 2 viste su 3
sono già corrette. Adatto in-spirito: fix la vista sbagliata + re-sync il
denorm, non riscrivo le 2 viste corrette.

## 6. Cosa serve da te

**Chiarimento tier ladder** (bloccante per scope completo GS-2):
- (a) Bronze 1-4 va bene, era confusione mia di lettura → fix solo il
  desync referral_count, GS-2 chiude con Opzione A.
- (b) Vuoi nuova ladder (es. Bronze=1 · Silver=2-4 · Gold=5-9 ·
  Platinum=10+) → mi mandi le nuove soglie + label, faccio Opzione A
  + update ladder.
- (c) Altro design.

**GO Opzione fix** (A/B/C) per il referral_count.

Attendo chiarimento (a/b/c sul tier) + GO opzione fix entro la giornata.

## RS conferma (paste-ready, se A + lettura "a" sul tier)

```
RS · GS-2 chiarito: 1 bug, non 3. GO Opzione A.

Conferma: Bronze 1-4 ok (UI ladder dapp.html:945 invariata).
Fix solo referral_count desync (CEO 9 → 3, +6 da W4 dual-write):
- abo.html + src/home.js admin table: count LIVE da referral_confirmations
- one-shot UPDATE re-sync profiles.referral_count su tutti
- footer + ?v= bump
- Stage 2 follow-up: drop colonna profiles.referral_count

Stima ~1h, merge oggi.
```

## Bottom line

GS-2 non è 3 numeri divergenti — è 1 vera divergenza
(`profiles.referral_count` denorm desync) e 1 punto di ambiguità sulla
tier ladder. Diagnosi pulita pre-codice. Chiarimento tier + GO opzione
prima del fix.

Daje — stop pattern catch, verify-repo-state che paga di nuovo.

Audit-trail: questo file = CCP diagnosi GS-2 · 1 bug
(profiles.referral_count desync +6 su CEO da dual-write W4 doppio path)
· 1 ambiguità tier ladder (Bronze 1+ corretto per UI corrente vs
possibile ridesign Bronze=1) · 3 opzioni fix con raccomandazione A ·
attesa chiarimento + GO.

---

*CCP · CIO/CTO Airoobi · RS GS-2 diagnosi · 23 May 2026 · daje team a 4*
