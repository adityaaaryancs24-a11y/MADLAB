import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
};

export default function CategoryFilters({ categories, active, onChange }: Props) {
  const { theme, accent, isDark } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const activeIndex = categories.indexOf(active);

  // Scroll to show active filter when it changes
  useEffect(() => {
    if (activeIndex > 2 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: activeIndex * 90, animated: true });
    } else if (activeIndex <= 1 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, animated: true });
    }
  }, [active, activeIndex]);

  return (
    <View className="pt-1 pb-1">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onChange(cat)}
              activeOpacity={0.7}
              className="px-4 py-2 rounded-xl"
              style={{
                backgroundColor: isActive
                  ? accent.hex
                  : theme.bgCard,
                borderWidth: isActive ? 0 : 1,
                borderColor: theme.border,
              }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{
                  color: isActive
                    ? (isDark ? "#0A0E15" : "#FFFFFF")
                    : theme.textMuted,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
