import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Store, 
  DollarSign, 
  Volume2, 
  Vibrate, 
  Trash2, 
  ChevronRight, 
  Bell, 
  Moon, 
  LogOut, 
  User,
  TrendingDown,
  Zap,
  Shield,
  Sparkles
} from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, user, logout, clearHistory } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggleStore = (store: string) => {
    const newStores = {
      ...localSettings.preferredStores,
      [store]: !localSettings.preferredStores[store],
    };
    const updated = { ...localSettings, preferredStores: newStores };
    setLocalSettings(updated);
    updateSettings({ preferredStores: newStores });
    toast.success(`${store} ${newStores[store] ? "enabled" : "disabled"}`);
  };

  const handleToggleSetting = (key: keyof typeof localSettings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    updateSettings({ [key]: value });
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all scan history?")) {
      clearHistory();
      toast.success("History cleared!");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      toast.success("Logged out successfully");
      navigate("/");
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
    <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#2ECC71] opacity-10 blur-[120px] rounded-full"></div>
        <div className="absolute top-96 right-1/4 w-96 h-96 bg-[#F4A261] opacity-10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 backdrop-blur-xl bg-[#0A0E15]/50 sticky top-0 z-10">
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

      <div className="px-6 py-6 relative z-10">
        {/* User Profile Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#25A65A] flex items-center justify-center shadow-lg shadow-[#2ECC71]/30">
                <User className="w-8 h-8 text-[#0A0E15]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{user.name}</h3>
                <p className="text-sm text-white/60">{user.email}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preferred Stores Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-[#2ECC71]" />
            <h2 className="font-bold text-white">Preferred Stores</h2>
          </div>
          <div className="space-y-3">
            {storeOptions.map((store, index) => (
              <motion.div
                key={store.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{store.emoji}</span>
                  <span className="font-semibold text-white">{store.label}</span>
                </div>
                <Switch
                  checked={localSettings.preferredStores[store.key]}
                  onCheckedChange={() => handleToggleStore(store.label)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[#F4A261]" />
            <h2 className="font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4A261]/20 to-[#F4A261]/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-[#F4A261]" />
                </div>
                <div>
                  <p className="font-semibold text-white">Price Drop Alerts</p>
                  <p className="text-xs text-white/50">Get notified of price changes</p>
                </div>
              </div>
              <Switch
                checked={localSettings.notifications.priceDrops}
                onCheckedChange={(checked) =>
                  handleToggleSetting("notifications", {
                    ...localSettings.notifications,
                    priceDrops: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#60A5FA]/20 to-[#60A5FA]/10 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <div>
                  <p className="font-semibold text-white">Sound</p>
                  <p className="text-xs text-white/50">Play sounds for alerts</p>
                </div>
              </div>
              <Switch
                checked={localSettings.notifications.sound}
                onCheckedChange={(checked) =>
                  handleToggleSetting("notifications", {
                    ...localSettings.notifications,
                    sound: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A78BFA]/20 to-[#A78BFA]/10 flex items-center justify-center">
                  <Vibrate className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <div>
                  <p className="font-semibold text-white">Vibration</p>
                  <p className="text-xs text-white/50">Vibrate on scan complete</p>
                </div>
              </div>
              <Switch
                checked={localSettings.notifications.vibrate}
                onCheckedChange={(checked) =>
                  handleToggleSetting("notifications", {
                    ...localSettings.notifications,
                    vibrate: checked,
                  })
                }
              />
            </div>
          </div>
        </motion.div>

        {/* Price Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-[#2ECC71]" />
            <h2 className="font-bold text-white">Price Settings</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <div>
                <p className="font-semibold text-white mb-1">Currency</p>
                <p className="text-sm text-white/50">INR (₹)</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </div>
        </motion.div>

        {/* Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearHistory}
            className="w-full flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-red-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <span className="font-semibold text-white">Clear History</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-red-400 transition-colors" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-red-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <span className="font-semibold text-white">Log Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-red-400 transition-colors" />
          </motion.button>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-6 border-t border-white/5"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2ECC71] to-[#25A65A] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#0A0E15]" fill="currentColor" />
            </div>
            <p className="font-bold text-white">Verity</p>
          </div>
          <p className="text-sm text-white/40">Version 1.0.0</p>
          <p className="text-xs text-white/30 mt-2">Scan the Barcode. See the Real Price.</p>
        </motion.div>
      </div>
    </div>
  );
}