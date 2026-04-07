-- ══════════════════════════════════════════════════════════
--  Cron: controlla deadline airdrop ogni 15 minuti
--  Chiama Edge Function check-deadlines
-- ══════════════════════════════════════════════════════════

-- Abilita pg_cron e pg_net (necessarie per cron HTTP)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.schedule(
  'check-airdrop-deadlines',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1)
           || '/functions/v1/check-deadlines',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
