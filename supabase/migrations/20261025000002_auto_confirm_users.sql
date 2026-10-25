-- ====================================================================
-- VeroPlan: Auto-Confirm All Users (Universal Sign In for Any Email)
-- ====================================================================

-- 1. Instantly confirm all existing accounts in auth.users
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Trigger function to automatically confirm any future email address on signup
CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  NEW.confirmed_at = COALESCE(NEW.confirmed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to auth.users BEFORE INSERT so no account ever gets blocked
DROP TRIGGER IF EXISTS tr_auto_confirm_users ON auth.users;
CREATE TRIGGER tr_auto_confirm_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_users();
