import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, TrendingDown, Clock, Heart, X, Filter, SortAsc, Zap, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export function WatchlistHistory() {
  const navigate = useNavigate();
  const { scanHistory, watchlist, removeFromHistory, removeFromWatchlist, clearHistory } = useApp();
  const [activeTab, setActiveTab] = useState<"history" | "watchlist">("history");
  const [sortBy, setSortBy] = useState<"date" | "price">("date");

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all scan history?")) {
      clearHistory();
      toast.success("History cleared");
    }
  };

  const handleRemoveFromWatchlist = (id: string) => {
    removeFromWatchlist(id);
    toast.success("Removed from watchlist");
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  // Sort history
  const sortedHistory = [...scanHistory].sort((a, b) => {
    if (sortBy === "date") {
      return b.timestamp - a.timestamp;
    } else {
      const priceA = parseFloat(a.bestPrice.replace("$", ""));
      const priceB = parseFloat(b.bestPrice.replace("$", ""));
      return priceA - priceB;
    }
  });

  // Sort watchlist
  const sortedWatchlist = [...watchlist].sort((a, b) => {
    if (sortBy === "date") {
      return b.addedAt - a.addedAt;
    } else {
      return a.currentPrice - b.currentPrice;
    }
  });

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#2ECC71] opacity-10 blur-[120px] rounded-full"></div>
        <div className="absolute top-96 right-1/4 w-96 h-96 bg-[#F4A261] opacity-10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 backdrop-blur-xl bg-[#0A0E15]/50 relative z-10 sticky top-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/home")}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
        </motion.button>
        <h1 className="text-xl font-bold text-white flex-1">History & Watchlist</h1>
        
        {/* Sort Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy(sortBy === "date" ? "price" : "date")}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-all"
        >
          <SortAsc className="w-4 h-4 text-[#2ECC71]" />
          <span className="text-sm font-semibold text-white">{sortBy === "date" ? "Date" : "Price"}</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 relative z-10">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-4 font-semibold transition-all relative ${
            activeTab === "history"
              ? "text-[#2ECC71]"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            <span>History ({scanHistory.length})</span>
          </div>
          {activeTab === "history" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2ECC71] to-transparent shadow-lg shadow-[#2ECC71]/50"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex-1 py-4 font-semibold transition-all relative ${
            activeTab === "watchlist"
              ? "text-[#F4A261]"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4" />
            <span>Watchlist ({watchlist.length})</span>
          </div>
          {activeTab === "watchlist" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F4A261] to-transparent shadow-lg shadow-[#F4A261]/50"
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {sortedHistory.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No scan history"
                  description="Your scanned items will appear here"
                  color="#2ECC71"
                  action={
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/home")}
                      className="mt-6 px-8 py-4 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] font-bold rounded-2xl shadow-2xl shadow-[#2ECC71]/40 hover:shadow-[#2ECC71]/60 transition-all flex items-center gap-2"
                    >
                      <Zap className="w-5 h-5" fill="currentColor" />
                      Scan Your First Item
                    </motion.button>
                  }
                />
              ) : (
                <>
                  {/* Clear History Button */}
                  <div className="mb-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearHistory}
                      className="text-sm text-red-400 hover:text-red-300 font-semibold px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                    >
                      Clear All
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    {sortedHistory.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                      >
                        <button
                          onClick={() => navigate(`/product/${item.productId}`)}
                          className="w-full flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-[#2ECC71]/50 hover:bg-white/10 transition-all"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h3 className="font-semibold text-white mb-1.5 line-clamp-1">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-bold text-[#2ECC71]">{item.bestPrice}</span>
                              <span className="text-xs text-white/40">on</span>
                              <span className="text-xs text-white/60">{item.store}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-white/40">{formatTimeAgo(item.timestamp)}</p>
                              <span className="text-xs text-white/20">•</span>
                              <p className="text-xs font-mono text-white/40">{item.upc}</p>
                            </div>
                          </div>
                        </button>
                        
                        {/* Delete Button */}
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          onClick={() => removeFromHistory(item.id)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 shadow-lg shadow-red-500/30"
                        >
                          <X className="w-4 h-4" strokeWidth={2.5} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === "watchlist" && (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {sortedWatchlist.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No saved items"
                  description="Save items to track price changes"
                  color="#F4A261"
                  action={
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/home")}
                      className="mt-6 px-8 py-4 bg-gradient-to-r from-[#F4A261] to-[#E8935A] text-[#0A0E15] font-bold rounded-2xl shadow-2xl shadow-[#F4A261]/40 hover:shadow-[#F4A261]/60 transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Start Scanning
                    </motion.button>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {sortedWatchlist.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="relative group"
                    >
                      <button
                        onClick={() => navigate(`/product/${item.productId}`)}
                        className="w-full flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-[#F4A261]/50 hover:bg-white/10 transition-all"
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/10 mb-3 border border-white/10 relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.priceDropPercent > 0 && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] rounded-lg flex items-center gap-1 shadow-lg shadow-[#2ECC71]/40">
                              <TrendingDown className="w-3 h-3 text-[#0A0E15]" strokeWidth={2.5} />
                              <span className="text-xs font-bold text-[#0A0E15]">
                                {item.priceDropPercent}%
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 text-left min-h-[40px]">
                          {item.name}
                        </h3>
                        <p className="font-bold text-[#2ECC71] text-lg mb-2 text-left">
                          ₹{item.currentPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-white/40 text-left">
                          Added {formatDate(item.addedAt)}
                        </p>
                      </button>
                      
                      {/* Remove Button */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleRemoveFromWatchlist(item.id)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 shadow-lg shadow-red-500/30 z-10"
                      >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  color = "#2ECC71"
}: {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-24 h-24 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-6 relative"
      >
        <div 
          className="absolute inset-0 blur-2xl rounded-3xl opacity-30"
          style={{ backgroundColor: color }}
        ></div>
        <Icon className="w-12 h-12 text-white/50 relative z-10" strokeWidth={1.5} />
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/50 text-center mb-4">{description}</p>
      {action}
    </motion.div>
  );
}