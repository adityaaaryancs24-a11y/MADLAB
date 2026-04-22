// Core types for the Verity app

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  upc: string;
  image: string;
  category?: string;
  description?: string;
}

export interface PriceInfo {
  store: string;
  logo?: string;
  price: number | null;
  stock: string;
  url?: string;
  isBest?: boolean;
  isInput?: boolean;
  lastUpdated?: string;
}

export interface ScanHistoryItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  bestPrice: string;
  store: string;
  timestamp: number;
  upc: string;
}

export interface WatchlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  currentPrice: number;
  previousPrice: number;
  priceDropPercent: number;
  targetPrice?: number;
  priceHistory: PriceHistoryPoint[];
  addedAt: number;
}

export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  store: string;
}

export interface UserSettings {
  preferredStores: {
    [key: string]: boolean;
  };
  currency: string;
  scanSound: boolean;
  hapticFeedback: boolean;
  priceAlerts: boolean;
  darkMode: boolean;
  notifications: {
    priceDrops: boolean;
    weeklyDigest: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AppState {
  user: User | null;
  scanHistory: ScanHistoryItem[];
  watchlist: WatchlistItem[];
  settings: UserSettings;
  isAuthenticated: boolean;
  searchHistory: SearchHistoryItem[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultsCount: number;
}

export interface PricePrediction {
  productId: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  daysAhead: number;
  factors: string[];
}