
-- Allow sellers to insert recommendations for their own products
CREATE POLICY "Sellers can insert recommendations for own products"
ON public.product_recommendations
FOR INSERT
TO authenticated
WITH CHECK (
  seller_owns_product(product_id, auth.uid())
);

-- Allow sellers to delete recommendations for their own products
CREATE POLICY "Sellers can delete recommendations for own products"
ON public.product_recommendations
FOR DELETE
TO authenticated
USING (
  seller_owns_product(product_id, auth.uid())
);

-- Allow sellers to update recommendations for their own products
CREATE POLICY "Sellers can update recommendations for own products"
ON public.product_recommendations
FOR UPDATE
TO authenticated
USING (
  seller_owns_product(product_id, auth.uid())
);
