-- Create the app_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('student', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Recreate the create_admin_user function with proper type handling
CREATE OR REPLACE FUNCTION public.create_admin_user(
  _email text,
  _password text,
  _full_name text,
  _permissions text[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _user_id uuid;
  _result json;
BEGIN
  -- Check if the caller is a super admin
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only super admins can create admin users';
  END IF;

  -- Create the auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    _email,
    extensions.crypt(_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', _full_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO _user_id;

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (_user_id, _email, _full_name);

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::public.app_role);

  -- Assign permissions
  INSERT INTO public.admin_permissions (admin_user_id, menu_item, created_by)
  SELECT _user_id, unnest(_permissions), auth.uid();

  -- Return success
  _result := json_build_object(
    'success', true,
    'user_id', _user_id,
    'message', 'Admin user created successfully'
  );

  RETURN _result;
END;
$$;