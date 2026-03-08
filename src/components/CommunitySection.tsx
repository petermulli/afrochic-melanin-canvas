import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Gift, Star, ArrowRight, Crown } from "lucide-react";

const CommunitySection = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: Gift, title: "Exclusive Discounts", description: "Members-only prices and early access to sales" },
    { icon: Star, title: "Reward Points", description: "Earn points on every purchase, redeem for products" },
    { icon: Crown, title: "VIP Access", description: "First look at new arrivals and limited editions" },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold block">
                Join The Movement
              </span>
              <h2 className="font-serif">
                The Glow<br />
                <span className="italic">Collective</span>
              </h2>
              <p className="text-muted-foreground max-w-lg text-base">
                Members save more — exclusive discounts all year, plus surprise gifts and VIP perks.
                Join thousands who trust Kenyashipment for their skincare journey.
              </p>
            </div>

            <div className="grid gap-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-background border border-border"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-foreground">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => navigate("/community")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 uppercase tracking-widest text-xs font-bold group"
            >
              Join Now
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative aspect-square max-w-md mx-auto overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=600&h=600&fit=crop&crop=face"
                alt="Community member"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-background">
                <p className="text-4xl md:text-5xl font-serif font-bold">10K+</p>
                <p className="text-xs uppercase tracking-widest">Happy Members</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
