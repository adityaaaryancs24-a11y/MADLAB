import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, Sparkles, Brain, AlertCircle, ShoppingCart, Clock, Star } from "lucide-react";
import type { PricePrediction } from "../types";

interface PricePredictionCardProps {
  prediction: PricePrediction;
}

export function PricePredictionCard({ prediction }: PricePredictionCardProps) {
  const priceDifference = prediction.predictedPrice - prediction.currentPrice;
  const percentageChange = ((priceDifference / prediction.currentPrice) * 100);

  const isDown   = prediction.trend === "Likely to Decrease";
  const isUp     = prediction.trend === "Likely to Increase";
  const isStable = prediction.trend === "Stable";

  const trendColor = isDown ? "#2ECC71" : isUp ? "#F4A261" : "#6B7280";
  const trendGrad  = isDown ? "from-[#2ECC71] to-[#25A65A]"
                   : isUp   ? "from-[#F4A261] to-[#E76F51]"
                   :          "from-[#6B7280] to-[#4B5563]";

  const TrendIcon = isDown ? TrendingDown : isUp ? TrendingUp : Minus;
  const dealScore = prediction.dealScore ?? 50;

  // Deal score ring color
  const ringColor = dealScore >= 70 ? "#2ECC71" : dealScore >= 40 ? "#F4A261" : "#EF4444";
  const ringDash  = Math.round((dealScore / 100) * 113); // circumference ~113 for r=18

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${trendGrad} blur-[80px]`} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ECC71] to-[#25A65A] flex items-center justify-center shadow-lg shadow-[#2ECC71]/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              AI Price Prediction
              <Sparkles className="w-4 h-4 text-[#F4A261]" />
            </h3>
            <p className="text-white/50 text-xs">Next {prediction.daysAhead} days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50">Confidence</p>
          <p className="text-[#2ECC71] font-bold">{prediction.confidence}%</p>
        </div>
      </div>

      {/* Trend Badge */}
      <div className={`mb-6 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${trendGrad} bg-opacity-10 border border-white/10`}>
        <div className="flex items-center gap-2">
          <TrendIcon className="w-5 h-5" style={{ color: trendColor }} />
          <span className="text-white font-bold">{prediction.trend}</span>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg" style={{ color: trendColor }}>
            {priceDifference >= 0 ? "+" : ""}₹{Math.abs(priceDifference).toFixed(2)}
          </p>
          <p className="text-white/50 text-xs">{percentageChange >= 0 ? "+" : ""}{percentageChange.toFixed(1)}%</p>
        </div>
      </div>

      {/* Current → Predicted */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-white/50 text-xs mb-1">Current Price</p>
          <p className="text-white font-bold text-2xl">₹{prediction.currentPrice.toFixed(2)}</p>
          <p className="text-white/30 text-[10px] mt-1">Now</p>
        </div>
        <div className={`p-4 bg-gradient-to-br ${trendGrad} rounded-2xl border border-white/20 shadow-lg`}>
          <p className="text-white/90 text-xs mb-1">Predicted Price</p>
          <p className="text-white font-bold text-2xl">₹{prediction.predictedPrice.toFixed(2)}</p>
          <p className="text-white/60 text-[10px] mt-1">in {prediction.daysAhead}d</p>
        </div>
        {/* Arrow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className={`p-2 rounded-xl bg-gradient-to-r ${trendGrad} shadow-lg`}
          >
            <TrendIcon className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Deal Score + Buy/Wait */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-black/20 border border-white/5 rounded-2xl">
        {/* SVG Ring */}
        <div className="relative flex-shrink-0">
          <svg width={56} height={56} viewBox="0 0 56 56">
            <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
            <circle
              cx={28} cy={28} r={22} fill="none"
              stroke={ringColor} strokeWidth={5}
              strokeDasharray={`${ringDash} 138`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{ color: ringColor }}>
            {dealScore}
          </span>
        </div>
        <div>
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Deal Score</p>
          <p className="text-white font-bold">
            {dealScore >= 70 ? "🔥 Hot Deal" : dealScore >= 40 ? "👌 Fair Price" : "⏳ Overpriced"}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {dealScore >= 70 ? "Great time to purchase" : dealScore >= 40 ? "Average market price" : "Consider waiting for a drop"}
          </p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <span className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 ${
            prediction.recommendation === "Buy Now"
              ? "bg-[#2ECC71] text-[#0A0E15] shadow-lg shadow-[#2ECC71]/30"
              : "bg-white/10 text-white border border-white/10"
          }`}>
            {prediction.recommendation === "Buy Now" ? <ShoppingCart className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {prediction.recommendation}
          </span>
        </div>
      </div>

      {/* AI Factors */}
      <div>
        <p className="text-white/70 text-sm mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Based on:
        </p>
        <div className="flex flex-wrap gap-2">
          {prediction.factors.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white/70 text-xs backdrop-blur-xl"
            >
              {factor}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}