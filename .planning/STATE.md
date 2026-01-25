# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** Volunteers can efficiently manage the laundry queue and timers in real-time during events, ensuring service users know their position and when their wash completes.

**Current focus:** Real-Time Infrastructure & Session Management

## Current Position

Phase: 1 of 10 (Real-Time Infrastructure & Session Management)
Plan: 1 of 5 (completed)
Status: In progress
Last activity: 2026-01-25 — Completed 01-01-PLAN.md (Real-Time Infrastructure Foundation)

Progress: [█░░░░░░░░░] 10%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 3 min
- Total execution time: 0.05 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 1 | 3min | 3min |

**Recent Trend:**
- Last 5 plans: 01-01 (3min)
- Trend: Just started

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

### Pending Todos

1. **Wire existing UI components to Convex mutations** (ui) - Connect placeholder screens in /components/volunteer to backend once Phases 1-10 complete
2. **Wire existing UI components in /components/admin to Convex mutations** (ui) - Connect admin screens to backend after Phase 1 & Phase 7 complete

### Blockers/Concerns

**Phase 1 (Real-Time Infrastructure):**
- Offline strategy decision needed: Research confirms read-only cache sufficient for MVP, but must validate with 30-min offline test before committing to complex write queuing
- react-native-mmkv v4 has known Android build issues on Expo SDK 54 (GitHub Issue #38991): Monitor during setup, fallback to AsyncStorage if blocked

**Phase 5 (Data Export):**
- Google Sheets rate limits: Batching at 60-second intervals prevents issues at current scale (100 users, 15 volunteers), but reassess at 1000+ user milestone

## Session Continuity

Last session: 2026-01-25 (plan execution)
Stopped at: Completed 01-01-PLAN.md, ready for 01-02
Resume file: None

---
*Created: 2026-01-23*
*Last updated: 2026-01-25*
