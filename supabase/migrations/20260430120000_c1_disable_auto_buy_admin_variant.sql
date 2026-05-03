-- ════════════════════════════════════════════════════════════════════
-- C1 fix (LOW promosso a chiudi-W1) · disable_auto_buy_admin variant
-- TECH-HARDEN-001 · Sprint W1 · Day 4 · 30 Apr 2026
--
-- ROBY code review C1 (cross-check upgrade): preservare RPC pattern per
-- compatibilità con eventuali trigger futuri su auto_buy_rules
-- (es. notifica utente "abbiamo disattivato la tua regola").
--
-- L'RPC esistente disable_auto_buy(p_airdrop_id) usa auth.uid() che è
-- NULL quando chiamato da service_role (process-auto-buy edge function).
-- Necessario un variant admin che accetti p_user_id esplicito.
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.disable_auto_buy_admin(
  p_user_id    UUID,
  p_airdrop_id UUID
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auto_buy_rules SET active = false
   WHERE user_id = p_user_id AND airdrop_id = p_airdrop_id;
  RETURN jsonb_build_object('ok', true, 'user_id', p_user_id, 'airdrop_id', p_airdrop_id);
END;
$$;

REVOKE ALL ON FUNCTION public.disable_auto_buy_admin(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.disable_auto_buy_admin(UUID, UUID) TO service_role;
