export interface ContentField {
  key: string;
  label: string;
  type: "text" | "textarea" | "url";
  default: string;
}

export interface ContentSlot {
  slot: string;
  title: string;
  fields: ContentField[];
}

export const LANDING_CONTENT_SLOTS: ContentSlot[] = [
  {
    slot: "hero",
    title: "Hero Section",
    fields: [
      { key: "urgency", label: "Top pill (urgency)", type: "text", default: "Trending this week" },
      { key: "accent", label: "Top pill (accent)", type: "text", default: "Best Sellers" },
      { key: "headline", label: "Headline (use \\n for line break)", type: "textarea", default: "Your Skin.\nYour Glow." },
      { key: "subtext", label: "Subtext", type: "textarea", default: "Premium skincare crafted for melanin-rich beauty. Discover products that actually work." },
      { key: "cta", label: "Primary button label", type: "text", default: "Shop Now" },
      { key: "ctaLink", label: "Primary button link", type: "url", default: "/products" },
      { key: "secondaryCta", label: "Secondary button label", type: "text", default: "Browse All" },
      { key: "secondaryCtaLink", label: "Secondary button link", type: "url", default: "/products" },
    ],
  },
  {
    slot: "marquee_1",
    title: "Marquee Strip 1",
    fields: [
      { key: "text", label: "Text", type: "textarea", default: "Free Shipping On Orders Over KES 5,000 • Same Day Delivery In Nairobi • Genuine Products Only" },
    ],
  },
  {
    slot: "routine_cta",
    title: "Skin Routine CTA",
    fields: [
      { key: "badge", label: "Badge", type: "text", default: "Most Popular" },
      { key: "eyebrow", label: "Eyebrow", type: "text", default: "Build Your Routine" },
      { key: "headline", label: "Headline", type: "text", default: "Not Sure Where To Start?" },
      { key: "subtext", label: "Subtext", type: "textarea", default: "Our best-selling bundles are hand-picked by skincare experts. Start with a complete routine and see results in as little as 2 weeks. Over 500+ happy customers this month alone." },
      { key: "cta", label: "Button label", type: "text", default: "Shop Bestsellers" },
      { key: "ctaLink", label: "Button link", type: "url", default: "/products?featured=true" },
    ],
  },
  {
    slot: "marquee_2",
    title: "Marquee Strip 2",
    fields: [
      { key: "text", label: "Text", type: "textarea", default: "Trusted By 10,000+ Customers • 100% Genuine Products • Expert-Curated Selection" },
    ],
  },
  {
    slot: "urgency_banner",
    title: "Urgency CTA Banner",
    fields: [
      { key: "headline", label: "Headline", type: "text", default: "Don't miss out — limited stock available" },
      { key: "subtext", label: "Subtext", type: "text", default: "Our most popular products sell out fast. Add to cart before they're gone." },
      { key: "cta", label: "Button label", type: "text", default: "Shop Now" },
      { key: "ctaLink", label: "Button link", type: "url", default: "/products" },
    ],
  },
  {
    slot: "brand_story",
    title: "Brand Story",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", default: "Why Kenyashipment" },
      { key: "headline", label: "Headline", type: "text", default: "Skincare That Actually Works For You" },
      { key: "subtext", label: "Subtext", type: "textarea", default: "Every product on our marketplace is vetted by experts and loved by real customers. We connect you with trusted sellers who understand melanin-rich skin — so you can shop with confidence." },
      { key: "stat1_value", label: "Stat 1 value", type: "text", default: "10K+" },
      { key: "stat1_label", label: "Stat 1 label", type: "text", default: "Happy Customers" },
      { key: "stat2_value", label: "Stat 2 value", type: "text", default: "100%" },
      { key: "stat2_label", label: "Stat 2 label", type: "text", default: "Genuine Products" },
      { key: "stat3_value", label: "Stat 3 value", type: "text", default: "4.9" },
      { key: "stat3_label", label: "Stat 3 label", type: "text", default: "Average Rating" },
      { key: "cta", label: "Button label", type: "text", default: "Start Shopping" },
      { key: "ctaLink", label: "Button link", type: "url", default: "/products" },
    ],
  },
  {
    slot: "newsletter",
    title: "Newsletter",
    fields: [
      { key: "headline", label: "Headline", type: "text", default: "Get 10% Off Your First Order" },
      { key: "subtext", label: "Subtext", type: "textarea", default: "Subscribe and get exclusive access to new arrivals, flash sales, and skincare tips crafted for your skin. Plus 10% off your first purchase." },
      { key: "cta", label: "Button label", type: "text", default: "Get 10% Off" },
      { key: "footnote", label: "Footnote", type: "text", default: "Join 5,000+ subscribers. Unsubscribe anytime." },
    ],
  },
  {
    slot: "seller_cta",
    title: "Become A Seller CTA",
    fields: [
      { key: "headline", label: "Headline", type: "text", default: "Have Products to Sell?" },
      { key: "subtext", label: "Subtext", type: "textarea", default: "Join our marketplace and reach thousands of customers across Kenya. Open your shop on Kenyashipment today." },
      { key: "cta", label: "Button label", type: "text", default: "Become a Seller" },
      { key: "ctaLink", label: "Button link", type: "url", default: "/become-seller" },
    ],
  },
  {
    slot: "shop_by_treatment",
    title: "Shop by Treatment (header)",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", default: "Targeted Solutions" },
      { key: "headline", label: "Headline", type: "text", default: "Shop by Treatment" },
      { key: "subtext", label: "Subtext", type: "text", default: "Find the perfect products for your specific skin concerns" },
    ],
  },
];
