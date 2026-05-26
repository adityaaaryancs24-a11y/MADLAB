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
import { getMockPrices, type Product } from "@/src/utils/mockData";

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
      pathname: "/product/[id]",
      params: { id: product.id },
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
      activeOpacity={1}
    >
      <Animated.View
        className="flex-row items-center mx-5 mb-3 p-4 rounded-2xl border border-white/[0.06]"
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: "rgba(255,255,255,0.04)",
        }}
      >
        {/* Thumbnail */}
        <View className="w-[60px] h-[60px] rounded-xl overflow-hidden items-center justify-center bg-white/[0.06] mr-4">
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={{ width: 60, height: 60 }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-2xl">📦</Text>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 mr-3">
          <Text className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-0.5">
            {product.brand}
          </Text>
          <Text className="text-[14px] font-semibold text-white leading-5" numberOfLines={2}>
            {product.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1.5">
            <View className="px-2 py-0.5 bg-[#2ECC71]/10 rounded-md">
              <Text className="text-[10px] text-[#2ECC71] font-bold">
                {product.category}
              </Text>
            </View>
            <Text className="text-[10px] text-white/30">
              {retailerCount} retailer{retailerCount !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Price Column */}
        <View className="items-end gap-1 min-w-[72px]">
          {bestPrice?.price != null && (
            <Text className="text-[16px] font-bold text-white">
              ₹{bestPrice.price.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          )}
          {savingsPercent > 0 && (
            <View className="flex-row items-center gap-1 px-2 py-0.5 bg-[#2ECC71]/10 rounded-md">
              <TrendingDown size={10} color="#2ECC71" />
              <Text className="text-[10px] text-[#2ECC71] font-bold">
                Save {savingsPercent}%
              </Text>
            </View>
          )}
          <Text className="text-[9px] text-white/25" numberOfLines={1}>
            {bestPrice?.store ?? "N/A"}
          </Text>
        </View>

        {/* Chevron */}
        <ChevronRight size={16} color="rgba(255,255,255,0.15)" style={{ marginLeft: 4 }} />
      </Animated.View>
    </TouchableOpacity>
  );
}
