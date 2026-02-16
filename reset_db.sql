-- Script to clean up all dummy data and reset ID sequences (if applicable)

-- 1. Clear Transactions (Dependent on Users)
TRUNCATE TABLE public.transactions CASCADE;

-- 2. Clear Bets (Dependent on Markets and Users)
TRUNCATE TABLE public.bets CASCADE;

-- 3. Clear Markets (Dependent on nothing)
-- Using DELETE to trigger any potential cascades or policies, though TRUNCATE is faster.
DELETE FROM public.markets;

-- 4. Reset User Balances (Optional, but good for "clean slate")
UPDATE public.users SET balance = 0.00;

-- 5. Clear Activity Logs and Support Tickets
TRUNCATE TABLE public.activity_logs;
TRUNCATE TABLE public.support_tickets;

-- 6. Add "Featured" column to Markets? (Optional, if we want to flag hero items)
-- ALTER TABLE public.markets ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
