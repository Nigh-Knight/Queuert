---
status: resolved
trigger: "Fix camera overlap and remove back button on the 'Complete your profile' page."
created: 2026-01-26T00:00:00Z
updated: 2026-01-26T00:10:00Z
---

## Current Focus

hypothesis: CONFIRMED - RegistrationFormScreen passes onBackPress to Header, causing back button. SafeAreaView doesn't respect camera safe area.
test: Remove onBackPress prop and add paddingTop to SafeAreaView
expecting: No back button, proper safe area at top
next_action: Apply fix to components/provider/screens/RegistrationFormScreen.tsx and app/(user)/registration.tsx

## Symptoms

expected:
- No back button (users use native back)
- Text should not overlap with camera notch
- Proper safe area padding at top

actual:
- Text overlapping with front-facing camera notch
- Back button is present

errors: None reported

reproduction: Navigate to "Complete your profile" screen

started: Current state (user reported)

## Eliminated

## Evidence

- timestamp: 2026-01-26T00:05:00Z
  checked: Searched for "Complete your profile" text
  found: RegistrationFormScreen.tsx contains Header with title "Complete Your Profile"
  implication: This is the screen that needs fixing

- timestamp: 2026-01-26T00:06:00Z
  checked: components/provider/screens/RegistrationFormScreen.tsx
  found: Line 71 has <Header title="Complete Your Profile" onBackPress={onBack} />
  implication: onBackPress prop is causing back button to appear

- timestamp: 2026-01-26T00:07:00Z
  checked: components/provider/atoms/Header.tsx
  found: Lines 28-38 show conditional rendering - if onBackPress exists, back button is rendered
  implication: Need to remove onBackPress prop to remove back button

- timestamp: 2026-01-26T00:08:00Z
  checked: app/(admin)/verify.tsx (reference pattern)
  found: Line 97 uses <Header title="Admin Access" /> with NO onBackPress prop
  implication: Same pattern should be applied to registration screen

- timestamp: 2026-01-26T00:09:00Z
  checked: RegistrationFormScreen container style
  found: SafeAreaView at line 70 with styles.container (no top padding beyond SafeAreaView)
  implication: SafeAreaView alone doesn't handle camera notch well - need explicit paddingTop

## Resolution

root_cause:
1. Back button appears because RegistrationFormScreen.tsx passes onBackPress prop to Header component
2. Camera overlap occurs because SafeAreaView doesn't add enough top padding for camera notch

fix:
1. Remove onBackPress prop from Header in RegistrationFormScreen.tsx
2. Remove onBack prop from RegistrationFormScreenProps interface (no longer needed)
3. Remove handleBack function from app/(user)/registration.tsx
4. Add paddingTop: Spacing.xl to SafeAreaView container style for camera safe area

verification:
- Removed onBack prop from RegistrationFormScreenProps interface
- Removed onBackPress prop from Header component call
- Removed handleBack function from app/(user)/registration.tsx
- Added paddingTop: Spacing.xl to container style for camera safe area
- Changes verified in both files

files_changed:
- components/provider/screens/RegistrationFormScreen.tsx: Removed onBack prop, removed onBackPress from Header, added paddingTop
- app/(user)/registration.tsx: Removed handleBack function and onBack prop
