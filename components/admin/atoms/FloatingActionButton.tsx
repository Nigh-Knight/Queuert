import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

export interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-center';
  containerStyle?: ViewStyle;
}

export function FloatingActionButton({
  onPress,
  icon,
  position = 'bottom-right',
  containerStyle,
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        position === 'bottom-right' ? styles.positionRight : styles.positionCenter,
        containerStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon || (
        <View style={styles.plusIcon}>
          <View style={styles.plusHorizontal} />
          <View style={styles.plusVertical} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#171A1F',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 4,
  },
  positionRight: {
    bottom: 24,
    right: 24,
  },
  positionCenter: {
    bottom: 24,
    alignSelf: 'center',
  },
  plusIcon: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  plusHorizontal: {
    position: 'absolute',
    top: 11,
    left: 4,
    width: 16,
    height: 2,
    backgroundColor: Colors.background,
    borderRadius: 1,
  },
  plusVertical: {
    position: 'absolute',
    top: 4,
    left: 11,
    width: 2,
    height: 16,
    backgroundColor: Colors.background,
    borderRadius: 1,
  },
});
