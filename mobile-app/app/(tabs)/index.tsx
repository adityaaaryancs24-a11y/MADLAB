import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Keyboard, X, Zap } from "lucide-react-native";
import { BackendProduct } from "../../services/productService";
import { useApp } from "../../src/context/AppContext";
import { useBarcodeLookup } from "../../hooks/useBarcodeLookup";

const SAMPLE_BARCODES = [
  { label: "Hauser Pen", upc: "8901765126122" },
  { label: "Notebook", upc: "8902519010124" },
  { label: "Mixed Spices", upc: "8904004401011" },
  { label: "Chocolate", upc: "8901071704229" },
];
export default function ScannerScreen() {
  const { addToHistory } = useApp();
  const [manualInputVisible, setManualInputVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleProductFound = useCallback(
    (product: BackendProduct) => {
      const bestPrice = product.prices?.[0];

      addToHistory({
        id: `scan_${Date.now()}`,
        productId: product.upc,
        name: product.name,
        image: product.image,
        bestPrice: bestPrice ? `₹${bestPrice.price.toFixed(0)}` : "N/A",
        store: bestPrice?.store ?? bestPrice?.retailer ?? "Verity",
        timestamp: Date.now(),
        upc: product.upc,
      });
    },
    [addToHistory]
  );

  const { isLoading, loadingStep, processBarcode } =
    useBarcodeLookup({ onProductFound: handleProductFound });

  const handleManualSubmit = () => {
    const cleaned = manualBarcode.replace(/\D/g, "");

    if (!cleaned) {
      setInputError("Please enter a barcode number");
      return;
    }

    if (cleaned.length < 8 || cleaned.length > 14) {
      setInputError("Enter an 8 to 14 digit UPC or EAN code");
      return;
    }

    setManualInputVisible(false);
    setManualBarcode("");
    setInputError(null);
    processBarcode(cleaned);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0E15] px-6 justify-center">
      <View className="items-center mb-12">
        <View className="flex-row items-center gap-2 mb-4">
          <Zap size={28} color="#4ADE80" fill="#4ADE80" />
          <Text className="text-white font-extrabold text-3xl">VERITY</Text>
        </View>

        <Text className="text-white text-xl font-bold mb-2">
          Manual Barcode Entry
        </Text>

        <Text className="text-white/50 text-center">
          Enter a UPC/EAN barcode to look up product prices.
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => setManualInputVisible(true)}
        className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl flex-row items-center justify-center gap-3"
      >
        <Keyboard size={22} color="#4ADE80" />
        <Text className="text-white font-bold text-base">
          Enter Barcode Manually
        </Text>
      </TouchableOpacity>

      {isLoading && (
        <View className="mt-8 items-center">
          <ActivityIndicator size="large" color="#4ADE80" />
          <Text className="text-white/60 mt-3">{loadingStep}</Text>
        </View>
      )}

      {manualInputVisible && (
        <View className="absolute inset-0 bg-black/85 items-center justify-center p-6 z-50">
          <View className="w-full bg-[#111827] border border-white/10 rounded-3xl p-6 relative">
            <TouchableOpacity
              onPress={() => {
                setManualInputVisible(false);
                setInputError(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-full items-center justify-center"
            >
              <X size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>

            <Text className="text-white text-lg font-bold mb-1">Enter Barcode</Text>
            <Text className="text-white/50 text-xs mb-5">
              Type a standard 12-digit UPC or 13-digit EAN code.
            </Text>

            <TextInput
              value={manualBarcode}
              onChangeText={(text) => {
                setManualBarcode(text);
                if (inputError) setInputError(null);
              }}
              placeholder="e.g. 034000000210"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="number-pad"
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-4 text-white text-base"
            />

            {inputError && (
              <Text className="text-red-400 text-xs mt-3">{inputError}</Text>
            )}

            <View className="flex-row flex-wrap gap-2 mt-5">
              {SAMPLE_BARCODES.map((sample) => (
                <TouchableOpacity
                  key={sample.upc}
                  onPress={() => {
                    setManualBarcode(sample.upc);
                    setInputError(null);
                  }}
                  className="px-3 py-2 rounded-full bg-white/5 border border-white/10"
                >
                  <Text className="text-white/70 text-xs">{sample.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleManualSubmit}
              className="w-full py-4 bg-[#4ADE80] rounded-2xl items-center mt-6"
            >
              <Text className="text-[#0A0E15] font-bold">Search Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
