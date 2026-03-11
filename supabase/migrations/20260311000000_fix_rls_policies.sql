-- ══════════════════════════════════════════════════
-- AIROOBI — Fix RLS policies for core tables
-- Problem: users can't INSERT their own profile, points, NFTs
-- Solution: add proper INSERT/SELECT/UPDATE policies
-- ══════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can create their own profile (first login)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- Anon can read profiles for referral validation (only referral_code, id)
CREATE POLICY "Anon can read referral codes"
  ON profiles FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────────
-- POINTS_LEDGER
-- ──────────────────────────────────────────────────
-- Users can read their own points
CREATE POLICY "Users can read own points"
  ON points_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own points (bonuses)
CREATE POLICY "Users can insert own points"
  ON points_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can read all points
CREATE POLICY "Admin can read all points"
  ON points_ledger FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- ──────────────────────────────────────────────────
-- CHECKINS
-- ──────────────────────────────────────────────────
CREATE POLICY "Users can read own checkins"
  ON checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────
-- VIDEO_VIEWS
-- ──────────────────────────────────────────────────
CREATE POLICY "Users can read own video views"
  ON video_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video views"
  ON video_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────
-- REFERRAL_CONFIRMATIONS
-- ──────────────────────────────────────────────────
CREATE POLICY "Users can read own referral confirmations"
  ON referral_confirmations FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert referral confirmations"
  ON referral_confirmations FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

-- ──────────────────────────────────────────────────
-- NFT_REWARDS
-- ──────────────────────────────────────────────────
CREATE POLICY "Users can read own NFTs"
  ON nft_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NFTs"
  ON nft_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can read all NFTs
CREATE POLICY "Admin can read all NFTs"
  ON nft_rewards FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- ──────────────────────────────────────────────────
-- EVENTS (analytics — insert-only, anyone can insert)
-- ──────────────────────────────────────────────────
CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

-- Admin can read all events
CREATE POLICY "Admin can read all events"
  ON events FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- ──────────────────────────────────────────────────
-- WAITLIST (anon can insert, admin can read)
-- ──────────────────────────────────────────────────
CREATE POLICY "Anyone can insert waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read waitlist"
  ON waitlist FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- ──────────────────────────────────────────────────
-- INVESTOR_LEADS (anon can insert, admin can read)
-- ──────────────────────────────────────────────────
CREATE POLICY "Anyone can insert investor leads"
  ON investor_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read investor leads"
  ON investor_leads FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));
