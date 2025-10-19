-- Create function to delete user (requires service role, will be called from client with RLS)
CREATE OR REPLACE FUNCTION delete_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete from auth.users (this will cascade to profiles if foreign key exists)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users (admin check will be in RLS)
GRANT EXECUTE ON FUNCTION delete_user(uuid) TO authenticated;

-- Add cascade delete to profiles if not exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;