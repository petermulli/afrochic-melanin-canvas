
CREATE TABLE public.landing_content (
  slot text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view landing content" ON public.landing_content FOR SELECT USING (true);
CREATE POLICY "Admins can insert landing content" ON public.landing_content FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update landing content" ON public.landing_content FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete landing content" ON public.landing_content FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
