-- W4 Day 9 · Atto 6 story visibility seller toggle
-- Allows seller to opt-out winner story public visibility per airdrop completato
-- Only callable by seller (submitted_by or created_by) on completed airdrops

CREATE OR REPLACE FUNCTION public.update_airdrop_story_visibility(
  p_airdrop_id uuid,
  p_visible boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submitted_by uuid;
  v_created_by uuid;
  v_status text;
BEGIN
  SELECT submitted_by, created_by, status
    INTO v_submitted_by, v_created_by, v_status
  FROM public.airdrops
  WHERE id = p_airdrop_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Airdrop not found' USING ERRCODE = 'P0001';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() NOT IN (COALESCE(v_submitted_by, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(v_created_by, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
    RAISE EXCEPTION 'Only seller can toggle story visibility' USING ERRCODE = 'P0001';
  END IF;

  IF v_status NOT IN ('completed','annullato') THEN
    RAISE EXCEPTION 'Story toggle only available for completed/annullato airdrops' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.airdrops
    SET story_public_visible = p_visible
  WHERE id = p_airdrop_id;

  RETURN jsonb_build_object(
    'ok', true,
    'airdrop_id', p_airdrop_id,
    'story_public_visible', p_visible
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_airdrop_story_visibility(uuid, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.update_airdrop_story_visibility(uuid, boolean) FROM anon;
