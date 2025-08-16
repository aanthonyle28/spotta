// Domain types per CLAUDE.md vocabulary
import type {
  UserId,
  WorkoutId,
  ExerciseId,
  SetEntryId,
  ClubId,
  MessageId,
  TemplateId,
  ProgressPhotoId,
  MeasurementId,
  PactId,
  LadderId,
  PRPointId,
  EquipmentId,
  MuscleGroupId,
} from './brand';

export interface User {
  id: UserId;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends User {
  // Extended profile information
  bio?: string;
  timezone?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  restTimerSound: boolean;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  workoutReminders: boolean;
  clubUpdates: boolean;
  PRCelebrations: boolean;
}

export interface Workout {
  id: WorkoutId;
  userId: UserId;
  templateId?: TemplateId;
  name: string;
  notes?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number; // seconds
  sets: SetEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SetEntry {
  id: SetEntryId;
  workoutId: WorkoutId;
  exerciseId: ExerciseId;
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number; // seconds for time-based exercises
  distance?: number; // for cardio
  completed: boolean;
  restTime?: number; // seconds
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: ExerciseId;
  name: string;
  description?: string;
  instructions?: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroupId[];
  equipment?: EquipmentId[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCustom: boolean;
  userId?: UserId; // for custom exercises
  createdAt: string;
  updatedAt: string;
}

export type ExerciseCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'balance'
  | 'sports';

export interface Template {
  id: TemplateId;
  userId: UserId;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateExercise {
  exerciseId: ExerciseId;
  order: number;
  sets: number;
  reps?: number;
  weight?: number;
  restTime?: number;
}

export interface Club {
  id: ClubId;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  inviteCode?: string;
  memberCount: number;
  ownerId: UserId;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: MessageId;
  clubId: ClubId;
  userId: UserId;
  content: string;
  type: 'text' | 'workout_share' | 'system';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressPhoto {
  id: ProgressPhotoId;
  userId: UserId;
  url: string;
  caption?: string;
  bodyWeight?: number;
  visibility: 'private' | 'club' | 'public';
  createdAt: string;
}

export interface Measurement {
  id: MeasurementId;
  userId: UserId;
  type: MeasurementType;
  value: number;
  unit: string;
  bodyPart?: string;
  notes?: string;
  createdAt: string;
}

export type MeasurementType = 
  | 'weight'
  | 'body_fat'
  | 'muscle_mass'
  | 'circumference'
  | 'custom';

export interface Pact {
  id: PactId;
  clubId: ClubId;
  name: string;
  description: string;
  goal: PactGoal;
  startDate: string;
  endDate: string;
  participants: UserId[];
  rewards?: string;
  penalties?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PactGoal {
  type: 'workout_count' | 'streak_days' | 'custom';
  target: number;
  period: 'daily' | 'weekly' | 'monthly' | 'total';
}

export interface Ladder {
  id: LadderId;
  clubId: ClubId;
  name: string;
  description: string;
  metric: LadderMetric;
  startDate: string;
  endDate: string;
  participants: UserId[];
  createdAt: string;
  updatedAt: string;
}

export interface LadderMetric {
  type: 'total_weight' | 'workout_count' | 'pr_count' | 'streak_days';
  exerciseId?: ExerciseId; // for exercise-specific ladders
}

export interface PRPoint {
  id: PRPointId;
  userId: UserId;
  exerciseId: ExerciseId;
  type: 'weight' | 'reps' | 'time' | 'distance';
  value: number;
  previousValue?: number;
  workoutId: WorkoutId;
  celebratedAt?: string;
  createdAt: string;
}

export interface Equipment {
  id: EquipmentId;
  name: string;
  category: EquipmentCategory;
  description?: string;
}

export type EquipmentCategory = 
  | 'free_weights'
  | 'machines'
  | 'cardio'
  | 'bodyweight'
  | 'accessories';

export interface MuscleGroup {
  id: MuscleGroupId;
  name: string;
  category: 'primary' | 'secondary';
  parentGroup?: MuscleGroupId;
}