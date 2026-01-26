---
phase: 02-authentication-and-role-access
plan: 06
subsystem: auth
tags: [react-hooks, session-management, convex, async-storage, expo-router]

# Dependency graph
requires:
  - phase: 02-01
    provides: SessionStorage utility for persistent session data
  - phase: 02-03
    provides: Session creation for volunteers and users
  - phase: 02-05
    provides: Admin session creation and verification flow
provides:
  - Session validation hook with real-time monitoring
  - SessionGuard wrapper for auto-logout on session end
  - Auto-routing on app startup based on saved session
  - Session end detection and user notification
affects: [03-queue-management, 04-timer-system, all-volunteer-flows, all-user-flows]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Real-time session monitoring via Convex useQuery"
    - "Auto-routing pattern with router.replace() on startup"
    - "Session guard wrapper for session lifecycle management"
    - "useRef for tracking state transitions without re-renders"

key-files:
  created:
    - hooks/useSessionValidation.ts
    - components/auth/SessionGuard.tsx
  modified:
    - app/index.tsx
    - app/provider.tsx

key-decisions:
  - "useRef for previous isActive tracking: Detects transitions without causing re-renders"
  - "router.replace() in index.tsx: Prevents back navigation to loading screen"
  - "router.push() in provider.tsx: Allows back to role selection for user-initiated navigation"
  - "SessionGuard doesn't auto-route: Separation of concerns - monitoring vs routing"
  - "Skip Convex query when no sessionId: Prevents unnecessary API calls on fresh installs"

patterns-established:
  - "Session validation hook pattern: Load from storage, subscribe to Convex, detect transitions"
  - "Guard component pattern: Wrapper that monitors state and shows alerts, doesn't control routing"
  - "Auto-routing on startup: Check session, route by role, show loading until ready"

# Metrics
duration: 2min
completed: 2026-01-26
---

# Phase 02 Plan 06: Session Protection Infrastructure Summary

**Auto-routing on startup, real-time session monitoring with auto-logout, and session end alerts using Convex subscriptions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-26T11:42:57Z
- **Completed:** 2026-01-26T11:44:58Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Session validation hook monitors Convex session state in real-time and auto-clears local storage when session ends
- SessionGuard wrapper provides session monitoring and alerts users when admin ends session
- App startup checks saved session and auto-routes users to correct dashboard without flash of wrong content

## Task Commits

Each task was committed atomically:

1. **Task 1: Create session validation hook** - `9afd1a8` (feat)
2. **Task 2: Create SessionGuard component** - `8b16f4c` (feat)
3. **Task 3: Update app entry points for auto-routing** - `bec6c31` (feat)

## Files Created/Modified
- `hooks/useSessionValidation.ts` - Hook that loads session from AsyncStorage, subscribes to Convex session document, detects when isActive transitions from true to false, and auto-clears local session
- `components/auth/SessionGuard.tsx` - Wrapper component that shows loading spinner during session check, monitors sessionEnded flag, and displays alert when session is ended by admin
- `app/index.tsx` - Entry point that checks session and routes by role (admin → /(admin), volunteer → /(volunteer), user → /(user), none → /provider)
- `app/provider.tsx` - Wrapped RoleSelectionScreen with SessionGuard for session end monitoring

## Decisions Made

**useRef for previous isActive tracking:** Used `previousIsActiveRef` to track session.isActive value across renders without triggering re-renders. This allows detecting the transition from true to false (session end) reliably.

**router.replace() vs router.push():** Used `router.replace()` in app/index.tsx for auto-routing (prevents back to loading screen), but `router.push()` in provider.tsx for user-initiated navigation (allows back to role selection).

**SessionGuard doesn't auto-route:** Separation of concerns - SessionGuard monitors state and shows alerts, but doesn't control routing. Individual entry points (index.tsx, provider.tsx) handle routing logic.

**Skip Convex query when no sessionId:** Passed `"skip"` to useQuery when sessionId is null, preventing unnecessary API calls on fresh app installs.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Session protection infrastructure is complete and ready for Phase 3 (Queue Management). Key capabilities now available:

**For volunteers and users:**
- Saved sessions persist across app restarts
- Auto-routed to correct dashboard on launch
- Real-time monitoring of session status
- Automatic logout when admin ends session
- Clear notification when session ends

**For Phase 3:**
- Queue operations can rely on session validation
- Session guards can be added to queue screens
- Auto-logout ensures volunteers/users can't interact with ended sessions

**No blockers.** All authentication and session management flows complete.

---
*Phase: 02-authentication-and-role-access*
*Completed: 2026-01-26*
