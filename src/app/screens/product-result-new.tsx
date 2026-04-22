import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Heart, ExternalLink, Store, Bell, Share2, TrendingDown, Zap, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { mockProducts, getMockPrices, generatePriceHistory, predictPrice } from "../utils/mockData";
import { PriceHistoryChart } from "../components/PriceHistoryChart";
import { PriceAlertModal } from "../components/PriceAlertModal";
import { ShareModal } from "../components/ShareModal";
import { PricePredictionCard } from "../components/PricePredictionCard";
import { toast } from "sonner";

export function ProductResult() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToHistory, addToWatchlist, watchlist, removeFromWatchlist } = useApp();
  
  const [localPrice, setLocalPrice] = useState("");
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [priceHistory] = useState(generatePriceHistory(30));
  
  const product = mockProducts[id || "1"] || mockProducts["1"];
  const prices = getMockPrices(product.id);
  const pricePrediction = predictPrice(product.id, 7);
  
  const isInWatchlist = watchlist.some(item => item.productId === product.id);

  const bestOnlinePrice = Math.min(
    ...prices
      .filter((p) => p.price !== null)
      .map((p) => p.price as number)
  );

  const savings =
    localPrice && parseFloat(localPrice) > bestOnlinePrice
      ? (parseFloat(localPrice) - bestOnlinePrice).toFixed(2)
      : null;

  // Add to scan history on mount
  useEffect(() => {
    const bestPriceInfo = prices.find(p => p.isBest);
    addToHistory({
      id: Math.random().toString(36).substring(7),
      productId: product.id,
      name: product.name,
      image: product.image,
      bestPrice: `₹${bestOnlinePrice.toFixed(2)}`,
      store: bestPriceInfo?.store || "Unknown",
      timestamp: Date.now(),
      upc: product.upc,
    });
  }, []);

  const handleToggleWatchlist = () => {
    if (isInWatchlist) {
      const item = watchlist.find(w => w.productId === product.id);
      if (item) {
        removeFromWatchlist(item.id);
        toast.success("Removed from watchlist");
      }
    } else {
      addToWatchlist({
        id: Math.random().toString(36).substring(7),
        productId: product.id,
        name: product.name,
        image: product.image,
        currentPrice: bestOnlinePrice,
        previousPrice: bestOnlinePrice * 1.05,
        priceDropPercent: 5,
        priceHistory: priceHistory.map(p => ({
          timestamp: Date.now(),
          price: p.price,
          store: "Various"
        })),
        addedAt: Date.now(),
      });
      toast.success("Added to watchlist!");
    }
  };

  const handleSetPriceAlert = (targetPrice: number) => {
    toast.success(`Price alert set for ₹${targetPrice.toFixed(2)}`);
  };

  return (
    <>
      <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] pb-6 relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-0 w-96 h-96 bg-[#2ECC71] opacity-10 blur-[120px] rounded-full"></div>
          <div className="absolute top-96 right-0 w-96 h-96 bg-[#F4A261] opacity-10 blur-[120px] rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#0A0E15]/80 backdrop-blur-xl z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </motion.button>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPriceAlert(true)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
            >
              <Bell className="w-5 h-5 text-[#F4A261]" strokeWidth={2} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShare(true)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
            >
              <Share2 className="w-5 h-5 text-white/70" strokeWidth={2} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleWatchlist}
              className={`w-10 h-10 rounded-xl border transition-all ${
                isInWatchlist 
                  ? "bg-red-500/20 border-red-500/50" 
                  : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
            >
              <Heart
                className={`w-5 h-5 mx-auto ${isInWatchlist ? "text-red-500" : "text-white/70"}`}
                strokeWidth={2}
                fill={isInWatchlist ? "currentColor" : "none"}
              />
            </motion.button>
          </div>
        </div>

        {/* Product Image with Gradient Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-72 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border-b border-white/5 flex items-center justify-center p-8 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E15] via-transparent to-transparent"></div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
          />
        </motion.div>

        {/* Product Info */}
        <div className="px-6 py-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Category Badge */}
            {product.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#2ECC71]/20 to-[#2ECC71]/10 text-[#2ECC71] text-xs font-bold rounded-xl mb-3 border border-[#2ECC71]/20">
                <Sparkles className="w-3 h-3" />
                {product.category}
              </span>
            )}
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {product.name}
            </h1>
            <p className="text-base text-white/60 mb-3">
              {product.brand} • {product.model}
            </p>
            {product.description && (
              <p className="text-sm text-white/50 mb-4 leading-relaxed">
                {product.description}
              </p>
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
              <span className="font-mono text-xs text-white/50">UPC:</span>
              <span className="font-mono text-sm font-semibold text-white">
                {product.upc}
              </span>
            </div>
          </motion.div>

          {/* Price History Chart */}
          <div className="mt-8">
            <PriceHistoryChart data={priceHistory} />
          </div>

          {/* Price Comparison */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#2ECC71]" fill="currentColor" />
                Price Comparison
              </h2>
              <span className="text-sm text-white/50">{prices.length} stores</span>
            </div>

            <div className="space-y-3">
              {prices.map((price, index) => (
                <motion.div
                  key={price.store}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`p-4 rounded-2xl transition-all backdrop-blur-xl relative overflow-hidden ${
                    price.isBest
                      ? "bg-gradient-to-r from-[#2ECC71]/20 to-[#2ECC71]/10 border-2 border-[#2ECC71]/50 shadow-lg shadow-[#2ECC71]/20"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {price.isBest && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#2ECC71] opacity-10 blur-2xl rounded-full"></div>
                  )}
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      {price.logo ? (
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/10">
                          {price.logo}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                          <Store className="w-6 h-6 text-white/50" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white">
                            {price.store}
                          </p>
                          {price.isBest && (
                            <span className="px-2 py-1 bg-gradient-to-r from-[#F4A261] to-[#E8935A] text-[#0A0E15] text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg shadow-[#F4A261]/30">
                              <TrendingDown className="w-3 h-3" />
                              Best
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50">{price.stock}</p>
                      </div>
                    </div>

                    {price.isInput ? (
                      <input
                        type="number"
                        value={localPrice}
                        onChange={(e) => setLocalPrice(e.target.value)}
                        placeholder="₹___"
                        className="w-28 px-4 py-2 text-right font-bold text-white bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 focus:border-[#2ECC71] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/50 placeholder-white/30"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className={`text-2xl font-bold ${price.isBest ? 'text-[#2ECC71]' : 'text-white'}`}>
                          ₹{price.price?.toFixed(2)}
                        </p>
                        {price.url && (
                          <a
                            href={price.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                          >
                            <ExternalLink className="w-5 h-5 text-white/50 hover:text-white" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Savings Banner */}
            {savings && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-[#2ECC71]/20 to-[#25A65A]/20 border border-[#2ECC71]/50 backdrop-blur-xl shadow-lg shadow-[#2ECC71]/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#2ECC71] font-semibold mb-1">
                      You could save
                    </p>
                    <p className="text-3xl font-bold text-white">
                      ₹{savings}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#25A65A] flex items-center justify-center shadow-xl shadow-[#2ECC71]/40">
                    <TrendingDown className="w-8 h-8 text-[#0A0E15]" strokeWidth={2.5} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Manual Entry Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
          >
            <p className="text-xs text-white/50 text-center leading-relaxed">
              Enter your local store price to see potential savings
            </p>
          </motion.div>

          {/* Price Prediction Card */}
          <div className="mt-8">
            <PricePredictionCard prediction={pricePrediction} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPriceAlert && (
        <PriceAlertModal
          isOpen={showPriceAlert}
          onClose={() => setShowPriceAlert(false)}
          currentPrice={bestOnlinePrice}
          onSetAlert={handleSetPriceAlert}
        />
      )}

      {showShare && (
        <ShareModal
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          product={{
            name: product.name,
            price: bestOnlinePrice,
            image: product.image,
            upc: product.upc,
          }}
        />
      )}
    </>
  );
}