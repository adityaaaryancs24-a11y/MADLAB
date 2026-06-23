import React, { useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Animated,
} from "react-native";
import { Search, X, Mic } from "lucide-react-native";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
};

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  autoFocus,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const clearOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { theme, accent } = useAppTheme();

  useEffect(() => {
    Animated.timing(clearOpacity, {
      toValue: value.length > 0 ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handleFocus = () => {
    onFocus?.();
    Animated.spring(glowAnim, {
      toValue: 1,
      useNativeDriver: false,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const handleBlur = () => {
    onBlur?.();
    Animated.spring(glowAnim, {
      toValue: 0,
      useNativeDriver: false,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.border, accent.hex + "80"],
  });

  return (
    <View className="px-5 pt-2 pb-3">
      <Animated.View
        className="flex-row items-center rounded-2xl px-4 h-[52px] gap-3"
        style={{
          backgroundColor: theme.bgCardAlt,
          borderWidth: 1.5,
          borderColor,
        }}
      >
        <Search size={18} color={accent.hex} style={{ opacity: 0.8 }} />

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search products, brands, UPC..."
          placeholderTextColor={theme.textDim}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus={autoFocus}
          style={{ color: theme.text }}
          className="flex-1 text-[15px] py-0"
          clearButtonMode="never"
          selectionColor={accent.hex}
        />

        {/* Clear button */}
        <Animated.View style={{ opacity: clearOpacity }}>
          <TouchableOpacity
            onPress={() => {
              onClear();
              inputRef.current?.focus();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={{ backgroundColor: theme.border }} className="w-6 h-6 rounded-full items-center justify-center">
              <X size={12} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
