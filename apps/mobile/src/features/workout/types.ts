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
  templateId?: TemplateId; // Track which template was used to create this session
  templateRestTime: number; // Template-level rest timer setting (separate from individual exercise timers)
  customizedExercises: Set<ExerciseId>; // Track which exercises have custom rest times vs inherited template times
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
  // Extended properties for template exercises
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';
  primaryMuscles: string[];
}

// Community template extends base template with social features
export interface CommunityTemplate extends Template {
  author: string;
  authorId: UserId;
  saves: number;
  likes: number;
  uses: number;
  tags?: string[];
  createdAt: Date;
  isOfficial?: boolean;
}

// UI state types
export interface RestTimerState {
  isActive: boolean;
  remainingTime: number;
  totalTime: number;
  exerciseId: ExerciseId | null;
  startedAt: Date | null;
  showAsModal: boolean;
}

export interface WorkoutSettings {
  restTimerEnabled: boolean;
  defaultRestTime: number;
  showRestAsModal: boolean;
}

export interface WorkoutState {
  activeSession: ActiveSession | null;
  restTimer: RestTimerState;
  settings: WorkoutSettings;
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

// Previous exercise data for progression tracking
export interface PreviousSetData {
  setNumber: number;
  weight?: number;
  reps?: number;
  workoutId: WorkoutId;
  completedAt: Date;
}

export interface ProgressionSuggestion {
  weight?: number;
  reps?: number;
  reasoning: 'increase_weight' | 'add_reps' | 'decrease_weight' | 'maintain';
}

// Finish modal types
export interface FinishWorkoutModalProps {
  isOpen: boolean;
  session: ActiveSession;
  onClose: () => void;
  onComplete: (data: FinishWorkoutData) => Promise<void>;
}

export interface FinishWorkoutData {
  image?: string;
  description?: string;
  clubId?: string;
  updateTemplate: boolean;
  saveAsTemplate?: boolean;
  templateName?: string;
}

export interface WorkoutSummary {
  duration: string;
  volume: number;
  exerciseCount: number;
  formattedDate: string;
  completedSets: number;
  exercises: string[];
}
