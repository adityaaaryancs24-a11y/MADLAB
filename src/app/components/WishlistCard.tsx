import { motion } from "motion/react";
import { TrendingDown, TrendingUp, X, Bell, ExternalLink, Target } from "lucide-react";
import type { WatchlistItem } from "../types";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

interface WishlistCardProps {
  item: WatchlistItem;
}

export function WishlistCard({ item }: WishlistCardProps) {
  const navigate = useNavigate();
  const { removeFromWatchlist, updateWatchlistItem } = useApp();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist(item.id);
    toast.success("Removed from wishlist");
  };

  const handleSetTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = prompt("Enter new target price (₹):", item.targetPrice?.toString() || item.currentPrice.toString());
    if (target && !isNaN(Number(target))) {
      updateWatchlistItem(item.id, { targetPrice: Number(target) });
      toast.success("Target price updated");
    }
  };

  const handleDeleteTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateWatchlistItem(item.id, { targetPrice: undefined });
    toast.success("Target price removed");
  };

  const isPriceDropped = item.currentPrice < item.previousPrice;
  const isNewLow = item.currentPrice <= Math.min(...item.priceHistory.map(h => h.price));
  const progressToTarget = item.targetPrice 
    ? Math.min(100, Math.max(0, ((item.previousPrice - item.currentPrice) / (item.previousPrice - item.targetPrice)) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/product/${item.productId}`)}
      className="relative group cursor-pointer"
    >
      <div className="w-full flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 hover:border-[#F4A261]/50 hover:bg-white/10 transition-all shadow-xl">
        
        {/* Badges */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 items-end">
          {isPriceDropped && (
            <div className="px-2 py-1 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] rounded-lg flex items-center gap-1 shadow-lg shadow-[#2ECC71]/40">
              <TrendingDown className="w-3 h-3 text-[#0A0E15]" strokeWidth={2.5} />
              <span className="text-xs font-bold text-[#0A0E15]">
                {item.priceDropPercent.toFixed(1)}% Drop
              </span>
            </div>
          )}
          {isNewLow && (
            <div className="px-2 py-1 bg-gradient-to-r from-[#3498DB] to-[#2980B9] rounded-lg flex items-center gap-1 shadow-lg shadow-[#3498DB]/40">
              <span className="text-xs font-bold text-white">New Low</span>
            </div>
          )}
        </div>

        {/* Image Container */}
        <div className="w-full h-48 rounded-2xl overflow-hidden bg-white/10 mb-4 border border-white/10 relative flex items-center justify-center p-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain filter drop-shadow-xl"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <p className="text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">{item.brand}</p>
          <h3 className="font-semibold text-white text-base mb-3 line-clamp-2 min-h-[48px]">
            {item.name}
          </h3>
          
          <div className="flex items-baseline gap-2 mb-1">
            <p className="font-bold text-[#2ECC71] text-2xl">
              ₹{item.currentPrice.toFixed(2)}
            </p>
            {item.previousPrice > item.currentPrice && (
              <p className="text-sm text-white/40 line-through">
                ₹{item.previousPrice.toFixed(2)}
              </p>
            )}
          </div>
          
          {item.targetPrice && (
            <div className="mt-4 p-3 bg-black/20 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Target className="w-3 h-3"/> Target: ₹{item.targetPrice}
                  <button onClick={handleSetTarget} className="ml-1 text-[#3498DB] hover:text-white transition-colors">Edit</button>
                  <button onClick={handleDeleteTarget} className="ml-1 text-red-400 hover:text-red-500 transition-colors">Delete</button>
                </span>
                <span className="text-xs font-bold text-[#F4A261]">
                  {progressToTarget >= 100 ? "Reached!" : `Distance: ₹${(item.currentPrice - item.targetPrice).toFixed(0)}`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#F4A261] to-[#E76F51] rounded-full" 
                  style={{ width: `${progressToTarget}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] text-white/30">
              Added {new Date(item.addedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Hover Actions */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handleSetTarget}
          className="w-8 h-8 rounded-full bg-[#1A1F26] text-white/70 border border-white/10 flex items-center justify-center hover:bg-[#F4A261] hover:text-white hover:border-[#F4A261] shadow-lg"
          title="Set Target Price"
        >
          <Bell className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handleRemove}
          className="w-8 h-8 rounded-full bg-[#1A1F26] text-white/70 border border-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 shadow-lg"
          title="Remove from Wishlist"
        >
          <X className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
