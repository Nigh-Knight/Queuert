# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- React components use PascalCase: `CustomButton.tsx`, `RoleSelectionScreen.tsx`
- Utility/hook files use camelCase with kebab separators: `use-color-scheme.ts`, `use-theme-color.ts`
- Convex functions use camelCase: `intake.ts`, `queue.ts`, `sessions.ts`

**Functions:**
- React components (functional): PascalCase `CustomButton`, `RoleSelectionScreen`
- Utility functions: camelCase `formatPhoneNumber`, `handleSubmit`, `getButtonStyle`
- Handler/callback functions: prefixed with `handle` or `on`: `handleSubmit()`, `onPress()`, `onRoleSelect()`
- Query/mutation handlers: descriptive verbs: `submitIntakeForm`, `getActiveQueue`, `startTimer`, `removeFromQueue`

**Variables:**
- State variables: camelCase `selectedRole`, `phoneNumber`, `isLoading`
- Boolean flags: prefixed with `is` or `has`: `isFormValid`, `isLoading`, `isSelected`
- Constants: SCREAMING_SNAKE_CASE for static data: `ROLE_OPTIONS`, `COUNTRY_OPTIONS`, `LIVING_CONDITION_OPTIONS`
- Local callback assignments: camelCase `countryCode`, `errorMessage`

**Types/Interfaces:**
- Component props interfaces: `{ComponentName}Props` suffix: `CustomButtonProps`, `InputFieldProps`, `HeaderProps`, `RoleSelectionScreenProps`
- Data types: PascalCase: `RegistrationData`, `NavigationState`, `RootStackParamList`
- Union types: use `v.union()` in Convex for string literals

## Code Style

**Formatting:**
- ESLint with Expo config (`eslint-config-expo` v10.0.0)
- Run with: `npm run lint`
- No Prettier config found; follows Expo lint defaults
- 2-space indentation (Expo standard)
- Semicolons required
- Single quotes for strings (Expo default)

**Linting:**
- Tool: ESLint with Expo configuration
- Config: `eslint-config-expo` in package.json
- Run: `npm run lint` triggers `expo lint`
- No custom .eslintrc found; uses Expo's default rules

## Import Organization

**Order:**
1. React and React Native imports: `import React from 'react'`
2. React Native standard components: `import { View, Text, StyleSheet } from 'react-native'`
3. Third-party libraries: `import { useNavigation } from '@react-navigation/native'`
4. Internal components/modules with path aliases: `import { CustomButton } from '@/components/...`
5. Local files and utilities from relative paths

**Pattern examples:**
```typescript
// components/provider/atoms/CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, ComponentSize, Spacing } from '@/constants/theme';

// convex/intake.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
```

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json`)
- Used consistently throughout: `@/constants/theme`, `@/components/...`, `@/hooks/...`

## Error Handling

**Patterns:**
- No try-catch blocks in reviewed source components (error handling not yet implemented in most screens)
- Validation happens before state updates: `if (!isFormValid) return;`
- Loading states managed with `isLoading` flags during async operations
- Simulated API calls use `setTimeout` for demo purposes
- Error messages displayed via `errorMessage` prop on `InputField`: `errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>`

**Convex mutations:**
- Arguments validated by Convex schema using `v.string()`, `v.id()`, `v.union()`, etc.
- Schema validation happens at DB layer; no explicit error handling in mutation handlers
- Async mutations use standard `async/await` pattern

## Logging

**Framework:** `console` (React Native standard)

**Patterns:**
- Minimal logging in reviewed code
- Example: `console.log('Selected role:', role)` in `provider.tsx`
- No structured logging framework implemented
- Debug statements should use descriptive messages

## Comments

**When to Comment:**
- File-level: Used at top of files like `constants/theme.ts` with JSDoc block
- Complex logic: Used sparingly (none found in reviewed components - code is generally self-documenting)
- Database schema: Comments explain purpose of fields: `phone: v.optional(v.string()), // Unverified, just for SMS notifications`

**JSDoc/TSDoc:**
- Used for module documentation: See `constants/theme.ts` header
- Not extensively used for individual functions (code is self-documenting via TypeScript types)
- Interface documentation via inline comments on complex union types

**Example:**
```typescript
/**
 * Queuert Design System
 * Colors, typography, spacing, and component sizing
 */
```

## Function Design

**Size:**
- Small, focused functions following React component best practices
- Atoms like `CustomButton` are ~100 lines including styles
- Screen components like `RegistrationFormScreen` are ~180 lines
- Convex queries/mutations are 10-30 lines

**Parameters:**
- React components use props interface: single `props` parameter destructured in function signature
- Utility functions use direct parameters: `formatPhoneNumber(text: string)`
- Callbacks passed as named props: `onPress`, `onSubmit`, `onBack`, `onChange`

**Return Values:**
- React components return JSX
- Utility functions return specific types: `string`, `boolean`, `Promise<T>`
- Convex mutations return inserted/patched IDs or void
- Convex queries return documents or null

## Module Design

**Exports:**
- Named exports for all components and functions: `export function CustomButton(...)`, `export const submitIntakeForm = mutation(...)`
- No default exports in utility/hook files
- Interfaces exported alongside components: `export interface CustomButtonProps {}`

**Barrel Files:**
- Not used extensively
- Components are imported directly from their files: `import { CustomButton } from '@/components/provider/atoms/CustomButton'`
- Can optimize by creating `index.ts` files in component directories for future refactoring

**Example structure:**
```typescript
// components/provider/atoms/CustomButton.tsx
export interface CustomButtonProps { ... }
export function CustomButton({ ... }: CustomButtonProps) { ... }
const styles = StyleSheet.create({ ... });
```

## StyleSheet Usage

**Pattern:**
- All styling uses `StyleSheet.create()` from React Native
- Styles defined at end of component file as `const styles = StyleSheet.create({ ... })`
- No inline styles or CSS-in-JS libraries
- Styles use centralized design system constants

**Design System Constants:**
- All color values imported from `@/constants/theme`: `Colors.primary`, `Colors.text.secondary`, `Colors.alert`
- Typography values: `Typography.h1.fontSize`, `Typography.body.fontWeight`
- Spacing: `Spacing.lg`, `Spacing.md`, `Spacing.xs` (4px increments)
- Component sizes: `ComponentSize.buttonHeight`, `ComponentSize.cardRadius`
- Never hardcode hex colors, font sizes, or padding values

**Example:**
```typescript
const styles = StyleSheet.create({
  button: {
    height: ComponentSize.buttonHeight,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
  },
});
```

## Convex Patterns

**Mutation Structure:**
```typescript
export const submitIntakeForm = mutation({
  args: {
    serviceUserId: v.id("users"),
    firstName: v.string(),
    // ... validated arguments
  },
  handler: async (ctx, args) => {
    // Implementation
    return insertedId;
  },
});
```

**Query Structure:**
```typescript
export const getActiveQueue = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    // Implementation
    return result;
  },
});
```

**Schema Definitions:**
- Use `defineTable()` with validators: `v.string()`, `v.id()`, `v.union()`, `v.boolean()`, `v.number()`
- Index critical fields for performance: `.index("by_phone", ["phone"])`
- Optional fields marked: `v.optional(v.string())`
- Union types for enums: `v.union(v.literal("value1"), v.literal("value2"))`

---

*Convention analysis: 2026-01-23*
