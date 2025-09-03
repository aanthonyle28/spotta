/**
 * Test utilities for workout feature tests
 * Provides type-safe helpers for creating mock data with proper branded types
 */

import type {
  WorkoutId,
  ExerciseId,
  SetEntryId,
  TemplateId,
  UserId,
} from '@spotta/shared';
import type {
  ActiveSession,
  SessionExercise,
  SetData,
  Exercise,
  Template,
} from '../types';

/**
 * Branded type factories for tests
 */
export const createTestIds = {
  workoutId: (id: string): WorkoutId => id as WorkoutId,
  exerciseId: (id: string): ExerciseId => id as ExerciseId,
  setEntryId: (id: string): SetEntryId => id as SetEntryId,
  templateId: (id: string): TemplateId => id as TemplateId,
  userId: (id: string): UserId => id as UserId,
};

/**
 * Creates a test exercise with proper types
 */
export const createTestExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: createTestIds.exerciseId('test-exercise'),
  name: 'Test Exercise',
  category: 'strength',
  equipment: ['bodyweight'],
  primaryMuscles: ['chest'],
  difficulty: 'beginner',
  isCustom: false,
  userId: createTestIds.userId('test-user'),
  ...overrides,
});

/**
 * Creates a test set with proper types
 */
export const createTestSet = (overrides: Partial<SetData> = {}): SetData => ({
  id: createTestIds.setEntryId('test-set'),
  setNumber: 1,
  reps: 10,
  weight: 100,
  completed: false,
  ...overrides,
});

/**
 * Creates a test session exercise with proper types
 */
export const createTestSessionExercise = (
  overrides: Partial<SessionExercise> = {}
): SessionExercise => ({
  id: createTestIds.exerciseId('test-exercise'),
  exercise: createTestExercise({ id: createTestIds.exerciseId('test-exercise') }),
  sets: [createTestSet()],
  orderIndex: 0,
  restPreset: 120,
  ...overrides,
});

/**
 * Creates a test active session with proper types
 */
export const createTestActiveSession = (
  overrides: Partial<ActiveSession> = {}
): ActiveSession => ({
  id: createTestIds.workoutId('test-session'),
  name: 'Test Workout',
  startedAt: new Date(),
  exercises: [createTestSessionExercise()],
  totalVolume: 0,
  templateRestTime: 120,
  customizedExercises: new Set(),
  ...overrides,
});

/**
 * Creates a test template with proper types
 */
export const createTestTemplate = (overrides: Partial<Template> = {}): Template => ({
  id: createTestIds.templateId('test-template'),
  title: 'Test Template',
  exercises: [
    {
      exerciseId: createTestIds.exerciseId('test-exercise'),
      sets: 3,
      reps: 10,
      weight: 100,
      restTime: 120,
    },
  ],
  estimatedDuration: 45,
  difficulty: 'beginner',
  userId: createTestIds.userId('test-user'),
  ...overrides,
});