# Architecture Research: Real-Time Queue Management Systems

**Domain:** Real-time queue management with offline support
**Researched:** 2026-01-23
**Confidence:** HIGH

## Standard Architecture for Real-Time Queue Systems

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     UI LAYER (React Native)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Service  │  │ Volunteer│  │  Queue   │  │  Timer   │    │
│  │  User    │  │  Admin   │  │  Status  │  │  Display │    │
│  │  Screens │  │  Screens │  │  Screen  │  │  Screen  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│          STATE SYNC LAYER (WebSocket + Local Cache)         │
├──────────────────────────┼───────────────────────────────────┤
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │         ConvexReactClient (useQuery/useMutation)       │  │
│  │  - Automatic subscriptions                             │  │
│  │  - Consistency guarantees                              │  │
│  │  - Built-in cache (5min default)                       │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │     Offline Store (Optional: Legend-State/TinyBase)    │  │
│  │  - Read-only cache for offline                         │  │
│  │  - Queue snapshots                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│              BACKEND LAYER (Convex Functions)                │
├──────────────────────────┼───────────────────────────────────┤
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │  Queries (Read)      │   Mutations (Write)             │  │
│  │  ────────────────    │   ─────────────────             │  │
│  │  - getActiveQueue    │   - submitIntakeForm            │  │
│  │  - getUserPosition   │   - startTimer                  │  │
│  │  - getQueueStats     │   - removeFromQueue             │  │
│  │                      │   - completeWash                │  │
│  │                      │   - repositionQueue             │  │
│  └──────────────────────┴─────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │         Scheduled Functions (Server-Side Timers)       │  │
│  │  - Timer expiration checks (every 10s)                 │  │
│  │  - Auto-remove completed washes                        │  │
│  │  - Queue position updates                              │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │            Actions (External Integrations)             │  │
│  │  - Google Sheets export (batch writes)                 │  │
│  │  - SMS notifications (Twilio/SNS)                      │  │
│  │  - Push notifications (FCM/APNS)                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│                 DATA LAYER (Convex Database)                 │
├──────────────────────────┼───────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  users   │  │ sessions │  │  queue   │  │  intake  │    │
│  │  table   │  │  table   │  │  table   │  │  Forms   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│       │              │              │             │         │
│  [indexes]      [indexes]      [indexes]     [indexes]     │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **UI Layer** | User interaction, presentation, local UI state | React Native screens using Expo Router |
| **Sync Layer** | Real-time data subscriptions, offline cache | Convex React hooks (useQuery/useMutation) + optional local-first library |
| **Query Functions** | Read operations with dependency tracking | Convex queries with indexes |
| **Mutation Functions** | Transactional writes, queue operations | Convex mutations (atomic, consistent) |
| **Scheduled Functions** | Background timers, periodic cleanup | Convex cron jobs + scheduled functions |
| **Action Functions** | External API calls, side effects | Convex actions (non-transactional) |
| **Database** | Persistent storage with indexes | Convex tables with reactivity |

## Recommended Queuert Structure

Based on Convex + Expo best practices:

```
app/                              # Expo Router file-based routes
├── _layout.tsx                   # Root layout (ConvexProvider)
├── (auth)/                       # Authentication flow
│   ├── role-selection.tsx
│   ├── phone-input.tsx
│   └── verification.tsx
├── (user)/                       # Service user screens
│   ├── intake-form.tsx
│   ├── queue-status.tsx
│   └── wash-timer.tsx
└── (volunteer)/                  # Volunteer admin screens
    ├── session-control.tsx
    ├── queue-management.tsx
    └── timer-control.tsx

components/
├── queue/                        # Domain-specific components
│   ├── QueueCard.tsx
│   ├── TimerDisplay.tsx
│   └── PositionIndicator.tsx
└── ui/                          # Reusable atoms
    └── [existing atoms]

convex/
├── schema.ts                     # Database schema (existing)
├── model/                        # Helper functions (business logic)
│   ├── queueLogic.ts            # Position calculation, reordering
│   ├── timerLogic.ts            # Timer expiration, duration calc
│   └── sessionLogic.ts          # Session lifecycle
├── queries/                      # Query functions (thin wrappers)
│   ├── queue.ts                 # getActiveQueue, getUserPosition
│   ├── sessions.ts              # getActiveSession, getSessionStats
│   └── volunteers.ts            # getVolunteerQueue
├── mutations/                    # Mutation functions
│   ├── intake.ts                # submitIntakeForm (existing)
│   ├── queue.ts                 # startTimer, removeFromQueue, completeWash
│   └── sessions.ts              # createSession, endSession
├── actions/                      # External integrations
│   ├── sheets.ts                # exportToGoogleSheets
│   ├── notifications.ts         # sendSMS, sendPushNotification
│   └── analytics.ts             # logEvent
└── crons.ts                      # Scheduled functions config

lib/
├── convex-client.ts             # ConvexReactClient singleton
├── offline-store.ts             # Optional: Legend-State/TinyBase setup
└── i18n/                        # Multi-language support
    ├── en.json
    ├── es.json
    ├── pt.json
    └── ht.json

constants/
└── theme.ts                     # Existing design system
```

### Structure Rationale

- **convex/model/:** Business logic as pure TypeScript functions (Convex best practice: keep query/mutation wrappers thin)
- **convex/queries/ and convex/mutations/:** Separate concerns for read vs write operations
- **convex/actions/:** Isolate side effects (Sheets, SMS, push) from transactional database operations
- **app/ routes:** File-based routing groups auth, user, and volunteer flows separately
- **lib/offline-store.ts:** Centralized offline strategy (optional enhancement)

## Architectural Patterns for Queuert

### Pattern 1: Server-Side Timer Architecture

**What:** Timers run server-side with scheduled functions checking expiration, not client-side intervals.

**When to use:** Multi-client timer synchronization where volunteers and users must see the same remaining time.

**Trade-offs:**
- **PRO:** Perfect synchronization across all devices
- **PRO:** Works when clients are offline (timer continues)
- **PRO:** No clock drift between devices
- **CON:** Scheduled function granularity (check every 10-30s, not millisecond precision)

**Example:**
```typescript
// convex/model/timerLogic.ts
export function calculateTimeRemaining(timerStartedAt: number, timerDuration: number): number {
  const elapsed = Date.now() - timerStartedAt;
  const remaining = Math.max(0, timerDuration - elapsed);
  return remaining;
}

export function isTimerExpired(timerStartedAt: number, timerDuration: number): boolean {
  return Date.now() >= (timerStartedAt + timerDuration);
}

// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "check-expired-timers",
  { seconds: 10 }, // Check every 10 seconds
  internal.scheduled.checkExpiredTimers
);

export default crons;

// convex/scheduled.ts (internal function)
import { internalMutation } from "./_generated/server";
import { isTimerExpired } from "./model/timerLogic";

export const checkExpiredTimers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const washingEntries = await ctx.db
      .query("queue")
      .withIndex("by_session_status")
      .filter(q => q.eq(q.field("status"), "washing"))
      .collect();

    for (const entry of washingEntries) {
      if (entry.timerStartedAt && isTimerExpired(entry.timerStartedAt, entry.timerDuration)) {
        await ctx.db.patch(entry._id, {
          status: "ready_to_remove",
        });

        // Trigger notification action
        await ctx.scheduler.runAfter(0, internal.actions.sendWashCompleteNotification, {
          queueId: entry._id,
        });
      }
    }
  },
});

// Client displays calculated remaining time (reactive query)
// convex/queries/queue.ts
export const getQueueEntryWithTimer = query({
  args: { queueId: v.id("queue") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.queueId);
    if (!entry) return null;

    // Calculate client-side for display, but server is source of truth
    const timeRemaining = entry.timerStartedAt
      ? calculateTimeRemaining(entry.timerStartedAt, entry.timerDuration)
      : null;

    return {
      ...entry,
      timeRemaining,
    };
  },
});
```

**Why this works for Queuert:**
- Volunteers can close the app; timer continues
- Multiple volunteers see identical timer values
- Status changes (washing → ready_to_remove) happen automatically
- Client-side countdown is derived, not authoritative

### Pattern 2: Reactive Queue Subscriptions

**What:** UI automatically updates when queue changes, using Convex's reactive queries with no manual polling.

**When to use:** Any screen displaying queue status (service user position, volunteer queue list).

**Trade-offs:**
- **PRO:** Zero manual subscription management
- **PRO:** Consistency guarantees (all subscriptions update to same logical timestamp)
- **PRO:** Automatic cache invalidation
- **CON:** Always requires network for updates (offline = stale data)

**Example:**
```typescript
// convex/queries/queue.ts
export const getActiveQueue = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const queueItems = await ctx.db
      .query("queue")
      .withIndex("by_session_status", q =>
        q.eq("sessionId", args.sessionId)
         .eq("status", "waiting")
      )
      .order("asc", "position")
      .collect();

    // Populate user details efficiently
    return await Promise.all(
      queueItems.map(async (item) => {
        const user = await ctx.db.get(item.serviceUserId);
        const intake = await ctx.db.get(item.intakeFormId);
        return { ...item, user, intake };
      })
    );
  },
});

// Client screen (volunteer queue management)
// app/(volunteer)/queue-management.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function QueueManagementScreen({ sessionId }: { sessionId: Id<"sessions"> }) {
  // Automatic subscription - component rerenders when queue changes
  const queue = useQuery(api.queries.queue.getActiveQueue, { sessionId });

  if (queue === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={queue}
      renderItem={({ item }) => (
        <QueueCard
          position={item.position}
          userName={item.user?.firstName}
          loadsCount={item.intake?.estimatedLaundryLoads}
          status={item.status}
        />
      )}
      keyExtractor={item => item._id}
    />
  );
}
```

**Why this works for Queuert:**
- When volunteer calls `startTimer()` mutation, all connected clients receive updated queue automatically
- When user submits intake form, their position appears instantly for all volunteers
- No manual `refetch()` calls needed

### Pattern 3: Optimistic Mutations with Rollback

**What:** UI updates immediately on mutation call, then syncs with server result (automatic in Convex).

**When to use:** Actions where users expect immediate feedback (button press to start timer).

**Trade-offs:**
- **PRO:** Feels instantaneous to user
- **PRO:** Works well with Convex's automatic consistency
- **CON:** Must handle rare rollback cases (mutation fails)

**Example:**
```typescript
// Client component
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function StartTimerButton({ queueId, volunteerId }: Props) {
  const startTimer = useMutation(api.mutations.queue.startTimer);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartTimer = async () => {
    setIsStarting(true);
    try {
      await startTimer({ queueId, volunteerUserId: volunteerId });
      // Convex automatically updates all subscriptions
    } catch (error) {
      // Handle error (rare - mutation failed)
      Alert.alert("Error", "Failed to start timer. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <CustomButton
      label="Start Wash Timer"
      onPress={handleStartTimer}
      isLoading={isStarting}
      variant="primary"
    />
  );
}
```

### Pattern 4: Offline-First with Read-Only Cache

**What:** Cache query results locally for offline read access, with sync-on-reconnect.

**When to use:** Volunteer screens that need to display queue even with poor connectivity.

**Trade-offs:**
- **PRO:** Volunteers can view queue during temporary network loss
- **PRO:** Faster initial renders (cached data)
- **CON:** Stale data risk (cache may not reflect reality)
- **CON:** Write operations require network (can't add to queue offline)

**Example using Legend-State (recommended by Expo):**
```typescript
// lib/offline-store.ts
import { observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { synced } from '@legendapp/state/sync';

interface QueueSnapshot {
  sessionId: string;
  queue: Array<any>;
  lastSynced: number;
}

export const offlineStore$ = observable(
  synced({
    initial: { queue: [], lastSynced: 0 },
    persist: {
      name: 'queuert-cache',
      plugin: ObservablePersistLocalStorage,
    },
  })
);

// Usage in volunteer screen
export function VolunteerQueueScreen({ sessionId }: Props) {
  const onlineQueue = useQuery(api.queries.queue.getActiveQueue, { sessionId });
  const offlineQueue = useObservable(offlineStore$.queue);

  // Use online data if available, fallback to offline cache
  const displayQueue = onlineQueue ?? offlineQueue;
  const isOnline = onlineQueue !== undefined;

  useEffect(() => {
    if (onlineQueue) {
      // Update offline cache when online data arrives
      offlineStore$.queue.set(onlineQueue);
      offlineStore$.lastSynced.set(Date.now());
    }
  }, [onlineQueue]);

  return (
    <View>
      {!isOnline && <OfflineBanner lastSynced={offlineStore$.lastSynced.get()} />}
      <QueueList data={displayQueue} />
    </View>
  );
}
```

**Alternative: TinyBase (also Expo-recommended):**
```typescript
// lib/offline-store.ts using TinyBase
import { createStore } from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

export const offlineStore = createStore();
export const persister = createLocalPersister(offlineStore, 'queuert-cache');

persister.startAutoLoad();
persister.startAutoSave();
```

**Decision for Queuert:**
- **Service users:** No offline mode needed (intake form requires network)
- **Volunteers:** Read-only offline cache for queue viewing only
- **Implementation:** Start without offline library, add Legend-State in Phase 3 if needed

### Pattern 5: Google Sheets Export via Batch Actions

**What:** Export queue/intake data to Google Sheets using Convex actions (non-transactional).

**When to use:** Periodic batch exports (every 5 minutes) or on-demand from volunteer screen.

**Trade-offs:**
- **PRO:** Actions can make HTTP calls to external APIs
- **PRO:** Failure doesn't affect database operations
- **CON:** No atomicity guarantees (export may fail independently)
- **CON:** Google Sheets API rate limits (100 requests/100 seconds per user)

**Example:**
```typescript
// convex/actions/sheets.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const exportQueueToSheets = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    // Fetch data via internal query
    const queueData = await ctx.runQuery(internal.queries.queue.getFullQueueForExport, {
      sessionId: args.sessionId,
    });

    // Call Google Sheets API (using service account credentials)
    const SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

    const formattedRows = queueData.map(entry => [
      entry.user.firstName,
      entry.user.lastName,
      entry.user.phone,
      entry.intake.livingCondition,
      entry.intake.estimatedLaundryLoads,
      entry.status,
      entry.joinedAt,
      entry.timerStartedAt ?? "",
    ]);

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Queue:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SHEETS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: formattedRows,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Sheets API error: ${response.statusText}`);
    }

    return { exported: queueData.length };
  },
});

// Schedule via cron (convex/crons.ts)
crons.interval(
  "export-to-sheets",
  { minutes: 5 }, // Every 5 minutes
  internal.actions.sheets.exportQueueToSheets,
  { sessionId: "active-session-id" } // In real impl, iterate active sessions
);
```

**Rate Limit Handling:**
- Batch multiple updates into single API call
- Use batch update endpoint (`/values:batchUpdate`) for multiple ranges
- Implement exponential backoff on 429 errors
- Consider write quotas: 100 requests per 100 seconds = ~1 request/second sustained

## Data Flow Patterns

### Request Flow: Service User Joins Queue

```
[User taps "Submit Intake Form"]
    ↓
[RegistrationFormScreen validates input]
    ↓
[useMutation(api.mutations.intake.submitIntakeForm) called]
    ↓
[ConvexReactClient sends mutation via WebSocket]
    ↓
[Convex Server: submitIntakeForm mutation handler]
    ↓ (transaction begins)
    ├─> Insert into intakeForms table
    ├─> Query current queue length
    ├─> Insert into queue table (position = length + 1)
    └─> (transaction commits)
    ↓
[Convex reactivity engine detects changes]
    ↓
[All subscriptions to getActiveQueue invalidated]
    ↓
[Query rerun, new results pushed via WebSocket]
    ↓
[All connected clients receive updated queue]
    ↓
├─> [Service User] sees "You're #5 in line"
└─> [Volunteer] sees new entry in queue list
```

### State Management: Timer Synchronization

```
[Server-Side State]
    ├─> queue.status = "washing"
    ├─> queue.timerStartedAt = 1643000000000
    ├─> queue.timerDuration = 1380000 (23 min)
    │
    ↓ (WebSocket push)
    │
[Client-Side Derived State]
    ├─> timeRemaining = timerDuration - (Date.now() - timerStartedAt)
    ├─> percentComplete = elapsed / timerDuration
    └─> displayMinutes = Math.floor(timeRemaining / 60000)
    │
    ↓ (useEffect with setInterval for smooth countdown)
    │
[UI Updates]
    ├─> TimerDisplay shows "22:15 remaining"
    ├─> ProgressBar animates smoothly
    └─> Status badge shows "Washing"
    │
    ↓ (Every 10 seconds: scheduled function checks server-side)
    │
[Scheduled Function: checkExpiredTimers]
    ├─> Query all "washing" entries
    ├─> Filter where Date.now() >= timerStartedAt + timerDuration
    └─> Patch status to "ready_to_remove"
    │
    ↓ (WebSocket push)
    │
[Client Receives Status Change]
    └─> UI updates to "Ready to Remove"
```

### Integration Flow: Google Sheets Export

```
[Trigger: Cron every 5 minutes OR volunteer manual export]
    ↓
[Action: exportQueueToSheets]
    ↓
[ctx.runQuery(internal.queries.queue.getFullQueueForExport)]
    ↓
[Format data as rows: [firstName, lastName, phone, loads, status, ...]]
    ↓
[Batch into chunks of 50 rows (rate limit consideration)]
    ↓
[For each chunk:]
    ├─> HTTP POST to Google Sheets API
    ├─> await response
    ├─> if 429 error: exponential backoff + retry
    └─> if success: continue to next chunk
    ↓
[Return { exported: totalRows, failed: failedRows }]
    ↓
[Optional: Log to analytics table for monitoring]
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-500 users** (MVP) | Monolithic Convex deployment, single scheduled function for timers, no offline mode. Basic Sheets export every 5 min. |
| **500-5K users** | Add offline cache for volunteers (Legend-State), optimize indexes (by_session_status, by_position), increase scheduled function frequency to every 5s. Batch Sheets exports (50 rows/call). |
| **5K-50K users** | Multiple Convex deployments per region, CDN for static assets, implement queue partitioning by location, scheduled functions per session (not global check). Consider Sheets alternative (BigQuery, Airtable) due to rate limits. |

### Scaling Priorities for Queuert

**First bottleneck (1000+ concurrent users):**
- **Problem:** Single scheduled function checking all timers becomes slow
- **Fix:** Partition by session - each session has its own scheduled function
- **Implementation:** Use runtime cron component to register per-session timer checks

**Second bottleneck (5K+ users, multiple locations):**
- **Problem:** Google Sheets write rate limit (100 req/100s)
- **Fix:** Aggregate multiple sessions into single batch write, or migrate to BigQuery/Airtable for higher throughput
- **Implementation:** Buffer writes in-memory, flush every 5 minutes with batchUpdate endpoint

**Third bottleneck (10K+ users, global scale):**
- **Problem:** WebSocket connection limits, cross-region latency
- **Fix:** Deploy Convex instances per region (us-east, eu-west), route users to nearest deployment
- **Implementation:** Regional deployment configuration (Convex supports this)

**Note for current scope (100 users, 15 volunteers):**
All bottlenecks are hypothetical. Simple architecture (single deployment, 10s scheduled function, basic Sheets export) will handle requirements with headroom.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Timer Authoritative State

**What people do:** Store `timerStartedAt` in local state, calculate remaining time purely client-side.

**Why it's wrong:**
- Clock drift between devices causes different remaining times
- If client crashes, timer state is lost
- Multiple volunteers see different values
- Can't enforce timer expiration reliably

**Do this instead:** Store timer in database, calculate remaining time from server timestamp, use scheduled functions to detect expiration.

### Anti-Pattern 2: Polling Queries for Real-Time Updates

**What people do:** Use `setInterval(() => refetch(), 5000)` to check for queue changes.

**Why it's wrong:**
- Wastes bandwidth (queries when nothing changed)
- Stale data between poll intervals
- Convex already provides reactive subscriptions
- Higher server load

**Do this instead:** Use `useQuery` hook - Convex automatically pushes updates via WebSocket when data changes.

### Anti-Pattern 3: Using Date.now() in Query Functions

**What people do:**
```typescript
// WRONG
export const getExpiredTimers = query({
  handler: async (ctx) => {
    const now = Date.now(); // Changes every millisecond!
    return await ctx.db.query("queue")
      .filter(q => q.field("timerStartedAt") + q.field("timerDuration") < now)
      .collect();
  },
});
```

**Why it's wrong:**
- Query cache invalidates constantly (every millisecond Date.now() changes)
- Convex doesn't re-run queries when time changes, only when data changes
- Causes stale results or excessive re-runs

**Do this instead:** Use scheduled functions to update status flags, query based on status field.

```typescript
// CORRECT
export const getReadyToRemove = query({
  handler: async (ctx) => {
    return await ctx.db.query("queue")
      .withIndex("by_session_status", q => q.eq("status", "ready_to_remove"))
      .collect();
  },
});

// Scheduled function updates status every 10s
export const checkExpiredTimers = internalMutation({
  handler: async (ctx) => {
    const washing = await ctx.db.query("queue")
      .withIndex("by_session_status", q => q.eq("status", "washing"))
      .collect();

    const now = Date.now(); // Fine in mutations/scheduled functions
    for (const entry of washing) {
      if (entry.timerStartedAt && (now >= entry.timerStartedAt + entry.timerDuration)) {
        await ctx.db.patch(entry._id, { status: "ready_to_remove" });
      }
    }
  },
});
```

### Anti-Pattern 4: Sequential Database Operations in Actions

**What people do:**
```typescript
// WRONG
export const processUserJoin = action({
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.mutations.intake.submitIntakeForm, args);
    const user = await ctx.runQuery(internal.queries.users.getUser, { userId: args.userId });
    await ctx.runMutation(internal.mutations.notifications.sendWelcomeSMS, { phone: user.phone });
  },
});
```

**Why it's wrong:**
- Each `ctx.runMutation/runQuery` is a separate transaction
- Race conditions if data changes between calls
- If second mutation fails, first mutation already committed (no atomicity)

**Do this instead:** Consolidate into single mutation, use actions only for external side effects.

```typescript
// CORRECT
export const submitIntakeForm = mutation({
  handler: async (ctx, args) => {
    // All database operations in one transaction
    const intakeFormId = await ctx.db.insert("intakeForms", { ...args, submittedAt: Date.now() });
    const queuePosition = await ctx.db.query("queue")
      .withIndex("by_session_status")
      .filter(q => q.eq("sessionId", args.sessionId))
      .collect().length;

    const queueId = await ctx.db.insert("queue", {
      serviceUserId: args.serviceUserId,
      intakeFormId,
      sessionId: args.sessionId,
      position: queuePosition + 1,
      status: "waiting",
      joinedAt: Date.now(),
      timerDuration: 23 * 60 * 1000,
    });

    // Schedule side effect after transaction succeeds
    await ctx.scheduler.runAfter(0, internal.actions.notifications.sendWelcomeSMS, {
      serviceUserId: args.serviceUserId,
    });

    return { intakeFormId, queueId };
  },
});
```

### Anti-Pattern 5: Storing Entire Queue in Local State

**What people do:** Fetch queue once, store in `useState`, manually update on mutations.

**Why it's wrong:**
- Duplicate state management (Convex already caches)
- Out of sync with server (other clients' changes not reflected)
- Manual synchronization is error-prone

**Do this instead:** Trust Convex's built-in reactivity - `useQuery` hook maintains consistency automatically.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Google Sheets** | Convex action via REST API | Use service account credentials, batch writes every 5 min, handle 429 rate limits |
| **SMS (Twilio/AWS SNS)** | Convex action triggered by scheduled function | Send when timer expires (status → "ready_to_remove") |
| **Push Notifications (FCM/APNS)** | Convex action with device token storage | Store tokens in users table, send via FCM HTTP API |
| **QR Code Scanner** | Expo Camera + barcode scanner | Local processing, result sent to mutation (no external service) |
| **i18n (Multi-language)** | expo-localization + i18n-js | Client-side translation, language preference in users table |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **UI ↔ Convex Sync Layer** | ConvexReactClient hooks (useQuery, useMutation) | Automatic subscription management, WebSocket-based |
| **Queries ↔ Model Logic** | Direct function calls (import helper functions) | Model functions are pure TypeScript, stateless |
| **Mutations ↔ Actions** | ctx.scheduler.runAfter() or ctx.scheduler.runAt() | Decouple transactional writes from side effects |
| **Scheduled Functions ↔ Mutations** | ctx.runMutation(internal.*) | Scheduled functions trigger internal mutations for DB updates |
| **Offline Store ↔ Convex** | Manual sync (useEffect to update cache) | Optional: Legend-State/TinyBase mirrors query results |

## Build Order Recommendations

Based on dependency analysis and risk mitigation:

### Phase 1: Core Real-Time Infrastructure
**Goal:** Establish Convex connection and reactive queries
**Duration:** 1 sprint (2 weeks)

1. Wire `ConvexReactClient` into app root layout
2. Convert existing screens to use `useQuery` hooks
3. Implement reactive queue display (volunteer view)
4. Add real-time position updates (service user view)

**Why first:** Foundation for all other features. De-risks WebSocket connectivity early.

### Phase 2: Timer System
**Goal:** Server-side timers with scheduled functions
**Duration:** 1 sprint

1. Implement `startTimer` mutation
2. Create scheduled function for expiration checks
3. Add client-side countdown display (derived from server timestamp)
4. Handle timer completion (status transitions)

**Why second:** Core business logic. Depends on Phase 1 reactive queries.

### Phase 3: Queue Operations
**Goal:** Full volunteer control (add, remove, reorder)
**Duration:** 1 sprint

1. Implement `removeFromQueue` mutation
2. Add `repositionQueue` mutation (drag-to-reorder)
3. Create volunteer admin screens
4. Add confirmation dialogs for destructive actions

**Why third:** Builds on Phases 1-2. Lower risk (volunteers can manually manage).

### Phase 4: External Integrations
**Goal:** Google Sheets, SMS, push notifications
**Duration:** 1.5 sprints

1. Set up Google Sheets API credentials
2. Implement `exportQueueToSheets` action
3. Configure SMS gateway (Twilio/SNS)
4. Add push notification setup
5. Create scheduled exports (cron)

**Why fourth:** External dependencies. Can be partially delivered (Sheets first, SMS later).

### Phase 5: Offline Mode (Optional)
**Goal:** Read-only volunteer queue cache
**Duration:** 1 sprint

1. Evaluate Legend-State vs TinyBase
2. Implement offline cache layer
3. Add sync status indicators
4. Test offline → online transitions

**Why optional:** Nice-to-have for poor connectivity. Not required for MVP.

### Phase 6: Multi-language & Polish
**Goal:** i18n, QR scanning, session management
**Duration:** 1 sprint

1. Add expo-localization + i18n-js
2. Implement QR code camera integration
3. Add session lifecycle (start/end)
4. Polish UI/UX based on testing

**Why last:** User-facing polish. Requires stable core functionality.

## Convex-Specific Patterns for Queuert

### Pattern: Index-First Querying

Queuert's queue table should use indexes heavily:

```typescript
// convex/schema.ts
queue: defineTable({
  // ... fields
})
  .index("by_session_status", ["sessionId", "status"]) // Primary lookup
  .index("by_position", ["sessionId", "position"])     // For ordering
  .index("by_user", ["serviceUserId"])                 // User's position lookup
```

**Usage:**
```typescript
// EFFICIENT: Uses index
const waitingQueue = await ctx.db
  .query("queue")
  .withIndex("by_session_status", q =>
    q.eq("sessionId", sessionId).eq("status", "waiting")
  )
  .order("asc", "position")
  .collect();

// INEFFICIENT: Full table scan with filter
const waitingQueue = await ctx.db
  .query("queue")
  .filter(q => q.eq(q.field("sessionId"), sessionId))
  .filter(q => q.eq(q.field("status"), "waiting"))
  .collect();
```

### Pattern: Internal vs Public Functions

```typescript
// convex/queries/queue.ts (public - called from client)
export const getActiveQueue = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    // Validate access control
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("Not authenticated");

    // Delegate to helper
    return await getActiveQueueHelper(ctx, args.sessionId);
  },
});

// convex/model/queueLogic.ts (internal - reusable helper)
export async function getActiveQueueHelper(
  ctx: QueryCtx,
  sessionId: Id<"sessions">
) {
  return await ctx.db
    .query("queue")
    .withIndex("by_session_status", q =>
      q.eq("sessionId", sessionId).eq("status", "waiting")
    )
    .collect();
}

// convex/scheduled.ts (internal - server-side only)
export const bulkExportQueue = internalMutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    // No auth check needed - internal function
    const queue = await getActiveQueueHelper(ctx, args.sessionId);
    // ... export logic
  },
});
```

**Security model:**
- `api.*` functions: Callable by anyone, require auth checks
- `internal.*` functions: Only callable server-side, no auth checks needed
- Helper functions: Pure logic, imported by both

### Pattern: Scheduled Function Coordination

For timer checks, use a single scheduled function that processes all active sessions:

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "check-all-timers",
  { seconds: 10 },
  internal.scheduled.checkAllActiveTimers
);

export default crons;

// convex/scheduled.ts
export const checkAllActiveTimers = internalMutation({
  handler: async (ctx) => {
    // Get all active sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_location_active", q => q.eq("isActive", true))
      .collect();

    // Process each session's timers
    for (const session of sessions) {
      const washingEntries = await ctx.db
        .query("queue")
        .withIndex("by_session_status", q =>
          q.eq("sessionId", session._id).eq("status", "washing")
        )
        .collect();

      const now = Date.now();
      for (const entry of washingEntries) {
        if (entry.timerStartedAt &&
            now >= entry.timerStartedAt + entry.timerDuration) {
          await ctx.db.patch(entry._id, { status: "ready_to_remove" });

          // Schedule notification
          await ctx.scheduler.runAfter(
            0,
            internal.actions.notifications.sendWashCompleteNotification,
            { queueId: entry._id }
          );
        }
      }
    }
  },
});
```

**Scaling note:** At high scale (100+ active sessions), refactor to per-session scheduled functions using runtime cron component.

## Offline/Online Transition Handling

### Strategy for Queuert

**Service Users:** No offline support (require network for intake form submission).

**Volunteers:** Read-only offline cache for queue viewing.

### Implementation Approach

```typescript
// lib/offline-store.ts
import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';

export interface CachedQueue {
  sessionId: string;
  entries: Array<QueueEntry>;
  lastSynced: number;
}

export const queueCache$ = observable<CachedQueue>({
  sessionId: '',
  entries: [],
  lastSynced: 0,
});

// Persist to AsyncStorage (React Native)
persistObservable(queueCache$, {
  local: 'queuert-cache',
});

// Sync manager
export function useQueueWithOfflineSupport(sessionId: string) {
  const onlineQueue = useQuery(api.queries.queue.getActiveQueue, { sessionId });
  const cachedQueue = useObservable(queueCache$);
  const [isOnline, setIsOnline] = useState(true);

  // Update cache when online data arrives
  useEffect(() => {
    if (onlineQueue) {
      queueCache$.set({
        sessionId,
        entries: onlineQueue,
        lastSynced: Date.now(),
      });
      setIsOnline(true);
    } else if (onlineQueue === undefined) {
      // Still loading or offline
      setIsOnline(false);
    }
  }, [onlineQueue, sessionId]);

  // Return online data if available, else cached
  const displayQueue = onlineQueue ?? (
    cachedQueue.sessionId === sessionId ? cachedQueue.entries : []
  );

  return {
    queue: displayQueue,
    isOnline,
    lastSynced: cachedQueue.lastSynced,
  };
}

// Usage in volunteer screen
export function VolunteerQueueScreen({ sessionId }: Props) {
  const { queue, isOnline, lastSynced } = useQueueWithOfflineSupport(sessionId);

  return (
    <View>
      {!isOnline && (
        <Banner type="warning">
          Offline mode - viewing cached data from {formatTime(lastSynced)}
        </Banner>
      )}
      <QueueList data={queue} readOnly={!isOnline} />
    </View>
  );
}
```

### Transition Scenarios

**Scenario 1: Network loss while viewing queue**
1. Convex WebSocket disconnects
2. `useQuery` returns `undefined` (loading state)
3. Hook detects offline, displays cached data
4. UI shows offline banner

**Scenario 2: Network restored**
1. Convex WebSocket reconnects automatically
2. All subscriptions refreshed with current data
3. `useQuery` returns fresh results
4. Cache updated, offline banner removed

**Scenario 3: Attempted mutation while offline**
1. Volunteer taps "Start Timer" button
2. `useMutation` call fails (no network)
3. Error handler displays "Network required" alert
4. User waits for connection, retries

**Decision:** Don't implement write queuing (complex, risk of conflicts). Mutations require network.

## Sources

**Convex Architecture & Best Practices:**
- [Convex Overview](https://docs.convex.dev/understanding/)
- [Best Practices | Convex Developer Hub](https://docs.convex.dev/understanding/best-practices/)
- [How Convex Works](https://stack.convex.dev/how-convex-works)
- [A Guide to Real-Time Databases for Faster, More Responsive Apps](https://stack.convex.dev/real-time-database)
- [Queries | Convex Developer Hub](https://docs.convex.dev/functions/query-functions)
- [Convex React | Convex Developer Hub](https://docs.convex.dev/client/react)

**Scheduling & Background Jobs:**
- [Cron Jobs | Convex Developer Hub](https://docs.convex.dev/scheduling/cron-jobs)
- [Scheduled Functions | Convex Developer Hub](https://docs.convex.dev/scheduling/scheduled-functions)
- [Background Job Management](https://stack.convex.dev/background-job-management)

**Offline-First Architecture:**
- [Local-first architecture with Expo - Expo Documentation](https://docs.expo.dev/guides/local-first/)
- [GitHub - trestleinc/replicate: local first with convex](https://github.com/trestleinc/replicate)
- [Going local-first with Automerge and Convex](https://stack.convex.dev/automerge-and-convex)
- [Offline-first frontend apps in 2025: IndexedDB and SQLite in the browser and beyond - LogRocket Blog](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)

**Real-Time Sync Patterns:**
- [Syncing Countdown Timers Across Multiple Clients | Medium](https://medium.com/@flowersayo/syncing-countdown-timers-across-multiple-clients-a-subtle-but-critical-challenge-384ba5fbef9a)
- [Server-Sent Events vs WebSockets: Key Differences and Use Cases in 2026](https://www.nimbleway.com/blog/server-sent-events-vs-websockets-what-is-the-difference-2026-guide)
- [6 Essential WebSocket Patterns for Real-Time Applications - DEV Community](https://dev.to/aaravjoshi/6-essential-websocket-patterns-for-real-time-applications-39gf)

**Queue Management Systems:**
- [Queue Management Systems 2026: Solutions and Use Cases](https://www.pro.affluences.com/en/post/queue-management-system-update)
- [Queue Management System: The Complete Guide for 2026](https://vizman.app/resources/blogs/queue-management-system-complete-guide-for-2026/)

**Google Sheets Integration:**
- [Google Sheets API Overview | Google for Developers](https://developers.google.com/workspace/sheets/api/guides/concepts)
- [Automate API to Spreadsheet with Real-Time Google Sheets - DEV Community](https://dev.to/author_shivani_9c765c8db9/automate-api-to-spreadsheet-with-real-time-google-sheets-3093)

---
*Architecture research for: Queuert (Real-time Queue Management)*
*Researched: 2026-01-23*
*Confidence: HIGH (based on official Convex documentation, Expo guides, and verified patterns)*
