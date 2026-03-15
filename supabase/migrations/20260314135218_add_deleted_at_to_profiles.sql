-- Add deleted_at column for soft-delete support
-- Required by get_leaderboard RPC and delete-account flow
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
