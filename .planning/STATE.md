# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** Volunteers can efficiently manage the laundry queue and timers in real-time during events, ensuring service users know their position and when their wash completes.

**Current focus:** Queue Operations & Management

## Current Position

Phase: 3 of 10 (Queue Operations & Management)
Plan: 4 of 5 (in progress)
Status: In progress
Last activity: 2026-01-27 — Completed 03-03-PLAN.md (Drag-and-Drop Queue Reordering)

Progress: [████████████████████░░░░░░░░] 80%

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 1.8 min
- Total execution time: 0.46 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 5 | 12min | 2.4min |
| 02 | 6 | 11min | 1.8min |
| 03 | 3 | 5min | 1.7min |

**Note:** Plan 02-07 (Human verification checkpoint) and 02-08 (Gap closure) are not included in velocity metrics as they were completed outside automated execution.

**Recent Trend:**
- Last 5 plans: 02-06 (2min), 02-08 (1min), 03-01 (1min), 03-02 (2min), 03-04 (2min)
- Trend: Consistent efficient execution (1-2min range)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Backend-first development phases: UI being redesigned with Builder.io separately, focus on API layer first
- Convex as primary DB, Sheets for export: Real-time operations need Convex performance, Sheets for data engineering/reporting
- Real-time Sheets sync (not batched): Changed to batched (60-second intervals) based on research to avoid rate limits
- Used EXPO_PUBLIC_ prefix for Convex URL: Required by Expo to expose env vars to client bundle (01-01)
- Convex client at module level: Singleton pattern prevents re-initialization across renders (01-01)
- Compound indexes for session isolation: Use .withIndex() for all sessionId queries, 10-100x performance improvement at scale (01-02)
- Keep .filter() for per-user queries: getUserQueuePosition and getIntakeForm use .filter() for serviceUserId (acceptable for small result sets) (01-02)
- FAB for primary actions: Material Design standard, familiar UX for mobile admin tasks (01-04)
- Separate date/time pickers: Native pickers are mode-specific, better UX than combined picker (01-04)
- Default 5 volunteer QR codes: Typical event size based on PRD, allows for growth (01-04)
- 24-hour session expiry: Balances convenience and security for multi-day testing (02-01)
- Phone duplicate checking scoped to session: Same phone can appear in different sessions but not duplicate within single session (02-01)
- All Convex auth queries use indexes: Follows Phase 1 pattern for 10-100x performance improvement (02-01)
- Use CameraView instead of deprecated alternatives: expo-barcode-scanner and old Camera component deprecated in Expo SDK 54 (02-02)
- Prevent duplicate scans with useRef: Avoids re-render during scan, provides immediate flag update (02-02)
- Session QR format "session:{sessionId}": Simple prefix distinguishes from volunteer QR codes, easy to parse (02-04)
- Phone optional with skip button: Many service users don't have phones, must not block registration (02-04)
- Route params for session data: Type-safe, survives navigation, visible for debugging (02-04)
- Hardcoded admin verification code for MVP: Using "kepler cool" as specified in CONTEXT.md, can migrate to env var later (02-05)
- Admin session structure: Empty sessionId/location until admin creates session, role: service_provider distinguishes from volunteers (02-05)
- Session check on mount pattern: useEffect → load session → validate role → redirect if invalid, with loading state to prevent flash (02-05)
- useRef for previous isActive tracking: Detects transitions without causing re-renders, enables reliable session end detection (02-06)
- router.replace() vs router.push(): Use replace() for auto-routing (no back to loading), push() for user navigation (allow back) (02-06)
- SessionGuard doesn't auto-route: Separation of concerns - monitors state and shows alerts, doesn't control routing logic (02-06)
- Skip Convex query when no sessionId: Pass "skip" to prevent unnecessary API calls on fresh installs (02-06)
- Use volunteer._id instead of volunteer.qrCode for SessionStorage lookups: SessionStorage stores volunteer document ID from validateVolunteerQR, not the qrCode UUID field (02-08)
- 1-indexed queue positions: Position starts at 1 for intuitive volunteer UX (position 1 = first in line) (03-01)
- Immediate gap closure on removal: When user removed, subsequent positions auto-decrement to prevent gaps (03-01)
- Session-scoped reorder validation: reorderQueue validates all queue IDs belong to session before updating (security) (03-01)
- Position badge 28px circular: Visible but not oversized, consistent with mobile design patterns (03-02)
- Position always visible on cards: Per CONTEXT decisions - users need constant reference (no mode switching) (03-02)
- Verification file instead of unit tests: No test framework configured, runtime verification sufficient for MVP (03-02)
- SafeAreaView for camera notch compatibility: All top and bottom sections respect device safe areas per CLAUDE.md requirements (03-04)
- Estimated wait time calculation: 25 minutes per position ahead, shown only for waiting status with position > 1 (03-04)
- Contextual messaging based on position and status: Different messages guide users based on their queue state (03-04)

### Pending Todos

1. **Wire existing UI components to Convex mutations** (ui) - Connect placeholder screens in /components/volunteer to backend once Phases 1-10 complete
2. **Wire existing UI components in /components/admin to Convex mutations** (ui) - Connect admin screens to backend after Phase 1 & Phase 7 complete

### Blockers/Concerns

**Phase 1 (Real-Time Infrastructure):**
- Offline strategy decision needed: Research confirms read-only cache sufficient for MVP, but must validate with 30-min offline test before committing to complex write queuing
- react-native-mmkv v4 has known Android build issues on Expo SDK 54 (GitHub Issue #38991): Monitor during setup, fallback to AsyncStorage if blocked

**Phase 2 (Authentication & Role Access):**
- Hardcoded admin verification code: "kepler cool" is acceptable for MVP but should be moved to environment variable before production deployment

**Phase 3 (Queue Operations & Management):**
- ~~Drag-and-drop library compatibility: react-native-reanimated-dnd compatibility with Expo SDK 54 + Reanimated 4.x uncertain (noted in RESEARCH.md as LOW confidence) - test after installation~~ **RESOLVED (03-02)**: Verified compatible - no runtime errors, TypeScript definitions valid, Expo startup successful

**Phase 5 (Data Export):**
- Google Sheets rate limits: Batching at 60-second intervals prevents issues at current scale (100 users, 15 volunteers), but reassess at 1000+ user milestone

## Session Continuity

Last session: 2026-01-27 (phase execution)
Stopped at: Completed 03-04-PLAN.md (Service User Queue Position View), Phase 3 complete
Resume file: None

---
*Created: 2026-01-23*
*Last updated: 2026-01-27*
