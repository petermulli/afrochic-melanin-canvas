import { useState } from "react";
import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { ShoppingCart, Menu, X, User, Store, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import CurrencySelector from "./CurrencySelector";
import ProductsMegaMenu from "./ProductsMegaMenu";
import logo from "@/assets/kenyashipping-logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const { items } = useCart();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const mobileCategories = [
    { title: "SKINCARE", href: "/products?category=skincare" },
    { title: "HAIR CARE", href: "/products?category=hair" },
    { title: "BODY CARE", href: "/products?category=body" },
    { title: "SUN PROTECTION", href: "/products?category=sunscreen" },
    { title: "TREATMENTS", href: "/products?category=treatments" },
    { title: "ALL PRODUCTS", href: "/products" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Kenyashipment" className="h-10 md:h-12 w-auto" />
            <span className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
              Kenya<span className="text-primary">shipment</span>
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ProductsMegaMenu />
            <NavLink
              to="/learn-more"
              className="text-sm font-medium tracking-wide text-foreground/80 hover:text-foreground transition-colors relative group uppercase"
            >
              LEARN MORE
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </NavLink>
            {user && (
              <NavLink
                to="/sell"
                className="text-sm font-medium tracking-wide text-foreground/80 hover:text-foreground transition-colors relative group uppercase"
              >
                <span className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  SELL
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-sm font-medium tracking-wide text-foreground/80 hover:text-foreground transition-colors relative group uppercase"
              >
                ADMIN
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </NavLink>
            )}
            <CurrencySelector />
            <NavLink to={user ? "/account" : "/auth"}>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <User className="h-5 w-5" />
              </Button>
            </NavLink>
            <NavLink to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <NavLink to={user ? "/account" : "/auth"}>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <User className="h-5 w-5" />
              </Button>
            </NavLink>
            <NavLink to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </NavLink>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 animate-fade-in-up border-t border-border">
            {/* Products Dropdown */}
            <div>
              <button
                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                className="flex items-center justify-between w-full py-3 text-base font-medium tracking-wide text-foreground/80 hover:text-foreground transition-colors uppercase"
              >
                PRODUCTS
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileProductsOpen && (
                <div className="pl-4 pb-2 space-y-1 border-l-2 border-primary/20 ml-2">
                  {mobileCategories.map((category) => (
                    <NavLink
                      key={category.title}
                      to={category.href}
                      className="block py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
            
            <NavLink
              to="/learn-more"
              className="block py-3 text-base font-medium tracking-wide text-foreground/80 hover:text-foreground transition-colors uppercase"
              onClick={() => setMobileMenuOpen(false)}
            >
              LEARN MORE
            </NavLink>
            <NavLink
              to={user ? "/account" : "/auth"}
              className="block py-3 text-base font-medium tracking-wide text-foreground/80 hover:text-foreground transition-colors uppercase"
              onClick={() => setMobileMenuOpen(false)}
            >
              {user ? "MY ACCOUNT" : "SIGN IN"}
            </NavLink>
            {user && (
              <NavLink
                to="/sell"
                className="block py-3 text-base font-medium tracking-wide text-foreground/80 hover:text-foreground transition-colors uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                SELL
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="block py-3 text-base font-medium tracking-wide text-foreground/80 hover:text-foreground transition-colors uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                ADMIN DASHBOARD
              </NavLink>
            )}
            <div className="pt-3 border-t border-border">
              <CurrencySelector />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
