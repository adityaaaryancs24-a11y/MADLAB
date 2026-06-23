import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { useAppTheme } from "@/src/hooks/useAppTheme";

function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  opacity,
  bgColor,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  opacity: Animated.Value;
  bgColor: string;
  style?: object;
}) {
  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: bgColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

export default function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  const { theme, isDark } = useAppTheme();

  const skeletonBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const borderColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      className="flex-row items-center mx-5 mb-3 p-4 rounded-2xl border"
      style={{ backgroundColor: cardBg, borderColor }}
    >
      {/* Image skeleton */}
      <SkeletonBlock
        width={60}
        height={60}
        borderRadius={12}
        opacity={opacity}
        bgColor={skeletonBg}
        style={{ marginRight: 16 }}
      />

      {/* Text skeletons */}
      <View className="flex-1 gap-2">
        <SkeletonBlock width="35%" height={10} opacity={opacity} bgColor={skeletonBg} />
        <SkeletonBlock width="80%" height={13} opacity={opacity} bgColor={skeletonBg} />
        <SkeletonBlock width="50%" height={10} opacity={opacity} bgColor={skeletonBg} />
      </View>

      {/* Price skeleton */}
      <View className="items-end gap-2 ml-3">
        <SkeletonBlock width={56} height={16} opacity={opacity} bgColor={skeletonBg} />
        <SkeletonBlock width={40} height={10} opacity={opacity} bgColor={skeletonBg} />
      </View>
    </View>
  );
}
