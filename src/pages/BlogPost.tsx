import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react";
import { blogPosts, getRelatedPosts } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-display font-light text-3xl md:text-4xl mb-4 tracking-tight">
              Article not found
            </h1>
            <Button onClick={() => navigate("/learn-more")} className="rounded-full">
              Back to articles
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(post.id);
  const formattedDate = new Date(post.publishedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Back nav */}
      <div className="container mx-auto pt-6 md:pt-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/learn-more")}
          className="group -ml-3 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          All articles
        </Button>
      </div>

      {/* Editorial header */}
      <header className="container mx-auto pt-8 md:pt-14 pb-10 md:pb-14">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-semibold">
              {post.category}
            </Badge>
          </div>

          <h1 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[-0.035em] leading-[1.05] text-foreground">
            {post.title}
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback className="text-[10px]">
                  {post.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground/80">{post.author.name}</span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </div>
            <div className="hidden sm:block h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </div>
          </div>
        </div>
      </header>

      {/* Cover image */}
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl md:rounded-3xl">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Article body — narrow editorial column */}
      <article className="container mx-auto py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div
            className="prose prose-neutral max-w-none
              prose-headings:font-display prose-headings:font-light prose-headings:tracking-tight prose-headings:text-foreground
              prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-4
              prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:tracking-[-0.02em]
              prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-3
              prose-p:text-[1.0625rem] prose-p:leading-[1.75] prose-p:text-foreground/85 prose-p:font-normal
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-5 prose-ul:text-foreground/85 prose-li:my-1.5 prose-li:leading-relaxed
              prose-ol:my-5 prose-ol:text-foreground/85
              prose-li:marker:text-primary
              prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-foreground/75 prose-blockquote:font-light prose-blockquote:text-lg
              prose-img:rounded-xl prose-img:my-8
              prose-hr:my-12 prose-hr:border-border"
          >
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-14 pt-8 border-t border-border">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-semibold">
                Tagged
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full text-xs font-normal px-3 py-1 border-border"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author card */}
          <Card className="mt-12 border-0 bg-muted/40 rounded-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <Avatar className="h-16 w-16 ring-1 ring-border">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1">
                    Written by
                  </p>
                  <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
                    {post.author.name}
                  </h3>
                  <p className="text-primary text-sm mb-2">{post.author.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>

      {/* Related */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                    Keep reading
                  </p>
                  <h2 className="font-display font-light text-2xl md:text-3xl tracking-tight">
                    Related articles
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/learn-more")}
                  className="group self-start sm:self-end"
                >
                  All articles
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="overflow-hidden group cursor-pointer border-0 bg-card rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-300"
                    onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-background/95 text-foreground border-0 rounded-full text-[10px] uppercase tracking-wider px-2.5 py-1 font-semibold">
                          {relatedPost.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider">
                        {relatedPost.readTime}
                      </p>
                      <h3 className="font-display text-lg md:text-xl font-medium tracking-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {relatedPost.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
