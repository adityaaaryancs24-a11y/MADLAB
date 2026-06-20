import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppState, AuthCredentials, RegisterCredentials, ScanHistoryItem, WatchlistItem, UserSettings, User, SearchHistoryItem } from "../types";
import { clearStoredToken, fetchCurrentUser, getStoredToken, loginUser, registerUser, storeToken } from "../../services/authService";

interface AppContextType extends AppState {
  addToHistory: (item: ScanHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  login: (credentials: AuthCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
  addToSearchHistory: (query: string, resultsCount: number) => void;
  clearSearchHistory: () => void;
  updateUserProfile: (profile: Partial<User>) => void;
  deleteAccount: () => void;
  clearWatchlist: () => void;
}

const defaultSettings: UserSettings = {
  preferredStores: {
    amazon: true,
    ebay: true,
    walmart: true,
    target: false,
    bestbuy: false,
  },
  currency: "USD",
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isReady, setIsReady] = useState(false);

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
          setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
        }

        if (storedSearchHistory) {
          setSearchHistory(JSON.parse(storedSearchHistory));
        }

        const token = await getStoredToken();
        if (token) {
          const currentUser = await fetchCurrentUser(token);
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
        await clearStoredToken();
        await AsyncStorage.removeItem("verity_user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
        setIsReady(true);
      }
    };
    
    loadData();
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
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleAuthSuccess = async (token: string, userData: User) => {
    await storeToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const login = async (credentials: AuthCredentials) => {
    const auth = await loginUser(credentials);
    return handleAuthSuccess(auth.accessToken, auth.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    const auth = await registerUser(credentials);
    return handleAuthSuccess(auth.accessToken, auth.user);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setScanHistory([]);
    setWatchlist([]);
    setSettings(defaultSettings);
    AsyncStorage.clear();
    clearStoredToken();
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

  const updateUserProfile = (profile: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...profile } : null);
  };

  const deleteAccount = () => {
    setUser(null);
    setIsAuthenticated(false);
    setScanHistory([]);
    setWatchlist([]);
    setSettings(defaultSettings);
    AsyncStorage.clear();
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
    isAuthLoading,
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    updateSettings,
    login,
    register,
    logout,
    addToSearchHistory,
    clearSearchHistory,
    updateUserProfile,
    deleteAccount,
    clearWatchlist,
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
