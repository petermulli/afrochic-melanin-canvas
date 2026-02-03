import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Sparkles, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  images: string[];
  category: string;
  brand?: string;
  shades?: string[];
  featured: boolean;
}

const SaleProductsSection = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch featured products as "sale" products (you can customize this logic)
      // For now, we'll use featured products as a proxy for sale items
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "approved")
        .eq("featured", true)
        .limit(4);

      if (error) throw error;
      setSaleProducts(data || []);
    } catch (error) {
      console.error("Error fetching sale products:", error);
      setSaleProducts([]);
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
      <section className="py-20 md:py-28 bg-gradient-to-br from-destructive/5 to-destructive/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-12 w-12 text-destructive/50" />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (saleProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-destructive/5 to-destructive/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm uppercase tracking-[0.3em] text-destructive mb-4 block">
            Limited Time Offers
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight">
            Sale Products
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {saleProducts.map((product, index) => (
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
                
                {/* Sale Badge */}
                <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs uppercase tracking-wider px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Sale
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
                <div className="flex items-center gap-2">
                  <p className="text-base md:text-lg font-semibold text-destructive">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={(e) => handleAddToCart(e, product)}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-none border-2 border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 text-xs"
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
            onClick={() => navigate("/products?filter=sale")}
            className="rounded-none px-10 py-6 uppercase tracking-widest text-sm border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            View All Sale Items
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default SaleProductsSection;
