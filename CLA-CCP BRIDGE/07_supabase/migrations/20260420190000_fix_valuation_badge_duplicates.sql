-- ============================================================
-- FIX VALUATION BADGE DUPLICATES
--
-- Il trigger auto_create_valuation_badge inseriva un nuovo badge
-- VALUATION su OGNI UPDATE di airdrops mentre status era ancora
-- 'in_valutazione' (non filtrava TG_OP). Senza UNIQUE constraint,
-- ON CONFLICT DO NOTHING non faceva nulla.
--
-- Fix:
-- 1. Dedup delle righe esistenti (tieni la più vecchia per airdrop/user)
-- 2. UNIQUE INDEX parziale su (user_id, airdrop_id) WHERE nft_type='VALUATION'
-- 3. Trigger: INSERT solo su TG_OP='INSERT'
-- ============================================================

-- 1. Dedup: elimina tutti i badge VALUATION duplicati tranne il più vecchio
DELETE FROM nft_rewards n
WHERE n.nft_type = 'VALUATION'
  AND n.id NOT IN (
    SELECT DISTINCT ON (user_id, airdrop_id) id
    FROM nft_rewards
    WHERE nft_type = 'VALUATION'
    ORDER BY user_id, airdrop_id, created_at ASC
  );

-- 2. UNIQUE INDEX parziale per prevenire futuri duplicati
CREATE UNIQUE INDEX IF NOT EXISTS idx_nft_rewards_valuation_unique
  ON nft_rewards (user_id, airdrop_id)
  WHERE nft_type = 'VALUATION';

-- 3. Trigger fix: INSERT solo su TG_OP='INSERT'
CREATE OR REPLACE FUNCTION auto_create_valuation_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Crea badge solo all'INSERT della submission
  IF TG_OP = 'INSERT'
     AND NEW.submitted_by IS NOT NULL
     AND NEW.status = 'in_valutazione' THEN
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
    ON CONFLICT (user_id, airdrop_id) WHERE nft_type = 'VALUATION' DO NOTHING;
  END IF;

  -- Aggiorna metadata del badge quando lo status cambia
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
