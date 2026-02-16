-- Function to resolve a market and distribute payouts
-- Usage: SELECT resolve_market('market_uuid', 'YES');

CREATE OR REPLACE FUNCTION resolve_market(
  p_market_id UUID,
  p_outcome TEXT -- 'YES' or 'NO'
) RETURNS VOID AS $$
DECLARE
  v_market_status market_status;
  v_total_pool DECIMAL;
  v_winning_pool DECIMAL;
  v_bet RECORD;
  v_payout DECIMAL;
BEGIN
  -- 1. Validate Input
  IF p_outcome NOT IN ('YES', 'NO') THEN
    RAISE EXCEPTION 'Invalid outcome. Must be YES or NO';
  END IF;

  -- 2. Lock Market Row & Check Status
  SELECT status, total_pool, CASE WHEN p_outcome = 'YES' THEN total_yes_amount ELSE total_no_amount END
  INTO v_market_status, v_total_pool, v_winning_pool
  FROM markets
  WHERE id = p_market_id
  FOR UPDATE;

  IF v_market_status != 'OPEN' THEN
    RAISE EXCEPTION 'Market is not OPEN (Current status: %)', v_market_status;
  END IF;

  -- 3. Update Market Status
  UPDATE markets
  SET 
    status = 'RESOLVED',
    resolution_result = p_outcome::resolution_result,
    end_date = NOW() -- Close it officially now
  WHERE id = p_market_id;

  -- 4. Process Winning Bets (If there are winners)
  IF v_winning_pool > 0 THEN
    FOR v_bet IN 
      SELECT * FROM bets 
      WHERE market_id = p_market_id 
      AND side::text = p_outcome 
      AND status = 'ACTIVE'
    LOOP
      -- Calculate Payout: (BetAmount / WinningPool) * TotalPool
      -- Platform Fee (e.g. 10%) should be deducted from TotalPool ideally, but for now assuming 0% fee or fee already handled in odds visual. 
      -- Let's stick to pure pool distribution for simplicity or check if we need fees. 
      -- Request didn't specify fees, but standard is (Bet / WinPool) * TotalPool.
      
      v_payout := (v_bet.amount / v_winning_pool) * v_total_pool;

      -- Update User Balance
      UPDATE users
      SET balance = balance + v_payout
      WHERE id = v_bet.user_id;

      -- Update Bet Status
      UPDATE bets
      SET status = 'WON', potential_payout = v_payout -- Store actual payout
      WHERE id = v_bet.id;

      -- Log Transaction
      INSERT INTO transactions (user_id, type, amount, status, metadata)
      VALUES (
        v_bet.user_id, 
        'BET_WIN', 
        v_payout, 
        'COMPLETED', 
        jsonb_build_object('market_id', p_market_id, 'bet_id', v_bet.id)
      );
    END LOOP;
  ELSE
    -- House takes all? Or refund? 
    -- If no winners, normally house keeps or refunds. 
    -- For now, do nothing (money stays in pool/house).
    NULL;
  END IF;

  -- 5. Mark Losing Bets
  UPDATE bets
  SET status = 'LOST'
  WHERE market_id = p_market_id 
  AND side::text != p_outcome 
  AND status = 'ACTIVE';

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
