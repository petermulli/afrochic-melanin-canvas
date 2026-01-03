import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Package, TrendingUp } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  seller_id?: string;
}

const CATEGORIES = [
  "Foundation",
  "Lipstick",
  "Eyeshadow",
  "Skincare",
  "Blush",
  "Concealer",
  "Mascara",
  "Primer",
  "Setting Spray",
  "Body Care",
  "Lip Gloss",
  "Highlighter",
  "Bronzer",
  "Contour",
  "Brows",
  "Eyeliner",
];

const Seller = () => {
  const { user } = useAuth();
  const { isSeller, isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    images: [] as string[],
    shades: "",
    featured: false,
    benefits: "",
    ingredients: "",
  });

  useEffect(() => {
    if (!roleLoading && !isSeller && !isAdmin) {
      toast.error("Access denied. Seller privileges required.");
      navigate("/");
    }
  }, [isSeller, isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if ((isSeller || isAdmin) && user) {
      fetchMyProducts();
    }
  }, [isSeller, isAdmin, user]);

  const fetchMyProducts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch your products");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user?.id}-${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      toast.success("Images uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (formData.images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    const productData = {
      id: formData.id || `product-${user.id}-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      images: formData.images,
      shades: formData.shades ? formData.shades.split(",").map((s) => s.trim()) : null,
      featured: false, // Sellers cannot feature products
      benefits: formData.benefits ? formData.benefits.split(",").map((s) => s.trim()) : null,
      ingredients: formData.ingredients ? formData.ingredients.split(",").map((s) => s.trim()) : null,
      seller_id: user.id,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)
          .eq("seller_id", user.id);

        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;
        toast.success("Product added successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchMyProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      images: product.images,
      shades: product.shades?.join(", ") || "",
      featured: product.featured,
      benefits: product.benefits?.join(", ") || "",
      ingredients: product.ingredients?.join(", ") || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("seller_id", user?.id);

      if (error) throw error;
      toast.success("Product deleted successfully");
      fetchMyProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      price: "",
      category: "",
      images: [],
      shades: "",
      featured: false,
      benefits: "",
      ingredients: "",
    });
    setEditingProduct(null);
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSeller && !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              My Products
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold">My Products</h2>
                  <p className="text-muted-foreground mt-1">
                    Manage your product listings
                  </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (KSh) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({ ...formData, price: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          rows={3}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="images">Product Images *</Label>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {formData.images.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={url}
                                alt={`Product ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    images: formData.images.filter((_, i) => i !== idx),
                                  })
                                }
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                          {uploading && <span className="text-sm">Uploading...</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shades">Shades (comma-separated)</Label>
                        <Input
                          id="shades"
                          value={formData.shades}
                          onChange={(e) =>
                            setFormData({ ...formData, shades: e.target.value })
                          }
                          placeholder="e.g., Honey, Caramel, Espresso"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="benefits">Benefits (comma-separated)</Label>
                        <Textarea
                          id="benefits"
                          value={formData.benefits}
                          onChange={(e) =>
                            setFormData({ ...formData, benefits: e.target.value })
                          }
                          placeholder="e.g., Long-lasting, Buildable coverage"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ingredients">
                          Key Ingredients (comma-separated)
                        </Label>
                        <Textarea
                          id="ingredients"
                          value={formData.ingredients}
                          onChange={(e) =>
                            setFormData({ ...formData, ingredients: e.target.value })
                          }
                          placeholder="e.g., Shea Butter, Vitamin E"
                          rows={2}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setDialogOpen(false);
                            resetForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={uploading}>
                          {editingProduct ? "Update Product" : "Add Product"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-card rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No products yet. Add your first product to start selling.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>
                            {product.featured ? (
                              <Badge variant="secondary">Featured</Badge>
                            ) : (
                              <Badge variant="outline">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Featured</p>
                  <p className="text-3xl font-bold">
                    {products.filter((p) => p.featured).length}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Seller;
