import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface TopProduct {
  product_id: string;
  product_name: string;
  product_image: string;
  total_quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

const BestSellersCarousel = () => {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  useEffect(() => {
    if (topProducts.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % topProducts.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [topProducts.length]);

  const fetchTopProducts = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date for one week ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Fetch order items from the last week, grouped by product
      const { data: orderItems, error: orderError } = await supabase
        .from("order_items")
        .select(`
          product_id,
          product_name,
          product_image,
          quantity,
          orders!inner(created_at, status)
        `)
        .gte("orders.created_at", oneWeekAgo.toISOString())
        .in("orders.status", ["completed", "delivered", "processing", "pending"]);

      if (orderError) throw orderError;

      // Aggregate by product_id
      const productSales: Record<string, TopProduct> = {};
      
      orderItems?.forEach((item: any) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            total_quantity: 0,
          };
        }
        productSales[item.product_id].total_quantity += item.quantity;
      });

      // Sort by quantity and get top 5
      const sortedProducts = Object.values(productSales)
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 5);

      if (sortedProducts.length > 0) {
        // Fetch full product details
        const productIds = sortedProducts.map((p) => p.product_id);
        const { data: products, error: productError } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        if (productError) throw productError;
        
        // Sort products by sales order
        const orderedProducts = productIds
          .map((id) => products?.find((p) => p.id === id))
          .filter(Boolean) as Product[];
        
        setTopProducts(orderedProducts);
      } else {
        // Fallback to featured products if no sales data
        const { data: featured, error: featuredError } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .limit(5);

        if (featuredError) throw featuredError;
        setTopProducts(featured || []);
      }
    } catch (error) {
      console.error("Error fetching top products:", error);
      // Fallback to featured products on error
      try {
        const { data: featured } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .limit(5);
        setTopProducts(featured || []);
      } catch {
        setTopProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    // Reset the interval when user manually changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % topProducts.length);
      }, 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-primary/50" />
        </motion.div>
      </div>
    );
  }

  if (topProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <Sparkles className="h-16 w-16 text-primary/30 mb-4" />
        <h3 className="text-xl font-display font-medium text-muted-foreground mb-2">
          Coming Soon
        </h3>
        <p className="text-muted-foreground/70 max-w-md">
          Our best sellers will appear here. Check back soon for our most loved products!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Main Carousel Container */}
      <div className="relative h-[500px] md:h-[600px]">
        {/* Background Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Product Images Stack */}
        <div className="relative h-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {topProducts.map((product, index) => {
              const isActive = index === currentIndex;
              const isPrev = index === (currentIndex - 1 + topProducts.length) % topProducts.length;
              const isNext = index === (currentIndex + 1) % topProducts.length;
              const isVisible = isActive || isPrev || isNext;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={product.id}
                  className="absolute cursor-pointer"
                  initial={{ 
                    opacity: 0, 
                    scale: 0.7,
                    x: isNext ? 300 : isPrev ? -300 : 0,
                    rotateY: isNext ? -25 : isPrev ? 25 : 0,
                  }}
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    scale: isActive ? 1 : 0.7,
                    x: isActive ? 0 : isPrev ? -250 : 250,
                    rotateY: isActive ? 0 : isPrev ? 25 : -25,
                    zIndex: isActive ? 10 : 5,
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.5,
                    x: isPrev ? -400 : 400,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    duration: 0.6,
                  }}
                  onClick={() => handleProductClick(product.id)}
                  whileHover={isActive ? { scale: 1.02 } : {}}
                  style={{ perspective: "1000px" }}
                >
                  {/* Product Card */}
                  <div className={`relative ${isActive ? 'w-72 md:w-96' : 'w-48 md:w-64'} transition-all duration-500`}>
                    {/* Glow Effect */}
                    {isActive && (
                      <motion.div
                        className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl"
                        animate={{
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}
                    
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-background">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-chocolate/80 via-transparent to-transparent" />
                      
                      {/* Product Info */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-cream/70 text-sm uppercase tracking-widest mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-cream text-xl md:text-2xl font-display font-medium mb-2">
                          {product.name}
                        </h3>
                        <p className="text-cream text-lg font-light">
                          KSh {product.price.toLocaleString()}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {topProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className="group relative p-2"
              aria-label={`Go to product ${index + 1}`}
            >
              <motion.div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'
                }`}
                layoutId="activeDot"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Floating Product Thumbnails */}
      <div className="absolute top-8 left-8 hidden lg:block z-20">
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {topProducts.slice(0, 3).map((product, index) => (
            <motion.button
              key={product.id}
              onClick={() => handleDotClick(index)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                index === currentIndex 
                  ? 'border-primary shadow-lg scale-110' 
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Right Side Thumbnails */}
      <div className="absolute top-8 right-8 hidden lg:block z-20">
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {topProducts.slice(3, 5).map((product, index) => (
            <motion.button
              key={product.id}
              onClick={() => handleDotClick(index + 3)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                index + 3 === currentIndex 
                  ? 'border-primary shadow-lg scale-110' 
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BestSellersCarousel;
