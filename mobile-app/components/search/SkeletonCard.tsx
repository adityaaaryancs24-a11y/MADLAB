import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  opacity,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  opacity: Animated.Value;
  style?: object;
}) {
  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "rgba(255,255,255,0.06)",
          opacity,
        },
        style,
      ]}
    />
  );
}

export default function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

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
      className="flex-row items-center mx-5 mb-3 p-4 rounded-2xl border border-white/[0.04]"
      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
    >
      {/* Image skeleton */}
      <SkeletonBlock
        width={60}
        height={60}
        borderRadius={12}
        opacity={opacity}
        style={{ marginRight: 16 }}
      />

      {/* Text skeletons */}
      <View className="flex-1 gap-2">
        <SkeletonBlock width="35%" height={10} opacity={opacity} />
        <SkeletonBlock width="80%" height={13} opacity={opacity} />
        <SkeletonBlock width="50%" height={10} opacity={opacity} />
      </View>

      {/* Price skeleton */}
      <View className="items-end gap-2 ml-3">
        <SkeletonBlock width={56} height={16} opacity={opacity} />
        <SkeletonBlock width={40} height={10} opacity={opacity} />
      </View>
    </View>
  );
}
