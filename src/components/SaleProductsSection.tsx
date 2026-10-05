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
      const { data, error } = await supabase
        .from("products").select("*").eq("status", "approved").eq("featured", true).limit(4);
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
    navigate(`/product/${product.id}`);
  };

  if (isLoading) {
    return (
      <section className="py-12 md:py-[60px] bg-secondary">
        <div className="storefront-shell">
          <div className="flex items-center justify-center h-[300px]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-10 w-10 text-accent/50" />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (saleProducts.length === 0) return null;

  return (
    <section className="py-12 md:py-[60px] bg-secondary">
      <div className="storefront-shell">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-accent mb-3 block font-bold">
            Featured finds
          </span>
          <h2 className="font-display font-black text-gradient-warm">Sale Products</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Compare featured products and explore current offers.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {saleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer rounded-lg border border-primary/10 bg-card p-2 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-muted mb-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    product.images[1] ? "group-hover:opacity-0" : ""
                  }`}
                  loading="lazy"
                />
                {product.images[1] && (
                  <img
                    src={product.images[1]}
                    alt={`${product.name} alternate view`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] uppercase tracking-wider px-3 py-1 font-bold flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Sale
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 lg:group-focus-within:translate-y-0 transition-transform duration-300">
                  <Button
                    onClick={(e) => handleAddToCart(e, product)}
                    size="sm"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-none text-xs uppercase tracking-wider font-bold"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1.5" />
                    Choose options
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                {product.brand && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    {product.brand}
                  </p>
                )}
                <h3 className="font-sans font-medium text-sm text-foreground group-hover:text-accent transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm font-black text-accent">
                  {formatPrice(product.price)}
                </p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-xs text-muted-foreground"><span className="line-through mr-2">{formatPrice(product.original_price)}</span><span className="text-accent font-bold">Save {Math.round((1 - product.price / product.original_price) * 100)}%</span></p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/products?filter=sale")}
            className="rounded-none px-10 py-5 uppercase tracking-widest text-xs border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all font-bold"
          >
            View All Sale Items
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default SaleProductsSection;
