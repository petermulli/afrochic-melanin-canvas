import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

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
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard = ({ product, compact = false }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

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
      <div className={`relative ${compact ? 'aspect-[3/4]' : 'aspect-square'} overflow-hidden ${compact ? 'rounded-lg' : 'rounded-2xl'} bg-muted ${compact ? 'mb-2' : 'mb-4'}`}>
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
        <Button
          onClick={handleAddToCart}
          size={compact ? "sm" : "icon"}
          className={`absolute ${compact ? 'bottom-2 right-2' : 'bottom-4 right-4'} rounded-full shadow-elevated transition-all duration-300 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <ShoppingCart className={compact ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
      </div>
      <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
        <h3 className={`font-medium ${compact ? 'text-xs md:text-sm' : 'text-base'} text-foreground group-hover:text-primary transition-colors line-clamp-1`}>
          {product.name}
        </h3>
        {!compact && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <p className={`${compact ? 'text-sm md:text-base' : 'text-lg'} font-semibold text-primary`}>
          KES {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
