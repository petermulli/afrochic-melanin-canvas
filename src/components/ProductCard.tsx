import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ShoppingCart, Store } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import OfficialStoreBadge from "./OfficialStoreBadge";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  shades?: string[];
  featured?: boolean;
  benefits?: string[];
  ingredients?: string[];
  brand?: string;
  seller_id?: string | null;
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard = ({ product, compact = false }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [shopName, setShopName] = useState<string | null>(null);

  useEffect(() => {
    if (product.seller_id) {
      supabase
        .from("seller_profiles")
        .select("business_name, shop_name")
        .eq("user_id", product.seller_id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setShopName(data.shop_name || data.business_name);
        });
    }
  }, [product.seller_id]);

  const handleAddToCart = (e: React.MouseEvent) => {
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

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) {
          setImageIndex(1);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIndex(0);
      }}
    >
      <div className={`relative ${compact ? 'aspect-[3/4]' : 'aspect-square'} overflow-hidden ${compact ? 'rounded-lg' : 'rounded-2xl'} bg-muted ${compact ? 'mb-2' : 'mb-3'}`}>
        <img
          src={product.images[imageIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-chocolate/40 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Show Official Store badge for seller products */}
        {product.seller_id && (
          <div className="absolute top-2 left-2">
            <OfficialStoreBadge variant="compact" />
          </div>
        )}
      </div>
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        {shopName && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/shop/${product.seller_id}`);
            }}
            className={`flex items-center gap-1 ${compact ? 'text-[10px] md:text-xs' : 'text-xs'} text-primary hover:text-primary/80 transition-colors`}
          >
            <Store className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
            <span className="truncate">{shopName}</span>
          </button>
        )}
        {product.brand && !shopName && (
          <p className={`${compact ? 'text-[10px] md:text-xs' : 'text-xs'} text-muted-foreground uppercase tracking-wide`}>
            {product.brand}
          </p>
        )}
        <h3 className={`font-medium ${compact ? 'text-xs md:text-sm' : 'text-base'} text-foreground group-hover:text-primary transition-colors line-clamp-1`}>
          {product.name}
        </h3>
        {!compact && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <p className={`${compact ? 'text-sm md:text-base' : 'text-lg'} font-semibold text-primary`}>
          {formatPrice(product.price)}
        </p>
        {/* Always visible Add to Cart button - 90 degree edges, outline style, fill on hover */}
        <Button
          onClick={handleAddToCart}
          variant="outline"
          size={compact ? "sm" : "default"}
          className={`w-full rounded-none border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300 ${compact ? 'text-xs py-1' : ''}`}
        >
          <ShoppingCart className={compact ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
