import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface Order {
  id: string;
  status: string;
  total: number;
  payment_method: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    product_image: string;
    shade?: string;
    quantity: number;
    price: number;
  }>;
}

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  postal_code?: string;
  is_default: boolean;
}

const Account = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchAddresses();
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          product_image,
          shade,
          quantity,
          price
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false });

    if (!error && data) {
      setAddresses(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-light tracking-tight animate-fade-in-up">
            My Account
          </h1>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="rounded-full"
          >
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="orders" className="animate-fade-in-up">
          <TabsList className="mb-8">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="addresses">Saved Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 text-center shadow-soft">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => navigate("/products")} className="rounded-full">
                  Start Shopping
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order placed {format(new Date(order.created_at), "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        KES {order.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.status}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          {item.shade && (
                            <p className="text-sm text-muted-foreground">{item.shade}</p>
                          )}
                          <p className="text-sm">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            {addresses.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 text-center shadow-soft">
                <p className="text-muted-foreground">No saved addresses</p>
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{address.full_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.address_line}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}
                        {address.postal_code && `, ${address.postal_code}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                    </div>
                    {address.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
