# Phase 2: Authentication & Role Access - Research

**Researched:** 2026-01-26
**Domain:** React Native authentication, session management, QR code validation, role-based access control
**Confidence:** HIGH

## Summary

Phase 2 connects existing UI screens to Convex backend for role-based authentication using three distinct access patterns: admin verification codes, volunteer QR scanning, and service user phone/name entry. The standard stack centers on expo-camera for QR scanning, AsyncStorage for session persistence, and Convex mutations for role-based access control.

Research confirms that the locked decisions (expo-camera for scanning, AsyncStorage for storage, specific QR validation flows) are well-supported by current libraries and align with React Native best practices. The primary technical challenges involve camera permission edge cases, secure QR code validation, and real-time session state synchronization.

**Primary recommendation:** Use expo-camera's CameraView with barcode scanning, AsyncStorage for non-sensitive session data only, implement server-side QR validation with TTL and single-use patterns, and create custom Convex wrappers for role-based permission checks.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-camera | Latest (Expo SDK 54) | QR code scanning via CameraView | Official Expo solution with barcode scanning built-in, supports iOS/Android/Web |
| @react-native-async-storage/async-storage | 2.2.0 | Session persistence | Standard for key-value storage in React Native, cross-platform |
| react-native-qrcode-svg | 6.3.21 | QR code generation | Most popular QR generation library (already installed), requires react-native-svg |
| Convex | 1.31.6 | Backend mutations/queries | Already established in Phase 1, real-time database with TypeScript |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| libphonenumber-js | Latest | Phone number validation | If implementing strict international phone validation (optional for Phase 2) |
| expo-secure-store | Latest (Expo SDK 54) | Encrypted storage | For sensitive tokens (NOT needed for this phase - no JWT tokens) |
| react-native-toast-message | Latest | User feedback | For showing scan success/error messages (alternative to custom toast) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-camera | react-native-vision-camera | More features and active community, but adds complexity and breaks Expo managed workflow |
| AsyncStorage | expo-secure-store | Encrypted storage, but unnecessary for non-sensitive session IDs and role strings |
| Server-side validation | Client-side only | Would be insecure - QR codes must validate against database |

**Installation:**
```bash
# expo-camera not yet installed
npx expo install expo-camera

# Already installed in package.json
# @react-native-async-storage/async-storage@2.2.0
# react-native-qrcode-svg@6.3.21
# convex@1.31.6
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (auth)/              # Authentication flow routes
│   ├── role-select.tsx  # Role selection screen
│   ├── scan-qr.tsx      # Volunteer QR scanner
│   └── phone-entry.tsx  # Service user phone input
├── (volunteer)/         # Volunteer-only routes
└── (admin)/             # Admin-only routes

components/
├── auth/
│   ├── QRScanner.tsx    # Camera view wrapper
│   └── SessionGuard.tsx # Route protection component

convex/
├── auth.ts              # Authentication mutations
├── roles.ts             # Role-based permission helpers
└── session-validation.ts # Session state checking

utils/
└── session-storage.ts   # AsyncStorage wrapper functions
```

### Pattern 1: Camera Permission Flow
**What:** Request camera permissions before showing scanner, handle denial gracefully
**When to use:** Before mounting CameraView component for QR scanning
**Example:**
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/camera/
import { CameraView, useCameraPermissions } from 'expo-camera';

function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Loading permissions
    return <View />;
  }

  if (!permission.granted) {
    // Permission not granted - show explanation
    return (
      <View>
        <Text>Camera required to scan QR codes</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Permission granted - show camera
  return (
    <CameraView
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={handleScan}
    />
  );
}
```

### Pattern 2: Server-Side QR Validation
**What:** Always validate QR codes on server, never trust client-side parsing
**When to use:** When volunteer scans QR code to join session
**Example:**
```typescript
// convex/auth.ts
export const validateVolunteerQR = mutation({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    // Look up volunteer record
    const volunteer = await ctx.db
      .query("volunteers")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .first();

    if (!volunteer) {
      throw new Error("Invalid QR code");
    }

    // Check session is still active
    const session = await ctx.db.get(volunteer.sessionId);
    if (!session || !session.isActive) {
      throw new Error("Session has ended");
    }

    return {
      volunteerId: volunteer._id,
      sessionId: volunteer.sessionId,
      location: session.location
    };
  },
});
```

### Pattern 3: Role-Based Permission Wrapper
**What:** Create custom mutation/query wrappers that enforce role requirements
**When to use:** For any Convex function that requires specific role access
**Example:**
```typescript
// Source: https://stack.convex.dev/authorization
// convex/roles.ts
import { customMutation, customQuery } from "convex-helpers/server/customFunctions";

// Helper to get current user role from AsyncStorage session
const getUserRole = async (ctx: any) => {
  // In practice, role comes from authenticated session
  const userId = ctx.auth?.userId;
  if (!userId) return null;

  const user = await ctx.db.get(userId);
  return user?.role;
};

// Create role-aware wrappers
export const volunteerMutation = customMutation(
  mutation,
  {
    args: {},
    input: async (ctx, args) => {
      const role = await getUserRole(ctx);
      if (role !== "volunteer" && role !== "service_provider") {
        throw new Error("Volunteer access required");
      }
      return { ctx: { ...ctx, role } };
    },
  }
);

export const adminMutation = customMutation(
  mutation,
  {
    args: {},
    input: async (ctx, args) => {
      const role = await getUserRole(ctx);
      if (role !== "service_provider") {
        throw new Error("Admin access required");
      }
      return { ctx: { ...ctx, role } };
    },
  }
);
```

### Pattern 4: Session State Persistence
**What:** Store session context in AsyncStorage, validate on app startup
**When to use:** After successful authentication, on app reopen
**Example:**
```typescript
// utils/session-storage.ts
// Source: https://docs.expo.dev/versions/latest/sdk/async-storage/
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionData {
  sessionId: string;
  role: 'service_provider' | 'volunteer' | 'service_user';
  userId?: string;
  volunteerId?: string;
  location: string;
}

export const saveSession = async (data: SessionData) => {
  try {
    await AsyncStorage.setItem('session', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

export const loadSession = async (): Promise<SessionData | null> => {
  try {
    const value = await AsyncStorage.getItem('session');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem('session');
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

// Validate session is still active
export const validateSession = async (
  sessionId: string,
  checkActive: (sessionId: string) => Promise<boolean>
) => {
  const isActive = await checkActive(sessionId);
  if (!isActive) {
    await clearSession();
    return false;
  }
  return true;
};
```

### Pattern 5: Real-time Session End Detection
**What:** Subscribe to session state changes, auto-logout when admin ends session
**When to use:** While volunteer or service user is in active session
**Example:**
```typescript
// components/auth/SessionGuard.tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export function SessionGuard({ sessionId, children }: { sessionId: string, children: React.ReactNode }) {
  const router = useRouter();
  const session = useQuery(api.sessions.getSessionById, { sessionId });

  useEffect(() => {
    if (session && !session.isActive) {
      // Session ended - logout user
      clearSession();
      alert('Session ended by admin');
      router.replace('/role-select');
    }
  }, [session?.isActive]);

  return <>{children}</>;
}
```

### Pattern 6: Camera Cleanup on Unmount
**What:** Properly unmount CameraView to prevent memory leaks
**When to use:** When navigating away from QR scanner screen
**Example:**
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/camera/
// components/auth/QRScanner.tsx
import { useEffect, useRef } from 'react';
import { CameraView } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';

function QRScanner() {
  const isFocused = useIsFocused();
  const hasScanned = useRef(false);

  useEffect(() => {
    // Reset scan state when screen comes back into focus
    if (isFocused) {
      hasScanned.current = false;
    }
  }, [isFocused]);

  if (!isFocused) {
    // Don't render camera when screen not focused
    return null;
  }

  const handleScan = (result: BarcodeScanningResult) => {
    if (hasScanned.current) return; // Prevent duplicate scans
    hasScanned.current = true;
    // Process QR code
  };

  return (
    <CameraView
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={handleScan}
    />
  );
}
```

### Anti-Patterns to Avoid
- **Client-side QR validation:** Never parse QR code content on client without server verification - allows spoofed codes
- **AsyncStorage for sensitive data:** Don't store passwords, tokens, or PII in AsyncStorage (unencrypted) - use expo-secure-store for sensitive data
- **Multiple camera instances:** Don't mount multiple CameraView components simultaneously - causes conflicts and crashes
- **Missing permission denial handling:** Don't assume camera permission will be granted - always handle denial with instructions to Settings
- **Forgetting camera cleanup:** Don't keep CameraView mounted when navigating away - causes memory leaks and battery drain

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phone number formatting | Custom regex for each country | libphonenumber-js | Handles 200+ countries with region-specific rules, length validation, and formats |
| QR code generation | Canvas API with error correction | react-native-qrcode-svg | Already installed, handles error correction levels, logo embedding, and SVG output |
| Camera barcode parsing | Custom image processing | expo-camera CameraView | Native barcode detection (Vision API on iOS, ML Kit on Android), supports 13 barcode types |
| Session storage wrapper | Direct AsyncStorage calls everywhere | Centralized storage utilities | Type safety, error handling, and single place to change storage mechanism |
| Permission request flow | Manual permission checks | useCameraPermissions hook | Handles permission states, requests, and platform differences automatically |
| Role-based wrappers | if/else checks in every function | Custom mutation/query builders | Type-safe, composable, single source of truth for permission logic |

**Key insight:** Authentication and authorization are security-critical domains where bugs lead to data breaches. Use established patterns and libraries rather than custom solutions.

## Common Pitfalls

### Pitfall 1: Camera Permission Denial Loop
**What goes wrong:** On iOS/Android, once camera permission is denied, app cannot re-prompt user. Users see black screen, think app is broken.
**Why it happens:** Operating systems prevent apps from repeatedly requesting denied permissions to reduce permission spam.
**How to avoid:**
- Check permission status before mounting CameraView
- When denied, show explanation screen with button to open Settings
- Use `Linking.openSettings()` to deep-link to app settings
- Never mount CameraView when permission is denied
**Warning signs:** Black camera screen, no error message, user confusion

### Pitfall 2: QR Code Replay Attacks
**What goes wrong:** Attacker photographs volunteer QR code, uses screenshot to impersonate volunteer across multiple sessions.
**Why it happens:** QR codes are long-lived UUIDs without expiration or single-use enforcement.
**How to avoid:**
- Store "last scanned session" with each volunteer record
- Implement QR code rotation (regenerate codes between sessions)
- Add timestamp validation if QR encodes session context
- Consider single-use tokens for high-security needs
**Warning signs:** Same volunteer appearing in multiple concurrent sessions, volunteers reporting unauthorized usage

### Pitfall 3: AsyncStorage Synchronous Assumption
**What goes wrong:** Code assumes AsyncStorage operations complete instantly, leading to race conditions and stale session data.
**Why it happens:** AsyncStorage is asynchronous but developers treat it like synchronous localStorage from web.
**How to avoid:**
- Always await AsyncStorage calls
- Use loading states while fetching session
- Don't access session immediately after save - await first
- Consider Zustand with async storage middleware for state sync
**Warning signs:** Intermittent session loss, "not logged in" errors after successful auth, session data not persisting

### Pitfall 4: Session Validation Only on Startup
**What goes wrong:** User stays logged in to ended session because app only validates on launch, not continuously.
**Why it happens:** Developers check session validity once on app open but don't subscribe to session changes.
**How to avoid:**
- Use Convex `useQuery` to subscribe to session document
- Implement SessionGuard component that wraps authenticated routes
- Watch `session.isActive` field and logout when false
- Clear AsyncStorage session when Convex session ends
**Warning signs:** Volunteers still accessing dashboards after admin ends session, stale data displayed

### Pitfall 5: Camera Memory Leaks
**What goes wrong:** App memory usage grows over time, eventually crashes, especially when navigating between screens with camera.
**Why it happens:** CameraView holds native references that JavaScript GC cannot clean up automatically. Camera stays active even when component unmounted.
**How to avoid:**
- Only render CameraView when screen is focused (`useIsFocused()`)
- Return null when not focused instead of hiding with `display: none`
- Remove event listeners in useEffect cleanup
- Test memory usage with React DevTools Profiler
**Warning signs:** App feels sluggish after multiple scans, crashes after 10+ camera opens, hot device

### Pitfall 6: Duplicate Phone Number Detection
**What goes wrong:** Service user joins queue multiple times with same phone in same session, creating duplicate entries.
**Why it happens:** No client-side or server-side validation before adding user to queue.
**How to avoid:**
- Check for existing phone in session before creating queue entry
- Use Convex index: `.withIndex("by_session_phone", ["sessionId", "phone"])`
- Return clear error: "This phone number is already in queue"
- Consider "returning user" flow instead of error
**Warning signs:** Queue has duplicate names, users confused why they're in queue twice

### Pitfall 7: Missing QR Scanner Instructions
**What goes wrong:** Users don't understand what to scan or how to position QR code, leading to failed scans.
**Why it happens:** CameraView shows raw camera feed without context or guidance.
**How to avoid:**
- Add overlay text: "Point camera at volunteer QR code"
- Draw scanning frame/box over camera view
- Provide scanning tips below camera
- Auto-scan on detection (no manual button needed)
**Warning signs:** Support requests about "scanner not working", volunteers holding phone incorrectly

### Pitfall 8: Ended Session QR Scans
**What goes wrong:** Volunteer scans QR code from previous session, gets cryptic error or joins inactive session.
**Why it happens:** QR codes persist after session ends, validation doesn't check session state.
**How to avoid:**
- In `validateVolunteerQR`, check `session.isActive`
- Return specific error: "This session has ended"
- Don't allow joining inactive sessions
- Provide clear next steps: "Contact admin to start new session"
**Warning signs:** Confused volunteers, "session ended" errors without context

## Code Examples

Verified patterns from official sources:

### QR Code Scanning with Auto-Scan
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/camera/
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export function VolunteerQRScanner({ onScanComplete }: { onScanComplete: (qrCode: string) => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  if (!permission) {
    return <View><Text>Loading camera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera required to scan QR codes</Text>
        <Text>Go to Settings > Queuert > Allow Camera</Text>
        <Button title="Open Settings" onPress={() => Linking.openSettings()} />
      </View>
    );
  }

  const handleBarcodeScan = ({ data }: { data: string }) => {
    if (hasScanned) return; // Prevent duplicate scans
    setHasScanned(true);
    onScanComplete(data);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarcodeScan}
      />
      <View style={styles.overlay}>
        <Text style={styles.instructionText}>
          Point camera at volunteer QR code
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
});
```

### AsyncStorage Session Management
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/async-storage/
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SessionData {
  sessionId: string;
  role: 'service_provider' | 'volunteer' | 'service_user';
  userId?: string;
  volunteerId?: string;
  location: string;
  timestamp: number;
}

const SESSION_KEY = '@queuert_session';

export const SessionStorage = {
  async save(data: SessionData): Promise<void> {
    try {
      const sessionData = {
        ...data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Could not save session');
    }
  },

  async load(): Promise<SessionData | null> {
    try {
      const value = await AsyncStorage.getItem(SESSION_KEY);
      if (!value) return null;

      const data = JSON.parse(value) as SessionData;

      // Check if session is stale (older than 24 hours)
      const age = Date.now() - data.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        await this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },
};
```

### Server-Side QR Validation with Session Check
```typescript
// convex/auth.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const validateAndJoinSession = mutation({
  args: {
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up volunteer by QR code
    const volunteer = await ctx.db
      .query("volunteers")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .first();

    if (!volunteer) {
      throw new Error("Invalid QR code");
    }

    // Verify session is active
    const session = await ctx.db.get(volunteer.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.isActive) {
      throw new Error("This session has ended. Please contact admin to start a new session.");
    }

    // Return session context for client to cache
    return {
      volunteerId: volunteer._id,
      sessionId: session._id,
      location: session.location,
      role: "volunteer" as const,
    };
  },
});

export const checkPhoneDuplicate = mutation({
  args: {
    sessionId: v.id("sessions"),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if phone already in queue for this session
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (!existingUser) {
      return { isDuplicate: false };
    }

    // Check if user already in queue for this specific session
    const queueEntry = await ctx.db
      .query("queue")
      .withIndex("by_session_status", (q) =>
        q.eq("sessionId", args.sessionId).eq("status", "waiting")
      )
      .filter((q) => q.eq(q.field("serviceUserId"), existingUser._id))
      .first();

    if (queueEntry) {
      return {
        isDuplicate: true,
        message: "This phone number is already in the queue for this session",
      };
    }

    // User exists but not in this session - returning user
    return {
      isDuplicate: false,
      isReturningUser: true,
      userId: existingUser._id,
    };
  },
});
```

### QR Code Generation for Volunteers
```typescript
// Source: Already installed in package.json
import QRCode from 'react-native-qrcode-svg';
import { View, Text } from 'react-native';

export function VolunteerQRDisplay({
  qrCode,
  volunteerNumber
}: {
  qrCode: string;
  volunteerNumber: number;
}) {
  return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Volunteer {volunteerNumber}
      </Text>
      <QRCode
        value={qrCode}
        size={200}
        backgroundColor="white"
        color="black"
      />
      <Text style={{ fontSize: 12, marginTop: 10, color: '#666' }}>
        {qrCode.substring(0, 8)}...
      </Text>
    </View>
  );
}
```

### Real-time Session Validation Hook
```typescript
// hooks/useSessionValidation.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SessionStorage } from '@/utils/session-storage';

export function useSessionValidation() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Load session from AsyncStorage on mount
  useEffect(() => {
    SessionStorage.load().then(setSessionData);
  }, []);

  // Subscribe to session state from Convex
  const session = useQuery(
    api.sessions.getSessionById,
    sessionData?.sessionId ? { sessionId: sessionData.sessionId } : "skip"
  );

  // Auto-logout when session ends
  useEffect(() => {
    if (!session) return;

    if (!session.isActive) {
      // Session ended - clear local storage and redirect
      SessionStorage.clear();
      setSessionData(null);
      alert('Session ended by admin');
      router.replace('/role-select');
    }
  }, [session?.isActive]);

  return { sessionData, isSessionActive: session?.isActive ?? false };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-barcode-scanner | expo-camera CameraView | Expo SDK 51+ (2024) | CameraView combines camera + barcode scanning, simpler API, modern scanner UI |
| Raw AsyncStorage calls | AsyncStorage with TypeScript wrappers | 2025 standard | Type safety, centralized error handling, easier to migrate storage layer |
| Client-side role checks | Server-side role validation | Always (security best practice) | Prevents role spoofing, enforceable permissions, audit trail |
| Manual permission checks | useCameraPermissions hook | Expo SDK 48+ (2023) | Handles platform differences, provides loading states, cleaner code |
| JWT-based auth | Context-based session auth | N/A (project-specific) | Queuert uses simpler session validation without JWTs - appropriate for use case |

**Deprecated/outdated:**
- `expo-barcode-scanner`: Replaced by CameraView in expo-camera (SDK 51+), still works but not recommended for new projects
- `BarCodeScanner` component: Use `CameraView` with `barcodeScannerSettings` prop instead
- `Permissions.CAMERA`: Use `useCameraPermissions()` hook instead of legacy Permissions API
- Direct `expo-camera` Camera component: Use `CameraView` for modern API with better barcode support

## Open Questions

Things that couldn't be fully resolved:

1. **QR Code Format Specification**
   - What we know: QR contains Volunteer ID + Session ID (from context decisions)
   - What's unclear: Exact format - JSON string, delimited string, or composite UUID?
   - Recommendation: Use JSON for extensibility: `{"volunteerId": "...", "sessionId": "..."}`, validates easily with `JSON.parse()` + schema check

2. **Phone Number Validation Strictness**
   - What we know: International format with country codes (+1, +52, etc.)
   - What's unclear: Should we validate against libphonenumber-js rules or just accept any format with country code?
   - Recommendation: Start lenient (just require `+` prefix), add libphonenumber-js validation if data quality issues emerge (avoid over-engineering)

3. **Session Auto-Resume Edge Cases**
   - What we know: App should auto-resume session on reopen if session still active
   - What's unclear: What if Convex is unreachable? Show loading indefinitely or timeout?
   - Recommendation: 10-second timeout, fall back to offline mode or prompt manual refresh (network resilience pattern)

4. **Volunteer Multi-Session Behavior**
   - What we know: Volunteers can scan new QR to join different session, logs out of previous
   - What's unclear: Should app warn before switching sessions? Silent switch could lose unsaved volunteer state
   - Recommendation: Implement confirmation dialog: "Join [Location] session on [Date]?" with Cancel/Join buttons (from context decisions)

## Sources

### Primary (HIGH confidence)
- [Expo Camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/) - Official API docs for CameraView, barcode scanning, permissions
- [Expo AsyncStorage Documentation](https://docs.expo.dev/versions/latest/sdk/async-storage/) - Official storage API, platform compatibility
- [Convex Authentication Guide](https://docs.convex.dev/auth) - Official auth patterns, OpenID Connect integration
- [Convex Authorization Best Practices](https://stack.convex.dev/authorization) - Official guide on role-based access, custom wrappers
- [Convex Role-Based Permissions Example](https://github.com/get-convex/convex-auth-with-role-based-permissions) - Official GitHub example implementation

### Secondary (MEDIUM confidence)
- [Building QR Scanner with Expo](https://sasandasaumya.medium.com/building-a-qr-code-scanner-with-react-native-expo-df8e8f9e4c08) - Community tutorial verified against official docs
- [React Native Memory Leaks (2026)](https://medium.com/@silverskytechnology/the-react-native-memory-leak-you-dont-see-until-production-8d62a18d840a) - Recent article on camera cleanup patterns
- [Expo Permissions Best Practices](https://docs.expo.dev/guides/permissions/) - Official guide on permission handling
- [QR Code Security Best Practices (2026)](https://www.wwpass.com/blog/qr-code-authentication-how-it-works-benefits-and-best-practices/) - Enterprise QR auth patterns, TTL recommendations

### Tertiary (LOW confidence)
- [react-native-qrcode-svg npm](https://www.npmjs.com/package/react-native-qrcode-svg) - Package documentation (npm page blocked, info from search results only)
- [libphonenumber-js GitHub](https://github.com/catamphetamine/libphonenumber-js) - Phone validation library (not used in Phase 2 but relevant for future)
- Community articles on AsyncStorage security - General guidance, not library-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in official docs, expo-camera explicitly recommended over alternatives, already using Convex
- Architecture: HIGH - Patterns sourced from official Convex/Expo documentation and official GitHub examples
- Pitfalls: HIGH - Camera memory leaks, permission denial, session validation issues confirmed in multiple 2025-2026 sources
- QR security: MEDIUM - TTL/single-use patterns from enterprise sources but Queuert's threat model is lower (volunteer-only access)
- Phone validation: MEDIUM - Decision to use lenient validation (not strict libphonenumber-js) is context-specific tradeoff

**Research date:** 2026-01-26
**Valid until:** 60 days (2026-03-27) - Expo SDK and Convex are stable, barcode scanning API unlikely to change before Expo SDK 55
