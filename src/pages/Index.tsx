import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import heroImage from "@/assets/hero-image.jpg";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

const Index = () => {
  const navigate = useNavigate();
  const featuredProducts = products.filter((p) => p.featured);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const testimonialTexts = [
    {
      title: "Radiant Results",
      text: "Our customers see visible improvements in just 2 weeks. Join thousands who've discovered their natural glow.",
    },
    {
      title: "Premium Ingredients",
      text: "Formulated with African botanicals and natural extracts. No harmful chemicals, just pure beauty.",
    },
    {
      title: "Trusted Worldwide",
      text: "Over 50,000 satisfied customers across Africa. Experience the AfroChic difference today.",
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
            alt="AfroChic Beauty"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-chocolate/60 via-chocolate/30 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-cream mb-6 leading-tight">
              Beauty Designed
              <br />
              <span className="font-semibold">For You</span>
            </h1>
            <p className="text-lg md:text-xl text-cream/90 mb-8 max-w-xl">
              Premium cosmetics celebrating the richness and diversity of melanin-rich skin.
              Crafted with natural ingredients from the heart of Kenya.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/products")}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-elevated hover:shadow-soft transition-all"
            >
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers Carousel */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              Best Sellers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most loved products, handpicked for their transformative results
            </p>
          </div>

          {/* Products Carousel */}
          <div className="relative mb-16">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                    <ProductCard product={product} compact />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12" />
              <CarouselNext className="hidden md:flex -right-4 lg:-right-12" />
            </Carousel>
          </div>

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
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Premium Quality</h3>
              <p className="text-muted-foreground">
                High-performance formulas crafted with the finest ingredients
              </p>
            </div>
            <div
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/10 mb-4">
                <Leaf className="h-8 w-8 text-sage" />
              </div>
              <h3 className="text-xl font-semibold">Natural Ingredients</h3>
              <p className="text-muted-foreground">
                Ethically sourced botanicals and nourishing African oils
              </p>
            </div>
            <div
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Made for Melanin</h3>
              <p className="text-muted-foreground">
                Specifically designed to enhance and celebrate diverse skin tones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Rooted in Heritage,
            <br />
            <span className="font-semibold">Crafted for Today</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            AfroChic was born from a simple belief: beauty products should celebrate, not
            compromise, the richness of African skin. Our formulas blend traditional African
            botanicals with modern science to create cosmetics that truly understand and
            enhance melanin-rich beauty.
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
