-- ═══════════════════════════════════════════════════════════════
-- BUCKET STORAGE AIRDROPS — 22 Apr 2026
-- ═══════════════════════════════════════════════════════════════
-- Bucket pubblico per le foto degli airdrop (main + extra).
-- Structure: airdrops/{airdrop_id}/1.jpg, 2.jpg, ...
--
-- Upload effettivo delle foto fatto tramite:
--   scripts/upload_airdrop_photos.mjs
-- che scarica da Loremflickr keyword-tagged e carica su questo bucket,
-- poi aggiorna airdrops.image_url (foto 1) e
-- airdrops.product_info.extra_photos = [url foto 2].
-- ═══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('airdrops', 'airdrops', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Public read for airdrops') THEN
    EXECUTE $p$CREATE POLICY "Public read for airdrops" ON storage.objects FOR SELECT USING (bucket_id = 'airdrops')$p$;
  END IF;
END$$;
