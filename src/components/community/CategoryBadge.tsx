import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  Lightbulb,
  HelpCircle,
  Star,
  Palette,
  LucideIcon
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description: string;
}

export const COMMUNITY_CATEGORIES: Category[] = [
  {
    id: "general",
    name: "General",
    icon: MessageSquare,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    description: "General discussions and community chat",
  },
  {
    id: "skincare-tips",
    name: "Skincare Tips",
    icon: Sparkles,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    description: "Share and discover skincare routines & tips",
  },
  {
    id: "product-reviews",
    name: "Product Reviews",
    icon: Star,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    description: "Honest reviews from real users",
  },
  {
    id: "ask-community",
    name: "Ask Community",
    icon: HelpCircle,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Get answers from experienced members",
  },
  {
    id: "glow-journey",
    name: "Glow Journey",
    icon: Heart,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    description: "Share your transformation stories",
  },
  {
    id: "seller-corner",
    name: "Seller Corner",
    icon: ShoppingBag,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    description: "Tips and discussions for sellers",
  },
  {
    id: "beauty-trends",
    name: "Beauty Trends",
    icon: Palette,
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bgColor: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
    description: "Latest trends and discoveries",
  },
  {
    id: "ideas",
    name: "Ideas & Feedback",
    icon: Lightbulb,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    description: "Suggest features and improvements",
  },
];

export const getCategoryById = (id: string): Category => {
  return COMMUNITY_CATEGORIES.find((c) => c.id === id) || COMMUNITY_CATEGORIES[0];
};

interface CategoryBadgeProps {
  categoryId: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const CategoryBadge = ({ 
  categoryId, 
  size = "sm", 
  showIcon = true,
  className 
}: CategoryBadgeProps) => {
  const category = getCategoryById(categoryId);
  const Icon = category.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors",
        category.bgColor,
        category.color,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
      {category.name}
    </span>
  );
};

export default CategoryBadge;
