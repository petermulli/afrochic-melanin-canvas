import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Loader2 } from "lucide-react";

interface AlternativeProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

interface Props {
  productId: string;
  category: string;
}

const ProductAlternatives = ({ productId, category }: Props) => {
  const [items, setItems] = useState<AlternativeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchAlternatives = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, images, category")
        .eq("status", "approved")
        .eq("category", category)
        .neq("id", productId)
        .limit(6);
      setItems(data || []);
      setLoading(false);
    };
    fetchAlternatives();
  }, [productId, category]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="border-t border-border pt-10 mt-10">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2">You might also like</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Alternatives and pairings in the same category
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="group block"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-sm font-semibold text-primary mt-1">
              {formatPrice(item.price)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ProductAlternatives;
