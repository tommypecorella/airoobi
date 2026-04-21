-- ============================================================
-- FIX: notify_airdrop_published — NULL guard su vault secrets
--
-- Il trigger crashava con "null value in column url" quando i
-- secret supabase_url/service_role_key non erano nel vault.
-- Ora fa skip silenzioso se i secret mancano.
-- ============================================================

CREATE OR REPLACE FUNCTION notify_airdrop_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url TEXT;
  v_key TEXT;
BEGIN
  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1;
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;

  IF v_url IS NULL OR v_key IS NULL THEN
    RETURN NEW;
  END IF;

  IF (OLD.status NOT IN ('presale', 'sale') AND NEW.status IN ('presale', 'sale')) THEN
    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_key
      ),
      body := jsonb_build_object(
        'type', 'new_airdrop',
        'airdrop_id', NEW.id,
        'title', NEW.title,
        'category', NEW.category
      )
    );
  END IF;

  IF (OLD.draw_executed_at IS NULL AND NEW.draw_executed_at IS NOT NULL) THEN
    IF NEW.winner_id IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_key
        ),
        body := jsonb_build_object(
          'type', 'draw_winner',
          'airdrop_id', NEW.id,
          'user_id', NEW.winner_id,
          'title', NEW.title
        )
      );
    END IF;
    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_key
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
