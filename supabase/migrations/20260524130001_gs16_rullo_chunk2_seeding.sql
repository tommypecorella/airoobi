-- ════════════════════════════════════════════════════════════════════
-- GS-16 · IL RULLO ROBI · Chunk 2 · Algoritmo seeding formula B
-- 24 May 2026 · cluster GS-16
-- ════════════════════════════════════════════════════════════════════
-- Trigger AFTER UPDATE OF status su airdrops → quando un airdrop transita
-- da 'accettato' a 'presale' o 'sale' (= apertura acquisti), semina N ROBI
-- nascosti nel pool blocchi secondo formula B + guardrail anti-inflazione.
--
-- Formula B (firmata Skeezu, condizione: guardia hard anti-inflazione):
--   N_target  = floor(total_blocks × robi_seeding_pct)         -- 2%
--   N_capped  = least(N_target, robi_seeding_max_per_airdrop)  -- cap layer 1
--   N_daily   = se daily cap attivo (config > 0), clip al remaining giornaliero
--   N_final   = min(N_capped, N_daily, total_blocks)
--
-- Posizioni: random uniforme [1, total_blocks] senza ripetizione, salvate
-- in airdrop_block_seeds (decisione i · auditable, riproducibile).
--
-- Idempotent: se airdrop_id già ha righe in airdrop_block_seeds, skip.
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.tf_airdrop_seed_rullo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_blocks INTEGER;
  v_pct          NUMERIC;
  v_cap_airdrop  INTEGER;
  v_daily_cap    INTEGER;
  v_seeded_today NUMERIC;
  v_daily_remain INTEGER;
  v_n_target     INTEGER;
  v_n_capped     INTEGER;
  v_n_final      INTEGER;
  v_already      INTEGER;
BEGIN
  -- Trigger fires solo su transizione: accettato → (presale|sale)
  -- Cioè: apertura acquisti per la prima volta.
  IF NOT (
    NEW.status IN ('presale','sale')
    AND (OLD.status IS NULL OR OLD.status NOT IN ('presale','sale','closed','completed','annullato','waiting_seller_acknowledge'))
  ) THEN
    RETURN NEW;
  END IF;

  -- Idempotent: skip se già seminato (manual re-trigger, replay)
  SELECT COUNT(*) INTO v_already
  FROM public.airdrop_block_seeds
  WHERE airdrop_id = NEW.id;

  IF v_already > 0 THEN
    RAISE NOTICE 'GS-16 · airdrop % già seminato (% seeds esistenti), skip', NEW.id, v_already;
    RETURN NEW;
  END IF;

  v_total_blocks := NEW.total_blocks;
  IF v_total_blocks IS NULL OR v_total_blocks <= 0 THEN
    RAISE NOTICE 'GS-16 · airdrop % total_blocks NULL o <= 0, skip seeding', NEW.id;
    RETURN NEW;
  END IF;

  -- Load config
  SELECT value::NUMERIC  INTO v_pct          FROM public.airdrop_config WHERE key = 'robi_seeding_pct';
  SELECT value::INTEGER  INTO v_cap_airdrop  FROM public.airdrop_config WHERE key = 'robi_seeding_max_per_airdrop';
  SELECT value::INTEGER  INTO v_daily_cap    FROM public.airdrop_config WHERE key = 'robi_seeding_daily_cap_total';

  IF v_pct IS NULL OR v_pct <= 0 THEN
    RAISE NOTICE 'GS-16 · robi_seeding_pct missing or <= 0, skip seeding airdrop %', NEW.id;
    RETURN NEW;
  END IF;

  -- Formula B
  v_n_target := FLOOR(v_total_blocks * v_pct)::INTEGER;

  -- Guardrail LAYER 1: cap hard per airdrop
  v_n_capped := LEAST(v_n_target, COALESCE(v_cap_airdrop, v_n_target));

  -- Guardrail LAYER 3: quota giornaliera (se attiva)
  v_n_final := v_n_capped;
  IF v_daily_cap IS NOT NULL AND v_daily_cap > 0 THEN
    SELECT COALESCE(SUM(robi_amount), 0) INTO v_seeded_today
    FROM public.airdrop_block_seeds
    WHERE created_at::DATE = CURRENT_DATE;

    v_daily_remain := v_daily_cap - v_seeded_today::INTEGER;
    IF v_daily_remain <= 0 THEN
      RAISE NOTICE 'GS-16 · daily cap raggiunto (% / %), airdrop % parte senza rullo', v_seeded_today, v_daily_cap, NEW.id;
      RETURN NEW;
    END IF;
    v_n_final := LEAST(v_n_final, v_daily_remain);
  END IF;

  -- Hard limit: non puoi seminare più ROBI di blocchi disponibili
  v_n_final := LEAST(v_n_final, v_total_blocks);

  IF v_n_final <= 0 THEN
    RAISE NOTICE 'GS-16 · N_final <= 0 per airdrop %, skip seeding', NEW.id;
    RETURN NEW;
  END IF;

  -- SEEDING: random uniforme [1, total_blocks] senza ripetizione (decisione i)
  -- Usa ORDER BY random() LIMIT N su generate_series — uniforme + auditable
  INSERT INTO public.airdrop_block_seeds (airdrop_id, block_number, robi_amount)
  SELECT NEW.id, bn, 1
  FROM (
    SELECT bn FROM generate_series(1, v_total_blocks) AS bn
    ORDER BY random()
    LIMIT v_n_final
  ) AS pos;

  -- Guardrail LAYER 2: contabilizzazione emissione tracciata
  UPDATE public.treasury_stats
  SET robi_rullo_seeded = robi_rullo_seeded + v_n_final
  WHERE id = (SELECT id FROM public.treasury_stats ORDER BY created_at DESC LIMIT 1);

  RAISE NOTICE 'GS-16 · airdrop % seminato · % ROBI nascosti su % blocchi (formula B 2%%, cap %, daily-remain %)',
    NEW.id, v_n_final, v_total_blocks, v_cap_airdrop, COALESCE(v_daily_remain::TEXT, 'OFF');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_airdrop_seed_rullo ON public.airdrops;
CREATE TRIGGER trg_airdrop_seed_rullo
  AFTER UPDATE OF status ON public.airdrops
  FOR EACH ROW
  EXECUTE FUNCTION public.tf_airdrop_seed_rullo();

COMMENT ON FUNCTION public.tf_airdrop_seed_rullo IS 'GS-16 · trigger seeding rullo ROBI. Fires alla transizione accettato → presale/sale. Formula B (2% deterministico) + guardrail 3 layer anti-inflazione (cap per airdrop · contabilizzazione treasury · quota giornaliera levetta).';

-- ─────────────────────────────────────────────────────────────────
-- Mini integration test (feedback_pr_integration_test)
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_test_airdrop UUID;
  v_test_user UUID;
  v_seeded_before NUMERIC;
  v_seeded_after NUMERIC;
  v_seed_count INTEGER;
  v_expected INTEGER;
BEGIN
  -- Trova un utente reale (qualsiasi · usato come submitted_by)
  SELECT id INTO v_test_user FROM auth.users LIMIT 1;
  IF v_test_user IS NULL THEN
    RAISE NOTICE 'GS-16 Chunk 2 test SKIPPED · no users in auth.users';
    RETURN;
  END IF;

  -- Snapshot treasury PRE
  SELECT robi_rullo_seeded INTO v_seeded_before
  FROM public.treasury_stats ORDER BY created_at DESC LIMIT 1;

  -- INSERT airdrop test in stato 'accettato' (no trigger ancora)
  v_test_airdrop := gen_random_uuid();
  INSERT INTO public.airdrops (id, title, description, category, status, submitted_by, total_blocks, block_price_aria, deadline)
  VALUES (
    v_test_airdrop,
    'GS-16 INTEGRATION TEST · DELETEME',
    'Test seeding rullo — formula B',
    'altro',
    'accettato',
    v_test_user,
    100,
    20,
    NOW() + INTERVAL '7 days'
  );

  -- TRIGGER FIRE: transizione accettato → sale
  UPDATE public.airdrops SET status = 'sale' WHERE id = v_test_airdrop;

  -- Verifica seeding
  SELECT COUNT(*) INTO v_seed_count FROM public.airdrop_block_seeds WHERE airdrop_id = v_test_airdrop;
  v_expected := FLOOR(100 * 0.02)::INTEGER;  -- = 2 ROBI per 100 blocchi

  IF v_seed_count <> v_expected THEN
    -- Cleanup before fail
    DELETE FROM public.airdrop_block_seeds WHERE airdrop_id = v_test_airdrop;
    DELETE FROM public.airdrops WHERE id = v_test_airdrop;
    UPDATE public.treasury_stats SET robi_rullo_seeded = v_seeded_before
    WHERE id = (SELECT id FROM public.treasury_stats ORDER BY created_at DESC LIMIT 1);
    RAISE EXCEPTION 'GS-16 Chunk 2 test FAIL · seed_count expected %, got %', v_expected, v_seed_count;
  END IF;

  -- Verifica treasury aggiornato
  SELECT robi_rullo_seeded INTO v_seeded_after
  FROM public.treasury_stats ORDER BY created_at DESC LIMIT 1;

  IF v_seeded_after - v_seeded_before <> v_expected THEN
    DELETE FROM public.airdrop_block_seeds WHERE airdrop_id = v_test_airdrop;
    DELETE FROM public.airdrops WHERE id = v_test_airdrop;
    UPDATE public.treasury_stats SET robi_rullo_seeded = v_seeded_before
    WHERE id = (SELECT id FROM public.treasury_stats ORDER BY created_at DESC LIMIT 1);
    RAISE EXCEPTION 'GS-16 Chunk 2 test FAIL · treasury delta expected %, got %', v_expected, (v_seeded_after - v_seeded_before);
  END IF;

  -- Idempotency test: re-trigger non semina di nuovo
  UPDATE public.airdrops SET status = 'accettato' WHERE id = v_test_airdrop;
  UPDATE public.airdrops SET status = 'sale' WHERE id = v_test_airdrop;
  SELECT COUNT(*) INTO v_seed_count FROM public.airdrop_block_seeds WHERE airdrop_id = v_test_airdrop;
  IF v_seed_count <> v_expected THEN
    DELETE FROM public.airdrop_block_seeds WHERE airdrop_id = v_test_airdrop;
    DELETE FROM public.airdrops WHERE id = v_test_airdrop;
    UPDATE public.treasury_stats SET robi_rullo_seeded = v_seeded_before
    WHERE id = (SELECT id FROM public.treasury_stats ORDER BY created_at DESC LIMIT 1);
    RAISE EXCEPTION 'GS-16 Chunk 2 test FAIL · idempotency violated · seed_count after re-trigger = %', v_seed_count;
  END IF;

  -- Cleanup
  DELETE FROM public.airdrop_block_seeds WHERE airdrop_id = v_test_airdrop;
  DELETE FROM public.airdrops WHERE id = v_test_airdrop;
  UPDATE public.treasury_stats SET robi_rullo_seeded = v_seeded_before
  WHERE id = (SELECT id FROM public.treasury_stats ORDER BY created_at DESC LIMIT 1);

  RAISE NOTICE 'GS-16 Chunk 2 (seeding formula B + idempotency + treasury) integration test OK · % ROBI per 100 blocchi', v_expected;
END $$;
