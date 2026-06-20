import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Svg, { Circle as SvgCircle, Text as SvgText } from 'react-native-svg';
import { TrendingDown, TrendingUp, Minus, Clock, IndianRupee, BarChart2, ShoppingCart } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { WatchlistItem } from '../types';
import { predictPrice } from '../utils/mockData';

interface WishlistAnalyticsProps {
  wishlist: WatchlistItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics:       '#3B82F6',
  Grocery:           '#2ECC71',
  Fashion:           '#F4A261',
  Beauty:            '#EC4899',
  Sports:            '#A855F7',
  'Home & Kitchen':  '#F59E0B',
  'Home Appliances': '#14B8A6',
  Gaming:            '#EF4444',
  Other:             '#6B7280',
};

// Small Deal Score ring for a list item
function DealRing({ score }: { score: number }) {
  const color = score >= 70 ? '#2ECC71' : score >= 40 ? '#F4A261' : '#EF4444';
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={44} height={44} viewBox="0 0 44 44">
        <SvgCircle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
        <SvgCircle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 22 22)" />
        <SvgText x={22} y={26} fill={color} fontSize={10} fontWeight="bold" textAnchor="middle">
          {score}
        </SvgText>
      </Svg>
    </View>
  );
}

export function WishlistAnalytics({ wishlist }: WishlistAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalSavings   = wishlist.reduce((s, i) => s + Math.max(0, i.previousPrice - i.currentPrice), 0);
    const monthlySavings = totalSavings * 0.35;
    const predictions    = wishlist.map(i => predictPrice(i.productId, 7));
    const futureSavings  = predictions.reduce((s, p) =>
      p.trend === 'Likely to Decrease' ? s + Math.abs(p.predictedPrice - p.currentPrice) : s, 0);

    const rising  = predictions.filter(p => p.trend === 'Likely to Increase').length;
    const falling = predictions.filter(p => p.trend === 'Likely to Decrease').length;
    const stable  = predictions.filter(p => p.trend === 'Stable').length;

    // Category breakdown
    const catMap: Record<string, { count: number; color: string }> = {};
    wishlist.forEach(i => {
      const key = (i as any).category || 'Other';
      if (!catMap[key]) catMap[key] = { count: 0, color: CATEGORY_COLORS[key] || CATEGORY_COLORS.Other };
      catMap[key].count++;
    });
    const categories = Object.entries(catMap).map(([name, { count, color }]) => ({ name, count, color }));

    // Top deals
    const withScores = wishlist.map(i => ({
      ...i,
      dealScore:      predictions.find(p => p.productId === i.productId)?.dealScore ?? 50,
      recommendation: predictions.find(p => p.productId === i.productId)?.recommendation ?? 'Wait',
    }));
    const bestDeals = [...withScores].sort((a, b) => b.dealScore - a.dealScore).slice(0, 3);

    // Timeline
    const timeline = [...wishlist]
      .filter(i => i.priceDropPercent > 0)
      .sort((a, b) => b.priceDropPercent - a.priceDropPercent)
      .slice(0, 5);

    return { totalSavings, monthlySavings, futureSavings, rising, falling, stable, categories, bestDeals, timeline };
  }, [wishlist]);

  if (wishlist.length === 0) return null;

  const total = wishlist.length || 1;

  return (
    <View className="space-y-6 mb-6">

      {/* ── Savings Overview ────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).springify()}
        className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4">
        <View className="flex-row items-center gap-2 mb-4">
          <IndianRupee size={18} color="#2ECC71" />
          <Text className="text-white font-bold text-base">Savings Overview</Text>
        </View>
        <View className="flex-row gap-3">
          {[
            { label: 'Total Savings',   value: `\u20b9${analytics.totalSavings.toFixed(0)}`,   color: '#2ECC71' },
            { label: 'Monthly Avg',     value: `\u20b9${analytics.monthlySavings.toFixed(0)}`,  color: '#3B82F6' },
            { label: 'Future Savings',  value: `\u20b9${analytics.futureSavings.toFixed(0)}`,   color: '#F4A261' },
          ].map((s) => (
            <View key={s.label} className="flex-1 p-3 bg-black/20 border border-white/5 rounded-2xl">
              <Text className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: `${s.color}99` }}>{s.label}</Text>
              <Text className="text-white font-black text-lg">{s.value}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ── Category Breakdown ───────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(160).springify()}
        className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4">
        <View className="flex-row items-center gap-2 mb-4">
          <BarChart2 size={18} color="#3B82F6" />
          <Text className="text-white font-bold text-base">Category Breakdown</Text>
        </View>
        {analytics.categories.map(({ name, count, color }) => {
          const pct = Math.round((count / total) * 100);
          return (
            <View key={name} className="mb-3">
              <View className="flex-row justify-between mb-1">
                <View className="flex-row items-center gap-2">
                  <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <Text className="text-white/70 text-sm font-semibold">{name}</Text>
                </View>
                <Text className="text-white font-bold text-sm">{count} items</Text>
              </View>
              <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <Animated.View
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </View>
            </View>
          );
        })}
      </Animated.View>

      {/* ── Price Trend Analysis ─────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).springify()}
        className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4">
        <View className="flex-row items-center gap-2 mb-4">
          <TrendingDown size={18} color="#2ECC71" />
          <Text className="text-white font-bold text-base">Price Trend Analysis</Text>
        </View>
        {[
          { label: 'Likely to Decrease', count: analytics.falling, color: '#2ECC71', Icon: TrendingDown, tip: 'Good time to wait' },
          { label: 'Stable',             count: analytics.stable,  color: '#3B82F6', Icon: Minus,        tip: 'No change expected' },
          { label: 'Likely to Increase', count: analytics.rising,  color: '#EF4444', Icon: TrendingUp,   tip: 'Buy sooner' },
        ].map(({ label, count, color, Icon, tip }) => {
          const pct = Math.round((count / total) * 100);
          return (
            <View key={label} className="mb-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-2">
                  <Icon size={14} color={color} />
                  <Text className="text-white font-semibold text-sm">{label}</Text>
                  <Text className="text-white/30 text-xs">· {tip}</Text>
                </View>
                <Text className="text-white font-bold text-sm">{count}</Text>
              </View>
              <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </View>
            </View>
          );
        })}
      </Animated.View>

      {/* ── Best Deals ───────────────────────────────────────────────── */}
      {analytics.bestDeals.length > 0 && (
        <Animated.View entering={FadeInDown.delay(240).springify()}
          className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <ShoppingCart size={18} color="#F4A261" />
            <Text className="text-white font-bold text-base">Top Deals</Text>
            <Text className="text-white/30 text-xs">· Deal Score 0–100</Text>
          </View>
          {analytics.bestDeals.map((item) => (
            <View key={item.id} className="flex-row items-center gap-3 mb-3 p-3 bg-black/20 border border-white/5 rounded-2xl">
              <DealRing score={item.dealScore} />
              <View className="flex-1 min-w-0">
                <Text className="text-white font-semibold text-sm" numberOfLines={1}>{item.name}</Text>
                <Text className="text-[#2ECC71] font-bold">\u20b9{item.currentPrice.toFixed(0)}</Text>
              </View>
              <View className={`px-3 py-1.5 rounded-xl ${item.recommendation === 'Buy Now' ? 'bg-[#2ECC71]/20' : 'bg-[#F4A261]/20'}`}>
                <Text className="text-xs font-bold" style={{ color: item.recommendation === 'Buy Now' ? '#2ECC71' : '#F4A261' }}>
                  {item.recommendation}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      )}

      {/* ── Price Drop Timeline ──────────────────────────────────────── */}
      {analytics.timeline.length > 0 && (
        <Animated.View entering={FadeInDown.delay(280).springify()}
          className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Clock size={18} color="#3B82F6" />
            <Text className="text-white font-bold text-base">Price Drop Timeline</Text>
          </View>
          {analytics.timeline.map((item, i) => (
            <View key={item.id} className="flex-row items-start gap-3 mb-4">
              <View className="w-9 h-9 rounded-full bg-[#2ECC71]/20 border border-[#2ECC71]/40 items-center justify-center flex-shrink-0">
                <TrendingDown size={14} color="#2ECC71" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-semibold text-sm flex-1" numberOfLines={1}>{item.name}</Text>
                  <Text className="text-[#2ECC71] font-bold text-xs ml-2">↓ {item.priceDropPercent.toFixed(1)}%</Text>
                </View>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-[#2ECC71] font-bold text-sm">\u20b9{item.currentPrice.toFixed(0)}</Text>
                  <Text className="text-white/40 text-xs line-through">\u20b9{item.previousPrice.toFixed(0)}</Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}
