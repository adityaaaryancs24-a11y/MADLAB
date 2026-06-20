import type { Product, PriceInfo } from "../types";

// Mock product database
export const mockProducts: Record<string, Product> = {
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

// Search products by query
export function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const allProducts = Object.values(mockProducts);
  
  return allProducts.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      (product.category || "").toLowerCase().includes(searchTerm) ||
      (product.description || "").toLowerCase().includes(searchTerm)
    );
  });
}

// Generate mock price data for a product
export function getMockPrices(productId: string): PriceInfo[] {
  const basePrice = 16000 + Math.random() * 16000; // Random base price between ₹16,000-₹32,000 (INR)
  
  const prices: PriceInfo[] = [
    {
      store: "Local Store",
      logo: undefined,
      price: null,
      stock: "Enter your price",
      isInput: true,
    },
    {
      store: "Amazon India",
      logo: "🛒",
      price: parseFloat((basePrice + Math.random() * 1500).toFixed(2)),
      stock: "In Stock",
      url: "#",
      isBest: false,
    },
    {
      store: "Flipkart",
      logo: "🏷️",
      price: parseFloat((basePrice - 800 - Math.random() * 1200).toFixed(2)),
      stock: "In Stock",
      url: "#",
      isBest: false,
    },
    {
      store: "Myntra",
      logo: "👕",
      price: parseFloat((basePrice + 400 + Math.random() * 1200).toFixed(2)),
      stock: "In Stock",
      url: "#",
      isBest: false,
    },
    {
      store: "Snapdeal",
      logo: "💼",
      price: parseFloat((basePrice + 1200 + Math.random() * 1600).toFixed(2)),
      stock: "Limited Stock",
      url: "#",
      isBest: false,
    },
    {
      store: "Paytm Mall",
      logo: "💳",
      price: parseFloat((basePrice + Math.random() * 800).toFixed(2)),
      stock: "In Stock",
      url: "#",
      isBest: false,
    },
    {
      store: "Reliance Digital",
      logo: "🏪",
      price: parseFloat((basePrice + 600 + Math.random() * 1000).toFixed(2)),
      stock: "In Stock",
      url: "#",
      isBest: false,
    },
  ];

  // Mark the lowest price as best
  const lowestPriceIndex = prices.reduce((minIdx, price, idx, arr) => {
    if (price.price === null) return minIdx;
    if (minIdx === -1) return idx;
    return (price.price ?? Infinity) < (arr[minIdx].price ?? Infinity) ? idx : minIdx;
  }, -1);

  if (lowestPriceIndex !== -1) {
    prices[lowestPriceIndex].isBest = true;
  }

  return prices;
}

// Simulate barcode lookup
export function lookupBarcode(barcode: string): Product | null {
  // For demo purposes, return a random product
  const productIds = Object.keys(mockProducts);
  const randomId = productIds[Math.floor(Math.random() * productIds.length)];
  return mockProducts[randomId];
}

// Generate price history for charts
export function generatePriceHistory(days: number = 30): Array<{ date: string; price: number }> {
  const history = [];
  const basePrice = 20000 + Math.random() * 8000; // INR base price ₹20,000-₹28,000
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate price fluctuation
    const variance = (Math.random() - 0.5) * 1600; // ₹1600 variance
    const trend = -i * 40; // Slight downward trend
    const price = Math.max(basePrice + variance + trend, basePrice * 0.8);
    
    history.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
    });
  }
  
  return history;
}

// Get best deals based on price analysis
export function getBestDeals(limit: number = 5): Product[] {
  const allProducts = Object.values(mockProducts);
  
  // Calculate price score for each product (lower is better)
  const productsWithScores = allProducts.map(product => {
    const prices = getMockPrices(product.id);
    const validPrices = prices.filter(p => p.price !== null).map(p => p.price as number);
    const lowestPrice = Math.min(...validPrices);
    const avgPrice = validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length;
    const discount = ((avgPrice - lowestPrice) / avgPrice) * 100;
    
    return {
      product,
      lowestPrice,
      discount,
      score: lowestPrice / 100 - discount // Lower score = better deal
    };
  });
  
  // Sort by score and return top deals
  return productsWithScores
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(item => item.product);
}

// Generate price prediction using mock ML model
export function predictPrice(productId: string, daysAhead: number = 7) {
  const prices = getMockPrices(productId);
  const validPrices = prices.filter(p => p.price !== null).map(p => p.price as number);
  const currentPrice = Math.min(...validPrices);
  
  // Mock ML prediction logic (simplified for demo)
  const seasonalityFactor = Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 30)) * 0.05;
  const trendFactor = (Math.random() - 0.5) * 0.1;
  const demandFactor = (Math.random() - 0.3) * 0.08;
  
  const priceChange = currentPrice * (seasonalityFactor + trendFactor + demandFactor);
  const predictedPrice = Math.max(currentPrice + priceChange, currentPrice * 0.85);
  
  const priceDiff = predictedPrice - currentPrice;
  const confidence = 75 + Math.random() * 20; // 75-95% confidence
  
  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(priceDiff) < currentPrice * 0.02) {
    trend = 'stable';
  } else if (priceDiff > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }
  
  // Generate relevant factors
  const factors = [];
  if (Math.random() > 0.5) factors.push('Seasonal demand');
  if (Math.random() > 0.5) factors.push('Historical pricing patterns');
  if (Math.random() > 0.6) factors.push('Competitor pricing');
  if (Math.random() > 0.7) factors.push('Stock levels');
  if (trend === 'down') factors.push('Price drop expected');
  if (trend === 'up') factors.push('Price increase likely');
  
  return {
    productId,
    currentPrice: parseFloat(currentPrice.toFixed(2)),
    predictedPrice: parseFloat(predictedPrice.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(1)),
    trend,
    daysAhead,
    factors: factors.length > 0 ? factors : ['Market analysis', 'Price trends']
  };
}

// Get similar products for recommendations
export function getSimilarProducts(productId: string, limit: number = 4): Product[] {
  const product = mockProducts[productId];
  if (!product) return [];
  
  const allProducts = Object.values(mockProducts);
  
  // Filter by same category and exclude current product
  return allProducts
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}