import type { Product, PriceInfo, PriceHistoryPoint, PricePrediction } from "../types";

// Deterministic Random Number Generator based on LCG
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = Math.abs(seed) || 1;
  }

  // Returns a value between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns value in [min, max)
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Returns integer in [min, max)
  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }

  // Selects a random element from an array
  choice<T>(arr: T[]): T {
    return arr[this.intRange(0, arr.length)];
  }
}

// Helper to convert ID string into a numerical seed
function getSeedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hardcoded original products to preserve existing functionality (IDs 1-15)
// ─────────────────────────────────────────────────────────────────────────────
const originalProducts: Record<string, Product> = {
  "1": {
    id: "1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    model: "WH-1000XM5",
    upc: "027242920425",
    image: "https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?w=500",
    category: "Electronics",
    description: "Industry-leading noise canceling with Auto NC Optimizer",
  },
  "2": {
    id: "2",
    name: "Apple Watch Series 9",
    brand: "Apple",
    model: "Series 9",
    upc: "194253407744",
    image: "https://images.unsplash.com/photo-1739287700815-7eef4abaab4d?w=500",
    category: "Electronics",
    description: "Advanced health features with S9 chip",
  },
  "3": {
    id: "3",
    name: "Keurig K-Elite Coffee Maker",
    brand: "Keurig",
    model: "K-Elite",
    upc: "611247373835",
    image: "https://images.unsplash.com/photo-1607273177147-e7304c4d5d6c?w=500",
    category: "Home & Kitchen",
    description: "Single serve K-Cup pod coffee maker",
  },
  "4": {
    id: "4",
    name: "Nintendo Switch OLED",
    brand: "Nintendo",
    model: "OLED",
    upc: "045496883089",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500",
    category: "Gaming",
    description: "Enhanced gaming console with vibrant OLED screen",
  },
  "5": {
    id: "5",
    name: "Dyson V15 Detect",
    brand: "Dyson",
    model: "V15 Detect",
    upc: "885609021843",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
    category: "Home Appliances",
    description: "Intelligent cordless vacuum with laser detection",
  },
  "6": {
    id: "6",
    name: "Bose QuietComfort 45 Headphones",
    brand: "Bose",
    model: "QC45",
    upc: "017817822640",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
    category: "Electronics",
    description: "Premium noise-cancelling over-ear headphones",
  },
  "7": {
    id: "7",
    name: "JBL Flip 6 Portable Speaker",
    brand: "JBL",
    model: "Flip 6",
    upc: "050036377350",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    category: "Electronics",
    description: "Waterproof Bluetooth speaker with powerful sound",
  },
  "8": {
    id: "8",
    name: "Sonos One Smart Speaker",
    brand: "Sonos",
    model: "One SL",
    upc: "878286002814",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500",
    category: "Electronics",
    description: "High-quality smart speaker with voice control",
  },
  "9": {
    id: "9",
    name: "UE Boom 3 Bluetooth Speaker",
    brand: "Ultimate Ears",
    model: "Boom 3",
    upc: "097855142030",
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500",
    category: "Electronics",
    description: "360-degree portable waterproof speaker",
  },
  "10": {
    id: "10",
    name: "Apple AirPods Pro (2nd Gen)",
    brand: "Apple",
    model: "AirPods Pro",
    upc: "194253398615",
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500",
    category: "Electronics",
    description: "Active noise cancellation wireless earbuds",
  },
  "11": {
    id: "11",
    name: "Samsung Galaxy Buds2 Pro",
    brand: "Samsung",
    model: "Galaxy Buds2 Pro",
    upc: "887276636443",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
    category: "Electronics",
    description: "Intelligent 360-degree audio earbuds",
  },
  "12": {
    id: "12",
    name: "Marshall Emberton II Speaker",
    brand: "Marshall",
    model: "Emberton II",
    upc: "748931010863",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    category: "Electronics",
    description: "Compact portable Bluetooth speaker",
  },
  "13": {
    id: "13",
    name: "Beats Studio Pro Headphones",
    brand: "Beats",
    model: "Studio Pro",
    upc: "194253854142",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
    category: "Electronics",
    description: "Premium wireless headphones with spatial audio",
  },
  "14": {
    id: "14",
    name: "Anker Soundcore Motion+ Speaker",
    brand: "Anker",
    model: "Motion+",
    upc: "848061073294",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    category: "Electronics",
    description: "Hi-Res 30W Bluetooth speaker",
  },
  "15": {
    id: "15",
    name: "Sennheiser Momentum 4 Headphones",
    brand: "Sennheiser",
    model: "Momentum 4",
    upc: "615104393943",
    image: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500",
    category: "Electronics",
    description: "Audiophile wireless headphones with 60-hour battery",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Procedural Generation Data Source Mapping
// ─────────────────────────────────────────────────────────────────────────────
const categories = [
  {
    name: "Electronics",
    subcategories: ["Laptops", "Phones", "Headphones", "Smart Watches", "Home Appliances"],
    brands: ["Apple", "Samsung", "Sony", "Bose", "Dell", "HP", "Lenovo", "Asus", "LG", "Dyson"],
    nouns: {
      Laptops: ["Notebook", "Ultrabook", "ZenBook", "MacBook Clone", "Creator Pro", "ThinkPad Elite"],
      Phones: ["Galaxy Super", "iPhone S", "Pixel Neo", "OnePlus Lite", "Xperia Pro", "Mi Flagship"],
      Headphones: ["QuietSound ANC", "BassBoom Wireless", "StudioPro Over-Ear", "AirBuds Pro", "TrebleFlow"],
      "Smart Watches": ["FitBand Pro", "Active Tracker", "TimeSync GPS", "Galaxy Chrono", "iWatch Sport"],
      "Home Appliances": ["Air Purifier X", "Smart Robot Vacuum", "Espresso Barista", "Super Blender 900", "Induction Cooktop"]
    },
    images: {
      Laptops: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=500",
      Phones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
      Headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "Smart Watches": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "Home Appliances": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500"
    }
  },
  {
    name: "Grocery",
    subcategories: ["Beverages", "Dairy", "Produce", "Bakery", "Snacks"],
    brands: ["Chobani", "La Croix", "Organic Valley", "Nestle", "Kellogg's", "Driscoll's", "Kirkland", "Tropicana"],
    nouns: {
      Beverages: ["Lime Sparkling Cans 12-Pack", "Pure Coconut Water", "Premium Cold Brew Coffee", "Zero Sugar Cola", "Organic Green Tea"],
      Dairy: ["Strawberry Greek Yogurt", "Organic Whole Milk Gallon", "Salted Grass-Fed Butter", "Almond Milk Unsweetened", "Cheddar Cheese Block"],
      Produce: ["Organic Hass Avocados 4-Pack", "Fresh Strawberries Container", "Crisp Honeycrisp Apples Bag", "Baby Spinach Salad Tub", "Organic Banana Bundle"],
      Bakery: ["Sourdough Freshly Baked", "Whole Wheat Sandwich Bread", "Chocolate Chip Cookies Pack", "Gluten-Free Bagels", "Butter Croissants"],
      Snacks: ["Roasted Salted Almonds", "Sea Salt Potato Chips", "Organic Tortilla Chips", "Protein Energy Bars", "Dark Chocolate Pretzels"]
    },
    images: {
      Beverages: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      Dairy: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
      Produce: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500",
      Bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
      Snacks: "https://images.unsplash.com/photo-1599490659213-e2b9527b0876?w=500"
    }
  },
  {
    name: "Fashion",
    subcategories: ["Shirts", "Pants", "Shoes", "Jackets", "Activewear"],
    brands: ["Nike", "Adidas", "Levi's", "Zara", "H&M", "Puma", "Under Armour", "Tommy Hilfiger", "Calvin Klein"],
    nouns: {
      Shirts: ["Slim Fit Cotton Button-Down", "Classic V-Neck Tee", "Oversized Flannel Shirt", "Premium Linen Top", "Graphic Crewneck Tee"],
      Pants: ["501 Original Straight Jeans", "Sleek Slim Fit Chinos", "Flex Cargo Pants", "Tailored Dress Trousers", "Casual Corduroy Pants"],
      Shoes: ["Runner Comfort Sneakers", "Classic Leather White Lows", "Leather Chelsea Boots", "Suede Loafers", "All-Weather Hiking Boots"],
      Jackets: ["Classic Denim Trucker Jacket", "Waterproof Packable Windbreaker", "Faux Leather Moto Jacket", "Sherpa Lined Winter Parka", "Bomber Flight Jacket"],
      Activewear: ["Dry-Fit Training Shorts", "High-Waist Compression Leggings", "Athletic Quarter-Zip Pullover", "Performance Racerback Tank", "Tech Fleece Sweatpants"]
    },
    images: {
      Shirts: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
      Pants: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
      Shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      Jackets: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
      Activewear: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"
    }
  },
  {
    name: "Beauty",
    subcategories: ["Skincare", "Haircare", "Makeup", "Fragrance"],
    brands: ["L'Oreal", "Estee Lauder", "CeraVe", "Neutrogena", "Clinique", "Sephora", "MAC", "Dove", "Olay"],
    nouns: {
      Skincare: ["Hydrating Hyaluronic Serum", "Daily Moisturizing Lotion SPF 30", "Gentle Foaming Cleanser", "Retinol Night Renewal Cream", "Mineral Sunscreen Fluid"],
      Haircare: ["Argan Oil Repairing Shampoo", "Nourishing Avocado Conditioner", "Deep Conditioning Hair Mask", "Biotin Volumizing Styling Spray", "Anti-Frizz Leave-In Cream"],
      Makeup: ["Matte Finish Foundation SPF 15", "Volumizing Carbon Black Mascara", "Hydrating Lip Oil Gloss", "Warm Bronze Eyeshadow Palette", "Translucent Setting Powder"],
      Fragrance: ["Eau De Parfum Floral Breeze", "Cedarwood & Amber Cologne", "Ocean Mist Body Spray", "Vanilla Bean Roll-On Oil", "Fresh Lavender Mist"]
    },
    images: {
      Skincare: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500",
      Haircare: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
      Makeup: "https://images.unsplash.com/photo-1522337060767-14170287944b?w=500",
      Fragrance: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500"
    }
  },
  {
    name: "Sports",
    subcategories: ["Fitness Gear", "Outdoor", "Team Sports", "Cycling"],
    brands: ["Fitbit", "Garmin", "Wilson", "Spalding", "Trek", "Shimano", "Coleman", "Patagonia", "Under Armour"],
    nouns: {
      "Fitness Gear": ["Adjustable Dumbbells Set", "Non-Slip Yoga Mat 6mm", "Resistance Bands Set 5-Level", "High-Density Foam Roller", "Jump Rope Speed Cable"],
      Outdoor: ["Waterproof 4-Person Dome Tent", "Down Mummy Sleeping Bag -10F", "Trekking Poles Carbon Fiber", "Double Camping Hammock", "Insulated Hydration Pack 2L"],
      "Team Sports": ["Official Leather Basketball", "Premium Match Soccer Ball", "Aluminum Baseball Bat -3", "Professional Football (NFL Size)", "Composite Tennis Racket"],
      Cycling: ["Hybrid Commuter Bike 21-Speed", "Impact-Shield Helmet MIPS", "Waterproof Saddle Storage Bag", "Rechargeable LED Bike Lights", "Ergonomic Padded Bike Shorts"]
    },
    images: {
      "Fitness Gear": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500",
      Outdoor: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500",
      "Team Sports": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
      Cycling: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500"
    }
  }
];

const adjectives = ["Pro", "Elite", "Ultra", "Classic", "Premium", "Advance", "Signature", "Essential", "Eco", "Supreme", "Stealth", "NextGen"];

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Product Generator
// ─────────────────────────────────────────────────────────────────────────────
export const mockProducts: Record<string, Product> = { ...originalProducts };

function buildProceduralDatabase() {
  let itemIndex = 16;
  const targetCount = 525;

  while (itemIndex <= targetCount) {
    const categoryInfo = categories[(itemIndex - 16) % categories.length];
    const categoryName = categoryInfo.name;
    const subcategory = categoryInfo.subcategories[(itemIndex - 16) % categoryInfo.subcategories.length];

    // Seeded Random key specific to this itemIndex
    const rng = new SeededRandom(itemIndex * 31);

    const brand = rng.choice(categoryInfo.brands);
    const adj = rng.choice(adjectives);
    const nounList = categoryInfo.nouns[subcategory as keyof typeof categoryInfo.nouns] || ["Product"];
    const noun = rng.choice(nounList);

    const id = itemIndex.toString();
    const upc = (890123000000 + itemIndex).toString();
    const name = `${adj} ${brand} ${noun}`;
    const model = `${adj}-${rng.intRange(100, 999)}`;
    const image = (categoryInfo.images as Record<string, string>)[subcategory] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

    const rating = parseFloat(rng.range(3.8, 5.0).toFixed(1));
    const reviewsCount = rng.intRange(12, 1850);
    const stockStatus = rng.next() > 0.08 ? "In Stock" : "Out of Stock";
    const shippingEstimate = rng.choice(["Free Shipping", "Next Day Delivery", "Ships in 2-3 Days", "Standard (3-5 days)"]);

    const description = `This ${name} is the perfect addition to your life. Featuring high-quality craftsmanship from ${brand}, it delivers incredible value. Enjoy standard-setting features in the ${categoryName} -> ${subcategory} category, built to last and exceed expectations.`;

    mockProducts[id] = {
      id,
      name,
      brand,
      model,
      upc,
      image,
      category: categoryName,
      description,
      rating,
      reviewsCount,
      stockStatus,
      shippingEstimate
    };

    itemIndex++;
  }
}

// Generate the items immediately
buildProceduralDatabase();

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods Implementation (Consistent with original methods)
// ─────────────────────────────────────────────────────────────────────────────

export function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();
  const allProducts = Object.values(mockProducts);

  return allProducts.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      (product.category || "").toLowerCase().includes(searchTerm) ||
      (product.description || "").toLowerCase().includes(searchTerm) ||
      product.upc === searchTerm
    );
  });
}

export function getMockPrices(productId: string): PriceInfo[] {
  const rng = new SeededRandom(getSeedFromId(productId));

  // Determine pricing scale based on product category/ID
  const isGrocery = mockProducts[productId]?.category === "Grocery";
  const basePrice = isGrocery
    ? rng.range(80, 750) // Groceries: ₹80 - ₹750
    : rng.range(1200, 85000); // Electronics/Fashion/Beauty/Sports: ₹1,200 - ₹85,000

  // Standard Store Configs
  const prices: PriceInfo[] = [
    {
      store: "Local Store",
      logo: undefined,
      price: null,
      stock: "Enter your price",
      isInput: true,
    },
    {
      store: isGrocery ? "Amazon Fresh" : "Amazon India",
      logo: "🛒",
      price: parseFloat((basePrice + rng.range(0, basePrice * 0.08)).toFixed(2)),
      stock: "In Stock",
      url: "https://amazon.in",
      isBest: false,
    },
    {
      store: isGrocery ? "Walmart Grocery" : "Flipkart",
      logo: isGrocery ? "🏪" : "🏷️",
      price: parseFloat((basePrice - rng.range(basePrice * 0.05, basePrice * 0.02)).toFixed(2)),
      stock: rng.next() > 0.1 ? "In Stock" : "Limited Stock",
      url: "https://flipkart.com",
      isBest: false,
    },
    {
      store: isGrocery ? "BigBasket" : "Reliance Digital",
      logo: "🏬",
      price: parseFloat((basePrice + rng.range(-basePrice * 0.03, basePrice * 0.03)).toFixed(2)),
      stock: "In Stock",
      url: "https://reliance.com",
      isBest: false,
    },
    {
      store: isGrocery ? "Blinkit" : "Snapdeal",
      logo: "⚡",
      price: parseFloat((basePrice + rng.range(basePrice * 0.04, basePrice * 0.12)).toFixed(2)),
      stock: isGrocery ? "In Stock" : "Out of Stock",
      url: "https://snapdeal.com",
      isBest: false,
    }
  ];

  // Mark the lowest price as best (excluding Local Store null entry)
  let lowestIdx = -1;
  let lowestVal = Infinity;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i].price !== null && (prices[i].price ?? Infinity) < lowestVal) {
      lowestVal = prices[i].price ?? Infinity;
      lowestIdx = i;
    }
  }

  if (lowestIdx !== -1) {
    prices[lowestIdx].isBest = true;
  }

  return prices;
}

export function lookupBarcode(barcode: string): Product | null {
  const allProducts = Object.values(mockProducts);
  const found = allProducts.find(p => p.upc === barcode);
  if (found) return found;

  // Otherwise, return a random product based on barcode string hash as seed
  const rng = new SeededRandom(getSeedFromId(barcode));
  const productIds = Object.keys(mockProducts);
  const randomId = productIds[rng.intRange(0, productIds.length)];
  return mockProducts[randomId];
}

export function generatePriceHistory(days: number = 30, productId?: string): Array<{ date: string; price: number }> {
  const history = [];
  const rng = new SeededRandom(getSeedFromId(productId || "1") + 123);

  const prices = getMockPrices(productId || "1");
  const basePrice = Math.min(...prices.filter(p => p.price !== null).map(p => p.price as number)) || 1000;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Simulate random price fluctuation
    const variance = (rng.next() - 0.55) * (basePrice * 0.08); // Slight downward variance
    const trend = -i * (basePrice * 0.001); // Subtle downward drift over 30 days
    const price = Math.max(basePrice + variance + trend, basePrice * 0.7);

    history.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
    });
  }

  return history;
}

export function getBestDeals(limit: number = 5): Product[] {
  const allProducts = Object.values(mockProducts);

  const productsWithScores = allProducts.map(product => {
    const prices = getMockPrices(product.id);
    const validPrices = prices.filter(p => p.price !== null).map(p => p.price as number);
    const lowestPrice = Math.min(...validPrices) || 0;
    const avgPrice = validPrices.reduce((sum, p) => sum + p, 0) / (validPrices.length || 1);
    const discount = avgPrice > 0 ? ((avgPrice - lowestPrice) / avgPrice) * 100 : 0;

    return {
      product,
      score: lowestPrice / 100 - discount
    };
  });

  return productsWithScores
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(item => item.product);
}

export function predictPrice(productId: string, daysAhead: number = 7): PricePrediction {
  const prices = getMockPrices(productId);
  const validPrices = prices.filter(p => p.price !== null).map(p => p.price as number);
  const currentPrice = Math.min(...validPrices) || 1000;

  const rng = new SeededRandom(getSeedFromId(productId) + 456);

  // Prediction Math
  const seasonalityFactor = Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 30)) * 0.05;
  const trendFactor = (rng.next() - 0.6) * 0.12; // Slight downward trend bias
  const demandFactor = (rng.next() - 0.3) * 0.08;

  const priceChange = currentPrice * (seasonalityFactor + trendFactor + demandFactor);
  const predictedPrice = Math.max(currentPrice + priceChange, currentPrice * 0.82);

  const priceDiff = predictedPrice - currentPrice;
  const confidence = parseFloat((70 + rng.next() * 25).toFixed(1)); // 70-95% confidence

  let trend: 'Likely to Increase' | 'Likely to Decrease' | 'Stable';
  if (Math.abs(priceDiff) < currentPrice * 0.015) {
    trend = 'Stable';
  } else if (priceDiff > 0) {
    trend = 'Likely to Increase';
  } else {
    trend = 'Likely to Decrease';
  }

  const factors = [];
  if (rng.next() > 0.4) factors.push('Historical pricing patterns');
  if (rng.next() > 0.5) factors.push('Seasonal demand variations');
  if (rng.next() > 0.5) factors.push('Competitor stock pressure');
  if (trend === 'Likely to Decrease') factors.push('Anticipated overstock discount');
  if (trend === 'Likely to Increase') factors.push('Rising logistics and component costs');

  // Calculate Deal Score based on lowest historical price and predicted trend
  const avgPrice = validPrices.reduce((sum, p) => sum + p, 0) / (validPrices.length || 1);
  const discountFromAvg = avgPrice > 0 ? ((avgPrice - currentPrice) / avgPrice) * 100 : 0;
  
  let dealScore = 50 + (discountFromAvg * 2); // Base 50, adds up to 50 for a 25% discount
  if (trend === 'Likely to Increase') dealScore += 15; // Buy now before it goes up
  if (trend === 'Likely to Decrease') dealScore -= 20; // Wait for it to drop further
  
  dealScore = Math.max(0, Math.min(100, Math.round(dealScore)));
  
  const recommendation = dealScore > 70 ? 'Buy Now' : 'Wait';

  return {
    productId,
    currentPrice: parseFloat(currentPrice.toFixed(2)),
    predictedPrice: parseFloat(predictedPrice.toFixed(2)),
    confidence,
    trend,
    daysAhead,
    factors: factors.length > 0 ? factors : ['Market trend analysis'],
    dealScore,
    recommendation
  };
}

export function getSimilarProducts(productId: string, limit: number = 4): Product[] {
  const product = mockProducts[productId];
  if (!product) return [];

  const allProducts = Object.values(mockProducts);

  return allProducts
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}