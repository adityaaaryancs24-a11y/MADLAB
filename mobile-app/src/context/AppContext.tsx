import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppState, ScanHistoryItem, WatchlistItem, UserSettings, User, SearchHistoryItem } from "../types";

interface AppContextType extends AppState {
  addToHistory: (item: ScanHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  login: (user: User) => void;
  logout: () => void;
  addToSearchHistory: (query: string, resultsCount: number) => void;
  clearSearchHistory: () => void;
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

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("verity_user");
        const storedHistory = await AsyncStorage.getItem("verity_history");
        const storedWatchlist = await AsyncStorage.getItem("verity_watchlist");
        const storedSettings = await AsyncStorage.getItem("verity_settings");
        const storedSearchHistory = await AsyncStorage.getItem("verity_search_history");

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }

        if (storedHistory) {
          setScanHistory(JSON.parse(storedHistory));
        }

        if (storedWatchlist) {
          setWatchlist(JSON.parse(storedWatchlist));
        }

        if (storedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
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

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setScanHistory([]);
    setWatchlist([]);
    setSettings(defaultSettings);
    AsyncStorage.clear();
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
    logout,
    addToSearchHistory,
    clearSearchHistory,
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