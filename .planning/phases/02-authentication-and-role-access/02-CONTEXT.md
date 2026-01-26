# Phase 2: Authentication & Role Access - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Users access the app according to their role (admin with verification code, volunteer via QR scan, service user with phone/name only), and the system differentiates permissions. This phase connects existing UI screens to Convex backend for actual authentication and implements session/role context that persists across the app.

</domain>

<decisions>
## Implementation Decisions

### QR Code Validation
- QR code contains: Volunteer ID + Session ID
- Validation method: Check format + Convex lookup (verify session and volunteer exist in database)
- Cross-session scanning: Auto-switch to new session (allow volunteers to join any session they scan)
- Ended session handling: Show error - cannot join ended sessions
- Manual entry: No fallback - camera scanning only
- Duplicate scan (same session): Skip confirmation, navigate directly to dashboard
- One session at a time: Scanning new QR logs volunteer out of previous session
- Session switch confirmation: Yes - show "Join [Location] session on [Date]?" with Cancel/Join buttons
- Success feedback: Success toast + navigate to volunteer dashboard

### Volunteer QR Scanning UX
- Library: expo-camera (official Expo camera with barcode scanning)
- Scanner display: Camera view + instructions text ("Point camera at volunteer QR code")
- Scanning mode: Auto-scan (instant detection when QR in frame)
- Scan failure: Toast error message + stay on scanner (camera remains active)
- Flashlight: No flashlight control
- Back navigation: Native back only (Android back button / iOS swipe)
- Camera permissions: Pre-check and request before showing scanner screen
- Permission denied: Block with instructions ("Camera required to scan QR codes. Go to Settings > Queuert > Allow Camera")
- Scanner timeout: No timeout - manual back only

### Role Persistence
- Login duration: Until session ends (logout when admin ends session)
- Storage location: AsyncStorage (persistent across app restarts)
- Session validation: Verify with Convex on startup (check session.isActive before auto-resuming)
- Session end handling: Auto-logout with notification ("Session ended by admin" message, return to role selection)
- Service user persistence: Remember for session duration only (if they close/reopen during active session)
- Manual logout: Yes - provide logout button in settings/menu for volunteers and admins
- App reopen: Auto-resume session (check AsyncStorage, reconnect if session still active)
- Session duration: Manual only - sessions stay active until admin manually ends them (no automatic timeout)

### Service User Phone Validation
- Phone format: International with country codes (+1, +52, etc.)
- Returning user identification: Phone number only (if phone exists in database, treat as returning)
- No phone scenario: Allow skip - volunteers can add users manually with name only
- Phone verification: Just collect - no OTP verification required
- Name validation: First + last name required (both fields mandatory, minimum 2 characters each)
- Duplicate phones: Block duplicates (prevent same phone from joining queue twice in same session)
- Duplicate error message: Generic - "This phone number is already in the queue for this session"

### Claude's Discretion
- AsyncStorage cached data structure (session ID, role, location balance)
- Exact error toast styling and duration
- Loading states during Convex validation
- Camera overlay design details

</decisions>

<specifics>
## Specific Ideas

- Admin verification already implemented with "kepler cool" code in VerificationScreen.tsx
- Use compound indexes for session isolation (established in Phase 1)
- Sessions have `isActive` boolean and manual `endSession` mutation (no auto-expiration)

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 02-authentication-and-role-access*
*Context gathered: 2026-01-26*
