-- ════════════════════════════════════════════════════════════════════
-- Hole #5 · ROBI secondary market policy — DECISION A
-- TECH-HARDEN-001 · Sprint W1 · 27 Apr 2026
--
-- Decisione founder (Skeezu, 27 Apr 2026):
--   OPTION A · Soulbound in Alpha + Beta, trasferibili da Pre-Prod
--   sotto condizioni (parere legale + stato treasury PEG).
--
-- Razionale (sintesi da ROBY_Decision_Request_ROBI_Policy_2026-04-27.md):
--   1. Compliance/legale — riduce rischio classificazione strumento finanziario.
--   2. Treasury defense — nessun mercato OTC che possa scendere sotto PEG 95%.
--   3. Anti-Sybil rinforzata — no consolidamento ROBI multi-account.
--   4. Reversibile — apertura possibile a Pre-Prod dopo 8-12 mesi di dati.
--
-- Implementazione tecnica:
--   - Config flags in airdrop_config (qui).
--   - RPC get_robi_policy() readonly per FE wallet UI badge "Soulbound".
--   - Smart contract Stage 2 leggerà transfer hook da questi flag
--     (override → blocca transfer se robi_transferable=false).
--   - Wallet UI: badge "Soulbound (Alpha/Beta)" + tooltip esplicativo
--     (Hole #5 §6.4 spec).
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('robi_transferable',               'false',
   'ROBI secondary market policy — decision A: soulbound Alpha+Beta'),
  ('robi_transferable_phase_unlock',  'pre_prod',
   'Phase at which transferability evaluation opens (Q1 2027 target)'),
  ('robi_max_transfers_per_month',    '0',
   'Max ROBI transfers/user/month when unlocked (0 = soulbound)'),
  ('robi_policy_version',             '1.0',
   'ROBI policy version — bump when amended via migration')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ── Public readonly RPC for FE wallet badge ────────────────────────
CREATE OR REPLACE FUNCTION public.get_robi_policy()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT jsonb_object_agg(key, value)
    FROM public.airdrop_config
   WHERE key IN (
     'robi_transferable',
     'robi_transferable_phase_unlock',
     'robi_max_transfers_per_month',
     'robi_policy_version',
     'current_phase'
   );
$$;

GRANT EXECUTE ON FUNCTION public.get_robi_policy() TO anon, authenticated, service_role;

-- ── Soulbound enforcement guard (placeholder for Stage 2 chain hook) ──
-- Pre-mainnet ROBI vivono in nft_rewards (Supabase ledger). Non c'è
-- un endpoint "transfer" esposto, quindi questa funzione esiste solo per
-- documentare l'intent + bloccare future RPC che provassero a riassegnare
-- ownership. Stage 2 (KRC-721) sostituisce la enforcement con on-chain hook.
CREATE OR REPLACE FUNCTION public.assert_robi_transferable()
RETURNS void
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_transferable TEXT;
BEGIN
  SELECT value INTO v_transferable FROM public.airdrop_config WHERE key = 'robi_transferable';
  IF COALESCE(v_transferable,'false') <> 'true' THEN
    RAISE EXCEPTION 'robi_soulbound_blocked: ROBI are soulbound during current phase (decision A · Alpha+Beta).';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assert_robi_transferable() TO authenticated;
