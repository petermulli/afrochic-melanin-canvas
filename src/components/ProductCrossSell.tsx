import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Sparkles, Truck, Tag } from "lucide-react";
import { toast } from "sonner";

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  incentive_text: string | null;
}

interface ProductCrossSellProps {
  productId: string;
  productName: string;
}

const ProductCrossSell = ({ productId, productName }: ProductCrossSellProps) => {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Fetch recommendation links
        const { data: recLinks, error: recError } = await supabase
          .from("product_recommendations")
          .select("recommended_product_id, incentive_text, sort_order")
          .eq("product_id", productId)
          .order("sort_order", { ascending: true });

        if (recError || !recLinks || recLinks.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch the actual product details
        const productIds = recLinks.map((r: any) => r.recommended_product_id);
        const { data: products, error: prodError } = await supabase
          .from("products")
          .select("id, name, price, images, category")
          .in("id", productIds)
          .eq("status", "approved");

        if (prodError || !products) {
          setLoading(false);
          return;
        }

        // Merge incentive text with product data
        const merged = recLinks
          .map((rec: any) => {
            const prod = products.find((p: any) => p.id === rec.recommended_product_id);
            if (!prod) return null;
            return { ...prod, incentive_text: rec.incentive_text };
          })
          .filter(Boolean) as RecommendedProduct[];

        setRecommendations(merged);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  const handleAddToCart = (product: RecommendedProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    toast.success(`${product.name} added to cart`);
  };

  if (loading || recommendations.length === 0) return null;

  const getIncentiveIcon = (text: string | null) => {
    if (!text) return <Sparkles className="h-3.5 w-3.5" />;
    const lower = text.toLowerCase();
    if (lower.includes("shipping") || lower.includes("delivery")) return <Truck className="h-3.5 w-3.5" />;
    if (lower.includes("off") || lower.includes("discount") || lower.includes("save")) return <Tag className="h-3.5 w-3.5" />;
    return <Sparkles className="h-3.5 w-3.5" />;
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-accent/10 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Complete Your Routine
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Frequently paired with {productName}
        </p>
      </div>

      {/* Recommendation Cards */}
      <div className="divide-y divide-border">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 flex gap-3 items-start hover:bg-muted/30 transition-colors">
            {/* Thumbnail */}
            <Link to={`/product/${rec.id}`} className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <img
                  src={rec.images[0]}
                  alt={rec.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${rec.id}`} className="hover:text-primary transition-colors">
                <h4 className="text-sm font-medium leading-tight line-clamp-2">{rec.name}</h4>
              </Link>
              <p className="text-sm font-semibold text-primary mt-1">{formatPrice(rec.price)}</p>

              {/* Incentive Badge */}
              {rec.incentive_text && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-accent font-medium bg-accent/10 rounded-full px-2 py-0.5 w-fit">
                  {getIncentiveIcon(rec.incentive_text)}
                  <span>{rec.incentive_text}</span>
                </div>
              )}
            </div>

            {/* Add Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAddToCart(rec)}
              className="flex-shrink-0 h-8 px-3 text-xs border-primary/30 hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        ))}
      </div>

      {/* Bundle CTA (if 2+ recommendations) */}
      {recommendations.length >= 2 && (
        <div className="p-4 bg-muted/30 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              recommendations.forEach((rec) => handleAddToCart(rec));
              toast.success("All recommended products added to cart!");
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add All to Cart
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCrossSell;
