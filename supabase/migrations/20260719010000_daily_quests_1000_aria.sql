-- SPECCHIO (applicata al live 19 lug 2026 via MCP in due passi:
-- 'daily_quests_1000_aria' + 'fix_daily_quests_checked_at'). Stato FINALE.
--
-- COSA FARE OGGI (Skeezu): 3 imprese giornaliere in dashboard —
-- 1) timbra l'ingresso (checkins.checked_at oggi)
-- 2) fai valutare un oggetto (airdrops.submitted_by o evaluation_requests.seller_id oggi)
-- 3) fai 5 Step (somma airdrop_participations.blocks_count di oggi, non annullate)
-- Giornata completa → +1000 ARIA una sola volta (daily_quest_claims PK user+day),
-- ledger 'daily_quests' + total_points + notifica campanella; voce nel notification_catalog.

CREATE TABLE IF NOT EXISTS public.daily_quest_claims (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  granted_aria int NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);
ALTER TABLE public.daily_quest_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dqc_self ON public.daily_quest_claims;
CREATE POLICY dqc_self ON public.daily_quest_claims FOR SELECT TO authenticated USING (user_id=auth.uid() OR is_admin());

CREATE OR REPLACE FUNCTION public.get_my_daily_quests()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $f$
DECLARE
  v_uid uuid := auth.uid();
  v_checkin boolean; v_valuation boolean; v_steps int; v_completed boolean; v_granted boolean;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_authenticated'); END IF;

  SELECT EXISTS(SELECT 1 FROM checkins WHERE user_id=v_uid AND checked_at::date=CURRENT_DATE) INTO v_checkin;
  SELECT EXISTS(
    SELECT 1 FROM airdrops WHERE submitted_by=v_uid AND created_at::date=CURRENT_DATE
    UNION ALL
    SELECT 1 FROM evaluation_requests WHERE seller_id=v_uid AND created_at::date=CURRENT_DATE
  ) INTO v_valuation;
  SELECT COALESCE(SUM(blocks_count),0) FROM airdrop_participations
    WHERE user_id=v_uid AND created_at::date=CURRENT_DATE AND cancelled_at IS NULL INTO v_steps;

  v_completed := v_checkin AND v_valuation AND v_steps>=5;
  SELECT EXISTS(SELECT 1 FROM daily_quest_claims WHERE user_id=v_uid AND day=CURRENT_DATE) INTO v_granted;

  IF v_completed AND NOT v_granted THEN
    BEGIN
      INSERT INTO daily_quest_claims(user_id, day) VALUES (v_uid, CURRENT_DATE);
      INSERT INTO points_ledger(user_id, amount, reason, metadata)
      VALUES (v_uid, 1000, 'daily_quests',
              jsonb_build_object('day', CURRENT_DATE, 'note','Giornata completa: ingresso + valutazione + 5 Step'));
      UPDATE profiles SET total_points = COALESCE(total_points,0) + 1000 WHERE id=v_uid;
      INSERT INTO notifications(user_id, title, body, type)
      VALUES (v_uid, 'Giornata completa!',
              unistr('\D83C\DF38')||' +1000 ARIA — ingresso timbrato, valutazione chiesta e 5 Step percorsi. Che passo!',
              'daily_quests');
      v_granted := true;
    EXCEPTION WHEN unique_violation THEN
      v_granted := true;
    END;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'checkin', v_checkin,
    'valuation', v_valuation,
    'steps_done', v_steps,
    'steps_target', 5,
    'steps', v_steps>=5,
    'completed', v_completed,
    'granted', v_granted
  );
END; $f$;
GRANT EXECUTE ON FUNCTION public.get_my_daily_quests() TO authenticated;

INSERT INTO public.notification_catalog (key, event_label, audience, channel, sample_text, link, emitter, is_system, audience_admin, sort)
VALUES ('daily_quests','Giornata completa — +1000 ARIA','Chi completa le 3 imprese del giorno','campanella','«🌸 +1000 ARIA — ingresso timbrato, valutazione chiesta e 5 Step percorsi.»','/dashboard','RPC get_my_daily_quests',true,false,105)
ON CONFLICT (key) DO NOTHING;
