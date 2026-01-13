import { NavLink } from "./NavLink";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface MenuCategory {
  title: string;
  items: { name: string; href: string }[];
}

const menuCategories: MenuCategory[] = [
  {
    title: "SKINCARE",
    items: [
      { name: "All Products", href: "/products" },
      { name: "Cleansers", href: "/products?category=skincare" },
      { name: "Moisturizers", href: "/products?category=skincare" },
      { name: "Serums", href: "/products?category=skincare" },
      { name: "Exfoliators", href: "/products?category=skincare" },
    ],
  },
  {
    title: "HAIR CARE",
    items: [
      { name: "Complete Hair Range", href: "/products?category=hair" },
      { name: "Shampoos", href: "/products?category=hair" },
      { name: "Conditioners", href: "/products?category=hair" },
      { name: "Hair Oils", href: "/products?category=hair" },
      { name: "Scalp Treatments", href: "/products?category=hair" },
    ],
  },
  {
    title: "BODY CARE",
    items: [
      { name: "Complete Body Range", href: "/products?category=body" },
      { name: "Body Wash", href: "/products?category=body" },
      { name: "Body Lotions", href: "/products?category=body" },
      { name: "Body Oils", href: "/products?category=body" },
      { name: "Exfoliators", href: "/products?category=body" },
    ],
  },
  {
    title: "SUN PROTECTION",
    items: [
      { name: "Sunscreens SPF50", href: "/products?category=sunscreen" },
      { name: "After Sun Care", href: "/products?category=sunscreen" },
    ],
  },
  {
    title: "TREATMENTS",
    items: [
      { name: "Hyperpigmentation", href: "/products?category=treatments" },
      { name: "Acne Solutions", href: "/products?category=treatments" },
      { name: "Anti-Aging", href: "/products?category=treatments" },
      { name: "Dark Circles", href: "/products?category=treatments" },
    ],
  },
  {
    title: "QUICK LINKS",
    items: [
      { name: "Bestsellers", href: "/products" },
      { name: "New Arrivals", href: "/products" },
      { name: "Gift Sets", href: "/products" },
      { name: "Customer Reviews", href: "/about" },
    ],
  },
];

const ProductsMegaMenu = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-sm font-medium tracking-wide text-foreground/80 hover:text-foreground hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent uppercase">
            PRODUCTS
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-background border border-border shadow-xl">
            <div className="w-[800px] p-6">
              <div className="grid grid-cols-3 gap-8">
                {menuCategories.map((category) => (
                  <div key={category.title} className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wider text-primary uppercase border-b border-primary/20 pb-2">
                      {category.title}
                    </h3>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item.name}>
                          <NavLink
                            to={item.href}
                            className="text-sm text-foreground/70 hover:text-primary transition-colors block py-1"
                          >
                            {item.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              {/* Featured Banner */}
              <div className="mt-6 pt-6 border-t border-border">
                <NavLink 
                  to="/products" 
                  className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors group"
                >
                  <div>
                    <p className="font-semibold text-foreground">Shop All Products</p>
                    <p className="text-sm text-foreground/60">Discover our complete skincare collection</p>
                  </div>
                  <span className="text-primary font-medium group-hover:translate-x-1 transition-transform">
                    View All →
                  </span>
                </NavLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default ProductsMegaMenu;
