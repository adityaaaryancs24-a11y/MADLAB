import { Product } from '../types';
import { lookupBarcode, mockProducts } from '../utils/mockData';

// OpenFoodFacts public API: https://world.openfoodfacts.org/api/v0/product/[barcode].json
// UPCItemDB public API: https://api.upcitemdb.com/prod/trial/lookup?upc=[barcode]

export async function lookupProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    // 1. Check local mock data (for seeded/existing products)
    const localProduct = lookupBarcode(barcode);
    // Ensure we only use it if it's an exact match in our DB, otherwise lookupBarcode returns a random one
    if (localProduct && Object.keys(mockProducts).some(k => mockProducts[k].upc === barcode)) {
      return localProduct;
    }

    // 2. Try OpenFoodFacts API (free, no auth required, good for grocery/food)
    try {
      const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const offData = await offResponse.json();
      
      if (offData.status === 1 && offData.product) {
        return transformOpenFoodFactsToProduct(offData.product, barcode);
      }
    } catch (e) {
      console.warn("OpenFoodFacts lookup failed:", e);
    }
    
    // 3. Fallback to UPCItemDB Trial API
    try {
      const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
      const upcData = await upcResponse.json();
      
      if (upcData.code === "OK" && upcData.items && upcData.items.length > 0) {
        return transformUPCItemDBToProduct(upcData.items[0], barcode);
      }
    } catch (e) {
      console.warn("UPCItemDB lookup failed:", e);
    }
  } catch (error) {
    console.warn("API lookup failed entirely, falling back to mock engine", error);
  }
  
  // 4. Fallback to mock product engine generating a random product based on seed
  console.log(`Falling back to mock engine for barcode: ${barcode}`);
  return lookupBarcode(barcode);
}

function transformOpenFoodFactsToProduct(data: any, barcode: string): Product {
  return {
    id: `off_${barcode}`,
    name: data.product_name || "Unknown Product",
    brand: data.brands || "Unknown Brand",
    model: data.generic_name || "",
    upc: barcode,
    image: data.image_url || data.image_front_url || "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
    category: "Grocery",
    description: data.ingredients_text || "A product from OpenFoodFacts.",
    rating: 4.5,
    reviewsCount: Math.floor(Math.random() * 500) + 10,
    stockStatus: "In Stock",
    shippingEstimate: "Standard (3-5 days)"
  };
}

function transformUPCItemDBToProduct(data: any, barcode: string): Product {
  return {
    id: `upc_${barcode}`,
    name: data.title || "Unknown Product",
    brand: data.brand || "Unknown Brand",
    model: data.model || "",
    upc: barcode,
    image: data.images && data.images.length > 0 ? data.images[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    category: data.category || "General",
    description: data.description || "Product retrieved from UPCItemDB.",
    rating: parseFloat((4 + Math.random()).toFixed(1)),
    reviewsCount: Math.floor(Math.random() * 500) + 10,
    stockStatus: "In Stock",
    shippingEstimate: "Standard (3-5 days)"
  };
}
