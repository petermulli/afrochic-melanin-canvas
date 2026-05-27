import { Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useLandingContent } from "@/hooks/useLandingContent";
import { getLandingIcon } from "@/lib/landingIcons";

const TrustBanner = () => {
  const { get } = useLandingContent();

  const benefits = [
    { iconKey: get("trust_banner", "icon1", "truck"), title: get("trust_banner", "title1", "Free Shipping"), subtitle: get("trust_banner", "subtitle1", "On orders over KES 5,000") },
    { iconKey: get("trust_banner", "icon2", "shield"), title: get("trust_banner", "title2", "100% Genuine"), subtitle: get("trust_banner", "subtitle2", "Verified products only") },
    { iconKey: get("trust_banner", "icon3", "refresh"), title: get("trust_banner", "title3", "Easy Returns"), subtitle: get("trust_banner", "subtitle3", "30-day return policy") },
    { iconKey: get("trust_banner", "icon4", "headphones"), title: get("trust_banner", "title4", "24/7 Support"), subtitle: get("trust_banner", "subtitle4", "We're here to help") },
  ];

  return (
    <section className="py-6 md:py-8 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {benefits.map((b, i) => {
            const Icon = getLandingIcon(b.iconKey, Truck);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 justify-center"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber/15 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-amber" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">{b.title}</p>
                  <p className="text-[11px] text-muted-foreground">{b.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
