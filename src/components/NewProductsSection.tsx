import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Sparkles, Clock } from "lucide-react";
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
  brand?: string;
  shades?: string[];
  created_at: string;
}

const NewProductsSection = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNewProducts();
  }, []);

  const fetchNewProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch the 4 most recently added approved products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      setNewProducts(data || []);
    } catch (error) {
      console.error("Error fetching new products:", error);
      setNewProducts([]);
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
      <section className="py-20 md:py-28 bg-muted/20">
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

  if (newProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 block">
            Just Arrived
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight">
            New Products
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map((product, index) => (
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
                
                {/* New Badge */}
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  New
                </div>
              </div>

              <div className="space-y-2">
                {product.brand && (
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {product.brand}
                  </p>
                )}
                <h3 className="font-medium text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>

                {/* Price */}
                <p className="text-base md:text-lg font-semibold text-primary">
                  {formatPrice(product.price)}
                </p>

                {/* Add to Cart Button */}
                <Button
                  onClick={(e) => handleAddToCart(e, product)}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-none border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300 text-xs"
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
            onClick={() => navigate("/products?sort=newest")}
            className="rounded-none px-10 py-6 uppercase tracking-widest text-sm border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
          >
            View All New Arrivals
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewProductsSection;
