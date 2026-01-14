-- Add status column to products table for approval workflow
ALTER TABLE public.products 
ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add admin_notes column for rejection reasons
ALTER TABLE public.products 
ADD COLUMN admin_notes text;

-- Update existing products to be approved (they were added before approval system)
UPDATE public.products SET status = 'approved' WHERE status = 'pending';

-- Create index for faster status queries
CREATE INDEX idx_products_status ON public.products(status);