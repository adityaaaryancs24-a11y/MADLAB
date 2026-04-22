import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, Sparkles, Brain, AlertCircle } from "lucide-react";
import type { PricePrediction } from "../types";

interface PricePredictionCardProps {
  prediction: PricePrediction;
}

export function PricePredictionCard({ prediction }: PricePredictionCardProps) {
  const priceDifference = prediction.predictedPrice - prediction.currentPrice;
  const percentageChange = ((priceDifference / prediction.currentPrice) * 100);

  const getTrendIcon = () => {
    switch (prediction.trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5" />;
      case 'down':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'up':
        return 'from-[#F4A261] to-[#E76F51]';
      case 'down':
        return 'from-[#2ECC71] to-[#25A65A]';
      default:
        return 'from-[#6B7280] to-[#4B5563]';
    }
  };

  const getTrendText = () => {
    switch (prediction.trend) {
      case 'up':
        return 'Price Increase Expected';
      case 'down':
        return 'Price Drop Expected';
      default:
        return 'Price Stable';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${getTrendColor()} blur-[80px]`}></div>
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

      {/* Prediction Visualization */}
      <div className="relative mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Current Price */}
          <div className="relative">
            <div className="absolute -top-2 left-0 right-0 flex justify-center">
              <span className="text-xs text-white/40 bg-[#0A0E15] px-2 py-1 rounded-lg">Now</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-4">
              <p className="text-white/50 text-xs mb-1">Current Price</p>
              <p className="text-white font-bold text-2xl">₹{prediction.currentPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Predicted Price */}
          <div className="relative">
            <div className="absolute -top-2 left-0 right-0 flex justify-center">
              <span className="text-xs text-white/40 bg-[#0A0E15] px-2 py-1 rounded-lg">
                {prediction.daysAhead}d
              </span>
            </div>
            <div className={`p-4 bg-gradient-to-br ${getTrendColor()} rounded-2xl border border-white/20 mt-4 shadow-lg`}>
              <p className="text-white/90 text-xs mb-1">Predicted Price</p>
              <p className="text-white font-bold text-2xl">₹{prediction.predictedPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Arrow Connector */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`p-2 rounded-xl bg-gradient-to-r ${getTrendColor()} shadow-lg`}
          >
            {getTrendIcon()}
          </motion.div>
        </div>
      </div>

      {/* Trend Information */}
      <div className={`p-4 rounded-2xl bg-gradient-to-r ${getTrendColor()} bg-opacity-10 border border-white/10 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-white font-semibold">{getTrendText()}</span>
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${prediction.trend === 'down' ? 'text-[#2ECC71]' : prediction.trend === 'up' ? 'text-[#F4A261]' : 'text-white/70'}`}>
              {priceDifference >= 0 ? '+' : ''}₹{Math.abs(priceDifference).toFixed(2)}
            </p>
            <p className="text-white/50 text-xs">
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </p>
          </div>
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
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white/70 text-xs backdrop-blur-xl"
            >
              {factor}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      {prediction.trend === 'down' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-gradient-to-r from-[#2ECC71]/20 to-[#25A65A]/20 border border-[#2ECC71]/30 rounded-2xl"
        >
          <p className="text-[#2ECC71] font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Great time to buy! Price expected to drop further.
          </p>
        </motion.div>
      )}

      {prediction.trend === 'up' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-gradient-to-r from-[#F4A261]/20 to-[#E76F51]/20 border border-[#F4A261]/30 rounded-2xl"
        >
          <p className="text-[#F4A261] font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Consider buying now. Price may increase soon.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}