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
import CommunitySection from "@/components/CommunitySection";
import ShopByTreatment from "@/components/ShopByTreatment";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ChevronLeft, ChevronRight, Mail, Store, Sparkles } from "lucide-react";
import { toast } from "sonner";

const heroSlides = [
  {
    headline: "Your Skin,\nYour Glow",
    subtext: "Premium skincare crafted for melanin-rich beauty. Discover products that actually work.",
    cta: "Shop Now",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1920&h=1080&fit=crop",
    accent: "Best Sellers",
  },
  {
    headline: "Fade Dark\nSpots Fast",
    subtext: "Clinically inspired formulas with vitamin C and niacinamide to reveal your natural radiance.",
    cta: "Shop Serums",
    image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1920&h=1080&fit=crop",
    accent: "Serums",
  },
  {
    headline: "Hydrate &\nProtect",
    subtext: "SPF that doesn't leave a white cast. Moisturizers that keep you glowing all day.",
    cta: "Shop Suncare",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&h=1080&fit=crop",
    accent: "Sun Protection",
  },
];

const pressLogos = [
  { name: "Vogue Africa", style: "italic" },
  { name: "CNN", style: "bold" },
  { name: "Beauty Matter", style: "normal" },
  { name: "Essence", style: "italic" },
  { name: "Elle Africa", style: "italic" },
  { name: "Business Daily", style: "normal" },
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

      {/* ===== HERO SECTION - Full screen with bold typography ===== */}
      <section className="relative h-[85vh] md:h-screen flex items-center overflow-hidden">
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
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl space-y-6"
            >
              {/* Accent tag */}
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-1.5"
              >
                {slide.accent}
              </motion.span>

              {/* Big headline */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif leading-[0.9] text-background whitespace-pre-line">
                {slide.headline}
              </h1>

              <p className="text-base md:text-lg text-background/80 max-w-md leading-relaxed">
                {slide.subtext}
              </p>

              <Button
                size="lg"
                onClick={() => navigate("/products")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-sm uppercase tracking-widest font-bold rounded-none shadow-lg group"
              >
                {slide.cta}
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button onClick={prevSlide} className="p-2 text-background/60 hover:text-background transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-10 bg-primary" : "w-4 bg-background/40 hover:bg-background/60"
                  }`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="p-2 text-background/60 hover:text-background transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== SHOP BY TREATMENT ===== */}
      <ShopByTreatment />

      {/* ===== MARQUEE STRIP 1 ===== */}
      <MarqueeStrip
        text="Skincare That Works For You"
        className="bg-primary text-primary-foreground"
        speed="20s"
      />

      {/* ===== BEST SELLERS ===== */}
      <BestSellersSection />

      {/* ===== NEW PRODUCTS ===== */}
      <NewProductsSection />

      {/* ===== SKIN QUIZ / ROUTINE CTA - Split layout like Uncover ===== */}
      <section className="grid md:grid-cols-2 min-h-[500px]">
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&h=800&fit=crop"
            alt="Skincare routine"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-center p-8 md:p-16 bg-muted">
          <motion.div
            className="max-w-md space-y-6 text-center md:text-left"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Personalized For You</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif">
              Discover Your Perfect Routine
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your skin is unique — your routine should be too. Browse our curated collections
              to find products made for your concerns and goals.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/products")}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold"
            >
              Explore Products
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== SALE PRODUCTS ===== */}
      <SaleProductsSection />

      {/* ===== MARQUEE STRIP 2 ===== */}
      <MarqueeStrip
        text="Quality Skincare • Crafted For Melanin"
        className="bg-foreground text-background"
        speed="30s"
      />

      {/* ===== CONSULTATION CTA - Reversed split ===== */}
      <section className="grid md:grid-cols-2 min-h-[500px]">
        <div className="flex items-center justify-center p-8 md:p-16 bg-background order-2 md:order-1">
          <motion.div
            className="max-w-md space-y-6 text-center md:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">Expert Guidance</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif">
              Not Sure Where To Start?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our community of skincare enthusiasts and sellers are here to help.
              Get personalized recommendations and tips from people who understand your skin.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/community")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold group"
            >
              Join Community
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
        <div className="relative overflow-hidden order-1 md:order-2">
          <img
            src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=800&fit=crop"
            alt="Skincare consultation"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ===== COMMUNITY MEMBERSHIP ===== */}
      <CommunitySection />

      {/* ===== REVIEWS ===== */}
      <div id="reviews">
        <ReviewsCarousel />
      </div>

      {/* ===== OUR APPROACH / BRAND STORY - Full width with bg image ===== */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571875257727-256c39da42af?w=1920&h=800&fit=crop"
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
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">Our Approach</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-background leading-tight">
              Celebrating Melanin-Rich Beauty
            </h2>
            <p className="text-background/70 leading-relaxed max-w-xl mx-auto text-lg">
              Kenyashipment brings together the best skincare products designed for real skin.
              Our curated marketplace connects you with sellers who understand your beauty needs,
              delivering quality products you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/products")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 uppercase tracking-widest text-sm font-bold"
              >
                Shop Now
                <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/about")}
                className="rounded-none px-10 py-6 uppercase tracking-widest text-sm border-2 border-background text-background hover:bg-background hover:text-foreground transition-all font-bold"
              >
                Our Story
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== AS SEEN IN PRESS ===== */}
      <section className="py-12 md:py-16 bg-background border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8 font-bold">
            As Seen In
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
            {pressLogos.map((logo) => (
              <span
                key={logo.name}
                className={`text-lg md:text-xl text-foreground/40 hover:text-foreground/70 transition-colors ${
                  logo.style === "italic" ? "font-serif italic" : "font-sans font-bold"
                }`}
              >
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </section>

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
              Join The Glow Community
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be first to know about new arrivals, exclusive offers, and skincare tips
              crafted for melanin-rich skin.
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
                {isSubmitting ? "Joining..." : "Subscribe"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== BECOME A SELLER CTA ===== */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mb-2">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-background">
              Have Products to Sell?
            </h2>
            <p className="text-background/60 max-w-lg mx-auto">
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
