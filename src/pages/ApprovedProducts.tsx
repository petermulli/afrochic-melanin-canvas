import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApprovedProductSearch from "@/components/ApprovedProductSearch";
import { motion } from "framer-motion";

const ApprovedProducts = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
              Approved Products
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search our carefully curated catalog of dermatologist-approved skincare products. 
              Each product has been reviewed for quality, safety, and effectiveness.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ApprovedProductSearch />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApprovedProducts;
