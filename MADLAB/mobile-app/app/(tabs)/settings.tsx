import { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Switch,
  Alert,
  Modal,
  Platform
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useApp } from "../../src/context/AppContext";
import { useAppTheme } from "../../src/hooks/useAppTheme";
import {
  ArrowLeft,
  Store,
  Volume2,
  Trash2,
  ChevronRight,
  Bell,
  Moon,
  LogOut,
  User as UserIcon,
  TrendingDown,
  Zap,
  Sparkles,
  Palette,
  Database,
  Accessibility as AccessIcon,
  Check,
  Sun,
  Monitor,
  Download,
  KeyRound,
  AlertTriangle,
  Eye,
  EyeOff,
  ImageIcon,
  IndianRupee,
  Calendar,
  Globe,
  Activity,
  Edit,
  Shield,
  Heart
} from "lucide-react-native";

// Predefined Avatars — Dicebear Bottts (computer-generated robot icons)
const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/bottts/png?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/png?seed=Aneka",
  "https://api.dicebear.com/7.x/bottts/png?seed=Elmo",
  "https://api.dicebear.com/7.x/bottts/png?seed=Jack",
];

// Helper to play sound
const playSound = (type: "chime" | "beep") => {
  if (Platform.OS === "web" && typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === "beep") {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.log("Web audio play failed", e);
    }
  } else {
    console.log("Synthesized sound played on device:", type);
  }
};

// Helper for Screen Reader Text-To-Speech announcement
const speakText = (text: string) => {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } else {
    console.log("Speech announced on device:", text);
  }
};

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { fontScale, theme, accent, isDark } = useAppTheme();
  const scaledText = (baseSize: number) => ({ fontSize: baseSize * fontScale });

  const {
    settings,
    updateSettings,
    user,
    updateUserProfile,
    deleteAccount,
    logout,
    clearHistory,
    clearSearchHistory,
    clearWatchlist,
    scanHistory,
    watchlist,
    searchHistory
  } = useApp();

  const currentUser = user || {
    id: "guest_1204",
    name: "Guest Explorer",
    email: "guest@verity.app",
    avatar: AVATAR_OPTIONS[0],
    membershipTier: "Free"
  };

  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [passwordForm, setPasswordForm] = useState({ old: "", new: "" });
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar || AVATAR_OPTIONS[0]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; isError?: boolean }>({
    visible: false,
    title: "",
    message: "",
    isError: false
  });

  const showAlert = (title: string, message: string, isError = false) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      isError
    });
  };

  // Sync profile details when user state loads
  useEffect(() => {
    const activeUser = user || {
      id: "guest_1204",
      name: "Guest Explorer",
      email: "guest@verity.app",
      avatar: AVATAR_OPTIONS[0],
      membershipTier: "Free"
    };
    setProfileName(activeUser.name);
    setProfileEmail(activeUser.email);
    if (activeUser.avatar) setSelectedAvatar(activeUser.avatar);
  }, [user]);

  // Dynamic LocalStorage metrics
  const [storageSize, setStorageSize] = useState("0.00");
  useEffect(() => {
    let totalBytes = 0;
    // Simple mock estimation of storage since localStorage is AsyncStorage on device
    totalBytes += (JSON.stringify(scanHistory).length || 0);
    totalBytes += (JSON.stringify(watchlist).length || 0);
    totalBytes += (JSON.stringify(searchHistory).length || 0);
    totalBytes += (JSON.stringify(settings).length || 0);
    setStorageSize((totalBytes / 1024).toFixed(2));
  }, [scanHistory, watchlist, searchHistory, user]);

  // Haptic feedback trigger
  const triggerHaptic = async () => {
    try {
      if (settings.hapticFeedback && Haptics && Haptics.notificationAsync && Haptics.NotificationFeedbackType) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.log("Haptics failed", e);
    }
  };

  // Handle single toggle settings updates
  const handleToggleSetting = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
    triggerHaptic();
  };

  const handleToggleStore = (storeKey: string) => {
    const newStores = {
      ...settings.preferredStores,
      [storeKey]: !settings.preferredStores[storeKey],
    };
    updateSettings({ preferredStores: newStores });
    triggerHaptic();
  };

  // Actions
  const handleSaveProfile = () => {
    updateUserProfile({ name: profileName, email: profileEmail, avatar: selectedAvatar });
    triggerHaptic();
    showAlert("Success", "Profile details updated!");
  };

  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url);
    updateUserProfile({ avatar: url });
    triggerHaptic();
  };

  const handlePasswordChange = () => {
    if (!passwordForm.old || !passwordForm.new) {
      showAlert("Error", "Please fill in both fields", true);
      return;
    }
    updateUserProfile({ password: passwordForm.new });
    setPasswordForm({ old: "", new: "" });
    triggerHaptic();
    showAlert("Success", "Password updated successfully!");
  };

  const handleTogglePro = (checked: boolean) => {
    const nextTier = checked ? "Pro" : "Free";
    updateUserProfile({ membershipTier: nextTier });
    triggerHaptic();
    if (checked) {
      Alert.alert("Welcome!", "Congratulations! Welcome to Verity Pro 🌟");
    } else {
      Alert.alert("Account Info", "Membership updated to Free plan");
    }
  };

  const handleClearHistoryAction = () => {
    Alert.alert(
      "Confirm Action",
      "Are you sure you want to delete all scanned products history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: () => {
            clearHistory();
            triggerHaptic();
          }
        }
      ]
    );
  };

  const handleClearSearchAction = () => {
    Alert.alert(
      "Confirm Action",
      "Are you sure you want to clear your search queries?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: () => {
            clearSearchHistory();
            triggerHaptic();
          }
        }
      ]
    );
  };

  const handleClearWatchlistAction = () => {
    Alert.alert(
      "Confirm Action",
      "Are you sure you want to clear your watchlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: () => {
            clearWatchlist();
            triggerHaptic();
          }
        }
      ]
    );
  };

  const handleLogoutAction = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Verity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              triggerHaptic();
              
              router.replace("/");
            } catch (error) {
              console.error("Logout failed:", error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccountAction = () => {
    Alert.alert(
      "CRITICAL WARNING",
      "This will permanently delete your account, saved scans, watchlist, and preferences. This action CANNOT be undone. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently", style: "destructive", onPress: () => {
            deleteAccount();
            triggerHaptic();
          }
        }
      ]
    );
  };

  // Sound play controller
  const handleAlertSoundChange = (sound: typeof settings.alertSound) => {
    handleToggleSetting("alertSound", sound);
    if (sound !== "none") {
      playSound(sound);
    }
  };

  // Accessibility TTS switch controller
  const handleTtsToggle = (checked: boolean) => {
    handleToggleSetting("ttsEnabled", checked);
    if (checked) {
      speakText("Accessibility Mode: Price voice-announcements enabled.");
    }
  };

  const storeOptions = [
    { key: "amazon", label: "Amazon India", logo: "https://www.google.com/s2/favicons?sz=128&domain=amazon.in" },
    { key: "flipkart", label: "Flipkart", logo: "https://www.google.com/s2/favicons?sz=128&domain=flipkart.com" },
    { key: "blinkit", label: "Blinkit", logo: "https://www.google.com/s2/favicons?sz=128&domain=blinkit.com" },
    { key: "bigbasket", label: "BigBasket", logo: "https://www.bbassets.com/static/staticContent/bb_logo.png" },
    { key: "zepto", label: "Zepto", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Zepto_Logo.svg/512px-Zepto_Logo.svg.png" },
    { key: "dmart", label: "DMart Ready", logo: "https://www.google.com/s2/favicons?sz=128&domain=dmart.in" },
    { key: "reliance", label: "Reliance Digital", logo: "https://www.google.com/s2/favicons?sz=128&domain=reliancedigital.in" },
    { key: "tatacliq", label: "Tata CLIQ", logo: "https://www.google.com/s2/favicons?sz=128&domain=tatacliq.com" },
  ];

  // Gallery photo picker handler
  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert("Permission Required", "Please allow photo library access to pick an avatar.", true);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setSelectedAvatar(uri);
      updateUserProfile({ avatar: uri });
      triggerHaptic();
    }
  };

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: theme.bg }} className="flex-1">

      {activePanel === null ? (
        /* ========================================================= */
        /*                       MAIN PANEL                          */
        /* ========================================================= */
        <View className="flex-1">
          {/* Header */}
          <View style={{ borderBottomColor: theme.border, backgroundColor: theme.bgCardAlt }} className="flex-row items-center gap-4 px-6 py-5 border-b">
            <Text style={[scaledText(20), { color: theme.text }]} className="font-bold">Settings</Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} className="flex-1">
            {/* Personalized Greeting Banner */}
            <View style={{ borderColor: accent.hex + "33", backgroundColor: accent.hex + "11" }} className="p-5 border rounded-3xl mb-6 relative overflow-hidden">
              <View className="absolute right-0 bottom-0 top-0 opacity-10 flex justify-center items-center mr-4">
                <Sparkles size={80} color={accent.hex} />
              </View>
              <Text style={[scaledText(11), { color: accent.hex }]} className="font-bold uppercase tracking-wider mb-1">Welcome Back</Text>
              <Text style={[scaledText(24), { color: theme.text }]} className="font-black">Hello, {currentUser.name}! 👋</Text>
              <Text style={[scaledText(11), { color: theme.textMuted }]} className="mt-1.5">Your settings are synchronized and personalized to your account.</Text>
            </View>

            {/* Merged Profile & Account Card */}
            <TouchableOpacity
              onPress={() => setActivePanel("profile")}
              style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
              className="p-5 border rounded-3xl flex-row items-center gap-4 mb-6"
            >
              <View className="relative">
                <Image
                  source={{ uri: selectedAvatar }}
                  style={{ borderColor: theme.border }}
                  className="w-16 h-16 rounded-2xl border"
                />
              </View>

              <View className="flex-1">
                <Text style={[scaledText(18), { color: theme.text }]} className="font-bold">Profile & Account</Text>
                <Text style={[scaledText(13), { color: theme.textMuted }]} className="truncate">{currentUser.name} • {currentUser.email}</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>

            {/* Navigation Lists */}
            <View className="space-y-3 gap-3 mb-6">

              {/* 2. Notifications & Alerts */}
              <TouchableOpacity
                onPress={() => setActivePanel("notifications")}
                style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                className="w-full flex-row items-center justify-between p-4 border rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View style={{ backgroundColor: isDark ? "rgba(244,162,97,0.2)" : "rgba(244,162,97,0.1)" }} className="w-10 h-10 rounded-xl items-center justify-center">
                    <Bell size={20} color="#F4A261" />
                  </View>
                  <Text style={[scaledText(14), { color: theme.text }]} className="font-semibold">Notifications & Alerts</Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>

              {/* 3. Appearance & Accent */}
              <TouchableOpacity
                onPress={() => setActivePanel("appearance")}
                style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                className="w-full flex-row items-center justify-between p-4 border rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View style={{ backgroundColor: isDark ? "rgba(96,165,250,0.2)" : "rgba(96,165,250,0.1)" }} className="w-10 h-10 rounded-xl items-center justify-center">
                    <Palette size={20} color="#60A5FA" />
                  </View>
                  <Text style={[scaledText(14), { color: theme.text }]} className="font-semibold">Appearance & Accent</Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>

              {/* 4. Data & Storage */}
              <TouchableOpacity
                onPress={() => setActivePanel("data")}
                style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                className="w-full flex-row items-center justify-between p-4 border rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View style={{ backgroundColor: isDark ? "rgba(167,139,250,0.2)" : "rgba(167,139,250,0.1)" }} className="w-10 h-10 rounded-xl items-center justify-center">
                    <Database size={20} color="#A78BFA" />
                  </View>
                  <Text style={[scaledText(14), { color: theme.text }]} className="font-semibold">Data & Storage</Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>

              {/* 5. Accessibility */}
              <TouchableOpacity
                onPress={() => setActivePanel("accessibility")}
                style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
                className="w-full flex-row items-center justify-between p-4 border rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View style={{ backgroundColor: isDark ? "rgba(46,204,113,0.2)" : "rgba(46,204,113,0.1)" }} className="w-10 h-10 rounded-xl items-center justify-center">
                    <AccessIcon size={20} color={accent.hex} />
                  </View>
                  <Text style={[scaledText(14), { color: theme.text }]} className="font-semibold">Accessibility</Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Logout actions */}
            <View style={{ borderTopColor: theme.border }} className="pt-4 border-t mb-6">
              <TouchableOpacity
                onPress={handleLogoutAction}
                style={{ borderColor: "rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.05)" }}
                className="w-full flex-row items-center justify-between p-4 border rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center">
                    <LogOut size={20} color="#EF4444" />
                  </View>
                  <Text style={scaledText(14)} className="font-semibold text-red-400">Log Out</Text>
                </View>
                <ChevronRight size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* App Info Version */}
            <View className="items-center py-4">
              <View className="flex-row items-center gap-1.5 mb-1">
                <View style={{ backgroundColor: accent.hex }} className="w-6 h-6 rounded items-center justify-center">
                  <Zap size={14} color={isDark ? "#0A0E15" : "#FFFFFF"} fill="currentColor" />
                </View>
                <Text style={[scaledText(14), { color: theme.text }]} className="font-bold">Verity App</Text>
              </View>
              <Text style={[scaledText(12), { color: theme.textMuted }]} className="opacity-80">Version 1.1.0 (Beta)</Text>
              <Text style={[scaledText(10), { color: theme.textDim }]} className="mt-1">Local database usage: {storageSize} KB</Text>
            </View>
          </ScrollView>
        </View>
      ) : (
        /* ========================================================= */
        /*                       SUB PANELS                          */
        /* ========================================================= */
        <View className="flex-1">
          {/* Header */}
          <View style={{ borderBottomColor: theme.border, backgroundColor: theme.bgCardAlt }} className="flex-row items-center gap-4 px-6 py-5 border-b">
            <TouchableOpacity
              onPress={() => setActivePanel(null)}
              style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
              className="w-10 h-10 rounded-xl border items-center justify-center"
            >
              <ArrowLeft size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={{ color: theme.text }} className="text-xl font-bold capitalize">
              {activePanel === "profile" ? "Profile & Account" :
                activePanel === "notifications" ? "Notifications & Alerts" :
                  activePanel === "appearance" ? "Appearance & Accent" :
                    activePanel === "data" ? "Data & Storage" : "Accessibility"}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} className="flex-1">
            {/* ========================================== */}
            {/*           1. PROFILE & ACCOUNT             */}
            {/* ========================================== */}
            {activePanel === "profile" && (
              <View className="gap-6">
                {!isEditingProfile ? (
                  /* ========================================== */
                  /*         READ-ONLY PROFILE SUMMARY          */
                  /* ========================================== */
                  <View className="gap-6">
                    {/* Header Card with Large Avatar & Basic Info */}
                    <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-6 border rounded-3xl items-center gap-4">
                      <Image
                        source={{ uri: selectedAvatar }}
                        style={{ borderColor: accent.hex }}
                        className="w-24 h-24 rounded-3xl border"
                      />
                      <View className="items-center">
                        <Text style={[scaledText(22), { color: theme.text }]} className="font-black text-center">
                          {currentUser.name}
                        </Text>
                        <Text style={[scaledText(14), { color: theme.textMuted }]} className="text-center mt-0.5">
                          {currentUser.email}
                        </Text>
                        <View style={{ backgroundColor: accent.hexLight + "1f", borderColor: accent.hexLight + "3f" }} className="mt-3 px-3 py-1 border rounded-full flex-row items-center gap-1.5">
                          <Shield size={12} color={accent.hex} />
                          <Text style={[scaledText(10), { color: accent.hex }]} className="font-extrabold uppercase tracking-widest">
                            {currentUser.membershipTier || "Free"} Member
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Account Details Panel */}
                    <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-4">
                      <Text style={[scaledText(12), { color: theme.textMuted }]} className="font-bold uppercase tracking-wider mb-1">
                        Account Details
                      </Text>
                      
                      <View style={{ borderBottomColor: theme.border }} className="flex-row justify-between items-center py-2.5 border-b">
                        <View className="flex-row items-center gap-2.5">
                          <UserIcon size={16} color={theme.textDim} />
                          <Text style={[scaledText(13), { color: theme.textMuted }]} className="opacity-80">Account ID</Text>
                        </View>
                        <Text style={[scaledText(13), { color: theme.text }]} className="font-mono">{currentUser.id}</Text>
                      </View>

                      <View style={{ borderBottomColor: theme.border }} className="flex-row justify-between items-center py-2.5 border-b">
                        <View className="flex-row items-center gap-2.5">
                          <Calendar size={16} color={theme.textDim} />
                          <Text style={[scaledText(13), { color: theme.textMuted }]} className="opacity-80">Member Since</Text>
                        </View>
                        <Text style={[scaledText(13), { color: theme.text }]} className="font-medium">June 2026</Text>
                      </View>

                      <View style={{ borderBottomColor: theme.border }} className="flex-row justify-between items-center py-2.5 border-b">
                        <View className="flex-row items-center gap-2.5">
                          <IndianRupee size={16} color={theme.textDim} />
                          <Text style={[scaledText(13), { color: theme.textMuted }]} className="opacity-80">Preferred Currency</Text>
                        </View>
                        <Text style={[scaledText(13), { color: theme.text }]} className="font-medium">INR (₹)</Text>
                      </View>

                      <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-2.5">
                          <Globe size={16} color={theme.textDim} />
                          <Text style={[scaledText(13), { color: theme.textMuted }]} className="opacity-80">App Language</Text>
                        </View>
                        <Text style={[scaledText(13), { color: theme.text }]} className="font-medium">English (IN)</Text>
                      </View>
                    </View>

                    {/* Scan & App Statistics Panel */}
                    <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-4">
                      <Text style={[scaledText(12), { color: theme.textMuted }]} className="font-bold uppercase tracking-wider mb-1">
                        Activity Statistics
                      </Text>

                      <View style={{ borderBottomColor: theme.border }} className="flex-row justify-between items-center py-2.5 border-b">
                        <View className="flex-row items-center gap-2.5">
                          <Activity size={16} color={theme.textDim} />
                          <Text style={[scaledText(13), { color: theme.textMuted }]} className="opacity-80">Products Scanned</Text>
                        </View>
                        <View style={{ backgroundColor: accent.hexLight + "1c", borderColor: accent.hexLight + "33" }} className="px-2 py-0.5 rounded border">
                          <Text style={[scaledText(12), { color: accent.hex }]} className="font-bold">{scanHistory.length}</Text>
                        </View>
                      </View>

                      <View style={{ borderBottomColor: theme.border }} className="flex-row justify-between items-center py-2.5 border-b">
                        <View className="flex-row items-center gap-2.5">
                          <Heart size={16} color={theme.textDim} />
                          <Text style={[scaledText(13), { color: theme.textMuted }]} className="opacity-80">Wishlist Trackers</Text>
                        </View>
                        <View style={{ backgroundColor: accent.hexLight + "1c", borderColor: accent.hexLight + "33" }} className="px-2 py-0.5 rounded border">
                          <Text style={[scaledText(12), { color: accent.hex }]} className="font-bold">{watchlist.length}</Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-2.5">
                          <Bell size={16} color={theme.textDim} />
                          <Text style={[scaledText(13), { color: theme.textMuted }]} className="opacity-80">Active Price Alerts</Text>
                        </View>
                        <View style={{ backgroundColor: accent.hexLight + "1c", borderColor: accent.hexLight + "33" }} className="px-2 py-0.5 rounded border">
                          <Text style={[scaledText(12), { color: accent.hex }]} className="font-bold">
                            {watchlist.filter(w => w.targetPrice !== undefined).length}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Edit Profile Button */}
                    <TouchableOpacity
                      onPress={() => setIsEditingProfile(true)}
                      style={{ backgroundColor: accent.hex }}
                      className="w-full py-4 items-center justify-center rounded-2xl flex-row gap-2 shadow-lg"
                    >
                      <Edit size={16} color={isDark ? "#0A0E15" : "#FFFFFF"} />
                      <Text style={[scaledText(14), { color: isDark ? "#0A0E15" : "#FFFFFF" }]} className="font-black uppercase tracking-wide">
                        Edit Profile Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* ========================================== */
                  /*             EDIT PROFILE FORM              */
                  /* ========================================== */
                  <View className="gap-6">
                    {/* Avatar Picker */}
                    <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-4 items-center">
                      <Text style={[scaledText(14), { color: theme.textMuted }]} className="font-semibold">Select Profile Avatar</Text>
                      <View className="flex-row gap-3 flex-wrap justify-center">
                        {AVATAR_OPTIONS.map((url, i) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => handleAvatarSelect(url)}
                            className={`w-14 h-14 rounded-2xl overflow-hidden border-2 relative ${selectedAvatar === url ? "border-[#2ECC71] scale-105" : "border-transparent opacity-60"
                              }`}
                            style={{ borderColor: selectedAvatar === url ? accent.hex : "transparent" }}
                          >
                            <Image source={{ uri: url }} className="w-full h-full" />
                            {selectedAvatar === url && (
                              <View style={{ backgroundColor: accent.hex }} className="absolute bottom-0 right-0 w-4 h-4 items-center justify-center rounded-tl-lg">
                                <Check size={10} color={isDark ? "#0A0E15" : "#FFFFFF"} strokeWidth={3} />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        onPress={handlePickFromGallery}
                        style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                        className="w-full flex-row items-center justify-center gap-2 py-3 border rounded-2xl mt-1"
                      >
                        <ImageIcon size={16} color={theme.textMuted} />
                        <Text style={[scaledText(12), { color: theme.textMuted }]} className="text-xs font-semibold">Pick from Gallery</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Profile Fields */}
                    <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-4">
                      <View>
                        <Text style={[scaledText(14), { color: theme.textMuted }]} className="font-semibold mb-2">Display Name</Text>
                        <TextInput
                          value={profileName}
                          onChangeText={setProfileName}
                          placeholder="Display Name"
                          placeholderTextColor={theme.textDim}
                          style={[scaledText(14), { color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }]}
                          className="w-full px-4 py-3 border rounded-xl"
                        />
                      </View>
                      <View>
                        <Text style={[scaledText(14), { color: theme.textMuted }]} className="font-semibold mb-2">Email Address</Text>
                        <TextInput
                          value={profileEmail}
                          onChangeText={setProfileEmail}
                          placeholder="Email Address"
                          placeholderTextColor={theme.textDim}
                          style={[scaledText(14), { color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }]}
                          className="w-full px-4 py-3 border rounded-xl"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    {/* Change Password Form */}
                    <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-4">
                      <View className="flex-row items-center gap-2">
                        <KeyRound size={16} color={accent.hex} />
                        <Text style={[scaledText(14), { color: theme.text }]} className="font-bold">Security & Password</Text>
                      </View>
                      <TextInput
                        placeholder="Current Password"
                        placeholderTextColor={theme.textDim}
                        secureTextEntry
                        value={passwordForm.old}
                        onChangeText={(val) => setPasswordForm(prev => ({ ...prev, old: val }))}
                        style={[scaledText(12), { color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }]}
                        className="w-full px-4 py-2.5 border rounded-xl"
                      />
                      <TextInput
                        placeholder="New Password"
                        placeholderTextColor={theme.textDim}
                        secureTextEntry
                        value={passwordForm.new}
                        onChangeText={(val) => setPasswordForm(prev => ({ ...prev, new: val }))}
                        style={[scaledText(12), { color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }]}
                        className="w-full px-4 py-2.5 border rounded-xl"
                      />
                      <TouchableOpacity
                        onPress={handlePasswordChange}
                        style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                        className="w-full py-2.5 border items-center justify-center rounded-xl"
                      >
                        <Text style={[scaledText(12), { color: theme.text }]} className="font-semibold">Change Security Password</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Action buttons */}
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => setIsEditingProfile(false)}
                        style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                        className="flex-1 py-4 border items-center justify-center rounded-2xl"
                      >
                        <Text style={[scaledText(14), { color: theme.textMuted }]} className="font-bold">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          handleSaveProfile();
                          setIsEditingProfile(false);
                        }}
                        style={{ backgroundColor: accent.hex }}
                        className="flex-1 py-4 items-center justify-center rounded-2xl"
                      >
                        <Text style={[scaledText(14), { color: isDark ? "#0A0E15" : "#FFFFFF" }]} className="font-black uppercase tracking-wide">Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Danger Zone */}
                <View style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239, 68, 68, 0.2)" }} className="p-5 border rounded-3xl gap-4">
                  <View className="flex-row items-center gap-2">
                    <AlertTriangle size={18} color="#EF4444" />
                    <Text style={[scaledText(14), { color: "#EF4444" }]} className="font-bold">Danger Zone</Text>
                  </View>
                  <Text style={[scaledText(12), { color: theme.textMuted }]} className="leading-5">Permanently delete your user profile and scanned database history from AsyncStorage.</Text>
                  <TouchableOpacity
                    onPress={handleDeleteAccountAction}
                    className="w-full py-3 bg-red-500 items-center justify-center rounded-xl"
                  >
                    <Text style={[scaledText(12), { color: "#FFFFFF" }]} className="font-bold">Delete Account Permanently</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ========================================== */}
            {/*         2. NOTIFICATIONS & ALERTS          */}
            {/* ========================================== */}
            {activePanel === "notifications" && (
              <View className="gap-4">
                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-4 border rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: theme.text }} className="font-semibold text-sm">Push Notifications</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Receive real-time alerts on device</Text>
                  </View>
                  <Switch
                    value={settings.pushNotifications}
                    onValueChange={(val) => handleToggleSetting("pushNotifications", val)}
                    trackColor={{ false: theme.border, true: accent.hex }}
                  />
                </View>

                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-4 border rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: theme.text }} className="font-semibold text-sm">Email Reports</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Receive updates at {user?.email}</Text>
                  </View>
                  <Switch
                    value={settings.emailNotifications}
                    onValueChange={(val) => handleToggleSetting("emailNotifications", val)}
                    trackColor={{ false: theme.border, true: accent.hex }}
                  />
                </View>

                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-4 border rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: theme.text }} className="font-semibold text-sm">Price Drop Alerts</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Auto-notify on watchlist drops</Text>
                  </View>
                  <Switch
                    value={settings.priceAlerts}
                    onValueChange={(val) => handleToggleSetting("priceAlerts", val)}
                    trackColor={{ false: theme.border, true: accent.hex }}
                  />
                </View>

                {/* Threshold slider options */}
                {settings.priceAlerts && (
                  <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-3">
                    <Text style={{ color: accent.hex }} className="text-xs font-bold flex-row items-center gap-1.5">
                      <TrendingDown size={14} color={accent.hex} /> Alert Reduction Threshold: {settings.priceAlertThreshold}%
                    </Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">You will only be alerted for price drops greater than or equal to this percent.</Text>
                    <View className="flex-row gap-2 mt-2">
                      {[5, 10, 20, 30].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => handleToggleSetting("priceAlertThreshold", val)}
                          style={{
                            backgroundColor: settings.priceAlertThreshold === val
                              ? accent.hex
                              : theme.bgCardAlt,
                            borderColor: settings.priceAlertThreshold === val
                              ? accent.hex
                              : theme.border
                          }}
                          className="flex-1 py-2 items-center justify-center rounded-lg border"
                        >
                          <Text
                            style={{
                              color: settings.priceAlertThreshold === val
                                ? (isDark ? "#0A0E15" : "#FFFFFF")
                                : theme.textMuted
                            }}
                            className="text-xs font-bold"
                          >
                            {val}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-4 border rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: theme.text }} className="font-semibold text-sm">Weekly Scans Digest</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Summary email of stores analysis</Text>
                  </View>
                  <Switch
                    value={settings.weeklyDigest}
                    onValueChange={(val) => handleToggleSetting("weeklyDigest", val)}
                    trackColor={{ false: theme.border, true: accent.hex }}
                  />
                </View>

                {/* Alert Sounds list */}
                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-3">
                  <Text style={{ color: theme.text }} className="text-sm font-semibold flex-row items-center gap-2">
                    <Volume2 size={20} color={accent.hex} /> Alert Sound Options
                  </Text>
                  <View className="gap-2">
                    {[
                      { key: "chime", label: "Chime Tone (Classic)" },
                      { key: "beep", label: "Synthetic Beep (Modern)" },
                      { key: "none", label: "Silenced (Muted)" }
                    ].map((snd) => (
                      <TouchableOpacity
                        key={snd.key}
                        onPress={() => handleAlertSoundChange(snd.key as any)}
                        style={{
                          backgroundColor: settings.alertSound === snd.key
                            ? accent.hexLight + "1c"
                            : theme.bgCardAlt,
                          borderColor: settings.alertSound === snd.key
                            ? accent.hex
                            : theme.border
                        }}
                        className="flex-row items-center justify-between p-3 rounded-xl border"
                      >
                        <Text
                          style={{
                            color: settings.alertSound === snd.key
                              ? accent.hex
                              : theme.text
                          }}
                          className="text-xs font-semibold"
                        >
                          {snd.label}
                        </Text>
                        {settings.alertSound === snd.key && <Check size={14} color={accent.hex} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ========================================== */}
            {/*         3. APPEARANCE & ACCENT             */}
            {/* ========================================== */}
            {activePanel === "appearance" && (
              <View className="gap-6">
                {/* Theme Selector */}
                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-4">
                  <Text style={{ color: theme.text }} className="text-sm font-semibold flex-row items-center gap-2">
                    <Sun size={20} color="#F59E0B" /> Interface Theme Mode
                  </Text>
                  <View style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="flex-row p-1 rounded-xl border">
                    {[
                      { key: "light", label: "Light" },
                      { key: "dark", label: "Dark" }
                    ].map((mode) => {
                      const active = settings.themeMode === mode.key;
                      return (
                        <TouchableOpacity
                          key={mode.key}
                          onPress={() => handleToggleSetting("themeMode", mode.key)}
                          style={{ backgroundColor: active ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent" }}
                          className="flex-1 py-2.5 rounded-lg items-center justify-center"
                        >
                          <Text style={{ color: active ? accent.hex : theme.textMuted }} className="text-xs font-bold">{mode.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Preferred Stores Toggle */}
                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-4">
                  <View className="flex-row items-center gap-2">
                    <Store size={20} color={accent.hex} />
                    <Text style={{ color: theme.text }} className="font-bold text-sm">Indexed Stores</Text>
                  </View>
                  <View className="gap-2">
                    {storeOptions.map((store) => (
                      <View
                        key={store.key}
                        style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                        className="flex-row items-center justify-between p-3.5 border rounded-xl"
                      >
                        <View className="flex-row items-center gap-2.5">
                          <Image
                            source={{ uri: store.logo }}
                            style={{ width: 28, height: 28, borderRadius: 6 }}
                            resizeMode="contain"
                          />
                          <Text style={{ color: theme.text }} className="font-semibold text-xs">{store.label}</Text>
                        </View>
                        <Switch
                          value={settings.preferredStores[store.key] ?? false}
                          onValueChange={() => handleToggleStore(store.key)}
                          trackColor={{ false: theme.border, true: accent.hex }}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ========================================== */}
            {/*            4. DATA & STORAGE               */}
            {/* ========================================== */}
            {activePanel === "data" && (
              <View className="gap-4">
                {/* Storage Indicators */}
                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-3">
                  <Text style={{ color: theme.text }} className="text-sm font-semibold flex-row items-center gap-2">
                    <Database size={20} color={accent.hex} /> Storage Metrics
                  </Text>
                  <View style={{ borderBottomColor: theme.border }} className="flex-row justify-between items-center py-2 border-b">
                    <Text style={{ color: theme.textMuted }} className="text-xs">AsyncStorage Footprint</Text>
                    <Text style={{ color: theme.text }} className="text-sm font-bold">{storageSize} KB</Text>
                  </View>
                  <View style={{ borderBottomColor: theme.border }} className="flex-row justify-between items-center py-2 border-b">
                    <Text style={{ color: theme.textMuted }} className="text-xs">Scanned Products</Text>
                    <Text style={{ color: theme.text }} className="text-sm font-bold">{scanHistory.length}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-2">
                    <Text style={{ color: theme.textMuted }} className="text-xs">Watchlist Trackers</Text>
                    <Text style={{ color: theme.text }} className="text-sm font-bold">{watchlist.length}</Text>
                  </View>
                </View>

                {/* Offline Cache Mode */}
                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-4 border rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: theme.text }} className="font-semibold text-sm">Offline Cache Mode</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Allow viewing product scans when offline</Text>
                  </View>
                  <Switch
                    value={settings.offlineMode}
                    onValueChange={(val) => handleToggleSetting("offlineMode", val)}
                    trackColor={{ false: theme.border, true: accent.hex }}
                  />
                </View>

                {/* Wipes */}
                <View style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239, 68, 68, 0.2)" }} className="p-5 border rounded-3xl gap-3">
                  <Text className="text-xs font-bold text-red-500 flex-row items-center gap-1.5">
                    <Trash2 size={16} color="#EF4444" /> AsyncStorage Operations
                  </Text>

                  <TouchableOpacity
                    onPress={handleClearSearchAction}
                    disabled={searchHistory.length === 0}
                    style={{
                      opacity: searchHistory.length === 0 ? 0.4 : 1,
                      backgroundColor: theme.bgCardAlt,
                      borderColor: theme.border
                    }}
                    className="w-full flex-row items-center justify-between p-3 border rounded-xl"
                  >
                    <Text style={{ color: theme.text }} className="text-xs">Clear Search History</Text>
                    <Text style={{ color: theme.textMuted, backgroundColor: theme.border }} className="text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {searchHistory.length} items
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClearHistoryAction}
                    disabled={scanHistory.length === 0}
                    style={{
                      opacity: scanHistory.length === 0 ? 0.4 : 1,
                      backgroundColor: theme.bgCardAlt,
                      borderColor: theme.border
                    }}
                    className="w-full flex-row items-center justify-between p-3 border rounded-xl"
                  >
                    <Text style={{ color: theme.text }} className="text-xs">Wipe Scans History</Text>
                    <Text style={{ color: theme.textMuted, backgroundColor: theme.border }} className="text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {scanHistory.length} items
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClearWatchlistAction}
                    disabled={watchlist.length === 0}
                    style={{
                      opacity: watchlist.length === 0 ? 0.4 : 1,
                      backgroundColor: theme.bgCardAlt,
                      borderColor: theme.border
                    }}
                    className="w-full flex-row items-center justify-between p-3 border rounded-xl"
                  >
                    <Text style={{ color: theme.text }} className="text-xs">Empty Watchlist Database</Text>
                    <Text style={{ color: theme.textMuted, backgroundColor: theme.border }} className="text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {watchlist.length} items
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ========================================== */}
            {/*            5. ACCESSIBILITY                */}
            {/* ========================================== */}
            {activePanel === "accessibility" && (
              <View className="gap-4">
                {/* Font Scaling controls */}
                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-5 border rounded-3xl gap-4">
                  <Text style={{ color: theme.text }} className="text-sm font-semibold flex-row items-center gap-2">
                    <AccessIcon size={20} color={accent.hex} /> Font Scale Adjust
                  </Text>
                  <View style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="flex-row p-1 rounded-xl border">
                    {[
                      { key: "small", label: "Small" },
                      { key: "medium", label: "Medium" },
                      { key: "large", label: "Large" }
                    ].map((size) => {
                      const active = settings.fontSize === size.key;
                      return (
                        <TouchableOpacity
                          key={size.key}
                          onPress={() => handleToggleSetting("fontSize", size.key)}
                          style={{
                            backgroundColor: active ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent"
                          }}
                          className="flex-1 py-2 rounded-lg items-center justify-center"
                        >
                          <Text style={{ color: active ? accent.hex : theme.textMuted }} className="text-xs font-bold">{size.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Haptic touch */}
                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-4 border rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: theme.text }} className="font-semibold text-sm">Haptic Feedback</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Vibrate on successful barcode scans</Text>
                  </View>
                  <Switch
                    value={settings.hapticFeedback}
                    onValueChange={(val) => handleToggleSetting("hapticFeedback", val)}
                    trackColor={{ false: theme.border, true: accent.hex }}
                  />
                </View>

                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-4 border rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: theme.text }} className="font-semibold text-sm">High Contrast outlines</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Increases outline border visibility</Text>
                  </View>
                  <Switch
                    value={settings.highContrast}
                    onValueChange={(val) => handleToggleSetting("highContrast", val)}
                    trackColor={{ false: theme.border, true: accent.hex }}
                  />
                </View>

                <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="p-4 border rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: theme.text }} className="font-semibold text-sm">TTS Reader Mode</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Speak store scan prices aloud</Text>
                  </View>
                  <Switch
                    value={settings.ttsEnabled}
                    onValueChange={handleTtsToggle}
                    trackColor={{ false: theme.border, true: accent.hex }}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Custom Themed Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertConfig.visible}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
          className="flex-1 bg-black/75 justify-center items-center px-6"
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
            className="w-full border rounded-3xl p-6 shadow-2xl items-center"
          >
            {/* Header Icon */}
            <View style={{ backgroundColor: alertConfig.isError ? 'rgba(239,68,68,0.1)' : accent.hexLight + "1a" }} className="w-16 h-16 rounded-full items-center justify-center mb-4">
              {alertConfig.isError ? (
                <AlertTriangle size={32} color="#EF4444" />
              ) : (
                <Check size={32} color={accent.hex} strokeWidth={3} />
              )}
            </View>

            {/* Title & Message */}
            <Text style={{ color: theme.text }} className="text-xl font-bold mb-2 text-center">{alertConfig.title}</Text>
            <Text style={{ color: theme.textMuted }} className="text-sm text-center mb-6 leading-5">
              {alertConfig.message}
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
              style={{ backgroundColor: alertConfig.isError ? '#EF4444' : accent.hex }}
              className="w-full py-3.5 rounded-xl items-center justify-center"
            >
              <Text style={{ color: alertConfig.isError ? '#FFFFFF' : (isDark ? '#0A0E15' : '#FFFFFF') }} className="font-bold text-sm">
                Continue
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
