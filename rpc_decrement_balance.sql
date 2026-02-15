-- RPC function to atomically decrement balance
CREATE OR REPLACE FUNCTION decrement_balance(userid UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET balance = balance - amount
  WHERE id = userid AND balance >= amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient funds or user not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
