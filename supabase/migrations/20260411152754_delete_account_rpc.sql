-- ══════════════════════════════════════════════════════════
--  RPC: delete_my_account
--  Elimina completamente l'account dell'utente corrente.
--  BLOCCA se ci sono airdrop attivi (partecipazioni o submission).
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _active_participations int;
  _active_submissions int;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- ── Check: partecipazioni in airdrop attivi ──
  SELECT count(*) INTO _active_participations
  FROM airdrop_participations ap
  JOIN airdrops a ON a.id = ap.airdrop_id
  WHERE ap.user_id = _uid
    AND ap.cancelled_at IS NULL
    AND a.status IN ('presale', 'sale');

  IF _active_participations > 0 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'active_participations',
      'count', _active_participations
    );
  END IF;

  -- ── Check: airdrop sottomessi non completati ──
  SELECT count(*) INTO _active_submissions
  FROM airdrops
  WHERE submitted_by = _uid
    AND status IN ('draft', 'in_valutazione', 'presale', 'sale', 'closed');

  IF _active_submissions > 0 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'active_submissions',
      'count', _active_submissions
    );
  END IF;

  -- ══ Eliminazione catena dati ══

  -- 1. Messaggi airdrop
  DELETE FROM airdrop_messages WHERE sender_id = _uid;

  -- 2. Blocchi airdrop (solo airdrop completati/annullati)
  DELETE FROM airdrop_blocks WHERE owner_id = _uid;

  -- 3. Partecipazioni airdrop
  DELETE FROM airdrop_participations WHERE user_id = _uid;

  -- 4. Anonimizza airdrop dove utente è winner o submitter (completati)
  UPDATE airdrops SET winner_id = NULL WHERE winner_id = _uid;
  UPDATE airdrops SET submitted_by = NULL WHERE submitted_by = _uid;
  UPDATE airdrops SET created_by = NULL WHERE created_by = _uid;

  -- 5. NFT rewards (ROBI + badges)
  DELETE FROM nft_rewards WHERE user_id = _uid;

  -- 6. Punti e attività
  DELETE FROM points_ledger WHERE user_id = _uid;
  DELETE FROM checkins WHERE user_id = _uid;
  DELETE FROM video_views WHERE user_id = _uid;

  -- 7. Referral (entrambe le colonne)
  DELETE FROM referral_confirmations WHERE referrer_id = _uid OR referred_id = _uid;

  -- 8. Notifiche
  DELETE FROM notifications WHERE user_id = _uid;

  -- 9. Eventi analytics (anonimizza, non elimina)
  UPDATE events SET user_id = NULL WHERE user_id = _uid;

  -- 10. Ruoli e permessi
  DELETE FROM user_roles WHERE user_id = _uid;
  DELETE FROM airdrop_manager_permissions WHERE user_id = _uid OR granted_by = _uid;

  -- 11. Treasury (anonimizza audit trail)
  UPDATE treasury_funds SET created_by = NULL WHERE created_by = _uid;

  -- 12. Profilo
  DELETE FROM profiles WHERE id = _uid;

  -- 13. Auth user (cascada: airdrop_watchlist, user_preferences,
  --     push_subscriptions, auto_buy_rules, wishlist_alerts)
  DELETE FROM auth.users WHERE id = _uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
