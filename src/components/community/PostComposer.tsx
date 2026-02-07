import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, X, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { COMMUNITY_CATEGORIES, getCategoryById } from "./CategoryBadge";

const postSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post cannot be empty")
    .max(2000, "Post must be less than 2000 characters"),
});

interface PostComposerProps {
  onPostCreated: () => void;
  defaultCategory?: string;
}

const PostComposer = ({ onPostCreated, defaultCategory = "general" }: PostComposerProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userName = user?.user_metadata?.full_name || "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentCategory = getCategoryById(selectedCategory);
  const CategoryIcon = currentCategory.icon;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `community/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setImageUrl(urlData.publicUrl);
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to post");
      return;
    }

    try {
      postSchema.parse({ content });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
        category: selectedCategory,
      });

      if (error) throw error;

      setContent("");
      setImageUrl(null);
      setIsFocused(false);
      onPostCreated();
      toast.success("Post shared with the community!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      layout
      className={`bg-card border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
        isFocused ? "border-primary shadow-lg" : "border-border"
      }`}
    >
      <div className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0 ring-2 ring-background">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Share your skincare journey, tips, or questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0"
            />

            {/* Image Preview */}
            <AnimatePresence>
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative inline-block"
                >
                  <img
                    src={imageUrl}
                    alt="Upload preview"
                    className="max-h-48 rounded-xl object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setImageUrl(null)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <motion.div
        initial={false}
        animate={{ height: isFocused || content ? "auto" : 0, opacity: isFocused || content ? 1 : 0 }}
        className="border-t border-border overflow-hidden"
      >
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2 rounded-full text-muted-foreground hover:text-primary"
            >
              <Image className="h-5 w-5" />
              {uploading ? "Uploading..." : "Photo"}
            </Button>

            {/* Category Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 rounded-full ${currentCategory.color}`}
                >
                  <CategoryIcon className="h-4 w-4" />
                  {currentCategory.name}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl p-2">
                {COMMUNITY_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`rounded-lg cursor-pointer ${
                        selectedCategory === category.id ? category.bgColor : ""
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-2 ${category.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs ${content.length > 1800 ? "text-destructive" : "text-muted-foreground"}`}>
              {content.length}/2000
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="gap-2 rounded-full px-6"
            >
              {submitting ? (
                "Posting..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostComposer;
