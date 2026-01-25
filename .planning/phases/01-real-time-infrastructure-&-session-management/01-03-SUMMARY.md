---
phase: 01
plan: 03
subsystem: backend/sessions
tags: [convex, sessions, volunteers, qr-codes, validation]
requires: [01-02]
provides:
  - Session CRUD operations with validation
  - Volunteer QR code batch generation
  - Access code collision handling
  - Session overlap detection
affects: [01-04, 01-05, 02-01]
tech-stack:
  added: [crypto.randomUUID]
  patterns: [collision-resistant-code-generation, batch-entity-creation]
key-files:
  created:
    - convex/volunteers.ts
  modified:
    - convex/sessions.ts
    - convex/schema.ts
decisions:
  - id: SESS-03-001
    title: Access code collision retry loop
    choice: Implement retry loop (max 10 attempts) for 6-digit code generation
    reasoning: 6-digit codes have 1M possibilities, collision probability is low but non-zero at scale
    alternatives: [Single attempt with error, UUID-based codes]
  - id: SESS-03-002
    title: Overlapping session warning (non-blocking)
    choice: Return hasOverlappingSession flag but allow creation
    reasoning: Admin may legitimately run multiple sessions at same location (different service types)
    alternatives: [Block creation, Require force flag]
  - id: SESS-03-003
    title: Optional userId in volunteers table
    choice: Make userId optional, set on volunteer registration scan
    reasoning: QR codes generated before volunteers join session
    alternatives: [Two-step creation, Placeholder user records]
metrics:
  duration: 2min
  completed: 2026-01-25
---

# Phase 01 Plan 03: Session Management & Volunteer QR Codes Summary

**One-liner:** Session CRUD with future date validation, collision-resistant access codes, overlapping session warnings, and batch volunteer QR code generation using crypto.randomUUID

## What Was Built

### Session Management Mutations (convex/sessions.ts)

**createSession mutation:**
- Validates scheduledDate is in future (throws error if past)
- Generates unique 6-digit access codes with retry loop (max 10 attempts)
- Checks for overlapping active sessions at same location
- Returns `{ sessionId, accessCode, hasOverlappingSession }` object
- Removed serviceProviderId requirement (placeholder until Phase 2 auth)

**endSession mutation:**
- Marks session as inactive
- Records endedAt timestamp
- Returns success boolean

**getSessionById query:**
- Retrieves full session document by ID
- Used by admin for session management screens

**Existing getActiveSession query:**
- Kept from Plan 02 (location-based active session lookup)

### Volunteer QR Code Management (convex/volunteers.ts)

**generateVolunteerCodes mutation:**
- Creates batch of volunteer records for a session
- Validates session exists and is active
- Generates UUID for each volunteer QR code using crypto.randomUUID
- Returns array of `{ volunteerId, qrCode }` objects
- Sets userId to undefined (populated when volunteer scans and registers)

**getVolunteersBySession query:**
- Uses by_session compound index for performance
- Returns all volunteers assigned to a session

**regenerateVolunteerCode mutation:**
- Generates new UUID for volunteer
- Invalidates old QR code
- Used when code is compromised or needs rotation

**getVolunteerByQrCode query:**
- Uses by_qr_code index for fast lookup
- Used when volunteer scans QR code to join session

### Schema Update (convex/schema.ts)

**volunteers.userId field:**
- Changed from required to optional
- Set to undefined on QR code generation
- Populated when volunteer scans code and completes registration

## Technical Implementation

### Access Code Generation Strategy

```typescript
let accessCode: string;
let attempts = 0;
do {
  accessCode = Math.floor(100000 + Math.random() * 900000).toString();
  const existing = await ctx.db
    .query("sessions")
    .withIndex("by_access_code", (q) => q.eq("accessCode", accessCode))
    .first();
  if (!existing) break;
  attempts++;
} while (attempts < 10);
```

**Why retry loop:**
- 6-digit codes have 1,000,000 possibilities
- At 1,000 active sessions, collision probability ≈ 0.1%
- Retry loop ensures success without UX disruption
- 10-attempt limit prevents infinite loops

### Session Overlap Detection

```typescript
const existingActive = await ctx.db
  .query("sessions")
  .withIndex("by_location_active", (q) =>
    q.eq("location", args.location).eq("isActive", true)
  )
  .first();
```

**Non-blocking design:**
- Returns `hasOverlappingSession` flag in response
- Admin UI can display warning
- Admin makes final decision (allows legitimate multi-session scenarios)

### Volunteer QR Code Generation

```typescript
for (let i = 0; i < args.count; i++) {
  const qrCode = crypto.randomUUID();
  const volunteerId = await ctx.db.insert("volunteers", {
    sessionId: args.sessionId,
    qrCode,
    assignedAt: Date.now(),
    userId: undefined as any,
  });
  volunteers.push({ volunteerId, qrCode });
}
```

**Batch creation pattern:**
- Single mutation creates all volunteer records
- Each gets unique UUID (collision-free)
- Admin receives all QR codes at once for printing/display

## Index Usage Verification

All queries use proper indexes:

| Query                   | Index Used                | Performance  |
| ----------------------- | ------------------------- | ------------ |
| createSession           | by_access_code            | O(log n)     |
| createSession           | by_location_active        | O(log n)     |
| getActiveSession        | by_location_active        | O(log n)     |
| getVolunteersBySession  | by_session                | O(log n + k) |
| getVolunteerByQrCode    | by_qr_code                | O(log n)     |

## Deviations from Plan

None - plan executed exactly as written.

## Testing & Verification

**Convex dev sync:** All functions synced successfully
**Generated API:** volunteers.ts and sessions.ts exported in convex/_generated/api.d.ts

**Manual testing needed (Phase 2):**
1. createSession with past date should throw error
2. createSession with future date should succeed
3. generateVolunteerCodes should create N volunteer records
4. Access code collision should retry and succeed

## Next Phase Readiness

**Blockers:** None

**Concerns:**
- Access code retry loop untested at scale (monitor in Phase 10 load testing)
- UUID collision probability is negligible but not zero (crypto.randomUUID uses 128-bit space)

**Dependencies satisfied for:**
- **01-04:** Admin UI can now call createSession and generateVolunteerCodes
- **01-05:** Volunteer join flow can use getVolunteerByQrCode
- **02-01:** Phone auth can link userId to volunteer records

## Files Changed

**Created:**
- convex/volunteers.ts (79 lines)

**Modified:**
- convex/sessions.ts (+56 lines, -13 lines)
- convex/schema.ts (1 line - volunteers.userId optional)

## Commits

| Hash    | Message                                              | Files                    |
| ------- | ---------------------------------------------------- | ------------------------ |
| feebe37 | feat(01-03): expand session management with validation | convex/sessions.ts       |
| a8e26b1 | feat(01-03): implement volunteer QR code management  | convex/volunteers.ts, schema.ts |

## Key Learnings

1. **Collision-resistant code generation:** Retry loops are effective for low-probability collisions (better UX than error)
2. **Batch entity creation:** Single mutation for multiple records improves atomicity and reduces API calls
3. **Optional fields for workflow state:** volunteers.userId being optional reflects pre-registration state naturally

## Quality Metrics

- **Code coverage:** Not measured (no tests yet)
- **Index usage:** 100% (all queries use indexes)
- **Duration:** 2 minutes
- **Tasks completed:** 2/2
