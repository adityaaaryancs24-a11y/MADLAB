import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell } from "lucide-react";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetAlert: (targetPrice: number) => void;
  currentPrice: number;
  productName?: string;
}

export function PriceAlertModal({
  isOpen,
  onClose,
  onSetAlert,
  currentPrice,
  productName = "this product",
}: PriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState("");

  const handleSubmit = () => {
    const price = parseFloat(targetPrice);
    if (price > 0 && price < currentPrice) {
      onSetAlert(price);
      setTargetPrice("");
      onClose();
    }
  };

  const suggestedPrices = [
    currentPrice * 0.95,
    currentPrice * 0.90,
    currentPrice * 0.85,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-[#12171F] backdrop-blur-xl rounded-3xl z-50 overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F4A261]/20 to-[#F4A261]/10 flex items-center justify-center shadow-lg shadow-[#F4A261]/20">
                  <Bell className="w-6 h-6 text-[#F4A261]" />
                </div>
                <h2 className="text-xl font-bold text-white">Set Price Alert</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white/70" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-white/70 mb-6 leading-relaxed">
                Get notified when <span className="font-bold text-white">{productName}</span> drops
                below your target price
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Current Price: <span className="text-[#2ECC71]">₹{currentPrice.toFixed(2)}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="Enter target price"
                    className="w-full pl-10 pr-4 py-4 text-white font-bold text-lg bg-white/5 backdrop-blur-xl rounded-2xl border-2 border-white/10 focus:border-[#F4A261] focus:outline-none focus:ring-2 focus:ring-[#F4A261]/50 placeholder-white/30 transition-all"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-3">
                  Quick Select
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {suggestedPrices.map((price, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTargetPrice(price.toFixed(2))}
                      className="py-3 px-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-[#F4A261]/50 hover:bg-white/10 transition-all"
                    >
                      <div className="text-xs text-[#F4A261] mb-1 font-bold">
                        {(((currentPrice - price) / currentPrice) * 100).toFixed(0)}% off
                      </div>
                      <div className="font-bold text-white">
                        ₹{price.toFixed(2)}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!targetPrice || parseFloat(targetPrice) >= currentPrice}
                className="w-full py-4 bg-gradient-to-r from-[#F4A261] to-[#E8935A] text-[#0A0E15] font-bold rounded-2xl hover:shadow-2xl hover:shadow-[#F4A261]/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#F4A261]/30"
              >
                Set Alert
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}