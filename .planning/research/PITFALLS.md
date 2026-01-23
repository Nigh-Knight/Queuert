# Pitfalls Research

**Domain:** Real-time queue management with offline capabilities
**Researched:** 2026-01-23
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: Convex Lacks Native Offline-First Support

**What goes wrong:**
Developers assume Convex's real-time sync includes full offline mode. It doesn't. Convex queues mutations when offline but doesn't cache query results locally. Users in spotty connectivity areas (the core use case) see blank screens or stale data when disconnected, even though volunteers need read-only queue access offline.

**Why it happens:**
Marketing materials emphasize "real-time" and "automatic sync," which sounds like offline-first. The reality: Convex is server-authoritative. Offline mutations queue, but queries fail without network. Teams discover this late in development after committing to the stack.

**How to avoid:**
- **Phase 1 MVP**: Add explicit IndexedDB caching layer for read-only offline queue viewing
- Use [Automerge + Convex pattern](https://stack.convex.dev/automerge-and-convex) for CRDT-based offline writes (adds 200ms overhead per sync)
- Alternative: Implement React Query with localStorage persistence for query caching
- Test offline mode in Phase 1, not Phase 3—rebuilding sync logic later is expensive

**Warning signs:**
- "Cannot read from database" errors during network blips in development
- Queries returning empty arrays instead of last-known state when offline
- No `useQuery` data during airplane mode testing

**Phase to address:**
Phase 1 (Core Infrastructure) - Offline strategy must be architectural, not bolted on.

**Sources:**
- [Convex offline workarounds with Automerge](https://stack.convex.dev/automerge-and-convex)
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)

---

### Pitfall 2: Timer Drift Destroys Trust in 23-Minute Wash Cycles

**What goes wrong:**
Volunteers start a timer, but different devices show different remaining times. A volunteer's phone says 5 minutes left; service user's phone says 12 minutes. Clock drift accumulates at ~50ms per 10 minutes. Over a 23-minute cycle, devices can differ by 2+ minutes, causing users to miss their load or argue with volunteers.

**Why it happens:**
Developers store `startTime` in database, calculate `timeRemaining = 23min - (now - startTime)` client-side. Each device's `now` drifts independently. Android/iOS system clocks aren't NTP-synced during events (users disable auto-time to save battery, or cellular time sync fails at event venue).

**How to avoid:**
- **Server-authoritative timers**: Convex scheduled function updates timer state every 30 seconds; clients display server's countdown, not local calculation
- Use [Android TrustedTime API](https://android-developers.googleblog.com/2025/02/trustedtime-api-introducing-reliable-approach-to-time-keeping-for-apps.html) to sync device clock to Google's time servers (iOS lacks equivalent—fallback to server sync)
- Display "Time remaining: ~5 min" with tilde to signal approximation, reducing expectation of second-level precision
- Phase 2 testing: Run timers for full 23 minutes on 5+ devices with manual clock adjustments to verify drift handling

**Warning signs:**
- Different countdown values across devices viewing same queue entry
- Users complaining "timer finished but app still showed 3 minutes"
- `Date.now()` called in Convex queries (best practices violation—causes subscription churn)

**Phase to address:**
Phase 2 (Timer System) - Core timer architecture must prevent drift from day one.

**Sources:**
- [Android TrustedTime API](https://android-developers.googleblog.com/2025/02/trustedtime-api-introducing-reliable-approach-to-time-keeping-for-apps.html)
- [Timer drift in distributed systems](https://medium.com/distributed-knowledge/time-synchronization-in-distributed-systems-a21808928bc8)
- [Convex temporal data best practices](https://docs.convex.dev/understanding/best-practices/)

---

### Pitfall 3: Google Sheets Rate Limits Trigger on 15-20 Queue Updates

**What goes wrong:**
The PRD specifies "Google Sheets integration for data storage." Developers sync every queue action (add user, start timer, mark complete) to Sheets via API. With 100 users and 15 volunteers, a busy arrival wave generates 50+ operations in 60 seconds. Google Sheets API limit: **300 requests per minute per project**. At 20 simultaneous events across locations, that's 1,000 req/min—system starts returning `429 Too Many Requests` within 2 minutes of event start.

**Why it happens:**
Teams implement naive webhook: `onQueueUpdate → Sheets.append()`. Seems fine in testing with 5 users. Production load + multi-location scale exceeds quota. Recovery is blocked—exponential backoff takes 10+ minutes to clear queue, meanwhile volunteers can't see updated data in Sheets.

**How to avoid:**
- **Batch writes**: Buffer queue updates in Convex, flush to Sheets every 60 seconds (max 5 batches/min = 25 req/min for 5 concurrent events)
- Use [exponential backoff + jitter](https://www.svix.com/resources/webhook-best-practices/retries/) for retry logic: 5s → 25s → 125s with randomization
- Implement **dead letter queue** in Convex for failed Sheets syncs (log to separate table, manual recovery UI for volunteers)
- Phase 3 load testing: Simulate 10 concurrent events with 20 updates/min each to verify batching prevents rate limits
- Alternative: Consider Sheets as **export target** (nightly batch), not real-time sync destination

**Warning signs:**
- `429` errors in Convex action logs
- Sheets data lagging 5+ minutes behind app during busy periods
- Missing rows in Sheets (failed writes with no retry)

**Phase to address:**
Phase 3 (External Integrations) - Must design batching before connecting to Sheets API.

**Sources:**
- [Google Sheets API rate limits](https://developers.google.com/workspace/sheets/api/limits)
- [Webhook retry patterns with exponential backoff](https://www.svix.com/resources/webhook-best-practices/retries/)
- [Handling webhook failures strategies](https://peerdh.com/blogs/programming-insights/handling-webhook-failures-strategies-for-robust-retry-mechanisms)

---

### Pitfall 4: Race Conditions in Queue Position Recalculation

**What goes wrong:**
When volunteer removes user #3 from queue, positions 4-10 should shift down. Two volunteers click "remove" on different users simultaneously. Without distributed locking, both mutations read same queue state, calculate new positions independently, write conflicting updates. Result: two users at position #4, or gap at position #6.

**Why it happens:**
Convex mutations execute in transaction, but separate mutations run concurrently. Developers write:
```typescript
const queue = await ctx.db.query('queue').collect(); // Read
const updated = queue.map((entry, i) => ({...entry, position: i+1})); // Calculate
await Promise.all(updated.map(e => ctx.db.patch(e._id, {position: e.position}))); // Write
```
Race window exists between read and write. Second mutation reads stale queue state.

**How to avoid:**
- **Optimistic concurrency control**: Store version number on queue entries, reject updates to stale versions
- **Single mutation pattern**: Batch all position updates in one mutation—Convex guarantees transactional consistency within a mutation
- Convex `.withIndex('by_position')` query ensures consistent ordering during concurrent reads
- Use MVCC pattern: `queue.forEach()` with version check before patch—retry on conflict
- Phase 2: Stress test with 5 simultaneous "remove" operations to verify position integrity

**Warning signs:**
- Duplicate position numbers in queue table
- Users seeing "Position 5" then suddenly "Position 8" without explanation
- Queue entries with `position: null` or negative values

**Phase to address:**
Phase 2 (Queue Logic) - Position management is core business logic, must be race-condition-free from start.

**Sources:**
- [Race conditions in distributed systems](https://www.geeksforgeeks.org/computer-networks/handling-race-condition-in-distributed-system/)
- [MVCC patterns for conflict handling](https://medium.com/@alexglushenkov/the-art-of-staying-in-sync-how-distributed-systems-avoid-race-conditions-f59b58817e02)
- [Convex database optimization best practices](https://docs.convex.dev/understanding/best-practices/)

---

### Pitfall 5: Optimistic UI Without Rollback Breaks User Trust

**What goes wrong:**
User submits intake form. App shows "Added to queue! Position #7" instantly (optimistic update). Mutation fails (network hiccup, validation error, DB timeout). User sees success message but isn't actually in queue. 30 minutes later, they realize they never got a spot—trust destroyed.

**Why it happens:**
React 19's `useOptimistic` makes optimistic UI trivial to implement but **doesn't handle rollback automatically**. Developers add optimistic state, forget error handling. Convex mutation queues when offline, but if it fails on reconnect (e.g., session closed), no rollback occurs.

**How to avoid:**
- **Always implement rollback**: Store previous state snapshot in `onMutate`, revert in `onError` callback
- Use TanStack Query's mutation pattern with rollback:
  ```typescript
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['queue']);
    const previousQueue = queryClient.getQueryData(['queue']);
    queryClient.setQueryData(['queue'], optimisticUpdate);
    return { previousQueue }; // Snapshot
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['queue'], context.previousQueue); // Rollback
  }
  ```
- Show **pending state** during mutation: "Adding you to queue..." with spinner, don't declare success until server confirms
- Phase 1: Test optimistic UI with intentional network failures (airplane mode toggle) to verify rollback

**Warning signs:**
- Success toasts appearing even when offline
- Users reporting "I submitted but I'm not in the queue"
- No error messages when mutations fail
- UI state diverging from server state after reconnect

**Phase to address:**
Phase 1 (State Management) - Optimistic UI is UX enhancement, but broken rollback is worse than no optimistic updates.

**Sources:**
- [Optimistic UI pitfalls and best practices](https://javascript.plainenglish.io/optimistic-ui-in-frontend-architecture-do-it-right-avoid-pitfalls-7507d713c19c)
- [React 19 useOptimistic deep dive](https://dev.to/a1guy/react-19-useoptimistic-deep-dive-building-instant-resilient-and-user-friendly-uis-49fp)
- [TanStack Query optimistic updates](https://tanstack.com/query/v4/docs/react/guides/optimistic-updates)

---

### Pitfall 6: Performance Degrades at 100 Concurrent Users Due to Unindexed Queries

**What goes wrong:**
MVP works beautifully with 10 users. First real event hits 80 concurrent users. Queue screen takes 5+ seconds to load. Volunteers refresh constantly, making it worse. App becomes unusable exactly when it's most needed. Post-event analysis reveals: `getActiveQueue()` query scans entire `queue` table (1000+ entries across all sessions) without index.

**Why it happens:**
Convex defaults to sequential scan if query doesn't use `.withIndex()`. Developers write:
```typescript
const queue = await ctx.db.query('queue')
  .filter(q => q.eq(q.field('sessionId'), args.sessionId))
  .collect();
```
Filtering happens **in code after full scan**. With 100 users × 10 historical queue entries = 1000 docs scanned per query × 15 volunteers refreshing = 15,000 reads/minute.

**How to avoid:**
- **Index all filtered fields**: Create `by_session_and_status` composite index:
  ```typescript
  queue: defineTable({
    sessionId: v.id('sessions'),
    status: v.string(),
    // ...
  }).index('by_session_and_status', ['sessionId', 'status'])
  ```
- Use `.withIndex('by_session_and_status', q => q.eq('sessionId', sessionId).eq('status', 'waiting'))` for indexed filtering
- Limit `.collect()` to <1000 docs—use pagination for historical data
- Phase 2 load testing: Seed 1000 queue entries, simulate 50 concurrent `getActiveQueue()` calls to verify <500ms response time
- Set performance budgets: p95 query latency ≤ 300ms

**Warning signs:**
- Query latency increasing linearly with data volume
- Convex dashboard showing high "documents scanned" vs "documents returned" ratio
- App slowing down during peak usage, fast when empty

**Phase to address:**
Phase 2 (Query Optimization) - Indexes must exist before scale testing, retroactive indexing is painful.

**Sources:**
- [Convex database query optimization](https://docs.convex.dev/understanding/best-practices/)
- [Mobile app performance at scale](https://www.plotline.so/blog/mobile-app-performance-metrics-essential-kpis-to-track)
- [Performance testing for concurrent users](https://cursa.app/en/page/performance-testing-for-mobile-apps-handling-concurrent-users-in-mobile-apps)

---

### Pitfall 7: Stale State in Multi-Tab/Multi-Device Scenarios

**What goes wrong:**
Volunteer opens app on phone and tablet simultaneously (common pattern: tablet at check-in table, phone when walking around). Starts timer on phone. Tablet still shows user as "waiting" for 30+ seconds. Volunteer starts timer again on tablet, creating duplicate timer entry. Confusion ensues.

**Why it happens:**
React Query's default `staleTime: 0` means data is immediately considered stale, but `refetchInterval` is typically 30s+. Convex subscriptions should prevent this, but developers wrap queries in `useQuery` with manual refetch control, breaking Convex's reactivity. Or component unmounts/remounts, closing subscription temporarily.

**How to avoid:**
- **Use Convex's `useQuery` hook directly**—don't wrap in React Query unless necessary; Convex subscriptions auto-update all clients
- Set React Query `staleTime: 0` and `cacheTime: 0` for queue data (always fresh, no stale tolerance)
- Verify subscription lifecycle: Components mounting/unmounting shouldn't drop subscriptions for shared queue view
- Phase 2: Test multi-device scenarios—simultaneous actions from 2 devices should sync within 1-2 seconds
- Add optimistic locking: Check `lastModified` timestamp before mutations, reject if stale

**Warning signs:**
- Volunteers reporting "I already did that, why is it showing again?"
- Multiple timer entries for same user
- Queue positions differ across devices for 10+ seconds

**Phase to address:**
Phase 2 (Real-Time Sync) - Reactivity must work across all clients before volunteers use multiple devices.

**Sources:**
- [State management in 2026 patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [Convex best practices for queries](https://docs.convex.dev/understanding/best-practices/)

---

### Pitfall 8: Missing Emergency Offline Fallback Plan

**What goes wrong:**
Event day. Venue WiFi crashes. Cellular is spotty (concrete building, 100 people competing for signal). Convex mutations queue but never send. Volunteers can't add users to queue. Paper backup doesn't exist—nobody brought clipboards. Event grinds to halt. 50 people waiting, 0 getting served.

**Why it happens:**
Teams test offline mode in dev ("airplane mode works!") but never simulate prolonged outage during active event. Assume "queued mutations will sync later" is sufficient. Reality: If event ends before network returns, queued data is orphaned. Volunteers need **read-write offline mode**, not just read-only queue viewing.

**How to avoid:**
- **Graceful degradation plan documented in volunteer training**: If app shows "Offline mode—limited functionality," switch to paper queue + post-event data entry
- Implement **local-first with IndexedDB**:
  - Writes persist locally immediately
  - Background sync sends to Convex when network available
  - Conflict resolution: Last-write-wins for simple fields, user-assisted for complex conflicts
- Add "Manual Sync" button in volunteer UI to trigger retry
- Phase 1 requirement: 30-minute full-offline test with 10 simulated queue operations, verify data integrity on reconnect
- Print emergency paper forms as backup (PDF generation in app for on-site printing)

**Warning signs:**
- No UI indication of offline state
- Mutations queued for >5 minutes with no sync progress indicator
- No testing with intentional prolonged outages (>10 minutes)

**Phase to address:**
Phase 1 (Offline Strategy) - Emergency plans need to exist before first event, not after first failure.

**Sources:**
- [Queue management emergency preparedness](https://www.qminder.com/blog/queue-management/dos-donts-effective-queuing/)
- [Offline-first mobile architecture](https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-518n)

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Convex indexes, filter in code | Faster MVP development (no schema migration) | Queries scan full table, slow at 100+ users; retroactive indexing requires migration | **Never**—indexes take 2 minutes to add, rewrites take 2 days |
| Store timer state client-side only | Simpler state management | Timers desync across devices, lost on app close | **Never** for production timers; OK for UI-only countdown animations |
| Use `Date.now()` in Convex queries | Easy to calculate "time remaining" | Queries re-run every render, subscription churn, battery drain | **Never**—use scheduled functions or client-side calculation with server `startTime` |
| Optimistic UI without rollback | Snappy UX in happy path | Silent failures, user trust broken, support burden | MVP only if failure rate <0.1%; must add rollback by Phase 2 |
| Google Sheets real-time sync (no batching) | Simple webhook integration | Rate limits at 15-20 queue operations, 429 errors cascade | **Never** for real-time; OK for hourly batch exports |
| Hardcode single session ID | Simpler initial data model | Can't support multi-location events, requires data migration | MVP only if single-location pilot; add sessions by Phase 2 |
| No input validation on public Convex functions | Faster mutation writing | Security vulnerability, data corruption, type errors | **Never**—use `args: { ... }` validator on all public functions |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Sheets API | Sync every queue action individually | Batch writes every 60s, max 5 req/min per location; exponential backoff on 429 |
| Twilio SMS | Send SMS in Convex mutation (blocks transaction) | Queue SMS in mutation, send via scheduled action (async); retry logic with DLQ |
| Push Notifications (FCM/APNS) | Store device tokens without expiration | Expire tokens after 90 days; refresh on app open; handle invalid token errors gracefully |
| QR Code Scanning | Use generic library without format validation | Validate QR contains expected volunteer ID format; handle malformed codes without crash |
| Phone Verification (OTP) | Store OTPs in plaintext | Hash OTPs with salt; expire after 10 minutes; rate-limit requests (max 3/number/hour) |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `.collect()` without limit | Full table scan on every query | Use `.withIndex()` + `.take(N)` for pagination; limit to <1000 docs | >500 queue entries (event with 50+ users × 10 loads/person) |
| Unindexed `sessionId` filter | Query latency increases with data | Add composite index `by_session_and_status` | 100+ concurrent users across multiple sessions |
| `useQuery` refetch interval = 1s | Excessive Convex reads, battery drain | Use Convex subscriptions (auto-update); refetch on focus/reconnect only | 15 volunteers × 60s = 900 queries/min |
| Store full queue history in single table | Query scans historical + active entries | Archive completed entries to `queueHistory` table after 24h; query active only | >1000 total queue entries |
| Large payload mutations (base64 images) | Mutation timeout (>180s limit), memory spike | Upload images to Convex Storage, store URL in mutation; use file API | Images >500KB per submission |
| No pagination for queue history | Mobile app OOM on old devices | Paginate historical views (20 entries/page); infinite scroll for volunteer dashboard | >200 entries loaded simultaneously |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| No authentication for service users | Impersonation (malicious user adds others to queue) | Phone verification with OTP; rate-limit submissions per number (max 2 loads/event) |
| Volunteer QR codes never expire | Stolen/leaked QR grants permanent queue-adding ability | Expire QR codes after event ends; rotate daily; tie to active session only |
| Publicly readable queue table | Privacy violation (exposes phone numbers, living situation) | Convex query validation: Require `ctx.auth` or session-scoped access; redact PII in volunteer views |
| Unvalidated mutation args | Injection attacks, data corruption | Use Convex `args: { phoneNumber: v.string(), ... }` validators on all public functions |
| Client-side only queue position calculation | Race conditions, malicious position manipulation | Server-authoritative position assignment; reject client-provided positions |
| No rate limiting on intake form | Spam/DoS attack (fill queue with fake users) | Max 3 submissions per phone number per hour; CAPTCHA after 2nd submission |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No offline indicator | Users don't know why app isn't working | Prominent banner: "Offline mode—limited functionality"; show queued mutations count |
| Exact countdown timers (23:42 remaining) | Users expect second-level precision, complain when drift occurs | Show approximate ranges: "20-25 minutes remaining" or "~23 min" with tilde |
| Silent mutation failures | Users think they're in queue but aren't | Toast on error: "Failed to add—please try again"; visual retry button |
| No queue position change explanation | User sees position jump from 5 to 3, confused | Show notification: "2 users removed from queue—you moved up!" |
| Timers continue after user removed | Confusion, wasted volunteer time | Auto-cancel timer when user removed; archive timer state for audit trail |
| No volunteer assignment visibility | Service users don't know who helped them | Show volunteer name + photo in queue entry: "Assisted by Maria" |
| Identical UI for service users vs volunteers | Users access admin functions accidentally | Completely separate navigation flows; role locked after selection until app restart |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Offline Mode**: Often missing conflict resolution for duplicate mutations after prolonged outage—verify 30-min offline test with 10+ queued operations
- [ ] **Timer System**: Often missing server-side countdown source, relying on client `Date.now()` calculation—verify timers stay synced across 5 devices for 23 minutes
- [ ] **Google Sheets Integration**: Often missing exponential backoff retry logic and DLQ for failed syncs—verify 429 error handling with 50 rapid updates
- [ ] **Queue Position Logic**: Often missing optimistic locking for concurrent remove operations—verify race condition test with 5 simultaneous removals
- [ ] **Phone Verification**: Often missing OTP expiration and rate limiting—verify 10-minute expiry and max 3 OTPs per number per hour
- [ ] **Multi-Session Support**: Often missing session isolation in queries—verify volunteer in Location A can't see Location B's queue
- [ ] **Push Notifications**: Often missing token refresh logic and invalid token error handling—verify tokens expire and refresh gracefully
- [ ] **QR Code Scanner**: Often missing format validation and malformed code error handling—verify app doesn't crash on random QR codes

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Rate-limited Google Sheets API | **MEDIUM** (30-60 min) | 1. Enable exponential backoff in webhook code; 2. Manually flush DLQ via admin UI; 3. Batch flush queued updates (max 5/min); 4. Monitor 429 errors for 1 hour |
| Duplicate queue positions | **LOW** (5-10 min) | 1. Run migration to recalculate positions server-side; 2. Mutation: `queue.forEach((e, i) => patch(e._id, {position: i+1}))`; 3. Add optimistic locking to prevent recurrence |
| Offline mutations orphaned | **HIGH** (manual data entry) | 1. Export queued mutations from IndexedDB; 2. Manual CSV import to Convex; 3. Deduplicate by `phoneNumber + timestamp`; 4. Notify affected users |
| Timer desync across devices | **LOW** (realtime fix) | 1. Deploy server-authoritative timer patch; 2. Force refresh all clients via version check; 3. No data migration needed |
| Unindexed queries causing timeout | **MEDIUM** (schema migration) | 1. Add index in Convex schema; 2. Deploy (auto-backfill); 3. Update queries to use `.withIndex()`; 4. Backfill takes ~1 min per 10k docs |
| Optimistic UI without rollback | **MEDIUM** (code refactor) | 1. Add rollback logic to all mutations (1-2 hours); 2. Test with network failure scenarios; 3. Deploy during low-traffic window |
| Missing session isolation | **HIGH** (data model change) | 1. Add `sessionId` to all tables; 2. Backfill historical data with session assignment; 3. Update all queries with session filter; 4. Migration risk: 2-4 hours |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Convex offline limitations | Phase 1 (Offline Strategy) | 30-min airplane mode test with read/write operations; verify IndexedDB persistence |
| Timer drift | Phase 2 (Timer System) | 23-min timer across 5 devices with manual clock adjustments; verify <2s variance |
| Google Sheets rate limits | Phase 3 (External Integrations) | Load test: 50 queue updates in 60s; verify batching prevents 429 errors |
| Queue position race conditions | Phase 2 (Queue Logic) | Concurrent mutation test: 5 simultaneous removals; verify position integrity |
| Optimistic UI without rollback | Phase 1 (State Management) | Network failure test: Toggle airplane mode during mutation; verify rollback |
| Unindexed query performance | Phase 2 (Query Optimization) | Load 1000 queue entries; verify `getActiveQueue()` <300ms p95 latency |
| Multi-device stale state | Phase 2 (Real-Time Sync) | Simultaneous actions on 2 devices; verify sync within 2 seconds |
| Missing offline fallback plan | Phase 1 (Emergency Planning) | 30-min full outage test; verify paper backup workflow documented |

---

## Sources

**Convex & Real-Time Sync:**
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [Going local-first with Automerge and Convex](https://stack.convex.dev/automerge-and-convex)
- [Compare the Best Real-Time Databases](https://stack.convex.dev/best-real-time-databases-compared)

**Offline-First Architecture:**
- [Offline-First Mobile App Architecture](https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-518n)
- [Offline-first frontend apps in 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Build an offline-first app - Android Developers](https://developer.android.com/topic/architecture/data-layer/offline-first)

**Timer Synchronization:**
- [Android TrustedTime API](https://android-developers.googleblog.com/2025/02/trustedtime-api-introducing-reliable-approach-to-time-keeping-for-apps.html)
- [Time Synchronization in Distributed Systems](https://medium.com/distributed-knowledge/time-synchronization-in-distributed-systems-a21808928bc8)

**Google Sheets Integration:**
- [Google Sheets API Usage Limits](https://developers.google.com/workspace/sheets/api/limits)
- [Webhook Retry Best Practices](https://www.svix.com/resources/webhook-best-practices/retries/)
- [Handling failed webhooks with Exponential Backoff](https://medium.com/wellhub-tech-team/handling-failed-webhooks-with-exponential-backoff-72d2e01017d7)

**Race Conditions & State Management:**
- [Handling Race Condition in Distributed System](https://www.geeksforgeeks.org/computer-networks/handling-race-condition-in-distributed-system/)
- [The Art of Staying in Sync](https://medium.com/@alexglushenkov/the-art-of-staying-in-sync-how-distributed-systems-avoid-race-conditions-f59b58817e02)
- [State Management in 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)

**Optimistic UI:**
- [Optimistic UI Pitfalls and Best Practices](https://javascript.plainenglish.io/optimistic-ui-in-frontend-architecture-do-it-right-avoid-pitfalls-7507d713c19c)
- [React 19 useOptimistic Deep Dive](https://dev.to/a1guy/react-19-useoptimistic-deep-dive-building-instant-resilient-and-user-friendly-uis-49dp)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/v4/docs/react/guides/optimistic-updates)

**Performance at Scale:**
- [Mobile App Performance Metrics](https://www.plotline.so/blog/mobile-app-performance-metrics-essential-kpis-to-track)
- [Performance Testing for Concurrent Users](https://cursa.app/en/page/performance-testing-for-mobile-apps-handling-concurrent-users-in-mobile-apps)

**Queue Management Best Practices:**
- [12 Dos and Don'ts of Effective Queuing](https://www.qminder.com/blog/queue-management/dos-donts-effective-queuing/)
- [Queue Management System Complete Guide](https://vizman.app/resources/blogs/queue-management-system-complete-guide-for-2026/)

---

*Pitfalls research for: Queuert - Real-time queue management with offline capabilities*
*Researched: 2026-01-23*
*Confidence: MEDIUM-HIGH (verified with official docs and 2025-2026 sources)*
