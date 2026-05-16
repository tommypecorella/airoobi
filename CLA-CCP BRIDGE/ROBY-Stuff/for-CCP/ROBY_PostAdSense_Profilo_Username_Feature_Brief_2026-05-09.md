---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Brief separato · Profilo Edit Feature · nome+cognome editabili + Username UNIQUE · post-AdSense scope · DRAFT priority MEDIUM-HIGH
date: 2026-05-09
ref: visual review Skeezu unica post Round 3 (Issue #4 — "/profilo nome e cognome editabili + nuovo campo UNIQUE Username")
status: FINAL BRIEF · Skeezu sign-off (1a + 2b + 3b + 4a* + 5b) LOCKED 9 May 2026 evening · CCP impl scope ROUND 6 (escalata da post-AdSense) · ETA calibrato 2.5-3.5h CCP · *flag #4 username visibility "pubblico ovunque" interpretato dal commento Skeezu "sempre mostrato senza problemi"
---

# Profilo Edit Feature · Brief draft

## TL;DR

Skeezu visual review unica ha richiesto feature substantial su `/profilo` loggato:
1. **Nome + cognome editabili** dal profilo (current presumibly read-only)
2. **Nuovo campo Username UNIQUE** (non esistente nel DB schema attualmente)

**Scope:** new feature substantial. NO blocker AdSense (loggato). Post-AdSense scope.

**ROBY work:** ~1-2h (UX flow design + content + brief CCP)
**CCP work:** ~4-6h (DB migration + backfill + RPC + frontend form + validation + tests)

**Status DRAFT:** decisioni pending Skeezu su 5 punti chiave (vedi §Decisioni). Una volta approvati, finalizzo brief operativo CCP completo.

---

## Componenti feature scope

### A · DB Migration `profiles.username UNIQUE`

**Schema change (current `profiles` table mancante `username`):**

```sql
-- Migration: 20260509_add_username_to_profiles.sql

ALTER TABLE public.profiles
  ADD COLUMN username TEXT UNIQUE;

CREATE INDEX idx_profiles_username ON public.profiles(LOWER(username));

-- Backfill default username per utenti esistenti
-- Strategy: usa email prefix come username default, con fallback se conflitto
UPDATE public.profiles p
SET username = LOWER(SPLIT_PART(p.email, '@', 1)) || '_' || SUBSTRING(p.id::text, 1, 4)
WHERE p.username IS NULL;

-- After backfill: NOT NULL constraint
ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL;

-- Add format constraint (3-30 char, alphanumeric + underscore, lowercase)
ALTER TABLE public.profiles
  ADD CONSTRAINT username_format
  CHECK (username ~ '^[a-z0-9_]{3,30}$');
```

### B · Backend RPC `update_user_profile`

**RPC SECURITY DEFINER per profile update:**

```sql
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_name TEXT,
  p_surname TEXT,
  p_username TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_normalized_username TEXT := LOWER(p_username);
  v_existing_id uuid;
BEGIN
  -- Validate username format
  IF v_normalized_username !~ '^[a-z0-9_]{3,30}$' THEN
    RETURN jsonb_build_object('error', 'invalid_username_format');
  END IF;

  -- Check uniqueness (exclude self)
  SELECT id INTO v_existing_id
  FROM public.profiles
  WHERE LOWER(username) = v_normalized_username
    AND id != v_user_id;
  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'username_taken');
  END IF;

  -- Update
  UPDATE public.profiles
  SET name = p_name,
      surname = p_surname,
      username = v_normalized_username,
      updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'username', v_normalized_username);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;
```

### C · Username availability check (realtime)

**RPC `check_username_available` per UX validation client-side:**

```sql
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized TEXT := LOWER(p_username);
  v_taken BOOLEAN;
BEGIN
  -- Validate format
  IF v_normalized !~ '^[a-z0-9_]{3,30}$' THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'invalid_format'
    );
  END IF;

  -- Check uniqueness (exclude self)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = v_normalized AND id != auth.uid()
  ) INTO v_taken;

  RETURN jsonb_build_object(
    'available', NOT v_taken,
    'reason', CASE WHEN v_taken THEN 'username_taken' ELSE NULL END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_username_available TO authenticated;
```

### D · Frontend form profilo edit

**Components UX:**
1. Tab/section profilo con form editable
2. Fields:
   - **Nome** (text input, required, 1-50 char)
   - **Cognome** (text input, required, 1-50 char)
   - **Username** (text input, required, 3-30 char, lowercase + alphanumeric + underscore)
3. Realtime validation Username:
   - Format check client-side (regex)
   - Disponibilità check via debounced RPC `check_username_available` (300ms debounce)
   - Visual feedback: ✅ available / ❌ taken / ⚠️ invalid format
4. Save button → RPC `update_user_profile` → success message + refresh state
5. Error handling: format errors / username taken / network errors

**UX pattern:** edit-in-place vs modal vs separate page → vedi Decisione #2.

---

## ✅ Decisioni Skeezu LOCKED 9 May 2026 evening

| # | Decisione | Lock |
|---|---|---|
| 1 | Backfill strategy username default → **Email prefix + suffix random** (es. `tommaso_a3f2`) | (a) ✅ LOCKED |
| 2 | UX edit pattern → **Modal edit profilo** | (b) ✅ LOCKED |
| 3 | Username changeable post-creation → **Sì max 1 cambio ogni 30 giorni** | (b) ✅ LOCKED |
| 4 | Username visibility → **Pubblico ovunque** ("sempre mostrato senza problemi" da commento Skeezu) | (a) ✅ LOCKED ⚠️ |
| 5 | Validation realtime → **Debounced 300ms su blur** | (b) ✅ LOCKED |

**⚠️ Flag #4:** Skeezu ha scritto sigla "d" ma commento "sempre mostrato senza problemi" matcha (a). Interpretazione (a) "pubblico ovunque" applicata. Se Skeezu intendeva davvero (d) mix, correggere prima del commit CCP.

**Status:** brief escalato da post-AdSense scope a **ROUND 6 NOW** (sequential post Round 5 scoring panel UX). Parallel a Skeezu Path A (re-submission AdSense).

---

## SQL spec for CCP impl (paste-friendly)

### Migration `20260510_add_username_to_profiles.sql`

```sql
-- Migration: 20260510_add_username_to_profiles.sql
-- Add username UNIQUE column to profiles + backfill + constraint + RPC functions

BEGIN;

-- Step 1: Add column nullable (no data yet)
ALTER TABLE public.profiles
  ADD COLUMN username TEXT;

-- Step 2: Add updated_at column if not exists (for username_changed_at tracking)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMPTZ;

-- Step 3: Backfill default username per utenti esistenti
-- Strategy: email prefix lowercase + 4-char hex suffix da id UUID
-- Esempio: tommaso.pecorella@outlook.com + id 3da461f0-... → "tommaso_3da4"
UPDATE public.profiles p
SET username = LOWER(REGEXP_REPLACE(SPLIT_PART(p.email, '@', 1), '[^a-z0-9_]', '_', 'g'))
              || '_' || SUBSTRING(p.id::text, 1, 4),
    username_changed_at = NOW()
WHERE p.username IS NULL;

-- Step 4: Resolve eventual collisions (statisticamente improbabile ma safety)
-- Append additional hex chars to colliding usernames
DO $$
DECLARE
  rec RECORD;
  new_username TEXT;
  attempt INT;
BEGIN
  FOR rec IN
    SELECT username, COUNT(*) as cnt
    FROM public.profiles
    GROUP BY username
    HAVING COUNT(*) > 1
  LOOP
    -- For each collision, keep first row + rename others
    FOR rec IN
      SELECT id, username
      FROM public.profiles
      WHERE username = rec.username
      OFFSET 1
    LOOP
      attempt := 5;
      LOOP
        new_username := rec.username || '_' || SUBSTRING(rec.id::text, 1, attempt);
        EXIT WHEN NOT EXISTS(SELECT 1 FROM public.profiles WHERE username = new_username);
        attempt := attempt + 1;
      END LOOP;
      UPDATE public.profiles SET username = new_username WHERE id = rec.id;
    END LOOP;
  END LOOP;
END $$;

-- Step 5: NOT NULL constraint + UNIQUE index + format check
ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX idx_profiles_username_unique ON public.profiles(LOWER(username));

ALTER TABLE public.profiles
  ADD CONSTRAINT username_format_check
  CHECK (username ~ '^[a-z0-9_]{3,30}$');

-- Step 6: Add RLS policy for username read public (decision #4 LOCKED Skeezu)
-- Username pubblico ovunque, no restrictions
CREATE POLICY profiles_username_public_read
  ON public.profiles
  FOR SELECT
  USING (true);

COMMIT;
```

### RPC Functions

```sql
-- update_user_profile · update name + surname + username (with 30-day rate limit)
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_name TEXT,
  p_surname TEXT,
  p_username TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_normalized_username TEXT := LOWER(p_username);
  v_existing_id uuid;
  v_current_username TEXT;
  v_last_change TIMESTAMPTZ;
BEGIN
  -- Validate name + surname length
  IF LENGTH(TRIM(p_name)) < 1 OR LENGTH(p_name) > 50 THEN
    RETURN jsonb_build_object('error', 'invalid_name_length');
  END IF;
  IF LENGTH(TRIM(p_surname)) < 1 OR LENGTH(p_surname) > 50 THEN
    RETURN jsonb_build_object('error', 'invalid_surname_length');
  END IF;

  -- Validate username format
  IF v_normalized_username !~ '^[a-z0-9_]{3,30}$' THEN
    RETURN jsonb_build_object('error', 'invalid_username_format');
  END IF;

  -- Check reserved usernames
  IF v_normalized_username = ANY(ARRAY['admin', 'airoobi', 'system', 'support',
                                        'api', 'null', 'undefined', 'www', 'root',
                                        'help', 'about', 'contact', 'legal', 'terms']) THEN
    RETURN jsonb_build_object('error', 'username_reserved');
  END IF;

  -- Get current username + last change
  SELECT username, username_changed_at INTO v_current_username, v_last_change
  FROM public.profiles WHERE id = v_user_id;

  -- Check 30-day rate limit (decision #3 LOCKED Skeezu)
  IF v_normalized_username != v_current_username THEN
    IF v_last_change IS NOT NULL AND v_last_change > NOW() - INTERVAL '30 days' THEN
      RETURN jsonb_build_object(
        'error', 'username_rate_limit',
        'next_change_at', v_last_change + INTERVAL '30 days'
      );
    END IF;

    -- Check uniqueness (exclude self)
    SELECT id INTO v_existing_id
    FROM public.profiles
    WHERE LOWER(username) = v_normalized_username
      AND id != v_user_id;
    IF v_existing_id IS NOT NULL THEN
      RETURN jsonb_build_object('error', 'username_taken');
    END IF;
  END IF;

  -- Update
  UPDATE public.profiles
  SET name = TRIM(p_name),
      surname = TRIM(p_surname),
      username = v_normalized_username,
      username_changed_at = CASE
        WHEN v_normalized_username != v_current_username THEN NOW()
        ELSE v_last_change
      END,
      updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'username', v_normalized_username);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;

-- check_username_available · realtime check disponibilità (decision #5 debounced blur)
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized TEXT := LOWER(p_username);
  v_taken BOOLEAN;
BEGIN
  -- Validate format
  IF v_normalized !~ '^[a-z0-9_]{3,30}$' THEN
    RETURN jsonb_build_object('available', false, 'reason', 'invalid_format');
  END IF;

  -- Check reserved
  IF v_normalized = ANY(ARRAY['admin', 'airoobi', 'system', 'support',
                               'api', 'null', 'undefined', 'www', 'root',
                               'help', 'about', 'contact', 'legal', 'terms']) THEN
    RETURN jsonb_build_object('available', false, 'reason', 'reserved');
  END IF;

  -- Check uniqueness (exclude self)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = v_normalized AND id != auth.uid()
  ) INTO v_taken;

  RETURN jsonb_build_object(
    'available', NOT v_taken,
    'reason', CASE WHEN v_taken THEN 'username_taken' ELSE NULL END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_username_available TO authenticated;
```

### Frontend Modal Spec (paste-friendly HTML/CSS/JS)

**HTML (modal trigger su `/profilo`):**

```html
<!-- /profilo page · profilo card with edit button -->
<div class="profilo-card">
  <div class="profilo-header">
    <div class="profilo-name-display">
      <span id="profilo-name">{{name}} {{surname}}</span>
      <span class="profilo-username">@{{username}}</span>
    </div>
    <button class="profilo-edit-btn" onclick="openProfiloEditModal()">
      <span class="it" lang="it">Modifica</span>
      <span class="en" lang="en">Edit</span>
    </button>
  </div>
  <!-- ... rest of profilo content ... -->
</div>

<!-- Modal edit profilo (default hidden) -->
<div id="profilo-edit-modal" class="modal-backdrop" style="display:none">
  <div class="modal-content">
    <button class="modal-close" onclick="closeProfiloEditModal()">×</button>

    <h2 class="modal-title">
      <span class="it" lang="it">Modifica profilo</span>
      <span class="en" lang="en">Edit profile</span>
    </h2>

    <form id="profilo-edit-form" onsubmit="submitProfiloEdit(event)">

      <!-- Nome -->
      <div class="form-field">
        <label for="edit-name">
          <span class="it" lang="it">Nome</span>
          <span class="en" lang="en">First name</span>
        </label>
        <input type="text" id="edit-name" maxlength="50" required value="{{name}}">
      </div>

      <!-- Cognome -->
      <div class="form-field">
        <label for="edit-surname">
          <span class="it" lang="it">Cognome</span>
          <span class="en" lang="en">Last name</span>
        </label>
        <input type="text" id="edit-surname" maxlength="50" required value="{{surname}}">
      </div>

      <!-- Username -->
      <div class="form-field">
        <label for="edit-username">
          <span class="it" lang="it">Username</span>
          <span class="en" lang="en">Username</span>
        </label>
        <div class="username-input-wrapper">
          <span class="username-prefix">@</span>
          <input type="text" id="edit-username" maxlength="30" minlength="3"
                 pattern="[a-z0-9_]+" required value="{{username}}"
                 onblur="checkUsernameAvailability(this)">
        </div>
        <div id="username-feedback" class="form-feedback"></div>
        <div class="form-hint">
          <span class="it" lang="it">3-30 caratteri · solo lettere minuscole, numeri, underscore · cambiabile max 1 volta ogni 30 giorni</span>
          <span class="en" lang="en">3-30 characters · lowercase letters, numbers, underscore only · changeable max once every 30 days</span>
        </div>
      </div>

      <!-- Submit -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="closeProfiloEditModal()">
          <span class="it" lang="it">Annulla</span>
          <span class="en" lang="en">Cancel</span>
        </button>
        <button type="submit" class="btn-save">
          <span class="it" lang="it">Salva</span>
          <span class="en" lang="en">Save</span>
        </button>
      </div>

      <div id="form-error" class="form-error" style="display:none"></div>

    </form>
  </div>
</div>
```

**CSS extension `dapp-v2-g3.css` Round 6 section:**

```css
/* ROUND 6 · Profilo Edit Modal */

.profilo-edit-btn {
  background: transparent;
  border: 1px solid var(--airoobi-gold, #B8893D);
  color: var(--airoobi-gold);
  padding: 6px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
}
.profilo-edit-btn:hover {
  background: rgba(184,137,61,0.08);
}

.profilo-username {
  display: inline-block;
  margin-left: 12px;
  color: var(--airoobi-ink-muted, #5A544E);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-content {
  background: var(--airoobi-bg, #FFF);
  border-radius: 8px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--airoobi-ink-muted);
}
.modal-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--airoobi-ink);
  margin: 0 0 24px;
}

/* Form */
.form-field {
  margin-bottom: 20px;
}
.form-field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--airoobi-ink);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.form-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--airoobi-border, rgba(15,20,23,0.12));
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  color: var(--airoobi-ink);
}
.form-field input:focus {
  outline: none;
  border-color: var(--airoobi-gold);
}

.username-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--airoobi-border, rgba(15,20,23,0.12));
  border-radius: 4px;
  background: #FFF;
}
.username-input-wrapper:focus-within {
  border-color: var(--airoobi-gold);
}
.username-prefix {
  padding: 10px 0 10px 12px;
  color: var(--airoobi-ink-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
}
.username-input-wrapper input {
  border: none !important;
  flex: 1;
}

.form-feedback {
  margin-top: 6px;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
}
.form-feedback.available { color: #2D7A2D; }
.form-feedback.taken { color: var(--airoobi-coral, #F73659); }
.form-feedback.checking { color: var(--airoobi-ink-muted); font-style: italic; }

.form-hint {
  margin-top: 6px;
  font-size: 0.75rem;
  color: var(--airoobi-ink-muted);
  font-style: italic;
  line-height: 1.4;
}

/* Form actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
.btn-cancel, .btn-save {
  padding: 10px 24px;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}
.btn-cancel {
  background: transparent;
  border: 1px solid var(--airoobi-border);
  color: var(--airoobi-ink);
}
.btn-save {
  background: var(--airoobi-gold);
  border: none;
  color: #FFF;
}
.btn-save:disabled {
  background: var(--airoobi-ink-muted);
  cursor: not-allowed;
}
.btn-save:hover:not(:disabled) {
  background: #A07930;
}

.form-error {
  margin-top: 16px;
  padding: 12px;
  background: rgba(247,54,89,0.08);
  border-left: 3px solid var(--airoobi-coral);
  color: var(--airoobi-coral);
  font-size: 0.85rem;
}
```

**JS interaction:**

```javascript
let usernameCheckTimeout = null;
let usernameAvailable = true;

function openProfiloEditModal() {
  document.getElementById('profilo-edit-modal').style.display = 'flex';
}

function closeProfiloEditModal() {
  document.getElementById('profilo-edit-modal').style.display = 'none';
  document.getElementById('form-error').style.display = 'none';
}

// Decision #5 LOCKED: debounced 300ms su blur
async function checkUsernameAvailability(input) {
  const username = input.value.trim().toLowerCase();
  const feedback = document.getElementById('username-feedback');
  const lang = document.documentElement.dataset.lang || 'it';

  // Format validation client-side
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    feedback.className = 'form-feedback taken';
    feedback.textContent = lang === 'it'
      ? '⚠ Formato non valido (3-30 char, a-z 0-9 _)'
      : '⚠ Invalid format (3-30 char, a-z 0-9 _)';
    usernameAvailable = false;
    return;
  }

  feedback.className = 'form-feedback checking';
  feedback.textContent = lang === 'it' ? 'Verifica...' : 'Checking...';

  try {
    const { data, error } = await supabase.rpc('check_username_available', {
      p_username: username
    });

    if (error) throw error;

    if (data.available) {
      feedback.className = 'form-feedback available';
      feedback.textContent = lang === 'it' ? '✓ Disponibile' : '✓ Available';
      usernameAvailable = true;
    } else {
      feedback.className = 'form-feedback taken';
      feedback.textContent = lang === 'it'
        ? (data.reason === 'reserved' ? '✗ Username riservato' : '✗ Username già preso')
        : (data.reason === 'reserved' ? '✗ Reserved username' : '✗ Username taken');
      usernameAvailable = false;
    }
  } catch (e) {
    feedback.className = 'form-feedback';
    feedback.textContent = '';
    usernameAvailable = true; // graceful: don't block submit if check fails
  }
}

async function submitProfiloEdit(event) {
  event.preventDefault();

  const name = document.getElementById('edit-name').value.trim();
  const surname = document.getElementById('edit-surname').value.trim();
  const username = document.getElementById('edit-username').value.trim().toLowerCase();
  const errorBox = document.getElementById('form-error');
  const lang = document.documentElement.dataset.lang || 'it';

  errorBox.style.display = 'none';

  if (!usernameAvailable) {
    errorBox.style.display = 'block';
    errorBox.textContent = lang === 'it'
      ? 'Username non disponibile. Scegline un altro.'
      : 'Username not available. Choose another.';
    return;
  }

  try {
    const { data, error } = await supabase.rpc('update_user_profile', {
      p_name: name,
      p_surname: surname,
      p_username: username
    });

    if (error) throw error;

    if (data.error) {
      errorBox.style.display = 'block';
      errorBox.textContent = mapErrorMessage(data.error, data.next_change_at, lang);
      return;
    }

    // Success
    closeProfiloEditModal();
    location.reload(); // refresh per visualizzare nuovi valori
  } catch (e) {
    errorBox.style.display = 'block';
    errorBox.textContent = lang === 'it' ? 'Errore di rete. Riprova.' : 'Network error. Retry.';
  }
}

function mapErrorMessage(errorCode, nextChangeAt, lang) {
  const messages = {
    invalid_name_length: { it: 'Nome non valido (1-50 caratteri)', en: 'Invalid name (1-50 chars)' },
    invalid_surname_length: { it: 'Cognome non valido (1-50 caratteri)', en: 'Invalid surname (1-50 chars)' },
    invalid_username_format: { it: 'Formato username non valido', en: 'Invalid username format' },
    username_reserved: { it: 'Username riservato dal sistema', en: 'Username reserved by system' },
    username_taken: { it: 'Username già preso', en: 'Username taken' },
    username_rate_limit: {
      it: `Username cambiabile dopo ${new Date(nextChangeAt).toLocaleDateString('it-IT')}`,
      en: `Username changeable after ${new Date(nextChangeAt).toLocaleDateString('en-US')}`
    }
  };
  return messages[errorCode]?.[lang] || (lang === 'it' ? 'Errore sconosciuto' : 'Unknown error');
}
```

---

## Acceptance criteria post-impl

Smoke verify post-deploy v4.8.0 (assumendo Round 5 ship come v4.7.0):

1. ✅ Migration applied: `profiles.username` UNIQUE NOT NULL, format check, `username_changed_at` column
2. ✅ Backfill completed: tutti utenti existing hanno username default `email_prefix_xxxx`
3. ✅ Zero collisioni post-backfill
4. ✅ RLS policy `profiles_username_public_read` attivo (decision #4 LOCKED pubblico ovunque)
5. ✅ `/profilo` page mostra `@username` next to nome/cognome
6. ✅ Click "Modifica" → modal apre con form pre-popolato
7. ✅ Validazione realtime username on blur (debounced 300ms): ✓ Disponibile / ✗ Taken / ⚠ Format
8. ✅ Submit → RPC `update_user_profile` → success → modal close + page reload
9. ✅ Error handling: invalid format, reserved name, taken, rate limit 30gg
10. ✅ Mobile responsive modal <480px
11. ✅ Bilingue inline IT+EN preservato pattern
12. ✅ Username pubblico ovunque (leaderboard + airdrop participation + share link) — verifica visibility cross-page

---

## ETA stima calibrata

| Phase | ETA |
|---|---|
| CCP DB migration apply (Supabase) + backfill verify | 30-45 min |
| CCP RPC functions deploy (`update_user_profile` + `check_username_available`) | 30 min |
| CCP frontend modal HTML + CSS + JS (paste-friendly) | 1.5-2h |
| CCP integration con dapp.js auth flow + rendering | 30-45 min |
| CCP smoke local + edge cases (rate limit, reserved, collision) | 30 min |
| Version bump 4.7.0 → 4.8.0 | 5 min |
| Audit-trail file | 15 min |
| **TOTAL nominale** | **3.5-5h** |

ETA calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~2-2.5h CCP**.

**Sequenziale post Round 5 SHIPPED (NO parallel race condition con Round 5 commit).**

---

## ETA stima

| Phase | ETA |
|---|---|
| Skeezu sign-off decisioni #1-#5 | 10-20 min |
| ROBY brief finalization (UX flow + content + acceptance criteria) | 1-2h |
| CCP DB migration + backfill | 30-60 min |
| CCP RPC update_user_profile + check_username_available | 45 min |
| CCP frontend form + validation | 2-3h |
| CCP smoke testing + edge cases | 1h |
| Audit-trail file CCP | 30 min |
| **TOTAL CCP work** | **5-7h** |

ETA stima nominale calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~2.5-3.5h CCP**.

**Scope:** post-AdSense (no urgency). Pianificare W3 quando CCP ha bandwidth.

---

## Edge cases + considerations

### Edge 1 · Email prefix + suffix collision
Backfill (a) genera `tommaso_a3f2`. Se collision (improbabile ma possibile), retry con suffix nuovo.

### Edge 2 · Username reserved names
Reservare alcuni username system: `admin`, `airoobi`, `system`, `support`, `null`, `undefined`, `api`, `www`. Validation rigetta.

### Edge 3 · Profanity filter
Username può contenere parole offensive? Implementare basic filter (lista blacklist + regex)? Decisione Skeezu pending: scope optional, può essere W4+.

### Edge 4 · URL referral break
Se username cambiato, URL referral basato su username (es. `/signup?ref=tommaso`) si rompe. Soluzione: usare `id` UUID per referral URL (NON username). Verifica current implementation referral URL.

### Edge 5 · GDPR / Privacy
Username pubblico = PII visible. Privacy policy update? Probabilmente no (username è opt-in, user choose visibility level). Verifica con Skeezu.

---

## Closing · Brief FINAL ready per CCP Round 6 impl

Brief escalato da DRAFT post-AdSense a FINAL Round 6 NOW (sequenziale post Round 5 scoring panel UX). Skeezu decisioni LOCKED (1a + 2b + 3b + 4a* + 5b) con flag #4 da confermare.

SQL migration + 2 RPC functions + frontend modal HTML/CSS/JS paste-friendly. Edge cases handled (reserved usernames, rate limit, collision, format validation).

Pattern operativi (recap):
- NO sed cascade (Edit chirurgici + grep verify pre-patch)
- Migration Supabase apply via dashboard o CLI (verify-pre-apply pattern: dry-run su staging se accessibile)
- §A Discoveries documented if 3+
- Audit-trail immediate post-commit (file CCP_FixLampo_Round6_*.md generato CONTESTUALMENTE)

ETA calibrato 2-2.5h CCP. Sequenziale post Round 5 SHIPPED. No parallel race condition.

CCP, daje Round 6, ultima feature substantial sprint AdSense unblock + UX critical Alpha Brave acquisition retention.

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (Brief draft Profilo Username feature · post-AdSense scope · DRAFT attesa Skeezu sign-off · 5 decisioni pending · scope DB migration + RPC + frontend ~5-7h CCP)*
