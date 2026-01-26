import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SessionStorage, SessionData } from '@/utils/session-storage';
import type { Id } from '@/convex/_generated/dataModel';

export interface UseSessionValidationResult {
  sessionData: SessionData | null;
  isLoading: boolean;
  isSessionActive: boolean;
  sessionEnded: boolean;  // True when session was active but now ended
  clearSession: () => Promise<void>;
}

/**
 * Hook that validates session state in real-time
 *
 * Responsibilities:
 * 1. Load session from AsyncStorage on mount
 * 2. Subscribe to session document in Convex (if sessionId exists)
 * 3. Auto-clear session when Convex session becomes inactive
 * 4. Provide session state to consumers
 */
export function useSessionValidation(): UseSessionValidationResult {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Track previous isActive value to detect transitions
  const previousIsActiveRef = useRef<boolean | null>(null);

  // Load session from AsyncStorage on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const data = await SessionStorage.load();
        setSessionData(data);
      } catch (error) {
        console.error('Error loading session:', error);
        setSessionData(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  // Subscribe to Convex session (skip if no sessionId)
  const convexSession = useQuery(
    api.sessions.getSessionById,
    sessionData?.sessionId ? { sessionId: sessionData.sessionId as Id<"sessions"> } : "skip"
  );

  // Determine if session is active
  const isSessionActive = convexSession?.isActive ?? false;

  // Detect session end (transition from active to inactive)
  useEffect(() => {
    if (convexSession === undefined) {
      // Query is loading, don't process yet
      return;
    }

    if (convexSession === null) {
      // Session not found in Convex
      if (sessionData) {
        // Had a local session but it's gone from backend
        setSessionEnded(true);
        SessionStorage.clear().catch(err =>
          console.error('Failed to clear session after deletion:', err)
        );
      }
      return;
    }

    const currentIsActive = convexSession.isActive;

    // Check if we transitioned from active to inactive
    if (previousIsActiveRef.current === true && currentIsActive === false) {
      console.log('Session ended by admin');
      setSessionEnded(true);
      SessionStorage.clear().catch(err =>
        console.error('Failed to clear session after end:', err)
      );
    }

    // Update the ref for next comparison
    previousIsActiveRef.current = currentIsActive;
  }, [convexSession, sessionData]);

  // Manual logout function
  const clearSession = async () => {
    await SessionStorage.clear();
    setSessionData(null);
    setSessionEnded(false);
    previousIsActiveRef.current = null;
  };

  return {
    sessionData,
    isLoading,
    isSessionActive,
    sessionEnded,
    clearSession,
  };
}
