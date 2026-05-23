-- ══════════════════════════════════════════════════════════════════════════
--  GS-6 + GS-14 · Cluster prezzo ROBI
--  Opzione A in-spirito (delega "a oltranza" Skeezu + pg_cron già installato)
--  - Tabella robi_price_snapshots (history orario per trend grafico)
--  - Funzione snapshot_robi_price() (single source of truth della formula)
--  - Cron pg_cron orario auto-schedule
--  - RPC get_robi_market_data() (consumer-friendly: topbar dApp + Explorer)
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Tabella snapshot orari (grafico storico + trend %)
CREATE TABLE IF NOT EXISTS public.robi_price_snapshots (
  id BIGSERIAL PRIMARY KEY,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  price_eur NUMERIC(20,6) NOT NULL,
  treasury_eur NUMERIC(20,2) NOT NULL,
  robi_circulating NUMERIC(20,4) NOT NULL,
  CONSTRAINT robi_price_snapshots_taken_at_unique UNIQUE (taken_at)
);

CREATE INDEX IF NOT EXISTS robi_price_snapshots_taken_at_idx
  ON public.robi_price_snapshots (taken_at DESC);

-- GRANT esplicito (cal. feedback_supabase_grant_on_create_table)
-- Pubblica (lettura per topbar dApp anche utenti anon? No: meglio authenticated only)
GRANT SELECT ON public.robi_price_snapshots TO authenticated;
GRANT ALL ON SEQUENCE robi_price_snapshots_id_seq TO authenticated;

-- RLS: lettura aperta authenticated, scrittura solo SECURITY DEFINER
ALTER TABLE public.robi_price_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_read_authenticated" ON public.robi_price_snapshots
  FOR SELECT TO authenticated USING (true);

-- 2. Funzione che fa lo snapshot (single source of truth della formula)
CREATE OR REPLACE FUNCTION public.snapshot_robi_price()
RETURNS public.robi_price_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_treasury NUMERIC;
  v_robi NUMERIC;
  v_price NUMERIC;
  v_row public.robi_price_snapshots;
BEGIN
  SELECT COALESCE(SUM(amount_eur), 0) INTO v_treasury FROM public.treasury_funds;
  SELECT COALESCE(SUM(shares), 0) INTO v_robi
    FROM public.nft_rewards WHERE nft_type IN ('ROBI', 'NFT_REWARD');

  IF v_robi > 0 THEN
    v_price := v_treasury / v_robi;
  ELSE
    v_price := 0;
  END IF;

  INSERT INTO public.robi_price_snapshots (price_eur, treasury_eur, robi_circulating)
  VALUES (ROUND(v_price, 6), ROUND(v_treasury, 2), ROUND(v_robi, 4))
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.snapshot_robi_price() TO authenticated;

-- 3. Schedule cron orario (pg_cron già installato)
-- Run alle 0 di ogni ora (60min snapshots). Idempotente: unschedule precedente se esiste.
DO $$
DECLARE
  v_jobid bigint;
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'snapshot_robi_price_hourly';
  IF v_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_jobid);
  END IF;
  PERFORM cron.schedule(
    'snapshot_robi_price_hourly',
    '0 * * * *',
    $cron$SELECT public.snapshot_robi_price();$cron$
  );
END $$;

-- 4. RPC consumer (topbar + Explorer)
-- Ritorna: prezzo now, trend 24h, treasury, circulating, snapshot count
CREATE OR REPLACE FUNCTION public.get_robi_market_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_treasury NUMERIC;
  v_robi NUMERIC;
  v_price_now NUMERIC;
  v_price_24h_ago NUMERIC;
  v_trend_pct NUMERIC;
  v_snapshot_count INT;
  v_first_snapshot TIMESTAMPTZ;
BEGIN
  SELECT COALESCE(SUM(amount_eur), 0) INTO v_treasury FROM public.treasury_funds;
  SELECT COALESCE(SUM(shares), 0) INTO v_robi
    FROM public.nft_rewards WHERE nft_type IN ('ROBI', 'NFT_REWARD');

  IF v_robi > 0 THEN
    v_price_now := ROUND(v_treasury / v_robi, 6);
  ELSE
    v_price_now := 0;
  END IF;

  SELECT COUNT(*), MIN(taken_at) INTO v_snapshot_count, v_first_snapshot
    FROM public.robi_price_snapshots;

  -- Trend solo se abbiamo almeno 1 snapshot ≥24h fa
  SELECT price_eur INTO v_price_24h_ago
    FROM public.robi_price_snapshots
    WHERE taken_at <= NOW() - INTERVAL '24 hours'
    ORDER BY taken_at DESC
    LIMIT 1;

  IF v_price_24h_ago IS NOT NULL AND v_price_24h_ago > 0 THEN
    v_trend_pct := ROUND(((v_price_now - v_price_24h_ago) / v_price_24h_ago) * 100, 2);
  ELSE
    v_trend_pct := NULL;
  END IF;

  RETURN jsonb_build_object(
    'price_eur', v_price_now,
    'treasury_eur', ROUND(v_treasury, 2),
    'robi_circulating', ROUND(v_robi, 4),
    'trend_24h_pct', v_trend_pct,
    'snapshot_count', v_snapshot_count,
    'first_snapshot_at', v_first_snapshot,
    'collecting_data', v_snapshot_count < 24
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_robi_market_data() TO authenticated, anon;

-- 5. Seed initial snapshot (così Day 1 il grafico ha 1 punto, no Empty State)
SELECT public.snapshot_robi_price();
