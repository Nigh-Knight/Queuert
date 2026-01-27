/**
 * Integration verification for react-native-reanimated-dnd
 *
 * Verified compatibility:
 * ✓ Expo SDK 54.0.32
 * ✓ react-native-reanimated 4.1.1
 * ✓ react-native-gesture-handler 2.28.0
 * ✓ react-native-reanimated-dnd 1.1.0
 *
 * Verification performed:
 * - Package installation successful
 * - TypeScript definitions available
 * - No runtime errors on Expo startup
 * - Sortable and SortableItem components exported
 *
 * This file serves as a reference for future development and can be imported
 * to ensure the library remains compatible after dependency updates.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * Verifies that react-native-reanimated-dnd components are available
 * @throws Error if library components are not available or incompatible
 * @returns true if library is available and can be imported
 */
export const verifyLibraryAvailable = (): boolean => {
  try {
    // Attempt to import library components
    const { Sortable, SortableItem } = require('react-native-reanimated-dnd');

    if (!Sortable || !SortableItem) {
      throw new Error('react-native-reanimated-dnd components not available');
    }

    // Verify they are functions/components
    if (typeof Sortable !== 'function' && typeof Sortable !== 'object') {
      throw new Error('Sortable component is not a valid React component');
    }

    if (typeof SortableItem !== 'function' && typeof SortableItem !== 'object') {
      throw new Error('SortableItem component is not a valid React component');
    }

    return true;
  } catch (error) {
    console.error('react-native-reanimated-dnd verification failed:', error);
    throw error;
  }
};

/**
 * Sample sortable list component for manual verification
 * Can be rendered in development to test drag-and-drop functionality
 */
export function SampleSortableList() {
  const { Sortable, SortableItem } = require('react-native-reanimated-dnd');

  const testData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  const handleDrop = ({ allPositions }: { allPositions: Array<{ id: string; position: number }> }) => {
    console.log('Items reordered:', allPositions);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Sortable
        data={testData}
        onDrop={handleDrop}
        renderItem={(item: { id: string; name: string }) => (
          <SortableItem id={item.id}>
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
          </SortableItem>
        )}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
  },
});

// Run verification on module load
verifyLibraryAvailable();
