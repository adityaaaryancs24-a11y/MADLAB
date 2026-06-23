import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, TrendingDown } from "lucide-react-native";
import { getMockPrices } from "@/src/utils/mockData";
import type { Product } from "@/src/types";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  product: Product;
  index?: number;
  onPress?: () => void;
};

export default function ProductCard({ product, index = 0, onPress }: Props) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { theme, accent } = useAppTheme();

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
      pathname: "/product/[upc]",
      params: { upc: product.upc },
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
        className="flex-row items-center mx-5 mb-3 p-4 rounded-2xl border"
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: theme.bgCard,
          borderColor: theme.border,
        }}
      >
        {/* Thumbnail */}
        <View
          style={{ backgroundColor: theme.bgCardAlt }}
          className="w-[60px] h-[60px] rounded-xl overflow-hidden items-center justify-center mr-4"
        >
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
          <Text
            style={{ color: theme.textMuted }}
            className="text-[11px] uppercase tracking-wider font-semibold mb-0.5"
          >
            {product.brand}
          </Text>
          <Text
            style={{ color: theme.text }}
            className="text-[14px] font-semibold leading-5"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1.5">
            <View style={{ backgroundColor: accent.hexLight + "1c" }} className="px-2 py-0.5 rounded-md">
              <Text style={{ color: accent.hex }} className="text-[10px] font-bold">
                {product.category}
              </Text>
            </View>
            <Text style={{ color: theme.textDim }} className="text-[10px]">
              {retailerCount} retailer{retailerCount !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Price Column */}
        <View className="items-end gap-1 min-w-[72px]">
          {bestPrice?.price != null && (
            <Text style={{ color: theme.text }} className="text-[16px] font-bold">
              ₹{bestPrice.price.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          )}
          {savingsPercent > 0 && (
            <View style={{ backgroundColor: accent.hexLight + "1c" }} className="flex-row items-center gap-1 px-2 py-0.5 rounded-md">
              <TrendingDown size={10} color={accent.hex} />
              <Text style={{ color: accent.hex }} className="text-[10px] font-bold">
                Save {savingsPercent}%
              </Text>
            </View>
          )}
          <Text style={{ color: theme.textDim }} className="text-[9px]" numberOfLines={1}>
            {bestPrice?.store ?? "N/A"}
          </Text>
        </View>

        {/* Chevron */}
        <ChevronRight size={16} color={theme.textDim} style={{ marginLeft: 4 }} />
      </Animated.View>
    </TouchableOpacity>
  );
}
