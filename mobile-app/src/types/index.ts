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
  rating?: number;
  reviewsCount?: number;
  stockStatus?: string;
  shippingEstimate?: string;
  prices?: PriceInfo[];
  priceHistory?: PriceHistoryPoint[];
  dataSource?: "openfoodfacts" | "upcitemdb" | "mock" | "cache" | "local";
  warning?: string;
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
  /**
   * The scannable barcode (UPC/EAN) for this product.
   * Used to navigate to /product/[upc] when tapping the card.
   * For manually-entered products this may be empty string or the
   * user-supplied UPC (if any).
   */
  upc: string;
  name: string;
  brand: string;
  image: string;
  currentPrice: number;
  previousPrice: number;
  priceDropPercent: number;
  targetPrice?: number;
  priceHistory: PriceHistoryPoint[];
  addedAt: number;
  url?: string;
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
  themeMode: 'light' | 'dark' | 'system';
  accentColor: 'emerald' | 'blue' | 'orange' | 'purple';
  priceAlertThreshold: number;
  alertSound: 'chime' | 'beep' | 'none';
  weeklyDigest: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  fontSize: 'small' | 'medium' | 'large';
  offlineMode: boolean;
  ttsEnabled: boolean;
  highContrast: boolean;
  notifications: {
    priceDrops: boolean;
    weeklyDigest: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  membershipTier?: 'Free' | 'Pro';
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
  trend: 'Likely to Increase' | 'Likely to Decrease' | 'Stable';
  daysAhead: number;
  factors: string[];
  dealScore?: number;
  recommendation?: 'Buy Now' | 'Wait';
}

export type WishlistFilter = 'all' | 'price_dropped' | 'lowest_ever' | 'high_savings' | 'recently_added';
export type WishlistSort = 'newest' | 'oldest' | 'highest_discount' | 'lowest_price' | 'highest_savings';