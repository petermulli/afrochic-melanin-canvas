import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Leaf, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight">
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Born from a passion to celebrate the beauty of melanin-rich skin
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  AfroChic was founded in Nairobi with a clear mission: to create premium
                  cosmetics that truly understand and enhance the beauty of African skin. For
                  too long, people of color have been underserved by the beauty industry,
                  forced to adapt products that weren't designed with them in mind.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mt-6">
                  We believe that beauty products should celebrate, not compromise, the
                  richness of melanin. Every formula we create combines traditional African
                  botanicals—like shea butter, baobab oil, and cocoa—with cutting-edge
                  cosmetic science. The result is products that not only look stunning but
                  also nourish and protect your skin.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mt-6">
                  Today, AfroChic stands as a beacon of pride for Kenyan beauty innovation,
                  offering a range of products that honor heritage while embracing modernity.
                  We're more than a brand—we're a celebration of identity, crafted for those
                  who refuse to settle for anything less than extraordinary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              What We Stand For
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Inclusivity</h3>
              <p className="text-muted-foreground leading-relaxed">
                We design for the full spectrum of melanin-rich skin, ensuring everyone finds
                their perfect match and feels seen.
              </p>
            </div>

            <div
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage/10 mb-4">
                <Leaf className="h-10 w-10 text-sage" />
              </div>
              <h3 className="text-2xl font-semibold">Sustainability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our ingredients are ethically sourced, and we're committed to sustainable
                practices that honor the earth.
              </p>
            </div>

            <div
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
                <Sparkles className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold">Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Premium quality is non-negotiable. Every product undergoes rigorous testing to
                meet the highest standards.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
