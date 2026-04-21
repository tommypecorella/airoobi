-- ============================================================
-- CLEANUP: drop funzioni overloaded che causano errore PostgREST
-- "Could not choose the best candidate function"
-- ============================================================

-- get_draw_preview: vecchia versione senza p_service_call
DROP FUNCTION IF EXISTS public.get_draw_preview(uuid);

-- submit_object_for_valuation: vecchia versione senza p_image_urls
DROP FUNCTION IF EXISTS public.submit_object_for_valuation(text, text, text, text, numeric, numeric);

-- manager_update_airdrop: vecchie versioni gia' droppate in migrazione 003000
-- (qui per idempotenza)
DROP FUNCTION IF EXISTS public.manager_update_airdrop(uuid, text, integer, integer, integer, timestamptz, text);
DROP FUNCTION IF EXISTS public.manager_update_airdrop(uuid, text, integer, integer, integer, timestamptz, text, numeric, boolean);
DROP FUNCTION IF EXISTS public.manager_update_airdrop(uuid, text, integer, integer, integer, timestamptz, text, numeric, numeric, numeric);
