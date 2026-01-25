import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { InputField } from '@/components/provider/atoms/InputField';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { MachineTypeCard } from '../atoms/MachineTypeCard';
import { MachineStatusChip } from '../atoms/MachineStatusChip';
import { CycleDurationControl } from '../atoms/CycleDurationControl';

export interface MachineInUse {
  machineNumber: string;
  machineType: 'washer' | 'dryer';
  userName: string;
  timeRemaining: string;
}

export interface AssignLaundryCycleScreenProps {
  selectedMachineType: 'washer' | 'dryer' | null;
  onSelectMachineType: (type: 'washer' | 'dryer') => void;
  machineNumber: string;
  onMachineNumberChange: (number: string) => void;
  cycleDuration: number;
  onCycleDurationChange: (duration: number) => void;
  machinesInUse: MachineInUse[];
  onStartCycle: () => void;
  isLoading?: boolean;
  userName?: string;
}

export function AssignLaundryCycleScreen({
  selectedMachineType,
  onSelectMachineType,
  machineNumber,
  onMachineNumberChange,
  cycleDuration,
  onCycleDurationChange,
  machinesInUse,
  onStartCycle,
  isLoading = false,
  userName,
}: AssignLaundryCycleScreenProps) {
  const isFormValid = 
    selectedMachineType !== null &&
    machineNumber.trim() !== '' &&
    cycleDuration > 0;

  const handleIncrement = () => {
    onCycleDurationChange(cycleDuration + 1);
  };

  const handleDecrement = () => {
    if (cycleDuration > 1) {
      onCycleDurationChange(cycleDuration - 1);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {userName && (
        <View style={styles.userSection}>
          <Text style={styles.userName}>Assigning cycle for: {userName}</Text>
        </View>
      )}

      {/* Machine Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Machine Type</Text>
        <View style={styles.machineTypeContainer}>
          <MachineTypeCard
            type="washer"
            label="Washer"
            icon={<Text style={styles.machineIcon}>🧺</Text>}
            isSelected={selectedMachineType === 'washer'}
            onPress={() => onSelectMachineType('washer')}
            containerStyle={styles.machineCard}
          />
          <MachineTypeCard
            type="dryer"
            label="Dryer"
            icon={<Text style={styles.machineIcon}>🌀</Text>}
            isSelected={selectedMachineType === 'dryer'}
            onPress={() => onSelectMachineType('dryer')}
            containerStyle={styles.machineCard}
          />
        </View>
      </View>

      {/* Machine Number Input */}
      <View style={styles.section}>
        <InputField
          label="Machine Number"
          placeholder="Enter machine number"
          value={machineNumber}
          onChangeText={onMachineNumberChange}
          keyboardType="number-pad"
        />
        <Text style={styles.helperText}>
          Enter the number of the machine assigned to this user
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Currently In-Use Machines */}
      {machinesInUse.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currently In-Use</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsContainer}
          >
            {machinesInUse.map((machine, index) => (
              <MachineStatusChip
                key={index}
                machineNumber={machine.machineNumber}
                machineType={machine.machineType}
                userName={machine.userName}
                timeRemaining={machine.timeRemaining}
                containerStyle={styles.chip}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.divider} />

      {/* Cycle Duration */}
      <View style={styles.section}>
        <CycleDurationControl
          label="Cycle Duration"
          value={cycleDuration}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      </View>

      {/* Start Cycle Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          label="Start Cycle"
          onPress={onStartCycle}
          variant="primary"
          disabled={!isFormValid}
          isLoading={isLoading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  userSection: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
  },
  userName: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  machineTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  machineCard: {
    flex: 1,
  },
  machineIcon: {
    fontSize: 32,
  },
  helperText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: Spacing.sm,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
