-- 20 lug 2026 (Skeezu): loghetto EVALOBI consultabile nella pagina airdrop.
-- Lookup pubblico minimale: dato l'airdrop, il token_id del certificato più recente
-- visibile. Il contenuto completo resta servito dalla pagina pubblica /evalobi/:token_id.
CREATE OR REPLACE FUNCTION public.get_evalobi_for_airdrop(p_airdrop_id uuid)
RETURNS TABLE(token_id bigint, cert_code text, evaluation_outcome text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT e.token_id, e.cert_code, e.evaluation_outcome
  FROM evalobi e
  WHERE e.airdrop_id = p_airdrop_id
    AND COALESCE(e.public_visible, true)
  ORDER BY e.version DESC NULLS LAST, e.created_at DESC
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_evalobi_for_airdrop(uuid) TO anon, authenticated;
