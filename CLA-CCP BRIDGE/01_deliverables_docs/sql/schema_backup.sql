-- ══════════════════════════════════════════════════════════════════════
-- AIROOBI — Full Database Schema Backup
-- Source: Supabase live schema snapshot — 21 Aprile 2026
-- Project: vuvlmlpuhovipfwtquux
-- Stage: Alpha 0 APERTO (post earnings v2 + scoring v4 + welcome grant)
--
-- WARNING: This is a reference snapshot. The source of truth remains
-- the incremental SQL migrations in supabase/migrations/.
-- Table order matters due to FK dependencies.
-- ══════════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════════════
-- SEZIONE 1: CORE UTENTI
-- ══════════════════════════════════════════════════════════════════════

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
  total_points integer DEFAULT 0,          -- ARIA balance
  current_streak integer DEFAULT 0,        -- Sequenza giornaliera (legacy counter)
  longest_streak integer DEFAULT 0,
  last_checkin date,
  avatar_url text,
  display_name text,
  first_name text,
  last_name text,
  public_id text UNIQUE,                   -- ID pubblico per leaderboard
  deleted_at timestamptz,                  -- Soft delete
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- ──────────────────────────────────────────────────
-- 2. POINTS_LEDGER (movimenti ARIA)
-- ──────────────────────────────────────────────────
CREATE TABLE public.points_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  -- Common reasons: alphanet_welcome, faucet, streak_day, daily_checkin,
  -- video_view, referral_inviter, referral_welcome, valuation_request,
  -- block_purchase, refund, admin_grant, admin_debug
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT points_ledger_pkey PRIMARY KEY (id),
  CONSTRAINT points_ledger_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- ──────────────────────────────────────────────────
-- 3. CHECKINS (legacy — superata da weekly_checkins in earnings v2)
-- ──────────────────────────────────────────────────
CREATE TABLE public.checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checked_at date DEFAULT CURRENT_DATE,
  CONSTRAINT checkins_pkey PRIMARY KEY (id),
  CONSTRAINT checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- ──────────────────────────────────────────────────
-- 4. WEEKLY_CHECKINS (earnings v2 — sequenza giornaliera)
-- ──────────────────────────────────────────────────
CREATE TABLE public.weekly_checkins (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,                            -- Lunedì della settimana
  days_checked smallint[] NOT NULL DEFAULT ARRAY[]::smallint[],  -- ISO dow: 1=Lun .. 7=Dom
  robi_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);

-- ──────────────────────────────────────────────────
-- 5. VIDEO_VIEWS (sospesi in Alpha)
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
-- 6. REFERRAL_CONFIRMATIONS
-- ──────────────────────────────────────────────────
CREATE TABLE public.referral_confirmations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  confirmed_at timestamp with time zone,
  status text DEFAULT 'pending'::text,      -- pending | confirmed
  device_hash text,
  ip_hash text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referral_confirmations_pkey PRIMARY KEY (id),
  CONSTRAINT referral_confirmations_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.profiles(id),
  CONSTRAINT referral_confirmations_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.profiles(id)
);

-- ──────────────────────────────────────────────────
-- 7. USER_ROLES (sistema ruoli admin/evaluator)
-- ──────────────────────────────────────────────────
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'evaluator')),
  category TEXT,                            -- solo per evaluator; NULL = tutte
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX user_roles_unique_idx
  ON user_roles (user_id, role, COALESCE(category, '__ALL__'));

-- ──────────────────────────────────────────────────
-- 8. USER_PREFERENCES (alert categoria)
-- ──────────────────────────────────────────────────
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  alert_on BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_slug)
);

-- ──────────────────────────────────────────────────
-- 9. PUSH_SUBSCRIPTIONS (Web Push API)
-- ──────────────────────────────────────────────────
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);


-- ══════════════════════════════════════════════════════════════════════
-- SEZIONE 2: ASSET & NFT
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- 10. NFT_REWARDS (ROBI, NFT_ALPHA_TIER0, Badge)
-- ──────────────────────────────────────────────────
CREATE TABLE public.nft_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nft_type text NOT NULL,                   -- ROBI | NFT_ALPHA_TIER0 | BADGE_FONDATORE | BADGE_ALPHA_BRAVE | BADGE_VALUATION
  name text,
  phase text DEFAULT 'alpha'::text,
  source text,                              -- alphanet_welcome, streak_week, referral_inviter, referral_welcome, submission_accepted, airdrop_won, airdrop_seller, block_purchase, ...
  shares integer DEFAULT 1,                 -- per ROBI = quantità (1 ROBI = 1 share)
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT nft_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT nft_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- ──────────────────────────────────────────────────
-- 11. ASSET_REGISTRY (censimento asset ufficiali)
-- ──────────────────────────────────────────────────
CREATE TABLE public.asset_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,                       -- currency | nft | badge
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);


-- ══════════════════════════════════════════════════════════════════════
-- SEZIONE 3: AIRDROP ENGINE
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- 12. CATEGORIES (16 categorie attive)
-- ──────────────────────────────────────────────────
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  label_it TEXT NOT NULL,
  label_en TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  icon_svg TEXT                             -- SVG icona flat monocromatica
);

-- ──────────────────────────────────────────────────
-- 13. AIRDROP_CONFIG (key-value engine parameters)
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrop_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT
);
-- Default entries:
-- ('valuation_cost_aria', '50', 'Costo in ARIA per richiesta valutazione')
-- ('presale_duration_hours', '24', 'Durata presale default')
-- ('sale_duration_hours', '168', 'Durata sale default (7 giorni)')
-- ('mining_enabled', 'false', 'ROBI Mining sospeso in Alpha')

-- ──────────────────────────────────────────────────
-- 14. AIRDROPS (full lifecycle)
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT REFERENCES categories(id),
  image_url TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,     -- multi-foto (submissions)
  object_value_eur NUMERIC(10,2) DEFAULT 0,
  block_price_aria INTEGER DEFAULT 0,
  presale_block_price INTEGER,
  total_blocks INTEGER DEFAULT 0,
  blocks_sold INTEGER DEFAULT 0,
  presale_blocks_pct NUMERIC(5,2) DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'in_valutazione',
  -- Status values:
  --   in_valutazione, valutazione_completata, accettato, presale, sale,
  --   closed, completed, annullato
  deadline TIMESTAMPTZ,
  duration_type TEXT,                       -- short | standard | long
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
  product_info JSONB,                       -- specifiche prodotto strutturate
  submitted_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 15. AIRDROP_PARTICIPATIONS
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrop_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  airdrop_id UUID NOT NULL REFERENCES airdrops(id),
  blocks_count INTEGER NOT NULL,
  aria_spent INTEGER NOT NULL,
  cancelled_at TIMESTAMPTZ,                 -- per scoring v4 exclusion
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 16. AIRDROP_BLOCKS (mosaico blocchi)
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrop_blocks (
  airdrop_id UUID NOT NULL REFERENCES airdrops(id),
  block_number INTEGER NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  is_winner_block BOOLEAN DEFAULT false,
  purchased_phase TEXT DEFAULT 'sale',      -- presale | sale
  PRIMARY KEY (airdrop_id, block_number)
);

-- ──────────────────────────────────────────────────
-- 17. AIRDROP_MESSAGES (chat proponente ↔ evaluator)
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
-- 18. AIRDROP_WATCHLIST (preferiti)
-- ──────────────────────────────────────────────────
CREATE TABLE public.airdrop_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, airdrop_id)
);

-- ──────────────────────────────────────────────────
-- 19. AUTO_BUY_RULES
-- ──────────────────────────────────────────────────
CREATE TABLE public.auto_buy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  blocks_per_interval INTEGER NOT NULL DEFAULT 1 CHECK (blocks_per_interval BETWEEN 1 AND 10),
  interval_hours INTEGER NOT NULL DEFAULT 4 CHECK (interval_hours IN (1, 2, 4, 6, 12)),
  max_blocks INTEGER NOT NULL DEFAULT 50 CHECK (max_blocks >= 1),
  active BOOLEAN NOT NULL DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  total_bought INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, airdrop_id)
);


-- ══════════════════════════════════════════════════════════════════════
-- SEZIONE 4: TREASURY & BUSINESS
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- 20. TREASURY_STATS (stato aggregato)
-- ──────────────────────────────────────────────────
CREATE TABLE public.treasury_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  balance_eur numeric(12,2) DEFAULT 0,
  nft_minted integer DEFAULT 0,
  nft_circulating integer DEFAULT 0,
  nft_max_supply integer DEFAULT 1000,
  aico_circulating integer DEFAULT 0,       -- LEGACY NAME = ARIA circolante
  revenue_ads numeric(12,2) DEFAULT 0,
  revenue_adsense numeric(12,2) DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT treasury_stats_pkey PRIMARY KEY (id)
);

-- ──────────────────────────────────────────────────
-- 21. TREASURY_FUNDS (versamenti Founder)
-- ──────────────────────────────────────────────────
CREATE TABLE public.treasury_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_eur numeric(10,2) NOT NULL,
  description text NOT NULL,
  split_pct JSONB,                          -- {"fondo": 22, "venditore": 68, "fee": 10}
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 22. TREASURY_TRANSACTIONS (split revenue post-draw)
-- ──────────────────────────────────────────────────
CREATE TABLE public.treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id UUID REFERENCES airdrops(id),
  type TEXT NOT NULL,                       -- fondo_contributo | airoobi_fee | charity | venditore_payout
  amount_eur NUMERIC(12,4) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 23. COMPANY_ASSETS (asset aziendali — admin only)
-- ──────────────────────────────────────────────────
CREATE TABLE public.company_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('fiat', 'crypto', 'nft')),
  name TEXT NOT NULL,
  symbol TEXT,
  amount NUMERIC(18,6) DEFAULT 0,
  value_eur NUMERIC(18,2) DEFAULT 0,
  wallet_address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 24. COST_TRACKER (costi operativi — admin only)
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


-- ══════════════════════════════════════════════════════════════════════
-- SEZIONE 5: ANALYTICS & COMMUNICATION
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- 25. EVENTS (analytics eventi client-side)
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
-- 26. NOTIFICATIONS (in-app)
-- ──────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  body TEXT,
  airdrop_id UUID REFERENCES airdrops(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 27. WAITLIST (pre-alpha)
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
-- 28. INVESTOR_LEADS
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


-- ══════════════════════════════════════════════════════════════════════
-- SEZIONE 6: LEGACY (mantenute per back-compat)
-- ══════════════════════════════════════════════════════════════════════

-- airdrop_manager_permissions: SOSTITUITA da user_roles (migrata ma presente)


-- ══════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ══════════════════════════════════════════════════════════════════════
-- submissions (public)
--   - Foto oggetti per valutazione (multi-foto supportato)
--   - RLS: auth upload, public read, owner delete


-- ══════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════════════════
-- RLS abilitato su TUTTE le tabelle public.
-- Pattern comuni:
--   - users_own: auth.uid() = user_id
--   - admin_all: EXISTS (SELECT 1 FROM user_roles WHERE user_id=auth.uid() AND role='admin')
--   - helper: is_admin() / has_role('evaluator')
--
-- Admin emails: tommaso.pecorella+ceo@outlook.com, ceo@airoobi.com


-- ══════════════════════════════════════════════════════════════════════
-- RPC FUNCTIONS (~60+ attive)
-- ══════════════════════════════════════════════════════════════════════
-- AUTH / RUOLI:
--   get_my_roles(), is_admin(), collaborators_rpc()
--
-- ARIA EARNING:
--   claim_faucet()
--   daily_checkin_v2()                    -- earnings v2, +50 ARIA + eventual +1 ROBI
--   claim_checkin()                        -- wrapper deprecato -> daily_checkin_v2
--   get_my_weekly_streak()
--   confirm_referral()                     -- +5 ROBI inviter + +5 ROBI invitato
--   link_referral(code)
--
-- AIRDROP ENGINE:
--   submit_object_for_valuation(p_title, p_description, p_category,
--                                p_image_urls jsonb,
--                                p_seller_desired_price, p_seller_min_price)
--   get_my_submissions(), get_my_submissions_v2()
--   withdraw_submission(airdrop_id)
--   accept_valuation(airdrop_id), reject_valuation(airdrop_id)
--   manager_update_airdrop(airdrop_id, ...)
--   buy_blocks(airdrop_id, n)              -- atomico, con Fairness Guard
--   cancel_participation(airdrop_id)
--   calculate_winner_score(airdrop_id)     -- scoring v4
--   my_category_score_snapshot(airdrop_id) -- card "Come arrivare 1°"
--   execute_draw(airdrop_id)
--   get_draw_preview(airdrop_id)
--   check_auto_draw()                      -- cron auto-draw deadline
--   refund_airdrop(airdrop_id)
--   get_airdrop_grid(airdrop_id), get_airdrop_participants(airdrop_id)
--   get_all_airdrops()                     -- admin/evaluator bypass RLS
--   get_completed_airdrops()               -- pubblico, ultimi 20
--   get_valuation_cost(), get_valuation_count()
--   user_airdrop_ranks(user_id)
--   user_airdrop_detail_stats(user_id, airdrop_id)
--   get_fairness_analysis(airdrop_id)
--
-- MESSAGGI:
--   send_airdrop_message(airdrop_id, body)
--   get_airdrop_messages(airdrop_id)
--
-- WATCHLIST / AUTO-BUY / PREFERENCES:
--   toggle_watchlist(airdrop_id)
--   upsert_auto_buy(airdrop_id, blocks_per_interval, interval_hours, max_blocks)
--   process_auto_buy()                     -- cron
--
-- ACTIVITY / LEADERBOARD:
--   activity_feed_rpc(...)
--   robi_history_rpc(user_id)
--   get_user_position(), get_leaderboard()
--
-- PUSH:
--   save_push_subscription(endpoint, keys_p256dh, keys_auth)
--
-- ADMIN:
--   delete_account(user_id)
--   admin_robi_check(user_id)


-- ══════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════════════════════════════════════════
-- handle_new_user()                         -- ON INSERT auth.users
--   Crea profiles row, genera referral_code, welcome grant 1000 ARIA + 5 ROBI
--
-- auto_alpha_brave_badge_trigger            -- assegna BADGE_ALPHA_BRAVE primi 1000
-- trigger_push_on_airdrop_publish           -- notifica push su nuovo airdrop
-- auto_state_transitions                    -- presale->sale->closed scheduler


-- ══════════════════════════════════════════════════════════════════════
-- EDGE FUNCTIONS (supabase/functions/)
-- ══════════════════════════════════════════════════════════════════════
-- check-deadlines    -- cron ogni 5 min, auto-draw su deadline
-- process-auto-buy   -- cron adattativo, esegue regole auto-buy
-- send-push          -- invia Web Push ai subscribers


-- ══════════════════════════════════════════════════════════════════════
-- NOTES FINALI
-- ══════════════════════════════════════════════════════════════════════
-- 1. Source of truth = supabase/migrations/*.sql (incrementali, autoritative)
-- 2. Questo file è una SNAPSHOT utile per onboarding e audit
-- 3. Per modifiche DB usare sempre `supabase migration new <name>`, mai SQL raw
-- 4. Email confirm DISABILITATO (autoconfirm ON)
-- 5. Storage bucket `submissions` per foto valutazione
-- 6. Versione app corrispondente: alfa-2026.04.21-3.48.3
