-- ════════════════════════════════════════════════════════════════════
-- GS-16 · IL RULLO ROBI · Chunk 1 · Schema + treasury tracking
-- 24 May 2026 · cluster GS-16 (consegna singola)
-- ════════════════════════════════════════════════════════════════════
-- ROBY_MiniSpec_GS16_Rullo_2026-05-24 · meccanismo (b): alcuni blocchi
-- del pool nascondono 1 ROBI; mining → +1 ROBI istantaneo wallet,
-- closure-independent. Skeezu firma formula B (2% deterministico) con
-- GUARDIA HARD anti-inflazione ROBI come condizione (parole Skeezu:
-- "attenzione all'inflazione dei ROBI").
--
-- Chunk 1 deliverables:
--   1. CREATE TABLE airdrop_block_seeds (audit-friendly, RLS no-spoiler)
--   2. ALTER treasury_stats: colonne contabilizzazione emissione tracciata
--   3. INSERT airdrop_config: 4 nuovi key (formula B + guardrail)
--   4. CREATE VIEW v_treasury_robi_supply (misura inflazione real-time)
--   5. RPC get_airdrop_rullo_count (FE Chunk 4 aggancio)
--   6. Mini integration test
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- 1 · airdrop_block_seeds (audit-friendly seeding del rullo)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.airdrop_block_seeds (
  airdrop_id   UUID NOT NULL REFERENCES public.airdrops(id) ON DELETE CASCADE,
  block_number INTEGER NOT NULL CHECK (block_number > 0),
  robi_amount  INTEGER NOT NULL DEFAULT 1 CHECK (robi_amount > 0),
  found_at     TIMESTAMPTZ NULL,
  found_by     UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (airdrop_id, block_number)
);

COMMENT ON TABLE public.airdrop_block_seeds IS
  'GS-16 · IL RULLO ROBI · blocchi che nascondono 1 ROBI nascosto. Seminati a creazione airdrop (trigger Chunk 2 formula B). Trovati al mining (Chunk 3 buy_blocks). Posizioni nascoste all''utente fino al found_at (RLS no-spoiler). Audit-friendly: deterministico post-creation, riproducibile per dispute.';

COMMENT ON COLUMN public.airdrop_block_seeds.found_at IS 'NULL = blocco nascosto (non ancora minato). NOT NULL = ROBI trovato, accreditato istantaneo a found_by.';

CREATE INDEX IF NOT EXISTS idx_airdrop_block_seeds_unfound
  ON public.airdrop_block_seeds(airdrop_id, block_number)
  WHERE found_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_airdrop_block_seeds_found_by
  ON public.airdrop_block_seeds(found_by)
  WHERE found_by IS NOT NULL;

-- RLS: no-spoiler — utenti vedono solo i blocchi GIÀ TROVATI (per audit/storico).
-- Le posizioni dei blocchi non-ancora-trovati restano nascoste (solo SECURITY DEFINER RPC le vede).
ALTER TABLE public.airdrop_block_seeds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seeds_select_found_only" ON public.airdrop_block_seeds;
CREATE POLICY "seeds_select_found_only" ON public.airdrop_block_seeds
  FOR SELECT TO authenticated
  USING (found_at IS NOT NULL);

-- GRANT esplicito (feedback_supabase_grant_on_create_table)
GRANT SELECT ON public.airdrop_block_seeds TO authenticated;

-- ─────────────────────────────────────────────────────────────────
-- 2 · treasury_stats · contabilizzazione emissione rullo
-- ─────────────────────────────────────────────────────────────────
-- Guardrail anti-inflazione LAYER 2: ROBI seminati nel rullo NON sono coniati
-- a vuoto — sono contabilizzati come emissione tracciata. Permette di misurare
-- l'inflazione ROBI da rullo in tempo reale (vista v_treasury_robi_supply).
ALTER TABLE public.treasury_stats
  ADD COLUMN IF NOT EXISTS robi_rullo_seeded   NUMERIC(12,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS robi_rullo_redeemed NUMERIC(12,4) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.treasury_stats.robi_rullo_seeded   IS 'GS-16 · ROBI totali seminati nel rullo (potenziali). Outstanding = seeded - redeemed.';
COMMENT ON COLUMN public.treasury_stats.robi_rullo_redeemed IS 'GS-16 · ROBI del rullo effettivamente trovati al mining (accreditati a wallet).';

-- ─────────────────────────────────────────────────────────────────
-- 3 · airdrop_config · 4 nuovi key (formula B + guardrail)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('robi_seeding_pct',
   '0.02',
   'GS-16 formula B · percentuale del pool blocchi che nasconde 1 ROBI. Default 0.02 (2%). N_robi = floor(total_blocks * pct).'),
  ('robi_seeding_max_per_airdrop',
   '50',
   'GS-16 guardrail anti-inflazione LAYER 1 · cap hard ROBI seminati per singolo airdrop. Default 50. Clip dopo formula B.'),
  ('robi_seeding_max_per_block',
   '1',
   'GS-16 · max ROBI per blocco. Default 1 (Alpha). In futuro: incremento per blocchi rari (es. blocco 1 = 5 ROBI).'),
  ('robi_seeding_daily_cap_total',
   '0',
   'GS-16 guardrail anti-inflazione LAYER 3 · quota giornaliera totale ROBI seminati (cross-airdrop). Default 0 = OFF (no daily cap). Skeezu-attivabile se Beta/Pre-Prod mostrano segni inflazione anomala.')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- 4 · VIEW v_treasury_robi_supply (misura inflazione ROBI real-time)
-- ─────────────────────────────────────────────────────────────────
-- Guardrail anti-inflazione · vista esposta a admin per monitorare:
--   - ROBI totali circolanti (nft_circulating)
--   - ROBI seminati nel rullo (potenziali) e redeemed (effettivi)
--   - ROBI outstanding nel rullo (in attesa di mining)
--   - % rullo / circulating (peso inflazione rullo)
DROP VIEW IF EXISTS public.v_treasury_robi_supply;
CREATE VIEW public.v_treasury_robi_supply AS
SELECT
  ts.id,
  ts.created_at,
  ts.nft_circulating       AS robi_circulating,
  ts.nft_minted            AS robi_minted,
  ts.robi_rullo_seeded,
  ts.robi_rullo_redeemed,
  (ts.robi_rullo_seeded - ts.robi_rullo_redeemed) AS robi_rullo_outstanding,
  CASE
    WHEN ts.nft_circulating > 0
    THEN ROUND((ts.robi_rullo_redeemed / ts.nft_circulating) * 100, 2)
    ELSE 0
  END AS robi_rullo_pct_of_circulating,
  ts.balance_eur,
  CASE
    WHEN ts.nft_circulating > 0
    THEN ROUND(ts.balance_eur / ts.nft_circulating, 4)
    ELSE 0
  END AS eur_per_robi_implied
FROM public.treasury_stats ts
ORDER BY ts.created_at DESC
LIMIT 1;

COMMENT ON VIEW public.v_treasury_robi_supply IS 'GS-16 · vista admin · misura inflazione ROBI real-time. Mostra ROBI circulating + breakdown rullo (seeded/redeemed/outstanding) + peso % rullo su circulating + eur_per_robi implicito.';

-- Solo admin/service_role può leggere la vista (admin-only metric)
GRANT SELECT ON public.v_treasury_robi_supply TO service_role;
-- NOTA: authenticated NON ha accesso · è una vista interna admin

-- ─────────────────────────────────────────────────────────────────
-- 5 · RPC get_airdrop_rullo_count (FE Chunk 4 aggancio "scopri ROBI")
-- ─────────────────────────────────────────────────────────────────
-- Espone a tutti gli utenti il count ROBI seminati per airdrop (no spoiler
-- delle posizioni). Usato dall'aggancio "Alcuni blocchi nascondono un ROBI..."
CREATE OR REPLACE FUNCTION public.get_airdrop_rullo_count(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_redeemed INTEGER;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE found_at IS NULL OR found_at IS NOT NULL),
    COUNT(*) FILTER (WHERE found_at IS NOT NULL)
  INTO v_total, v_redeemed
  FROM public.airdrop_block_seeds
  WHERE airdrop_id = p_airdrop_id;

  RETURN jsonb_build_object(
    'airdrop_id', p_airdrop_id,
    'total', COALESCE(v_total, 0),
    'redeemed', COALESCE(v_redeemed, 0),
    'outstanding', COALESCE(v_total - v_redeemed, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_airdrop_rullo_count(UUID) TO authenticated, anon;

COMMENT ON FUNCTION public.get_airdrop_rullo_count(UUID) IS 'GS-16 · count ROBI seminati nel rullo per airdrop (no spoiler posizioni). Usato dall''aggancio FE "scopri ROBI nel rullo". Esposto a tutti (anon + authenticated).';

-- ─────────────────────────────────────────────────────────────────
-- Mini integration test (feedback_pr_integration_test)
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_seeded_default NUMERIC;
  v_redeemed_default NUMERIC;
  v_pct_config TEXT;
  v_cap_config TEXT;
  v_count_test JSONB;
BEGIN
  -- Verify treasury_stats has new columns with default 0
  SELECT robi_rullo_seeded, robi_rullo_redeemed
  INTO v_seeded_default, v_redeemed_default
  FROM public.treasury_stats
  ORDER BY created_at DESC LIMIT 1;

  IF v_seeded_default IS NULL OR v_redeemed_default IS NULL THEN
    RAISE EXCEPTION 'GS-16 Chunk 1 test FAIL · treasury_stats new columns NULL (default 0 expected)';
  END IF;

  -- Verify airdrop_config keys present
  SELECT value INTO v_pct_config FROM public.airdrop_config WHERE key = 'robi_seeding_pct';
  IF v_pct_config IS NULL OR v_pct_config <> '0.02' THEN
    RAISE EXCEPTION 'GS-16 Chunk 1 test FAIL · robi_seeding_pct missing or != 0.02 (got: %)', v_pct_config;
  END IF;

  SELECT value INTO v_cap_config FROM public.airdrop_config WHERE key = 'robi_seeding_max_per_airdrop';
  IF v_cap_config IS NULL OR v_cap_config <> '50' THEN
    RAISE EXCEPTION 'GS-16 Chunk 1 test FAIL · robi_seeding_max_per_airdrop missing or != 50 (got: %)', v_cap_config;
  END IF;

  -- Verify RPC works (returns zeros for non-existent airdrop)
  SELECT public.get_airdrop_rullo_count('00000000-0000-0000-0000-000000000000'::UUID) INTO v_count_test;
  IF (v_count_test->>'total')::INTEGER <> 0 THEN
    RAISE EXCEPTION 'GS-16 Chunk 1 test FAIL · get_airdrop_rullo_count returns non-zero for non-existent (got: %)', v_count_test;
  END IF;

  -- Verify view exists and is queryable
  PERFORM * FROM public.v_treasury_robi_supply LIMIT 1;

  RAISE NOTICE 'GS-16 Chunk 1 (schema) integration test OK · airdrop_block_seeds + treasury cols + 4 config + RPC + view';
END $$;
