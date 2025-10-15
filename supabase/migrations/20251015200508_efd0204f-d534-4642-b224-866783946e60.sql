-- Create storage bucket for passport photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('passports', 'passports', true);

-- Storage policies for passport photos
CREATE POLICY "Users can upload their own passport"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'passports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own passport"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'passports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own passport"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'passports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all passports"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'passports' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Everyone can view public passports"
ON storage.objects
FOR SELECT
USING (bucket_id = 'passports');

-- Update RLS policies to allow students to create payment requests
CREATE POLICY "Students can create payment requests"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = student_id AND status = 'pending');

-- Update RLS to allow students to update their own payments (for uploading proof)
CREATE POLICY "Students can update their pending payments"
ON public.payments
FOR UPDATE
USING (auth.uid() = student_id AND status = 'pending');