-- 1. Ensure 'metadata' column exists (used for extra images)
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Enable RLS on markets
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts or outdated restrictions
DROP POLICY IF EXISTS "Admins can insert markets" ON markets;
DROP POLICY IF EXISTS "Admins can update markets" ON markets;
DROP POLICY IF EXISTS "Public read access" ON markets;

-- 4. Allow everyone to VIEW markets
CREATE POLICY "Public read access"
ON markets
FOR SELECT
TO public
USING (true);

-- 5. Allow ADMINS to INSERT markets
-- Checks if the authenticated user has 'ADMIN' role in public.users table
CREATE POLICY "Admins can insert markets"
ON markets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- 6. Allow ADMINS to UPDATE markets
CREATE POLICY "Admins can update markets"
ON markets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);
