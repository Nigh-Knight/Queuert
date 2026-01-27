# Phase 3: Queue Operations & Management - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Volunteers manage the laundry queue during live events - viewing all users with real-time status updates, adding users manually (with full intake form), removing users from queue, reordering queue positions via drag-and-drop, and searching by name. All changes sync instantly across devices.

This phase focuses on volunteer workflow efficiency and queue data integrity during events with multiple volunteers.

</domain>

<decisions>
## Implementation Decisions

### Queue Display Layout
- Card-based layout with spacing (like existing StatusCard component)
- Each card shows: Name + Position number (always visible) + Status badge + Timer (only when active/washing/drying)
- Status uses BOTH color-coded badges AND icons (blue/clock for waiting, green/washing-machine for washing, orange/checkmark for ready)
- Show ALL entries in single scrollable list (waiting + washing + ready together, no filtering/tabs)
- Position numbers always visible on cards (not just in reorder mode)

### Queue Actions & Interaction
- Inline action buttons on each card (Start Timer, Remove, etc.) - no tap-to-open detail screen required
- Floating Action Button (FAB) at bottom-right for "Add User" (consistent with admin pattern)
- Real-time updates from other volunteers apply silently (no toast/highlight - seamless sync)

### Empty State
- Simple message: "No users in queue" + Add User button
- Minimal approach - clear call to action without illustration

### Manual Add User Flow
- Required fields: First name + Last name + Phone (optional)
- Show FULL intake form when adding manually: name, phone, living condition, loads estimate
- Volunteer helps service user complete intake at time of queue entry
- Phone validation: Loose (just check it's numbers, any length) - flexible for various formats

### Queue Reordering Mechanics
- Drag-and-drop method: Long-press card, drag to new position (touch-native)
- Show confirmation dialog after drop: "Move John to position 3?" - prevents accidents
- Allow any position change - no restrictions on jump size (position 5 can move to position 1)
- Auto-reposition on removal: When user removed, gaps close automatically (position 5 becomes 4, position 6 becomes 5)

### Search & Filtering
- Search by name only (not phone)
- Live filtering as you type (instant results)
- Filter existing queue list in-place (hide non-matches, don't show separate results section)
- Partial match: typing "John" finds "Johnny", "Johnson", etc. (case-insensitive substring match)

### Claude's Discretion
- Exact shadow/border styling for cards
- Loading skeleton design
- Drag handle visual design
- Animation timing for drag-and-drop
- Error state handling and retry logic
- Search debouncing threshold

</decisions>

<specifics>
## Specific Ideas

- Use existing StatusCard component as base for queue cards
- FAB pattern matches admin session creation (consistency across roles)
- Confirmation dialogs prevent accidental queue changes during busy events
- Silent real-time updates create "magic" feeling - changes just appear

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 03-queue-operations-management*
*Context gathered: 2026-01-27*
