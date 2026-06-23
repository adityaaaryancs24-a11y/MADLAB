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
import * as Speech from "expo-speech";

import { BackendProduct, productService } from "../../services/productService";
import { NativePriceChart } from "../../src/components/NativePriceChart";
import { useApp } from "../../src/context/AppContext";
import { useAppTheme } from "../../src/hooks/useAppTheme";
import { getProductsByCategory, getSimilarProducts, mockProducts } from "../../src/utils/mockData";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 380;

function formatCurrency(value: number) {
  return `₹${value.toFixed(2)}`;
}

function formatHistoryDate(point: BackendProduct["price_history"][number]) {
  if (point.recorded_at) {
    const d = new Date(point.recorded_at);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }
  if (point.date) {
    const d = new Date(point.date);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return point.date;
  }
  return "N/A";
}

export default function ProductDetailScreen() {
  const { upc, productJson } = useLocalSearchParams<{ upc: string; productJson?: string }>();
  console.log("PRODUCT PAGE UPC:", upc);
  console.log("PRODUCT JSON:", productJson);
  const insets = useSafeAreaInsets();
  const { addToWatchlist, watchlist, removeFromWatchlist, settings } = useApp();
  const { isDark, theme, accent } = useAppTheme();

  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fontScale = settings.fontSize === "small" ? 0.88 : settings.fontSize === "large" ? 1.15 : 1.0;

  // Text-To-Speech announcement for pricing
  useEffect(() => {
    if (product && settings.ttsEnabled) {
      const bestPrice = product.prices?.[0];
      const priceText = bestPrice 
        ? `Best price is ${bestPrice.price} Rupees at ${bestPrice.store || bestPrice.retailer}`
        : "Price is not available";
      const textToSpeak = `${product.brand} ${product.name}. ${priceText}.`;
      
      Speech.speak(textToSpeak, {
        language: "en-IN",
        rate: 0.9,
      });

      return () => {
        Speech.stop();
      };
    }
  }, [product, settings.ttsEnabled]);
  const [error, setError] = useState<string | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(false);

  const scrollY = useSharedValue(0);

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
      <View style={{ backgroundColor: theme.bg }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={accent.hex} />
        <Text style={{ color: theme.textMuted }} className="mt-4 font-semibold text-sm">Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ backgroundColor: theme.bg }} className="flex-1 items-center justify-center px-6">
        <XCircle size={48} color="#EF4444" />
        <Text style={{ color: theme.text }} className="text-xl font-bold mt-4 mb-2">Oops!</Text>
        <Text style={{ color: theme.textMuted }} className="text-center mb-8">{error || "Product not found"}</Text>
        <TouchableOpacity
          onPress={() => {
            if (error) fetchProduct();
            else router.back();
          }}
          style={{ backgroundColor: accent.hex }}
          className="w-full py-4 rounded-2xl items-center shadow-lg"
        >
          <Text style={{ color: isDark ? "#0A0E15" : "#FFFFFF" }} className="font-bold text-base">{error ? "Retry" : "Go Back"}</Text>
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
  const isSaved = watchlist.some((item) => item.productId === product.upc);

  // Filter prices to only show stores the user has enabled (if any preferred stores are set)
  const hasPreferredStores = Object.values(settings.preferredStores).some(Boolean);
  const filteredPrices = hasPreferredStores
    ? pricing.sortedPrices.filter((p) => {
        const storeName = (p.store || p.retailer || "").toLowerCase();
        return Object.entries(settings.preferredStores).some(
          ([key, enabled]) => enabled && storeName.includes(key)
        );
      })
    : pricing.sortedPrices;
  // Fall back to showing all prices if preferred-store filtering yields nothing
  const displayPrices = filteredPrices.length > 0 ? filteredPrices : pricing.sortedPrices;

  const handleWatchlistToggle = async () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isSaved) {
      const watchlistItem = watchlist.find((item) => item.productId === product.upc);
      if (watchlistItem) removeFromWatchlist(watchlistItem.id);
      return;
    }

    addToWatchlist({
      id: `watch_${Date.now()}`,
      productId: product.upc,
      name: product.name,
      brand: product.brand,
      image: product.image,
      currentPrice: pricing.lowestPrice,
      previousPrice: pricing.averagePrice || pricing.lowestPrice,
      priceDropPercent: Number(pricing.savingsPercent.toFixed(1)),
      targetPrice: Number((pricing.lowestPrice * 0.9).toFixed(2)),
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
    <View style={{ backgroundColor: theme.bg }} className="flex-1">
      <Animated.View
        style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? "rgba(10,14,21,0.95)" : "rgba(245,247,250,0.95)", borderBottomColor: theme.border }, headerOpacityStyle]}
        className="absolute top-0 left-0 right-0 z-50 border-b"
      >
        <Text style={{ color: theme.text }} className="font-bold text-lg text-center mt-2" numberOfLines={1}>
          {product.name}
        </Text>
      </Animated.View>

      <View
        style={{ paddingTop: insets.top }}
        className="absolute top-0 left-0 right-0 z-50 flex-row justify-between px-4 mt-2"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)", borderColor: theme.border }}
          className="w-10 h-10 rounded-full items-center justify-center border"
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShare}
          style={{ backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)", borderColor: theme.border }}
          className="w-10 h-10 rounded-full items-center justify-center border"
        >
          <Share2 size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View style={[styles.heroContainer, { backgroundColor: theme.bgCard }, heroAnimatedStyle]}>
          <Animated.Image
            entering={FadeIn.duration(800)}
            source={{ uri: product.image }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={{ backgroundColor: theme.bg }} className="px-6 -mt-10 pt-8 rounded-t-[40px]">
          <View className="flex-row items-center gap-3 mb-4 flex-wrap">
            <View style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="px-3 py-1 rounded-full border">
              <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold tracking-widest uppercase">
                {product.category || "General"}
              </Text>
            </View>
            <View style={{ backgroundColor: isDark ? "rgba(74, 222, 128, 0.1)" : "rgba(22, 163, 74, 0.1)", borderColor: isDark ? "rgba(74, 222, 128, 0.2)" : "rgba(22, 163, 74, 0.2)" }} className="px-3 py-1 rounded-full border">
              <Text style={{ color: accent.hex }} className="text-[10px] font-bold tracking-widest font-mono">
                UPC: {product.upc}
              </Text>
            </View>
          </View>

          {(product.warning || product.dataSource === "mock") && (
            <Animated.View
              entering={FadeInDown.delay(80).springify()}
              className={`flex-row gap-3 bg-[#F4A261]/10 border ${settings.highContrast ? 'border-[#F4A261]/60' : 'border-[#F4A261]/20'} rounded-2xl p-4 mb-5`}
            >
              <AlertTriangle size={18} color="#F4A261" />
              <Text style={{ fontSize: 12 * fontScale }} className="text-[#F4A261] font-semibold leading-5 flex-1">
                {product.warning ||
                  "Live APIs did not return this barcode. Verity is showing realistic mock data so you can continue comparing prices."}
              </Text>
            </Animated.View>
          )}

          <Animated.Text
            entering={FadeInDown.delay(100).springify()}
            style={{ fontSize: 14 * fontScale, color: theme.textMuted }}
            className="font-bold uppercase tracking-wider mb-1"
          >
            {product.brand}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(150).springify()}
            style={{ fontSize: 30 * fontScale, color: theme.text }}
            className="font-black leading-tight mb-8"
          >
            {product.name}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(200).springify()} className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={handleWatchlistToggle}
              style={{
                backgroundColor: isSaved ? (isDark ? "rgba(46, 204, 113, 0.1)" : "rgba(22, 163, 74, 0.1)") : theme.bgCardAlt,
                borderColor: isSaved 
                  ? (settings.highContrast ? (isDark ? "rgba(46, 204, 113, 0.6)" : "rgba(22, 163, 74, 0.6)") : (isDark ? "rgba(46, 204, 113, 0.3)" : "rgba(22, 163, 74, 0.3)")) 
                  : (settings.highContrast ? theme.borderStrong : theme.border)
              }}
              className="flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2"
            >
              <Heart size={18} color={isSaved ? accent.hex : theme.text} fill={isSaved ? accent.hex : "transparent"} />
              <Text style={{ fontSize: 14 * fontScale, color: isSaved ? accent.hex : theme.text }} className="font-bold">
                {isSaved ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (settings.hapticFeedback) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setAlertEnabled((enabled) => !enabled);
              }}
              style={{
                backgroundColor: alertEnabled ? accent.hex : theme.bgCardAlt,
                borderColor: alertEnabled ? accent.hex : (settings.highContrast ? theme.borderStrong : theme.border)
              }}
              className="flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2"
            >
              <Bell size={18} color={alertEnabled ? (isDark ? "#0A0E15" : "#FFFFFF") : theme.text} fill={alertEnabled ? (isDark ? "#0A0E15" : "#FFFFFF") : "transparent"} />
              <Text style={{ fontSize: 14 * fontScale, color: alertEnabled ? (isDark ? "#0A0E15" : "#FFFFFF") : theme.text }} className="font-bold">Alerts</Text>
            </TouchableOpacity>
          </Animated.View>

          {pricing.sortedPrices.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(250).springify()}
              style={{ backgroundColor: accent.hex }}
              className="rounded-3xl p-1 mb-8 shadow-lg"
            >
              <View style={{ backgroundColor: theme.bgCard, borderColor: settings.highContrast ? accent.hex : "transparent" }} className="rounded-[22px] p-5 border">
                <View className="flex-row justify-between items-start mb-4 gap-4">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <Tag size={14} color={accent.hex} />
                      <Text style={{ fontSize: 12 * fontScale, color: accent.hex }} className="font-black uppercase tracking-wider">
                        Best Price Found
                      </Text>
                    </View>
                    <Text style={{ fontSize: 30 * fontScale, color: theme.text }} className="font-black">{formatCurrency(pricing.lowestPrice)}</Text>
                  </View>
                  <View className="items-end flex-1">
                    <Text style={{ fontSize: 12 * fontScale, color: theme.textMuted }} className="font-semibold mb-1" numberOfLines={1}>
                      at {pricing.bestPrice?.store ?? pricing.bestPrice?.retailer ?? "Verity"}
                    </Text>
                    {pricing.maxSavings > 0 && (
                      <View style={{ backgroundColor: isDark ? "rgba(46, 204, 113, 0.2)" : "rgba(22, 163, 74, 0.2)" }} className="px-2 py-1 rounded-md">
                        <Text style={{ fontSize: 12 * fontScale, color: accent.hex }} className="font-bold">
                          Save {pricing.savingsPercent.toFixed(0)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {pricing.bestPrice?.url && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(pricing.bestPrice!.url!)}
                    style={{ backgroundColor: accent.hex }}
                    className="w-full py-3.5 rounded-xl items-center"
                  >
                    <Text style={{ fontSize: 14 * fontScale, color: isDark ? "#0A0E15" : "#FFFFFF" }} className="font-black uppercase tracking-wide">Buy Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}

          {displayPrices.length > 1 && (
            <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-8">
              <Text style={{ fontSize: 12 * fontScale, color: theme.textMuted }} className="font-bold uppercase tracking-wider mb-4 px-1">
                Other Retailers
              </Text>
              <View className="gap-3">
                {displayPrices.slice(1).map((priceOption) => (
                  <TouchableOpacity
                    key={`${priceOption.store}-${priceOption.price}`}
                    onPress={() => priceOption.url && Linking.openURL(priceOption.url)}
                    style={{ backgroundColor: theme.bgCard, borderColor: settings.highContrast ? theme.borderStrong : theme.border }}
                    className="w-full flex-row items-center justify-between p-4 border rounded-2xl"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View style={{ backgroundColor: theme.bgCardAlt }} className="w-10 h-10 rounded-full items-center justify-center">
                        {priceOption.logo && (priceOption.logo.startsWith("http://") || priceOption.logo.startsWith("https://")) ? (
                          <Image
                            source={{ uri: priceOption.logo }}
                            style={{ width: 28, height: 28, borderRadius: 6 }}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text className="text-lg">{priceOption.logo || "🏪"}</Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text style={{ fontSize: 14 * fontScale, color: theme.text }} className="font-bold" numberOfLines={1}>
                          {priceOption.store || priceOption.retailer}
                        </Text>
                        <Text
                          style={{ fontSize: 12 * fontScale, color: (priceOption.stock === "Out of Stock" || !priceOption.in_stock) ? "#EF4444" : theme.textMuted }}
                          className="mt-0.5 font-medium"
                        >
                          {priceOption.stock || "In Stock"}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 16 * fontScale, color: theme.text }} className="font-bold ml-3">{formatCurrency(priceOption.price)}</Text>
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
                  <View key={label} style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="flex-1 p-3 border rounded-2xl items-center">
                    <Text className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: `${color}99` }}>
                      {label}
                    </Text>
                    <Text style={{ color: theme.text }} className="font-bold text-xs">{value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {prediction && (
            <Animated.View
              entering={FadeInDown.delay(325).springify()}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
              className="border rounded-3xl p-5 mb-8"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Sparkles size={16} color="#F4A261" />
                <Text style={{ color: theme.text }} className="font-bold text-sm">Price Prediction</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
                    Next {prediction.daysAhead} days
                  </Text>
                  <Text style={{ color: theme.text }} className="text-xl font-black mt-1">
                    {formatCurrency(prediction.predictedPrice)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">Signal</Text>
                  <Text className="text-[#F4A261] font-black mt-1">{prediction.recommendation}</Text>
                </View>
              </View>
              <Text style={{ color: theme.textMuted }} className="text-xs leading-5">
                {prediction.trend} with {prediction.confidence}% confidence.
              </Text>
            </Animated.View>
          )}

          {similarProducts.length > 0 && (
            <Animated.View entering={FadeInDown.delay(340).springify()} className="mb-8">
              <Text style={{ color: theme.textMuted }} className="font-bold text-xs uppercase tracking-wider mb-4 px-1">
                Similar Products
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarProducts.map((item) => {
                  const image = item.image || mockProducts[item.id]?.image;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => router.push(`/product/${item.upc}` as any)}
                      style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                      className="w-40 mr-3 border rounded-2xl overflow-hidden"
                    >
                      <Image source={{ uri: image }} className="w-full h-24" resizeMode="cover" />
                      <View className="p-3">
                        <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase" numberOfLines={1}>
                          {item.brand}
                        </Text>
                        <Text style={{ color: theme.text }} className="text-xs font-bold mt-1 leading-4" numberOfLines={2}>
                          {item.name}
                        </Text>
                        <View className="flex-row items-center mt-2">
                          <Text style={{ color: accent.hex }} className="text-[11px] font-bold">View</Text>
                          <ChevronRight size={12} color={accent.hex} />
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
              style={{ backgroundColor: theme.bgCard, borderColor: settings.highContrast ? theme.borderStrong : theme.border }}
              className="border rounded-3xl p-6 mb-8"
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Info size={16} color={accent.hex} />
                <Text style={{ fontSize: 14 * fontScale, color: theme.text }} className="font-bold">About this item</Text>
              </View>
              <Text style={{ fontSize: 14 * fontScale, color: theme.textMuted }} className="leading-relaxed font-medium">{product.description}</Text>
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
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
