import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import OfficialStoreBadge from "@/components/OfficialStoreBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Star, MapPin, Phone, Mail, Store, ShieldCheck } from "lucide-react";

interface SellerData {
  business_name: string;
  shop_name: string | null;
  business_description: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address_line: string | null;
  rating: number | null;
  total_ratings: number | null;
  map_coordinates: any;
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
  brand?: string;
  seller_id?: string | null;
}

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    
    const fetchData = async () => {
      try {
        const [sellerRes, productsRes] = await Promise.all([
          supabase
            .from("seller_profiles")
            .select("business_name, shop_name, business_description, phone, email, city, address_line, rating, total_ratings, map_coordinates")
            .eq("user_id", sellerId)
            .maybeSingle(),
          supabase
            .from("products")
            .select("*")
            .eq("seller_id", sellerId)
            .eq("status", "approved")
            .order("name"),
        ]);

        if (sellerRes.data) setSeller(sellerRes.data);
        if (productsRes.data) setProducts(productsRes.data);
      } catch (error) {
        console.error("Error fetching seller:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

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

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Shop not found</h1>
            <Button onClick={() => navigate("/products")}>Back to Products</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = seller.shop_name || seller.business_name;
  const coords = seller.map_coordinates as { lat: number; lng: number } | null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-primary/10 via-muted to-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6 hover:bg-background/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Store Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                <Store className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-serif tracking-tight">{displayName}</h1>
                  <OfficialStoreBadge variant="compact" />
                </div>

                {seller.rating && seller.rating > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(seller.rating!)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {seller.rating!.toFixed(1)} ({seller.total_ratings} reviews)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Verified Seller</span>
                  </div>
                )}

                {seller.business_description && (
                  <p className="text-muted-foreground max-w-2xl leading-relaxed">
                    {seller.business_description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 pt-2">
                  {seller.city && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{seller.address_line ? `${seller.address_line}, ${seller.city}` : seller.city}</span>
                    </div>
                  )}
                  {seller.phone && (
                    <a href={`tel:${seller.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{seller.phone}</span>
                    </a>
                  )}
                  {seller.email && (
                    <a href={`mailto:${seller.email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{seller.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        {coords && coords.lat && coords.lng && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-xl font-serif tracking-tight mb-4">Store Location</h2>
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm h-[300px] md:h-[400px]">
              <iframe
                title="Store Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${coords.lng}!3d${coords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2ske!4v1700000000000`}
              />
            </div>
          </div>
        )}

        {/* If no coordinates but has city, show a general map */}
        {(!coords || !coords.lat) && seller.city && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-xl font-serif tracking-tight mb-4">Store Location</h2>
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm h-[300px] md:h-[400px]">
              <iframe
                title="Store Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(seller.city + ', Kenya')}`}
              />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h2 className="text-xl font-serif tracking-tight mb-6">
            Products by {displayName}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({products.length} {products.length === 1 ? "product" : "products"})
            </span>
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-2xl">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products listed yet</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerProfile;
