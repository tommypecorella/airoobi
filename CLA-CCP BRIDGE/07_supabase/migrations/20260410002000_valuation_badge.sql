-- ============================================================
-- VALUATION BADGE — Badge per ogni valutazione oggetto
--
-- Ogni submission crea un badge VALUATION in nft_rewards con
-- metadata strutturata (title, category, prices, status, photos).
-- Il badge è relazionato all'airdrop via airdrop_id.
--
-- 1. Backfill: crea badge per tutte le submission esistenti
-- 2. Trigger: crea badge automaticamente su nuove submission
-- ============================================================

-- 1. Backfill badge per submission esistenti
INSERT INTO nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata, created_at)
SELECT
  a.submitted_by,
  'VALUATION',
  'Valutazione: ' || a.title,
  'object_valuation',
  a.id,
  1.0,
  jsonb_build_object(
    'title', a.title,
    'description', COALESCE(a.description, ''),
    'category', a.category,
    'image_url', COALESCE(a.image_url, ''),
    'image_urls', COALESCE(a.product_info->'extra_photos', '[]'::jsonb),
    'seller_desired_price', COALESCE(a.seller_desired_price, 0),
    'seller_min_price', COALESCE(a.seller_min_price, 0),
    'object_value_eur', COALESCE(a.object_value_eur, 0),
    'status', a.status,
    'rejection_reason', COALESCE(a.rejection_reason, ''),
    'submitted_at', a.created_at
  ),
  a.created_at
FROM airdrops a
WHERE a.submitted_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM nft_rewards n
    WHERE n.user_id = a.submitted_by
      AND n.nft_type = 'VALUATION'
      AND n.airdrop_id = a.id
  );

-- 2. Funzione trigger: auto-create badge su nuove submission
CREATE OR REPLACE FUNCTION auto_create_valuation_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo per nuove submission (submitted_by valorizzato, status in_valutazione)
  IF NEW.submitted_by IS NOT NULL AND NEW.status = 'in_valutazione' THEN
    INSERT INTO nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata, created_at)
    VALUES (
      NEW.submitted_by,
      'VALUATION',
      'Valutazione: ' || NEW.title,
      'object_valuation',
      NEW.id,
      1.0,
      jsonb_build_object(
        'title', NEW.title,
        'description', COALESCE(NEW.description, ''),
        'category', NEW.category,
        'image_url', COALESCE(NEW.image_url, ''),
        'image_urls', COALESCE(NEW.product_info->'extra_photos', '[]'::jsonb),
        'seller_desired_price', COALESCE(NEW.seller_desired_price, 0),
        'seller_min_price', COALESCE(NEW.seller_min_price, 0),
        'object_value_eur', 0,
        'status', NEW.status,
        'rejection_reason', '',
        'submitted_at', NEW.created_at
      ),
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Aggiorna metadata del badge quando lo status cambia (approvato, rifiutato, ecc.)
  IF TG_OP = 'UPDATE' AND NEW.submitted_by IS NOT NULL AND OLD.status <> NEW.status THEN
    UPDATE nft_rewards
    SET
      metadata = metadata
        || jsonb_build_object('status', NEW.status)
        || jsonb_build_object('object_value_eur', COALESCE(NEW.object_value_eur, 0))
        || jsonb_build_object('rejection_reason', COALESCE(NEW.rejection_reason, '')),
      name = 'Valutazione: ' || NEW.title
    WHERE user_id = NEW.submitted_by
      AND nft_type = 'VALUATION'
      AND airdrop_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Trigger su airdrops
DROP TRIGGER IF EXISTS trg_valuation_badge ON airdrops;
CREATE TRIGGER trg_valuation_badge
  AFTER INSERT OR UPDATE ON airdrops
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_valuation_badge();
