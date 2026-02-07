-- Add category column to community_posts
ALTER TABLE public.community_posts 
ADD COLUMN category text DEFAULT 'general';

-- Add repost columns to community_posts
ALTER TABLE public.community_posts 
ADD COLUMN repost_of uuid REFERENCES public.community_posts(id) ON DELETE SET NULL,
ADD COLUMN quote_content text,
ADD COLUMN reposts_count integer NOT NULL DEFAULT 0;

-- Create index for faster category filtering
CREATE INDEX idx_community_posts_category ON public.community_posts(category);

-- Create index for reposts
CREATE INDEX idx_community_posts_repost_of ON public.community_posts(repost_of);

-- Create function to update reposts count
CREATE OR REPLACE FUNCTION public.update_post_reposts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.repost_of IS NOT NULL THEN
    UPDATE public.community_posts SET reposts_count = reposts_count + 1 WHERE id = NEW.repost_of;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.repost_of IS NOT NULL THEN
    UPDATE public.community_posts SET reposts_count = GREATEST(0, reposts_count - 1) WHERE id = OLD.repost_of;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for repost count
CREATE TRIGGER update_reposts_count
AFTER INSERT OR DELETE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_post_reposts_count();