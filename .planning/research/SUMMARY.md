# Project Research Summary

**Project:** Queuert - Mobile Queue Management System
**Domain:** Real-time queue management with offline support for service industries
**Researched:** 2026-01-23
**Confidence:** HIGH

## Executive Summary

Queuert is a real-time mobile queue management system for Laundry Love events serving people experiencing homelessness. Based on comprehensive research, the recommended approach is **Convex-native real-time sync with strategic offline caching**, prioritizing dignity-centered UX over feature completeness. The stack is already 60% implemented (Convex backend, Expo framework, React Native Paper UI), and the core challenge is connecting these pieces with proper real-time subscriptions, server-side timer management, and selective offline support.

The architecture should follow Convex's reactive query pattern: UI subscribes via `useQuery` hooks, mutations trigger automatic cross-device updates via WebSocket, and server-side scheduled functions manage timer expiration. Critical differentiators include no-authentication-barrier (phone-only), timer-centric workflow (23-minute wash cycles), and multi-language support (Spanish essential for MVP). The primary risk is **offline mode complexity** — research confirms Convex lacks native offline-first support, requiring IndexedDB caching layer for read-only volunteer queue viewing during connectivity issues.

The roadmap should prioritize establishing real-time infrastructure first (Phase 1), then core timer logic (Phase 2), followed by external integrations (Phase 3+). Avoid the temptation to build offline-write capabilities early — validate that connectivity is actually a blocker with real events before investing in complex CRDT-based sync. Google Sheets integration must use batching (60-second intervals) to avoid rate limits, and timer synchronization must be server-authoritative to prevent multi-device drift.

## Key Findings

### Recommended Stack

Research confirms the existing stack is well-chosen for real-time queue management, with key additions needed for production readiness:

**Core technologies:**
- **Convex React Hooks (^1.31.6)**: Built-in WebSocket subscriptions, automatic consistency guarantees, mutation retry logic. Already installed. Use `useQuery` for reactive data, `useMutation` for queue operations.
- **react-native-mmkv (v4 Nitro)**: 30x faster than AsyncStorage, synchronous API for instant cache reads. Critical for read-only offline queue viewing during spotty connectivity. Requires `npx expo prebuild` for native module.
- **expo-camera (~17.0.10)**: Native barcode scanning via Google Code Scanner (Android) and DataScannerViewController (iOS 16+). expo-barcode-scanner is deprecated.
- **react-i18next + expo-localization (16.5.3 + SDK 54)**: React 19 compatible, standard for Expo apps. Spanish support is table stakes for LA/SF events; Portuguese/Haitian Creole defer to v1.x.
- **expo-notifications (0.32.16)**: Native FCM/APNs integration for volunteer wash completion alerts. Requires EAS Build (not Expo Go) for SDK 54.

**Backend-only libraries:**
- **googleapis (^170.1.0)**: Google Sheets v4 API with service account auth for batch exports. Backend Convex actions only — never client-side (credential exposure risk).

**Key version compatibility notes:**
- react-native-mmkv v4 has known Android build issues on Expo SDK 54 (GitHub Issue #38991). Monitor during setup; if blocked, temporarily use AsyncStorage (accept performance hit).
- expo-notifications requires EAS Build and physical devices (not emulators).

### Expected Features

Research identified a clear MVP boundary balancing table stakes vs competitive differentiation:

**Must have (table stakes):**
- Real-time queue position visibility — Industry standard in 2026, users expect to see their place in line with live updates
- SMS notifications for "your turn" — 65%+ of US customers prefer virtual queuing with mobile alerts
- Timer management (23-minute default) — Core value prop for timed services; competitors focus on generic queuing
- Volunteer queue dashboard — View all users, statuses, start/stop timers with cross-device sync
- Multi-language (English + Spanish) — Spanish is critical for LA/SF events serving homeless populations
- Multi-channel check-in — QR scan OR manual volunteer entry for users without phones

**Should have (competitive differentiation):**
- No authentication barrier — Phone number only, no password. Competitors require accounts (exclusion for homeless population)
- Welcome back recognition — Pre-fill intake data for returning guests. Shows dignity/respect, uncommon in free service contexts
- Volunteer QR code assignment — Track which volunteer registered which guest for accountability + appreciation
- Offline-first operation — Critical for events with spotty connectivity, but validate need first (complex architecture change)

**Defer (v2+):**
- Estimated wait time calculation — Requires historical timer data; add when "how long?" questions increase
- Push notifications (in addition to SMS) — SMS costs add up, but push requires EAS Build setup first
- Google Sheets integration — Laundry Love wants existing reporting workflow, but batch export (not real-time) is sufficient
- Additional languages (Portuguese, Haitian Creole) — Trigger: Specific location requests

**Anti-features to avoid:**
- Appointment scheduling — Laundry Love is walk-in only; appointments imply scarcity vs abundance mindset
- User accounts with passwords — Barrier for homeless population without stable email
- AI-powered queue optimization — Introduces bias risk; FIFO with manual override only
- Gamification (points, rewards) — Inappropriate for service context; focus on clarity and respect

### Architecture Approach

Research recommends **Convex-native reactive architecture** with server-side timer management and selective offline caching. The pattern follows Convex best practices: thin query/mutation wrappers with business logic extracted to pure functions in `convex/model/`.

**Major components:**

1. **State Sync Layer** — Convex React hooks (`useQuery`/`useMutation`) with automatic WebSocket subscriptions. UI updates when any client modifies queue (no manual polling). Optional: Legend-State or TinyBase for read-only offline cache (defer to Phase 3 pending validation).

2. **Backend Functions Layer** — Convex queries (read operations with indexes), mutations (transactional writes), actions (external API calls), and scheduled functions (server-side timer checks every 10s). Separate concerns: `convex/queries/`, `convex/mutations/`, `convex/actions/`, `convex/model/` (pure business logic).

3. **Timer Management** — Server-authoritative countdown. Store `timerStartedAt` + `timerDuration` in database, calculate remaining time client-side from server timestamp. Scheduled function (`checkExpiredTimers`) runs every 10 seconds to detect expiration and update status flags. Avoids timer drift across devices (critical pitfall).

4. **External Integrations** — Convex actions (non-transactional) for Google Sheets batch exports (60s intervals), SMS notifications (Twilio/SNS when timer expires), push notifications (FCM/APNS HTTP API). Use `ctx.scheduler.runAfter()` to decouple side effects from database mutations.

5. **Offline Strategy** — Read-only cache for volunteers (IndexedDB via react-native-mmkv). Service users require network for intake form submission. If mutation fails offline, show clear error ("Network required—please try again") with retry button. Don't implement write queuing early (complex, high conflict risk).

**Key architectural patterns:**
- **Server-side timers** — Timer state lives in database, scheduled functions check expiration, clients display derived countdown. Perfect sync across devices, works when clients offline.
- **Reactive subscriptions** — `useQuery` creates WebSocket subscription, automatic updates when any client mutates queue. No manual refetch or cache invalidation.
- **Index-first querying** — All filters use `.withIndex()` for performance (e.g., `by_session_status` composite index). Avoid `.filter()` without index (scans full table).
- **Optimistic UI with rollback** — Mutations feel instant but must implement error handling to revert local state on failure (broken rollback worse than no optimistic updates).

### Critical Pitfalls

Research identified 8 critical pitfalls with clear prevention strategies:

1. **Convex lacks native offline-first support** — Developers assume real-time sync includes offline mode. It doesn't. Convex queues mutations offline but doesn't cache query results. Add explicit IndexedDB layer for read-only volunteer queue viewing. Test 30-minute full-offline scenario in Phase 1, not Phase 3 (architectural, can't bolt on later).

2. **Timer drift destroys trust** — Client-side countdown using `Date.now()` drifts independently per device. Over 23 minutes, devices differ by 2+ minutes, causing users to miss loads. Use server-authoritative timers: store `timerStartedAt` in database, scheduled function checks expiration, clients display server's countdown. Verify across 5 devices for full 23-minute cycle.

3. **Google Sheets rate limits at 15-20 queue updates** — Naive webhook pattern (`onQueueUpdate → Sheets.append()`) exceeds 300 req/min quota. With 20 simultaneous events, hits 1000 req/min. Batch writes every 60 seconds (max 5 batches/min = 25 req/min for 5 events). Implement exponential backoff + dead letter queue for failed syncs.

4. **Race conditions in queue position recalculation** — Two volunteers remove different users simultaneously. Without optimistic locking, both read same queue state, write conflicting positions. Result: duplicate position numbers or gaps. Use single mutation pattern for batch updates (Convex transaction guarantees consistency within mutation).

5. **Optimistic UI without rollback breaks trust** — User submits intake, sees "Added to queue! Position #7" instantly. Mutation fails (network hiccup). User thinks they're in queue but aren't. Must implement rollback: store previous state snapshot in `onMutate`, revert in `onError`. Test with intentional network failures (airplane mode toggle).

6. **Unindexed queries degrade at 100 users** — MVP works with 10 users. First event hits 80 users, queue screen takes 5+ seconds. Root cause: `getActiveQueue()` scans entire table without `.withIndex()`. Create composite indexes (`by_session_and_status`) and use in all queries. Load test with 1000 entries, verify p95 latency <300ms.

7. **Stale state in multi-tab/multi-device scenarios** — Volunteer opens app on phone and tablet. Starts timer on phone, tablet still shows "waiting" for 30+ seconds. Root cause: wrapping Convex `useQuery` in React Query with manual refetch control breaks reactivity. Use Convex hooks directly, trust built-in subscriptions. Test simultaneous actions from 2 devices, verify sync within 2 seconds.

8. **Missing emergency offline fallback plan** — Event day, venue WiFi crashes, cellular spotty. Convex mutations queue but never send. Volunteers can't add users. Paper backup doesn't exist. Event grinds to halt. Document graceful degradation in volunteer training, print emergency paper forms (PDF generation in app), add "Manual Sync" button. Test 30-minute full outage with 10 queued operations.

## Implications for Roadmap

Based on research, suggested phase structure prioritizes risk mitigation and dependency ordering:

### Phase 1: Core Real-Time Infrastructure
**Rationale:** Foundation for all features. De-risk WebSocket connectivity and offline strategy before building business logic. Convex real-time sync is architectural — can't bolt on later.

**Delivers:**
- Convex React hooks wired into app root layout (ConvexProvider)
- Reactive queue subscriptions for volunteer dashboard and service user position view
- Offline strategy decision (read-only cache vs full local-first)
- Optimistic UI with rollback for all mutations

**Addresses from FEATURES.md:**
- Real-time queue position visibility (table stakes)
- State management foundation for all features

**Avoids from PITFALLS.md:**
- Pitfall 1: Convex offline limitations (test 30-min offline scenario early)
- Pitfall 5: Optimistic UI without rollback (implement rollback pattern before building features)
- Pitfall 8: Missing offline fallback (establish emergency plan before first event)

**Research flag:** Phase 1 needs offline strategy validation with real event testing before committing to local-first complexity.

---

### Phase 2: Server-Side Timer System
**Rationale:** Core business logic. Depends on Phase 1 reactive queries for cross-device sync. Timer architecture must prevent drift from day one (can't retrofit server-authoritative design).

**Delivers:**
- `startTimer` mutation with server timestamp storage
- Scheduled function (`checkExpiredTimers`) running every 10 seconds
- Client-side countdown display derived from server `timerStartedAt`
- Timer completion triggers status transition ("washing" → "ready_to_remove")

**Uses from STACK.md:**
- Convex scheduled functions (cron jobs every 10s)
- Convex indexes (`by_session_status` for efficient timer queries)

**Implements from ARCHITECTURE.md:**
- Server-authoritative timer pattern with scheduled function expiration checks
- Pure timer logic extracted to `convex/model/timerLogic.ts`

**Avoids from PITFALLS.md:**
- Pitfall 2: Timer drift across devices (server-authoritative prevents clock drift)
- Pitfall 6: Unindexed queries (add composite indexes before scale testing)

**Research flag:** Standard Convex pattern, well-documented. Skip research-phase; implement directly.

---

### Phase 3: Queue Operations & Position Management
**Rationale:** Builds on Phases 1-2 (reactive sync + timer logic). Queue position recalculation requires transaction isolation to prevent race conditions.

**Delivers:**
- `removeFromQueue` mutation with position recalculation
- `repositionQueue` mutation for manual drag-to-reorder
- Volunteer admin screens with queue management controls
- Confirmation dialogs for destructive actions (remove, cancel timer)

**Addresses from FEATURES.md:**
- Volunteer queue dashboard (table stakes)
- Multi-channel check-in (QR scan or manual entry)

**Implements from ARCHITECTURE.md:**
- Single mutation pattern for batch position updates (transaction consistency)
- Optimistic locking to prevent race conditions

**Avoids from PITFALLS.md:**
- Pitfall 4: Race conditions in position recalculation (use optimistic concurrency control)
- Pitfall 7: Stale state multi-device (test simultaneous actions from 2 devices)

**Research flag:** Standard queue management pattern. Skip research-phase.

---

### Phase 4: Service User Intake & Onboarding
**Rationale:** Depends on Phase 3 queue operations (intake form auto-adds to queue). Multi-language support is table stakes but can implement concurrently with earlier phases.

**Delivers:**
- Intake form screens with validation (phone, name, loads, living situation)
- Multi-language support (English + Spanish for MVP)
- Phone number as primary key (no authentication barrier)
- Welcome back recognition (optional: pre-fill from previous intake)

**Uses from STACK.md:**
- react-i18next + expo-localization for Spanish translations
- AsyncStorage for language preference persistence

**Addresses from FEATURES.md:**
- Multi-language interface (English + Spanish table stakes)
- No authentication barrier (competitive differentiator)
- Welcome back recognition (should have, defer if time-constrained)

**Research flag:** i18n is well-documented Expo pattern. Skip research-phase. Translation quality for Spanish requires professional service or native speaker validation.

---

### Phase 5: External Integrations (Notifications & Export)
**Rationale:** External dependencies that can fail independently of core app. SMS critical for MVP ("your turn" notification); Sheets export and push notifications defer to v1.x if time-constrained.

**Delivers:**
- SMS notifications via Twilio/SNS when timer expires
- Google Sheets batch export (60-second intervals, exponential backoff)
- Push notification setup (optional: requires EAS Build, physical devices)
- Dead letter queue for failed Sheets syncs

**Uses from STACK.md:**
- googleapis in Convex actions (backend only, service account credentials)
- expo-notifications (requires EAS Build for SDK 54)

**Addresses from FEATURES.md:**
- SMS notifications (table stakes — 65% of users expect this)
- Google Sheets integration (defer if batch export sufficient)
- Push notifications (should have, but SMS more critical)

**Avoids from PITFALLS.md:**
- Pitfall 3: Google Sheets rate limits (batch writes every 60s, max 5 req/min)
- Integration gotchas: Send SMS in scheduled action, not mutation (async side effect)

**Research flag:** Phase 5 needs Google Sheets API research for batching patterns and Twilio/SNS integration patterns. Use `/gsd:research-phase` for integration specifics.

---

### Phase 6: QR Code Scanning & Session Management
**Rationale:** User-facing features that depend on stable core functionality. QR scanning is volunteer check-in flow; session management enables multi-location support.

**Delivers:**
- QR code camera integration with expo-camera
- Volunteer QR code generation (tied to active session)
- Session lifecycle (create, assign volunteers, generate codes, end)
- Session isolation (Location A can't see Location B's queue)

**Uses from STACK.md:**
- expo-camera with `barcodeScannerSettings={{ barcodeTypes: ["qr"] }}`
- Camera permissions handling for iOS/Android

**Addresses from FEATURES.md:**
- Volunteer QR code assignment (competitive differentiator)
- Session management (enables multi-location events)

**Research flag:** expo-camera QR scanning is standard pattern. Skip research-phase. Format validation needed (verify QR contains expected volunteer ID, handle malformed codes gracefully).

---

### Phase 7: Offline Mode Enhancement (Optional)
**Rationale:** Validate connectivity is actually a blocker with real events before investing in complex offline-write capabilities. Read-only cache in Phase 1 may be sufficient.

**Delivers:**
- Legend-State or TinyBase offline cache for read-only volunteer queue viewing
- Sync status indicators ("Offline mode—limited functionality" banner)
- Offline → online transition handling with conflict detection

**Uses from STACK.md:**
- react-native-mmkv for synchronous cache reads (30x faster than AsyncStorage)
- IndexedDB persistence via Legend-State

**Addresses from FEATURES.md:**
- Offline-first operation (competitive differentiator, but high complexity)

**Avoids from PITFALLS.md:**
- Pitfall 1: Convex offline limitations (IndexedDB caching layer required)

**Research flag:** Phase 7 needs deep research on Legend-State vs TinyBase tradeoffs and CRDT-based conflict resolution. Use `/gsd:research-phase` if validated as critical.

---

### Phase Ordering Rationale

- **Real-time infrastructure first (Phase 1):** Convex reactive subscriptions are architectural — can't bolt on later. Offline strategy decision impacts all subsequent phases.
- **Timer system early (Phase 2):** Server-authoritative timer design prevents drift. Retrofitting client-side timers to server-side is painful.
- **Queue operations before intake (Phase 3 → Phase 4):** Intake form auto-adds to queue, so queue mutations must exist first.
- **External integrations late (Phase 5):** SMS/Sheets/push can fail independently of core app. Implement after core functionality stable.
- **Offline mode last (Phase 7):** Complex, high risk. Validate need with real events before investing. Read-only cache in Phase 1 may suffice.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 5 (External Integrations):** Google Sheets batching patterns, Twilio/SNS rate limits, exponential backoff implementation. Use `/gsd:research-phase` for integration-specific patterns.
- **Phase 7 (Offline Mode):** Legend-State vs TinyBase evaluation, CRDT conflict resolution, Automerge + Convex integration. Only research if validated as critical after Phase 1-6 deployed.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Real-Time Infrastructure):** Convex React hooks well-documented, standard Expo setup.
- **Phase 2 (Timer System):** Convex scheduled functions standard pattern, official docs comprehensive.
- **Phase 3 (Queue Operations):** Transaction patterns standard, Convex MVCC well-documented.
- **Phase 4 (Intake & i18n):** react-i18next standard Expo pattern, locale detection straightforward.
- **Phase 6 (QR & Sessions):** expo-camera barcode scanning well-documented, session CRUD straightforward.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Convex + Expo well-documented, version compatibility verified. react-native-mmkv v4 has known Android build issues on SDK 54 (monitor GitHub Issue #38991). |
| Features | **MEDIUM** | Industry analysis solid (queue management table stakes clear), but homeless population UX requires validation. Spanish translation quality needs professional service. |
| Architecture | **HIGH** | Convex reactive patterns verified from official docs. Server-side timer architecture confirmed by multiple sources. Offline-first complexity well-researched (Automerge + Convex integration pattern exists). |
| Pitfalls | **MEDIUM-HIGH** | Critical pitfalls (timer drift, rate limits, race conditions) verified from official docs and 2025-2026 sources. Offline failure scenarios extrapolated from community patterns (not Queuert-specific testing). |

**Overall confidence:** **HIGH**

Research is comprehensive and actionable. Primary uncertainty: **offline mode complexity vs necessity tradeoff** — won't know if read-only cache suffices until validated with real events. Recommend Phase 1 offline testing to de-risk before committing to full local-first architecture.

### Gaps to Address

Areas where research was inconclusive or needs validation during implementation:

- **Offline mode necessity:** Research confirms Convex lacks native offline support and IndexedDB layer is required. But is read-only cache sufficient, or do volunteers need write capabilities offline? Validate with connectivity testing at real events before investing in CRDT-based sync. Mitigation: Phase 1 includes 30-min offline test; defer complex write queuing until proven necessary.

- **Spanish translation quality:** react-i18next library is well-documented, but Haitian Creole support unverified (no specific documentation found). Spanish/Portuguese likely easier with professional translation services. Mitigation: Budget for professional translation service or native speaker validation during Phase 4.

- **react-native-mmkv v4 on Expo SDK 54:** Known Android build issues per GitHub Issue #38991. If installation fails, fallback to AsyncStorage for offline cache (accept performance hit). Mitigation: Test MMKV installation immediately in Phase 1; monitor issue for resolution.

- **Google Sheets vs alternatives:** PRD specifies Google Sheets, but at scale (5K+ users, multiple locations), rate limits (300 req/min) may force migration to BigQuery or Airtable. Research confirms batching prevents limits for current scope (100 users, 15 volunteers). Mitigation: Implement Sheets with batching in Phase 5, reassess at 1000+ user milestone.

- **Twilio SMS costs at scale:** Research confirms SMS is table stakes (65% of users prefer mobile alerts). But at $0.0075/SMS × 100 users × 20 events/month = $150/month for nonprofit. May require push notification migration to reduce costs. Mitigation: Track SMS costs in Phase 5, add push notifications if costs exceed budget.

## Sources

### Primary (HIGH confidence)

**Convex Architecture & Patterns:**
- [Convex Overview](https://docs.convex.dev/understanding/) — System architecture, consistency guarantees
- [Best Practices | Convex Developer Hub](https://docs.convex.dev/understanding/best-practices/) — Index-first querying, Date.now() pitfalls
- [Convex React Hooks](https://docs.convex.dev/client/react) — useQuery/useMutation patterns
- [Cron Jobs | Convex Developer Hub](https://docs.convex.dev/scheduling/cron-jobs) — Scheduled function patterns for timers
- [Going local-first with Automerge and Convex](https://stack.convex.dev/automerge-and-convex) — CRDT-based offline sync pattern

**Expo & React Native:**
- [Expo Camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/) — Version compatibility, QR barcode scanning
- [Expo Push Notifications Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/) — SDK 54 requirements, EAS Build
- [Local-first architecture with Expo](https://docs.expo.dev/guides/local-first/) — Offline strategies, Legend-State integration

**External Integrations:**
- [Google Sheets API Limits](https://developers.google.com/workspace/sheets/api/limits) — Rate limits (300 req/min), quota management
- [Google Sheets API Node.js Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs) — Service account auth pattern

**Mobile Performance:**
- [react-native-mmkv GitHub](https://github.com/mrousavy/react-native-mmkv) — Performance benchmarks (30x AsyncStorage), v4 Nitro setup
- [Expo SDK 54 MMKV Issue #38991](https://github.com/expo/expo/issues/38991) — Known Android build compatibility problem

### Secondary (MEDIUM confidence)

**Queue Management Industry:**
- [Queue Management Systems 2026 Guide](https://thecxlead.com/tools/best-queue-management-system/) — Competitor analysis (Qminder, Waitwhile, Qless)
- [Best Queue Management Systems 2026](https://queuehub.app/best-queue-management-systems-and-software/) — Feature expectations, pricing models
- [12 Dos and Don'ts of Effective Queuing](https://www.qminder.com/blog/queue-management/dos-donts-effective-queuing/) — Industry best practices, anti-patterns

**Timer Synchronization:**
- [Android TrustedTime API](https://android-developers.googleblog.com/2025/02/trustedtime-api-introducing-reliable-approach-to-time-keeping-for-apps.html) — Clock drift prevention (Android only, iOS lacks equivalent)
- [Syncing Countdown Timers Across Clients](https://medium.com/@flowersayo/syncing-countdown-timers-across-multiple-clients-a-subtle-but-critical-challenge-384ba5fbef9a) — Distributed timer patterns

**State Management & Optimistic UI:**
- [Optimistic UI Pitfalls](https://javascript.plainenglish.io/optimistic-ui-in-frontend-architecture-do-it-right-avoid-pitfalls-7507d713c19c) — Rollback patterns, error handling
- [React 19 useOptimistic Deep Dive](https://dev.to/a1guy/react-19-useoptimistic-deep-dive-building-instant-resilient-and-user-friendly-uis-49dp) — React 19 patterns
- [TanStack Query Optimistic Updates](https://tanstack.com/query/v4/docs/react/guides/optimistic-updates) — Rollback implementation

**Integration Patterns:**
- [Webhook Retry Best Practices](https://www.svix.com/resources/webhook-best-practices/retries/) — Exponential backoff + jitter
- [Handling Webhook Failures with Exponential Backoff](https://medium.com/wellhub-tech-team/handling-failed-webhooks-with-exponential-backoff-72d2e01017d7) — Retry strategies

### Tertiary (LOW confidence, needs validation)

- **Haitian Creole i18n support:** No specific documentation found. react-i18next supports any language, but translation quality depends on manual files. Requires professional translation service or native speaker validation.
- **Web QR scanning reliability:** Multiple sources report expo-camera barcode scanning on web is unreliable (QR only, often fails in browsers). Test on physical iOS/Android devices; web not primary platform.
- **Offline mutation conflict resolution:** Community patterns suggest last-write-wins for simple fields, user-assisted for complex conflicts. Not Queuert-specific testing; requires validation with real multi-device scenarios.

---

*Research completed: 2026-01-23*
*Ready for roadmap: Yes*
*Next step: Requirements definition and roadmap creation*
