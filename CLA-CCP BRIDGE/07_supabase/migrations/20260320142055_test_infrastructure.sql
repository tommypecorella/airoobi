-- ============================================================
-- TEST INFRASTRUCTURE
-- 1. Add is_test_user column to profiles
-- 2. RPC create_test_pool() — generates 1000 test users
-- 3. RPC simulate_airdrop_participation() — auto-fill blocks
-- 4. RPC get_airdrop_analysis() — algorithm breakdown + NFT + split
-- 5. Update leaderboard to exclude test users
-- ============================================================

-- ── 1. Add is_test_user column ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_test_user
  ON profiles (is_test_user) WHERE is_test_user = true;


-- ── 2. Create test pool ──
CREATE OR REPLACE FUNCTION create_test_pool()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count      INTEGER := 0;
  v_existing   INTEGER;
  v_user_id    UUID;
  v_email      TEXT;
  v_created    TIMESTAMPTZ;
  v_rand       DOUBLE PRECISION;
  v_days_ago   INTEGER;
  i            INTEGER;
BEGIN
  -- Admin-only (service role or admin)
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
  END IF;

  SELECT COUNT(*) INTO v_existing FROM profiles WHERE is_test_user = true;
  IF v_existing >= 1000 THEN
    RETURN jsonb_build_object('ok', true, 'message', 'Pool already exists', 'count', v_existing);
  END IF;

  FOR i IN (v_existing + 1)..1000 LOOP
    v_user_id := gen_random_uuid();
    v_email := 'test_user_' || LPAD(i::TEXT, 3, '0') || '@airoobi.test';

    -- Non-uniform distribution over 90 days: more recent users, fewer old ones
    -- Use squared random to skew toward recent dates (small days_ago)
    v_rand := random();
    v_days_ago := floor(v_rand * v_rand * 90)::INTEGER;  -- squared → skews recent
    v_created := NOW() - v_days_ago * INTERVAL '1 day'
                       - (random() * 86400)::INTEGER * INTERVAL '1 second';

    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated', 'authenticated',
      v_email,
      crypt('TestPool2026!', gen_salt('bf')),
      v_created,
      v_created, v_created,
      '{"provider":"email","providers":["email"]}'::JSONB,
      '{}'::JSONB,
      '', '', '',
      false
    );

    INSERT INTO profiles (id, email, referral_code, total_points, created_at, is_test_user)
    VALUES (
      v_user_id,
      v_email,
      'TEST' || LPAD(i::TEXT, 4, '0'),
      1000,
      v_created,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      referral_code = EXCLUDED.referral_code,
      total_points = EXCLUDED.total_points,
      created_at = EXCLUDED.created_at,
      is_test_user = true;

    INSERT INTO points_ledger (user_id, amount, reason, created_at)
    VALUES (v_user_id, 1000, 'test_pool_seed', v_created);

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'created', v_count, 'total', 1000);
END;
$$;


-- ── 3. Simulate airdrop participation ──
CREATE OR REPLACE FUNCTION simulate_airdrop_participation(
  p_airdrop_id   UUID,
  p_fill_pct     NUMERIC,   -- 0-100: percentage of REMAINING blocks to fill
  p_spread_days  BOOLEAN DEFAULT false  -- if true, distribute purchases over multiple days
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop          RECORD;
  v_blocks_to_fill   INTEGER;
  v_available        INTEGER[];
  v_price            INTEGER;
  v_test_user        RECORD;
  v_blocks_for_user  INTEGER;
  v_user_blocks      INTEGER[];
  v_cost             INTEGER;
  v_idx              INTEGER;
  v_filled           INTEGER := 0;
  v_participants     INTEGER := 0;
  v_total_available  INTEGER;
  v_rand             DOUBLE PRECISION;
  v_purchase_at      TIMESTAMPTZ;
  v_spread_hours     INTEGER;
BEGIN
  -- Admin-only
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
  END IF;

  IF p_fill_pct <= 0 OR p_fill_pct > 100 THEN
    RETURN '{"ok":false,"error":"INVALID_PERCENTAGE"}'::JSONB;
  END IF;

  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB;
  END IF;

  IF v_airdrop.status NOT IN ('presale', 'sale') THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_ACTIVE"}'::JSONB;
  END IF;

  -- Determine price
  IF v_airdrop.status = 'presale' AND v_airdrop.presale_block_price IS NOT NULL THEN
    v_price := v_airdrop.presale_block_price;
  ELSE
    v_price := v_airdrop.block_price_aria;
  END IF;

  -- Time spread: if spread_days, distribute over 72h; otherwise over 4h
  v_spread_hours := CASE WHEN p_spread_days THEN 72 ELSE 4 END;

  -- Get available (unsold) block numbers, shuffled randomly
  SELECT ARRAY_AGG(n ORDER BY random()) INTO v_available
  FROM generate_series(1, v_airdrop.total_blocks) AS n
  WHERE NOT EXISTS (
    SELECT 1 FROM airdrop_blocks ab
    WHERE ab.airdrop_id = p_airdrop_id AND ab.block_number = n
  );

  IF v_available IS NULL OR array_length(v_available, 1) = 0 THEN
    RETURN '{"ok":false,"error":"NO_BLOCKS_AVAILABLE"}'::JSONB;
  END IF;

  v_total_available := array_length(v_available, 1);
  v_blocks_to_fill := LEAST(
    CEIL(v_total_available * p_fill_pct / 100.0)::INTEGER,
    v_total_available
  );

  IF v_blocks_to_fill = 0 THEN
    RETURN '{"ok":false,"error":"ZERO_BLOCKS_TO_FILL"}'::JSONB;
  END IF;

  v_idx := 1;

  -- Weighted selection: users with more ARIA are more likely to be selected
  -- ORDER BY total_points * random() gives weighted random (higher balance → higher chance)
  FOR v_test_user IN
    SELECT id, total_points
    FROM profiles
    WHERE is_test_user = true
      AND total_points >= v_price
    ORDER BY total_points * random() DESC
  LOOP
    EXIT WHEN v_filled >= v_blocks_to_fill;

    -- Block distribution per spec:
    -- 60% → 1-5 blocks (small buyers)
    -- 30% → 6-20 blocks (medium buyers)
    -- 10% → 21-50 blocks (whale buyers)
    v_rand := random();
    IF v_rand < 0.60 THEN
      v_blocks_for_user := 1 + floor(random() * 5)::INTEGER;   -- 1-5
    ELSIF v_rand < 0.90 THEN
      v_blocks_for_user := 6 + floor(random() * 15)::INTEGER;  -- 6-20
    ELSE
      v_blocks_for_user := 21 + floor(random() * 30)::INTEGER; -- 21-50
    END IF;

    -- Cap by remaining blocks to fill
    v_blocks_for_user := LEAST(v_blocks_for_user, v_blocks_to_fill - v_filled);
    -- Cap by what user can afford
    v_blocks_for_user := LEAST(v_blocks_for_user, (v_test_user.total_points / v_price)::INTEGER);
    -- Cap by available array bounds
    v_blocks_for_user := LEAST(v_blocks_for_user, v_total_available - v_idx + 1);

    IF v_blocks_for_user <= 0 THEN
      CONTINUE;
    END IF;

    -- Realistic purchase timestamp: distributed over spread window
    v_purchase_at := NOW() - (random() * v_spread_hours * 3600)::INTEGER * INTERVAL '1 second';

    v_user_blocks := v_available[v_idx : v_idx + v_blocks_for_user - 1];
    v_cost := v_price * v_blocks_for_user;

    -- Deduct ARIA
    UPDATE profiles
    SET total_points = total_points - v_cost
    WHERE id = v_test_user.id;

    -- Ledger entry with realistic timestamp
    INSERT INTO points_ledger (user_id, amount, reason, created_at)
    VALUES (v_test_user.id, -v_cost, 'airdrop_block_purchase:' || p_airdrop_id::TEXT, v_purchase_at);

    -- Insert blocks with realistic timestamp
    INSERT INTO airdrop_blocks (airdrop_id, block_number, owner_id, purchased_at)
    SELECT p_airdrop_id, bn, v_test_user.id, v_purchase_at
    FROM unnest(v_user_blocks) AS bn;

    -- Insert participation record with realistic timestamp
    INSERT INTO airdrop_participations (user_id, airdrop_id, blocks_count, aria_spent, created_at)
    VALUES (v_test_user.id, p_airdrop_id, v_blocks_for_user, v_cost, v_purchase_at);

    v_filled := v_filled + v_blocks_for_user;
    v_idx := v_idx + v_blocks_for_user;
    v_participants := v_participants + 1;
  END LOOP;

  -- Update airdrop blocks_sold
  UPDATE airdrops
  SET blocks_sold = blocks_sold + v_filled
  WHERE id = p_airdrop_id;

  RETURN jsonb_build_object(
    'ok', true,
    'blocks_filled', v_filled,
    'blocks_target', v_blocks_to_fill,
    'participants', v_participants,
    'blocks_remaining', v_total_available - v_filled,
    'total_blocks', v_airdrop.total_blocks
  );
END;
$$;


-- ── 4. Airdrop analysis (4 sections: draw result, top5, NFT, split) ──
CREATE OR REPLACE FUNCTION get_airdrop_analysis(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop        RECORD;
  v_scores         JSONB;
  v_details        JSONB;
  v_winner         JSONB;
  v_explain        TEXT;
  v_nft_data       JSONB;
  v_nft_count      INTEGER;
  v_nft_recipients INTEGER;
  v_treasury_pre   NUMERIC;
  v_treasury_post  NUMERIC;
BEGIN
  -- Admin-only
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
  END IF;

  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB;
  END IF;

  -- Participant details with email and context
  SELECT jsonb_agg(sub) INTO v_details
  FROM (
    SELECT
      ap.user_id,
      p.email,
      p.is_test_user,
      p.created_at AS registered_at,
      SUM(ap.blocks_count) AS blocks,
      SUM(ap.aria_spent) AS aria_spent,
      MIN(ab.first_at) AS first_purchase,
      COALESCE(cat_hist.cat_aria, 0) AS category_history_aria,
      COALESCE(other_ct.cnt, 0) AS other_airdrops_count
    FROM airdrop_participations ap
    JOIN profiles p ON p.id = ap.user_id
    LEFT JOIN (
      SELECT owner_id, MIN(purchased_at) AS first_at
      FROM airdrop_blocks
      WHERE airdrop_id = p_airdrop_id
      GROUP BY owner_id
    ) ab ON ab.owner_id = ap.user_id
    LEFT JOIN (
      SELECT ap2.user_id, SUM(ap2.aria_spent) AS cat_aria
      FROM airdrop_participations ap2
      JOIN airdrops a2 ON a2.id = ap2.airdrop_id
      WHERE a2.category = v_airdrop.category
        AND ap2.airdrop_id <> p_airdrop_id
      GROUP BY ap2.user_id
    ) cat_hist ON cat_hist.user_id = ap.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(DISTINCT airdrop_id) AS cnt
      FROM airdrop_participations
      WHERE airdrop_id <> p_airdrop_id
      GROUP BY user_id
    ) other_ct ON other_ct.user_id = ap.user_id
    WHERE ap.airdrop_id = p_airdrop_id
    GROUP BY ap.user_id, p.email, p.is_test_user, p.created_at,
             cat_hist.cat_aria, other_ct.cnt
    ORDER BY SUM(ap.blocks_count) DESC
  ) sub;

  -- Algorithm scores
  v_scores := calculate_winner_score(p_airdrop_id);

  -- Winner explanation (richer text)
  IF v_airdrop.draw_executed_at IS NOT NULL AND v_scores IS NOT NULL AND jsonb_array_length(v_scores) > 0 THEN
    v_winner := v_scores->0;

    -- Find winner email from participants
    v_explain := 'Ha vinto perché ';

    IF (v_winner->>'f1')::NUMERIC >= (v_winner->>'f2')::NUMERIC
       AND (v_winner->>'f1')::NUMERIC >= (v_winner->>'f3')::NUMERIC THEN
      v_explain := v_explain || 'aveva il maggior numero di blocchi (F1=' || (v_winner->>'f1')
        || ', ' || (v_winner->>'blocks') || ' blocchi).';
    ELSIF (v_winner->>'f2')::NUMERIC >= (v_winner->>'f1')::NUMERIC
          AND (v_winner->>'f2')::NUMERIC >= (v_winner->>'f3')::NUMERIC THEN
      v_explain := v_explain || 'aveva la più alta fedeltà alla categoria '
        || v_airdrop.category || ' (F2=' || (v_winner->>'f2') || ').';
    ELSE
      v_explain := v_explain || 'si è registrato tra i primi e ha acquistato il primo blocco '
        || 'in anticipo rispetto agli altri (F3=' || (v_winner->>'f3') || ').';
    END IF;

    -- Add score decomposition
    v_explain := v_explain || ' Decomposizione: F1='
      || (v_winner->>'f1') || ' | F2=' || (v_winner->>'f2')
      || ' | F3=' || (v_winner->>'f3')
      || ' → Score=' || (v_winner->>'score') || '.';

    IF jsonb_array_length(v_scores) > 1 THEN
      v_explain := v_explain || ' Margine sul 2°: '
        || ROUND(((v_winner->>'score')::NUMERIC - (v_scores->1->>'score')::NUMERIC)::NUMERIC, 4)::TEXT
        || ' punti.';
    END IF;
  ELSE
    v_explain := NULL;
  END IF;

  -- NFT distribution data (for completed draws)
  IF v_airdrop.draw_executed_at IS NOT NULL THEN
    SELECT COUNT(*), COUNT(DISTINCT user_id)
    INTO v_nft_count, v_nft_recipients
    FROM nft_rewards
    WHERE metadata->>'airdrop_title' = v_airdrop.title
       OR source LIKE '%' || p_airdrop_id::TEXT || '%';

    -- Treasury before/after: find the treasury transaction for this airdrop
    SELECT
      COALESCE(
        (SELECT balance_eur FROM treasury_stats LIMIT 1) - COALESCE(v_airdrop.fondo_contributo_eur, 0),
        0
      ),
      COALESCE(
        (SELECT balance_eur FROM treasury_stats LIMIT 1),
        0
      )
    INTO v_treasury_pre, v_treasury_post;

    v_nft_data := jsonb_build_object(
      'nft_distributed', COALESCE(v_nft_count, 0),
      'nft_recipients', COALESCE(v_nft_recipients, 0),
      'treasury_before_eur', v_treasury_pre,
      'treasury_after_eur', v_treasury_post,
      'treasury_delta_eur', COALESCE(v_airdrop.fondo_contributo_eur, 0)
    );
  ELSE
    v_nft_data := NULL;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'airdrop_id', p_airdrop_id,
    'title', v_airdrop.title,
    'category', v_airdrop.category,
    'status', v_airdrop.status,
    'total_blocks', v_airdrop.total_blocks,
    'blocks_sold', v_airdrop.blocks_sold,
    'draw_executed', v_airdrop.draw_executed_at IS NOT NULL,
    'draw_executed_at', v_airdrop.draw_executed_at,
    'winner_id', v_airdrop.winner_id,
    'winner_score', v_airdrop.winner_score,
    'winner_explanation', v_explain,
    'scores', v_scores,
    'participants', v_details,
    'participant_count', COALESCE(jsonb_array_length(v_details), 0),
    'aria_incassato', COALESCE((
      SELECT SUM(aria_spent) FROM airdrop_participations WHERE airdrop_id = p_airdrop_id
    ), 0),
    -- Split economica (from stored draw data)
    'split', CASE WHEN v_airdrop.draw_executed_at IS NOT NULL THEN
      jsonb_build_object(
        'venditore_eur', COALESCE(v_airdrop.venditore_payout_eur, 0),
        'fondo_eur', COALESCE(v_airdrop.fondo_contributo_eur, 0),
        'airoobi_eur', COALESCE(v_airdrop.airoobi_fee_eur, 0),
        'charity_eur', COALESCE(v_airdrop.charity_contrib_eur, 0)
      )
    ELSE NULL END,
    -- NFT distribution data
    'nft', v_nft_data
  );
END;
$$;


-- ── 5. Update leaderboard to exclude test users ──
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(sub)::JSONB ORDER BY sub.total_points DESC), '[]'::JSONB)
    FROM (
      SELECT
        p.public_id,
        p.total_points,
        p.current_streak,
        p.avatar_url,
        p.created_at
      FROM profiles p
      JOIN auth.users au ON au.id = p.id
      WHERE p.deleted_at IS NULL
        AND p.is_test_user IS NOT TRUE
        AND au.email NOT IN ('ceo@airoobi.com', 'tommaso.pecorella+ceo@outlook.com')
      ORDER BY p.total_points DESC
      LIMIT 50
    ) sub
  );
END;
$$;


-- ── Grants ──
GRANT EXECUTE ON FUNCTION create_test_pool() TO authenticated;
GRANT EXECUTE ON FUNCTION simulate_airdrop_participation(UUID, NUMERIC, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_airdrop_analysis(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated;
