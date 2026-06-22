import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  ChevronRight,
  Heart,
  Info,
  Share2,
  Sparkles,
  Tag,
  XCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackendProduct, productService } from "../../services/productService";
import { NativePriceChart } from "../../src/components/NativePriceChart";
import { useApp } from "../../src/context/AppContext";
import { getProductsByCategory, getSimilarProducts, mockProducts } from "../../src/utils/mockData";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 380;

function formatCurrency(value: number) {
  return `₹${value.toFixed(2)}`;
}

function formatHistoryDate(point: BackendProduct["price_history"][number]) {
  const rawDate = point.date || point.recorded_at;
  return new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProductDetailScreen() {
  const { upc, productJson } = useLocalSearchParams<{ upc: string; productJson?: string }>();
  console.log("PRODUCT PAGE UPC:", upc);
  console.log("PRODUCT JSON:", productJson);
  const insets = useSafeAreaInsets();
  const { addToWatchlist, watchlist, removeFromWatchlist } = useApp();

  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(false);

  const scrollY = useSharedValue(0);
  const heartScale = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-100, 0, HERO_HEIGHT],
          [-50, 0, HERO_HEIGHT * 0.5],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const headerOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_HEIGHT - 100, HERO_HEIGHT - 50], [0, 1], Extrapolation.CLAMP),
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const fetchProduct = async () => {
    if (!upc) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await productService.getProductByUPC(upc);
      setProduct(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load product details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productJson) {
      try {
        setProduct(JSON.parse(productJson) as BackendProduct);
        setIsLoading(false);
        return;
      } catch {
        fetchProduct();
        return;
      }
    }

    fetchProduct();
  }, [upc, productJson]);

  const pricing = useMemo(() => {
    const sortedPrices = [...(product?.prices || [])].sort((a, b) => a.price - b.price);
    const bestPrice = sortedPrices[0];
    const lowestPrice = bestPrice?.price ?? 0;
    const highestPrice = sortedPrices[sortedPrices.length - 1]?.price ?? 0;
    const averagePrice =
      sortedPrices.length > 0
        ? sortedPrices.reduce((sum, price) => sum + price.price, 0) / sortedPrices.length
        : lowestPrice;
    const maxSavings = Math.max(0, highestPrice - lowestPrice);
    const savingsPercent = highestPrice > 0 ? (maxSavings / highestPrice) * 100 : 0;

    return {
      averagePrice,
      bestPrice,
      highestPrice,
      lowestPrice,
      maxSavings,
      savingsPercent,
      sortedPrices,
    };
  }, [product]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0E15] items-center justify-center">
        <ActivityIndicator size="large" color="#4ADE80" />
        <Text className="text-white/60 mt-4 font-semibold text-sm">Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-[#0A0E15] items-center justify-center px-6">
        <XCircle size={48} color="#EF4444" />
        <Text className="text-white text-xl font-bold mt-4 mb-2">Oops!</Text>
        <Text className="text-white/60 text-center mb-8">{error || "Product not found"}</Text>
        <TouchableOpacity
          onPress={() => {
            if (error) fetchProduct();
            else router.back();
          }}
          className="w-full py-4 bg-[#4ADE80] rounded-2xl items-center shadow-lg shadow-[#4ADE80]/15"
        >
          <Text className="text-[#0A0E15] font-bold text-base">{error ? "Retry" : "Go Back"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = product.price_history.map((point) => ({
    date: formatHistoryDate(point),
    price: point.price,
  }));
  const historyPrices = chartData.map((point) => point.price);
  const historicalLow = historyPrices.length ? Math.min(...historyPrices) : pricing.lowestPrice;
  const historicalHigh = historyPrices.length ? Math.max(...historyPrices) : pricing.highestPrice;
  const currentHistoryPrice = historyPrices[historyPrices.length - 1] ?? pricing.lowestPrice;
  const prediction = product.pricePrediction;
  const similarProducts =
    getSimilarProducts(String(product.id), 8).length > 0
      ? getSimilarProducts(String(product.id), 8)
      : getProductsByCategory(product.category, 8);

  // Match by UPC (the canonical route key) — product.upc is always the barcode
  // stored in the watchlist. Older entries used product.id as a fallback so we
  // keep that secondary check to keep the heart icon in sync.
  const isSaved = watchlist.some(
    (item) => item.upc === product.upc || item.productId === String(product.id)
  );

  const handleWatchlistToggle = async () => {
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isSaved) {
      const watchlistItem = watchlist.find(
        (item) => item.upc === product.upc || item.productId === String(product.id)
      );
      if (watchlistItem) removeFromWatchlist(watchlistItem.id);
      return;
    }

    // FIX: store product.upc as productId so /product/[upc] can be re-opened,
    // and populate the new upc field. Do NOT set a default targetPrice — that
    // would inflate the Active Alerts counter and the "Has Target" filter.
    addToWatchlist({
      id: `watch_${product.upc}_${Date.now()}`,
      productId: product.upc,        // ← UPC, not product.id
      upc: product.upc,              // ← explicit upc field
      name: product.name,
      brand: product.brand,
      image: product.image,
      currentPrice: pricing.lowestPrice,
      previousPrice: pricing.averagePrice || pricing.lowestPrice,
      priceDropPercent: Number(pricing.savingsPercent.toFixed(1)),
      // targetPrice intentionally omitted — user can set it manually via the bell
      priceHistory: product.price_history.map((point) => ({
        timestamp: new Date(point.date || point.recorded_at).getTime(),
        price: point.price,
        store: point.store,
      })),
      addedAt: Date.now(),
      url: pricing.bestPrice?.url,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.brand} ${product.name}. Best price: ${formatCurrency(
          pricing.lowestPrice
        )} at ${pricing.bestPrice?.store ?? "Verity"}.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0E15]">
      <Animated.View
        style={[styles.header, { paddingTop: insets.top }, headerOpacityStyle]}
        className="absolute top-0 left-0 right-0 z-50 bg-[#0A0E15]/95 border-b border-white/5"
      >
        <Text className="text-white font-bold text-lg text-center mt-2" numberOfLines={1}>
          {product.name}
        </Text>
      </Animated.View>

      <View
        style={{ paddingTop: insets.top }}
        className="absolute top-0 left-0 right-0 z-50 flex-row justify-between px-4 mt-2"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10"
        >
          <Share2 size={18} color="white" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
          <Animated.Image
            entering={FadeIn.duration(800)}
            source={{ uri: product.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroGradient} />
        </Animated.View>

        <View className="px-6 -mt-10 pt-8 bg-[#0A0E15] rounded-t-[40px]">
          <View className="flex-row items-center gap-3 mb-4 flex-wrap">
            <View className="bg-white/10 px-3 py-1 rounded-full border border-white/5">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest uppercase">
                {product.category || "General"}
              </Text>
            </View>
            <View className="bg-[#4ADE80]/10 px-3 py-1 rounded-full border border-[#4ADE80]/20">
              <Text className="text-[#4ADE80] text-[10px] font-bold tracking-widest font-mono">
                UPC: {product.upc}
              </Text>
            </View>
          </View>

          {(product.warning || product.dataSource === "mock") && (
            <Animated.View
              entering={FadeInDown.delay(80).springify()}
              className="flex-row gap-3 bg-[#F4A261]/10 border border-[#F4A261]/20 rounded-2xl p-4 mb-5"
            >
              <AlertTriangle size={18} color="#F4A261" />
              <Text className="text-[#F4A261] text-xs font-semibold leading-5 flex-1">
                {product.warning ||
                  "Live APIs did not return this barcode. Verity is showing realistic mock data so you can continue comparing prices."}
              </Text>
            </Animated.View>
          )}

          <Animated.Text
            entering={FadeInDown.delay(100).springify()}
            className="text-white/60 text-sm font-bold uppercase tracking-wider mb-1"
          >
            {product.brand}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(150).springify()}
            className="text-white text-3xl font-black leading-tight mb-8"
          >
            {product.name}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(200).springify()} className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={handleWatchlistToggle}
              className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                isSaved ? "bg-[#4ADE80]/10 border-[#4ADE80]/30" : "bg-white/5 border-white/5"
              }`}
            >
              <Animated.View style={heartAnimStyle}>
                <Heart size={18} color={isSaved ? "#4ADE80" : "white"} fill={isSaved ? "#4ADE80" : "transparent"} />
              </Animated.View>
              <Text className={`font-bold text-sm ${isSaved ? "text-[#4ADE80]" : "text-white"}`}>
                {isSaved ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAlertEnabled((enabled) => !enabled);
              }}
              className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                alertEnabled ? "bg-[#4ADE80] border-[#4ADE80]" : "bg-white/5 border-white/5"
              }`}
            >
              <Bell size={18} color={alertEnabled ? "#0A0E15" : "white"} fill={alertEnabled ? "#0A0E15" : "transparent"} />
              <Text className={`font-bold text-sm ${alertEnabled ? "text-[#0A0E15]" : "text-white"}`}>Alerts</Text>
            </TouchableOpacity>
          </Animated.View>

          {pricing.sortedPrices.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(250).springify()}
              className="bg-[#4ADE80] rounded-3xl p-1 mb-8 shadow-lg shadow-[#4ADE80]/20"
            >
              <View className="bg-[#0A0E15] rounded-[22px] p-5">
                <View className="flex-row justify-between items-start mb-4 gap-4">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <Tag size={14} color="#4ADE80" />
                      <Text className="text-[#4ADE80] font-black text-xs uppercase tracking-wider">
                        Best Price Found
                      </Text>
                    </View>
                    <Text className="text-white text-3xl font-black">{formatCurrency(pricing.lowestPrice)}</Text>
                  </View>
                  <View className="items-end flex-1">
                    <Text className="text-white/40 text-xs font-semibold mb-1" numberOfLines={1}>
                      at {pricing.bestPrice?.store ?? pricing.bestPrice?.retailer ?? "Verity"}
                    </Text>
                    {pricing.maxSavings > 0 && (
                      <View className="bg-[#4ADE80]/20 px-2 py-1 rounded-md">
                        <Text className="text-[#4ADE80] font-bold text-xs">
                          Save {pricing.savingsPercent.toFixed(0)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {pricing.bestPrice?.url && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(pricing.bestPrice!.url!)}
                    className="w-full bg-[#4ADE80] py-3.5 rounded-xl items-center"
                  >
                    <Text className="text-[#0A0E15] font-black text-sm uppercase tracking-wide">Buy Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}

          {pricing.sortedPrices.length > 1 && (
            <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-8">
              <Text className="text-white/60 font-bold text-xs uppercase tracking-wider mb-4 px-1">
                Other Retailers
              </Text>
              <View className="gap-3">
                {pricing.sortedPrices.slice(1).map((priceOption) => (
                  <TouchableOpacity
                    key={`${priceOption.store}-${priceOption.price}`}
                    onPress={() => priceOption.url && Linking.openURL(priceOption.url)}
                    className="w-full flex-row items-center justify-between p-4 bg-[#111827] border border-white/5 rounded-2xl"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                        <Text className="text-lg">{priceOption.logo || "🏪"}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-sm" numberOfLines={1}>
                          {priceOption.store || priceOption.retailer}
                        </Text>
                        <Text
                          className={`text-xs mt-0.5 font-medium ${
                            priceOption.stock === "Out of Stock" || !priceOption.in_stock
                              ? "text-red-400"
                              : "text-white/40"
                          }`}
                        >
                          {priceOption.stock || "In Stock"}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-bold text-base text-white ml-3">{formatCurrency(priceOption.price)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {chartData.length > 0 && (
            <>
              <NativePriceChart data={chartData} />
              <View className="flex-row gap-3 mb-6">
                {[
                  { label: "Hist. Low", value: formatCurrency(historicalLow), color: "#2ECC71" },
                  { label: "Current", value: formatCurrency(currentHistoryPrice), color: "#3B82F6" },
                  { label: "Hist. High", value: formatCurrency(historicalHigh), color: "#EF4444" },
                ].map(({ label, value, color }) => (
                  <View key={label} className="flex-1 p-3 bg-white/5 border border-white/10 rounded-2xl items-center">
                    <Text className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: `${color}99` }}>
                      {label}
                    </Text>
                    <Text className="text-white font-bold text-xs">{value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {prediction && (
            <Animated.View
              entering={FadeInDown.delay(325).springify()}
              className="bg-[#111827] border border-white/5 rounded-3xl p-5 mb-8"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Sparkles size={16} color="#F4A261" />
                <Text className="text-white font-bold text-sm">Price Prediction</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                    Next {prediction.daysAhead} days
                  </Text>
                  <Text className="text-white text-xl font-black mt-1">
                    {formatCurrency(prediction.predictedPrice)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Signal</Text>
                  <Text className="text-[#F4A261] font-black mt-1">{prediction.recommendation}</Text>
                </View>
              </View>
              <Text className="text-white/50 text-xs leading-5">
                {prediction.trend} with {prediction.confidence}% confidence.
              </Text>
            </Animated.View>
          )}

          {similarProducts.length > 0 && (
            <Animated.View entering={FadeInDown.delay(340).springify()} className="mb-8">
              <Text className="text-white/60 font-bold text-xs uppercase tracking-wider mb-4 px-1">
                Similar Products
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarProducts.map((item) => {
                  const image = item.image || mockProducts[item.id]?.image;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => router.push(`/product/${item.upc}` as any)}
                      className="w-40 mr-3 bg-[#111827] border border-white/5 rounded-2xl overflow-hidden"
                    >
                      <Image source={{ uri: image }} className="w-full h-24" resizeMode="cover" />
                      <View className="p-3">
                        <Text className="text-white/40 text-[10px] font-bold uppercase" numberOfLines={1}>
                          {item.brand}
                        </Text>
                        <Text className="text-white text-xs font-bold mt-1 leading-4" numberOfLines={2}>
                          {item.name}
                        </Text>
                        <View className="flex-row items-center mt-2">
                          <Text className="text-[#2ECC71] text-[11px] font-bold">View</Text>
                          <ChevronRight size={12} color="#2ECC71" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>
          )}

          {product.description && (
            <Animated.View
              entering={FadeInDown.delay(350).springify()}
              className="bg-[#111827] border border-white/5 rounded-3xl p-6 mb-8"
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Info size={16} color="#4ADE80" />
                <Text className="text-white font-bold text-sm">About this item</Text>
              </View>
              <Text className="text-white/60 text-sm leading-relaxed font-medium">{product.description}</Text>
            </Animated.View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 90,
    justifyContent: "center",
  },
  heroContainer: {
    height: HERO_HEIGHT,
    width,
    backgroundColor: "white",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,14,21,0.3)",
  },
});