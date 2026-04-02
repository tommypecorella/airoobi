-- Auto-assign ALPHA_BRAVE badge + ROBI (6 shares) to new real users (first 1000)
CREATE OR REPLACE FUNCTION auto_assign_alpha_brave()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  real_user_count integer;
BEGIN
  -- Skip test users
  IF COALESCE(NEW.is_test_user, false) = true THEN
    RETURN NEW;
  END IF;

  -- Count real users
  SELECT count(*) INTO real_user_count
  FROM profiles WHERE COALESCE(is_test_user, false) = false;

  -- Only first 1000
  IF real_user_count > 1000 THEN
    RETURN NEW;
  END IF;

  -- Assign ALPHA_BRAVE badge if not exists
  INSERT INTO nft_rewards (user_id, nft_type, name, source, shares)
  VALUES (NEW.id, 'ALPHA_BRAVE', 'Alpha Brave Badge', 'alpha_badge', 1.0)
  ON CONFLICT DO NOTHING;

  -- Assign ROBI (6 shares) if not exists
  INSERT INTO nft_rewards (user_id, nft_type, name, source, shares)
  VALUES (NEW.id, 'ROBI', 'ROBI Launch Gift', 'dapp_launch', 6.0)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger on profile creation
DROP TRIGGER IF EXISTS trg_auto_alpha_brave ON profiles;
CREATE TRIGGER trg_auto_alpha_brave
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_alpha_brave();
