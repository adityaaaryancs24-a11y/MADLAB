import { useCallback, useRef, useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { productService } from "../services/productService";

/** Strip non-digits so manual entry and camera scans match DB UPCs. */
export function normalizeBarcode(raw: string): string {
  return raw.replace(/\D/g, "").trim();
}

export function useBarcodeLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const isCooldownRef = useRef(false);

  const processBarcode = useCallback(async (rawBarcode: string) => {
    const cleanedBarcode = normalizeBarcode(rawBarcode);

    if (!cleanedBarcode) {
      setLoadingError("Please enter a valid barcode.");
      return;
    }

    if (isCooldownRef.current) return;

    isCooldownRef.current = true;
    setIsLoading(true);
    setLoadingStep(0);
    setLoadingError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      setLoadingStep(1);
      const product = await productService.getProductByUPC(cleanedBarcode);

      setLoadingStep(2);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLoadingStep(3);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await new Promise((resolve) => setTimeout(resolve, 400));

      setIsLoading(false);

      router.push({
        pathname: `/product/${cleanedBarcode}`,
        params: {
          upc: cleanedBarcode,
          productJson: JSON.stringify(product),
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Product not found for this barcode.";
      setLoadingError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      setTimeout(() => {
        setIsLoading(false);
        setLoadingError(null);
        isCooldownRef.current = false;
      }, 3000);
      return;
    }

    setTimeout(() => {
      isCooldownRef.current = false;
    }, 1000);
  }, []);

  const resetCooldown = useCallback(() => {
    isCooldownRef.current = false;
  }, []);

  return {
    isLoading,
    loadingStep,
    loadingError,
    processBarcode,
    resetCooldown,
    isCooldownRef,
  };
}
