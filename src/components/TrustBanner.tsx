import { Truck, Shield, RefreshCw, HeadphonesIcon } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Truck,
    title: "Free Shipping",
    subtitle: "On orders over KES 5,000",
  },
  {
    icon: Shield,
    title: "100% Genuine",
    subtitle: "Verified products only",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    subtitle: "30-day return policy",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    subtitle: "We're here to help",
  },
];

const TrustBanner = () => {
  return (
    <section className="py-6 md:py-8 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 justify-center"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber/15 flex items-center justify-center">
                <b.icon className="h-5 w-5 text-amber" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{b.title}</p>
                <p className="text-[11px] text-muted-foreground">{b.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
