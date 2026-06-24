import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Flashlight, FlashlightOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../src/context/AppContext';

const SCAN_FRAME_SIZE = 280;
const CORNER_LENGTH = 40;
const CORNER_WIDTH = 4;
const OVERLAY_COLOR = 'rgba(10, 14, 21, 0.85)'; // Dark overlay #0A0E15
const ACCENT_COLOR = '#4ADE80';

interface ScannerOverlayProps {
  torchEnabled: boolean;
  onToggleTorch: () => void;
  isScanning: boolean;
}

export function ScannerOverlay({ torchEnabled, onToggleTorch, isScanning }: ScannerOverlayProps) {
  const { settings } = useApp();
  const lineY = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      lineY.value = withRepeat(
        withSequence(
          withTiming(SCAN_FRAME_SIZE, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        false
      );
    } else {
      lineY.value = 0;
    }
  }, [isScanning, lineY]);

  const animatedLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: lineY.value }],
    };
  });

  const handleTorchToggle = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleTorch();
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <View style={styles.overlayMask}>
        <View style={styles.maskTop} />
        <View style={styles.maskCenter}>
          <View style={styles.maskSide} />
          
          <View style={styles.scanFrame}>
            {/* Corner Brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Scanning Line Animation */}
            {isScanning && (
              <Animated.View style={[styles.scanLine, animatedLineStyle]} />
            )}
          </View>
          
          <View style={styles.maskSide} />
        </View>
        <View style={styles.maskBottom}>
          <Text style={styles.instructionText}>
            Position barcode within the frame
          </Text>
          
          <Pressable
            onPress={handleTorchToggle}
            style={[styles.torchButton, torchEnabled && styles.torchButtonActive]}
          >
            {torchEnabled ? (
              <Flashlight color="#0A0E15" size={24} />
            ) : (
              <FlashlightOff color="#FFFFFF" size={24} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayMask: {
    flex: 1,
  },
  maskTop: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  maskCenter: {
    flexDirection: 'row',
    height: SCAN_FRAME_SIZE,
  },
  maskSide: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  maskBottom: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
    alignItems: 'center',
    paddingTop: 40,
  },
  corner: {
    position: 'absolute',
    borderColor: ACCENT_COLOR,
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: ACCENT_COLOR,
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  instructionText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
  },
  torchButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  torchButtonActive: {
    backgroundColor: ACCENT_COLOR,
    borderColor: ACCENT_COLOR,
  },
});
