import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import { CustomButton } from '@/components/provider/atoms/CustomButton';

export interface ReorderConfirmationModalProps {
  visible: boolean;
  userName: string;
  newPosition: number;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ReorderConfirmationModal({
  visible,
  userName,
  newPosition,
  onClose,
  onConfirm,
  isLoading = false,
}: ReorderConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔄</Text>
          </View>

          <Text style={styles.title}>Confirm Reorder</Text>
          <Text style={styles.message}>
            Move <Text style={styles.userName}>{userName}</Text> to position{' '}
            <Text style={styles.positionText}>{newPosition}</Text>?
          </Text>

          <View style={styles.actions}>
            <CustomButton
              label="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.actionButton}
              disabled={isLoading}
            />
            <CustomButton
              label="Move"
              onPress={onConfirm}
              variant="primary"
              isLoading={isLoading}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  userName: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  positionText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});
