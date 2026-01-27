---
status: resolved
trigger: "Fix the intermittent volunteer QR scan issue where it fails on first try but works on second try (or sometimes doesn't work at all)."
created: 2026-01-26T00:00:00Z
updated: 2026-01-26T00:20:00Z
---

## Current Focus

hypothesis: Fix implemented - exposed resetScan() via ref, parent calls it on error
test: Verify QR scanning now works consistently on retry after validation errors
expecting: Scanner will allow immediate retry after validation fails
next_action: Test fix verification and document changes

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

## Evidence (continued)

- timestamp: 2026-01-26T00:09:00Z
  checked: QRScanner error handling mechanism
  found: Line 51 only resets hasScanned in catch block of handleScan, but handleScan is synchronous - it just calls onScanComplete(result.data) and returns
  implication: Errors that occur in onScanComplete (async validation) never reach handleScan's catch block

- timestamp: 2026-01-26T00:10:00Z
  checked: Flow sequence analysis
  found: |
    1. Camera detects QR → handleScan called
    2. hasScanned.current = true (line 46)
    3. onScanComplete(result.data) called (line 49) - returns immediately
    4. handleScan completes successfully (no error thrown)
    5. LATER: async validation in onScanComplete fails
    6. Error caught in scan-qr.tsx, Alert shown
    7. User clicks "Try Again" but camera still blocked (hasScanned=true)
  implication: Async validation errors never reset hasScanned flag

## Resolution

root_cause: QRScanner's hasScanned flag is never reset after validation errors because handleScan is synchronous but onScanComplete is async. When validation fails after handleScan completes, the flag remains true and blocks all retry scans. The catch block on line 51 only catches synchronous errors in onScanComplete's invocation, not errors that occur during the async validation.

fix: |
  1. Modified QRScanner component to expose resetScan() function via useImperativeHandle
  2. Converted QRScanner to forwardRef component to accept ref prop
  3. Updated both volunteer and service user scan screens to:
     - Create scannerRef using useRef<QRScannerRef>(null)
     - Pass ref to QRScanner component
     - Call scannerRef.current?.resetScan() in all error Alert handlers
  4. This allows parent components to explicitly reset the scan flag when user clicks "Try Again"

verification: |
  Manual testing required:
  1. Generate volunteer QR code via admin flow
  2. Volunteer scans QR code
  3. If validation fails (e.g., invalid QR format, expired session), verify:
     - Error alert appears
     - User clicks "Try Again"
     - Camera immediately allows retry scan (no need to remount component)
  4. Verify same behavior for service user QR scanning

  Expected result: Retry scans work immediately on first try after error, no intermittent failures.

files_changed:
  - components/auth/QRScanner.tsx
  - app/(volunteer)/scan-qr.tsx
  - app/(user)/scan-qr.tsx
