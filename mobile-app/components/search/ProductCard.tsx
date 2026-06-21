import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated as RNAnimated,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, TrendingDown, Heart } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { getMockPrices } from "@/src/utils/mockData";
import type { Product } from "@/src/types";
import { useApp } from "@/src/context/AppContext";

type Props = {
  product: Product;
  index?: number;
  onPress?: () => void;
};

// ── Shimmer placeholder ────────────────────────────────────────────────────
function ImageSkeleton() {
  const shimmer = useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    const anim = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        RNAnimated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <RNAnimated.View
      style={{
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.08)",
        opacity,
      }}
    />
  );
}

// ── Letter-initial fallback ────────────────────────────────────────────────
function LetterFallback({ name }: { name: string }) {
  const letter = name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: "rgba(46,204,113,0.12)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", color: "#2ECC71" }}>
        {letter}
      </Text>
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ProductCard({ product, index = 0, onPress }: Props) {
  const router = useRouter();
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  const { watchlist, addToWatchlist, removeFromWatchlist } = useApp();

  // Image loading state
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ── Watchlist sync: check BOTH product.id AND product.upc ───────────────
  // The product page stores productId = product.upc (legacy), while this
  // card stores product.id. Until all existing AsyncStorage entries are
  // migrated, we must check both to keep the heart in sync.
  const isInWatchlist = watchlist.some(
    (w) => w.productId === product.id || w.productId === product.upc
  );

  // Reanimated spring scale for heart button
  const heartScale = useSharedValue(1);
  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

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
    RNAnimated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    RNAnimated.spring(scaleAnim, {
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

  const handleHeartPress = () => {
    // Spring punch: 1 → 1.35 → 1
    heartScale.value = withSequence(
      withSpring(1.35, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    if (isInWatchlist) {
      // Remove: find the entry matching EITHER id form and delete by record id
      const item = watchlist.find(
        (w) => w.productId === product.id || w.productId === product.upc
      );
      if (item) {
        removeFromWatchlist(item.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const now = Date.now();
      // Always store productId = product.id (the numeric string key, e.g. "1")
      addToWatchlist({
        id: `watch_${product.id}_${now}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: product.image ?? "",
        currentPrice: lowestPrice || 0,
        previousPrice: highestPrice || lowestPrice || 0,
        priceDropPercent: savingsPercent,
        priceHistory: [
          {
            timestamp: now,
            price: lowestPrice || 0,
            store: bestPrice?.store ?? "Verity",
          },
        ],
        addedAt: now,
      });
    }
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
      <RNAnimated.View
        className="flex-row items-center mx-5 mb-3 p-4 rounded-2xl border border-white/[0.06]"
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: "rgba(255,255,255,0.04)",
        }}
      >
        {/* Thumbnail — shimmer → image → letter fallback */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 12,
            overflow: "hidden",
            marginRight: 16,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        >
          {imgError ? (
            <LetterFallback name={product.name} />
          ) : (
            <>
              {!imgLoaded && <ImageSkeleton />}
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  style={{
                    width: 60,
                    height: 60,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: imgLoaded ? 1 : 0,
                  }}
                  resizeMode="cover"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(true);
                  }}
                />
              ) : (
                <LetterFallback name={product.name} />
              )}
            </>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 mr-3">
          <Text className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-0.5">
            {product.brand}
          </Text>
          <Text
            className="text-[14px] font-semibold text-white leading-5"
            numberOfLines={2}
          >
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
              ₹
              {bestPrice.price.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
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

        {/* Heart button */}
        <TouchableOpacity
          onPress={handleHeartPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
          style={{ marginLeft: 8 }}
        >
          <ReAnimated.View style={heartAnimStyle}>
            <Heart
              size={18}
              color={isInWatchlist ? "#4ADE80" : "rgba(255,255,255,0.3)"}
              fill={isInWatchlist ? "#4ADE80" : "transparent"}
            />
          </ReAnimated.View>
        </TouchableOpacity>

        <ChevronRight
          size={16}
          color="rgba(255,255,255,0.15)"
          style={{ marginLeft: 4 }}
        />
      </RNAnimated.View>
    </TouchableOpacity>
  );
}
