import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ClipboardPaste, Camera, Sparkles, Hash } from "lucide-react";
import { toast } from "sonner";

export function ManualEntry() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setBarcode(text.replace(/\D/g, "")); // Remove non-numeric characters
      toast.success("Barcode pasted from clipboard");
    } catch (err) {
      toast.error("Failed to read clipboard");
    }
  };

  const validateBarcode = (code: string): boolean => {
    // Basic validation: check if it's a valid length for UPC/EAN
    const length = code.length;
    return length === 8 || length === 12 || length === 13 || length === 14;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      toast.error("Please enter a barcode");
      return;
    }

    if (!validateBarcode(barcode)) {
      toast.error("Invalid barcode format. Expected 8, 12, 13, or 14 digits");
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      navigate("/loading");
    }, 500);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] flex flex-col relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#2ECC71] blur-[120px] rounded-full"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#F4A261] blur-[120px] rounded-full"
        ></motion.div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 backdrop-blur-xl bg-[#0A0E15]/50 relative z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/home")}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
        </motion.button>
        <h1 className="text-xl font-bold text-white">
          Enter Barcode Manually
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-12 relative z-10">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#2ECC71]/20 to-[#2ECC71]/10 border border-[#2ECC71]/20 flex items-center justify-center backdrop-blur-xl shadow-lg shadow-[#2ECC71]/20">
              <Hash className="w-12 h-12 text-[#2ECC71]" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Instruction */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base text-white/70 mb-8 text-center leading-relaxed"
          >
            Enter the UPC or EAN barcode number to find price comparisons across all major retailers.
          </motion.p>

          {/* Input Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mb-6"
          >
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode number"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={14}
              className="w-full px-6 py-5 bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-2xl text-white text-center text-xl font-mono tracking-wider placeholder-white/30 focus:border-[#2ECC71] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/50 transition-all"
              autoFocus
            />
            {barcode.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-8 left-0 right-0 text-center"
              >
                <p className={`text-sm ${validateBarcode(barcode) ? "text-[#2ECC71]" : "text-white/40"}`}>
                  {barcode.length} / 14 digits
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Paste Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handlePaste}
            className="w-full py-4 mt-12 mb-6 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-[#F4A261]/50 transition-all flex items-center justify-center gap-2"
          >
            <ClipboardPaste className="w-5 h-5" />
            Paste from Clipboard
          </motion.button>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isValidating || !barcode.trim()}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              isValidating || !barcode.trim()
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] shadow-2xl shadow-[#2ECC71]/40 hover:shadow-[#2ECC71]/60"
            }`}
          >
            {isValidating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-[#0A0E15]/30 border-t-[#0A0E15] rounded-full"
                />
                Validating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Search Prices
              </>
            )}
          </motion.button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Alternative Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[#0A0E15] text-white/40">
                  Or use camera instead
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/home")}
              className="w-full py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 font-semibold rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Scan with Camera
            </motion.button>
          </motion.div>
        </motion.form>
      </div>

      {/* Valid Formats Helper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-6 pb-8 relative z-10"
      >
        <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <p className="text-xs text-white/50 text-center mb-2">
            <strong className="text-white/70">Valid formats:</strong>
          </p>
          <p className="text-xs text-white/40 text-center leading-relaxed">
            UPC-A (12 digits), UPC-E (8 digits), EAN-13 (13 digits), EAN-14 (14 digits)
          </p>
        </div>
      </motion.div>
    </div>
  );
}
