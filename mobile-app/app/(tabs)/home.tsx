import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  Search,
  History,
  Settings,
  Zap,
  TrendingUp,
  Sparkles,
  Heart,
  BellRing,
  Camera,
  ArrowUpRight,
  Percent,
  Award,
} from "lucide-react-native";
import { useApp } from "../../src/context/AppContext";
import { useAppTheme } from "../../src/hooks/useAppTheme";
import { getBestDeals, getMockPrices, mockProducts } from "../../src/utils/mockData";

export default function HomeDashboard() {
  const router = useRouter();
  const { scanHistory, watchlist, user } = useApp();
  const { theme, accent, isDark } = useAppTheme();

  const recentScans = scanHistory.slice(0, 5);

  // 1. Calculate stats
  const stats = useMemo(() => {
    const totalScans = scanHistory.length;
    const totalWishlist = watchlist.length;
    const activeAlerts = watchlist.filter((w) => w.targetPrice !== undefined).length;
    return { totalScans, totalWishlist, activeAlerts };
  }, [scanHistory, watchlist]);

  // 2. Savings Summary
  const savingsSummary = useMemo(() => {
    let totalSaved = 0;
    watchlist.forEach((item) => {
      if (item.previousPrice && item.currentPrice && item.previousPrice > item.currentPrice) {
        totalSaved += item.previousPrice - item.currentPrice;
      }
    });

    const baseSavings = stats.totalScans > 0 ? stats.totalScans * 42.50 + 150 : 250;
    const finalSaved = totalSaved > 0 ? totalSaved : baseSavings;
    const avgDiscount = totalSaved > 0 ? 18 : 14;

    return {
      saved: finalSaved,
      percentage: avgDiscount,
    };
  }, [watchlist, stats.totalScans]);

  // 3. Price Drop Alerts
  const priceDrops = useMemo(() => {
    const drops = watchlist
      .filter((item) => item.previousPrice && item.currentPrice && item.currentPrice < item.previousPrice)
      .map((item) => ({
        upc: item.productId,
        name: item.name,
        brand: item.brand || "General",
        price: item.currentPrice,
        oldPrice: item.previousPrice,
        image: item.image,
        store: item.url ? "Online Store" : "Best Retailer",
        discount: Math.round(((item.previousPrice - item.currentPrice) / item.previousPrice) * 100),
      }));

    if (drops.length > 0) return drops.slice(0, 3);

    return [
      {
        upc: "8901030875707",
        name: "Surf Excel Easy Wash Detergent Powder 1kg",
        brand: "Surf Excel",
        price: 130,
        oldPrice: 145,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
        store: "Flipkart",
        discount: 10,
      },
      {
        upc: "8901052002244",
        name: "Tata Salt Iodized 1kg",
        brand: "Tata",
        price: 27,
        oldPrice: 28,
        image: "https://www.bigbasket.com/media/uploads/p/l/241696_9-tata-salt-iodized.jpg",
        store: "Flipkart",
        discount: 4,
      },
    ];
  }, [watchlist]);

  // 4. Trending Products
  const trendingProducts = useMemo(() => {
    return [
      {
        upc: "8901262010012",
        name: "Amul Butter 500g",
        brand: "Amul",
        price: 270,
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80",
        category: "Dairy",
      },
      {
        upc: "8901030653630",
        name: "Brooke Bond Taj Mahal Tea 250g",
        brand: "Brooke Bond",
        price: 210,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
        category: "Beverages",
      },
      {
        upc: "8901207040432",
        name: "Dabur Honey 500g",
        brand: "Dabur",
        price: 205,
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80",
        category: "Grocery",
      },
      {
        upc: "8901058862804",
        name: "Maggi Hot & Sweet Tomato Chilli Sauce 1kg",
        brand: "Maggi",
        price: 160,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
        category: "Grocery",
      },
    ];
  }, []);

  // 5. Personalized Recommendations
  const recommendations = useMemo(() => {
    const lastScan = scanHistory[0];
    const lastProduct = lastScan
      ? Object.values(mockProducts).find((p) => p.upc === lastScan.upc || p.id === lastScan.productId)
      : null;
    const lastCategory = lastProduct?.category;

    const catalog = [
      {
        upc: "8901058895147",
        name: "KitKat 4 Finger Chocolate Bar 37.3g",
        brand: "Nestle",
        price: 29,
        image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80",
        category: "Snacks",
      },
      {
        upc: "8901163100069",
        name: "Parle-G Glucose Biscuits 250g",
        brand: "Parle",
        price: 19,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
        category: "Snacks",
      },
      {
        upc: "8901063142144",
        name: "Britannia Good Day Cashew Cookies 200g",
        brand: "Britannia",
        price: 32,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
        category: "Snacks",
      },
      {
        upc: "8901058844510",
        name: "Maggi 2-Minute Masala Noodles 70g",
        brand: "Maggi",
        price: 14,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80",
        category: "Instant Food",
      },
    ];

    if (lastCategory) {
      const matched = catalog.filter((p) => p.category === lastCategory);
      if (matched.length > 0) return matched;
    }

    return catalog.slice(0, 3);
  }, [scanHistory]);

  // Featured deals
  const featuredDeals = useMemo(() => {
    const deals = getBestDeals(3);
    return deals.map((deal) => {
      const prices = getMockPrices(deal.id);
      const bestPrice = prices.find((p) => p.isBest);
      const validPrices = prices
        .filter((p) => p.price !== null && !p.isInput)
        .map((p) => p.price as number);
      const highestPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
      const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
      const savingsPercent =
        highestPrice > 0 ? Math.round(((highestPrice - lowestPrice) / highestPrice) * 100) : 0;

      return {
        ...deal,
        bestPrice: bestPrice?.price ?? lowestPrice,
        store: bestPrice?.store ?? "Verity",
        savingsPercent,
      };
    });
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Text color on green buttons
  const btnTextCol = isDark ? "#0A0E15" : "#FFFFFF";

  return (
    <View style={{ backgroundColor: theme.bg }} className="flex-1">

      {/* Top Bar */}
      <View style={{ borderBottomColor: theme.border, backgroundColor: theme.bgCardAlt }} className="flex-row items-center justify-between px-6 pt-14 pb-5 border-b">
        <View className="flex-row items-center gap-3">
          <View style={{ backgroundColor: accent.hex }} className="w-10 h-10 rounded-xl items-center justify-center shadow-lg">
            <Zap size={20} color={isDark ? "#0A0E15" : "#FFFFFF"} fill="currentColor" />
          </View>
          <Text style={{ color: theme.text }} className="font-black text-[26px] tracking-tight">Verity</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/settings" as any)}
          style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
          className="w-10 h-10 rounded-xl border items-center justify-center"
        >
          <Settings size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        {/* Welcome Section */}
        <View className="px-6 pt-6 pb-4">
          <Text style={{ color: theme.textMuted }} className="text-sm font-bold uppercase tracking-wider mb-1">
            Welcome back
          </Text>
          <Text style={{ color: theme.text }} className="text-3xl font-black mb-1">
            {user?.name || "Smart Shopper"}
          </Text>
          <Text style={{ color: theme.textMuted }} className="text-sm leading-6">
            Compare Indian e-commerce prices and track smart deals instantly.
          </Text>
        </View>

        {/* Savings Summary Card */}
        <View style={{ borderColor: accent.hex + "33", backgroundColor: accent.hex + "11" }} className="border rounded-3xl p-5 mb-2 mx-6 relative overflow-hidden">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Percent size={18} color={accent.hex} />
              <Text style={{ color: theme.text }} className="font-extrabold text-sm uppercase tracking-wider">
                My Savings Summary
              </Text>
            </View>
            <View style={{ backgroundColor: accent.hex + "22", borderColor: accent.hex + "44" }} className="px-2 py-0.5 border rounded-full">
              <Text style={{ color: accent.hex }} className="text-[10px] font-bold">ACTIVE</Text>
            </View>
          </View>
          <View className="flex-row items-baseline gap-2 mb-1.5">
            <Text style={{ color: theme.text }} className="text-3xl font-black">
              ₹{savingsSummary.saved.toFixed(0)}
            </Text>
            <Text style={{ color: accent.hex }} className="text-sm font-bold">Saved this month</Text>
          </View>
          <Text style={{ color: theme.textMuted }} className="text-xs leading-5">
            Average deal discount of <Text style={{ color: theme.text }} className="font-bold">{savingsSummary.percentage}%</Text> across scanned products. Compare prices to save more!
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View className="px-6 py-2 flex-row gap-3">
          <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="flex-1 border rounded-2xl p-4">
            <Text style={{ color: accent.hex }} className="text-2xl font-black mb-0.5">{stats.totalScans}</Text>
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
              Total Scans
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/watchlist" as any)}
            style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
            className="flex-1 border rounded-2xl p-4"
          >
            <Text style={{ color: "#3B82F6" }} className="text-2xl font-black mb-0.5">{stats.totalWishlist}</Text>
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
              Wishlisted
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/watchlist" as any)}
            style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
            className="flex-1 border rounded-2xl p-4"
          >
            <Text style={{ color: "#F4A261" }} className="text-2xl font-black mb-0.5">{stats.activeAlerts}</Text>
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
              Active Alerts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Action Button */}
        <View className="px-6 py-4">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/scan" as any)}
            style={{ backgroundColor: accent.hex }}
            className="w-full flex-row items-center justify-between p-5 rounded-3xl shadow-lg"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-black/10 rounded-2xl items-center justify-center">
                <Camera size={24} color={btnTextCol} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={{ color: btnTextCol }} className="font-black text-lg">Scan a Barcode</Text>
                <Text style={{ color: btnTextCol + "CC" }} className="text-xs">Compare Indian retail prices instantly</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Price Drop Alerts Section */}
        {priceDrops.length > 0 && (
          <View className="mt-4 px-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <BellRing size={18} color="#F4A261" />
                <Text style={{ color: theme.text }} className="font-extrabold text-base tracking-tight">
                  Price Drop Alerts
                </Text>
              </View>
              <View style={{ backgroundColor: "rgba(244,162,97,0.15)", borderColor: "rgba(244,162,97,0.3)" }} className="px-2.5 py-0.5 border rounded-full">
                <Text className="text-[#F4A261] text-[10px] font-bold">HOT DEALS</Text>
              </View>
            </View>

            <View className="gap-3">
              {priceDrops.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.upc}_${idx}`}
                  onPress={() => router.push(`/product/${item.upc}` as any)}
                  style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                  className="flex-row items-center p-4 border rounded-3xl relative overflow-hidden"
                >
                  <View style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="w-14 h-14 rounded-2xl p-1 overflow-hidden border mr-4">
                    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
                  </View>
                  <View className="flex-1 justify-center mr-2">
                    <Text style={{ color: theme.textMuted }} className="text-[9px] font-bold uppercase tracking-widest mb-0.5">
                      {item.brand}
                    </Text>
                    <Text style={{ color: theme.text }} className="font-bold text-sm leading-5 mb-1.5" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text style={{ color: accent.hex }} className="font-black text-sm">₹{item.price.toFixed(0)}</Text>
                      <Text style={{ color: theme.textMuted }} className="text-xs line-through">₹{item.oldPrice.toFixed(0)}</Text>
                      <Text style={{ color: theme.textMuted }} className="text-[10px]">at {item.store}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.25)" }} className="px-2 py-1 border rounded-xl">
                    <Text className="text-red-400 font-bold text-xs">-{item.discount}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Trending Products Slider */}
        <View className="mt-8">
          <View className="flex-row items-center gap-2 mb-4 px-6">
            <TrendingUp size={18} color="#3B82F6" />
            <Text style={{ color: theme.text }} className="font-extrabold text-base tracking-tight">
              Trending Products
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }} className="pb-2">
            {trendingProducts.map((item) => (
              <TouchableOpacity
                key={item.upc}
                onPress={() => router.push(`/product/${item.upc}` as any)}
                style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                className="w-40 border rounded-3xl p-3 mr-4"
              >
                <View style={{ backgroundColor: theme.bgCardAlt }} className="w-full h-28 rounded-2xl overflow-hidden relative p-1.5 justify-center items-center mb-3">
                  <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
                  <View className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#3B82F6]/20 border border-[#3B82F6]/30 rounded-md">
                    <Text className="text-[#3B82F6] text-[8px] font-bold uppercase tracking-wide">
                      {item.category}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: theme.textMuted }} className="text-[9px] font-bold uppercase mb-0.5" numberOfLines={1}>
                  {item.brand}
                </Text>
                <Text style={{ color: theme.text }} className="font-bold text-xs mb-2 h-8 leading-4" numberOfLines={2}>
                  {item.name}
                </Text>
                <View className="flex-row justify-between items-center mt-1">
                  <Text style={{ color: accent.hex }} className="font-black text-sm">₹{item.price}</Text>
                  <ArrowUpRight size={14} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Personalized Recommendations Section */}
        <View className="mt-8 px-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Award size={18} color={accent.hex} />
            <Text style={{ color: theme.text }} className="font-extrabold text-base tracking-tight">
              Recommended For You
            </Text>
          </View>
          <View className="gap-3">
            {recommendations.map((item) => (
              <TouchableOpacity
                key={item.upc}
                onPress={() => router.push(`/product/${item.upc}` as any)}
                style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                className="flex-row items-center p-4 border rounded-3xl relative"
              >
                <View style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="w-14 h-14 rounded-2xl p-1 overflow-hidden border mr-4">
                  <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
                </View>
                <View className="flex-1 justify-center">
                  <Text style={{ color: theme.textMuted }} className="text-[9px] font-bold uppercase tracking-widest mb-0.5">
                    {item.brand}
                  </Text>
                  <Text style={{ color: theme.text }} className="font-bold text-sm leading-5 mb-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ color: accent.hex }} className="font-black text-sm">₹{item.price.toFixed(0)}</Text>
                </View>
                <ArrowUpRight size={18} color={theme.textMuted} className="ml-2" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search & Wishlist Secondary Action Row */}
        <View className="flex-row gap-3 px-6 mt-8">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search" as any)}
            style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
            className="flex-1 flex-row items-center gap-3 p-4 border rounded-2xl"
          >
            <View style={{ backgroundColor: theme.bgCardAlt }} className="w-10 h-10 rounded-xl items-center justify-center">
              <Search size={18} color={accent.hex} />
            </View>
            <Text style={{ color: theme.text }} className="font-bold text-sm">Search Catalog</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/watchlist" as any)}
            style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
            className="flex-1 flex-row items-center gap-3 p-4 border rounded-2xl"
          >
            <View style={{ backgroundColor: theme.bgCardAlt }} className="w-10 h-10 rounded-xl items-center justify-center">
              <Heart size={18} color="#F4A261" />
            </View>
            <Text style={{ color: theme.text }} className="font-bold text-sm">My Wishlist</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Daily Deals */}
        {featuredDeals.length > 0 && (
          <View className="mt-8 px-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Sparkles size={16} color="#F4A261" />
              <Text style={{ color: theme.text }} className="font-extrabold text-base tracking-tight">
                Top Savings Today
              </Text>
            </View>

            <View className="gap-3">
              {featuredDeals.map((deal) => (
                <TouchableOpacity
                  key={deal.id}
                  onPress={() => router.push(`/product/${deal.upc}` as any)}
                  style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                  className="flex-row items-center p-4 border rounded-3xl relative overflow-hidden"
                >
                  <View style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="w-16 h-16 rounded-2xl p-1 overflow-hidden border mr-4">
                    <Image source={{ uri: deal.image }} className="w-full h-full" resizeMode="contain" />
                  </View>
                  <View className="flex-1 justify-center mr-2">
                    <Text style={{ color: theme.textMuted }} className="text-[9px] font-bold uppercase tracking-widest mb-0.5">
                      {deal.brand}
                    </Text>
                    <Text style={{ color: theme.text }} className="font-bold text-sm leading-5 mb-1.5" numberOfLines={1}>
                      {deal.name}
                    </Text>
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text style={{ color: accent.hex }} className="font-black text-sm">
                        ₹{deal.bestPrice.toFixed(0)}
                      </Text>
                      <Text style={{ color: theme.textMuted }} className="text-xs">at {deal.store}</Text>
                    </View>
                  </View>
                  {deal.savingsPercent > 0 && (
                    <View style={{ backgroundColor: accent.hex + "22", borderColor: accent.hex + "33" }} className="px-2.5 py-1.5 border rounded-xl">
                      <Text style={{ color: accent.hex }} className="font-bold text-xs">-{deal.savingsPercent}%</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <View className="mt-8 px-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <History size={16} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted }} className="font-semibold">Recent Scans</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/watchlist" as any)}>
                <Text style={{ color: accent.hex }} className="text-xs font-bold">View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
              {recentScans.map((scan) => (
                <TouchableOpacity
                  key={scan.id}
                  onPress={() => router.push(`/product/${scan.upc || scan.productId}` as any)}
                  className="w-24 items-center gap-2 mr-4"
                >
                  <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="w-24 h-24 rounded-2xl overflow-hidden border relative p-1.5 justify-center items-center">
                    <Image source={{ uri: scan.image }} className="w-full h-full" resizeMode="contain" />
                  </View>
                  <Text style={{ color: theme.textMuted }} className="text-[10px] w-full text-center" numberOfLines={1}>
                    {formatTimeAgo(scan.timestamp)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
