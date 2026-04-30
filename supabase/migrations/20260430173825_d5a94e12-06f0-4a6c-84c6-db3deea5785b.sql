ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS size_ml integer,
  ADD COLUMN IF NOT EXISTS location text;