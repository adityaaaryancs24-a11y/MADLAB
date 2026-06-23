import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { Zap, Sparkles, Shield } from "lucide-react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
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

function AnimatedChartBackground() {
  const pulseAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.2,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: pulseAnim,
        zIndex: 0,
      }}
      pointerEvents="none"
    >
      <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#2ECC71" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#2ECC71" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path
          d="M 0 100 L 0 65 Q 25 55, 45 75 T 85 45 T 100 30 L 100 100 Z"
          fill="url(#grad)"
        />
        <Path
          d="M 0 65 Q 25 55, 45 75 T 85 45 T 100 30"
          fill="none"
          stroke="#2ECC71"
          strokeWidth="1.5"
        />
      </Svg>
    </Animated.View>
  );
}

function TypewriterText({ text, style, className }: { text: string; style?: any; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <Text style={style} className={className}>
      {displayedText}
    </Text>
  );
}

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
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* Pulsing glow background chart (approx 30% opacity) */}
      <AnimatedChartBackground />

      {/* Skip Button */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 24, paddingTop: 16, zIndex: 10 }}>
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            backgroundColor: theme.bgCardAlt,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: theme.textMuted, fontWeight: "600" }}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, zIndex: 10 }}>
        {/* Icon */}
        <View style={{ marginBottom: 40 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: currentColor,
            }}
          >
            <CurrentIcon size={60} color="#0A0E15" />
          </View>
        </View>

        {/* Title */}
        <View style={{ minHeight: 48, justifyContent: "center", marginBottom: 12 }}>
          <TypewriterText
            text={slides[currentSlide].title}
            style={{ color: theme.text, fontSize: 32, fontWeight: "bold", textAlign: "center" }}
          />
        </View>

        {/* Subtitle */}
        <View style={{ minHeight: 56, justifyContent: "center", marginBottom: 12 }}>
          <TypewriterText
            text={slides[currentSlide].subtitle}
            style={{ color: theme.text, fontSize: 18, fontWeight: "600", textAlign: "center", paddingHorizontal: 16 }}
          />
        </View>

        {/* Description */}
        <View style={{ minHeight: 64, justifyContent: "center" }}>
          <TypewriterText
            text={slides[currentSlide].description}
            style={{ color: theme.textMuted, fontSize: 15, textAlign: "center", paddingHorizontal: 24 }}
          />
        </View>
      </View>

      {/* Bottom Section */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 40, zIndex: 10 }}>
        {/* Dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 32 }}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentSlide(index)}
              style={{
                width: index === currentSlide ? 32 : 8,
                height: 8,
                borderRadius: 4,
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
          style={{
            width: "100%",
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
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
            style={{
              color:
                currentSlide === slides.length - 1
                  ? isDark
                    ? "#0A0E15"
                    : "#FFFFFF"
                  : theme.text,
              fontWeight: "bold",
              fontSize: 18,
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