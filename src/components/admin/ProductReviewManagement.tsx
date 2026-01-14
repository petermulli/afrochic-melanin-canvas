import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Search, CheckCircle, XCircle, Eye, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface PendingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  seller_id: string;
  created_at: string;
  status: string;
}

const ProductReviewManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  useEffect(() => {
    fetchProducts();
  }, [filterStatus]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const approveProduct = async (product: PendingProduct) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "approved", admin_notes: null })
        .eq("id", product.id);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "approve_product",
        target_type: "product",
        target_id: product.id,
        details: { product_name: product.name },
      });

      toast.success(`"${product.name}" has been approved and is now live`);
      setReviewDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error("Failed to approve product");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectProduct = async (product: PendingProduct) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "rejected", admin_notes: rejectionReason })
        .eq("id", product.id);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "reject_product",
        target_type: "product",
        target_id: product.id,
        details: { product_name: product.name, reason: rejectionReason },
      });

      toast.success(`"${product.name}" has been rejected`);
      setReviewDialogOpen(false);
      setSelectedProduct(null);
      setRejectionReason("");
      fetchProducts();
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast.error("Failed to reject product");
    } finally {
      setActionLoading(false);
    }
  };

  const openReviewDialog = (product: PendingProduct) => {
    setSelectedProduct(product);
    setRejectionReason("");
    setReviewDialogOpen(true);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = products.filter(p => p.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              Product Review Queue
              {pendingCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {pendingCount} pending
                </Badge>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
              >
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </Button>
              <Button
                variant={filterStatus === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("approved")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approved
              </Button>
              <Button
                variant={filterStatus === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("rejected")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejected
              </Button>
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {filterStatus === "pending" 
                        ? "No products pending review" 
                        : "No products found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>KSh {product.price.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewDialog(product)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Link to={`/product/${product.id}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Product</DialogTitle>
            <DialogDescription>
              Review this product and approve or reject it for the shop.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              {/* Product Images */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedProduct.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Product ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>

              {/* Product Details */}
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 capitalize">{selectedProduct.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="ml-2 font-medium">KSh {selectedProduct.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Current Status:</span>
                  {getStatusBadge(selectedProduct.status)}
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedProduct.status === "pending" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Rejection Reason (required if rejecting)
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this product is being rejected..."
                    rows={3}
                  />
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                {selectedProduct.status === "pending" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => rejectProduct(selectedProduct)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={() => approveProduct(selectedProduct)}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </>
                )}
                {selectedProduct.status === "rejected" && (
                  <Button
                    onClick={() => approveProduct(selectedProduct)}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve Now
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReviewManagement;
