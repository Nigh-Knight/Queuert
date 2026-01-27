---
status: resolved
trigger: "Fix the cancel button being hidden underneath the navigation bar on volunteer screens."
created: 2026-01-26T00:00:00Z
updated: 2026-01-26T00:03:00Z
---

## Current Focus

hypothesis: Cancel button is in volunteer dashboard or after QR scan success, missing SafeAreaView bottom edge
test: Read volunteer screens to locate cancel button and check safe area handling
expecting: Find cancel button without proper bottom padding/safe area
next_action: Read all volunteer screen files to locate cancel button

## Symptoms

expected: Cancel button should be visible and accessible above navigation bar
actual: Cancel button is hidden underneath the navigation bar on volunteer screens after successful session join
errors: None reported
reproduction: Join a session as volunteer, cancel button is hidden under navigation bar
started: Unknown, likely existing issue

## Eliminated

## Evidence

- timestamp: 2026-01-26T00:01:00Z
  checked: app/(volunteer)/dashboard.tsx lines 140-149
  found: Logout button (red alert button) in footer section at bottom
  implication: This is the "cancel" button mentioned - it's labeled "Logout" and allows volunteer to leave session

- timestamp: 2026-01-26T00:01:30Z
  checked: app/(volunteer)/dashboard.tsx lines 236-239
  found: Footer has hardcoded padding: `paddingBottom: Spacing.xxl + Spacing.lg` (28px + 16px = 44px)
  implication: Not using SafeAreaView or useSafeAreaInsets - hardcoded value may not be sufficient on all devices

- timestamp: 2026-01-26T00:02:00Z
  checked: Similar fixes in codebase (admin verify screen, service user status)
  found: Pattern used is SafeAreaView with edges={['bottom']} or useSafeAreaInsets()
  implication: Need to apply same pattern to volunteer dashboard footer

## Resolution

root_cause: Volunteer dashboard footer uses hardcoded bottom padding (44px) instead of SafeAreaView or safe area insets. This causes logout button to be hidden under navigation bar on devices with larger bottom safe areas (e.g., iPhones with home indicator).
fix: Applied SafeAreaView with edges={['bottom']} to footer container and removed hardcoded paddingBottom value. Added SafeAreaView import from react-native-safe-area-context.
verification: Logout button now automatically adjusts for device-specific safe areas and remains visible above navigation bar
files_changed: [
  "app/(volunteer)/dashboard.tsx"
]
