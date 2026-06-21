import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  Check,
  X,
} from "lucide-react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../src/config/firebase";
import { useApp } from "../src/context/AppContext";

// ── Password validation ────────────────────────────────────────────────────

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 0 | 1 | 2 | 3; // 0=empty 1=weak 2=medium 3=strong
  rules: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

function validatePassword(password: string): PasswordValidation {
  const rules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const passedCount = Object.values(rules).filter(Boolean).length;
  const errors: string[] = [];
  if (!rules.minLength) errors.push("At least 8 characters");
  if (!rules.hasUppercase) errors.push("One uppercase letter");
  if (!rules.hasLowercase) errors.push("One lowercase letter");
  if (!rules.hasNumber) errors.push("One number");
  if (!rules.hasSpecial) errors.push("One special character");

  let strength: 0 | 1 | 2 | 3 = 0;
  if (password.length === 0) strength = 0;
  else if (passedCount <= 2) strength = 1;
  else if (passedCount <= 4) strength = 2;
  else strength = 3;

  return { isValid: passedCount === 5, errors, strength, rules };
}

const STRENGTH_CONFIG = {
  0: { label: "", color: "transparent", width: "0%" },
  1: { label: "Weak", color: "#EF4444", width: "33%" },
  2: { label: "Medium", color: "#F59E0B", width: "66%" },
  3: { label: "Strong", color: "#4ADE80", width: "100%" },
} as const;

// ── Firebase error → human-readable message ─────────────────────────────────

function mapFirebaseError(error: FirebaseError, isSignUp: boolean): string {
  switch (error.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect password. Please try again.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    default:
      return isSignUp
        ? "Sign up failed. Please try again."
        : "Sign in failed. Please check your credentials.";
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Login() {
  const { login, isAuthenticated, isReady } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Inline error state ───────────────────────────────────────────────────
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Animated strength bar width
  const strengthAnim = useRef(new Animated.Value(0)).current;
  const rulesOpacity = useRef(new Animated.Value(0)).current;

  // On cold start: if there is a stored session, skip the login screen.
  // On logout: isAuthenticated is false so this does nothing — the redirect
  // back here is driven by the guard in app/(tabs)/_layout.tsx.
  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isReady, isAuthenticated]);

  const validation = validatePassword(formData.password);
  const passwordsMatch =
    formData.confirmPassword.length === 0 ||
    formData.password === formData.confirmPassword;
  const confirmMismatch =
    isSignUp &&
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  // Sign-up requires all password rules + matching confirmation + non-empty email.
  // Login only requires non-empty email + non-empty password (Firebase validates the rest).
  const canSubmit = isSignUp
    ? validation.isValid &&
      formData.password === formData.confirmPassword &&
      formData.email.length > 0 &&
      !isLoading
    : formData.email.length > 0 &&
      formData.password.length >= 6 &&
      !isLoading;

  // Animate strength bar when password changes
  useEffect(() => {
    const target = validation.strength / 3; // 0..1
    Animated.spring(strengthAnim, {
      toValue: target,
      useNativeDriver: false,
      tension: 60,
      friction: 8,
    }).start();
  }, [validation.strength]);

  // Show/hide rules checklist when user starts typing password in sign-up mode
  useEffect(() => {
    if (isSignUp && passwordTouched) {
      Animated.timing(rulesOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(rulesOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isSignUp, passwordTouched]);

  const clearErrors = () => {
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "password") setPasswordTouched(true);
    // Clear field-specific error when user starts typing
    if (field === "email") setEmailError(null);
    if (field === "password") setPasswordError(null);
    setGeneralError(null);
  };

  // ── Frontend guard: minimum password length before hitting Firebase ────────
  const validateBeforeSubmit = (): boolean => {
    clearErrors();

    if (!formData.email.trim()) {
      setEmailError("Please enter your email address.");
      return false;
    }

    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return false;
    }

    if (isSignUp && confirmMismatch) {
      setGeneralError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!validateBeforeSubmit()) return;

    setIsLoading(true);
    clearErrors();

    try {
      if (isSignUp) {
        // ── Sign Up ─────────────────────────────────────────────────────────
        const credential = await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );

        // Save display name to Firebase profile
        const displayName = formData.name.trim() || formData.email.split("@")[0];
        await updateProfile(credential.user, { displayName });

        // Map Firebase user → AppContext User
        login({
          id: credential.user.uid,
          name: displayName,
          email: credential.user.email ?? formData.email,
          avatar: credential.user.photoURL ?? undefined,
        });

        router.replace("/onboarding");
      } else {
        // ── Sign In ─────────────────────────────────────────────────────────
        const credential = await signInWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );

        const displayName =
          credential.user.displayName ||
          credential.user.email?.split("@")[0] ||
          "User";

        // Map Firebase user → AppContext User
        login({
          id: credential.user.uid,
          name: displayName,
          email: credential.user.email ?? formData.email,
          avatar: credential.user.photoURL ?? undefined,
        });

        router.replace("/(tabs)/home");
      }
    } catch (err) {
      const firebaseErr = err as FirebaseError;

      // Route the error to the correct field
      const code = firebaseErr.code ?? "";
      const message = mapFirebaseError(firebaseErr, isSignUp);

      if (
        code === "auth/invalid-email" ||
        code === "auth/user-not-found" ||
        code === "auth/email-already-in-use"
      ) {
        setEmailError(message);
      } else if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/weak-password"
      ) {
        setPasswordError(message);
      } else {
        setGeneralError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (signup: boolean) => {
    setIsSignUp(signup);
    setPasswordTouched(false);
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    clearErrors();
  };

  const strengthCfg = STRENGTH_CONFIG[validation.strength];

  return (
    <SafeAreaView className="flex-1 bg-[#0A0E15]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
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

        {/* ── Tab switcher ────────────────────────────────────────────────── */}
        <View className="flex-row gap-2 mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/10">
          <TouchableOpacity
            onPress={() => switchTab(false)}
            className={`flex-1 py-3.5 rounded-xl items-center ${!isSignUp ? "bg-[#2ECC71]" : ""}`}
          >
            <Text className={`font-semibold ${!isSignUp ? "text-[#0A0E15]" : "text-white/50"}`}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchTab(true)}
            className={`flex-1 py-3.5 rounded-xl items-center ${isSignUp ? "bg-[#2ECC71]" : ""}`}
          >
            <Text className={`font-semibold ${isSignUp ? "text-[#0A0E15]" : "text-white/50"}`}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <View className="space-y-5">
          {/* Name (sign-up only) */}
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
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white"
                />
              </View>
            </View>
          )}

          {/* Email */}
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
                className={`w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl text-white border ${
                  emailError ? "border-red-500/60" : "border-white/10"
                }`}
              />
            </View>
            {emailError && (
              <Text className="text-red-400 text-xs mt-1.5 ml-1 font-medium">{emailError}</Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-sm font-semibold text-white/80 mb-2">Password</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Lock size={20} color="rgba(255,255,255,0.4)" />
              </View>
              <TextInput
                value={formData.password}
                onChangeText={(val) => handleChange("password", val)}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className={`w-full pl-12 pr-14 py-4 bg-white/5 rounded-2xl text-white border ${
                  passwordError ? "border-red-500/60" : "border-white/10"
                }`}
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

            {/* Inline password error */}
            {passwordError && (
              <Text className="text-red-400 text-xs mt-1.5 ml-1 font-medium">{passwordError}</Text>
            )}

            {/* Strength bar (sign-up only) */}
            {isSignUp && passwordTouched && (
              <View className="mt-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                    Password Strength
                  </Text>
                  {validation.strength > 0 && (
                    <Text
                      style={{ color: strengthCfg.color }}
                      className="text-[10px] font-bold uppercase tracking-wider"
                    >
                      {strengthCfg.label}
                    </Text>
                  )}
                </View>
                {/* Track */}
                <View
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <Animated.View
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      backgroundColor: strengthCfg.color,
                      width: strengthAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    }}
                  />
                </View>
              </View>
            )}

            {/* Rules checklist (animated in) */}
            {isSignUp && (
              <Animated.View style={{ opacity: rulesOpacity }} className="mt-3 gap-1.5">
                {(
                  [
                    ["minLength", "At least 8 characters"],
                    ["hasUppercase", "One uppercase letter (A–Z)"],
                    ["hasLowercase", "One lowercase letter (a–z)"],
                    ["hasNumber", "One number (0–9)"],
                    ["hasSpecial", "One special character (!@#$%…)"],
                  ] as [keyof typeof validation.rules, string][]
                ).map(([key, label]) => {
                  const passed = validation.rules[key];
                  return (
                    <View key={key} className="flex-row items-center gap-2">
                      {passed ? (
                        <Check size={13} color="#4ADE80" />
                      ) : (
                        <X size={13} color="#EF4444" />
                      )}
                      <Text
                        style={{ color: passed ? "#4ADE80" : "rgba(255,255,255,0.45)" }}
                        className="text-[12px] font-medium"
                      >
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </Animated.View>
            )}
          </View>

          {/* Confirm password (sign-up only) */}
          {isSignUp && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-white/80 mb-2">Confirm Password</Text>
              <View className="relative justify-center">
                <View className="absolute left-4 z-10">
                  <Lock size={20} color="rgba(255,255,255,0.4)" />
                </View>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(val) => handleChange("confirmPassword", val)}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  className={`w-full pl-12 pr-14 py-4 bg-white/5 rounded-2xl text-white border ${
                    confirmMismatch ? "border-red-500/60" : "border-white/10"
                  }`}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 z-10"
                >
                  {showConfirm ? (
                    <EyeOff size={20} color="rgba(255,255,255,0.4)" />
                  ) : (
                    <Eye size={20} color="rgba(255,255,255,0.4)" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmMismatch && (
                <Text className="text-red-400 text-xs mt-1.5 ml-1 font-medium">
                  Passwords don't match
                </Text>
              )}
            </View>
          )}

          {/* General / network error */}
          {generalError && (
            <View className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
              <Text className="text-red-400 text-sm font-medium text-center">{generalError}</Text>
            </View>
          )}

          {/* ── Submit ──────────────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.4 }}
            className="w-full py-4 mt-4 bg-[#2ECC71] rounded-2xl shadow-xl flex-row items-center justify-center gap-2"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#0A0E15" />
            ) : (
              <>
                <Sparkles size={20} color="#0A0E15" />
                <Text className="text-[#0A0E15] font-bold">
                  {isSignUp ? "Create Account" : "Sign In"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity className="mt-4">
              <Text className="text-center text-sm text-white/50">
                Forgot your password?
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Social ──────────────────────────────────────────────────────── */}
          <View className="mt-10">
            <View className="relative mb-6">
              <View className="border-t border-white/10" />
              <View className="absolute inset-0 items-center justify-center -top-3 left-0 right-0">
                <Text className="px-4 bg-[#0A0E15] text-white/50 text-xs">Or continue with</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-2xl items-center">
                <Text className="text-white/70 font-semibold">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-2xl items-center">
                <Text className="text-white/70 font-semibold">Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
