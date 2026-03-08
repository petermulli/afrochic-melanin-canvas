import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  images: string[];
}

interface Recommendation {
  id: string;
  product_id: string;
  recommended_product_id: string;
  incentive_text: string | null;
  sort_order: number;
  product_name?: string;
  recommended_name?: string;
  recommended_image?: string;
}

const RecommendationsManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedRecommended, setSelectedRecommended] = useState("");
  const [incentiveText, setIncentiveText] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [adding, setAdding] = useState(false);

  // Filter
  const [filterProduct, setFilterProduct] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: prods }, { data: recs }] = await Promise.all([
        supabase.from("products").select("id, name, images").eq("status", "approved").order("name"),
        supabase.from("product_recommendations").select("*").order("sort_order"),
      ]);

      setProducts(prods || []);

      // Enrich recommendations with product names
      const enriched = (recs || []).map((rec: any) => {
        const prod = (prods || []).find((p: any) => p.id === rec.product_id);
        const recProd = (prods || []).find((p: any) => p.id === rec.recommended_product_id);
        return {
          ...rec,
          product_name: prod?.name || rec.product_id,
          recommended_name: recProd?.name || rec.recommended_product_id,
          recommended_image: recProd?.images?.[0],
        };
      });

      setRecommendations(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedProduct || !selectedRecommended || !user) {
      toast.error("Please select both products");
      return;
    }
    if (selectedProduct === selectedRecommended) {
      toast.error("Cannot recommend a product to itself");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.from("product_recommendations").insert({
        product_id: selectedProduct,
        recommended_product_id: selectedRecommended,
        incentive_text: incentiveText.trim() || null,
        sort_order: parseInt(sortOrder) || 0,
        created_by: user.id,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This recommendation already exists");
        } else {
          throw error;
        }
      } else {
        toast.success("Recommendation added");
        setSelectedRecommended("");
        setIncentiveText("");
        setSortOrder("0");
        fetchData();
      }
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
      toast.success("Recommendation removed");
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const filtered = filterProduct === "all"
    ? recommendations
    : recommendations.filter((r) => r.product_id === filterProduct);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Cross-Sell Recommendations
          </CardTitle>
          <CardDescription>
            Add product recommendations with incentive messages to boost cross-selling. These appear on product detail pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Source Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue placeholder="When viewing..." /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name.substring(0, 40)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Recommend This</Label>
              <Select value={selectedRecommended} onValueChange={setSelectedRecommended}>
                <SelectTrigger><SelectValue placeholder="Suggest buying..." /></SelectTrigger>
                <SelectContent>
                  {products
                    .filter((p) => p.id !== selectedProduct)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name.substring(0, 40)}
                      </SelectItem>
                    ))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Incentive Message</Label>
              <Input
                placeholder="e.g. Free shipping when bundled!"
                value={incentiveText}
                onChange={(e) => setIncentiveText(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sort Order</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleAdd} disabled={adding} className="h-10">
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Active Recommendations ({recommendations.length})</CardTitle>
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name.substring(0, 30)}
                  </SelectItem>
                ))}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No recommendations yet. Add one above to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source Product</TableHead>
                    <TableHead>Recommended</TableHead>
                    <TableHead>Incentive</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium text-sm">{rec.product_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {rec.recommended_image && (
                            <img src={rec.recommended_image} alt="" className="w-8 h-8 rounded object-cover" />
                          )}
                          <span className="text-sm">{rec.recommended_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rec.incentive_text || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{rec.sort_order}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rec.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}</TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationsManagement;
