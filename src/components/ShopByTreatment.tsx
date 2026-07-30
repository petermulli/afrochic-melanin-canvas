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
  image_url_2: string | null;
  sort_order: number;
  is_active: boolean;
}

const FALLBACK = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200&h=900&fit=crop";

const TreatmentTile = ({ t, i, onClick }: { t: Treatment; i: number; onClick: () => void }) => {
  const images = [t.image_url || FALLBACK, t.image_url_2].filter(Boolean) as string[];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % images.length), 3500 + i * 400);
    return () => clearInterval(id);
  }, [images.length, i]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06, duration: 0.5 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl aspect-square w-full cursor-pointer"
    >
      {images.map((src, idx) => (
        <img
          key={src + idx}
          src={src}
          alt={t.label}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${
            idx === active ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      ))}
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
  );
};

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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {treatments.map((t, i) => (
            <TreatmentTile
              key={t.id}
              t={t}
              i={i}
              onClick={() => navigate(`/products?treatment=${encodeURIComponent(t.query)}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByTreatment;
