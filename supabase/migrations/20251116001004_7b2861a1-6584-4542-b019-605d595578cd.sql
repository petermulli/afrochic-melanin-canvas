-- Create inventory table to track product stock levels
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  reorder_quantity INTEGER NOT NULL DEFAULT 50,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory movements table to track stock changes
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory table
CREATE POLICY "Admins can view inventory"
ON public.inventory
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert inventory"
ON public.inventory
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inventory"
ON public.inventory
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete inventory"
ON public.inventory
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for inventory_movements table
CREATE POLICY "Admins can view inventory movements"
ON public.inventory_movements
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert inventory movements"
ON public.inventory_movements
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at column
CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create inventory movement and update inventory
CREATE OR REPLACE FUNCTION public.update_inventory_stock(
  _product_id TEXT,
  _movement_type TEXT,
  _quantity INTEGER,
  _notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert movement record
  INSERT INTO public.inventory_movements (product_id, movement_type, quantity, notes, user_id)
  VALUES (_product_id, _movement_type, _quantity, _notes, auth.uid());
  
  -- Update inventory quantity
  IF _movement_type = 'in' OR _movement_type = 'adjustment' THEN
    UPDATE public.inventory
    SET quantity = quantity + _quantity
    WHERE product_id = _product_id;
  ELSIF _movement_type = 'out' THEN
    UPDATE public.inventory
    SET quantity = GREATEST(0, quantity - _quantity)
    WHERE product_id = _product_id;
  END IF;
END;
$$;