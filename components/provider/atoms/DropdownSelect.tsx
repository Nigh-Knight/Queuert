import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  SafeAreaView,
} from 'react-native';
import { Colors, Typography, ComponentSize, Spacing } from '@/constants/theme';

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface DropdownSelectProps {
  label?: string;
  options: DropdownOption[];
  selectedValue: string | number;
  onChange: (value: string | number) => void;
  containerStyle?: ViewStyle;
  placeholder?: string;
}

export function DropdownSelect({
  label,
  options,
  selectedValue,
  onChange,
  containerStyle,
  placeholder = 'Select an option',
}: DropdownSelectProps) {
  const [isVisible, setIsVisible] = useState(false);

  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label || placeholder;

  const handleSelect = (value: string | number) => {
    onChange(value);
    setIsVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>{selectedLabel}</Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <SafeAreaView style={styles.modal}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setIsVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === selectedValue && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedValue && styles.optionTextSelected,
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
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  trigger: {
    height: ComponentSize.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  triggerText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
    flex: 1,
  },
  chevron: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginLeft: Spacing.sm,
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
    paddingTop: 0,
    maxHeight: '80%',
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
