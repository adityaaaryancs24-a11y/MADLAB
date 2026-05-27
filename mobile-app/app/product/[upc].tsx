import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Share,
  ActivityIndicator,
  Linking,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";

import {
  ArrowLeft,
  Share2,
  Bell,
  Heart,
  TrendingDown,
  Info,
  Tag,
  XCircle,
} from "lucide-react-native";

import * as Haptics from "expo-haptics";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "../../src/context/AppContext";
import {
  productService,
  BackendProduct,
} from "../../services/productService";

const { width } = Dimensions.get("window");

const HERO_HEIGHT = 380;

export default function ProductDetailScreen() {
  const { upc, productJson } = useLocalSearchParams<{
    upc: string;
    productJson?: string;
  }>();

  const insets = useSafeAreaInsets();

  const { addToWatchlist, watchlist, removeFromWatchlist } =
    useApp();

  const [product, setProduct] =
    useState<BackendProduct | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [alertEnabled, setAlertEnabled] = useState(false);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    if (productJson) {
      try {
        setProduct(JSON.parse(productJson));
        setIsLoading(false);
      } catch (e) {
        fetchProduct();
      }
    } else if (upc) {
      fetchProduct();
    }
  }, [upc, productJson]);

  const fetchProduct = async () => {
    if (!upc) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await productService.getProductByUPC(upc);
      setProduct(data);
    } catch (err: any) {
      setError(
        err.message || "Failed to load product details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const heroAnimatedStyle = useAnimatedStyle(() => {
    return {
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
          scale: interpolate(
            scrollY.value,
            [-100, 0],
            [1.2, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const headerOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [HERO_HEIGHT - 100, HERO_HEIGHT - 50],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0E15] items-center justify-center">
        <ActivityIndicator
          size="large"
          color="#4ADE80"
        />

        <Text className="text-white/60 mt-4 font-semibold text-sm">
          Loading product details...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-[#0A0E15] items-center justify-center px-6">
        <XCircle
          size={48}
          color="#EF4444"
          className="mb-4"
        />

        <Text className="text-white text-xl font-bold mb-2">
          Oops!
        </Text>

        <Text className="text-white/60 text-center mb-8">
          {error || "Product not found"}
        </Text>

        <TouchableOpacity
          onPress={() => {
            if (error) fetchProduct();
            else router.back();
          }}
          className="w-full py-4 bg-[#4ADE80] rounded-2xl items-center"
        >
          <Text className="text-[#0A0E15] font-bold text-base">
            {error ? "Retry" : "Go Back"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sortedPrices = [...(product.prices || [])].sort(
    (a, b) => a.price - b.price
  );

  const bestPriceObj = sortedPrices[0];

  const lowestPrice = bestPriceObj?.price || 0;

  const highestPrice =
    sortedPrices[sortedPrices.length - 1]?.price || 0;

  const averagePrice = product.prices?.length
    ? product.prices.reduce(
        (sum, p) => sum + p.price,
        0
      ) / product.prices.length
    : 0;

  const maxSavings = highestPrice - lowestPrice;

  const savingsPercent =
    highestPrice > 0
      ? (maxSavings / highestPrice) * 100
      : 0;

  const isSaved = watchlist.some(
    (item) => item.productId === product.upc
  );

  const handleWatchlistToggle = async () => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Medium
    );

    if (isSaved) {
      const watchlistItem = watchlist.find(
        (item) => item.productId === product.upc
      );

      if (watchlistItem)
        removeFromWatchlist(watchlistItem.id);
    } else {
      addToWatchlist({
        id: `watch_${Date.now()}`,
        productId: product.upc,
        name: product.name,
        image: product.image_url,
        currentPrice: lowestPrice,
        previousPrice: averagePrice,
        priceDropPercent: parseFloat(
          savingsPercent.toFixed(1)
        ),
        targetPrice: parseFloat(
          (lowestPrice * 0.9).toFixed(2)
        ),
        priceHistory:
          product.price_history?.map((h) => ({
            timestamp: new Date(
              (h as any).date ||
                (h as any).recorded_at
            ).getTime(),
            price: h.price,
            store: h.store,
          })) || [],
        addedAt: Date.now(),
      });
    }
  };

  const handleAlertToggle = () => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    );

    setAlertEnabled(!alertEnabled);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.brand} ${
          product.name
        }! Best price of $${lowestPrice.toFixed(
          2
        )} found.`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0E15]">
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top },
          headerOpacityStyle,
        ]}
        className="absolute top-0 left-0 right-0 z-50 bg-[#0A0E15]/95 border-b border-white/5"
      >
        <Text className="text-white font-bold text-lg text-center mt-2">
          {product.name}
        </Text>
      </Animated.View>

      <View
        style={{ paddingTop: insets.top }}
        className="absolute top-0 left-0 right-0 z-50 flex-row justify-between px-4 mt-2"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
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
        <Animated.View
          style={[
            styles.heroContainer,
            heroAnimatedStyle,
          ]}
        >
          <Animated.Image
            entering={FadeIn.duration(800)}
            source={{ uri: product.image_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.heroGradient} />
        </Animated.View>

        <View className="px-6 -mt-10 pt-8 bg-[#0A0E15] rounded-t-[40px]">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="bg-white/10 px-3 py-1 rounded-full">
              <Text className="text-white/60 text-[10px] font-bold uppercase">
                {product.category || "General"}
              </Text>
            </View>

            <View className="bg-[#4ADE80]/10 px-3 py-1 rounded-full">
              <Text className="text-[#4ADE80] text-[10px] font-bold">
                UPC: {product.upc}
              </Text>
            </View>
          </View>

          <Animated.Text className="text-white/60 text-sm font-bold uppercase tracking-wider mb-1">
            {product.brand}
          </Animated.Text>

          <Animated.Text className="text-white text-3xl font-black leading-tight mb-8">
            {product.name}
          </Animated.Text>

          <Animated.View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={handleWatchlistToggle}
              className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                isSaved
                  ? "bg-[#4ADE80]/10 border-[#4ADE80]/30"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <Heart
                size={18}
                color={isSaved ? "#4ADE80" : "white"}
                fill={
                  isSaved
                    ? "#4ADE80"
                    : "transparent"
                }
              />

              <Text
                className={`font-bold text-sm ${
                  isSaved
                    ? "text-[#4ADE80]"
                    : "text-white"
                }`}
              >
                {isSaved ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAlertToggle}
              className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                alertEnabled
                  ? "bg-[#4ADE80] border-[#4ADE80]"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <Bell
                size={18}
                color={
                  alertEnabled
                    ? "#0A0E15"
                    : "white"
                }
              />

              <Text
                className={`font-bold text-sm ${
                  alertEnabled
                    ? "text-[#0A0E15]"
                    : "text-white"
                }`}
              >
                Alerts
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {sortedPrices.length > 0 && (
            <Animated.View className="bg-[#4ADE80] rounded-3xl p-1 mb-8">
              <View className="bg-[#0A0E15] rounded-[22px] p-5">
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <Tag
                        size={14}
                        color="#4ADE80"
                      />

                      <Text className="text-[#4ADE80] font-black text-xs uppercase">
                        Best Price Found
                      </Text>
                    </View>

                    <Text className="text-white text-3xl font-black">
                      ${lowestPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* 30-Day Trend Chart */}
          {product.price_history &&
            product.price_history.length > 0 && (
              <View className="bg-[#111827] border border-white/5 rounded-3xl p-5 mb-8">
                <View className="flex-row justify-between items-center mb-6">
                  <View className="flex-row items-center gap-2">
                    <TrendingDown
                      size={18}
                      color="#4ADE80"
                    />

                    <Text className="text-white font-bold text-base">
                      30-Day Trend
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-end justify-between h-32 pt-4">
                  {product.price_history
                    .slice(0, 7)
                    .map((point, index) => {
                      const prices =
                        product.price_history!.map(
                          (h) => h.price
                        );

                      const minHPrice = Math.min(
                        ...prices
                      );

                      const maxHPrice = Math.max(
                        ...prices
                      );

                      const range =
                        maxHPrice - minHPrice || 1;

                      const heightPercent =
                        ((point.price - minHPrice) /
                          range) *
                          60 +
                        20;

                      const dateStr =
                        (point as any).date ||
                        (point as any).recorded_at;

                      const dateObj = new Date(
                        dateStr
                      );

                      return (
                        <View
                          key={index}
                          className="items-center flex-1"
                        >
                          <View
                            className="w-3 rounded-t-lg bg-[#4ADE80]"
                            style={{
                              height: `${heightPercent}%`,
                            }}
                          />

                          <Text className="text-[10px] text-white/30 mt-3 font-medium">
                            {dateObj.toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              </View>
            )}

          {product.description && (
            <Animated.View className="bg-[#111827] border border-white/5 rounded-3xl p-6 mb-8">
              <View className="flex-row items-center gap-2 mb-3">
                <Info size={16} color="#4ADE80" />

                <Text className="text-white font-bold text-sm">
                  About this item
                </Text>
              </View>

              <Text className="text-white/60 text-sm leading-relaxed font-medium">
                {product.description}
              </Text>
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
    width: width,
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