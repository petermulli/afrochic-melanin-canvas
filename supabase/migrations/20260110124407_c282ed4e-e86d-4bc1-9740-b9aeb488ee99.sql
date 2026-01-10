-- Create waitlist table for product requests
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  skin_description TEXT,
  product_requested TEXT NOT NULL,
  is_served BOOLEAN NOT NULL DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert into waitlist (for visitors)
CREATE POLICY "Anyone can insert into waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (true);

-- Admins can view all waitlist entries
CREATE POLICY "Admins can view waitlist"
ON public.waitlist
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update waitlist entries
CREATE POLICY "Admins can update waitlist"
ON public.waitlist
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete waitlist entries
CREATE POLICY "Admins can delete waitlist"
ON public.waitlist
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_waitlist_updated_at
BEFORE UPDATE ON public.waitlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for waitlist
ALTER PUBLICATION supabase_realtime ADD TABLE public.waitlist;