// Persistent development state management for session completion tracking
// This prevents mock sessions from being recreated after user completes them
// Uses AsyncStorage for persistence across app restarts

import { storageService } from '../services/storageService';
import { logger } from '../../../utils/logger';

class DevelopmentState {
  // Remove in-memory state - now using persistent storage

  public async markSessionCompleted(): Promise<void> {
    try {
      await storageService.setDevelopmentSessionCompleted(true);
      logger.debug(
        '[DevState] Session completion flag set persistently - no more mock sessions will be created'
      );
    } catch (error) {
      console.error('[DevState] Failed to mark session completed:', error);
      // Don't throw - allow app to continue even if storage fails
    }
  }

  public async hasUserCompletedSession(): Promise<boolean> {
    try {
      return await storageService.getDevelopmentSessionCompleted();
    } catch (error) {
      console.error(
        '[DevState] Failed to check session completion status:',
        error
      );
      return false; // Default to false to allow mock sessions on error
    }
  }

  public async reset(): Promise<void> {
    try {
      await storageService.clearDevelopmentSessionCompleted();
      logger.debug(
        '[DevState] Session completion flag reset - mock sessions will be created again'
      );
    } catch (error) {
      console.error(
        '[DevState] Failed to reset session completion flag:',
        error
      );
      // Don't throw - allow app to continue
    }
  }

  // Helper function to check development mode
  public static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}

// Export singleton instance
export const developmentState = new DevelopmentState();
