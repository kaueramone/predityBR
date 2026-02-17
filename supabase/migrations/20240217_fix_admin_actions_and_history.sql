-- FIX ADMIN ACTIONS & TRANSACTION HISTORY

-- 1. Add 'status' column to users (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE';
    END IF;
END $$;

-- 2. USERS: Allow UPDATE (Profile, Balance, Role, Status)
-- A. Users can update their OWN profile (Balance, Name, etc)
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- B. Admins can update ANY user (Role, Status, etc)
CREATE POLICY "Admins can update all users"
ON users FOR UPDATE
USING (is_admin());

-- 3. TRANSACTIONS: Fix Missing History (INSERT / SELECT)
-- Enable RLS just in case
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- A. Users can INSERT their own transactions (Deposit/Withdraw/Bet)
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- B. Users can VIEW their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- C. Admins can VIEW ALL transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
USING (is_admin());

-- D. Admins can INSERT system transactions (Fees, Payouts)
DROP POLICY IF EXISTS "Admins can insert transactions" ON transactions;
CREATE POLICY "Admins can insert transactions"
ON transactions FOR INSERT
WITH CHECK (is_admin());

-- 4. BETS: Ensure INSERT is allowed for users
DROP POLICY IF EXISTS "Users can place bets" ON bets;
CREATE POLICY "Users can place bets"
ON bets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. SUPPORT: Ensure Users can start tickets
DROP POLICY IF EXISTS "Users can create tickets" ON support_messages;
CREATE POLICY "Users can create tickets"
ON support_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);
