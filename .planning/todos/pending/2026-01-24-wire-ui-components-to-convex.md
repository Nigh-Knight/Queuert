---
created: 2026-01-24T00:00
title: Wire existing UI components in /components/volunteer to Convex mutations
area: ui
files:
  - components/provider/screens/
  - convex/
---

## Problem

Current UI components in `/components/volunteer/` (and `/components/provider/screens/`) are placeholder implementations using local state. These need to be connected to Convex backend mutations and queries once backend logic is implemented in Phases 1-10.

Builder.io UI redesign happening separately (after 7pm today), but these functional screens serve as:
- Testing harness for backend logic during development
- Reference implementation showing data flow patterns
- Fallback UI if Builder.io integration delayed

Without wiring, the existing UI screens cannot demonstrate real-time queue updates, timer synchronization, or multi-device sync that are core to the app's value proposition.

## Solution

After each backend phase completes:

1. Replace `useState` with `useQuery` for reading data (queue, timers, sessions)
2. Replace inline handlers with `useMutation` for writes (add user, start timer, remove from queue)
3. Add optimistic UI updates with rollback on mutation failure
4. Test real-time sync across multiple devices/browsers

Example pattern:
```tsx
// Before (local state):
const [queue, setQueue] = useState([]);

// After (Convex):
const queue = useQuery(api.queue.getActiveQueue, { sessionId });
const addToQueue = useMutation(api.queue.addUser);
```

Keep existing component structure - only swap data layer. Builder.io can later replace entire components while keeping same Convex hooks.
