-- 🔒 FIX vulnerabilità grave (22 lug 2026): un utente loggato poteva inserirsi
-- ARIA (points_ledger), ROBI (nft_rewards) e saldo (profiles.total_points) da solo,
-- via REST diretta, perché le policy INSERT/UPDATE erano aperte a `public` con solo
-- il check auth.uid()=user_id (nessun limite su importo/reason). Tutti i grant LEGITTIMI
-- passano da funzioni SECURITY DEFINER (claim_welcome_grant, claim_faucet,
-- admin_gift_aria, daily_checkin_v2, claim_learning_reward…) che girano come owner e
-- NON sono toccate da questa chiusura. Difesa a due strati: rimuovo le policy permissive
-- E revoco i grant diretti di scrittura ad anon/authenticated.
-- Scoperta dal "pentest" involontario di Claudio (11 account test-niq*@mailinator via API).

-- 1) points_ledger: via la INSERT self-service. Restano SELECT own/admin.
drop policy if exists "Users can insert own points" on public.points_ledger;
revoke insert, update, delete, truncate on public.points_ledger from anon, authenticated;

-- 2) nft_rewards: via la INSERT self-service (era il conio ROBI libero!).
--    Resta "Admin can manage nft_rewards" (is_admin) + SELECT own/admin.
drop policy if exists "Users can insert own NFTs" on public.nft_rewards;
revoke insert, update, delete, truncate on public.nft_rewards from anon, authenticated;

-- 3) transactions: nessuna policy di scrittura (già solo SELECT via RLS) → revoco i grant.
revoke insert, update, delete, truncate on public.transactions from anon, authenticated;

-- 4) airdrop_config: la policy di scrittura è già solo service_role, ma il GRANT ad anon
--    era spalancato → tolgo ogni scrittura diretta (config si cambia solo da service_role/RPC).
revoke insert, update, delete, truncate on public.airdrop_config from anon, authenticated;

-- 5) profiles: l'UPDATE era aperto su TUTTE le colonne → un utente poteva settarsi
--    total_points / kas_balance / phone_verified_at (quest'ultimo bypassa il gate del
--    welcome grant!). Carve-out a colonne: revoco l'UPDATE totale e riconcedo solo le
--    colonne che l'utente può davvero editare di sé. L'INSERT (self, per il signup) resta.
revoke update on public.profiles from anon, authenticated;
grant update (avatar_url, first_name, last_name, username,
              category_preferences, notify_all, phone_e164, phone_country_code)
  on public.profiles to authenticated;
