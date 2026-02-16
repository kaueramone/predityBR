-- Enable RLS on transactions if not already
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own transactions
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can see all transactions
-- Assuming 'users' table has a 'role' column. 
-- Note: Policy using join or subquery can be expensive, optimizing for simple role check if stored in metadata or strictly in public.users
CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

-- Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_read BOOLEAN DEFAULT FALSE
);

-- RLS for Support Messages
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users can insert (send) messages
CREATE POLICY "Users can insert own messages"
ON support_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
ON support_messages FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all support messages"
ON support_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

-- Admins can insert/reply
CREATE POLICY "Admins can reply"
ON support_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

-- Allow Transactions Insert (System/Server usually handles this with service role, but if Client initiates):
-- CAUTION: Allowing client insert on transactions is risky. 
-- Usually deposits/withdrawals are handled via server actions or RPC.
-- If existing code does `supabase.from('transactions').insert()`, we need this:
CREATE POLICY "Users can insert transactions (Deposit/Withdraw)"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);
