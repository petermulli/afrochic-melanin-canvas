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

const dummyReviews: Review[] = [
  { id: "d1", reviewer_name: "Amara Okonkwo", review_text: "This serum completely transformed my skin! The hyperpigmentation I've been fighting for years has faded significantly.", rating: 5, product_name: "Brightening Vitamin C Serum", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face" },
  { id: "d2", reviewer_name: "Wei Lin Chen", review_text: "I've tried countless products for my oily skin, but this moisturizer is perfect. It controls shine without drying me out.", rating: 5, product_name: "Oil-Free Hydrating Gel", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face" },
  { id: "d3", reviewer_name: "Maria Santos", review_text: "Finally a brand that understands melanin-rich skin! The dark spot corrector works wonders.", rating: 5, product_name: "Dark Spot Corrector", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face" },
  { id: "d4", reviewer_name: "Fatou Diallo", review_text: "The acne treatment kit cleared my breakouts in just two weeks! My skin feels so smooth.", rating: 5, product_name: "Complete Acne Kit", image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=face" },
  { id: "d5", reviewer_name: "Jessica Thompson", review_text: "Best investment I've made for my skincare routine. The anti-aging serum has reduced my fine lines.", rating: 5, product_name: "Retinol Night Serum", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" },
  { id: "d6", reviewer_name: "Priya Sharma", review_text: "The sunscreen is incredible! No white cast. Perfect for daily wear under makeup.", rating: 5, product_name: "Invisible SPF 50", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face" },
];

const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>(dummyReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchRealReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("product_reviews").select("id, reviewer_name, review_text, rating, product_id")
          .order("created_at", { ascending: false }).limit(10);
        if (error) throw error;
        if (data && data.length > 0) {
          const productIds = [...new Set(data.map(r => r.product_id))];
          const { data: products } = await supabase.from("products").select("id, name").in("id", productIds);
          const productMap = new Map(products?.map(p => [p.id, p.name]) || []);
          const realReviews: Review[] = data.map((review, index) => ({
            id: review.id, reviewer_name: review.reviewer_name, review_text: review.review_text || "",
            rating: review.rating, product_name: productMap.get(review.product_id) || "Our Product",
            image: dummyReviews[index % dummyReviews.length].image,
          }));
          setReviews([...realReviews, ...dummyReviews]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchRealReviews();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const nextSlide = () => { setIsAutoPlaying(false); setCurrentIndex((prev) => (prev + 1) % reviews.length); };
  const prevSlide = () => { setIsAutoPlaying(false); setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length); };

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
    <section className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-bold">
            ⭐ 4.9 Average Rating From Verified Buyers
          </span>
          <h2 className="font-serif">Real Results, Real People</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            See what our customers are saying about their skincare transformations.
          </p>
        </motion.div>

        {/* Desktop */}
        <div className="hidden md:block relative">
          <div className="flex items-center justify-center gap-6 py-8">
            {getVisibleReviews().map(({ review, position }) => (
              <motion.div
                key={review.id + position}
                initial={false}
                animate={{ scale: position === 0 ? 1 : 0.88, opacity: position === 0 ? 1 : 0.4, x: position * 40 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`bg-muted border border-border p-8 ${position === 0 ? "w-[420px]" : "w-72"}`}
              >
                <div className="flex flex-col items-center text-center">
                  <img src={review.image} alt={review.reviewer_name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 mb-4" />
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
                    ))}
                  </div>
                  <p className={`text-foreground/80 mb-4 leading-relaxed ${position === 0 ? "text-sm" : "text-xs line-clamp-3"}`}>
                    "{review.review_text}"
                  </p>
                  <p className="font-bold text-sm text-foreground">{review.reviewer_name}</p>
                  {review.product_name && <p className="text-xs text-primary font-medium">{review.product_name}</p>}
                </div>
              </motion.div>
            ))}
          </div>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background border border-border hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background border border-border hover:bg-muted transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-muted border border-border p-6 mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <img src={currentReview.image} alt={currentReview.reviewer_name} className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 mb-4" />
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < currentReview.rating ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
                  ))}
                </div>
                <p className="text-foreground/80 mb-4 leading-relaxed text-sm">"{currentReview.review_text}"</p>
                <p className="font-bold text-sm text-foreground">{currentReview.reviewer_name}</p>
                {currentReview.product_name && <p className="text-xs text-primary font-medium">{currentReview.product_name}</p>}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={prevSlide} className="p-2 hover:bg-muted transition-colors"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex gap-1.5">
              {reviews.slice(0, 6).map((_, index) => (
                <button key={index} onClick={() => { setIsAutoPlaying(false); setCurrentIndex(index); }}
                  className={`h-1.5 rounded-full transition-all ${index === currentIndex % 6 ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
              ))}
            </div>
            <button onClick={nextSlide} className="p-2 hover:bg-muted transition-colors"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
