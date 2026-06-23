import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Zap, Sparkles, Shield } from "lucide-react-native";
import { useAppTheme } from "../src/hooks/useAppTheme";

const slides = [
  {
    title: "Meet Verity.",
    subtitle: "Scan the Barcode. See the Real Price.",
    icon: Zap,
    description: "Your intelligent companion for fearless shopping",
    color: "#2ECC71",
  },
  {
    title: "Instant Price Intel.",
    subtitle: "Compare prices across major retailers",
    icon: Sparkles,
    description: "Amazon, Flipkart, Blinkit, Zepto and more",
    color: "#F4A261",
  },
  {
    title: "Never Overpay Again.",
    subtitle: "Track prices and get alerts",
    icon: Shield,
    description: "Save money on every purchase",
    color: "#60A5FA",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, accent, isDark } = useAppTheme();

  const CurrentIcon = slides[currentSlide].icon;
  const currentColor = slides[currentSlide].color;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.bg }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-4">
        <TouchableOpacity
          onPress={handleSkip}
          className="px-4 py-2 rounded-xl border"
          style={{
            backgroundColor: theme.bgCardAlt,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: theme.textMuted }}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Icon */}
        <View className="mb-10">
          <View
            className="w-32 h-32 rounded-3xl items-center justify-center"
            style={{
              backgroundColor: currentColor,
            }}
          >
            <CurrentIcon size={64} color="#0A0E15" />
          </View>
        </View>

        {/* Title */}
        <Text
          className="text-3xl font-bold text-center mb-4"
          style={{ color: theme.text }}
        >
          {slides[currentSlide].title}
        </Text>

        {/* Subtitle */}
        <Text
          className="text-lg text-center font-medium mb-3 px-4"
          style={{ color: theme.text }}
        >
          {slides[currentSlide].subtitle}
        </Text>

        {/* Description */}
        <Text
          className="text-base text-center px-8"
          style={{ color: theme.textMuted }}
        >
          {slides[currentSlide].description}
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="px-8 pb-10">
        {/* Dots */}
        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentSlide(index)}
              style={{
                width: index === currentSlide ? 32 : 8,
                height: 8,
                borderRadius: 999,
                marginHorizontal: 4,
                backgroundColor:
                  index === currentSlide
                    ? currentColor
                    : isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="w-full py-4 rounded-2xl items-center"
          style={{
            backgroundColor:
              currentSlide === slides.length - 1
                ? accent.hex
                : theme.bgCardAlt,
            borderColor: theme.border,
            borderWidth:
              currentSlide === slides.length - 1 ? 0 : 1,
          }}
        >
          <Text
            className="font-bold text-lg"
            style={{
              color:
                currentSlide === slides.length - 1
                  ? isDark
                    ? "#0A0E15"
                    : "#FFFFFF"
                  : theme.text,
            }}
          >
            {currentSlide === slides.length - 1
              ? "Get Started"
              : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}