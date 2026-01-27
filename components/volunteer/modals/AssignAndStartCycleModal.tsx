import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import { CustomButton } from '@/components/provider/atoms/CustomButton';

export interface AssignmentData {
  machineNumber: string;
  machineType: 'washer' | 'dryer';
  durationMinutes: number;
}

export interface AssignAndStartCycleModalProps {
  visible: boolean;
  userName: string;
  onClose: () => void;
  onSubmit: (data: AssignmentData) => void;
  isLoading?: boolean;
}

const DURATION_OPTIONS = [15, 23, 30, 45, 60];

export function AssignAndStartCycleModal({
  visible,
  userName,
  onClose,
  onSubmit,
  isLoading = false,
}: AssignAndStartCycleModalProps) {
  const [machineNumber, setMachineNumber] = useState('');
  const [machineType, setMachineType] = useState<'washer' | 'dryer'>('washer');
  const [durationMinutes, setDurationMinutes] = useState(23);
  const [customDuration, setCustomDuration] = useState('');

  const handleSubmit = () => {
    const duration = customDuration ? parseInt(customDuration, 10) : durationMinutes;
    if (!machineNumber.trim() || isNaN(duration) || duration <= 0) {
      return;
    }
    onSubmit({
      machineNumber: machineNumber.trim(),
      machineType,
      durationMinutes: duration,
    });
  };

  const handleDurationSelect = (minutes: number) => {
    setDurationMinutes(minutes);
    setCustomDuration('');
  };

  const handleCustomDurationChange = (text: string) => {
    setCustomDuration(text);
    if (text) {
      setDurationMinutes(0);
    }
  };

  const isValid =
    machineNumber.trim() !== '' &&
    (durationMinutes > 0 || (customDuration && parseInt(customDuration, 10) > 0));

  const resetForm = () => {
    setMachineNumber('');
    setMachineType('washer');
    setDurationMinutes(23);
    setCustomDuration('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Assign & Start Cycle</Text>
              <Text style={styles.subtitle}>for {userName}</Text>
            </View>

            {/* Machine Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Machine Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    machineType === 'washer' && styles.typeButtonActive,
                  ]}
                  onPress={() => setMachineType('washer')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeIcon}>🧺</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      machineType === 'washer' && styles.typeLabelActive,
                    ]}
                  >
                    Washer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    machineType === 'dryer' && styles.typeButtonActive,
                  ]}
                  onPress={() => setMachineType('dryer')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeIcon}>🌀</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      machineType === 'dryer' && styles.typeLabelActive,
                    ]}
                  >
                    Dryer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Machine Number */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Machine Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter machine number (e.g., 3)"
                placeholderTextColor={Colors.text.tertiary}
                value={machineNumber}
                onChangeText={setMachineNumber}
                keyboardType="number-pad"
              />
            </View>

            {/* Duration Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cycle Duration (minutes)</Text>
              <View style={styles.durationContainer}>
                {DURATION_OPTIONS.map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.durationButton,
                      durationMinutes === minutes &&
                        !customDuration &&
                        styles.durationButtonActive,
                    ]}
                    onPress={() => handleDurationSelect(minutes)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.durationLabel,
                        durationMinutes === minutes &&
                          !customDuration &&
                          styles.durationLabelActive,
                      ]}
                    >
                      {minutes}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Or enter custom duration"
                placeholderTextColor={Colors.text.tertiary}
                value={customDuration}
                onChangeText={handleCustomDurationChange}
                keyboardType="number-pad"
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <CustomButton
                label="Cancel"
                onPress={handleClose}
                variant="secondary"
                style={styles.actionButton}
              />
              <CustomButton
                label="Start Cycle"
                onPress={handleSubmit}
                variant="primary"
                disabled={!isValid}
                isLoading={isLoading}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    maxHeight: '90%',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: ComponentSize.cardRadius,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E3F2FD',
  },
  typeIcon: {
    fontSize: 24,
  },
  typeLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  typeLabelActive: {
    color: Colors.primary,
  },
  input: {
    height: ComponentSize.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.lg,
    ...Typography.body,
    color: Colors.text.primary,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  durationButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: ComponentSize.buttonRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  durationLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  durationLabelActive: {
    color: Colors.background,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
