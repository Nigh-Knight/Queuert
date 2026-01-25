import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  SafeAreaView,
} from 'react-native';
import { Colors, Typography, ComponentSize, Spacing } from '@/constants/theme';

export interface CountryCode {
  label: string;
  value: string;
  code: string;
}

export interface PhoneNumberInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
}

const COUNTRY_CODES: CountryCode[] = [
  { label: 'US (+1)', value: '+1', code: 'US' },
  { label: 'MX (+52)', value: '+52', code: 'MX' },
  { label: 'BR (+55)', value: '+55', code: 'BR' },
  { label: 'HT (+509)', value: '+509', code: 'HT' },
  { label: 'CA (+1)', value: '+1', code: 'CA' },
];

export function PhoneNumberInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  label,
  placeholder = 'Enter phone number',
  helperText,
  containerStyle,
}: PhoneNumberInputProps) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const selectedCountry = COUNTRY_CODES.find((c) => c.value === countryCode) || COUNTRY_CODES[0];

  const handleSelectCountry = (code: string) => {
    onCountryCodeChange(code);
    setIsDropdownVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputRow}>
        {/* Country Code Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setIsDropdownVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selectedCountry.label}</Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          style={styles.phoneInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.disabled}
          value={phoneNumber}
          onChangeText={onPhoneNumberChange}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </View>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {/* Country Code Modal */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <SafeAreaView style={styles.modal}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setIsDropdownVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setIsDropdownVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === countryCode && styles.optionSelected,
                  ]}
                  onPress={() => handleSelectCountry(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === countryCode && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dropdown: {
    width: 109,
    height: ComponentSize.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  dropdownText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
    flex: 1,
  },
  chevron: {
    color: Colors.text.primary,
    fontSize: 10,
    marginLeft: Spacing.xs,
  },
  phoneInput: {
    flex: 1,
    height: ComponentSize.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  helperText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: ComponentSize.cardRadius,
    borderTopRightRadius: ComponentSize.cardRadius,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.text.secondary,
    fontWeight: '300',
  },
  option: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  optionSelected: {
    backgroundColor: Colors.surfaceLight,
  },
  optionText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
