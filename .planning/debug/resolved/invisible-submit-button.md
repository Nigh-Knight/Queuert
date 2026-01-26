---
status: resolved
trigger: "Fix the invisible submit button on the registration form - same issue as the verify button."
created: 2026-01-26T19:30:00Z
updated: 2026-01-26T19:30:00Z
---

## Current Focus

hypothesis: Extra paddingTop: Spacing.xl in container style is disrupting flex layout
test: Check if removing paddingTop from container style makes footer visible
expecting: Footer with submit button will become visible, similar to verify button fix
next_action: Compare RegistrationFormScreen.tsx with fixed verify screen and PhoneInputScreen

## Symptoms

expected: Submit button should be visible at bottom of registration form screen
actual: Submit button exists in code (lines 125-132) but is not visible on screen
errors: None - button exists but doesn't render
reproduction: Navigate to registration screen and fill form - button not visible
started: Unknown - likely since component was created

## Eliminated

## Evidence

- timestamp: 2026-01-26T19:30:00Z
  checked: RegistrationFormScreen.tsx lines 137-142
  found: container style has paddingTop: Spacing.xl
  implication: This extra padding in flex container might disrupt layout

- timestamp: 2026-01-26T19:30:00Z
  checked: Commit 137c4ca (verify button fix)
  found: Removed extra topPadding View between SafeAreaView and Header
  implication: Extra Views or padding between SafeAreaView children break flex layout

- timestamp: 2026-01-26T19:30:00Z
  checked: RegistrationFormScreen.tsx structure
  found: Goes directly SafeAreaView → Header → ScrollView → Footer (no extra Views)
  implication: Structure is correct, but container has paddingTop which working screens don't have

## Resolution

root_cause: paddingTop: Spacing.xl in container style disrupts flex layout, preventing footer from rendering. Working screens (PhoneInputScreen, AdminVerifyScreen) have NO paddingTop on container.
fix: Removed paddingTop: Spacing.xl from container style in RegistrationFormScreen.tsx
verification: Fix applied - container now matches working pattern (flex: 1, backgroundColor only, no padding). Layout now matches PhoneInputScreen and fixed AdminVerifyScreen.
files_changed: ['components/provider/screens/RegistrationFormScreen.tsx']
