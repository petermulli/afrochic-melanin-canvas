import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import MarqueeStrip from "@/components/MarqueeStrip";
import BestSellersSection from "@/components/BestSellersSection";
import NewProductsSection from "@/components/NewProductsSection";
import SaleProductsSection from "@/components/SaleProductsSection";
import ShopByTreatment from "@/components/ShopByTreatment";
import CommunitySection from "@/components/CommunitySection";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import TrustBanner from "@/components/TrustBanner";
import SafetyCheck from "@/components/SafetyCheck";
import HeroSearch from "@/components/HeroSearch";
import FeaturedCollections from "@/components/FeaturedCollections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Store, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useLandingImages } from "@/hooks/useLandingImages";
import { useLandingContent } from "@/hooks/useLandingContent";

const Index = () => {
  const navigate = useNavigate();
  const { images } = useLandingImages();
  const { get } = useLandingContent();

  const slideImg = (key: string, fallback: string) => images[key] || fallback;

  const [safetyQuery, setSafetyQuery] = useState("");

  const runSafetySearch = (t: string) => {
    setSafetyQuery(t);
    setTimeout(() => {
      document.getElementById("safety-check")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Welcome! Check your inbox for exclusive offers.");
    setEmail("");
    setIsSubmitting(false);
  };

  // Hero
  const heroHeadline = get("hero", "headline", "Your Skin.\nYour Glow.");
  const heroSubtext = get("hero", "subtext", "Premium skincare crafted for melanin-rich beauty. Discover products that actually work.");
  const heroCta = get("hero", "cta", "Shop Now");
  const heroCtaLink = get("hero", "ctaLink", "/products");
  const heroSecondaryCta = get("hero", "secondaryCta", "Browse All");
  const heroSecondaryCtaLink = get("hero", "secondaryCtaLink", "/products");
  const heroAccent = get("hero", "accent", "Best Sellers");
  const heroUrgency = get("hero", "urgency", "Trending this week");
  const heroImage = slideImg("hero_1", "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1920&h=1080&fit=crop");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="relative h-[88vh] md:h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={heroHeadline}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/60 to-foreground/75" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-5 md:space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-stretch overflow-hidden rounded-full text-[10px] sm:text-xs font-medium tracking-wide shadow-sm backdrop-blur-sm"
              >
                <span className="bg-background/95 text-foreground px-4 py-2">{heroUrgency}</span>
                <span className="bg-primary text-primary-foreground uppercase tracking-[0.2em] px-4 py-2">
                  {heroAccent}
                </span>
              </motion.div>

              <h1 className="font-display text-background whitespace-pre-line text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[6.5rem] font-medium leading-[0.95] tracking-[-0.05em]">
                {heroHeadline}
              </h1>

              <p className="text-base md:text-lg text-background/90 max-w-xl mx-auto leading-relaxed font-display font-normal tracking-[-0.005em]">
                {heroSubtext}
              </p>

              <div className="w-full flex justify-center">
                <HeroSearch onSearch={runSafetySearch} />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">

                <Button
                  size="lg"
                  onClick={() => navigate(heroCtaLink)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 sm:px-10 py-6 text-sm uppercase tracking-[0.2em] font-semibold rounded-full shadow-lg group"
                >
                  {heroCta}
                  <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(heroSecondaryCtaLink)}
                  className="bg-background text-foreground border-2 border-background hover:bg-background/90 hover:text-foreground rounded-full px-8 py-6 text-sm uppercase tracking-[0.2em] font-semibold"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {heroSecondaryCta}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ===== PRODUCT SAFETY CHECK ===== */}
      <SafetyCheck externalQuery={safetyQuery} />

      {/* ===== TRUST BANNER ===== */}
      <TrustBanner />

      {/* ===== SHOP BY TREATMENT ===== */}
      <ShopByTreatment />

      {/* ===== MARQUEE STRIP 1 ===== */}
      <MarqueeStrip
        text={get("marquee_1", "text", "Free Shipping On Orders Over KES 5,000 • Same Day Delivery In Nairobi • Genuine Products Only")}
        className="bg-amber text-white"
        speed="25s"
      />

      {/* ===== BEST SELLERS ===== */}
      <BestSellersSection />

      {/* ===== FEATURED COLLECTIONS ===== */}
      <FeaturedCollections />

      {/* ===== NEW PRODUCTS ===== */}
      <NewProductsSection />

      {/* ===== SKIN ROUTINE CTA ===== */}
      <section className="grid md:grid-cols-2 min-h-[500px]">
        <div className="relative overflow-hidden">
          <img
            src={slideImg("routine_cta", "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=800&fit=crop")}
            alt="Skincare routine"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block bg-fire-red text-white text-[10px] uppercase tracking-wider px-3 py-1 font-bold mb-2">
              {get("routine_cta", "badge", "Most Popular")}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 md:p-16 bg-muted">
          <motion.div
            className="max-w-md space-y-6 text-center md:text-left"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {get("routine_cta", "eyebrow", "Build Your Routine")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif">
              {get("routine_cta", "headline", "Not Sure Where To Start?")}
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {get("routine_cta", "subtext", "Our best-selling bundles are hand-picked by skincare experts. Start with a complete routine and see results in as little as 2 weeks. Over 500+ happy customers this month alone.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => navigate(get("routine_cta", "ctaLink", "/products?featured=true"))}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold"
              >
                {get("routine_cta", "cta", "Shop Bestsellers")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SALE PRODUCTS ===== */}
      <SaleProductsSection />

      {/* ===== MARQUEE STRIP 2 ===== */}
      <MarqueeStrip
        text={get("marquee_2", "text", "Trusted By 10,000+ Customers • 100% Genuine Products • Expert-Curated Selection")}
        className="bg-deep-red text-white"
        speed="30s"
      />

      {/* ===== REVIEWS ===== */}
      <div id="reviews">
        <ReviewsCarousel />
      </div>

      {/* ===== URGENCY CTA BANNER ===== */}
      <section className="py-10 md:py-12 bg-golden">
        <div className="container mx-auto">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-light tracking-tight text-foreground mb-1">
                {get("urgency_banner", "headline", "Don't miss out — limited stock available")}
              </h3>
              <p className="text-foreground/70 text-sm">
                {get("urgency_banner", "subtext", "Our most popular products sell out fast. Add to cart before they're gone.")}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate(get("urgency_banner", "ctaLink", "/products"))}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 md:px-10 py-6 uppercase tracking-[0.2em] text-xs sm:text-sm font-semibold whitespace-nowrap group"
            >
              {get("urgency_banner", "cta", "Shop Now")}
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== BRAND STORY ===== */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={slideImg("brand_story", "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&h=800&fit=crop")}
            alt="Our approach"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/85" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
              {get("brand_story", "eyebrow", "Why Kenyashipment")}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-background leading-tight">
              {get("brand_story", "headline", "Skincare That Actually Works For You")}
            </h2>
            <p className="text-background/70 leading-relaxed max-w-xl mx-auto text-lg whitespace-pre-line">
              {get("brand_story", "subtext", "Every product on our marketplace is vetted by experts and loved by real customers. We connect you with trusted sellers who understand melanin-rich skin — so you can shop with confidence.")}
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {get("brand_story", `stat${n}_value`, n === 1 ? "10K+" : n === 2 ? "100%" : "4.9")}
                  </p>
                  <p className="text-xs text-background/60 uppercase tracking-wider mt-1">
                    {get("brand_story", `stat${n}_label`, n === 1 ? "Happy Customers" : n === 2 ? "Genuine Products" : "Average Rating")}
                  </p>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              onClick={() => navigate(get("brand_story", "ctaLink", "/products"))}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold"
            >
              {get("brand_story", "cta", "Start Shopping")}
              <ArrowRight className="ml-3 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== COMMUNITY ===== */}
      <CommunitySection />

      {/* ===== NEWSLETTER ===== */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-2xl mx-auto text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif">
              {get("newsletter", "headline", "Get 10% Off Your First Order")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto whitespace-pre-line">
              {get("newsletter", "subtext", "Subscribe and get exclusive access to new arrivals, flash sales, and skincare tips crafted for your skin. Plus 10% off your first purchase.")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 rounded-none border-2 border-foreground/20 focus:border-primary bg-background"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-8 rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-xs font-bold"
              >
                {isSubmitting ? "Joining..." : get("newsletter", "cta", "Get 10% Off")}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              {get("newsletter", "footnote", "Join 5,000+ subscribers. Unsubscribe anytime.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== BECOME A SELLER CTA ===== */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-golden/30 mb-2">
              <Store className="h-7 w-7 text-golden" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-primary-foreground">
              {get("seller_cta", "headline", "Have Products to Sell?")}
            </h2>
            <p className="text-primary-foreground/60 max-w-lg mx-auto whitespace-pre-line">
              {get("seller_cta", "subtext", "Join our marketplace and reach thousands of customers across Kenya. Open your shop on Kenyashipment today.")}
            </p>
            <Button
              size="lg"
              onClick={() => navigate(get("seller_cta", "ctaLink", "/become-seller"))}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold group"
            >
              {get("seller_cta", "cta", "Become a Seller")}
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
