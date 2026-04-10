import { Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight">Kenya<span className="text-golden">shipment</span></h3>
            <p className="text-sm text-primary-foreground/70">
              Fast, reliable shipping and logistics services across Kenya and beyond.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-golden">Shop</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link to="/products" className="hover:text-golden transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=foundation" className="hover:text-golden transition-colors">
                  Foundation
                </Link>
              </li>
              <li>
                <Link to="/products?category=lips" className="hover:text-golden transition-colors">
                  Lips
                </Link>
              </li>
              <li>
                <Link to="/products?category=eyes" className="hover:text-golden transition-colors">
                  Eyes
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-golden">About</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link to="/about" className="hover:text-golden transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/learn-more" className="hover:text-golden transition-colors">
                  Learn More
                </Link>
              </li>
              <li>
                <Link to="/approved-products" className="hover:text-golden transition-colors">
                  Approved Products
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-golden transition-colors">
                  Sign In / Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-golden">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-golden transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-golden transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-golden transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Kenyashipment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
