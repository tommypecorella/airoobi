-- Fix: prezzi invertiti su Poltrona 3in1
-- presale_block_price deve essere < block_price_aria
UPDATE airdrops
SET block_price_aria = 10,
    presale_block_price = 5
WHERE id = '4219b39a-ab83-407d-8dc0-3723b04288bd';
