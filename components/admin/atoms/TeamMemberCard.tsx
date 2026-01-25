import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';

export interface TeamMemberCardProps {
  name: string;
  role: 'Team Leader' | 'Volunteer';
  isLeader?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  containerStyle?: ViewStyle;
}

export function TeamMemberCard({
  name,
  role,
  isLeader = false,
  onEdit,
  onDelete,
  containerStyle,
}: TeamMemberCardProps) {
  return (
    <View
      style={[
        styles.container,
        isLeader ? styles.containerLeader : styles.containerVolunteer,
        containerStyle,
      ]}
    >
      <View style={styles.textContent}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onEdit}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <View style={styles.editIcon}>
            {/* Edit icon - square pen */}
            <View style={styles.editSquare} />
            <View style={styles.editPen} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <View style={styles.deleteIcon}>
            {/* Delete icon - trash can */}
            <View style={styles.trashLid} />
            <View style={styles.trashBody} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    borderRadius: ComponentSize.cardRadius,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  containerLeader: {
    backgroundColor: '#F0F8FF',
  },
  containerVolunteer: {
    backgroundColor: '#F8F9FA',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  role: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Edit Icon (Pen/Square)
  editIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  editSquare: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 2,
  },
  editPen: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: Colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  // Delete Icon (Trash)
  deleteIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  trashLid: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 2,
    backgroundColor: Colors.alert,
    borderRadius: 1,
  },
  trashBody: {
    position: 'absolute',
    top: 5,
    left: 4,
    right: 4,
    bottom: 0,
    borderWidth: 2,
    borderColor: Colors.alert,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
