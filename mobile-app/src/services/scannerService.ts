import { productService } from "../../services/productService";
import type { Product } from "../types";

export async function lookupProductByBarcode(barcode: string): Promise<Product | null> {
  const product = await productService.getProductByUPC(barcode);

  return {
    id: String(product.id),
    name: product.name,
    brand: product.brand,
    model: product.model ?? "",
    upc: product.upc,
    image: product.image,
    category: product.category,
    description: product.description,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    stockStatus: product.stockStatus,
    shippingEstimate: product.shippingEstimate,
    prices: product.prices.map((price) => ({
      store: price.store || price.retailer,
      logo: price.logo,
      price: price.price,
      stock: price.stock,
      url: price.url,
      isBest: price.id === product.prices[0]?.id,
      lastUpdated: price.updated_at,
    })),
    priceHistory: product.price_history.map((point) => ({
      timestamp: new Date(point.recorded_at).getTime(),
      price: point.price,
      store: point.store,
    })),
    dataSource: product.dataSource,
    warning: product.warning,
  };
}
