# Phase 3: Queue Operations & Management - Research

**Researched:** 2026-01-27
**Domain:** Real-time queue synchronization, drag-and-drop interfaces, optimistic updates
**Confidence:** HIGH

## Summary

Queue management in multi-user real-time environments requires careful coordination between client-side interactions and server-side state. The standard approach uses Convex's reactive `useQuery` for automatic synchronization, optimistic updates for instant UI feedback, and drag-and-drop libraries built on Reanimated 3 for 60fps touch-native interactions.

The critical insight is that **Convex handles real-time sync automatically** - when one volunteer makes changes, all other devices receive updates via WebSocket subscriptions without polling. Combined with optimistic updates, this creates a "magical" feeling where changes appear instantly locally while eventual consistency ensures all devices converge to the same state.

The existing codebase already has `react-native-reanimated` and `react-native-gesture-handler` installed (required peer dependencies for drag-and-drop), and the queue schema includes position tracking, making this phase primarily about wiring existing infrastructure.

**Primary recommendation:** Use `react-native-reanimated-dnd` for sortable queue lists with Convex optimistic updates for position changes, FlatList optimization props for smooth scrolling with real-time updates, and client-side filtering for instant search results.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Convex React | 1.31.6+ | Real-time queries & mutations | Official React integration, automatic WebSocket subscriptions, built-in optimistic updates support |
| react-native-reanimated-dnd | Latest | Drag-and-drop sortable lists | 60fps animations, 70kb bundle, Fabric support, Expo-compatible, built specifically for RN |
| React Native FlatList | Built-in | Optimized list rendering | Native component with windowing, memoization, item layout optimization |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-reanimated | 4.1.1 (installed) | Animation runtime | Already installed, peer dependency for dnd |
| react-native-gesture-handler | 2.28.0 (installed) | Touch gesture handling | Already installed, peer dependency for dnd |
| React.memo / useCallback | Built-in | Prevent unnecessary re-renders | Required for FlatList performance with real-time updates |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-reanimated-dnd | react-native-draggable-flatlist | Older library, stability issues with reanimated, harder to maintain |
| Optimistic updates | Disabled mutations | Simpler code but laggy UX - unacceptable for 10-15 volunteers editing same queue |
| Client-side filtering | Convex filtered queries | Server filtering reduces bandwidth but adds latency for instant search |

**Installation:**
```bash
npm install react-native-reanimated-dnd
```

Peer dependencies (react-native-reanimated, react-native-gesture-handler) already installed.

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (volunteer)/
│   ├── queue.tsx           # Main queue list screen
│   └── add-user.tsx        # Manual user intake form

components/
├── volunteer/
│   ├── QueueCard.tsx       # Individual queue entry (extends StatusCard)
│   ├── QueueList.tsx       # Sortable FlatList wrapper
│   └── SearchBar.tsx       # Debounced search input
└── provider/atoms/
    └── StatusCard.tsx      # Base card component (already exists)

convex/
└── queue.ts
    ├── getActiveQueue      # Existing - returns full queue with user/intake data
    ├── addUserToQueue      # NEW - manual entry with intake form
    ├── removeFromQueue     # Existing - marks as removed
    └── reorderQueue        # NEW - batch position updates
```

### Pattern 1: Real-time Queue Subscription

**What:** Use `useQuery` hook to subscribe to queue changes, automatically re-rendering when any volunteer modifies the queue.

**When to use:** All queue display screens for volunteers and service users.

**Example:**
```typescript
// Source: https://docs.convex.dev/client/react
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function QueueScreen() {
  const sessionId = useSessionId(); // from SessionStorage

  // Automatically subscribes - updates when queue changes
  const queue = useQuery(api.queue.getActiveQueue,
    sessionId ? { sessionId } : "skip"
  );

  if (queue === undefined) {
    return <LoadingSkeleton />;
  }

  return <QueueList data={queue} />;
}
```

**Key characteristics:**
- Returns `undefined` while loading (first render)
- Automatically re-renders on any database change affecting this query
- Subscription canceled on unmount
- Use "skip" argument to prevent queries when data unavailable

### Pattern 2: Optimistic Updates for Queue Reordering

**What:** Temporarily update local queue order immediately when user drags, then rollback if mutation fails.

**When to use:** Drag-and-drop reordering, remove actions, status changes.

**Example:**
```typescript
// Source: https://docs.convex.dev/client/react/optimistic-updates
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const reorder = useMutation(api.queue.reorderQueue)
  .withOptimisticUpdate((localStore, args) => {
    // Read current queue
    const currentQueue = localStore.getQuery(api.queue.getActiveQueue, {
      sessionId: args.sessionId,
    });

    if (currentQueue === undefined) return;

    // Create new array with updated positions (MUST be immutable)
    const optimisticQueue = currentQueue.map(item =>
      item._id === args.queueId
        ? { ...item, position: args.newPosition }
        : item
    ).sort((a, b) => a.position - b.position);

    // Update local cache
    localStore.setQuery(api.queue.getActiveQueue,
      { sessionId: args.sessionId },
      optimisticQueue
    );
  });

// Usage
const handleReorder = (queueId, newPosition) => {
  reorder({ sessionId, queueId, newPosition });
};
```

**Critical rules:**
- NEVER mutate objects (`item.position = X`) - always create new objects
- Check for `undefined` before updating (query may not be loaded)
- Rollback happens automatically when mutation completes
- Don't use for external side effects (emails, analytics)

### Pattern 3: FlatList Optimization for Real-time Updates

**What:** Configure FlatList props to minimize re-renders and maintain 60fps with frequently changing data.

**When to use:** Any list displaying real-time Convex data (queue, volunteers, sessions).

**Example:**
```typescript
// Source: https://reactnative.dev/docs/optimizing-flatlist-configuration
import { FlatList, StyleSheet } from "react-native";
import { memo, useCallback } from "react";

// Memoize list item to prevent unnecessary re-renders
const QueueCard = memo(({ item, onRemove, onReorder }) => (
  <View>
    <Text>{item.user.firstName} - Position {item.position}</Text>
    <Button onPress={() => onRemove(item._id)}>Remove</Button>
  </View>
), (prev, next) =>
  prev.item._id === next.item._id &&
  prev.item.position === next.item.position &&
  prev.item.status === next.item.status
);

export function QueueList({ data }) {
  // Extract to useCallback to prevent recreation
  const renderItem = useCallback(({ item }) => (
    <QueueCard item={item} onRemove={handleRemove} />
  ), [handleRemove]);

  const keyExtractor = useCallback((item) => item._id, []);

  // Fixed height enables layout optimization
  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      maxToRenderPerBatch={10}
      windowSize={11}
      removeClippedSubviews={true}
      initialNumToRender={10}
    />
  );
}
```

**Configuration guide:**
- `getItemLayout`: Required for fixed-height items - massive performance boost
- `keyExtractor`: Use stable IDs (not index) for accurate reconciliation
- `maxToRenderPerBatch`: 10 default - reduce for large items
- `windowSize`: 11 default (5 screens up/down) - reduce to save memory
- `removeClippedSubviews`: Unmount off-screen views (Android default: true)
- `initialNumToRender`: Match screen height to prevent double render

### Pattern 4: Drag-and-Drop with Sortable Lists

**What:** Use react-native-reanimated-dnd for touch-native reordering with 60fps animations.

**When to use:** Queue reordering, volunteer priority management.

**Example:**
```typescript
// Source: https://github.com/entropyconquers/react-native-reanimated-dnd
import { Sortable, SortableItem } from "react-native-reanimated-dnd";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export function QueueList({ data }) {
  // CRITICAL: Items must have 'id' property (string)
  const itemsWithIds = data.map(item => ({
    ...item,
    id: item._id, // Convert Convex _id to id field
  }));

  const handleDrop = ({ allPositions }) => {
    // allPositions: { id: string, position: number }[]
    // Don't update local state - let Sortable handle it
    // Only persist to server
    reorderMutation({ sessionId, positions: allPositions });
  };

  return (
    <GestureHandlerRootView>
      <Sortable
        data={itemsWithIds}
        onDrop={handleDrop}
        renderItem={(item) => (
          <SortableItem id={item.id}>
            <QueueCard item={item} />
          </SortableItem>
        )}
      />
    </GestureHandlerRootView>
  );
}
```

**Critical requirements:**
- All items MUST have `id: string` property (library validates at runtime)
- Wrap app/screen with `GestureHandlerRootView`
- DON'T call setState in `onMove` - causes conflicts with internal state
- Use `onDrop` for server persistence only
- Library handles reordering animations automatically

### Pattern 5: Debounced Search Filtering

**What:** Delay search execution until user stops typing to reduce re-renders and maintain performance.

**When to use:** Search inputs, autocomplete, live filtering.

**Example:**
```typescript
// Source: https://medium.com/nerd-for-tech/debounce-your-search-react-input-optimization-fd270a8042b
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup on unmount or value change
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function QueueScreen() {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);
  const queue = useQuery(api.queue.getActiveQueue, { sessionId });

  // Filter happens client-side for instant results
  const filteredQueue = useMemo(() => {
    if (!queue || !debouncedSearch) return queue;

    const lower = debouncedSearch.toLowerCase();
    return queue.filter(item =>
      item.user.firstName.toLowerCase().includes(lower) ||
      item.user.lastName.toLowerCase().includes(lower)
    );
  }, [queue, debouncedSearch]);

  return (
    <>
      <SearchBar value={searchText} onChangeText={setSearchText} />
      <QueueList data={filteredQueue} />
    </>
  );
}
```

**Debounce timing:**
- 200-300ms: Standard for search inputs
- 500ms: Heavy operations (API calls, complex filtering)
- Skip debouncing for: dropdown changes, pagination, immediate filters

### Anti-Patterns to Avoid

**1. Mutating objects in optimistic updates**
```typescript
// ❌ WRONG - corrupts internal state
.withOptimisticUpdate((localStore, args) => {
  const queue = localStore.getQuery(...);
  queue[0].position = 5; // MUTATION - breaks cache
})

// ✅ CORRECT - create new objects
.withOptimisticUpdate((localStore, args) => {
  const queue = localStore.getQuery(...);
  const newQueue = queue.map(item => ({ ...item, position: newPosition }));
  localStore.setQuery(..., newQueue);
})
```

**2. Calling setState during drag operations**
```typescript
// ❌ WRONG - conflicts with library's internal state
<Sortable
  onMove={(positions) => {
    setQueueData(reorder(queueData, positions)); // Re-render conflict
  }}
/>

// ✅ CORRECT - use onDrop for persistence only
<Sortable
  onDrop={({ allPositions }) => {
    saveMutation({ positions: allPositions });
  }}
/>
```

**3. Missing getItemLayout for fixed-height lists**
```typescript
// ❌ WRONG - async layout calculations on every render
<FlatList data={queue} renderItem={renderItem} />

// ✅ CORRECT - provide layout for fixed heights
<FlatList
  data={queue}
  renderItem={renderItem}
  getItemLayout={(data, index) => ({
    length: 100,
    offset: 100 * index,
    index,
  })}
/>
```

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop sorting | Custom PanResponder with animations | react-native-reanimated-dnd | 60fps animations require UI thread, gesture conflicts with scroll, collision detection is complex |
| Real-time sync | Polling with setInterval | Convex useQuery subscriptions | WebSocket subscriptions are efficient, handles reconnection, consistency guarantees across queries |
| Optimistic updates | Manual local state management | Convex .withOptimisticUpdate | Automatic rollback on failure, handles concurrent updates, prevents cache corruption |
| Search debouncing | Custom setTimeout logic | useDebounce hook | Cleanup on unmount, handles rapid changes, reusable across inputs |
| Queue position recalculation | Manual array reindexing | Convex transaction mutations | Race conditions with concurrent edits, server is source of truth for positions |

**Key insight:** Multi-user real-time queue management has edge cases that take months to discover (concurrent position updates, optimistic update rollbacks during network issues, gesture conflicts with FlatList scroll). Use battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Race Conditions in Position Updates

**What goes wrong:** Two volunteers drag different users simultaneously. Without proper transaction handling, positions can conflict or duplicate.

**Why it happens:** Position updates aren't atomic - volunteer A reads positions 1-5, volunteer B reads same positions, both try to insert at position 3.

**How to avoid:**
- Use Convex mutations for position updates (automatic transaction guarantees)
- Batch position updates in single mutation (all-or-nothing)
- Let server recalculate positions based on order, not client-provided numbers

**Warning signs:**
- Duplicate position numbers in queue
- Gaps in position sequence (1, 2, 4, 5)
- Users jumping positions unexpectedly

**Code pattern:**
```typescript
// ❌ WRONG - race condition
export const reorderQueue = mutation({
  handler: async (ctx, { queueId, newPosition }) => {
    // Read current positions
    const queue = await ctx.db.query("queue").collect();
    // Calculate new positions
    const updated = recalculate(queue, queueId, newPosition);
    // Update one by one - race with concurrent mutation
    for (const item of updated) {
      await ctx.db.patch(item._id, { position: item.position });
    }
  }
});

// ✅ CORRECT - single transaction
export const reorderQueue = mutation({
  handler: async (ctx, { sessionId, orderedIds }) => {
    // Client sends desired order, server assigns positions
    for (let i = 0; i < orderedIds.length; i++) {
      await ctx.db.patch(orderedIds[i], { position: i + 1 });
    }
    // All patches queued, executed atomically at function end
  }
});
```

### Pitfall 2: FlatList Re-rendering on Every Keystroke

**What goes wrong:** Typing in search box causes entire queue list to re-render on every character, causing lag and dropped frames.

**Why it happens:** Parent component state change (searchText) triggers re-render, FlatList receives new renderItem function instance, all items re-render.

**How to avoid:**
- Wrap renderItem in useCallback with stable dependencies
- Memoize list items with React.memo and custom comparison
- Debounce search text to reduce render frequency
- Use getItemLayout to prevent layout recalculation

**Warning signs:**
- Typing feels laggy (>100ms delay)
- Scroll stutters when search is active
- FPS drops below 60 in profiler

**Code pattern:**
```typescript
// ❌ WRONG - new function every render
function QueueScreen() {
  const [search, setSearch] = useState("");
  const queue = useQuery(...);

  return (
    <FlatList
      data={queue}
      renderItem={({ item }) => <QueueCard item={item} />} // New function instance
    />
  );
}

// ✅ CORRECT - memoized rendering
function QueueScreen() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const queue = useQuery(...);

  const renderItem = useCallback(({ item }) => (
    <QueueCard item={item} />
  ), []); // Stable reference

  const filteredQueue = useMemo(() =>
    filterQueue(queue, debouncedSearch),
    [queue, debouncedSearch]
  );

  return (
    <FlatList
      data={filteredQueue}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
    />
  );
}
```

### Pitfall 3: Drag-and-Drop State Conflicts

**What goes wrong:** External state updates during drag cause animation glitches, position jumps, or incorrect drop targets.

**Why it happens:** Sortable library maintains internal gesture state. External setState calls trigger re-renders that interrupt gesture tracking.

**How to avoid:**
- Never call setState in onMove callback
- Use onDrop for server persistence only
- Let library handle internal reordering
- Apply optimistic updates via Convex (separate from gesture state)

**Warning signs:**
- Items snap to wrong position during drag
- Drag handle becomes unresponsive
- Animations stutter or freeze mid-drag
- Console warnings about "id" property missing

**Code pattern:**
```typescript
// ❌ WRONG - setState during drag
<Sortable
  data={queue}
  onMove={(positions) => {
    setQueue(reorderByPositions(queue, positions)); // Conflicts with gesture
  }}
/>

// ✅ CORRECT - persist on drop only
<Sortable
  data={queue}
  onDrop={({ allPositions }) => {
    // Persist to server - optimistic update handles UI
    reorderMutation({
      sessionId,
      orderedIds: allPositions.map(p => p.id)
    });
  }}
/>
```

### Pitfall 4: Missing Confirmation Dialogs on Destructive Actions

**What goes wrong:** Volunteer accidentally removes user from queue during busy event, no undo mechanism, user must re-register.

**Why it happens:** Touch interfaces are sensitive, especially with small buttons on cards. No confirmation step before mutation.

**How to avoid:**
- Show confirmation dialog for remove/delete actions
- Use distinct visual styling for destructive actions (red color)
- Add haptic feedback on touch (expo-haptics already installed)
- Log all destructive actions with volunteer ID for auditing

**Warning signs:**
- User complaints about accidental removal
- High remove/re-add rate in logs
- Volunteers requesting undo feature

**Code pattern:**
```typescript
// ❌ WRONG - immediate removal
const handleRemove = (queueId: string) => {
  removeFromQueueMutation({ queueId });
};

// ✅ CORRECT - confirmation dialog
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

const handleRemove = (queueId: string, userName: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

  Alert.alert(
    "Remove from Queue",
    `Remove ${userName} from the queue?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeFromQueueMutation({ queueId });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    ]
  );
};
```

### Pitfall 5: Silent Real-time Update Conflicts

**What goes wrong:** Volunteer A starts editing queue, volunteer B makes changes elsewhere, A's view updates silently mid-edit, causing confusion.

**Why it happens:** Convex useQuery automatically updates on any data change. During busy events with 10+ volunteers, queue changes are constant.

**How to avoid:**
- Accept silent updates as feature (creates "magic" feeling)
- Use optimistic updates for user's own actions (immediate feedback)
- Don't show toast notifications for every change (too noisy)
- Consider marking currently-dragging item as locked (advanced)

**Warning signs:**
- Volunteers complaining about "jumping" positions
- Confusion during reordering
- Multiple volunteers editing same user simultaneously

**Mitigation strategy:**
```typescript
// Basic approach: Silent updates (recommended for MVP)
const queue = useQuery(api.queue.getActiveQueue, { sessionId });
// Just render - users adapt to real-time updates

// Advanced approach: Lock during drag (future enhancement)
const [isDragging, setIsDragging] = useState(false);

<Sortable
  data={queue}
  onDragStart={() => setIsDragging(true)}
  onDrop={({ allPositions }) => {
    setIsDragging(false);
    reorderMutation({ orderedIds: allPositions.map(p => p.id) });
  }}
/>
```

## Code Examples

Verified patterns from official sources:

### Example 1: Complete Queue Screen with Real-time Updates

```typescript
// Source: Convex React Docs + react-native-reanimated-dnd docs
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sortable, SortableItem } from "react-native-reanimated-dnd";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { useCallback, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export function VolunteerQueueScreen() {
  const sessionId = useSessionStorage("sessionId");

  // Real-time subscription - auto-updates on changes
  const queue = useQuery(
    api.queue.getActiveQueue,
    sessionId ? { sessionId } : "skip"
  );

  const reorder = useMutation(api.queue.reorderQueue);
  const remove = useMutation(api.queue.removeFromQueue);

  // Convert Convex _id to id for library compatibility
  const queueWithIds = useMemo(() =>
    queue?.map(item => ({ ...item, id: item._id })) ?? [],
    [queue]
  );

  const handleReorder = useCallback(({ allPositions }) => {
    reorder({
      sessionId,
      orderedIds: allPositions.map(p => p.id),
    });
  }, [sessionId, reorder]);

  if (queue === undefined) {
    return <LoadingSkeleton />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Sortable
        data={queueWithIds}
        onDrop={handleReorder}
        renderItem={(item) => (
          <SortableItem id={item.id}>
            <QueueCard
              item={item}
              onRemove={() => remove({ queueId: item._id })}
            />
          </SortableItem>
        )}
      />
    </GestureHandlerRootView>
  );
}
```

### Example 2: Optimistic Queue Position Update

```typescript
// Source: https://docs.convex.dev/client/react/optimistic-updates
const reorder = useMutation(api.queue.reorderQueue)
  .withOptimisticUpdate((localStore, args) => {
    const currentQueue = localStore.getQuery(
      api.queue.getActiveQueue,
      { sessionId: args.sessionId }
    );

    if (!currentQueue) return;

    // Create position map from ordered IDs
    const positionMap = new Map(
      args.orderedIds.map((id, index) => [id, index + 1])
    );

    // Create new array with updated positions (immutable)
    const optimisticQueue = currentQueue.map(item => ({
      ...item,
      position: positionMap.get(item._id) ?? item.position,
    }));

    // Sort by new positions
    optimisticQueue.sort((a, b) => a.position - b.position);

    // Update local cache
    localStore.setQuery(
      api.queue.getActiveQueue,
      { sessionId: args.sessionId },
      optimisticQueue
    );
  });
```

### Example 3: Optimized Queue Card with Memoization

```typescript
// Source: https://reactnative.dev/docs/optimizing-flatlist-configuration
import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

interface QueueCardProps {
  item: QueueEntry;
  onRemove: () => void;
  onStartTimer: () => void;
}

export const QueueCard = memo(({ item, onRemove, onStartTimer }: QueueCardProps) => {
  const statusColor = getStatusColor(item.status);
  const timeRemaining = calculateTimeRemaining(item);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.position}>#{item.position}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.name}>
        {item.user.firstName} {item.user.lastName}
      </Text>

      {timeRemaining && (
        <Text style={styles.timer}>{timeRemaining}</Text>
      )}

      <View style={styles.actions}>
        {item.status === "waiting" && (
          <Button onPress={onStartTimer}>Start Timer</Button>
        )}
        <Button variant="destructive" onPress={onRemove}>Remove</Button>
      </View>
    </View>
  );
}, (prev, next) =>
  // Only re-render if these properties change
  prev.item._id === next.item._id &&
  prev.item.position === next.item.position &&
  prev.item.status === next.item.status &&
  prev.item.timerStartedAt === next.item.timerStartedAt
);
```

### Example 4: Debounced Search with Client-side Filtering

```typescript
// Source: https://medium.com/nerd-for-tech/debounce-your-search-react-input-optimization-fd270a8042b
import { useState, useEffect, useMemo } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function QueueSearchScreen() {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);
  const sessionId = useSessionStorage("sessionId");

  const queue = useQuery(
    api.queue.getActiveQueue,
    sessionId ? { sessionId } : "skip"
  );

  const filteredQueue = useMemo(() => {
    if (!queue || !debouncedSearch) return queue;

    const searchLower = debouncedSearch.toLowerCase();
    return queue.filter(item => {
      const fullName = `${item.user.firstName} ${item.user.lastName}`.toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [queue, debouncedSearch]);

  return (
    <View>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by name..."
      />
      <QueueList data={filteredQueue ?? []} />
    </View>
  );
}
```

### Example 5: Batch Position Update Mutation

```typescript
// Source: https://stack.convex.dev/high-throughput-mutations-via-precise-queries
// convex/queue.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const reorderQueue = mutation({
  args: {
    sessionId: v.id("sessions"),
    orderedIds: v.array(v.id("queue")),
  },
  handler: async (ctx, args) => {
    // Validate all IDs belong to this session
    const queueItems = await Promise.all(
      args.orderedIds.map(id => ctx.db.get(id))
    );

    const invalidItems = queueItems.filter(
      item => !item || item.sessionId !== args.sessionId
    );

    if (invalidItems.length > 0) {
      throw new Error("Invalid queue items for session");
    }

    // Update positions in single transaction
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], {
        position: i + 1,
      });
    }

    // All patches execute atomically at function end
  },
});

// Auto-reposition after removal
export const removeFromQueue = mutation({
  args: { queueId: v.id("queue") },
  handler: async (ctx, args) => {
    const queueItem = await ctx.db.get(args.queueId);
    if (!queueItem) throw new Error("Queue item not found");

    // Mark as removed
    await ctx.db.patch(args.queueId, { status: "removed" });

    // Get remaining queue items with higher positions
    const remainingItems = await ctx.db
      .query("queue")
      .withIndex("by_session_status", q =>
        q.eq("sessionId", queueItem.sessionId)
      )
      .filter(q => q.neq(q.field("status"), "removed"))
      .filter(q => q.gt(q.field("position"), queueItem.position))
      .collect();

    // Decrement positions to close gap
    for (const item of remainingItems) {
      await ctx.db.patch(item._id, {
        position: item.position - 1,
      });
    }
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling with setInterval | WebSocket subscriptions (Convex useQuery) | 2020+ | Reduced latency from seconds to milliseconds, lower server load |
| Offset-based pagination | Cursor-based pagination | 2021+ | Consistent results during concurrent inserts, no duplicate/missing items |
| Manual optimistic updates | Built-in .withOptimisticUpdate | Convex 1.0 (2023) | Automatic rollback, cache consistency, simpler code |
| react-native-draggable-flatlist | react-native-reanimated-dnd | 2024+ | 60fps on UI thread, better stability, Fabric support |
| Expo SDK 50 camera APIs | CameraView in SDK 51+ | Expo SDK 51 (2024) | Unified API, better performance, simpler barcode scanning |

**Deprecated/outdated:**
- **PanResponder for drag-and-drop**: Low-level API requires managing all gesture states manually, doesn't run on UI thread (30fps max)
- **Component state for real-time data**: Doesn't sync across devices, requires manual polling, race conditions on updates
- **Inline function renderItem**: Causes full list re-render on parent state change, FPS drops on large lists
- **expo-barcode-scanner**: Deprecated in Expo SDK 54, use CameraView with barcode scanning instead

## Open Questions

Things that couldn't be fully resolved:

1. **Queue position calculation strategy**
   - What we know: Existing schema has `position` field (number), indexed by `["sessionId", "position"]`
   - What's unclear: Should positions be 1-indexed or 0-indexed? Does removing item at position 3 immediately update positions 4+ or defer to next query?
   - Recommendation: Use 1-indexed positions (more intuitive for volunteers), auto-reposition on removal (simpler logic, no gaps)

2. **Concurrent drag conflicts**
   - What we know: Optimistic updates rollback on mutation failure, Convex uses OCC for conflict detection
   - What's unclear: What happens if volunteer A drags user X to position 3 while volunteer B drags user Y to position 3?
   - Recommendation: Accept last-write-wins behavior (Convex default), add timestamp to queue mutations for conflict auditing

3. **Search scope during active filters**
   - What we know: Client-side filtering is instant, decision doc says "search by name only"
   - What's unclear: Should search include all statuses (waiting + washing + ready) or only active users?
   - Recommendation: Search across all visible statuses, let users find any user in queue regardless of status

4. **Manual entry form reuse**
   - What we know: Existing RegistrationFormScreen has full intake form, decision doc says "show FULL intake form"
   - What's unclear: Reuse existing component or create volunteer-specific variant?
   - Recommendation: Create new ManualAddUserForm that reuses InputField/DropdownSelect atoms but has volunteer-specific layout (more compact, single screen)

5. **Drag-and-drop library stability on Expo SDK 54**
   - What we know: react-native-reanimated-dnd requires reanimated 3.x, project has reanimated 4.1.1
   - What's unclear: Compatibility with reanimated 4.x and Expo SDK 54 New Architecture
   - Recommendation: Test library after installation, fallback to manual reorder buttons if unstable (LOW confidence in Expo 54 compatibility)

## Sources

### Primary (HIGH confidence)
- [Convex React Client Documentation](https://docs.convex.dev/client/react) - useQuery, useMutation API
- [Convex Optimistic Updates](https://docs.convex.dev/client/react/optimistic-updates) - withOptimisticUpdate patterns
- [Convex Pagination](https://docs.convex.dev/database/pagination) - Cursor-based pagination
- [React Native FlatList Optimization](https://reactnative.dev/docs/optimizing-flatlist-configuration) - Official performance guide
- [react-native-reanimated-dnd GitHub](https://github.com/entropyconquers/react-native-reanimated-dnd) - Installation, API, examples

### Secondary (MEDIUM confidence)
- [High-Throughput Mutations (Convex Stack)](https://stack.convex.dev/high-throughput-mutations-via-precise-queries) - Queue pattern, batch updates
- [How Convex Works (Convex Stack)](https://stack.convex.dev/how-convex-works) - OCC, serializability
- [Debounce in React (Medium)](https://medium.com/nerd-for-tech/debounce-your-search-react-input-optimization-fd270a8042b) - useDebounce hook pattern

### Tertiary (LOW confidence - marked for validation)
- [React Native Drag-and-Drop Libraries Comparison](https://reactscript.com/best-drag-drop/) - General overview, not specific to reanimated-dnd
- [Xebia Drag-and-Drop Tutorial](https://xebia.com/blog/drag-drop-sort-implementing-draggable-sorting-in-react-native/) - Community tutorial, may be outdated

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Convex is project's existing backend, reanimated/gesture-handler already installed
- Architecture: HIGH - Patterns verified from official docs (Convex, React Native)
- Pitfalls: MEDIUM - Based on common issues in search results, not project-specific testing
- Drag-and-drop library: MEDIUM - Library exists and is documented, but Expo SDK 54 + reanimated 4.x compatibility not explicitly verified

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable stack, well-established patterns)
