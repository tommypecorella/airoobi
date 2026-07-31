-- Regola Skeezu 31 lug: PER CREARE UN AIRDROP DEVI ESSERE IL BRAND MANAGER (non un membro qualsiasi).
-- Applicata live via MCP. Gate B2C: brand_manager approvato + azienda verificata.
-- Test rollback: can_airdrop_for_company -> Brand Manager true, membro approvato (non-BM) false.
CREATE OR REPLACE FUNCTION public.can_airdrop_for_company(p_company_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
  SELECT EXISTS (
      SELECT 1 FROM company_members
      WHERE company_id=p_company_id AND user_id=auth.uid()
        AND role='brand_manager' AND status='approved')
     AND EXISTS (SELECT 1 FROM companies WHERE id=p_company_id AND verified=true AND status='active');
$$;
GRANT EXECUTE ON FUNCTION public.can_airdrop_for_company(uuid) TO authenticated;
