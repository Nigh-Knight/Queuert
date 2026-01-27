import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { StatusBadge } from './StatusBadge';

export interface QueueCardProps {
  position: number;
  userName: string;
  estimatedLoads: number;
  status: 'waiting' | 'washing' | 'drying' | 'done';
  onViewDetails: () => void;
  onStartWash?: () => void;
  onEndCycle?: () => void;
  onAssignAndStart?: () => void;
  onRemove: () => void;
  containerStyle?: ViewStyle;
}

export function QueueCard({
  position,
  userName,
  estimatedLoads,
  status,
  onViewDetails,
  onStartWash,
  onEndCycle,
  onAssignAndStart,
  onRemove,
  containerStyle,
}: QueueCardProps) {
  const renderActionButtons = () => {
    const buttons = [];

    // View Details button - always shown
    buttons.push(
      <CustomButton
        key="view-details"
        label="View Details"
        onPress={onViewDetails}
        variant="secondary"
        style={styles.button}
      />
    );

    // Status-specific buttons
    if (status === 'waiting' && onAssignAndStart) {
      buttons.push(
        <CustomButton
          key="assign-start"
          label="Assign & Start Cycle"
          onPress={onAssignAndStart}
          variant="primary"
          style={styles.button}
        />
      );
    }

    if (status === 'waiting' && onStartWash) {
      buttons.push(
        <CustomButton
          key="start-wash"
          label="Start Wash"
          onPress={onStartWash}
          variant="primary"
          style={styles.button}
        />
      );
    }

    if ((status === 'washing' || status === 'drying') && onEndCycle) {
      buttons.push(
        <CustomButton
          key="end-cycle"
          label="End Cycle"
          onPress={onEndCycle}
          variant="primary"
          style={styles.button}
        />
      );
    }

    // Remove button - always shown
    buttons.push(
      <CustomButton
        key="remove"
        label="Remove"
        onPress={onRemove}
        variant="alert"
        style={styles.button}
      />
    );

    return buttons;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{position}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.loads}>{estimatedLoads} estimated loads</Text>
        </View>
        <StatusBadge status={status} />
      </View>

      <View style={styles.actions}>
        {renderActionButtons()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  positionText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  loads: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
  },
  actions: {
    gap: Spacing.sm,
  },
  button: {
    marginBottom: Spacing.xs,
  },
});
