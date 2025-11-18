import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Package, ArrowUpCircle, ArrowDownCircle, Edit, AlertTriangle, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  reorder_level: number;
  reorder_quantity: number;
  unit_price: number;
  updated_at: string;
}

interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  notes: string | null;
  created_at: string;
}

const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    quantity: 0,
    reorder_level: 10,
    reorder_quantity: 50,
    unit_price: 0,
  });

  const [movementData, setMovementData] = useState({
    movement_type: "in",
    quantity: 0,
    notes: "",
  });

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("product_name", { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_movements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMovements(data || []);
    } catch (error: any) {
      console.error("Error fetching movements:", error);
    }
  };

  const handleAddInventory = async () => {
    try {
      const { error } = await supabase
        .from("inventory")
        .insert([formData]);

      if (error) throw error;

      toast.success("Inventory item added successfully");
      setAddDialogOpen(false);
      resetForm();
      fetchInventory();
    } catch (error: any) {
      console.error("Error adding inventory:", error);
      toast.error("Failed to add inventory item");
    }
  };

  const handleUpdateInventory = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from("inventory")
        .update({
          product_name: formData.product_name,
          reorder_level: formData.reorder_level,
          reorder_quantity: formData.reorder_quantity,
          unit_price: formData.unit_price,
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      toast.success("Inventory item updated successfully");
      setEditDialogOpen(false);
      setSelectedItem(null);
      resetForm();
      fetchInventory();
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      toast.error("Failed to update inventory item");
    }
  };

  const handleStockMovement = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase.rpc("update_inventory_stock", {
        _product_id: selectedItem.product_id,
        _movement_type: movementData.movement_type,
        _quantity: movementData.quantity,
        _notes: movementData.notes || null,
      });

      if (error) throw error;

      toast.success("Stock movement recorded successfully");
      setMovementDialogOpen(false);
      setSelectedItem(null);
      setMovementData({ movement_type: "in", quantity: 0, notes: "" });
      fetchInventory();
      fetchMovements();
    } catch (error: any) {
      console.error("Error recording stock movement:", error);
      toast.error("Failed to record stock movement");
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      product_name: "",
      quantity: 0,
      reorder_level: 10,
      reorder_quantity: 50,
      unit_price: 0,
    });
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      reorder_level: item.reorder_level,
      reorder_quantity: item.reorder_quantity,
      unit_price: item.unit_price,
    });
    setEditDialogOpen(true);
  };

  const openMovementDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementDialogOpen(true);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.reorder_level);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <Badge className="bg-red-500">Out of Stock</Badge>;
    } else if (item.quantity <= item.reorder_level) {
      return <Badge className="bg-yellow-500">Low Stock</Badge>;
    }
    return <Badge className="bg-green-500">In Stock</Badge>;
  };

  const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStockLevels = () => {
    const headers = ["Product ID", "Product Name", "Quantity", "Status", "Reorder Level", "Reorder Quantity", "Unit Price", "Total Value"];
    const rows = inventory.map(item => [
      item.product_id,
      item.product_name,
      item.quantity,
      item.quantity === 0 ? "Out of Stock" : item.quantity <= item.reorder_level ? "Low Stock" : "In Stock",
      item.reorder_level,
      item.reorder_quantity,
      item.unit_price,
      (item.quantity * item.unit_price).toFixed(2),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    downloadCSV(csv, `inventory-stock-levels-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Stock levels report exported");
  };

  const exportMovementsHistory = () => {
    const headers = ["Date", "Product ID", "Movement Type", "Quantity", "Notes"];
    const rows = movements.map(movement => [
      new Date(movement.created_at).toLocaleString(),
      movement.product_id,
      movement.movement_type,
      movement.quantity,
      movement.notes || "",
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    downloadCSV(csv, `inventory-movements-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Movements history exported");
  };

  const exportValuationReport = () => {
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const headers = ["Product ID", "Product Name", "Quantity", "Unit Price (KES)", "Total Value (KES)", "% of Total"];
    const rows = inventory.map(item => {
      const itemValue = item.quantity * item.unit_price;
      return [
        item.product_id,
        item.product_name,
        item.quantity,
        item.unit_price.toFixed(2),
        itemValue.toFixed(2),
        ((itemValue / totalValue) * 100).toFixed(2) + "%",
      ];
    });
    
    rows.push(["", "", "", "TOTAL", totalValue.toFixed(2), "100%"]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    downloadCSV(csv, `inventory-valuation-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Valuation report exported");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const lowStockItems = getLowStockItems();

  return (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>{lowStockItems.length}</strong> product(s) need reordering:{" "}
            {lowStockItems.map(item => item.product_name).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Track and manage product stock levels</CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Reports
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportStockLevels}>
                    Stock Levels Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportMovementsHistory}>
                    Movements History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportValuationReport}>
                    Valuation Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>Add a new product to inventory tracking</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="product_id">Product ID</Label>
                    <Input
                      id="product_id"
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                      placeholder="e.g., PROD001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product_name">Product Name</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Initial Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reorder_level">Reorder Level</Label>
                    <Input
                      id="reorder_level"
                      type="number"
                      value={formData.reorder_level}
                      onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
                    <Input
                      id="reorder_quantity"
                      type="number"
                      value={formData.reorder_quantity}
                      onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit_price">Unit Price (KES)</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddInventory} className="w-full">
                    Add to Inventory
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inventory items yet. Add your first product to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.product_id}</TableCell>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{getStockStatus(item)}</TableCell>
                      <TableCell>{item.reorder_level}</TableCell>
                      <TableCell>KES {item.unit_price.toLocaleString()}</TableCell>
                      <TableCell>
                        KES {(item.quantity * item.unit_price).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMovementDialog(item)}
                          >
                            <ArrowUpCircle className="h-4 w-4 mr-1" />
                            Stock
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update inventory item details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_product_name">Product Name</Label>
              <Input
                id="edit_product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_reorder_level">Reorder Level</Label>
              <Input
                id="edit_reorder_level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="edit_reorder_quantity">Reorder Quantity</Label>
              <Input
                id="edit_reorder_quantity"
                type="number"
                value={formData.reorder_quantity}
                onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="edit_unit_price">Unit Price (KES)</Label>
              <Input
                id="edit_unit_price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
              />
            </div>
            <Button onClick={handleUpdateInventory} className="w-full">
              Update Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
            <DialogDescription>
              {selectedItem && `Update stock for ${selectedItem.product_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="movement_type">Movement Type</Label>
              <Select
                value={movementData.movement_type}
                onValueChange={(value) => setMovementData({ ...movementData, movement_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In (Add)</SelectItem>
                  <SelectItem value="out">Stock Out (Remove)</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="movement_quantity">Quantity</Label>
              <Input
                id="movement_quantity"
                type="number"
                value={movementData.quantity}
                onChange={(e) => setMovementData({ ...movementData, quantity: parseInt(e.target.value) })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="movement_notes">Notes (Optional)</Label>
              <Textarea
                id="movement_notes"
                value={movementData.notes}
                onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
                placeholder="Add any notes about this stock movement..."
              />
            </div>
            <Button onClick={handleStockMovement} className="w-full">
              Record Movement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
