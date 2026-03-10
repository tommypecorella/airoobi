-- ══════════════════════════════════════════════════
-- AIROOBI — Full Database Schema Backup
-- Generated: 10 Mar 2026
-- Supabase project: vuvlmlpuhovipfwtquux
--
-- Questo file ricostruisce l'intero schema.
-- Eseguire su un database Supabase vuoto per replicare.
-- ══════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- 1. PROFILES
-- Estende auth.users con dati applicativi
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  username text,
  display_name text,
  full_name text,
  lang text DEFAULT 'it',
  referral_code text UNIQUE,
  referred_by text,
  total_points integer DEFAULT 0,
  referral_count integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_checkin date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin full access
CREATE POLICY "Admin full access on profiles"
  ON profiles FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON profiles(referred_by);

-- ──────────────────────────────────────────────────
-- 2. POINTS_LEDGER
-- Registro di tutti i punti ARIA guadagnati
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS points_ledger (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  reason text NOT NULL,
  -- Reasons: welcome_bonus, login_bonus, daily_checkin,
  --          video_view, referral_bonus, referral_invited, streak_bonus
  created_at timestamptz DEFAULT now()
);

ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own points"
  ON points_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own points"
  ON points_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access on points_ledger"
  ON points_ledger FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_points_ledger_user ON points_ledger(user_id);
CREATE INDEX idx_points_ledger_reason ON points_ledger(reason);
CREATE INDEX idx_points_ledger_created ON points_ledger(created_at);

-- ──────────────────────────────────────────────────
-- 3. NFT_REWARDS
-- NFT emessi (Tessera Rendimento, Badge Fondatore)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nft_rewards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nft_type text NOT NULL,
  -- Types: NFT_EARN (Tessera Rendimento), NFT_ALPHA_BRAVE (Badge Fondatore)
  name text,
  phase text DEFAULT 'alpha',
  source text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nft_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own nft_rewards"
  ON nft_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own nft_rewards"
  ON nft_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access on nft_rewards"
  ON nft_rewards FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_nft_rewards_user ON nft_rewards(user_id);
CREATE INDEX idx_nft_rewards_type ON nft_rewards(nft_type);

-- ──────────────────────────────────────────────────
-- 4. CHECKINS
-- Check-in giornalieri
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checked_at date NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own checkins"
  ON checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own checkins"
  ON checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access on checkins"
  ON checkins FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_date ON checkins(checked_at);
CREATE UNIQUE INDEX idx_checkins_user_date ON checkins(user_id, checked_at);

-- ──────────────────────────────────────────────────
-- 5. VIDEO_VIEWS
-- Visualizzazioni video (max 5/giorno per ARIA)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own video_views"
  ON video_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own video_views"
  ON video_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access on video_views"
  ON video_views FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_video_views_user ON video_views(user_id);
CREATE INDEX idx_video_views_date ON video_views(viewed_at);

-- ──────────────────────────────────────────────────
-- 6. REFERRAL_CONFIRMATIONS
-- Stato conferma referral
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_confirmations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own referral_confirmations"
  ON referral_confirmations FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Admin full access on referral_confirmations"
  ON referral_confirmations FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_referral_confirmations_referrer ON referral_confirmations(referrer_id);
CREATE INDEX idx_referral_confirmations_referred ON referral_confirmations(referred_id);
CREATE INDEX idx_referral_confirmations_status ON referral_confirmations(status);

-- ──────────────────────────────────────────────────
-- 7. EVENTS
-- Analytics / tracking eventi
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event text,
  action text,
  user_id uuid,
  props jsonb,
  url text,
  referrer text,
  ua text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Events: insert aperto (anche anonimi), select solo admin
CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin full access on events"
  ON events FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_events_action ON events(action);
CREATE INDEX idx_events_created ON events(created_at);

-- ──────────────────────────────────────────────────
-- 8. TREASURY_STATS
-- Bilancio fondo, NFT mintati, valore unitario
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treasury_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  balance_eur numeric(12,2) DEFAULT 0,
  nft_minted integer DEFAULT 0,
  nft_value numeric(12,4) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE treasury_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read treasury"
  ON treasury_stats FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin full access on treasury_stats"
  ON treasury_stats FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_treasury_stats_created ON treasury_stats(created_at);

-- ──────────────────────────────────────────────────
-- 9. WAITLIST
-- Lista d'attesa pre-registrazione
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  lang text DEFAULT 'it',
  referred_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Waitlist: insert aperto, select solo admin
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin full access on waitlist"
  ON waitlist FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE UNIQUE INDEX idx_waitlist_email ON waitlist(email);

-- ──────────────────────────────────────────────────
-- 10. INVESTOR_LEADS
-- Form contatto investitori
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investor_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text,
  organization text,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investor_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert investor_leads"
  ON investor_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin full access on investor_leads"
  ON investor_leads FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

-- ──────────────────────────────────────────────────
-- 11. COST_TRACKER
-- Gestione costi operativi (admin only)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cost_tracker (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('fisso', 'variabile', 'una_tantum')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  frequency text NOT NULL CHECK (frequency IN ('mensile', 'annuale', 'una_tantum')),
  ref_month date NOT NULL,
  status text NOT NULL DEFAULT 'da_pagare' CHECK (status IN (
    'da_pagare', 'pagato', 'free', 'freemium', 'a_pagamento',
    'abbandonato', 'in_ritardo', 'non_pagato'
  )),
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cost_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on cost_tracker"
  ON cost_tracker FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_cost_tracker_month ON cost_tracker(ref_month);
CREATE INDEX idx_cost_tracker_status ON cost_tracker(status);

-- ══════════════════════════════════════════════════
-- RPC FUNCTIONS
-- ══════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- confirm_referral
-- Conferma referral: +10 ARIA al referrer, +15 all'invitato
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION confirm_referral(p_referred_id uuid, p_device_hash text)
RETURNS json AS $$
DECLARE
  v_referrer_code text;
  v_referrer_id uuid;
  v_existing integer;
BEGIN
  -- Get referred_by code from profile
  SELECT referred_by INTO v_referrer_code
  FROM profiles WHERE id = p_referred_id;

  IF v_referrer_code IS NULL THEN
    RETURN json_build_object('status', 'no_referrer');
  END IF;

  -- Find referrer
  SELECT id INTO v_referrer_id
  FROM profiles WHERE referral_code = v_referrer_code;

  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('status', 'referrer_not_found');
  END IF;

  -- Check if already confirmed
  SELECT COUNT(*) INTO v_existing
  FROM referral_confirmations
  WHERE referred_id = p_referred_id AND status = 'confirmed';

  IF v_existing > 0 THEN
    RETURN json_build_object('status', 'already_confirmed');
  END IF;

  -- Insert confirmation
  INSERT INTO referral_confirmations (referrer_id, referred_id, status, confirmed_at)
  VALUES (v_referrer_id, p_referred_id, 'confirmed', now());

  -- Award +10 to referrer
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_referrer_id, 10, 'referral_bonus');
  UPDATE profiles SET total_points = total_points + 10,
    referral_count = referral_count + 1 WHERE id = v_referrer_id;

  -- Award +15 to referred
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (p_referred_id, 15, 'referral_invited');
  UPDATE profiles SET total_points = total_points + 15 WHERE id = p_referred_id;

  RETURN json_build_object('status', 'confirmed', 'referrer_id', v_referrer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────
-- link_referral
-- Collega un referral code al profilo utente
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION link_referral(p_user_id uuid, p_ref_code text)
RETURNS json AS $$
BEGIN
  UPDATE profiles SET referred_by = p_ref_code WHERE id = p_user_id;
  RETURN json_build_object('status', 'linked');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────
-- daily_checkin
-- Esegue check-in giornaliero
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION daily_checkin(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_existing integer;
  v_streak integer;
  v_last date;
BEGIN
  -- Check if already checked in today
  SELECT COUNT(*) INTO v_existing
  FROM checkins WHERE user_id = p_user_id AND checked_at = v_today;

  IF v_existing > 0 THEN
    RETURN json_build_object('status', 'already_checked_in');
  END IF;

  -- Insert checkin
  INSERT INTO checkins (user_id, checked_at) VALUES (p_user_id, v_today);

  -- Update streak
  SELECT last_checkin, current_streak INTO v_last, v_streak FROM profiles WHERE id = p_user_id;

  IF v_last = v_today - 1 THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  UPDATE profiles SET
    last_checkin = v_today,
    current_streak = v_streak,
    longest_streak = GREATEST(COALESCE(longest_streak, 0), v_streak)
  WHERE id = p_user_id;

  -- Award +1 ARIA
  INSERT INTO points_ledger (user_id, amount, reason) VALUES (p_user_id, 1, 'daily_checkin');
  UPDATE profiles SET total_points = total_points + 1 WHERE id = p_user_id;

  RETURN json_build_object('status', 'ok', 'streak', v_streak);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────
-- get_user_position
-- Posizione utente nella classifica per punti
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_user_position(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_position integer;
  v_total integer;
BEGIN
  SELECT COUNT(*) + 1 INTO v_position
  FROM profiles
  WHERE total_points > (SELECT total_points FROM profiles WHERE id = p_user_id);

  SELECT COUNT(*) INTO v_total FROM profiles;

  RETURN json_build_object('position', v_position, 'total', v_total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════
-- END OF SCHEMA
-- ══════════════════════════════════════════════════
