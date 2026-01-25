import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { InputField } from '@/components/provider/atoms/InputField';
import { MachineTypeCard } from '@/components/volunteer/atoms/MachineTypeCard';
import { MachineStatusChip } from '@/components/volunteer/atoms/MachineStatusChip';
import { CycleDurationControl } from '@/components/volunteer/atoms/CycleDurationControl';

export interface InUseMachine {
  id: string;
  machineNumber: string;
  machineType: 'washer' | 'dryer';
  userName: string;
  timeRemaining: string;
}

export interface AssignLaundryCycleScreenProps {
  userName: string;
  machineType: 'washer' | 'dryer';
  machineNumber: string;
  cycleDuration: number;
  inUseMachines: InUseMachine[];
  onMachineTypeChange: (type: 'washer' | 'dryer') => void;
  onMachineNumberChange: (number: string) => void;
  onCycleDurationIncrement: () => void;
  onCycleDurationDecrement: () => void;
  onStartCycle: () => void;
  onBack: () => void;
  isStarting?: boolean;
}

export function AssignLaundryCycleScreen({
  userName,
  machineType,
  machineNumber,
  cycleDuration,
  inUseMachines,
  onMachineTypeChange,
  onMachineNumberChange,
  onCycleDurationIncrement,
  onCycleDurationDecrement,
  onStartCycle,
  onBack,
  isStarting = false,
}: AssignLaundryCycleScreenProps) {
  // Simple icons for washer and dryer
  const WasherIcon = () => (
    <View style={styles.iconPlaceholder}>
      <Text style={styles.iconText}>🧺</Text>
    </View>
  );

  const DryerIcon = () => (
    <View style={styles.iconPlaceholder}>
      <Text style={styles.iconText}>🌀</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Assign Laundry Cycle"
        onBackPress={onBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.userName}>{userName}</Text>

        {/* Machine Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Machine Type</Text>
          <View style={styles.machineTypeRow}>
            <MachineTypeCard
              type="washer"
              label="Washer"
              icon={<WasherIcon />}
              isSelected={machineType === 'washer'}
              onPress={() => onMachineTypeChange('washer')}
              containerStyle={styles.machineCard}
            />
            <MachineTypeCard
              type="dryer"
              label="Dryer"
              icon={<DryerIcon />}
              isSelected={machineType === 'dryer'}
              onPress={() => onMachineTypeChange('dryer')}
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
        </View>

        {/* Currently In-Use Machines */}
        {inUseMachines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currently In-Use Machines</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.machineChipsContainer}
            >
              {inUseMachines.map((machine) => (
                <MachineStatusChip
                  key={machine.id}
                  machineNumber={machine.machineNumber}
                  machineType={machine.machineType}
                  userName={machine.userName}
                  timeRemaining={machine.timeRemaining}
                  containerStyle={styles.machineChip}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Cycle Duration Control */}
        <View style={styles.section}>
          <CycleDurationControl
            value={cycleDuration}
            onIncrement={onCycleDurationIncrement}
            onDecrement={onCycleDurationDecrement}
            label="Cycle Duration"
          />
        </View>

        {/* Start Cycle Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            label="Start Cycle"
            onPress={onStartCycle}
            variant="primary"
            isLoading={isStarting}
            disabled={!machineNumber || cycleDuration <= 0}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  userName: {
    fontSize: Typography.h1.fontSize,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  machineTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  machineCard: {
    flex: 1,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  machineChipsContainer: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  machineChip: {
    marginRight: Spacing.sm,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
  },
});
