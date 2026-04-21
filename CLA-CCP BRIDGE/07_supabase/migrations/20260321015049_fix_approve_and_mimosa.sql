-- ══════════════════════════════════════════════════════════
--  FIX: manager_update_airdrop — aggiunto p_object_value_eur
--  + Approvazione airdrop "Mimosa"
-- ══════════════════════════════════════════════════════════

-- Ricrea la funzione con il parametro mancante
CREATE OR REPLACE FUNCTION manager_update_airdrop(
  p_airdrop_id UUID,
  p_status TEXT,
  p_block_price_aria INTEGER DEFAULT NULL,
  p_total_blocks INTEGER DEFAULT NULL,
  p_presale_block_price INTEGER DEFAULT NULL,
  p_deadline TIMESTAMPTZ DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_object_value_eur NUMERIC DEFAULT NULL,
  p_auto_draw BOOLEAN DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop RECORD;
  v_has_perm BOOLEAN;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;

  -- Admin o evaluator con categoria compatibile
  SELECT EXISTS(
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'evaluator' AND (category IS NULL OR category = v_airdrop.category))
      )
  ) INTO v_has_perm;

  IF NOT v_has_perm THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_PERMISSION');
  END IF;

  IF p_status NOT IN ('in_valutazione', 'presale', 'sale', 'rifiutato_min500', 'rifiutato_generico', 'dropped', 'closed', 'annullato') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  END IF;

  UPDATE airdrops SET
    status = p_status,
    block_price_aria = COALESCE(p_block_price_aria, block_price_aria),
    total_blocks = COALESCE(p_total_blocks, total_blocks),
    presale_block_price = p_presale_block_price,
    deadline = p_deadline,
    rejection_reason = p_rejection_reason,
    object_value_eur = COALESCE(p_object_value_eur, object_value_eur),
    auto_draw = COALESCE(p_auto_draw, auto_draw),
    updated_at = NOW()
  WHERE id = p_airdrop_id;

  RETURN jsonb_build_object('ok', true, 'status', p_status);
END;
$$;

-- ══════════════════════════════════════════════════════════
--  Approva "Mimosa" — se esiste con status in_valutazione
-- ══════════════════════════════════════════════════════════

-- Approva tutti gli airdrop "Mimosa" in valutazione:
-- Quotazione: €550, Blocchi: 110, Prezzo blocco: 50 ARIA
-- Deadline: 30 giorni da ora, auto_draw attivo
UPDATE airdrops SET
  status = 'presale',
  object_value_eur = 550.00,
  block_price_aria = 50,
  presale_block_price = 40,
  total_blocks = 110,
  deadline = NOW() + INTERVAL '30 days',
  auto_draw = true,
  updated_at = NOW()
WHERE lower(title) LIKE '%mimosa%'
  AND status = 'in_valutazione';
