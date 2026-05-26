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
  TouchableOpacity,
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
import { LinearGradient } from "expo-linear-gradient";

type ScreenState = "idle" | "searching" | "results" | "no_results";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const {
    query,
    results,
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
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Sleek, unified global background */}
      <LinearGradient
        colors={["#0A0E15", "#121822"]}
        className="absolute inset-0 z-0"
      />

      {/* Safe area spacer */}
      <View style={{ height: insets.top, backgroundColor: "transparent" }} className="z-10" />

      {/* 🚀 THE FIX: This wrapper prevents stretching on wide web screens */}
      <View className="flex-1 w-full max-w-2xl self-center">

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

        {/* Body */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 z-10">
            {/* ═══ IDLE — Discovery Mode ═══ */}
            {screenState === "idle" && (
              <ScrollView
                showsVerticalScrollIndicator={Platform.OS !== "web"} // <-- Hidden on PC, visible on mobile
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
                showsVerticalScrollIndicator={Platform.OS !== "web"} // <-- Hidden on PC, visible on mobile
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
      </View> 
      {/* 🚀 END OF WRAPPER */}
    </KeyboardAvoidingView>
  );

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
    <View className="flex-1 items-center justify-center px-6 pt-12">
      {/* Icon with animated glow effect */}
      <View className="relative items-center justify-center mb-6 mt-10">
        <View className="absolute w-32 h-32 bg-[#2ECC71]/20 rounded-full blur-[40px]" />
        <View className="w-20 h-20 rounded-[24px] bg-white/[0.03] border border-white/10 items-center justify-center backdrop-blur-md shadow-2xl">
          <ScanBarcode size={36} color="#2ECC71" />
        </View>
      </View>

      <Text className="text-[22px] font-black text-white text-center tracking-tight mb-2">
        Discover Real Prices
      </Text>
      <Text className="text-[14px] text-white/40 text-center leading-6 mb-8 px-4">
        Search by product name, model, or scan a barcode on the Home tab for instant cross-retailer comparisons.
      </Text>

      {/* Upgraded Quick-Access Grid */}
      <View className="w-full">
        <Text className="text-[12px] font-bold text-white/30 uppercase tracking-widest mb-4 ml-2">
          Popular Categories
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {[
            { name: "Audio", icon: "🎧", color: "#60A5FA" },
            { name: "Wearables", icon: "⌚", color: "#F4A261" },
            { name: "Smart Home", icon: "🏠", color: "#A78BFA" },
            { name: "Kitchen", icon: "☕", color: "#2ECC71" },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.name}
              activeOpacity={0.7}
              className="w-[48%] bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex-row items-center gap-3"
            >
              <View className="w-10 h-10 rounded-xl bg-white/[0.04] items-center justify-center">
                <Text className="text-lg">{chip.icon}</Text>
              </View>
              <Text className="text-[14px] text-white/70 font-semibold">
                {chip.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
}}
