// Workout feature types
import type { WorkoutId, ExerciseId, SetEntryId, UserId } from '@spotta/shared';

export interface WorkoutSession {
  id: WorkoutId;
  name: string;
  startedAt: Date;
  currentExercise?: ExerciseId;
  totalSets: number;
  completedSets: number;
  isActive: boolean;
}

export interface SetEntryInput {
  exerciseId: ExerciseId;
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
  notes?: string;
}

export interface WorkoutState {
  currentSession: WorkoutSession | null;
  recentWorkouts: WorkoutSession[];
  isLoading: boolean;
  error: string | null;
}