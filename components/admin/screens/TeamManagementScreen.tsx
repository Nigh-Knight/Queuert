import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { SearchBar } from '../atoms/SearchBar';
import { TeamMemberCard } from '../atoms/TeamMemberCard';
import { FloatingActionButton } from '../atoms/FloatingActionButton';

export interface TeamMember {
  id: string;
  name: string;
  role: 'Team Leader' | 'Volunteer';
  isLeader: boolean;
}

export interface TeamManagementScreenProps {
  teamMembers: TeamMember[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEditMember: (id: string) => void;
  onDeleteMember: (id: string) => void;
  onAddMember: () => void;
  onBack: () => void;
}

export function TeamManagementScreen({
  teamMembers,
  searchQuery,
  onSearchChange,
  onEditMember,
  onDeleteMember,
  onAddMember,
  onBack,
}: TeamManagementScreenProps) {
  // Filter team members based on search query
  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header
        title="Team Management"
        onBackPress={onBack}
      />

      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search team members..."
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              name={member.name}
              role={member.role}
              isLeader={member.isLeader}
              onEdit={() => onEditMember(member.id)}
              onDelete={() => onDeleteMember(member.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FloatingActionButton
        onPress={onAddMember}
        position="bottom-right"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
});
