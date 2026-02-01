-- Add new fields to seller_applications table for enhanced registration
ALTER TABLE public.seller_applications 
ADD COLUMN IF NOT EXISTS shop_name text,
ADD COLUMN IF NOT EXISTS national_id text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS address_line text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS map_coordinates jsonb;

-- Add new fields to seller_profiles table
ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS shop_name text,
ADD COLUMN IF NOT EXISTS national_id text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address_line text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS map_coordinates jsonb,
ADD COLUMN IF NOT EXISTS is_profile_complete boolean DEFAULT false;

-- Add brand column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand text;

-- Create index for brand search and alphabetical sorting
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_brand_category_name ON public.products(brand, category, name);

-- Update existing seller_profiles to have complete profile if they have business_name
UPDATE public.seller_profiles 
SET is_profile_complete = true 
WHERE business_name IS NOT NULL;