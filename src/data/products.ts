export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "foundation" | "lips" | "eyes" | "skincare";
  images: string[];
  shades?: Array<{
    name: string;
    hex: string;
  }>;
  featured?: boolean;
  benefits?: string[];
  ingredients?: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Radiant Glow Foundation",
    description: "A luminous, buildable foundation that adapts to your skin tone. Formulated with shea butter and vitamin E for all-day hydration.",
    price: 4500,
    category: "foundation",
    images: [
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631730486677-62d2c3a89d0c?w=800&h=800&fit=crop",
    ],
    featured: true,
    shades: [
      { name: "Mahogany", hex: "#4A3428" },
      { name: "Chestnut", hex: "#5C4033" },
      { name: "Walnut", hex: "#6F4E37" },
      { name: "Caramel", hex: "#8B6F47" },
      { name: "Bronze", hex: "#A67B5B" },
      { name: "Golden", hex: "#C19A6B" },
    ],
    benefits: ["24-hour wear", "SPF 30", "Hydrating formula", "Non-comedogenic"],
    ingredients: ["Shea butter", "Vitamin E", "Hyaluronic acid"],
  },
  {
    id: "2",
    name: "Velvet Matte Lipstick",
    description: "Rich, highly pigmented matte lipstick that glides on smoothly. Enriched with cocoa butter for soft, comfortable wear.",
    price: 2800,
    category: "lips",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631730486677-62d2c3a89d0c?w=800&h=800&fit=crop",
    ],
    featured: true,
    shades: [
      { name: "Berry Bliss", hex: "#8B3A62" },
      { name: "Russet Rose", hex: "#B35437" },
      { name: "Terracotta", hex: "#CC7F5C" },
      { name: "Nude Silk", hex: "#D4A574" },
    ],
    benefits: ["Long-lasting", "Transfer-resistant", "Moisturizing", "Cruelty-free"],
    ingredients: ["Cocoa butter", "Vitamin C", "Natural oils"],
  },
  {
    id: "3",
    name: "Luminous Eye Palette",
    description: "12 versatile shades from warm neutrals to rich jewel tones. Buttery texture blends effortlessly for day-to-night looks.",
    price: 5200,
    category: "eyes",
    images: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583001809744-7bc0c0e1f906?w=800&h=800&fit=crop",
    ],
    featured: true,
    benefits: ["Highly pigmented", "Blendable formula", "All-day wear", "Vegan"],
    ingredients: ["Mineral pigments", "Jojoba oil", "Vitamin E"],
  },
  {
    id: "4",
    name: "Hydrating Glow Serum",
    description: "Lightweight serum with baobab oil and niacinamide to brighten and even skin tone. Perfect for melanin-rich skin.",
    price: 6800,
    category: "skincare",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop",
    ],
    featured: false,
    benefits: ["Brightening", "Anti-aging", "Lightweight", "Fast-absorbing"],
    ingredients: ["Baobab oil", "Niacinamide", "Vitamin C", "Hyaluronic acid"],
  },
  {
    id: "5",
    name: "Sculpt & Define Contour",
    description: "Cream contour stick for effortless sculpting. Blends seamlessly into skin for a natural, defined look.",
    price: 3200,
    category: "foundation",
    images: [
      "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631730486677-62d2c3a89d0c?w=800&h=800&fit=crop",
    ],
    shades: [
      { name: "Deep", hex: "#3C2A21" },
      { name: "Rich", hex: "#4A3428" },
      { name: "Medium", hex: "#5C4033" },
    ],
    benefits: ["Buildable", "Long-wearing", "Creamy texture", "Easy to blend"],
  },
  {
    id: "6",
    name: "Satin Finish Lip Gloss",
    description: "Non-sticky gloss with a hint of shimmer. Infused with marula oil for plump, hydrated lips.",
    price: 2200,
    category: "lips",
    images: [
      "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop",
    ],
    shades: [
      { name: "Champagne", hex: "#F4E4C1" },
      { name: "Rose Gold", hex: "#E6C7B8" },
      { name: "Copper", hex: "#C87533" },
    ],
    benefits: ["Hydrating", "Non-sticky", "Plumping effect", "Glossy finish"],
  },
];
