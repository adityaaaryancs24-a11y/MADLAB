import { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Zap, Sparkles, Shield } from "lucide-react-native";
import { useAppTheme } from "../src/hooks/useAppTheme";

const slides = [
  {
    title: "Meet Verity.",
    subtitle: "Scan the Barcode. See the Real Price.",
    icon: Zap,
    description: "Your intelligent companion for shopping",
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
      router.replace("/(tabs)" as any);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)" as any);
  };

  return (
    <SafeAreaView style={{ backgroundColor: theme.bg }} className="flex-1">
      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-6 z-10">
        <TouchableOpacity
          onPress={handleSkip}
          style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
          className="px-5 py-2 rounded-xl border"
        >
          <Text style={{ color: theme.textMuted }}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <View className="flex-1 items-center justify-center px-8 z-10">
        <View className="items-center text-center">
          {/* Icon */}
          <View className="mb-12 relative items-center justify-center">
            <View
              className="w-40 h-40 rounded-3xl items-center justify-center shadow-2xl"
              style={{ backgroundColor: currentColor }}
            >
              <CurrentIcon size={80} color="#0A0E15" />
            </View>
          </View>

          {/* Title */}
          <Text style={{ color: theme.text }} className="text-4xl font-bold mb-4">
            {slides[currentSlide].title}
          </Text>

          {/* Subtitle */}
          <Text style={{ color: theme.text }} className="text-xl mb-3 font-medium text-center opacity-85">
            {slides[currentSlide].subtitle}
          </Text>

          {/* Description */}
          <Text style={{ color: theme.textMuted }} className="text-base text-center">
            {slides[currentSlide].description}
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View className="pb-12 px-8 z-10">
        {/* Page Dots */}
        <View className="flex-row justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentSlide(index)}
              className="h-2 rounded-full"
              style={{
                width: index === currentSlide ? 40 : 8,
                backgroundColor: index === currentSlide ? currentColor : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"),
              }}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="w-full py-5 rounded-2xl items-center shadow-2xl"
          style={{
            backgroundColor: currentSlide === slides.length - 1 ? accent.hex : theme.bgCardAlt,
            borderColor: theme.border,
            borderWidth: currentSlide === slides.length - 1 ? 0 : 1
          }}
        >
          <Text
            className="font-bold text-lg"
            style={{ color: currentSlide === slides.length - 1 ? (isDark ? "#0A0E15" : "#FFFFFF") : theme.text }}
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
