
CREATE TABLE public.landing_images (
  slot TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.landing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view landing images"
ON public.landing_images FOR SELECT
USING (true);

CREATE POLICY "Admins can insert landing images"
ON public.landing_images FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update landing images"
ON public.landing_images FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete landing images"
ON public.landing_images FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-images', 'landing-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view landing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-images');

CREATE POLICY "Admins can upload landing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'landing-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update landing images storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'landing-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete landing images storage"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'landing-images' AND public.has_role(auth.uid(), 'admin'));
