-- Add seller_id column to products table to track who listed each product
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id);

-- Create index for faster seller product lookups
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);

-- Update RLS policy to allow sellers to insert their own products
CREATE POLICY "Sellers can insert own products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'seller'::app_role) AND 
  auth.uid() = seller_id
);

-- Allow sellers to update their own products
CREATE POLICY "Sellers can update own products" 
ON public.products 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'seller'::app_role) AND 
  auth.uid() = seller_id
);

-- Allow sellers to delete their own products
CREATE POLICY "Sellers can delete own products" 
ON public.products 
FOR DELETE 
USING (
  has_role(auth.uid(), 'seller'::app_role) AND 
  auth.uid() = seller_id
);

-- Update storage policy to allow sellers to upload product images
CREATE POLICY "Sellers can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND 
  has_role(auth.uid(), 'seller'::app_role)
);

-- Allow sellers to delete their uploaded images
CREATE POLICY "Sellers can delete own product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' AND 
  has_role(auth.uid(), 'seller'::app_role)
);