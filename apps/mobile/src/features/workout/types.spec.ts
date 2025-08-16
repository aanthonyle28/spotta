import type { WorkoutSession, SetEntryInput, WorkoutState } from './types';
import type { WorkoutId, ExerciseId, UserId } from '@spotta/shared';

describe('Workout types', () => {
  describe('WorkoutSession', () => {
    it('should represent an active workout session correctly', () => {
      const session: WorkoutSession = {
        id: 'workout-123' as WorkoutId,
        name: 'Push Day',
        startedAt: new Date('2024-01-01T10:00:00Z'),
        currentExercise: 'exercise-456' as ExerciseId,
        totalSets: 12,
        completedSets: 5,
        isActive: true,
      };

      expect(session.id).toBe('workout-123');
      expect(session.name).toBe('Push Day');
      expect(session.isActive).toBe(true);
      expect(session.completedSets).toBeLessThan(session.totalSets);
    });

    it('should handle completed workout sessions', () => {
      const completedSession: WorkoutSession = {
        id: 'workout-789' as WorkoutId,
        name: 'Pull Day',
        startedAt: new Date('2024-01-01T08:00:00Z'),
        totalSets: 10,
        completedSets: 10,
        isActive: false,
      };

      expect(completedSession.isActive).toBe(false);
      expect(completedSession.completedSets).toBe(completedSession.totalSets);
      expect(completedSession.currentExercise).toBeUndefined();
    });
  });

  describe('SetEntryInput', () => {
    it('should validate strength training set input', () => {
      const strengthSet: SetEntryInput = {
        exerciseId: 'bench-press' as ExerciseId,
        setNumber: 1,
        reps: 10,
        weight: 135,
        restTime: 120,
        notes: 'Felt strong today',
      };

      expect(strengthSet.reps).toBeGreaterThan(0);
      expect(strengthSet.weight).toBeGreaterThan(0);
      expect(strengthSet.duration).toBeUndefined();
      expect(strengthSet.distance).toBeUndefined();
    });

    it('should validate cardio set input', () => {
      const cardioSet: SetEntryInput = {
        exerciseId: 'treadmill-run' as ExerciseId,
        setNumber: 1,
        duration: 1800, // 30 minutes in seconds
        distance: 5.0, // 5 miles
      };

      expect(cardioSet.duration).toBeGreaterThan(0);
      expect(cardioSet.distance).toBeGreaterThan(0);
      expect(cardioSet.reps).toBeUndefined();
      expect(cardioSet.weight).toBeUndefined();
    });
  });

  describe('WorkoutState', () => {
    it('should represent initial empty state', () => {
      const initialState: WorkoutState = {
        currentSession: null,
        recentWorkouts: [],
        isLoading: false,
        error: null,
      };

      expect(initialState.currentSession).toBeNull();
      expect(initialState.recentWorkouts).toHaveLength(0);
      expect(initialState.isLoading).toBe(false);
      expect(initialState.error).toBeNull();
    });

    it('should represent loading state', () => {
      const loadingState: WorkoutState = {
        currentSession: null,
        recentWorkouts: [],
        isLoading: true,
        error: null,
      };

      expect(loadingState.isLoading).toBe(true);
    });

    it('should represent error state', () => {
      const errorState: WorkoutState = {
        currentSession: null,
        recentWorkouts: [],
        isLoading: false,
        error: 'Failed to load workouts',
      };

      expect(errorState.error).toBe('Failed to load workouts');
      expect(errorState.isLoading).toBe(false);
    });
  });
});
