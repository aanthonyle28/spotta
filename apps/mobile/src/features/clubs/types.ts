// Clubs feature types
import type { ClubId, UserId, MessageId } from '@spotta/shared';

export interface ClubMembership {
  clubId: ClubId;
  name: string;
  memberCount: number;
  lastActivity?: Date;
  unreadCount: number;
  isOwner: boolean;
}

export interface ClubMessage {
  id: MessageId;
  userId: UserId;
  username: string;
  content: string;
  type: 'text' | 'workout_share' | 'system';
  timestamp: Date;
  isOwn: boolean;
}

export interface ClubState {
  myClubs: ClubMembership[];
  activeClub: ClubId | null;
  messages: ClubMessage[];
  isLoading: boolean;
  error: string | null;
}