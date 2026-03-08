
-- Create product_recommendations table for admin-managed cross-sell
CREATE TABLE public.product_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  recommended_product_id text NOT NULL,
  incentive_text text DEFAULT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  UNIQUE(product_id, recommended_product_id)
);

-- Enable RLS
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

-- Everyone can view recommendations
CREATE POLICY "Anyone can view recommendations"
  ON public.product_recommendations FOR SELECT
  USING (true);

-- Admins can manage recommendations
CREATE POLICY "Admins can insert recommendations"
  ON public.product_recommendations FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update recommendations"
  ON public.product_recommendations FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete recommendations"
  ON public.product_recommendations FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
