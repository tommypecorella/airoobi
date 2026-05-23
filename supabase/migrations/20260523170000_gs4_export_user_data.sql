-- ════════════════════════════════════════════════════════════════
-- GS-4 · export_user_data() · GDPR data portability self-service
-- ════════════════════════════════════════════════════════════════
-- Scope (Opzione A firmata Skeezu 23 May 2026):
--   - Solo export. delete_my_account() già live dall'11 apr 2026 (hard
--     delete con blocco airdrop attivi) resta intatto.
--   - Spec originale parlava di "soft_delete" pattern; verify-repo-state
--     ha rivelato che hard-delete è già live ed è GDPR-stronger
--     (Art. 17 right-to-erasure pieno, zero data retention).
--
-- Follow-up Stage 2 (NON ora, NON golden-session): rivedere hard-delete
-- → soft-delete quando ARIA→KAS rende vincolante la ritenzione audit
-- trail finanziario. Logged by ROBY in project memory.
--
-- Decision trail:
--   - Finding repo-state: CCP_RS_GS4_RepoStateFinding_3Options_2026-05-23.md
--   - GO Skeezu Opzione A: ROBY_Reply_CCP_GS4_GO_OptionA_2026-05-23.md
--
-- Privacy v2 §7 onorata: cancellazione (delete_my_account live) +
-- esportazione (questa RPC) entrambe self-service.
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.export_user_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid  uuid := auth.uid();
  _data jsonb;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Walk 7 tabelle utente. Ogni sezione = array di righe (vuoto se nessuna).
  SELECT jsonb_build_object(
    'ok',          true,
    'exported_at', now(),
    'user_id',     _uid,
    'schema_version', 1,

    -- 1. profile (riga singola)
    'profile', (
      SELECT to_jsonb(p)
      FROM public.profiles p
      WHERE p.id = _uid
    ),

    -- 2. points_ledger (storico movimenti ARIA)
    'points_ledger', COALESCE((
      SELECT jsonb_agg(to_jsonb(pl) ORDER BY pl.created_at DESC)
      FROM public.points_ledger pl
      WHERE pl.user_id = _uid
    ), '[]'::jsonb),

    -- 3. airdrop_participations (partecipazioni a airdrop)
    'airdrop_participations', COALESCE((
      SELECT jsonb_agg(to_jsonb(ap) ORDER BY ap.created_at DESC)
      FROM public.airdrop_participations ap
      WHERE ap.user_id = _uid
    ), '[]'::jsonb),

    -- 4. nft_rewards (ROBI + badge)
    'nft_rewards', COALESCE((
      SELECT jsonb_agg(to_jsonb(nr) ORDER BY nr.created_at DESC)
      FROM public.nft_rewards nr
      WHERE nr.user_id = _uid
    ), '[]'::jsonb),

    -- 5. referral_confirmations (entrambe le colonne: come referrer e referred)
    'referral_confirmations', COALESCE((
      SELECT jsonb_agg(to_jsonb(rc) ORDER BY rc.created_at DESC)
      FROM public.referral_confirmations rc
      WHERE rc.referrer_id = _uid OR rc.referred_id = _uid
    ), '[]'::jsonb),

    -- 6. checkins (check-in legacy)
    'checkins', COALESCE((
      SELECT jsonb_agg(to_jsonb(c) ORDER BY c.checked_at DESC)
      FROM public.checkins c
      WHERE c.user_id = _uid
    ), '[]'::jsonb),

    -- 7. video_views (video sospesi in Alpha)
    'video_views', COALESCE((
      SELECT jsonb_agg(to_jsonb(vv) ORDER BY vv.viewed_at DESC)
      FROM public.video_views vv
      WHERE vv.user_id = _uid
    ), '[]'::jsonb)
  )
  INTO _data;

  RETURN _data;
END;
$$;

-- GRANT esplicito (lezione feedback_supabase_grant_on_create_table).
GRANT EXECUTE ON FUNCTION public.export_user_data() TO authenticated;

COMMENT ON FUNCTION public.export_user_data() IS
  'GDPR Art. 20 data portability · self-service export · GS-4 · 23 May 2026';
