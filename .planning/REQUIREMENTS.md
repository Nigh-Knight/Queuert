# Requirements: Queuert

**Defined:** 2026-01-23
**Core Value:** Volunteers can efficiently manage the laundry queue and timers in real-time during events, ensuring service users know their position and when their wash completes.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Access Control

- [x] **AUTH-01**: Admin can verify identity using special verification code
- [x] **AUTH-02**: Volunteer can scan admin-generated QR code to join session
- [x] **AUTH-03**: Service user can enter phone number and name without authentication
- [x] **AUTH-04**: System differentiates between guest, volunteer, and admin roles
- [x] **AUTH-05**: Volunteer QR codes are unique per session and non-transferable

### Session Management

- [x] **SESS-01**: Admin can create session with location selection (Kam's Laundromat or Star Laundromat)
- [x] **SESS-02**: Admin can create session with date and time selection
- [x] **SESS-03**: System supports multiple concurrent sessions across different locations
- [x] **SESS-04**: Session isolates queue data (Location A volunteers cannot see Location B queue)
- [x] **SESS-05**: Admin can generate volunteer QR codes for active session

### Queue Management

- [ ] **QUEUE-01**: Service user can view their current position in queue in real-time
- [ ] **QUEUE-02**: Volunteer can view full queue with all users, positions, and statuses
- [ ] **QUEUE-03**: Queue position updates automatically across all connected devices
- [ ] **QUEUE-04**: When user removed from queue, remaining users auto-reposition (positions move up)
- [ ] **QUEUE-05**: Volunteer can manually reorder queue by dragging users to different positions
- [ ] **QUEUE-06**: Volunteer can search queue by user name or phone number
- [ ] **QUEUE-07**: Volunteer can add user to queue via QR scan
- [ ] **QUEUE-08**: Volunteer can add user to queue via manual entry (for users without phones)
- [ ] **QUEUE-09**: Volunteer can remove user from queue with confirmation dialog

### Timer System

- [ ] **TIMER-01**: Volunteer can start timer for user's wash cycle (default 23 minutes)
- [ ] **TIMER-02**: Volunteer can customize timer duration before starting
- [ ] **TIMER-03**: Timer countdown displays in real-time for all connected devices
- [ ] **TIMER-04**: Timer uses server-authoritative time to prevent drift across devices
- [ ] **TIMER-05**: Timer automatically updates user status to "ready to remove" when expired
- [ ] **TIMER-06**: Volunteer can mark timer as complete early
- [ ] **TIMER-07**: Multiple timers can run simultaneously for different users

### Service User Experience

- [ ] **USER-01**: Service user can complete intake form (phone, name, living situation, number of loads)
- [ ] **USER-02**: Returning service user sees "welcome back" with pre-filled data from last visit
- [ ] **USER-03**: Service user can confirm or edit pre-filled data before submission
- [ ] **USER-04**: Service user sees timer countdown when wash cycle is active
- [ ] **USER-05**: Service user receives clear indication when wash cycle completes

### Volunteer Operations

- [ ] **VOL-01**: Volunteer can see which users are waiting vs washing vs ready to remove
- [ ] **VOL-02**: Volunteer can see time remaining for all active timers
- [ ] **VOL-03**: Volunteer dashboard updates in real-time when any volunteer makes changes
- [ ] **VOL-04**: Volunteer can view offline read-only queue when connectivity is lost
- [ ] **VOL-05**: Volunteer sees clear "offline mode" indicator when not connected

### Admin Functions

- [ ] **ADMIN-01**: Admin can view all active sessions across locations
- [ ] **ADMIN-02**: Admin can end session when event completes
- [ ] **ADMIN-03**: Admin can regenerate volunteer QR codes if needed
- [ ] **ADMIN-04**: Admin has access to all volunteer queue management functions

### Notifications

- [ ] **NOTIF-01**: Volunteer receives push notification when timer expires
- [ ] **NOTIF-02**: Push notification includes user name and queue position
- [ ] **NOTIF-03**: Tapping notification opens app to that user's queue entry
- [ ] **NOTIF-04**: System handles notification permissions (request on first volunteer login)

### Data Collection & Export

- [ ] **DATA-01**: System stores intake form data in Convex database
- [ ] **DATA-02**: System exports queue data to Google Sheets in batches (60-second intervals)
- [ ] **DATA-03**: Google Sheets export includes user data, timestamps, timer durations, volunteer assignments
- [ ] **DATA-04**: Failed Sheets exports retry with exponential backoff
- [ ] **DATA-05**: System logs export failures for manual review

### Multi-language Support

- [ ] **LANG-01**: User can select language preference (English or Spanish)
- [ ] **LANG-02**: All UI text displays in selected language
- [ ] **LANG-03**: Language preference persists across app sessions
- [ ] **LANG-04**: Push notifications send in user's preferred language

### Offline Capability

- [ ] **OFFLINE-01**: Volunteer can view queue in read-only mode when offline
- [ ] **OFFLINE-02**: Offline queue shows last-known state before connection lost
- [ ] **OFFLINE-03**: System displays clear error when volunteer attempts modification offline
- [ ] **OFFLINE-04**: Queue auto-syncs when connection restored
- [ ] **OFFLINE-05**: Service user requires network connection to submit intake form

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Extended Language Support

- **LANG-05**: Portuguese language support
- **LANG-06**: Haitian Creole language support

### Advanced Analytics

- **ANALYTICS-01**: Dashboard showing average wait times per event
- **ANALYTICS-02**: Historical trends for load volume across locations
- **ANALYTICS-03**: Volunteer efficiency metrics

### Enhanced Notifications

- **NOTIF-05**: Estimated wait time notifications ("Your turn in ~15 minutes")
- **NOTIF-06**: Event reminder notifications for volunteers
- **NOTIF-07**: Customizable notification preferences

### Offline Write Capabilities

- **OFFLINE-06**: Volunteer can add users to queue while offline
- **OFFLINE-07**: Volunteer can start timers while offline
- **OFFLINE-08**: System handles conflict resolution when multiple volunteers edit offline

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| SMS notifications | No budget for SMS costs; push notifications sufficient |
| Appointment scheduling | Laundry Love is walk-in service only; appointments imply scarcity |
| User accounts with passwords | Barrier for homeless population; phone-only approach maintains accessibility |
| Payment processing | Service is free; no financial transactions |
| Machine integration | No control of physical laundry machines; volunteers manage manually |
| AI-powered queue optimization | Risk of bias with vulnerable populations; manual FIFO + volunteer override only |
| Gamification (points, rewards) | Inappropriate for service context; focus on clarity and dignity |
| Video calls or chat | Out of scope for MVP; face-to-face interaction at event |
| Inventory management | Detergent/supplies tracking not part of queue management |
| Complex CRM features | Basic data collection only; not comprehensive client tracking |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| SESS-01 | Phase 1 | Complete |
| SESS-02 | Phase 1 | Complete |
| SESS-03 | Phase 1 | Complete |
| SESS-04 | Phase 1 | Complete |
| SESS-05 | Phase 1 | Complete |
| QUEUE-01 | Phase 3 | Pending |
| QUEUE-02 | Phase 3 | Pending |
| QUEUE-03 | Phase 3 | Pending |
| QUEUE-04 | Phase 3 | Pending |
| QUEUE-05 | Phase 3 | Pending |
| QUEUE-06 | Phase 3 | Pending |
| QUEUE-07 | Phase 3 | Pending |
| QUEUE-08 | Phase 3 | Pending |
| QUEUE-09 | Phase 3 | Pending |
| TIMER-01 | Phase 4 | Pending |
| TIMER-02 | Phase 4 | Pending |
| TIMER-03 | Phase 4 | Pending |
| TIMER-04 | Phase 4 | Pending |
| TIMER-05 | Phase 4 | Pending |
| TIMER-06 | Phase 4 | Pending |
| TIMER-07 | Phase 4 | Pending |
| USER-01 | Phase 5 | Pending |
| USER-02 | Phase 5 | Pending |
| USER-03 | Phase 5 | Pending |
| USER-04 | Phase 5 | Pending |
| USER-05 | Phase 5 | Pending |
| VOL-01 | Phase 6 | Pending |
| VOL-02 | Phase 6 | Pending |
| VOL-03 | Phase 6 | Pending |
| VOL-04 | Phase 6 | Pending |
| VOL-05 | Phase 6 | Pending |
| ADMIN-01 | Phase 7 | Pending |
| ADMIN-02 | Phase 7 | Pending |
| ADMIN-03 | Phase 7 | Pending |
| ADMIN-04 | Phase 7 | Pending |
| NOTIF-01 | Phase 9 | Pending |
| NOTIF-02 | Phase 9 | Pending |
| NOTIF-03 | Phase 9 | Pending |
| NOTIF-04 | Phase 9 | Pending |
| DATA-01 | Phase 10 | Pending |
| DATA-02 | Phase 10 | Pending |
| DATA-03 | Phase 10 | Pending |
| DATA-04 | Phase 10 | Pending |
| DATA-05 | Phase 10 | Pending |
| LANG-01 | Phase 8 | Pending |
| LANG-02 | Phase 8 | Pending |
| LANG-03 | Phase 8 | Pending |
| LANG-04 | Phase 8 | Pending |
| OFFLINE-01 | Phase 6 | Pending |
| OFFLINE-02 | Phase 6 | Pending |
| OFFLINE-03 | Phase 6 | Pending |
| OFFLINE-04 | Phase 6 | Pending |
| OFFLINE-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55 (100% coverage)
- Unmapped: 0

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23 after roadmap creation*
