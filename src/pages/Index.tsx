import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicHeroText from "@/components/DynamicHeroText";
import BestSellersCarousel from "@/components/BestSellersCarousel";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Truck, Clock, Shield } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % testimonialTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Kenyashipment Logistics"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-chocolate/60 via-chocolate/30 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl animate-fade-in-up">
            <DynamicHeroText />
            <p className="text-lg md:text-xl text-cream/90 mb-10 max-w-xl font-light leading-relaxed">
              Fast, reliable shipping and logistics services across Kenya.
              From small parcels to large cargo, we deliver with care.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/products")}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-elevated hover:shadow-soft transition-all"
            >
              Explore Services
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers Carousel */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-light tracking-tight mb-4">
              Popular Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most loved products, handpicked for their quality and value
            </p>
          </div>

          {/* Dynamic Product Carousel */}
          <BestSellersCarousel />

          {/* Animated Text Blocks */}
          <div className="relative h-48 md:h-40 overflow-hidden mb-8">
            {testimonialTexts.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-all duration-700 ${
                  index === currentTextIndex
                    ? "opacity-100 translate-x-0"
                    : index < currentTextIndex
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <h3 className="text-3xl md:text-5xl font-light tracking-tight mb-4 text-foreground">
                  {item.title}
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate("/products")}
              className="rounded-full px-8 shadow-elevated hover:shadow-soft"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Clock className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Same-day and next-day delivery options across Kenya
              </p>
            </div>
            <div
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/10 mb-4">
                <Truck className="h-8 w-8 text-sage" />
              </div>
              <h3 className="text-xl font-semibold">Reliable Service</h3>
              <p className="text-muted-foreground">
                Track your packages in real-time from pickup to delivery
              </p>
            </div>
            <div
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Handling</h3>
              <p className="text-muted-foreground">
                Your packages are insured and handled with care
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Rooted in Kenya,
            <br />
            <span className="font-semibold">Delivering Nationwide</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Kenyashipment was born from a simple belief: shipping should be simple, 
            affordable, and dependable. We've built a network that reaches every corner 
            of Kenya, ensuring your packages arrive safely and on time.
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/about")}
            className="rounded-full px-8 border-2"
          >
            Read Our Story
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
