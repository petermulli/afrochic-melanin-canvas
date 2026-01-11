import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicHeroText from "@/components/DynamicHeroText";
import BestSellersCarousel from "@/components/BestSellersCarousel";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Truck, Shield, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const testimonialTexts = [
    {
      title: "Fast Delivery",
      text: "Same-day and next-day delivery options available across Kenya. Your packages arrive when you need them.",
    },
    {
      title: "Real-Time Tracking",
      text: "Track your shipments in real-time from pickup to delivery. Always know where your package is.",
    },
    {
      title: "Trusted by Thousands",
      text: "Over 50,000 successful deliveries across Kenya. Experience the Kenyashipment difference today.",
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

  const categories = [
    { name: "Skincare", image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee1fc1?w=400", link: "/products?category=skincare" },
    { name: "Haircare", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400", link: "/products?category=haircare" },
    { name: "Body Care", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400", link: "/products?category=bodycare" },
    { name: "Makeup", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400", link: "/products?category=makeup" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % testimonialTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % customerReviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % customerReviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + customerReviews.length) % customerReviews.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Full-Screen Hero Section - Dr. V Style */}
      <section className="relative h-screen flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Kenyashipment Beauty"
            className="w-full h-full object-cover object-top"
          />
          {/* Gradient overlay from bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-chocolate/80 via-chocolate/20 to-transparent" />
        </div>
        
        {/* Hero Content - Bottom positioned like Dr. V */}
        <div className="relative z-10 w-full pb-16 md:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <DynamicHeroText />
              <p className="text-base md:text-lg text-cream/80 mb-8 max-w-xl mx-auto font-light">
                Premium skincare products designed for melanin-rich skin. 
                Experience the glow you deserve.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/products")}
                className="group bg-cream text-chocolate hover:bg-cream/90 px-10 py-6 text-base uppercase tracking-widest font-medium rounded-none shadow-elevated hover:shadow-soft transition-all"
              >
                Shop Now
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges / Media Strip */}
      <section className="py-8 bg-muted/50 border-y border-border">
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

      {/* Top Sellers Section */}
      <section className="py-20 md:py-28 bg-background overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight mb-4">
              TOP SELLERS
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our most loved products, trusted by thousands across Kenya
            </p>
          </motion.div>

          {/* Dynamic Product Carousel */}
          <BestSellersCarousel />

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/products")}
              className="rounded-none px-10 py-6 uppercase tracking-widest text-sm border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
            >
              View All Products
              <ArrowRight className="ml-3 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Browse Collections Grid - Dr. V Style */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight mb-4">
              BROWSE COLLECTIONS
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(category.link)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted mb-3">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-chocolate/0 group-hover:bg-chocolate/20 transition-colors duration-300" />
                </div>
                <h3 className="text-center text-sm md:text-base uppercase tracking-widest font-medium">
                  {category.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section - Dr. V Style */}
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
              onClick={prevReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-muted-foreground" />
            </button>
            <button
              onClick={nextReview}
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

      {/* Brand Story Teaser */}
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
            premium skincare that celebrates and enhances melanin-rich skin. We've curated 
            products that work for you.
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/about")}
            className="rounded-none px-10 py-6 uppercase tracking-widest text-sm border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
          >
            Read Our Story
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
