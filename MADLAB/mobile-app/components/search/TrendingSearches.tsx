import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { TrendingUp, Sparkles } from "lucide-react-native";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  searches: string[];
  onTap: (term: string) => void;
};

export default function TrendingSearches({ searches, onTap }: Props) {
  const { theme, accent } = useAppTheme();

  return (
    <View className="pt-4">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-5 mb-3">
        <TrendingUp size={14} color={accent.hex} />
        <Text style={{ color: theme.textMuted }} className="text-[12px] font-semibold uppercase tracking-widest">
          Trending
        </Text>
      </View>

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {searches.map((term, index) => (
          <TouchableOpacity
            key={term}
            onPress={() => onTap(term)}
            activeOpacity={0.7}
            className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{
              backgroundColor:
                index === 0
                  ? accent.hexLight + "1c"
                  : theme.bgCard,
              borderColor:
                index === 0
                  ? accent.hexLight + "33"
                  : theme.border,
            }}
          >
            {index === 0 && <Sparkles size={12} color={accent.hex} />}
            <Text
              className="text-[13px] font-medium"
              style={{
                color:
                  index === 0
                    ? accent.hex
                    : theme.textMuted,
              }}
            >
              {term}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
