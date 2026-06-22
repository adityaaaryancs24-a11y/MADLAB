import type { Product, PriceInfo, PriceHistoryPoint } from "../src/types";

export interface GroceryProduct extends Product {
  prices: PriceInfo[];
  priceHistory: PriceHistoryPoint[];
}

export const mockGroceryProducts: Record<string, GroceryProduct> = {
  "034000000210": {
    id: "gro_avocado",
    name: "Organic Hass Avocados (4-Pack)",
    brand: "Fresh Farms",
    model: "Organic Hass 4-Pack",
    upc: "034000000210",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500",
    category: "Produce",
    description: "Pack of 4 organic, perfectly ripe Hass avocados. High in monounsaturated fats and essential nutrients. Ideal for fresh guacamole, salads, or spreading on toast.",
    prices: [
      {
        store: "Walmart Grocery",
        price: 3.98,
        stock: "In Stock",
        logo: "🛒",
        url: "https://walmart.com",
      },
      {
        store: "Amazon Fresh",
        price: 4.99,
        stock: "In Stock",
        logo: "📦",
        url: "https://amazon.com",
      },
      {
        store: "Whole Foods Market",
        price: 5.49,
        stock: "In Stock",
        logo: "🥑",
        url: "https://wholefoods.com",
      },
      {
        store: "Target Grocery",
        price: 4.69,
        stock: "Limited Stock",
        logo: "🎯",
        url: "https://target.com",
      }
    ],
    priceHistory: [
      { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, price: 4.49, store: "Walmart Grocery" },
      { timestamp: Date.now() - 25 * 24 * 60 * 60 * 1000, price: 4.29, store: "Walmart Grocery" },
      { timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, price: 4.29, store: "Walmart Grocery" },
      { timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, price: 3.98, store: "Walmart Grocery" },
      { timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, price: 3.98, store: "Walmart Grocery" },
      { timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, price: 3.98, store: "Walmart Grocery" },
      { timestamp: Date.now(), price: 3.98, store: "Walmart Grocery" },
    ]
  },
  "041220002105": {
    id: "gro_yogurt",
    name: "Strawberry Greek Yogurt (32oz)",
    brand: "Chobani",
    model: "Strawberry Blended 32oz",
    upc: "041220002105",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    category: "Dairy",
    description: "Creamy, fruit-on-the-bottom strawberry blended low-fat Greek yogurt. Made with natural, non-GMO ingredients and packed with protein and active live cultures.",
    prices: [
      {
        store: "Walmart Grocery",
        price: 3.88,
        stock: "In Stock",
        logo: "🛒",
        url: "https://walmart.com",
      },
      {
        store: "Target",
        price: 3.79,
        stock: "In Stock",
        logo: "🎯",
        url: "https://target.com",
      },
      {
        store: "Whole Foods Market",
        price: 4.59,
        stock: "In Stock",
        logo: "🥑",
        url: "https://wholefoods.com",
      },
      {
        store: "Kroger",
        price: 3.99,
        stock: "Out of Stock",
        logo: "🏪",
        url: "https://kroger.com",
      }
    ],
    priceHistory: [
      { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, price: 3.99, store: "Target" },
      { timestamp: Date.now() - 25 * 24 * 60 * 60 * 1000, price: 3.89, store: "Target" },
      { timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, price: 3.89, store: "Target" },
      { timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, price: 3.79, store: "Target" },
      { timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, price: 3.79, store: "Target" },
      { timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, price: 3.79, store: "Target" },
      { timestamp: Date.now(), price: 3.79, store: "Target" },
    ]
  },
  "012993102123": {
    id: "gro_sparkling",
    name: "Lime Sparkling Water (12 Pack)",
    brand: "La Croix",
    model: "Lime 12-Pack Cans",
    upc: "012993102123",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR-qSVWFzCaJKupzXC0ddBzPbxQR69BDI-zew9CBtVX3rx08auRR2PN0_yZKjxC0neFr6cBouj7BtohWHN_TSfGlG2_4IgfDiSdhUvEKw1iywIo4vjGsUFOgHA",
    category: "Beverages",
    description: "Naturally-essenced sparkling water with a crisp lime flavor. Zero calories, zero sweeteners, and zero sodium. The perfect guilt-free refreshing drink.",
    prices: [
      {
        store: "Walmart",
        price: 5.24,
        stock: "In Stock",
        logo: "🛒",
        url: "https://walmart.com",
      },
      {
        store: "Target",
        price: 4.99,
        stock: "In Stock",
        logo: "🎯",
        url: "https://target.com",
      },
      {
        store: "Amazon Fresh",
        price: 5.99,
        stock: "Limited Stock",
        logo: "📦",
        url: "https://amazon.com",
      }
    ],
    priceHistory: [
      { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, price: 5.49, store: "Target" },
      { timestamp: Date.now() - 25 * 24 * 60 * 60 * 1000, price: 5.29, store: "Target" },
      { timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, price: 5.29, store: "Target" },
      { timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, price: 4.99, store: "Target" },
      { timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, price: 4.99, store: "Target" },
      { timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, price: 4.99, store: "Target" },
      { timestamp: Date.now(), price: 4.99, store: "Target" },
    ]
  }
};

export function getBestPrice(product: GroceryProduct): PriceInfo | null {
  if (!product.prices || product.prices.length === 0) return null;
  
  // Filter out any inputs or null-priced options
  const validPrices = product.prices.filter(p => p.price !== null && p.price !== undefined);
  if (validPrices.length === 0) return null;

  return validPrices.reduce((best, current) => {
    return (current.price as number) < (best.price as number) ? current : best;
  }, validPrices[0]);
}
