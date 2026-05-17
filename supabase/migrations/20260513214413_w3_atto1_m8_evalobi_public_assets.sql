-- Sprint W3 · Atto 1 · M8 · ALTER evalobi add public asset URLs + get_evalobi_public RPC

ALTER TABLE public.evalobi
  ADD COLUMN IF NOT EXISTS public_url TEXT GENERATED ALWAYS AS ('https://www.airoobi.com/evalobi/' || token_id::text) STORED,
  ADD COLUMN IF NOT EXISTS public_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS public_image_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

COMMENT ON COLUMN public.evalobi.public_url IS 'Auto-generated canonical public URL · stable per token_id · Vercel SSR /api/evalobi-ssr.js serves the page.';
COMMENT ON COLUMN public.evalobi.public_pdf_url IS 'Supabase Storage URL to PDF certificate · populated by edge function generate-evalobi-public-assets (deferred post-Atto-1-V1).';
COMMENT ON COLUMN public.evalobi.public_image_url IS 'Supabase Storage URL to OG-image 1200x630 PNG · populated by edge function.';
COMMENT ON COLUMN public.evalobi.qr_code_url IS 'Supabase Storage URL to QR SVG · scan-verifiable · populated by edge function.';

CREATE OR REPLACE FUNCTION public.get_evalobi_public(p_token_id BIGINT)
RETURNS TABLE (
  evalobi_id UUID,
  token_id BIGINT,
  object_title TEXT,
  object_brand TEXT,
  object_model TEXT,
  object_condition TEXT,
  object_year INTEGER,
  object_category TEXT,
  object_photo_hashes JSONB,
  evaluation_outcome TEXT,
  evaluation_price_range JSONB,
  evaluation_reasoning TEXT,
  evaluated_at TIMESTAMPTZ,
  version INTEGER,
  public_url TEXT,
  public_pdf_url TEXT,
  public_image_url TEXT,
  qr_code_url TEXT,
  owner_username TEXT,
  owner_redacted BOOLEAN,
  photo_blur_enabled BOOLEAN
)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    e.id, e.token_id, e.object_title, e.object_brand, e.object_model,
    e.object_condition, e.object_year, e.object_category, e.object_photo_hashes,
    e.evaluation_outcome, e.evaluation_price_range, e.evaluation_reasoning,
    e.evaluated_at, e.version,
    e.public_url, e.public_pdf_url, e.public_image_url, e.qr_code_url,
    CASE WHEN e.owner_redacted THEN NULL ELSE p.username END AS owner_username,
    e.owner_redacted,
    e.photo_blur_enabled
  FROM public.evalobi e
  JOIN public.profiles p ON p.id = e.current_owner_id
  WHERE e.token_id = p_token_id
    AND e.public_visible = TRUE
    AND e.evaluation_outcome IS NOT NULL
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_evalobi_public IS 'Public EVALOBI fetch by token_id · respects privacy flags (owner_redacted hides username, photo_blur_enabled flag for client-side blur). Used by Vercel SSR /api/evalobi-ssr.js · anon-callable.';

GRANT EXECUTE ON FUNCTION public.get_evalobi_public(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_evalobi_public(BIGINT) TO anon;
