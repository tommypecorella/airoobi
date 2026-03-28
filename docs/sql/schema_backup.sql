-- ══════════════════════════════════════════════════
-- AIROOBI — Full Database Schema Backup
-- Source: Supabase live schema dump — 28 Mar 2026
-- Project: vuvlmlpuhovipfwtquux
--
-- WARNING: This is a reference backup.
-- Table order matters due to FK dependencies.
-- ══════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- 1. PROFILES (first — other tables FK to this)
-- ──────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  referral_code text UNIQUE,
  referred_by text,
  referral_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_checkin date,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- ──────────────────────────────────────────────────
-- 2. POINTS_LEDGER
-- ──────────────────────────────────────────────────
CREATE TABLE public.points_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT points_ledger_pkey PRIMARY KEY (id),
  CONSTRAINT points_ledger_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- ──────────────────────────────────────────────────
-- 3. CHECKINS
-- ──────────────────────────────────────────────────
CREATE TABLE public.checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checked_at date DEFAULT CURRENT_DATE,
  CONSTRAINT checkins_pkey PRIMARY KEY (id),
  CONSTRAINT checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- ──────────────────────────────────────────────────
-- 4. VIDEO_VIEWS
-- ──────────────────────────────────────────────────
CREATE TABLE public.video_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  duration_seconds integer DEFAULT 0,
  CONSTRAINT video_views_pkey PRIMARY KEY (id),
  CONSTRAINT video_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- ──────────────────────────────────────────────────
-- 5. REFERRAL_CONFIRMATIONS
-- ──────────────────────────────────────────────────
CREATE TABLE public.referral_confirmations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  confirmed_at timestamp with time zone,
  status text DEFAULT 'pending'::text,
  device_hash text,
  ip_hash text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referral_confirmations_pkey PRIMARY KEY (id),
  CONSTRAINT referral_confirmations_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.profiles(id),
  CONSTRAINT referral_confirmations_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.profiles(id)
);

-- ──────────────────────────────────────────────────
-- 6. NFT_REWARDS
-- ──────────────────────────────────────────────────
CREATE TABLE public.nft_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nft_type text NOT NULL,
  name text,
  phase text DEFAULT 'alpha'::text,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT nft_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT nft_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- ──────────────────────────────────────────────────
-- 7. EVENTS
-- ──────────────────────────────────────────────────
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event text NOT NULL,
  user_id uuid,
  props jsonb,
  url text,
  referrer text,
  ua text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- ──────────────────────────────────────────────────
-- 8. WAITLIST
-- ──────────────────────────────────────────────────
CREATE TABLE public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  referral_code text UNIQUE,
  referred_by text,
  lang text DEFAULT 'it'::text,
  source text DEFAULT 'landing'::text,
  CONSTRAINT waitlist_pkey PRIMARY KEY (id)
);

-- ──────────────────────────────────────────────────
-- 9. INVESTOR_LEADS
-- ──────────────────────────────────────────────────
CREATE TABLE public.investor_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organization text,
  message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT investor_leads_pkey PRIMARY KEY (id)
);

-- ──────────────────────────────────────────────────
-- 10. COST_TRACKER
-- ──────────────────────────────────────────────────
CREATE TABLE public.cost_tracker (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['fisso'::text, 'variabile'::text, 'una_tantum'::text])),
  amount numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL CHECK (frequency = ANY (ARRAY['mensile'::text, 'annuale'::text, 'una_tantum'::text])),
  ref_month date NOT NULL,
  status text NOT NULL DEFAULT 'da_pagare'::text CHECK (status = ANY (ARRAY['da_pagare'::text, 'pagato'::text, 'free'::text, 'freemium'::text, 'a_pagamento'::text, 'abbandonato'::text, 'in_ritardo'::text, 'non_pagato'::text])),
  paid_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cost_tracker_pkey PRIMARY KEY (id)
);

-- ──────────────────────────────────────────────────
-- 11. TREASURY_STATS
-- ──────────────────────────────────────────────────
CREATE TABLE public.treasury_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  balance_eur numeric(12,2) DEFAULT 0,
  nft_minted integer DEFAULT 0,
  nft_circulating integer DEFAULT 0,
  nft_max_supply integer DEFAULT 1000,
  aico_circulating integer DEFAULT 0,
  revenue_ads numeric(12,2) DEFAULT 0,
  revenue_adsense numeric(12,2) DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT treasury_stats_pkey PRIMARY KEY (id)
);

-- ──────────────────────────────────────────────────
-- 12. USER_ROLES
-- ──────────────────────────────────────────────────
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin','evaluator')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ──────────────────────────────────────────────────
-- 13. CATEGORIES
-- ──────────────────────────────────────────────────
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  label_it TEXT NOT NULL,
  label_en TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ──────────────────────────────────────────────────
-- 14. NOTIFICATIONS
-- ──────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 15. ASSET_REGISTRY
-- ──────────────────────────────────────────────────
CREATE TABLE public.asset_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ──────────────────────────────────────────────────
-- 16. AIRDROP_CONFIG (key-value engine parameters)
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrop_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT
);

-- ──────────────────────────────────────────────────
-- 17. AIRDROPS
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  object_value_eur NUMERIC(10,2) DEFAULT 0,
  block_price_aria INTEGER DEFAULT 0,
  presale_block_price INTEGER,
  total_blocks INTEGER DEFAULT 0,
  blocks_sold INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_valutazione',
  deadline TIMESTAMPTZ,
  auto_draw BOOLEAN DEFAULT false,
  winner_id UUID REFERENCES profiles(id),
  winner_score NUMERIC(10,6),
  draw_executed_at TIMESTAMPTZ,
  draw_scores JSONB,
  venditore_payout_eur NUMERIC(10,2),
  airoobi_fee_eur NUMERIC(10,2),
  charity_contrib_eur NUMERIC(10,4),
  fondo_contributo_eur NUMERIC(10,2),
  aria_incassato INTEGER,
  seller_desired_price NUMERIC(10,2),
  seller_min_price NUMERIC(10,2),
  product_info JSONB,
  submitted_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 18. AIRDROP_PARTICIPATIONS
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrop_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  airdrop_id UUID NOT NULL REFERENCES airdrops(id),
  blocks_count INTEGER NOT NULL,
  aria_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 19. AIRDROP_BLOCKS
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrop_blocks (
  airdrop_id UUID NOT NULL REFERENCES airdrops(id),
  block_number INTEGER NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  is_winner_block BOOLEAN DEFAULT false,
  purchased_phase TEXT DEFAULT 'sale',
  PRIMARY KEY (airdrop_id, block_number)
);

-- ──────────────────────────────────────────────────
-- 20. TREASURY_TRANSACTIONS
-- ──────────────────────────────────────────────────
CREATE TABLE public.treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id UUID REFERENCES airdrops(id),
  type TEXT NOT NULL,
  amount_eur NUMERIC(12,4) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 21. AIRDROP_MESSAGES (chat proponente ↔ evaluator)
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrop_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ──────────────────────────────────────────────────
-- submissions (public) — foto oggetti per valutazione

-- ══════════════════════════════════════════════════
-- RLS POLICIES — vedi schema_rls.sql separato (abilitato su tutte le tabelle)
-- RPC FUNCTIONS — principali:
--   confirm_referral, link_referral, do_checkin, get_user_position,
--   buy_blocks, get_airdrop_grid, get_airdrop_participants,
--   calculate_winner_score, execute_draw, get_draw_preview, refund_airdrop,
--   check_auto_draw, get_all_airdrops, manager_update_airdrop,
--   submit_object_for_valuation (con p_image_urls JSONB),
--   get_my_submissions, get_valuation_cost, get_valuation_count,
--   get_completed_airdrops, get_my_roles,
--   send_airdrop_message, get_airdrop_messages
-- ══════════════════════════════════════════════════
