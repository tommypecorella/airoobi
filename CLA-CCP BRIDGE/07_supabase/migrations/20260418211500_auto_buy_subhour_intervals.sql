-- ══════════════════════════════════════════════════════════
--  Auto-buy: intervalli sub-orari (15min, 30min) + esistenti
--  Estende interval_hours da INTEGER a NUMERIC per decimali.
--  Cron process-auto-buy portato a ogni 15 minuti.
-- ══════════════════════════════════════════════════════════

-- 1. Rimuovi CHECK vecchio e allarga il tipo a NUMERIC(4,2)
ALTER TABLE auto_buy_rules DROP CONSTRAINT IF EXISTS auto_buy_rules_interval_hours_check;
ALTER TABLE auto_buy_rules ALTER COLUMN interval_hours TYPE NUMERIC(4,2) USING interval_hours::numeric;
ALTER TABLE auto_buy_rules ADD CONSTRAINT auto_buy_rules_interval_hours_check
  CHECK (interval_hours IN (0.25, 0.5, 1, 2, 4, 6, 12));

-- 2. Ricrea upsert_auto_buy con p_interval_hours NUMERIC
DROP FUNCTION IF EXISTS upsert_auto_buy(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION upsert_auto_buy(
  p_airdrop_id UUID,
  p_blocks_per_interval INTEGER DEFAULT 1,
  p_interval_hours NUMERIC DEFAULT 4,
  p_max_blocks INTEGER DEFAULT 50,
  p_active BOOLEAN DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO auto_buy_rules (user_id, airdrop_id, blocks_per_interval, interval_hours, max_blocks, active)
  VALUES (auth.uid(), p_airdrop_id, p_blocks_per_interval, p_interval_hours, p_max_blocks, p_active)
  ON CONFLICT (user_id, airdrop_id) DO UPDATE SET
    blocks_per_interval = EXCLUDED.blocks_per_interval,
    interval_hours = EXCLUDED.interval_hours,
    max_blocks = EXCLUDED.max_blocks,
    active = EXCLUDED.active;
  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_auto_buy(UUID, INTEGER, NUMERIC, INTEGER, BOOLEAN) TO authenticated;

-- 3. Riprogramma cron ogni 15 minuti (prima era ogni ora)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='process-auto-buy') THEN
    PERFORM cron.unschedule('process-auto-buy');
  END IF;
END $$;

SELECT cron.schedule(
  'process-auto-buy',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1)
           || '/functions/v1/process-auto-buy',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
