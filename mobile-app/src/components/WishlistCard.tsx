import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingDown, Trash2, Bell, Target } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import type { WatchlistItem } from '../types';
import { useApp } from '../context/AppContext';

interface WishlistCardProps {
  item: WatchlistItem;
}

export function WishlistCard({ item }: WishlistCardProps) {
  const router = useRouter();
  const { removeFromWatchlist, updateWatchlistItem } = useApp();
  const isManualProduct = item.productId.startsWith('manual_');

  const handleRemove = () => {
    Alert.alert('Remove Item', 'Remove this from your wishlist?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromWatchlist(item.id) }
    ]);
  };

  const handleSetTarget = () => {
    if (item.targetPrice) {
      Alert.alert(
        'Edit Target',
        'Would you like to edit or delete your target price?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => updateWatchlistItem(item.id, { targetPrice: undefined }) },
          { text: 'Edit', onPress: promptNewTarget }
        ]
      );
    } else {
      promptNewTarget();
    }
  };

  const promptNewTarget = () => {
    Alert.alert(
      'Target Price',
      `Set target price 10% lower than current price (₹${(item.currentPrice * 0.9).toFixed(0)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set', 
          onPress: () => updateWatchlistItem(item.id, { targetPrice: item.currentPrice * 0.9 }) 
        }
      ]
    );
  };

  const isPriceDropped = item.currentPrice < item.previousPrice;
  const progressToTarget = item.targetPrice 
    ? Math.min(100, Math.max(0, ((item.previousPrice - item.currentPrice) / (item.previousPrice - item.targetPrice)) * 100))
    : 0;

  const renderRightActions = () => {
    return (
      <View className="flex-row items-center h-full pb-4">
        <TouchableOpacity
          onPress={handleSetTarget}
          className="bg-[#F4A261] justify-center items-center w-16 h-full ml-2 rounded-2xl"
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

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (isManualProduct) {
            Alert.alert(item.name, 'This product is tracked from your manual wishlist entry.');
            return;
          }
          router.push(`/product/${item.productId}`);
        }}
        className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 mb-4 relative"
      >
        {isPriceDropped && (
          <View className="absolute top-4 right-4 z-10 px-2 py-1 bg-[#2ECC71] rounded-lg flex-row items-center gap-1 shadow-lg">
            <TrendingDown size={12} color="#0A0E15" strokeWidth={3} />
            <Text className="text-[10px] font-bold text-[#0A0E15]">
              {item.priceDropPercent.toFixed(1)}% Drop
            </Text>
          </View>
        )}

        <View className="flex-row items-center">
          <View className="w-24 h-24 rounded-2xl bg-white/10 p-2 overflow-hidden border border-white/10">
            <Image
              source={{ uri: item.image }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          
          <View className="flex-1 ml-4 justify-center">
            <Text className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">
              {item.brand}
            </Text>
            <Text className="text-white font-semibold text-sm mb-2" numberOfLines={2}>
              {item.name}
            </Text>
            
            <View className="flex-row items-end gap-2">
              <Text className="text-[#2ECC71] font-bold text-xl">
                ₹{item.currentPrice.toFixed(2)}
              </Text>
              {item.previousPrice > item.currentPrice && (
                <Text className="text-white/40 text-xs line-through mb-1">
                  ₹{item.previousPrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {item.targetPrice && (
          <View className="mt-4 p-3 bg-black/20 rounded-xl border border-white/5">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center gap-1">
                <Target size={12} color="rgba(255,255,255,0.5)" />
                <Text className="text-xs text-white/50">Target: ₹{item.targetPrice}</Text>
              </View>
              <Text className="text-xs font-bold text-[#F4A261]">
                {progressToTarget >= 100 ? "Reached!" : `Distance: ₹${(item.currentPrice - item.targetPrice).toFixed(0)}`}
              </Text>
            </View>
            <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <View 
                className="h-full bg-[#F4A261] rounded-full" 
                style={{ width: `${progressToTarget}%` }}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}
