import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, X, ArrowLeft, TrendingUp, Sparkles, Zap, 
  Mic, MicOff, Clock, Flame, Tag, TrendingDown
} from "lucide-react";
import { searchProducts, getMockPrices, getBestDeals } from "../utils/mockData";
import { useApp } from "../context/AppContext";
import type { Product } from "../types";

export function SearchScreen() {
  const navigate = useNavigate();
  const { searchHistory, addToSearchHistory, clearSearchHistory } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "price-low" | "price-high">("price-low");
  const [isListening, setIsListening] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const [voiceSearchAvailable, setVoiceSearchAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  const popularSearches = [
    { text: "Headphones", icon: "🎧" },
    { text: "Speakers", icon: "🔊" },
    { text: "Coffee Maker", icon: "☕" },
    { text: "Smart Watch", icon: "⌚" },
    { text: "Vacuum", icon: "🧹" },
  ];

  // Get best deals based on search history
  const bestDeals = getBestDeals(6);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSearchAvailable(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setShowRecentSearches(false);
      // Simulate search delay
      const timer = setTimeout(() => {
        const results = searchProducts(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        // Add to search history
        addToSearchHistory(searchQuery, results.length);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setShowRecentSearches(true);
    }
  }, [searchQuery, addToSearchHistory]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleVoiceSearch = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const getLowestPrice = (productId: string): number => {
    const prices = getMockPrices(productId);
    const validPrices = prices.filter((p) => p.price !== null).map((p) => p.price as number);
    return Math.min(...validPrices);
  };

  const getSortedResults = () => {
    const results = [...searchResults];
    if (sortBy === "price-low") {
      return results.sort((a, b) => getLowestPrice(a.id) - getLowestPrice(b.id));
    } else if (sortBy === "price-high") {
      return results.sort((a, b) => getLowestPrice(b.id) - getLowestPrice(a.id));
    }
    return results;
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] flex flex-col relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#2ECC71] opacity-10 blur-[120px] rounded-full"></div>
        <div className="absolute top-96 right-1/4 w-96 h-96 bg-[#F4A261] opacity-10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5 backdrop-blur-xl bg-[#0A0E15]/50 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="font-bold text-white text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2ECC71]" />
            Search Products
          </h1>
        </div>

        {/* Search Bar with Voice */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2ECC71]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or speak..."
            className="w-full pl-12 pr-28 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border-2 border-white/10 focus:border-[#2ECC71] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/50 transition-all text-white placeholder-white/40"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery("")}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleVoiceSearch}
              className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                isListening
                  ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-lg shadow-[#F4A261]/50 animate-pulse"
                  : "bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-white shadow-lg shadow-[#2ECC71]/30"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Sort/Filter Options */}
        {searchResults.length > 0 && (
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy("relevance")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                sortBy === "relevance"
                  ? "bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] shadow-lg shadow-[#2ECC71]/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
              }`}
            >
              Relevance
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy("price-low")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-1 ${
                sortBy === "price-low"
                  ? "bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] shadow-lg shadow-[#2ECC71]/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Price: Low
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy("price-high")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-1 ${
                sortBy === "price-high"
                  ? "bg-gradient-to-r from-[#2ECC71] to-[#25A65A] text-[#0A0E15] shadow-lg shadow-[#2ECC71]/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Price: High
            </motion.button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {!searchQuery && showRecentSearches && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Best Deals Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#F4A261]" />
                    <h2 className="font-semibold text-white">Best Deals Right Now</h2>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="text-[#2ECC71] text-sm font-medium"
                  >
                    See All
                  </motion.button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {bestDeals.slice(0, 4).map((product, index) => (
                    <motion.button
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleProductClick(product.id)}
                      className="relative flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 hover:border-[#F4A261]/50 hover:bg-white/10 transition-all overflow-hidden"
                    >
                      {/* Hot Deal Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#F4A261] to-[#E76F51] shadow-lg">
                          <Tag className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/10 mb-3 border border-white/10">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 text-left min-h-[40px]">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#2ECC71] text-lg">
                          ₹{getLowestPrice(product.id).toFixed(2)}
                        </p>
                        <span className="text-xs text-white/40">{product.brand}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {searchHistory.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#2ECC71]" />
                      <h2 className="font-semibold text-white">Recent Searches</h2>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={clearSearchHistory}
                      className="text-white/50 text-sm font-medium hover:text-white/70"
                    >
                      Clear
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 10).map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRecentSearch(item.query)}
                        className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-[#2ECC71]/50 hover:bg-white/10 transition-all"
                      >
                        <span className="text-white text-sm">{item.query}</span>
                        <span className="text-white/40 text-xs ml-2">({item.resultsCount})</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[#F4A261]" />
                  <h2 className="font-semibold text-white">Popular Searches</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {popularSearches.map((search, index) => (
                    <motion.button
                      key={search.text}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePopularSearch(search.text)}
                      className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-[#2ECC71]/50 hover:bg-white/10 transition-all"
                    >
                      <span className="text-2xl">{search.icon}</span>
                      <span className="text-white font-medium">{search.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {isSearching && (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-white/10 border-t-[#2ECC71] rounded-full mb-4"
              />
              <p className="text-white/70">Searching...</p>
            </motion.div>
          )}

          {!isSearching && searchQuery && searchResults.length === 0 && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-white/40" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-white/50">Try a different search term</p>
            </motion.div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4">
                <p className="text-sm text-white/50">
                  Found {searchResults.length} {searchResults.length === 1 ? "result" : "results"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {getSortedResults().map((product, index) => (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleProductClick(product.id)}
                    className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-[#2ECC71]/50 hover:bg-white/10 transition-all"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/10 mb-3 border border-white/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 text-left min-h-[40px]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#2ECC71] text-lg">
                        ₹{getLowestPrice(product.id).toFixed(2)}
                      </p>
                      <span className="text-xs text-white/40">{product.brand}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}