-- 1. Enable RLS on users table (if not already)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Allow Admins to View All Users (for Dashboard "Total Users" count)
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users AS u
    WHERE u.id = auth.uid() 
    AND u.role = 'ADMIN'
  )
);

-- 3. Allow Admins to View All Bets (for Dashboard Volume/Profit charts)
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all bets"
ON bets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

-- 4. Allow Admins to Update Markets (Resolving bets)
-- (Existing policies might cover this, but reinforcing)
CREATE POLICY "Admins can update markets"
ON markets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);
