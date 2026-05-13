-- ============================================================================
-- Sprint W3 · Atto 1 · Migration M3
-- evaluation_requests table · seller submit + admin review pipeline
-- ============================================================================
-- LOCKED decisions (Skeezu sealed 13 May 2026):
-- #1 Floor €500 minimum (validated server-side via seller_price_estimate_eur)
-- #2 4 AND-gate quality criteria (admin reviewed, not enforced at SQL)
-- #3 Form esistente + admin manuale (no AI screening)
-- #4 Payment 200 ARIA fisso
-- #5 Output GO = 1 EVALOBI Livello B + 1 ROBI bonus (orchestrated by M4 admin_evaluate_request)
-- #9 NO_GO = NO refund (200 ARIA garantiti AIROOBI)
-- #11 NO_GO = NO ROBI bonus
-- #13 SLA 48h target (sla_deadline GENERATED column)
-- #15 Auto-escalation 24h reminder + 72h courtesy refund 50 ARIA (escalation_status tracking)
-- #20 Re-submit policy LIBERO (no cooldown · prior_evalobi_id ptr per re-eval link)
-- ============================================================================

CREATE TABLE public.evaluation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  -- Form input (Livello B)
  object_title TEXT NOT NULL,
  object_brand TEXT NOT NULL,
  object_model TEXT NOT NULL,
  object_condition TEXT NOT NULL CHECK (object_condition IN ('nuovo','come_nuovo','usato_eccellente')),
  object_year INTEGER,
  object_category TEXT NOT NULL,
  object_photos JSONB NOT NULL,
  seller_price_estimate_eur INTEGER NOT NULL CHECK (seller_price_estimate_eur >= 500),
  seller_notes TEXT,

  -- Re-evaluation pointer (decision #20 · re-submit libero)
  prior_evalobi_id UUID REFERENCES public.evalobi(id) ON DELETE SET NULL,

  -- Payment
  payment_aria INTEGER NOT NULL DEFAULT 200 CHECK (payment_aria > 0),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded_courtesy')),
  paid_at TIMESTAMPTZ,

  -- Pipeline status
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','evaluated','withdrawn')),

  -- Admin decision
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_decision_outcome TEXT CHECK (admin_decision_outcome IN ('GO','NO_GO','NEEDS_REVIEW')),
  admin_decision_price_range JSONB,
  admin_decision_reasoning TEXT,
  decided_at TIMESTAMPTZ,

  -- Output references (set by admin_evaluate_request orchestrator M4)
  evalobi_id UUID REFERENCES public.evalobi(id) ON DELETE SET NULL,
  robi_bonus_granted INTEGER NOT NULL DEFAULT 0 CHECK (robi_bonus_granted >= 0),

  -- SLA tracking (decision #13 · 48h target)
  sla_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  escalation_status TEXT NOT NULL DEFAULT 'none' CHECK (escalation_status IN ('none','reminded_24h','refunded_72h')),
  reminded_at TIMESTAMPTZ,
  refunded_courtesy_at TIMESTAMPTZ,
  refunded_courtesy_aria INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eval_req_seller ON public.evaluation_requests(seller_id, created_at DESC);
CREATE INDEX idx_eval_req_status ON public.evaluation_requests(status);
CREATE INDEX idx_eval_req_admin ON public.evaluation_requests(admin_id) WHERE admin_id IS NOT NULL;
CREATE INDEX idx_eval_req_sla_pending ON public.evaluation_requests(sla_deadline) WHERE status IN ('submitted','under_review');
CREATE INDEX idx_eval_req_escalation ON public.evaluation_requests(escalation_status) WHERE escalation_status != 'none';
CREATE INDEX idx_eval_req_prior_evalobi ON public.evaluation_requests(prior_evalobi_id) WHERE prior_evalobi_id IS NOT NULL;

COMMENT ON TABLE public.evaluation_requests IS 'AIROOBI evaluation pipeline · seller submits object + 200 ARIA payment → admin reviews → mint EVALOBI (always) + optional ROBI bonus on GO. SLA 48h + escalation 24h reminder / 72h courtesy refund 50 ARIA.';
COMMENT ON COLUMN public.evaluation_requests.prior_evalobi_id IS 'Re-evaluation link · seller paying 200 ARIA again to re-evaluate an existing EVALOBI (decision #20 · no cooldown).';
COMMENT ON COLUMN public.evaluation_requests.sla_deadline IS 'Auto-computed at submit (NOW + 48h) · auto-escalation cron checks sla_deadline + escalation_status for reminder/refund triggers.';
COMMENT ON COLUMN public.evaluation_requests.payment_status IS 'pending = not paid yet · paid = 200 ARIA debited from seller · refunded_courtesy = 50 ARIA refunded post-72h-SLA-breach (decision #15).';

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.tg_evaluation_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evaluation_requests_updated_at
  BEFORE UPDATE ON public.evaluation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_evaluation_requests_updated_at();

-- RLS
ALTER TABLE public.evaluation_requests ENABLE ROW LEVEL SECURITY;

-- Seller reads own
CREATE POLICY "Seller can read own evaluation_requests"
  ON public.evaluation_requests FOR SELECT TO authenticated
  USING (seller_id = auth.uid());

-- Admin reads all
CREATE POLICY "Admin can read all evaluation_requests"
  ON public.evaluation_requests FOR SELECT TO authenticated
  USING (public.is_admin_or_evaluator());

-- Seller can withdraw own pre-decision (UPDATE status='withdrawn' only)
-- This is restricted: only own + only if status is submitted/under_review
CREATE POLICY "Seller can withdraw own pending requests"
  ON public.evaluation_requests FOR UPDATE TO authenticated
  USING (
    seller_id = auth.uid()
    AND status IN ('submitted','under_review')
  )
  WITH CHECK (
    seller_id = auth.uid()
    AND status = 'withdrawn'
  );

-- INSERT/UPDATE evaluation flow via SECURITY DEFINER RPCs M4 (no direct policy)

-- GRANTs (Supabase default flip 30 Oct 2026 compliance)
GRANT SELECT ON TABLE public.evaluation_requests TO authenticated;
GRANT UPDATE (status) ON TABLE public.evaluation_requests TO authenticated;
-- No anon (sensitive seller data)
