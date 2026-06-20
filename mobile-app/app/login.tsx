import { useState, useEffect } from "react";
import { Alert, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Mail, Lock, User, Eye, EyeOff, Zap, Sparkles } from "lucide-react-native";
import { useApp } from "../src/context/AppContext";

export default function Login() {
  const { login, register, isAuthenticated, isAuthLoading } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.password) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return;
    }

    if (isSignUp && !formData.name.trim()) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
        router.replace("/onboarding");
        return;
      }

      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Authentication failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0E15]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32 }}>
        <View className="items-center mt-12 mb-10">
          <View className="flex-row items-center justify-center gap-3 mb-4">
            <View className="w-14 h-14 rounded-2xl bg-[#2ECC71] items-center justify-center">
              <Zap size={28} color="#0A0E15" fill="currentColor" />
            </View>
            <Text className="font-bold text-white text-[42px] tracking-tight">Verity</Text>
          </View>
          <Text className="text-base text-white/70 font-medium">
            Scan the Barcode. See the Real Price.
          </Text>
        </View>

        <View className="flex-row gap-2 mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/10">
          <TouchableOpacity
            onPress={() => setIsSignUp(false)}
            className={`flex-1 py-3.5 rounded-xl items-center ${!isSignUp ? "bg-[#2ECC71]" : ""}`}
          >
            <Text className={`font-semibold ${!isSignUp ? "text-[#0A0E15]" : "text-white/50"}`}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsSignUp(true)}
            className={`flex-1 py-3.5 rounded-xl items-center ${isSignUp ? "bg-[#2ECC71]" : ""}`}
          >
            <Text className={`font-semibold ${isSignUp ? "text-[#0A0E15]" : "text-white/50"}`}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-5">
          {isSignUp && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white/80 mb-2">Full Name</Text>
              <View className="relative justify-center">
                <View className="absolute left-4 z-10">
                  <User size={20} color="rgba(255,255,255,0.4)" />
                </View>
                <TextInput
                  value={formData.name}
                  onChangeText={(val) => handleChange("name", val)}
                  placeholder="John Doe"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  editable={!isSubmitting}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white"
                />
              </View>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-sm font-semibold text-white/80 mb-2">Email</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Mail size={20} color="rgba(255,255,255,0.4)" />
              </View>
              <TextInput
                value={formData.email}
                onChangeText={(val) => handleChange("email", val)}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-white/80 mb-2">Password</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Lock size={20} color="rgba(255,255,255,0.4)" />
              </View>
              <TextInput
                value={formData.password}
                onChangeText={(val) => handleChange("password", val)}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isSubmitting}
                className="w-full pl-12 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-white"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 z-10"
              >
                {showPassword ? (
                  <EyeOff size={20} color="rgba(255,255,255,0.4)" />
                ) : (
                  <Eye size={20} color="rgba(255,255,255,0.4)" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 mt-4 bg-[#2ECC71] rounded-2xl shadow-xl flex-row items-center justify-center gap-2"
          >
            <Sparkles size={20} color="#0A0E15" />
            <Text className="text-[#0A0E15] font-bold">
              {isSubmitting ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Text>
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity
              className="mt-4"
              onPress={() => Alert.alert("Password reset", "Password reset is not available yet.")}
            >
              <Text className="text-center text-sm text-white/50">
                Forgot your password?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
