import type { Brand, UserId, WorkoutId } from './brand';

describe('Brand types', () => {
  describe('Brand utility type', () => {
    it('should create branded types that are distinct from base types', () => {
      // This test verifies TypeScript compilation behavior
      const userId: UserId = 'user-123' as UserId;
      const workoutId: WorkoutId = 'workout-456' as WorkoutId;
      
      expect(userId).toBe('user-123');
      expect(workoutId).toBe('workout-456');
      
      // These would fail TypeScript compilation if uncommented:
      // const invalidAssignment: UserId = workoutId; // Should be type error
      // const anotherInvalid: WorkoutId = userId; // Should be type error
    });
  });

  describe('ID type safety', () => {
    it('should maintain string operations while providing type safety', () => {
      const userId: UserId = 'user-123' as UserId;
      
      // String operations should still work
      expect(userId.length).toBe(8);
      expect(userId.startsWith('user-')).toBe(true);
      expect(userId.includes('123')).toBe(true);
    });

    it('should work with template literals', () => {
      const userId: UserId = 'user-123' as UserId;
      const message = `User ID is: ${userId}`;
      
      expect(message).toBe('User ID is: user-123');
    });
  });
});