-- Add is_suspended and last_seen columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- Create admin_action_logs table for audit purposes
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_action_logs
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view all action logs"
ON public.admin_action_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert logs
CREATE POLICY "Admins can insert action logs"
ON public.admin_action_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create pending_admins table for admin invitations
CREATE TABLE IF NOT EXISTS public.pending_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on pending_admins
ALTER TABLE public.pending_admins ENABLE ROW LEVEL SECURITY;

-- Only admins can view pending admins
CREATE POLICY "Admins can view pending admins"
ON public.pending_admins
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert pending admins
CREATE POLICY "Admins can insert pending admins"
ON public.pending_admins
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete pending admins
CREATE POLICY "Admins can delete pending admins"
ON public.pending_admins
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update profiles (for suspension)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
    AND email = 'kenyashipment@gmail.com'
  )
$$;

-- Function to promote user to admin when they sign up with pending admin email
CREATE OR REPLACE FUNCTION public.check_pending_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_record RECORD;
BEGIN
  -- Check if the new user's email is in pending_admins
  SELECT * INTO pending_record FROM public.pending_admins WHERE email = NEW.email;
  
  IF FOUND THEN
    -- Add admin role to the user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Remove from pending_admins
    DELETE FROM public.pending_admins WHERE email = NEW.email;
  END IF;
  
  -- Auto-promote superadmin
  IF NEW.email = 'kenyashipment@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check pending admin on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_check_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_check_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_pending_admin();

-- Allow admins to insert user_roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user roles (but not superadmin's)
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND NOT is_superadmin(user_id)
);

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));