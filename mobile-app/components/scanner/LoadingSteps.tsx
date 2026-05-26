import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { CheckCircle2, XCircle } from 'lucide-react-native';

interface LoadingStepsProps {
  isVisible: boolean;
  step: number; // 0: Reading barcode, 1: Fetching data, 2: Comparing prices, 3: Success, -1: Error
  error?: string | null;
}

const STEPS = [
  'Reading barcode...',
  'Fetching product data...',
  'Comparing retailer prices...',
];

export function LoadingSteps({ isVisible, step, error }: LoadingStepsProps) {
  if (!isVisible) return null;

  return (
    <Animated.View 
      entering={FadeIn} 
      exiting={FadeOut} 
      style={styles.container}
    >
      <View style={styles.card}>
        {error ? (
          <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.errorContainer}>
            <XCircle color="#EF4444" size={48} />
            <Text style={styles.errorTitle}>Scan Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </Animated.View>
        ) : step === 3 ? (
          <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.successContainer}>
            <CheckCircle2 color="#4ADE80" size={64} />
            <Text style={styles.successText}>Found!</Text>
          </Animated.View>
        ) : (
          <View style={styles.stepsContainer}>
            <ActivityIndicator size="large" color="#4ADE80" style={styles.loader} />
            
            {STEPS.map((stepText, index) => {
              const isActive = index === step;
              const isPast = index < step;
              
              return (
                <View key={index} style={styles.stepRow}>
                  <View style={[
                    styles.indicator, 
                    isPast && styles.indicatorPast,
                    isActive && styles.indicatorActive
                  ]}>
                    {isPast && <CheckCircle2 color="#0A0E15" size={12} />}
                  </View>
                  <Text style={[
                    styles.stepText,
                    isActive && styles.stepTextActive,
                    isPast && styles.stepTextPast
                  ]}>
                    {stepText}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 21, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 32,
    width: '80%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  loader: {
    marginBottom: 24,
  },
  stepsContainer: {
    alignItems: 'flex-start',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#374151',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorActive: {
    borderColor: '#4ADE80',
  },
  indicatorPast: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  stepText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  stepTextActive: {
    color: '#F3F4F6',
    fontWeight: '600',
  },
  stepTextPast: {
    color: '#4ADE80',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successText: {
    color: '#F3F4F6',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  errorTitle: {
    color: '#F3F4F6',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});
