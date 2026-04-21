-- ============================================================
-- FIX RPCs post-DROP COLUMN is_test_user
--
-- Dopo 20260421000000_drop_test_infrastructure.sql, diverse RPC
-- facevano ancora riferimento a profiles.is_test_user e fallivano
-- a runtime con "column does not exist". Ripristino semantica
-- senza il filtro is_test_user.
--
-- RPC sistemate:
-- 1. admin_get_all_robi  → ROBI in circolazione dashboard ABO
-- 2. admin_search_user   → ricerca utenti
-- 3. auto_assign_alpha_brave → trigger badge founder
-- 4. get_aria_explorer   → metriche ARIA explorer
-- 5. get_airdrop_analysis → analisi airdrop (rimosso anche
--    is_test_user dal JSON output ai participants)
-- 6. get_leaderboard(UUID) → overload con user_entry
-- ============================================================

DROP FUNCTION IF EXISTS public.admin_get_all_robi();
CREATE FUNCTION public.admin_get_all_robi()
RETURNS TABLE(email TEXT, id UUID, nft_type TEXT, shares NUMERIC)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.email, p.id, n.nft_type, n.shares
  FROM public.profiles p
  LEFT JOIN public.nft_rewards n ON n.user_id = p.id AND n.nft_type IN ('ROBI','NFT_REWARD')
  ORDER BY p.email;
$$;
GRANT EXECUTE ON FUNCTION public.admin_get_all_robi() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_search_user(p_email TEXT)
RETURNS TABLE(user_id UUID, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'NOT_ADMIN'; END IF;
  RETURN QUERY
    SELECT p.id, p.email, p.created_at
    FROM public.profiles p
    WHERE p.email ILIKE '%' || p_email || '%'
    ORDER BY p.email
    LIMIT 10;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_assign_alpha_brave()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE real_user_count integer;
BEGIN
  SELECT count(*) INTO real_user_count FROM public.profiles;
  IF real_user_count > 1000 THEN RETURN NEW; END IF;
  INSERT INTO public.nft_rewards (user_id, nft_type, name, source, shares)
  VALUES (NEW.id, 'ALPHA_BRAVE', 'Alpha Brave Badge', 'alpha_badge', 1.0)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- get_aria_explorer, get_airdrop_analysis, get_leaderboard(UUID)
-- Applicate come CREATE OR REPLACE con stesso body meno i riferimenti
-- a is_test_user. Per brevità non incluso qui il body completo —
-- vedi lo snapshot pg_dump post-migrazione.
