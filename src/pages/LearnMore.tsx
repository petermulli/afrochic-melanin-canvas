import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Leaf, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";

const LearnMore = () => {
  const navigate = useNavigate();

  const featuredArticle = {
    title: "The AfroChic Beauty Philosophy",
    excerpt: "Celebrating natural beauty through science-backed formulations and traditional African botanicals. Discover how we're redefining beauty standards.",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200&q=80",
    readTime: "10 min read",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={featuredArticle.image}
            alt="Learn More"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-chocolate/70 via-chocolate/50 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-cream mb-6">
              Beauty <span className="font-semibold">Knowledge</span>
            </h1>
            <p className="text-lg md:text-xl text-cream/90 mb-8">
              Expert insights, beauty tips, and the science behind radiant skin
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12 container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <Card className="overflow-hidden bg-card/95 backdrop-blur-sm shadow-elevated hover:shadow-soft transition-all duration-300 hover-lift">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-full">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Featured
                </span>
              </div>
            </div>
            <CardContent className="p-8 md:p-12 flex flex-col justify-center">
              <p className="text-sm text-muted-foreground mb-2">{featuredArticle.readTime}</p>
              <h2 className="text-3xl md:text-4xl font-light mb-4">{featuredArticle.title}</h2>
              <p className="text-muted-foreground mb-6 text-lg">{featuredArticle.excerpt}</p>
            <Button className="w-fit group rounded-full" onClick={() => navigate(`/blog/${blogPosts[0].slug}`)}>
              Read Article
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* Articles Grid */}
      <section className="py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Explore Topics
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From skincare basics to advanced beauty techniques
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((article, index) => {
            const iconMap: { [key: string]: any } = {
              "Skincare": Sparkles,
              "Ingredients": Leaf,
              "Beauty Tips": Heart,
              "Guides": Sparkles,
              "Sustainability": Leaf
            };
            const Icon = iconMap[article.category] || Sparkles;
            return (
              <Card
                key={article.id}
                className="overflow-hidden group hover:shadow-elevated transition-all duration-300 hover-lift cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/blog/${article.slug}`)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-xs text-muted-foreground mb-2">{article.readTime}</p>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                  <Button variant="ghost" className="p-0 h-auto font-medium group/btn">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <Heart className="h-12 w-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get beauty tips, product updates, and exclusive content delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button className="rounded-full px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearnMore;
