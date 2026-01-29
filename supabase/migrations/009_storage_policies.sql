-- ============================================
-- STORAGE POLICIES FOR RECEIPTS
-- ============================================

-- Enable RLS on objects if not already enabled (standard for storage)
-- Note: 'storage.objects' RLS is usually enabled by default on Supabase

-- Policy to allow Users to SELECT (View) their own receipts
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' 
  AND auth.uid() = owner
);

-- Policy to allow Users to UPLOAD (Insert) their own receipts
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' 
  AND auth.uid() = owner
);

-- Policy to allow Users to UPDATE their own receipts
CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'receipts' 
  AND auth.uid() = owner
);

-- Policy to allow Users to DELETE their own receipts
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' 
  AND auth.uid() = owner
);
