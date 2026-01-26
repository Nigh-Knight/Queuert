---
status: investigating
trigger: "Fix the infinite loading screen in the service user flow."
created: 2026-01-26T00:00:00.000Z
updated: 2026-01-26T00:00:00.000Z
---

## Current Focus

hypothesis: The user index.tsx has session validation logic that waits for Convex query to complete, but query may hang or never resolve, causing infinite loading
test: Read SessionStorage and examine the session query logic in index.tsx
expecting: Find that the useEffect dependencies or query logic prevents navigation to registration
next_action: Read SessionStorage utility and trace execution flow

## Symptoms

expected: Service users should immediately see the registration form (RegistrationFormScreen) when they select "Service User" role - no authentication required
actual: Clicking "Service User" button shows infinite loading screen
errors:
reproduction: 1. Click "Service User" button 2. Observe infinite loading
started: Recent issue - form was working before

## Eliminated

## Evidence

- timestamp: 2026-01-26T00:05:00Z
  checked: app/(user)/index.tsx lines 33-44
  found: Second useEffect waits for BOTH sessionData AND session query to resolve before navigating. If sessionData is set (line 50) but session query hangs, navigation never happens
  implication: The condition `if (sessionData && session !== undefined)` means if there's old/invalid sessionData stored, it waits for Convex query which may never resolve, causing infinite loading

- timestamp: 2026-01-26T00:06:00Z
  checked: app/(user)/index.tsx lines 46-61 checkSession function
  found: When SessionStorage.load() returns data (line 48-50), it sets sessionData state which triggers the second useEffect. BUT if Convex backend is not running or query fails, session stays undefined forever
  implication: The flow has a race condition - navigation only happens after query completes, but query may hang

- timestamp: 2026-01-26T00:07:00Z
  checked: app/(admin)/index.tsx lines 22-37
  found: Admin flow checks session but does NOT wait for Convex query. It sets isCheckingSession to false immediately after checking SessionStorage (line 33), allowing UI to render
  implication: Admin flow doesn't have the hanging query problem because it doesn't block on useQuery results

## Resolution

root_cause:
fix:
verification:
files_changed: []
