# Queuert

## What This Is

Queuert is a mobile queue management system for Laundry Love events that replaces paper-based tracking. Service users (guests experiencing homelessness) enter their information and track their laundry queue position and wash timer, while volunteers manage the full queue and start/stop wash cycles at Kam's Laundromat and Star Laundromat.

## Core Value

Volunteers can efficiently manage the laundry queue and timers in real-time during events, ensuring service users know their position and when their wash completes.

## Requirements

### Validated

- ✓ Convex schema defined (users, intakeForms, queue, sessions, volunteers tables) — existing
- ✓ Expo app initialized with React Native — existing
- ✓ Atomic UI component library built — existing
- ✓ File-based routing structure (Expo Router) — existing
- ✓ Design system with theme constants — existing

### Active

- [ ] Admin can create sessions with location + date/time selection
- [ ] Admin can generate volunteer QR codes for session
- [ ] Admin authentication via special verification code
- [ ] Volunteer scans QR code to join session (no phone number required)
- [ ] Service user enters phone + name + intake data (no authentication)
- [ ] Service user sees "welcome back" with pre-filled data if phone exists
- [ ] Convex mutations for intake form submission
- [ ] Convex mutations for queue management (add, remove, reposition)
- [ ] Queue positions auto-recalculate when someone removed
- [ ] Convex mutations for timer management (start, update, complete)
- [ ] Timer duration customizable by volunteer (default 23 minutes)
- [ ] Timer state synchronized across all volunteer devices
- [ ] Real-time queue updates for all connected users
- [ ] Google Sheets real-time export on every queue action
- [ ] Offline read-only queue view for volunteers
- [ ] Multi-language support (Spanish, Portuguese, Haitian Creole)
- [ ] Location selection (Kam's Laundromat, Star Laundromat)
- [ ] Support multiple concurrent sessions across locations
- [ ] Basic navigation structure (role selection → session join → queue view)
- [ ] Placeholder UI screens for testing (Builder.io replacement later)

### Out of Scope

- SMS message sending — Just store phone numbers, no Twilio costs
- Phone/OTP authentication — Simplified to data entry only
- Payment processing — Not part of queue management
- Machine integration — No control of physical washers
- Full CRM system — Basic data collection only
- Appointment scheduling — Walk-up service, no reservations
- Inventory management — No supplies tracking
- Advanced analytics — Basic queue metrics only
- UI polish with Builder.io — Handled outside GSD workflow

## Context

**Service Model:**
- Laundry Love provides free laundry services to people experiencing homelessness
- Events held at two locations: Kam's Laundromat and Star Laundromat
- Volunteers manage queue, service users get laundry done

**Technical Environment:**
- Expo 54 with React Native 0.81
- Convex backend for real-time operations
- Google Sheets for historical data and reporting
- Multi-platform deployment (iOS, Android, Web)

**User Research:**
- Service users often arrive in large groups (high-volume waves)
- Volunteers know each other and coordinate well
- Spotty internet connectivity common at event locations
- Users speak multiple languages (English, Spanish, Portuguese, Haitian Creole)
- Target scale: 100 simultaneous users, 10-15 volunteers per location

**Known Issues:**
- Paper-based queue system is inefficient and error-prone
- Users don't know when their wash completes
- No historical data for event planning and metrics
- Manual data collection is incomplete

## Constraints

- **Tech Stack**: Expo + React Native + Convex — Already established, must maintain
- **No SMS costs**: Store phone numbers only, do not send messages — Budget constraint
- **Offline capability**: Read-only queue view when offline — Connectivity is unreliable
- **Real-time sync**: Google Sheets export must happen immediately — Data integrity requirement
- **Multi-language**: Spanish, Portuguese, Haitian Creole required — User accessibility
- **Timeline**: Backend-first phases, UI redesign happening separately — Development sequencing
- **Scalability**: Support 100+ users, 15+ volunteers simultaneously — Performance requirement

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No authentication for service users | Events are time-sensitive, phone+name sufficient for identification, no friction | — Pending |
| QR-based volunteer access only | Prevents unauthorized queue management, admin controls who joins | — Pending |
| Admin verification code system | Secure admin access without complex account infrastructure | — Pending |
| Convex as primary DB, Sheets for export | Real-time operations need Convex performance, Sheets for data engineering/reporting | — Pending |
| Real-time Sheets sync (not batched) | Immediate data availability for event organizers, errors caught early | — Pending |
| Backend-first development phases | UI being redesigned with Builder.io separately, focus on API layer first | — Pending |
| Auto-reposition queue on removal | Dynamic queue reflects reality, users see accurate wait times | — Pending |
| Welcome back with pre-fill | Faster re-entry for repeat users, data accuracy improved | — Pending |
| Offline read-only (not full offline) | Simpler implementation, connection required for modifications prevents conflicts | — Pending |
| Customizable timer duration | Different load sizes need different times, volunteer has context | — Pending |

---
*Last updated: 2026-01-23 after initialization*
