import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Gift, Star, ArrowRight, Crown } from "lucide-react";

const CommunitySection = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Gift,
      title: "Exclusive Discounts",
      description: "Members-only prices and early access to sales",
    },
    {
      icon: Star,
      title: "Reward Points",
      description: "Earn points on every purchase, redeem for products",
    },
    {
      icon: Crown,
      title: "VIP Access",
      description: "First look at new arrivals and limited editions",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm uppercase tracking-[0.3em] text-primary block">
                Join The Movement
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight">
                Become a Member of<br />
                <span className="italic">The Glow Community</span>
              </h2>
              <p className="text-muted-foreground max-w-lg text-lg">
                Join thousands of beauty enthusiasts who trust Kenyashipment for their skincare journey. 
                Unlock exclusive benefits and be part of our growing family.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="rounded-none px-10 py-6 uppercase tracking-widest text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all group"
            >
              Join the Community
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Right side - Visual */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Decorative circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-primary/20 animate-pulse" />
              </div>
              <div className="absolute inset-8 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-primary/30" />
              </div>
              <div className="absolute inset-16 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <p className="text-5xl md:text-6xl font-serif font-bold text-primary">10K+</p>
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">Happy Members</p>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute top-4 right-4 bg-background shadow-lg rounded-full px-4 py-2 flex items-center gap-2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-medium">4.9 Rating</span>
              </motion.div>

              <motion.div
                className="absolute bottom-8 left-0 bg-background shadow-lg rounded-full px-4 py-2 flex items-center gap-2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Gift className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Free Shipping</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
