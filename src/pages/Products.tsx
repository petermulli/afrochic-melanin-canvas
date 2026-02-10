import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WaitlistDialog from "@/components/WaitlistDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Bell, X, SlidersHorizontal } from "lucide-react";
import { productCategories, categoryGroups, getCategoryLabel } from "@/data/productCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  brand?: string;
  seller_id?: string | null;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [sortBy, setSortBy] = useState("alphabetical");
  const [brandFilter, setBrandFilter] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Get filter params from URL
  const categoryParam = searchParams.get("category");
  const groupParam = searchParams.get("group");
  const featuredParam = searchParams.get("featured");
  const brandParam = searchParams.get("brand");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (brandParam) {
      setBrandFilter(brandParam);
    }
  }, [brandParam]);

  const fetchProducts = async () => {
    try {
      // Only fetch approved products for the public shop
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "approved")
        .order("name", { ascending: true });

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

  // Get unique brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach(p => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by brand
    if (brandFilter) {
      filtered = filtered.filter((p) => 
        p.brand?.toLowerCase() === brandFilter.toLowerCase()
      );
    }
    
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
    
    // Filter by search query (searches brand, category, and product name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query))
      );
    }

    // Sort products
    switch (sortBy) {
      case "alphabetical":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "brand":
        filtered = [...filtered].sort((a, b) => {
          const brandCompare = (a.brand || "").localeCompare(b.brand || "");
          if (brandCompare !== 0) return brandCompare;
          return a.name.localeCompare(b.name);
        });
        break;
      case "category":
        filtered = [...filtered].sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category);
          if (catCompare !== 0) return catCompare;
          return a.name.localeCompare(b.name);
        });
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
    }
    
    return filtered;
  }, [products, categoryParam, groupParam, featuredParam, searchQuery, sortBy, brandFilter]);

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery("");
    setBrandFilter("");
    setSortBy("alphabetical");
  };

  const hasActiveFilters = categoryParam || groupParam || featuredParam || brandFilter;

  // Get display title based on filters
  const getPageTitle = () => {
    if (featuredParam === "true") return "Bestsellers";
    if (brandFilter) return brandFilter;
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

  // Filter Sheet Content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alphabetical">A - Z</SelectItem>
            <SelectItem value="brand">Brand</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Brand</label>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Brands</SelectItem>
              {availableBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select 
          value={categoryParam || ""} 
          onValueChange={(value) => {
            if (value) {
              setSearchParams({ category: value });
            } else {
              searchParams.delete("category");
              setSearchParams(searchParams);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {availableCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );

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

        {/* Search and Filters Bar */}
        <div className="max-w-4xl mx-auto mb-6 md:mb-8 animate-fade-in-up px-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by brand, category, or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full border-2 focus-visible:ring-primary"
              />
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabetical">A - Z</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {availableBrands.length > 0 && (
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="w-40 h-12">
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Brands</SelectItem>
                    {availableBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Mobile Filters Button */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden h-12 w-12">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 animate-fade-in-up">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {brandFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {brandFilter}
                <button onClick={() => setBrandFilter("")} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {categoryParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {getCategoryLabel(categoryParam)}
                <button onClick={() => {
                  searchParams.delete("category");
                  setSearchParams(searchParams);
                }} className="hover:bg-primary/20 rounded-full p-0.5">
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
          {sortBy === "alphabetical" && " (A-Z)"}
          {sortBy === "brand" && " (by Brand)"}
          {sortBy === "category" && " (by Category)"}
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
