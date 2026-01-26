# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** Volunteers can efficiently manage the laundry queue and timers in real-time during events, ensuring service users know their position and when their wash completes.

**Current focus:** Authentication & Role Access

## Current Position

Phase: 2 of 10 (Authentication & Role Access)
Plan: 5 of 7 (completed)
Status: In progress - Wave 3 execution
Last activity: 2026-01-26 — Completed 02-05-PLAN.md (Admin Verification Flow)

Progress: [████████░░] 75%

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 2.1 min
- Total execution time: 0.33 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 5 | 12min | 2.4min |
| 02 | 4 | 8min | 2.0min |

**Recent Trend:**
- Last 5 plans: 01-05 (2min checkpoint), 02-01 (1min), 02-02 (2min), 02-04 (3min), 02-05 (2min)
- Trend: Consistent efficient execution (1-3min range)

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

### Pending Todos

1. **Wire existing UI components to Convex mutations** (ui) - Connect placeholder screens in /components/volunteer to backend once Phases 1-10 complete
2. **Wire existing UI components in /components/admin to Convex mutations** (ui) - Connect admin screens to backend after Phase 1 & Phase 7 complete

### Blockers/Concerns

**Phase 1 (Real-Time Infrastructure):**
- Offline strategy decision needed: Research confirms read-only cache sufficient for MVP, but must validate with 30-min offline test before committing to complex write queuing
- react-native-mmkv v4 has known Android build issues on Expo SDK 54 (GitHub Issue #38991): Monitor during setup, fallback to AsyncStorage if blocked

**Phase 2 (Authentication & Role Access):**
- Hardcoded admin verification code: "kepler cool" is acceptable for MVP but should be moved to environment variable before production deployment

**Phase 5 (Data Export):**
- Google Sheets rate limits: Batching at 60-second intervals prevents issues at current scale (100 users, 15 volunteers), but reassess at 1000+ user milestone

## Session Continuity

Last session: 2026-01-26 (phase execution)
Stopped at: Completed 02-05-PLAN.md (Admin Verification Flow), ready for 02-06
Resume file: None

---
*Created: 2026-01-23*
*Last updated: 2026-01-26*
