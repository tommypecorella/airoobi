-- W4 · M_atto2_prep_00 · Push T2/T3 schema gap fix (Opt A · ROBY+CCP signed-off)
-- Pre-requisite for M_atto2_01 (notify-airdrop-live edge fn filtering)
-- Adds: profiles.category_preferences · profiles.notify_all · notification_dispatch_log table
-- Also adds: is_alpha_brave() helper (4th schema gap caught verify-before-brief · alpha_brave is in nft_rewards not profiles)

-- ─────────────────────────────────────────────────────────────
-- profiles · push routing prefs
-- ─────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category_preferences JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_all BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN profiles.category_preferences IS 'Array of category slugs user wants T2 push for. Empty=no T2 categoria-match. Example: ["smartphone","watches"]';
COMMENT ON COLUMN profiles.notify_all IS 'T3 broadcast opt-in. Default TRUE; user can opt-out in /profilo/preferenze.';

-- Column-level GRANT UPDATE so users can edit only these prefs (existing "Users can update own profile" policy permits)
GRANT UPDATE (category_preferences, notify_all) ON profiles TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- notification_dispatch_log · audit-trail multi-channel
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_dispatch_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel      TEXT NOT NULL CHECK (channel IN ('in_app','email','telegram')),
  tier         TEXT NOT NULL CHECK (tier IN ('T1','T2','T3')),
  template     TEXT NOT NULL,
  airdrop_id   UUID REFERENCES airdrops(id) ON DELETE SET NULL,
  metadata     JSONB,
  send_status  TEXT NOT NULL CHECK (send_status IN ('sent','failed','skipped_cap','skipped_opt_out')),
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_dispatch_user    ON notification_dispatch_log(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_dispatch_tier    ON notification_dispatch_log(tier);
CREATE INDEX IF NOT EXISTS idx_notification_dispatch_airdrop ON notification_dispatch_log(airdrop_id);

ALTER TABLE notification_dispatch_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_own_dispatch_log" ON notification_dispatch_log;
CREATE POLICY "user_read_own_dispatch_log" ON notification_dispatch_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_dispatch" ON notification_dispatch_log;
CREATE POLICY "admin_all_dispatch" ON notification_dispatch_log FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Supabase GRANT (default flip 30 Oct 2026 · memoria operativa W3 audit)
GRANT SELECT ON notification_dispatch_log TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- is_alpha_brave() helper · 4th schema gap fix
-- ─────────────────────────────────────────────────────────────
-- Brief assumed profiles.alpha_brave column · actually badge in nft_rewards (nft_type='ALPHA_BRAVE')
-- Helper STABLE SECURITY DEFINER for clean RLS + RPC usage
CREATE OR REPLACE FUNCTION is_alpha_brave(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM nft_rewards
    WHERE user_id = p_user_id
      AND nft_type = 'ALPHA_BRAVE'
      AND COALESCE(burned, FALSE) = FALSE
  );
$$;

GRANT EXECUTE ON FUNCTION is_alpha_brave(UUID) TO authenticated, anon;

COMMENT ON FUNCTION is_alpha_brave(UUID) IS 'Returns TRUE if user holds active (non-burned) ALPHA_BRAVE badge in nft_rewards. Used by Atto 2+ RLS for DEMO airdrops visibility scope.';
