import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { mockProducts, searchProducts } from "@/src/utils/mockData";
import { useApp } from "@/src/context/AppContext";
import type { Product } from "@/src/types";

const DEBOUNCE_MS = 250;

export type SearchResult = Product & { matchScore: number };

// ── Scoring ─────────────────────────────────────────────────────────────────
function scoreMatch(product: Product, query: string): number {
  const q = query.toLowerCase();
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();
  const category = (product.category ?? "").toLowerCase();
  const desc = (product.description ?? "").toLowerCase();
  const model = product.model.toLowerCase();

  // Exact UPC match → top priority
  if (product.upc === q) return 100;

  let score = 0;

  // Name matching (highest weight)
  if (name === q) score = Math.max(score, 95);
  else if (name.startsWith(q)) score = Math.max(score, 85);
  else if (name.includes(q)) score = Math.max(score, 65);

  // Brand matching
  if (brand === q) score = Math.max(score, 90);
  else if (brand.startsWith(q)) score = Math.max(score, 75);
  else if (brand.includes(q)) score = Math.max(score, 55);

  // Model matching
  if (model.includes(q)) score = Math.max(score, 60);

  // Category matching
  if (category.includes(q)) score = Math.max(score, 40);

  // Description matching
  if (desc.includes(q)) score = Math.max(score, 25);

  // Word boundary bonus: if query matches start of any word
  const words = name.split(/\s+/);
  if (words.some((w) => w.startsWith(q))) {
    score = Math.max(score, score + 5);
  }

  return score;
}

// ── Trending / Suggested Searches ───────────────────────────────────────────
export const TRENDING_SEARCHES = [
  "Sony Headphones",
  "Apple Watch",
  "iPhone",
  "Gaming Laptop",
  "Air Fryer",
  "Running Shoes",
  "Greek Yogurt",
  "Face Serum",
];

export const CATEGORY_FILTERS = [
  "All",
  "Smartphones",
  "Laptops",
  "Tablets",
  "Smart Watches",
  "Headphones",
  "Cameras",
  "Appliances",
  "Grocery",
  "Fashion",
  "Beauty",
  "Sports",
];

// ── Hook ────────────────────────────────────────────────────────────────────
export function useSearch() {
  const { searchHistory, addToSearchHistory, clearSearchHistory } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // All products (memoized)
  const allProducts = useMemo(() => Object.values(mockProducts), []);

  // ── Run the search ──────────────────────────────────────────────────────
  const runSearch = useCallback(
    (q: string, category: string = activeCategory) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      const scored: SearchResult[] = allProducts
        .map((p) => ({ ...p, matchScore: scoreMatch(p, trimmed) }))
        .filter((p) => p.matchScore > 0)
        .filter(
          (p) =>
            category === "All" ||
            (p.category ?? "").toLowerCase() === category.toLowerCase()
        )
        .sort((a, b) => b.matchScore - a.matchScore);

      setResults(scored);
      setSuggestions(
        scored
          .slice(0, 6)
          .map((product) => product.name)
          .filter((name, index, names) => names.indexOf(name) === index)
      );
      setIsSearching(false);
    },
    [allProducts, activeCategory]
  );

  // ── Debounced query change ──────────────────────────────────────────────
  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!text.trim()) {
        setResults([]);
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      debounceTimer.current = setTimeout(
        () => runSearch(text, activeCategory),
        DEBOUNCE_MS
      );
    },
    [runSearch, activeCategory]
  );

  // ── Submit (Enter / Search key) ─────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmed = query.trim();
    if (!trimmed) return;
    runSearch(trimmed, activeCategory);
    // Save to context search history
    addToSearchHistory(trimmed, results.length);
  }, [query, runSearch, activeCategory, addToSearchHistory, results.length]);

  // ── Tap a recent / trending search term ─────────────────────────────────
  const handleRecentTap = useCallback(
    (term: string) => {
      setQuery(term);
      setIsSearching(true);
      // Run immediately — no debounce for intentional taps
      setTimeout(() => runSearch(term, activeCategory), 50);
      addToSearchHistory(term, 0);
    },
    [runSearch, activeCategory, addToSearchHistory]
  );

  // ── Clear query ─────────────────────────────────────────────────────────
  const clearQuery = useCallback(() => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    setIsSearching(false);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  // ── Category filter ─────────────────────────────────────────────────────
  const handleCategoryChange = useCallback(
    (category: string) => {
      setActiveCategory(category);
      if (query.trim()) {
        setIsSearching(true);
        setTimeout(() => runSearch(query, category), 50);
      }
    },
    [query, runSearch]
  );

  // ── Recent searches (from context) ──────────────────────────────────────
  const recentSearchTerms = useMemo(
    () => searchHistory.slice(0, 8).map((h) => h.query),
    [searchHistory]
  );

  return {
    query,
    results,
    suggestions,
    recentSearches: recentSearchTerms,
    isSearching,
    activeCategory,
    handleQueryChange,
    handleSubmit,
    handleRecentTap,
    clearQuery,
    clearAllRecent: clearSearchHistory,
    handleCategoryChange,
    addToSearchHistory,
  };
}
