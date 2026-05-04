import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, Search, Trash2, Upload, Image as ImageIcon, Pencil } from "lucide-react";

interface ApprovedProduct {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[];
  skin_types: string[];
  treats: string[];
  image_url: string | null;
  created_at: string;
}

const ApprovedProductsManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ApprovedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: "",
    skin_types: "",
    treats: "",
    image_url: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("approved_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching approved products:", error);
      toast.error("Failed to fetch approved products");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `approved-${Date.now()}.${fileExt}`;
      const filePath = `approved-products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: urlData.publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ingredients: "",
      skin_types: "",
      treats: "",
      image_url: "",
    });
    setEditingId(null);
  };

  const openEdit = (product: ApprovedProduct) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      ingredients: product.ingredients.join(", "),
      skin_types: product.skin_types.join(", "),
      treats: product.treats.join(", "),
      image_url: product.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        ingredients: formData.ingredients.split(",").map((i) => i.trim()).filter(Boolean),
        skin_types: formData.skin_types.split(",").map((s) => s.trim()).filter(Boolean),
        treats: formData.treats.split(",").map((t) => t.trim()).filter(Boolean),
        image_url: formData.image_url || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("approved_products")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;

        await supabase.from("admin_action_logs").insert({
          admin_id: user?.id,
          action_type: "update_approved_product",
          target_type: "approved_product",
          target_id: editingId,
          details: { product_name: formData.name },
        });
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("approved_products").insert({
          ...payload,
          created_by: user?.id,
        });
        if (error) throw error;

        await supabase.from("admin_action_logs").insert({
          admin_id: user?.id,
          action_type: "add_approved_product",
          target_type: "approved_product",
          details: { product_name: formData.name },
        });
        toast.success("Product added to approved catalog");
      }

      resetForm();
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("approved_products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "delete_approved_product",
        target_type: "approved_product",
        target_id: id,
        details: { product_name: name },
      });

      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product removed from catalog");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ingredients.some((i) =>
        i.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      p.skin_types.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      p.treats.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <span>Approved Products Catalog</span>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Approved Product" : "Add Approved Product"}</DialogTitle>
                  <DialogDescription>
                    Add a product to the approved catalog. Users can search for these products.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="flex items-center gap-4">
                      {formData.image_url ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img
                            src={formData.image_url}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => setFormData({ ...formData, image_url: "" })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={imageUploading}
                          className="max-w-[200px]"
                        />
                        {imageUploading && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Uploading...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Hyaluronic Acid Serum"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Brief description of the product..."
                      rows={3}
                    />
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-2">
                    <Label htmlFor="ingredients">
                      Ingredients (comma-separated)
                    </Label>
                    <Textarea
                      id="ingredients"
                      value={formData.ingredients}
                      onChange={(e) =>
                        setFormData({ ...formData, ingredients: e.target.value })
                      }
                      placeholder="e.g., Hyaluronic Acid, Vitamin C, Niacinamide, Aloe Vera"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate each ingredient with a comma
                    </p>
                  </div>

                  {/* Skin Types */}
                  <div className="space-y-2">
                    <Label htmlFor="skin_types">
                      Perfect For (Skin Types - comma-separated)
                    </Label>
                    <Input
                      id="skin_types"
                      value={formData.skin_types}
                      onChange={(e) =>
                        setFormData({ ...formData, skin_types: e.target.value })
                      }
                      placeholder="e.g., Oily, Dry, Combination, Sensitive"
                    />
                  </div>

                  {/* Treats */}
                  <div className="space-y-2">
                    <Label htmlFor="treats">
                      What It Treats (comma-separated)
                    </Label>
                    <Input
                      id="treats"
                      value={formData.treats}
                      onChange={(e) =>
                        setFormData({ ...formData, treats: e.target.value })
                      }
                      placeholder="e.g., Acne, Dark Spots, Fine Lines, Dryness"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editingId ? "Saving..." : "Adding..."}
                        </>
                      ) : (
                        editingId ? "Save Changes" : "Add Product"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">{filteredProducts.length} products</Badge>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Skin Types</TableHead>
                  <TableHead className="hidden lg:table-cell">Treats</TableHead>
                  <TableHead className="hidden xl:table-cell">Ingredients</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No approved products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {product.skin_types.slice(0, 2).map((type, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {product.skin_types.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.skin_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {product.treats.slice(0, 2).map((treat, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {treat}
                            </Badge>
                          ))}
                          {product.treats.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.treats.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                          {product.ingredients.join(", ") || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{product.name}" from
                                the approved catalog?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProduct(product.id, product.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovedProductsManagement;
