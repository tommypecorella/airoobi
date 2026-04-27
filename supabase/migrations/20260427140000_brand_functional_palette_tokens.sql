-- ════════════════════════════════════════════════════════════════════
-- Brand functional palette extension (ROBY approved · 27 Apr 2026)
-- TECH-HARDEN-001 · Sprint W1 · Day 2
--
-- Token reference per CSS variables. Identity palette resta tassativa
-- (BLACK/GOLD/WHITE + ARIA blue + KAS green); functional è subordinata,
-- max 5% superficie schermo.
-- CSS vars aggiunte in src/home.css e src/dapp.css.
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('palette_red_error', '#B91C1C',
   'Functional palette: errors critical, destructive actions, halt states (es. treasury Red band)'),
  ('palette_red_alert', '#ef4444',
   'Functional palette: warning urgenti, alert non-critical, badge errore secondario'),
  ('palette_red_soft', '#f87171',
   'Functional palette: soft warnings, hover states su elementi error, info secondari')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();
