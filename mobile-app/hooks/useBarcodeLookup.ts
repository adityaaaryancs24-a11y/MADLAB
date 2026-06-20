import { useCallback, useRef, useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { BackendProduct, productService } from "../services/productService";

/** Strip non-digits so manual entry and camera scans match DB UPCs. */
export function normalizeBarcode(raw: unknown): string {
  return String(raw ?? "").replace(/\D/g, "").trim();
}

interface UseBarcodeLookupOptions {
  onProductFound?: (product: BackendProduct) => void;
}

export function useBarcodeLookup(options: UseBarcodeLookupOptions = {}) {
  const { onProductFound } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const isCooldownRef = useRef(false);

  const processBarcode = useCallback(async (rawBarcode: unknown): Promise<boolean> => {
    console.log("RAW BARCODE:", rawBarcode);
    const cleanedBarcode = normalizeBarcode(rawBarcode);
    console.log("NORMALIZED:", cleanedBarcode);

    if (!cleanedBarcode) {
      setIsLoading(true);
      setLoadingError("Please enter a valid barcode.");
      setTimeout(() => {
        setIsLoading(false);
        setLoadingError(null);
      }, 3000);
      return false;
    }

    if (isCooldownRef.current) return false;

    isCooldownRef.current = true;
    setIsLoading(true);
    setLoadingStep(0);
    setLoadingError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      setLoadingStep(1);
      console.log("LOOKING UP PRODUCT:", cleanedBarcode);
      const product = await productService.getProductByUPC(cleanedBarcode);
      console.log("PRODUCT RESULT:", product);
      onProductFound?.(product);

      setLoadingStep(2);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLoadingStep(3);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await new Promise((resolve) => setTimeout(resolve, 400));

      setIsLoading(false);

      console.log("NAVIGATING TO:", cleanedBarcode);
      router.push({
        pathname: `/product/${cleanedBarcode}` as any,
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
      return false;
    }

    setTimeout(() => {
      isCooldownRef.current = false;
    }, 2000);

    return true;
  }, [onProductFound]);

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
