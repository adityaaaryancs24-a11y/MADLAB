import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { Heart, Plus, X, Save, IndianRupee, Target } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import { WishlistCard } from '../../src/components/WishlistCard';


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
        className={`px-4 py-2 rounded-xl mr-2 ${isActive ? 'bg-[#2ECC71]' : 'bg-white/10'}`}
      >
        <Text className={`font-semibold ${isActive ? 'text-[#0A0E15]' : 'text-white'}`}>
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
      previousPrice > currentPrice
        ? Number((((previousPrice - currentPrice) / previousPrice) * 100).toFixed(1))
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
        },
      ],
      addedAt: now,
    });

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
    <View className="mb-3">
      <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.28)"
        keyboardType={keyboardType}
        className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-semibold"
      />
    </View>
  );

  return (
    <View className="flex-1 bg-[#0A0E15]">

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2ECC71" />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-16 pb-6">
          
          {/* Header */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between gap-3 mb-2">
              <View className="flex-row items-center gap-3 flex-1">
                <Text className="text-4xl font-black text-white">Wishlist</Text>
                <View className="px-3 py-1 bg-white/10 rounded-full">
                  <Text className="text-lg font-bold text-white/70">{totalProducts}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setManualFormVisible((visible) => !visible)}
                className="w-11 h-11 rounded-2xl bg-[#2ECC71] items-center justify-center"
              >
                {manualFormVisible ? (
                  <X size={20} color="#0A0E15" strokeWidth={3} />
                ) : (
                  <Plus size={22} color="#0A0E15" strokeWidth={3} />
                )}
              </TouchableOpacity>
            </View>
            <Text className="text-white/50 text-base">Track prices and catch the best deals.</Text>
          </View>

          {manualFormVisible && (
            <View className="bg-white/5 border border-white/10 rounded-3xl p-4 mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-bold">Add Product</Text>
                <TouchableOpacity
                  onPress={resetManualForm}
                  className="px-3 py-2 rounded-xl bg-white/10"
                >
                  <Text className="text-white/70 text-xs font-bold">Clear</Text>
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
                className="w-full py-4 bg-[#2ECC71] rounded-2xl flex-row items-center justify-center gap-2 mt-1"
              >
                <Save size={18} color="#0A0E15" strokeWidth={3} />
                <Text className="text-[#0A0E15] font-bold text-sm">Save Product</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Savings Highlight */}
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl bg-[#2ECC71]/20 items-center justify-center">
                <IndianRupee size={24} color="#2ECC71" />
              </View>
              <View>
                <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">Total Savings</Text>
                <Text className="text-white font-bold text-xl">₹{potentialSavings.toFixed(0)}</Text>
              </View>
            </View>

            <View className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl bg-[#F4A261]/20 items-center justify-center">
                <Target size={24} color="#F4A261" />
              </View>
              <View>
                <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">Active Alerts</Text>
                <Text className="text-white font-bold text-xl">{activeAlerts}</Text>
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
                  <Text className="text-white/50">No items match this filter.</Text>
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
                <View className="absolute inset-0 bg-[#F4A261]/20 rounded-full" />
                <Heart size={80} color="rgba(244,162,97,0.5)" strokeWidth={1} />
              </View>
              <Text className="text-2xl font-bold text-white mb-2">Wishlist is Empty</Text>
              <Text className="text-white/50 text-center mb-8 px-6">
                Add a product manually to start tracking its price.
              </Text>
              <TouchableOpacity
                onPress={() => setManualFormVisible(true)}
                className="bg-[#2ECC71] px-8 py-4 rounded-2xl flex-row items-center gap-2"
              >
                <Plus size={20} color="#0A0E15" strokeWidth={3} />
                <Text className="text-[#0A0E15] font-bold text-lg">Add Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {toastMessage && (
        <View className="absolute bottom-10 left-6 right-6 bg-[#111827] border border-white/10 rounded-2xl p-4 flex-row items-center gap-3 shadow-2xl z-50">
          <View className="w-5 h-5 rounded-full bg-[#2ECC71]/20 items-center justify-center">
            <Text className="text-[10px] text-[#2ECC71] font-bold">✓</Text>
          </View>
          <Text className="text-white text-sm font-semibold flex-1">{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}
