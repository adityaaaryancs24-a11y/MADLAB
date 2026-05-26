import { fetchClient } from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Types — aligned with updated FastAPI schema
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductPrice {
  id: number;
  retailer: string;
  price: number;
  in_stock: boolean;
  logo?: string;
  url?: string;
  updated_at?: string;
}

export interface PriceHistoryPoint {
  id: number;
  price: number;
  store: string;
  recorded_at: string;
}

export interface BackendProduct {
  id: number;
  upc: string;
  name: string;
  brand: string;
  image_url: string;       // renamed from `image` — matches updated schema
  description: string;
  category: string;
  created_at?: string;
  prices: ProductPrice[];
  price_history: PriceHistoryPoint[];
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory product cache
// Keyed by UPC. Stores product data + fetch timestamp for TTL validation.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  product: BackendProduct;
  fetchedAt: number;
}

const productCache = new Map<string, CacheEntry>();

// ─────────────────────────────────────────────────────────────────────────────
// Fallback placeholder image used when image_url is missing
// ─────────────────────────────────────────────────────────────────────────────

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80';

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const productService = {
  /**
   * Fetches product details by UPC from the FastAPI backend.
   * Results are cached in-memory for 5 minutes to avoid duplicate API calls.
   */
  async getProductByUPC(upc: string): Promise<BackendProduct> {
    // Check cache first
    const cached = productCache.get(upc);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      console.log(`[ProductService] Cache hit for UPC: ${upc}`);
      return cached.product;
    }

    // Fetch from backend
    console.log(`[ProductService] Fetching UPC: ${upc} from backend`);
    const product = await fetchClient<BackendProduct>(`/products/${upc}`);

    // Ensure image fallback
    if (!product.image_url) {
      product.image_url = PLACEHOLDER_IMAGE;
    }

    // Store in cache
    productCache.set(upc, { product, fetchedAt: Date.now() });

    return product;
  },

  /**
   * Manually invalidate a single cached product (e.g., after a refresh pull).
   */
  invalidateCache(upc: string): void {
    productCache.delete(upc);
    console.log(`[ProductService] Cache invalidated for UPC: ${upc}`);
  },

  /**
   * Clear the entire product cache.
   */
  clearCache(): void {
    productCache.clear();
    console.log('[ProductService] Product cache cleared');
  },

  /**
   * Returns the best (lowest) price object from a product's price list.
   */
  getBestPrice(product: BackendProduct): ProductPrice | null {
    if (!product.prices || product.prices.length === 0) return null;
    return product.prices.reduce((best, curr) =>
      curr.price < best.price ? curr : best
    );
  },
};
