import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ContentMap = Record<string, Record<string, any>>;

export const useLandingContent = () => {
  const [content, setContent] = useState<ContentMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("landing_content")
      .select("slot, content")
      .then(({ data }) => {
        if (!active) return;
        setContent(Object.fromEntries((data ?? []).map((r: any) => [r.slot, r.content])));
        setLoaded(true);
      });
    return () => { active = false; };
  }, []);

  // Helper: get a field with a fallback
  const get = (slot: string, key: string, fallback: string): string => {
    const v = content[slot]?.[key];
    return typeof v === "string" && v.length ? v : fallback;
  };

  return { content, get, loaded };
};
