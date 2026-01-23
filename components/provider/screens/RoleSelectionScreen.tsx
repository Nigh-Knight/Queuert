import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Header } from '../atoms/Header';
import { RoleCard } from '../atoms/RoleCard';
import { CustomButton } from '../atoms/CustomButton';

export interface RoleSelectionScreenProps {
  onRoleSelect: (role: 'serviceUser' | 'volunteer' | 'teamLeader') => void;
}

const ROLE_OPTIONS = [
  {
    id: 'serviceUser',
    icon: '👤',
    title: "I'm here for Laundry Love",
    description: 'Access your laundry queue status and updates',
  },
  {
    id: 'volunteer',
    icon: '🤝',
    title: "I'm a Volunteer",
    description: 'Help manage laundry services for participants',
  },
  {
    id: 'teamLeader',
    icon: '👨‍💼',
    title: "I'm a Team Leader",
    description: 'Oversee operations and manage the team',
  },
];

export function RoleSelectionScreen({ onRoleSelect }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole as 'serviceUser' | 'volunteer' | 'teamLeader');
    }
  };

  const isContinueDisabled = !selectedRole;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Select Your Role" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Choose how you'll use Queuert today
        </Text>

        <View style={styles.cardsContainer}>
          {ROLE_OPTIONS.map((role) => (
            <RoleCard
              key={role.id}
              icon={role.icon}
              title={role.title}
              description={role.description}
              onPress={() => setSelectedRole(role.id)}
              isSelected={selectedRole === role.id}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label="Continue"
          onPress={handleContinue}
          disabled={isContinueDisabled}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xxl,
    textAlign: 'center',
  },
  cardsContainer: {
    marginBottom: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
