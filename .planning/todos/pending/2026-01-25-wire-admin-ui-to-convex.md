---
created: 2026-01-24T00:00
title: Wire existing UI components in /components/admin to Convex mutations
area: ui
files:
  - components/admin/
  - convex/
---

## Problem

Admin UI components in `/components/admin/` need to be connected to Convex backend mutations and queries once admin-specific backend logic is implemented (primarily Phase 7: Admin Functions, but also touches Phase 1: Session Management).

Admin screens handle:
- Session creation (location selection, date/time)
- Volunteer QR code generation
- Admin verification via special code
- Session oversight (view all active sessions)
- Session lifecycle (end session)

Currently these are placeholder implementations with local state, serving as testing harness during backend development and fallback before Builder.io integration.

## Solution

After admin backend phases complete (Phase 1, Phase 7):

1. Replace `useState` with `useQuery` for session data (active sessions, QR codes)
2. Replace inline handlers with `useMutation` for admin actions (create session, generate QR, end session)
3. Wire admin verification code flow to Convex authentication
4. Add optimistic UI updates with rollback

Example pattern:
```tsx
// Before (local state):
const [sessions, setSessions] = useState([]);

// After (Convex):
const sessions = useQuery(api.sessions.getActiveSessions);
const createSession = useMutation(api.sessions.create);
```

Keep existing component structure - only swap data layer. Builder.io replaces components later while preserving Convex hooks.
