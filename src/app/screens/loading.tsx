import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, Zap } from "lucide-react";

const loadingSteps = [
  { text: "Scanning barcode...", delay: 0 },
  { text: "Searching Amazon...", delay: 800 },
  { text: "Searching eBay...", delay: 1600 },
  { text: "Comparing prices...", delay: 2400 },
];

export function Loading() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Animate through steps
    const intervals = loadingSteps.map((step, index) => {
      return setTimeout(() => {
        setCurrentStep(index);
        if (index > 0) {
          setCompletedSteps(prev => [...prev, index - 1]);
        }
      }, step.delay);
    });

    // Navigate after all steps
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, loadingSteps.length - 1]);
      setTimeout(() => {
        // Randomly select a product ID
        const productIds = ["1", "2", "3", "4", "5"];
        const randomId = productIds[Math.floor(Math.random() * productIds.length)];
        navigate(`/product/${randomId}`);
      }, 500);
    }, 3200);

    return () => {
      intervals.forEach(clearTimeout);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#2ECC71] blur-[120px] rounded-full"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#F4A261] blur-[120px] rounded-full"
        ></motion.div>
      </div>

      {/* Animated Circle with Checkmark */}
      <div className="relative mb-16 z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-28 h-28 border-4 border-white/10 border-t-[#2ECC71] rounded-full shadow-2xl shadow-[#2ECC71]/30"
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            completedSteps.length === loadingSteps.length
              ? { scale: 1, opacity: 1 }
              : { scale: 0, opacity: 0 }
          }
        >
          <div className="w-28 h-28 bg-gradient-to-br from-[#2ECC71] to-[#25A65A] rounded-full flex items-center justify-center shadow-2xl shadow-[#2ECC71]/50">
            <Check className="w-14 h-14 text-[#0A0E15]" strokeWidth={3} />
          </div>
        </motion.div>
      </div>

      {/* Loading Steps */}
      <div className="w-full max-w-xs space-y-4 z-10">
        {loadingSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: index <= currentStep ? 1 : 0.3,
              x: index <= currentStep ? 0 : -20,
            }}
            className="flex items-center gap-4"
          >
            <AnimatePresence mode="wait">
              {completedSteps.includes(index) ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-gradient-to-br from-[#2ECC71] to-[#25A65A] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#2ECC71]/40"
                >
                  <Check className="w-5 h-5 text-[#0A0E15]" strokeWidth={3} />
                </motion.div>
              ) : (
                <motion.div
                  key="spinner"
                  className="w-8 h-8 flex-shrink-0"
                >
                  {index === currentStep && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-3 border-white/10 border-t-[#2ECC71] rounded-xl shadow-lg shadow-[#2ECC71]/30"
                    />
                  )}
                  {index > currentStep && (
                    <div className="w-8 h-8 border-2 border-white/10 rounded-xl bg-white/5" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <p
              className={`text-base font-semibold transition-colors ${
                index === currentStep
                  ? "text-white"
                  : completedSteps.includes(index)
                  ? "text-[#2ECC71]"
                  : "text-white/30"
              }`}
            >
              {step.text}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Text with Pulse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-16 z-10"
      >
        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 text-[#2ECC71]" fill="currentColor" />
          </motion.div>
          <p className="text-sm text-white/70">
            Finding you the best deals...
          </p>
        </div>
      </motion.div>

      {/* Animated Progress Bar */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] shadow-lg shadow-[#2ECC71]/50"
      />
    </div>
  );
}
