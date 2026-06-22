import { motion, AnimatePresence } from "motion/react";
import { X, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    image?: string;
    upc?: string;
  };
}

export function ShareModal({
  isOpen,
  onClose,
  product,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const productUrl = `https://verity.app/product/${product.upc || ""}`;
  const shareText = `Check out ${product.name} for only ₹${product.price.toFixed(2)}! Found the best price using Verity.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: "💬",
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + productUrl)}`,
    },
    {
      name: "Twitter",
      icon: "🐦",
      color: "#1DA1F2",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
    },
    {
      name: "Facebook",
      icon: "📘",
      color: "#4267B2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    },
    {
      name: "Email",
      icon: "✉️",
      color: "#EA4335",
      url: `mailto:?subject=${encodeURIComponent("Great Deal on " + product.name)}&body=${encodeURIComponent(shareText + "\n" + productUrl)}`,
    },
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
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 max-w-md mx-auto bg-[#12171F] backdrop-blur-xl rounded-t-3xl z-50 overflow-hidden shadow-2xl border-t border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2ECC71]/20 to-[#2ECC71]/10 flex items-center justify-center shadow-lg shadow-[#2ECC71]/20">
                  <Share2 className="w-6 h-6 text-[#2ECC71]" />
                </div>
                <h2 className="text-xl font-bold text-white">Share Deal</h2>
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
              {/* Share Options */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {shareOptions.map((option, index) => (
                  <motion.a
                    key={option.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform shadow-lg"
                      style={{ 
                        backgroundColor: option.color + "20",
                        boxShadow: `0 10px 30px ${option.color}30`
                      }}
                    >
                      {option.icon}
                    </div>
                    <span className="text-xs text-white/60 font-semibold">
                      {option.name}
                    </span>
                  </motion.a>
                ))}
              </div>

              {/* Copy Link */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/50 mb-1 font-semibold">Share Link</p>
                    <p className="text-sm text-white/80 font-medium truncate">
                      {productUrl}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex-shrink-0 px-5 py-3 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] font-bold rounded-xl hover:shadow-xl hover:shadow-[#2ECC71]/40 transition-all flex items-center gap-2 shadow-lg shadow-[#2ECC71]/30"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Safe area for mobile */}
            <div className="h-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}