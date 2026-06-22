import AsyncStorage from "@react-native-async-storage/async-storage";
import { DemoProduct, findDemoProductByUPC } from "../data/demoProducts";
import { findProductByUPC, Product as LocalProduct } from "../data/products";
import {
  generatePriceHistory,
  getMockPrices,
  lookupBarcode,
  mockProducts,
  predictPrice,
} from "../src/utils/mockData";
import type { Product } from "../src/types";

export interface ProductPrice {
  id: number;
  retailer: string;
  store: string;
  price: number;
  in_stock: boolean;
  stock: string;
  logo?: string;
  url?: string;
  updated_at?: string;
}

export interface PriceHistoryPoint {
  id: number;
  price: number;
  store: string;
  recorded_at: string;
  date?: string;
}

export type ProductDataSource = "openfoodfacts" | "upcitemdb" | "mock" | "cache" | "local";

export interface BackendProduct {
  id: string | number;
  upc: string;
  name: string;
  brand: string;
  image: string;
  image_url: string;
  description: string;
  category: string;
  model?: string;
  rating?: number;
  reviewsCount?: number;
  stockStatus?: string;
  shippingEstimate?: string;
  prices: ProductPrice[];
  price_history: PriceHistoryPoint[];
  dataSource: ProductDataSource;
  warning?: string;
  pricePrediction?: ReturnType<typeof predictPrice>;
}

interface CacheEntry {
  product: BackendProduct;
  fetchedAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_PREFIX = "verity_product_cache_v2_";//to clear the old cache
const REQUEST_TIMEOUT_MS = 8000;

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80";

const memoryCache = new Map<string, CacheEntry>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanBarcode(upc: string) {
  return upc.replace(/\D/g, "").trim();
}

async function fetchJsonWithTimeout<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal as any,
      headers: {
        Accept: "application/json",
        "User-Agent": "VerityApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withRetry<T>(task: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await sleep(350 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Lookup failed");
}

function normalizePrices(productId: string, prices = getMockPrices(productId)): ProductPrice[] {
  return prices
    .filter((price) => price.price !== null && !price.isInput)
    .map((price, index) => ({
      id: index + 1,
      retailer: price.store,
      store: price.store,
      price: Number(price.price ?? 0),
      in_stock: price.stock !== "Out of Stock",
      stock: price.stock,
      logo: price.logo,
      url: price.url,
      updated_at: price.lastUpdated ?? new Date().toISOString(),
    }))
    .sort((a, b) => a.price - b.price);
}

function normalizeHistory(productId: string): PriceHistoryPoint[] {
  return generatePriceHistory(30, productId).map((point, index) => ({
    id: index + 1,
    price: point.price,
    store: "Best retailer",
    date: point.date,
    recorded_at: new Date(Date.now() - (30 - index) * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function localProductToBackendProduct(product: LocalProduct): BackendProduct {
  const prices = product.prices
    .map((price, index) => ({
      id: index + 1,
      retailer: price.store,
      store: price.store,
      price: price.price,
      in_stock: true,
      stock: "In Stock",
      url: price.url,
      updated_at: new Date().toISOString(),
    }))
    .sort((a, b) => a.price - b.price);

  const priceHistory = product.priceHistory.map((point, index) => ({
    id: index + 1,
    price: point.price,
    store: prices[0]?.store ?? "Best retailer",
    date: point.date,
    recorded_at: new Date(point.date).toISOString(),
  }));

  return {
    id: product.upc,
    upc: product.upc,
    name: product.name,
    brand: product.brand,
    model: product.name,
    image: product.image || PLACEHOLDER_IMAGE,
    image_url: product.image || PLACEHOLDER_IMAGE,
    description: product.description,
    category: product.category,
    rating: 4.5,
    reviewsCount: 128,
    stockStatus: "In Stock",
    shippingEstimate: "Available today",
    prices,
    price_history: priceHistory,
    dataSource: "local",
    pricePrediction: predictPrice(product.upc),
  };
}

function demoProductToBackendProduct(product: DemoProduct): BackendProduct {
  const prices = product.prices
    .map((price, index) => ({
      id: index + 1,
      retailer: price.store,
      store: price.store,
      price: price.price,
      in_stock: true,
      stock: "In Stock",
      url: price.url,
      updated_at: new Date().toISOString(),
    }))
    .sort((a, b) => a.price - b.price);

  const priceHistory = product.price_history.map((point, index) => ({
    id: index + 1,
    price: point.price,
    store: prices[0]?.store ?? "Best retailer",
    date: point.date,
    recorded_at: new Date(point.date).toISOString(),
  }));

  return {
    id: product.upc,
    upc: product.upc,
    name: product.name,
    brand: product.brand,
    model: product.name,
    image: product.image || PLACEHOLDER_IMAGE,
    image_url: product.image || PLACEHOLDER_IMAGE,
    description: product.description,
    category: product.category,
    rating: 4.6,
    reviewsCount: 156,
    stockStatus: "In Stock",
    shippingEstimate: "Available today",
    prices,
    price_history: priceHistory,
    dataSource: "local",
    pricePrediction: product.pricePrediction,
  };
}

function productToBackendProduct(
  product: Product,
  source: ProductDataSource,
  warning?: string
): BackendProduct {
  const prices = normalizePrices(product.id, product.prices ?? getMockPrices(product.id));
  const priceHistory =
    product.priceHistory?.map((point, index) => ({
      id: index + 1,
      price: point.price,
      store: point.store,
      recorded_at: new Date(point.timestamp).toISOString(),
    })) ?? normalizeHistory(product.id);

  return {
    id: product.id,
    upc: product.upc,
    name: product.name,
    brand: product.brand,
    model: product.model,
    image: product.image || PLACEHOLDER_IMAGE,
    image_url: product.image || PLACEHOLDER_IMAGE,
    description: product.description ?? `${product.name} from ${product.brand}.`,
    category: product.category ?? "General",
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    stockStatus: product.stockStatus,
    shippingEstimate: product.shippingEstimate,
    prices,
    price_history: priceHistory,
    dataSource: source,
    warning,
    pricePrediction: predictPrice(product.id),
  };
}

function fallbackMockProduct(upc: string, warning?: string): BackendProduct {
  const product = lookupBarcode(upc);
  if (!product) {
    throw new Error("Mock product engine failed to create fallback data.");
  }

  return productToBackendProduct(
    { ...product, upc },
    "mock",
    warning ?? "Live product APIs were unavailable, so Verity is showing realistic mock data."
  );
}

async function readCache(upc: string, allowExpired = false): Promise<BackendProduct | null> {
  const memoryEntry = memoryCache.get(upc);
  if (memoryEntry && (allowExpired || Date.now() - memoryEntry.fetchedAt < CACHE_TTL_MS)) {
    return { ...memoryEntry.product, dataSource: "cache" };
  }

  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${upc}`);
  if (!raw) return null;

  const entry = JSON.parse(raw) as CacheEntry;
  memoryCache.set(upc, entry);

  if (!allowExpired && Date.now() - entry.fetchedAt >= CACHE_TTL_MS) {
    return null;
  }

  return { ...entry.product, dataSource: "cache" };
}

async function writeCache(upc: string, product: BackendProduct) {
  const entry: CacheEntry = { product, fetchedAt: Date.now() };
  memoryCache.set(upc, entry);
  await AsyncStorage.setItem(`${CACHE_PREFIX}${upc}`, JSON.stringify(entry));
}

async function lookupOpenFoodFacts(upc: string): Promise<BackendProduct | null> {
  const data = await withRetry<any>(() =>
    fetchJsonWithTimeout(`https://world.openfoodfacts.org/api/v0/product/${upc}.json`)
  );

  if (data.status !== 1 || !data.product) return null;

  const off = data.product;
  const product: Product = {
    id: `off_${upc}`,
    upc,
    name: off.product_name || off.generic_name || "Unknown grocery product",
    brand: String(off.brands || "Unknown Brand").split(",")[0].trim(),
    model: off.generic_name || "",
    image: off.image_front_url || off.image_url || PLACEHOLDER_IMAGE,
    category: "Grocery",
    description: off.ingredients_text || off.product_name || "Product details from OpenFoodFacts.",
    rating: 4.4,
    reviewsCount: 120,
    stockStatus: "In Stock",
    shippingEstimate: "Ships in 2-3 days",
  };

  return productToBackendProduct(product, "openfoodfacts");
}

async function lookupUPCItemDB(upc: string): Promise<BackendProduct | null> {
  const data = await withRetry<any>(() =>
    fetchJsonWithTimeout(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`)
  );

  const item = data?.items?.[0];
  if (data.code !== "OK" || !item) return null;

  const product: Product = {
    id: `upc_${upc}`,
    upc,
    name: item.title || "Unknown product",
    brand: item.brand || "Unknown Brand",
    model: item.model || "",
    image: item.images?.[0] || PLACEHOLDER_IMAGE,
    category: item.category || "General",
    description: item.description || "Product details from UPCItemDB.",
    rating: 4.3,
    reviewsCount: 95,
    stockStatus: "In Stock",
    shippingEstimate: "Standard (3-5 days)",
  };

  return productToBackendProduct(product, "upcitemdb");
}

function lookupLocalDatabaseExact(upc: string): BackendProduct | null {
  const demoProduct = findDemoProductByUPC(upc);
  if (demoProduct) {
    console.log("[LOCAL DB MATCH]", demoProduct.upc);
    return demoProductToBackendProduct(demoProduct);
  }

  const localProduct = findProductByUPC(upc);
  if (localProduct) {
    console.log("[LOCAL DB MATCH]", localProduct.upc);
    return localProductToBackendProduct(localProduct);
  }

  return null;
}

function lookupLocalExact(upc: string): BackendProduct | null {
  const exact = Object.values(mockProducts).find((product) => product.upc === upc);
  return exact ? productToBackendProduct(exact, "mock") : null;
}

export const productService = {
  async getProductByUPC(rawUpc: string): Promise<BackendProduct> {
    console.log("[ProductService] Raw UPC:", rawUpc);
    const upc = cleanBarcode(rawUpc);
    console.log("[ProductService] Normalized UPC:", upc);
    if (!upc) {
      console.log("[ProductService] Invalid UPC after normalization");
      throw new Error("Please enter a valid UPC or EAN barcode.");
    }

    const exactLocal = lookupLocalDatabaseExact(upc);
    if (exactLocal) {
      console.log("[ProductService] Local UPC database hit:", exactLocal);
      await writeCache(upc, exactLocal);
      return exactLocal;
    }
    console.log("[ProductService] Local UPC database miss:", upc);

    const freshCached = await readCache(upc);
    if (freshCached) {
      console.log("[ProductService] Cache hit:", freshCached);
      return freshCached;
    }
    console.log("[ProductService] Cache miss:", upc);

    try {
      console.log("[ProductService] Querying OpenFoodFacts:", upc);
      const offProduct = await lookupOpenFoodFacts(upc);
      if (offProduct) {
        console.log("[ProductService] OpenFoodFacts hit:", offProduct);
        await writeCache(upc, offProduct);
        return offProduct;
      }
      console.log("[ProductService] OpenFoodFacts returned null:", upc);
    } catch (error) {
      console.warn("[ProductService] OpenFoodFacts lookup failed", error);
    }

    try {
      console.log("[ProductService] Querying UPCItemDB:", upc);
      const upcProduct = await lookupUPCItemDB(upc);
      if (upcProduct) {
        console.log("[ProductService] UPCItemDB hit:", upcProduct);
        await writeCache(upc, upcProduct);
        return upcProduct;
      }
      console.log("[ProductService] UPCItemDB returned null:", upc);
    } catch (error) {
      console.warn("[ProductService] UPCItemDB lookup failed", error);
    }

    const exactMock = lookupLocalExact(upc);
    if (exactMock) {
      const warnedMock = {
        ...exactMock,
        warning: "Live product APIs were unavailable, so Verity is showing local mock catalog data.",
      };
      console.log("[ProductService] Existing mock catalog hit:", warnedMock);
      await writeCache(upc, warnedMock);
      return warnedMock;
    }
    console.log("[ProductService] Existing mock catalog miss:", upc);

    const offlineCached = await readCache(upc, true);
    if (offlineCached) {
      console.log("[ProductService] Expired cache hit:", offlineCached);
      return {
        ...offlineCached,
        warning: "You appear to be offline. Showing the last cached result for this barcode.",
      };
    }

    const mockProduct = fallbackMockProduct(upc);
    console.log("[ProductService] Fallback mock generated:", mockProduct);
    await writeCache(upc, mockProduct);
    return mockProduct;
  },

  async retryLookup(upc: string): Promise<BackendProduct> {
    await this.invalidateCache(upc);
    return this.getProductByUPC(upc);
  },

  async invalidateCache(upc: string): Promise<void> {
    const cleaned = cleanBarcode(upc);
    memoryCache.delete(cleaned);
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${cleaned}`);
  },

  async clearCache(): Promise<void> {
    memoryCache.clear();
    const keys = await AsyncStorage.getAllKeys();
    const productKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (productKeys.length > 0) {
      await Promise.all(productKeys.map((key) => AsyncStorage.removeItem(key)));
    }
  },

  getBestPrice(product: BackendProduct): ProductPrice | null {
    if (!product.prices || product.prices.length === 0) return null;
    return product.prices.reduce((best, current) =>
      current.price < best.price ? current : best
    );
  },
};
