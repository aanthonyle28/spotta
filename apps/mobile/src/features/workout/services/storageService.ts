import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  DEVELOPMENT_SESSION_COMPLETED: '@spotta/dev_session_completed',
} as const;

/**
 * Storage service for persisting app data across restarts
 * Follows the existing service pattern with async methods and error handling
 */
class StorageService {
  // Development state management
  async getDevelopmentSessionCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(
        STORAGE_KEYS.DEVELOPMENT_SESSION_COMPLETED
      );
      return value === 'true';
    } catch (error) {
      console.error(
        '[StorageService] Error reading development session completed:',
        error
      );
      return false; // Default to false on error
    }
  }

  async setDevelopmentSessionCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DEVELOPMENT_SESSION_COMPLETED,
        completed.toString()
      );
    } catch (error) {
      console.error(
        '[StorageService] Error saving development session completed:',
        error
      );
      throw error; // Re-throw to allow error handling in calling code
    }
  }

  async clearDevelopmentSessionCompleted(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.DEVELOPMENT_SESSION_COMPLETED);
    } catch (error) {
      console.error(
        '[StorageService] Error clearing development session completed:',
        error
      );
      throw error;
    }
  }

  // Utility methods
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('[StorageService] Error clearing all storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('[StorageService] Error getting all keys:', error);
      return [];
    }
  }
}

// Export singleton instance following the existing service pattern
export const storageService = new StorageService();
