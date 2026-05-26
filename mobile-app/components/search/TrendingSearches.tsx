import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { TrendingUp, Sparkles } from "lucide-react-native";

type Props = {
  searches: string[];
  onTap: (term: string) => void;
};

export default function TrendingSearches({ searches, onTap }: Props) {
  return (
    <View className="pt-4">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-5 mb-3">
        <TrendingUp size={14} color="#2ECC71" />
        <Text className="text-[12px] font-semibold text-white/40 uppercase tracking-widest">
          Trending
        </Text>
      </View>

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {searches.map((term, index) => (
          <TouchableOpacity
            key={term}
            onPress={() => onTap(term)}
            activeOpacity={0.7}
            className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06]"
            style={{
              backgroundColor:
                index === 0
                  ? "rgba(46,204,113,0.08)"
                  : "rgba(255,255,255,0.03)",
            }}
          >
            {index === 0 && <Sparkles size={12} color="#2ECC71" />}
            <Text
              className="text-[13px] font-medium"
              style={{
                color:
                  index === 0
                    ? "rgba(46,204,113,0.9)"
                    : "rgba(255,255,255,0.5)",
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
