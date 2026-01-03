import { useState } from "react";
import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { ShoppingCart, Menu, X, User, Store } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import CurrencySelector from "./CurrencySelector";
import logo from "@/assets/kenyashipping-logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const { user } = useAuth();
  const { isAdmin, isSeller } = useUserRole();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
            <NavLink
              to="/products"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
            >
              Shop
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </NavLink>
            <NavLink
              to="/about"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
            >
              Our Story
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </NavLink>
            <NavLink
              to="/learn-more"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
            >
              Learn More
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </NavLink>
            {isSeller && (
              <NavLink
                to="/seller"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
              >
                <span className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  Sell
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </NavLink>
            )}
            {!isSeller && user && (
              <NavLink
                to="/become-seller"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
              >
                Become a Seller
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
              >
                Admin
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
          <div className="md:hidden py-4 space-y-3 animate-fade-in-up">
            <NavLink
              to="/products"
              className="block py-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </NavLink>
            <NavLink
              to="/about"
              className="block py-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Story
            </NavLink>
            <NavLink
              to="/learn-more"
              className="block py-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learn More
            </NavLink>
            <NavLink
              to={user ? "/account" : "/auth"}
              className="block py-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {user ? "My Account" : "Sign In"}
            </NavLink>
            {isSeller && (
              <NavLink
                to="/seller"
                className="block py-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Seller Dashboard
              </NavLink>
            )}
            {!isSeller && user && (
              <NavLink
                to="/become-seller"
                className="block py-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a Seller
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="block py-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </NavLink>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
