-- Create seller_applications table for verification workflow
CREATE TABLE public.seller_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_description text,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create seller_profiles table for approved sellers
CREATE TABLE public.seller_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name text NOT NULL,
  business_description text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_ratings integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for seller_applications
CREATE POLICY "Users can insert own application" ON public.seller_applications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own application" ON public.seller_applications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON public.seller_applications
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications" ON public.seller_applications
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- RLS policies for seller_profiles
CREATE POLICY "Anyone can view seller profiles" ON public.seller_profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.seller_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert seller profiles" ON public.seller_profiles
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update seller profiles" ON public.seller_profiles
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_seller_applications_updated_at
BEFORE UPDATE ON public.seller_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_profiles_updated_at
BEFORE UPDATE ON public.seller_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user is an approved seller
CREATE OR REPLACE FUNCTION public.is_approved_seller(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.seller_profiles
    WHERE user_id = _user_id
  )
$$;

-- Update products RLS to only allow approved sellers
DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;

CREATE POLICY "Approved sellers can insert own products" ON public.products
FOR INSERT WITH CHECK (
  is_approved_seller(auth.uid()) AND auth.uid() = seller_id
);

CREATE POLICY "Approved sellers can update own products" ON public.products
FOR UPDATE USING (
  is_approved_seller(auth.uid()) AND auth.uid() = seller_id
);

CREATE POLICY "Approved sellers can delete own products" ON public.products
FOR DELETE USING (
  is_approved_seller(auth.uid()) AND auth.uid() = seller_id
);

-- RLS policy for sellers to view order items containing their products
CREATE POLICY "Sellers can view order items for their products" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = order_items.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- RLS policy for sellers to view orders containing their products
CREATE POLICY "Sellers can view orders with their products" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
  )
);