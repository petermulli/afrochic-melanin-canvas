import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { COMMUNITY_CATEGORIES, Category } from "./CategoryBadge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategorySelectorProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  variant?: "tabs" | "pills";
}

const CategorySelector = ({ 
  selectedCategory, 
  onSelectCategory,
  variant = "tabs"
}: CategorySelectorProps) => {
  const allCategories = [
    { id: null, name: "All Discussions", icon: null },
    ...COMMUNITY_CATEGORIES,
  ];

  if (variant === "pills") {
    return (
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-3">
          {allCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            const Icon = category.icon;
            
            return (
              <motion.button
                key={category.id || "all"}
                onClick={() => onSelectCategory(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {category.name}
                {isSelected && (
                  <motion.div
                    layoutId="categoryPill"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-1">
          {allCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            const Icon = category.icon;
            const catData = COMMUNITY_CATEGORIES.find(c => c.id === category.id);
            
            return (
              <button
                key={category.id || "all"}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                  isSelected
                    ? catData 
                      ? `${catData.bgColor} ${catData.color}`
                      : "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {category.name}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
};

export default CategorySelector;
