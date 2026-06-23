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
import { useAppTheme } from "@/src/hooks/useAppTheme";

type ScreenState = "idle" | "searching" | "results" | "no_results";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { theme, accent, isDark } = useAppTheme();

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
      style={{ backgroundColor: theme.bg }}
      className="flex-1"
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
          <View style={{ backgroundColor: accent.hexLight + "1c" }} className="w-8 h-8 rounded-xl items-center justify-center">
            <SearchIcon size={16} color={accent.hex} />
          </View>
          <Text style={{ color: theme.text }} className="text-[24px] font-bold tracking-tight">
            Search
          </Text>
        </View>
        {query.trim().length > 0 && screenState === "results" && (
          <View style={{ backgroundColor: accent.hexLight + "1c" }} className="px-3 py-1.5 rounded-lg">
            <Text style={{ color: accent.hex }} className="text-[11px] font-bold">
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

      {/* Category Filters (visible whenever user is typing) */}
      {screenState !== "idle" && (
        <CategoryFilters
          categories={CATEGORY_FILTERS}
          active={activeCategory}
          onChange={handleCategoryChange}
        />
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
              {recentSearches.length === 0 && <EmptyIdle theme={theme} accent={accent} insets={insets} />}
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
                <ResultsHeader count={results.length} query={query} theme={theme} />
              }
              contentContainerStyle={{
                paddingTop: 4,
                paddingBottom: insets.bottom + 24,
              }}
            />
          )}

          {/* ═══ NO RESULTS ═══ */}
          {screenState === "no_results" && <EmptyResults query={query} theme={theme} />}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultsHeader({ count, query, theme }: { count: number; query: string; theme: any }) {
  return (
    <View className="px-5 py-2.5 mb-1">
      <Text style={{ color: theme.textDim }} className="text-[12px]">
        {count} result{count !== 1 ? "s" : ""} for{" "}
        <Text style={{ color: theme.textMuted }} className="font-semibold">{`"${query}"`}</Text>
      </Text>
    </View>
  );
}

function EmptyIdle({ theme, accent, insets }: { theme: any; accent: any; insets: any }) {
  return (
    <View className="flex-1 items-center justify-center px-10 pt-16 gap-4">
      <View style={{ backgroundColor: accent.hexLight + "1c" }} className="w-24 h-24 rounded-3xl items-center justify-center mb-3">
        <ScanBarcode size={40} color={accent.hex} style={{ opacity: 0.8 }} />
      </View>
      <Text style={{ color: theme.text }} className="text-[18px] font-bold text-center">
        Find any product
      </Text>
      <Text style={{ color: theme.textMuted }} className="text-[13px] text-center leading-5">
        Search by name, brand, model, or scan a barcode{"\n"}on the Home tab for instant price comparisons.
      </Text>

      {/* Quick-access chips */}
      <View className="flex-row flex-wrap justify-center gap-2 mt-4">
        {["Headphones", "Watch", "Speaker", "Coffee Maker"].map((chip) => (
          <View
            key={chip}
            style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
            className="px-4 py-2 rounded-xl border"
          >
            <Text style={{ color: theme.textDim }} className="text-[12px] font-medium">{chip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EmptyResults({ query, theme }: { query: string; theme: any }) {
  return (
    <View className="flex-1 items-center justify-center px-10 pt-12 gap-4">
      <View className="w-20 h-20 rounded-3xl bg-[#F4A261]/10 items-center justify-center mb-2">
        <SearchIcon size={32} color="#F4A261" style={{ opacity: 0.8 }} />
      </View>
      <Text style={{ color: theme.text }} className="text-[18px] font-bold text-center">
        {`No results for "${query}"`}
      </Text>
      <Text style={{ color: theme.textMuted }} className="text-[13px] text-center leading-5">
        Try a different spelling, a shorter term,{"\n"}or scan the barcode directly on the Home tab.
      </Text>
    </View>
  );
}
