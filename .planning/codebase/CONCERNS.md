# Codebase Concerns

**Analysis Date:** 2026-01-23

## Tech Debt

### Unimplemented Backend Integration
- **Issue:** All Convex hooks (useQuery, useMutation) are defined in schema and functions but not connected to UI components. Navigation screens call simulated APIs instead of real Convex backend.
- **Files:**
  - `components/provider/navigation/RootNavigator.tsx` (lines 47-51: setTimeout simulation instead of Convex call)
  - `components/provider/screens/VerificationScreen.tsx` (lines 47-51: setTimeout instead of actual verification)
  - `components/provider/screens/LaundryStatusScreen.tsx` (lines 37-55: local timer instead of backend sync)
  - `components/provider/screens/RegistrationFormScreen.tsx` (lines 52-67: setTimeout instead of submitIntakeForm mutation)
- **Impact:** Application cannot persist data. All user input is lost on navigation. Queue positions are hardcoded. Sessions and intake forms never reach database.
- **Fix approach:**
  1. Install Convex React hooks: `useQuery()` and `useMutation()` from `convex/react`
  2. Replace all setTimeout calls with actual mutations (submitIntakeForm, startTimer, removeFromQueue)
  3. Replace all hardcoded data with queries (getActiveQueue, getUserQueuePosition, getActiveSession)
  4. Add error handling for network failures

### QR Code Scanning Not Implemented
- **Issue:** QR code scanner generates simulated UUID instead of scanning real codes. Production requires `expo-camera` and barcode decoding library.
- **Files:** `components/provider/screens/QRCodeScannerScreen.tsx` (lines 26-29: handleSimulatedScan)
- **Impact:** Volunteers cannot identify themselves. QR code tracking for intake form auditing is impossible. Queue assignment to volunteers fails.
- **Fix approach:**
  1. Install `expo-camera` and `@react-native-camera/camera` or similar
  2. Replace placeholder frame rendering with real camera preview
  3. Integrate barcode decoding library (zbar or similar)
  4. Map scanned code to volunteer user via `volunteers.qrCode` field lookup in Convex

### Phone Verification Not Implemented
- **Issue:** Verification screen accepts any 6-digit code without validation. No OTP generation or SMS sending infrastructure exists.
- **Files:** `components/provider/screens/VerificationScreen.tsx` (lines 43-51: handleVerify always succeeds)
- **Impact:** No authentication barrier. Anyone can impersonate any user. Service providers and volunteers cannot be securely identified.
- **Fix approach:**
  1. Choose SMS provider (Twilio, AWS SNS, Firebase, etc.)
  2. Create Convex mutation to generate and store OTP (with expiry)
  3. Create Convex mutation to validate OTP
  4. Replace timeout in VerificationScreen with actual mutation call
  5. Return authentication token/session on successful verification

### Zustand Store Not Integrated
- **Issue:** Zustand v5 installed but not connected. Navigation state managed via React useState in RootNavigator instead of global state management. State lost on component remounts.
- **Files:**
  - `package.json` (line 42: zustand dependency)
  - `components/provider/navigation/RootNavigator.tsx` (lines 25-38: manual state management)
- **Impact:** Cannot share state across screens. Form data not persisted during navigation. Difficult to implement logout/session recovery. Testing navigation state is fragile.
- **Fix approach:**
  1. Create store at `store/navigationStore.ts` with Zustand
  2. Create store at `store/userStore.ts` for authenticated user data
  3. Replace useState in RootNavigator with useStore hooks
  4. Persist stores to AsyncStorage for offline support

### No Error Handling or Retry Logic
- **Issue:** No try/catch blocks in any Convex functions or screen components. Network failures, validation errors, and race conditions have no handling.
- **Files:**
  - All Convex functions in `convex/intake.ts`, `convex/queue.ts`, `convex/sessions.ts` have no error boundaries
  - All screen components have no error states
  - LaundryStatusScreen timer has no protection against negative values
- **Impact:** Silent failures. Users don't know when something goes wrong. Incomplete queue operations leave data inconsistent. Timer countdowns can show negative times.
- **Fix approach:**
  1. Add error state to all screens
  2. Add try/catch with user-facing error messages
  3. Implement exponential backoff for failed Convex mutations
  4. Add validation in Convex handlers (check if user exists, session is active, etc.)

## Known Bugs

### LaundryStatusScreen Timer Calculation Error
- **Symptoms:** Progress bar width calculation uses string parsing that could fail. Timer display shows "0:00" when complete but doesn't trigger completion callback.
- **Files:** `components/provider/screens/LaundryStatusScreen.tsx` (lines 120-137: complex inline progress calculation)
- **Trigger:** Navigate to LaundryStatusScreen with any machineTimeRemaining value containing colons
- **Workaround:** Timer completes cleanly if code doesn't error, but completion event unreliable
- **Fix:** Extract timer logic to custom hook with proper state machine (idle → running → complete)

### RegistrationFormScreen Living Condition Mismatch
- **Symptoms:** Form allows selection from ["homeless", "transitional", "permanent", "other"] but Convex schema expects ["homeless", "sheltered", "loads"]. Invalid values fail insertion.
- **Files:**
  - `components/provider/screens/RegistrationFormScreen.tsx` (lines 28-32: form options)
  - `convex/scheme.ts` (lines 26-29: schema definition)
- **Trigger:** Submit registration form with "In Transitional Housing" option
- **Impact:** Data cannot be saved to database. Form appears to work but mutations fail silently (no backend integration yet).
- **Fix:** Align form options with schema. Use ["homeless", "sheltered", "loads"] or update schema to match UI

### Interval Memory Leak in VerificationScreen
- **Symptoms:** setInterval in handleResend (lines 54-68) created on every button press but not always cleared if component unmounts
- **Files:** `components/provider/screens/VerificationScreen.tsx` (lines 54-68)
- **Trigger:** Press "Resend code" button then navigate away before countdown reaches 0
- **Impact:** Memory leak, leftover intervals continue firing in background
- **Fix:** Store interval reference in useRef and clear on unmount

### Interval Memory Leak in LaundryStatusScreen
- **Symptoms:** setInterval for timer (lines 37-55) has cleanup function, but if component re-renders unexpectedly, multiple intervals accumulate
- **Files:** `components/provider/screens/LaundryStatusScreen.tsx` (lines 37-55)
- **Trigger:** Component parent forces re-render while timer is running
- **Impact:** Timer runs faster than expected (multiple intervals). CPU usage increases.
- **Fix:** Verify useEffect cleanup runs and no double interval creation (React 18 strict mode testing)

## Security Considerations

### No Input Validation
- **Risk:** User inputs in registration form (names, phone numbers, weights) never validated. Could allow injection, very long strings, or invalid formats to reach database.
- **Files:**
  - `components/provider/screens/RegistrationFormScreen.tsx` (trim() only)
  - `components/provider/screens/PhoneInputScreen.tsx` (no validation)
  - `convex/intake.ts`, `convex/queue.ts`, `convex/sessions.ts` (no input validation)
- **Current mitigation:** TypeScript types on Convex args, but no runtime validation
- **Recommendations:**
  1. Use Convex value validators for all inputs (already partially done in schema)
  2. Add client-side regex validation for phone (E.164 format), names (no special chars), weights (0-999)
  3. Set max string lengths (firstName: 50, lastName: 50, etc.)
  4. Implement rate limiting on phone submissions to prevent enumeration

### No Authentication State Management
- **Risk:** No authentication tokens or session management. Anyone who knows another user's phone number could log in as them (once OTP is implemented).
- **Files:** `components/provider/navigation/RootNavigator.tsx` (no user authentication check)
- **Current mitigation:** OTP not yet implemented, so no login possible
- **Recommendations:**
  1. Implement Convex authentication helpers or custom JWT/session approach
  2. Store auth token in secure AsyncStorage (not plain AsyncStorage)
  3. Add middleware to verify token on every Convex call
  4. Implement session expiry (30 min idle timeout recommended)
  5. Add logout endpoint

### QR Code Not Tied to Volunteer Identity
- **Risk:** QR code is just a UUID with no relationship to volunteer user. Anyone can scan any QR code and claim to be a volunteer.
- **Files:** `convex/scheme.ts` (lines 69-76: volunteers table qrCode field)
- **Current mitigation:** QR scanning not implemented yet
- **Recommendations:**
  1. Associate QR code generation with specific user: `volunteers.userId` must exist and be verified
  2. Check that user has role="volunteer" when accepting QR scans
  3. Rate limit QR code generation per volunteer (prevent enumeration)
  4. Add QR code expiry (8-hour session expiry recommended)

### No Sensitive Data Redaction
- **Risk:** Names and phone numbers logged to console (line 95, 159 in various screens using console.log or alerts)
- **Files:**
  - `components/provider/navigation/RootNavigator.tsx` (line 95: console.log('Resend code'))
  - Convex functions use Date.now() but no structured logging
- **Current mitigation:** Logging only in dev (console.log)
- **Recommendations:**
  1. Never log PII (phone numbers, names) even in dev
  2. Use structured logging service (Sentry, LogRocket) for production
  3. Mask phone numbers if logging: "555-***-1234"
  4. Add access logs to Convex mutations for audit trail

### Hardcoded Sensitive Values
- **Risk:** Default timer value (23 min), default language, default location hardcoded in code and screens
- **Files:**
  - `convex/intake.ts` (line 38: hardcoded timerDuration as milliseconds)
  - `components/provider/navigation/RootNavigator.tsx` (lines 150-154: hardcoded queue position, wait time, machine number)
- **Current mitigation:** No production deployment yet
- **Recommendations:**
  1. Move timer duration to Convex config or environment variable
  2. Fetch session and machine settings from database, not hardcode
  3. Never hardcode user queue position—always query from database

## Performance Bottlenecks

### N+1 Query Problem in getActiveQueue
- **Problem:** getActiveQueue fetches all queue items then loops through each to fetch user and intake data. 10 queue items = 21 database calls (1 + 2*10).
- **Files:** `convex/queue.ts` (lines 15-21)
- **Cause:** No join capability in Convex, so client must fetch related documents manually
- **Current capacity:** Tested with 100 concurrent users; 10 queue items
- **Improvement path:**
  1. Use Convex `expand()` if available in newer SDK versions
  2. Create denormalized queue view with user/intake data cached
  3. Add pagination to limit queue size per query (fetch 20 at a time)
  4. Cache results in Convex for 5-10 seconds

### Timer Not Synced with Backend
- **Problem:** Each client maintains its own timer locally with no server sync. If volunteer restarts app, timer resets. Multiple volunteers see different countdowns for same machine.
- **Files:** `components/provider/screens/LaundryStatusScreen.tsx` (lines 37-55: local setInterval)
- **Cause:** No real-time subscription to queue updates
- **Current capacity:** Works fine with 1 volunteer, breaks with 2+ volunteers monitoring same machine
- **Improvement path:**
  1. Use Convex subscriptions/realtime updates (useQuery auto-updates)
  2. Query queue item every 5 seconds to resync timer with backend
  3. Calculate time remaining as (timerStartedAt + timerDuration - Date.now())
  4. Add drift detection: if local timer and server differ by >2s, jump to server time

### No Pagination in Queue Queries
- **Problem:** getActiveQueue returns entire session queue every time. With 100 users, fetches all 100 documents.
- **Files:** `convex/queue.ts` (lines 4-23)
- **Current capacity:** Breaks above 50-100 concurrent users in one session
- **Scaling path:**
  1. Add limit parameter to getActiveQueue query (e.g., top 20)
  2. Implement cursor-based pagination for scrolling through queue
  3. Separate volunteer view (full queue) from user view (only their position + next 3)

### Avatar/Icon Loading Not Optimized
- **Problem:** Using emoji text instead of images (⛔ ⏱️ 📍) means rendering large text. Scales poorly on low-end devices.
- **Files:**
  - `components/provider/screens/LaundryStatusScreen.tsx` (many lines with emoji)
  - `components/provider/screens/QRCodeScannerScreen.tsx` (emoji)
  - `components/provider/screens/RegistrationFormScreen.tsx` (emoji)
- **Current capacity:** Fine for 60fps on modern devices, stutters on older Android
- **Improvement path:** Replace emoji with SVG icons or proper image assets

## Fragile Areas

### Navigation State Machine
- **Files:** `components/provider/navigation/RootNavigator.tsx`
- **Why fragile:**
  - Hard-coded navigation flow: role → phone → verification → registration → QR → status
  - No guards checking if user already registered
  - Pressing back button allows skipping forward again
  - No way to handle session recovery if app crashes
- **Safe modification:**
  1. Add navigation state machine with explicit allowed transitions
  2. Add route guards that check Convex for user/session state
  3. Implement deep linking to handle crashed sessions
- **Test coverage:** Zero test coverage for navigation. Any change risks breaking flow.

### Intake Form Schema Mismatch
- **Files:**
  - Schema: `convex/scheme.ts` (lines 22-36)
  - UI: `components/provider/screens/RegistrationFormScreen.tsx` (lines 20-26)
  - Mutation: `convex/intake.ts` (lines 6-18)
- **Why fragile:** UI form fields don't match schema. livingCondition enum mismatch will cause runtime errors once backend is connected.
- **Safe modification:** Create shared types file (`types/intake.ts`) and import in both schema and components.
- **Test coverage:** No integration tests. Changes to schema not caught until runtime.

### Timer Logic
- **Files:** `components/provider/screens/LaundryStatusScreen.tsx` (lines 37-55, 115-137)
- **Why fragile:**
  - Progress calculation assumes machineTimeRemaining format is always "MM:SS"
  - No validation that initial timeRemaining prop is valid
  - Multiple state updates (timeRemaining changes trigger re-render)
  - useEffect dependency array is empty—timer never updates if props change
- **Safe modification:** Extract to custom hook: `useCountdownTimer(initialTime)` returns { displayTime, percentComplete, isComplete }
- **Test coverage:** No unit tests. Edge cases untested (0 time, negative time, etc.).

### Queue Position Tracking
- **Files:** `convex/queue.ts` (all), `convex/scheme.ts` (queue table)
- **Why fragile:**
  - Position field is manually set during queue entry creation (line 35 in intake.ts)
  - No automatic reordering when users removed from middle of queue
  - Multiple concurrent removals could leave queue with gaps or duplicates
- **Safe modification:**
  1. Create migration to add "position_version" counter
  2. Add mutation to recalculate all positions atomically
  3. Check position consistency in tests
- **Test coverage:** No tests for concurrent queue mutations.

## Scaling Limits

### Single Location Per Session
- **Current capacity:** 1 session per location at a time. Cannot have morning and afternoon shifts simultaneously.
- **Limit:** Schema allows multiple sessions but RootNavigator and UI hardcoded for single session
- **Scaling path:**
  1. Add session selection to role selection screen
  2. Store selected session ID in Zustand store
  3. Pass sessionId to all queries/mutations

### Max Concurrent Queue Size
- **Current capacity:** Tested with 100 users; getActiveQueue becomes slow above 50
- **Limit:** No pagination. Entire queue sent to every client every update.
- **Scaling path:**
  1. Implement pagination (top 20 items)
  2. Separate views for volunteers (full queue) vs. users (position only)
  3. Use Convex subscriptions for real-time updates instead of polling

### Volunteer Assignment Tracking
- **Current capacity:** volunteerAssignedId is a single ID field. Cannot track multiple volunteers helping one user.
- **Limit:** Schema doesn't support volunteer teams
- **Scaling path:** Create separate `queue_assignments` table with many-to-many relationship

### Memory Usage on Client
- **Current capacity:** Storing full navigation state in RootNavigator React state. Works fine up to 10 pages of history.
- **Limit:** No state limits enforced. Could grow unbounded if user navigates 1000 times.
- **Scaling path:** Implement persistent navigation state with replay pattern (store only actions, not full state)

## Dependencies at Risk

### Expo Toolchain Version Pinning
- **Risk:** Expo 54.0.32, React 19.1.0, React Native 0.81.5 are specific versions. Patch updates sometimes break native modules.
- **Current:** Using tilde (~) in package.json (allows patch updates). Locks in minor version.
- **Impact:** npm install might fail with peer dependency conflicts
- **Migration plan:**
  1. Pin exact versions if stability needed
  2. Otherwise stay on latest patch (current approach is reasonable)
  3. Test before deploying updates

### React Native Paper 5.14.5
- **Risk:** Package not actively maintained (RN Paper development slowed). Missing modern Material Design 3 components.
- **Current:** Using only CustomButton, InputField, DropdownSelect—not using RN Paper components directly
- **Impact:** If new components needed, might not exist in RN Paper
- **Migration plan:** Consider Tamagui or Nativewind if need more components (but not urgent—current custom atoms work fine)

### Zustand Installed But Unused
- **Risk:** Zustand v5 installed as dependency but never used. Creates maintenance burden and confusion for team.
- **Current:** All state management in React useState
- **Impact:** Takes disk space, adds to bundle size (~3KB minified)
- **Migration plan:** Either integrate Zustand fully or remove from package.json

### Convex SDK Version Lock
- **Risk:** Convex 1.31.6 pinned. Convex frequently updates with breaking changes. Old version might not support new Convex dashboard features.
- **Current:** Using only basic schema/mutation/query APIs (stable since v1.0)
- **Impact:** Lower risk since only using stable APIs. But should update eventually.
- **Migration plan:** Update Convex monthly and regenerate _generated/ types

## Missing Critical Features

### No Offline Support
- **Problem:** Volunteers need to work during low-connectivity events. No offline queue caching or mutation queuing.
- **Blocks:** Offline event support. Users can't view queue status if internet drops.
- **Workaround:** None—app becomes unusable offline

### No Multi-Language Support
- **Problem:** PRD requires Spanish, Portuguese, Haitian Creole. Zero i18n library installed or used.
- **Blocks:** Launch outside English-speaking regions
- **Workaround:** None—all text hardcoded in English

### No Push Notifications
- **Problem:** PRD requires push to volunteers when wash completes. No FCM/APNS setup.
- **Blocks:** Volunteers must manually check app every 23 minutes. Not practical.
- **Workaround:** None—timer-complete notifications unreliable

### No Google Sheets Integration
- **Problem:** PRD requires data sync to Google Sheets for reporting. Zero Sheets API integration.
- **Blocks:** Event organizers can't export data for reporting
- **Workaround:** Manual database export (not production-ready)

### No SMS Notifications
- **Problem:** PRD requires SMS to users when wash ready. No SMS provider integrated.
- **Blocks:** Users don't know when to pick up laundry
- **Workaround:** Manual phone calls (defeats purpose)

## Test Coverage Gaps

### No Unit Tests
- **What's not tested:** All utility functions, helper functions, type definitions
- **Files:** `hooks/`, `constants/theme.ts`, component logic
- **Risk:** Breaking changes to utilities propagate silently
- **Priority:** Medium (can add later)

### No Integration Tests
- **What's not tested:** Navigation flow, screen transitions, data flow between screens
- **Files:** `components/provider/navigation/RootNavigator.tsx`, all screens
- **Risk:** UI changes break navigation without detection. Schema mismatches only caught at runtime.
- **Priority:** High (catch navigation bugs early)

### No Backend Tests
- **What's not tested:** Convex mutations and queries
- **Files:** `convex/intake.ts`, `convex/queue.ts`, `convex/sessions.ts`
- **Risk:** Race conditions, N+1 queries, data corruption
- **Priority:** High (data integrity critical)

### No Error Scenario Tests
- **What's not tested:** Network failures, invalid inputs, concurrent mutations
- **Files:** All screens, all Convex functions
- **Risk:** Silent failures in production
- **Priority:** High

### No E2E Tests
- **What's not tested:** Full user flows: registration → queue → wash → completion
- **Files:** Entire app
- **Risk:** Integration issues between systems not caught
- **Priority:** Medium (add after integration tests pass)

---

*Concerns audit: 2026-01-23*
