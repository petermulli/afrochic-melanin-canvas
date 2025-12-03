import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const dynamicWords = [
  { word: "You", color: "hsl(14, 52%, 46%)" }, // terracotta
  { word: "Queens", color: "hsl(30, 33%, 65%)" }, // clay
  { word: "Goddesses", color: "hsl(78, 22%, 51%)" }, // sage
  { word: "Melanin", color: "hsl(14, 52%, 46%)" }, // terracotta
  { word: "Royalty", color: "hsl(30, 33%, 65%)" }, // clay
  { word: "Beauty", color: "hsl(78, 22%, 51%)" }, // sage
];

const DynamicHeroText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-cream mb-6 leading-none">
      <span className="block font-light italic opacity-90">Beauty Designed</span>
      <span className="block mt-2">
        <span className="font-light">For </span>
        <span className="relative inline-block min-w-[200px] md:min-w-[300px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIndex}
              initial={{ y: 40, opacity: 0, rotateX: -45 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -40, opacity: 0, rotateX: 45 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1]
              }}
              className="inline-block font-semibold"
              style={{ color: dynamicWords[currentIndex].color }}
            >
              {dynamicWords[currentIndex].word}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </h1>
  );
};

export default DynamicHeroText;
