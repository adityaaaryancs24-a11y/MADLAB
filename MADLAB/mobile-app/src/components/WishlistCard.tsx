import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingDown, Trash2, Bell } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import type { WatchlistItem } from '../types';
import { useApp } from '../context/AppContext';

interface WishlistCardProps {
  item: WatchlistItem;
  showToast: (message: string) => void;
}

export function WishlistCard({ item, showToast }: WishlistCardProps) {
  const router = useRouter();
  const { removeFromWatchlist, updateWatchlistItem, settings } = useApp();
  const isManualProduct = item.productId && typeof item.productId === 'string' ? item.productId.startsWith('manual_') : false;

  // Defensive sanitization of product fields
  const currentPrice = typeof item.currentPrice === 'number' && !isNaN(item.currentPrice) ? item.currentPrice : 0;
  const previousPrice = typeof item.previousPrice === 'number' && !isNaN(item.previousPrice) ? item.previousPrice : currentPrice;
  const priceDropPercent = typeof item.priceDropPercent === 'number' && !isNaN(item.priceDropPercent) ? item.priceDropPercent : 0;
  const targetPrice = typeof item.targetPrice === 'number' && !isNaN(item.targetPrice) ? item.targetPrice : undefined;

  // Modal Input states
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [customPercentInput, setCustomPercentInput] = useState('');

  const handleRemove = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    removeFromWatchlist(item.id);
    setDeleteModalVisible(false);
    showToast(`${item.name || 'Product'} removed from wishlist`);
  };

  const handleSetTarget = () => {
    const initialPrice = targetPrice !== undefined ? targetPrice.toFixed(2) : (currentPrice * 0.9).toFixed(2);
    const initialPercent = targetPrice !== undefined 
      ? Math.round(((currentPrice - targetPrice) / currentPrice) * 100).toString() 
      : '10';
    setCustomPriceInput(initialPrice);
    setCustomPercentInput(initialPercent);
    setModalVisible(true);
  };

  const handlePriceChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    setCustomPriceInput(sanitized);
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed) && parsed > 0 && currentPrice > 0) {
      const pct = ((currentPrice - parsed) / currentPrice) * 100;
      setCustomPercentInput(Math.round(pct).toString());
    } else {
      setCustomPercentInput('');
    }
  };

  const handlePercentChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    setCustomPercentInput(sanitized);
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed) && parsed >= 0) {
      const newPrice = currentPrice * (1 - parsed / 100);
      setCustomPriceInput(newPrice.toFixed(2));
    } else {
      setCustomPriceInput('');
    }
  };

  const handleDeleteTarget = () => {
    updateWatchlistItem(item.id, { targetPrice: undefined });
    setModalVisible(false);
    showToast('Price alert removed');
  };

  const handleSaveTarget = () => {
    const parsedPrice = parseFloat(customPriceInput);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid target price.');
      return;
    }
    updateWatchlistItem(item.id, { targetPrice: Number(parsedPrice.toFixed(2)) });
    setModalVisible(false);
    showToast(`Alert set for ₹${parsedPrice.toFixed(2)}`);
  };

  // Realistic price drop expectations calculation
  const percentDrop = parseFloat(customPercentInput) || 0;
  const targetPriceVal = parseFloat(customPriceInput) || 0;

  let feedbackMessage = '';
  let feedbackColor = '#F4A261'; // orange

  if (targetPriceVal <= 0 || isNaN(targetPriceVal)) {
    feedbackMessage = '💡 Enter a target price or percentage drop to receive a notification.';
    feedbackColor = 'rgba(255,255,255,0.4)';
  } else if (targetPriceVal >= currentPrice) {
    feedbackMessage = '⚠️ Target price is higher than or equal to current price. You will receive alerts immediately.';
    feedbackColor = '#EC4899'; // pinkish red
  } else if (percentDrop > 0 && percentDrop <= 5) {
    feedbackMessage = '💡 Fluctuation Range: Prices drop by 5% often. This is highly achievable soon.';
    feedbackColor = '#2ECC71'; // green
  } else if (percentDrop > 5 && percentDrop <= 25) {
    feedbackMessage = '✅ Realistic Target: This drop is reasonable and common during standard sales.';
    feedbackColor = '#2ECC71'; // green
  } else if (percentDrop > 25 && percentDrop <= 40) {
    feedbackMessage = '📈 Optimistic Target: Requires a major discount (e.g. Black Friday). It may take time.';
    feedbackColor = '#F4A261'; // orange
  } else {
    feedbackMessage = `❌ Unlikely Drop (${percentDrop.toFixed(0)}%): Prices rarely drop this low. We recommend a target above ₹${(currentPrice * 0.8).toFixed(0)} (20% off) for a realistic alert.`;
    feedbackColor = '#EF4444'; // red
  }

  const isPriceDropped = currentPrice < previousPrice;

  const renderRightActions = () => {
    return (
      <View className="flex-row items-center h-full pb-4">
        <TouchableOpacity
          onPress={handleSetTarget}
          style={{ backgroundColor: '#F4A261' }}
          className="justify-center items-center w-16 h-full ml-2 rounded-2xl"
        >
          <Bell size={24} color="#0A0E15" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRemove}
          className="bg-red-500 justify-center items-center w-16 h-full ml-2 rounded-2xl"
        >
          <Trash2 size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const fontScale = settings.fontSize === 'small' ? 0.88 : settings.fontSize === 'large' ? 1.15 : 1.0;

  return (
    <>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (isManualProduct) {
              Alert.alert(item.name || 'Product', 'This product is tracked from your manual wishlist entry.');
              return;
            }
            router.push(`/product/${item.productId}`);
          }}
          className={`w-full bg-white/5 border ${settings.highContrast ? 'border-white/35' : 'border-white/10'} rounded-3xl p-4 mb-4 relative`}
        >
          {isPriceDropped && (
            <View className="absolute top-4 right-4 z-10 px-2 py-1 bg-[#2ECC71] rounded-lg flex-row items-center gap-1 shadow-lg">
              <TrendingDown size={12} color="#0A0E15" strokeWidth={3} />
              <Text style={{ fontSize: 10 * fontScale }} className="font-bold text-[#0A0E15]">
                {priceDropPercent.toFixed(1)}% Drop
              </Text>
            </View>
          )}

          <View className="flex-row items-center">
            <View className={`w-20 h-20 rounded-2xl bg-white/10 p-2 overflow-hidden border ${settings.highContrast ? 'border-white/35' : 'border-white/10'} justify-center items-center`}>
              <Image
                source={{ uri: item.image || 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=500' }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            
            <View className="flex-1 ml-4 justify-center">
              <Text style={{ fontSize: 10 * fontScale }} className="font-bold text-white/50 uppercase tracking-wider mb-1">
                {item.brand || 'General'}
              </Text>
              <Text style={{ fontSize: 14 * fontScale }} className="text-white font-semibold mb-2" numberOfLines={2}>
                {item.name || 'Unnamed Product'}
              </Text>
              
              <View className="flex-row items-end gap-2">
                <Text style={{ fontSize: 20 * fontScale }} className="text-[#2ECC71] font-bold">
                  ₹{currentPrice.toFixed(2)}
                </Text>
                {previousPrice > currentPrice && (
                  <Text style={{ fontSize: 12 * fontScale }} className="text-white/40 line-through mb-1">
                    ₹{previousPrice.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="mt-2.5 pt-2 border-t border-white/[0.03] flex-row justify-between items-center">
            {targetPrice !== undefined ? (
              <Text style={{ fontSize: 10 * fontScale }} className="text-[#F4A261] font-semibold">
                Alert set at ₹{targetPrice.toFixed(2)} ({Math.round(((currentPrice - targetPrice) / currentPrice) * 100)}% drop)
              </Text>
            ) : (
              <View />
            )}
            <Text style={{ fontSize: 10 * fontScale }} className="text-white/25 italic">Swipe left to edit or delete</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>

      {/* Edit Target price Custom Dark Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
          className="flex-1 bg-black/75 justify-center items-center px-6"
        >
          <TouchableOpacity 
            activeOpacity={1} 
            className="w-full bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            {/* Header */}
            <Text className="text-white text-xl font-bold mb-1">Price Alert Settings</Text>
            <Text className="text-white/40 text-xs mb-5" numberOfLines={1}>
              {item.name || 'Unnamed Product'}
            </Text>

            {/* Current Price display */}
            <View className="mb-5 bg-white/5 p-4 rounded-2xl flex-row justify-between items-center border border-white/[0.03]">
              <Text className="text-white/50 text-sm font-semibold">Current Price</Text>
              <Text className="text-[#2ECC71] font-black text-xl">₹{currentPrice.toFixed(2)}</Text>
            </View>

            {/* Side-by-side inputs */}
            <View className="flex-row gap-4 mb-5">
              {/* Target Price input */}
              <View className="flex-1">
                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1.5">Target Price (₹)</Text>
                <TextInput
                  value={customPriceInput}
                  onChangeText={handlePriceChange}
                  placeholder="e.g. 19200"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="decimal-pad"
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm font-semibold"
                />
              </View>

              {/* Percent Drop input */}
              <View className="w-28">
                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1.5">Min. Drop (%)</Text>
                <TextInput
                  value={customPercentInput}
                  onChangeText={handlePercentChange}
                  placeholder="e.g. 10"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="decimal-pad"
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm font-semibold text-center"
                />
              </View>
            </View>

            {/* Realistic rate warning notice */}
            <View className="mb-6 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl min-h-[50px] justify-center">
              <Text className="text-xs leading-5 font-semibold" style={{ color: feedbackColor }}>
                {feedbackMessage}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2.5">
              {targetPrice !== undefined ? (
                <TouchableOpacity
                  onPress={handleDeleteTarget}
                  className="px-4 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl items-center justify-center"
                >
                  <Text className="text-red-400 font-bold text-sm">Delete Alert</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 py-4 bg-white/5 rounded-2xl items-center justify-center"
              >
                <Text className="text-white/60 font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTarget}
                className="flex-1 py-4 bg-[#2ECC71] rounded-2xl items-center justify-center"
              >
                <Text className="text-[#0A0E15] font-black text-sm">Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Custom Dark Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setDeleteModalVisible(false)}
          className="flex-1 bg-black/75 justify-center items-center px-6"
        >
          <TouchableOpacity 
            activeOpacity={1} 
            className="w-full bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            {/* Header */}
            <Text className="text-white text-xl font-bold mb-2">Remove Item</Text>
            <Text className="text-white/60 text-sm mb-6 leading-5">
              Are you sure you want to remove <Text className="text-[#2ECC71] font-semibold">{item.name || 'this product'}</Text> from your wishlist?
            </Text>

            {/* Action Buttons */}
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                className="flex-1 py-4 bg-white/5 rounded-2xl items-center justify-center border border-white/5"
              >
                <Text className="text-white/60 font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                className="flex-1 py-4 bg-red-500 rounded-2xl items-center justify-center shadow-lg shadow-red-500/20"
              >
                <Text className="text-white font-black text-sm">Remove</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
