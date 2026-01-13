import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WaitlistDialog from "@/components/WaitlistDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Bell, X } from "lucide-react";
import { productCategories, categoryGroups, getCategoryLabel } from "@/data/productCategories";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  shades?: string[];
  featured: boolean;
  benefits?: string[];
  ingredients?: string[];
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  // Get filter params from URL
  const categoryParam = searchParams.get("category");
  const groupParam = searchParams.get("group");
  const featuredParam = searchParams.get("featured");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get category IDs for a group
  const getCategoryIdsForGroup = (group: string): string[] => {
    const groupKey = group.toLowerCase().replace("-", "") as keyof typeof categoryGroups;
    return categoryGroups[groupKey] || [];
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (categoryParam) {
      filtered = filtered.filter((p) => 
        p.category.toLowerCase() === categoryParam.toLowerCase()
      );
    }
    
    // Filter by group (multiple categories)
    if (groupParam) {
      const groupCategories = getCategoryIdsForGroup(groupParam);
      filtered = filtered.filter((p) => 
        groupCategories.some(cat => p.category.toLowerCase() === cat.toLowerCase())
      );
    }

    // Filter by featured
    if (featuredParam === "true") {
      filtered = filtered.filter((p) => p.featured);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [products, categoryParam, groupParam, featuredParam, searchQuery]);

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery("");
  };

  const hasActiveFilters = categoryParam || groupParam || featuredParam;

  // Get display title based on filters
  const getPageTitle = () => {
    if (featuredParam === "true") return "Bestsellers";
    if (groupParam) {
      const titles: Record<string, string> = {
        skincare: "Skincare",
        haircare: "Hair Care",
        bodycare: "Body Care",
        sunprotection: "Sun Protection",
        treatments: "Treatments",
      };
      return titles[groupParam] || "Our Collection";
    }
    if (categoryParam) {
      return getCategoryLabel(categoryParam);
    }
    return "Our Collection";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-4">
            {getPageTitle()}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Discover premium cosmetics formulated for the beauty of melanin-rich skin
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6 md:mb-8 animate-fade-in-up px-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full border-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 animate-fade-in-up">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {categoryParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {getCategoryLabel(categoryParam)}
                <button onClick={clearFilters} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {groupParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {groupParam.replace(/([A-Z])/g, ' $1').trim()}
                <button onClick={clearFilters} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {featuredParam === "true" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Bestsellers
                <button onClick={clearFilters} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              Clear all
            </Button>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-center text-sm text-muted-foreground">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </div>

        {/* Product Grid - Responsive */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 md:py-20">
                <div className="max-w-md mx-auto px-4">
                  <p className="text-lg text-muted-foreground mb-4">
                    No products found matching your search
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Can't find what you're looking for? Let us know and we'll notify you when it's available!
                  </p>
                  <Button onClick={() => setWaitlistOpen(true)} className="gap-2">
                    <Bell className="h-4 w-4" />
                    Join Waitlist
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <WaitlistDialog
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default Products;
