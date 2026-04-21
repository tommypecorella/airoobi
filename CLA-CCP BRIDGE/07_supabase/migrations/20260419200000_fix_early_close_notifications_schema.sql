-- ═══════════════════════════════════════════════════════════════
-- FIX — early_close_airdrop notifications schema (19 Apr 2026 pm)
-- ═══════════════════════════════════════════════════════════════
-- Bug: la migration 20260419170100_early_close_lockdown.sql faceva
--   INSERT INTO notifications (user_id, type, airdrop_id, data, created_at)
-- ma:
--   1) la colonna `data` NON esisteva in public.notifications
--   2) il campo `title` è NOT NULL e non veniva passato
-- Risultato: ogni buy che attivava il trigger falliva con HTTP 400
-- "column data of relation notifications does not exist", causando
-- rollback dell'acquisto e impedendo la chiusura automatica.
--
-- Fix:
--   - Aggiunge colonna data JSONB a notifications (risolve anche
--     un bug latente di 20260408184659_cancel_participation.sql che
--     la referenziava senza averla creata)
--   - Riscrive early_close_airdrop con payload coerente (title+body)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB;

CREATE OR REPLACE FUNCTION early_close_airdrop(p_airdrop_id UUID, p_reason TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop RECORD;
  v_title_it TEXT;
  v_body_it TEXT;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF v_airdrop.status NOT IN ('presale', 'sale') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_status', 'status', v_airdrop.status);
  END IF;

  UPDATE airdrops SET
    status = 'pending_seller_decision',
    early_close_reason = p_reason,
    original_total_blocks = total_blocks,
    total_blocks = blocks_sold,
    updated_at = NOW()
  WHERE id = p_airdrop_id;

  IF v_airdrop.submitted_by IS NOT NULL THEN
    IF p_reason = 'value_threshold' THEN
      v_title_it := 'Airdrop chiuso: valore oggetto raggiunto';
      v_body_it := 'Il primo in classifica ha raggiunto in ARIA il valore dell''oggetto. L''airdrop si è chiuso per protezione anti-gambling. Vai su "I miei airdrop" per accettare il payout o annullare.';
    ELSE
      v_title_it := 'Airdrop chiuso: fairness lockdown';
      v_body_it := 'Tutti i non-primi sono matematicamente impossibilitati a superare il leader. L''airdrop si è chiuso anticipatamente. Vai su "I miei airdrop" per accettare il payout o annullare.';
    END IF;

    INSERT INTO notifications (user_id, title, body, type, airdrop_id, data)
    VALUES (
      v_airdrop.submitted_by,
      v_title_it,
      v_body_it,
      'airdrop_pending_seller_decision',
      p_airdrop_id,
      jsonb_build_object(
        'airdrop_title', v_airdrop.title,
        'reason', p_reason,
        'blocks_sold', v_airdrop.blocks_sold,
        'original_total_blocks', v_airdrop.total_blocks
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'status', 'pending_seller_decision',
    'reason', p_reason,
    'blocks_sold', v_airdrop.blocks_sold,
    'blocks_burned', v_airdrop.total_blocks - v_airdrop.blocks_sold
  );
END;
$$;

GRANT EXECUTE ON FUNCTION early_close_airdrop(UUID, TEXT) TO authenticated;
