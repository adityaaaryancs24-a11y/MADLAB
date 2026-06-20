import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AppState, AuthCredentials, RegisterCredentials, ScanHistoryItem, WatchlistItem, UserSettings, User, SearchHistoryItem } from "../types";
import { clearStoredToken, fetchCurrentUser, getStoredToken, loginUser, registerUser, storeToken } from "../services/authService";

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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("verity_history");
    const storedWatchlist = localStorage.getItem("verity_watchlist");
    const storedSettings = localStorage.getItem("verity_settings");
    const storedSearchHistory = localStorage.getItem("verity_search_history");

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

    const token = getStoredToken();
    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    fetchCurrentUser(token)
      .then((userData) => {
        setUser(userData);
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearStoredToken();
        localStorage.removeItem("verity_user");
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  // Persist data to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("verity_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("verity_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("verity_history", JSON.stringify(scanHistory));
  }, [scanHistory]);

  useEffect(() => {
    localStorage.setItem("verity_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem("verity_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("verity_search_history", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addToHistory = (item: ScanHistoryItem) => {
    setScanHistory((prev) => {
      // Remove duplicates and add to beginning
      const filtered = prev.filter((h) => h.productId !== item.productId);
      return [item, ...filtered].slice(0, 50); // Keep only last 50 items
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
      // Check if already in watchlist
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

  const handleAuthSuccess = (token: string, userData: User) => {
    storeToken(token);
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
    localStorage.clear();
    clearStoredToken();
  };

  const addToSearchHistory = (query: string, resultsCount: number) => {
    setSearchHistory((prev) => {
      // Remove duplicates and add to beginning
      const filtered = prev.filter((h) => h.query.toLowerCase() !== query.toLowerCase());
      return [
        { 
          id: Date.now().toString(), 
          query, 
          resultsCount, 
          timestamp: Date.now() 
        }, 
        ...filtered
      ].slice(0, 50); // Keep only last 50 items
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
    localStorage.clear();
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
