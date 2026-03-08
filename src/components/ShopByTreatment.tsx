import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const treatments = [
  {
    label: "Dark Spots",
    query: "dark spots",
    icon: "✨",
    color: "from-amber-500/20 to-amber-600/10",
  },
  {
    label: "Acne",
    query: "acne",
    icon: "🧴",
    color: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    label: "Dry Skin",
    query: "dry skin",
    icon: "💧",
    color: "from-sky-500/20 to-sky-600/10",
  },
  {
    label: "Oily Skin",
    query: "oily skin",
    icon: "🌿",
    color: "from-lime-500/20 to-lime-600/10",
  },
  {
    label: "Wrinkles",
    query: "wrinkles",
    icon: "🌸",
    color: "from-pink-500/20 to-pink-600/10",
  },
  {
    label: "Uneven Tone",
    query: "uneven tone",
    icon: "🎨",
    color: "from-violet-500/20 to-violet-600/10",
  },
  {
    label: "Sensitivity",
    query: "sensitivity",
    icon: "🛡️",
    color: "from-rose-500/20 to-rose-600/10",
  },
  {
    label: "Sun Damage",
    query: "sun damage",
    icon: "☀️",
    color: "from-orange-500/20 to-orange-600/10",
  },
];

const ShopByTreatment = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-3">
            Shop by Treatment
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Find targeted solutions for your skin concerns
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
          {treatments.map((t, i) => (
            <motion.button
              key={t.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/products?treatment=${encodeURIComponent(t.query)}`)}
              className={`group relative flex flex-col items-center justify-center gap-2 p-6 md:p-8 rounded-2xl bg-gradient-to-br ${t.color} border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300`}
            >
              <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                {t.icon}
              </span>
              <span className="text-sm md:text-base font-medium tracking-wide text-foreground/90 group-hover:text-foreground transition-colors">
                {t.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByTreatment;
