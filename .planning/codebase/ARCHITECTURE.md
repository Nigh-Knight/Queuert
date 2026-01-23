# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Layered architecture with clear separation between mobile frontend (Expo/React Native) and Convex backend. Frontend follows a provider flow pattern with hierarchical screen navigation. Backend uses Convex realtime database with mutations for writes and queries for reads.

**Key Characteristics:**
- File-based routing (Expo Router) with directory grouping for UI organization
- Render prop navigation pattern for cross-screen state management
- Atomic component design system with centralized theming
- Type-safe Convex backend with schema-driven data model
- Single-user flows (service users vs volunteers vs team leaders)

## Layers

**Presentation Layer (UI Components):**
- Purpose: Render user interface for queue management, intake forms, and status displays
- Location: `components/provider/` and `components/ui/`
- Contains: Atomic components (buttons, inputs, headers), screen components, navigation orchestrator
- Depends on: `constants/theme.ts` (design system), navigation stack, Convex (not yet wired)
- Used by: Expo Router entry points in `app/`

**Navigation Layer:**
- Purpose: Manage user flows through role selection → phone input → verification → registration → QR scanning → laundry status
- Location: `components/provider/navigation/RootNavigator.tsx`
- Contains: Stack navigator configuration, navigation state management (React useState), screen render props
- Depends on: React Navigation native stack, all screen components
- Used by: `app/provider.tsx` entry point

**Design System Layer:**
- Purpose: Centralized styling constants to ensure visual consistency
- Location: `constants/theme.ts`
- Contains: Color palette, typography scale, spacing system, component sizing
- Depends on: None (foundational)
- Used by: All component StyleSheet definitions

**Routing Layer (File-Based):**
- Purpose: Define app structure and navigation hierarchy through filesystem
- Location: `app/` directory structure
- Contains: Layout definitions (`_layout.tsx`), screen routing, grouped routes (tabs), modals
- Depends on: Expo Router, all screen/layout components
- Used by: Expo runtime to build navigation tree

**Backend/Data Layer (Convex):**
- Purpose: Database schema, mutations (writes), queries (reads), and realtime sync
- Location: `convex/` directory
- Contains: Schema definition (`scheme.ts`), mutations (`intake.ts`, `queue.ts`, `sessions.ts`), queries, generated types
- Depends on: Convex server SDK
- Used by: Frontend screens (not yet connected via Convex hooks)

**Utility/Hooks Layer:**
- Purpose: Reusable logic for theme detection and color selection
- Location: `hooks/`
- Contains: `use-color-scheme.ts`, `use-theme-color.ts`
- Depends on: React Native, design system
- Used by: Components that need theme-aware styling

## Data Flow

**Intake Form Submission Flow:**

1. User selects role → `RoleSelectionScreen` sends role to `RootNavigator`
2. `RootNavigator.setNavigationState()` stores role, navigates to `PhoneInputScreen`
3. Phone submission → state updated → navigates to `VerificationScreen`
4. Verification complete → navigates to `RegistrationFormScreen`
5. Registration form submission (firstName, lastName, livingCondition, estimatedLoads, estimatedWeight) → state stored in `RootNavigator`
6. Navigates to `QRCodeScannerScreen` (placeholder for camera integration)
7. QR code scanned → navigates to `LaundryStatusScreen`
8. (Backend not yet connected) Would call `convex/intake.ts::submitIntakeForm()` mutation to:
   - Create intake form record
   - Auto-add user to queue
   - Return queue position

**Queue Management Flow:**

1. Backend: `submitIntakeForm()` (in `convex/intake.ts`) creates queue entry with position = current queue length + 1
2. Backend: `getActiveQueue()` (in `convex/queue.ts`) retrieves all waiting users for a session, populated with user and intake details
3. Backend: `startTimer()` (in `convex/queue.ts`) updates queue entry: status = "washing", timerStartedAt = now, volunteerAssignedId set
4. Frontend: `LaundryStatusScreen` displays queue position, estimated wait time, machine status, countdown timer
5. Timer countdown (client-side simulation in `useEffect` hook)
6. Backend: `removeFromQueue()` marks queue entry status = "removed"

**State Management:**

- **Local to Component:** Individual screen state (firstName, selectedRole, isLoading, etc.) via `useState`
- **Cross-Screen:** Navigation state managed in `RootNavigator` via `navigationState` state object, passed to screens via render props
- **Backend State:** Queue position, user records, session data stored in Convex database
- **Theme State:** Global theme via `useColorScheme()` hook reading device settings

## Key Abstractions

**Atomic Component Pattern:**
- Purpose: Build screens from reusable, variant-based components
- Examples: `CustomButton.tsx` (variants: primary/secondary/alert), `InputField.tsx`, `Header.tsx`, `RoleCard.tsx`, `StatusCard.tsx`
- Pattern: Props-driven interface, StyleSheet-based styling, variant-driven appearance logic

**Navigation Stack Pattern:**
- Purpose: Manage sequential user flows without URL routing dependency
- Examples: Role selection → Phone input → Verification → Registration → QR scan → Status
- Pattern: `RootNavigator` maintains centralized navigation state, screens receive navigation callbacks via props, state updates trigger `navigation.navigate()`

**Design System Pattern:**
- Purpose: Enforce visual consistency across platform variants (iOS, Android, Web)
- Examples: `Colors.primary`, `Typography.h1`, `Spacing.lg`, `ComponentSize.buttonHeight`
- Pattern: All StyleSheets import from `constants/theme.ts`, never hardcode colors/sizes/spacing

**Convex Type-Safe Backend Pattern:**
- Purpose: Runtime-safe database operations with TypeScript validation
- Examples: Mutation arg validation via `v.string()`, `v.id()`, `v.union()` validators
- Pattern: Schema defined via `defineSchema()`, mutations/queries use generated types from `_generated/api`

## Entry Points

**Mobile App Entry (`app/_layout.tsx`):**
- Location: `app/_layout.tsx`
- Triggers: App startup
- Responsibilities:
  - Wrap app with `ThemeProvider` (dark/light theme)
  - Define root Stack navigator with three screens: "provider", "(tabs)", "modal"
  - Set StatusBar style

**Provider Flow Entry (`app/provider.tsx`):**
- Location: `app/provider.tsx`
- Triggers: User opens app (navigates to "provider" screen from root)
- Responsibilities:
  - Renders `RoleSelectionScreen` as initial entry point
  - Handles role selection (currently logs to console, no navigation yet)

**Tab Navigation Entry (`app/(tabs)/_layout.tsx`):**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: User completes provider flow (future navigation destination)
- Responsibilities:
  - Define bottom tab bar with two tabs: "home" (index.tsx) and "explore" (explore.tsx)
  - Set active/inactive tab colors based on theme

**Root Navigator Entry (`components/provider/navigation/RootNavigator.tsx`):**
- Location: `components/provider/navigation/RootNavigator.tsx`
- Triggers: Should be integrated as primary navigation (currently not wired)
- Responsibilities:
  - Manage entire provider user flow state
  - Define stack of screens with proper prop passing
  - Handle navigation between all flow stages

**Convex Backend Entries:**

- `convex/intake.ts` - `submitIntakeForm()` mutation: Entry point for service users completing registration
- `convex/queue.ts` - `getActiveQueue()` query: Entry point for volunteers viewing current queue
- `convex/sessions.ts` - `createSession()` mutation: Entry point for service providers starting a new event

## Error Handling

**Strategy:** Placeholder error handling with no centralized error boundary. All error handling is local or absent.

**Patterns:**
- Form validation: Check required fields are non-empty before enabling submit buttons (e.g., `isFormValid` in `RegistrationFormScreen`)
- API call errors: No catch blocks yet, only success path implemented with setTimeout simulations
- Navigation guards: Not implemented; assume valid state transitions
- Backend validation: Convex validators on mutation args ensure type safety (e.g., `v.literal()`, `v.id()`)

**Gaps:**
- No global error boundary component
- No error alerts or user-facing error messages
- No retry logic for failed operations
- No loading state error handling

## Cross-Cutting Concerns

**Logging:**
- Only console.log() used (e.g., `console.log('Selected role:', role)` in `app/provider.tsx`)
- No centralized logging service

**Validation:**
- Form-level validation: Check field values before enabling submit (UI layer)
- Backend validation: Convex mutation arg validators ensure type correctness
- No cross-field validation (e.g., date range checks)

**Authentication:**
- Role-based differentiation in UI (serviceUser vs volunteer vs teamLeader)
- Phone number captured but not verified (UI placeholder only)
- No actual authentication system; verified user status is hardcoded
- (Future integration needed for OTP verification flow)

**State Synchronization:**
- Frontend local state (React useState) for form inputs and UI state
- RootNavigator maintains cross-screen flow state
- Backend state in Convex DB (users, queue, sessions, intakeForms)
- No real-time sync yet (Convex hooks not wired to screens)

**Theme/Styling:**
- Centralized in `constants/theme.ts`
- Applied via StyleSheet in all components
- Device color scheme detected via `useColorScheme()` hook
- Light/dark color sets available but not fully utilized

---

*Architecture analysis: 2026-01-23*
