import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Star, Truck, Shield, Clock, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { toast } from "sonner";

// Skin condition showcases with product images
const skinConditions = [
  {
    condition: "ACNE",
    tagline: "Clear Skin Awaits",
    description: "Our targeted formulas work deep within pores to combat breakouts, reduce inflammation, and prevent future blemishes. Gentle yet effective for melanin-rich skin.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1920&h=1080&fit=crop",
    productImage: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop",
  },
  {
    condition: "HYPERPIGMENTATION",
    tagline: "Even Tone, Radiant Glow",
    description: "Fade dark spots and achieve a luminous, even complexion with our brightening serums enriched with vitamin C and niacinamide. Designed specifically for darker skin tones.",
    image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1920&h=1080&fit=crop",
    productImage: "https://images.unsplash.com/photo-1570194065650-d99fb4ee1fc1?w=600&h=600&fit=crop",
  },
  {
    condition: "DRY SKIN",
    tagline: "Deep Hydration Restored",
    description: "Intensive moisturizers infused with shea butter, baobab oil, and hyaluronic acid to restore your skin's natural moisture barrier and leave it supple all day.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&h=1080&fit=crop",
    productImage: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=600&fit=crop",
  },
  {
    condition: "AGING SKIN",
    tagline: "Timeless Beauty",
    description: "Turn back time with our anti-aging collection featuring retinol, peptides, and collagen boosters. Reduce fine lines and restore youthful elasticity.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1920&h=1080&fit=crop",
    productImage: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&h=600&fit=crop",
  },
  {
    condition: "OILY SKIN",
    tagline: "Balanced & Matte",
    description: "Control excess sebum without stripping your skin. Our oil-free formulas keep you shine-free while maintaining essential hydration for a healthy, matte finish.",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=1920&h=1080&fit=crop",
    productImage: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop",
  },
];

const customerReviews = [
  {
    name: "Amara K.",
    product: "Skin Brightening Serum",
    review: "Amazing results! I've been using this for 3 weeks and my skin has never looked better. The glow is real!",
    rating: 5,
  },
  {
    name: "Grace M.",
    product: "Hydrating Moisturizer",
    review: "This moisturizer is so luxurious, it feels like a spa experience every morning. Highly recommend!",
    rating: 5,
  },
  {
    name: "Faith W.",
    product: "Dark Spot Corrector",
    review: "I've tried many products but this one actually works. My dark spots have faded significantly.",
    rating: 5,
  },
  {
    name: "Njeri O.",
    product: "Vitamin C Serum",
    review: "The best product I have used in years. My skin is brighter and more even-toned than ever before.",
    rating: 5,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompletedRotation, setHasCompletedRotation] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = (prev + 1) % skinConditions.length;
      // Check if we've completed a full rotation
      if (next === 0 && prev === skinConditions.length - 1) {
        setHasCompletedRotation(true);
      }
      return next;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + skinConditions.length) % skinConditions.length);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % customerReviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate newsletter signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Welcome to the Kenyashipment family! Check your inbox for exclusive offers.");
    setEmail("");
    setIsSubmitting(false);
  };

  const currentCondition = skinConditions[currentSlide];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Full-Screen Skin Condition Showcase */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={currentCondition.image}
              alt={currentCondition.condition}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-chocolate/90 via-chocolate/70 to-chocolate/40" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Text Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-cream space-y-6"
              >
                <div className="space-y-2">
                  <motion.span 
                    className="text-sm uppercase tracking-[0.3em] text-cream/70"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    We Treat
                  </motion.span>
                  <motion.h1 
                    className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-cream"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentCondition.condition}
                  </motion.h1>
                  <motion.p 
                    className="text-xl md:text-2xl font-light text-cream/90 italic"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentCondition.tagline}
                  </motion.p>
                </div>
                
                <motion.p 
                  className="text-base md:text-lg text-cream/80 max-w-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentCondition.description}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    size="lg"
                    onClick={() => navigate("/products")}
                    className="group bg-cream text-chocolate hover:bg-cream/90 px-10 py-6 text-base uppercase tracking-widest font-medium rounded-none shadow-elevated hover:shadow-soft transition-all"
                  >
                    Shop Solutions
                    <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Product Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hidden lg:flex justify-center items-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl scale-150" />
                  <img
                    src={currentCondition.productImage}
                    alt="Featured Product"
                    className="relative w-80 h-80 object-cover rounded-full border-4 border-cream/20 shadow-2xl"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Navigation */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="p-2 text-cream/70 hover:text-cream transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="flex gap-2">
              {skinConditions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? "w-8 bg-cream" 
                      : "w-4 bg-cream/40 hover:bg-cream/60"
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="p-2 text-cream/70 hover:text-cream transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Card - Prominent placement */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card border border-border p-8 md:p-12 shadow-elevated">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-4">
                Join Our Glow Community
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Be the first to know about new arrivals, exclusive offers, and skincare tips 
                crafted for melanin-rich skin.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 rounded-none border-2 border-foreground/20 focus:border-primary"
                />
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-sm"
                >
                  {isSubmitting ? "Joining..." : "Subscribe"}
                </Button>
              </form>
              
              <p className="text-xs text-muted-foreground mt-4">
                By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges / Media Strip */}
      <section className="py-8 bg-background border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap opacity-60">
            <span className="text-sm uppercase tracking-widest font-medium text-muted-foreground">Featured in</span>
            <span className="text-lg font-serif italic text-foreground/70">Vogue Africa</span>
            <span className="text-lg font-serif italic text-foreground/70">Beauty Kenya</span>
            <span className="text-lg font-serif italic text-foreground/70">Essence</span>
            <span className="text-lg font-serif italic text-foreground/70">Elle Africa</span>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight mb-4">
              Feel the Love
            </h2>
            <p className="text-muted-foreground">
              from thousands of happy customers
            </p>
          </motion.div>

          {/* Reviews Carousel */}
          <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden">
              <motion.div
                key={currentReviewIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="bg-card border border-border p-8 md:p-12 text-center"
              >
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(customerReviews[currentReviewIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg md:text-xl font-serif italic text-foreground mb-6 leading-relaxed">
                  "{customerReviews[currentReviewIndex].review}"
                </p>
                <p className="font-medium text-foreground">
                  {customerReviews[currentReviewIndex].name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {customerReviews[currentReviewIndex].product}
                </p>
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentReviewIndex((prev) => (prev - 1 + customerReviews.length) % customerReviews.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-muted-foreground" />
            </button>
            <button
              onClick={() => setCurrentReviewIndex((prev) => (prev + 1) % customerReviews.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-muted-foreground" />
            </button>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {customerReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReviewIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentReviewIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values - Minimal Icons */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-foreground/20 mb-2">
                <Truck className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-sm uppercase tracking-widest font-medium">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Same-day and next-day delivery across Kenya
              </p>
            </motion.div>
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-foreground/20 mb-2">
                <Shield className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-sm uppercase tracking-widest font-medium">Secure Payments</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                M-Pesa and card payments protected
              </p>
            </motion.div>
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-foreground/20 mb-2">
                <Clock className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-sm uppercase tracking-widest font-medium">Quality Guaranteed</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Authentic products with quality assurance
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Story Teaser with Shop CTA */}
      <section className="py-24 md:py-32 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight leading-tight">
            Rooted in Kenya,<br />
            <span className="italic">Celebrating Your Glow</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Kenyashipment was born from a simple belief: everyone deserves access to 
            premium skincare that celebrates and enhances melanin-rich skin. We have curated 
            products that work for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/products")}
              className="rounded-none px-10 py-6 uppercase tracking-widest text-sm bg-foreground text-background hover:bg-foreground/90 transition-all"
            >
              Shop Now
              <ArrowRight className="ml-3 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/about")}
              className="rounded-none px-10 py-6 uppercase tracking-widest text-sm border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
            >
              Read Our Story
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
