-- Fix security warning: Add search_path to generate_student_id function
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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