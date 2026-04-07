import { NavLink } from "./NavLink";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface MenuCategory {
  title: string;
  items: { name: string; href: string; category?: string }[];
}

const menuCategories: MenuCategory[] = [
  {
    title: "SKINCARE",
    items: [
      { name: "All Skincare", href: "/products?group=skincare" },
      { name: "Cleansers", href: "/products?category=cleanser", category: "cleanser" },
      { name: "Moisturizers", href: "/products?category=moisturizer", category: "moisturizer" },
      { name: "Serums", href: "/products?category=serum", category: "serum" },
      { name: "Exfoliators", href: "/products?category=exfoliator", category: "exfoliator" },
      { name: "Toners", href: "/products?category=toner", category: "toner" },
      { name: "Face Masks", href: "/products?category=mask", category: "mask" },
    ],
  },
  {
    title: "HAIR CARE",
    items: [
      { name: "All Hair Care", href: "/products?group=haircare" },
      { name: "Shampoos", href: "/products?category=shampoo", category: "shampoo" },
      { name: "Conditioners", href: "/products?category=conditioner", category: "conditioner" },
      { name: "Hair Oils", href: "/products?category=hair-oil", category: "hair-oil" },
      { name: "Scalp Treatments", href: "/products?category=scalp-treatment", category: "scalp-treatment" },
    ],
  },
  {
    title: "BODY CARE",
    items: [
      { name: "All Body Care", href: "/products?group=bodycare" },
      { name: "Body Wash", href: "/products?category=body-wash", category: "body-wash" },
      { name: "Body Lotions", href: "/products?category=body-lotion", category: "body-lotion" },
      { name: "Body Oils", href: "/products?category=body-oil", category: "body-oil" },
      { name: "Body Scrubs", href: "/products?category=body-scrub", category: "body-scrub" },
    ],
  },
  {
    title: "SUN PROTECTION",
    items: [
      { name: "All Sun Care", href: "/products?group=sunprotection" },
      { name: "Sunscreens SPF50", href: "/products?category=sunscreen", category: "sunscreen" },
      { name: "After Sun Care", href: "/products?category=after-sun", category: "after-sun" },
    ],
  },
  {
    title: "TREATMENTS",
    items: [
      { name: "All Treatments", href: "/products?group=treatments" },
      { name: "Acne Solutions", href: "/products?category=acne-treatment", category: "acne-treatment" },
      { name: "Hyperpigmentation", href: "/products?category=hyperpigmentation", category: "hyperpigmentation" },
      { name: "Anti-Aging", href: "/products?category=anti-aging", category: "anti-aging" },
      { name: "Eye Care", href: "/products?category=eye-care", category: "eye-care" },
    ],
  },
  {
    title: "QUICK LINKS",
    items: [
      { name: "All Products", href: "/products" },
      { name: "Bestsellers", href: "/products?featured=true" },
      { name: "Gift Sets", href: "/products?category=gift-set", category: "gift-set" },
      { name: "Customer Reviews", href: "/#reviews" },
    ],
  },
];

const ProductsMegaMenu = () => {
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    if (href.startsWith("/#")) {
      // Handle anchor links
      const anchor = href.replace("/", "");
      if (window.location.pathname === "/") {
        document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="!bg-transparent text-sm font-medium tracking-wide text-foreground/80 hover:text-foreground hover:!bg-transparent focus:!bg-transparent focus:text-foreground data-[state=open]:!bg-transparent data-[state=open]:!text-foreground data-[active]:!bg-transparent data-[active]:text-foreground/80 uppercase">
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
                          <button
                            onClick={() => handleNavigation(item.href)}
                            className="text-sm text-foreground/70 hover:text-primary transition-colors block py-1 text-left w-full"
                          >
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              {/* Featured Banner */}
              <div className="mt-6 pt-6 border-t border-border">
                <button 
                  onClick={() => navigate("/products")}
                  className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors group w-full text-left"
                >
                  <div>
                    <p className="font-semibold text-foreground">Shop All Products</p>
                    <p className="text-sm text-foreground/60">Discover our complete skincare collection</p>
                  </div>
                  <span className="text-primary font-medium group-hover:translate-x-1 transition-transform">
                    View All →
                  </span>
                </button>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default ProductsMegaMenu;
