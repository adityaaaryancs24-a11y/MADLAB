import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Scan, BarChart3, TrendingDown, Zap, Sparkles, Shield } from "lucide-react";

const slides = [
  {
    title: "Meet Verity.",
    subtitle: "Scan the Barcode. See the Real Price.",
    icon: Zap,
    description: "Your intelligent companion for fearless shopping",
    color: "#2ECC71",
    gradient: "from-[#2ECC71] to-[#25A65A]",
  },
  {
    title: "Instant Price Intel.",
    subtitle: "Compare prices across all major retailers",
    icon: Sparkles,
    description: "Amazon, eBay, Walmart, Target and 20+ more",
    color: "#F4A261",
    gradient: "from-[#F4A261] to-[#E8935A]",
  },
  {
    title: "Never Overpay Again.",
    subtitle: "Track prices and get instant alerts",
    icon: Shield,
    description: "Save money on every purchase, guaranteed",
    color: "#60A5FA",
    gradient: "from-[#60A5FA] to-[#3B82F6]",
  },
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const CurrentIcon = slides[currentSlide].icon;
  const currentColor = slides[currentSlide].color;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/home");
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] flex flex-col relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: currentColor }}
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#F4A261] opacity-10 blur-[120px] rounded-full"
        ></motion.div>
      </div>

      {/* Skip Button */}
      <div className="pt-6 px-6 flex justify-end relative z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSkip}
          className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all backdrop-blur-xl"
        >
          Skip
        </motion.button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon with Glow Effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="mb-12 relative"
            >
              {/* Outer Glow Ring */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 w-40 h-40 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} blur-2xl`}
              ></motion.div>
              
              {/* Icon Container */}
              <div className={`relative w-40 h-40 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center shadow-2xl`}
                style={{ boxShadow: `0 20px 60px ${currentColor}40` }}
              >
                <CurrentIcon className="w-20 h-20 text-[#0A0E15]" strokeWidth={2} fill="currentColor" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-4"
            >
              {slides[currentSlide].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/80 mb-3 font-medium"
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base text-white/50"
            >
              {slides[currentSlide].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="pb-12 px-8 relative z-10">
        {/* Page Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.2 }}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide
                  ? "w-10 shadow-lg"
                  : "w-2 bg-white/20 hover:bg-white/30"
              }`}
              style={{
                backgroundColor: index === currentSlide ? currentColor : undefined,
                boxShadow: index === currentSlide ? `0 0 20px ${currentColor}80` : undefined
              }}
            />
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-2xl ${
            currentSlide === slides.length - 1
              ? "bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15]"
              : "bg-white/10 backdrop-blur-xl text-white border border-white/20"
          }`}
          style={{
            boxShadow: currentSlide === slides.length - 1 
              ? "0 20px 60px rgba(46, 204, 113, 0.4)" 
              : "0 10px 40px rgba(0, 0, 0, 0.3)"
          }}
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
        </motion.button>
      </div>
    </div>
  );
}
