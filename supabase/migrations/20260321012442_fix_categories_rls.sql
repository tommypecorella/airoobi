-- ══════════════════════════════════════════════════════════
--  FIX: categories RLS policies
--  Il problema: la subquery su user_roles dentro la policy
--  viene bloccata dalla RLS di user_roles stessa.
--  Soluzione: funzione SECURITY DEFINER che bypassa RLS.
-- ══════════════════════════════════════════════════════════

-- Funzione helper SECURITY DEFINER per check admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Drop vecchie policy problematiche
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

-- Ricrea policy usando la funzione SECURITY DEFINER
CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE USING (public.is_admin());
