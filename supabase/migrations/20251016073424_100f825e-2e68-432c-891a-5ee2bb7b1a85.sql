-- Add comprehensive fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS surname text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state_of_origin text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lga text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS religion text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_unique_id text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_approved boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS proposed_course text;

-- Add next of kin relationship and email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_of_kin_relationship text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_of_kin_email text;

-- Create registration documents table
CREATE TABLE IF NOT EXISTS public.registration_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ssce_result text,
  birth_certificate text,
  state_of_origin_cert text,
  passport_photo text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.registration_documents ENABLE ROW LEVEL SECURITY;

-- RLS for registration documents
CREATE POLICY "Students can view their own registration documents"
ON public.registration_documents FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all registration documents"
ON public.registration_documents FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can insert their own registration documents"
ON public.registration_documents FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can manage all registration documents"
ON public.registration_documents FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add registration payment proof field to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_proof text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS is_registration_payment boolean DEFAULT false;

-- Function to generate unique student ID
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_id text;
  id_exists boolean;
BEGIN
  LOOP
    -- Generate ID in format: STU + year + random 6 digits
    new_id := 'STU' || EXTRACT(YEAR FROM NOW())::text || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE student_unique_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Add approved_by and approved_at columns to track who approved
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Update payments RLS to allow students to insert registration payments
DROP POLICY IF EXISTS "Students can create payment requests" ON public.payments;
CREATE POLICY "Students can create payment requests"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Add policy for admins to manage academic details
CREATE POLICY "Admins can insert academic details"
ON public.academic_details FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update timetable policies to allow admin edits
DROP POLICY IF EXISTS "Admins can manage timetable" ON public.timetable;
CREATE POLICY "Admins can manage timetable"
ON public.timetable FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update documents policies to allow admin uploads
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;
CREATE POLICY "Admins can manage all documents"
ON public.documents FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_unique_id ON public.profiles(student_unique_id);
CREATE INDEX IF NOT EXISTS idx_profiles_registration_approved ON public.profiles(registration_approved);