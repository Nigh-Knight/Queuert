# Phase 1: Real-Time Infrastructure & Session Management - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish Convex backend connection with real-time subscriptions and enable admins to create sessions that isolate queue data across two laundromats (Kam's and Star). This phase delivers the foundational infrastructure for real-time queue management without implementing the queue operations themselves.

</domain>

<decisions>
## Implementation Decisions

### Session Creation Flow
- Floating action button (FAB) on main admin screen for creating sessions
- Location picker uses dropdown/selector (not radio buttons or map)
- Future date/time picker required (not auto-set to now)
- After submission: Show QR codes immediately, then confirmation screen
- Date/time validation: Must be future time (no past sessions allowed)
- Error display: Toast/banner at top of screen (not inline or alert dialog)
- Error recovery: Auto-retry 3 times on failure, then show error to admin
- No validation on volunteer QR code count (admin knows best)

### QR Code Generation
- QR codes contain: Session ID + volunteer identifier (unique per volunteer)
- Dynamic count: Admin specifies number of codes during session creation
- Display format: One-at-a-time fullscreen view with swipe navigation
- Volunteer onboarding: Capture volunteer name before joining (after QR scan)
- QR code validity: Valid for entire session until admin ends it
- Regeneration: Individual codes can be regenerated, invalidating old ones
- Tracking: Admin sees total volunteer count only (not status per QR code)
- Volunteer info collected: Name only (no phone/email required)

### Real-Time Update Strategy
- Updates triggered for: Queue position changes and timer state changes
- Update delivery: Send each change immediately (no debouncing)
- Loading indicators: Show spinner/indicator while syncing
- Reconnection: Auto-refresh all data to latest state when reconnecting

### Session Isolation Model
- Data separation: Separate collections per location (physical isolation)
- Concurrent sessions: Allow multiple sessions per location, but warn admin if creating overlapping session
- Cross-location visibility: Complete isolation - each user only sees their session's location
- Session end behavior: Archive to separate table, clear active session data

### Claude's Discretion
- Specific loading skeleton design for real-time updates
- Exact retry delay intervals for error recovery
- Toast/banner styling and auto-dismiss timing
- QR code size and visual styling
- Swipe gesture sensitivity for QR navigation

</decisions>

<specifics>
## Specific Ideas

- Session creation follows pattern: FAB → Form (location dropdown + date/time picker) → QR codes fullscreen → Confirmation
- QR codes displayed similar to onboarding slides: swipe through each one, volunteer scans individually as they arrive
- Error recovery should be invisible to admin when retries succeed - only show error after all retries exhausted
- Session isolation uses physical separation (different collections) rather than query filtering for maximum security
- Overlapping session warning helps prevent mistakes but doesn't block admin if intentional

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-real-time-infrastructure-&-session-management*
*Context gathered: 2026-01-25*
