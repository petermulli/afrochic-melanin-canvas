import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  product_name?: string;
  image: string;
}

// Diverse dummy reviews with faces
const dummyReviews: Review[] = [
  {
    id: "dummy-1",
    reviewer_name: "Amara Okonkwo",
    review_text: "This serum completely transformed my skin! The hyperpigmentation I've been fighting for years has faded significantly. I feel confident without makeup now.",
    rating: 5,
    product_name: "Brightening Vitamin C Serum",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "dummy-2",
    reviewer_name: "Wei Lin Chen",
    review_text: "I've tried countless products for my oily skin, but this moisturizer is perfect. It controls shine without drying me out. The texture is so lightweight!",
    rating: 5,
    product_name: "Oil-Free Hydrating Gel",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "dummy-3",
    reviewer_name: "Maria Santos",
    review_text: "Finally a brand that understands melanin-rich skin! The dark spot corrector works wonders. My skin tone has never been more even and radiant.",
    rating: 5,
    product_name: "Dark Spot Corrector",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "dummy-4",
    reviewer_name: "Fatou Diallo",
    review_text: "The acne treatment kit cleared my breakouts in just two weeks! I was skeptical at first but now I'm a believer. My skin feels so smooth.",
    rating: 5,
    product_name: "Complete Acne Kit",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "dummy-5",
    reviewer_name: "Jessica Thompson",
    review_text: "Best investment I've made for my skincare routine. The anti-aging serum has reduced my fine lines noticeably. I get compliments all the time now!",
    rating: 5,
    product_name: "Retinol Night Serum",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "dummy-6",
    reviewer_name: "Priya Sharma",
    review_text: "The sunscreen is incredible! It doesn't leave that awful white cast that other SPFs do on my skin. Perfect for daily wear under makeup.",
    rating: 5,
    product_name: "Invisible SPF 50",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "dummy-7",
    reviewer_name: "Keisha Williams",
    review_text: "I've struggled with dry patches for years. This hydrating cream is a game changer! My skin stays moisturized all day, even in winter.",
    rating: 5,
    product_name: "Deep Hydration Cream",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "dummy-8",
    reviewer_name: "Yuki Tanaka",
    review_text: "The gentle cleanser removed all my makeup without stripping my skin. Love how soft and clean my face feels after using it every night!",
    rating: 5,
    product_name: "Gentle Micellar Cleanser",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  },
];

const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>(dummyReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch real reviews and merge with dummy ones
  useEffect(() => {
    const fetchRealReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("product_reviews")
          .select(`
            id,
            reviewer_name,
            review_text,
            rating,
            product_id
          `)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          // Fetch product names for real reviews
          const productIds = [...new Set(data.map(r => r.product_id))];
          const { data: products } = await supabase
            .from("products")
            .select("id, name")
            .in("id", productIds);

          const productMap = new Map(products?.map(p => [p.id, p.name]) || []);

          const realReviews: Review[] = data.map((review, index) => ({
            id: review.id,
            reviewer_name: review.reviewer_name,
            review_text: review.review_text || "",
            rating: review.rating,
            product_name: productMap.get(review.product_id) || "Our Product",
            // Use diverse placeholder images for real reviews
            image: dummyReviews[index % dummyReviews.length].image,
          }));

          // Combine real reviews with dummy ones
          setReviews([...realReviews, ...dummyReviews]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchRealReviews();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Get visible reviews for the carousel (show 3 at a time on desktop)
  const getVisibleReviews = () => {
    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + reviews.length) % reviews.length;
      visible.push({ review: reviews[index], position: i });
    }
    return visible;
  };

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight mb-4">
            Real Results, Real People
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who've transformed their skin with our products
          </p>
        </motion.div>

        {/* Desktop Carousel */}
        <div className="hidden md:block relative">
          <div className="flex items-center justify-center gap-6 py-8">
            {getVisibleReviews().map(({ review, position }) => (
              <motion.div
                key={review.id}
                initial={false}
                animate={{
                  scale: position === 0 ? 1 : 0.85,
                  opacity: position === 0 ? 1 : 0.5,
                  x: position * 50,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`bg-card border border-border rounded-2xl p-6 shadow-lg ${
                  position === 0 ? "w-96" : "w-72"
                }`}
              >
                {/* Reviewer Image */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img
                      src={review.image}
                      alt={review.reviewer_name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Quote className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className={`text-foreground/80 mb-4 leading-relaxed ${
                    position === 0 ? "text-base" : "text-sm line-clamp-3"
                  }`}>
                    "{review.review_text}"
                  </p>

                  {/* Name & Product */}
                  <p className="font-semibold text-foreground">{review.reviewer_name}</p>
                  {review.product_name && (
                    <p className="text-sm text-primary">{review.product_name}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-lg mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={currentReview.image}
                  alt={currentReview.reviewer_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 mb-4"
                />

                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < currentReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-foreground/80 mb-4 leading-relaxed">
                  "{currentReview.review_text}"
                </p>

                <p className="font-semibold text-foreground">{currentReview.reviewer_name}</p>
                {currentReview.product_name && (
                  <p className="text-sm text-primary">{currentReview.product_name}</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Mobile Navigation */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={prevSlide}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5">
              {reviews.slice(0, 8).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex % 8
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;