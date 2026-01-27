---
phase: 03-queue-operations-management
plan: 04
subsystem: ui
tags: [expo, react-native, convex, real-time, queue-management]

# Dependency graph
requires:
  - phase: 03-01
    provides: "getUserQueuePosition query with real-time subscription"
provides:
  - "Service user queue position view with real-time updates"
  - "Contextual messaging based on position and status"
  - "Estimated wait time calculation"
affects: [notifications, multi-language]

# Tech tracking
tech-stack:
  added: []
  patterns: [real-time subscription pattern, contextual UI messaging, estimated wait calculation]

key-files:
  created: []
  modified:
    - app/(user)/status.tsx

key-decisions:
  - "Use SafeAreaView for camera notch compatibility"
  - "Show estimated wait time only for waiting status with position > 1"
  - "Calculate 25 minutes per position ahead for wait time estimate"

patterns-established:
  - "Real-time subscription: Use useQuery with skip when no userId available"
  - "Contextual messaging: Different messages based on position and status combination"
  - "Status color coding: Secondary for waiting, primary for washing/drying, success for ready"

# Metrics
duration: 2min
completed: 2026-01-27
---

# Phase 03 Plan 04: Service User Queue Position View Summary

**Service user sees real-time queue position (#3, #5, etc.) with contextual messaging and estimated wait time**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-27T21:56:49Z
- **Completed:** 2026-01-27T21:58:42Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Service users can view their queue position in real-time
- Position updates automatically when queue changes (volunteers remove users ahead)
- Contextual messaging guides users based on their position and status
- Estimated wait time helps users plan their time

## Task Commits

Each task was committed together (closely related functionality):

1. **Task 1 & 2: Queue position view with contextual messaging** - `998394d` (feat)

## Files Created/Modified
- `app/(user)/status.tsx` - Service user status screen with queue position display, status badge, contextual messaging, and estimated wait time

## Decisions Made

**Use SafeAreaView for camera notch compatibility**
- Follows CLAUDE.md requirements for all top and bottom sections
- Ensures content doesn't overlap with device notches/cameras

**Show estimated wait time only for waiting status with position > 1**
- No estimate for position 1 (they're next)
- No estimate when washing/drying (already being processed)
- Simple calculation: (position - 1) × 25 minutes

**Calculate 25 minutes per position ahead**
- Based on typical wash cycle duration
- Provides helpful guidance without overpromising accuracy

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - getUserQueuePosition query already implemented in plan 03-01, integration was straightforward.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Notifications phase (can use position/status data for alerts)
- Multi-language phase (all user-facing strings are in functions, easy to internationalize)

**No blockers.**

---
*Phase: 03-queue-operations-management*
*Completed: 2026-01-27*
