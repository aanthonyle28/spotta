import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutState } from './useWorkoutState';
import { workoutService } from '../services/workoutService';
import type { ExerciseId } from '@spotta/shared';
import { testIds, createMockWorkoutId } from '../services/testUtils';

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
    id: testIds.benchPress,
    name: 'Bench Press',
    category: 'strength' as const,
    equipment: ['barbell'],
    primaryMuscles: ['chest'],
    difficulty: 'intermediate' as const,
    isCustom: false,
  },
  {
    id: testIds.squat,
    name: 'Back Squat',
    category: 'strength' as const,
    equipment: ['barbell'],
    primaryMuscles: ['quadriceps'],
    difficulty: 'intermediate' as const,
    isCustom: false,
  },
];

const mockActiveSession = {
  id: createMockWorkoutId('session-123'),
  name: 'Test Workout',
  startedAt: new Date(),
  exercises: [],
  currentExerciseIndex: 0,
  totalVolume: 0,
  duration: 0,
  templateRestTime: 90,
  customizedExercises: new Set<ExerciseId>(),
};

const mockRecentWorkouts = [
  {
    id: testIds.testWorkout,
    name: 'Yesterday Workout',
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    currentExercise: undefined,
    totalSets: 10,
    completedSets: 10,
    isActive: false,
  },
];

describe.skip('useWorkoutState', () => {
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
    const { result } = renderHook(() => useWorkoutState());

    // Wait for the async effect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

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
      } catch {
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
    const updatedSet = {
      id: testIds.set1,
      weight: 140,
      reps: 8,
      completed: false,
    };
    mockWorkoutService.updateSet.mockResolvedValue(updatedSet);

    const { result } = renderHook(() => useWorkoutState());

    // Set initial active session
    act(() => {
      result.current.state.activeSession = {
        ...mockActiveSession,
        exercises: [
          {
            id: testIds.benchPress,
            exercise: mockExercises[0],
            sets: [
              {
                id: testIds.set1,
                setNumber: 1,
                weight: 135,
                reps: 8,
                completed: false,
              },
            ],
            orderIndex: 0,
            restPreset: 120,
          },
        ],
      };
    });

    await act(async () => {
      await result.current.actions.updateSet(testIds.benchPress, testIds.set1, {
        weight: 140,
      });
    });

    expect(mockWorkoutService.updateSet).toHaveBeenCalledWith(
      'bench-press',
      'set-1',
      { weight: 140 }
    );
  });

  it('completes set and starts rest timer', async () => {
    const completedSet = {
      id: testIds.set1,
      weight: 135,
      reps: 8,
      completed: true,
    };
    const completeResult = { set: completedSet, restTime: 120 };
    mockWorkoutService.completeSet.mockResolvedValue(completeResult);

    const { result } = renderHook(() => useWorkoutState());

    // Set initial active session
    act(() => {
      result.current.state.activeSession = {
        ...mockActiveSession,
        exercises: [
          {
            id: testIds.benchPress,
            exercise: mockExercises[0],
            sets: [
              {
                id: testIds.set1,
                setNumber: 1,
                weight: 135,
                reps: 8,
                completed: false,
              },
            ],
            orderIndex: 0,
            restPreset: 120,
          },
        ],
      };
    });

    await act(async () => {
      await result.current.actions.completeSet(completedSet);
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
      result.current.actions.startRestTimer(120, testIds.benchPress);
    });

    expect(result.current.state.restTimer.isActive).toBe(true);
    expect(result.current.state.restTimer.totalTime).toBe(120);
    expect(result.current.state.restTimer.exerciseId).toBe(testIds.benchPress);
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

  it('updates all exercise rest presets from template (overrides customizations)', () => {
    const { result } = renderHook(() => useWorkoutState());

    // Set initial active session with exercises, some customized
    act(() => {
      result.current.state.activeSession = {
        ...mockActiveSession,
        exercises: [
          {
            id: testIds.benchPress,
            exercise: mockExercises[0],
            sets: [],
            orderIndex: 0,
            restPreset: 120, // Customized
          },
          {
            id: testIds.squat,
            exercise: mockExercises[1],
            sets: [],
            orderIndex: 1,
            restPreset: 90, // Template default
          },
        ],
        // Mark first exercise as customized
        customizedExercises: new Set([testIds.benchPress]),
      };
    });

    // Update all exercises from template
    act(() => {
      result.current.actions.updateAllExerciseRestPresetsFromTemplate(150);
    });

    // Verify ALL exercises updated regardless of customization
    expect(result.current.state.activeSession?.exercises[0].restPreset).toBe(
      150
    );
    expect(result.current.state.activeSession?.exercises[1].restPreset).toBe(
      150
    );

    // Verify customization flags cleared
    expect(result.current.state.activeSession?.customizedExercises.size).toBe(
      0
    );
    expect(
      result.current.state.activeSession?.customizedExercises.has(
        testIds.benchPress
      )
    ).toBe(false);
  });

  it('updates all exercise rest presets (respects customizations)', () => {
    const { result } = renderHook(() => useWorkoutState());

    // Set initial active session with exercises, some customized
    act(() => {
      result.current.state.activeSession = {
        ...mockActiveSession,
        exercises: [
          {
            id: testIds.benchPress,
            exercise: mockExercises[0],
            sets: [],
            orderIndex: 0,
            restPreset: 120, // Customized
          },
          {
            id: testIds.squat,
            exercise: mockExercises[1],
            sets: [],
            orderIndex: 1,
            restPreset: 90, // Template default
          },
        ],
        // Mark first exercise as customized
        customizedExercises: new Set([testIds.benchPress]),
      };
    });

    // Update all exercises (respecting customizations)
    act(() => {
      result.current.actions.updateAllExerciseRestPresets(150);
    });

    // Verify customized exercise unchanged, non-customized exercise updated
    expect(result.current.state.activeSession?.exercises[0].restPreset).toBe(
      120
    ); // Unchanged (customized)
    expect(result.current.state.activeSession?.exercises[1].restPreset).toBe(
      150
    ); // Updated (not customized)

    // Verify customization flags preserved
    expect(result.current.state.activeSession?.customizedExercises.size).toBe(
      1
    );
    expect(
      result.current.state.activeSession?.customizedExercises.has(
        testIds.benchPress
      )
    ).toBe(true);
  });
});
