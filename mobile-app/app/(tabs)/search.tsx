import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search as SearchIcon, Zap, ScanBarcode, ArrowRight } from "lucide-react-native";
import { useSearch, TRENDING_SEARCHES, CATEGORY_FILTERS } from "@/hooks/useSearch";
import SearchBar from "@/components/search/SearchBar";
import ProductCard from "@/components/search/ProductCard";
import SkeletonCard from "@/components/search/SkeletonCard";
import RecentSearches from "@/components/search/RecentSearches";
import TrendingSearches from "@/components/search/TrendingSearches";
import CategoryFilters from "@/components/search/CategoryFilters";
import type { Product } from "@/src/types";

type ScreenState = "idle" | "searching" | "results" | "no_results";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const {
    query,
    results,
    suggestions,
    recentSearches,
    isSearching,
    activeCategory,
    handleQueryChange,
    handleSubmit,
    handleRecentTap,
    clearQuery,
    clearAllRecent,
    handleCategoryChange,
    addToSearchHistory,
  } = useSearch();

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 14,
        bounciness: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Derive screen state
  const screenState: ScreenState = (() => {
    if (!query.trim()) return "idle";
    if (isSearching) return "searching";
    if (results.length === 0) return "no_results";
    return "results";
  })();

  const handleProductPress = useCallback(() => {
    if (query.trim()) {
      addToSearchHistory(query.trim(), results.length);
    }
    Keyboard.dismiss();
  }, [query, addToSearchHistory, results.length]);

  const renderResult = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard product={item} index={index} onPress={handleProductPress} />
    ),
    [handleProductPress]
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0A0E15]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Background Glows (Web/Desktop) */}
      {Platform.OS === "web" && (
        <View className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <View className="absolute top-[-50px] left-[-50px] w-[250px] h-[250px] bg-[#2ECC71]/10 rounded-full blur-[80px]" />
          <View className="absolute top-[20%] right-[-100px] w-[300px] h-[300px] bg-[#F4A261]/10 rounded-full blur-[100px]" />
          <View className="absolute bottom-[-100px] left-[20%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
        </View>
      )}

      {/* Safe area spacer */}
      <View style={{ height: insets.top, backgroundColor: "transparent" }} className="z-10" />

      {/* Header */}
      <Animated.View
        className="flex-row items-center justify-between px-5 pt-3 pb-1 z-10"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-xl bg-[#2ECC71]/15 items-center justify-center">
            <SearchIcon size={16} color="#2ECC71" />
          </View>
          <Text className="text-[24px] font-bold text-white tracking-tight">
            Search
          </Text>
        </View>
        {query.trim().length > 0 && screenState === "results" && (
          <View className="px-3 py-1.5 bg-[#2ECC71]/10 rounded-lg">
            <Text className="text-[11px] text-[#2ECC71] font-bold">
              {results.length} found
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        className="z-10"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          onSubmit={handleSubmit}
          onClear={clearQuery}
          autoFocus={false}
        />
      </Animated.View>

      {/* Category Filters (visible when typing or has results) */}
      {(screenState === "results" || screenState === "no_results") && (
        <CategoryFilters
          categories={CATEGORY_FILTERS}
          active={activeCategory}
          onChange={handleCategoryChange}
        />
      )}

      {query.trim().length > 0 && suggestions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="z-10 px-5 pb-2"
        >
          {suggestions.map((suggestion) => (
            <TouchableWithoutFeedback
              key={suggestion}
              onPress={() => {
                handleRecentTap(suggestion);
                Keyboard.dismiss();
              }}
            >
              <View className="mr-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                <Text className="text-[11px] text-white/60 font-semibold" numberOfLines={1}>
                  {suggestion}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          ))}
        </ScrollView>
      )}

      {/* Body */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 z-10">
          {/* ═══ IDLE — Discovery Mode ═══ */}
          {screenState === "idle" && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            >
              {/* Trending Searches */}
              <TrendingSearches
                searches={TRENDING_SEARCHES}
                onTap={(term) => {
                  handleRecentTap(term);
                  Keyboard.dismiss();
                }}
              />

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View className="mt-4">
                  <RecentSearches
                    searches={recentSearches}
                    onTap={(term) => {
                      handleRecentTap(term);
                      Keyboard.dismiss();
                    }}
                    onClearAll={clearAllRecent}
                  />
                </View>
              )}

              {/* Empty state if no recents */}
              {recentSearches.length === 0 && <EmptyIdle />}
            </ScrollView>
          )}

          {/* ═══ SEARCHING — Skeleton Shimmer ═══ */}
          {screenState === "searching" && (
            <View className="pt-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </View>
          )}

          {/* ═══ RESULTS ═══ */}
          {screenState === "results" && (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderResult}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <ResultsHeader count={results.length} query={query} />
              }
              contentContainerStyle={{
                paddingTop: 4,
                paddingBottom: insets.bottom + 24,
              }}
            />
          )}

          {/* ═══ NO RESULTS ═══ */}
          {screenState === "no_results" && <EmptyResults query={query} />}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultsHeader({ count, query }: { count: number; query: string }) {
  return (
    <View className="px-5 py-2.5 mb-1">
      <Text className="text-[12px] text-white/30">
        {count} result{count !== 1 ? "s" : ""} for{" "}
        <Text className="text-white/60 font-semibold">"{query}"</Text>
      </Text>
    </View>
  );
}

function EmptyIdle() {
  return (
    <View className="flex-1 items-center justify-center px-10 pt-16 gap-4">
      <View className="w-24 h-24 rounded-3xl bg-[#2ECC71]/8 items-center justify-center mb-3">
        <ScanBarcode size={40} color="rgba(46,204,113,0.4)" />
      </View>
      <Text className="text-[18px] font-bold text-white text-center">
        Find any product
      </Text>
      <Text className="text-[13px] text-white/40 text-center leading-5">
        Search by name, brand, model, or scan a barcode{"\n"}on the Home tab for instant price comparisons.
      </Text>

      {/* Quick-access chips */}
      <View className="flex-row flex-wrap justify-center gap-2 mt-4">
        {["Headphones", "Watch", "Speaker", "Coffee Maker"].map((chip) => (
          <View
            key={chip}
            className="px-4 py-2 rounded-xl border border-white/[0.06]"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <Text className="text-[12px] text-white/30 font-medium">{chip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <View className="flex-1 items-center justify-center px-10 pt-12 gap-4">
      <View className="w-20 h-20 rounded-3xl bg-[#F4A261]/8 items-center justify-center mb-2">
        <SearchIcon size={32} color="rgba(244,162,97,0.4)" />
      </View>
      <Text className="text-[18px] font-bold text-white text-center">
        No results for "{query}"
      </Text>
      <Text className="text-[13px] text-white/40 text-center leading-5">
        Try a different spelling, a shorter term,{"\n"}or scan the barcode directly on the Home tab.
      </Text>
    </View>
  );
}
