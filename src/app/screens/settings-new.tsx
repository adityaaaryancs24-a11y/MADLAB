import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
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
  Award,
  Smartphone,
  Eye,
  EyeOff
} from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

// Predefined Avatars list for profile selection
const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
];

// Helper to play synthesized mock alert audio
const playSound = (type: "chime" | "beep") => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === "beep") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === "chime") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn("Audio Context not supported", e);
  }
};

// Helper for Screen Reader Text-To-Speech announcement
const speakText = (text: string) => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }
};

export function Settings() {
  const navigate = useNavigate();
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

  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [passwordForm, setPasswordForm] = useState({ old: "", new: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);

  // Sync profile details when user state loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      if (user.avatar) setSelectedAvatar(user.avatar);
    }
  }, [user]);

  // Dynamic LocalStorage metrics
  const [storageSize, setStorageSize] = useState("0.00");
  useEffect(() => {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    setStorageSize((totalBytes / 1024).toFixed(2));
  }, [scanHistory, watchlist, searchHistory, user]);

  // Handle single toggle settings updates
  const handleToggleSetting = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleToggleStore = (storeKey: string) => {
    const newStores = {
      ...settings.preferredStores,
      [storeKey]: !settings.preferredStores[storeKey],
    };
    updateSettings({ preferredStores: newStores });
    toast.success(`${storeKey.toUpperCase()} ${newStores[storeKey] ? "enabled" : "disabled"}`);
  };

  // Actions
  const handleSaveProfile = () => {
    updateUserProfile({ name: profileName, email: profileEmail, avatar: selectedAvatar });
    toast.success("Profile details updated!");
  };

  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url);
    updateUserProfile({ avatar: url });
    toast.success("Avatar updated!");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.old || !passwordForm.new) {
      toast.error("Please fill in both fields");
      return;
    }
    updateUserProfile({ password: passwordForm.new });
    setPasswordForm({ old: "", new: "" });
    toast.success("Password updated successfully!");
  };

  const handleTogglePro = (checked: boolean) => {
    const nextTier = checked ? "Pro" : "Free";
    updateUserProfile({ membershipTier: nextTier });
    if (checked) {
      toast.success("Congratulations! Welcome to Verity Pro 🌟");
    } else {
      toast.info("Membership updated to Free plan");
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({
      user,
      settings,
      scanHistory,
      watchlist,
      searchHistory,
    }, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "verity_user_backup.json");
    linkElement.click();
    toast.success("Data backup file exported!");
  };

  const handleClearHistoryAction = () => {
    if (window.confirm("Are you sure you want to delete all scanned products history?")) {
      clearHistory();
      toast.success("Scan history wiped!");
    }
  };

  const handleClearSearchAction = () => {
    if (window.confirm("Are you sure you want to clear your search queries?")) {
      clearSearchHistory();
      toast.success("Search history wiped!");
    }
  };

  const handleClearWatchlistAction = () => {
    if (window.confirm("Are you sure you want to clear your watchlist?")) {
      clearWatchlist();
      toast.success("Watchlist cleared!");
    }
  };

  const handleLogoutAction = () => {
    if (window.confirm("Are you sure you want to log out of Verity?")) {
      logout();
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  const handleDeleteAccountAction = () => {
    if (window.confirm("CRITICAL WARNING: This will permanently delete your account, saved scans, watchlist, and preferences. This action CANNOT be undone. Proceed?")) {
      deleteAccount();
      toast.error("Account deleted permanently");
      navigate("/");
    }
  };

  // Sound play controller
  const handleAlertSoundChange = (sound: typeof settings.alertSound) => {
    handleToggleSetting("alertSound", sound);
    if (sound !== "none") {
      playSound(sound);
    }
    toast.success(`Alert sound set to ${sound}`);
  };

  // Accessibility TTS switch controller
  const handleTtsToggle = (checked: boolean) => {
    handleToggleSetting("ttsEnabled", checked);
    if (checked) {
      speakText("Accessibility Mode: Price voice-announcements enabled.");
      toast.success("TTS Reader Activated!");
    } else {
      toast.info("TTS Reader Disabled");
    }
  };

  const storeOptions = [
    { key: "amazon", label: "Amazon", emoji: "📦" },
    { key: "ebay", label: "eBay", emoji: "🛍️" },
    { key: "walmart", label: "Walmart", emoji: "🏪" },
    { key: "target", label: "Target", emoji: "🎯" },
    { key: "bestbuy", label: "Best Buy", emoji: "🔌" },
  ];

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] relative overflow-hidden flex flex-col text-white">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#2ECC71] opacity-10 blur-[120px] rounded-full"></div>
        <div className="absolute top-96 right-1/4 w-96 h-96 bg-[#F4A261] opacity-10 blur-[120px] rounded-full"></div>
      </div>

      <AnimatePresence mode="wait">
        {activePanel === null ? (
          /* ========================================================= */
          /*                       MAIN PANEL                          */
          /* ========================================================= */
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex-1 flex flex-col relative z-10"
          >
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 backdrop-blur-xl bg-[#0A0E15]/50 sticky top-0 z-20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/home")}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
              </motion.button>
              <h1 className="text-xl font-bold text-white">Settings</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* User Profile Card */}
              {user && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => setActivePanel("profile")}
                  className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl cursor-pointer transition-all flex items-center gap-4 group relative overflow-hidden"
                >
                  {/* Upgrade glow for Pro members */}
                  {user.membershipTier === "Pro" && (
                    <div className="absolute inset-0 border border-amber-500/20 rounded-3xl pointer-events-none">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-xl rounded-full"></div>
                    </div>
                  )}

                  <div className="relative">
                    <img 
                      src={selectedAvatar} 
                      alt={user.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg"
                    />
                    {user.membershipTier === "Pro" && (
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                        <Award className="w-3.5 h-3.5 text-[#0A0E15]" />
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
                      {user.membershipTier === "Pro" && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-widest">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 truncate">{user.email}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              )}

              {/* Settings Nav List */}
              <div className="space-y-3">
                {/* 1. Profile & Account */}
                <button
                  onClick={() => setActivePanel("profile")}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ECC71]/20 to-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71]">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-white">Profile & Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 2. Notifications & Alerts */}
                <button
                  onClick={() => setActivePanel("notifications")}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4A261]/20 to-[#F4A261]/10 flex items-center justify-center text-[#F4A261]">
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-white">Notifications & Alerts</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 3. Appearance & Accent */}
                <button
                  onClick={() => setActivePanel("appearance")}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#60A5FA]/20 to-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA]">
                      <Palette className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-white">Appearance & Accent</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 4. Data & Storage */}
                <button
                  onClick={() => setActivePanel("data")}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A78BFA]/20 to-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
                      <Database className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-white">Data & Storage</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 5. Accessibility */}
                <button
                  onClick={() => setActivePanel("accessibility")}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25A65A]/20 to-[#25A65A]/10 flex items-center justify-center text-[#2ECC71]">
                      <AccessIcon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-white">Accessibility</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Quick Logout Button */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <button
                  onClick={handleLogoutAction}
                  className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-red-400">Log Out</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Version Footer */}
              <div className="text-center py-6 text-xs text-white/40 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2ECC71] to-[#25A65A] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-[#0A0E15]" fill="currentColor" />
                  </div>
                  <span>Verity Settings</span>
                </div>
                <span>Version 1.1.0</span>
                <span>Active local storage: {storageSize} KB</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ========================================================= */
          /*                       SUB PANELS                          */
          /* ========================================================= */
          <motion.div
            key="sub-panel"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex-1 flex flex-col relative z-10"
          >
            {/* Sub-page Header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 backdrop-blur-xl bg-[#0A0E15]/50 sticky top-0 z-20">
              <button
                onClick={() => setActivePanel(null)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
              </button>
              <h2 className="text-xl font-bold text-white capitalize">
                {activePanel === "profile" ? "Profile & Account" : 
                 activePanel === "notifications" ? "Notifications & Alerts" :
                 activePanel === "appearance" ? "Appearance & Accent" :
                 activePanel === "data" ? "Data & Storage" : "Accessibility"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* ========================================== */}
              {/*           1. PROFILE & ACCOUNT             */}
              {/* ========================================== */}
              {activePanel === "profile" && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4 text-center">
                    <p className="text-sm font-semibold text-white/60">Select Profile Avatar</p>
                    <div className="flex justify-center gap-4">
                      {AVATAR_OPTIONS.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => handleAvatarSelect(url)}
                          className={`w-14 h-14 rounded-2xl overflow-hidden border-2 relative transition-all ${
                            selectedAvatar === url ? "border-[#2ECC71] scale-110 shadow-lg shadow-[#2ECC71]/20" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                          {selectedAvatar === url && (
                            <span className="absolute bottom-0 right-0 bg-[#2ECC71] w-4 h-4 flex items-center justify-center rounded-tl-lg">
                              <Check className="w-3 h-3 text-[#0A0E15]" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Edit fields */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/60 mb-2">Display Name</label>
                      <input 
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2ECC71] transition-all text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/60 mb-2">Email Address</label>
                      <input 
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2ECC71] transition-all text-sm font-medium"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      className="w-full py-3 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] font-bold rounded-xl shadow-lg shadow-[#2ECC71]/20 hover:opacity-95 transition-all text-sm flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" /> Save General Profile
                    </button>
                  </div>

                  {/* Pro Plan Switch */}
                  <div className="p-5 bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                        <h4 className="font-bold text-amber-500">Verity Pro Plan</h4>
                      </div>
                      <p className="text-xs text-white/60">Unlock weekly price digests, instant priority alerts, and custom accents.</p>
                    </div>
                    <Switch
                      checked={user?.membershipTier === "Pro"}
                      onCheckedChange={handleTogglePro}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>

                  {/* Password Reset Section */}
                  <form onSubmit={handlePasswordChange} className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 text-[#2ECC71]">
                      <KeyRound className="w-4 h-4" />
                      <h4 className="font-bold text-white text-sm">Security & Password</h4>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-1.5">Current Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.old}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, old: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2ECC71] transition-all text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-1.5">New Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2ECC71] transition-all text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold rounded-xl transition-all text-xs"
                    >
                      Update Password
                    </button>
                  </form>

                  {/* Danger Zone */}
                  <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      <h4 className="font-bold text-sm">Danger Zone</h4>
                    </div>
                    <p className="text-xs text-white/60">Once you delete your account, there is no going back. All local scan database references will be wiped.</p>
                    <button
                      onClick={handleDeleteAccountAction}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/10 transition-all text-xs flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Account Permanently
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/*         2. NOTIFICATIONS & ALERTS          */}
              {/* ========================================== */}
              {activePanel === "notifications" && (
                <div className="space-y-4">
                  {/* Alert toggles */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Push Notifications</p>
                      <p className="text-xs text-white/50">Receive real-time alerts on device</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleToggleSetting("pushNotifications", checked)}
                    />
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Email Reports</p>
                      <p className="text-xs text-white/50">Receive updates at {user?.email}</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleToggleSetting("emailNotifications", checked)}
                    />
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Price Drop Alerts</p>
                      <p className="text-xs text-white/50">Auto-notify when watchlist items discount</p>
                    </div>
                    <Switch
                      checked={settings.priceAlerts}
                      onCheckedChange={(checked) => handleToggleSetting("priceAlerts", checked)}
                    />
                  </div>

                  {/* Threshold configuration */}
                  {settings.priceAlerts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-3"
                    >
                      <p className="text-xs font-bold text-[#2ECC71] flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4" /> Alert Reduction Threshold: {settings.priceAlertThreshold}%
                      </p>
                      <p className="text-xs text-white/60">You will only be alerted for price drops greater than or equal to this percent.</p>
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {[5, 10, 20, 30].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleToggleSetting("priceAlertThreshold", val)}
                            className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                              settings.priceAlertThreshold === val 
                                ? "bg-[#2ECC71] border-[#2ECC71] text-[#0A0E15] shadow-md"
                                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Digest setting */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Weekly Scans Digest</p>
                      <p className="text-xs text-white/50">Summary email of stores analysis</p>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => handleToggleSetting("weeklyDigest", checked)}
                    />
                  </div>

                  {/* Alert Sounds */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-[#2ECC71]" /> Alert Sound Options
                    </p>
                    <div className="space-y-2">
                      {[
                        { key: "chime", label: "Chime Tone (Classic)" },
                        { key: "beep", label: "Synthetic Beep (Modern)" },
                        { key: "none", label: "Silenced (Muted)" }
                      ].map((snd) => (
                        <button
                          key={snd.key}
                          onClick={() => handleAlertSoundChange(snd.key as any)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                            settings.alertSound === snd.key 
                              ? "bg-[#2ECC71]/10 border-[#2ECC71] font-bold text-[#2ECC71]" 
                              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                          }`}
                        >
                          <span>{snd.label}</span>
                          {settings.alertSound === snd.key && <Check className="w-4 h-4 text-[#2ECC71]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/*         3. APPEARANCE & ACCENT             */}
              {/* ========================================== */}
              {activePanel === "appearance" && (
                <div className="space-y-6">
                  {/* Theme Mode selector */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-500" /> Interface Theme Mode
                    </p>
                    <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      {[
                        { key: "light", label: "Light", icon: Sun },
                        { key: "dark", label: "Dark", icon: Moon },
                        { key: "system", label: "System", icon: Monitor }
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const active = settings.themeMode === mode.key;
                        return (
                          <button
                            key={mode.key}
                            onClick={() => handleToggleSetting("themeMode", mode.key)}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                              active 
                                ? "bg-white/10 text-[#2ECC71] border border-white/10 shadow-sm" 
                                : "text-white/60 hover:text-white"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accent color picker */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <Palette className="w-5 h-5 text-[#2ECC71]" /> Application Accent Palette
                    </p>
                    <p className="text-xs text-white/60">Select color accent. Updates app colors instantly.</p>
                    <div className="grid grid-cols-4 gap-3 pt-2">
                      {[
                        { key: "emerald", label: "Emerald", hex: "#2ECC71" },
                        { key: "blue", label: "Blue", hex: "#3B82F6" },
                        { key: "orange", label: "Orange", hex: "#F4A261" },
                        { key: "purple", label: "Purple", hex: "#8B5CF6" }
                      ].map((color) => (
                        <button
                          key={color.key}
                          onClick={() => handleToggleSetting("accentColor", color.key)}
                          className="flex flex-col items-center gap-2 group focus:outline-none"
                        >
                          <div 
                            style={{ backgroundColor: color.hex }}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all relative ${
                              settings.accentColor === color.key 
                                ? "border-[#2ECC71] scale-110 shadow-lg" 
                                : "border-transparent opacity-70 group-hover:opacity-100"
                            }`}
                          >
                            {settings.accentColor === color.key && (
                              <Check className="w-5 h-5 text-[#0A0E15] drop-shadow-md" strokeWidth={3} />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-white/60">{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Stores Toggle */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 text-[#2ECC71]">
                      <Store className="w-5 h-5" />
                      <h4 className="font-bold text-white text-sm">Indexed Stores</h4>
                    </div>
                    <p className="text-xs text-white/60">Disable stores you do not want Verity to search and compare prices against.</p>
                    <div className="space-y-2">
                      {storeOptions.map((store) => (
                        <div
                          key={store.key}
                          className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{store.emoji}</span>
                            <span className="font-semibold text-white text-xs">{store.label}</span>
                          </div>
                          <Switch
                            checked={settings.preferredStores[store.key]}
                            onCheckedChange={() => handleToggleStore(store.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/*            4. DATA & STORAGE               */}
              {/* ========================================== */}
              {activePanel === "data" && (
                <div className="space-y-4">
                  {/* Storage indicators */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-[#2ECC71]" /> Storage Metrics
                    </p>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-xs text-white/60">LocalStorage Used</span>
                      <span className="text-sm font-bold text-white">{storageSize} KB</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-xs text-white/60">Cached Products Scans</span>
                      <span className="text-sm font-bold text-white">{scanHistory.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-white/60">Watchlist Trackers</span>
                      <span className="text-sm font-bold text-white">{watchlist.length}</span>
                    </div>
                  </div>

                  {/* Offline Database Toggle */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Offline Cache Mode</p>
                      <p className="text-xs text-white/50">Allows viewing scanned history when offline</p>
                    </div>
                    <Switch
                      checked={settings.offlineMode}
                      onCheckedChange={(checked) => handleToggleSetting("offlineMode", checked)}
                    />
                  </div>

                  {/* Download Backup */}
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#2ECC71]">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm text-left">Export Settings & Data</p>
                        <p className="text-xs text-white/60 text-left">Download backup .json file</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Clear databases */}
                  <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-3">
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                      <Trash2 className="w-4.5 h-4.5" /> Database Maintenance Operations
                    </p>
                    
                    <button
                      onClick={handleClearSearchAction}
                      disabled={searchHistory.length === 0}
                      className="w-full flex items-center justify-between p-3 bg-white/5 disabled:opacity-40 border border-white/10 rounded-xl transition-all text-xs text-white"
                    >
                      <span>Clear Search Queries</span>
                      <span className="text-[10px] text-white/50 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {searchHistory.length} items
                      </span>
                    </button>

                    <button
                      onClick={handleClearHistoryAction}
                      disabled={scanHistory.length === 0}
                      className="w-full flex items-center justify-between p-3 bg-white/5 disabled:opacity-40 border border-white/10 rounded-xl transition-all text-xs text-white"
                    >
                      <span>Wipe Scan History</span>
                      <span className="text-[10px] text-white/50 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {scanHistory.length} items
                      </span>
                    </button>

                    <button
                      onClick={handleClearWatchlistAction}
                      disabled={watchlist.length === 0}
                      className="w-full flex items-center justify-between p-3 bg-white/5 disabled:opacity-40 border border-white/10 rounded-xl transition-all text-xs text-white"
                    >
                      <span>Empty Watchlist Database</span>
                      <span className="text-[10px] text-white/50 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {watchlist.length} items
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/*            5. ACCESSIBILITY                */}
              {/* ========================================== */}
              {activePanel === "accessibility" && (
                <div className="space-y-4">
                  {/* Font Size controls */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <AccessIcon className="w-5 h-5 text-[#2ECC71]" /> Application Font Scale
                    </p>
                    <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      {[
                        { key: "small", label: "Small" },
                        { key: "medium", label: "Medium" },
                        { key: "large", label: "Large" }
                      ].map((size) => {
                        const active = settings.fontSize === size.key;
                        return (
                          <button
                            key={size.key}
                            onClick={() => handleToggleSetting("fontSize", size.key)}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${
                              active 
                                ? "bg-white/10 text-[#2ECC71] border border-white/10 shadow-sm" 
                                : "text-white/60 hover:text-white"
                            }`}
                          >
                            {size.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accessibility options */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Haptic Touch Feedback</p>
                      <p className="text-xs text-white/50">Vibrate on successful barcode scans</p>
                    </div>
                    <Switch
                      checked={settings.hapticFeedback}
                      onCheckedChange={(checked) => handleToggleSetting("hapticFeedback", checked)}
                    />
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">High Contrast Outlines</p>
                      <p className="text-xs text-white/50">Increases outline border thickness</p>
                    </div>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => handleToggleSetting("highContrast", checked)}
                    />
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Text-to-Speech (TTS) Reader</p>
                      <p className="text-xs text-white/50">Announce scanned store prices aloud</p>
                    </div>
                    <Switch
                      checked={settings.ttsEnabled}
                      onCheckedChange={handleTtsToggle}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}