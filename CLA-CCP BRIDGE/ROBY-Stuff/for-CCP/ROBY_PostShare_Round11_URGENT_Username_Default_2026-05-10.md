---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: ⚠️ ROUND 11 URGENT · BUG CRITICAL signup blocker · null username · primo referral Sal Fabrizio bloccato · mea culpa ROBY #5 schema design
date: 2026-05-10
ref: Skeezu screenshot iOS WhatsApp browser signup error · ref=77efb038 Sal Fabrizio bloccato · handle_new_user trigger non popola username default
status: BRIEF URGENT · CCP fix immediate atteso · ETA calibrato 10-20 min · share campagna BLOCCATA fino a fix
---

# ⚠️ ROUND 11 URGENT · Signup Blocker · Username Default Generation

## TL;DR

**SHARE CAMPAGNA REFERRAL BLOCCATA.** Primo signup nuovo user (Sal Fabrizio, ref=77efb038 Skeezu) fallisce con `null value in column "username" of relation "profiles" violates not-null constraint`.

**Root cause:** Round 6 migration ha aggiunto `profiles.username TEXT UNIQUE NOT NULL` + backfill 7 existing users. Per future signup, `handle_new_user` trigger / `claim_welcome_grant` RPC NON popolano `username` → INSERT fails.

**Mea culpa ROBY #5 brief Round 6:** brief schema design specificava NOT NULL constraint MA NON ha esplicitato logic generazione username default per future signup. Gap emerso solo al primo real signup post-share.

**Fix URGENT:** edit `handle_new_user` trigger (o `claim_welcome_grant` RPC chain) per generare username default tramite pattern Round 6 backfill (`LOWER(email_prefix) + '_' + SUBSTRING(id::text, 1, 4)`).

ETA stima 10-20 min CCP atomic.

**Skeezu directive needed:** comunicare a Sal Fabrizio "scusa, fix in corso, riprova tra 15 min" tramite WhatsApp parallel.

---

## Diagnosis

### Schema attuale (Round 6 migration)

```sql
profiles.username TEXT UNIQUE NOT NULL
+ idx_profiles_username_unique ON LOWER(username)
+ CHECK constraint username_format ~ '^[a-z0-9_]{3,30}$'
```

### Signup flow attuale (broken)

1. User submit form signup → email + password + ref code
2. Supabase Auth insert in `auth.users`
3. Trigger `handle_new_user` su `auth.users INSERT` → INSERT in `public.profiles`
4. **❌ INSERT profiles NON popola `username` column → NULL → NOT NULL constraint fails**
5. Trigger rollback → signup error visibile a user

### Backfill pattern Round 6 (existing users)

```sql
UPDATE profiles
SET username = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9_]', '_', 'g'))
              || '_' || SUBSTRING(id::text, 1, 4)
WHERE username IS NULL;
```

**Examples backfilled:**
- ceo@airoobi.com → `ceo_3da4`
- paprikarouge7@gmail.com → `paprikarouge7_e999`
- bure.gb@gmail.com → `bure_gb_4c9b`

### Pattern fix proposed

`handle_new_user` trigger esistente (Round 9 Discovery 2) deve essere esteso per popolare `username` default usando stesso pattern Round 6 backfill PRIMA di INSERT in profiles.

---

## SQL Fix proposed (paste-friendly)

```sql
-- Round 11 URGENT · handle_new_user trigger fix username default

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email_prefix TEXT;
  v_username TEXT;
  v_id_suffix TEXT;
  v_attempt INT := 4;
BEGIN
  -- Generate username default (mirror Round 6 backfill pattern)
  v_email_prefix := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '_', 'g'));
  v_id_suffix := SUBSTRING(NEW.id::text, 1, 4);
  v_username := v_email_prefix || '_' || v_id_suffix;

  -- Truncate if exceeds 30 char constraint (rare for email prefix < 25 char)
  IF LENGTH(v_username) > 30 THEN
    v_username := SUBSTRING(v_email_prefix, 1, 25) || '_' || v_id_suffix;
  END IF;

  -- Handle username collision (statistically improbable but safety)
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(v_username)) LOOP
    v_attempt := v_attempt + 1;
    v_username := v_email_prefix || '_' || SUBSTRING(NEW.id::text, 1, v_attempt);
    IF v_attempt > 12 THEN
      -- Fallback: use full UUID as suffix
      v_username := 'user_' || REPLACE(NEW.id::text, '-', '');
      v_username := SUBSTRING(v_username, 1, 30);
      EXIT;
    END IF;
  END LOOP;

  -- INSERT in profiles con username default popolato
  INSERT INTO public.profiles (id, email, username, created_at)
  VALUES (NEW.id, NEW.email, v_username, NOW());

  -- Existing welcome grant chain (preserve)
  PERFORM public.claim_welcome_grant(NEW.id);

  RETURN NEW;
END;
$$;

-- Trigger esistente preserved (no DROP+CREATE necessario, function replace è sufficient)
```

**⚠️ Pre-execute recon:** CCP verifica exact signature `handle_new_user` esistente. Se trigger function ha already implementation diverse (es. usa `claim_welcome_grant` per insert profile, non direct INSERT), adapt logic dove username deve essere popolato.

---

## Acceptance criteria post-fix

1. ✅ `handle_new_user` trigger function aggiornata con username generation
2. ✅ Test E2E: nuovo signup con email random → INSERT profiles success → username popolato pattern `email_prefix_xxxx`
3. ✅ Test E2E: Sal Fabrizio retry signup → success → username `sal_fabrizio_xxxx`
4. ✅ Verify: 7 existing users username intact (no regression backfill)
5. ✅ Verify: 100 ARIA + 5 ROBI + 2 badges grant chain intact post fix
6. ✅ Smoke prod: Skeezu test signup nuovo user E2E

---

## Decisioni residue minor

### Decisione #1 · Collision strategy edge case

Brief default sopra: WHILE EXISTS loop con suffix length increment (4 → 5 → ... → 12) + fallback UUID full se all attempts fail.

**Alternative:**
- (a) Pattern brief (WHILE LOOP) — robust, ~5 attempts max nel 99% casi
- (b) Pattern simpler: `username_email_prefix_<UUID-first-8-char>` — meno safe (collision possible se 2 UUID iniziano stesso 8 char, statisticamente quasi zero)
- (c) Random suffix gen 4 char (es. ROUND_RANDOM int + to_hex) — non deterministic, hash leak medium

**Mio default (a):** pattern brief WHILE LOOP, mirror Round 6 backfill collision resolver.

### Decisione #2 · Email special chars handling

Brief pattern: `LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9_]', '_', 'g'))` — substitute non-alphanumeric con underscore.

Edge case: `sal.fabrizio@gmail.com` → `sal_fabrizio_xxxx` (dot → underscore). OK.

Edge case: `user+tag@gmail.com` → `user_tag_xxxx` (+ → underscore). OK.

Edge case: `o'connor@gmail.com` → `o_connor_xxxx` (apostrophe → underscore). OK.

Pattern Round 6 backfill già copre tutti gli edge cases comuni.

---

## ETA stima calibrata

| Phase | ETA |
|---|---|
| Recon `handle_new_user` function definition esistente | 3-5 min |
| Edit function con username generation logic | 5-7 min |
| Test E2E con signup nuovo user | 3-5 min |
| Verify 7 existing users intact | 2 min |
| Audit-trail file | 5 min |
| **TOTAL nominale** | **~15-20 min** |

ETA calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~10-15 min CCP atomic**.

---

## Skeezu parallel action

**Mentre CCP fixa Round 11, Skeezu comunica a Sal Fabrizio:**

> "Ehi Sal, scusa, abbiamo un bug temporaneo sul signup post-deploy. Fix in corso (~15-20 min). Ti pingo appena risolto, riprova il signup. Grazie pazienza! 🚀"

(Skeezu ha contatto WhatsApp diretto Sal, può comunicare immediate.)

**Plus:** **PAUSA share campagna referral fino a fix Round 11 SHIPPED** — ogni nuovo signup che arriva nel frattempo trova stesso bug → bad first impression cumulative.

---

## Pattern operativi

- **URGENT critical bug fix** — post-share, primo referral bloccato
- NO sed cascade · Edit chirurgico function trigger
- Recon `handle_new_user` function definition pre-edit
- Test E2E obbligatorio post-fix
- Audit-trail immediate post-commit

---

## Lesson learned cumulative · Round 11

**NEW lesson:** quando brief introduce DB schema constraint `NOT NULL UNIQUE` + backfill existing users, brief DEVE esplicitare logic generazione automatica per future signup tramite trigger/function chain. Pattern simmetrico:
- Backfill existing users ✅ (covered Round 6 brief)
- **NEW: Auto-gen future signup ✅** (mancato Round 6 brief, emerso solo post-share)

Aggiungo entry in `feedback_verify_before_edit.md` extension verify_before_brief:
**Pre-brief DB schema constraint NOT NULL UNIQUE checklist:**
1. Backfill existing rows logic ✅ (brief Round 6)
2. **Future INSERT auto-gen logic** ✅ (NEW Round 11)
3. Trigger / RPC chain integration con default generation function
4. Test E2E pattern signup post-deploy

---

## Closing

Round 11 URGENT pre primo referral campagna NON bloccato cumulative.

CCP, daje fix lampo immediate. ETA 10-15 min. Skeezu comunica a Sal parallel + PAUSA share fino a fix shipped.

Post-fix:
- Skeezu test E2E signup nuovo user
- Sal Fabrizio retry signup → success
- Skeezu riprende share full speed Voice + Username compliant

---

— **ROBY**

*10 May 2026 W2 Day 6 evening · canale ROBY→CCP (Round 11 URGENT signup blocker username default · primo referral Sal Fabrizio bloccato · mea culpa ROBY #5 schema design Round 6 · pattern fix handle_new_user trigger mirror Round 6 backfill · ETA calibrato 10-15 min · PAUSA share campagna fino a fix)*
