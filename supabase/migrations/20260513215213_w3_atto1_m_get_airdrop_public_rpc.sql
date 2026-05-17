-- Sprint W3 · Atto 1 · Area 8 SEO · get_airdrop_public RPC for /airdrops/:id Vercel SSR

CREATE OR REPLACE FUNCTION public.get_airdrop_public(p_airdrop_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  object_value_eur NUMERIC,
  block_price_aria INTEGER,
  total_blocks INTEGER,
  blocks_sold INTEGER,
  status TEXT,
  deadline TIMESTAMPTZ,
  presale_block_price INTEGER,
  presale_enabled BOOLEAN,
  product_info JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    a.id, a.title, a.description, a.category, a.image_url,
    a.object_value_eur, a.block_price_aria,
    a.total_blocks, a.blocks_sold, a.status, a.deadline,
    a.presale_block_price, a.presale_enabled,
    a.product_info, a.created_at
  FROM public.airdrops a
  WHERE a.id = p_airdrop_id
    AND a.status NOT IN ('draft','rejected','withdrawn')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_airdrop_public(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_airdrop_public(UUID) TO anon;

COMMENT ON FUNCTION public.get_airdrop_public IS 'Public airdrop fetch · only returns visible airdrops (excludes draft/rejected/withdrawn) · used by Vercel SSR /api/airdrop-ssr.js for OG meta + SEO.';
