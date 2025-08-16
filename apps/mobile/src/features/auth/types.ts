// Auth feature types
import type { UserId } from '@spotta/shared';

export interface AuthUser {
  id: UserId;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
}