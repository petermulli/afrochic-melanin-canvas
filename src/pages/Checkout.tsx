import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mpesa">("card");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate("/auth");
    }
  }, [user, navigate]);

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const shippingAddress = {
        full_name: `${formData.get("firstName")} ${formData.get("lastName")}`,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address_line: formData.get("address") as string,
        city: formData.get("city") as string,
        postal_code: formData.get("postalCode") as string || null
      };

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          payment_method: paymentMethod,
          subtotal: total,
          shipping_fee: 500,
          total: total + 500,
          shipping_address: shippingAddress
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        shade: item.shade,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Process payment
      if (paymentMethod === "mpesa") {
        const { data, error } = await supabase.functions.invoke("process-payment", {
          body: {
            amount: total + 500,
            phone: shippingAddress.phone,
            orderId: order.id,
            paymentMethod: "mpesa",
          },
        });

        if (error) throw error;

        if (data.success) {
          clearCart();
          toast.success(data.message);
          navigate("/account");
        } else {
          throw new Error(data.error || "Payment failed");
        }
      } else {
        toast.error("Card payments not yet configured. Please use M-PESA.");
      }
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif tracking-tight mb-12 animate-fade-in-up">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <div className="bg-card rounded-2xl p-8 shadow-soft animate-fade-in-up">
                <h2 className="text-2xl font-serif mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+254 7XX XXX XXX" required />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" name="postalCode" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div
                className="bg-card rounded-2xl p-8 shadow-soft animate-fade-in-up"
                style={{ animationDelay: "100ms" }}
              >
                <h2 className="text-2xl font-serif mb-6">Payment Method</h2>
                <PaymentMethodSelector
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-card rounded-2xl p-8 shadow-soft sticky top-24 animate-fade-in-up"
                style={{ animationDelay: "200ms" }}
              >
                <h2 className="text-2xl font-serif mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.shade}`} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.shade && (
                          <p className="text-xs text-muted-foreground">{item.shade}</p>
                        )}
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{formatPrice(500)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(total + 500)}
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full mt-6 rounded-full py-6 shadow-elevated hover:shadow-soft transition-all"
                >
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
