---
status: resolved
trigger: "Fix the 'Invalid session QR code' error when service users scan session QR codes"
created: 2026-01-26T15:13:57.000Z
updated: 2026-01-26T15:30:00.000Z
---

## Current Focus

hypothesis: CONFIRMED - Service users scan volunteer QR codes (JSON format), but app/(user)/scan-qr.tsx calls validateSessionQR which expects "session:{sessionId}" format. Need to parse JSON and extract sessionId.
test: Apply same fix as volunteer scan - parse JSON, validate format, extract sessionId
expecting: Service users can scan volunteer QR codes successfully
next_action: Fix app/(user)/scan-qr.tsx to parse JSON and extract sessionId before validation

## Symptoms

expected: Service user scans session QR code in format "session:{sessionId}" and successfully joins queue
actual: Service user gets "Invalid session QR code" error when scanning
errors: "Uncaught Error: Invalid session QR code" at auth.ts:103
reproduction:
1. Admin creates session and gets volunteer QR codes
2. Service user completes registration form
3. Service user scans QR code on scan-qr screen
4. Error occurs in validateSessionQR mutation
started: Unknown, reported 2026-01-26

## Eliminated

## Evidence

- timestamp: 2026-01-26T15:15:00.000Z
  checked: convex/auth.ts validateSessionQR mutation (lines 94-129)
  found: Validates QR code format "session:{sessionId}" (line 100), extracts sessionId (line 104), looks up session in database
  implication: Backend expects simple string format "session:{sessionId}"

- timestamp: 2026-01-26T15:16:00.000Z
  checked: app/(admin)/session-qr-codes.tsx screen
  found: Generates volunteer QR codes, not session QR codes. QRCodeSlide component is used to display these.
  implication: Admin flow generates volunteer codes, not session codes

- timestamp: 2026-01-26T15:17:00.000Z
  checked: components/admin/QRCodeSlide.tsx (lines 14-18)
  found: QR value is JSON.stringify({ sessionId, volunteerId, type: 'volunteer_join' })
  implication: Volunteer QR codes are JSON objects, NOT simple "session:{sessionId}" format

- timestamp: 2026-01-26T15:18:00.000Z
  checked: app/(user)/scan-qr.tsx service user scan screen (line 48)
  found: Calls validateSessionQR with raw qrCode string from scanner
  implication: Service user expects to scan session QR codes, not volunteer codes

- timestamp: 2026-01-26T15:20:00.000Z
  checked: components/volunteer/screens/QRCodeGenerationScreen.tsx (lines 40-44)
  found: Instructions say "Have service users scan this QR code with their phone"
  implication: Service users ARE SUPPOSED TO scan volunteer QR codes, not separate session codes

- timestamp: 2026-01-26T15:21:00.000Z
  checked: PRD.md line 49
  found: "Service Users can scan a QR code provided by a Service Provider to initiate entry"
  implication: Confirms service users scan volunteer (service provider) QR codes

- timestamp: 2026-01-26T15:22:00.000Z
  checked: .planning/debug/invalid-qr-code-volunteer-scan.md (resolved debug session)
  found: Volunteers had same issue - JSON QR codes but validation expected UUID. Fixed by parsing JSON and extracting volunteerId.
  implication: Service users need same fix - parse JSON and extract sessionId

- timestamp: 2026-01-26T15:23:00.000Z
  checked: app/(volunteer)/scan-qr.tsx lines 40-50
  found: Volunteers parse JSON, validate type='volunteer_join', extract volunteerId, then call validateVolunteerQR
  implication: Service users should parse JSON, validate type, extract sessionId, then proceed with registration

## Resolution

root_cause: Service user scan flow doesn't parse volunteer QR code JSON format. Admin generates volunteer QR codes as JSON: `{"sessionId":"...","volunteerId":"<UUID>","type":"volunteer_join"}`. Service users scan these codes but app/(user)/scan-qr.tsx passes raw JSON string to validateSessionQR which expects "session:{sessionId}" format.

The correct flow:
1. Service user scans volunteer QR code (JSON format from QRCodeSlide)
2. Parse JSON and validate type='volunteer_join'
3. Extract sessionId from JSON
4. Pass sessionId directly to registerServiceUser (skip validateSessionQR entirely)

Note: validateSessionQR is for "session:{sessionId}" format QR codes, which don't currently exist. Service users scan volunteer QR codes instead.

fix: Modified app/(user)/scan-qr.tsx handleScan function:
1. Added JSON parsing for volunteer QR codes (lines 46-56)
2. Validates format: checks type='volunteer_join' and presence of sessionId
3. Extracts sessionId from JSON
4. Removed validateSessionQR mutation call (not needed)
5. Proceeds directly to registerServiceUser with extracted sessionId
6. Removed unused error state variable and references

The fix mirrors the volunteer scan flow - both parse the same JSON QR format but extract different fields (volunteers extract volunteerId, service users extract sessionId).

verification:
- Code compiles without errors
- Lint passes (removed unused error state)
- Logic flow: Scan QR → Parse JSON → Validate format → Extract sessionId → Register user → Submit intake → Save session → Navigate
- Error handling: Invalid JSON or missing fields throw clear error "QR code is not a valid volunteer code"

files_changed:
- app/(user)/scan-qr.tsx: Added JSON parsing, removed validateSessionQR call, cleaned up unused error state
