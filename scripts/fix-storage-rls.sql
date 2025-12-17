-- Run this SQL in your Supabase SQL Editor to fix the image upload RLS error

-- First, check if storage bucket exists and create policies

-- Allow anyone to upload images to the feedback-images bucket
-- (since customers submitting feedback are not authenticated)
CREATE POLICY "Allow public uploads to feedback-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'feedback-images');

-- Allow anyone to read images (for signed URLs to work)
CREATE POLICY "Allow public read access to feedback-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'feedback-images');

-- If the above gives errors about policies already existing, try these instead:

-- DROP POLICY IF EXISTS "Allow public uploads to feedback-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public read access to feedback-images" ON storage.objects;

-- Then run the CREATE POLICY statements again

-- Alternative: If you want only authenticated users to upload, use this instead:
-- CREATE POLICY "Allow authenticated uploads to feedback-images"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'feedback-images');
