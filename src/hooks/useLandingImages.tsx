import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useLandingImages = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("landing_images")
      .select("slot, image_url")
      .then(({ data }) => {
        if (!active) return;
        setImages(Object.fromEntries((data ?? []).map((r) => [r.slot, r.image_url])));
        setLoaded(true);
      });
    return () => { active = false; };
  }, []);

  return { images, loaded };
};
