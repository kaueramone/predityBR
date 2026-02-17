-- FIX INFINITE RECURSION ERROR
-- The previous policy caused a loop: checking "users" required reading "users", which checked the policy again...

-- 1. Create a secure function to check Admin status
-- "SECURITY DEFINER" means this function runs with Superuser privileges (bypassing RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up broken policies on USERS
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- 3. Re-create clean policies on USERS
-- A. Owner can see themselves (Simple, non-recursive)
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- B. Admins can see everyone (Uses the safe function)
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (is_admin());

-- 4. Clean up and Fix BETS/TRANSACTIONS (relying on user role)
DROP POLICY IF EXISTS "Admins can view all bets" ON bets;
CREATE POLICY "Admins can view all bets"
ON bets FOR SELECT
USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
USING (is_admin());
