import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import { CustomButton } from '@/components/provider/atoms/CustomButton';

export interface RemoveConfirmationModalProps {
  visible: boolean;
  userName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RemoveConfirmationModal({
  visible,
  userName,
  onClose,
  onConfirm,
  isLoading = false,
}: RemoveConfirmationModalProps) {
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
            <Text style={styles.icon}>⚠️</Text>
          </View>

          <Text style={styles.title}>Remove User?</Text>
          <Text style={styles.message}>
            Are you sure you want to remove{' '}
            <Text style={styles.userName}>{userName}</Text> from the queue?
          </Text>
          <Text style={styles.warning}>This action cannot be undone.</Text>

          <View style={styles.actions}>
            <CustomButton
              label="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.actionButton}
            />
            <CustomButton
              label="Remove"
              onPress={onConfirm}
              variant="alert"
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
    marginBottom: Spacing.sm,
  },
  userName: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  warning: {
    ...Typography.caption,
    color: Colors.alert,
    textAlign: 'center',
    marginBottom: Spacing.xl,
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
