-- MASTER FIX SCRIPT (Run this to fix 404s, hangs, and permission errors)

-- 1. Reset Markets RLS completely
ALTER TABLE markets DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can insert markets" ON markets;
DROP POLICY IF EXISTS "Admins can update markets" ON markets;
DROP POLICY IF EXISTS "Public read access" ON markets;

-- 2. Re-enable RLS with cleanly defined policies
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public read access" ON markets
FOR SELECT TO public USING (true);

-- Allow ADMINS to do EVERYTHING (Insert, Update, Delete)
CREATE POLICY "Admins full access" ON markets
FOR ALL 
TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 3. Ensure Storage Bucket Exists and is Public
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Uploads" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'images' );
CREATE POLICY "Auth Uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'images' );

-- 4. Ensure Resolution Function Exists
CREATE OR REPLACE FUNCTION resolve_market(p_market_id UUID, p_outcome TEXT) RETURNS VOID AS $$
DECLARE
  v_market_status market_status;
  v_total_pool DECIMAL;
  v_winning_pool DECIMAL;
  v_bet RECORD;
  v_payout DECIMAL;
BEGIN
  IF p_outcome NOT IN ('YES', 'NO') THEN RAISE EXCEPTION 'Invalid outcome'; END IF;
  
  SELECT status, total_pool, CASE WHEN p_outcome = 'YES' THEN total_yes_amount ELSE total_no_amount END
  INTO v_market_status, v_total_pool, v_winning_pool
  FROM markets WHERE id = p_market_id FOR UPDATE;

  IF v_market_status != 'OPEN' THEN RAISE EXCEPTION 'Market not OPEN'; END IF;

  UPDATE markets SET status = 'RESOLVED', resolution_result = p_outcome::resolution_result, end_date = NOW() WHERE id = p_market_id;

  IF v_winning_pool > 0 THEN
    FOR v_bet IN SELECT * FROM bets WHERE market_id = p_market_id AND side::text = p_outcome AND status = 'ACTIVE' LOOP
      v_payout := (v_bet.amount / v_winning_pool) * v_total_pool;
      UPDATE users SET balance = balance + v_payout WHERE id = v_bet.user_id;
      UPDATE bets SET status = 'WON', potential_payout = v_payout WHERE id = v_bet.id;
      INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES (v_bet.user_id, 'BET_WIN', v_payout, 'COMPLETED', jsonb_build_object('market_id', p_market_id, 'bet_id', v_bet.id));
    END LOOP;
  END IF;

  UPDATE bets SET status = 'LOST' WHERE market_id = p_market_id AND side::text != p_outcome AND status = 'ACTIVE';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
