-- ════════════════════════════════════════════════════════════════════
-- Round 13 fast-track · TASK 1 · airdrops cleanup
-- 11 May 2026 evening · Skeezu directive cleanup test airdrops
--
-- Mantieni solo 2 airdrops live:
--   - e6c69617-b7a8-4c51-a75a-896dda0a6ce1 (Garpez · presale 1/2618)
--   - c2f35ea4-0ddc-4577-a718-bac0c3e6f46b (iPhone 14 Pro · presale 55/1850)
--
-- FK recon information_schema:
--   NO ACTION:  airdrop_blocks, airdrop_participations, treasury_transactions,
--               nft_rewards, notifications  → DELETE manual pre-parent
--   CASCADE:    airdrop_messages, airdrop_watchlist, auto_buy_rules → auto
--   SET NULL:   platform_aria_ledger.related_airdrop_id → auto
--
-- Counts pre-execute (130 airdrops total · 128 to delete):
--   blocks_to_del=8 · participations_to_del=4 · messages_to_del=0
--   treasury_tx_to_del=0 · nft_rewards_to_del=49 (tutti nft_type=VALUATION)
--   notif_to_del=69 · watchlist_cascade=3 · auto_buy_cascade=4
-- ════════════════════════════════════════════════════════════════════

BEGIN;

DELETE FROM public.airdrop_blocks
 WHERE airdrop_id NOT IN ('e6c69617-b7a8-4c51-a75a-896dda0a6ce1','c2f35ea4-0ddc-4577-a718-bac0c3e6f46b');

DELETE FROM public.airdrop_participations
 WHERE airdrop_id NOT IN ('e6c69617-b7a8-4c51-a75a-896dda0a6ce1','c2f35ea4-0ddc-4577-a718-bac0c3e6f46b');

DELETE FROM public.nft_rewards
 WHERE airdrop_id IS NOT NULL
   AND airdrop_id NOT IN ('e6c69617-b7a8-4c51-a75a-896dda0a6ce1','c2f35ea4-0ddc-4577-a718-bac0c3e6f46b');

DELETE FROM public.notifications
 WHERE airdrop_id IS NOT NULL
   AND airdrop_id NOT IN ('e6c69617-b7a8-4c51-a75a-896dda0a6ce1','c2f35ea4-0ddc-4577-a718-bac0c3e6f46b');

DELETE FROM public.treasury_transactions
 WHERE airdrop_id IS NOT NULL
   AND airdrop_id NOT IN ('e6c69617-b7a8-4c51-a75a-896dda0a6ce1','c2f35ea4-0ddc-4577-a718-bac0c3e6f46b');

-- Parent delete · CASCADE auto-cleans messages/watchlist/auto_buy_rules
DELETE FROM public.airdrops
 WHERE id NOT IN ('e6c69617-b7a8-4c51-a75a-896dda0a6ce1','c2f35ea4-0ddc-4577-a718-bac0c3e6f46b');

COMMIT;
