-- Migration to support Multi-Outcome Markets

-- 1. Add 'outcomes' to markets (JSONB array of strings)
ALTER TABLE public.markets 
ADD COLUMN outcomes JSONB DEFAULT '["YES", "NO"]'::jsonb;

-- 2. Convert 'resolution_result' from ENUM to TEXT
-- First, drop the default if any (none in schema, but good practice)
ALTER TABLE public.markets ALTER COLUMN resolution_result DROP DEFAULT;

-- We need to change the type. 
-- Since it's an ENUM, we can cast it to text.
ALTER TABLE public.markets 
ALTER COLUMN resolution_result TYPE TEXT USING resolution_result::text;

-- Drop the old ENUM type if no longer needed (optional, safer to keep for rollback)
-- DROP TYPE resolution_result;

-- 3. Convert 'bets.side' from ENUM to TEXT
ALTER TABLE public.bets 
ALTER COLUMN side TYPE TEXT USING side::text;

-- Drop the bet_side ENUM type
-- DROP TYPE bet_side;

-- 4. Update existing markets to have the default outcomes if null
UPDATE public.markets 
SET outcomes = '["YES", "NO"]'::jsonb 
WHERE outcomes IS NULL;

-- 5. Update existing markets to track total amount per outcome in a JSONB or separate table?
-- CURRENTLY: we have total_yes_amount and total_no_amount columns.
-- For multi-outcome, we should ideally have a `outcome_pools` JSONB column: {"YES": 100, "NO": 50, "DRAW": 0}
-- OR just sum the bets dynamically.
-- Let's add `outcome_pools` JSONB to markets to cache the totals.
ALTER TABLE public.markets 
ADD COLUMN outcome_pools JSONB DEFAULT '{"YES": 0, "NO": 0}'::jsonb;

-- Migrate existing yes/no amounts to outcome_pools
UPDATE public.markets
SET outcome_pools = jsonb_build_object(
    'YES', COALESCE(total_yes_amount, 0), 
    'NO', COALESCE(total_no_amount, 0)
);

-- (Optional) We can keep total_yes_amount/total_no_amount for backward compatibility 
-- or deprecate them. For now, let's keep them but primary logic should shift to outcomes/outcome_pools.
