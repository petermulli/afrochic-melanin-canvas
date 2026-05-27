import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLandingContent } from "@/hooks/useLandingContent";
import { useLandingImages } from "@/hooks/useLandingImages";

const FALLBACKS = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1614108974832-1543c0fbf90b?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop",
];

const FeaturedCollections = () => {
  const navigate = useNavigate();
  const { get } = useLandingContent();
  const { images } = useLandingImages();

  const eyebrow = get("featured_collections", "eyebrow", "Curated For You");
  const headline = get("featured_collections", "headline", "Shop Collections");

  const collections = [1, 2, 3].map((n) => ({
    title: get("featured_collections", `title${n}`, ["Glow-Up Essentials", "Sun Protection", "Hair Care Heroes"][n - 1]),
    description: get("featured_collections", `desc${n}`, ["Everything you need for radiant, even-toned skin", "No white cast. No greasiness. Just protection.", "Nourish, strengthen, and style with confidence"][n - 1]),
    tag: get("featured_collections", `tag${n}`, ["Popular", "Essential", "Trending"][n - 1]),
    link: get("featured_collections", `link${n}`, ["/products?group=skincare", "/products?group=sunprotection", "/products?group=haircare"][n - 1]),
    image: images[`collection_${n}`] || FALLBACKS[n - 1],
  }));

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-bold">
            {eyebrow}
          </span>
          <h2 className="font-serif">{headline}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {collections.map((col, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              onClick={() => navigate(col.link)}
              className="group cursor-pointer relative overflow-hidden aspect-[3/4]"
            >
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

              <div className="absolute top-4 left-4">
                <span className="bg-golden text-foreground text-[10px] uppercase tracking-wider px-3 py-1 font-bold">
                  {col.tag}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-serif text-background mb-2">{col.title}</h3>
                <p className="text-background/70 text-sm mb-4 leading-relaxed">{col.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-background/60 text-background hover:bg-background hover:text-foreground rounded-none uppercase tracking-widest text-[10px] font-bold group-hover:bg-background group-hover:text-foreground transition-all"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
