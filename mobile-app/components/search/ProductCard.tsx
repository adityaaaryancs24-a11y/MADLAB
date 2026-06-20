import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, TrendingDown, TrendingUp, Minus } from "lucide-react-native";
import { getMockPrices } from "@/src/utils/mockData";
import type { Product } from "@/src/types";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  product: Product;
  index?: number;
  onPress?: () => void;
};

export default function ProductCard({ product, index = 0, onPress }: Props) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get prices to show best deal
  const prices = getMockPrices(product.id);
  const bestPrice = prices.find((p) => p.isBest);
  const validPrices = prices
    .filter((p) => p.price !== null && !p.isInput)
    .map((p) => p.price as number);
  const highestPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
  const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const savingsPercent =
    highestPrice > 0
      ? Math.round(((highestPrice - lowestPrice) / highestPrice) * 100)
      : 0;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    onPress?.();
    router.push({
      pathname: "/product/[upc]", // Changed from [id] to [upc]
      params: { upc: product.id }, // Changed the param key to upc
    });
  };

  const retailerCount = prices.filter(
    (p) => p.price !== null && !p.isInput
  ).length;

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View
        className="flex-row items-center mb-3.5 p-3.5 rounded-[22px] bg-[#161D29] border border-white/5"
        style={{
          transform: [{ scale: scaleAnim }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5, // For Android shadow
        }}
      >
        {/* Thumbnail */}
        <View className="w-[68px] h-[68px] rounded-[14px] overflow-hidden bg-[#0A0E15] items-center justify-center mr-4 border border-white/10">
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-2xl">📦</Text>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 mr-3">
          <Text className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">
            {product.brand}
          </Text>
          <Text className="text-[15px] font-bold text-white leading-5 mb-1.5" numberOfLines={2}>
            {product.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="px-2 py-1 bg-[#2ECC71]/10 rounded-md border border-[#2ECC71]/10">
              <Text className="text-[9px] text-[#2ECC71] font-bold uppercase tracking-wide">
                {product.category}
              </Text>
            </View>
            <Text className="text-[11px] text-white/30 font-medium">
              {retailerCount} retailers
            </Text>
          </View>
        </View>

        {/* Price Column */}
        <View className="items-end min-w-[76px]">
          {bestPrice?.price != null && (
            <Text className="text-[18px] font-black text-white tracking-tight mb-1">
              ₹{bestPrice.price.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          )}
          {savingsPercent > 0 && (
            <View className="flex-row items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#2ECC71]/10 border border-[#2ECC71]/20">
              <TrendingDown size={10} color="#2ECC71" />
              <Text className="text-[9px] text-[#2ECC71] font-bold">
                Save {savingsPercent}%
              </Text>
            </View>
          )}
          <Text className="text-[9px] text-white/40 uppercase font-bold mt-1" numberOfLines={1}>
            {bestPrice?.store ?? "N/A"}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );}