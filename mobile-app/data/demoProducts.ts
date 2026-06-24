export interface DemoProductPrice {
  store: string;
  price: number;
  url?: string;
}

export interface DemoProductPriceHistoryPoint {
  date: string;
  price: number;
}

export interface DemoProductPricePrediction {
  productId: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  trend: "Likely to Increase" | "Likely to Decrease" | "Stable";
  daysAhead: number;
  factors: string[];
  dealScore: number;
  recommendation: "Buy Now" | "Wait";
}

export interface DemoProduct {
  upc: string;
  name: string;
  brand: string;
  image: string;
  description: string;
  category: string;
  prices: DemoProductPrice[];
  price_history: DemoProductPriceHistoryPoint[];
  pricePrediction: DemoProductPricePrediction;
}

const retailerUrls = {
  Amazon: "https://www.amazon.in",
  Flipkart: "https://www.flipkart.com",
  Blinkit: "https://blinkit.com",
  BigBasket: "https://www.bigbasket.com",
};

export const demoProducts: DemoProduct[] = [
  {
    upc: "8902519010124",
    name: "Classmate Notebook",
    brand: "Classmate",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
    description:
      "A ruled Classmate notebook with smooth paper, sturdy binding, and a durable cover for school, college, and office notes.",
    category: "Stationery",
    prices: [
      { store: "Amazon", price: 72, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 69, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 75, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 78, url: retailerUrls.BigBasket },
    ],
    price_history: [
      { date: "2026-05-07", price: 80 },
      { date: "2026-05-14", price: 76 },
      { date: "2026-05-21", price: 72 },
      { date: "2026-05-28", price: 69 },
      { date: "2026-06-04", price: 69 },
    ],
    pricePrediction: {
      productId: "8902519010124",
      currentPrice: 69,
      predictedPrice: 71,
      confidence: 86,
      trend: "Stable",
      daysAhead: 7,
      factors: ["Back-to-school demand", "Stable stationery supply", "Small retailer spread"],
      dealScore: 82,
      recommendation: "Buy Now",
    },
  },
  {
    upc: "8901765126122",
    name: "Hauser XO Pen",
    brand: "Hauser",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80",
    description:
      "A smooth blue ball pen with consistent ink flow and a comfortable grip for everyday writing and note-taking.",
    category: "Stationery",
    prices: [
      { store: "Amazon", price: 98, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 95, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 110, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 105, url: retailerUrls.BigBasket },
    ],
    price_history: [
      { date: "2026-05-07", price: 112 },
      { date: "2026-05-14", price: 105 },
      { date: "2026-05-21", price: 99 },
      { date: "2026-05-28", price: 95 },
      { date: "2026-06-04", price: 95 },
    ],
    pricePrediction: {
      productId: "8901765126122",
      currentPrice: 95,
      predictedPrice: 97,
      confidence: 84,
      trend: "Stable",
      daysAhead: 7,
      factors: ["Consistent office supply demand", "Moderate quick-commerce premium", "Stable stock levels"],
      dealScore: 79,
      recommendation: "Buy Now",
    },
  },
  {
    upc: "8904004401011",
    name: "Mixed Spice Masala",
    brand: "Demo Grocery",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
    description:
      "A balanced mixed spice masala blend for everyday Indian cooking, suitable for curries, snacks, marinades, and gravies.",
    category: "Grocery",
    prices: [
      { store: "Amazon", price: 62, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 59, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 65, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 61, url: retailerUrls.BigBasket },
    ],
    price_history: [
      { date: "2026-05-07", price: 68 },
      { date: "2026-05-14", price: 65 },
      { date: "2026-05-21", price: 63 },
      { date: "2026-05-28", price: 59 },
      { date: "2026-06-04", price: 59 },
    ],
    pricePrediction: {
      productId: "8904004401011",
      currentPrice: 59,
      predictedPrice: 62,
      confidence: 81,
      trend: "Likely to Increase",
      daysAhead: 7,
      factors: ["Grocery promo ending", "Stable pantry demand", "Quick-commerce price premium"],
      dealScore: 85,
      recommendation: "Buy Now",
    },
  },
  {
    upc: "8901071704229",
    name: "Hershey's Kisses Chocolate",
    brand: "Hershey's",
    image: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?w=800&q=80",
    description:
      "Bite-sized Hershey's Kisses milk chocolates wrapped for sharing, gifting, dessert toppings, or a quick sweet treat.",
    category: "Chocolate",
    prices: [
      { store: "Amazon", price: 140, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 135, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 145, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 139, url: retailerUrls.BigBasket },
    ],
    price_history: [
      { date: "2026-05-07", price: 150 },
      { date: "2026-05-14", price: 145 },
      { date: "2026-05-21", price: 139 },
      { date: "2026-05-28", price: 135 },
      { date: "2026-06-04", price: 135 },
    ],
    pricePrediction: {
      productId: "8901071704229",
      currentPrice: 135,
      predictedPrice: 138,
      confidence: 83,
      trend: "Stable",
      daysAhead: 7,
      factors: ["Stable chocolate demand", "Small retailer spread", "No major seasonal spike"],
      dealScore: 80,
      recommendation: "Buy Now",
    },
  },
];

export function findDemoProductByUPC(upc: string): DemoProduct | null {
  return demoProducts.find((product) => product.upc === upc) ?? null;
}
