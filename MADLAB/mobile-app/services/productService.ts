import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";
import { DemoProduct, findDemoProductByUPC } from "../data/demoProducts";
import { findProductByUPC, Product as LocalProduct } from "../data/products";
import {
  generatePriceHistory,
  getMockPrices,
  lookupBarcode,
  mockProducts,
  predictPrice,
} from "../src/utils/mockData";
import type { Product, PriceInfo } from "../src/types";
import { fetchClient } from "./api";

const STORE_LOGOS: Record<string, string> = {
  amazon: "https://logo.clearbit.com/amazon.in",
  flipkart: "https://logo.clearbit.com/flipkart.com",
  blinkit: "https://logo.clearbit.com/blinkit.com",
  bigbasket: "https://logo.clearbit.com/bigbasket.com",
  zepto: "https://logo.clearbit.com/zeptonow.com",
  dmart: "https://logo.clearbit.com/dmart.in",
  reliance: "https://logo.clearbit.com/reliancedigital.in",
  tatacliq: "https://logo.clearbit.com/tatacliq.com",
};

function getStoreLogo(storeName: string): string | undefined {
  const nameLower = storeName.toLowerCase();
  for (const [key, url] of Object.entries(STORE_LOGOS)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }
  return undefined;
}

function getProductImage(img: any): string {
  if (!img) return PLACEHOLDER_IMAGE;
  if (typeof img === "string" && img.startsWith("http")) return img;
  if (typeof img === "number" || (typeof img === "object" && img !== null)) {
    try {
      const resolved = Image.resolveAssetSource(img);
      return resolved ? resolved.uri : PLACEHOLDER_IMAGE;
    } catch {
      return PLACEHOLDER_IMAGE;
    }
  }
  return PLACEHOLDER_IMAGE;
}

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
const CACHE_PREFIX = "verity_product_cache_";
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

function normalizePrices(
  productId: string, 
  prices?: PriceInfo[], 
  category?: string, 
  name?: string
): ProductPrice[] {
  const finalPrices = prices ?? getMockPrices(productId, category, name);
  return finalPrices
    .filter((price) => price.price !== null && !price.isInput)
    .map((price, index) => {
      const resolvedLogo = price.logo && (price.logo.startsWith("http") || price.logo.startsWith("file"))
        ? price.logo
        : getStoreLogo(price.store);

      return {
        id: index + 1,
        retailer: price.store,
        store: price.store,
        price: Number(price.price ?? 0),
        in_stock: price.stock !== "Out of Stock",
        stock: price.stock,
        logo: resolvedLogo,
        url: price.url,
        updated_at: price.lastUpdated ?? new Date().toISOString(),
      };
    })
    .sort((a, b) => a.price - b.price);
}

function normalizeHistory(
  productId: string, 
  category?: string, 
  name?: string
): PriceHistoryPoint[] {
  return generatePriceHistory(30, productId, category, name).map((point, index) => ({
    id: index + 1,
    price: point.price,
    store: "Best retailer",
    date: point.date,
    recorded_at: new Date(Date.now() - (30 - index) * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function backendResponseToBackendProduct(data: any): BackendProduct {
  const prices = (data.prices || []).map((p: any) => ({
    id: p.id,
    retailer: p.retailer,
    store: p.retailer,
    price: p.price,
    in_stock: p.in_stock ?? true,
    stock: (p.in_stock ?? true) ? "In Stock" : "Out of Stock",
    logo: p.logo,
    url: p.url,
    updated_at: p.updated_at,
  }));

  const priceHistory = (data.price_history || []).map((h: any) => ({
    id: h.id,
    price: h.price,
    store: h.store,
    recorded_at: h.recorded_at,
    date: new Date(h.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return {
    id: data.id,
    upc: data.upc,
    name: data.name,
    brand: data.brand || "Unknown Brand",
    model: data.name,
    image: data.image_url || PLACEHOLDER_IMAGE,
    image_url: data.image_url || PLACEHOLDER_IMAGE,
    description: data.description || "",
    category: data.category || "Grocery",
    prices: prices.sort((a: any, b: any) => a.price - b.price),
    price_history: priceHistory.sort((a: any, b: any) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()),
    dataSource: "local",
    pricePrediction: predictPrice(data.upc),
  };
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
      logo: getStoreLogo(price.store),
      url: price.url,
      updated_at: new Date().toISOString(),
    }))
    .sort((a, b) => a.price - b.price);

  const totalPoints = product.priceHistory.length;
  const priceHistory = product.priceHistory.map((point, index) => {
    const daysAgo = Math.round(((totalPoints - 1 - index) / Math.max(1, totalPoints - 1)) * 30);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - daysAgo);
    const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
      id: index + 1,
      price: point.price,
      store: prices[0]?.store ?? "Best retailer",
      date: dateStr,
      recorded_at: dateObj.toISOString(),
    };
  });

  const resolvedImage = getProductImage(product.image);

  return {
    id: product.upc,
    upc: product.upc,
    name: product.name,
    brand: product.brand,
    model: product.name,
    image: resolvedImage,
    image_url: resolvedImage,
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
      logo: getStoreLogo(price.store),
      url: price.url,
      updated_at: new Date().toISOString(),
    }))
    .sort((a, b) => a.price - b.price);

  const totalPoints = product.price_history.length;
  const priceHistory = product.price_history.map((point, index) => {
    const daysAgo = Math.round(((totalPoints - 1 - index) / Math.max(1, totalPoints - 1)) * 30);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - daysAgo);
    const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
      id: index + 1,
      price: point.price,
      store: prices[0]?.store ?? "Best retailer",
      date: dateStr,
      recorded_at: dateObj.toISOString(),
    };
  });

  const resolvedImage = getProductImage(product.image);

  return {
    id: product.upc,
    upc: product.upc,
    name: product.name,
    brand: product.brand,
    model: product.name,
    image: resolvedImage,
    image_url: resolvedImage,
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
  const prices = normalizePrices(product.id, product.prices, product.category, product.name);
  const priceHistory =
    product.priceHistory?.map((point, index) => ({
      id: index + 1,
      price: point.price,
      store: point.store,
      recorded_at: new Date(point.timestamp).toISOString(),
    })) ?? normalizeHistory(product.id, product.category, product.name);

  const resolvedImage = getProductImage(product.image);

  return {
    id: product.id,
    upc: product.upc,
    name: product.name,
    brand: product.brand,
    model: product.model,
    image: resolvedImage,
    image_url: resolvedImage,
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

    // A. Query Backend Database API First
    try {
      console.log("[ProductService] Querying Backend API for UPC:", upc);
      const response = await fetchClient<any>(`/products/${upc}`);
      if (response && response.upc) {
        console.log("[ProductService] Backend API hit:", response);
        const backendProduct = backendResponseToBackendProduct(response);
        await writeCache(upc, backendProduct);
        return backendProduct;
      }
    } catch (error) {
      console.warn("[ProductService] Backend API failed, falling back to local lookup:", error);
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
