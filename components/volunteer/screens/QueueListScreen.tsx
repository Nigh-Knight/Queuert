import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import { QueueCard } from '../atoms/QueueCard';

export interface QueueUser {
  id: string;
  userName: string;
  estimatedLoads: number;
  status: 'waiting' | 'washing' | 'drying' | 'done';
}

export interface QueueListScreenProps {
  queueUsers: QueueUser[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onFilterPress: () => void;
  onSortPress: () => void;
  onViewDetails: (userId: string) => void;
  onStartWash: (userId: string) => void;
  onEndCycle: (userId: string) => void;
  onAssignAndStart: (userId: string) => void;
  onRemove: (userId: string) => void;
  onAddUser: () => void;
}

export function QueueListScreen({
  queueUsers,
  searchQuery,
  onSearchQueryChange,
  onFilterPress,
  onSortPress,
  onViewDetails,
  onStartWash,
  onEndCycle,
  onAssignAndStart,
  onRemove,
  onAddUser,
}: QueueListScreenProps) {
  const renderQueueCard = ({ item }: { item: QueueUser }) => (
    <QueueCard
      userName={item.userName}
      estimatedLoads={item.estimatedLoads}
      status={item.status}
      onViewDetails={() => onViewDetails(item.id)}
      onStartWash={item.status === 'waiting' ? () => onStartWash(item.id) : undefined}
      onEndCycle={
        item.status === 'washing' || item.status === 'drying'
          ? () => onEndCycle(item.id)
          : undefined
      }
      onAssignAndStart={item.status === 'waiting' ? () => onAssignAndStart(item.id) : undefined}
      onRemove={() => onRemove(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No Users in Queue</Text>
      <Text style={styles.emptyStateText}>
        Add users to the queue to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.text.disabled}
            value={searchQuery}
            onChangeText={onSearchQueryChange}
          />
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <Text style={styles.iconButtonText}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSortPress}
          activeOpacity={0.7}
        >
          <Text style={styles.iconButtonText}>↕️</Text>
        </TouchableOpacity>
      </View>

      {/* Queue List */}
      <FlatList
        data={queueUsers}
        renderItem={renderQueueCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onAddUser}
        activeOpacity={0.9}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: ComponentSize.inputHeight,
    backgroundColor: Colors.surfaceLight,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
  },
  iconButtonText: {
    fontSize: 18,
  },
  listContent: {
    padding: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  floatingButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 36,
  },
});
