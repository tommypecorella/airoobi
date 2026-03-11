-- ══════════════════════════════════════════════════
-- AIROOBI — Full Database Schema Backup
-- Source: Supabase live schema dump — 11 Mar 2026
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

-- ══════════════════════════════════════════════════
-- NOTA: treasury_stats NON esiste nel DB attuale.
-- Da creare se/quando necessario:
--
-- CREATE TABLE public.treasury_stats (
--   id uuid NOT NULL DEFAULT gen_random_uuid(),
--   balance_eur numeric(12,2) DEFAULT 0,
--   nft_minted integer DEFAULT 0,
--   nft_value numeric(12,4) DEFAULT 0,
--   created_at timestamp with time zone DEFAULT now(),
--   CONSTRAINT treasury_stats_pkey PRIMARY KEY (id)
-- );
-- ══════════════════════════════════════════════════

-- ══════════════════════════════════════════════════
-- RLS POLICIES — vedi schema_rls.sql separato
-- RPC FUNCTIONS — vedi Supabase Dashboard > Database > Functions
-- ══════════════════════════════════════════════════
