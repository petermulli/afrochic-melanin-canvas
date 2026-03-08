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
      const { data, error } = await supabase
        .from("products").select("*").eq("status", "approved")
        .order("created_at", { ascending: false }).limit(4);
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
      addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0] });
      toast.success(`${product.name} added to cart`);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-[300px]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-10 w-10 text-primary/50" />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (newProducts.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-bold">
            ⚡ Just Dropped — Be First To Try
          </span>
          <h2 className="font-serif">New Arrivals</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Fresh products added this week. Get them before they sell out.
          </p>
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
              <div className="relative aspect-square overflow-hidden bg-muted mb-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-3 py-1 font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  New
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Button
                    onClick={(e) => handleAddToCart(e, product)}
                    size="sm"
                    className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none text-xs uppercase tracking-wider font-bold"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1.5" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                {product.brand && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    {product.brand}
                  </p>
                )}
                <h3 className="font-sans font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-foreground">
                  {formatPrice(product.price)}
                </p>
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
            onClick={() => navigate("/products?sort=newest")}
            className="rounded-none px-10 py-5 uppercase tracking-widest text-xs border-2 border-foreground hover:bg-foreground hover:text-background transition-all font-bold"
          >
            View All New Arrivals
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewProductsSection;
