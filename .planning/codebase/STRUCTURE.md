# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
/home/kepler/Projects/Queuert/
├── app/                              # Expo Router file-based routing
│   ├── _layout.tsx                   # Root layout (ThemeProvider, root Stack)
│   ├── provider.tsx                  # Provider flow entry screen
│   ├── modal.tsx                     # Modal screen
│   └── (tabs)/                       # Grouped routes (parentheses don't add to URL)
│       ├── _layout.tsx               # Tab navigator config
│       ├── index.tsx                 # Home tab
│       └── explore.tsx               # Explore tab
├── components/                       # Reusable UI components
│   ├── provider/                     # Provider flow components
│   │   ├── atoms/                    # Atomic UI components
│   │   │   ├── CustomButton.tsx      # Variant-based button (primary/secondary/alert)
│   │   │   ├── DropdownSelect.tsx    # Modal-based dropdown picker
│   │   │   ├── Header.tsx            # Screen header with back button
│   │   │   ├── InputField.tsx        # Text input with label & error state
│   │   │   ├── LoadingIndicator.tsx  # Loading spinner
│   │   │   ├── RoleCard.tsx          # Selectable role card with icon
│   │   │   └── StatusCard.tsx        # Display-only status card
│   │   ├── screens/                  # Full screen components
│   │   │   ├── RoleSelectionScreen.tsx       # Initial role picker (guest/volunteer/leader)
│   │   │   ├── PhoneInputScreen.tsx          # Phone number & country code input
│   │   │   ├── VerificationScreen.tsx        # OTP verification (UI placeholder)
│   │   │   ├── RegistrationFormScreen.tsx    # Intake form (name, living condition, laundry details)
│   │   │   ├── QRCodeScannerScreen.tsx       # QR code scanner (camera placeholder)
│   │   │   ├── WelcomeBackScreen.tsx         # Returning user welcome
│   │   │   └── LaundryStatusScreen.tsx       # Queue position, timer, machine details
│   │   └── navigation/
│   │       └── RootNavigator.tsx     # Stack navigator for provider flow, state management
│   ├── ui/                           # General UI utilities
│   │   ├── collapsible.tsx           # Collapsible component
│   │   ├── icon-symbol.tsx           # Icon rendering
│   │   └── icon-symbol.ios.tsx       # iOS-specific icon implementation
│   ├── themed-text.tsx               # Theme-aware text wrapper
│   ├── themed-view.tsx               # Theme-aware view wrapper
│   ├── external-link.tsx             # External link component
│   ├── haptic-tab.tsx                # Haptic feedback on tab press
│   ├── hello-wave.tsx                # Hello wave animation component
│   └── parallax-scroll-view.tsx      # Parallax scrolling effect
├── constants/
│   └── theme.ts                      # Design system (colors, typography, spacing, component sizing)
├── convex/                           # Backend database and mutations/queries
│   ├── scheme.ts                     # Convex database schema definition
│   ├── intake.ts                     # Intake form mutations & queries
│   ├── queue.ts                      # Queue management mutations & queries
│   ├── sessions.ts                   # Session management mutations & queries
│   └── _generated/                   # Auto-generated Convex types (do not edit)
│       ├── api.d.ts                  # Type definitions for API
│       ├── dataModel.d.ts            # Type definitions for data model
│       └── server.d.ts               # Type definitions for server functions
├── hooks/
│   ├── use-color-scheme.ts           # Detect device color scheme (light/dark)
│   ├── use-color-scheme.web.ts       # Web-specific color scheme detection
│   └── use-theme-color.ts            # Select theme-aware color from design system
├── assets/
│   └── images/                       # Static images (logos, backgrounds)
├── tsconfig.json                     # TypeScript configuration (strict mode, @ path alias)
├── package.json                      # NPM dependencies, scripts
├── CLAUDE.md                         # Project guidelines and architecture docs
├── PRD.md                            # Product requirements document
├── README.md                         # Project overview
└── .planning/                        # GSD planning outputs
    └── codebase/                     # Codebase analysis documents
```

## Directory Purposes

**`app/`:**
- Purpose: Expo Router file-based routing structure. Each file/folder automatically creates a route.
- Contains: Layout definitions (`_layout.tsx`), screen components, grouped routes (tabs in parentheses)
- Key files: `_layout.tsx` (root), `provider.tsx` (entry), `(tabs)/_layout.tsx` (tab config)

**`components/provider/`:**
- Purpose: Provider flow components (role selection → registration → queue status)
- Contains: Atomic components (atoms/), full screens (screens/), navigation orchestrator (navigation/)
- Key files: `RootNavigator.tsx` (state management & flow), screen components

**`components/provider/atoms/`:**
- Purpose: Reusable UI primitives following atomic design principles
- Contains: Buttons, inputs, headers, cards, dropdowns, loading indicators
- Pattern: Each component accepts props for content, callbacks, and styling; uses theme constants

**`components/provider/screens/`:**
- Purpose: Full-screen components that compose atoms into user-facing flows
- Contains: Role selection, phone input, verification, registration form, QR scanner, laundry status
- Pattern: Each screen accepts props for data and callbacks; manages local form state; no Convex integration yet

**`components/ui/`:**
- Purpose: General-purpose UI utilities and wrapper components
- Contains: Collapsible sections, icon symbols, theme-aware wrappers (themed-text, themed-view)
- Usage: Supporting tab navigation, icon rendering, and legacy template components

**`constants/theme.ts`:**
- Purpose: Single source of truth for design system
- Contains: Color palette (primary, alert, success, text states), typography scale, spacing system, component sizing
- Usage: Imported in every StyleSheet definition; theme values never hardcoded

**`convex/`:**
- Purpose: Backend database schema and serverless functions (mutations/queries)
- Contains:
  - `scheme.ts`: Table definitions (users, intakeForms, sessions, queue, volunteers) with indexes
  - `intake.ts`: Mutations/queries for intake form submission and retrieval
  - `queue.ts`: Mutations/queries for queue operations (start timer, remove user, get position)
  - `sessions.ts`: Mutations/queries for session management (create, fetch active)
  - `_generated/`: Auto-generated TypeScript types (read-only)

**`hooks/`:**
- Purpose: Custom React hooks for shared logic
- Contains: Color scheme detection, theme color selection
- Pattern: Platform-specific implementations (ios vs web variants when needed)

**`assets/images/`:**
- Purpose: Static image assets (PNG, SVG)
- Usage: Imported directly in component files with `require()`

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root layout, wraps app with ThemeProvider, defines Stack navigator
- `app/provider.tsx`: Provider flow starting screen (currently renders RoleSelectionScreen)
- `components/provider/navigation/RootNavigator.tsx`: Main navigation orchestrator (not yet integrated)

**Configuration:**
- `tsconfig.json`: TypeScript compiler config (strict mode enabled, `@/*` path alias)
- `package.json`: Dependencies, npm scripts (expo start, lint, convex dev)
- `CLAUDE.md`: Architecture guidelines and development commands
- `constants/theme.ts`: Design system constants

**Core Logic:**
- `components/provider/navigation/RootNavigator.tsx`: Navigation state management and screen flow
- `convex/scheme.ts`: Data model schema definition
- `convex/intake.ts`, `queue.ts`, `sessions.ts`: Business logic mutations/queries

**Testing:**
- Not yet implemented (no test files found)

## Naming Conventions

**Files:**
- Screen components: PascalCase with "Screen" suffix (e.g., `RoleSelectionScreen.tsx`)
- Atomic components: PascalCase (e.g., `CustomButton.tsx`, `InputField.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `use-color-scheme.ts`, `use-theme-color.ts`)
- Convex functions: camelCase (e.g., `submitIntakeForm`, `getActiveQueue`, `startTimer`)
- Style files: Inline StyleSheet objects in component files (no separate .css/.styles files)

**Functions/Variables:**
- Component names: PascalCase (React component convention)
- Event handlers: camelCase, "on" prefix (e.g., `onRoleSelect`, `onPress`, `onChangeText`)
- State variables: camelCase (e.g., `selectedRole`, `firstName`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (e.g., `ROLE_OPTIONS`, `LIVING_CONDITION_OPTIONS`)

**Types/Interfaces:**
- Props interfaces: PascalCase with "Props" suffix (e.g., `CustomButtonProps`, `RegistrationFormScreenProps`)
- Data types: PascalCase (e.g., `RegistrationData`, `NavigationState`, `RootStackParamList`)

**Directories:**
- Component folders: lowercase (e.g., `atoms`, `screens`, `provider`, `ui`)
- Feature folders: lowercase (e.g., `components`, `constants`, `hooks`, `convex`)

## Where to Add New Code

**New Feature:**
- Primary code: Place in `components/provider/screens/` (if a full screen) or `components/provider/atoms/` (if reusable component)
- Mutations/queries: Add to appropriate file in `convex/` (e.g., `queue.ts`, `sessions.ts`, or create new module)
- Tests: Create `.test.tsx` or `.spec.tsx` file adjacent to implementation (pattern not yet used)

**New Component/Module:**
- Implementation:
  - Atomic UI components → `components/provider/atoms/`
  - Full screens → `components/provider/screens/`
  - General utilities → `components/ui/`
  - Custom hooks → `hooks/` (use platform-specific variants if needed: `.ts`, `.web.ts`, `.ios.ts`)
- Styling: Define `StyleSheet.create()` at end of file, import theme constants at top
- Props: Define interface named `[ComponentName]Props` at top of file

**Utilities/Helpers:**
- Shared hooks: `hooks/` directory
- Design tokens: `constants/theme.ts`
- Custom types: Co-locate with usage or add to relevant component file

**Navigation/Flow:**
- Route definitions: File-based in `app/` directory (Expo Router reads filesystem)
- Flow logic: `components/provider/navigation/RootNavigator.tsx`
- Screen interactions: Pass callbacks via props from RootNavigator to screens

## Special Directories

**`convex/_generated/`:**
- Purpose: Auto-generated Convex type definitions and API helpers
- Generated: Yes (by `npx convex dev` and `npx convex deploy`)
- Committed: Yes (generated files are checked in for IDE type support)
- Notes: Do not edit manually. Regenerated on backend changes.

**`app/(tabs)/`:**
- Purpose: Grouped routes - the parentheses mean this folder doesn't add to the URL path
- Generated: No
- Committed: Yes
- Notes: Creates bottom tab navigator with two routes: home (index.tsx) and explore (explore.tsx)

**`.expo/`:**
- Purpose: Expo-specific metadata and router types
- Generated: Yes (by Expo tooling)
- Committed: Partially (includes router.d.ts for types)
- Notes: Contains device preferences, build cache metadata

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Yes (by GSD mappers)
- Committed: Yes
- Notes: Used by `/gsd:plan-phase` and `/gsd:execute-phase` commands

**`assets/`:**
- Purpose: Static resources (images, icons, fonts)
- Generated: No
- Committed: Yes
- Notes: Images imported with `require()` in component files

## Module Organization Patterns

**Component Pattern:**
```typescript
// File: components/provider/atoms/CustomButton.tsx
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';

export interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'alert';
}

export function CustomButton({ label, onPress, variant = 'primary' }: CustomButtonProps) {
  // Implementation
}

const styles = StyleSheet.create({
  // All styles use imported constants
});
```

**Screen Pattern:**
```typescript
// File: components/provider/screens/RegistrationFormScreen.tsx
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { Header } from '../atoms/Header';
import { InputField } from '../atoms/InputField';
import { CustomButton } from '../atoms/CustomButton';

export interface RegistrationFormScreenProps {
  onSubmit: (formData: RegistrationData) => void;
  onBack?: () => void;
}

export function RegistrationFormScreen({ onSubmit, onBack }: RegistrationFormScreenProps) {
  // Compose atoms into full screen
}
```

**Navigation Pattern:**
```typescript
// File: components/provider/navigation/RootNavigator.tsx
const [navigationState, setNavigationState] = useState<NavigationState>({...});

<Stack.Screen name="Registration">
  {({ navigation }) => (
    <RegistrationFormScreen
      onSubmit={(data) => {
        setNavigationState(prev => ({ ...prev, registrationData: data }));
        navigation.navigate('NextScreen');
      }}
    />
  )}
</Stack.Screen>
```

**Convex Function Pattern:**
```typescript
// File: convex/intake.ts
export const submitIntakeForm = mutation({
  args: { /* typed args */ },
  handler: async (ctx, args) => {
    // Insert to DB
    // Query for related data
    // Return result with proper types
  },
});
```

---

*Structure analysis: 2026-01-23*
