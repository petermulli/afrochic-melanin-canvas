import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const collections = [
  {
    title: "Glow-Up Essentials",
    description: "Everything you need for radiant, even-toned skin",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=700&fit=crop",
    link: "/products?group=skincare",
    tag: "Popular",
  },
  {
    title: "Sun Protection",
    description: "No white cast. No greasiness. Just protection.",
    image: "https://images.unsplash.com/photo-1532947974358-a218d12a0537?w=600&h=700&fit=crop",
    link: "/products?group=sunprotection",
    tag: "Essential",
  },
  {
    title: "Hair Care Heroes",
    description: "Nourish, strengthen, and style with confidence",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=700&fit=crop",
    link: "/products?group=haircare",
    tag: "Trending",
  },
];

const FeaturedCollections = () => {
  const navigate = useNavigate();

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
            Curated For You
          </span>
          <h2 className="font-serif">Shop Collections</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {collections.map((col, i) => (
            <motion.div
              key={col.title}
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
              
              {/* Tag */}
              <div className="absolute top-4 left-4">
                <span className="bg-golden text-foreground text-[10px] uppercase tracking-wider px-3 py-1 font-bold">
                  {col.tag}
                </span>
              </div>

              {/* Content */}
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
