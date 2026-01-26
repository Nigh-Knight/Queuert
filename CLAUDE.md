# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Queuert is a mobile queue management system for Laundry Love events, built with Expo (React Native) and Convex backend. It replaces paper-based systems to manage laundry queues, timers, and service user intake.

**Target Users:**
- Service Users (guests): People experiencing homelessness who need laundry services
- Service Providers (volunteers): Event coordinators managing the queue and timers

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (choose platform from menu)
npx expo start

# Platform-specific development
npm run android     # Launch Android emulator
npm run ios         # Launch iOS simulator
npm run web         # Launch web version

# Code quality
npm run lint        # Run ESLint (uses expo lint config)
```

### Convex Backend
```bash
# Run Convex dev server (separate terminal)
npx convex dev

# Deploy Convex functions
npx convex deploy
```

### Testing & Debugging
- No test framework configured yet
- Use Expo DevTools and React Native debugger
- Check Convex dashboard for backend logs

## Architecture

### Tech Stack
- **Frontend**: Expo 54, React 19.1, React Native 0.81
- **Routing**: Expo Router (file-based routing)
- **Backend**: Convex (realtime database with TypeScript functions)
- **State**: React useState (local), Zustand installed but not yet integrated
- **UI**: React Native Paper components + custom atomic components
- **Styling**: StyleSheet with centralized theme constants

### Project Structure

```
app/                         # Expo Router file-based routing
├── _layout.tsx              # Root layout (ThemeProvider, Stack navigator)
├── provider.tsx             # Provider flow entry (renders RoleSelectionScreen)
├── modal.tsx                # Modal screen
└── (tabs)/                  # Tab-based navigation group
    ├── _layout.tsx          # Tab configuration (home + explore)
    ├── index.tsx            # Home tab
    └── explore.tsx          # Explore tab

components/
├── provider/
│   ├── atoms/               # Reusable UI primitives
│   │   ├── CustomButton.tsx # Variant-based button (primary/secondary/alert)
│   │   ├── Header.tsx       # Screen header with back navigation
│   │   ├── InputField.tsx   # Text input with label & error state
│   │   ├── DropdownSelect.tsx # Modal-based dropdown
│   │   ├── RoleCard.tsx     # Selectable card with icon
│   │   └── StatusCard.tsx   # Display-only status card
│   ├── screens/             # Full screen components
│   │   ├── RoleSelectionScreen.tsx
│   │   ├── PhoneInputScreen.tsx
│   │   ├── VerificationScreen.tsx
│   │   ├── RegistrationFormScreen.tsx
│   │   ├── QRCodeScannerScreen.tsx
│   │   ├── LaundryStatusScreen.tsx
│   │   └── WelcomeBackScreen.tsx
│   └── navigation/
│       └── RootNavigator.tsx # Stack navigator managing provider flow
├── ui/                      # General UI components
└── themed-text.tsx, themed-view.tsx # Theme-aware wrappers

convex/
├── scheme.ts                # Database schema (users, intakeForms, sessions, queue, volunteers)
├── intake.ts                # Intake form mutations/queries
├── queue.ts                 # Queue management operations
├── sessions.ts              # Session management
└── _generated/              # Auto-generated Convex types

constants/
└── theme.ts                 # Design system (Colors, Typography, Spacing, ComponentSize)

hooks/
├── use-color-scheme.ts      # Theme detection
└── use-theme-color.ts       # Theme color selector
```

### Key Architectural Patterns

#### 1. File-Based Routing
- Routes map to filesystem: `app/(tabs)/index.tsx` → `/tabs/` route
- Grouped routes use parentheses: `(tabs)` creates layout without adding to URL
- Each directory can have `_layout.tsx` to define nested navigation

#### 2. Navigation State Management
`RootNavigator.tsx` manages cross-screen state using React state:
```typescript
const [navigationState, setNavigationState] = useState<NavigationState>({
  selectedRole: null,
  phoneNumber: '',
  countryCode: '+1',
  registrationData: null,
});
```
State flows through screens via render props, navigation occurs via `navigation.navigate()`.

#### 3. Convex Backend Integration
- **Schema**: Define tables in `scheme.ts` with `defineSchema()` and `defineTable()`
- **Mutations**: Write operations (e.g., `submitIntakeForm`, `startTimer`, `removeFromQueue`)
- **Queries**: Read operations (e.g., `getActiveQueue`, `getUserQueuePosition`)
- **Auto-generated API**: Import from `convex/_generated/api` for type-safe calls
- **Not yet connected**: Convex hooks (`useQuery`, `useMutation`) not wired into screens

#### 4. Component Hierarchy
- **Atoms**: Self-contained, reusable (CustomButton, InputField, Header)
- **Screens**: Compose atoms into full pages (RegistrationFormScreen uses Header + InputField + DropdownSelect + CustomButton)
- **Navigation**: RootNavigator orchestrates screen flow with shared state

#### 5. Design System (constants/theme.ts)
All styling uses centralized constants:
- **Colors**: `Colors.primary`, `Colors.alert`, `Colors.text.primary`, etc.
- **Typography**: `Typography.h1`, `Typography.body`, `Typography.caption` (fontSize, fontWeight, lineHeight)
- **Spacing**: `Spacing.xs` (4px) through `Spacing.xxxl` (32px), 4px increments
- **Component Sizing**: `ComponentSize.buttonHeight` (48), `ComponentSize.cardRadius` (10)

**Pattern**: Always import from `constants/theme.ts`, never hardcode values.

### Convex Schema Overview

**Key tables:**
- `users`: Service providers, volunteers, users with roles, location, language
- `intakeForms`: Laundry intake data (load size, weight estimate, home situation)
- `sessions`: Active service sessions per location
- `queue`: Queue entries with position, status ("waiting"/"washing"/"removed"), timer, volunteer assignment
- `volunteers`: Volunteer assignments to sessions with QR codes

**Important relationships:**
- Queue entries reference users (serviceUserId) and volunteers (assignedVolunteerId)
- Intake forms auto-create queue entries via `submitIntakeForm()` mutation
- Timer management via `startTimer()` sets status to "washing" and records startTime

## Coding Conventions

### TypeScript
- Strict mode enabled (`tsconfig.json`)
- Path alias: `@/*` maps to project root
- Convex functions use generated types from `_generated/api`

### Component Patterns
All atomic components follow this structure:
```typescript
interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'alert';
  disabled?: boolean;
  isLoading?: boolean;
}

export function CustomButton({ label, onPress, variant = 'primary', ... }: CustomButtonProps) {
  // Component logic
}

const styles = StyleSheet.create({
  // Use theme constants exclusively
  button: {
    height: ComponentSize.buttonHeight,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.lg,
  },
});
```

### Screen Patterns
Screens accept data + callbacks via props (not directly accessing navigation):
```typescript
interface RegistrationFormScreenProps {
  onSubmit: (data: RegistrationFormData) => void;
  onBack: () => void;
  initialData?: Partial<RegistrationFormData>;
}
```

### Styling Rules
- Use `StyleSheet.create()` for all styles
- Import from `constants/theme.ts`: `Colors`, `Typography`, `Spacing`, `ComponentSize`
- Never hardcode colors, sizes, or spacing values
- For theme-aware components, use `useThemeColor()` hook

### UI/UX Rules

#### No Back Buttons
Never add custom back buttons in headers or navigation components. Users should rely on their device's native back button.

**Implementation:**
- Set `headerBackVisible: false` in Stack.Screen options
- Remove any custom back button implementations from Header components
- Let the native navigation handle back gestures and buttons

```typescript
// Correct: Hide default back button, rely on native
<Stack.Screen
  name="screen-name"
  options={{ headerBackVisible: false }}
/>

// Incorrect: Custom back button in header
<Header title="Screen" onBack={() => navigation.goBack()} />
```

#### Camera Safe Area
All top sections must respect device safe areas to avoid overlapping with front-facing cameras, notches, and system UI.

**Implementation:**
- Use `SafeAreaView` from `react-native-safe-area-context` for top-level containers
- Always apply safe area insets to headers and top content
- Test on devices with notches (iPhone X+, modern Android devices)

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Correct: Wrap screen content with SafeAreaView
<SafeAreaView style={styles.container}>
  <Header title="Screen Title" />
  {/* Content */}
</SafeAreaView>

// Alternative: Use paddingTop with useSafeAreaInsets
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
<View style={{ paddingTop: insets.top }}>
  <Header title="Screen Title" />
</View>
```

### Convex Function Patterns
```typescript
// Mutation (write operation)
export const submitIntakeForm = mutation({
  args: {
    phoneNumber: v.string(),
    numberOfLoads: v.number(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    // Create intake form
    const intakeFormId = await ctx.db.insert('intakeForms', { ... });
    // Auto-add to queue
    await ctx.db.insert('queue', { ... });
    return intakeFormId;
  },
});

// Query (read operation)
export const getActiveQueue = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('queue')
      .filter((q) => q.eq(q.field('sessionId'), args.sessionId))
      .collect();
  },
});
```

## Important Context from PRD

### Core Functionality
1. **Queue Management**: Digital replacement for paper-based queue tracking
2. **Timer System**: 23-minute default wash cycle timers managed by volunteers
3. **Intake Forms**: Collect user data (phone, living situation, laundry amount)
4. **Multi-language**: Spanish, Portuguese, Haitian Creole support required
5. **Role Differentiation**: Guests (service users) vs Volunteers (service providers)
6. **QR Codes**: Each volunteer gets unique QR code to track who registered each user
7. **Notifications**: Push to volunteers when wash completes, SMS to users

### User Flows
**Service User (Guest):**
1. Select role → Select location → Scan volunteer QR code
2. Enter phone number → Complete intake form
3. View queue position → View wash timer → Get notified when done

**Service Provider (Volunteer):**
1. Select role → Select location → Get assigned QR code
2. View full queue (all users + statuses)
3. Add users without phones manually
4. Start wash timers (when user gets machine)
5. Mark washes complete or remove users early
6. Receive notifications when washes finish

### Technical Requirements
- Multi-platform: iOS, Android, Web (Expo)
- Google Sheets integration for data storage (not yet implemented)
- SMS gateway for user notifications (not yet implemented)
- Push notifications for volunteers (not yet implemented)
- Offline capability for volunteers (spotty connectivity at events)
- Scale: 100 simultaneous users, 10-15 volunteers per location

### Current Implementation Status
**Implemented:**
- UI component library (atoms + screens)
- File-based routing structure
- Convex schema and backend functions
- Design system with theming
- Navigation flow (role → phone → verification → registration → QR → status)

**Not Yet Connected:**
- Convex hooks not wired into screens (no actual API calls)
- Zustand store not integrated
- Phone verification is UI-only (no OTP logic)
- QR scanning is placeholder (no camera integration)
- Timer logic exists in backend but not connected to UI
- No Google Sheets integration
- No SMS/push notification system

## Common Gotchas

1. **Path Aliases**: Use `@/` prefix when importing (configured in tsconfig.json)
2. **Convex Types**: Always import from `_generated/api` for type safety
3. **Theme Constants**: Never hardcode colors/spacing - always use constants
4. **Navigation State**: Currently managed in RootNavigator, plan to migrate to Zustand
5. **Expo Router**: Routes are file-based, layout files don't create route segments if wrapped in parentheses
6. **React Native Styling**: Use `StyleSheet.create()`, not inline styles or CSS
7. **Platform Differences**: Test on iOS, Android, and Web - some components behave differently
8. **Convex Dev Server**: Must run `npx convex dev` in separate terminal for backend to work

## Next Steps for Development

Based on PRD and current state, priority integrations:
1. Wire Convex hooks into screens (useQuery/useMutation)
2. Add camera QR scanning capability
3. Connect timer UI to Convex queue mutations
4. Implement multi-language support (i18n library)
5. Add Google Sheets data sync
6. Set up push notification service (FCM/APNS)
7. Implement SMS notifications for users
8. Add offline mode with local queue caching
9. Migrate navigation state to Zustand store
