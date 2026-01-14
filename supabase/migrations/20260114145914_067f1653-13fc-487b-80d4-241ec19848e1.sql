-- Create approved_products table for admin-approved product catalog
CREATE TABLE public.approved_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  ingredients text[] DEFAULT '{}',
  skin_types text[] DEFAULT '{}',
  treats text[] DEFAULT '{}',
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

-- Enable RLS
ALTER TABLE public.approved_products ENABLE ROW LEVEL SECURITY;

-- Policies for approved_products
CREATE POLICY "Anyone can view approved products"
ON public.approved_products
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert approved products"
ON public.approved_products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update approved products"
ON public.approved_products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete approved products"
ON public.approved_products
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_approved_products_updated_at
  BEFORE UPDATE ON public.approved_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();