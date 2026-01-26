import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@queuert_session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionData {
  sessionId: string;
  role: 'service_provider' | 'volunteer' | 'service_user';
  userId?: string;       // Set for service users
  volunteerId?: string;  // Set for volunteers
  location: string;
  timestamp: number;     // When session was saved (for staleness check)
}

/**
 * Type-safe AsyncStorage wrapper for session data
 */
export const SessionStorage = {
  /**
   * Save session data with current timestamp
   */
  async save(data: SessionData): Promise<void> {
    try {
      const sessionData: SessionData = {
        ...data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  },

  /**
   * Load session data, returns null if not found or stale (>24h)
   */
  async load(): Promise<SessionData | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue === null) {
        return null;
      }

      const data: SessionData = JSON.parse(jsonValue);
      const now = Date.now();
      const isStale = now - data.timestamp > SESSION_EXPIRY_MS;

      if (isStale) {
        console.log('Session is stale (>24h), clearing...');
        await this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  },

  /**
   * Remove session from storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
      throw error;
    }
  },
};
