# Stack Research

**Domain:** Mobile Queue Management with Real-time Sync
**Researched:** 2025-01-23
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Convex React Hooks | ^1.31.6 (current) | Real-time queue sync | Built-in WebSocket subscriptions, automatic consistency guarantees, mutation retry logic. Use `useQuery` for reactive data, `useMutation` for queue operations. Already in package.json. |
| react-native-mmkv | latest (v4 Nitro) | Offline queue cache | 30x faster than AsyncStorage, synchronous API, encryption support. Critical for read-only offline mode during spotty connectivity. |
| expo-camera | ~17.0.10 | QR code scanning | Native barcode scanning via Google Code Scanner (Android) and DataScannerViewController (iOS 16+). expo-barcode-scanner is deprecated. |
| react-i18next + i18next + expo-localization | 16.5.3 + latest + SDK 54 | Multi-language support | React 19 compatible, standard for Expo apps, supports Spanish/Portuguese/Haitian Creole. Auto-detect device locale. |
| expo-notifications | 0.32.16 | Push notifications | Native FCM/APNs integration for volunteer wash completion alerts. Requires EAS Build for SDK 54. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| googleapis | ^170.1.0 | Google Sheets export | Backend-only (Convex actions). Use Sheets v4 API with service account auth for real-time export. NOT for client-side. |
| @react-native-async-storage/async-storage | 2.2.0 (installed) | Language persistence | Store user's selected language preference. Already in package.json. Supplement to MMKV for simple key-value. |
| react-native-nitro-modules | latest | MMKV dependency | Required for react-native-mmkv v4 on Expo. Install with `npx expo install`. |
| expo-device | latest | Push notification setup | Detect physical device vs emulator. Push notifications require real devices. |
| expo-constants | ~18.0.13 (installed) | App configuration | Access Expo config for push token registration. Already in package.json. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Convex Dev Server | Backend development | Run `npx convex dev` in separate terminal. Auto-sync schema and functions. |
| EAS Build | Native builds with credentials | Required for push notifications on SDK 54. Use `eas build --profile development`. |
| Convex Dashboard | Real-time data inspection | Monitor queue state, test mutations, view logs at dashboard.convex.dev. |

## Installation

```bash
# Real-time sync (already installed)
# convex: ^1.31.6 already in package.json

# Offline storage
npx expo install react-native-mmkv react-native-nitro-modules
npx expo prebuild  # Required for native modules

# QR scanning
npx expo install expo-camera

# Multi-language
npx expo install expo-localization
npm install react-i18next i18next

# Push notifications
npx expo install expo-notifications expo-device

# Google Sheets (backend only - add to Convex project)
# Run this in your Convex functions directory context
npm install googleapis  # For use in Convex actions only
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| react-native-mmkv | AsyncStorage (installed) | Use AsyncStorage only for simple language preference. MMKV for queue cache (performance critical). |
| expo-camera | react-native-vision-camera | If you need advanced camera features beyond QR scanning. Vision-camera has more features but requires more setup. |
| react-i18next | expo-localization only | If you only need locale detection without full translation framework. Not suitable for this project (need 4 languages). |
| Convex real-time | Firebase Realtime Database | If you weren't already using Convex. Convex is better: type-safe, built-in consistency, no manual cache invalidation. |
| googleapis | Google Sheets API wrappers | Direct googleapis is most flexible for Sheets v4 API. Wrappers like `google-spreadsheet` add abstraction but less control. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| expo-barcode-scanner | Deprecated in favor of expo-camera | expo-camera with barcodeScannerSettings |
| AsyncStorage for queue cache | Too slow (5-30x slower than MMKV), async API adds complexity | react-native-mmkv for offline queue data |
| Client-side Google Sheets API | Exposes service account keys, exceeds quota limits | googleapis in Convex actions (backend only) |
| Expo Go for push notifications | Doesn't support native modules or FCM setup | EAS development build |
| react-native-vision-camera for QR only | Overkill, requires more native setup | expo-camera (QR scanning works out of box) |

## Stack Patterns by Feature

### Real-Time Queue Sync

**Pattern:**
```typescript
// In queue component
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const queue = useQuery(api.queue.getActiveQueue, { sessionId });
const startTimer = useMutation(api.queue.startTimer);

// Data updates automatically when backend changes
// No manual refetch or cache invalidation needed
```

**Why:** Convex `useQuery` creates WebSocket subscription. When any volunteer updates queue, all devices receive consistent update simultaneously. Mutations retry automatically on network issues.

**Confidence:** HIGH - Verified from [Convex React documentation](https://docs.convex.dev/client/react).

### Offline Read-Only Mode

**Pattern:**
```typescript
import { MMKV } from 'react-native-mmkv';

const queueCache = new MMKV({ id: 'queue-cache' });

// On successful query, cache the data
useEffect(() => {
  if (queue) {
    queueCache.set('active-queue', JSON.stringify(queue));
  }
}, [queue]);

// When offline, read from cache
const cachedQueue = queue ?? JSON.parse(queueCache.getString('active-queue') ?? '[]');
```

**Why:** MMKV is synchronous (no async/await), so reading cache is instant. Store last-known queue state when online, display cached version when network drops.

**Limitation:** Read-only. Mutations require connectivity (Convex mutation retry handles reconnection).

**Confidence:** HIGH - MMKV performance verified from [GitHub benchmarks](https://github.com/mrousavy/react-native-mmkv).

### QR Code Scanning

**Pattern:**
```typescript
import { CameraView } from 'expo-camera';

<CameraView
  style={styles.camera}
  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
  onBarcodeScanned={handleVolunteerQRScan}
/>
```

**Why:** expo-camera ~17.0.10 includes native barcode scanning. On Android uses Google Code Scanner, on iOS uses DataScannerViewController (iOS 16+).

**Gotcha:** Web support is limited (only QR codes, unreliable). Test on physical iOS/Android devices.

**Confidence:** HIGH - Verified from [Expo Camera docs](https://docs.expo.dev/versions/latest/sdk/camera/).

### Multi-Language Support

**Pattern:**
```typescript
// Setup i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require('./locales/en.json') },
    es: { translation: require('./locales/es.json') },
    pt: { translation: require('./locales/pt.json') },
    ht: { translation: require('./locales/ht.json') }, // Haitian Creole
  },
  lng: Localization.locale.split('-')[0], // 'en-US' -> 'en'
  fallbackLng: 'en',
});

// In components
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Text>{t('queue.position')}</Text>
```

**Why:** react-i18next is React 19 compatible (v16.5.3), standard for React Native, supports runtime language switching. expo-localization auto-detects device language.

**Confidence:** MEDIUM - Library versions verified, but Haitian Creole support requires manual translation files.

### Google Sheets Real-Time Export

**Pattern (Convex action, not client-side):**
```typescript
// convex/sheets.ts
import { action } from "./_generated/server";
import { google } from "googleapis";

export const exportQueueData = action({
  handler: async (ctx) => {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const queueData = await ctx.runQuery(api.queue.getActiveQueue, {});

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: "Queue!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [/* map queueData to rows */] },
    });
  },
});
```

**Why:** Service account auth in backend protects credentials. Run as scheduled action (every 5 min) or trigger on queue changes. No client-side API key exposure.

**Important:** googleapis is for backend (Convex actions) only. Never expose service account keys to client.

**Confidence:** HIGH - Standard pattern for server-side Sheets integration. Verified from [Google Sheets API docs](https://developers.google.com/sheets/api/quickstart/nodejs).

### Push Notifications for Volunteers

**Pattern:**
```typescript
// Register for push token
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const registerForPushNotifications = async () => {
  if (!Device.isDevice) return null; // Requires physical device

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync();
  // Save token to Convex for this volunteer
  await saveVolunteerPushToken(token.data);
};

// Send from backend (Convex action)
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: volunteerToken,
    title: 'Wash Complete',
    body: 'Machine 3 finished for John Doe',
  }),
});
```

**Why:** Expo Push Notification service handles FCM/APNs complexity. Register tokens on volunteer login, send from Convex when timer expires.

**Requirement:** Must use EAS Build for SDK 54. Push notifications don't work in Expo Go.

**Confidence:** HIGH - Standard Expo push notification pattern. Verified from [Expo push notification docs](https://docs.expo.dev/push-notifications/push-notifications-setup/).

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| expo-camera ~17.0.10 | Expo SDK 54, React Native 0.81 | Bundled with SDK 54. Barcode scanning works iOS/Android, limited on web. |
| react-native-mmkv v4 | Expo SDK 54, React Native 0.75+ | Nitro module requires `react-native-nitro-modules`. Known issue: [Android build problems on SDK 54](https://github.com/expo/expo/issues/38991). |
| react-i18next 16.5.3 | React 19.1.0 | Fixed React 19 compatibility issues (JSX namespace, ref warnings). |
| expo-notifications 0.32.16 | Expo SDK 54 | Requires EAS Build. Does not work in Expo Go or emulators. |
| Convex 1.31.6 | React 19, React Native 0.81 | No compatibility issues. WebSocket reconnection automatic. |

## Architecture Decisions

### Why Convex for Real-Time?

**Chosen:** Convex with built-in real-time subscriptions

**Rationale:**
1. Already integrated (v1.31.6 in package.json, schema defined)
2. Automatic consistency: All `useQuery` hooks update simultaneously from single DB state
3. Mutation retry: Network drops don't lose volunteer actions (queue updates, timer starts)
4. Type safety: Generated TypeScript types for all queries/mutations
5. No manual cache invalidation: `useQuery` subscribes, updates push automatically

**Alternative considered:** Firebase Realtime Database
- Rejected: Would require rewriting schema, manual cache management, no automatic type generation

**Confidence:** HIGH - Convex already integrated and working.

### Why MMKV for Offline?

**Chosen:** react-native-mmkv for offline queue cache

**Rationale:**
1. Performance: 30x faster than AsyncStorage (critical for real-time UI)
2. Synchronous API: No async/await, instant cache reads
3. Encryption: Can encrypt cached queue data if needed
4. React Native native module: Works with Expo after prebuild

**Alternative considered:** AsyncStorage (already installed)
- Rejected: Too slow for real-time queue updates, async API adds complexity
- Still useful: Keep AsyncStorage for simple language preference storage

**Gotcha:** react-native-mmkv v4 has known Android build issues on Expo SDK 54. Monitor [Issue #38991](https://github.com/expo/expo/issues/38991). If blocked, fall back to AsyncStorage temporarily (accept performance hit).

**Confidence:** MEDIUM-HIGH - Performance benefits verified, but Expo 54 compatibility has active issues.

### Why expo-camera over vision-camera?

**Chosen:** expo-camera for QR scanning

**Rationale:**
1. Built into Expo SDK 54 (~17.0.10): No additional native setup
2. QR scanning works out of box: `barcodeScannerSettings={{ barcodeTypes: ["qr"] }}`
3. Sufficient for use case: Only need QR codes (not advanced camera features)
4. Cross-platform: Native scanning on iOS (DataScannerViewController) and Android (Google Code Scanner)

**Alternative considered:** react-native-vision-camera
- Rejected: More features (frame processors, video) not needed, requires more native configuration
- When to use: If you need advanced camera features beyond QR scanning

**Gotcha:** Web support is limited (QR only, unreliable in Chrome/Firefox). Test on physical devices.

**Confidence:** HIGH - QR scanning is primary use case, expo-camera sufficient.

### Why Backend Google Sheets Integration?

**Chosen:** googleapis in Convex actions (backend only)

**Rationale:**
1. Security: Service account credentials stay in backend environment variables
2. Quota: Backend requests don't hit per-user API quotas
3. Reliability: Scheduled Convex actions run even if no clients online
4. Control: Direct Sheets v4 API access for append/update operations

**Alternative considered:** Client-side react-native-google-sheet
- Rejected: Exposes credentials, hits quota limits with 100 users, can't run when app closed

**Pattern:** Run Convex scheduled action every 5 minutes to export queue snapshot to Google Sheets

**Confidence:** HIGH - Backend integration is standard pattern for Sheets export.

## Open Questions & Risks

### MMKV v4 on Expo SDK 54

**Status:** LOW risk, monitor

**Issue:** GitHub reports Android build failures with react-native-mmkv v4 on Expo SDK 54 ([Issue #38991](https://github.com/expo/expo/issues/38991))

**Mitigation:**
1. Test MMKV installation immediately after setup
2. If build fails, temporarily use AsyncStorage for offline cache (accept performance hit)
3. Monitor issue for resolution, upgrade MMKV when fixed

**Impact:** Medium - Offline mode would be slower with AsyncStorage but still functional

### Push Notifications Require EAS Build

**Status:** MEDIUM risk, known limitation

**Requirement:** expo-notifications requires EAS Build on SDK 54. Cannot use Expo Go.

**Mitigation:**
1. Set up EAS Build early in development (free tier available)
2. Test push notifications on physical devices (not emulators)
3. Budget time for EAS Build setup (FCM credentials, APNs certificates)

**Impact:** Low - Standard Expo workflow, well-documented

### QR Scanning on Web

**Status:** LOW risk, acceptable limitation

**Issue:** expo-camera barcode scanning on web is unreliable (QR only, often fails in browsers)

**Mitigation:**
1. Target iOS/Android as primary platforms (Laundry Love events use mobile devices)
2. If web support needed, consider manual volunteer ID entry as fallback

**Impact:** Low - Web is not primary platform for this use case

### Haitian Creole Translation Quality

**Status:** MEDIUM risk, requires validation

**Challenge:** react-i18next supports any language, but translation quality depends on manual files

**Mitigation:**
1. Use professional translation service for Haitian Creole (Spanish/Portuguese easier)
2. Validate translations with native speakers before deployment
3. Ensure right-to-left text not needed (Creole is left-to-right)

**Impact:** Medium - Poor translations harm user experience for Haitian Creole speakers

## Sources

### High Confidence (Official Documentation)
- [Convex React Hooks](https://docs.convex.dev/client/react) - Real-time patterns, useQuery/useMutation
- [Expo Camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/) - Version, barcode scanning setup
- [Expo Push Notifications Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/) - SDK 54 requirements
- [react-native-mmkv GitHub](https://github.com/mrousavy/react-native-mmkv) - Performance benchmarks, v4 installation
- [Google Sheets API Node.js Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs) - Service account auth

### Medium Confidence (Community + Official)
- [react-i18next Changelog](https://github.com/i18next/react-i18next/blob/master/CHANGELOG.md) - React 19 compatibility
- [Expo Localization Documentation](https://docs.expo.dev/versions/latest/sdk/localization/) - Device locale detection
- [LogRocket: Convex State Management](https://blog.logrocket.com/using-convex-for-state-management/) - Real-time patterns
- [MMKV vs AsyncStorage Comparison](https://reactnativeexpert.com/blog/mmkv-vs-asyncstorage-in-react-native/) - Performance benchmarks
- [Expo SDK 54 Android MMKV Issue](https://github.com/expo/expo/issues/38991) - Known compatibility problem

### Low Confidence (Needs Validation)
- Haitian Creole i18n support - No specific documentation found, requires manual translation files
- Web QR scanning reliability - Multiple sources report issues, needs testing on target browsers

---
*Stack research for: Queuert Mobile Queue Management*
*Researched: 2025-01-23*
*Next: Feed into roadmap phase structure (offline setup → real-time sync → multi-language → push notifications)*
