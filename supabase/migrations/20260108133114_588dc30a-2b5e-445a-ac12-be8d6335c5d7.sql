-- Drop existing seller-related policies on products
DROP POLICY IF EXISTS "Approved sellers can delete own products" ON public.products;
DROP POLICY IF EXISTS "Approved sellers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Approved sellers can update own products" ON public.products;

-- Create new policies that allow any authenticated user to manage their own products
CREATE POLICY "Users can insert own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = seller_id);