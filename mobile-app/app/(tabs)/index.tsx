import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Zap, Keyboard, X, ShieldAlert } from "lucide-react-native";

import { ScannerOverlay } from "../../components/scanner/ScannerOverlay";
import { LoadingSteps } from "../../components/scanner/LoadingSteps";
import { useBarcodeLookup } from "../../hooks/useBarcodeLookup";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [manualInputVisible, setManualInputVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const { isLoading, loadingStep, loadingError, processBarcode, isCooldownRef } =
    useBarcodeLookup();

  const handleBarcodeScanned = async ({ data }: { type: string; data: string }) => {
    if (isCooldownRef.current || !isScanning || isLoading) return;

    isCooldownRef.current = true;
    setIsScanning(false);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* haptics optional */
    }

    await processBarcode(data);
    setIsScanning(true);
  };

  const handleManualSubmit = () => {
    if (!manualBarcode.trim()) {
      setInputError("Please enter a barcode number");
      return;
    }

    setManualInputVisible(false);
    setManualBarcode("");
    setInputError(null);
    processBarcode(manualBarcode);
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-[#0A0E15] items-center justify-center">
        <ActivityIndicator size="large" color="#4ADE80" />
        <Text className="text-white/60 text-sm mt-4 font-medium">Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0E15] items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-red-500/10 items-center justify-center mb-6">
          <ShieldAlert size={36} color="#EF4444" />
        </View>
        <Text className="text-white text-2xl font-bold mb-3 text-center">Camera Access Required</Text>
        <Text className="text-white/60 text-base text-center mb-8 leading-relaxed">
          Verity needs camera permissions to scan EAN/UPC product barcodes and look up retail prices.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="w-full py-4 bg-[#4ADE80] rounded-2xl items-center shadow-lg shadow-[#4ADE80]/15"
        >
          <Text className="text-[#0A0E15] font-bold text-lg">Allow Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0E15] relative">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={isScanning && !isLoading ? handleBarcodeScanned : undefined}
      />

      <ScannerOverlay
        torchEnabled={torchEnabled}
        onToggleTorch={() => setTorchEnabled(!torchEnabled)}
        isScanning={isScanning && !isLoading}
      />

      <LoadingSteps isVisible={isLoading} step={loadingStep} error={loadingError} />

      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none" className="justify-between">
        <View className="w-full justify-center px-6 pt-12" pointerEvents="none">
          <View className="flex-row items-center gap-2">
            <Zap size={22} color="#4ADE80" fill="#4ADE80" />
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

          <View className="w-full flex-row gap-4">
            <TouchableOpacity
              onPress={() => setManualInputVisible(true)}
              className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex-row items-center justify-center gap-2"
            >
              <Keyboard size={18} color="#4ADE80" />
              <Text className="text-white/90 font-bold text-sm">Manual Barcode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
              Type standard 12-digit UPC or 13-digit EAN code.
            </Text>

            <TextInput
              value={manualBarcode}
              onChangeText={(text) => {
                setManualBarcode(text);
                if (inputError) setInputError(null);
              }}
              placeholder="e.g. 034000000210"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="numeric"
              maxLength={14}
              autoFocus
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white text-base font-semibold mb-3 text-center"
            />

            {inputError && (
              <Text className="text-red-400 text-xs font-semibold mb-4 text-center">{inputError}</Text>
            )}

            <View className="flex-row gap-2 mt-2 mb-4 justify-center flex-wrap">
              {[
                { label: "Avocados", upc: "034000000210" },
                { label: "Yogurt", upc: "041220002105" },
                { label: "La Croix", upc: "012993102123" },
                { label: "Pepsi", upc: "012000001765" },
              ].map((sample) => (
                <TouchableOpacity
                  key={sample.upc}
                  onPress={() => {
                    setManualBarcode(sample.upc);
                    setInputError(null);
                  }}
                  className="px-3 py-1.5 bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-full"
                >
                  <Text className="text-[#4ADE80] text-xs font-medium">{sample.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleManualSubmit}
              className="w-full py-4 bg-[#4ADE80] rounded-2xl items-center shadow-lg shadow-[#44b36d]/10 mt-1"
            >
              <Text className="text-[#0A0E15] font-bold text-sm">Look up Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
