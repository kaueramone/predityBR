-- 1. Add missing 'metadata' column to markets if it doesn't exist
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Create 'images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop potential conflicting policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Any Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Any Updates" ON storage.objects;

-- 4. Create OPEN policies (for debugging/MVP)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

CREATE POLICY "Any Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' );

CREATE POLICY "Any Updates"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'images' );
