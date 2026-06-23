import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import { auth } from "../config/firebase";
import type { AppState, ScanHistoryItem, WatchlistItem, UserSettings, User, SearchHistoryItem } from "../types";
import { themeSignal } from "../utils/themeSignal";

interface AppContextType extends AppState {
  addToHistory: (item: ScanHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addToSearchHistory: (query: string, resultsCount: number) => void;
  clearSearchHistory: () => void;
  updateUserProfile: (profile: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearWatchlist: () => void;
  isAuthLoading: boolean;
}

const defaultSettings: UserSettings = {
  preferredStores: {
    amazon: true,
    flipkart: true,
    blinkit: true,
    bigbasket: true,
    zepto: true,
    dmart: true,
    reliance: true,
    tatacliq: true,
  },
  currency: "INR",
  scanSound: true,
  hapticFeedback: true,
  priceAlerts: true,
  darkMode: false,
  themeMode: "dark",
  accentColor: "emerald",
  priceAlertThreshold: 10,
  alertSound: "chime",
  weeklyDigest: false,
  pushNotifications: true,
  emailNotifications: true,
  fontSize: "medium",
  offlineMode: false,
  ttsEnabled: false,
  highContrast: false,
  notifications: {
    priceDrops: true,
    weeklyDigest: false,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem("verity_history");
        const storedWatchlist = await AsyncStorage.getItem("verity_watchlist");
        const storedSettings = await AsyncStorage.getItem("verity_settings");
        const storedSearchHistory = await AsyncStorage.getItem("verity_search_history");

        if (storedHistory) {
          setScanHistory(JSON.parse(storedHistory));
        }

        if (storedWatchlist) {
          const savedWatchlist = JSON.parse(storedWatchlist) as WatchlistItem[];
          setWatchlist(savedWatchlist.filter((item) => !item.id.startsWith("sample_watch_")));
        }

        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          const cleanedThemeMode = (parsed.themeMode === "light" || parsed.themeMode === "dark") ? parsed.themeMode : "dark";
          setSettings({ ...defaultSettings, ...parsed, themeMode: cleanedThemeMode });
          themeSignal.emit(cleanedThemeMode);
        } else {
          themeSignal.emit(defaultSettings.themeMode === "light" ? "light" : "dark");
        }

        if (storedSearchHistory) {
          setSearchHistory(JSON.parse(storedSearchHistory));
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsReady(true);
      }
    };
    
    loadData();

    // Dynamically synchronize authentication status with Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          email: firebaseUser.email || "",
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Persist data to AsyncStorage (only after initial load has finished)
  useEffect(() => {
    if (!isReady) return;
    const saveUser = async () => {
      if (user) {
        await AsyncStorage.setItem("verity_user", JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem("verity_user");
      }
    };
    saveUser();
  }, [user, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem("verity_history", JSON.stringify(scanHistory));
  }, [scanHistory, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem("verity_watchlist", JSON.stringify(watchlist));
  }, [watchlist, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem("verity_settings", JSON.stringify(settings));
  }, [settings, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem("verity_search_history", JSON.stringify(searchHistory));
  }, [searchHistory, isReady]);

  const addToHistory = (item: ScanHistoryItem) => {
    setScanHistory((prev) => {
      const filtered = prev.filter((h) => h.productId !== item.productId);
      return [item, ...filtered].slice(0, 50);
    });
  };

  const removeFromHistory = (id: string) => {
    setScanHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  const addToWatchlist = (item: WatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.productId === item.productId)) {
        return prev;
      }
      return [item, ...prev];
    });
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const updateWatchlistItem = (id: string, updates: Partial<WatchlistItem>) => {
    setWatchlist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.themeMode && (newSettings.themeMode === "light" || newSettings.themeMode === "dark")) {
        themeSignal.emit(newSettings.themeMode);
      }
      return updated;
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
      setUser({
        id: userCredential.user.uid,
        name: name,
        email: email,
      });
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
    setScanHistory([]);
    setWatchlist([]);
    setSettings(defaultSettings);
    await AsyncStorage.clear();
  };

  const addToSearchHistory = (query: string, resultsCount: number) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h.query.toLowerCase() !== query.toLowerCase());
      return [
        { 
          id: Date.now().toString(), 
          query, 
          resultsCount, 
          timestamp: Date.now() 
        }, 
        ...filtered
      ].slice(0, 50);
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const updateUserProfile = async (profile: Partial<User>) => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      if (profile.name) {
        await updateProfile(firebaseUser, { displayName: profile.name });
      }
      setUser((prev) => prev ? { ...prev, ...profile } : null);
    }
  };

  const deleteAccount = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await deleteUser(firebaseUser);
      setUser(null);
      setIsAuthenticated(false);
      setScanHistory([]);
      setWatchlist([]);
      setSettings(defaultSettings);
      await AsyncStorage.clear();
    }
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  const value: AppContextType = {
    user,
    scanHistory,
    watchlist,
    settings,
    isAuthenticated,
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    updateSettings,
    login,
    signup,
    logout,
    addToSearchHistory,
    clearSearchHistory,
    updateUserProfile,
    deleteAccount,
    clearWatchlist,
    isAuthLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
