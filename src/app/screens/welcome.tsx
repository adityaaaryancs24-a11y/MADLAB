import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useApp();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] flex flex-col relative overflow-hidden text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 45, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-16 left-1/4 w-96 h-96 bg-[#2ECC71] blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1], x: [0, -45, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-16 right-1/4 w-96 h-96 bg-[#F4A261] blur-[120px] rounded-full"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.45 }}
          className="relative mb-10"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="absolute inset-0 w-40 h-40 rounded-3xl bg-gradient-to-br from-[#2ECC71] to-[#25A65A] blur-2xl"
          />
          <div className="relative w-40 h-40 rounded-3xl bg-gradient-to-br from-[#2ECC71] to-[#25A65A] flex items-center justify-center shadow-2xl shadow-[#2ECC71]/40">
            <Zap className="w-20 h-20 text-[#0A0E15]" strokeWidth={2} fill="currentColor" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-bold uppercase tracking-[0.28em] text-[#2ECC71] mb-3"
        >
          Welcome to
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="text-6xl font-bold tracking-tight mb-5"
        >
          Verity
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="text-xl text-white/80 font-medium mb-3"
        >
          Scan the Barcode. See the Real Price.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="text-base text-white/50 max-w-xs"
        >
          Sign in to compare prices, save scans, and track better deals across your shopping history.
        </motion.p>
      </div>

      <div className="px-8 pb-10 relative z-10 space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/login")}
          className="w-full py-5 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] font-bold rounded-2xl shadow-2xl shadow-[#2ECC71]/40 hover:shadow-[#2ECC71]/60 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Continue to Login
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
          <ShieldCheck className="w-4 h-4 text-[#2ECC71]" />
          JWT-secured Verity session
        </div>
      </div>
    </div>
  );
}
