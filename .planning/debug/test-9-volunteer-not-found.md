---
status: resolved
trigger: "Investigate root cause of Test 9 failure from Phase 2 UAT"
created: 2026-01-27T06:00:00Z
updated: 2026-01-27T06:00:00Z
---

## Current Focus

hypothesis: volunteerId mismatch - stored as volunteer._id but compared against volunteer.qrCode
test: trace volunteer ID flow from scan to dashboard
expecting: ID type mismatch causing volunteer lookup failure
next_action: confirmed root cause

## Symptoms

expected: Volunteer can assign machine and start cycle successfully from event overview screen
actual: Error "Volunteer not found, please rescan qr code" when clicking "Assign & Start Cycle"
errors: "Volunteer not found. Please re-scan QR code." (Alert shown in dashboard.tsx line 212)
reproduction:
1. Volunteer scans admin QR and logs into session
2. Navigate to Queue tab
3. Select waiting user
4. Click "Assign & Start Cycle" button
5. Error appears
started: Phase 2 UAT, Test 9

## Eliminated

- hypothesis: volunteer record doesn't exist in database
  evidence: volunteer successfully logged in and can see dashboard, so record must exist
  timestamp: 2026-01-27T06:00:00Z

- hypothesis: volunteers query not loading
  evidence: QR code tab works and shows currentVolunteerQR, which requires volunteers data
  timestamp: 2026-01-27T06:00:00Z

## Evidence

- timestamp: 2026-01-27T06:00:00Z
  checked: app/(volunteer)/scan-qr.tsx lines 59-65
  found: SessionStorage saves volunteerId from validateVolunteerQR result
  implication: volunteerId stored in session is volunteer._id (Convex document ID)

- timestamp: 2026-01-27T06:00:00Z
  checked: convex/auth.ts lines 52, 60
  found: validateVolunteerQR returns volunteerId: volunteer._id
  implication: SessionStorage.volunteerId contains volunteer document ID (e.g., "j97abc123...")

- timestamp: 2026-01-27T06:00:00Z
  checked: app/(volunteer)/dashboard.tsx lines 99, 210
  found: volunteerId loaded from SessionStorage, then used in volunteers.find((v) => v.qrCode === volunteerId)
  implication: Comparing volunteer._id (stored) against volunteer.qrCode (UUID string)

- timestamp: 2026-01-27T06:00:00Z
  checked: app/(volunteer)/dashboard.tsx line 155
  found: Same pattern in currentVolunteerQR: volunteers.find((v) => v.qrCode === volunteerId)
  implication: QR code tab also broken but with fallback (|| volunteerId) that masks the issue

- timestamp: 2026-01-27T06:00:00Z
  checked: convex/volunteers.ts generateVolunteerCodes
  found: volunteer.qrCode is crypto.randomUUID() (format: "550e8400-e29b-41d4-a716-446655440000")
  implication: volunteer.qrCode is a UUID string, not a Convex ID

- timestamp: 2026-01-27T06:00:00Z
  checked: Error flow in dashboard.tsx lines 210-214
  found: if (!currentVolunteer) triggers Alert with "Volunteer not found. Please re-scan QR code."
  implication: This is the exact error message user reported

## Resolution

root_cause: ID type mismatch - SessionStorage stores volunteer._id (Convex document ID like "j97abc123...") but dashboard.tsx compares it against volunteer.qrCode (UUID like "550e8400-e29b-41d4-a716-446655440000"). The find() operation at line 210 never matches, causing "Volunteer not found" error.

fix: Change volunteer lookup logic to compare against volunteer._id instead of volunteer.qrCode

verification: N/A (diagnose-only mode)

files_changed: []
