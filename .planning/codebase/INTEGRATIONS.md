# External Integrations

**Analysis Date:** 2026-01-23

## APIs & External Services

**Convex Backend:**
- Convex cloud - Complete backend-as-a-service for database, mutations, queries, and realtime subscriptions
  - SDK/Client: `convex` package (1.31.6)
  - Deployment: Hosted at `https://cheerful-greyhound-927.convex.cloud`
  - Auth: Project deployment ID `dev:cheerful-greyhound-927` (development)
  - Type-safe API: Auto-generated types from `convex/_generated/api`

**Planned Integrations (Not Yet Implemented):**
- Google Sheets API - Planned for data sync and reporting (mentioned in PRD, no code present)
- SMS Gateway (Twilio or equivalent) - Planned for user notifications (no implementation)
- Push Notification Service (FCM/APNS) - Planned for volunteer alerts when wash completes (no implementation)

## Data Storage

**Database:**
- Convex Database (cloud) - Primary data store
  - Connection: Via `EXPO_PUBLIC_CONVEX_URL` environment variable
  - Client: Convex SDK (`convex` package)
  - Schema: `convex/scheme.ts` defines tables: `users`, `intakeForms`, `sessions`, `queue`, `volunteers`
  - Access Pattern: Type-safe mutations and queries via `convex/_generated/api`

**Tables:**
- `users` - Service providers, volunteers, service users with roles, location, language
- `intakeForms` - Laundry intake data (load size, weight, living situation)
- `sessions` - Active service sessions per location
- `queue` - Queue entries with position, status, timer, volunteer assignment
- `volunteers` - Volunteer assignments to sessions with QR codes

**Local Storage:**
- Async Storage - Device-level caching via `@react-native-async-storage/async-storage`
  - Used for offline support and local state persistence
  - No current implementation in components (ready for use)

**File Storage:**
- Local filesystem only - App stores icons and images locally
- Expo Image (`expo-image`) for optimized local image loading

**Caching:**
- None configured - Convex provides realtime synchronization, no explicit cache layer

## Authentication & Identity

**Auth Provider:**
- Custom implementation planned - No third-party auth service integrated
- Current approach: Phone-based registration with verification flow
  - Phone verification: UI-only (no OTP logic implemented yet)
  - QR Code tracking: Each volunteer assigned unique QR code via `volunteers.qrCode` field
  - User roles: `service_provider`, `volunteer`, `service_user` (enum in schema)

**Session Management:**
- Convex sessions table - Tracks active service sessions per location
- Session creation: `createSession` mutation in `convex/sessions.ts`
- Session lookup: `getActiveSession` query filters by location and active status

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Rollbar, or similar service

**Logs:**
- Convex dashboard - Backend function execution logs accessible via Convex control panel
- Expo DevTools - Local development logging and debugging
- React Native Debugger - Client-side debugging (not configured, but available)
- Console logging - Standard `console.log()` in code (no structured logging framework)

**Metrics:**
- None configured - No analytics or performance monitoring service

## CI/CD & Deployment

**Hosting:**
- Expo Application Services (EAS) - Recommended for iOS and Android builds (configured in app.json)
- Convex cloud - Backend hosting (deployment `cheerful-greyhound-927`)
- Static web hosting - Expo Web outputs static files (`web.output: "static"` in app.json)

**CI Pipeline:**
- None detected - No GitHub Actions, GitLab CI, or similar configured
- Manual deployment: `npx convex deploy` for backend
- Expo CLI handles local and EAS builds

## Environment Configuration

**Required env vars:**
- `CONVEX_DEPLOYMENT` - Convex project ID for development (value: `dev:cheerful-greyhound-927`)
- `EXPO_PUBLIC_CONVEX_URL` - Public Convex backend URL (value: `https://cheerful-greyhound-927.convex.cloud`)

**Optional env vars:**
- None detected

**Secrets location:**
- `.env.local` - Development secrets (contains Convex deployment info)
- File is NOT in .gitignore, contains public Convex URL (acceptable)
- Production secrets: Not yet configured (would be set via EAS secrets or Convex env vars)

## Webhooks & Callbacks

**Incoming:**
- None implemented - No webhook endpoints for external service callbacks

**Outgoing:**
- Planned: Timer completion callbacks to push notification service (not implemented)
- Planned: Data sync webhooks to Google Sheets (not implemented)

**Deep Linking:**
- Expo Linking configured (`expo-linking` 8.0.11)
- Scheme: `queuert://` (defined in app.json)
- Used for QR code scanning callbacks (implementation pending)

## Third-Party Service Dependencies

**Not Present:**
- No OAuth providers (Google, Apple, etc.)
- No payment processing (Stripe, Paddle, etc.)
- No email service (SendGrid, Mailgun, etc.)
- No social media integrations
- No analytics service (Mixpanel, Amplitude, etc.)
- No crash reporting (Sentry, Crashlytics, etc.)

## Known Gaps (From PRD)

**Unimplemented Integrations:**
1. **Google Sheets** - For data export and reporting (mentioned as requirement)
2. **SMS Gateway** - Phone verification OTP and user notifications (Twilio or equivalent)
3. **Push Notifications** - Volunteer alerts (Firebase Cloud Messaging or Apple Push Notification service)
4. **Offline Mode** - Data caching and sync when connectivity returns (structure in place via Async Storage)

---

*Integration audit: 2026-01-23*
