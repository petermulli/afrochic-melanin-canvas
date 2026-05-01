import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
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
import FeaturedCollections from "@/components/FeaturedCollections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ChevronLeft, ChevronRight, Mail, Store, Sparkles, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const heroSlides = [
  {
    headline: "Your Skin.\nYour Glow.",
    subtext: "Premium skincare crafted for melanin-rich beauty. Discover products that actually work.",
    cta: "Shop Now",
    ctaLink: "/products",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1920&h=1080&fit=crop",
    accent: "Best Sellers",
    urgency: "Trending this week",
  },
  {
    headline: "Fade Dark Spots.\nFast.",
    subtext: "Clinically inspired formulas with vitamin C and niacinamide to reveal your natural radiance.",
    cta: "Shop Serums",
    ctaLink: "/products?category=serums",
    image: "https://images.unsplash.com/photo-1614108974832-1543c0fbf90b?w=1920&h=1080&fit=crop",
    accent: "Serums",
    urgency: "Most purchased this month",
  },
  {
    headline: "Hydrate.\nProtect.",
    subtext: "SPF that doesn't leave a white cast. Moisturizers that keep you glowing all day.",
    cta: "Shop Suncare",
    ctaLink: "/products?group=sunprotection",
    image: "https://images.unsplash.com/photo-1592621385612-4d7129426394?w=1920&h=1080&fit=crop",
    accent: "Sun Protection",
    urgency: "Essential for daily protection",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Welcome! Check your inbox for exclusive offers.");
    setEmail("");
    setIsSubmitting(false);
  };

  const slide = heroSlides[currentSlide];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="relative h-[88vh] md:h-screen flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.headline}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-foreground/20 md:to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl space-y-5 md:space-y-6"
            >
              {/* Interlocking lock-and-key tag pair */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center text-[10px] sm:text-xs font-semibold tracking-wide"
              >
                {/* Left pill — the "key" with rounded right edge protruding into the lock */}
                <span className="relative z-10 bg-background/95 text-foreground pl-4 pr-5 py-2 backdrop-blur-sm rounded-l-full rounded-r-full shadow-sm">
                  {slide.urgency}
                </span>
                {/* Right pill — the "lock" with a notched (curved-in) left edge cradling the key */}
                <span
                  className="relative -ml-3 bg-primary text-primary-foreground uppercase tracking-[0.2em] pl-5 pr-4 py-2 rounded-r-full"
                  style={{
                    borderTopLeftRadius: "9999px",
                    borderBottomLeftRadius: "9999px",
                    boxShadow: "inset 6px 0 0 -3px hsl(var(--background) / 0.95)",
                  }}
                >
                  {slide.accent}
                </span>
              </motion.div>

              <h1 className="font-display text-background whitespace-pre-line text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[7.5rem] font-medium leading-[0.95] tracking-[-0.05em]">
                {slide.headline}
              </h1>

              <p className="text-base md:text-lg text-background/90 max-w-md leading-relaxed font-display font-normal tracking-[-0.005em]">
                {slide.subtext}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate(slide.ctaLink)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 sm:px-10 py-6 text-sm uppercase tracking-[0.2em] font-semibold rounded-full shadow-lg group"
                >
                  {slide.cta}
                  <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/products")}
                  className="bg-background text-foreground border-2 border-background hover:bg-background/90 hover:text-foreground rounded-full px-8 py-6 text-sm uppercase tracking-[0.2em] font-semibold"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse All
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide controls */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4">
            <button onClick={prevSlide} aria-label="Previous slide" className="p-2 text-background/60 hover:text-background transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-10 bg-primary" : "w-4 bg-background/40 hover:bg-background/60"
                  }`}
                />
              ))}
            </div>
            <button onClick={nextSlide} aria-label="Next slide" className="p-2 text-background/60 hover:text-background transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== TRUST BANNER ===== */}
      <TrustBanner />

      {/* ===== SHOP BY TREATMENT ===== */}
      <ShopByTreatment />

      {/* ===== MARQUEE STRIP 1 ===== */}
      <MarqueeStrip
        text="Free Shipping On Orders Over KES 5,000 • Same Day Delivery In Nairobi • Genuine Products Only"
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
            src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=800&fit=crop"
            alt="Skincare routine"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block bg-fire-red text-white text-[10px] uppercase tracking-wider px-3 py-1 font-bold mb-2">
              Most Popular
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
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Build Your Routine</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif">
              Not Sure Where To Start?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our best-selling bundles are hand-picked by skincare experts. Start with a complete routine and
              see results in as little as 2 weeks. Over <strong>500+ happy customers</strong> this month alone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/products?featured=true")}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold"
              >
                Shop Bestsellers
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SALE PRODUCTS ===== */}
      <SaleProductsSection />

      {/* ===== MARQUEE STRIP 2 ===== */}
      <MarqueeStrip
        text="Trusted By 10,000+ Customers • 100% Genuine Products • Expert-Curated Selection"
        className="bg-deep-red text-white"
        speed="30s"
      />

      {/* ===== REVIEWS (Social Proof) ===== */}
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
                Don't miss out — limited stock available
              </h3>
              <p className="text-foreground/70 text-sm">
                Our most popular products sell out fast. Add to cart before they're gone.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/products")}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 md:px-10 py-6 uppercase tracking-[0.2em] text-xs sm:text-sm font-semibold whitespace-nowrap group"
            >
              Shop Now
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== BRAND STORY ===== */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&h=800&fit=crop"
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
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">Why Kenyashipment</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-background leading-tight">
              Skincare That Actually Works For You
            </h2>
            <p className="text-background/70 leading-relaxed max-w-xl mx-auto text-lg">
              Every product on our marketplace is vetted by experts and loved by real customers.
              We connect you with trusted sellers who understand melanin-rich skin — so you can
              shop with confidence.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto py-4">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">10K+</p>
                <p className="text-xs text-background/60 uppercase tracking-wider mt-1">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">100%</p>
                <p className="text-xs text-background/60 uppercase tracking-wider mt-1">Genuine Products</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">4.9</p>
                <p className="text-xs text-background/60 uppercase tracking-wider mt-1">Average Rating</p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/products")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold"
            >
              Start Shopping
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
              Get 10% Off Your First Order
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Subscribe and get exclusive access to new arrivals, flash sales, and skincare
              tips crafted for your skin. Plus <strong>10% off</strong> your first purchase.
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
                {isSubmitting ? "Joining..." : "Get 10% Off"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Join 5,000+ subscribers. Unsubscribe anytime.
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
              Have Products to Sell?
            </h2>
            <p className="text-primary-foreground/60 max-w-lg mx-auto">
              Join our marketplace and reach thousands of customers across Kenya.
              Open your shop on Kenyashipment today.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/become-seller")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold group"
            >
              Become a Seller
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
