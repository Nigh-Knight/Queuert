import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

export interface StatusBadgeProps {
  status: 'waiting' | 'washing' | 'drying' | 'done';
  label?: string;
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
}

export function StatusBadge({
  status,
  label,
  size = 'medium',
  containerStyle,
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'waiting':
        return {
          backgroundColor: Colors.surfaceLight,
          textColor: Colors.text.primary,
          defaultLabel: 'Waiting',
        };
      case 'washing':
        return {
          backgroundColor: Colors.primary,
          textColor: '#FFFFFF',
          defaultLabel: 'Washing',
        };
      case 'drying':
        return {
          backgroundColor: Colors.success,
          textColor: '#FFFFFF',
          defaultLabel: 'Drying',
        };
      case 'done':
        return {
          backgroundColor: Colors.surfaceLight,
          textColor: Colors.text.primary,
          defaultLabel: 'Done',
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.containerSmall;
      case 'large':
        return styles.containerLarge;
      default:
        return styles.containerMedium;
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <View
      style={[
        styles.container,
        getSizeStyle(),
        { backgroundColor: config.backgroundColor },
        containerStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          getTextSizeStyle(),
          { color: config.textColor },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 13,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSmall: {
    paddingVertical: 1,
    paddingHorizontal: 9,
  },
  containerMedium: {
    paddingVertical: 2,
    paddingHorizontal: 11,
  },
  containerLarge: {
    paddingVertical: 3,
    paddingHorizontal: 12,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: Typography.caption.fontSize,
  },
  textLarge: {
    fontSize: 13,
  },
});
