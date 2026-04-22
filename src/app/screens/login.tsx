import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, User, Eye, EyeOff, Zap, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication
    const user = {
      id: Math.random().toString(36).substring(7),
      name: formData.name || formData.email.split("@")[0],
      email: formData.email,
    };
    
    login(user);
    toast.success(isSignUp ? "Account created successfully!" : "Welcome back!");
    navigate("/onboarding");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] flex flex-col relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-1/4 w-96 h-96 bg-[#2ECC71] blur-[120px] rounded-full"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#F4A261] blur-[120px] rounded-full"
        ></motion.div>
      </div>

      {/* Header */}
      <div className="pt-20 pb-12 px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#25A65A] flex items-center justify-center shadow-2xl shadow-[#2ECC71]/40">
              <Zap className="w-7 h-7 text-[#0A0E15]" fill="currentColor" />
            </div>
            <h1 className="font-bold text-white text-[42px] tracking-tight">Verity</h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base text-white/70 font-medium"
          >
            Scan the Barcode. See the Real Price.
          </motion.p>
        </motion.div>
      </div>

      {/* Form Container */}
      <div className="flex-1 px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                !isSignUp
                  ? "bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] shadow-lg shadow-[#2ECC71]/30"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                isSignUp
                  ? "bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] shadow-lg shadow-[#2ECC71]/30"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Sign Up Only) */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-white/30 focus:border-[#2ECC71] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/50 transition-all"
                    required={isSignUp}
                  />
                </div>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-white/30 focus:border-[#2ECC71] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/50 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-14 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-white/30 focus:border-[#2ECC71] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 mt-8 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] font-bold rounded-2xl shadow-2xl shadow-[#2ECC71]/40 hover:shadow-[#2ECC71]/60 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isSignUp ? "Create Account" : "Sign In"}
            </motion.button>

            {/* Forgot Password (Login Only) */}
            {!isSignUp && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                type="button"
                className="w-full text-sm text-white/50 hover:text-[#2ECC71] transition-colors mt-4"
              >
                Forgot your password?
              </motion.button>
            )}
          </form>

          {/* Social Login (Optional) */}
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[#0A0E15] text-white/50">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white/70 font-semibold hover:bg-white/10 transition-all"
              >
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white/70 font-semibold hover:bg-white/10 transition-all"
              >
                Apple
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-8 text-center relative z-10">
        <p className="text-xs text-white/40">
          By continuing, you agree to our{" "}
          <button className="text-[#2ECC71] hover:underline">Terms</button> and{" "}
          <button className="text-[#2ECC71] hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}
