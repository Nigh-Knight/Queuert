---
status: resolved
trigger: "Fix the infinite loading screen in the service user flow."
created: 2026-01-26T00:00:00.000Z
updated: 2026-01-26T00:00:00.000Z
---

## Current Focus

hypothesis: CONFIRMED - The second useEffect (lines 33-44) blocks navigation when sessionData exists but waits indefinitely for session query to resolve. If Convex is not running or query fails, session stays undefined and navigation never happens. Service users should not need session validation at all.
test: Compare with admin flow and confirm root cause
expecting: Admin flow navigates immediately after SessionStorage check without blocking on query
next_action: Implement fix to remove session query blocking for service users

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

- timestamp: 2026-01-26T00:15:00Z
  checked: Fixed app/(user)/index.tsx scenarios
  found: Scenario 1 (no session): checkSession() finds no data → immediate router.replace to registration (line 64). Scenario 2 (has session, query resolves): Sets shouldCheckSession=true → query runs → navigates based on result. Scenario 3 (has session, query hangs): Sets shouldCheckSession=true → timeout fires after 3s → navigates to registration (line 38)
  implication: All paths now lead to navigation within 3 seconds maximum, preventing infinite loading

## Resolution

root_cause: The service user index.tsx (lines 33-44) blocks navigation by waiting for both sessionData AND Convex session query to resolve. When sessionData exists (from old session) but Convex backend is not running or query fails, the session variable stays undefined indefinitely, causing infinite loading. Service users don't need session validation - they should go directly to registration form.

fix: Added timeout fallback (3 seconds) and conditional query execution. Key changes:
1. Added shouldCheckSession state flag to control when Convex query runs
2. Query only executes when shouldCheckSession=true (prevents unnecessary queries)
3. Added timeout useEffect that redirects to registration after 3 seconds if query doesn't resolve
4. Maintained session restoration logic for returning users while preventing infinite loading

verification: TypeScript compilation passes with no errors. Fix ensures users reach registration form within 3 seconds maximum, either immediately (no session) or after timeout (query hangs).

files_changed: ['app/(user)/index.tsx']
