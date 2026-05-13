-- ============================================================================
-- Sprint W3 · Atto 1 · Migration M5
-- token_swaps table + ALTER treasury_stats kas_eur_rate + 2 rate helpers
-- ============================================================================
-- LOCKED decisions:
-- #7 Token flows: KAS↔ARIA · ROBI→ARIA · ROBI→KAS (ROBI non-comprabile)
-- #19 Swap rate behavior: snapshot at confirm + 60s lock (2-phase prepare/execute)
--
-- Pairs implemented in M6 (next):
--   swap_prepare_kas_to_aria · swap_prepare_aria_to_kas
--   swap_prepare_robi_to_aria · swap_prepare_robi_to_kas
--   swap_execute(swap_id)
--
-- KAS_EUR oracle: admin-set via treasury_stats.kas_eur_rate column (this migration).
-- Future: cron updates from CoinGecko/CMC API via pg_net (deferred post-Atto-1).
-- ============================================================================

-- 1. Add kas_eur_rate column to treasury_stats (admin-set oracle for now)
ALTER TABLE public.treasury_stats
  ADD COLUMN IF NOT EXISTS kas_eur_rate NUMERIC(20,8);

COMMENT ON COLUMN public.treasury_stats.kas_eur_rate IS 'Current KAS/EUR exchange rate · admin-set via admin UI (manual oracle for Atto 1 V1) · future cron from CoinGecko/CMC. NULL = KAS swaps disabled.';

-- 2. token_swaps table · 2-phase swap with snapshot + 60s lock
CREATE TABLE public.token_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  from_token TEXT NOT NULL CHECK (from_token IN ('ARIA','KAS','ROBI','EUR')),
  to_token TEXT NOT NULL CHECK (to_token IN ('ARIA','KAS')),
  -- Forbid invalid pairs (ROBI non-comprabile · decision #7)
  CONSTRAINT valid_pair CHECK (
    (from_token = 'KAS' AND to_token = 'ARIA') OR
    (from_token = 'ARIA' AND to_token = 'KAS') OR
    (from_token = 'ROBI' AND to_token IN ('ARIA','KAS')) OR
    (from_token = 'EUR' AND to_token = 'ARIA')
  ),

  from_amount NUMERIC(20,8) NOT NULL CHECK (from_amount > 0),
  to_amount NUMERIC(20,8) NOT NULL CHECK (to_amount > 0),
  exchange_rate NUMERIC(20,8) NOT NULL CHECK (exchange_rate > 0),
  fee_aria NUMERIC(20,8) NOT NULL DEFAULT 0 CHECK (fee_aria >= 0),

  -- 2-phase lifecycle (decision #19)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','expired','cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 seconds'),

  external_tx_hash TEXT, -- Kaspa tx hash (for KAS-side · future Stage 2)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_reason TEXT
);

CREATE INDEX idx_swaps_user_created ON public.token_swaps(user_id, created_at DESC);
CREATE INDEX idx_swaps_status_expires ON public.token_swaps(status, expires_at) WHERE status = 'pending';
CREATE INDEX idx_swaps_pair ON public.token_swaps(from_token, to_token);

COMMENT ON TABLE public.token_swaps IS 'Token swap ledger · 2-phase prepare/execute (decision #19) · snapshot rate at prepare + 60s lock → user confirms via swap_execute(). Expired pending swaps auto-cancelled by cron.';
COMMENT ON COLUMN public.token_swaps.expires_at IS 'Default NOW + 60s · execute must happen before expires_at, else status auto-set to expired.';
COMMENT ON CONSTRAINT valid_pair ON public.token_swaps IS 'Enforces decision #7 · valid pairs: KAS↔ARIA, ROBI→ARIA/KAS, EUR→ARIA. Forbids ARIA→ROBI, KAS→ROBI, EUR→ROBI (ROBI non-comprabile).';

-- 3. ALTER transactions to add FK to token_swaps (was deferred in M7)
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_tx_related_swap FOREIGN KEY (related_swap_id)
  REFERENCES public.token_swaps(id) ON DELETE SET NULL;

-- 4. RLS
ALTER TABLE public.token_swaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own swaps"
  ON public.token_swaps FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can read all swaps"
  ON public.token_swaps FOR SELECT TO authenticated
  USING (public.is_admin());

-- INSERT/UPDATE via SECURITY DEFINER RPCs (M6 next)

-- 5. GRANTs (Supabase default flip 30 Oct 2026 compliance)
GRANT SELECT ON TABLE public.token_swaps TO authenticated;

-- ============================================================================
-- 6. Rate helpers (read-only RPCs, callable from frontend for rate preview UX)
-- ============================================================================

-- ROBI rate · derived from treasury (decision Skeezu 13 May 2026 night)
CREATE OR REPLACE FUNCTION public.get_robi_rate_eur()
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN nft_circulating > 0 THEN balance_eur / nft_circulating
    ELSE 0
  END
  FROM public.treasury_stats
  ORDER BY updated_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_robi_rate_eur IS 'Current ROBI/EUR rate · formula: treasury_stats.balance_eur / nft_circulating · returns 0 if no circulation. Decision Skeezu 13 May night: treasury_stats source of truth.';

-- KAS rate · admin-set oracle (M5 ALTER added column)
CREATE OR REPLACE FUNCTION public.get_kas_eur_rate()
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT kas_eur_rate
  FROM public.treasury_stats
  ORDER BY updated_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_kas_eur_rate IS 'Current KAS/EUR rate · admin-set via treasury_stats.kas_eur_rate · returns NULL if not set (KAS swaps disabled). Future: cron pg_net from CoinGecko/CMC.';

-- GRANTs (public read · used by UI for rate preview)
GRANT EXECUTE ON FUNCTION public.get_robi_rate_eur() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_robi_rate_eur() TO anon;
GRANT EXECUTE ON FUNCTION public.get_kas_eur_rate() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_kas_eur_rate() TO anon;
