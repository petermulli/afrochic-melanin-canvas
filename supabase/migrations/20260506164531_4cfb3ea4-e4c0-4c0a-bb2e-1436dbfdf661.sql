
CREATE TABLE public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  query text NOT NULL,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view treatments" ON public.treatments FOR SELECT USING (true);
CREATE POLICY "Admins can insert treatments" ON public.treatments FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update treatments" ON public.treatments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete treatments" ON public.treatments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_treatments_updated_at
BEFORE UPDATE ON public.treatments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.treatments (label, query, image_url, sort_order) VALUES
('Dark Spots', 'dark spots', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=800&fit=crop', 1),
('Acne', 'acne', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=800&fit=crop', 2),
('Dry Skin', 'dry skin', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=800&fit=crop', 3),
('Wrinkles', 'wrinkles', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=800&fit=crop', 4);
