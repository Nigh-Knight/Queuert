---
status: resolved
trigger: "Fix the 'Invalid QR code' error when volunteers scan admin-generated QR codes"
created: 2026-01-26T20:15:00Z
updated: 2026-01-26T20:25:00Z
---

## Current Focus

hypothesis: QR code format mismatch - admin generates JSON with sessionId/volunteerId/type, but validateVolunteerQR expects just the raw qrCode UUID string
test: Check QRCodeSlide component vs validateVolunteerQR mutation logic
expecting: Admin generates JSON, validation expects UUID string directly
next_action: Fix by parsing JSON in scanner or changing validation to extract qrCode from JSON

## Symptoms

expected: Volunteer scans admin-generated QR code and successfully joins session
actual: Error "Invalid QR code" thrown at auth.ts line 19 (volunteer record not found)
errors: `Uncaught Error: Invalid QR code` at `convex/auth.ts:22:20`
reproduction:
1. Admin creates session with volunteers (generates QR codes)
2. Admin displays QR codes on session-qr-codes screen
3. Volunteer attempts to scan QR code via scan-qr screen
4. Validation fails with "Invalid QR code"

started: Always broken (design mismatch)

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-01-26T20:15:00Z
  checked: convex/auth.ts validateVolunteerQR mutation
  found: Line 13-16 queries volunteers table by qrCode using `by_qr_code` index. Expects args.qrCode to match volunteer.qrCode field directly.
  implication: Validation expects a raw UUID string

- timestamp: 2026-01-26T20:16:00Z
  checked: components/admin/QRCodeSlide.tsx
  found: Lines 14-18 generate QR value as JSON.stringify({ sessionId, volunteerId: qrCode, type: 'volunteer_join' })
  implication: Admin generates JSON string, NOT the raw UUID

- timestamp: 2026-01-26T20:17:00Z
  checked: convex/volunteers.ts generateVolunteerCodes
  found: Line 21 generates qrCode as crypto.randomUUID(), stores in volunteers.qrCode field
  implication: Database has UUID strings, not JSON

- timestamp: 2026-01-26T20:18:00Z
  checked: components/auth/QRScanner.tsx
  found: Line 49 passes result.data directly to onScanComplete (no parsing)
  implication: Raw scanned string (the JSON) is sent to validation

- timestamp: 2026-01-26T20:19:00Z
  checked: app/(volunteer)/scan-qr.tsx
  found: Line 41 calls validateVolunteerQR({ qrCode }) where qrCode is the raw scanned string
  implication: JSON string is passed to mutation which expects UUID

## Resolution

root_cause: Format mismatch between QR generation and validation. Admin generates QR codes containing JSON `{"sessionId":"...","volunteerId":"<UUID>","type":"volunteer_join"}`, but validateVolunteerQR expects the raw UUID string that matches the database volunteer.qrCode field.

The validation query `ctx.db.query("volunteers").withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))` looks for a volunteer where qrCode field equals the input. But the input is JSON, while the database has UUID strings.

fix: Added JSON parsing in app/(volunteer)/scan-qr.tsx handleScanComplete function. Now parses the QR code JSON, validates the format (checks for type='volunteer_join' and presence of volunteerId), then extracts the volunteerId UUID and passes that to validateVolunteerQR mutation instead of the full JSON string.

verification:
- Code compiles without errors
- Lint passes (only removed unused parseError variable)
- Logic flow: Scan QR → Parse JSON → Validate format → Extract volunteerId → Query database with UUID → Success
- Error handling: Invalid JSON or missing fields throw clear error message "QR code is not a valid volunteer code"

files_changed:
- app/(volunteer)/scan-qr.tsx: Added JSON parsing and validation before calling validateVolunteerQR mutation
