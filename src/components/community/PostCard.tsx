import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Trash2, 
  Repeat2,
  Quote,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import CategoryBadge from "./CategoryBadge";
import RepostDialog from "./RepostDialog";

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

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  reposts_count?: number;
  created_at: string;
  category?: string;
  repost_of?: string | null;
  quote_content?: string | null;
  profiles: {
    full_name: string | null;
  } | null;
  user_liked?: boolean;
  original_post?: OriginalPost | null;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface PostCardProps {
  post: Post;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
  onPostUpdated: () => void;
}

const PostCard = ({ post, onLikeToggle, onPostUpdated }: PostCardProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showRepostDialog, setShowRepostDialog] = useState(false);

  const authorName = post.profiles?.full_name || "Anonymous";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isQuotePost = post.repost_of && post.quote_content;
  const isSimpleRepost = post.repost_of && !post.quote_content;

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("community_comments")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase.from("community_comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;
      setNewComment("");
      fetchComments();
      onPostUpdated();
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = () => {
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
    onLikeToggle(post.id, post.user_liked || false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community?post=${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post on Glow Community",
          text: post.content.slice(0, 100) + "...",
          url: shareUrl,
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRepost = () => {
    if (!user) {
      toast.error("Please sign in to repost");
      return;
    }
    setShowRepostDialog(true);
  };

  const handleDeletePost = async () => {
    if (!user || user.id !== post.user_id) return;
    
    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;
      toast.success("Post deleted");
      onPostUpdated();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      fetchComments();
      onPostUpdated();
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <>
      <motion.div
        layout
        className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300 hover:border-primary/20"
      >
        {/* Repost Indicator */}
        {isSimpleRepost && (
          <div className="px-6 pt-4 pb-0 flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat2 className="h-4 w-4" />
            <span>{authorName} reposted</span>
          </div>
        )}

        {/* Post Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20 ring-2 ring-background">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">@{authorName}</p>
                  {post.category && (
                    <CategoryBadge categoryId={post.category} size="sm" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {user?.id === post.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem
                    onClick={handleDeletePost}
                    className="text-destructive focus:text-destructive rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Quote Content */}
          {isQuotePost && (
            <div className="mt-4">
              <div className="flex items-start gap-2 text-foreground">
                <Quote className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                <p className="whitespace-pre-wrap leading-relaxed">{post.quote_content}</p>
              </div>
            </div>
          )}

          {/* Original Post (for reposts/quotes) */}
          {post.original_post && (
            <div className="mt-4 border-2 border-dashed border-border rounded-xl p-4 bg-muted/30">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-background text-foreground text-xs font-medium">
                    {(post.original_post.profiles?.full_name?.[0] || "A").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    @{post.original_post.profiles?.full_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.original_post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.original_post.content}
              </p>
              {post.original_post.image_url && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img
                    src={post.original_post.image_url}
                    alt="Original post attachment"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Regular Post Content */}
          {!isQuotePost && !isSimpleRepost && (
            <div className="mt-4">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed text-[15px]">
                {post.content}
              </p>
            </div>
          )}
        </div>

        {/* Post Image */}
        {post.image_url && !post.repost_of && (
          <div className="px-6">
            <img
              src={post.image_url}
              alt="Post attachment"
              className="w-full rounded-xl object-cover max-h-96"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-6 py-2 flex items-center gap-4 text-sm text-muted-foreground">
          {post.likes_count > 0 && (
            <span>{post.likes_count} {post.likes_count === 1 ? "like" : "likes"}</span>
          )}
          {post.comments_count > 0 && (
            <span>{post.comments_count} {post.comments_count === 1 ? "comment" : "comments"}</span>
          )}
          {(post.reposts_count || 0) > 0 && (
            <span>{post.reposts_count} {post.reposts_count === 1 ? "repost" : "reposts"}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex-1 gap-2 rounded-xl transition-all ${
              post.user_liked
                ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <motion.div
              animate={isLikeAnimating ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`h-5 w-5 ${post.user_liked ? "fill-current" : ""}`}
              />
            </motion.div>
            <span className="font-medium">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleComments}
            className="flex-1 gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRepost}
            className="flex-1 gap-2 rounded-xl text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          >
            <Repeat2 className="h-5 w-5" />
            <span className="font-medium">Repost</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex-1 gap-2 rounded-xl text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <ExternalLink className="h-5 w-5" />
            <span className="font-medium hidden sm:inline">Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Comment Input */}
                {user && (
                  <form onSubmit={handleSubmitComment} className="flex gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!newComment.trim() || submittingComment}
                        className="rounded-full h-10 w-10"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                {loadingComments ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-9 h-9 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="w-24 h-3 bg-muted rounded" />
                          <div className="w-full h-4 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 group"
                      >
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {(comment.profiles?.full_name?.[0] || "A").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted/50 rounded-2xl px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm">
                              {comment.profiles?.full_name || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                              {user?.id === comment.user_id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-foreground mt-1">{comment.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Repost Dialog */}
      <RepostDialog
        open={showRepostDialog}
        onOpenChange={setShowRepostDialog}
        originalPost={{
          id: post.id,
          content: post.content,
          image_url: post.image_url,
          created_at: post.created_at,
          category: post.category,
          profiles: post.profiles,
        }}
        onReposted={onPostUpdated}
      />
    </>
  );
};

export default PostCard;
