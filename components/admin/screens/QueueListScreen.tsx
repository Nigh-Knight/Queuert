import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { QueueCard } from '@/components/volunteer/atoms/QueueCard';
import { SearchBar } from '../atoms/SearchBar';
import { FloatingActionButton } from '../atoms/FloatingActionButton';

export interface QueueUser {
  id: string;
  userName: string;
  estimatedLoads: number;
  status: 'waiting' | 'washing' | 'drying' | 'done';
}

export interface QueueListScreenProps {
  queueUsers: QueueUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewDetails: (userId: string) => void;
  onStartWash?: (userId: string) => void;
  onAssignAndStart?: (userId: string) => void;
  onEndCycle?: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onAddUser: () => void;
  onBack?: () => void;
}

export function QueueListScreen({
  queueUsers,
  searchQuery,
  onSearchChange,
  onViewDetails,
  onStartWash,
  onAssignAndStart,
  onEndCycle,
  onRemoveUser,
  onAddUser,
  onBack,
}: QueueListScreenProps) {
  // Filter users based on search query
  const filteredUsers = queueUsers.filter((user) =>
    user.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header
        title="Queue Management"
        onBackPress={onBack}
      />

      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search users..."
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredUsers.map((user) => (
            <QueueCard
              key={user.id}
              userName={user.userName}
              estimatedLoads={user.estimatedLoads}
              status={user.status}
              onViewDetails={() => onViewDetails(user.id)}
              onStartWash={
                user.status === 'waiting' && onStartWash
                  ? () => onStartWash(user.id)
                  : undefined
              }
              onAssignAndStart={
                user.status === 'waiting' && onAssignAndStart
                  ? () => onAssignAndStart(user.id)
                  : undefined
              }
              onEndCycle={
                (user.status === 'washing' || user.status === 'drying') && onEndCycle
                  ? () => onEndCycle(user.id)
                  : undefined
              }
              onRemove={() => onRemoveUser(user.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FloatingActionButton
        onPress={onAddUser}
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
