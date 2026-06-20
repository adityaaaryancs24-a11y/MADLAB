import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { router } from "expo-router";
import { Search, History, Settings, Zap, TrendingUp } from "lucide-react-native";
import { useApp } from "../../src/context/AppContext";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function Home() {
  const { scanHistory } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanLineY, setScanLineY] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();

  const recentScans = scanHistory.slice(0, 5);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanLineY((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleScanClick = () => {
    setIsScanning(true);
  };

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (!isScanning) return;
    setIsScanning(false);
    // Full scan + API flow lives on the Scan tab — redirect there with the code
    const upc = data.replace(/\D/g, "");
    router.push(`/product/${upc}` as any);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View className="flex-1 bg-[#0A0E15]">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-5 border-b border-white/5 bg-[#0A0E15]/50">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-[#2ECC71] items-center justify-center shadow-lg">
            <Zap size={20} color="#0A0E15" fill="currentColor" />
          </View>
          <Text className="font-bold text-white text-[28px] tracking-tight">
            Verity
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search")}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center"
          >
            <Search size={20} color="#2ECC71" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/watchlist")}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center"
          >
            <History size={20} color="#F4A261" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Search Shortcut */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search")}
          className="w-full flex-row items-center gap-3 px-5 py-4 bg-white/5 rounded-2xl border border-white/10 mb-8"
        >
          <View className="w-10 h-10 rounded-xl bg-[#2ECC71]/20 items-center justify-center">
            <Search size={20} color="#2ECC71" />
          </View>
          <Text className="text-white/60">Search for products...</Text>
        </TouchableOpacity>

        {/* Viewfinder */}
        <View className="w-full aspect-[4/3] max-w-sm self-center mb-10 relative overflow-hidden rounded-3xl border border-white/10">
          {!permission ? (
            <View className="absolute inset-0 bg-[#1A2433]/50" />
          ) : !permission.granted ? (
            <View className="absolute inset-0 bg-[#1A2433]/50 items-center justify-center p-6">
              <Text className="text-white text-center mb-4 font-semibold">Camera access is needed to scan</Text>
              <TouchableOpacity onPress={requestPermission} className="bg-[#2ECC71] px-5 py-3 rounded-xl shadow-lg shadow-[#2ECC71]/20">
                <Text className="text-[#0A0E15] font-bold text-sm">Allow Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView 
              style={{ flex: 1 }} 
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
              }}
              onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
            />
          )}
          
          <View className="absolute inset-0 p-5" pointerEvents="none">
            <View className="absolute top-5 left-5 w-12 h-12 border-t-[3px] border-l-[3px] border-[#2ECC71] rounded-tl-xl" />
            <View className="absolute top-5 right-5 w-12 h-12 border-t-[3px] border-r-[3px] border-[#2ECC71] rounded-tr-xl" />
            <View className="absolute bottom-5 left-5 w-12 h-12 border-b-[3px] border-l-[3px] border-[#2ECC71] rounded-bl-xl" />
            <View className="absolute bottom-5 right-5 w-12 h-12 border-b-[3px] border-r-[3px] border-[#2ECC71] rounded-br-xl" />
          </View>

          {isScanning && (
            <View
              className="absolute left-0 right-0 h-1 bg-[#2ECC71]"
              style={{ top: `${scanLineY}%`, shadowColor: '#2ECC71', shadowOpacity: 1, shadowRadius: 10 }}
              pointerEvents="none"
            />
          )}

          <View className="absolute inset-0 items-center justify-center pointer-events-none" pointerEvents="none">
            <View className="px-6 py-3 bg-[#0A0E15]/80 rounded-2xl border border-white/20">
              {isScanning ? (
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 bg-[#2ECC71] rounded-full animate-pulse" />
                  <Text className="text-white font-semibold">Scanning...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold flex-row items-center gap-2">
                  Align barcode within frame
                </Text>
              )}
            </View>
          </View>

          {!isScanning && (
            <TouchableOpacity
              onPress={handleScanClick}
              className="absolute inset-0"
            />
          )}
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          onPress={handleScanClick}
          className="px-8 py-4 bg-[#2ECC71] rounded-2xl mb-8 items-center"
        >
          <Text className="font-bold text-[#0A0E15] text-lg">
            {isScanning ? "Scanning..." : "Tap to Scan"}
          </Text>
        </TouchableOpacity>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <View className="w-full">
            <View className="flex-row items-center justify-between mb-4 px-2">
              <View className="flex-row items-center gap-2">
                <TrendingUp size={16} color="#2ECC71" />
                <Text className="font-semibold text-white/70">Recent Scans</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/watchlist")}>
                <Text className="text-[#2ECC71] text-sm">View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
              {recentScans.map((scan) => (
                <TouchableOpacity
                  key={scan.id}
                  onPress={() => router.push(`/product/${scan.upc || scan.productId}` as any)}
                  className="w-24 items-center gap-2 mr-3"
                >
                  <View className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
                    <Image
                      source={{ uri: scan.image }}
                      className="w-full h-full"
                    />
                  </View>
                  <Text className="text-xs text-white/50 w-full text-center" numberOfLines={1}>
                    {formatTimeAgo(scan.timestamp)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
