import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  shades?: string[];
}

const BestSellersSection = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts();
  }, []);

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
      const productSales: Record<string, { product_id: string; total_quantity: number }> = {};
      
      orderItems?.forEach((item: any) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            total_quantity: 0,
          };
        }
        productSales[item.product_id].total_quantity += item.quantity;
      });

      // Sort by quantity and get top 4
      const sortedProducts = Object.values(productSales)
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 4);

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
          .limit(4);

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
          .limit(4);
        setTopProducts(featured || []);
      } catch {
        setTopProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.shades && product.shades.length > 0) {
      navigate(`/product/${product.id}`);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      });
      toast.success(`${product.name} added to cart`);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-12 w-12 text-primary/50" />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (topProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 block">
            Customer Favorites
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight">
            Best Sellers
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {topProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Best Seller Badge */}
                {index === 0 && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider px-2 py-1 rounded-full font-medium">
                    #1 Best Seller
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-3 w-3 fill-primary text-primary" 
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(4.9)</span>
                </div>

                {/* Price */}
                <p className="text-base md:text-lg font-semibold text-primary">
                  {formatPrice(product.price)}
                </p>

                {/* Add to Cart Button */}
                <Button
                  onClick={(e) => handleAddToCart(e, product)}
                  size="sm"
                  className="w-full rounded-lg text-xs"
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/products")}
            className="rounded-none px-10 py-6 uppercase tracking-widest text-sm border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
          >
            View All Products
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BestSellersSection;
