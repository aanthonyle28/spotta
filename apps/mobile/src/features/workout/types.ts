// Workout feature types
import type {
  WorkoutId,
  ExerciseId,
  SetEntryId,
  UserId,
  TemplateId,
} from '@spotta/shared';

// Core domain types for active session
export interface ActiveSession {
  id: WorkoutId;
  name: string;
  startedAt: Date;
  exercises: SessionExercise[];
  currentExerciseIndex: number;
  totalVolume: number;
  duration: number;
}

export interface SessionExercise {
  id: ExerciseId;
  exercise: Exercise;
  sets: SetData[];
  orderIndex: number;
  restPreset: number;
  notes?: string;
}

export interface SetData {
  id: SetEntryId;
  setNumber: number;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
  rpe?: number;
  notes?: string;
  completedAt?: Date;
}

export interface Exercise {
  id: ExerciseId;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  isCustom: boolean;
  userId?: UserId;
}

export interface Template {
  id: TemplateId;
  title: string;
  description?: string;
  exercises: TemplateExercise[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  userId: UserId;
  lastCompleted?: Date;
}

export interface TemplateExercise {
  exerciseId: ExerciseId;
  sets: number;
  reps?: number;
  weight?: number;
  restTime?: number;
}

// UI state types
export interface RestTimerState {
  isActive: boolean;
  remainingTime: number;
  totalTime: number;
  exerciseId: ExerciseId | null;
  startedAt: Date | null;
}

export interface WorkoutState {
  activeSession: ActiveSession | null;
  restTimer: RestTimerState;
  templates: Template[];
  recentWorkouts: WorkoutSession[];
  isLoading: boolean;
  error: string | null;
}

// Legacy interface (keeping for compatibility)
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
