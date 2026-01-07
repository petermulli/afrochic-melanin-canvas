import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Leaf, Sparkles, Truck, Globe, Clock } from "lucide-react";

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
              Your trusted partner for fast, reliable shipping and logistics services across Kenya
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Kenyashipment was founded in Nairobi with a clear mission: to revolutionize 
                  shipping and logistics services in Kenya. For too long, businesses and 
                  individuals have struggled with unreliable delivery services, high costs, 
                  and lack of transparency.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mt-6">
                  We believe that shipping should be simple, affordable, and dependable. 
                  Every package we handle is treated with care, tracked in real-time, and 
                  delivered with the efficiency that modern commerce demands. From small 
                  parcels to large cargo, we've built a network that reaches every corner 
                  of Kenya.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mt-6">
                  Today, Kenyashipment stands as a beacon of innovation in Kenyan logistics,
                  offering a range of services that honor our commitment to excellence while
                  embracing modern technology. We're more than a shipping company—we're your
                  partner in growth.
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
                <Clock className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Speed</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fast delivery times with same-day and next-day options available
                across major cities in Kenya.
              </p>
            </div>

            <div
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage/10 mb-4">
                <Truck className="h-10 w-10 text-sage" />
              </div>
              <h3 className="text-2xl font-semibold">Reliability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your packages are tracked, insured, and handled with care throughout
                the entire delivery journey.
              </p>
            </div>

            <div
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
                <Globe className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold">Coverage</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nationwide network reaching every county in Kenya, with international
                shipping capabilities.
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
