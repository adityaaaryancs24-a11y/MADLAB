export interface Product {
  upc: string;
  name: string;
  brand: string;
  image: string;
  description: string;
  category: string;
  prices: {
    store: string;
    price: number;
    url?: string;
  }[];
  priceHistory: {
    date: string;
    price: number;
  }[];
}

const retailerUrls = {
  Amazon: "https://www.amazon.in",
  Flipkart: "https://www.flipkart.com",
  Blinkit: "https://blinkit.com",
  BigBasket: "https://www.bigbasket.com",
};

export const products: Product[] = [
  {
    upc: "8901765126122",
    name: "Hauser XO Ball Pen Blue",
    brand: "Hauser",
    image: "https://m.media-amazon.com/images/I/41i6o994xkL.jpg",
    description:
      "Smooth writing blue ball pen with a comfortable grip and reliable ink flow for daily notes, school, and office use.",
    category: "Stationery",
    prices: [
      { store: "Amazon", price: 98, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 95, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 110, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 105, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 110 },
      { date: "2026-05-12", price: 105 },
      { date: "2026-05-19", price: 99 },
      { date: "2026-05-26", price: 95 },
      { date: "2026-06-02", price: 95 },
    ],
  },
  {
    upc: "8906095062653",
    name: "Hauser XO Ball Pen Blue",
    brand: "Hauser",
    image: "https://m.media-amazon.com/images/I/41i6o994xkL.jpg",
    description:
      "Smooth writing blue ball pen with a comfortable grip and reliable ink flow for daily notes, school, and office use.",
    category: "Stationery",
    prices: [
      { store: "Amazon", price: 98, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 95, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 110, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 105, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 110 },
      { date: "2026-05-12", price: 105 },
      { date: "2026-05-19", price: 99 },
      { date: "2026-05-26", price: 95 },
      { date: "2026-06-02", price: 95 },
    ],
  },
  {
    upc: "8902519010124",
    name: "Classmate Notebook Single Line 172 Pages",
    brand: "Classmate",
    image: "https://kitabwalah.com/wp-content/uploads/2026/02/brown-3.png",
    description:
      "Single line notebook with quality paper, durable binding, and ruled pages for school, college, and office writing.",
    category: "Stationery",
    prices: [
      { store: "Amazon", price: 72, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 69, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 75, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 78, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 80 },
      { date: "2026-05-12", price: 76 },
      { date: "2026-05-19", price: 72 },
      { date: "2026-05-26", price: 69 },
      { date: "2026-06-02", price: 69 },
    ],
  },
  {
    upc: "8906021112105",
    name: "Classmate Notebook Single Line 172 Pages",
    brand: "Classmate",
    image: "https://kitabwalah.com/wp-content/uploads/2026/02/brown-3.png",
    description:
      "Single line notebook with quality paper, durable binding, and ruled pages for school, college, and office writing.",
    category: "Stationery",
    prices: [
      { store: "Amazon", price: 72, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 69, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 75, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 78, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 80 },
      { date: "2026-05-12", price: 76 },
      { date: "2026-05-19", price: 72 },
      { date: "2026-05-26", price: 69 },
      { date: "2026-06-02", price: 69 },
    ],
  },
  {
    upc: "8901058844510",
    name: "Maggi 2-Minute Masala Noodles 70g",
    brand: "Maggi",
    image: "https://www.secondrecipe.com/wp-content/uploads/2020/04/vegetable-maggi-noodles.jpg",
    description:
      "Classic masala instant noodles with the familiar Maggi tastemaker, ready in minutes for a quick snack or light meal.",
    category: "Instant Food",
    prices: [
      { store: "Amazon", price: 15, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 14, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 15, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 15, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 16 },
      { date: "2026-05-12", price: 15 },
      { date: "2026-05-19", price: 15 },
      { date: "2026-05-26", price: 14 },
      { date: "2026-06-02", price: 14 },
    ],
  },
  {
    upc: "8901058895147",
    name: "KitKat 4 Finger Chocolate Bar 37.3g",
    brand: "Nestle",
    image: "https://m.media-amazon.com/images/I/61l4BBZ3iDL._SL1000_.jpg",
    description:
      "Crisp wafer fingers covered in smooth milk chocolate, packed as a convenient treat for breaks and snacking.",
    category: "Chocolate",
    prices: [
      { store: "Amazon", price: 30, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 29, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 30, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 32, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 32 },
      { date: "2026-05-12", price: 31 },
      { date: "2026-05-19", price: 30 },
      { date: "2026-05-26", price: 29 },
      { date: "2026-06-02", price: 29 },
    ],
  },
  {
    upc: "8901764016812",
    name: "Coca-Cola Original Taste 750ml",
    brand: "Coca-Cola",
    image: "https://m.media-amazon.com/images/I/51v8nyxSOYL._SL1000_.jpg",
    description:
      "Refreshing carbonated soft drink with the classic Coca-Cola taste, best served chilled with snacks or meals.",
    category: "Beverages",
    prices: [
      { store: "Amazon", price: 42, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 40, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 40, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 44, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 45 },
      { date: "2026-05-12", price: 44 },
      { date: "2026-05-19", price: 42 },
      { date: "2026-05-26", price: 40 },
      { date: "2026-06-02", price: 40 },
    ],
  },
  {
    upc: "8901491101870",
    name: "Pepsi PET Bottle 750ml",
    brand: "Pepsi",
    image: "https://m.media-amazon.com/images/I/61WFNqf8hVL._SL1500_.jpg",
    description:
      "Bold and fizzy cola-flavoured soft drink in a resealable bottle, made for chilled refreshment on the go.",
    category: "Beverages",
    prices: [
      { store: "Amazon", price: 40, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 39, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 40, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 43, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 44 },
      { date: "2026-05-12", price: 42 },
      { date: "2026-05-19", price: 41 },
      { date: "2026-05-26", price: 39 },
      { date: "2026-06-02", price: 39 },
    ],
  },
  {
    upc: "8901233021309",
    name: "Cadbury Dairy Milk Chocolate 36g",
    brand: "Cadbury",
    image: "https://cococart.in/cdn/shop/files/1CH2562.png?v=1773821191&width=1946",
    description:
      "Creamy milk chocolate bar with the classic Cadbury Dairy Milk taste, suited for gifting, sharing, or a quick sweet bite.",
    category: "Chocolate",
    prices: [
      { store: "Amazon", price: 39, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 38, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 40, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 40, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 42 },
      { date: "2026-05-12", price: 40 },
      { date: "2026-05-19", price: 40 },
      { date: "2026-05-26", price: 38 },
      { date: "2026-06-02", price: 38 },
    ],
  },
  {
    upc: "8901491101832",
    name: "Lay's India's Magic Masala Chips 52g",
    brand: "Lay's",
    image: "https://m.media-amazon.com/images/I/71rGPqLTHSL._SL1500_.jpg",
    description:
      "Crispy potato chips seasoned with tangy and spicy India's Magic Masala flavour for a crunchy snack.",
    category: "Snacks",
    prices: [
      { store: "Amazon", price: 20, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 19, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 20, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 21, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 22 },
      { date: "2026-05-12", price: 21 },
      { date: "2026-05-19", price: 20 },
      { date: "2026-05-26", price: 19 },
      { date: "2026-06-02", price: 19 },
    ],
  },
  {
    upc: "8901491104055",
    name: "Doritos Nacho Cheese Tortilla Chips 55g",
    brand: "Doritos",
    image: "https://m.media-amazon.com/images/I/81eTsCBbAHL._SL1500_.jpg",
    description:
      "Crunchy tortilla chips with bold nacho cheese seasoning, made for snacking, sharing, and pairing with dips.",
    category: "Snacks",
    prices: [
      { store: "Amazon", price: 30, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 29, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 30, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 32, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 34 },
      { date: "2026-05-12", price: 32 },
      { date: "2026-05-19", price: 31 },
      { date: "2026-05-26", price: 29 },
      { date: "2026-06-02", price: 29 },
    ],
  },
  {
    upc: "8901058855202",
    name: "Nescafe Classic Instant Coffee 45g",
    brand: "Nescafe",
    image: "https://m.media-amazon.com/images/I/71aKQyB3oUL._SL1500_.jpg",
    description:
      "Rich and aromatic instant coffee made from carefully roasted coffee beans for a quick hot or cold coffee.",
    category: "Beverages",
    prices: [
      { store: "Amazon", price: 169, url: retailerUrls.Amazon },
      { store: "Flipkart", price: 165, url: retailerUrls.Flipkart },
      { store: "Blinkit", price: 175, url: retailerUrls.Blinkit },
      { store: "BigBasket", price: 172, url: retailerUrls.BigBasket },
    ],
    priceHistory: [
      { date: "2026-05-05", price: 180 },
      { date: "2026-05-12", price: 176 },
      { date: "2026-05-19", price: 172 },
      { date: "2026-05-26", price: 165 },
      { date: "2026-06-02", price: 165 },
    ],
  },
];

export function findProductByUPC(upc: string): Product | null {
  return products.find((product) => product.upc === upc) ?? null;
}
