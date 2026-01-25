import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface QRCodeDisplayProps {
  qrCodeUrl: string;
  size?: number;
  containerStyle?: ViewStyle;
}

export function QRCodeDisplay({
  qrCodeUrl,
  size = 200,
  containerStyle,
}: QRCodeDisplayProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.dashedBorder, { padding: 56 }]}>
        <View style={[styles.qrContainer, { width: size, height: size }]}>
          <Image
            source={{ uri: qrCodeUrl }}
            style={{ width: size, height: size }}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedBorder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
  },
  qrContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
