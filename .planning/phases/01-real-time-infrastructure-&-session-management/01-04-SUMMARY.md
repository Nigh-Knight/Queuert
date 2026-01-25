---
phase: 01-real-time-infrastructure
plan: 04
subsystem: admin-ui
tags: [expo-router, react-native-paper, datetimepicker, session-management]

requires:
  - 01-01-PLAN # Convex client setup
  - 01-03-PLAN # Volunteer QR code infrastructure

provides:
  - Admin route group at (admin)
  - Session creation form UI
  - Location selection dropdown
  - Date/time picker integration
  - Volunteer count configuration
  - Form validation and error handling

affects:
  - 01-05-PLAN # QR code display screen

tech-stack:
  added:
    - "@react-native-community/datetimepicker"
    - "react-native-paper (FAB component)"
  patterns:
    - "Expo Router route groups for role separation"
    - "FAB navigation pattern for primary actions"
    - "Auto-retry mutation pattern (3 attempts)"

key-files:
  created:
    - "app/(admin)/_layout.tsx"
    - "app/(admin)/index.tsx"
    - "app/(admin)/create-session.tsx"
  modified:
    - "app/_layout.tsx"

decisions:
  - decision: "Use FAB for session creation trigger"
    rationale: "Material Design standard for primary action, familiar to mobile users"
    context: "Admin home screen"
  - decision: "Separate date and time pickers"
    rationale: "Better UX on mobile - native pickers are mode-specific"
    context: "Create session form"
  - decision: "Default 5 volunteer QR codes"
    rationale: "Typical event size based on PRD (10-15 volunteers, accounts for growth)"
    context: "Volunteer count input"

metrics:
  duration: "1min"
  completed: "2026-01-25"
---

# Phase 01 Plan 04: Session Management Backend Summary

**One-liner:** Admin route group with FAB-triggered session creation form featuring location dropdown, date/time pickers, and volunteer count configuration.

## What Was Built

### 1. Admin Route Group Structure
Created new `(admin)` route group using Expo Router for admin-specific screens:
- Stack navigation with Admin Dashboard and Create Session screens
- Added to root `_layout.tsx` for global access
- Uses `headerShown: false` for custom Header component consistency

### 2. Admin Dashboard Home
Built admin home screen with:
- Custom Header component
- Placeholder content area for session status cards
- FAB (Floating Action Button) positioned bottom-right
- FAB navigates to create-session screen
- Queries active sessions for both locations (kams, star) - ready for future expansion

### 3. Session Creation Form
Comprehensive form with all required inputs:

**Location Selection:**
- DropdownSelect component with 2 options: Kam's Laundromat, Star Laundromat
- Uses existing atomic component with modal picker UX

**Date/Time Selection:**
- Separate date and time pickers (native DateTimePicker components)
- Date picker has `minimumDate={new Date()}` to enforce future dates
- Buttons display current selection, trigger pickers on press
- Custom validation ensures scheduled date is in the future

**Volunteer Count:**
- Numeric input field (InputField component)
- Defaults to "5"
- Validates positive integers

**Error Handling:**
- Error banner at top (red background, white text)
- Displays validation errors (missing location, invalid count, past date)
- Auto-retry logic: 3 attempts before showing failure message
- Clears error on new submission attempt

**Success Flow:**
- Calls Convex `createSession` mutation with location, scheduledDate, volunteerCount
- Shows alert if overlapping session detected (non-blocking)
- Navigates to `/(admin)/session-qr-codes` with sessionId param

## Technical Implementation

### Route Group Pattern
Used Expo Router grouped routes `(admin)` to:
- Organize admin screens separately from provider/user flows
- Apply shared Stack navigation configuration
- Keep URL structure clean (no "admin" in path)

### Component Reuse
Leveraged existing atomic components:
- `Header` - Consistent top bar with back navigation
- `CustomButton` - Primary/secondary variants with loading state
- `DropdownSelect` - Modal-based dropdown with theme styling
- `InputField` - Labeled text input with validation

### Form State Management
React `useState` for form state:
- `location`: string | number (matches DropdownSelect API)
- `date`: Date object (updated by picker callbacks)
- `volunteerCount`: string (converted to number on submit)
- `showDatePicker`, `showTimePicker`: boolean (picker visibility)
- `isLoading`: boolean (mutation state)
- `error`: string | null (validation/submission errors)

### Date/Time UX
Two separate pickers for better mobile UX:
```typescript
// Date picker updates only year/month/day
const newDate = new Date(date);
newDate.setFullYear(selectedDate.getFullYear());
newDate.setMonth(selectedDate.getMonth());
newDate.setDate(selectedDate.getDate());

// Time picker updates only hours/minutes
const newDate = new Date(date);
newDate.setHours(selectedTime.getHours());
newDate.setMinutes(selectedTime.getMinutes());
```

### Auto-Retry Pattern
Implemented 3-attempt retry logic for mutation resilience:
```typescript
let attempts = 0;
while (attempts < 3) {
  try {
    const result = await createSession({ ... });
    // Success - navigate away
    return;
  } catch (err) {
    attempts++;
    if (attempts >= 3) {
      setError('Failed to create session. Please try again.');
    }
  }
}
```

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

## Verification Checklist

- [x] Admin route group exists at `app/(admin)`
- [x] Admin home has FAB that navigates to create-session
- [x] Create session form has location dropdown (Kam's and Star)
- [x] Create session form has date and time pickers
- [x] Create session form has volunteer count input
- [x] Form validates future date requirement
- [x] Errors display in banner at top
- [x] Form connects to Convex createSession mutation

## Integration Points

### Upstream Dependencies
- **01-01-PLAN**: Convex client setup (ConvexProvider, api imports)
- **01-03-PLAN**: Volunteer QR code infrastructure (volunteers table, mutation)

### Downstream Impacts
- **01-05-PLAN**: Session QR codes screen expects sessionId param on navigation

### Backend Contracts
Uses `api.sessions.createSession` mutation:
```typescript
// Input
{
  location: string,       // "kams" | "star"
  scheduledDate: number,  // Unix timestamp (ms)
  volunteerCount: number  // Positive integer
}

// Output
{
  sessionId: Id<"sessions">,
  accessCode: string,
  hasOverlappingSession: boolean
}
```

## Next Phase Readiness

### Completed Requirements
- SESS-01: Location selection dropdown
- SESS-02: Date/time selection with future validation
- Admin UI foundation for session management

### Blockers
None - all requirements met.

### Concerns
1. **QR codes screen not yet built**: Navigation target `/(admin)/session-qr-codes` will be created in 01-05
   - **Impact**: Low - route exists in layout, screen creation is next task
   - **Mitigation**: 01-05 plan already scheduled

2. **No session list view**: Admin home queries sessions but doesn't display them
   - **Impact**: Low - FAB provides primary action, list is future enhancement
   - **Mitigation**: Placeholder content area ready for session cards

## Commits

| Hash    | Message                                           | Files |
|---------|---------------------------------------------------|-------|
| 343b386 | feat(01-04): create admin route group with FAB   | 3     |
| 42d0898 | feat(01-04): build session creation form          | 1     |

**Total commits:** 2
**Total files modified:** 4
