---
status: investigating
trigger: "Fix the intermittent volunteer QR scan issue where it fails on first try but works on second try (or sometimes doesn't work at all)."
created: 2026-01-26T00:00:00Z
updated: 2026-01-26T00:00:00Z
---

## Current Focus

hypothesis: hasScanned.current flag in QRScanner prevents rescans even when validation fails, causing intermittent behavior
test: Check if hasScanned.current is reset when errors occur
expecting: Flag is NOT reset on validation errors, blocking retry scans
next_action: Trace error flow from validateVolunteerQR through handleScanComplete to QRScanner

## Symptoms

expected: Volunteer scans admin-generated QR code and is immediately validated/logged in on first scan
actual: Sometimes works on first scan, sometimes fails on first but works on second, sometimes doesn't work at all. Service users scanning same QR codes work more consistently.
errors: Unknown - need to check if errors are being swallowed
reproduction: Volunteer scans admin-generated QR code
started: Unknown - recent fix in commit 17b7228 added JSON parsing but intermittent behavior persists

## Eliminated

## Evidence

- timestamp: 2026-01-26T00:05:00Z
  checked: QRScanner component (components/auth/QRScanner.tsx)
  found: hasScanned useRef flag set to true on first scan (line 46), only reset on component mount (line 37) or in catch block (line 51)
  implication: If validation fails AFTER handleScan returns, hasScanned flag remains true and blocks retry scans

- timestamp: 2026-01-26T00:06:00Z
  checked: Volunteer scan flow (app/(volunteer)/scan-qr.tsx)
  found: handleScanComplete is async and calls validateVolunteerQR mutation (line 53), but QRScanner's handleScan is synchronous and sets hasScanned=true immediately
  implication: Race condition - hasScanned blocks retries before async validation completes or fails

- timestamp: 2026-01-26T00:07:00Z
  checked: QR code generation flow (components/admin/QRCodeSlide.tsx and convex/volunteers.ts)
  found: QR codes are properly generated with JSON format including volunteerId, sessionId, and type='volunteer_join'. Volunteer records are created in DB.
  implication: QR generation is correct - issue is in scanning/validation flow

- timestamp: 2026-01-26T00:08:00Z
  checked: Error handling in scan-qr.tsx
  found: All errors caught in try-catch (line 75-96), error state set, Alert shown with "Try Again" button that resets error state. BUT QRScanner's hasScanned flag is never reset.
  implication: User sees "Try Again" alert, but camera is blocked from scanning again because hasScanned=true

## Resolution

root_cause:
fix:
verification:
files_changed: []
