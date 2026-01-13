export interface ProductCategory {
  id: string;
  label: string;
  subcategories?: string[];
}

// Main product categories aligned with the mega menu
export const productCategories: ProductCategory[] = [
  // SKINCARE
  {
    id: "cleanser",
    label: "Cleanser",
    subcategories: ["Micellar Water", "Gel Cleanser", "Foam Cleanser", "Oil Cleanser"],
  },
  {
    id: "moisturizer",
    label: "Moisturizer",
    subcategories: ["Day Cream", "Night Cream", "Gel Moisturizer", "Oil-Free"],
  },
  {
    id: "serum",
    label: "Serum",
    subcategories: ["Vitamin C", "Hyaluronic Acid", "Retinol", "Niacinamide"],
  },
  {
    id: "exfoliator",
    label: "Exfoliator",
    subcategories: ["Chemical Exfoliant", "Physical Scrub", "Enzyme Peel"],
  },
  {
    id: "toner",
    label: "Toner",
    subcategories: ["Hydrating Toner", "Exfoliating Toner", "Essence"],
  },
  {
    id: "mask",
    label: "Face Mask",
    subcategories: ["Sheet Mask", "Clay Mask", "Overnight Mask", "Peel-Off Mask"],
  },
  // HAIR CARE
  {
    id: "shampoo",
    label: "Shampoo",
    subcategories: ["Clarifying", "Moisturizing", "Thickening", "Color-Safe"],
  },
  {
    id: "conditioner",
    label: "Conditioner",
    subcategories: ["Daily Conditioner", "Deep Conditioner", "Leave-In"],
  },
  {
    id: "hair-oil",
    label: "Hair Oil",
    subcategories: ["Argan Oil", "Castor Oil", "Growth Serum"],
  },
  {
    id: "scalp-treatment",
    label: "Scalp Treatment",
    subcategories: ["Scalp Scrub", "Anti-Dandruff", "Growth Tonic"],
  },
  // BODY CARE
  {
    id: "body-wash",
    label: "Body Wash",
    subcategories: ["Moisturizing", "Exfoliating", "Antibacterial"],
  },
  {
    id: "body-lotion",
    label: "Body Lotion",
    subcategories: ["Hydrating", "Firming", "Brightening"],
  },
  {
    id: "body-oil",
    label: "Body Oil",
    subcategories: ["Nourishing Oil", "Dry Oil", "Massage Oil"],
  },
  {
    id: "body-scrub",
    label: "Body Scrub",
    subcategories: ["Sugar Scrub", "Salt Scrub", "Coffee Scrub"],
  },
  // SUN PROTECTION
  {
    id: "sunscreen",
    label: "Sunscreen",
    subcategories: ["SPF 30", "SPF 50", "Tinted SPF", "Mineral SPF"],
  },
  {
    id: "after-sun",
    label: "After Sun Care",
    subcategories: ["Aloe Gel", "Soothing Lotion"],
  },
  // TREATMENTS
  {
    id: "acne-treatment",
    label: "Acne Treatment",
    subcategories: ["Spot Treatment", "Acne Wash", "Acne Moisturizer", "Acne Kit"],
  },
  {
    id: "hyperpigmentation",
    label: "Hyperpigmentation",
    subcategories: ["Dark Spot Corrector", "Brightening Serum", "Pigmentation Kit"],
  },
  {
    id: "anti-aging",
    label: "Anti-Aging",
    subcategories: ["Retinol", "Peptides", "Collagen Boost"],
  },
  {
    id: "eye-care",
    label: "Eye Care",
    subcategories: ["Eye Cream", "Eye Serum", "Dark Circle Treatment"],
  },
  // SPECIALTY
  {
    id: "pregnancy-care",
    label: "Pregnancy Care",
    subcategories: ["Stretch Mark Cream", "Pregnancy Safe Skincare"],
  },
  {
    id: "mens-grooming",
    label: "Men's Grooming",
    subcategories: ["Beard Care", "Men's Skincare", "After Shave"],
  },
  {
    id: "gift-set",
    label: "Gift Set",
    subcategories: ["Skincare Set", "Body Care Set", "Travel Set"],
  },
];

// Category groups for the mega menu
export const categoryGroups = {
  skincare: ["cleanser", "moisturizer", "serum", "exfoliator", "toner", "mask"],
  haircare: ["shampoo", "conditioner", "hair-oil", "scalp-treatment"],
  bodycare: ["body-wash", "body-lotion", "body-oil", "body-scrub"],
  sunprotection: ["sunscreen", "after-sun"],
  treatments: ["acne-treatment", "hyperpigmentation", "anti-aging", "eye-care"],
  specialty: ["pregnancy-care", "mens-grooming", "gift-set"],
};

// Get category label by ID
export const getCategoryLabel = (id: string): string => {
  const category = productCategories.find((c) => c.id === id);
  return category?.label || id;
};

// Get all category IDs
export const getAllCategoryIds = (): string[] => {
  return productCategories.map((c) => c.id);
};