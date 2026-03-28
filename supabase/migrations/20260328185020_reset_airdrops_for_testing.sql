-- Reset airdrop data for testing (Alpha 0)
-- Preserves airdrop_config parameters

TRUNCATE airdrop_blocks, airdrop_participations, airdrops CASCADE;
