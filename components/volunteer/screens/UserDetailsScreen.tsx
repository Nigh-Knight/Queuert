import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { InputField } from '@/components/provider/atoms/InputField';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { InfoRow } from '../atoms/InfoRow';
import { StatusBadge } from '../atoms/StatusBadge';
import { TimerDisplay } from '../atoms/TimerDisplay';

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  livingCondition: string;
  estimatedLoads: string;
  weight?: string;
}

export interface LaundryStatus {
  status: 'waiting' | 'washing' | 'drying' | 'done';
  timeRemaining?: string;
  machineNumber?: string;
  machineType?: 'washer' | 'dryer';
}

export interface LaundryUpdateData {
  actualLoads: string;
  machineNumber: string;
  serviceNotes: string;
}

export interface UserDetailsScreenProps {
  registrationData: UserRegistrationData;
  laundryStatus: LaundryStatus;
  updateData: LaundryUpdateData;
  onUpdateDataChange: (data: LaundryUpdateData) => void;
  onSaveChanges: () => void;
  isLoading?: boolean;
}

export function UserDetailsScreen({
  registrationData,
  laundryStatus,
  updateData,
  onUpdateDataChange,
  onSaveChanges,
  isLoading = false,
}: UserDetailsScreenProps) {
  const handleFieldChange = (field: keyof LaundryUpdateData, value: string) => {
    onUpdateDataChange({
      ...updateData,
      [field]: value,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Registration Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registration Data</Text>
        <View style={styles.card}>
          <InfoRow
            label="Name"
            value={`${registrationData.firstName} ${registrationData.lastName}`}
          />
          <InfoRow
            label="Phone Number"
            value={registrationData.phoneNumber}
          />
          <InfoRow
            label="Living Condition"
            value={registrationData.livingCondition}
          />
          <InfoRow
            label="Estimated Loads"
            value={registrationData.estimatedLoads}
          />
          {registrationData.weight && (
            <InfoRow
              label="Weight"
              value={`${registrationData.weight} lbs`}
              showDivider={false}
            />
          )}
          {!registrationData.weight && (
            <InfoRow
              label="Weight"
              value="Not provided"
              showDivider={false}
            />
          )}
        </View>
      </View>

      {/* Current Laundry Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Laundry Status</Text>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Status</Text>
            <StatusBadge status={laundryStatus.status} />
          </View>
          
          {laundryStatus.timeRemaining && (
            <>
              <View style={styles.divider} />
              <View style={styles.statusRow}>
                <Text style={styles.label}>Time Remaining</Text>
                <TimerDisplay timeRemaining={laundryStatus.timeRemaining} />
              </View>
            </>
          )}
          
          {laundryStatus.machineNumber && (
            <>
              <View style={styles.divider} />
              <View style={styles.statusRow}>
                <Text style={styles.label}>Machine</Text>
                <Text style={styles.value}>
                  {laundryStatus.machineType === 'washer' ? 'Washer' : 'Dryer'} #{laundryStatus.machineNumber}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Update Laundry Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Laundry Details</Text>
        
        <InputField
          label="Actual Loads"
          placeholder="Enter actual number of loads"
          value={updateData.actualLoads}
          onChangeText={(text) => handleFieldChange('actualLoads', text)}
          keyboardType="number-pad"
        />

        <InputField
          label="Machine Number"
          placeholder="Enter machine number"
          value={updateData.machineNumber}
          onChangeText={(text) => handleFieldChange('machineNumber', text)}
          keyboardType="number-pad"
        />

        <InputField
          label="Service Notes"
          placeholder="Add any notes about this service"
          value={updateData.serviceNotes}
          onChangeText={(text) => handleFieldChange('serviceNotes', text)}
          multiline
        />

        <CustomButton
          label="Save Changes"
          onPress={onSaveChanges}
          variant="primary"
          isLoading={isLoading}
          style={styles.saveButton}
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
  },
  value: {
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
    marginVertical: Spacing.sm,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
