import { renderHook, act } from '@testing-library/react-hooks';
import { useWorkoutState } from './useWorkoutState';
import { workoutService } from '../services/workoutService';
import type { ExerciseId } from '@spotta/shared';

// Mock the workout service
jest.mock('../services/workoutService', () => ({
  workoutService: {
    getActiveSession: jest.fn(),
    getRecentWorkouts: jest.fn(),
    startSession: jest.fn(),
    updateSet: jest.fn(),
    completeSet: jest.fn(),
    addSet: jest.fn(),
    finishSession: jest.fn(),
    discardSession: jest.fn(),
    getAllExercises: jest.fn(),
  },
}));

const mockWorkoutService = workoutService as jest.Mocked<typeof workoutService>;

const mockExercises = [
  {
    id: 'bench-press' as ExerciseId,
    name: 'Bench Press',
    category: 'strength' as const,
    equipment: ['barbell'],
    primaryMuscles: ['chest'],
    difficulty: 'intermediate' as const,
    isCustom: false,
  },
  {
    id: 'squat' as ExerciseId,
    name: 'Back Squat',
    category: 'strength' as const,
    equipment: ['barbell'],
    primaryMuscles: ['quadriceps'],
    difficulty: 'intermediate' as const,
    isCustom: false,
  },
];

const mockActiveSession = {
  id: 'session-123' as any,
  name: 'Test Workout',
  startedAt: new Date(),
  exercises: [],
  currentExerciseIndex: 0,
  totalVolume: 0,
  duration: 0,
};

const mockRecentWorkouts = [
  {
    id: 'workout-1' as any,
    name: 'Yesterday Workout',
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    currentExercise: undefined,
    totalSets: 10,
    completedSets: 10,
    isActive: false,
  },
];

describe('useWorkoutState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWorkoutService.getActiveSession.mockResolvedValue(null);
    mockWorkoutService.getRecentWorkouts.mockResolvedValue(mockRecentWorkouts);
    mockWorkoutService.getAllExercises.mockResolvedValue(mockExercises);
  });

  it('initializes with null active session', () => {
    const { result } = renderHook(() => useWorkoutState());

    expect(result.current.state.activeSession).toBeNull();
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('loads initial data on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWorkoutState());

    await waitForNextUpdate();

    expect(mockWorkoutService.getActiveSession).toHaveBeenCalled();
    expect(mockWorkoutService.getRecentWorkouts).toHaveBeenCalled();
    expect(result.current.state.recentWorkouts).toEqual(mockRecentWorkouts);
  });

  it('starts quick workout successfully', async () => {
    mockWorkoutService.startSession.mockResolvedValue(mockActiveSession);

    const { result } = renderHook(() => useWorkoutState());

    await act(async () => {
      const session = await result.current.actions.startQuickWorkout();
      expect(session).toEqual(mockActiveSession);
    });

    expect(mockWorkoutService.getAllExercises).toHaveBeenCalled();
    expect(mockWorkoutService.startSession).toHaveBeenCalledWith(
      [mockExercises[0].id, mockExercises[1].id],
      'Quick Workout'
    );
    expect(result.current.state.activeSession).toEqual(mockActiveSession);
  });

  it('handles quick workout start error', async () => {
    const error = new Error('Failed to start workout');
    mockWorkoutService.startSession.mockRejectedValue(error);

    const { result } = renderHook(() => useWorkoutState());

    await act(async () => {
      try {
        await result.current.actions.startQuickWorkout();
      } catch (e) {
        // Expected to throw
      }
    });

    expect(result.current.state.error).toBe('Failed to start workout');
    expect(result.current.state.isLoading).toBe(false);
  });

  it('starts session with custom exercises', async () => {
    mockWorkoutService.startSession.mockResolvedValue(mockActiveSession);

    const { result } = renderHook(() => useWorkoutState());

    await act(async () => {
      await result.current.actions.startSessionWithExercises(
        [mockExercises[0].id],
        'Custom Workout'
      );
    });

    expect(mockWorkoutService.startSession).toHaveBeenCalledWith(
      [mockExercises[0].id],
      'Custom Workout'
    );
  });

  it('updates set successfully', async () => {
    const updatedSet = { id: 'set-1', weight: 140, reps: 8, completed: false };
    mockWorkoutService.updateSet.mockResolvedValue(updatedSet as any);

    const { result } = renderHook(() => useWorkoutState());

    // Set initial active session
    act(() => {
      result.current.state.activeSession = {
        ...mockActiveSession,
        exercises: [
          {
            id: 'bench-press' as ExerciseId,
            exercise: mockExercises[0],
            sets: [
              {
                id: 'set-1',
                setNumber: 1,
                weight: 135,
                reps: 8,
                completed: false,
              } as any,
            ],
            orderIndex: 0,
            restPreset: 120,
          },
        ],
      };
    });

    await act(async () => {
      await result.current.actions.updateSet(
        'bench-press' as ExerciseId,
        'set-1' as any,
        { weight: 140 }
      );
    });

    expect(mockWorkoutService.updateSet).toHaveBeenCalledWith(
      mockActiveSession.id,
      'bench-press',
      'set-1',
      { weight: 140 }
    );
  });

  it('completes set and starts rest timer', async () => {
    const completedSet = { id: 'set-1', weight: 135, reps: 8, completed: true };
    const completeResult = { set: completedSet, restTime: 120 };
    mockWorkoutService.completeSet.mockResolvedValue(completeResult as any);

    const { result } = renderHook(() => useWorkoutState());

    // Set initial active session
    act(() => {
      result.current.state.activeSession = {
        ...mockActiveSession,
        exercises: [
          {
            id: 'bench-press' as ExerciseId,
            exercise: mockExercises[0],
            sets: [
              {
                id: 'set-1',
                setNumber: 1,
                weight: 135,
                reps: 8,
                completed: false,
              } as any,
            ],
            orderIndex: 0,
            restPreset: 120,
          },
        ],
      };
    });

    await act(async () => {
      await result.current.actions.completeSet(completedSet as any);
    });

    expect(result.current.state.restTimer.isActive).toBe(true);
    expect(result.current.state.restTimer.totalTime).toBe(120);
  });

  it('finishes session successfully', async () => {
    const completedWorkout = {
      id: mockActiveSession.id,
      name: mockActiveSession.name,
      startedAt: mockActiveSession.startedAt,
      totalSets: 3,
      completedSets: 3,
      isActive: false,
    };
    mockWorkoutService.finishSession.mockResolvedValue(completedWorkout);

    const { result } = renderHook(() => useWorkoutState());

    // Set initial active session
    act(() => {
      result.current.state.activeSession = mockActiveSession;
    });

    await act(async () => {
      const result_workout = await result.current.actions.finishSession();
      expect(result_workout).toEqual(completedWorkout);
    });

    expect(result.current.state.activeSession).toBeNull();
    expect(result.current.state.recentWorkouts[0]).toEqual(completedWorkout);
  });

  it('discards session successfully', async () => {
    mockWorkoutService.discardSession.mockResolvedValue();

    const { result } = renderHook(() => useWorkoutState());

    // Set initial active session
    act(() => {
      result.current.state.activeSession = mockActiveSession;
    });

    await act(async () => {
      await result.current.actions.discardSession();
    });

    expect(mockWorkoutService.discardSession).toHaveBeenCalledWith(
      mockActiveSession.id
    );
    expect(result.current.state.activeSession).toBeNull();
  });

  it('clears error', () => {
    const { result } = renderHook(() => useWorkoutState());

    // Set initial error
    act(() => {
      result.current.state.error = 'Test error';
    });

    act(() => {
      result.current.actions.clearError();
    });

    expect(result.current.state.error).toBeNull();
  });

  it('starts rest timer', () => {
    const { result } = renderHook(() => useWorkoutState());

    act(() => {
      result.current.actions.startRestTimer(120, 'bench-press' as ExerciseId);
    });

    expect(result.current.state.restTimer.isActive).toBe(true);
    expect(result.current.state.restTimer.totalTime).toBe(120);
    expect(result.current.state.restTimer.exerciseId).toBe('bench-press');
  });

  it('skips rest timer', () => {
    const { result } = renderHook(() => useWorkoutState());

    // Start rest timer first
    act(() => {
      result.current.actions.startRestTimer(120);
    });

    act(() => {
      result.current.actions.skipRest();
    });

    expect(result.current.state.restTimer.isActive).toBe(false);
  });

  it('adjusts rest timer', () => {
    const { result } = renderHook(() => useWorkoutState());

    // Start rest timer first
    act(() => {
      result.current.actions.startRestTimer(120);
    });

    act(() => {
      result.current.actions.adjustRestTimer(15);
    });

    expect(result.current.state.restTimer.remainingTime).toBe(135);
  });
});
