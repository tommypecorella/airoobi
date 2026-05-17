-- W4 · M_atto2_01 · Atto 2 Listing & Activation · ALTER airdrops + RLS update
-- Adds: is_demo (DEMO/LIVE flag) · duration_days (override per airdrop) · listing_published_at
-- presale_enabled already exists pre-W3 (preserved)
-- RLS update: DEMO visible only to Alpha Brave + admin · LIVE remains anon

ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS listing_published_at TIMESTAMPTZ;

COMMENT ON COLUMN airdrops.is_demo IS 'DEMO flag: TRUE = visible only Alpha Brave + admin (testing). FALSE = LIVE public.';
COMMENT ON COLUMN airdrops.duration_days IS 'Per-airdrop duration override (7=base · 10=mid · 14=premium · admin can override). NULL falls back to category default at listing time.';
COMMENT ON COLUMN airdrops.listing_published_at IS 'Timestamp when admin called publish_airdrop_listing RPC.';

-- ─────────────────────────────────────────────────────────────
-- RLS update · DEMO visibility scope
-- ─────────────────────────────────────────────────────────────

-- Drop legacy anon/authenticated read policies (replace with DEMO-aware variants)
DROP POLICY IF EXISTS "Anon can read active airdrops" ON airdrops;
DROP POLICY IF EXISTS "Authenticated can read visible airdrops" ON airdrops;

-- Anon: only LIVE airdrops in active states (no DEMO leak)
CREATE POLICY "airdrops_anon_read_live" ON airdrops FOR SELECT TO anon
  USING (is_demo = FALSE AND status = ANY(ARRAY['presale','sale','completed','annullato']));

-- Authenticated regular users: LIVE airdrops same scope as anon
CREATE POLICY "airdrops_auth_read_live" ON airdrops FOR SELECT TO authenticated
  USING (is_demo = FALSE AND status = ANY(ARRAY['presale','sale','completed','annullato']));

-- Alpha Brave: also see DEMO airdrops (W4 testing scope)
CREATE POLICY "airdrops_alpha_brave_read_demo" ON airdrops FOR SELECT TO authenticated
  USING (is_demo = TRUE AND status = ANY(ARRAY['presale','sale','completed','annullato']) AND is_alpha_brave(auth.uid()));

-- Preserved: existing "Users can read own submitted airdrops" + "Users can read participated airdrops" + "Admin can read all airdrops"

-- Supabase GRANT (default flip 30 Oct 2026)
GRANT SELECT ON airdrops TO anon;
GRANT SELECT ON airdrops TO authenticated;
