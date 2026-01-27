# Roadmap: Queuert

## Overview

This roadmap transforms Queuert from a scaffolded Expo app with UI components into a production-ready queue management system for Laundry Love events. The journey starts with establishing real-time Convex infrastructure and session management, then builds authentication and queue operations, adds server-authoritative timer logic, implements service user intake and volunteer operations with offline support, and completes with admin functions, multi-language support, notifications, and data export. Each phase delivers a coherent, verifiable capability that brings volunteers and service users closer to efficient, dignity-centered queue management.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Real-Time Infrastructure & Session Management** - Establish Convex reactive queries and session lifecycle
- [x] **Phase 2: Authentication & Role Access** - Implement admin codes, volunteer QR scanning, and service user entry
- [ ] **Phase 3: Queue Operations & Management** - Build queue viewing, addition, removal, and repositioning
- [ ] **Phase 4: Timer System** - Server-authoritative wash cycle timers with real-time sync
- [ ] **Phase 5: Service User Intake & Experience** - Intake forms, welcome back, and queue position visibility
- [ ] **Phase 6: Volunteer Operations & Offline Support** - Dashboard features and read-only offline mode
- [ ] **Phase 7: Admin Functions** - Session oversight, QR code management, and admin-level queue access
- [ ] **Phase 8: Multi-Language Support** - English and Spanish interface with language persistence
- [ ] **Phase 9: Notifications** - Push notifications for volunteers when timers expire
- [ ] **Phase 10: Data Collection & Export** - Google Sheets batch export with retry logic

## Phase Details

### Phase 1: Real-Time Infrastructure & Session Management
**Goal**: Convex backend is connected to app with real-time subscriptions, and admins can create sessions with location/time selection that isolate queue data across locations.

**Depends on**: Nothing (first phase)

**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SESS-05

**Success Criteria** (what must be TRUE):
  1. ConvexProvider wraps app root and useQuery/useMutation hooks work in components
  2. Admin can create session with location selection (Kam's or Star Laundromat) and date/time
  3. System supports multiple concurrent sessions without data leakage between locations
  4. Admin can generate volunteer QR codes for an active session
  5. Real-time updates propagate across all connected devices within 2 seconds

**Plans**: 5 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md - ConvexProvider setup and dependencies
- [x] 01-02-PLAN.md - Schema updates and index migrations
- [x] 01-03-PLAN.md - Session management backend
- [x] 01-04-PLAN.md - Admin session creation UI
- [x] 01-05-PLAN.md - QR code generation and display

### Phase 2: Authentication & Role Access
**Goal**: Users can access the app according to their role (admin with verification code, volunteer via QR scan, service user with phone/name only), and the system differentiates permissions.

**Depends on**: Phase 1 (requires session management and Convex mutations)

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05

**Success Criteria** (what must be TRUE):
  1. Admin can verify identity using special verification code to access admin functions
  2. Volunteer can scan admin-generated QR code to join session without entering phone number
  3. Service user can enter phone number and name without authentication or verification
  4. System correctly identifies and routes guest, volunteer, and admin roles to appropriate screens
  5. Volunteer QR codes are unique per session and cannot be used across different sessions

**Plans**: 8 plans in 4 waves

Plans:
- [x] 02-01-PLAN.md - Session storage utility and auth mutations
- [x] 02-02-PLAN.md - expo-camera install and QR scanner component
- [x] 02-03-PLAN.md - Volunteer QR scan flow with Convex integration
- [x] 02-04-PLAN.md - Service user phone/name entry flow
- [x] 02-05-PLAN.md - Admin verification flow with Convex
- [x] 02-06-PLAN.md - Session protection and auto-routing
- [x] 02-07-PLAN.md - Human verification checkpoint
- [x] 02-08-PLAN.md - Fix volunteer ID mismatch bug (gap closure)

### Phase 3: Queue Operations & Management
**Goal**: Volunteers can view the full queue, add users (via QR or manual entry), remove users, reorder the queue, and search by name/phone, with positions auto-updating across all devices.

**Depends on**: Phase 2 (requires authentication to differentiate volunteer permissions)

**Requirements**: QUEUE-01, QUEUE-02, QUEUE-03, QUEUE-04, QUEUE-05, QUEUE-06, QUEUE-07, QUEUE-08, QUEUE-09

**Success Criteria** (what must be TRUE):
  1. Service user can view their current position in queue in real-time
  2. Volunteer can view full queue showing all users, positions, and statuses
  3. When user removed from queue, remaining users auto-reposition without gaps
  4. Volunteer can drag users to different positions to manually reorder queue
  5. Volunteer can search queue by user name or phone number and find results instantly

**Plans**: 5 plans in 3 waves

Plans:
- [ ] 03-01-PLAN.md - Queue management mutations (reorderQueue, auto-reposition on removal)
- [ ] 03-02-PLAN.md - Install drag-and-drop library, add position numbers to QueueCard
- [ ] 03-03-PLAN.md - Wire drag-and-drop sortable queue with confirmation dialog
- [ ] 03-04-PLAN.md - Service user queue position view with real-time updates
- [ ] 03-05-PLAN.md - Human verification checkpoint

### Phase 4: Timer System
**Goal**: Volunteers can start customizable wash cycle timers that countdown in real-time across all devices using server-authoritative time, automatically update status when expired, and can be marked complete early.

**Depends on**: Phase 3 (requires queue entries to attach timers to)

**Requirements**: TIMER-01, TIMER-02, TIMER-03, TIMER-04, TIMER-05, TIMER-06, TIMER-07

**Success Criteria** (what must be TRUE):
  1. Volunteer can start timer for user's wash cycle with default 23 minutes
  2. Volunteer can customize timer duration before starting (e.g., 15, 30, 45 minutes)
  3. Timer countdown displays in real-time and matches across all connected volunteer devices within 1 second
  4. Timer uses server timestamp to prevent drift when devices have incorrect clocks
  5. Multiple timers run simultaneously for different users without interference

**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Service User Intake & Experience
**Goal**: Service users can complete intake forms, returning users see welcome back with pre-filled data, and users can view timer countdown when wash is active and know when wash completes.

**Depends on**: Phase 4 (requires timer system for "wash complete" indication)

**Requirements**: USER-01, USER-02, USER-03, USER-04, USER-05

**Success Criteria** (what must be TRUE):
  1. Service user can complete intake form with phone, name, living situation, and number of loads
  2. Returning service user sees "welcome back" screen with pre-filled data from last visit
  3. Returning user can confirm pre-filled data or edit before submitting
  4. Service user sees timer countdown when wash cycle is active
  5. Service user receives clear visual indication when wash cycle completes

**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Volunteer Operations & Offline Support
**Goal**: Volunteers can see user statuses (waiting/washing/ready), view time remaining for all active timers, receive real-time updates from other volunteers, and view read-only queue when offline with clear offline mode indicator.

**Depends on**: Phase 5 (requires full user workflow to test offline scenarios)

**Requirements**: VOL-01, VOL-02, VOL-03, VOL-04, VOL-05, OFFLINE-01, OFFLINE-02, OFFLINE-03, OFFLINE-04, OFFLINE-05

**Success Criteria** (what must be TRUE):
  1. Volunteer dashboard shows which users are waiting vs washing vs ready to remove with visual differentiation
  2. Volunteer sees time remaining for all active timers on a single screen
  3. Volunteer can view queue in read-only mode when connectivity is lost
  4. Offline queue shows last-known state before connection lost without errors
  5. System displays clear "offline mode" indicator and error when volunteer attempts modification offline

**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Admin Functions
**Goal**: Admins can view all active sessions across locations, end sessions when events complete, regenerate volunteer QR codes if needed, and access all volunteer queue management functions.

**Depends on**: Phase 6 (requires complete volunteer workflow to extend to admin)

**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04

**Success Criteria** (what must be TRUE):
  1. Admin can view all active sessions across both locations in a single dashboard
  2. Admin can end session when event completes, marking it inactive
  3. Admin can regenerate volunteer QR codes for active session if volunteer loses access
  4. Admin has access to all volunteer queue management functions (view, add, remove, reorder)

**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Multi-Language Support
**Goal**: Users can select language preference (English or Spanish), all UI text displays in selected language, preference persists across sessions, and push notifications send in user's preferred language.

**Depends on**: Phase 7 (requires complete UI to translate)

**Requirements**: LANG-01, LANG-02, LANG-03, LANG-04

**Success Criteria** (what must be TRUE):
  1. User can select language preference from settings or initial onboarding
  2. All UI text (buttons, labels, headers, messages) displays in selected language
  3. Language preference persists when user closes and reopens app
  4. Push notifications send in user's preferred language (or default to English if unavailable)

**Plans**: TBD

Plans:
- [ ] 08-01: TBD

### Phase 9: Notifications
**Goal**: Volunteers receive push notifications when timers expire, notifications include user name and queue position, tapping opens app to that queue entry, and system handles permission requests.

**Depends on**: Phase 8 (requires multi-language support for translated notifications)

**Requirements**: NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04

**Success Criteria** (what must be TRUE):
  1. Volunteer receives push notification when timer expires for any user in their session
  2. Notification includes user name and queue position for context
  3. Tapping notification opens app directly to that user's queue entry
  4. System requests notification permissions on first volunteer login and handles denied/granted states

**Plans**: TBD

Plans:
- [ ] 09-01: TBD

### Phase 10: Data Collection & Export
**Goal**: System stores intake form data in Convex, exports queue data to Google Sheets in 60-second batches, includes complete event metadata, retries failed exports with exponential backoff, and logs failures.

**Depends on**: Phase 9 (all features complete, data export is final integration)

**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05

**Success Criteria** (what must be TRUE):
  1. System stores intake form data in Convex database immediately upon submission
  2. System exports queue data to Google Sheets every 60 seconds (not real-time)
  3. Google Sheets export includes user data, timestamps, timer durations, and volunteer assignments
  4. Failed Sheets exports retry with exponential backoff (1s, 2s, 4s, 8s, 16s)
  5. System logs export failures for manual review in Convex dashboard

**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Real-Time Infrastructure & Session Management | 5/5 | Complete | 2026-01-26 |
| 2. Authentication & Role Access | 8/8 | Complete | 2026-01-27 |
| 3. Queue Operations & Management | 0/5 | Not started | - |
| 4. Timer System | 0/TBD | Not started | - |
| 5. Service User Intake & Experience | 0/TBD | Not started | - |
| 6. Volunteer Operations & Offline Support | 0/TBD | Not started | - |
| 7. Admin Functions | 0/TBD | Not started | - |
| 8. Multi-Language Support | 0/TBD | Not started | - |
| 9. Notifications | 0/TBD | Not started | - |
| 10. Data Collection & Export | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-23*
*Last updated: 2026-01-27*
