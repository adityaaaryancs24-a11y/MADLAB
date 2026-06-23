import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Keyboard, ShieldAlert, X, Zap } from "lucide-react-native";

import { ScannerOverlay } from "../../components/scanner/ScannerOverlay";
import { LoadingSteps } from "../../components/scanner/LoadingSteps";
import { BackendProduct } from "../../services/productService";
import { useApp } from "../../src/context/AppContext";
import { useBarcodeLookup } from "../../hooks/useBarcodeLookup";
import { useAppTheme } from "../../src/hooks/useAppTheme";

const SCAN_LOCK_MS = 2000;

export default function ScannerScreen() {
  const { addToHistory, settings } = useApp();
  const { theme, accent, isDark } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
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

  const { isLoading, loadingStep, loadingError, processBarcode } =
    useBarcodeLookup({ onProductFound: handleProductFound });

  const handleBarcodeScanned = async ({ type, data }: { type: string; data?: string }) => {
    console.log("BARCODE DETECTED");
    console.log("TYPE:", type);
    console.log("DATA:", data);
    console.log("SCAN LOCK:", scanLocked);
    console.log("LOADING:", isLoading);

    if (scanLocked || isLoading) return;

    setScanLocked(true);

    try {
      if (settings.hapticFeedback) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Haptics are optional on some devices and simulators.
    }

    try {
      const productFound = await processBarcode(data);

      if (productFound) {
        setTimeout(() => setScanLocked(false), SCAN_LOCK_MS);
      } else {
        setScanLocked(false);
      }
    } catch (error) {
      console.error("[ScannerScreen] Barcode processing failed", error);
      setScanLocked(false);
    }
  };

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

  if (!permission) {
    return (
      <View style={{ backgroundColor: theme.bg }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={accent.hex} />
        <Text style={{ color: theme.textMuted }} className="text-sm mt-4 font-medium">Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ backgroundColor: theme.bg }} className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-red-500/10 items-center justify-center mb-6">
          <ShieldAlert size={36} color="#EF4444" />
        </View>
        <Text style={{ color: theme.text }} className="text-2xl font-bold mb-3 text-center">Camera Access Required</Text>
        <Text style={{ color: theme.textMuted }} className="text-base text-center mb-8 leading-relaxed">
          Verity needs camera permissions to scan EAN/UPC product barcodes and look up retail prices.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ backgroundColor: accent.hex }}
          className="w-full py-4 rounded-2xl items-center"
        >
          <Text style={{ color: isDark ? "#0A0E15" : "#FFFFFF" }} className="font-bold text-lg">Allow Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ backgroundColor: theme.bg }} className="flex-1 relative">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <ScannerOverlay
        torchEnabled={torchEnabled}
        onToggleTorch={() => setTorchEnabled(!torchEnabled)}
        isScanning={!scanLocked && !isLoading}
      />

      <LoadingSteps isVisible={isLoading} step={loadingStep} error={loadingError} />

      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none" className="justify-between">
        <View className="w-full justify-center px-6 pt-12" pointerEvents="none">
          <View className="flex-row items-center gap-2">
            <Zap size={22} color={accent.hex} fill={accent.hex} />
            <Text className="text-white font-extrabold text-xl tracking-tight">VERITY SCAN</Text>
          </View>
        </View>

        <View className="w-full items-center justify-between px-6 pb-12 pt-8" pointerEvents="box-none">
          <View className="items-center px-4 mb-4" pointerEvents="none">
            <Text className="text-white text-center text-sm font-semibold mb-2">
              Supports UPC & EAN Grocery Barcodes
            </Text>
            <Text className="text-white/40 text-center text-xs leading-relaxed">
              Use Manual Barcode to test without a physical product label.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setManualInputVisible(true)}
            className="w-full py-4 bg-black/40 border border-white/10 rounded-2xl flex-row items-center justify-center gap-2"
          >
            <Keyboard size={18} color={accent.hex} />
            <Text className="text-white/90 font-bold text-sm">Manual Barcode</Text>
          </TouchableOpacity>
        </View>
      </View>

      {manualInputVisible && (
        <ScrollView
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="always"
        >
          <View className="absolute inset-0 bg-black/85 items-center justify-center p-6">
            <View style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} className="w-full border rounded-3xl p-6 relative">
              <TouchableOpacity
                onPress={() => {
                  setManualInputVisible(false);
                  setInputError(null);
                }}
                style={{ backgroundColor: theme.bgCardAlt }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center"
              >
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>

              <Text style={{ color: theme.text }} className="text-lg font-bold mb-1">Enter Barcode</Text>
              <Text style={{ color: theme.textMuted }} className="text-xs mb-5">
                Type a standard 12-digit UPC or 13-digit EAN code.
              </Text>

              <TextInput
                value={manualBarcode}
                onChangeText={(text) => {
                  setManualBarcode(text);
                  if (inputError) setInputError(null);
                }}
                placeholder="e.g. 034000000210"
                placeholderTextColor={theme.textDim}
                keyboardType="numeric"
                maxLength={14}
                autoFocus
                style={{ color: theme.text, backgroundColor: theme.bgCardAlt, borderColor: theme.border }}
                className="w-full border rounded-2xl py-4 px-4 text-base font-semibold mb-3 text-center"
              />

              {inputError && (
                <Text className="text-red-400 text-xs font-semibold mb-4 text-center">{inputError}</Text>
              )}

              <TouchableOpacity
                onPress={handleManualSubmit}
                style={{ backgroundColor: accent.hex }}
                className="w-full py-4 rounded-2xl items-center mt-1"
              >
                <Text style={{ color: isDark ? "#0A0E15" : "#FFFFFF" }} className="font-bold text-sm">Look up Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
