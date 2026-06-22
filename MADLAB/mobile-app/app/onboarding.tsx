import { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Zap, Sparkles, Shield } from "lucide-react-native";

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
    subtitle: "Compare prices across all major retailers",
    icon: Sparkles,
    description: "Amazon, eBay, Walmart, Target and 20+ more",
    color: "#F4A261",
  },
  {
    title: "Never Overpay Again.",
    subtitle: "Track prices and get instant alerts",
    icon: Shield,
    description: "Save money on every purchase, guaranteed",
    color: "#60A5FA",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
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
    <SafeAreaView className="flex-1 bg-[#0A0E15]">
      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-6 z-10">
        <TouchableOpacity
          onPress={handleSkip}
          className="px-5 py-2 rounded-xl bg-white/5 border border-white/10"
        >
          <Text className="text-white/70">Skip</Text>
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
          <Text className="text-4xl font-bold text-white mb-4">
            {slides[currentSlide].title}
          </Text>

          {/* Subtitle */}
          <Text className="text-xl text-white/80 mb-3 font-medium text-center">
            {slides[currentSlide].subtitle}
          </Text>

          {/* Description */}
          <Text className="text-base text-white/50 text-center">
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
                backgroundColor: index === currentSlide ? currentColor : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="w-full py-5 rounded-2xl items-center shadow-2xl"
          style={{
            backgroundColor: currentSlide === slides.length - 1 ? "#2ECC71" : "rgba(255,255,255,0.1)",
          }}
        >
          <Text
            className="font-bold text-lg"
            style={{ color: currentSlide === slides.length - 1 ? "#0A0E15" : "white" }}
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
