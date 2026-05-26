import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

type Props = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
};

export default function CategoryFilters({ categories, active, onChange }: Props) {
  return (
    <View className="pt-1 pb-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
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
                  ? "#2ECC71"
                  : "rgba(255,255,255,0.04)",
                borderWidth: isActive ? 0 : 1,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{
                  color: isActive ? "#0A0E15" : "rgba(255,255,255,0.45)",
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
