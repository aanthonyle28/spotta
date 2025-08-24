/**
 * Logging utility that respects development/production environments
 * Following CLAUDE.md guidelines (G-4: no console.log in app code)
 */

interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

class AppLogger implements Logger {
  info(message: string, ...args: unknown[]): void {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new AppLogger();
