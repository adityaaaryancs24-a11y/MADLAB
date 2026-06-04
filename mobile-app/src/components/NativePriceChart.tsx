import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Text as SvgText } from 'react-native-svg';
import { TrendingDown, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48; // Padding
const CHART_HEIGHT = 160;

interface NativePriceChartProps {
  data: Array<{ date: string; price: number }>;
}

export function NativePriceChart({ data }: NativePriceChartProps) {
  if (!data || data.length === 0) return null;

  const currentPrice = data[data.length - 1]?.price || 0;
  const firstPrice = data[0]?.price || 0;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(1);
  const isUp = priceChange >= 0;

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const range = Math.max(maxPrice - minPrice, 1);

  // Generate SVG Path
  const padding = 10;
  const usableHeight = CHART_HEIGHT - padding * 2;
  const stepX = CHART_WIDTH / Math.max(1, data.length - 1);
  
  let d = `M 0 ${CHART_HEIGHT - padding - ((data[0].price - minPrice) / range) * usableHeight}`;
  
  let minPoint = { x: 0, y: CHART_HEIGHT - padding - ((data[0].price - minPrice) / range) * usableHeight, price: data[0].price };
  let maxPoint = { x: 0, y: CHART_HEIGHT - padding - ((data[0].price - minPrice) / range) * usableHeight, price: data[0].price };

  data.forEach((point, index) => {
    const x = index * stepX;
    const y = CHART_HEIGHT - padding - ((point.price - minPrice) / range) * usableHeight;
    
    if (index > 0) {
      d += ` L ${x} ${y}`;
    }

    if (point.price < minPoint.price) {
      minPoint = { x, y, price: point.price };
    }
    if (point.price > maxPoint.price) {
      maxPoint = { x, y, price: point.price };
    }
  });

  const lastPoint = data[data.length - 1];
  const lastX = (data.length - 1) * stepX;
  const lastY = CHART_HEIGHT - padding - ((lastPoint.price - minPrice) / range) * usableHeight;

  // Close path for area
  const areaD = `${d} L ${lastX} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;

  return (
    <View className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-6">
      <View className="mb-4">
        <View className="flex-row items-center gap-2 mb-2">
          {isUp ? (
            <TrendingUp size={20} color="#F4A261" />
          ) : (
            <TrendingDown size={20} color="#2ECC71" />
          )}
          <Text className="text-xs font-bold text-white/70 uppercase tracking-wide">
            30-Day Price History
          </Text>
        </View>
        
        <View className="flex-row items-baseline gap-2">
          <Text className="text-3xl font-bold text-white">
            ₹{currentPrice.toFixed(2)}
          </Text>
          <View className={`px-2 py-1 rounded-xl ${isUp ? 'bg-[#F4A261]/20' : 'bg-[#2ECC71]/20'}`}>
            <Text className={`text-xs font-bold ${isUp ? 'text-[#F4A261]' : 'text-[#2ECC71]'}`}>
              {isUp ? '↑' : '↓'} ₹{Math.abs(priceChange).toFixed(0)} ({priceChangePercent}%)
            </Text>
          </View>
        </View>
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2ECC71" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#2ECC71" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={areaD} fill="url(#gradient)" />
        <Path d={d} fill="none" stroke="#2ECC71" strokeWidth="3" />
        
        {/* Min Point Marker */}
        <Circle cx={minPoint.x} cy={minPoint.y} r="5" fill="#2ECC71" stroke="#0A0E15" strokeWidth="2" />
        <SvgText x={minPoint.x} y={minPoint.y - 12} fill="#2ECC71" fontSize="10" fontWeight="bold" textAnchor="middle">
          Low
        </SvgText>

        {/* Max Point Marker */}
        <Circle cx={maxPoint.x} cy={maxPoint.y} r="5" fill="#EF4444" stroke="#0A0E15" strokeWidth="2" />
        <SvgText x={maxPoint.x} y={maxPoint.y - 12} fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle">
          High
        </SvgText>

        {/* Current Point Marker (only if not min/max) */}
        {lastX !== minPoint.x && lastX !== maxPoint.x && (
          <Circle cx={lastX} cy={lastY} r="4" fill="#3B82F6" stroke="#0A0E15" strokeWidth="2" />
        )}
      </Svg>
    </View>
  );
}
