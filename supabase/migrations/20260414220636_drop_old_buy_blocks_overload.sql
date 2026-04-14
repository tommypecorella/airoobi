-- Rimuove il vecchio overload buy_blocks(UUID, INTEGER) che causava
-- ambiguità con la versione corrente buy_blocks(UUID, INTEGER[]).
-- Già eseguito manualmente su DB live.
DROP FUNCTION IF EXISTS buy_blocks(UUID, INTEGER);
