import { useMemo } from "react";
import { motion } from "motion/react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingDown, TrendingUp, Minus, Clock, Zap, ShoppingCart, IndianRupee,
  BarChart2, AlertTriangle, CheckCircle, Star
} from "lucide-react";
import type { WatchlistItem } from "../types";
import { predictPrice } from "../utils/mockData";

interface WishlistAnalyticsProps {
  wishlist: WatchlistItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics:  "#3B82F6",
  Grocery:      "#2ECC71",
  Fashion:      "#F4A261",
  Beauty:       "#EC4899",
  Sports:       "#A855F7",
  "Home & Kitchen":   "#F59E0B",
  "Home Appliances":  "#14B8A6",
  Gaming:       "#EF4444",
  Other:        "#6B7280",
};

// ─── Deal Score Pill ──────────────────────────────────────────────────────────
function DealBadge({ score }: { score: number }) {
  const color = score >= 70 ? "#2ECC71" : score >= 40 ? "#F4A261" : "#EF4444";
  const label = score >= 70 ? "Hot Deal" : score >= 40 ? "Fair" : "Overpriced";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
      style={{ backgroundColor: `${color}25`, color }}
    >
      <Star className="w-2.5 h-2.5" fill="currentColor" />
      {label} {score}
    </span>
  );
}

// ─── Custom Pie Label ─────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight="bold">
      {name.split(" ")[0]}
    </text>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function WishlistAnalytics({ wishlist }: WishlistAnalyticsProps) {
  const analytics = useMemo(() => {
    // Savings
    const totalSavings     = wishlist.reduce((s, i) => s + Math.max(0, i.previousPrice - i.currentPrice), 0);
    const monthlySavings   = totalSavings * 0.35; // heuristic
    const predictions      = wishlist.map(i => predictPrice(i.productId, 7));
    const futureSavings    = predictions.reduce((s, p) => {
      if (p.trend === "Likely to Decrease") {
        return s + Math.abs(p.predictedPrice - p.currentPrice);
      }
      return s;
    }, 0);

    // Category breakdown
    const catMap: Record<string, { count: number; color: string }> = {};
    wishlist.forEach(i => {
      const cat = i.priceHistory.length > 0
        ? (i as any).category || "Other"
        : "Other";
      const key = cat || "Other";
      if (!catMap[key]) catMap[key] = { count: 0, color: CATEGORY_COLORS[key] || CATEGORY_COLORS.Other };
      catMap[key].count++;
    });
    const pieData = Object.entries(catMap).map(([name, { count, color }]) => ({
      name, value: count, color
    }));

    // Trend analysis
    const rising  = predictions.filter(p => p.trend === "Likely to Increase").length;
    const falling = predictions.filter(p => p.trend === "Likely to Decrease").length;
    const stable  = predictions.filter(p => p.trend === "Stable").length;

    // Price drop timeline – items with notable drops, sorted by drop %
    const timeline = [...wishlist]
      .filter(i => i.priceDropPercent > 0)
      .sort((a, b) => b.priceDropPercent - a.priceDropPercent)
      .slice(0, 6);

    // Deal scores
    const withScores = wishlist.map(i => ({
      ...i,
      dealScore: predictions.find(p => p.productId === i.productId)?.dealScore ?? 50,
      recommendation: predictions.find(p => p.productId === i.productId)?.recommendation ?? "Wait",
    }));

    const bestDeals = [...withScores].sort((a, b) => b.dealScore - a.dealScore).slice(0, 3);

    return { totalSavings, monthlySavings, futureSavings, pieData, rising, falling, stable, timeline, bestDeals };
  }, [wishlist]);

  if (wishlist.length === 0) return null;

  return (
    <div className="space-y-8 mb-12">

      {/* ── Savings Overview ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <IndianRupee className="w-5 h-5 text-[#2ECC71]" />
          <h2 className="text-lg font-bold text-white">Savings Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Savings",          value: `₹${analytics.totalSavings.toFixed(0)}`,   color: "#2ECC71",  sub: "Already saved" },
            { label: "Monthly Avg Savings",    value: `₹${analytics.monthlySavings.toFixed(0)}`, color: "#3B82F6",  sub: "Based on history" },
            { label: "Potential Future",       value: `₹${analytics.futureSavings.toFixed(0)}`,  color: "#F4A261",  sub: "From falling items" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.08 }}
              className="p-5 rounded-2xl border border-white/5 relative overflow-hidden"
              style={{ background: `${s.color}08` }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: s.color }} />
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: `${s.color}99` }}>{s.label}</p>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-xs text-white/40">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Category Breakdown + Trend Analysis ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Pie */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-white">Category Breakdown</h2>
          </div>
          {analytics.pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie data={analytics.pieData} cx="50%" cy="50%" innerRadius={45}
                    outerRadius={80} dataKey="value" labelLine={false} label={PieLabel}>
                    {analytics.pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#12171F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    labelStyle={{ color: "white", fontWeight: "bold" }}
                    formatter={(v: number, name: string) => [`${v} items`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {analytics.pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-white/70 flex-1 truncate">{d.name}</span>
                    <span className="text-sm font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-sm">No category data yet.</p>
          )}
        </motion.div>

        {/* Price Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-5 h-5 text-[#2ECC71]" />
            <h2 className="text-lg font-bold text-white">Price Trend Analysis</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Likely to Decrease", count: analytics.falling, color: "#2ECC71", icon: TrendingDown, tip: "Good time to wait" },
              { label: "Stable",             count: analytics.stable,  color: "#3B82F6", icon: Minus,        tip: "No change expected" },
              { label: "Likely to Increase", count: analytics.rising,  color: "#EF4444", icon: TrendingUp,   tip: "Buy sooner" },
            ].map(({ label, count, color, icon: Icon, tip }) => {
              const total = wishlist.length || 1;
              const pct   = Math.round((count / total) * 100);
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span className="text-sm font-semibold text-white">{label}</span>
                      <span className="text-xs text-white/40">· {tip}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{count} items</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Best Deals Right Now ──────────────────────────────────────── */}
      {analytics.bestDeals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-5 h-5 text-[#F4A261]" />
            <h2 className="text-lg font-bold text-white">Top Deals in Wishlist</h2>
            <span className="text-xs text-white/40 ml-1">· Deal Score 0–100</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {analytics.bestDeals.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 + i * 0.07 }}
                className="flex items-center gap-3 p-4 bg-black/20 border border-white/5 rounded-2xl"
              >
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-white/10 p-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-[#2ECC71] font-bold text-base">₹{item.currentPrice.toFixed(0)}</p>
                  <DealBadge score={item.dealScore} />
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.recommendation === "Buy Now" ? "bg-[#2ECC71]/20 text-[#2ECC71]" : "bg-[#F4A261]/20 text-[#F4A261]"}`}>
                    {item.recommendation}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Price Drop Timeline ───────────────────────────────────────── */}
      {analytics.timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-white">Price Drop Timeline</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-white/10 rounded-full" />
            <div className="space-y-5">
              {analytics.timeline.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 + i * 0.07 }}
                  className="flex items-start gap-4 pl-1"
                >
                  {/* Dot */}
                  <div className="w-11 h-11 flex-shrink-0 rounded-full bg-[#2ECC71]/20 border-2 border-[#2ECC71]/60 flex items-center justify-center z-10">
                    <TrendingDown className="w-4 h-4 text-[#2ECC71]" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                      <span className="text-xs font-bold text-[#2ECC71] whitespace-nowrap bg-[#2ECC71]/15 px-2 py-0.5 rounded-lg">
                        ↓ {item.priceDropPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#2ECC71] font-bold">₹{item.currentPrice.toFixed(0)}</span>
                      <span className="text-white/40 text-xs line-through">₹{item.previousPrice.toFixed(0)}</span>
                      <span className="text-white/40 text-xs">
                        · Saved ₹{(item.previousPrice - item.currentPrice).toFixed(0)}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Added {new Date(item.addedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
