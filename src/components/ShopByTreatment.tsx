import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const treatments = [
  {
    label: "Dark Spots",
    query: "dark spots",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=400&fit=crop",
  },
  {
    label: "Acne",
    query: "acne",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
  },
  {
    label: "Dry Skin",
    query: "dry skin",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop",
  },
  {
    label: "Oily Skin",
    query: "oily skin",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop",
  },
  {
    label: "Wrinkles",
    query: "wrinkles",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=400&fit=crop",
  },
  {
    label: "Uneven Tone",
    query: "uneven tone",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop",
  },
  {
    label: "Sensitivity",
    query: "sensitivity",
    image: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&h=400&fit=crop",
  },
  {
    label: "Sun Damage",
    query: "sun damage",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
];

const ShopByTreatment = () => {
  const navigate = useNavigate();

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
            Targeted Solutions
          </p>
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-4">
            Shop by Treatment
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Find the perfect products for your specific skin concerns
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {treatments.map((t, i) => (
            <motion.button
              key={t.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              onClick={() =>
                navigate(
                  `/products?treatment=${encodeURIComponent(t.query)}`
                )
              }
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
            >
              {/* Background image */}
              <img
                src={t.image}
                alt={t.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80" />

              {/* Text */}
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
