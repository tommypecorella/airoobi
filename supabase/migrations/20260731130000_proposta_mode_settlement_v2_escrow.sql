-- PROPOSTA v2 (31 lug 2026, GO Skeezu) — SETTLEMENT in ARIA "come mainnet". Applicata live via MCP
-- (migration proposta_mode_settlement_v2_escrow). Test escrow end-to-end (DO block auto-annullato):
--   vincitore 30E -> paga 300 ARIA; perdente 20E e sotto-riserva 10E -> rimborsati (delta 0);
--   venditore +276 ARIA (300 - 24 commissione 8%). OK.
--
-- Modello: il compratore mette l'importo dell'offerta in ESCROW quando propone (INSUFFICIENT_ARIA
-- se non copre). Rimborsato se perde / sotto-riserva / si ritira (withdraw_proposal). Alla
-- risoluzione: escrow del vincitore consumato -> commissione % ad AIROOBI (platform_aria_ledger),
-- resto al venditore (profiles + points_ledger). 1 EUR = 10 ARIA.
--
-- OPERAZIONI DATI collegate (applicate live via SQL, NON in questa migration):
--   * welcome_grant_aria_full/reduced 100 -> 1000 (allineato alla landing).
--   * regalo test +5000 ARIA a tutti gli utenti (points_ledger 'alpha_test_gift' + notifica).
--     "No scarcity in Alpha; azzerati a mainnet, con eventuale regalo % a chi ha speso di piu'."

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS escrow_aria integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.submit_proposal(p_airdrop_id uuid, p_amount_eur numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_uid uuid := auth.uid(); v_a RECORD; v_cnt int; v_per10 int; v_escrow int; v_bal int;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','NOT_AUTHENTICATED'); END IF;
  IF p_amount_eur IS NULL OR p_amount_eur <= 0 THEN RETURN jsonb_build_object('ok',false,'error','BAD_AMOUNT'); END IF;
  SELECT * INTO v_a FROM airdrops WHERE id=p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_FOUND'); END IF;
  IF v_a.sale_mode <> 'proposta' THEN RETURN jsonb_build_object('ok',false,'error','NOT_PROPOSTA'); END IF;
  IF v_a.status <> 'sale' THEN RETURN jsonb_build_object('ok',false,'error','NOT_OPEN','status',v_a.status); END IF;
  IF v_a.submitted_by = v_uid THEN RETURN jsonb_build_object('ok',false,'error','SELLER_CANNOT_PROPOSE'); END IF;
  IF EXISTS (SELECT 1 FROM proposals WHERE airdrop_id=p_airdrop_id AND user_id=v_uid) THEN
     RETURN jsonb_build_object('ok',false,'error','ALREADY_PROPOSED'); END IF;
  v_escrow := CEIL(p_amount_eur * 10)::int;
  SELECT total_points INTO v_bal FROM profiles WHERE id=v_uid;
  IF v_bal IS NULL THEN RETURN jsonb_build_object('ok',false,'error','PROFILE_NOT_FOUND'); END IF;
  IF v_bal < v_escrow THEN RETURN jsonb_build_object('ok',false,'error','INSUFFICIENT_ARIA','balance',v_bal,'need',v_escrow); END IF;
  UPDATE profiles SET total_points = total_points - v_escrow WHERE id=v_uid;
  INSERT INTO points_ledger(user_id,amount,reason,metadata) VALUES (v_uid,-v_escrow,'proposta_escrow',jsonb_build_object('airdrop_id',p_airdrop_id));
  INSERT INTO proposals(airdrop_id,user_id,amount_eur,status,escrow_aria) VALUES (p_airdrop_id,v_uid,p_amount_eur,'pending',v_escrow);
  SELECT COALESCE(value::int,0) INTO v_per10 FROM airdrop_config WHERE key='proposta_alpha_robi_per_10';
  IF v_per10 > 0 THEN
    SELECT COUNT(*) INTO v_cnt FROM proposals WHERE airdrop_id=p_airdrop_id AND status='pending';
    IF v_cnt % 10 = 0 THEN
      INSERT INTO nft_rewards(user_id,nft_type,name,source,airdrop_id,shares,metadata)
        VALUES (v_uid,'ROBI','Grazie per la proposta','proposta_alpha_milestone',p_airdrop_id,v_per10,jsonb_build_object('milestone',v_cnt));
      UPDATE treasury_stats SET nft_minted=nft_minted+v_per10, nft_circulating=nft_circulating+v_per10
        WHERE id=(SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);
      INSERT INTO notifications(user_id,type,title,body,airdrop_id)
        VALUES (v_uid,'proposta_robi','Ricompensa proposta','Hai ricevuto '||v_per10||' ROBI: la tua proposta ha toccato quota '||v_cnt||'.',p_airdrop_id);
    END IF;
  END IF;
  IF v_a.submitted_by IS NOT NULL THEN
    INSERT INTO notifications(user_id,type,title,body,airdrop_id)
      VALUES (v_a.submitted_by,'proposta_new','Nuova proposta','Hai ricevuto una nuova proposta su "'||v_a.title||'".',p_airdrop_id);
  END IF;
  RETURN jsonb_build_object('ok',true,'status','pending','escrow_aria',v_escrow);
END;$fn$;
REVOKE ALL ON FUNCTION public.submit_proposal(uuid,numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_proposal(uuid,numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.withdraw_proposal(p_airdrop_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_uid uuid := auth.uid(); v_a RECORD; v_p RECORD;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','NOT_AUTHENTICATED'); END IF;
  SELECT * INTO v_a FROM airdrops WHERE id=p_airdrop_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_FOUND'); END IF;
  SELECT * INTO v_p FROM proposals WHERE airdrop_id=p_airdrop_id AND user_id=v_uid FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NO_PROPOSAL'); END IF;
  IF v_p.status <> 'pending' THEN RETURN jsonb_build_object('ok',false,'error','NOT_PENDING'); END IF;
  IF v_a.status <> 'sale' THEN RETURN jsonb_build_object('ok',false,'error','SALE_CLOSED'); END IF;
  UPDATE profiles SET total_points = total_points + v_p.escrow_aria WHERE id=v_uid;
  INSERT INTO points_ledger(user_id,amount,reason,metadata) VALUES (v_uid,v_p.escrow_aria,'proposta_withdraw_refund',jsonb_build_object('airdrop_id',p_airdrop_id));
  UPDATE proposals SET status='withdrawn' WHERE id=v_p.id;
  RETURN jsonb_build_object('ok',true,'refunded_aria',v_p.escrow_aria);
END;$fn$;
REVOKE ALL ON FUNCTION public.withdraw_proposal(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.withdraw_proposal(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_resolve_proposta(p_airdrop_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_a RECORD; v_win RECORD; v_comm_pct numeric; v_comm_aria int; v_seller_net int; r RECORD;
BEGIN
  IF NOT public.is_admin() THEN RETURN jsonb_build_object('ok',false,'error','NOT_ADMIN'); END IF;
  SELECT * INTO v_a FROM airdrops WHERE id=p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_FOUND'); END IF;
  IF v_a.sale_mode <> 'proposta' THEN RETURN jsonb_build_object('ok',false,'error','NOT_PROPOSTA'); END IF;
  FOR r IN SELECT * FROM proposals WHERE airdrop_id=p_airdrop_id AND status='pending' AND amount_eur < v_a.seller_min_price LOOP
    UPDATE profiles SET total_points = total_points + r.escrow_aria WHERE id=r.user_id;
    INSERT INTO points_ledger(user_id,amount,reason,metadata) VALUES (r.user_id,r.escrow_aria,'proposta_refund_below_reserve',jsonb_build_object('airdrop_id',p_airdrop_id));
    UPDATE proposals SET status='rejected_below_reserve' WHERE id=r.id;
  END LOOP;
  SELECT * INTO v_win FROM proposals WHERE airdrop_id=p_airdrop_id AND status='pending' AND amount_eur >= v_a.seller_min_price
    ORDER BY amount_eur DESC, created_at ASC LIMIT 1;
  IF NOT FOUND THEN
    UPDATE airdrops SET status='annullato', updated_at=now() WHERE id=p_airdrop_id;
    RETURN jsonb_build_object('ok',true,'outcome','no_valid_proposals');
  END IF;
  FOR r IN SELECT * FROM proposals WHERE airdrop_id=p_airdrop_id AND status='pending' AND id<>v_win.id LOOP
    UPDATE profiles SET total_points = total_points + r.escrow_aria WHERE id=r.user_id;
    INSERT INTO points_ledger(user_id,amount,reason,metadata) VALUES (r.user_id,r.escrow_aria,'proposta_refund_lost',jsonb_build_object('airdrop_id',p_airdrop_id));
    UPDATE proposals SET status='lost' WHERE id=r.id;
  END LOOP;
  SELECT COALESCE(value::numeric,8) INTO v_comm_pct FROM airdrop_config WHERE key='proposta_sale_commission_pct';
  v_comm_aria := LEAST(CEIL(v_win.amount_eur * COALESCE(v_comm_pct,8) / 100.0 * 10)::int, v_win.escrow_aria);
  v_seller_net := v_win.escrow_aria - v_comm_aria;
  UPDATE proposals SET status='won' WHERE id=v_win.id;
  INSERT INTO platform_aria_ledger(amount,reason,related_airdrop_id,related_user_id,metadata)
    VALUES (v_comm_aria,'proposta_commission',p_airdrop_id,v_win.user_id,jsonb_build_object('pct',v_comm_pct,'winning_eur',v_win.amount_eur));
  IF v_a.submitted_by IS NOT NULL THEN
    UPDATE profiles SET total_points = total_points + v_seller_net WHERE id=v_a.submitted_by;
    INSERT INTO points_ledger(user_id,amount,reason,metadata) VALUES (v_a.submitted_by,v_seller_net,'proposta_sale_proceeds',jsonb_build_object('airdrop_id',p_airdrop_id,'gross',v_win.escrow_aria,'commission',v_comm_aria));
    INSERT INTO notifications(user_id,type,title,body,airdrop_id)
      VALUES (v_a.submitted_by,'proposta_resolved','Oggetto venduto','La tua vendita a proposta di "'||v_a.title||'" e'' stata assegnata. Hai ricevuto '||v_seller_net||' ARIA.',p_airdrop_id);
  END IF;
  UPDATE airdrops SET status='waiting_seller_acknowledge', winner_id=v_win.user_id, updated_at=now() WHERE id=p_airdrop_id;
  INSERT INTO notifications(user_id,type,title,body,airdrop_id)
    VALUES (v_win.user_id,'proposta_won','Proposta accettata!','La tua proposta su "'||v_a.title||'" e'' stata accettata: '||v_win.amount_eur||' EUR. A breve i dettagli per riceverlo.',p_airdrop_id);
  RETURN jsonb_build_object('ok',true,'winner',v_win.user_id,'amount_eur',v_win.amount_eur,
    'winner_paid_aria',v_win.escrow_aria,'commission_pct',v_comm_pct,'commission_aria',v_comm_aria,'seller_received_aria',v_seller_net);
END;$fn$;
REVOKE ALL ON FUNCTION public.admin_resolve_proposta(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_resolve_proposta(uuid) TO authenticated;
