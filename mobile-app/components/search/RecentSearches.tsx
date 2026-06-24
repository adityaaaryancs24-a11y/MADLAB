import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Clock, X, Trash2 } from "lucide-react-native";
import { useAppTheme } from "@/src/hooks/useAppTheme";

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
  const { theme, accent } = useAppTheme();

  if (searches.length === 0) return null;

  return (
    <View className="pt-2">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-2">
        <Text style={{ color: theme.textMuted }} className="text-[12px] font-semibold uppercase tracking-widest">
          Recent
        </Text>
        <TouchableOpacity
          onPress={onClearAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center gap-1.5"
        >
          <Trash2 size={12} color="#EF4444" style={{ opacity: 0.8 }} />
          <Text style={{ color: "#EF4444" }} className="text-[12px] font-medium opacity-80">
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
          className="flex-row items-center px-5 py-3.5 border-b"
          style={{ borderBottomColor: theme.border }}
        >
          <View style={{ backgroundColor: theme.bgCardAlt }} className="w-8 h-8 rounded-xl items-center justify-center mr-3">
            <Clock size={14} color={theme.textDim} />
          </View>
          <Text style={{ color: theme.text }} className="flex-1 text-[15px]" numberOfLines={1}>
            {term}
          </Text>
          <View style={{ backgroundColor: theme.bgCardAlt }} className="w-5 h-5 rounded-md items-center justify-center">
            <Text style={{ color: theme.textDim }} className="text-[9px]">↗</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
