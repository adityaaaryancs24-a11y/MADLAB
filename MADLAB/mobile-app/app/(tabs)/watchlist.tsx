import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { Heart, Plus, X, Save, IndianRupee, Target } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import { WishlistCard } from '../../src/components/WishlistCard';
import { useAppTheme } from '../../src/hooks/useAppTheme';

const EMPTY_MANUAL_PRODUCT = {
  name: '',
  brand: '',
  currentPrice: '',
  previousPrice: '',
  targetPrice: '',
  upc: '',
  store: '',
  image: '',
};

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=500';

export default function WatchlistScreen() {
  const { watchlist, addToWatchlist } = useApp();
  const { theme, accent, isDark, fontScale } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [manualFormVisible, setManualFormVisible] = useState(watchlist.length === 0);
  const [manualProduct, setManualProduct] = useState(EMPTY_MANUAL_PRODUCT);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Defensive sanitization of watchlist data to prevent runtime crashes
  const sanitizedWatchlist = useMemo(() => {
    return watchlist.map(i => {
      const currentPrice = typeof i.currentPrice === 'number' && !isNaN(i.currentPrice) ? i.currentPrice : 0;
      const previousPrice = typeof i.previousPrice === 'number' && !isNaN(i.previousPrice) ? i.previousPrice : currentPrice;
      const priceDropPercent = typeof i.priceDropPercent === 'number' && !isNaN(i.priceDropPercent) ? i.priceDropPercent : 0;
      const targetPrice = typeof i.targetPrice === 'number' && !isNaN(i.targetPrice) ? i.targetPrice : undefined;
      return {
        ...i,
        currentPrice,
        previousPrice,
        priceDropPercent,
        targetPrice,
      };
    });
  }, [watchlist]);

  const totalProducts = sanitizedWatchlist.length;
  
  const potentialSavings = sanitizedWatchlist.reduce((sum, item) => {
    return sum + Math.max(0, item.previousPrice - item.currentPrice);
  }, 0);
  
  const activeAlerts = sanitizedWatchlist.filter(w => w.targetPrice && w.currentPrice > w.targetPrice).length;

  const filteredWatchlist = useMemo(() => {
    let list = [...sanitizedWatchlist];
    if (filter === 'price_dropped') {
      list = list.filter(w => w.priceDropPercent > 0);
    } else if (filter === 'has_target') {
      list = list.filter(w => w.targetPrice !== undefined);
    }
    return list.sort((a, b) => b.addedAt - a.addedAt);
  }, [sanitizedWatchlist, filter]);

  const FilterButton = ({ label, value }: { label: string, value: string }) => {
    const isActive = filter === value;
    return (
      <TouchableOpacity
        onPress={() => setFilter(value)}
        style={{
          backgroundColor: isActive ? accent.hex : theme.bgCardAlt,
          borderColor: theme.border,
          borderWidth: isActive ? 0 : 1
        }}
        className="px-4 py-2 rounded-xl mr-2"
      >
        <Text
          style={{ color: isActive ? (isDark ? '#0A0E15' : '#FFFFFF') : theme.textMuted }}
          className="font-semibold"
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const updateManualField = (field: keyof typeof EMPTY_MANUAL_PRODUCT, value: string) => {
    setManualProduct((prev) => ({ ...prev, [field]: value }));
  };

  const resetManualForm = () => {
    setManualProduct(EMPTY_MANUAL_PRODUCT);
  };

  const handleAddManualProduct = () => {
    const name = manualProduct.name.trim();
    const brand = manualProduct.brand.trim() || 'Manual Entry';
    const currentPrice = Number(manualProduct.currentPrice);
    const previousPrice = manualProduct.previousPrice.trim()
      ? Number(manualProduct.previousPrice)
      : currentPrice;
    const targetPrice = manualProduct.targetPrice.trim()
      ? Number(manualProduct.targetPrice)
      : undefined;

    if (!name) {
      Alert.alert('Product Name Required', 'Add a product name before saving.');
      return;
    }

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      Alert.alert('Current Price Required', 'Enter a valid current price.');
      return;
    }

    if (!Number.isFinite(previousPrice) || previousPrice <= 0) {
      Alert.alert('Previous Price Invalid', 'Previous price must be a valid number.');
      return;
    }

    if (targetPrice !== undefined && (!Number.isFinite(targetPrice) || targetPrice <= 0)) {
      Alert.alert('Target Price Invalid', 'Target price must be a valid number.');
      return;
    }

    const now = Date.now();
    const productId = manualProduct.upc.trim() || `manual_${now}`;
    const store = manualProduct.store.trim() || 'Manual price';
    const priceDropPercent =
  currentPrice < previousPrice
    ? ((previousPrice - currentPrice) / previousPrice) * 100
    : 0;

    addToWatchlist({
      id: `watch_manual_${now}`,
      productId,
      name,
      brand,
      image: manualProduct.image.trim() || FALLBACK_PRODUCT_IMAGE,
      currentPrice,
      previousPrice,
      priceDropPercent,
      targetPrice,
      priceHistory: [
        {
          timestamp: now - 30 * 24 * 60 * 60 * 1000,
          price: previousPrice,
          store,
        },
        {
          timestamp: now,
          price: currentPrice,
          store,
        }
      ],
      addedAt: now,
    });

    showToast(`${name} added to wishlist`);
    resetManualForm();
    setManualFormVisible(false);
  };


  const ManualInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
  }: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'url';
  }) => (
    <View className="mb-4">
      <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider mb-1.5">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textDim}
        keyboardType={keyboardType}
        style={{ color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
        className="w-full border rounded-2xl px-4 py-3 text-sm font-semibold"
      />
    </View>
  );

  return (
    <View style={{ backgroundColor: theme.bg }} className="flex-1">

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent.hex} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-16 pb-6">
          
          {/* Header */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between gap-3 mb-2">
              <View className="flex-row items-center gap-3 flex-1">
                <Text style={{ color: theme.text }} className="text-4xl font-black">Wishlist</Text>
                <View style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }} className="px-3 py-1 border rounded-full">
                  <Text style={{ color: theme.textMuted }} className="text-lg font-bold">{totalProducts}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setManualFormVisible((visible) => !visible)}
                style={{ backgroundColor: accent.hex }}
                className="w-11 h-11 rounded-2xl items-center justify-center"
              >
                {manualFormVisible ? (
                  <X size={20} color={isDark ? "#0A0E15" : "#FFFFFF"} strokeWidth={3} />
                ) : (
                  <Plus size={22} color={isDark ? "#0A0E15" : "#FFFFFF"} strokeWidth={3} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={{ color: theme.textMuted }} className="text-base">Track prices and catch the best deals.</Text>
          </View>

          {manualFormVisible && (
            <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="border rounded-3xl p-4 mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text style={{ color: theme.text }} className="text-lg font-bold">Add Product</Text>
                <TouchableOpacity
                  onPress={resetManualForm}
                  style={{ backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                  className="px-3 py-2 border rounded-xl"
                >
                  <Text style={{ color: theme.textMuted }} className="text-xs font-bold">Clear</Text>
                </TouchableOpacity>
              </View>

              <ManualInput
                label="Product"
                value={manualProduct.name}
                onChangeText={(value) => updateManualField('name', value)}
                placeholder="Milk, protein powder, headphones..."
              />
              <ManualInput
                label="Brand"
                value={manualProduct.brand}
                onChangeText={(value) => updateManualField('brand', value)}
                placeholder="Brand or store label"
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <ManualInput
                    label="Current"
                    value={manualProduct.currentPrice}
                    onChangeText={(value) => updateManualField('currentPrice', value)}
                    placeholder="499"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <ManualInput
                    label="Previous"
                    value={manualProduct.previousPrice}
                    onChangeText={(value) => updateManualField('previousPrice', value)}
                    placeholder="599"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <ManualInput
                    label="Target"
                    value={manualProduct.targetPrice}
                    onChangeText={(value) => updateManualField('targetPrice', value)}
                    placeholder="449"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <ManualInput
                    label="UPC"
                    value={manualProduct.upc}
                    onChangeText={(value) => updateManualField('upc', value.replace(/\D/g, ''))}
                    placeholder="Optional"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <ManualInput
                label="Store"
                value={manualProduct.store}
                onChangeText={(value) => updateManualField('store', value)}
                placeholder="Amazon, Walmart, local shop..."
              />
              <ManualInput
                label="Image URL"
                value={manualProduct.image}
                onChangeText={(value) => updateManualField('image', value)}
                placeholder="Optional product image link"
                keyboardType="url"
              />

              <TouchableOpacity
                onPress={handleAddManualProduct}
                style={{ backgroundColor: accent.hex }}
                className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 mt-1"
              >
                <Save size={18} color={isDark ? "#0A0E15" : "#FFFFFF"} strokeWidth={3} />
                <Text style={{ color: isDark ? "#0A0E15" : "#FFFFFF" }} className="font-bold text-sm">Save Product</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Savings Highlight */}
          <View className="flex-row gap-4 mb-8">
            <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="flex-1 border rounded-3xl p-4 flex-row items-center gap-4">
              <View style={{ backgroundColor: accent.hexLight + "1a" }} className="w-12 h-12 rounded-2xl items-center justify-center">
                <IndianRupee size={24} color={accent.hex} />
              </View>
              <View>
                <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider mb-1">Total Savings</Text>
                <Text style={{ color: theme.text }} className="font-bold text-xl">₹{potentialSavings.toFixed(0)}</Text>
              </View>
            </View>

            <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="flex-1 border rounded-3xl p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl bg-[#F4A261]/15 items-center justify-center">
                <Target size={24} color="#F4A261" />
              </View>
              <View>
                <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider mb-1">Active Alerts</Text>
                <Text style={{ color: theme.text }} className="font-bold text-xl">{activeAlerts}</Text>
              </View>
            </View>
          </View>

          {sanitizedWatchlist.length > 0 ? (
            <>
              {/* Filter Toolbar */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <FilterButton label="All Items" value="all" />
                <FilterButton label="Price Dropped" value="price_dropped" />
                <FilterButton label="Has Target" value="has_target" />
              </ScrollView>

              {/* Items List */}
              {filteredWatchlist.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <Text style={{ color: theme.textMuted }}>No items match this filter.</Text>
                </View>
              ) : (
                <View>
                  {filteredWatchlist.map(item => (
                    <WishlistCard key={item.id} item={item} showToast={showToast} />
                  ))}
                </View>
              )}
            </>
          ) : (
            /* Empty State */
            <View className="items-center justify-center py-16">
              <View className="w-40 h-40 mb-6 items-center justify-center">
                <View className="absolute inset-0 bg-[#F4A261]/10 rounded-full" />
                <Heart size={80} color="rgba(244,162,97,0.5)" strokeWidth={1} />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold mb-2">Wishlist is Empty</Text>
              <Text style={{ color: theme.textMuted }} className="text-center mb-8 px-6">
                Add a product manually to start tracking its price.
              </Text>
              <TouchableOpacity
                onPress={() => setManualFormVisible(true)}
                style={{ backgroundColor: accent.hex }}
                className="px-8 py-4 rounded-2xl flex-row items-center gap-2"
              >
                <Plus size={20} color={isDark ? "#0A0E15" : "#FFFFFF"} strokeWidth={3} />
                <Text style={{ color: isDark ? "#0A0E15" : "#FFFFFF" }} className="font-bold text-lg">Add Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {toastMessage && (
        <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="absolute bottom-10 left-6 right-6 border rounded-2xl p-4 flex-row items-center gap-3 shadow-2xl z-50">
          <View style={{ backgroundColor: accent.hexLight + "1a" }} className="w-5 h-5 rounded-full items-center justify-center">
            <Text style={{ color: accent.hex }} className="text-[10px] font-bold">✓</Text>
          </View>
          <Text style={{ color: theme.text }} className="text-sm font-semibold flex-1">{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}
