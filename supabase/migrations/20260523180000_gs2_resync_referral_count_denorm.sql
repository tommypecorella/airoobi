-- ════════════════════════════════════════════════════════════════
-- GS-2 · re-sync profiles.referral_count (denorm desync)
-- ════════════════════════════════════════════════════════════════
-- One-shot UPDATE per allineare profiles.referral_count al real count
-- da referral_confirmations (status='confirmed').
--
-- Root cause: dual-write W4 (20260518000000) introduce +1 UPDATE
-- parallelo a quello esistente in earnings_v2_streak_referral
-- (20260419143000) -> doppio incremento per ogni confirm post 18 May.
-- CEO: real_confirmed=3, denorm=9, delta=+6.
--
-- Fix accompagnatorio FE (commit successivo):
-- - abo.html + src/home.js admin table: count LIVE da referral_confirmations
--   invece di leggere profiles.referral_count denorm.
--
-- Stage 2 follow-up (logged ROBY): drop column profiles.referral_count
-- una volta che niente la legge + rimuovere uno dei 2 path UPDATE.
--
-- Decision trail:
--   - Diagnosi: CCP_RS_GS2_Diagnosis_3Options_2026-05-23.md
--   - GO Skeezu Opzione A: chat 23 May 2026
-- ════════════════════════════════════════════════════════════════

UPDATE public.profiles p
SET referral_count = COALESCE((
  SELECT count(*)
  FROM public.referral_confirmations rc
  WHERE rc.referrer_id = p.id
    AND rc.status = 'confirmed'
), 0)
WHERE referral_count IS DISTINCT FROM (
  SELECT count(*)
  FROM public.referral_confirmations rc
  WHERE rc.referrer_id = p.id
    AND rc.status = 'confirmed'
);
