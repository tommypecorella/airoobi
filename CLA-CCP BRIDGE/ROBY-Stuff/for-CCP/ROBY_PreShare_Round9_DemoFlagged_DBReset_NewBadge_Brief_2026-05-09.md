---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Round 9 PRE-SHARE · Demo Flagged + DB Reset + New Badge "AIROOBI ALPHA LIVE - stay together" + Onboarding Update · CRITICAL operation pre referral share Skeezu
date: 2026-05-09
ref: visual review Skeezu unica + directive "ci sono molti airdrop test online, partire vuoto?" + directive "reset DB · azzera ARIA+ROBI · grant 100 ARIA + 5 ROBI + nuovo badge a tutti"
status: BRIEF READY · CCP impl Round 9 atteso · CRITICAL DB reset operation · sequenziale post Round 8 SHIPPED · v4.11.0
---

# Round 9 · PRE-SHARE Demo Flagged + DB Reset + New Badge

## TL;DR

Skeezu sta per iniziare share referral link. Prima del share, **CRITICAL DB reset + visual demo flagged + new welcome badge**:

1. **Demo Flagged** marketplace (Opzione C approvata): badge "DEMO ALPHA" su card + banner top + disclaimer detail
2. **DB Reset:** azzera ARIA + ROBI tutti 7 user esistenti
3. **New Badge "AIROOBI ALPHA LIVE - stay together"** + 5 ROBI welcome reward
4. **Onboarding Update:** future signups + existing users start con **100 ARIA + 5 ROBI + 2 badge** (Alpha Brave esistente + nuovo "AIROOBI ALPHA LIVE")

**ETA calibrato 1-1.5h CCP atomic.** Sequenziale post Round 8 SHIPPED. NO race condition.

**Operazione DB irreversibile** — execution in transaction + verify pre-commit.

---

## SECTION A · Demo Flagged marketplace (Opzione C)

### A.1 · Badge "DEMO ALPHA" su ogni airdrop card

**HTML edit dapp.html airdrop card template** (recon CCP per identify class):

```html
<!-- Inside .airdrop-card, near top-right corner -->
<span class="airdrop-badge-demo">
  <span class="it" lang="it">DEMO ALPHA</span>
  <span class="en" lang="en">ALPHA DEMO</span>
</span>
```

**CSS extension dapp-v2-g3.css Round 9 section:**

```css
.airdrop-badge-demo {
  display: inline-block;
  background: rgba(247,54,89,0.12);
  color: var(--airoobi-coral, #F73659);
  border: 1px solid var(--airoobi-coral);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 3px;
  text-transform: uppercase;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
}
```

### A.2 · Banner top marketplace `/airdrops`

```html
<!-- Inserire SOPRA il marketplace grid, sotto search/filter toolbar -->
<div class="marketplace-demo-banner">
  <div class="marketplace-demo-banner-icon">⚠️</div>
  <div class="marketplace-demo-banner-content">
    <strong class="it" lang="it">Marketplace in fase Alpha · prodotti dimostrativi</strong>
    <strong class="en" lang="en">Marketplace in Alpha phase · demonstrative items</strong>
    <p class="it" lang="it">Questi airdrop sono test per imparare a usare AIROOBI: partecipa gratis, accumula <strong>ROBI reali</strong>, costruisci la tua posizione. <strong>Stage 1 con prodotti veri parte al raggiungimento dei 1.000 Alpha Brave</strong> (<span id="banner-counter">993</span>/1000).</p>
    <p class="en" lang="en">These airdrops are tests to learn how to use AIROOBI: participate for free, accumulate <strong>real ROBI</strong>, build your position. <strong>Stage 1 with real items launches when 1,000 Alpha Brave members are reached</strong> (<span id="banner-counter-en">993</span>/1000).</p>
  </div>
</div>
```

```css
.marketplace-demo-banner {
  display: flex;
  gap: 16px;
  background: rgba(247,54,89,0.06);
  border-left: 4px solid var(--airoobi-coral);
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 24px;
}
.marketplace-demo-banner-icon { font-size: 1.5rem; flex-shrink: 0; }
.marketplace-demo-banner-content strong { display: block; color: var(--airoobi-ink); margin-bottom: 6px; font-size: 0.95rem; }
.marketplace-demo-banner-content p { font-size: 0.85rem; color: var(--airoobi-ink-muted); margin: 0; line-height: 1.5; }
```

### A.3 · Disclaimer micro detail page `/airdrops/:id`

```html
<!-- Inserire sotto h1 titolo airdrop -->
<p class="airdrop-detail-demo-note">
  <span class="it" lang="it">💡 <em>Demo Alpha — partecipa per imparare il sistema, accumuli ROBI veri.</em></span>
  <span class="en" lang="en">💡 <em>Alpha Demo — participate to learn the system, you accumulate real ROBI.</em></span>
</p>
```

```css
.airdrop-detail-demo-note {
  background: rgba(247,54,89,0.04);
  border-left: 2px solid var(--airoobi-coral);
  padding: 10px 14px;
  margin: 12px 0 20px;
  font-size: 0.85rem;
  color: var(--airoobi-ink-muted);
}
.airdrop-detail-demo-note em { color: var(--airoobi-ink); font-style: italic; }
```

---

## SECTION B · DB Reset (CRITICAL)

### B.1 · SQL Migration `20260510_alpha_live_reset.sql`

**⚠️ CRITICAL OPERATION — irreversibile. Execution in transaction + verify pre-commit.**

```sql
-- Migration: 20260510_alpha_live_reset.sql
-- ALPHA LIVE Reset · azzera ARIA+ROBI tutti users + grant welcome 100 ARIA + 5 ROBI + new badge

BEGIN;

-- Step 1: Reset ARIA balance tutti users (set to 0)
UPDATE public.profiles
SET total_points = 0
WHERE total_points > 0;

-- Step 2: Reset ROBI count tutti users (set to 0)
-- Si nft_rewards table tracks ROBI per-user, soft delete o archive
-- Verificare schema: probabile tabella nft_rewards con user_id, amount, granted_at
UPDATE public.nft_rewards
SET amount = 0, archived_at = NOW(), archive_reason = 'alpha_live_reset_2026_05_10'
WHERE amount > 0 AND archived_at IS NULL;

-- Step 3: Reset checkin streak storia
-- Verificare schema: probabile tabella checkins per user
DELETE FROM public.checkins WHERE created_at < NOW();

-- Step 4: Reset video_views (era già SOSPESO ma per sicurezza azzera)
DELETE FROM public.video_views WHERE created_at < NOW();

-- Step 5: Reset airdrop_participations (utenti perdono storia partecipazione airdrop test)
-- DECISIONE Skeezu: vogliamo azzerare anche partecipazioni o solo ARIA+ROBI?
-- Default ROBY: AZZERA tutto (storia parte da zero "AIROOBI ALPHA LIVE")
DELETE FROM public.airdrop_participations WHERE created_at < NOW();

-- Step 6: Reset airdrop_blocks (utenti perdono blocchi acquistati su demo)
DELETE FROM public.airdrop_blocks WHERE created_at < NOW();

-- Step 7: Archive points_ledger storia pre-reset
-- Don't DELETE, archive con flag (audit-trail history preserved)
UPDATE public.points_ledger
SET archived = true, archived_at = NOW(), archive_reason = 'alpha_live_reset_2026_05_10'
WHERE created_at < NOW() AND (archived IS NULL OR archived = false);

-- Step 8: Grant 100 ARIA welcome a tutti existing users
INSERT INTO public.points_ledger (user_id, amount, reason, metadata, created_at)
SELECT id, 100, 'alpha_live_welcome_aria',
       jsonb_build_object('grant_event', 'alpha_live_reset_2026_05_10'),
       NOW()
FROM public.profiles;

-- Update profiles.total_points di conseguenza
UPDATE public.profiles SET total_points = 100;

-- Step 9: Grant 5 ROBI welcome (badge reward) a tutti existing users
-- Verificare schema nft_rewards table
INSERT INTO public.nft_rewards (user_id, amount, reason, metadata, created_at)
SELECT id, 5, 'alpha_live_welcome_badge',
       jsonb_build_object('grant_event', 'alpha_live_reset_2026_05_10', 'badge_id', 'alpha_live_stay_together'),
       NOW()
FROM public.profiles;

COMMIT;
```

**⚠️ Pre-commit verify:**
```sql
-- Verifica zero residue ARIA o ROBI
SELECT id, email, total_points FROM profiles WHERE total_points != 100;
-- Should return 0 rows

SELECT user_id, SUM(amount) as total_robi FROM nft_rewards
WHERE archived_at IS NULL
GROUP BY user_id HAVING SUM(amount) != 5;
-- Should return 0 rows
```

### B.2 · Decisioni residue Skeezu DB Reset

CCP, **PRIMA del COMMIT confirmation Skeezu su:**

1. **Step 5 azzeramento airdrop_participations:** vogliamo davvero cancellare anche storia partecipazioni airdrop test? Sì = pulizia totale "alpha live" / No = mantieni history demo per gamification continuity. **Mio default: SÌ azzera (storia inizia ALPHA LIVE).**

2. **Step 6 azzeramento airdrop_blocks:** stessa decisione. **Mio default: SÌ azzera.**

3. **Step 7 archive points_ledger:** SOFT archive con flag (preserva audit-trail) vs HARD DELETE (no recovery possibile). **Mio default: SOFT archive (audit safety).** Verifica se schema points_ledger ha colonna `archived` o se serve aggiungerla.

4. **Schema verify pre-execute:** CCP DEVE verificare colonne reali (nft_rewards.amount? archived_at? schema points_ledger?) prima di eseguire migration. Se schema diverge da ipotesi, adapta + reporta in §A Discoveries.

5. **Backup snapshot pre-reset:** raccomandato Supabase backup snapshot pre-execution (rollback safety). Skeezu confirm.

---

## SECTION C · New Badge "AIROOBI ALPHA LIVE - stay together"

### C.1 · Badge schema verify

CCP recon: verificare schema badges table esistente. Probable structure:
- `badges` table: `id TEXT PK, name TEXT, description TEXT, icon TEXT, tier TEXT, granted_event TEXT`
- `user_badges` table (M:N): `user_id UUID, badge_id TEXT, granted_at TIMESTAMPTZ`

Se schema diverge, adapt + reporta.

### C.2 · Insert new badge

```sql
INSERT INTO public.badges (id, name_it, name_en, description_it, description_en, icon, tier, granted_event, created_at)
VALUES (
  'alpha_live_stay_together',
  'AIROOBI ALPHA LIVE - stay together',
  'AIROOBI ALPHA LIVE - stay together',
  'Sei dentro dal momento in cui AIROOBI è andato live in Alpha. Stay together.',
  'You are in from the moment AIROOBI went live in Alpha. Stay together.',
  '🚀',
  'alpha_live',
  'alpha_live_2026_05_10',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name_it = EXCLUDED.name_it,
  name_en = EXCLUDED.name_en,
  description_it = EXCLUDED.description_it,
  description_en = EXCLUDED.description_en,
  icon = EXCLUDED.icon;
```

### C.3 · Grant badge a tutti existing 7 users

```sql
INSERT INTO public.user_badges (user_id, badge_id, granted_at)
SELECT id, 'alpha_live_stay_together', NOW()
FROM public.profiles
ON CONFLICT (user_id, badge_id) DO NOTHING;
```

**Verify post-grant:**
```sql
SELECT p.email, COUNT(ub.badge_id) as badges_count
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id
GROUP BY p.email;
-- Each user should have 2 badges: alpha_brave (existing) + alpha_live_stay_together (new)
```

### C.4 · Future signup auto-grant

CCP edit signup flow (probabilmente Edge Function `signup-guard` o trigger DB):

```sql
-- Trigger auto-grant badges on profile insert
CREATE OR REPLACE FUNCTION public.grant_welcome_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Grant Alpha Brave badge (existing logic, verify if already granted by signup-guard)
  INSERT INTO public.user_badges (user_id, badge_id, granted_at)
  VALUES (NEW.id, 'alpha_brave_tier_0', NOW())
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  -- Grant Alpha Live - stay together badge (NEW)
  INSERT INTO public.user_badges (user_id, badge_id, granted_at)
  VALUES (NEW.id, 'alpha_live_stay_together', NOW())
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  -- Grant 100 ARIA welcome
  INSERT INTO public.points_ledger (user_id, amount, reason, metadata, created_at)
  VALUES (NEW.id, 100, 'alpha_live_welcome_aria',
          jsonb_build_object('grant_event', 'alpha_live_signup'),
          NOW());

  -- Update profile total_points
  UPDATE public.profiles SET total_points = total_points + 100 WHERE id = NEW.id;

  -- Grant 5 ROBI welcome (badge reward)
  INSERT INTO public.nft_rewards (user_id, amount, reason, metadata, created_at)
  VALUES (NEW.id, 5, 'alpha_live_welcome_badge',
          jsonb_build_object('grant_event', 'alpha_live_signup', 'badge_id', 'alpha_live_stay_together'),
          NOW());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_grant_welcome_badges ON public.profiles;
CREATE TRIGGER trigger_grant_welcome_badges
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.grant_welcome_badges();
```

**⚠️ NB:** se signup-guard Edge Function già grant Alpha Brave + welcome, il trigger può creare duplicati o conflict. CCP recon signup flow attuale + decide se:
- (a) Trigger DB nuovo (semplice, declarative) → richiede check no overlap con signup-guard
- (b) Edit signup-guard Edge Function (più complesso ma single source of truth)

**Mio default (b)** se signup-guard esiste e grant Alpha Brave: edit lì per coerenza single-source-of-truth. Se non esiste, (a) trigger.

---

## SECTION D · Treasury wire ROBI value calculation

**Verifica esistente:** ROBI value calc già wired in `/portafoglio` + `/airdrops/:id` scoring panel (Round 5). Formula: `ROBI_eur_value = treasury_balance / total_robi_circulating` o variant.

**Action CCP:** verifica che dopo DB reset + grant 5 ROBI welcome × 7 utenti (= 35 ROBI new in circulation), il calc treasury formula funzioni correttamente. Se treasury non ha balance ancora, valore ROBI può essere 0 (acceptable per Alpha) o fixed seed value (es. €1 per ROBI come reference).

**Decisione Skeezu pending:** initial treasury seed value? Default ROBY: lascia formula esistente (treasury reale post-deploy, può essere 0 o valore minimo seed da Skeezu manual).

---

## Acceptance criteria post-deploy v4.11.0

Smoke verify:

### Demo Flagged
1. ✅ `/airdrops` marketplace card → badge "DEMO ALPHA" coral visible top-right ogni card
2. ✅ `/airdrops` top → banner coral "Marketplace in fase Alpha" + counter wire 993/1000
3. ✅ `/airdrops/:id` detail → disclaimer micro "Demo Alpha — accumuli ROBI veri" sotto titolo

### DB Reset
4. ✅ Tutti 7 utenti existing → `total_points = 100`
5. ✅ Tutti 7 utenti existing → `nft_rewards SUM(amount) WHERE archived_at IS NULL = 5`
6. ✅ `points_ledger` pre-reset entries archived (non deleted)
7. ✅ `airdrop_participations` cleared (se Skeezu approva Step 5)
8. ✅ `airdrop_blocks` cleared (se Skeezu approva Step 6)
9. ✅ `checkins` cleared
10. ✅ `video_views` cleared

### New Badge
11. ✅ `badges` table → row `alpha_live_stay_together` inserito con name+description bilingue
12. ✅ `user_badges` → ogni user existing ha 2 badges (alpha_brave + alpha_live_stay_together)
13. ✅ Trigger `grant_welcome_badges` attivo su profiles insert (test E2E con signup nuovo user)

### Onboarding nuovi user
14. ✅ Nuovo signup → start con 100 ARIA + 5 ROBI + 2 badge (alpha_brave + alpha_live_stay_together)

### Treasury
15. ✅ ROBI value calc rendering in /portafoglio + scoring panel coerente post-reset (formula esistente preserved)

---

## ETA stima calibrata

| Phase | ETA |
|---|---|
| CCP recon schema (profiles, nft_rewards, badges, user_badges, points_ledger, signup-guard) | 10-15 min |
| SECTION A · Demo Flagged (badge + banner + disclaimer) HTML+CSS | 15-20 min |
| SECTION B · DB Reset migration (transaction + verify pre-commit) | 20-30 min |
| SECTION C · New badge insert + grant existing + trigger future | 15-20 min |
| Smoke local (verify queries) + smoke prod check | 10 min |
| Version bump 4.10.0 → 4.11.0 + commit + push | 5 min |
| Audit-trail file | 10 min |
| **TOTAL nominale** | **1.5-2h** |

ETA calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~45 min - 1h CCP**.

---

## Pattern operativi

- **CRITICAL DB reset operation** — verify schema pre-execute + transaction + soft archive (no hard delete) + backup snapshot pre-execution raccomandato
- NO sed cascade · Edit chirurgici + grep verify
- Bilingue inline IT+EN preservato 100%
- Brand v2.2 + Voice Principle 04 STRICT
- Audit-trail immediate post-commit (file CCP_*.md generato CONTESTUALMENTE)
- §A Discoveries documented if 3+ schema divergences

---

## Closing

Round 9 PRE-SHARE critical: Demo Flagged + DB Reset + New Badge + Onboarding Update.

Skeezu directive: "fatto questo posso condividere" → questo Round è il **GO/NO-GO per share referral link**. Una volta Round 9 SHIPPED + verify, Skeezu può lanciare share campagna /invita Round 8 con marketplace coerente + utenti existing reset + nuovi signup automatici welcome.

Sequenza:
1. Round 8 (/invita content rewrite) SHIPPED
2. **Round 9 (this) SHIPPED** — DB reset + demo flagged + badge
3. ROBY sign-off ack Round 9
4. Skeezu visual review v4.11.0
5. **Skeezu condivide referral link** 🚀

CCP, daje Round 9 — operazione critica ma essenziale per acquisition window pulita.

⚠️ **5 decisioni Skeezu pending PRIMA del DB reset COMMIT** (vedi §B.2):
1. Step 5 airdrop_participations azzerare? Default SÌ
2. Step 6 airdrop_blocks azzerare? Default SÌ
3. Step 7 points_ledger soft archive (no hard delete)? Default SÌ soft
4. Schema verify (CCP recon prima del COMMIT)
5. Backup snapshot Supabase pre-execution? Raccomandato.

CCP, dopo recon schema, riporta a Skeezu via `for-CCP/CCP_Question_Round9_DBReset_Schema_*.md` se ambiguità — meglio asking 1 round comunicazione che committing wrong DB op.

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (Round 9 PRE-SHARE Demo Flagged + DB Reset + New Badge "AIROOBI ALPHA LIVE - stay together" + Onboarding Update · CRITICAL operation pre Skeezu share campagna referral · ETA calibrato 45 min - 1h · 5 decisioni Skeezu pending pre-COMMIT)*
