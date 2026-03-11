import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Loader2, Link2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface Recommendation {
  id: string;
  product_id: string;
  recommended_product_id: string;
  incentive_text: string | null;
  sort_order: number;
  recommended_name?: string;
  recommended_image?: string;
  recommended_price?: number;
}

const SellerComplementaryProducts = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [allApprovedProducts, setAllApprovedProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSource, setSelectedSource] = useState("");
  const [selectedComplement, setSelectedComplement] = useState("");
  const [incentiveText, setIncentiveText] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [{ data: mine }, { data: allProds }, { data: recs }] = await Promise.all([
        supabase.from("products").select("id, name, price, images").eq("seller_id", user.id).order("name"),
        supabase.from("products").select("id, name, price, images").eq("status", "approved").order("name"),
        supabase.from("product_recommendations").select("*").order("sort_order"),
      ]);

      const myProds = mine || [];
      const approved = allProds || [];
      setMyProducts(myProds);
      setAllApprovedProducts(approved);

      // Filter recs to only show ones where source is seller's product
      const myProductIds = new Set(myProds.map((p) => p.id));
      const myRecs = (recs || [])
        .filter((r: any) => myProductIds.has(r.product_id))
        .map((rec: any) => {
          const recProd = approved.find((p) => p.id === rec.recommended_product_id);
          return {
            ...rec,
            recommended_name: recProd?.name || rec.recommended_product_id,
            recommended_image: recProd?.images?.[0],
            recommended_price: recProd?.price,
          };
        });

      setRecommendations(myRecs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedSource || !selectedComplement || !user) {
      toast.error("Please select both products");
      return;
    }
    if (selectedSource === selectedComplement) {
      toast.error("Cannot link a product to itself");
      return;
    }

    // Check if already exists
    const exists = recommendations.find(
      (r) => r.product_id === selectedSource && r.recommended_product_id === selectedComplement
    );
    if (exists) {
      toast.error("This pairing already exists");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.from("product_recommendations").insert({
        product_id: selectedSource,
        recommended_product_id: selectedComplement,
        incentive_text: incentiveText.trim() || null,
        sort_order: 0,
        created_by: user.id,
      });

      if (error) throw error;
      toast.success("Complementary product linked!");
      setSelectedComplement("");
      setIncentiveText("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("product_recommendations").delete().eq("id", id);
      if (error) throw error;
      toast.success("Link removed");
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    }
  };

  // Group recommendations by source product
  const grouped = myProducts
    .filter((p) => recommendations.some((r) => r.product_id === p.id))
    .map((p) => ({
      product: p,
      recs: recommendations.filter((r) => r.product_id === p.id),
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (myProducts.length === 0) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            Complementary Products
          </CardTitle>
          <CardDescription>
            Link products that go well together. When a customer views one, the other will be suggested before checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Your Product</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {myProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name.substring(0, 35)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Complements With</Label>
              <Select value={selectedComplement} onValueChange={setSelectedComplement}>
                <SelectTrigger>
                  <SelectValue placeholder="Select complement..." />
                </SelectTrigger>
                <SelectContent>
                  {allApprovedProducts
                    .filter((p) => p.id !== selectedSource)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name.substring(0, 35)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Incentive (optional)</Label>
              <Input
                placeholder="e.g., Better results together!"
                value={incentiveText}
                onChange={(e) => setIncentiveText(e.target.value)}
              />
            </div>
            <Button onClick={handleAdd} disabled={adding} className="h-10">
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Links */}
      {grouped.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Active Links ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {grouped.map(({ product, recs }) => (
              <div key={product.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <img src={product.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                  <span className="font-medium text-sm">{product.name}</span>
                </div>
                <div className="pl-10 space-y-2">
                  {recs.map((rec) => (
                    <div key={rec.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      {rec.recommended_image && (
                        <img src={rec.recommended_image} alt="" className="w-10 h-10 rounded object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{rec.recommended_name}</p>
                        {rec.recommended_price && (
                          <p className="text-xs text-primary">{formatPrice(rec.recommended_price)}</p>
                        )}
                        {rec.incentive_text && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {rec.incentive_text}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rec.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SellerComplementaryProducts;
