
-- 1. seller_profiles: hide national_id from anon/authenticated via column-level grants
REVOKE SELECT ON public.seller_profiles FROM anon, authenticated;
GRANT SELECT (
  id, user_id, business_name, shop_name, business_description,
  phone, email, city, address_line, map_coordinates,
  rating, total_ratings, is_profile_complete, created_at, updated_at
) ON public.seller_profiles TO anon, authenticated;
-- national_id intentionally excluded; only service_role can read it

-- 2. product-images bucket: drop overly permissive "any authenticated user can upload"
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
-- Existing "Sellers can upload product images" and "Admins can upload product images" remain

-- 3. user_roles: prevent privilege escalation - only superadmin can grant admin role
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert non-admin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND (
    role <> 'admin'::app_role
    OR public.is_superadmin(auth.uid())
  )
);

-- Same restriction on DELETE so admins can't strip a superadmin's role either (already partly handled)
-- Existing "Admins can delete user roles" already excludes superadmins, leave as is.

-- 4. waitlist: remove from realtime publication to stop broadcasting PII
ALTER PUBLICATION supabase_realtime DROP TABLE public.waitlist;
