-- ══════════════════════════════════════════════════
-- AIROOBI — Fix constraints for user submissions
-- Submissions (in_valutazione) have block_price=0, total_blocks=0
-- Admin sets real values after evaluation
-- ══════════════════════════════════════════════════

-- Drop old constraints that require > 0
ALTER TABLE airdrops DROP CONSTRAINT IF EXISTS valid_blocks;
ALTER TABLE airdrops DROP CONSTRAINT IF EXISTS valid_price;

-- Allow 0 for submissions (admin fills real values later)
ALTER TABLE airdrops ADD CONSTRAINT valid_blocks CHECK (
  total_blocks >= 0 AND blocks_sold >= 0 AND blocks_sold <= total_blocks
);
ALTER TABLE airdrops ADD CONSTRAINT valid_price CHECK (
  block_price_aria >= 0
);
