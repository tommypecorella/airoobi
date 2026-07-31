-- MODALITA' PROPOSTA v1 (31 lug 2026, GO Skeezu) — fondazione additiva, dormiente (nessun frontend ancora).
-- Applicata live via MCP (migration: proposta_mode_foundation_v1). Test end-to-end in DO block auto-annullato:
--   proposte 80 e 40 su riserva 50 -> 80=won, 40=rejected_below_reserve, commissione 8%=6.40, settlement DEFERRED. OK.
--
-- MODELLO ECONOMICO (deciso Skeezu 31 lug):
--   - Compratore propone GRATIS, cieco a colpo unico (1 proposta per compratore).
--   - Venditore paga fee = % del primo prezzo (seller_desired_price) all'apertura -> 100% AIROOBI (platform_aria_ledger).
--   - Commissione = % sul prezzo vincente -> AIROOBI (calcolata a resolve; SETTLEMENT del pagamento
--     vincitore NON incluso: deciso a parte — alpha ARIA vs mainnet reale).
--   - Alpha Brave: 1 ROBI ai compratori ogni 10 proposte valide (config, 0 = off a Stage 1).
-- Reuse colonne esistenti: seller_desired_price = primo prezzo (pubblico), seller_min_price = riserva (segreta).

ALTER TABLE public.airdrops ADD COLUMN IF NOT EXISTS sale_mode text NOT NULL DEFAULT 'airdrop';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='airdrops_sale_mode_chk') THEN
    ALTER TABLE public.airdrops ADD CONSTRAINT airdrops_sale_mode_chk CHECK (sale_mode IN ('airdrop','proposta'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id uuid NOT NULL REFERENCES public.airdrops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount_eur numeric NOT NULL CHECK (amount_eur > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','won','lost','rejected_below_reserve','withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (airdrop_id, user_id)
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='proposals' AND policyname='proposals_select_own') THEN
    CREATE POLICY proposals_select_own ON public.proposals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='proposals' AND policyname='proposals_select_admin') THEN
    CREATE POLICY proposals_select_admin ON public.proposals FOR SELECT USING (public.is_admin());
  END IF;
END $$;
REVOKE INSERT, UPDATE, DELETE ON public.proposals FROM anon, authenticated;

INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('proposta_listing_fee_pct','5','Modalita Proposta: fee venditore all apertura, % del primo prezzo, verso AIROOBI'),
  ('proposta_sale_commission_pct','8','Modalita Proposta: commissione AIROOBI sul prezzo vincente %'),
  ('proposta_alpha_robi_per_10','1','Modalita Proposta: ROBI ai compratori ogni 10 proposte valide (0 = off, spegnere a Stage 1)')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.open_proposta_sale(p_airdrop_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_uid uuid := auth.uid(); v_a RECORD; v_pct numeric; v_fee int; v_bal int;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','NOT_AUTHENTICATED'); END IF;
  SELECT * INTO v_a FROM airdrops WHERE id=p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_FOUND'); END IF;
  IF v_a.submitted_by IS DISTINCT FROM v_uid THEN RETURN jsonb_build_object('ok',false,'error','NOT_SELLER'); END IF;
  IF v_a.sale_mode <> 'proposta' THEN RETURN jsonb_build_object('ok',false,'error','NOT_PROPOSTA'); END IF;
  IF v_a.status = 'sale' THEN RETURN jsonb_build_object('ok',false,'error','ALREADY_OPEN'); END IF;
  IF v_a.status NOT IN ('draft','in_valutazione','valutazione_completata','approvato') THEN
     RETURN jsonb_build_object('ok',false,'error','BAD_STATUS','status',v_a.status); END IF;
  IF v_a.seller_desired_price IS NULL OR v_a.seller_min_price IS NULL THEN
     RETURN jsonb_build_object('ok',false,'error','PRICES_NOT_SET'); END IF;
  IF v_a.seller_min_price > v_a.seller_desired_price THEN
     RETURN jsonb_build_object('ok',false,'error','RESERVE_ABOVE_ASK'); END IF;
  SELECT COALESCE(value::numeric,5) INTO v_pct FROM airdrop_config WHERE key='proposta_listing_fee_pct';
  v_fee := CEIL(v_a.seller_desired_price * COALESCE(v_pct,5) / 100.0 * 10)::int;
  SELECT total_points INTO v_bal FROM profiles WHERE id=v_uid;
  IF v_bal IS NULL THEN RETURN jsonb_build_object('ok',false,'error','PROFILE_NOT_FOUND'); END IF;
  IF v_bal < v_fee THEN RETURN jsonb_build_object('ok',false,'error','INSUFFICIENT_ARIA','balance',v_bal,'fee',v_fee); END IF;
  UPDATE profiles SET total_points = total_points - v_fee WHERE id=v_uid;
  INSERT INTO points_ledger(user_id,amount,reason,metadata)
    VALUES (v_uid,-v_fee,'proposta_listing_fee',jsonb_build_object('airdrop_id',p_airdrop_id,'pct',v_pct));
  INSERT INTO platform_aria_ledger(amount,reason,related_airdrop_id,related_user_id,metadata)
    VALUES (v_fee,'proposta_listing_fee',p_airdrop_id,v_uid,jsonb_build_object('pct',v_pct));
  UPDATE airdrops SET status='sale', updated_at=now() WHERE id=p_airdrop_id;
  RETURN jsonb_build_object('ok',true,'listing_fee_aria',v_fee,'status','sale');
END;$fn$;
REVOKE ALL ON FUNCTION public.open_proposta_sale(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.open_proposta_sale(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_proposal(p_airdrop_id uuid, p_amount_eur numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_uid uuid := auth.uid(); v_a RECORD; v_cnt int; v_per10 int;
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
  INSERT INTO proposals(airdrop_id,user_id,amount_eur,status) VALUES (p_airdrop_id,v_uid,p_amount_eur,'pending');
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
  RETURN jsonb_build_object('ok',true,'status','pending');
END;$fn$;
REVOKE ALL ON FUNCTION public.submit_proposal(uuid,numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_proposal(uuid,numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_resolve_proposta(p_airdrop_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_a RECORD; v_win RECORD; v_comm_pct numeric; v_comm_eur numeric;
BEGIN
  IF NOT public.is_admin() THEN RETURN jsonb_build_object('ok',false,'error','NOT_ADMIN'); END IF;
  SELECT * INTO v_a FROM airdrops WHERE id=p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_FOUND'); END IF;
  IF v_a.sale_mode <> 'proposta' THEN RETURN jsonb_build_object('ok',false,'error','NOT_PROPOSTA'); END IF;
  UPDATE proposals SET status='rejected_below_reserve'
    WHERE airdrop_id=p_airdrop_id AND status='pending' AND amount_eur < v_a.seller_min_price;
  SELECT * INTO v_win FROM proposals
    WHERE airdrop_id=p_airdrop_id AND status='pending' AND amount_eur >= v_a.seller_min_price
    ORDER BY amount_eur DESC, created_at ASC LIMIT 1;
  IF NOT FOUND THEN
    UPDATE airdrops SET status='annullato', updated_at=now() WHERE id=p_airdrop_id;
    RETURN jsonb_build_object('ok',true,'outcome','no_valid_proposals');
  END IF;
  UPDATE proposals SET status='won' WHERE id=v_win.id;
  UPDATE proposals SET status='lost' WHERE airdrop_id=p_airdrop_id AND status='pending' AND id<>v_win.id;
  SELECT COALESCE(value::numeric,8) INTO v_comm_pct FROM airdrop_config WHERE key='proposta_sale_commission_pct';
  v_comm_eur := ROUND(v_win.amount_eur * COALESCE(v_comm_pct,8) / 100.0, 2);
  UPDATE airdrops SET status='waiting_seller_acknowledge', winner_id=v_win.user_id, updated_at=now() WHERE id=p_airdrop_id;
  INSERT INTO notifications(user_id,type,title,body,airdrop_id)
    VALUES (v_win.user_id,'proposta_won','Proposta accettata','La tua proposta su "'||v_a.title||'" e'' stata accettata. A breve i dettagli per completare.',p_airdrop_id);
  IF v_a.submitted_by IS NOT NULL THEN
    INSERT INTO notifications(user_id,type,title,body,airdrop_id)
      VALUES (v_a.submitted_by,'proposta_resolved','Proposta assegnata','La vendita a proposta di "'||v_a.title||'" e'' stata assegnata.',p_airdrop_id);
  END IF;
  RETURN jsonb_build_object('ok',true,'winner',v_win.user_id,'amount_eur',v_win.amount_eur,
    'commission_pct',v_comm_pct,'commission_eur',v_comm_eur,'settlement','DEFERRED');
END;$fn$;
REVOKE ALL ON FUNCTION public.admin_resolve_proposta(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_resolve_proposta(uuid) TO authenticated;
