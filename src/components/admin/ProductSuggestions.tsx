import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, TrendingUp } from "lucide-react";

interface ProductSuggestion {
  product: string;
  count: number;
  latestRequest: string;
}

const ProductSuggestions = () => {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();

    const channel = supabase
      .channel('waitlist-suggestions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waitlist' }, () => {
        fetchSuggestions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("product_requested, created_at")
        .eq("is_served", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Aggregate product requests
      const productCounts: Record<string, { count: number; latestRequest: string }> = {};
      
      (data || []).forEach((entry) => {
        const product = entry.product_requested.toLowerCase().trim();
        if (productCounts[product]) {
          productCounts[product].count++;
        } else {
          productCounts[product] = {
            count: 1,
            latestRequest: entry.created_at,
          };
        }
      });

      // Convert to array and sort by count
      const sorted = Object.entries(productCounts)
        .map(([product, data]) => ({
          product,
          count: data.count,
          latestRequest: data.latestRequest,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 suggestions

      setSuggestions(sorted);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Product Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Product Replenishment Suggestions
        </CardTitle>
        <CardDescription>
          Based on customer waitlist requests - consider stocking these products
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No product suggestions yet. Suggestions appear based on waitlist requests.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{suggestion.product}</p>
                    <p className="text-xs text-muted-foreground">
                      Last requested: {new Date(suggestion.latestRequest).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {suggestion.count} {suggestion.count === 1 ? "request" : "requests"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSuggestions;
