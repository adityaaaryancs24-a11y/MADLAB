import { useState, useEffect } from "react";
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
  const { fontScale } = useAppTheme();
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
    if (settings.hapticFeedback) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.log("Haptics failed", e);
      }
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
          text: "Log Out", style: "destructive", onPress: () => {
            logout();
            triggerHaptic();
          }
        }
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
    { key: "amazon", label: "Amazon India", logo: "https://logo.clearbit.com/amazon.in" },
    { key: "flipkart", label: "Flipkart", logo: "https://logo.clearbit.com/flipkart.com" },
    { key: "blinkit", label: "Blinkit", logo: "https://logo.clearbit.com/blinkit.com" },
    { key: "bigbasket", label: "BigBasket", logo: "https://logo.clearbit.com/bigbasket.com" },
    { key: "zepto", label: "Zepto", logo: "https://logo.clearbit.com/zeptonow.com" },
    { key: "dmart", label: "DMart Ready", logo: "https://logo.clearbit.com/dmart.in" },
    { key: "reliance", label: "Reliance Digital", logo: "https://logo.clearbit.com/reliancedigital.in" },
    { key: "tatacliq", label: "Tata CLIQ", logo: "https://logo.clearbit.com/tatacliq.com" },
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
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#0A0E15] text-white">

      {activePanel === null ? (
        /* ========================================================= */
        /*                       MAIN PANEL                          */
        /* ========================================================= */
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center gap-4 px-6 py-5 border-b border-white/5 bg-[#0A0E15]/50">
            <Text style={scaledText(20)} className="font-bold text-white">Settings</Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} className="flex-1">
            {/* Personalized Greeting Banner */}
            <View className="p-5 bg-gradient-to-r from-[#2ECC71]/10 to-[#2ECC71]/5 border border-[#2ECC71]/20 rounded-3xl mb-6 relative overflow-hidden">
              <View className="absolute right-0 bottom-0 top-0 opacity-10 flex justify-center items-center mr-4">
                <Sparkles size={80} color="#2ECC71" />
              </View>
              <Text style={scaledText(11)} className="font-bold text-[#2ECC71] uppercase tracking-wider mb-1">Welcome Back</Text>
              <Text style={scaledText(24)} className="font-black text-white">Hello, {currentUser.name}! 👋</Text>
              <Text style={scaledText(11)} className="text-white/50 mt-1.5">Your settings are synchronized and personalized to your account.</Text>
            </View>

            {/* User Profile Card */}
            <TouchableOpacity
              onPress={() => setActivePanel("profile")}
              className="p-5 bg-white/5 border border-white/10 rounded-3xl flex-row items-center gap-4 mb-6"
            >
              <View className="relative">
                <Image
                  source={{ uri: selectedAvatar }}
                  className="w-16 h-16 rounded-2xl border border-white/10"
                />
              </View>

              <View className="flex-1">
                <Text style={scaledText(18)} className="font-bold text-white">{currentUser.name}</Text>
                <Text style={scaledText(14)} className="text-white/60 truncate">{currentUser.email}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Navigation Lists */}
            <View className="space-y-3 gap-3 mb-6">
              {/* 1. Profile & Account */}
              <TouchableOpacity
                onPress={() => setActivePanel("profile")}
                className="w-full flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-[#2ECC71]/20 items-center justify-center">
                    <UserIcon size={20} color="#2ECC71" />
                  </View>
                  <Text style={scaledText(14)} className="font-semibold text-white">Profile & Account</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 2. Notifications & Alerts */}
              <TouchableOpacity
                onPress={() => setActivePanel("notifications")}
                className="w-full flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-[#F4A261]/20 items-center justify-center">
                    <Bell size={20} color="#F4A261" />
                  </View>
                  <Text style={scaledText(14)} className="font-semibold text-white">Notifications & Alerts</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 3. Appearance & Accent */}
              <TouchableOpacity
                onPress={() => setActivePanel("appearance")}
                className="w-full flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-[#60A5FA]/20 items-center justify-center">
                    <Palette size={20} color="#60A5FA" />
                  </View>
                  <Text style={scaledText(14)} className="font-semibold text-white">Appearance & Accent</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 4. Data & Storage */}
              <TouchableOpacity
                onPress={() => setActivePanel("data")}
                className="w-full flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 items-center justify-center">
                    <Database size={20} color="#A78BFA" />
                  </View>
                  <Text style={scaledText(14)} className="font-semibold text-white">Data & Storage</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 5. Accessibility */}
              <TouchableOpacity
                onPress={() => setActivePanel("accessibility")}
                className="w-full flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-[#25A65A]/20 items-center justify-center">
                    <AccessIcon size={20} color="#2ECC71" />
                  </View>
                  <Text style={scaledText(14)} className="font-semibold text-white">Accessibility</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Logout actions */}
            <View className="pt-4 border-t border-white/5 mb-6">
              <TouchableOpacity
                onPress={handleLogoutAction}
                className="w-full flex-row items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-2xl"
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
                <View className="w-6 h-6 rounded bg-[#2ECC71] items-center justify-center">
                  <Zap size={14} color="#0A0E15" fill="currentColor" />
                </View>
                <Text style={scaledText(14)} className="font-bold text-white">Verity App</Text>
              </View>
              <Text style={scaledText(12)} className="text-white/40">Version 1.1.0 (Beta)</Text>
              <Text style={scaledText(10)} className="text-white/30 mt-1">Local database usage: {storageSize} KB</Text>
            </View>
          </ScrollView>
        </View>
      ) : (
        /* ========================================================= */
        /*                       SUB PANELS                          */
        /* ========================================================= */
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center gap-4 px-6 py-5 border-b border-white/5 bg-[#0A0E15]/50">
            <TouchableOpacity
              onPress={() => setActivePanel(null)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center"
            >
              <ArrowLeft size={20} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white capitalize">
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
                    <View className="p-6 bg-white/5 border border-white/10 rounded-3xl items-center gap-4">
                      <Image
                        source={{ uri: selectedAvatar }}
                        className="w-24 h-24 rounded-3xl border border-[#2ECC71]"
                      />
                      <View className="items-center">
                        <Text style={scaledText(22)} className="font-black text-white text-center">
                          {currentUser.name}
                        </Text>
                        <Text style={scaledText(14)} className="text-white/40 text-center mt-0.5">
                          {currentUser.email}
                        </Text>
                        <View className="mt-3 px-3 py-1 bg-[#2ECC71]/15 border border-[#2ECC71]/35 rounded-full flex-row items-center gap-1.5">
                          <Shield size={12} color="#2ECC71" />
                          <Text style={scaledText(10)} className="text-[#2ECC71] font-extrabold uppercase tracking-widest">
                            {currentUser.membershipTier || "Free"} Member
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Account Details Panel */}
                    <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4">
                      <Text style={scaledText(12)} className="font-bold text-white uppercase tracking-wider mb-1 text-white/50">
                        Account Details
                      </Text>
                      
                      <View className="flex-row justify-between items-center py-2.5 border-b border-white/5">
                        <View className="flex-row items-center gap-2.5">
                          <UserIcon size={16} color="rgba(255,255,255,0.4)" />
                          <Text style={scaledText(13)} className="text-white/60">Account ID</Text>
                        </View>
                        <Text style={scaledText(13)} className="text-white font-mono">{currentUser.id}</Text>
                      </View>

                      <View className="flex-row justify-between items-center py-2.5 border-b border-white/5">
                        <View className="flex-row items-center gap-2.5">
                          <Calendar size={16} color="rgba(255,255,255,0.4)" />
                          <Text style={scaledText(13)} className="text-white/60">Member Since</Text>
                        </View>
                        <Text style={scaledText(13)} className="text-white font-medium">June 2026</Text>
                      </View>

                      <View className="flex-row justify-between items-center py-2.5 border-b border-white/5">
                        <View className="flex-row items-center gap-2.5">
                          <IndianRupee size={16} color="rgba(255,255,255,0.4)" />
                          <Text style={scaledText(13)} className="text-white/60">Preferred Currency</Text>
                        </View>
                        <Text style={scaledText(13)} className="text-white font-medium">INR (₹)</Text>
                      </View>

                      <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-2.5">
                          <Globe size={16} color="rgba(255,255,255,0.4)" />
                          <Text style={scaledText(13)} className="text-white/60">App Language</Text>
                        </View>
                        <Text style={scaledText(13)} className="text-white font-medium">English (IN)</Text>
                      </View>
                    </View>

                    {/* Scan & App Statistics Panel */}
                    <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4">
                      <Text style={scaledText(12)} className="font-bold text-white uppercase tracking-wider mb-1 text-white/50">
                        Activity Statistics
                      </Text>

                      <View className="flex-row justify-between items-center py-2.5 border-b border-white/5">
                        <View className="flex-row items-center gap-2.5">
                          <Activity size={16} color="rgba(255,255,255,0.4)" />
                          <Text style={scaledText(13)} className="text-white/60">Products Scanned</Text>
                        </View>
                        <View className="bg-[#2ECC71]/10 px-2 py-0.5 rounded border border-[#2ECC71]/20">
                          <Text style={scaledText(12)} className="text-[#2ECC71] font-bold">{scanHistory.length}</Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center py-2.5 border-b border-white/5">
                        <View className="flex-row items-center gap-2.5">
                          <Heart size={16} color="rgba(255,255,255,0.4)" />
                          <Text style={scaledText(13)} className="text-white/60">Wishlist Trackers</Text>
                        </View>
                        <View className="bg-[#2ECC71]/10 px-2 py-0.5 rounded border border-[#2ECC71]/20">
                          <Text style={scaledText(12)} className="text-[#2ECC71] font-bold">{watchlist.length}</Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-2.5">
                          <Bell size={16} color="rgba(255,255,255,0.4)" />
                          <Text style={scaledText(13)} className="text-white/60">Active Price Alerts</Text>
                        </View>
                        <View className="bg-[#2ECC71]/10 px-2 py-0.5 rounded border border-[#2ECC71]/20">
                          <Text style={scaledText(12)} className="text-[#2ECC71] font-bold">
                            {watchlist.filter(w => w.targetPrice !== undefined).length}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Edit Profile Button */}
                    <TouchableOpacity
                      onPress={() => setIsEditingProfile(true)}
                      className="w-full py-4 bg-[#2ECC71] items-center justify-center rounded-2xl flex-row gap-2 shadow-lg shadow-[#2ECC71]/20"
                    >
                      <Edit size={16} color="#0A0E15" />
                      <Text style={scaledText(14)} className="text-[#0A0E15] font-black uppercase tracking-wide">
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
                    <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4 items-center">
                      <Text style={scaledText(14)} className="font-semibold text-white/60">Select Profile Avatar</Text>
                      <View className="flex-row gap-3 flex-wrap justify-center">
                        {AVATAR_OPTIONS.map((url, i) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => handleAvatarSelect(url)}
                            className={`w-14 h-14 rounded-2xl overflow-hidden border-2 relative ${selectedAvatar === url ? "border-[#2ECC71] scale-105" : "border-transparent opacity-60"
                              }`}
                          >
                            <Image source={{ uri: url }} className="w-full h-full" />
                            {selectedAvatar === url && (
                              <View className="absolute bottom-0 right-0 bg-[#2ECC71] w-4 h-4 items-center justify-center rounded-tl-lg">
                                <Check size={10} color="#0A0E15" strokeWidth={3} />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        onPress={handlePickFromGallery}
                        className="w-full flex-row items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl mt-1"
                      >
                        <ImageIcon size={16} color="rgba(255,255,255,0.6)" />
                        <Text style={scaledText(12)} className="text-white/60 text-xs font-semibold">Pick from Gallery</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Profile Fields */}
                    <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4">
                      <View>
                        <Text style={scaledText(14)} className="font-semibold text-white/60 mb-2">Display Name</Text>
                        <TextInput
                          value={profileName}
                          onChangeText={setProfileName}
                          placeholder="Display Name"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          style={scaledText(14)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                        />
                      </View>
                      <View>
                        <Text style={scaledText(14)} className="font-semibold text-white/60 mb-2">Email Address</Text>
                        <TextInput
                          value={profileEmail}
                          onChangeText={setProfileEmail}
                          placeholder="Email Address"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          style={scaledText(14)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    {/* Change Password Form */}
                    <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4">
                      <View className="flex-row items-center gap-2">
                        <KeyRound size={16} color="#2ECC71" />
                        <Text style={scaledText(14)} className="font-bold text-white">Security & Password</Text>
                      </View>
                      <TextInput
                        placeholder="Current Password"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        secureTextEntry
                        value={passwordForm.old}
                        onChangeText={(val) => setPasswordForm(prev => ({ ...prev, old: val }))}
                        style={scaledText(12)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                      />
                      <TextInput
                        placeholder="New Password"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        secureTextEntry
                        value={passwordForm.new}
                        onChangeText={(val) => setPasswordForm(prev => ({ ...prev, new: val }))}
                        style={scaledText(12)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                      />
                      <TouchableOpacity
                        onPress={handlePasswordChange}
                        className="w-full py-2.5 bg-white/5 border border-white/10 items-center justify-center rounded-xl"
                      >
                        <Text style={scaledText(12)} className="text-white font-semibold">Change Security Password</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Action buttons */}
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => setIsEditingProfile(false)}
                        className="flex-1 py-4 bg-white/5 border border-white/10 items-center justify-center rounded-2xl"
                      >
                        <Text style={scaledText(14)} className="text-white/60 font-bold">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          handleSaveProfile();
                          setIsEditingProfile(false);
                        }}
                        className="flex-1 py-4 bg-[#2ECC71] items-center justify-center rounded-2xl"
                      >
                        <Text style={scaledText(14)} className="text-[#0A0E15] font-black uppercase tracking-wide">Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Danger Zone */}
                <View className="p-5 bg-red-500/5 border border-red-500/20 rounded-3xl gap-4">
                  <View className="flex-row items-center gap-2">
                    <AlertTriangle size={18} color="#EF4444" />
                    <Text style={scaledText(14)} className="font-bold text-red-500">Danger Zone</Text>
                  </View>
                  <Text style={scaledText(12)} className="text-white/60 leading-5">Permanently delete your user profile and scanned database history from AsyncStorage.</Text>
                  <TouchableOpacity
                    onPress={handleDeleteAccountAction}
                    className="w-full py-3 bg-red-500 items-center justify-center rounded-xl"
                  >
                    <Text style={scaledText(12)} className="text-white font-bold">Delete Account Permanently</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ========================================== */}
            {/*         2. NOTIFICATIONS & ALERTS          */}
            {/* ========================================== */}
            {activePanel === "notifications" && (
              <View className="gap-4">
                <View className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-white text-sm">Push Notifications</Text>
                    <Text className="text-xs text-white/50">Receive real-time alerts on device</Text>
                  </View>
                  <Switch
                    value={settings.pushNotifications}
                    onValueChange={(val) => handleToggleSetting("pushNotifications", val)}
                    trackColor={{ false: "#1F2937", true: "#2ECC71" }}
                  />
                </View>

                <View className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-white text-sm">Email Reports</Text>
                    <Text className="text-xs text-white/50">Receive updates at {user?.email}</Text>
                  </View>
                  <Switch
                    value={settings.emailNotifications}
                    onValueChange={(val) => handleToggleSetting("emailNotifications", val)}
                    trackColor={{ false: "#1F2937", true: "#2ECC71" }}
                  />
                </View>

                <View className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-white text-sm">Price Drop Alerts</Text>
                    <Text className="text-xs text-white/50">Auto-notify on watchlist drops</Text>
                  </View>
                  <Switch
                    value={settings.priceAlerts}
                    onValueChange={(val) => handleToggleSetting("priceAlerts", val)}
                    trackColor={{ false: "#1F2937", true: "#2ECC71" }}
                  />
                </View>

                {/* Threshold slider options */}
                {settings.priceAlerts && (
                  <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-3">
                    <Text className="text-xs font-bold text-[#2ECC71] flex-row items-center gap-1.5">
                      <TrendingDown size={14} color="#2ECC71" /> Alert Reduction Threshold: {settings.priceAlertThreshold}%
                    </Text>
                    <Text className="text-xs text-white/60">You will only be alerted for price drops greater than or equal to this percent.</Text>
                    <View className="flex-row gap-2 mt-2">
                      {[5, 10, 20, 30].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => handleToggleSetting("priceAlertThreshold", val)}
                          className={`flex-1 py-2 items-center justify-center rounded-lg border ${settings.priceAlertThreshold === val
                              ? "bg-[#2ECC71] border-[#2ECC71]"
                              : "bg-white/5 border-white/10"
                            }`}
                        >
                          <Text className={`text-xs font-bold ${settings.priceAlertThreshold === val ? "text-[#0A0E15]" : "text-white"
                            }`}>{val}%</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-white text-sm">Weekly Scans Digest</Text>
                    <Text className="text-xs text-white/50">Summary email of stores analysis</Text>
                  </View>
                  <Switch
                    value={settings.weeklyDigest}
                    onValueChange={(val) => handleToggleSetting("weeklyDigest", val)}
                    trackColor={{ false: "#1F2937", true: "#2ECC71" }}
                  />
                </View>

                {/* Alert Sounds list */}
                <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-3">
                  <Text className="text-sm font-semibold text-white flex-row items-center gap-2">
                    <Volume2 size={20} color="#2ECC71" /> Alert Sound Options
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
                        className={`flex-row items-center justify-between p-3 rounded-xl border ${settings.alertSound === snd.key
                            ? "bg-[#2ECC71]/10 border-[#2ECC71]"
                            : "bg-white/5 border-white/10"
                          }`}
                      >
                        <Text className={`text-xs ${settings.alertSound === snd.key ? "text-[#2ECC71] font-bold" : "text-white"
                          }`}>{snd.label}</Text>
                        {settings.alertSound === snd.key && <Check size={14} color="#2ECC71" />}
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
                <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4">
                  <Text className="text-sm font-semibold text-white flex-row items-center gap-2">
                    <Sun size={20} color="#F59E0B" /> Interface Theme Mode
                  </Text>
                  <View className="flex-row bg-white/5 p-1 rounded-xl border border-white/10">
                    {[
                      { key: "light", label: "Light" },
                      { key: "dark", label: "Dark" },
                      { key: "system", label: "System" }
                    ].map((mode) => {
                      const active = settings.themeMode === mode.key;
                      return (
                        <TouchableOpacity
                          key={mode.key}
                          onPress={() => handleToggleSetting("themeMode", mode.key)}
                          className={`flex-1 py-2.5 rounded-lg items-center justify-center ${active ? "bg-white/10 text-[#2ECC71]" : ""
                            }`}
                        >
                          <Text className={`text-xs font-bold ${active ? "text-[#2ECC71]" : "text-white/60"}`}>{mode.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Accent Color picker */}
                <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4">
                  <Text className="text-sm font-semibold text-white flex-row items-center gap-2">
                    <Palette size={20} color="#2ECC71" /> Accent Highlights
                  </Text>
                  <View className="flex-row justify-around py-2">
                    {[
                      { key: "emerald", label: "Green", hex: "#2ECC71" },
                      { key: "blue", label: "Blue", hex: "#3B82F6" },
                      { key: "orange", label: "Orange", hex: "#F4A261" },
                      { key: "purple", label: "Purple", hex: "#8B5CF6" }
                    ].map((color) => (
                      <TouchableOpacity
                        key={color.key}
                        onPress={() => handleToggleSetting("accentColor", color.key)}
                        style={{ backgroundColor: color.hex }}
                        className={`w-12 h-12 rounded-2xl items-center justify-center border-2 ${settings.accentColor === color.key ? "border-white scale-105" : "border-transparent opacity-75"
                          }`}
                      >
                        {settings.accentColor === color.key && (
                          <Check size={18} color="#0A0E15" strokeWidth={3} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Preferred Stores Toggle */}
                <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4">
                  <View className="flex-row items-center gap-2">
                    <Store size={20} color="#2ECC71" />
                    <Text className="font-bold text-white text-sm">Indexed Stores</Text>
                  </View>
                  <View className="gap-2">
                    {storeOptions.map((store) => (
                      <View
                        key={store.key}
                        className="flex-row items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl"
                      >
                        <View className="flex-row items-center gap-2.5">
                          <Image
                            source={{ uri: store.logo }}
                            style={{ width: 28, height: 28, borderRadius: 6 }}
                            resizeMode="contain"
                          />
                          <Text className="font-semibold text-white text-xs">{store.label}</Text>
                        </View>
                        <Switch
                          value={settings.preferredStores[store.key] ?? false}
                          onValueChange={() => handleToggleStore(store.key)}
                          trackColor={{ false: "#1F2937", true: "#2ECC71" }}
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
                <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-3">
                  <Text className="text-sm font-semibold text-white flex-row items-center gap-2">
                    <Database size={20} color="#2ECC71" /> Storage Metrics
                  </Text>
                  <View className="flex-row justify-between items-center py-2 border-b border-white/5">
                    <Text className="text-xs text-white/60">AsyncStorage Footprint</Text>
                    <Text className="text-sm font-bold text-white">{storageSize} KB</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-2 border-b border-white/5">
                    <Text className="text-xs text-white/60">Scanned Products</Text>
                    <Text className="text-sm font-bold text-white">{scanHistory.length}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-xs text-white/60">Watchlist Trackers</Text>
                    <Text className="text-sm font-bold text-white">{watchlist.length}</Text>
                  </View>
                </View>

                {/* Offline Cache Mode */}
                <View className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-white text-sm">Offline Cache Mode</Text>
                    <Text className="text-xs text-white/50">Allow viewing product scans when offline</Text>
                  </View>
                  <Switch
                    value={settings.offlineMode}
                    onValueChange={(val) => handleToggleSetting("offlineMode", val)}
                    trackColor={{ false: "#1F2937", true: "#2ECC71" }}
                  />
                </View>

                {/* Wipes */}
                <View className="p-5 bg-red-500/5 border border-red-500/20 rounded-3xl gap-3">
                  <Text className="text-xs font-bold text-red-500 flex-row items-center gap-1.5">
                    <Trash2 size={16} color="#EF4444" /> AsyncStorage Operations
                  </Text>

                  <TouchableOpacity
                    onPress={handleClearSearchAction}
                    disabled={searchHistory.length === 0}
                    style={{ opacity: searchHistory.length === 0 ? 0.4 : 1 }}
                    className="w-full flex-row items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <Text className="text-white text-xs">Clear Search History</Text>
                    <Text className="text-[10px] text-white/50 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                      {searchHistory.length} items
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClearHistoryAction}
                    disabled={scanHistory.length === 0}
                    style={{ opacity: scanHistory.length === 0 ? 0.4 : 1 }}
                    className="w-full flex-row items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <Text className="text-white text-xs">Wipe Scans History</Text>
                    <Text className="text-[10px] text-white/50 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                      {scanHistory.length} items
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClearWatchlistAction}
                    disabled={watchlist.length === 0}
                    style={{ opacity: watchlist.length === 0 ? 0.4 : 1 }}
                    className="w-full flex-row items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <Text className="text-white text-xs">Empty Watchlist Database</Text>
                    <Text className="text-[10px] text-white/50 font-mono bg-white/5 px-1.5 py-0.5 rounded">
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
                <View className="p-5 bg-white/5 border border-white/10 rounded-3xl gap-4">
                  <Text className="text-sm font-semibold text-white flex-row items-center gap-2">
                    <AccessIcon size={20} color="#2ECC71" /> Font Scale Adjust
                  </Text>
                  <View className="flex-row bg-white/5 p-1 rounded-xl border border-white/10">
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
                          className={`flex-1 py-2 rounded-lg items-center justify-center ${active ? "bg-white/10" : ""
                            }`}
                        >
                          <Text className={`text-xs font-bold ${active ? "text-[#2ECC71]" : "text-white/60"}`}>{size.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Haptic touch */}
                <View className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-white text-sm">Haptic Feedback</Text>
                    <Text className="text-xs text-white/50">Vibrate on successful barcode scans</Text>
                  </View>
                  <Switch
                    value={settings.hapticFeedback}
                    onValueChange={(val) => handleToggleSetting("hapticFeedback", val)}
                    trackColor={{ false: "#1F2937", true: "#2ECC71" }}
                  />
                </View>

                <View className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-white text-sm">High Contrast outlines</Text>
                    <Text className="text-xs text-white/50">Increases outline border visibility</Text>
                  </View>
                  <Switch
                    value={settings.highContrast}
                    onValueChange={(val) => handleToggleSetting("highContrast", val)}
                    trackColor={{ false: "#1F2937", true: "#2ECC71" }}
                  />
                </View>

                <View className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-white text-sm">TTS Reader Mode</Text>
                    <Text className="text-xs text-white/50">Speak store scan prices aloud</Text>
                  </View>
                  <Switch
                    value={settings.ttsEnabled}
                    onValueChange={handleTtsToggle}
                    trackColor={{ false: "#1F2937", true: "#2ECC71" }}
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
            className="w-full bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-2xl items-center"
          >
            {/* Header Icon */}
            <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${alertConfig.isError ? 'bg-red-500/10' : 'bg-[#2ECC71]/10'}`}>
              {alertConfig.isError ? (
                <AlertTriangle size={32} color="#EF4444" />
              ) : (
                <Check size={32} color="#2ECC71" strokeWidth={3} />
              )}
            </View>

            {/* Title & Message */}
            <Text className="text-white text-xl font-bold mb-2 text-center">{alertConfig.title}</Text>
            <Text className="text-white/60 text-sm text-center mb-6 leading-5">
              {alertConfig.message}
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
              className={`w-full py-3.5 rounded-xl items-center justify-center ${alertConfig.isError ? 'bg-red-500' : 'bg-[#2ECC71]'}`}
            >
              <Text className={`${alertConfig.isError ? 'text-white' : 'text-[#0A0E15]'} font-bold text-sm`}>
                Continue
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
