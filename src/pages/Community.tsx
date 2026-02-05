import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/community/PostCard";
import PostComposer from "@/components/community/PostComposer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Clock, Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
  user_liked?: boolean;
}

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("latest");

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

      const { data, error } = await query;

      if (error) throw error;

      // Check which posts the user has liked
      let postsWithLikes = data || [];
      if (user && data) {
        const { data: userLikes } = await supabase
          .from("community_likes")
          .select("post_id")
          .eq("user_id", user.id);

        const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || []);
        postsWithLikes = data.map((post) => ({
          ...post,
          user_liked: likedPostIds.has(post.id),
        }));
      }

      // Sort based on active tab
      if (activeTab === "trending") {
        postsWithLikes.sort((a, b) => b.likes_count - a.likes_count);
      }

      setPosts(postsWithLikes);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, activeTab]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-muted/30 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
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
              <span>Join 10,000+ Beauty Enthusiasts</span>
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
                  className="pl-12 pr-24 h-14 rounded-full border-2 border-border focus:border-primary text-base"
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
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Composer */}
            {user ? (
              <PostComposer onPostCreated={handlePostCreated} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Join the Conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Sign in to share your skincare journey and connect with the community.
                </p>
                <Button onClick={() => navigate("/auth")} className="rounded-full">
                  Sign In to Post
                </Button>
              </motion.div>
            )}

            {/* Tabs for sorting */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted/50 p-1 rounded-full w-full justify-start">
                <TabsTrigger
                  value="latest"
                  className="rounded-full data-[state=active]:bg-background"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Latest
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="rounded-full data-[state=active]:bg-background"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
              </TabsList>
            </Tabs>

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
                        <div className="space-y-2">
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
                  className="text-center py-16"
                >
                  <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No posts match your search. Try different keywords."
                      : "Be the first to share something with the community!"}
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
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
            {/* Community Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6"
            >
              <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Community Highlights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-background/50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">{posts.length}</p>
                  <p className="text-xs text-muted-foreground">Discussions</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">
                    {posts.reduce((acc, p) => acc + p.comments_count, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </motion.div>

            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {[
                  "#SkincareSunday",
                  "#GlowUp",
                  "#MelaninMagic",
                  "#HydrationStation",
                  "#AcneJourney",
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setSearchQuery(topic.replace("#", ""));
                      fetchPosts();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <span className="text-primary font-medium">{topic}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Community Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-muted/50 rounded-2xl p-6"
            >
              <h3 className="font-medium text-lg mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Be kind and respectful to all members</li>
                <li>• Share authentic experiences and advice</li>
                <li>• No promotional or spam content</li>
                <li>• Celebrate diversity in all forms</li>
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
