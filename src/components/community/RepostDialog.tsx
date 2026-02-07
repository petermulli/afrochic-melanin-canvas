import { useState } from "react";
import { motion } from "framer-motion";
import { Repeat2, Quote, X, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import CategoryBadge from "./CategoryBadge";

interface OriginalPost {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  category?: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface RepostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalPost: OriginalPost;
  onReposted: () => void;
}

const RepostDialog = ({ open, onOpenChange, originalPost, onReposted }: RepostDialogProps) => {
  const { user } = useAuth();
  const [quoteContent, setQuoteContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"repost" | "quote">("quote");

  const authorName = originalPost.profiles?.full_name || "Anonymous";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleRepost = async () => {
    if (!user) {
      toast.error("Please sign in to repost");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        content: mode === "quote" && quoteContent.trim() 
          ? quoteContent.trim() 
          : `Reposted from @${authorName}`,
        repost_of: originalPost.id,
        quote_content: mode === "quote" ? quoteContent.trim() : null,
        category: originalPost.category || "general",
      });

      if (error) throw error;

      toast.success(mode === "quote" ? "Quote posted!" : "Reposted successfully!");
      setQuoteContent("");
      onOpenChange(false);
      onReposted();
    } catch (error) {
      console.error("Error reposting:", error);
      toast.error("Failed to repost");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Repeat2 className="h-5 w-5 text-primary" />
            </div>
            <span>Share this post</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-full">
            <button
              onClick={() => setMode("quote")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                mode === "quote"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Quote className="h-4 w-4" />
              Quote Post
            </button>
            <button
              onClick={() => setMode("repost")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                mode === "repost"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Repeat2 className="h-4 w-4" />
              Repost
            </button>
          </div>

          {/* Quote Input */}
          {mode === "quote" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Textarea
                placeholder="Add your thoughts..."
                value={quoteContent}
                onChange={(e) => setQuoteContent(e.target.value)}
                className="min-h-[80px] resize-none border-2 border-muted focus:border-primary rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {quoteContent.length}/500
              </p>
            </motion.div>
          )}

          {/* Original Post Preview */}
          <div className="border-2 border-dashed border-border rounded-xl p-4 bg-muted/30">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-background text-foreground text-xs font-medium">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">@{authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(originalPost.created_at), { addSuffix: true })}
                </p>
              </div>
              {originalPost.category && (
                <CategoryBadge categoryId={originalPost.category} size="sm" showIcon={false} />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {originalPost.content}
            </p>
            {originalPost.image_url && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={originalPost.image_url}
                  alt="Post attachment"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2 rounded-full"
            onClick={handleRepost}
            disabled={submitting || (mode === "quote" && quoteContent.length > 500)}
          >
            {submitting ? (
              "Sharing..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                {mode === "quote" ? "Post Quote" : "Repost"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepostDialog;
