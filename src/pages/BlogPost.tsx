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
  
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-light mb-4">Post Not Found</h1>
            <Button onClick={() => navigate("/learn-more")}>
              Back to Learn More
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const relatedPosts = getRelatedPosts(post.id);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/learn-more")}
          className="group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </Button>
      </div>
      
      {/* Hero Image */}
      <section className="relative h-[50vh] mt-4">
        <div className="absolute inset-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      </section>
      
      {/* Article Content */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="bg-card rounded-lg p-8 md:p-12 shadow-elevated mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground">{post.excerpt}</p>
          </div>
          
          {/* Article Body */}
          <div className="bg-card rounded-lg p-8 md:p-12 shadow-sm mb-8">
            <div className="prose prose-lg max-w-none prose-headings:font-light prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground/90 prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-semibold prose-ul:text-foreground/90 prose-li:marker:text-primary">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>
          
          {/* Author Info */}
          <Card className="mb-12 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-4 border-primary/10">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-1">{post.author.name}</h3>
                  <p className="text-primary mb-3">{post.author.role}</p>
                  <p className="text-muted-foreground leading-relaxed">{post.author.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-3xl font-light mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Card
                    key={relatedPost.id}
                    className="overflow-hidden group hover:shadow-elevated transition-all duration-300 hover-lift cursor-pointer"
                    onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-chocolate/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary">{relatedPost.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-xs text-muted-foreground mb-2">{relatedPost.readTime}</p>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>
                      <Button variant="ghost" className="p-0 h-auto font-medium group/btn">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
