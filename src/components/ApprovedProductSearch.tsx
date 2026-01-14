import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle, Image as ImageIcon, Leaf, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ApprovedProduct {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[];
  skin_types: string[];
  treats: string[];
  image_url: string | null;
}

const ApprovedProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ApprovedProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchProducts();
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const searchProducts = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from("approved_products")
        .select("*")
        .or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        )
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Error searching products:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-serif flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Search Approved Products
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Search our catalog of dermatologist-approved skincare products
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name..."
              className="pl-12 py-6 text-lg rounded-none border-2 border-foreground/20 focus:border-primary"
            />
          </div>

          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Searching...
                </div>
              </motion.div>
            ) : hasSearched && results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-muted-foreground"
              >
                <p>No approved products found matching "{searchTerm}"</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {results.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {product.name}
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </h3>
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        </div>

                        {/* Skin Types */}
                        {product.skin_types.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-xs text-muted-foreground mr-1">
                              Perfect for:
                            </span>
                            {product.skin_types.map((type, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* What it treats */}
                        {product.treats.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-xs text-muted-foreground mr-1">
                              Treats:
                            </span>
                            {product.treats.map((treat, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {treat}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Ingredients */}
                        {product.ingredients.length > 0 && (
                          <div className="flex items-start gap-1">
                            <Leaf className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              <span className="font-medium">Ingredients:</span>{" "}
                              {product.ingredients.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovedProductSearch;
