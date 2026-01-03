-- Add seller and buyer roles to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'seller';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'buyer';