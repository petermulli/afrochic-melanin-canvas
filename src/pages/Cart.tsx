import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const Cart = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center storefront-shell py-16">
          <div className="text-center space-y-6 animate-fade-in-up">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="text-3xl font-black">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some beautiful products to get started</p>
            <Button size="lg" onClick={() => navigate("/products")} className="rounded-none px-10 uppercase tracking-widest font-bold">
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

      <main className="flex-1 storefront-shell py-10 md:py-16">
        <div className="flex items-end justify-between border-b border-border pb-5 mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-black animate-fade-in-up">
          Shopping Cart
        </h1>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-16 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${item.shade}`}
                className="grid grid-cols-[88px_minmax(0,1fr)_auto] sm:grid-cols-[120px_minmax(0,1fr)_auto] gap-4 sm:gap-6 py-6 border-b border-border bg-card animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-[88px] h-[110px] sm:w-[120px] sm:h-[150px] object-cover bg-muted"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-base sm:text-lg">{item.name}</h3>
                  {item.shade && (
                    <p className="text-sm text-muted-foreground">Shade: {item.shade}</p>
                  )}
                  <p className="text-lg font-semibold text-primary">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between gap-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id, item.shade)}
                    className="hover:bg-destructive/10 hover:text-destructive rounded-none h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center border border-border">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1, item.shade)
                      }
                      className="h-9 w-9 rounded-none border-0 border-r"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-9 text-center font-bold text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1, item.shade)
                      }
                      className="h-9 w-9 rounded-none border-0 border-l"
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
              className="bg-muted p-6 md:p-8 border-t-4 border-primary sticky top-24 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <h2 className="text-2xl font-black mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => navigate("/checkout")}
                className="w-full rounded-none py-6 shadow-elevated hover:shadow-soft transition-all uppercase tracking-widest font-bold"
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
