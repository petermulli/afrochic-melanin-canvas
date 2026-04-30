import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductReviews from "@/components/ProductReviews";
import ProductCrossSell from "@/components/ProductCrossSell";
import ProductAlternatives from "@/components/ProductAlternatives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingCart, ArrowLeft, Loader2, Star, Store, MapPin, Droplet, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface SellerProfile {
  business_name: string;
  shop_name: string | null;
  rating: number;
  total_ratings: number;
}

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
  seller_id?: string;
  size_ml?: number | null;
  location?: string | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) { setLoading(false); return; }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        setProduct(data);

        if (data?.seller_id) {
          const { data: sellerData } = await supabase
            .from("seller_profiles")
            .select("business_name, shop_name, rating, total_ratings")
            .eq("user_id", data.seller_id)
            .maybeSingle();

          if (sellerData) setSellerProfile(sellerData);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.shades && product.shades.length > 0 && !selectedShade) {
      toast.error("Please select a shade");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      shade: selectedShade || undefined,
    });
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
            <Button onClick={() => navigate("/products")}>Back to Products</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sellerDisplayName = sellerProfile?.shop_name || sellerProfile?.business_name;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-6 hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Smaller Image + Seller Link */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="aspect-[4/5] max-w-xs mx-auto rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden transition-all ${
                      selectedImage === index
                        ? "ring-2 ring-primary ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Seller Card under images */}
            {sellerProfile && product.seller_id && (
              <Link
                to={`/shop/${product.seller_id}`}
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group max-w-xs mx-auto"
              >
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium group-hover:text-primary transition-colors truncate">
                    {sellerDisplayName}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {sellerProfile.rating > 0 ? (
                      <>
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span>{sellerProfile.rating.toFixed(1)} ({sellerProfile.total_ratings} reviews)</span>
                      </>
                    ) : (
                      <span>New Seller</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-primary font-medium">Visit Shop →</span>
              </Link>
            )}
          </div>

          {/* RIGHT COLUMN: Product Info + Cross-Sell + Add to Cart + Reviews */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">{product.name}</h1>
              <p className="text-2xl md:text-3xl font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Shade Selector */}
            {product.shades && product.shades.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Select Shade</h3>
                  {selectedShade && (
                    <span className="text-sm text-muted-foreground">{selectedShade}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.shades.map((shade) => (
                    <button
                      key={shade}
                      onClick={() => setSelectedShade(shade)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        selectedShade === shade
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {shade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide">Benefits</h3>
                <ul className="space-y-1.5">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start">
                      <Check className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide">Key Ingredients</h3>
                <p className="text-sm text-muted-foreground">{product.ingredients.join(", ")}</p>
              </div>
            )}

            {/* Cross-Sell Recommendations */}
            <ProductCrossSell productId={product.id} productName={product.name} />

            {/* Add to Cart */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full rounded-none border-2 border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground transition-all py-6 text-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            {/* Reviews Section */}
            <div className="pt-4">
              <ProductReviews productId={product.id} productName={product.name} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
