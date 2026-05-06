import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLandingContent } from "@/hooks/useLandingContent";

interface Treatment {
  id: string;
  label: string;
  query: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const FALLBACK = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=800&fit=crop";

const ShopByTreatment = () => {
  const navigate = useNavigate();
  const { get } = useLandingContent();
  const [treatments, setTreatments] = useState<Treatment[]>([]);

  useEffect(() => {
    supabase
      .from("treatments")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(4)
      .then(({ data }) => setTreatments((data ?? []) as Treatment[]));
  }, []);

  if (!treatments.length) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
            {get("shop_by_treatment", "eyebrow", "Targeted Solutions")}
          </p>
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-4">
            {get("shop_by_treatment", "headline", "Shop by Treatment")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            {get("shop_by_treatment", "subtext", "Find the perfect products for your specific skin concerns")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {treatments.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              onClick={() =>
                navigate(`/products?treatment=${encodeURIComponent(t.query)}`)
              }
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
            >
              <img
                src={t.image_url || FALLBACK}
                alt={t.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 px-3">
                <span className="text-white text-sm md:text-base font-semibold tracking-wide drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  {t.label}
                </span>
                <span className="text-white/0 group-hover:text-white/80 text-xs mt-1 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  Shop Now →
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByTreatment;
