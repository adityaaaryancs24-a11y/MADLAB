import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, TrendingDown, Clock, Heart, X, Filter, SortAsc, Zap, Sparkles, Activity, PieChart, IndianRupee, Target } from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { WishlistCard } from "../components/WishlistCard";
import { WishlistAnalytics } from "../components/WishlistAnalytics";
import type { WishlistSort } from "../types";

export function WatchlistHistory() {
  const navigate = useNavigate();
  const { watchlist } = useApp();
  const [sortBy, setSortBy] = useState<WishlistSort>("newest");
  const [filter, setFilter] = useState<string>("all");

  const totalProducts = watchlist.length;
  
  // Calculate Analytics
  const potentialSavings = watchlist.reduce((sum, item) => {
    return sum + Math.max(0, item.previousPrice - item.currentPrice);
  }, 0);
  
  const activeAlerts = watchlist.filter(w => w.targetPrice && w.currentPrice > w.targetPrice).length;
  
  const averageDiscount = watchlist.length > 0 
    ? (watchlist.reduce((sum, item) => sum + item.priceDropPercent, 0) / watchlist.length)
    : 0;

  // Sorting Logic
  const sortedWatchlist = useMemo(() => {
    let filtered = [...watchlist];
    if (filter === "price_dropped") {
      filtered = filtered.filter(w => w.priceDropPercent > 0);
    } else if (filter === "has_target") {
      filtered = filtered.filter(w => w.targetPrice !== undefined);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest": return b.addedAt - a.addedAt;
        case "oldest": return a.addedAt - b.addedAt;
        case "highest_discount": return b.priceDropPercent - a.priceDropPercent;
        case "lowest_price": return a.currentPrice - b.currentPrice;
        case "highest_savings": return (b.previousPrice - b.currentPrice) - (a.previousPrice - a.currentPrice);
        default: return 0;
      }
    });
  }, [watchlist, sortBy, filter]);

  return (
    <div className="min-h-screen w-full mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2ECC71] opacity-[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#F4A261] opacity-[0.03] blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.button
              whileHover={{ x: -5 }}
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </motion.button>
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              My Wishlist
              <span className="px-3 py-1 bg-white/10 rounded-full text-lg font-bold text-white/70">
                {totalProducts}
              </span>
            </h1>
            <p className="text-white/50 text-lg">Track prices and catch the best deals on your favorite items.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2ECC71]/20 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-[#2ECC71]" />
              </div>
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Potential Savings</p>
                <p className="text-white font-bold text-xl">₹{potentialSavings.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F4A261]/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-[#F4A261]" />
              </div>
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Active Alerts</p>
                <p className="text-white font-bold text-xl">{activeAlerts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Summary Cards */}
        {watchlist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <SummaryCard 
              title="Average Discount"
              value={`${averageDiscount.toFixed(1)}%`}
              icon={TrendingDown}
              color="#2ECC71"
              delay={0.1}
            />
            <SummaryCard 
              title="Tracked Items"
              value={totalProducts.toString()}
              icon={Activity}
              color="#3498DB"
              delay={0.2}
            />
            <SummaryCard 
              title="Largest Drop"
              value={`₹${Math.max(0, ...watchlist.map(w => w.previousPrice - w.currentPrice)).toFixed(0)}`}
              icon={Zap}
              color="#F4A261"
              delay={0.3}
            />
          </div>
        )}

        {/* Analytics Dashboard */}
        {watchlist.length > 0 && (
          <WishlistAnalytics wishlist={watchlist} />
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['all', 'price_dropped', 'has_target'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === f 
                    ? "bg-[#2ECC71] text-[#0A0E15]" 
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-white/50 text-sm"><SortAsc className="w-4 h-4 inline mr-1" /> Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as WishlistSort)}
              className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2ECC71]"
            >
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
              <option value="highest_discount">Highest Discount</option>
              <option value="lowest_price">Lowest Price</option>
              <option value="highest_savings">Highest Savings</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {sortedWatchlist.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-20 flex flex-col items-center justify-center text-center"
            >
              <div className="w-40 h-40 mb-8 relative">
                <div className="absolute inset-0 bg-[#F4A261]/20 blur-[50px] rounded-full"></div>
                <Heart className="w-full h-full text-[#F4A261]/50 relative z-10 drop-shadow-2xl" strokeWidth={1} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Your Wishlist is Empty</h2>
              <p className="text-white/50 max-w-md mx-auto mb-8 text-lg">
                Start tracking products you love and we'll alert you when prices drop.
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/search")}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
                >
                  Search Products
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/home")}
                  className="px-8 py-4 bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-[#0A0E15] font-bold rounded-2xl shadow-xl shadow-[#F4A261]/30 transition-all flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" /> Scan Barcode
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {sortedWatchlist.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color, delay }: { title: string, value: string, icon: any, color: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
    >
      <div 
        className="absolute -right-10 -top-10 w-40 h-40 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h3 className="text-white/60 font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-black text-white relative z-10">{value}</p>
    </motion.div>
  );
}