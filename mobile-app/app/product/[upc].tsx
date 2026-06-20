import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Share, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler, 
  interpolate, 
  Extrapolation,
  FadeInDown,
  FadeIn
} from "react-native-reanimated";
import { ArrowLeft, Share2, Bell, Heart, TrendingDown, Info, Tag, XCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "../../src/context/AppContext";
import { mockProducts, getMockPrices, generatePriceHistory } from "@/src/utils/mockData";
import type { Product } from "@/src/types";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 380;

export default function ProductDetailScreen() {
  const { upc } = useLocalSearchParams<{ upc: string }>();
  const insets = useSafeAreaInsets();
  const { addToWatchlist, watchlist, removeFromWatchlist } = useApp();
  
  // 1. ALL STATE HOOKS
  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(false);

  // 2. ALL ANIMATION HOOKS (Must be declared before any early returns)
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [-100, 0, HERO_HEIGHT], [-50, 0, HERO_HEIGHT * 0.5], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const headerOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [HERO_HEIGHT - 100, HERO_HEIGHT - 50], [0, 1], Extrapolation.CLAMP),
    };
  });

  // 3. EFFECT HOOKS
  useEffect(() => {
    if (upc) {
      loadProductData();
    }
  }, [upc]);

  const loadProductData = () => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      try {
        const foundProduct = mockProducts[upc as string];
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          const mockPrices = getMockPrices(foundProduct.id);
          const validPrices = mockPrices.filter(p => !p.isInput && p.price !== null);
          setPrices(validPrices);
          
          setHistory(generatePriceHistory(30));
        } else {
          setError("Product not found in database.");
        }
      } catch (err: any) {
        setError("Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    }, 400); 
  };

  // 4. EARLY RETURNS (Safe to do this now that all hooks are declared)
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0E15] items-center justify-center">
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text className="text-white/60 mt-4 font-semibold text-sm">Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-[#0A0E15] items-center justify-center px-6">
        <XCircle size={48} color="#EF4444" className="mb-4" />
        <Text className="text-white text-xl font-bold mb-2">Oops!</Text>
        <Text className="text-white/60 text-center mb-8">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-full py-4 bg-[#2ECC71] rounded-2xl items-center shadow-lg"
        >
          <Text className="text-[#0A0E15] font-bold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 5. CALCULATIONS & HANDLERS
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const bestPriceObj = sortedPrices[0];
  const lowestPrice = bestPriceObj?.price || 0;
  const highestPrice = sortedPrices[sortedPrices.length - 1]?.price || 0;
  const averagePrice = prices.length ? prices.reduce((sum, p) => sum + p.price, 0) / prices.length : 0;
  const maxSavings = highestPrice - lowestPrice;
  const savingsPercent = highestPrice > 0 ? (maxSavings / highestPrice) * 100 : 0;

  const isSaved = watchlist.some((item) => item.productId === product.id);

  const handleWatchlistToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSaved) {
      const watchlistItem = watchlist.find((item) => item.productId === product.id);
      if (watchlistItem) removeFromWatchlist(watchlistItem.id);
    } else {
      addToWatchlist({
        id: `watch_${Date.now()}`,
        productId: product.id,
        name: product.name,
        image: product.image,
        currentPrice: lowestPrice,
        previousPrice: averagePrice,
        priceDropPercent: parseFloat(savingsPercent.toFixed(1)),
        targetPrice: parseFloat((lowestPrice * 0.9).toFixed(2)),
        priceHistory: history.map(h => ({
          timestamp: Date.now(),
          price: h.price,
          store: bestPriceObj?.store || "Average"
        })),
        addedAt: Date.now(),
      });
    }
  };

  const handleAlertToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAlertEnabled(!alertEnabled);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.brand} ${product.name}! Best price of $${lowestPrice.toFixed(2)} found at ${bestPriceObj?.store}.`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const renderHistoryChart = () => {
    if (!history || history.length === 0) return null;
    
    const priceVals = history.map((h) => h.price);
    const minHPrice = Math.min(...priceVals);
    const maxHPrice = Math.max(...priceVals);
    const range = maxHPrice - minHPrice || 1;

    const displayPoints = history.filter((_, i) => i % Math.ceil(history.length / 7) === 0).slice(0, 7);

    return (
      <Animated.View entering={FadeInDown.delay(300).springify()} className="bg-[#111827] border border-white/5 rounded-3xl p-5 mb-8">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-2">
            <TrendingDown size={18} color="#2ECC71" />
            <Text className="text-white font-bold text-base">30-Day Trend</Text>
          </View>
          <Text className="text-[#2ECC71] font-bold text-xs bg-[#2ECC71]/10 px-2.5 py-1 rounded-full">
            Trending Down
          </Text>
        </View>

        <View className="flex-row items-end justify-between h-32 pt-4">
          {displayPoints.map((point, index) => {
            const heightPercent = ((point.price - minHPrice) / range) * 60 + 20;
            const isLowest = point.price === minHPrice;

            return (
              <View key={index} className="items-center flex-1">
                <View 
                  className={`w-3 rounded-t-lg relative ${isLowest ? 'bg-[#2ECC71]' : 'bg-white/10'}`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {isLowest && (
                    <View className="absolute -top-7 -left-3 bg-[#2ECC71] px-1.5 py-0.5 rounded text-[10px] font-extrabold text-[#0A0E15]">
                      ${point.price.toFixed(0)}
                    </View>
                  )}
                </View>
                <Text className="text-[10px] text-white/30 mt-3 font-medium">
                  {point.date}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  // 6. RENDER
  return (
    <View className="flex-1 bg-[#0A0E15]">
      {/* Floating Navbar */}
      <Animated.View 
        style={[
          styles.header, 
          { paddingTop: insets.top },
          headerOpacityStyle
        ]}
        className="absolute top-0 left-0 right-0 z-50 bg-[#0A0E15]/95 border-b border-white/5"
      >
        <Text className="text-white font-bold text-lg text-center mt-2" numberOfLines={1}>{product.name}</Text>
      </Animated.View>

      {/* Back & Share Buttons */}
      <View style={{ paddingTop: insets.top }} className="absolute top-0 left-0 right-0 z-50 flex-row justify-between px-4 mt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md items-center justify-center border border-white/10"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md items-center justify-center border border-white/10"
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
        {/* Parallax Hero Image */}
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
          {/* UPC Badge & Category */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="bg-white/10 px-3 py-1 rounded-full border border-white/5">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest uppercase">
                {product.category || "General"}
              </Text>
            </View>
            <View className="bg-[#2ECC71]/10 px-3 py-1 rounded-full border border-[#2ECC71]/20">
              <Text className="text-[#2ECC71] text-[10px] font-bold tracking-widest font-mono">
                UPC: {product.upc}
              </Text>
            </View>
          </View>

          {/* Title & Brand */}
          <Animated.Text entering={FadeInDown.delay(100).springify()} className="text-white/60 text-sm font-bold uppercase tracking-wider mb-1">
            {product.brand}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(150).springify()} className="text-white text-3xl font-black leading-tight mb-8">
            {product.name}
          </Animated.Text>

          {/* Action Row */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={handleWatchlistToggle}
              className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                isSaved ? "bg-[#2ECC71]/10 border-[#2ECC71]/30" : "bg-white/5 border-white/5"
              }`}
            >
              <Heart size={18} color={isSaved ? "#2ECC71" : "white"} fill={isSaved ? "#2ECC71" : "transparent"} />
              <Text className={`font-bold text-sm ${isSaved ? "text-[#2ECC71]" : "text-white"}`}>
                {isSaved ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAlertToggle}
              className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                alertEnabled ? "bg-[#2ECC71] border-[#2ECC71]" : "bg-white/5 border-white/5"
              }`}
            >
              <Bell size={18} color={alertEnabled ? "#0A0E15" : "white"} fill={alertEnabled ? "#0A0E15" : "transparent"} />
              <Text className={`font-bold text-sm ${alertEnabled ? "text-[#0A0E15]" : "text-white"}`}>
                Alerts
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Best Price Card */}
          {sortedPrices.length > 0 && (
            <Animated.View entering={FadeInDown.delay(250).springify()} className="bg-[#2ECC71] rounded-3xl p-1 mb-8 shadow-lg shadow-[#2ECC71]/20">
              <View className="bg-[#0A0E15] rounded-[22px] p-5">
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <Tag size={14} color="#2ECC71" />
                      <Text className="text-[#2ECC71] font-black text-xs uppercase tracking-wider">
                        Best Price Found
                      </Text>
                    </View>
                    <Text className="text-white text-3xl font-black">${lowestPrice.toFixed(2)}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white/40 text-xs font-semibold mb-1">at {bestPriceObj.store}</Text>
                    {maxSavings > 0 && (
                      <View className="bg-[#2ECC71]/20 px-2 py-1 rounded-md">
                        <Text className="text-[#2ECC71] font-bold text-xs">Save {savingsPercent.toFixed(0)}%</Text>
                      </View>
                    )}
                  </View>
                </View>
                {bestPriceObj.url && (
                  <TouchableOpacity 
                    onPress={() => Linking.openURL(bestPriceObj.url)}
                    className="w-full bg-[#2ECC71] py-3.5 rounded-xl items-center"
                  >
                    <Text className="text-[#0A0E15] font-black text-sm uppercase tracking-wide">Buy Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}

          {/* Retailer Comparison */}
          {sortedPrices.length > 1 && (
            <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-8">
              <Text className="text-white/60 font-bold text-xs uppercase tracking-wider mb-4 px-1">
                Other Retailers
              </Text>
              <View className="space-y-3">
                {sortedPrices.slice(1).map((priceOption, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => priceOption.url && Linking.openURL(priceOption.url)}
                    className="w-full flex-row items-center justify-between p-4 bg-[#111827] border border-white/5 rounded-2xl"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                        <Text className="text-lg">{priceOption.logo || "🏪"}</Text>
                      </View>
                      <View>
                        <Text className="text-white font-bold text-sm">{priceOption.store}</Text>
                        <Text className={`text-xs mt-0.5 font-medium ${
                          priceOption.stock === 'Out of Stock' ? 'text-red-400' : 'text-white/40'
                        }`}>
                          {priceOption.stock || 'In Stock'}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-bold text-base text-white">
                      ${priceOption.price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* 30-Day Trend Chart */}
          {renderHistoryChart()}

          {/* Description */}
          {product.description && (
            <Animated.View entering={FadeInDown.delay(350).springify()} className="bg-[#111827] border border-white/5 rounded-3xl p-6 mb-8">
              <View className="flex-row items-center gap-2 mb-3">
                <Info size={16} color="#2ECC71" />
                <Text className="text-white font-bold text-sm">About this item</Text>
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
    justifyContent: 'center',
  },
  heroContainer: {
    height: HERO_HEIGHT,
    width: width,
    backgroundColor: '#121822',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,14,21,0.2)',
  }
});