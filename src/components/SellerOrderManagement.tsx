import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, Package } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  shade: string | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  payment_method: string;
  shipping_address: any;
}

interface SellerOrderItem extends OrderItem {
  order: Order;
}

const SellerOrderManagement = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orderItems, setOrderItems] = useState<SellerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user]);

  const fetchSellerOrders = async () => {
    if (!user) return;

    try {
      // Fetch order items for products owned by this seller
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("seller_id", user.id);

      if (productsError) throw productsError;

      if (!products || products.length === 0) {
        setOrderItems([]);
        setLoading(false);
        return;
      }

      const productIds = products.map((p) => p.id);

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      // Fetch order details for each unique order
      const orderIds = [...new Set(items?.map((i) => i.order_id) || [])];
      
      if (orderIds.length === 0) {
        setOrderItems([]);
        setLoading(false);
        return;
      }

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .in("id", orderIds);

      if (ordersError) throw ordersError;

      const ordersMap = new Map(orders?.map((o) => [o.id, o]) || []);
      
      const enrichedItems: SellerOrderItem[] = (items || []).map((item) => ({
        ...item,
        order: ordersMap.get(item.order_id)!,
      })).filter((item) => item.order);

      setOrderItems(enrichedItems);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-600";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const viewOrderDetails = async (orderId: string) => {
    const order = orderItems.find((item) => item.order.id === orderId)?.order;
    if (!order) return;

    const items = orderItems.filter((item) => item.order_id === orderId);
    setSelectedOrder(order);
    setSelectedOrderItems(items);
    setDetailsOpen(true);
  };

  // Group items by order
  const groupedOrders = orderItems.reduce((acc, item) => {
    if (!acc.has(item.order_id)) {
      acc.set(item.order_id, {
        order: item.order,
        items: [],
      });
    }
    acc.get(item.order_id)!.items.push(item);
    return acc;
  }, new Map<string, { order: Order; items: SellerOrderItem[] }>());

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <p className="text-muted-foreground mt-1">
          View and track orders containing your products
        </p>
      </div>

      {groupedOrders.size === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders yet for your products</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Your Items</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(groupedOrders.entries()).map(([orderId, { order, items }]) => {
                const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                return (
                  <TableRow key={orderId}>
                    <TableCell className="font-mono text-sm">
                      {orderId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell>{formatPrice(itemsTotal)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewOrderDetails(orderId)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Order ID:</strong>
                  <p className="font-mono">{selectedOrder.id.substring(0, 8)}...</p>
                </div>
                <div>
                  <strong>Status:</strong>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <strong>Date:</strong>
                  <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <strong>Payment:</strong>
                  <p className="capitalize">{selectedOrder.payment_method}</p>
                </div>
              </div>

              <div>
                <strong className="text-sm">Your Items in This Order:</strong>
                <div className="mt-2 space-y-2">
                  {selectedOrderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-muted rounded">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        {item.shade && (
                          <p className="text-xs text-muted-foreground">Shade: {item.shade}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div>
                  <strong className="text-sm">Shipping To:</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.shipping_address.full_name}<br />
                    {selectedOrder.shipping_address.address_line}<br />
                    {selectedOrder.shipping_address.city}
                    {selectedOrder.shipping_address.postal_code && `, ${selectedOrder.shipping_address.postal_code}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerOrderManagement;