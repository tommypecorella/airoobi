-- ============================================================================
-- Sprint W3 · Atto 1 · Migration M7
-- transactions table · multi-asset ledger + backfill points_ledger
-- ============================================================================
-- CCP architectural call (signed in CCP_Reply_ROBY_PendingBrief_Atto1_WIP_TechClarifications_2026-05-13.md):
-- PHASED DUAL-WRITE plan W3/W4/W5:
-- - W3 (this migration): create transactions table + backfill points_ledger one-shot
--                        new RPCs (M4, M5/M6 swap, etc.) write ONLY to transactions
-- - W4: existing RPCs (checkin, faucet, referral, admin_grant, video, streak)
--       updated to dual-write (continue points_ledger + mirror to transactions)
-- - W5: cutover · existing RPCs write ONLY to transactions · points_ledger flagged read-only
-- - W5+90gg: DROP TABLE points_ledger
--
-- Decision #18 LOCKED (Skeezu) · NO big-bang migration.
--
-- IMPORTANT: backfill in same migration as table creation → atomic
-- If backfill fails, table creation is rolled back too.
-- ============================================================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  -- Categorization (24 categories covering Atto 1-5 + legacy backfill)
  category TEXT NOT NULL CHECK (category IN (
    -- Atto 1 · evaluation flow
    'evaluation_payment',
    'evaluation_robi_bonus',
    'evaluation_courtesy_refund',
    'evalobi_mint',
    'evalobi_transfer',
    -- Atto 3-5 · airdrop flow
    'airdrop_block_purchase',
    'airdrop_winner_payout',
    'airdrop_seller_payout',
    'airdrop_consolation_nft',
    'airdrop_refund',
    -- Atto 6 · swap flow
    'swap_kas_to_aria',
    'swap_aria_to_kas',
    'swap_robi_to_aria',
    'swap_robi_to_kas',
    'buy_aria_eur',
    -- Engagement
    'checkin_daily_aria',
    'referral_bonus',
    'streak_bonus',
    'video_reward',
    'faucet_aria',
    'welcome_grant',
    -- Admin
    'admin_adjustment',
    -- Backfill markers (points_ledger legacy)
    'legacy_aria_credit',
    'legacy_aria_debit'
  )),

  -- Multi-asset movement (in = received, out = spent, both can be set for swaps)
  asset_in TEXT CHECK (asset_in IN ('ARIA','KAS','ROBI','EUR','EVALOBI','NFT_CONSOLATION','NFT_BADGE')),
  asset_in_amount NUMERIC(20,8) CHECK (asset_in_amount IS NULL OR asset_in_amount >= 0),
  asset_in_id UUID,

  asset_out TEXT CHECK (asset_out IN ('ARIA','KAS','ROBI','EUR','EVALOBI','NFT_CONSOLATION','NFT_BADGE')),
  asset_out_amount NUMERIC(20,8) CHECK (asset_out_amount IS NULL OR asset_out_amount >= 0),
  asset_out_id UUID,

  -- Context FKs (nullable · only set when applicable)
  related_airdrop_id UUID REFERENCES public.airdrops(id) ON DELETE SET NULL,
  related_evaluation_request_id UUID REFERENCES public.evaluation_requests(id) ON DELETE SET NULL,
  related_evalobi_id UUID REFERENCES public.evalobi(id) ON DELETE SET NULL,
  related_swap_id UUID, -- FK added when M5 token_swaps lands (Area 3)

  -- Metadata
  description TEXT,
  metadata JSONB,
  external_ref TEXT, -- Stripe payment_intent_id · Kaspa tx hash · etc

  -- Audit
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','reversed')),
  triggered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Sanity: at least one asset movement must be set
  CONSTRAINT tx_has_movement CHECK (asset_in IS NOT NULL OR asset_out IS NOT NULL)
);

CREATE INDEX idx_tx_user_created ON public.transactions(user_id, created_at DESC);
CREATE INDEX idx_tx_category ON public.transactions(category);
CREATE INDEX idx_tx_airdrop ON public.transactions(related_airdrop_id) WHERE related_airdrop_id IS NOT NULL;
CREATE INDEX idx_tx_eval_req ON public.transactions(related_evaluation_request_id) WHERE related_evaluation_request_id IS NOT NULL;
CREATE INDEX idx_tx_evalobi ON public.transactions(related_evalobi_id) WHERE related_evalobi_id IS NOT NULL;
CREATE INDEX idx_tx_swap ON public.transactions(related_swap_id) WHERE related_swap_id IS NOT NULL;
CREATE INDEX idx_tx_status ON public.transactions(status) WHERE status != 'completed';
CREATE INDEX idx_tx_external_ref ON public.transactions(external_ref) WHERE external_ref IS NOT NULL;

COMMENT ON TABLE public.transactions IS 'Multi-asset universal ledger · source of truth post W5 cutover. New RPCs (M4, M6 swap, etc.) write here from W3. Legacy points_ledger backfilled in this migration for unified UI history.';
COMMENT ON COLUMN public.transactions.related_swap_id IS 'No FK constraint until M5 token_swaps table lands · then ALTER TABLE ADD FK.';
COMMENT ON CONSTRAINT tx_has_movement ON public.transactions IS 'Every transaction must move at least one asset (in or out) · prevents empty placeholder rows.';

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can read all transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (public.is_admin());

-- INSERT via SECURITY DEFINER RPCs only (no direct policy)
-- NEVER UPDATE/DELETE (append-only audit · status='reversed' for compensating tx pattern)

-- GRANTs
GRANT SELECT ON TABLE public.transactions TO authenticated;
-- No anon (sensitive financial data)

-- ============================================================================
-- Backfill points_ledger → transactions (one-shot, atomic with table create)
-- ============================================================================
DO $$
DECLARE
  v_pl_count BIGINT;
  v_tx_count BIGINT;
  v_inserted BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_pl_count FROM public.points_ledger;
  RAISE NOTICE 'Backfill: points_ledger has % rows', v_pl_count;

  INSERT INTO public.transactions (
    user_id,
    category,
    asset_in, asset_in_amount,
    asset_out, asset_out_amount,
    description,
    metadata,
    status,
    triggered_by,
    created_at,
    completed_at
  )
  SELECT
    user_id,
    CASE WHEN amount >= 0 THEN 'legacy_aria_credit' ELSE 'legacy_aria_debit' END,
    CASE WHEN amount >= 0 THEN 'ARIA' ELSE NULL END,
    CASE WHEN amount >= 0 THEN amount::NUMERIC ELSE NULL END,
    CASE WHEN amount < 0 THEN 'ARIA' ELSE NULL END,
    CASE WHEN amount < 0 THEN ABS(amount)::NUMERIC ELSE NULL END,
    reason,
    COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'legacy_ledger_id', id,
      'legacy_amount', amount,
      'archived', archived,
      'archived_at', archived_at,
      'archive_reason', archive_reason
    ),
    CASE WHEN archived = TRUE THEN 'reversed' ELSE 'completed' END,
    user_id,
    created_at,
    created_at
  FROM public.points_ledger;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  SELECT COUNT(*) INTO v_tx_count FROM public.transactions;

  RAISE NOTICE 'Backfill: inserted % rows · transactions total now %', v_inserted, v_tx_count;

  -- Assert match
  IF v_inserted != v_pl_count THEN
    RAISE EXCEPTION 'Backfill mismatch · expected %, inserted %', v_pl_count, v_inserted;
  END IF;
END $$;
