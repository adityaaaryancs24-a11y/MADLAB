import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Mail, Lock, User, Eye, EyeOff, Zap, Sparkles } from "lucide-react-native";
import { useApp } from "../src/context/AppContext";
import { useAppTheme } from "../src/hooks/useAppTheme";

export default function Login() {
  const { login, signup, isAuthenticated, isAuthLoading } = useApp();
  const { theme, accent, isDark } = useAppTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated]);

  if (isAuthLoading) {
    return (
      <SafeAreaView style={{ backgroundColor: theme.bg }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={accent.hex} />
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (isSignUp) {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
          throw new Error("All fields are required");
        }
        await signup(formData.name.trim(), formData.email.trim(), formData.password);
        router.replace("/onboarding");
      } else {
        if (!formData.email.trim() || !formData.password.trim()) {
          throw new Error("Email and password are required");
        }
        await login(formData.email.trim(), formData.password);
        router.replace("/(tabs)" as any);
      }
    } catch (err: any) {
      console.warn("Auth error:", err);
      let cleanMsg = err.message || "An authentication error occurred. Please try again.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        cleanMsg = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/email-already-in-use") {
        cleanMsg = "This email is already registered. Try logging in instead.";
      } else if (err.code === "auth/weak-password") {
        cleanMsg = "Password must be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        cleanMsg = "Please enter a valid email address.";
      }
      setErrorMessage(cleanMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={{ backgroundColor: theme.bg }} className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32 }}>
        {/* Header */}
        <View className="items-center mt-12 mb-10">
          <View className="flex-row items-center justify-center gap-3 mb-4">
            <View style={{ backgroundColor: accent.hex }} className="w-14 h-14 rounded-2xl items-center justify-center">
              <Zap size={28} color={isDark ? "#0A0E15" : "#FFFFFF"} fill="currentColor" />
            </View>
            <Text style={{ color: theme.text }} className="font-bold text-[42px] tracking-tight">Verity</Text>
          </View>
          <Text style={{ color: theme.textMuted }} className="text-base font-medium">
            Scan the Barcode. See the Real Price.
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="flex-row gap-2 mb-8 p-1.5 rounded-2xl border">
          <TouchableOpacity
            onPress={() => setIsSignUp(false)}
            style={{
              backgroundColor: !isSignUp ? accent.hex : "transparent"
            }}
            className="flex-1 py-3.5 rounded-xl items-center"
          >
            <Text
              style={{ color: !isSignUp ? (isDark ? "#0A0E15" : "#FFFFFF") : theme.textMuted }}
              className="font-semibold"
            >
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsSignUp(true)}
            style={{
              backgroundColor: isSignUp ? accent.hex : "transparent"
            }}
            className="flex-1 py-3.5 rounded-xl items-center"
          >
            <Text
              style={{ color: isSignUp ? (isDark ? "#0A0E15" : "#FFFFFF") : theme.textMuted }}
              className="font-semibold"
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View className="space-y-5">
          {errorMessage && (
            <View className="bg-red-500/10 border border-red-500/25 p-4 rounded-2xl mb-4">
              <Text className="text-red-500 text-center text-sm font-semibold">{errorMessage}</Text>
            </View>
          )}

          {isSignUp && (
            <View className="mb-4">
              <Text style={{ color: theme.textMuted }} className="text-sm font-semibold mb-2">Full Name</Text>
              <View className="relative justify-center">
                <View className="absolute left-4 z-10">
                  <User size={20} color={theme.textDim} />
                </View>
                <TextInput
                  value={formData.name}
                  onChangeText={(val) => handleChange("name", val)}
                  placeholder="John Doe"
                  placeholderTextColor={theme.textDim}
                  style={{ color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                  className="w-full pl-12 pr-4 py-4 border rounded-2xl"
                />
              </View>
            </View>
          )}

          <View className="mb-4">
            <Text style={{ color: theme.textMuted }} className="text-sm font-semibold mb-2">Email</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Mail size={20} color={theme.textDim} />
              </View>
              <TextInput
                value={formData.email}
                onChangeText={(val) => handleChange("email", val)}
                placeholder="you@example.com"
                placeholderTextColor={theme.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                className="w-full pl-12 pr-4 py-4 border rounded-2xl"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text style={{ color: theme.textMuted }} className="text-sm font-semibold mb-2">Password</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Lock size={20} color={theme.textDim} />
              </View>
              <TextInput
                value={formData.password}
                onChangeText={(val) => handleChange("password", val)}
                placeholder="••••••••"
                placeholderTextColor={theme.textDim}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={{ color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                className="w-full pl-12 pr-14 py-4 border rounded-2xl"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 z-10"
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textDim} />
                ) : (
                  <Eye size={20} color={theme.textDim} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={{ backgroundColor: accent.hex, opacity: isLoading ? 0.7 : 1 }}
            className="w-full py-4 mt-4 rounded-2xl shadow-xl flex-row items-center justify-center gap-2"
          >
            {isLoading ? (
              <ActivityIndicator color={isDark ? "#0A0E15" : "#FFFFFF"} />
            ) : (
              <>
                <Sparkles size={20} color={isDark ? "#0A0E15" : "#FFFFFF"} />
                <Text style={{ color: isDark ? "#0A0E15" : "#FFFFFF" }} className="font-bold">
                  {isSignUp ? "Create Account" : "Sign In"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity className="mt-4">
              <Text style={{ color: theme.textMuted }} className="text-center text-sm">
                Forgot your password?
              </Text>
            </TouchableOpacity>
          )}

          {/* Social */}
          <View className="mt-10">
            <View className="relative mb-6">
              <View style={{ borderTopColor: theme.border }} className="border-t" />
              <View className="absolute insert-0 items-center justify-center -top-3 left-0 right-0">
                <Text style={{ color: theme.textMuted, backgroundColor: theme.bg }} className="px-4 text-xs">
                  Or continue with
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                className="flex-1 py-3.5 border rounded-2xl items-center"
              >
                <Text style={{ color: theme.text }} className="font-semibold">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                className="flex-1 py-3.5 border rounded-2xl items-center"
              >
                <Text style={{ color: theme.text }} className="font-semibold">Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
