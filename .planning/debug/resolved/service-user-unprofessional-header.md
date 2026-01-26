---
status: resolved
trigger: "Fix the unprofessional header UI in the service user screen."
created: 2026-01-26T00:00:00Z
updated: 2026-01-26T00:10:00Z
---

## Current Focus

hypothesis: CONFIRMED - Root _layout.tsx missing Stack.Screen for (user)
test: Added Stack.Screen entry for (user) with headerShown: false
expecting: No header shown on service user screens
next_action: Commit and archive

## Symptoms

expected: Clean, professional title with no back arrow, matching admin screen design
actual: Shows "<- (user)" at the top which looks unprofessional
errors: None - UI/UX issue
reproduction: Navigate to service user screen
started: Always present

## Eliminated

## Evidence

- timestamp: 2026-01-26T00:05:00Z
  checked: app/(user)/_layout.tsx
  found: Has Stack with screenOptions={{ headerShown: false }} but no specific configuration
  implication: Layout is trying to hide headers at its level

- timestamp: 2026-01-26T00:05:30Z
  checked: app/_layout.tsx (root layout)
  found: Has Stack.Screen entries for "(admin)", "(volunteer)", "(tabs)" with headerShown: false, but NO entry for "(user)"
  implication: The (user) route group is using default Stack behavior which shows route name as title

- timestamp: 2026-01-26T00:06:00Z
  checked: app/(admin)/_layout.tsx
  found: Same pattern as user layout - has screenOptions={{ headerShown: false }}
  implication: Admin screens work correctly because root _layout.tsx has explicit Stack.Screen for "(admin)"

## Resolution

root_cause: Root _layout.tsx (app/_layout.tsx) is missing Stack.Screen configuration for "(user)" route group. Without explicit headerShown: false, Expo Router shows default header with route name "(user)"
fix: Add <Stack.Screen name="(user)" options={{ headerShown: false }} /> to root _layout.tsx Stack configuration
verification: Navigate to service user registration screen and verify no header appears
files_changed: ["app/_layout.tsx"]
