-- Drop vecchia versione manager_update_airdrop (senza p_presale_blocks_pct)
-- che causa ambiguità di overloading
DROP FUNCTION IF EXISTS public.manager_update_airdrop(UUID, TEXT, INTEGER, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, NUMERIC, BOOLEAN, TEXT);
