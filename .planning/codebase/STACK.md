# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code, Convex backend functions, configuration
- JavaScript - Configuration files (app.json, package.json)

**Secondary:**
- JSX/TSX - React components in Expo frontend and Convex functions

## Runtime

**Environment:**
- Expo 54.0.32 - Universal React Native runtime supporting iOS, Android, and Web
- Node.js - For development and Convex backend (version not explicitly specified)

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` (implicit from npm usage)

## Frameworks

**Core:**
- React 19.1.0 - UI framework for web and React Native
- React Native 0.81.5 - Native mobile framework
- Expo Router 6.0.22 - File-based routing for Expo (replaces React Navigation setup)

**Backend:**
- Convex 1.31.6 - Backend-as-a-service with realtime database, mutations, and queries
  - Provides TypeScript-first API with auto-generated types
  - Handles authentication, database operations, and realtime subscriptions
  - Config: `.env.local` contains `CONVEX_DEPLOYMENT` and `EXPO_PUBLIC_CONVEX_URL`

**Navigation:**
- React Navigation 7.1.8 - Core navigation library
- @react-navigation/bottom-tabs 7.4.0 - Tab-based navigation for provider/volunteer flows
- @react-navigation/native 7.1.8 - Native navigation primitives
- @react-navigation/elements 2.6.3 - Reusable navigation elements

**UI Components:**
- React Native Paper 5.14.5 - Material Design component library
- Expo Symbols 1.0.8 - Platform-specific SF Symbols (iOS) and Material Icons

**Testing:**
- Not configured - No test framework present (Jest, Vitest, etc. not in dependencies)

**Build/Dev:**
- Expo CLI - Development server and build tooling (via `expo` package)
- ESLint 9.25.0 - Code linting
  - Config: `eslint-config-expo` 10.0.0 (standard Expo lint rules)
  - Run: `npm run lint`

## Key Dependencies

**Critical:**
- `convex` 1.31.6 - Entire backend layer, data persistence, realtime queries/mutations
- `expo-router` 6.0.22 - File-based routing system (app structure depends on this)
- `react-native` 0.81.5 - Core mobile framework
- `react` 19.1.0 - React runtime and hooks

**State Management:**
- `zustand` 5.0.10 - Installed but not yet integrated (planned for navigation state migration)

**Local Storage:**
- @react-native-async-storage/async-storage 2.2.0 - Local device storage for caching/state

**UI & Styling:**
- `react-native-paper` 5.14.5 - Material Design components
- `expo-symbols` 1.0.8 - Native icon system
- StyleSheet (built-in React Native) - CSS-in-JS for styling

**Platform Utilities:**
- expo-haptics 15.0.8 - Haptic feedback (vibration on button presses)
- expo-image 3.0.11 - Optimized image loading
- expo-font 14.0.11 - Custom font loading
- expo-constants 18.0.13 - App metadata and constants
- expo-linking 8.0.11 - Deep linking support
- expo-web-browser 15.0.10 - In-app browser for external links
- expo-status-bar 3.0.9 - Status bar control
- expo-splash-screen 31.0.13 - Splash screen management
- expo-system-ui 6.0.9 - System UI configuration

**Animation & Gesture:**
- react-native-reanimated 4.1.1 - Smooth gesture-based animations
- react-native-worklets 0.5.1 - Native worklet support for performance
- react-native-gesture-handler 2.28.0 - Gesture detection library

**Safe Area:**
- react-native-safe-area-context 5.6.0 - Safe area handling for notched devices
- react-native-screens 4.16.0 - Native screen containers

**Web Support:**
- react-native-web 0.21.0 - React Native components on web
- react-dom 19.1.0 - React DOM renderer for web

**Vector Icons:**
- @expo/vector-icons 15.0.3 - Icon library integration

## Configuration

**Environment:**
- TypeScript: `tsconfig.json` with strict mode enabled, path alias `@/*` for root imports
- Convex: Separate TypeScript config at `convex/tsconfig.json` for backend functions
- Expo: `app.json` defines app metadata, plugins, and platform-specific configuration

**Build:**
- Expo build system manages iOS, Android, and Web builds
- Plugins configured: `expo-router`, `expo-splash-screen`
- Experiments enabled: `typedRoutes` (Expo Router), `reactCompiler` (React compiler)
- New Architecture enabled: `newArchEnabled: true` in app.json

**Critical Env Vars:**
- `CONVEX_DEPLOYMENT` - Convex project deployment ID (in `.env.local`)
- `EXPO_PUBLIC_CONVEX_URL` - Convex backend URL (public, in `.env.local`)

## Platform Requirements

**Development:**
- Node.js (version unspecified, recommend 18+)
- npm
- Expo CLI: `npx expo start` (handles platform selection)

**Target Platforms:**
- iOS (via Expo)
- Android (via Expo)
- Web (static output via Expo Web)

**Production:**
- Deployment: Expo Application Services (EAS) or standalone builds
- Backend: Convex cloud deployment (referenced in `.env.local`)

---

*Stack analysis: 2026-01-23*
