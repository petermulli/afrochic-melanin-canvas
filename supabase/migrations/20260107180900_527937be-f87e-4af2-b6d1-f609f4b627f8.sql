-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Sellers can view orders with their products" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view order items for their products" ON public.order_items;

-- Create a security definer function to check if a seller owns any product in an order
CREATE OR REPLACE FUNCTION public.seller_has_product_in_order(_order_id uuid, _seller_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = _order_id
    AND p.seller_id = _seller_id
  )
$$;

-- Create a security definer function to check if a seller owns a specific product
CREATE OR REPLACE FUNCTION public.seller_owns_product(_product_id text, _seller_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.products
    WHERE id = _product_id
    AND seller_id = _seller_id
  )
$$;

-- Recreate the sellers policies using the security definer functions
CREATE POLICY "Sellers can view orders with their products" 
ON public.orders 
FOR SELECT 
USING (public.seller_has_product_in_order(id, auth.uid()));

CREATE POLICY "Sellers can view order items for their products" 
ON public.order_items 
FOR SELECT 
USING (public.seller_owns_product(product_id, auth.uid()));