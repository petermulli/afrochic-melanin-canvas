-- Create products table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] NOT NULL,
  shades TEXT[],
  featured BOOLEAN DEFAULT false,
  benefits TEXT[],
  ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (true);

-- Only admins can insert products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update products
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));