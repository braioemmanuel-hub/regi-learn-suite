-- Create admin_permissions table to track menu access for admins
CREATE TABLE public.admin_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(admin_user_id, menu_item)
);

-- Enable RLS on admin_permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all permissions
CREATE POLICY "Super admins can manage all permissions"
ON public.admin_permissions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can view their own permissions
CREATE POLICY "Admins can view their own permissions"
ON public.admin_permissions
FOR SELECT
USING (auth.uid() = admin_user_id);

-- Update user_roles policies to allow super admin to create admin roles
CREATE POLICY "Super admins can create admin roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) AND role IN ('admin'::app_role));

-- Super admins can delete admin roles
CREATE POLICY "Super admins can delete admin roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));