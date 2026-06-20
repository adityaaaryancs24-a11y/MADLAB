import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Clock, X, Trash2 } from "lucide-react-native";

type Props = {
  searches: string[];
  onTap: (term: string) => void;
  onClearAll: () => void;
};

export default function RecentSearches({
  searches,
  onTap,
  onClearAll,
}: Props) {
  if (searches.length === 0) return null;

  return (
    <View className="pt-2">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-2">
        <Text className="text-[12px] font-semibold text-white/40 uppercase tracking-widest">
          Recent
        </Text>
        <TouchableOpacity
          onPress={onClearAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center gap-1.5"
        >
          <Trash2 size={12} color="rgba(244,162,97,0.7)" />
          <Text className="text-[12px] text-[#F4A261]/70 font-medium">
            Clear all
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search items */}
      {searches.map((term, index) => (
        <TouchableOpacity
          key={`${term}-${index}`}
          onPress={() => onTap(term)}
          activeOpacity={0.6}
          className="flex-row items-center px-5 py-3.5 border-b border-white/[0.04]"
        >
          <View className="w-8 h-8 rounded-xl bg-white/[0.04] items-center justify-center mr-3">
            <Clock size={14} color="rgba(255,255,255,0.25)" />
          </View>
          <Text className="flex-1 text-[15px] text-white/70" numberOfLines={1}>
            {term}
          </Text>
          <View className="w-5 h-5 rounded-md bg-white/[0.04] items-center justify-center">
            <Text className="text-[9px] text-white/20">↗</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
