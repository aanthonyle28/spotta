// Progress feature types
import type { ProgressPhotoId, MeasurementId, PRPointId, UserId, ExerciseId } from '@spotta/shared';

export interface ProgressEntry {
  id: ProgressPhotoId | MeasurementId;
  type: 'photo' | 'measurement';
  date: Date;
  value?: number;
  unit?: string;
  notes?: string;
}

export interface PersonalRecord {
  id: PRPointId;
  exerciseId: ExerciseId;
  exerciseName: string;
  type: 'weight' | 'reps' | 'time' | 'distance';
  value: number;
  previousValue?: number;
  achievedAt: Date;
  isRecent: boolean;
}

export interface ProgressState {
  recentEntries: ProgressEntry[];
  personalRecords: PersonalRecord[];
  isLoading: boolean;
  error: string | null;
}