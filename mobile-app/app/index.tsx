import { useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react-native";
import { useApp } from "../src/context/AppContext";

export default function Welcome() {
  const { isAuthenticated, isAuthLoading } = useApp();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isAuthLoading]);

  return (
    <SafeAreaView className="flex-1 bg-[#0A0E15]">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-40 h-40 rounded-3xl bg-[#2ECC71] items-center justify-center shadow-2xl mb-10">
          <Zap size={80} color="#0A0E15" fill="currentColor" />
        </View>

        <Text className="text-sm font-bold uppercase tracking-[6px] text-[#2ECC71] mb-3">
          Welcome to
        </Text>
        <Text className="text-white text-6xl font-bold tracking-tight mb-5">
          Verity
        </Text>
        <Text className="text-xl text-white/80 font-medium mb-3 text-center">
          Scan the Barcode. See the Real Price.
        </Text>
        <Text className="text-base text-white/50 text-center max-w-xs">
          Sign in to compare prices, save scans, and track better deals across your shopping history.
        </Text>
      </View>

      <View className="px-8 pb-10 gap-4">
        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="w-full py-5 bg-[#2ECC71] rounded-2xl shadow-2xl flex-row items-center justify-center gap-2"
        >
          <Sparkles size={20} color="#0A0E15" />
          <Text className="text-[#0A0E15] font-bold">Continue to Login</Text>
          <ArrowRight size={20} color="#0A0E15" />
        </TouchableOpacity>
        <View className="flex-row items-center justify-center gap-2">
          <ShieldCheck size={16} color="#2ECC71" />
          <Text className="text-xs text-white/40">JWT-secured Verity session</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
