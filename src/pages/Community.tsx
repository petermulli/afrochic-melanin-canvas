import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/community/PostCard";
import PostComposer from "@/components/community/PostComposer";
import CategorySelector from "@/components/community/CategorySelector";
import CategoryBadge, { COMMUNITY_CATEGORIES, getCategoryById } from "@/components/community/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Users, 
  Sparkles,
  MessageSquare,
  Heart,
  Flame,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  reposts_count: number;
  created_at: string;
  category: string;
  repost_of: string | null;
  quote_content: string | null;
  profiles: {
    full_name: string | null;
  } | null;
  user_liked?: boolean;
  original_post?: OriginalPost | null;
}

const Community = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    activeMembers: 0,
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("community_posts")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order("created_at", { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike("content", `%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check which posts the user has liked and fetch original posts for reposts
      let postsWithExtras = data || [];
      
      if (data) {
        // Get user likes
        let likedPostIds = new Set<string>();
        if (user) {
          const { data: userLikes } = await supabase
            .from("community_likes")
            .select("post_id")
            .eq("user_id", user.id);
          likedPostIds = new Set(userLikes?.map((l) => l.post_id) || []);
        }

        // Get original posts for reposts
        const repostIds = data.filter(p => p.repost_of).map(p => p.repost_of);
        let originalPosts: Record<string, OriginalPost> = {};
        
        if (repostIds.length > 0) {
          const { data: originals } = await supabase
            .from("community_posts")
            .select(`
              id,
              content,
              image_url,
              created_at,
              category,
              profiles:user_id (full_name)
            `)
            .in("id", repostIds);
          
          if (originals) {
            originals.forEach((op) => {
              originalPosts[op.id] = op;
            });
          }
        }

        postsWithExtras = data.map((post) => ({
          ...post,
          user_liked: likedPostIds.has(post.id),
          original_post: post.repost_of ? originalPosts[post.repost_of] || null : null,
        }));
      }

      // Sort based on active tab
      if (activeTab === "trending") {
        postsWithExtras.sort((a, b) => 
          (b.likes_count + b.comments_count + b.reposts_count) - 
          (a.likes_count + a.comments_count + a.reposts_count)
        );
      } else if (activeTab === "hot") {
        // Hot = recent + popular (within last 24 hours with high engagement)
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        postsWithExtras = postsWithExtras.filter(p => new Date(p.created_at) > dayAgo);
        postsWithExtras.sort((a, b) => 
          (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count)
        );
      }

      setPosts(postsWithExtras);

      // Calculate stats
      const totalLikes = (data || []).reduce((acc, p) => acc + p.likes_count, 0);
      const totalComments = (data || []).reduce((acc, p) => acc + p.comments_count, 0);
      setStats({
        totalPosts: data?.length || 0,
        totalComments,
        totalLikes,
        activeMembers: new Set(data?.map(p => p.user_id) || []).size,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, activeTab, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!user) {
      toast.error("Please sign in to like posts");
      navigate("/auth");
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("community_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("community_likes")
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                user_liked: !isLiked,
                likes_count: isLiked
                  ? post.likes_count - 1
                  : post.likes_count + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-muted/30 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              <span>Join {stats.activeMembers.toLocaleString()}+ Beauty Enthusiasts</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight mb-6">
              The <span className="text-primary">Glow</span> Community
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with skincare lovers, share your journey, discover tips, and celebrate 
              the beauty of melanin-rich skin together.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search discussions, tips, routines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 h-14 rounded-full border-2 border-border focus:border-primary text-base bg-background/80 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
                >
                  Search
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center gap-8 mt-10"
          >
            {[
              { icon: MessageSquare, label: "Discussions", value: stats.totalPosts },
              { icon: Heart, label: "Reactions", value: stats.totalLikes },
              { icon: Users, label: "Members", value: stats.activeMembers },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-foreground">
                  <stat.icon className="h-5 w-5 text-primary" />
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            variant="tabs"
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Composer */}
            {user ? (
              <PostComposer 
                onPostCreated={handlePostCreated} 
                defaultCategory={selectedCategory || "general"}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-8 text-center"
              >
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Join the Conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Sign in to share your skincare journey and connect with the community.
                </p>
                <Button onClick={() => navigate("/auth")} className="rounded-full px-8" size="lg">
                  Sign In to Post
                </Button>
              </motion.div>
            )}

            {/* Feed Controls */}
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 p-1 rounded-full">
                  <TabsTrigger
                    value="latest"
                    className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Latest
                  </TabsTrigger>
                  <TabsTrigger
                    value="hot"
                    className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
                  >
                    <Flame className="h-4 w-4" />
                    Hot
                  </TabsTrigger>
                  <TabsTrigger
                    value="trending"
                    className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCategorySelect(null)}
                  className="text-muted-foreground hover:text-foreground rounded-full"
                >
                  Clear filter
                </Button>
              )}
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-card border border-border rounded-2xl p-6 animate-pulse"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="w-32 h-4 bg-muted rounded" />
                          <div className="w-24 h-3 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-4 bg-muted rounded" />
                        <div className="w-3/4 h-4 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-card border border-border rounded-2xl"
                >
                  <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {searchQuery
                      ? "No posts match your search. Try different keywords."
                      : selectedCategory
                      ? `Be the first to post in ${getCategoryById(selectedCategory).name}!`
                      : "Be the first to share something with the community!"}
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PostCard
                        post={post}
                        onLikeToggle={handleLikeToggle}
                        onPostUpdated={fetchPosts}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Community Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Community Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Discussions", value: stats.totalPosts, color: "text-blue-600" },
                  { label: "Comments", value: stats.totalComments, color: "text-emerald-600" },
                  { label: "Reactions", value: stats.totalLikes, color: "text-rose-600" },
                  { label: "Members", value: stats.activeMembers, color: "text-violet-600" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 bg-background/50 rounded-xl">
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Browse Categories */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Browse Categories
              </h3>
              <div className="space-y-2">
                {COMMUNITY_CATEGORIES.slice(0, 6).map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        isActive 
                          ? `${category.bgColor} ${category.color}` 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {[
                  { tag: "#SkincareSunday", posts: 128 },
                  { tag: "#GlowUp", posts: 94 },
                  { tag: "#MelaninMagic", posts: 87 },
                  { tag: "#HydrationStation", posts: 65 },
                  { tag: "#AcneJourney", posts: 52 },
                ].map((topic, i) => (
                  <button
                    key={topic.tag}
                    onClick={() => {
                      setSearchQuery(topic.tag.replace("#", ""));
                      fetchPosts();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground/50 group-hover:text-primary transition-colors">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-primary">{topic.tag}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{topic.posts} posts</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Community Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-muted/50 rounded-2xl p-6"
            >
              <h3 className="font-semibold text-lg mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Be kind and respectful to all members
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Share authentic experiences and advice
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  No promotional or spam content
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Celebrate diversity in all forms
                </li>
              </ul>
            </motion.div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
