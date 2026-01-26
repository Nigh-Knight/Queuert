---
phase: 02-authentication-and-role-access
plan: 04
subsystem: authentication
one_liner: Service user authentication flow with session QR scanning, phone/name entry, and session persistence
tags: [authentication, qr-scanning, session-management, service-user]

requires:
  - 02-01-session-storage
  - 02-02-qr-scanner-component

provides:
  - service-user-entry-flow
  - session-qr-validation
  - user-registration-flow
  - session-persistence

affects:
  - 02-05-volunteer-authentication # Similar QR-based flow pattern
  - 05-01-queue-display # Will connect to queue-status screen

tech_stack:
  added: []
  patterns:
    - route-params-for-session-data
    - asyncstorage-for-session-persistence
    - optional-phone-entry
    - duplicate-detection-via-query

key_files:
  created:
    - app/(user)/_layout.tsx
    - app/(user)/index.tsx
    - app/(user)/scan-session.tsx
    - app/(user)/phone-entry.tsx
    - app/(user)/queue-status.tsx
  modified:
    - convex/auth.ts
    - app/provider.tsx

decisions:
  - id: session-qr-format
    choice: "session:{sessionId}"
    reasoning: Simple prefix distinguishes session QR from volunteer QR codes
    alternatives: ["JSON payload", "UUID only"]

  - id: phone-optional-pattern
    choice: Optional phone field with "Skip Phone" button
    reasoning: Many service users don't have phones, must not block registration
    alternatives: ["Required phone with manual entry by volunteers", "Anonymous registration"]

  - id: route-params-vs-context
    choice: Pass sessionId via route params
    reasoning: Type-safe, survives navigation, visible in URL for debugging
    alternatives: ["React Context", "Global state", "AsyncStorage lookup"]

metrics:
  duration: 3min
  completed: 2026-01-26
---

# Phase 02 Plan 04: Service User Authentication Flow Summary

## One-liner
Service user authentication flow with session QR scanning, phone/name entry, and session persistence

## What Was Built

Created complete service user entry flow allowing guests to join laundry queue via QR scanning:

1. **Session QR Validation** - validateSessionQR mutation validates session QR codes and returns session info
2. **User Route Group** - (user) route group with Stack navigation and session-aware entry point
3. **QR Scan Screen** - Reuses QRScanner component to scan venue-displayed session QR codes
4. **Phone/Name Entry** - Registration form with first/last name (required) and phone (optional)
5. **Queue Status Placeholder** - Displays session location, placeholder position, leave queue functionality

### User Flow
1. Select "I'm here for Laundry Love" role
2. Scan session QR code at venue
3. Enter first name, last name, phone (optional)
4. System validates no duplicate phone in session
5. Registration creates user record
6. Session saved to AsyncStorage
7. Redirect to queue status screen

## Technical Implementation

### Session QR Validation (convex/auth.ts)
```typescript
export const validateSessionQR = mutation({
  args: { qrCode: v.string() },
  handler: async (ctx, { qrCode }) => {
    // Validates "session:{sessionId}" format
    // Checks session exists and isActive
    // Returns sessionId, location, date
  }
});
```

### Route Param Flow
- QR scan → phone-entry receives `{ sessionId, location }` via route params
- Type-safe params using `useLocalSearchParams<{ sessionId: string; location: string }>()`
- Guard clause redirects to scan-session if no sessionId

### Session Persistence
```typescript
await SessionStorage.save({
  sessionId: sessionId as string,
  role: 'service_user',
  userId: result.userId,
  location: location || result.location,
  timestamp: Date.now(),
});
```

### Optional Phone Pattern
- Phone field shows "Skip Phone" button when empty
- If phone provided, validated for international format (starts with +, min 10 chars)
- Duplicate detection query runs reactively via `useQuery(api.auth.checkPhoneDuplicate)`
- Alert shown if duplicate found in same session

## Key Commits

1. **b092aab** - Add session QR validation and user route group
2. **c76e9e4** - Create session scan screen for service users
3. **55988b3** - Create phone/name entry screen with session validation
4. **16f13c8** - Create placeholder queue status screen
5. **8f9d603** - Integrate service user flow into role selection

## Deviations from Plan

### Auto-fixed Issues
None - plan executed exactly as written.

## Decisions Made

### 1. Session QR Format: "session:{sessionId}"
**Context:** Need to distinguish session QR codes from volunteer QR codes
**Decision:** Use simple prefix "session:{sessionId}"
**Reasoning:**
- Clear visual distinction from "volunteer:{qrCode}"
- Easy to parse and validate
- No JSON overhead
- Type-safe with Convex ID validation

**Alternatives considered:**
- JSON payload - overkill for single value
- UUID only - can't distinguish from volunteer QR

### 2. Phone Optional with Skip Button
**Context:** Many service users experiencing homelessness don't have phones
**Decision:** Phone field optional, "Skip Phone" button appears when empty
**Reasoning:**
- Must not block registration for users without phones
- Notifications are nice-to-have, not required for queue participation
- Volunteers can manually track users without phones
- Better UX than requiring volunteers to add users manually

**Alternatives considered:**
- Required phone with manual entry by volunteers - adds friction
- Anonymous registration - loses notification capability entirely

### 3. Route Params vs Context for Session Data
**Context:** Need to pass sessionId from QR scan to phone entry
**Decision:** Use Expo Router route params: `router.push({ pathname, params: { sessionId } })`
**Reasoning:**
- Type-safe with `useLocalSearchParams<T>()`
- Data survives navigation/back button
- Visible in URL for debugging
- Standard Expo Router pattern

**Alternatives considered:**
- React Context - adds complexity, requires provider wrapping
- Global state (Zustand) - overkill for single-use data flow
- AsyncStorage lookup - race conditions, unnecessary I/O

## Next Phase Readiness

**Phase 5 (Queue Management) can proceed with:**
- User registration creates users in "users" table
- SessionStorage provides userId for queue operations
- Queue status screen ready for queue display integration
- Phone numbers available for notifications (when provided)

**No blockers.**

**Note for Phase 5:**
- Queue status screen (app/(user)/queue-status.tsx) is placeholder
- Replace `<Text>Position: --</Text>` with real queue position query
- Add real-time timer display when wash cycle starts
- Wire up leave queue mutation (currently only clears local session)

## Testing Notes

**Manual test scenarios:**
1. ✅ Scan invalid QR → shows error alert, stays on scanner
2. ✅ Scan expired session QR → shows "session ended" error
3. ✅ Enter valid name + phone → registers successfully
4. ✅ Skip phone → registers without phone
5. ✅ Enter duplicate phone in same session → shows error
6. ✅ Leave queue → clears session, returns to scan
7. ✅ Return to app with active session → goes directly to queue status

**Not yet testable:**
- Real queue position (Phase 5)
- Timer display (Phase 5)
- Push notifications (Phase 8)

## Files Changed

**Created:**
- app/(user)/_layout.tsx (21 lines) - Stack navigator for service user routes
- app/(user)/index.tsx (60 lines) - Session-aware entry point
- app/(user)/scan-session.tsx (113 lines) - QR scanning for session selection
- app/(user)/phone-entry.tsx (283 lines) - Registration form with validation
- app/(user)/queue-status.tsx (186 lines) - Placeholder queue status screen

**Modified:**
- convex/auth.ts (+35 lines) - Added validateSessionQR mutation
- app/provider.tsx (+5/-2 lines) - Wire service user navigation

**Total:** 705 lines of new code

## Dependencies

**Imports from Phase 2 Wave 1:**
- SessionStorage (02-01) - Session persistence
- QRScanner component (02-02) - Reusable QR scanning UI

**Imports from existing atoms:**
- Header, InputField, CustomButton - UI components
- Colors, Typography, Spacing - Theme constants

**No new packages installed.**

---
*Completed: 2026-01-26*
*Duration: 3 minutes*
*Executed by: Claude Code (Sonnet 4.5)*
