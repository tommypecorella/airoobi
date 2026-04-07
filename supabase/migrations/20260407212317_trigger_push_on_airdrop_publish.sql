-- ══════════════════════════════════════════════════════════
--  Trigger: notifica push quando un airdrop passa a presale/sale
--  Chiama la Edge Function send-push con type=new_airdrop
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_airdrop_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo quando status cambia da non-attivo a presale/sale
  IF (OLD.status NOT IN ('presale', 'sale') AND NEW.status IN ('presale', 'sale')) THEN
    PERFORM net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1)
             || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
      ),
      body := jsonb_build_object(
        'type', 'new_airdrop',
        'airdrop_id', NEW.id,
        'title', NEW.title,
        'category', NEW.category
      )
    );
  END IF;

  -- Notifica draw_winner e draw_robi quando draw viene eseguito
  IF (OLD.draw_executed_at IS NULL AND NEW.draw_executed_at IS NOT NULL) THEN
    -- Vincitore
    IF NEW.winner_id IS NOT NULL THEN
      PERFORM net.http_post(
        url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1)
               || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
        ),
        body := jsonb_build_object(
          'type', 'draw_winner',
          'airdrop_id', NEW.id,
          'user_id', NEW.winner_id,
          'title', NEW.title
        )
      );
    END IF;
    -- ROBI per tutti i partecipanti
    PERFORM net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1)
             || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
      ),
      body := jsonb_build_object(
        'type', 'draw_robi',
        'airdrop_id', NEW.id,
        'title', NEW.title
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger solo su UPDATE
DROP TRIGGER IF EXISTS trg_airdrop_push_notify ON airdrops;
CREATE TRIGGER trg_airdrop_push_notify
  AFTER UPDATE ON airdrops
  FOR EACH ROW
  EXECUTE FUNCTION notify_airdrop_published();
