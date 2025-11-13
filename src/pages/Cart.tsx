import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in-up">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="text-3xl font-light">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some beautiful products to get started</p>
            <Button size="lg" onClick={() => navigate("/products")} className="rounded-full">
              Start Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-light tracking-tight mb-12 animate-fade-in-up">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${item.shade}`}
                className="flex gap-6 p-6 bg-card rounded-2xl shadow-soft animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  {item.shade && (
                    <p className="text-sm text-muted-foreground">Shade: {item.shade}</p>
                  )}
                  <p className="text-lg font-semibold text-primary">
                    KES {item.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id, item.shade)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1, item.shade)
                      }
                      className="h-8 w-8 rounded-full"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1, item.shade)
                      }
                      className="h-8 w-8 rounded-full"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="bg-card rounded-2xl p-8 shadow-soft sticky top-24 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <h2 className="text-2xl font-light mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">KES {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => navigate("/checkout")}
                className="w-full rounded-full py-6 shadow-elevated hover:shadow-soft transition-all"
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/products")}
                className="w-full mt-4"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
