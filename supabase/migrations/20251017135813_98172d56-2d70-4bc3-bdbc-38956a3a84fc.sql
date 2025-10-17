-- Storage policies for passports bucket to fix registration uploads
-- Create SELECT policy for public reads (safe due to public bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public read for passports bucket'
  ) THEN
    CREATE POLICY "Public read for passports bucket"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'passports');
  END IF;
END $$;

-- Allow authenticated users to upload (INSERT) into the passports bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Authenticated can upload to passports bucket'
  ) THEN
    CREATE POLICY "Authenticated can upload to passports bucket"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'passports');
  END IF;
END $$;