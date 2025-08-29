import { workoutService } from './workoutService';
import type { ExerciseId } from '@spotta/shared';

describe('WorkoutService - Progression Logic', () => {
  describe('getProgressionSuggestion', () => {
    it('should suggest weight decrease when any set falls below rep range', async () => {
      // Bench press mock data has set 1: 135x8, set 2: 135x8, set 3: 135x6
      // Since set 3 has 6 reps (below minimum of 8), it should suggest decreasing weight
      const suggestion = await workoutService.getProgressionSuggestion(
        'bench-press' as ExerciseId,
        1
      );

      expect(suggestion).not.toBeNull();
      expect(suggestion?.reasoning).toBe('decrease_weight');
      expect(suggestion?.weight).toBe(132.5); // -2.5 lbs
      expect(suggestion?.reps).toBe(8); // Reset to bottom of range
    });

    it('should suggest adding reps when sets are in range but not at top', async () => {
      // Overhead press mock data has reps in range: 10, 9, 8 (all within 8-12 range, none at 12)
      const suggestion = await workoutService.getProgressionSuggestion(
        'overhead-press' as ExerciseId,
        1
      );

      expect(suggestion).not.toBeNull();
      expect(suggestion?.reasoning).toBe('add_reps');
      expect(suggestion?.weight).toBe(95); // Same weight
      expect(suggestion?.reps).toBe(11); // Add 1 rep (10 + 1)
    });

    it('should suggest weight increase for squat (all sets at 12 reps)', async () => {
      // Squat mock data has all sets at 185x12 (top of rep range)
      const suggestion = await workoutService.getProgressionSuggestion(
        'squat' as ExerciseId,
        1
      );

      expect(suggestion).not.toBeNull();
      expect(suggestion?.reasoning).toBe('increase_weight');
      expect(suggestion?.weight).toBe(187.5); // +2.5 lbs
      expect(suggestion?.reps).toBe(8); // Reset to bottom of range
    });

    it('should return null for exercise with no previous data', async () => {
      const suggestion = await workoutService.getProgressionSuggestion(
        'non-existent-exercise' as ExerciseId,
        1
      );

      expect(suggestion).toBeNull();
    });

    it('should suggest weight decrease when sets fall below rep range', async () => {
      // Deadlift mock data has all reps below range: 5, 5, 4 (all below minimum of 8)
      const suggestion = await workoutService.getProgressionSuggestion(
        'deadlift' as ExerciseId,
        3
      );

      // Deadlift set 3 has 4 reps (below minimum of 8)
      expect(suggestion).not.toBeNull();
      expect(suggestion?.reasoning).toBe('decrease_weight');
      expect(suggestion?.weight).toBe(222.5); // -2.5 lbs
      expect(suggestion?.reps).toBe(8); // Reset to bottom of range
    });
  });

  describe('getPreviousSetData', () => {
    it('should return previous set data for existing exercise and set', async () => {
      const prevData = await workoutService.getPreviousSetData(
        'bench-press' as ExerciseId,
        1
      );

      expect(prevData).not.toBeNull();
      expect(prevData?.weight).toBe(135);
      expect(prevData?.reps).toBe(8);
      expect(prevData?.setNumber).toBe(1);
    });

    it('should return null for non-existent exercise', async () => {
      const prevData = await workoutService.getPreviousSetData(
        'non-existent-exercise' as ExerciseId,
        1
      );

      expect(prevData).toBeNull();
    });

    it('should return null for non-existent set number', async () => {
      const prevData = await workoutService.getPreviousSetData(
        'bench-press' as ExerciseId,
        999
      );

      expect(prevData).toBeNull();
    });
  });
});
